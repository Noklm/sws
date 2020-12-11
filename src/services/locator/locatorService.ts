'use strict';

import { EventEmitter } from 'events';
import { IDispatcher } from './../abstractService';
import { IService, IEvent } from './../iservice';
import { IPeer } from './ipeer';

/**
 * TCF Locator service:
 * 
 * Searches for peers and to collect data about the peer's attributes and capabilities (services)
 * This service is required
 */
export class LocatorService implements IService{

	public peers: Array<IPeer> = new Array<IPeer>();
	private onHelloCallback!: (remoteServices:string[]) => void;
	private dispatcher: IDispatcher;
	private name = 'Locator';
	private _commandEmitter: EventEmitter;
	private _remoteServices: Array<string> | undefined;

	public constructor(dispatcher: IDispatcher) {
		this.dispatcher = dispatcher;
		this._commandEmitter = new EventEmitter();
		this.dispatcher.eventHandler(this);
		this._remoteServices = undefined;
	}

	private log(message: string): void {
		this.dispatcher.log(`[${this.name}] ${message}`);
	}

	public sync(): Promise<any> {
		return this.dispatcher.sendCommand(this.name, 'sync', []);
	}

	/**
	 * Return the name of the service
	 */
	public getName(): string{
		return this.name;
	}

	public registerCommands() {
		this._commandEmitter.on('Hello', this.handleHello);
		this._commandEmitter.on('peerAdded', this.handlePeerAdded);
		this._commandEmitter.on('peerChanged', this.handlePeerChanged);
		this._commandEmitter.on('peerRemoved', this.handlePeerRemoved);
		this._commandEmitter.on('peerHeartBeat', this.handlePeerHeartBeat);
	}

	/**
	 * Sends our Hello event with DA services and register a callback when Hello event from the remote peer
	 * 
	 * @param callback Callback used when the hello event is received
	 */
	public hello(localServices: string[], callback?: (remoteServices: string[]) => void): void {
		// TODO: hello need to notify if TCF channel is connected
		this.dispatcher.sendEvent(this.name, 'Hello', [localServices]);
	}

	/**
	 * Handle the peerAdded event
	 * 
	 * @param eventData new peer
	 */
	private handlePeerAdded = (eventData: string[]): void => {
		let peer = <IPeer>JSON.parse(eventData[0]);
		this.peers.push(peer);

		this.log(`New peer: ${peer}`);
	};

	private handlePeerChanged = (eventData: string[]): void => {
		// TODO:

		this.log(`Changed peer: ${eventData}`);
	};

	private handlePeerRemoved = (eventData: string[]): void => {
		// TODO:

		this.log(`Removed peer: ${eventData}`);
	};

	private handlePeerHeartBeat = (eventData: string[]): void => {
		// TODO:

		this.log(`Heartbeat: ${eventData}`);
	};

	/**
	 * Handle Hello event from the remote peer
	 * 
	 * @param eventData List of peer'services 
	 */
	private handleHello = (eventData: string[]): void => {
		this._remoteServices = JSON.parse(eventData[0]);
	};

	public eventHandler = (event: IEvent): void => {
		if (this._commandEmitter.emit(event.command, event.args)) {
			this.log(`Command ${event.command} done`);
		} else {
			this.log(`Command ${event.command} unknown`);
		}
	};
}