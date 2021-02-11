import path = require('path');
import * as vscode from 'vscode';
import { ITreeContainer } from '../../../sws/iTreeContainer';
import { IInstance } from '../device/iInstance';
import { IRegister } from '../module/iRegister';
import { RegisterTreeItem } from './registerTreeItem';

export class InstanceTreeItem extends vscode.TreeItem implements ITreeContainer {
    private _children?: Array<IRegister>;
    constructor(instance: IInstance, registers?: IRegister[]) {
        super(instance.name);
        this.iconPath = {
            light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'light', 'module.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'dark', 'module.svg')
        };
        this._children = registers;
        if (instance['register-group']) {
            this.description = `0x${instance['register-group'].offset.toString(16).toUpperCase().padStart(4,"0")}`;
            this.collapsibleState = registers ? 1 : 0;
        } else {
            this.collapsibleState = 0;
        }
        
    }

    getChildren(): (vscode.TreeItem | ITreeContainer)[] {
        const children: RegisterTreeItem[] = new Array<RegisterTreeItem>();
        if (this._children) {
            for (let child of this._children) {
                children.push(new RegisterTreeItem(child));
            }
            return children;
        }
        throw new Error('This container item has no children');
        
    }
}