'use strict';

import { IDispatcher, AbstractService } from './../abstractService';
import { IToolContext } from './itoolContext';
import { ToolContext} from './toolContext';
import { IToolListener } from './itoolListener';
import { IEvent } from './../iservice';
import {
	IConnectionProperties,
	ITool
} from './itool';

/**
 * Class that describe the TCF Tool Service
 */
export class ToolService extends AbstractService<IToolContext, IToolListener>{
	public attachedTools: Array<ITool>;

	public constructor(dispatcher: IDispatcher) {
		super('Tool', dispatcher);
		this.attachedTools = new Array<ITool>();
		this.dispatcher.eventHandler(this);
	}

	public registerCommands() {
		super.registerCommands();
		this._commandEmitter.on('attachedToolsChanged', this.handleAttachedToolsChanged);
	}

	/**
	 * Lists all atbackend supported tools as String
	 * 
	 * @return Promise<string[]>
	 */
	public getSupportedToolTypes(): Promise<string[]> {
		let self = this;

		// TODO: Look how to catch rejected response
		return new Promise<string[]>(function(resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'getSupportedToolTypes', []).then( (data: string) => {
				let supportedTools = <string[]>JSON.parse(data);
				resolve(supportedTools);
			}).catch(reject);
		});
	}

	public pollForTools(shouldPoll: boolean) {
		this.dispatcher.sendCommand(this._name, 'pollForTools', [shouldPoll]);
	}

	/**
	 * Lists all atbackend connected tools
	 * 
	 * @return Promise<ITool[]> List of all avalaible Tools connected to the PC
	 */
	public getAttachedTools(): Promise<ITool[]> {
		let self = this;
		return new Promise<ITool[]>(function (resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'getAttachedTools', [""]).then((data: string) => {
				let attachedTools:ITool[] = JSON.parse(data);
				resolve(attachedTools);
			}).catch(reject);
		});
	}

	public setupTool(tool:ITool): Promise<IToolContext> {
		let self = this;

		return new Promise<IToolContext>(function(resolve, reject) {
			self.dispatcher.sendCommand(self._name, 'setupTool', [tool.ToolType, tool.ConnectionType, tool.ConnectionProperties]).then( (data: string) => {
				let context = JSON.parse(data);
				self.getContext(context).then(resolve).catch(reject);
			}).catch(reject);
		});
	}

	public connect(id: string): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'connect', [id]);
	}

	public tearDownTool(id: string): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'tearDownTool', [id]);
	}



	public checkFirmware(contextId: string): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'checkFirmware', [contextId]);
		
	}

	private handleAttachedToolsChanged = (eventData: string[]): void => {
		this.attachedTools = <ITool[]>JSON.parse(eventData[0]);
		this.log(`AttachedToolsChanged: ${eventData}`);

		this.listeners.forEach(listener => {
			listener.attachedToolsChanged(this.attachedTools);
		});
	};


	/**
	 * 
	 * @param contextId Tool Context ID
	 * @param properties Properties to set
	 */
	public setProperties(contextId: string, properties: any): Promise<string> {
		return this.dispatcher.sendCommand(this._name, 'setProperties', [contextId, properties]);
	}

	public getProperties(): Promise<any> {
		return Promise.reject(Error('NOT IMPLEMENTED'));
	}

	public fromJson(data: IToolContext): ToolContext {
		let context = new ToolContext(data, this);
		return context;
	}
}