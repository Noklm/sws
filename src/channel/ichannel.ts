'use strict';
import { IService } from '../services/iservice';

export interface IChannel {
    
    // setters
    setLocalService(service: IService): void;
    setRemoteServices(services: string[]): void;

    // getters
    getRemoteServices(): string[];
    getLocalServices(): IterableIterator<IService>;
    getLocalService(name: string): IService;   
}