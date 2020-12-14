
'use strict';

import { IDispatcher, AbstractService } from './../abstractService';
import { IExpressionContext } from './iexpressionContext';
import { IStackTraceContext } from './../stacktrace/istackTraceContext';


export class ExpressionService extends AbstractService<IExpressionContext> {

	public constructor(dispatcher: IDispatcher) {
		super('Expressions', dispatcher);
	}

	public getChildren(parentContext: string): Promise<IExpressionContext[]> {
		let self = this;

		return new Promise<IExpressionContext[]>(function(resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'getChildren', [parentContext]).then( (data: string) => {
				let contextIds = <string[]>JSON.parse(data);
				let contexts = contextIds.map( (contextId) => self.getContext(contextId) );

				Promise.all(contexts).then(resolve).catch(reject);
			}).catch(reject);
		});
	}
	
	public getChildrenRange(parentContext: string, numChildren:number): Promise<IExpressionContext[]> {
		let self = this;

		return new Promise<IExpressionContext[]>(function (resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'getChildrenRange', [parentContext, 0, numChildren]).then((data: string) => {
				let contexts:IExpressionContext[] = JSON.parse(data);
				resolve(contexts);
			}).catch(reject);
		});
	}

	public getContext(contextId: string): Promise<IExpressionContext> {
		let self = this;

		return new Promise<IExpressionContext>(function(resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'getContext', [contextId]).then( (data: string) => {
				let contextData = JSON.parse(data);
				self.contexts.set(contextData.ID, contextData);
				resolve(contextData);
			}).catch(reject);
		});
	}

	public compute(context: IStackTraceContext, language: string, expression: string): Promise<IExpressionContext> {
		let self = this;

		return new Promise<IExpressionContext>(function(resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'compute', [context.ID, language, expression]).then( (data: string) => {
				let contextData = JSON.parse(data);
				resolve(contextData);
			}).catch(reject);
		});
	}

	public evaluate(contextID: string): Promise<string> {
		let self = this;

		return new Promise<any>(function (resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'evaluate', [contextID]).then((data: string) => {
				// let contextData = JSON.parse(data);
				resolve(data);
			}).catch(reject);
		});
	}

	public assign(contextId: string, value: string): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'assign', [contextId, value]);
	}

	public dispose(contextId: string): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'dispose', [contextId]);
	}

	public setProperties(contextId: string, properties: any): Promise<string> {
		return Promise.reject(Error('NOT IMPLEMENTED'));
	}

	public getProperties(): Promise<any> {
		return Promise.reject(Error('NOT IMPLEMENTED'));
	}
}