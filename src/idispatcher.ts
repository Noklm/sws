'use strict';

import { EventEmitter } from 'events';
import { IProgressEventHandler } from './services/IService';

export interface IDispatcher extends EventEmitter{
	sendCommand(serviceName: string, commandName: string, args: any[]): Promise<string>;
	sendEvent(serviceName: string, eventName: string, args: any[]): void;
	progressHandler(handler: IProgressEventHandler): void

	log(data: string): void;
}