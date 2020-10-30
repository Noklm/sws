'use strict';

import * as vscode from 'vscode';
import { ProviderResult } from 'vscode';
import { SwsDebugSession } from './swsDebug';

class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {

    createDebugAdapterDescriptor(_session: vscode.DebugSession): ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new SwsDebugSession());
    }
}

export function activateSWSDebug(context: vscode.ExtensionContext, factory?: vscode.DebugAdapterDescriptorFactory) {
    if (!factory) {
        factory = new InlineDebugAdapterFactory();
    }
    context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('sws', factory));
    if ('dispose' in factory) {
        context.subscriptions.push(factory);
    }

}