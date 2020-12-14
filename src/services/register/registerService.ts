'use strict';

// http://git.eclipse.org/c/tcf/org.eclipse.tcf.git/plain/docs/TCF%20Service%20-%20Registers.html

import { IDispatcher, AbstractService } from './../abstractService';
import { IRegisterContext }  from './iregisterContext';

export class RegisterService extends AbstractService<IRegisterContext> {

	public constructor(dispatcher: IDispatcher) {
		super('Registers', dispatcher);
		this.on('registerChanged', this.handleRegisterChanged);
	}

	public get(contextId: string): Promise<string> {
		let self = this;

		return new Promise<string>(function(resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'get', [contextId]).then( (data: string) => {
				resolve(data);
			}).catch(reject);
		});
	}

	private handleRegisterChanged = (eventData: string[]): void => {
		let contextId = JSON.parse(eventData[0]);
		this.log(`RegisterChanged: ${contextId}`);
	};

	public setProperties(contextId: string, properties: any): Promise<any> {
		return Promise.reject(Error('NOT IMPLEMENTED'));
	}

	public getProperties(contextId: string): Promise<any> {
		return this.get(contextId);
	}
}