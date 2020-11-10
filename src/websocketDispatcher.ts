'use strict';

import * as WebSocket from 'ws';
import { IDispatcher } from './IDispatcher';
import { IEventHandler, IProgressEventHandler, ICongestionHandler } from './services/iservice';


/**
 * The WebsocketDispatcher class is used to send and handle all event, response, commands, ...
 * from a remote websocket server.
 * All is dispatch to handlers (TCF Services) to be handle
 */
export class WebsocketDispatcher implements IDispatcher {

	private ws?: WebSocket;

	private host: string;
	private port: number;

	private sendToken: number;

	private nil: string = '\x00';
	private eom: string = '\x03\x01';

	private pendingHandlers = new Map<number, any[]>();
	private eventHandlers = new Map<string, IEventHandler>();
	private progressHandlers = new Array<IProgressEventHandler>();
	private congestionHandlers = new Array<ICongestionHandler>();

	private logger?: (message: string) => void;
	private debugLogger?: (message: string) => void;

	public constructor(host: string, port: number, logger?: (message: string) => void, debugLogger?: (message: string) => void) {
		this.sendToken = 1;
		this.host = host;
		this.port = port;

		if (logger) {
			this.logger = logger;
		}
		if (debugLogger) {
			this.debugLogger = debugLogger;
		}
	}

	public log(data: string): void {
		if (this.logger) {
			this.logger(`${data}\n\r`);
		}
		else {
			console.error(`${data}\n\r`);
		}
	}

	public debug(data: string): void {
		if (this.debugLogger) {
			this.debugLogger(`${data}\n\r`);
		}
	}
	/**
	 * Create a websocket client and connect it to the server via his host and port
	 * 
	 * @param callback calls when 'open' event is triggered
	 */
	public connect(callback: (dispatcher: IDispatcher) => void): void {
		let url = 'ws://' + this.host + ':' + this.port;
		this.log(`[Dispatcher] Connect to: ${url}`);

		this.ws = new WebSocket(url);

		this.ws.on('error', (error) => {
			this.log(`[Dispatcher] WS:error: ${error}`);
			throw error;
		});

		this.ws.on('close', (code, message) => {
			this.log(`[Dispatcher] WS:close: ${code} => ${message}`);
		});

		this.ws.on('message', (data: string, flags: { binary: boolean }) => {
			this.handleMessage(data);
		});

		this.ws.on('open', () => {
			callback(this);
		});

	}
	/**
	 * Displays nil (null string) (\u0000) and eom (end of message) (\u0003\u0001) values in a string message
	 * 
	 * @param str string to escape nil
	 */
	public escapeNil(str: string): string {
		let self = this;
		let ret = '';

		for (let i = 0; i < str.length; ++i) {
			if (str.charAt(i) === self.nil) {
				ret += (' <nil> ');
			}
			else if (str.charAt(i) === '\x03') {
				ret += ('<');
			}
			else if (str.charAt(i) === '\x01') {
				ret += ('>');
			}
			else {
				ret += str.charAt(i);
			}
		}
		return ret;
	}
	/**
	 * Register an event handler by his service name
	 * 
	 * @param service name of the TCF service 
	 * @param handler TCF Service class that implements IEventHandler
	 */
	public eventHandler(service: string, handler: IEventHandler): void {
		this.log(`[Dispatcher] Registering event handler for ${service}`);
		this.eventHandlers.set(service, handler);
	}

	/**
	 * Register a progress handler
	 *
	 * @param handler TCF Service class that implements IProgressEventHandler
	 */
	public progressHandler(handler: IProgressEventHandler): void {
		this.progressHandlers.push(handler);
	}
	/**
	 * Register a congestion handler
	 *
	 * @param handler TCF Service class that implements ICongestionHandler
	 */
	public congestionHandler(handler: ICongestionHandler): void {
		this.congestionHandlers.push(handler);
	}

	/**
	 * Sends message over websocket
	 * 
	 * @param message message to send
	 */
	private sendMessage(message: string): void {
		this.debug(`>> ${this.escapeNil(message)}`);

		if (this.ws) {
			this.ws.send(message);
		}
		
	}

	/**
	 * Sends TCF command over websocket
	 * 
	 * @param serviceName TCF Service
	 * @param commandName TCF command related to the service
	 * @param args arguments for the command
	 */
	public sendCommand(serviceName: string, commandName: string, args: any[]): Promise<string> {
		let self = this;
		let token = this.sendToken++;

		return new Promise(function(resolve, reject) {
			self.pendingHandlers.set(token, [resolve, reject]);

			self.sendMessage(`C${self.nil}${token}${self.nil}${serviceName}${self.nil}${commandName}${self.nil}${self.stringify(args)}${self.eom}`);
		});
	}

	/**
	 * Sends TCF event over websocket
	 * 
	 * @param serviceName TCF Service
	 * @param eventName TCF event related to the service
	 * @param args arguments for the event
	 */
	public sendEvent(serviceName: string, eventName: string, args: any[]): void {
		let self = this;
		this.sendMessage(`E${self.nil}${serviceName}${self.nil}${eventName}${self.nil}${self.stringify(args)}${self.eom}`);
	}
	/**
	 * Stringify objects to be send over websocket
	 * 
	 * @param args Objects to stringify
	 */
	private stringify(args: any[]): string {
		let self = this;
		let str = '';

		str = args.map( (arg) => {
			return JSON.stringify(arg) + self.nil;
		}).join('');

		return str;
	}

	
	private unstringify(data: string): any {
		return JSON.parse(data);;
	}

	/**
	 * Handles TCF message
	 * 
	 * @param data TCF message
	 * 
	 * Command
	 *   C • <token> • <service> • <command> • <arguments> • <eom>
	 * Progress
	 *   P • <token> • <progress_data> • <eom>
	 * Result
	 *   R • <token> • <result_data> • <eom>
	 * Event
	 *   E • <service> • <event> • <event_data> • <eom>
	 * Flow
	 *   F • <traffic_congestion_level> • <eom>
	 * 
	 * • = nil
	 * <eom> = eom
	 */
	private handleMessage(data: string): void {
		let self = this;

		this.debug(`<< ${self.escapeNil(data)}`);

		let elements = data.split(self.nil);

		if (elements.length < 3) {
			throw new Error(`Message has too few parts`);
		}
		if (elements.pop() !== self.eom) {
			throw new Error(`Message has bad termination`);
		}

		// first element of TCF message give the type of the TCF message
		let tcfMessageType = elements.shift();

		switch (tcfMessageType) {
			case 'E':
				self.decodeEvent(elements);
				break;
			case 'P':
				self.decodeIntermediateResult(elements);
				break;
			case 'R':
				self.decodeFinalResult(elements);
				break;
			case 'N':
				self.decodeUnknown(elements);
				break;
			case 'F':
				self.decodeFlowControl(elements);
				break;
			default:
				self.log(`Unkown TCF message type: ${tcfMessageType}`);
				break;
		}
	}
	/**
	 * Decodes TCF event message
	 * 
	 * @param data [<service>, <event>, <event_data>]
	 */
	private decodeEvent(data: string[]): void {
		let serviceName = data.shift() as string;
		let eventName = data.shift() as string;
		let eventData = data;

		this.handleEvent(serviceName, eventName, eventData);
	}

	/**
	 * Decodes intermediate result from a progress message
	 * 
	 * @param data [<token>, <progress_data>]
	 */
	private decodeIntermediateResult(data: string[]): void {
		let token = +data[0];
		let eventData = JSON.parse(data[1]);

		this.progressHandlers.forEach(handler => {
			handler.progress(+eventData['ProgressComplete'], +eventData['ProgressTotal'], eventData['Description']);
		});

		this.log(`[Dispatcher] Progress: ${eventData}`);
	}

	/**
	 * Decodes a response to a command message
	 * 
	 * @param data [<token>, <error_code>, <result_data>]
	 */
	private decodeFinalResult(data: string[]): void {
		let token = +data[0];
		let errorReport = data[1];
		let resultData = data[2];

		this.handleResponse(token, errorReport, resultData);
	}

	/**
	 * Decodes unknown TCF message
	 * 
	 * @param data unknown data 
	 */
	private decodeUnknown(data: string[]): void {
		this.log(`[Dispatcher] Unknown: ${data}`);
	}

	/**
	 * Decodes Flow TCF message
	 * 
	 * @param data [<traffic_congestion_level>]
	 */
	private decodeFlowControl(data: string[]): void {
		let congestion = +(data.shift() as string);

		this.congestionHandlers.forEach(handler => {
			handler.congestion(congestion);
		});

		this.log(`[Dispatcher] Congestion: ${congestion}`);

	}
	/**
	 * Handles a TCF event
	 * 
	 * @param serviceName TCF service's name
	 * @param eventName Event name
	 * @param eventData Data of the event
	 */
	private handleEvent(serviceName: string, eventName: string, eventData: string[]): void {
		if (this.eventHandlers.get(serviceName)) {
			let handler: IEventHandler = this.eventHandlers.get(serviceName) as IEventHandler;

			let handled = handler.eventHandler(eventName, eventData);
			if (!handled) {
				this.log(`[${serviceName}] Event handler failed to handle event '${eventName}'`);
			}
		}
		else {
			this.debug(`[Dispatcher] Event handler for ${serviceName} is not registered`);
		}
	}

	/**
	 * Handles the response to a TCF command
	 * 
	 * @param token token of the command
	 * @param errorReport if there is an response error
	 * @param args response arguments
	 */
	private handleResponse(token: number, errorReport: string, args: string) {
		if (errorReport) {
			this.log(`[Dispatcher] Response error (${token}): ${errorReport}`);
		}

		if (this.pendingHandlers.get(token)) {
			let [resolve, reject] = this.pendingHandlers.get(token) as any[];
			this.pendingHandlers.delete(token);
			if (errorReport) {
				reject(Error(errorReport));
			}
			else {
				resolve(args);
			}
		}
	}
}

