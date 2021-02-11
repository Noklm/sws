import path = require('path');
import * as vscode from 'vscode';
import { ITreeContainer } from '../../../sws/iTreeContainer';
import { IBitField } from '../module/iBitField';
import { IMode } from '../module/iMode';
import { IRegister } from '../module/iRegister';
import { BitfieldTreeItem } from './bitFieldTreeItem';
import { ModeTreeItem } from './modeTreeItem';

export class RegisterTreeItem extends vscode.TreeItem implements ITreeContainer {
    private _bitfields?: IBitField | IBitField[];
    private _modes?: IMode | IMode[];
    private _size: number;
    constructor(register: IRegister) {
        super(register.name);
        this.iconPath = {
            light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'light', 'register.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'dark', 'register.svg')
        };
        this.description = `0x${register.offset.toString(16).toUpperCase().padStart(4,"0")}`;
        this._bitfields = register.bitfield;
        this._modes = register.mode;
        this.tooltip = register.caption;
        this.collapsibleState = (this._bitfields || this._modes) ? 1 : 0;    
        this._size = register.size;
    }

    getChildren(): (vscode.TreeItem | ITreeContainer)[] {
        const children: BitfieldTreeItem[] = new Array<BitfieldTreeItem>();
        if (this._bitfields) {
            if (Array.isArray(this._bitfields)) {
                for (let child of this._bitfields) {
                    children.push(new BitfieldTreeItem(child, this._size));
                }
            } else {
                children.push(new BitfieldTreeItem(this._bitfields, this._size));
            }
        }
        if (this._modes) {
            if (Array.isArray(this._modes)) {
                for (let child of this._modes) {
                    children.push(new ModeTreeItem(child, this._size));
                }
            } else {
                children.push(new ModeTreeItem(this._modes, this._size));
            }
        }
        return children;
    }
}