import { IBitField } from "./iBitField";
import { IMode } from "./iMode";

export interface IRegister{
    caption: string
    initVal: number
    name: string
    offset: number
    rw: string
    size: number
    bitfield?: IBitField | IBitField[]
    mode?: IMode | IMode[]
}