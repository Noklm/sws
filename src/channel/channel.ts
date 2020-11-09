'use strict';
import { IChannel } from './ichannel';
import { IService } from '../services/iservice';

/**
 * Class that describe the TCF Channel
 */
export class Channel implements IChannel {

    private localServices: Map<string, IService>;
    private remoteServices: string[];

    public constructor() {
        this.localServices = new Map<string, IService>();
        this.remoteServices = new Array<string>();
    }

    public setLocalService(service: IService) {
        this.localServices.set(service.getName(), service);
    }

    public getLocalServices() {
        return this.localServices.values();
    }

    public getLocalService(name: string) {
        if (this.localServices.has(name)) {
            return this.localServices.get(name) as IService;
        }
        throw new Error(`[Channel] Unknown ${name} service`);
    };

    public getRemoteServices() {
        return this.remoteServices;
    }

    public setRemoteServices(services: string[]) {
        this.remoteServices = services;
    }

}