'use strict';

import * as vscode from 'vscode';
import {
	ProgressStartEvent,
	ProgressUpdateEvent,
	ProgressEndEvent,
	DebugSession,
	Event
} from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';
import { IProgressEventHandler } from './services/iservice';

export class ProgressReporter implements IProgressEventHandler {

	private _dbgSession: DebugSession;
	private _started: boolean;
	private _id: string;
	
	public constructor(id: string, dbgSession: DebugSession) {
		this._id = id;
		this._dbgSession = dbgSession;
		this._started = false;
	}

	public progress = (progression: number, max: number, text?: string): void => {
		let description = text || '';
		
		if (this._started) {
			if (progression !== max) {
				let updateEvent: DebugProtocol.ProgressUpdateEvent = new ProgressUpdateEvent(this._id, `${description} (${progression}%)`);
				updateEvent.body.percentage = progression;
				this._dbgSession.sendEvent(updateEvent);
				return;
			}
			this._dbgSession.sendEvent(new ProgressEndEvent(this._id, `${description} (${progression}%)`));
			this._started = false;
			return;
		}
		let startEvent: DebugProtocol.ProgressStartEvent = new ProgressStartEvent(this._id, description);
		startEvent.body.percentage = progression;
		this._dbgSession.sendEvent(startEvent);
		this._started = true;
	};
}