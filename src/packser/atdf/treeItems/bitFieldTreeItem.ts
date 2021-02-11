import path = require('path');
import * as vscode from 'vscode';
import { ITreeContainer } from '../../../sws/iTreeContainer';
import { IBitField } from '../module/iBitField';

export class BitfieldTreeItem extends vscode.TreeItem implements ITreeContainer{

    constructor(bitfield: IBitField, size:number) {
        super(bitfield.name);
        this.iconPath = {
            light: path.join(__filename,'..','..', '..', '..', '..','resources','light','binary.svg'),
            dark: path.join(__filename, '..','..', '..', '..', '..','resources','dark','binary.svg')
        };
        this.description = `0x${bitfield.mask.toString(16).toUpperCase().padStart(2*size,"0")} / 0b${bitfield.mask.toString(2).toUpperCase().padStart(8*size,'0')}`;
        this.tooltip = bitfield.caption;
        this.collapsibleState = 0;
    }

    getChildren(): vscode.TreeItem[] {
        throw new Error("Bitfield item hasn't children");
    }
}