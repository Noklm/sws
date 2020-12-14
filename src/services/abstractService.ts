'use strict';

import { IService, IEventHandler, IEvent } from './iservice';
import { IContext, IContextListener } from './icontext';

import { IDispatcher } from './../idispatcher';
import { EventEmitter } from 'events';

abstract class AbstractService<TContext extends IContext>extends EventEmitter implements IService {
	protected _name: string;
	protected dispatcher: IDispatcher;
	public contexts: Map<string, TContext>;	// One service can have one or more contexts


	public constructor(name: string, dispatcher: IDispatcher) {
		super();
		this._name = name;
		this.dispatcher = dispatcher;
		this.dispatcher.on(this._name, this.eventHandler);
		this.contexts = new Map<string, TContext>();

		// Register event that are handled by all services that extends abstract service
		this.on('contextAdded', this.handleContextAdded);
		this.on('contextChanged', this.handleContextChanged);
		this.on('contextRemoved', this.handleContextRemoved);
	}

	/**
	 * As a service we need to get his name
	 */
	public getName(): string{
		return this._name;
	}

	protected log(message: string): void {
		this.dispatcher.log(`[${this._name}] ${message}`);
	}

	public eventHandler = (event: IEvent): void => {
		if (this.emit(event.command, event.args)) {
			this.log(`Command ${event.command} done`);
		} else {
			this.log(`Command ${event.command} unknown`);
		}
	};
	abstract setProperties(contextId: string, properties: TContext): Promise<string>;
	abstract getProperties(contextId: string): Promise<TContext>;

//----------------------------------------------------------------------
	// Context
//----------------------------------------------------------------------
	public getContext(id: string): Promise<TContext> {
		return Promise.resolve(this.contexts.get(id) as TContext);
	}

	private handleContextAdded = (eventData: string[]): void => {
		let contextsData = <TContext[]>JSON.parse(eventData[0]);
		let newContexts = new Array<TContext>();

		contextsData.forEach(contextData => {
			this.contexts.set(contextData.ID, contextData);
			newContexts.push(contextData);
			this.log(`ContextAdded: ${contextData.ID}`);
		});
	};

	private handleContextChanged = (eventData: string[]): void => {
		let contextsData = <TContext[]>JSON.parse(eventData[0]);
		let newContexts = new Array<TContext>();

		contextsData.forEach(contextData => {
			this.contexts.set(contextData.ID, contextData);
			newContexts.push(contextData);
			this.log(`ContextChanged: ${contextData.ID}`);
		});
	};

	private handleContextRemoved = (eventData: string[]): void => {
		let ids = <string[]>JSON.parse(eventData[0]);

		ids.forEach(id => {
			if (id in this.contexts) {
				this.contexts.delete(id);
			}
		});

		this.log(`ContextRemoved: ${ids}`);
	};
}

// TODO: Don't export IDispatcher from here...
export { IDispatcher, AbstractService };