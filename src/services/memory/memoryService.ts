'use strict';

import { IDispatcher, AbstractService } from './../abstractService';
import { IMemoryContext } from './imemoryContext';
import { IMemoryListener } from './imemoryListener';

import { SetMode } from './setMode';


export class MemoryService extends AbstractService<IMemoryContext, IMemoryListener> {

	public constructor(dispatcher: IDispatcher) {
		super('Memory', dispatcher);
		this.dispatcher.eventHandler(this);
	}

	public getChildren(context: IMemoryContext) {

	}

	public setMemory(context: IMemoryContext, address: number, wordSize: number, byteCount: number, mode: SetMode, bytes: string): void {

	}

	public getMemory(context: IMemoryContext, address: number, wordSize: number, byteCount: number, mode: SetMode): void {

	}

	public registerCommands() {
		super.registerCommands();
		this._commandEmitter.on('memoryChanged', this.handleMemoryChanged);
	}

	public setProperties(properties: any): Promise<any> {
		return Promise.reject(Error('NOT IMPLEMENTED'));
	}

	public getProperties(): Promise<any> {
		return Promise.reject(Error('NOT IMPLEMENTED'));
	}

	private handleMemoryChanged = (eventData: string[]): void => {
		this.log(`MemoryChanged: ${eventData}`);
	};
}