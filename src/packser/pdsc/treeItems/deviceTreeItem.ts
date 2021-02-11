import * as vscode from 'vscode';
import { IDevice, IEnvironment } from '../iFamily';
import { ITreeContainer } from '../../../sws/iTreeItem';
import { MemoryTreeItem } from './memoryTreeItem';
export class DeviceTreeItem extends vscode.TreeItem implements ITreeContainer{
    private _children: MemoryTreeItem[];
    public data: IDevice;
    constructor(device:IDevice) {
        super(device.Dname);
        this.data = device;
        this.description = device.processor.Dcore;
        this.tooltip = device.description;
        this.collapsibleState = 1;
        this._children = [];
        device.environment.find((env: IEnvironment) => {
            if (env['at:extension']) {
                for (let memory of env['at:extension']['at:memory']){
                    this._children.push(new MemoryTreeItem(memory));
               }
           } 
        });
    }
    

    getChildren(): vscode.TreeItem[] {
        return this._children;
    }
}