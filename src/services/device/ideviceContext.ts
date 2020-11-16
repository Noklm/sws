'use strict';

import { IContext } from './../icontext';

export interface IDeviceContext extends IContext {
    Name: string,
    Session: number,
    MemoryIDs?: Array<string>,
    RunControlID?: string
}