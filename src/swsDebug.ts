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
import { ProcessLauncher } from './processLauncher';
import { ProgressReporter } from './progressReporter';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { ITool } from './services/tool/itool';

/**
 * Creates a new debug adapter that is used for one debug session.
 * We configure the default implementation of a debug adapter here.
 */
export class SwsDebugSession extends DebugSession implements IRunControlListener{

    private _hasher: NumericalHashCode;

    // Entities that are used to communicate over TCF to the AVR Target
    private _dispatcher: IDispatcher;   // Client side
    private _atbackend: ChildProcessWithoutNullStreams; // AVR target side

    // TCF Services used to debug an AVR Target
    private _locator: LocatorService;
    private _processes: ProcessService;
    private _tool: ToolService;
    private _memory: MemoryService;
    private _device: DeviceService;
    private _stream: StreamService;
    private _runControl: RunControlService;
    private _registers: RegisterService;
    private _stackTrace: StackTraceService;
    private _expressions: ExpressionService;
    private _breakpoints: BreakpointsService;


    public constructor(atbackend: ChildProcessWithoutNullStreams, dispatcher:WebsocketDispatcher) {
        super();
        this._dispatcher = dispatcher;
        this._atbackend = atbackend;
        this._hasher = new NumericalHashCode();
        this._locator = new LocatorService(dispatcher);
        this._processes = new ProcessService(dispatcher);
        this._tool = new ToolService(dispatcher);
        this._memory = new MemoryService(dispatcher);
        this._device = new DeviceService(dispatcher);
        this._stream = new StreamService(dispatcher);
        this._runControl = new RunControlService(dispatcher);
        this._registers = new RegisterService(dispatcher);
        this._stackTrace = new StackTraceService(dispatcher);
        this._expressions = new ExpressionService(dispatcher);
        this._breakpoints = new BreakpointsService(dispatcher);

        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);
    }

    contextAdded(contexts: IRunControlContext[]): void {
        // throw new Error('Method not implemented.');
    }
    contextChanged(contexts: IRunControlContext[]): void {
        // throw new Error('Method not implemented.');
    }
    /* IRunControlListener */
    public contextSuspended(contextId: string, pc: number, reason: string, state: any): void {
        this.sendEvent(new StoppedEvent(reason, this._hasher.hash(contextId), ''));
    }

    public contextResumed(contextId: string): void {
        this.sendEvent(new ContinuedEvent(this._hasher.hash(contextId)));
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
        // super.disconnectRequest(response, args);

        /* Terminate the processes */
        this._processes.contexts.forEach(context => {
            this._processes.terminate(context.ID);
        });

        /* Tear down the tools */
        this._tool.contexts.forEach(context => {
            this._tool.tearDownTool(context.ID);
        });

        // Kill atbackend
        if (this._atbackend.kill()) {
            response.success = true;
        }
        this.sendResponse(response);
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

        this._dispatcher.progressHandler(new ProgressReporter('Launcher', this));
        
        // If TCF channel not opened after 1s timeout stop launching
        if (this._locator.isChannelOpened) {
            this._processes.addListener(new GotoMain(this));
            /* Once a device has been instantiated, we need to actually launch with a module */
            this._device.addListener(new ProcessLauncher(args.program, this._processes, args));
            this._runControl.addListener(this);

            // Connects with a debug tool (atmelice, nedbg, ...)
            const attachedTools: ITool[] = await (await this._tool.getAttachedTools()).filter((tool: ITool) => {
                return tool.ToolType === args.tool;
            });
            let toolContext: IToolContext;
            // TODO: Maybe to do in tool service
            if (attachedTools.length === 1) {
                toolContext = await this._tool.setupTool(attachedTools.pop()!);
            } else if (attachedTools.length === 0) {
                window.showErrorMessage(`No tool of type: ${args.tool}`);
                this.sendEvent(new TerminatedEvent());
                return;
            } else {
                window.showErrorMessage(`${attachedTools.length} tools of type ${args.tool}`);
                this.sendEvent(new TerminatedEvent());
                return;
            }

            await this._tool.connect(toolContext.ID);
            await this._tool.checkFirmware(toolContext.ID);
            let properties: IToolProperties = {
                InterfaceName: args.interface,
                PackPath: args.packPath,
                DeviceName: args.device,
                InterfaceProperties: args.interfaceProperties
            };
            await this._tool.setProperties(toolContext.ID, properties);

            if (!args.noDebug) {
                this._stream.setLogBits(0xFFFFFFFF);
            }

            /* Once a device has been instantiated, we need to actually launch with a module */
            this._device.addListener(new ProcessLauncher(args.program, this._processes, args));
            this.sendResponse(response);
            return;
        }
        window.showErrorMessage(`TCF channel not opened`);
        this.sendEvent(new TerminatedEvent());
        
    }
    private activeBreakpointIds = new Array<string>();
    /* TODO: this is called once PER SOURCE FILE. Need to extend acitveBreakpoints etc */
    protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): void {

        let self = this;
        response.body = {
            breakpoints: []
        };
        this._processes.contexts.forEach((context) => {
            self._breakpoints.remove(this.activeBreakpointIds);
            this.activeBreakpointIds = [];
            let breakpointsToProcess: number = args.breakpoints!.length;
            args.breakpoints?.forEach((breakpointArgs) => {
                let breakpointId = self._breakpoints.getNextBreakpointId();
                
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
                self._breakpoints.add(breakpoint).then(_ => {
                    self._breakpoints.getProperties(breakpointId).then((breakpoint) => {
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
        response.body = {
            threads: []
        };

        this._processes.contexts.forEach(context => {
            response.body.threads.push(
                new Thread(this._hasher.hash(context.RunControlId), context.Name));
        });

        this.sendResponse(response);
    }

    /* Stack frames are organized as children of a process (violates our thread assumptions) */
    protected async stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments, request?: DebugProtocol.Request) {
        let self = this;

        response.body = {
            stackFrames: [],
            totalFrames: 0
        };
        let frames: IStackTraceContext[];
        this._processes.contexts.forEach(async (context, key) => {
            frames = await self._stackTrace.getChildren(context.ID);
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
                    new StackFrame(this._hasher.hash(frame.ID), frameName, source, frame.Line));
            });
            this.sendResponse(response);
        });
    }

    /* Scopes describes a collection of variables */
    protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {
        let self = this;
        response.body = {
            scopes: []
        };
        let frames: IStackTraceContext[];
        this._processes.contexts.forEach(async (context,parentId) => {

            frames = await self._stackTrace.getChildren(parentId);
            if (frames.length > 0) {
                response.body.scopes.push(new Scope('Local', this._hasher.hash(frames.shift()!.ID)));
                frames.forEach((frame) => {
                    response.body.scopes.push(new Scope(frame.Func, this._hasher.hash(frame.ID), false));
                });
            }
            
            /* Push the registers scope */
            response.body.scopes.push(new Scope('Registers', this._hasher.hash('Registers'), false));

            this.sendResponse(response);
        });
    }

    /* Evaluate using the expression evaluator */
    protected evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments): void {
        let self = this;

        let stackTraceContextId = this._hasher.retrieve(args.frameId!);

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
                self._stackTrace.getContext(<string>stackTraceContextId).then(context => {
                    self._expressions.compute(context, 'C', args.expression).then((expression) => {
                        response.body.result = expression.Val.trim();
                        response.body.type = expression.Type;

                        self._expressions.dispose(expression.ID);

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
        let self = this;
        response.body = {
            variables: []
        };

        if (args.variablesReference === this._hasher.hash('Registers')) {
            let value: string;
            for (let [id, context] of this._registers.contexts) {
                value = await this._registers.get(id);
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
            let frames: IStackTraceContext[];
            self._processes.contexts.forEach(async (context, parentId) => {

                frames = await self._stackTrace.getChildren(parentId);
                let scopeId: string = <string>this._hasher.retrieve(args.variablesReference);
                let frame = frames.find((frame) => {
                    return scopeId === frame.ID;
                });

                if (frame) {
                    /* Get expressions for the frame */
                    let children = await self._expressions.getChildren(frame.ID);
                    let childrenToEvaluate = children.length;

                    if (childrenToEvaluate === 0) {
                        this.sendResponse(response);
                    }

                    children.forEach(expression => {
                        self._expressions.getContext(expression.ID).then(async (expression) => {
                            let variable: any = new Variable(expression.Expression, expression.Val.trim());
                            variable.type = expression.Type;

                            if (expression.Numchildren !== 0) {
                                variable.variablesReference = this._hasher.hash(expression.ID);
                            } else {
                                self._expressions.dispose(expression.ID);
                            }
                            /* Build the variable from the expression*/
                            response.body.variables.push(variable);


                            if (--childrenToEvaluate === 0) {
                                this.sendResponse(response);
                            }
                        }).catch((error: Error) => console.log(error.message));
                    });
                } else {
                    let struct = await self._expressions.getContext(scopeId);
                    let fields = await self._expressions.getChildrenRange(scopeId, struct.Numchildren);
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
         this._runControl.contexts.forEach((context,id) => {
            if (!threadID || threadID === this._hasher.hash(context.ID)) {
                this._runControl.resume(id, mode).catch((error: Error) => console.log(error.message));
            }
        });
    }

    private suspend(threadID?: number): void {
        this._runControl.contexts.forEach((context,id) => {
            if (threadID === this._hasher.hash(context.ID) || threadID === 0) {
                this._runControl.suspend(id).catch((error: Error) => console.log(error.message));
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
        let runControlContext: IRunControlContext | undefined;
        this._processes.contexts.forEach((processContext) => {
            runControlContext = this._runControl.contexts.get(processContext.RunControlId);
            this._stackTrace.getChildren(processContext.ID).then(async (children) => {
            /* Find address of function identifier */
                let child = children.shift();
                if (child) {
                    let expressionContext = await this._expressions.compute(child, 'C', `${func}`);

                    /* Convert address to number */
                    let address = parseInt(expressionContext.Val.replace('0x', ''), 16);
                    this._expressions.dispose(expressionContext.ID);

                    /* Goto address */
                    if (runControlContext) {
                        this._runControl.resume(runControlContext.ID, ResumeMode.Goto, address);
                    }
                } 
            }).catch((error: Error) => console.log(error.message));
        });
    }
}