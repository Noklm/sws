'use strict';

import { IDeviceContext } from './ideviceContext';
import { DeviceService } from './deviceService';

export class DeviceContext implements IDeviceContext {

	public service: DeviceService;
	public ID: string;
	public Name: string;
	public Session: number;
	public MemoryIDs?: Array<string>;
	public RunControlID?: string;

	public properties: any;
	public constructor(data: IDeviceContext, service: DeviceService) {
		this.service = service;
		this.ID = data.ID;
		this.Name = data.Name;
		this.Session = data.Session;
		this.MemoryIDs = data.MemoryIDs;
		this.RunControlID = data.RunControlID;
	}

	public setProperties(properties: any): Promise<any> {
		return this.service.setProperties(this.ID, properties);
	}

	public getProperties(): Promise<any> {
		return this.service.getProperties(this.ID);
	}

	public toString(): string {
		return `${this.ID} => ${this.Name}`;
	}

}