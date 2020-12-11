'use strict';

import { IService, IProgressEventHandler } from './services/IService';

export interface IDispatcher {
	sendCommand(serviceName: string, commandName: string, args: any[]): Promise<string>;
	eventHandler(service: IService): void;
	sendEvent(serviceName: string, eventName: string, args: any[]): void;
	progressHandler(handler: IProgressEventHandler): void

	log(data: string): void;
}