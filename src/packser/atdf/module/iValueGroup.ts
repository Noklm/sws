import { IValue } from "./iValue";

export interface IValueGroup{
    caption: string
    name: string
    value: IValue | IValue[]
}