import * as vscode from 'vscode';
import { IScript } from './iScript';
export class ScriptsProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<Project | undefined> = new vscode.EventEmitter<Project | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Project | undefined> = this._onDidChangeTreeData.event;

    projects: Project[];

    constructor(projects: Project[]) {
        this.projects = projects;
    }
    getChildren(element?: Project): vscode.ProviderResult<vscode.TreeItem[]> {
        if (element === undefined) {
            return this.projects;
        }
        return element.scripts;
    }
    getTreeItem(element: Project): vscode.TreeItem | Thenable<vscode.TreeItem>{
        return element;
    }

    // refresh(): void {
    //     this._onDidChangeTreeData.fire();
    // } 
}
export class Project extends vscode.TreeItem{
    swingPath: string;
    scripts: Script[];

    constructor(label: string, swingPath: string, scripts: Script[]) {
        super(label, vscode.TreeItemCollapsibleState.Expanded);
        this.swingPath = swingPath;
        this.scripts = scripts;
    }

    updateScripts(scripts: Script[]) {
        this.scripts = scripts;
    }
}

export class Script extends vscode.TreeItem implements IScript{
    name: string;
    cmd: string;
    pathWhereExecute: string;
    
    constructor(name: string, cmd: string, pathWhereExecute: string) {
        super(name, vscode.TreeItemCollapsibleState.None);
        this.name = name;
        this.cmd = cmd;
        this.contextValue = 'script';
        this.pathWhereExecute = pathWhereExecute;
    }

    execute() {
        console.log(`Command ${this.name} executed`);
        let options: vscode.TerminalOptions = {};
        options.name = "swing terminal";
        options.cwd = this.pathWhereExecute;
        let terminal: vscode.Terminal = vscode.window.createTerminal(options);
        terminal.show();
        terminal.sendText(this.cmd);
    }
}