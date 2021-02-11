import * as vscode from 'vscode';
import { IConfigManager } from './IConfigManager';
import { Project, Script, ScriptsProvider } from './configProviders';

export class SwsConfigManager implements IConfigManager<ScriptsProvider> {
    globPattern: vscode.GlobPattern | string;
    watcher: vscode.FileSystemWatcher;
    provider: ScriptsProvider | undefined;
    projects: Map<string, Project>;

    constructor(globPattern: vscode.GlobPattern) {
        this.globPattern = globPattern;
        this.watcher = vscode.workspace.createFileSystemWatcher(globPattern);
        this.provider = undefined;
        this.watcher.onDidCreate(this.generateView);
        this.watcher.onDidChange(this.generateView);
        this.projects = new Map<string, Project>();
        this.watcher.onDidDelete(this.deleteView);
    }

    public async init(): Promise<void> {
        const swsConfigFiles: vscode.Uri[] = await vscode.workspace.findFiles(this.globPattern);
        return new Promise((resolve, reject) => {
            if (swsConfigFiles && swsConfigFiles.length > 0) {
                for (let configUri of swsConfigFiles) {
                    this.generateView(configUri);
                    resolve();
                }
            } else {
                reject();
            }
        });
    }

    generateView = (e: vscode.Uri) => {
        let scripts = new Array<Script>();
        try {
            delete require.cache[e.fsPath];
            const rawScripts: { [cmd: string]: string } = <{ [cmd: string]: string }>require(e.fsPath).scripts;
            for (let script in rawScripts) {
                scripts.push(new Script(script, rawScripts[script]));
            }
        } catch (error) {
            vscode.window.showErrorMessage(`No scripts available in ${e.fsPath}`, ...["Generate"]).then((value) => {
                if (value === "Generate") {
                    vscode.commands.executeCommand('editor.action.triggerSuggest');
                }
            });
        }
        this.projects.set(e.fsPath, new Project(e.fsPath, scripts));
        if (this.provider) {
            this.provider.projects = Array.from(this.projects.values());
            vscode.commands.executeCommand('sws.refreshScripts', this.provider);

        } else {
            this.provider = new ScriptsProvider(Array.from(this.projects.values()));
            vscode.window.registerTreeDataProvider('swsScripts', this.provider);
        }
        vscode.commands.executeCommand('setContext', 'displaySwsScripts', true);
    };

    deleteView = (e: vscode.Uri) => {
        this.projects.delete(e.fsPath);
        this.provider!.projects = Array.from(this.projects.values());
        vscode.commands.executeCommand('sws.refreshScripts', this.provider);
    };
}