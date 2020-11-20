import { window } from 'vscode';
import {
    DebugSession,
    InitializedEvent,
    StoppedEvent,
    ContinuedEvent,
    TerminatedEvent
} from 'vscode-debugadapter';
import { WebsocketDispatcher } from './websocketDispatcher';
import { DebugProtocol } from 'vscode-debugprotocol';
import { IService } from './services/iservice';
import { IDispatcher } from './idispatcher';
import { LaunchRequestArguments } from './launchRequestArguments';
import { IRunControlListener } from './services/runcontrol/irunControlListener';
import {
    IToolContext, IToolProperties,
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
    MemoryService,
    // LineNumberService,
    StreamService,
    // BreakpointsService,
    RunControlService,
    RegisterService,
    StackTraceService,
    ExpressionService
} from './services/services';
import { NumericalHashCode } from './numericalHashCode';
import { Channel } from './channel/channel';
import { ProcessLauncher } from './processLauncher';
import { ProgressReporter } from './progressReporter';

/**
 * Creates a new debug adapter that is used for one debug session.
 * We configure the default implementation of a debug adapter here.
 */
export class SwsDebugSession extends DebugSession implements IRunControlListener{

    private dispatcher?: IDispatcher;
    private channel: Channel;
    private hasher = new NumericalHashCode();

    public constructor() {
        super();
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);
        this.channel = new Channel();
    }
    contextAdded(contexts: IRunControlContext[]): void {
        // throw new Error('Method not implemented.');
    }
    contextChanged(contexts: IRunControlContext[]): void {
        // throw new Error('Method not implemented.');
    }
    /* IRunControlListener */
    public contextSuspended(contextId: string, pc: number, reason: string, state: any): void {
        this.sendEvent(new StoppedEvent(reason, this.hasher.hash(contextId), ''));
    }

    public contextResumed(contextId: string): void {
        this.sendEvent(new ContinuedEvent(this.hasher.hash(contextId)));
    }
    // public contextAdded(contexts: IRunControlContext[]): void { }
    // public contextChanged(contexts: IRunControlContext[]): void { }
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
        try {
            let processService = this.channel.getService<ProcessService>('Processes');
            processService.contexts.forEach(context => {
                processService.terminate(context.ID);
            });
        } catch (e) {
            console.error(e);
        }

        /* Tear down the tools */
        try {
            let toolService = this.channel.getService<ToolService>('Tool');
            toolService.contexts.forEach(context => {
                toolService.tearDownTool(context.ID);
            });
        } catch (e) {
            console.error(e);
        }
    }

    protected cancelRequest(response: DebugProtocol.CancelResponse, args: DebugProtocol.CancelArguments) {
        super.cancelRequest(response, args);
    }

    /**
     * Initialize the TCF channel and the WebsocketDispatcher
     * 
     * @param response 
     * @param args 
     */
    protected async launchRequest(response: DebugProtocol.LaunchResponse, args: LaunchRequestArguments) {
        let self = this;
        // Create the websocket dispatcher to communicate with atbackend
        this.dispatcher = new WebsocketDispatcher(args.atbackendHost, args.atbackendPort,
            (message: string) => {
                console.log(message);
            },
            (message: string) => {
                console.log(message);
            });
        this.dispatcher.progressHandler(new ProgressReporter());
        // Connects to AtBackend
        this.dispatcher.connect((dispatcher: IDispatcher) => {
            // Initiate the TCF channel after that websocket connection is opened
            let locator = new LocatorService(dispatcher);
            let tool = new ToolService(dispatcher);
            let device = new DeviceService(dispatcher);
            let stream = new StreamService(dispatcher);
            let runControl = new RunControlService(dispatcher);
            let processes = new ProcessService(dispatcher);
            let memory = new MemoryService(dispatcher);
            let registers = new RegisterService(dispatcher);
            let stackTrace = new StackTraceService(dispatcher);
            let expressions = new ExpressionService(dispatcher);

            // Ordre AZ
            self.channel.setLocalService(device);
            self.channel.setLocalService(expressions);
            self.channel.setLocalService(locator);
            self.channel.setLocalService(memory);
            self.channel.setLocalService(processes);
            self.channel.setLocalService(registers);
            self.channel.setLocalService(runControl);
            self.channel.setLocalService(stackTrace);
            self.channel.setLocalService(stream);
            self.channel.setLocalService(tool);


            locator.hello(self.channel.getLocalServices(), async (remoteServices: string[]) => {
                // Callback used when we receive the Hello event from atbackend
                self.channel.setRemoteServices(remoteServices);
                // runControlService.addListener(this);
                let attachedTools = await tool.getAttachedTools();
                /* Once a device has been instantiated, we need to actually launch with a module */
                device.addListener(new ProcessLauncher(args.program, processes, args));
                runControl.addListener(self);
                try {
                    self.channel.setAttachedTools(attachedTools);
                    let attachedTool = self.channel.getAttachedTool(args.tool);
                    let toolContext: IToolContext = await tool.setupTool(attachedTool);
                    await tool.connect(toolContext.ID);
                    await tool.checkFirmware(toolContext.ID);
                    let properties: IToolProperties = {
                        InterfaceName: args.interface,
                        PackPath: args.packPath,
                        DeviceName: args.device,
                        InterfaceProperties: args.interfaceProperties
                    };
                    await tool.setProperties(toolContext.ID, properties);
                    
                    
                } catch (error) {
                    window.showErrorMessage(error.message);
                    this.sendEvent(new TerminatedEvent());
                }

            });
            if (!args.noDebug) {
                stream.setLogBits(0xFFFFFFFF);
            }

        });
            
        /* Once a device has been instantiated, we need to actually launch with a module */
        // deviceService.addListener(new ProcessLauncher(args.program, processService, args));
        this.sendResponse(response);
        
    }
}