'use strict';

import { IContext } from './../icontext';
import { ToolService } from './toolService';

export interface IToolContext extends IContext<ToolService> {
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
export interface IToolProperties extends IInterfaceProperties {
	InterfaceName: string;
	DeviceName: string;
	PackPath: string;
}

/**
 * Interface that structure the interface properties for UPDI, JTAG, SWD ...
 */
export interface IInterfaceProperties {
	InterfaceProperties?: IUpdi | IJtag | ISwd;
}

/**
 * Interface that describes the UPDI interface
 */
export interface IUpdi extends IKeepTimersRunning{
	UpdiClock: number;
}

/**
 * Interface that describes the JTAG interface
 */
export interface IJtag extends IKeepTimersRunning{
	JtagClock: number;
}

/**
 * Interface that describes a Tool object from the tool TCF service
 */
export interface ISwd extends IKeepTimersRunning{
	SwdClock: number;
}

export interface IKeepTimersRunning {
	KeepTimersRunning: boolean;
}