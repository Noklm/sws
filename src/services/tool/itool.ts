'use strict';
import { ITool } from '../services/tool/itool';

/**
 * Interface to visualize the ConnectionProperties object from the tool TCF service
 */
export interface IConnectionProperties {
    Type?: string;
    SerialNumber?: string;
    UsbVendorId?: string;
    UsbProductId?: number;
}

/**
 * Interface that describes a Tool object from the tool TCF service
 */
export interface ITool {
    ToolType: string;
    ConnectionType: string;
    ConnectionProperties: IConnectionProperties;
}