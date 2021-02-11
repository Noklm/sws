import { parse } from './packser';
import * as vscode from 'vscode';
import { GlobPattern, Uri } from 'vscode';
import { IConfigManager } from '../sws/IConfigManager';
import { PackTreeProvider } from './pdscTreeProvider';


export class PackManager implements IConfigManager<PackTreeProvider> {
    globPattern: GlobPattern | string;
    provider: PackTreeProvider | undefined;

    constructor(pack: string, version: number) {
        this.globPattern = `/toolchains/packs/${pack}/${version}/Atmel.${pack}.pdsc`;
    }

    init(): Promise<void> {
        const self = this;
        return parse(<string>self.globPattern).then((result) => {
            self.generateView(result);
        });
    }

    generateView(data: any): void {
        if (!this.provider) {
            this.provider = new PackTreeProvider(data);
            vscode.window.registerTreeDataProvider('pdsc', this.provider);
        }
    }

    deleteView(e: Uri): void {
        throw new Error('Method not implemented.');
    } 

}
