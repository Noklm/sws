import {
    DebugSession,
    InitializedEvent,
    StoppedEvent,
    ContinuedEvent
} from 'vscode-debugadapter';
import { WebsocketDispatcher } from './websocketDispatcher';
import { DebugProtocol } from 'vscode-debugprotocol';
import { IService } from './services/iservice';
import { IDispatcher } from './idispatcher';
import { LaunchRequestArguments } from './launchRequestArguments';
import { IRunControlListener } from './services/runcontrol/irunControlListener';
import {
    IToolContext,
    IProcessContext,
    // IRegisterContext,
    IRunControlContext,
} from './services/contexts';
import {
    IConnectionProperties,
    ITool
} from './services/tool/itool';
import {
    LocatorService,
    ToolService,
    DeviceService,
    ProcessService,
    // MemoryService,
    // RegisterService,
    // ExpressionService,
    // LineNumberService,
    // StackTraceService,
    StreamService,
    // BreakpointsService,
    RunControlService
} from './services/services';
import { NumericalHashCode } from './numericalHashCode';
/**
 * Creates a new debug adapter that is used for one debug session.
 * We configure the default implementation of a debug adapter here.
 */
export class SwsDebugSession extends DebugSession implements IRunControlListener{

    private dispatcher?: IDispatcher;
    private services?= new Map<string, IService>();
    private hasher = new NumericalHashCode();

    public constructor() {
        super();
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);
    }
    /* IRunControlListener */
    public contextSuspended(contextId: string, pc: number, reason: string, state: any): void {
        this.sendEvent(new StoppedEvent(reason, this.hasher.hash(contextId), ''));
    }

    public contextResumed(contextId: string): void {
        this.sendEvent(new ContinuedEvent(this.hasher.hash(contextId)));
    }
    public contextAdded(contexts: IRunControlContext[]): void { }
    public contextChanged(contexts: IRunControlContext[]): void { }
    public contextRemoved(contextIds: string[]): void { }
    public contextException(contextId: string, description: string): void { }
    public containerSuspended(contextId: string, pc: number, reason: string, state: any, contextIds: string[]): void { }
    public containerResumed(contextIds: string[]): void { }
    public contextStateChanged(contextIds: string[]): void { }

    /**
         * The 'initialize' request is the first request called by the frontend
         * to interrogate the features the debug adapter provides.
         */
    protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {

        // build and return the capabilities of this debug adapter:
        response.body = response.body || {};

        // the adapter implements the configurationDoneRequest.
        response.body.supportsConfigurationDoneRequest = true;

        // make VS Code to use 'evaluate' when hovering over source
        // response.body.supportsEvaluateForHovers = true;

        // make VS Code to show a 'step back' button
        // response.body.supportsStepBack = true;

        // make VS Code to support data breakpoints
        // response.body.supportsDataBreakpoints = true;

        // make VS Code to support completion in REPL
        // response.body.supportsCompletionsRequest = true;
        // response.body.completionTriggerCharacters = [".", "["];

        // make VS Code to send cancelRequests
        // response.body.supportsCancelRequest = true;

        // make VS Code send the breakpointLocations request
        // response.body.supportsBreakpointLocationsRequest = true;

        // make VS Code provide "Step in Target" functionality
        // response.body.supportsStepInTargetsRequest = true;

        this.sendResponse(response);

        // since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
        // we request them early by sending an 'initializeRequest' to the frontend.
        // The frontend will end the configuration sequence by calling 'configurationDone' request.
        this.sendEvent(new InitializedEvent());
    }

    /**
     * Called at the end of the configuration sequence.
     * Indicates that all breakpoints etc. have been sent to the DA and that the 'launch' can start.
     */
    protected configurationDoneRequest(response: DebugProtocol.ConfigurationDoneResponse, args: DebugProtocol.ConfigurationDoneArguments): void {
        super.configurationDoneRequest(response, args);
    }

    protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments): void {
        super.disconnectRequest(response, args);
        /* Terminate the processes */
        if (this.services?.get('Processes')) {
            let processService = <ProcessService>this.services.get('Processes');
            processService.contexts.forEach(context => {
                context.terminate();
            });
        }

        /* Tear down the tools */
        if (this.services?.get('Tools')) {
            let toolService = <ToolService>this.services.get('Tools');
            toolService.contexts.forEach(context => {
                context.tearDownTool();
            });
        }
    }

    protected cancelRequest(response: DebugProtocol.CancelResponse, args: DebugProtocol.CancelArguments) {
        super.cancelRequest(response, args);
    }

    protected launchRequest(response: DebugProtocol.LaunchResponse, args: LaunchRequestArguments) {

        this.dispatcher = new WebsocketDispatcher(args.atbackendHost, args.atbackendPort,
            (message: string) => {
                console.log(message);
            },
            (message: string) => {
                console.log(message);
            });

        this.dispatcher.connect((dispatcher: IDispatcher) => {
            let locator = new LocatorService(dispatcher);
            locator.hello(() => {
                 
                /* Need to wait for hello before we can start the show */
                let toolService = new ToolService(dispatcher);
                let deviceService = new DeviceService(dispatcher);
                let runControlService = new RunControlService(dispatcher);
                // let streamService = new StreamService(dispatcher);

                this.services?.set('Tool', toolService);
                this.services?.set('Device', deviceService);
                this.services?.set('RunControl', runControlService);
                // this.services?.set('Streams', streamService);

                runControlService.addListener(this);

                toolService.getAttachedTools().then((attachedTools: ITool[]) => {
                    attachedTools.forEach((attachedTool: ITool) => {
                        console.log(`${attachedTool.ToolType}`); 
                    });
                });

                /* Once a device has been instantiated, we need to actually launch with a module */
                // deviceService.addListener(new ProcessLauncher(args.program, processService, args));
                toolService.getSupportedToolTypes().then((supportedTools: string[]) => {
                    supportedTools.forEach(
                        (supportedTool: string) => {
                            console.log(`${supportedTool}`);
                        });
                });
                /* Ignition! TODO: need more properties for USB/IP tools */
                toolService.setupTool(args.tool, args.toolConnection, args.connectionProperties).then((tool: IToolContext) => {
                    tool.setProperties({
                        'DeviceName': args.device,
                        'PackPath': args.packPath,
                        'InterfaceName': args.interface,
                        'InterfaceProperties': args.interfaceProperties
                    }).catch((reason: Error) => {
                        throw reason;
                    });
                }).catch((reason: Error) => {

                });

            });
        });

        this.sendResponse(response);
        
    }
}