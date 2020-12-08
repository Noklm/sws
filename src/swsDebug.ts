const path = require('path');
import { window } from 'vscode';
import {
    DebugSession,
    InitializedEvent,
    StoppedEvent,
    ContinuedEvent,
    TerminatedEvent,
    Thread,
    StackFrame,
    Source,
    Scope,
    Variable,
    Breakpoint
} from 'vscode-debugadapter';
import { WebsocketDispatcher } from './websocketDispatcher';
import { DebugProtocol } from 'vscode-debugprotocol';
import { IService } from './services/iservice';
import { IDispatcher } from './idispatcher';
import { LaunchRequestArguments } from './launchRequestArguments';
import { IRunControlListener } from './services/runcontrol/irunControlListener';
import { GotoMain } from './gotoMain';
import {
    IToolContext, IToolProperties,
    IRunControlContext,
    IStackTraceContext,
} from './services/contexts';
import { ResumeMode } from './services/runcontrol/resumeMode';
import {
    LocatorService,
    ToolService,
    DeviceService,
    ProcessService,
    MemoryService,
    // LineNumberService,
    StreamService,
    BreakpointsService,
    RunControlService,
    RegisterService,
    StackTraceService,
    ExpressionService
} from './services/services';
import { AccessMode } from './services/breakpoint/accessMode';
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
        args.supportsProgressReporting = true;
        args.supportsVariableType = true;

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
        response.body.supportsStepInTargetsRequest = true;

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
        this.dispatcher.progressHandler(new ProgressReporter('Launcher',this));
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
            let breakpoints = new BreakpointsService(dispatcher);

            // Ordre AZ
            self.channel.setLocalService(breakpoints);
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
                processes.addListener(new GotoMain(self));
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
    private activeBreakpointIds = new Array<string>();
    /* TODO: this is called once PER SOURCE FILE. Need to extend acitveBreakpoints etc */
    protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): void {
        let processService = <ProcessService>this.channel.getService('Processes');
        let breakpointsService = <BreakpointsService>this.channel.getService('Breakpoints');

        response.body = {
            breakpoints: []
        };
        processService.contexts.forEach((context) => {
            breakpointsService.remove(this.activeBreakpointIds);
            this.activeBreakpointIds = [];
            let breakpointsToProcess: number = args.breakpoints!.length;
            args.breakpoints?.forEach((breakpointArgs) => {
                let breakpointId = breakpointsService.getNextBreakpointId();
                
                let breakpoint: { [k: string]: any } = {
                    'ContextIds': [context.ID],
                    'AccessMode': AccessMode.Execute,
                    'ID': breakpointId,
                    'Enabled': true,
                    'IgnoreCount': 1,
                    'IgnoreType': 'always',
                    'Line': breakpointArgs.line,
                    'Column': breakpointArgs.column ?? 0 // Column = breakpointArgs.column if not undefined else 0
                };
                breakpoint['File'] = args.source.path ?? args.source.sourceReference;
                if (breakpointArgs.condition) {
                    breakpoint['Condition'] = breakpointArgs.condition;
                    breakpoint['Istrue'] = true;
                }
                breakpointsService.add(breakpoint).then((report) => {
                    breakpointsService.getProperties(breakpointId).then((breakpoint) => {
                        let bp = new Breakpoint(breakpoint.Enabled, breakpoint.Line, breakpoint.Column);

                        response.body.breakpoints.push(bp);
                        this.activeBreakpointIds.push(breakpointId);

                        /* Since we need to bind all the requested breakpoints before responding, wait until the last is bound */
                        if (--breakpointsToProcess === 0) {
                            this.sendResponse(response);
                        }
                    }).catch((error: Error) => console.log(error.message));
                }).catch((error: Error) => console.log(error.message));
            });
        });

        
    }

    protected threadsRequest(response: DebugProtocol.ThreadsResponse, request?: DebugProtocol.Request): void {
        let processService = <ProcessService>this.channel.getService('Processes');

        // runtime supports no threads so just return a default thread.
        response.body = {
            threads: []
        };

        processService.contexts.forEach(context => {
            response.body.threads.push(
                new Thread(this.hasher.hash(context.RunControlId), context.Name));
        });

        this.sendResponse(response);
    }

    /* Stack frames are organized as children of a process (violates our thread assumptions) */
    protected async stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments, request?: DebugProtocol.Request) {
        let stackTraceService = <StackTraceService>this.channel.getService('StackTrace');
        let processService = <ProcessService>this.channel.getService('Processes');
        // let runcontrolContextID = <string>this.hasher.retrieve(args.threadId);
        response.body = {
            stackFrames: [],
            totalFrames: 0
        };
        let frames: IStackTraceContext[];
        processService.contexts.forEach(async (context, key) => {
            frames = await stackTraceService.getChildren(context.ID);
            frames.forEach((frame) => {
                let frameArgs: string[] = [];

                /* Sort frames based on the Order (depth in the stack) */
                let sortedArgs = frame.Args.sort((a, b) => {
                    return a.Order - b.Order;
                });

                /* Create list of all arguments to the function frame */
                sortedArgs.forEach(frameArg => {
                    frameArgs.push(
                        `${frameArg.Type.trim()} ${frameArg.Name.trim()} = ${frameArg.Value.trim()}`
                    );
                });

                /* Create frame name based on function and arguments */
                let frameName = `${frame.Func.trim()} (${frameArgs.join(', ')})`;

                /* Create the source */
                let remappedFile = path.normalize(frame.File.trim());
                console.log(`[SRC] ${frame.File} => ${remappedFile}`);

                let source = new Source(path.basename(remappedFile),
                    this.convertDebuggerPathToClient(remappedFile),
                    0 /* 0 == Do not use source request to get content */
                    // this.hashString(frame.File.trim()),
                    // this.convertDebuggerPathToClient(remappedFile),
                    // this.convertDebuggerPathToClient(remappedFile)
                );
                console.log(`[SOURCE] ${source.path} => ${source.name}`);

                /* Push the frame */
                response.body.stackFrames.push(
                    new StackFrame(this.hasher.hash(frame.ID), frameName, source, frame.Line));
            });
            this.sendResponse(response);
        });
    }

    /* Scopes describes a collection of variables */
    protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {
        let stackTraceService = <StackTraceService>this.channel.getService('StackTrace');
        let processService = <ProcessService>this.channel.getService('Processes');

        response.body = {
            scopes: []
        };
        let frames: IStackTraceContext[];
        processService.contexts.forEach(async (context,parentId) => {

            frames = await stackTraceService.getChildren(parentId);
            if (frames.length > 0) {
                response.body.scopes.push(new Scope('Local', this.hasher.hash(frames.shift()!.ID)));
                frames.forEach((frame) => {
                    response.body.scopes.push(new Scope(frame.Func, this.hasher.hash(frame.ID), false));
                });
            }
            
            /* Push the registers scope */
            response.body.scopes.push(new Scope('Registers', this.hasher.hash('Registers'), false));

            this.sendResponse(response);
        });
    }

    /* Evaluate using the expression evaluator */
    protected evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments): void {
        let expressionsService = <ExpressionService>this.channel.getService('Expressions');
        let stackTraceService = <StackTraceService>this.channel.getService('StackTrace');

        let stackTraceContextId = this.hasher.retrieve(args.frameId!);

        response.body = {
            result: '',
            type: '',
            variablesReference: 0,
            namedVariables: 0,
            indexedVariables: 0
        };

        switch (args.context) {
            case 'watch':
            case 'hover':
            case 'repl':
            default:
                stackTraceService.getContext(<string>stackTraceContextId).then(context => {
                    expressionsService.compute(context, 'C', args.expression).then((expression) => {
                        response.body.result = expression.Val.trim();
                        response.body.type = expression.Type;

                        expressionsService.dispose(expression.ID);

                        this.sendResponse(response);
                    }).catch((error: Error) => {
                        console.log(error.message);
                        response.body.result = error.message;
                        response.body.type = 'Error';

                        this.sendResponse(response);
                    });
                });
        }
    }

    /* Variables belong to a scope (which is created above) */
    protected async variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments) {

        response.body = {
            variables: []
        };

        if (args.variablesReference === this.hasher.hash('Registers')) {
            let registerService = <RegisterService>this.channel.getService('Registers');
            let value: string;
            for (let [id, context] of registerService.contexts) {
                value = await registerService.get(id);
                let buffer = Buffer.from(JSON.parse(value), 'base64');
                let valueString = `0x${buffer.readUIntBE(0, context.Size).toString(16)}`;
                if (context.Name === 'CYCLE_COUNTER') {
                    valueString = `${buffer.readUIntBE(0, context.Size)}`;
                }
                response.body.variables.push(
                    new Variable(context.Name, valueString)
                );
                
            };
            this.sendResponse(response);
        }
        else{
            let stackTraceService = <StackTraceService>this.channel.getService('StackTrace');
            let processService = <ProcessService>this.channel.getService('Processes');
            let expressionService = <ExpressionService>this.channel.getService('Expressions');

            let frames: IStackTraceContext[];
            processService.contexts.forEach(async (context, parentId) => {

                frames = await stackTraceService.getChildren(parentId);
                let scopeId: string = <string>this.hasher.retrieve(args.variablesReference);
                let frame = frames.find((frame) => {
                    return scopeId === frame.ID;
                });

                if (frame) {
                    /* Get expressions for the frame */
                    let children = await expressionService.getChildren(frame.ID);
                    let childrenToEvaluate = children.length;

                    if (childrenToEvaluate === 0) {
                        this.sendResponse(response);
                    }

                    children.forEach(expression => {
                        expressionService.getContext(expression.ID).then(async (expression) => {
                            let variable: any = new Variable(expression.Expression, expression.Val.trim());
                            variable.type = expression.Type;

                            if (expression.Numchildren !== 0) {
                                variable.variablesReference = this.hasher.hash(expression.ID);
                            } else {
                                expressionService.dispose(expression.ID);
                            }
                            /* Build the variable from the expression*/
                            response.body.variables.push(variable);


                            if (--childrenToEvaluate === 0) {
                                this.sendResponse(response);
                            }
                        }).catch((error: Error) => console.log(error.message));
                    });
                } else {
                    let struct = await expressionService.getContext(scopeId);
                    let fields = await expressionService.getChildrenRange(scopeId, struct.Numchildren);
                    fields.forEach((field) => {
                        response.body.variables.push(
                            new Variable(field.Expression, field.Val)
                        );
                    });
                    this.sendResponse(response);
                }
            });            
        }
    }
    
    /* Resume is any form of resume */
    private resume(mode: ResumeMode, threadID?: number): void {
        let runControlService = <RunControlService>this.channel.getService('RunControl');

        runControlService.contexts.forEach((context,id) => {
            if (!threadID || threadID === this.hasher.hash(context.ID)) {
                runControlService.resume(id, mode).catch((error: Error) => console.log(error.message));
            }
        });
    }

    private suspend(threadID?: number): void {
        let runControlService = <RunControlService>this.channel.getService('RunControl');

        runControlService.contexts.forEach((context,id) => {
            if (threadID === this.hasher.hash(context.ID) || threadID === 0) {
                runControlService.suspend(id).catch((error: Error) => console.log(error.message));
            }
        });
    }

    protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments): void {
        this.sendResponse(response);
        this.resume(ResumeMode.Resume, args.threadId);
    }

    protected nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): void {
        this.sendResponse(response);
        this.resume(ResumeMode.StepOverLine, args.threadId);
    }

    protected stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments): void {
        this.sendResponse(response);
        this.resume(ResumeMode.StepIntoLine, args.threadId);
    }

    protected stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments): void {
        this.sendResponse(response);
        this.resume(ResumeMode.StepOut, args.threadId);
    }

    protected pauseRequest(response: DebugProtocol.PauseResponse, args: DebugProtocol.PauseArguments): void {
        this.sendResponse(response);
        this.suspend(args.threadId);
    }
    /* TODO, use goto from vscode-debugadapter */
    public goto(func: string): void {
        let expressionsService = <ExpressionService>this.channel.getService('Expressions');
        let runControlService = <RunControlService>this.channel.getService('RunControl');
        let stackTraceService = <StackTraceService>this.channel.getService('StackTrace');
        let processService = <ProcessService>this.channel.getService('Processes');

        let runControlContext: IRunControlContext | undefined;
        processService.contexts.forEach((processContext) => {
            runControlContext = runControlService.contexts.get(processContext.RunControlId);
            stackTraceService.getChildren(processContext.ID).then(async (children) => {
            /* Find address of function identifier */
                let child = children.shift();
                if (child) {
                    let expressionContext = await expressionsService.compute(child, 'C', `${func}`);

                    /* Convert address to number */
                    let address = parseInt(expressionContext.Val.replace('0x', ''), 16);
                    expressionsService.dispose(expressionContext.ID);

                    /* Goto address */
                    if (runControlContext) {
                        runControlService.resume(runControlContext.ID, ResumeMode.Goto, address);
                    }
                } 
            }).catch((error: Error) => console.log(error.message));
        });
    }
}