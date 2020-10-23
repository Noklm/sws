import * as vscode from 'vscode';
import {
	TerminalOptions
} from 'vscode';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	const build = "sws.build";
	const clean = "sws.clean";
	const flash = "sws.flash";
	const showConfig = "sws.showConfig";
	
	const showConfigHandler = (): void => {
		const config = vscode.workspace.getConfiguration('sws');
		vscode.window.showInformationMessage(
			`Target: ${config.get('config.target')}`
		);
	};
	const commandHandler = (msg: String): void => {
		const config = vscode.workspace.getConfiguration('sws');
		let options: TerminalOptions = {};
		options.name = "sws terminal";
		options.env = {
				'TARGET': `${config.get('config.target')}`,
				'F_CPU': `${config.get("config.frequency")}`
			};
		vscode.window.createTerminal(options);
		vscode.window.activeTerminal?.sendText(`make -s ${msg} TARGET=${config.get('config.target')}`);
	};

	let dispoBuild = vscode.commands.registerCommand(build, commandHandler);
	let dispoClean = vscode.commands.registerCommand(clean, commandHandler);
	let dispoFlash = vscode.commands.registerCommand(flash, commandHandler);
	let dispoShowConfig = vscode.commands.registerCommand(showConfig, showConfigHandler);

	context.subscriptions.push(dispoBuild);
	context.subscriptions.push(dispoClean);
	context.subscriptions.push(dispoFlash);
	context.subscriptions.push(dispoShowConfig);
}

// this method is called when your extension is deactivated
export function deactivate() {}
