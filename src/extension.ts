import * as vscode from 'vscode';
const fs = require('fs');
import {
	SWSTerminalOptions
} from './sws/terminal';
import { activateSWSDebug } from './activateSWSDebug';
import { SwsConfigManager } from './sws/configManager';
import { IConfigProvider } from './sws/iConfigProvider';
import { IConfigManager } from './sws/IConfigManager';
import { IScript } from './sws/iScript';

// this method is called when your extension is activated
export async function activate(context: vscode.ExtensionContext) {
	const build = "sws.build";
	const clean = "sws.clean";
	const flash = "sws.flash";
	const showConfig = "sws.showConfig";
	
	activateSWSDebug(context);
	const commandHandler = (msg: String): void => {
		vscode.window.activeTerminal?.sendText(`make -s ${msg}`);
	};

	vscode.commands.registerCommand('sws.refreshScripts', (provider: IConfigProvider) => {
		provider.refresh();
	});

	vscode.commands.registerCommand('sws.execute', (contextItem: IScript) => {
		contextItem.execute();

	});

	vscode.commands.registerCommand(build, commandHandler);
	vscode.commands.registerCommand(clean, commandHandler);
	vscode.commands.registerCommand(flash, commandHandler);
	vscode.commands.registerCommand(showConfig, commandHandler);
	
	const swsConfManager:IConfigManager<IConfigProvider> = new SwsConfigManager("**/.vscode/sws.json");
	await swsConfManager.init();

	const activateSWSTerminal = (e?: vscode.ConfigurationChangeEvent) => {
		const compiler = vscode.workspace.getConfiguration('sws');
		vscode.window.activeTerminal?.dispose();
		const options: vscode.TerminalOptions = new SWSTerminalOptions(compiler.config);
		const terminal = vscode.window.createTerminal(options);
		terminal.show();
	};

	vscode.workspace.onDidChangeConfiguration(
		activateSWSTerminal,
		undefined,
		context.subscriptions
	);

	activateSWSTerminal();
}

// this method is called when your extension is deactivated
export function deactivate() {
	vscode.commands.executeCommand('setContext', 'displaySwsScripts', false);
}
