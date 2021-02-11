import * as vscode from 'vscode';
import { ITreeContainer } from '../../../sws/iTreeContainer';
import { IBitField } from '../module/iBitField';
import { IMode } from '../module/iMode';
import { BitfieldTreeItem } from './bitFieldTreeItem';

export class ModeTreeItem extends vscode.TreeItem implements ITreeContainer {
    private _size: number;
    private _bitfields?: IBitField | IBitField[];
    constructor(mode: IMode, size: number) {
        super(mode.name);
        this._size = size;
        this.description = 'mode';
        this.collapsibleState = mode.bitfield ? 1 : 0;
        this._bitfields = mode.bitfield;
    }

    getChildren(): vscode.TreeItem[] {
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
        return children;
    }
}