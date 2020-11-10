'use strict';

import { IDispatcher, AbstractService } from './../abstractService';
import { IToolContext } from './itoolContext';
import { ToolContext} from './toolContext';
import { IToolListener } from './itoolListener';
import {
	IConnectionProperties,
	ITool
} from './itool';

/**
 * Class that describe the TCF Tool Service
 */
export class ToolService extends AbstractService<IToolContext, IToolListener>{

	public constructor(dispatcher: IDispatcher) {
		super('Tool', dispatcher);
	}

	public attachedTools: Array<ITool> = new Array<ITool>();

	/**
	 * Lists all atbackend supported tools as String
	 * 
	 * @return Promise<string[]>
	 */
	public getSupportedToolTypes(): Promise<string[]> {
		let self = this;

		// TODO: Look how to catch rejected response
		return new Promise<string[]>(function(resolve, reject) {
			self.dispatcher.sendCommand(self.getName(), 'getSupportedToolTypes', []).then( (data: string) => {
				let supportedTools = <string[]>JSON.parse(data);
				resolve(supportedTools);
			}).catch(reject);
		});
	}

	public pollForTools(shouldPoll: boolean) {
		this.dispatcher.sendCommand(this.getName(), 'pollForTools', [shouldPoll]);
	}

	/**
	 * Lists all atbackend connected tools
	 * 
	 * @return Promise<ITool[]> List of all avalaible Tools connected to the PC
	 */
	public getAttachedTools(): Promise<ITool[]> {
		let self = this;
		return new Promise<ITool[]>(function (resolve, reject) {
			self.dispatcher.sendCommand(self.getName(), 'getAttachedTools', [""]).then((data: string) => {
				let attachedTools:ITool[] = JSON.parse(data);
				resolve(attachedTools);
			}).catch(reject);
		});
	}

	public setupTool(tool:ITool): Promise<IToolContext> {
		let self = this;

		return new Promise<IToolContext>(function(resolve, reject) {
			self.dispatcher.sendCommand(self.getName(), 'setupTool', [tool.ToolType, tool.ConnectionType, tool.ConnectionProperties]).then( (data: string) => {
				let context = JSON.parse(data);
				self.getContext(context).then(resolve).catch(reject);
			}).catch(reject);
		});
	}

	public connect(id: string): Promise<string> {
		return this.dispatcher.sendCommand(this.getName(), 'connect', [id]);
	}

	public tearDownTool(id: string): Promise<string> {
		return this.dispatcher.sendCommand(this.getName(), 'tearDownTool', [id]);
	}

	public setProperties(contextId: string, properties: any): Promise<string> {
		return this.dispatcher.sendCommand(this.getName(), 'setProperties', [contextId, properties]);
	}

	public checkFirmware(contextId: string): Promise<string> {
		return this.dispatcher.sendCommand(this.getName(), 'setProperties', [contextId]);
	}

	public eventHandler(event: string, eventData: string[]): boolean {
		if (super.eventHandler(event, eventData)) {
			return true;
		}

		switch (event) {
			case 'attachedToolsChanged':
				this.handleAttachedToolsChanged(eventData);
				return true;
			default:
				return false;
		}
	}

	private handleAttachedToolsChanged(eventData: string[]): void {
		this.attachedTools = <ITool[]>JSON.parse(eventData[0]);
		this.log(`AttachedToolsChanged: ${eventData}`);


		this.listeners.forEach(listener => {
			listener.attachedToolsChanged(this.attachedTools);
		});
	}

	public fromJson(data: IToolContext): ToolContext {
		let context = new ToolContext(data, this);
		return context;
	}
}