'use strict';

import * as vscode from 'vscode';
import { WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken } from 'vscode';
import { SwsDebugSession } from './swsDebug';

class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {

    createDebugAdapterDescriptor(_session: vscode.DebugSession): ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new SwsDebugSession());
    }
}

class SwsConfigurationProvider implements vscode.DebugConfigurationProvider {

    /**
     * program must be entered to debug it
     * TODO: add more checks to resolve configuration
     */
    resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {

        if (!config.program) {
            return vscode.window.showInformationMessage("Cannot find a program to debug").then(_ => {
                return undefined;	// abort launch
            });
        }

        return config;
    }
}

export function activateSWSDebug(context: vscode.ExtensionContext, factory?: vscode.DebugAdapterDescriptorFactory) {
    // register a configuration provider for 'sws' debug type
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('sws', new SwsConfigurationProvider()));

    if (!factory) {
        factory = new InlineDebugAdapterFactory();
    }
    context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('sws', factory));
    if ('dispose' in factory) {
        context.subscriptions.push(factory);
    }

}