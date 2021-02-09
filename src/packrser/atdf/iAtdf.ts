import { IDevice } from "./device/iDevice";
import { IModule } from "./module/iModule";
import { IPinout } from "./pinout/IPinout";
import { IVariant } from "./variant/iVariant";

export interface IAtdf{
    variants: IVariant[]
    modules: IModule[]
    devices: IDevice[]
    pinouts: IPinout[]
}