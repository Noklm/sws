'use strict';

import { IContextListener } from './../icontext';
import { IToolContext } from './itoolContext';

export interface IToolListener extends IContextListener<IToolContext> {
	attachedToolsChanged(eventData: string[]): void;
}
