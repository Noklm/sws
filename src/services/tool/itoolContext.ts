'use strict';

import { IContext, IProperties } from './../icontext';
import { InterfaceType, InterfaceNameType } from './iprogInterface';

export interface IToolContext extends IContext {
	Name: string;
	DeviceId?: string;
	InterfaceName?: string;
	InterfaceProperties?: any;
	HardwareRevision?: number,
	MajorFirmwareVersion?: number,
	MinorFirmwareVersion?: number,
	FirmwareBuildNumber?: number,
	Chipset?: number,
	CanDoUpdiHvActivation?: boolean,
	MajorFirmwareVersionOnDisk: number;
	MinorFirmwareVersionOnDisk: number;
	CanEraseXmegaPages: number;

	toString(): string;
	connect(): void;
	tearDownTool(): void;
}

export interface IToolProperties extends IProperties {
	InterfaceName: InterfaceNameType;
	DeviceName: string;
	PackPath: string;
	InterfaceProperties?: InterfaceType;
}
