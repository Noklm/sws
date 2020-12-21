'use strict';

import { DebugProtocol } from 'vscode-debugprotocol';
import { InterfaceType, InterfaceNameType } from './services/tool/iprogInterface';

/**
 * This interface should always match the schema found in the sws-debug extension manifest.
 */
export interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {

	// ATBACKEND PROPERTIES
	// atbackendHost: string;
	// atbackendPort: number;

	// FILE TO DEBUG PROPERTY
	program: string;

	// TOOL PROPERTIES
	tool: string;
	// toolConnection: string;
	// connectionProperties: IConnectionProperties;

	// DEVICE PROPERTY
	device: string;

	// COMMUNICATION INTERFACE PROPERTIES
	interface: InterfaceNameType;
	interfaceProperties: InterfaceType;

	// OTHER PROPERTIES
	launchParameters: ILaunchParameters;

	remapSourcePathFrom: string;
	remapSourcePathTo: string;
}

export interface ILaunchParameters{
	LaunchSuspended: boolean;
	LaunchAttached: boolean;
	CacheFlash: boolean;

	EraseRule: number; // enum
	PreserveEeprom: boolean;
	RamSnippetAddress: number;
	ProgFlashFromRam: boolean;

	UseGdb: boolean;
	GdbLocation: string;

	BootSegment: number; // enum

	PackPath: string;
}