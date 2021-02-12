import * as vscode from 'vscode';
import { ITreeContainer } from '../../../sws/iTreeContainer';
import { InstanceTreeItem } from './instanceTreeItem';
import path = require('path');
import { IDeviceRegisterGroup } from '../device/iRegisterGroup';
import { IRegisterGroup } from '../module/iRegisterGroup';
import { RegisterTreeItem } from './registerTreeItem';

export class UnionTreeItem extends vscode.TreeItem implements ITreeContainer {
    private _deviceRegisterGroup: IDeviceRegisterGroup;
    private _moduleRegisterGroups: IRegisterGroup[];

    constructor(deviceRegisterGroup: IDeviceRegisterGroup, moduleRegisterGroups: IRegisterGroup[]) {
        super(deviceRegisterGroup.name);
        this._deviceRegisterGroup = deviceRegisterGroup;
        this._moduleRegisterGroups = moduleRegisterGroups;
        this.collapsibleState = 1;
        this.description = "union";

    }

    getChildren(): (vscode.TreeItem | ITreeContainer)[] {
        const children: InstanceTreeItem[] = new Array<InstanceTreeItem>();
        if (this._moduleRegisterGroups) {
            const register = this._moduleRegisterGroups.find((moduleRegisterGroup: IRegisterGroup) => {
                return moduleRegisterGroup.name === this._deviceRegisterGroup['name-in-module'];
            })?.register;
            if (register) {
                if (Array.isArray(register)) {
                    for (let reg of register) {
                        children.push(new RegisterTreeItem(reg)); 
                    }
                    
                } else {
                    children.push(new RegisterTreeItem(register));
                }
            }
        }
        return children;
    }
}