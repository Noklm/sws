import * as vscode from 'vscode';
import {
	SWSTerminalOptions
} from './sws/terminal';
import { activateSWSDebug } from './activateSWSDebug';
import { SwsConfig } from './sws/config';

// this method is called when your extension is activated
export async function activate(context: vscode.ExtensionContext) {
	
	
	const build = "sws.build";
	const clean = "sws.clean";
	const flash = "sws.flash";
	const showConfig = "sws.showConfig";
	
	activateSWSDebug(context);
	const swsConf = new SwsConfig();
	const swsConfigFiles = await vscode.workspace.findFiles(swsConf.globPattern, undefined, 1);
	if(swsConfigFiles && swsConfigFiles.length > 0){
		vscode.commands.executeCommand('setContext', 'displaySwsScripts', true);
	}
	const activateSWSTerminal = (e?: vscode.ConfigurationChangeEvent) => {
		const compiler = vscode.workspace.getConfiguration('sws');
		vscode.window.activeTerminal?.dispose();
		const options: vscode.TerminalOptions = new SWSTerminalOptions(compiler.config);
		const terminal = vscode.window.createTerminal(options);
		terminal.show();
	};
	const commandHandler = (msg: String): void => {
		vscode.window.activeTerminal?.sendText(`make -s ${msg}`);
	};
	// let test = swsConf.exists();
	vscode.workspace.onDidChangeConfiguration(
		activateSWSTerminal,
		undefined,
		context.subscriptions
	);
	activateSWSTerminal();	
	vscode.commands.registerCommand("sws.addScript", async ()=>{
		const swsScriptUris:vscode.Uri[] = await vscode.workspace.findFiles('.vscode/*.json');
		vscode.window.showInformationMessage(`${swsScriptUris}`);
		vscode.window.showInformationMessage("Script added");
	});
	vscode.commands.registerCommand(build, commandHandler);
	vscode.commands.registerCommand(clean, commandHandler);
	vscode.commands.registerCommand(flash, commandHandler);
	vscode.commands.registerCommand(showConfig, commandHandler);
}

// this method is called when your extension is deactivated
export function deactivate() {
	vscode.commands.executeCommand('setContext', 'displaySwsScripts', false);
}
