'use strict';

import { IMemoryContext } from './imemoryContext';
import { MemoryService } from './memoryService';

export class MemoryContext implements IMemoryContext {
	public ID: string;
	public BigEndian: boolean;
	public AddressSize: number;
	public Name: string;
	public StartBound: number;
	public EndBound: number;

	public service: MemoryService;

	public constructor(data: IMemoryContext, service: MemoryService) {
		this.service = service;
		this.ID = data.ID;
		this.Name = data.Name;
		this.BigEndian = data.BigEndian;
		this.AddressSize = data.AddressSize;
		this.StartBound = data.StartBound;
		this.EndBound = data.EndBound;
	}

	public toString(): string {
		return `${this.Name}`;
	}
}