import { IRegister } from "./iRegister";

export interface IRegisterGroup{
    caption: string
    name: string
    size: number
    register: IRegister | IRegister[]
}