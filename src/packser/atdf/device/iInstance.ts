import { IDeviceRegisterGroup } from "./iRegisterGroup";
import { ISignal } from "./iSignal";

export interface IInstance{
    name: string
    "register-group"?: IDeviceRegisterGroup
    signals: ISignal[]
}