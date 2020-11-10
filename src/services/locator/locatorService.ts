'use strict';

import { IDispatcher } from './../abstractService';
import { IEventHandler, IResponseHandler, IService } from './../iservice';
import { IPeer } from './ipeer';

export class LocatorService implements IEventHandler, IResponseHandler, IService {

	public peers: Array<IPeer> = new Array<IPeer>();
	public services: Array<string> = new Array<string>();

	private onHelloCallback!: (remoteServices:string[]) => void;
	private dispatcher: IDispatcher;
	private name = 'Locator';

	public constructor(dispatcher: IDispatcher) {
		this.dispatcher = dispatcher;
		this.dispatcher.eventHandler(this.name, this);
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

	/**
	 * Sends our Hello event with DA services and register a callback when Hello event from the remote peer
	 * 
	 * @param callback Callback used when the hello event is received
	 */
	public hello(localServices: string[], callback?: (remoteServices:string[]) => void): void {
		this.dispatcher.sendEvent(this.name, 'Hello', [localServices]);

		if (callback) {
			this.onHelloCallback = callback;
		}
	}

	/**
	 * Handle the peerAdded event
	 * 
	 * @param eventData new peer
	 */
	private handlePeerAdded(eventData: string[]): void {
		let peer = <IPeer>JSON.parse(eventData[0]);
		this.peers.push(peer);

		this.log(`New peer: ${peer}`);
	}

	private handlePeerChanged(eventData: string[]): void {
		// TODO:

		this.log(`Changed peer: ${eventData}`);
	}

	private handlePeerRemoved(eventData: string[]): void {
		// TODO:

		this.log(`Removed peer: ${eventData}`);
	}

	private handlePeerHeartBeat(eventData: string[]): void {
		// TODO:

		this.log(`Heartbeat: ${eventData}`);
	}

	/**
	 * Handle Hello event from the remote peer
	 * 
	 * @param eventData List of peer'services 
	 */
	private handleHello(eventData: string[]): void {
		let self = this;
		this.services = JSON.parse(eventData[0]);

		if (this.onHelloCallback) {
			this.onHelloCallback(self.services);
		}
	}

	public eventHandler(event: string, eventData: string[]): boolean {
		switch (event) {
			case 'peerAdded':
				this.handlePeerAdded(eventData);
				return true;
			case 'peerChanged':
				this.handlePeerChanged(eventData);
				return true;
			case 'peerRemoved':
				this.handlePeerRemoved(eventData);
				return true;
			case 'peerHeartBeat':
				this.handlePeerHeartBeat(eventData);
				return true;
			case 'Hello':
				this.handleHello(eventData);
				return true;
			default:
				this.log(`No matching event handler: ${event}`);
				return false;
		}
	}
	/**
	 * Handle TCF Locator response (Locator use only event)
	 *  
	 * @param response 
	 * @param eventData 
	 */
	public responseHandler(response: string, eventData: string[]): boolean	{
		return true;
	}
}