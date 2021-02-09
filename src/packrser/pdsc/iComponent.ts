interface IFile{
    category: string
    condition: string
    name: string
}

export interface IComponent {
    Cclass: string
    Cgroup: string
    condition: string
    Cvendor: string
    Cversion: string
    description: any
    files: IFile[]
}