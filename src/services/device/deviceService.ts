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
		return this.dispatcher.sendCommand(this._name, 'setProperties', [contextId, properties]);
	}

	public getProperties(contextId: string): Promise<IDeviceContext> {
		let self = this;

		return new Promise<IDeviceContext>(function (resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'getProperties', [contextId]).then((eventData: string) => {
				let data = JSON.parse(eventData);
				resolve(new DeviceContext(data, self));
			}).catch(reject);
		});
	}

	public fromJson(data: IDeviceContext): IDeviceContext {
		let context = new DeviceContext(data, this);
		return context;
	}
}