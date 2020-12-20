const fs = require('fs');
import * as vscode from 'vscode';
import path = require("path");
import { IConfig } from "./iConfig";

export class SwsConfig implements IConfig{
    globPattern:vscode.GlobPattern;
    watcher:vscode.FileSystemWatcher;

    constructor(){
        this.globPattern = "**/.vscode/sws.json";
        this.watcher = vscode.workspace.createFileSystemWatcher(this.globPattern);
        this.watcher.onDidCreate((e:vscode.Uri)=>{
            vscode.commands.executeCommand('setContext', 'displaySwsScripts', true);
            vscode.window.showInformationMessage("Sws config created");
        });

        this.watcher.onDidChange((e:vscode.Uri)=>{
            vscode.window.showInformationMessage("Sws config changed");
        });

        this.watcher.onDidDelete((e:vscode.Uri)=>{
            vscode.commands.executeCommand('setContext', 'displaySwsScripts', false);
            vscode.window.showErrorMessage("Sws config deleted");
        });
    }
    afterCreated(e: vscode.Uri): void {
        throw new Error('Method not implemented.');
    }
    afterDeleted(e: vscode.Uri): void {
        throw new Error('Method not implemented.');
    }
    changed(e: vscode.Uri): void {
        throw new Error('Method not implemented.');
    }

    create(): void {
        throw new Error("Method not implemented.");
    }

    exists(): boolean {
        if(vscode.workspace.workspaceFolders){
            // const configPath = path.join(vscode.workspace.workspaceFolders[0].uri.path,this.relativePath, this.name);
            return true;
        }else{
            throw new Error("No workspace.");
        }
        
    }

    isEmpty(): boolean {
        throw new Error("Method not implemented.");
    }
}