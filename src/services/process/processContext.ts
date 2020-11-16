'use strict';

import { IProcessContext } from './iprocessContext';
import { ProcessService } from './processService';

export class ProcessContext implements IProcessContext {

	public ID: string;
	public ParentID: string;
	public Name: string;
	public Attached: boolean;
	public CanTerminate: boolean;
	public StdInID: string;
	public StdOutID: string;
	public StdErrID: string;
	public RunControlId: string;
	public service: ProcessService;

	public constructor(data: IProcessContext, service: ProcessService) {
		this.service = service;
		this.ID = data.ID;
		this.Name = data.Name;
		this.ParentID = data.ParentID;
		this.Attached = data.Attached;
		this.CanTerminate = data.CanTerminate;
		this.StdInID = data.StdInID;
		this.StdOutID = data.StdOutID;
		this.StdErrID = data.StdErrID;
		this.RunControlId = data.RunControlId;
	}

	public toString(): string {
		return `${this.ID}`;
	}

	public terminate(): Promise<any> {
		return this.service.terminate(this.ID);
	}

}
