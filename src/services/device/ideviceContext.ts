'use strict';

import { IContext } from './../icontext';
import { DeviceService } from './deviceService';

export interface IDeviceContext extends IContext<DeviceService> {
    Name: string,
    Session: number,
    MemoryIDs?: Array<string>,
    RunControlID?: string
}