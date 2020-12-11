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
export class LocatorService extends EventEmitter implements IService{

	public peers: Array<IPeer> = new Array<IPeer>();
	private dispatcher: IDispatcher;
	private name = 'Locator';
	public isChannelOpened: boolean;
	private _remoteServices: Array<string> | undefined;

	public constructor(dispatcher: IDispatcher) {
		super();
		this.isChannelOpened = false;
		this.dispatcher = dispatcher;
		this.dispatcher.on(this.name, this.eventHandler);
		this._remoteServices = undefined;

		// Register all events handled by this service
		this.on('Hello', this.handleHello);
		this.on('peerAdded', this.handlePeerAdded);
		this.on('peerChanged', this.handlePeerChanged);
		this.on('peerRemoved', this.handlePeerRemoved);
		this.on('peerHeartBeat', this.handlePeerHeartBeat);
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
		this.dispatcher.sendEvent(this.name, 'Hello', [[this.name]]);
		this.isChannelOpened = true;
	};

	public eventHandler = (event: IEvent): void => {
		if (this.emit(event.command, event.args)) {
			this.log(`Command ${event.command} done`);
		} else {
			this.log(`Command ${event.command} unknown`);
		}
	};
}