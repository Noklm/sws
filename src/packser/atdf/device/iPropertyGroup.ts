import { IProperty } from "./iProperty";

export interface IPropertyGroup{
    name: string
    property: IProperty | IProperty[]
}