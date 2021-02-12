import path = require('path');
import * as vscode from 'vscode';
import { ITreeContainer } from '../../../sws/iTreeContainer';
import { IInstance } from '../device/iInstance';
import { IDeviceRegisterGroup } from '../device/iRegisterGroup';
import { IRegister } from '../module/iRegister';
import { IRegisterGroup } from '../module/iRegisterGroup';
import { RegisterTreeItem } from './registerTreeItem';
import { UnionTreeItem } from './unionTreeItem';

export class InstanceTreeItem extends vscode.TreeItem implements ITreeContainer {
    private _registers?: Array<IRegister>;
    private _deviceRegisterGroups?: Array<IDeviceRegisterGroup>;
    private _moduleRegisterGroups?: IRegisterGroup[];

    constructor(instance: IInstance, moduleRegisterGroups?: IRegisterGroup[]) {
        super(instance.name);
        this._moduleRegisterGroups = moduleRegisterGroups;
        if (moduleRegisterGroups && instance['register-group']) {

            for (let moduleRegisterGroup of moduleRegisterGroups) {
                if (moduleRegisterGroup.name === instance['register-group']['name-in-module']) {
                    if (moduleRegisterGroup.register) {
                        this._registers = Array.isArray(moduleRegisterGroup.register) ? moduleRegisterGroup.register : [moduleRegisterGroup.register];
                    }
                
                    if (moduleRegisterGroup['register-group']) {
                        this._deviceRegisterGroups = Array.isArray(moduleRegisterGroup['register-group']) ? moduleRegisterGroup['register-group'] : [moduleRegisterGroup['register-group']];
                    }
                }
            }
            this.description = `0x${instance['register-group'].offset.toString(16).toUpperCase().padStart(4, "0")}`;
            this.collapsibleState = this._registers || this._deviceRegisterGroups ? 1 : 0;
        }
        this.iconPath = {
            light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'light', 'module.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'dark', 'module.svg')
        };        
    }

    getChildren(): (vscode.TreeItem | ITreeContainer)[] {
        const children: (RegisterTreeItem | UnionTreeItem)[] = new Array<(RegisterTreeItem | UnionTreeItem)>();
        if (this._registers) {
            for (let child of this._registers) {
                children.push(new RegisterTreeItem(child));
            }
            
        }
        if (this._deviceRegisterGroups && this._moduleRegisterGroups) {
            for (let child of this._deviceRegisterGroups) {
                children.push(new UnionTreeItem(child, this._moduleRegisterGroups));
            }

        }
        return children;
        
    }
}