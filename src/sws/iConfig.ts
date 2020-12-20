import * as vscode from 'vscode';
export interface IConfig{
    globPattern:vscode.GlobPattern
    create():void
    afterCreated(e:vscode.Uri):void
    afterDeleted(e:vscode.Uri):void
    changed(e:vscode.Uri):void
    exists():boolean
    isEmpty():boolean
}