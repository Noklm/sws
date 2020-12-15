'use strict';

import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import * as vscode from 'vscode';
import { WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken } from 'vscode';
import { SwsDebugSession } from './swsDebug';
import { WebsocketDispatcher } from './websocketDispatcher';
import { InterfaceNameType, InterfaceType } from './services/tool/iprogInterface';

class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {

    async createDebugAdapterDescriptor(_session: vscode.DebugSession): Promise<ProviderResult<vscode.DebugAdapterDescriptor>> {
        const atbackendConf = vscode.workspace.getConfiguration('sws.atbackend');
        // TODO: add possibility to user to change the atbackend port
        const atbackend: ChildProcessWithoutNullStreams = spawn('C:\\Program Files (x86)\\Atmel\\Studio\\7.0\\atbackend\\atbackend.exe', [`/websocket-port=${atbackendConf.get('port')}`]);
        // TODO: supprimer de delay de 1s et trouver un moyen de demarrer une debug sessions quand atbackend et le dispatcher sont lies
        await new Promise(resolve => setTimeout(resolve, 1000));
        const dispatcher = new WebsocketDispatcher('127.0.0.1', <number>atbackendConf.get('port'), console.log);
        
      
        return new vscode.DebugAdapterInlineImplementation(new SwsDebugSession(atbackend, dispatcher));
    }
}

class SwsConfigurationProvider implements vscode.DebugConfigurationProvider {

    /**
     * program must be entered to debug it
     * TODO: add more checks to resolve configuration
     */
    resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: SwsDebugConfiguration, token?: CancellationToken): ProviderResult<SwsDebugConfiguration> {

        if (!config.program) {
            return vscode.window.showInformationMessage("Cannot find a program to debug").then(_ => {
                return undefined;	// abort launch
            });
        }

        config.tool = `com.atmel.avrdbg.tool.${config.tool}`;


        return config;
    }
    resolveDebugConfigurationWithSubstitutedVariables?(folder: WorkspaceFolder | undefined, debugConfiguration: SwsDebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration>{
        if (!debugConfiguration.interfaceProperties) {
            switch (debugConfiguration.interface) {
                case "JTAG": {
                    debugConfiguration.interfaceProperties = {
                        KeepTimersRunning: true,
                        JtagDbgClock: debugConfiguration.interfaceClock,
                        JtagProgClock: debugConfiguration.interfaceClock
                    };

                    break;
                }
                case "UPDI": {
                    debugConfiguration.interfaceProperties = {
                        KeepTimersRunning: true,
                        UpdiClock: debugConfiguration.interfaceClock
                    };
                    break;
                }
                case "SWD": {
                    debugConfiguration.interfaceProperties = {
                        KeepTimersRunning: true,
                        SwdClock: debugConfiguration.interfaceClock
                    };
                    break;
                }
                default: {
                    return vscode.window.showInformationMessage("Cannot use this interface").then(_ => {
                        return undefined;	// abort launch
                    });
                }
            }

        }
        return debugConfiguration;
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

interface SwsDebugConfiguration extends DebugConfiguration{
    // ATBACKEND PROPERTIES
    // atbackendHost: string;
    // atbackendPort: number;

    // FILE TO DEBUG PROPERTY
    program: string;

    // TOOL PROPERTIES
    tool: string;
    // toolConnection: string;
    // connectionProperties: IConnectionProperties;

    // DEVICE PROPERTY
    device: string;

    // COMMUNICATION INTERFACE PROPERTIES
    interface: InterfaceNameType;
    interfaceProperties: InterfaceType;

    // OTHER PROPERTIES
    launchSuspended: boolean;
    launchAttached: boolean;
    cacheFlash: boolean;

    eraseRule: number; // enum
    preserveEeprom: boolean;
    ramSnippetAddress: number;
    progFlashFromRam: boolean;

    useGdb: boolean;
    gdbLocation: string;

    bootSegment: number; // enum

    packPath: string;

    remapSourcePathFrom: string;
    remapSourcePathTo: string;
}