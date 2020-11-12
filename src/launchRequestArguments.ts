'use strict';

import { DebugProtocol } from 'vscode-debugprotocol';
import { IConnectionProperties } from './services/tool/itool';

/**
 * This interface should always match the schema found in the sws-debug extension manifest.
 */
export interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {

	// ATBACKEND PROPERTIES
	atbackendHost: string;
	atbackendPort: number;

	// FILE TO DEBUG PROPERTY
	program: string;

	// TOOL PROPERTIES
	tool: string;
	// toolConnection: string;
	// connectionProperties: IConnectionProperties;

	// DEVICE PROPERTY
	device: string;

	// COMMUNICATION INTERFACE PROPERTIES
	interface: string;
	interfaceProperties: any;

	// OTHER PROPERTIES
	launchSuspended: boolean;
	launchAttached: boolean;
	cacheFlash: boolean;

	eraseRule: number; // enum
	preserveEeprom: boolean;
	ramSnippetAddress: number;
	progFlashFromRam: boolean;

	useGdb: boolean;
	gdbLocation: string;

	bootSegment: number; // enum

	packPath: string;

	remapSourcePathFrom: string;
	remapSourcePathTo: string;
}