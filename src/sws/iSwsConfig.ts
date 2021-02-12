// all interfaces in this file need to match the sws extension settings

interface IAtbackend{
    port: number
    internal: boolean
}

interface IProject{
    TARGET: string
    SN?: string
}

interface IPack{
    PACK: string
    PACK_VERSION: string
    PATH: string
}

export interface ICompile extends IProject, IPack{
    F_CPU: string
    TOOL: string
    CORE: string
}

export interface ISwsConfig{
    config: ICompile
    atbackend: IAtbackend
}