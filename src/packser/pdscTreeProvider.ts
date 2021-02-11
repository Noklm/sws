import * as vscode from 'vscode';
import { parse } from './packser';
import { DeviceTreeItem } from './pdsc/treeItems/deviceTreeItem';
import { IDevice, IFamily } from './pdsc/iFamily';
import { ITreeDataProvider } from '../sws/iTreeDataProvider';
import { ITreeContainer } from '../sws/iTreeItem';

export class PackTreeProvider implements ITreeDataProvider<vscode.TreeItem | ITreeContainer>{
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = new vscode.EventEmitter<vscode.TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;

    private _family: IFamily;
    constructor(pack: any) {
        this._family = pack.package.devices[0];
        vscode.workspace.onDidChangeConfiguration((evt: vscode.ConfigurationChangeEvent) => {
            // #TODO: refresh only when target settings are changed
            this.refresh();
        });
    }

    delete(element?: vscode.TreeItem): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    add(...element: vscode.TreeItem[]): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    
    getChildren(element?: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
        if (element && 'getChildren' in element) {
            const item = <ITreeContainer>element;
            return item.getChildren();
        }
        return this.getDepsInPack();
    }

    private getDepsInPack(): vscode.TreeItem[] {
        console.log(this._family);
        const items: vscode.TreeItem[] = new Array<vscode.TreeItem>();
        this._family.device.forEach((device: IDevice) => {
            items.push(new DeviceTreeItem(device));
        });
        return items;
    }

    refresh(element?: vscode.TreeItem) {
        const config = vscode.workspace.getConfiguration("sws.config");
        const self = this;
        return new Promise<boolean>(function (resolve, reject) {

            parse(`/toolchains/packs/${config.PACK}/${config.PACK_VERSION}/Atmel.${config.PACK}.pdsc`).then((result) => {
                self._family = result.package.devices[0];
                self._onDidChangeTreeData.fire(undefined);
                resolve(true);
            }).catch((error: any) => reject(error));
        });
    }
}
    


