import { IInstance } from "./iInstance";

export interface IPeripheral{
    id?: string
    name: string
    instance: IInstance | IInstance[]
}