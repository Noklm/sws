'use strict';

import * as vscode from 'vscode';

import { IProgressEventHandler } from './services/iservice';

export class ProgressReporter implements IProgressEventHandler {

	public progress(progression: number, max: number, text?: string): void {
		let description = text || '';
		
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Window,
			title: "SWS"
		},
			(progress, token) => {
				if (progression !== max) {
					progress.report({
						message: `${description} (${(progression / max) * 100}%)`
					});
				} else {
					progress.report({
						message: `${description} 100%`
					});
				}
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						resolve();
					}, 2000);
					
				});
			}
		);
	}
}