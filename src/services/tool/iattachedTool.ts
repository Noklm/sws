'use strict';

import { IConnectionProperties } from './iconnectionProperties';

export interface IAttachedTool {
	ToolType: string;
	ConnectionType:string;
	ConnectionProperties?: IConnectionProperties;
}
