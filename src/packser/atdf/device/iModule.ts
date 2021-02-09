import { IInstance } from "./iInstance";

export interface IModule{
    id?: string
    name: string
    instance: IInstance | IInstance[]
}