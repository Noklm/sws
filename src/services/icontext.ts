
'use strict';
export interface IContext {
	ID: string;
}


export interface IContextListener<TContext extends IContext> {
	contextAdded(contexts: TContext[]): void;
	contextChanged(contexts: TContext[]): void;
	contextRemoved(contextIds: string[]): void;
}

export interface IProperties{
	
}
// export interface IContextConstructor<TContext extends IContext> {
// 	new(data: TContext): TContext;
// }