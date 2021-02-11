import * as vscode from 'vscode';

export interface ITreeDataProvider<TTreeItem extends vscode.TreeItem> extends vscode.TreeDataProvider<TTreeItem>{
    refresh(element?: TTreeItem): Promise<boolean>
    delete(element?: TTreeItem): Promise<boolean>
    add(...element:TTreeItem[]):Promise<boolean>
}