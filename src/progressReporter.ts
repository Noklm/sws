'use strict';

import * as vscode from 'vscode';

import { IProgressEventHandler } from './services/iservice';

export class ProgressReporter implements IProgressEventHandler {

	public progress(progression: number, max: number, text?: string): void {
		let description = text || '';

		vscode.window.withProgress({
			location: vscode.ProgressLocation.Window,
			title: "Launching elf file into target"
		},
		(progress, token) => {
			return new Promise((resolve, reject) => {
				progress.report({ message: `${description} (${(progression / max) * 100}%)` });
			}
			)
			// progress.report({ message: `${description} (${(progress / max) * 100}%)` });
		})
	};

		// vscode.window.showProgress({
		// 	location: vscode.ProgressLocation.Window,
		// 	title: 'Sws'
		// }, (progress) => {
		// 	progress.report({ message: `${description} (${(progress / max) * 100}%)` });
		// });
	}
}