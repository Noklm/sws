interface IAccept{
    Tcompiler: string
    Toutput?: string
}

interface IRequire{
    TCompiler?: string
    Dname?: string
    Dvendor?:string
}

export interface ICondition{
    id: string
    accept?: IAccept | IAccept[]
    require?: IRequire
}