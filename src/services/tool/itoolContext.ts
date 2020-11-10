'use strict';

import { IContext } from './../icontext';

export interface IToolContext extends IContext {
	Name: string;
	DeviceId: string;
	MajorFirmwareVersionOnDisk: number;
	MinorFirmwareVersionOnDisk: number;
	CanEraseXmegaPages: number;

	toString(): string;
	connect(): void;
	tearDownTool(): void;
}