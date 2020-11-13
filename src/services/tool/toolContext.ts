'use strict';

import { IToolContext } from './itoolContext';
import { ToolService } from './toolService';

export class ToolContext implements IToolContext {

	public service: ToolService;

	public ID: string;
	public Name: string;
	public DeviceId?: string;
	public InterfaceName?: string;
	public InterfaceProperties?: any;
	public HardwareRevision?: number;
	public FirmwareBuildNumber?: number;
	public Chipset?: number;
	public CanDoUpdiHvActivation?: boolean;
	public MajorFirmwareVersionOnDisk: number;
	public MinorFirmwareVersionOnDisk: number;
	public CanEraseXmegaPages: number;

	// public properties: any;

	public constructor(data: IToolContext, service: ToolService) {
		this.service = service;
		this.ID = data.ID;
		this.Name = data.Name;
		this.DeviceId = data.DeviceId;
		this.InterfaceName = data.InterfaceName;
		this.InterfaceProperties = data.InterfaceProperties;
		this.HardwareRevision = data.HardwareRevision;
		this.FirmwareBuildNumber = data.FirmwareBuildNumber;
		this.Chipset = data.Chipset;
		this.CanDoUpdiHvActivation= data.CanDoUpdiHvActivation;
		this.MajorFirmwareVersionOnDisk = data.MajorFirmwareVersionOnDisk;
		this.MinorFirmwareVersionOnDisk = data.MinorFirmwareVersionOnDisk;
		this.CanEraseXmegaPages = data.CanEraseXmegaPages;
	}

	public setProperties(properties: any): Promise<any> {
		return this.service.setProperties(this.ID, properties);
	}

	public getProperties(): Promise<any> {
		return Promise.reject(Error('NOT IMPLEMENTED'));
	}

	public connect() {
		this.service.connect(this.ID);
	}

	public tearDownTool() {
		this.service.tearDownTool(this.ID);
	}

	public checkFirmware() {
		this.service.checkFirmware(this.ID);
	}

	public toString(): string {
		return `${this.ID} (${this.Name})`;
	}

}
