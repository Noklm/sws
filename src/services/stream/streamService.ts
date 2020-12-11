'use strict';

import { IDispatcher } from './../abstractService';
import { IEventHandler, IService, IEvent } from './../iservice';

// NOTE: Not really implemented to spec
export class StreamService implements IEventHandler, IService {

	private dispatcher: IDispatcher;
	private name: string;

	public constructor(dispatcher: IDispatcher) {
		this.name = 'Stream';
		this.dispatcher = dispatcher;
		this.dispatcher.on(this.name, this.eventHandler);
	}

	public getName() {
		return this.name;
	}

	public setLogBits(level: number): Promise<string> {
		// level is a bitmask
		return this.dispatcher.sendCommand(this.name, 'setLogBits', [level]);
	}

	public eventHandler = (event: IEvent): void => {
		switch (event) {
			default:
				this.dispatcher.log(`[Stream] No matching event handler: ${event.command}`);
		}
	};
}