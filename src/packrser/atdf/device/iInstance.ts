import { IRegisterGroup } from "./iRegisterGroup";
import { ISignal } from "./iSignal";

export interface IInstance{
    name: string
    "register-group": IRegisterGroup
    signals: ISignal[]
}