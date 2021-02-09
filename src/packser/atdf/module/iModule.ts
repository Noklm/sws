import { IRegisterGroup } from "./iRegisterGroup";
import { IValueGroup } from "./iValueGroup";

export interface IModule{
    "register-group": IRegisterGroup | IRegisterGroup[]
    "value-group"?: IValueGroup | IValueGroup[]
}