'use strict';

import { IDispatcher, AbstractService } from './../abstractService';
import { IDeviceContext } from './ideviceContext';
import { IDeviceListener } from './ideviceListener';
import { DeviceContext } from './deviceContext';

export class DeviceService extends AbstractService<IDeviceContext, IDeviceListener> {

	public constructor(dispatcher: IDispatcher) {
		super('Device', dispatcher);
		this.dispatcher.eventHandler(this);
	}

	public setProperties(contextId: string, properties: any): Promise<string> {
		return this.dispatcher.sendCommand(this.getName(), 'setProperties', [contextId, properties]);
	}

	public getProperties(contextId: string): Promise<string> {
		return this.dispatcher.sendCommand(this.getName(), 'getProperties', [contextId]); // TODO; marshal into Context
	}

	public fromJson(data: IDeviceContext): IDeviceContext {
		let context = new DeviceContext(data, this);
		return context;
	}
}