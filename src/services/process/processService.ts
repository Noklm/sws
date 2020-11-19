'use strict';

// http://git.eclipse.org/c/tcf/org.eclipse.tcf.git/plain/docs/TCF%20Service%20-%20Processes.html

import { IDispatcher, AbstractService } from './../abstractService';
import { IProcessContext } from './iprocessContext';
import { IProcessListener } from './iprocessListener';
import { IDeviceContext } from './../device/ideviceContext';


export class ProcessService extends AbstractService<IProcessContext, IProcessListener> {

	public constructor(dispatcher: IDispatcher) {
		super('Processes', dispatcher);
		this.dispatcher.eventHandler(this);
	}

	public registerCommands() {
		super.registerCommands();
		this._commandEmitter.on('exited', this.handleExited);
	}

	public launch(module: string, deviceContext: IDeviceContext, launchParameters: any): Promise<IProcessContext> { // TODO: Promise<IProcessContext>
		let self = this;

		return new Promise<IProcessContext>(function(resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'launch', [module, deviceContext.ID, launchParameters]).then( (processId: string) => {
				let context = self.getContext(processId);
				resolve(context);
			}).catch(reject);
		});
	}

	public terminate(id: string): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'terminate', [id]);
	}


	private handleExited = (eventData: string[]): void => {
		this.log(`Cannot handle exited event with data: ${eventData}`);
	};

	public setProperties(properties: any): Promise<any> {
		return Promise.reject(Error('NOT IMPLEMENTED'));
	}

	public getProperties(): Promise<any> {
		return Promise.reject(Error('NOT IMPLEMENTED'));
	}
}