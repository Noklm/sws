import { IAddressSpace } from "./iAddressSpace";
import { IInterface } from "./iInterface";
import { IInterrupt } from "./iInterrupt";
import { IModule } from "./iModule";
import { IPropertyGroup } from "./iPropertyGroup";

export interface IDevice{
    architecture: string
    family: string
    name: string
    "address-spaces": IAddressSpace[]
    peripherals: IModule[]
    interrupts: IInterrupt[]
    interfaces: IInterface[]
    "property-groups": IPropertyGroup[]
}