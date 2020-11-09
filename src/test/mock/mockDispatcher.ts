import { IDispatcher } from './../../idispatcher';
// import { LocatorService, ToolService } from './../services/services';
import { IEventHandler } from './../../services/IService';
import * as data from "./mockCommands.json";

export class MockDispatcher implements IDispatcher {
    private config: { [index: string]: string };
    // private nil: string = '\x00';
    // private eom: string = '\x03\x01';

    public constructor() {
        this.config = data;
    }

    connect(callback: (dispatcher: IDispatcher) => void) { };

    eventHandler(service: string, handler: IEventHandler) { };
    sendEvent(serviceName: string, eventName: string, args: any[]) { };

    public sendCommand(serviceName: string, commandName: string, args: any[]): Promise<string> {
        let self = this;
        return new Promise(function (resolve, reject) {
            resolve(self.config[commandName]);
        });
    }

    log(data: string) { };
    debug(data: string) { };
}