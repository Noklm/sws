
'use strict';

 // http://git.eclipse.org/c/tcf/org.eclipse.tcf.git/plain/docs/TCF%20Service%20-%20Breakpoints.html

import { IDispatcher, AbstractService } from './../abstractService';

import { IBreakpointContext } from './ibreakpointContext';
import { BreakpointContext } from './breakpointContext';
import { IBreakpointListener } from './ibreakpointListener';

export class BreakpointsService extends AbstractService<IBreakpointContext, IBreakpointListener> {

	private contextCounter: number;

	public constructor(dispatcher: IDispatcher) {
		super('Breakpoints', dispatcher);
		this.contextCounter = 0;
		this.dispatcher.eventHandler(this);
	}

	public add(parameters: any): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'add', [parameters]);
	}

	public getProperties(contextId: string): Promise<IBreakpointContext> {
		let self = this;

		return new Promise<IBreakpointContext>(function(resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'getProperties', [contextId]).then( (eventData: string) => {
				resolve(JSON.parse(eventData));
			}).catch(reject);
		});
	}

	public getError(contextId: string): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'getError', [contextId]);
	}

	public remove(contextIds: string[]): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'remove', [contextIds]);
	}

	public getNextBreakpointId(): string {
		return `${++this.contextCounter}`;
	}

	public setProperties(): Promise<any> {
		return Promise.reject(Error('NOT IMPLEMENTED'));
	}
}