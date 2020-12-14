'use strict';

import { EventEmitter } from "events";

export interface IService extends IEventHandler, EventEmitter {
	getName(): string;
}

export interface IEventHandler {
	eventHandler(event:IEvent): void;
}

export interface IResponseHandler {
	responseHandler(response: string, eventData: string[]): boolean;
}

export interface IProgressEventHandler {
	progress(progress: number, max: number, text?: string): void;
}

export interface ICongestionHandler {
	congestion(level: number): void;
}

export interface IEventListener{
	handleEvent(event: IEvent): void;
}

export interface IEvent{
	command: string;
	args: any;
}
