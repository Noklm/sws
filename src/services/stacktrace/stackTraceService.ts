
'use strict';

// http://git.eclipse.org/c/tcf/org.eclipse.tcf.git/plain/docs/TCF%20Service%20-%20Stack%20Trace.html

import { IDispatcher, AbstractService } from './../abstractService';
import { IStackTraceContext } from './istackTraceContext';
import { IStackTraceListener } from './istackTraceListener';
import { IFrameArg } from './iframeArg';

export class StackTraceService extends AbstractService<IStackTraceContext, IStackTraceListener> {

	public constructor(dispatcher: IDispatcher) {
		super('StackTrace', dispatcher);
		this.dispatcher.eventHandler(this);
	}

	public async getChildren(parentContext: string): Promise<IStackTraceContext[]> {
		let data = await this.dispatcher.sendCommand(this._name, 'getChildren', [parentContext]);
		let contextIds = <string[]>JSON.parse(data);
		return this.getContexts(contextIds);
	}

	public getContext(contextId: string): Promise<IStackTraceContext> {
		let self = this;
		return new Promise<IStackTraceContext>( (resolve, reject) => {
			self.getContexts([contextId])
				.then( contexts => resolve(contexts.shift()))
				.catch(reject);
		});
	}


	public getContexts(externalContexts: string[]): Promise<IStackTraceContext[]> {
		let self = this;
		let ids: string[];
		ids = externalContexts;
		// externalContexts.forEach((context:any) => {
		// 	if ("ID" in context) {
		// 		ids.push(context.ID);
		// 	} else {
		// 		ids.push(context);
		// 	}
			
		// });
		return new Promise<IStackTraceContext[]>(function(resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'getContext', [ids]).then( (data: string) => {
				let contextsData = <IStackTraceContext[]>JSON.parse(data);

				contextsData.forEach((context) => {
					self.contexts.set(context.ID, context);
				});

				resolve(contextsData);
			}).catch(reject);
		});
	}

	public setProperties(contextId: string, properties: any): Promise<string> {
		return Promise.reject(Error('NOT IMPLEMENTED'));
	}

	public getProperties(): Promise<any> {
		return Promise.reject(Error('NOT IMPLEMENTED'));
	}
}