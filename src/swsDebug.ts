import {
    DebugSession,
    InitializedEvent
} from 'vscode-debugadapter';
import { DebugProtocol } from 'vscode-debugprotocol';

/**
 * Creates a new debug adapter that is used for one debug session.
 * We configure the default implementation of a debug adapter here.
 */
export class SwsDebugSession extends DebugSession{

    public constructor() {
        super();
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);
    }
    /**
         * The 'initialize' request is the first request called by the frontend
         * to interrogate the features the debug adapter provides.
         */
    protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {

        // build and return the capabilities of this debug adapter:
        response.body = response.body || {};

        // the adapter implements the configurationDoneRequest.
        // response.body.supportsConfigurationDoneRequest = true;

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

    protected launchRequest(response: DebugProtocol.LaunchResponse, args: DebugProtocol.LaunchRequestArguments) {

        this.sendResponse(response);
    }
}