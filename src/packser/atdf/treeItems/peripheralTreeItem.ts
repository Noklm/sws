import * as vscode from 'vscode';
import { ITreeContainer } from '../../../sws/iTreeContainer';
import { IInstance } from '../device/iInstance';
import { IPeripheral } from '../device/iPeripheral';
import { IRegisterGroup } from '../module/iRegisterGroup';
import { IModule } from '../module/iModule';
import { InstanceTreeItem } from './instanceTreeItem';
import path = require('path');

export class PeripheralTreeItem extends vscode.TreeItem implements ITreeContainer {
    private _children: Array<IInstance>;
    private _registerGroup?: Array<IRegisterGroup>;

    constructor(peripheral: IPeripheral, module: IModule) {
        super(peripheral.name);
        this.tooltip = module.caption;
        // this.description = module.caption;
        this._children = Array.isArray(peripheral.instance) ? peripheral.instance : new Array<IInstance>(peripheral.instance);
        // this.iconPath = {
        //     light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'light', 'peripheral.svg'),
        //     dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'dark', 'peripheral.svg')
        // };
        if (module['register-group']) {
            if (Array.isArray(module['register-group'])) {
                this._registerGroup = module['register-group'];
            } else {
                this._registerGroup = new Array<IRegisterGroup>(module['register-group']);
            }
            this.collapsibleState = 1;
        } else {
            this.collapsibleState = 0;
        }
    }

    getChildren(): (vscode.TreeItem | ITreeContainer)[] {
        const children: InstanceTreeItem[] = new Array<InstanceTreeItem>();
        if (this._registerGroup) {
            for (let instance of this._children) {
                if (!Array.isArray(this._registerGroup)) {
                    children.push(new InstanceTreeItem(instance, [this._registerGroup]));
                } else {
                    children.push(new InstanceTreeItem(instance, this._registerGroup));
                }
            }
            return children;
        }
        throw new Error('This container item has no children');
    }
}