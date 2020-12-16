import { EventEmitter } from 'events';
import { IDispatcher } from './../../idispatcher';
import { IProgressEventHandler, IService } from './../../services/iservice';
import { IEventHandler } from './../../services/IService';
import * as data from "./mockCommands.json";

/**
 * This MockDispatcher is used for tests purpose to mock (simulate) a dispatcher
 */
export class MockDispatcher extends EventEmitter implements IDispatcher {
    private config: { [index: string]: string };

    public constructor() {
        super();
        this.config = data;
    }

    log(data: string) { };
    debug(data: string) { };

    progressHandler(handler: IProgressEventHandler): void {
        throw new Error('Method not implemented.');
    }

    connect(callback: (dispatcher: IDispatcher) => void) {
        throw new Error('Method not implemented.');
     };

    /**
     *
     * Return a promise that resolve a typical string for an eventName referenced in the mockCommands.json
     *
     * @param serviceName
     * @param eventName Used to search in the json the typical string that we can receive from the event response
     * @param args
     */ 
    sendEvent(serviceName: string, eventName: string, args: any[]) {
        // throw new Error('Method not implemented.');
    };

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

    /**
     * Simulate that an event arrived asynchronously and to test our event handler work fine
     * @param eventName 
     * @param data json data from the event
     * @param handler our service that implements IEventHandler
     */
    public mockDecodeEvent(eventName: string, handler: IEventHandler) {
        let event = {
            command: eventName,
            args: this.config[eventName]
        };
        handler.eventHandler(event);
    }
}