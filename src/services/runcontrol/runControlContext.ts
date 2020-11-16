'use strict';

import { IRunControlContext } from './irunControlContext';
import { ResumeMode } from './resumeMode';
import { RunControlService } from './runControlService';

export class RunControlContext implements IRunControlContext {
	public ID: string;
	public CanSuspend: boolean;
	public CanResume: number;
	public CanCount: number;
	public IsContainer: boolean;
	public HasState: boolean;
	public CanTerminate: boolean;

	public service: RunControlService;

	public constructor(data: IRunControlContext, service: RunControlService) {
		this.ID = data.ID;
		this.CanSuspend = data.CanSuspend;
		this.CanResume = data.CanResume;
		this.CanCount = data.CanCount;
		this.IsContainer = data.IsContainer;
		this.HasState = data.HasState;
		this.CanTerminate = data.CanTerminate;
		this.service = service;
	}

	public resume(mode: ResumeMode, count?: number): Promise<any> {
		return this.service.resume(this.ID, mode, count);
	}

	public suspend(): Promise<any> {
		return this.service.suspend(this.ID);
	}

	public terminate(): Promise<any> {
		return this.service.terminate(this.ID);
	}

	public detach(): Promise<any> {
		return this.service.detach(this.ID);
	}

	public toString(): string {
		return `${this.ID}`;
	}
}