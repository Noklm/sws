'use strict';

import { IContext } from './../icontext';

export interface IToolContext extends IContext {
	Name: string;
	DeviceId?: string;
	// InterfaceName?: string;
	// // Keep InterfaceProperties to any type while we don't know all interfaceProperties
	// InterfaceProperties?: any;

	toString(): string;

	connect(): void;
	tearDownTool(): void;
}