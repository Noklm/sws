import { IAddressSpace } from "./iAddressSpace";
import { IInterface } from "./iInterface";
import { IInterrupt } from "./iInterrupt";
import { IPeripheral } from "./iPeripheral";
import { IPropertyGroup } from "./iPropertyGroup";

export interface IDevice{
    architecture: string
    family: string
    name: string
    "address-spaces": IAddressSpace[]
    peripherals: IPeripheral[]
    interrupts: IInterrupt[]
    interfaces: IInterface[]
    "property-groups": IPropertyGroup[]
}