import { IDispatcher } from './../../idispatcher';
// import { LocatorService, ToolService } from './../services/services';
import { IEventHandler } from './../../services/IService';
import * as data from "./mockCommands.json";

/**
 * This MockDispatcher is used for tests purpose to mock (simulate) a dispatcher
 * 
 */
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

    /**
     * 
     * Return a promise that resolve a typical string for a commandName referenced in the mockCommands.json
     * 
     * @param serviceName 
     * @param commandName Used to search in the json the typical string that we can receive from the command response
     * @param args 
     */
    public sendCommand(serviceName: string, commandName: string, args: any[]): Promise<string> {
        let self = this;
        return new Promise(function (resolve, reject) {
            resolve(self.config[commandName]);
        });
    }

    log(data: string) { };
    debug(data: string) { };
}