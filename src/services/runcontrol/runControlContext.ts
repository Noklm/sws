'use strict';

import { IRunControlContext } from './irunControlContext';
import { ResumeMode } from './resumeMode';
import { RunControlService } from './runControlService';

export class RunControlContext implements IRunControlContext {
	public ID: string;
	public ParentID?: string;
	public ProcessID?: string;
	public CreatorID?: string;
	public Name?: string;
	public IsContainer?: boolean;
	public HasState?: boolean;
	public CanSuspend?: boolean;
	public CanResume?: number;
	public CanCount?: number;
	public CanTerminate?: boolean;
	public CanDetach?: boolean;
	public RCGroup?: string;
	public BPGroup?: string;
	public SymbolsGroup?: string;
	public RegAccessTypes?: Array<string>;

	public service: RunControlService;

	public constructor(data: IRunControlContext, service: RunControlService) {
		this.ID = data.ID;
		this.ParentID = data.ParentID;
		this.ProcessID = data.ProcessID;
		this.Name = data.Name;
		this.IsContainer = data.IsContainer;
		this.HasState = data.HasState;
		this.CanSuspend = data.CanSuspend;
		this.CanResume = data.CanResume;
		this.CanCount = data.CanCount;
		this.CanTerminate = data.CanTerminate;
		this.CanTerminate = data.CanTerminate;
		this.CanDetach = data.CanDetach;
		this.RCGroup = data.RCGroup;
		this.BPGroup = data.BPGroup;
		this.SymbolsGroup = data.SymbolsGroup;
		this.RegAccessTypes = data.RegAccessTypes;
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