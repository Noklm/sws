'use strict';

// https://download.eclipse.org/tools/tcf/tcf-docs/TCF%20Service%20-%20Processes.html

import { IDispatcher, AbstractService } from './../abstractService';
import { IProcessContext } from './iprocessContext';
import { IDeviceContext } from './../device/ideviceContext';

/**
 * TCF Processes service:
 * 
 * Processes service provides access to the target OS's process information, 
 * allows to start and terminate a process, and allows to attach and detach a process for debugging. 
 * Debug services, like Memory and Run Control, require a process to be attached before they can access it.
 */
export class ProcessService extends AbstractService<IProcessContext> {

	public constructor(dispatcher: IDispatcher) {
		super('Processes', dispatcher);
		this.on('exited', this.handleExited);
	}

	/**
	 * Launches binary into the target
	 * 
	 * @param module binary name (.elf)
	 * @param deviceContext device's context on which the binary will be launch
	 * @param launchParameters launch arguments (gdb path, pack path ...)
	 */
	public launch(module: string, deviceContext: IDeviceContext, launchParameters: any): Promise<IProcessContext> {
		let self = this;

		return new Promise<IProcessContext>(function(resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'launch', [module, deviceContext.ID, launchParameters]).then( (processId: string) => {
				let context = self.getContext(processId);
				resolve(context);
			}).catch(reject);
		});
	}

	/**
	 * Terminates a process.
	 * 
	 * @param id process'context id to terminate
	 */
	public terminate(id: string): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'terminate', [id]);
	}

	/**
	 * Happen when a process terminates
	 * 
	 * @param eventData additional data, like exited code
	 */
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