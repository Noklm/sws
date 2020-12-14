'use strict';

import { IContextListener } from './../icontext';
import { IRunControlContext } from './irunControlContext';

export interface IRunControlListener extends IContextListener<IRunControlContext> {
	contextSuspended(eventData: string[]): void;
	contextResumed(eventData: string[]): void;
	contextException(eventData: string[]): void;
	containerSuspended(eventData: string[]): void;
	containerResumed(eventData: string[]): void;

	contextStateChanged(eventData: string[]): void;
}