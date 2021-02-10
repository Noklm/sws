import { IRegisterGroup } from "./iRegisterGroup";
import { IValueGroup } from "./iValueGroup";

export interface IModule{
    caption: string
    name: string
    id?: string
    "register-group": IRegisterGroup | IRegisterGroup[]
    "value-group"?: IValueGroup | IValueGroup[]
}