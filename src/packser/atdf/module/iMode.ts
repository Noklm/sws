import { IBitField } from "./iBitField";

export interface IMode {
    name: string
    bitfield: IBitField | IBitField[]
}