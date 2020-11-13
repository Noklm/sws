
'use strict';
import { IService } from './iservice';

export interface IContext<TService extends IService> {
	ID: string;
	service?: TService;
	setProperties(properties: any): Promise<any>;
	getProperties(): Promise<any>;
}


export interface IContextListener<TContext extends IContext<any>> {
	contextAdded(contexts: TContext[]): void;
	contextChanged(contexts: TContext[]): void;
	contextRemoved(contextIds: string[]): void;
}

// export interface IContextConstructor<TContext extends IContext> {
// 	new(data: TContext): TContext;
// }