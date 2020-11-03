'use strict';

import { IContextListener } from './../icontext';
import { IToolContext } from './itoolContext';
import {
	IConnectionProperties,
	ITool
} from './itool';

export interface IToolListener extends IContextListener<IToolContext> {
	attachedToolsChanged(attachedTools: ITool[]): void;
}
