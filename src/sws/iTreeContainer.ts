import * as vscode from 'vscode';

export interface ITreeContainer extends vscode.TreeItem{
    getChildren(): (vscode.TreeItem | ITreeContainer)[] 
}