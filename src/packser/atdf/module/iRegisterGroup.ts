import { IRegister } from "./iRegister";
import { IDeviceRegisterGroup } from "../device/iRegisterGroup";

export interface IRegisterGroup{
    caption: string
    name: string
    size: number
    register?: IRegister | IRegister[]
    class?: string;
    "union-tag"?: string
    "register-group"?: IDeviceRegisterGroup | IDeviceRegisterGroup[]
}