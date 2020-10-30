import * as vscode from 'vscode';
import {
	SWSTerminalOptions
} from './sws/terminal';
import { activateSWSDebug } from './activateSWSDebug';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	const build = "sws.build";
	const clean = "sws.clean";
	const flash = "sws.flash";
	const showConfig = "sws.showConfig";
	
	activateSWSDebug(context);

	const activateSWSTerminal = (e?: vscode.ConfigurationChangeEvent) => {
		const compiler = vscode.workspace.getConfiguration('sws');
		// for (let key in config.config) {
		// 	console.log(key);
		// 	console.log(`${config.get(`config.${key}`)}`);
		// }
		vscode.window.activeTerminal?.dispose();
		const options: vscode.TerminalOptions = new SWSTerminalOptions(compiler.config);
		const terminal = vscode.window.createTerminal(options);
		terminal.show();
	};
	const commandHandler = (msg: String): void => {
		vscode.window.activeTerminal?.sendText(`make -s ${msg}`);
	};
	vscode.workspace.onDidChangeConfiguration(
		activateSWSTerminal,
		undefined,
		context.subscriptions
	);
	activateSWSTerminal();

	vscode.commands.registerCommand(build, commandHandler);
	vscode.commands.registerCommand(clean, commandHandler);
	vscode.commands.registerCommand(flash, commandHandler);
	vscode.commands.registerCommand(showConfig, commandHandler);
}

// this method is called when your extension is deactivated
export function deactivate() {}
