export interface IBook {
    name: string
    title: string
}

export interface ICompile {
    header: string
}

export interface IProcessor {
    Dcore: string
}

export interface IDevice {
    book: IBook[]
    compile: ICompile
    description?: string
    Dname: string
    environment: IEnvironment[]
    processor: IProcessor
}

export interface IVariant {
    ordercode: string
    vccmin: number
    vccmax: number
    tempmin: number
    tempmax: number
}

export interface IProperty {
    name: string
    value: string
}

export interface IComponent {
    "at:template": { select: string }
    CClass: string
    Cgroup: string
    Cvendor: string
    name: string
}

export interface IAtProject {
    name: string
    "at:component": IComponent
}

export interface IAtMemory {
    start: number
    size: number
    type: string
    rw: string
    exec: number
    pagesize: number
    name: string
    "address-space": string
}

export interface IAtInterface {
    name: string
    type: string
}

export interface IAtPrerequesite {
    component: string
    context: string
    Tcompiler: string
}

export interface IAtmel {
    "xmlns:at": string,
    schemaVersion: string
    "at:atdf": { name: string };
    "at:tool": { id: string }[]
    "at:variant": IVariant[] | IVariant
    "at:project": IAtProject[] | IAtProject
    "at:property": IProperty
    "at:memory": IAtMemory[]
    "at:interface": IAtInterface[] | IAtInterface
    "at:prerequisite": IAtPrerequesite[] | IAtPrerequesite
}

export interface IMicrochip {
    "xmlns:mchp": string
    schemaVersion: string | number
    "mchp:xc8": { name: string }
    "mchp:prerequisite": { component: string, version: string }
}

export interface IEnvironment {
    name: string
    "at:extension"?: IAtmel
    "mechp:extension"?: IMicrochip
}

export interface IFamily {
    Dfamily: string
    device: Array<IDevice>
    Dvendor: string
    environment: Array<IEnvironment> | IEnvironment
}