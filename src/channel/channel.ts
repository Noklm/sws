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
    
    /**
     * Adds a local service to the TCF channel
     * 
     * @param service local service to add
     */
    public setLocalService(service: IService) {
        this.localServices.set(service.getName(), service);
    }

    /**
     * Returns all local services of the TCF channel
     */
    public getLocalServices() {
        let services: string[] = [];
        for (let service of this.localServices.values()) {
            services.push(service.getName());
        }
        return services;
    }

    /**
     * Returns one local service by his name, throws an error if the service is unknown
     * 
     * @param name name of the local service to return
     */
    public getLocalService(name: string) {
        if (this.localServices.has(name)) {
            return this.localServices.get(name) as IService;
        }
        throw new Error(`[Channel] Unknown ${name} service`);
    };

    /**
     * Returns all remotes services of the TCF channel
     */
    public getRemoteServices() {
        return this.remoteServices;
    }

    /**
     * Sets all available remote services of the TCF channel
     * 
     * @param services remote services
     */
    public setRemoteServices(services: string[]) {
        this.remoteServices = services;
    }

}