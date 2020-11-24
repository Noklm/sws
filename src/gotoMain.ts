'use strict';

import { IProcessListener } from './services/process/IProcessListener';
import { IProcessContext } from './services/process/IProcessContext';

import { SwsDebugSession } from './swsDebug';
import { InitializedEvent } from 'vscode-debugadapter';

export class GotoMain implements IProcessListener {

	private session: SwsDebugSession;

	public constructor(session: SwsDebugSession) {
		this.session = session;
	}

	public contextAdded(contexts: IProcessContext[]): void {
		this.session.sendEvent(new InitializedEvent());
		this.session.goto('main');
	}

	public contextChanged(contexts: IProcessContext[]): void { }
	public contextRemoved(contextIds: string[]): void {	}
	public exited(id: string, exitCode: number): void {	}
}