'use strict';

// http://git.eclipse.org/c/tcf/org.eclipse.tcf.git/plain/docs/TCF%20Service%20-%20Run%20Control.html

import { IDispatcher, AbstractService } from './../abstractService';
import { IRunControlContext } from './irunControlContext';
import { ResumeMode } from './resumeMode';


export class RunControlService extends AbstractService<IRunControlContext> {

	public constructor(dispatcher: IDispatcher) {
		super('RunControl', dispatcher);
		this.on('contextSuspended', this.handleContextSuspended);
		this.on('contextResumed', this.handleContextResumed);
	}

	public resume(contextId: string, mode: ResumeMode, count?: number): Promise<string> {
		if (!count) {
			count = 0;
		}
		return this.dispatcher.sendCommand(this._name, 'resume', [contextId, mode, count]);
	}

	public suspend(contextId: string): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'suspend', [contextId]);
	}

	public terminate(contextId: string): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'terminate', [contextId]);
	}

	public detach(contextId: string): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'detach', [contextId]);
	}

	private handleContextSuspended = (eventData: string[]): void => {
		let id = JSON.parse(eventData[0]);
		let pc = +JSON.parse(eventData[1]);
		let reason = JSON.parse(eventData[2]);
		let state = JSON.parse(eventData[3]);

		this.log(`ContextSuspended: ${id} => ${pc} (${reason})`);
	};

	private handleContextResumed = (eventData: string[]): void => {
		let id = JSON.parse(eventData[0]);

		this.log(`ContextResumed: ${id}`);
	};

	public setProperties(contextId: string, properties: any): Promise<string> {
		return this.dispatcher.sendCommand(this.getName(), 'setProperties', [contextId, properties]);
	}

	public getProperties(): Promise<any> {
		return Promise.reject(Error('NOT IMPLEMENTED'));
	}
}