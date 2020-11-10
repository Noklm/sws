'use strict';
import { IService } from '../services/iservice';
import { ITool } from '../services/tool/itool';

export interface IChannel {
    
    // setters
    setLocalService(service: IService): void;
    setRemoteServices(services: string[]): void;
    setAttachedTools(tools: ITool[]): void;

    // getters
    getRemoteServices(): string[];
    getLocalServices(): string[];
    getService(name: string): IService;
    getAttachedTool(name: string): ITool;
}