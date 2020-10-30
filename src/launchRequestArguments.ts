'use strict';

import { DebugProtocol } from 'vscode-debugprotocol';

/**
 * This interface should always match the schema found in the sws-debug extension manifest.
 */
export interface LaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {

	atbackendHost: string;
	atbackendPort: number;

	program: string;
	trace: boolean;
}