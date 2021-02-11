import * as vscode from 'vscode';
import { IAtMemory } from '../iFamily';

export class MemoryTreeItem extends vscode.TreeItem {
    constructor(memory: IAtMemory) {
        super(memory.name);
        this.description = memory['address-space'];
        this.tooltip = `Start: ${memory.start}\nSize: ${memory.size}\nR/W: ${memory.rw}`;
    }
}