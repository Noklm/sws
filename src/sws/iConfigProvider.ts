import * as vscode from 'vscode';
export interface IConfigProvider extends vscode.TreeDataProvider<vscode.TreeItem>{
    refresh(): void;
}