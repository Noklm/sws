'use strict';

import { IService, IEventHandler, IEvent } from './iservice';
import { IContext, IContextListener } from './icontext';

import { IDispatcher } from './../idispatcher';
import { EventEmitter } from 'events';

abstract class AbstractService<TContext extends IContext, TListener extends IContextListener<TContext>> implements IService {
	protected _name: string;
	protected _commandEmitter: EventEmitter; // One service handle commands on events
	protected dispatcher: IDispatcher;

	public contexts: Map<string, TContext>;	// One service can have one or more contexts
	protected listeners: Array<TListener>; // One service can have on or more listeners


	public constructor(name: string, dispatcher: IDispatcher) {
		this._name = name;
		this._commandEmitter = new EventEmitter();
		this.dispatcher = dispatcher;
		this.contexts = new Map<string, TContext>();
		this.listeners = new Array<TListener>();
	}

	/**
	 * As a service we need to get his name
	 */
	public getName(): string{
		return this._name;
	}

	/**
	 * All services implement commands, overload this method if more commands are available for the service
	 */
	public registerCommands() {
		this._commandEmitter.on('contextAdded', this.handleContextAdded);
		this._commandEmitter.on('contextChanged', this.handleContextChanged);
		this._commandEmitter.on('contextRemoved', this.handleContextRemoved);
	}

	protected log(message: string): void {
		this.dispatcher.log(`[${this._name}] ${message}`);
	}

	public eventHandler = (event: IEvent): void => {
		if (this._commandEmitter.emit(event.command, event.args)) {
			this.log(`Command ${event.command} done`);
		} else {
			this.log(`Command ${event.command} unknown`);
		}
	};

	abstract fromJson(data: TContext): TContext;
	abstract setProperties(contextId: string, properties: TContext): Promise<string>;
	abstract getProperties(contextId: string): Promise<TContext>;

//----------------------------------------------------------------------
	// Context
//----------------------------------------------------------------------
	
	public addListener(listener: TListener): void {
		this.listeners.push(listener);
	}

	public removeListener(listener: TListener): void {
		this.listeners = this.listeners.filter((value) => {
			return value !== listener;
		});
	}

	public getContext(id: string): Promise<TContext> {
		return Promise.resolve(this.contexts.get(id) as TContext);
	}

	private handleContextAdded = (eventData: string[]): void => {
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
	};

	private handleContextChanged = (eventData: string[]): void => {
		let self = this;

		let contextsData = <TContext[]>JSON.parse(eventData[0]);
		let newContexts = new Array<TContext>();

		contextsData.forEach(contextData => {
			let context = self.fromJson(contextData);
			this.contexts.set(context.ID, context);
			newContexts.push(context);
		});

		this.log(`ContextChanged: ${newContexts}`);

		this.listeners.forEach(listener => {
			listener.contextChanged(newContexts);
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

		this.listeners.forEach(listener => {
			listener.contextRemoved(ids);
		});
	};
}

// TODO: Don't export IDispatcher from here...
export { IDispatcher, AbstractService };