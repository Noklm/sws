import { IMemorySegment } from "./iMemorySegment";

export interface IAddressSpace{
    endianess: string
    id: string
    name: string
    size: number
    start: number
    "memory-segment": IMemorySegment[]
}