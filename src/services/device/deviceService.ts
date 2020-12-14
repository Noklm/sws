'use strict';

import { IDispatcher, AbstractService } from './../abstractService';
import { IDeviceContext } from './ideviceContext';

export class DeviceService extends AbstractService<IDeviceContext> {

	public constructor(dispatcher: IDispatcher) {
		super('Device', dispatcher);
	}

	public setProperties(contextId: string, properties: any): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'setProperties', [contextId, properties]);
	}

	public getProperties(contextId: string): Promise<IDeviceContext> {
		let self = this;

		return new Promise<IDeviceContext>(function (resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'getProperties', [contextId]).then((eventData: string) => {
				let data = JSON.parse(eventData);
				resolve(data);
			}).catch(reject);
		});
	}
}