'use strict';

import { IService, IEventHandler, IEvent } from './iservice';
import { IContext, IContextListener, IContextConstructor } from './icontext';

import { IDispatcher } from './../idispatcher';
import { ToolContext } from './tool/toolContext';

abstract class AbstractService<TContext extends IContext, TListener extends IContextListener<TContext>> implements IService {
	private _name: string;
	protected dispatcher: IDispatcher;

	public contexts: Map<string, TContext> = new Map<string, TContext>();
	protected listeners: Array<TListener> = new  Array<TListener>();


	public constructor(name: string, dispatcher: IDispatcher) {
		this._name = name;
		this.dispatcher = dispatcher;

		this.dispatcher.eventHandler(name, (<IEventHandler>this));
	}

	public getName(): string{
		return this._name;
	}

	protected log(message: string): void {
		this.dispatcher.log(`[${this._name}] ${message}`);
	}

	abstract fromJson(data: TContext): TContext;

	public eventHandler(event: IEvent): boolean {
		switch (event.command) {
			case 'contextAdded':
				this.handleContextAdded(event.args);
				return true;
			case 'contextChanged':
				this.handleContextChanged(event.args);
				return true;
			case 'contextRemoved':
				this.handleContextRemoved(event.args);
				return true;
			default:
				return false;
		}
	}

	private handleContextAdded(eventData: string[]): void {
		let self = this;

		let contextsData = <TContext[]>JSON.parse(eventData[0]);
		let newContexts = new Array<TContext>();

		contextsData.forEach(contextData => {
			let context = self.fromJson(contextData);
			this.contexts.set(context.ID, context);
			newContexts.push(context);
		});

		this.log(`ContextAdded: ${newContexts}`);

		this.listeners.forEach(listener => {
			listener.contextAdded(newContexts);
		});
	}

	private handleContextChanged(eventData: string[]): void {
		let self = this;

		let contextsData = <TContext[]>JSON.parse(eventData[0]);
		let newContexts = new Array<TContext>();

		contextsData.forEach(contextData => {
			let context = self.fromJson(contextData);
			this.contexts.set(context.ID, context);
			newContexts.push(context);
		});

		this.log(`ContextAdded: ${newContexts}`);

		this.listeners.forEach(listener => {
			listener.contextChanged(newContexts);
		});
	}

	private handleContextRemoved(eventData: string[]): void {
		let ids = <string[]>JSON.parse(eventData[0]);

		ids.forEach(id => {
			if (id in this.contexts) {
				// this.contexts.set(id, undefined);
			}
		});

		this.log(`ContextRemoved: ${ids}`);

		this.listeners.forEach(listener => {
			listener.contextRemoved(ids);
		});
	}


	public addListener(listener: TListener): void {
		this.listeners.push(listener);
	}

	public removeListener(listener: TListener): void {
		this.listeners = this.listeners.filter( (value) => {
			return value !== listener;
		});
	}

	public getContext(id: string): Promise<TContext> {
		return Promise.resolve(this.contexts.get(id) as TContext);
	}


}

// TODO: Don't export IDispatcher from here...
export { IDispatcher, AbstractService };