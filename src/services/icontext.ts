
'use strict';
import { IService } from './iservice';

export interface IContext {
	ID: string;
	setProperties(properties: any): Promise<any>;
	getProperties(): Promise<any>;
}


export interface IContextListener<TContext extends IContext> {
	contextAdded(contexts: TContext[]): void;
	contextChanged(contexts: TContext[]): void;
	contextRemoved(contextIds: string[]): void;
}

export interface IContextConstructor<TContext extends IContext> {
	new(data: TContext): TContext;
}