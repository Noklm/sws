'use strict';
import { IChannel } from './ichannel';
import { IService } from '../services/iservice';
import { ITool } from '../services/tool/itool';

/**
 * Class that describe the TCF Channel
 */
export class Channel implements IChannel {

    private localServices: Map<string, IService>;
    private remoteServices: string[];
    private attachedTools: Map<string, ITool>;

    public constructor() {
        this.localServices = new Map<string, IService>();
        this.remoteServices = new Array<string>();
        this.attachedTools = new Map<string,ITool>();
    }
    
    /**
     * Adds a local service to the TCF channel
     * 
     * @param service local service to add
     */
    public setLocalService(service: IService) {
        this.localServices.set(service.getName(), service);
    }

    /**
     * Returns all local services of the TCF channel
     */
    public getLocalServices() {
        let services: string[] = [];
        for (let service of this.localServices.values()) {
            services.push(service.getName());
        }
        return services;
    }

    /**
     * Returns one local service by his name, throws an error if the service is unknown
     * 
     * @param name name of the local service to return
     */
    public getService(name: string) {
        if (this.localServices.has(name) && this.remoteServices.includes(name)) {
            return this.localServices.get(name) as IService;
        }
        throw new Error(`[Channel] Unknown ${name} service`);
    };

    /**
     * Returns all remotes services of the TCF channel
     */
    public getRemoteServices() {
        return this.remoteServices;
    }

    /**
     * Sets all available remote services of the TCF channel
     * 
     * @param services remote services
     */
    public setRemoteServices(services: string[]) {
        this.remoteServices = services;
    }

    /**
     * Sets all available attached Tools of a TCF channel
     * 
     * @param tools list of attached tools 
     */
    public setAttachedTools(tools: ITool[]) {
        tools.forEach((tool: ITool) => {
            // TODO: gerer plusieurs tools de meme type
            let name = tool.ToolType.split('.').pop() as string;
            if (!this.attachedTools.has(name)) {
                this.attachedTools.set(name, tool);
            } else {
                throw new Error(`[Channel] Too many tools with type ${name}`);
            }
        });
    }
    /**
     * Returns an attached tool regarding is name
     * 
     * @param name name of the tool, atmelice, nedbg, simulator...
     */
    public getAttachedTool(name: string) {
        if (this.attachedTools.has(name)) {
            return this.attachedTools.get(name) as ITool;
        }
        throw new Error(`[Channel] Unknown tool of type ${name}`);
    }
}