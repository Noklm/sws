'use strict';

export interface IContext {
	ID: string;  // ID of the context
}

export interface IContextListener<TContext extends IContext> {
	contextAdded(contexts: TContext[]): void;
	contextChanged(contexts: TContext[]): void;
	contextRemoved(contextIds: string[]): void;
}

export interface IProperties{

}