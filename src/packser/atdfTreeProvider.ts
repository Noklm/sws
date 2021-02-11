import * as vscode from 'vscode';
import { parse } from './packser';
import { DeviceTreeItem } from './pdsc/treeItems/deviceTreeItem';
import { IDevice, IFamily } from './pdsc/iFamily';
import { ITreeDataProvider } from '../sws/iTreeDataProvider';
import { ITreeContainer } from '../sws/iTreeItem';
import { IPeripheral } from './atdf/device/iPeripheral';
import { IModule } from './atdf/module/iModule';
import { PeripheralTreeItem } from './atdf/treeItems/peripheralTreeItem';
import { IAtdf } from './atdf/iAtdf';

export class AtdfTreeProvider implements ITreeDataProvider<vscode.TreeItem | ITreeContainer>{
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined> = new vscode.EventEmitter<vscode.TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this._onDidChangeTreeData.event;

    private _peripherals: IPeripheral[];
    private _modules: IModule[];
    constructor(peripherals: IPeripheral[], modules: IModule[]) {
        this._peripherals = peripherals;
        this._modules = modules;
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
        return this.getInitialItems();
    }

    private getInitialItems(): (vscode.TreeItem|ITreeContainer)[] {
        const items: (vscode.TreeItem | ITreeContainer)[] = new Array<vscode.TreeItem | ITreeContainer>();
        this._peripherals.forEach((peripheral: IPeripheral) => {
            const module: IModule = this._modules.find((module: IModule) => {
                return module.name === peripheral.name;
            })!;
            items.push(new PeripheralTreeItem(peripheral,module));
        });
        return items;
    }

    refresh(element?: vscode.TreeItem) {
        const config = vscode.workspace.getConfiguration("sws.config");
        const core: string = config.CORE as string;
        const self = this;
        return new Promise<boolean>(function (resolve, reject) {
            parse(`/toolchains/packs/${config.PACK}/${config.PACK_VERSION}/atdf/${core.toUpperCase()}.atdf`).then((result) => {
                const atdfRes: IAtdf = result["avr-tools-device-file"];
                self._peripherals = atdfRes.devices[0].peripherals;
                self._modules = atdfRes.modules;
                self._onDidChangeTreeData.fire(undefined);
                resolve(true);
            }).catch((error: any) => reject(error));
        });
    }
}



