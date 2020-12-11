'use strict';

import * as WebSocket from 'ws';
import { IDispatcher } from './IDispatcher';
import { IProgressEventHandler, ICongestionHandler, IService } from './services/iservice';


/**
 * The WebsocketDispatcher class is used to send and handle all event, response, commands, ...
 * from a remote websocket server.
 * All is dispatch to handlers (TCF Services) to be handle
 */
export class WebsocketDispatcher extends WebSocket implements IDispatcher {

	private sendToken: number;

	private nil: string = '\x00';
	private eom: string = '\x03\x01';

	private pendingHandlers = new Map<number, any[]>();
	private progressHandlers = new Array<IProgressEventHandler>();
	private congestionHandlers = new Array<ICongestionHandler>();


	private logger?: (message: string) => void;

	public constructor(host: string, port: number, logger?: (message: string) => void) {
		super(`ws://${host}:${port}`);
		this.sendToken = 1;

		if (logger) {
			this.logger = logger;
		}

		this.on('error', (error) => {
			this.log(`[Dispatcher] WS:error: ${error}`);
			throw error;
		});

		this.on('close', (code, message) => {
			this.log(`[Dispatcher] WS:close: ${code} => ${message}`);
		});

		this.on('message', (data: string, flags: { binary: boolean }) => {
			this.handleMessage(data);
		});

		this.on('open', () => {
			this.log(`[Dispatcher] WS:opened`);
		});

	}

	public log(data: string): void {
		if (this.logger) {
			this.logger(`${data}\n\r`);
		}
		else {
			console.error(`${data}\n\r`);
		}
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
	public eventHandler(service: IService): void {
		this.log(`[Dispatcher] Registering event handler for ${service.getName()}`);
		service.registerCommands();
		this.on(service.getName(), service.eventHandler);
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
		this.log(`>> ${this.escapeNil(message)}`);
		this.send(message);
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

		this.log(`<< ${self.escapeNil(data)}`);

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
		let event = {
			command: data.shift() as string,
			args: data
		};
		if (this.emit(serviceName, event)) {
			this.log(`[Dispatcher] Event sends for ${serviceName}`);
		} else {
			this.log(`[Dispatcher] Event listener for ${serviceName} is not registered`);
		}
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

		this.log(`[Dispatcher] Progress: ${eventData['ProgressComplete']}`);
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

