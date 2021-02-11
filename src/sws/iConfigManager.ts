import * as vscode from 'vscode';
import { IConfigProvider } from './iConfigProvider';
export interface IConfigManager<TConfigProvider extends IConfigProvider> {
    globPattern: vscode.GlobPattern | string
    provider: TConfigProvider | undefined
    init(): Promise<void>
    generateView(e: vscode.Uri): void
    deleteView(e: vscode.Uri): void
}