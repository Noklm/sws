import { IBitField } from "./iBitField";

export interface IRegister{
    caption: string
    initVal: number
    name: string
    offset: number
    rw: string
    size: number
    bitfield?: IBitField | IBitField[]
}