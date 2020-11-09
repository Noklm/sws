import assert = require('assert');
import { Channel } from './../channel/channel';
import { IDispatcher } from './../idispatcher';
import { LocatorService, ToolService } from './../services/services';
import { IEventHandler } from './../services/IService';

class MockDispatcher implements IDispatcher{
    connect(callback: (dispatcher: IDispatcher) => void){};
    sendCommand(serviceName: string, commandName: string, args: any[]) {
        return new Promise<string>(() => { });
    }
    eventHandler(service: string, handler: IEventHandler){};
    sendEvent(serviceName: string, eventName: string, args: any[]) { };

    log(data: string) { };
    debug(data: string) { };
}
suite('Tests channel', () => {

    let channel: Channel;
    let dispatcher: IDispatcher;
    let toolService: ToolService;
    let locatorService: LocatorService;

    setup(() => {
        channel = new Channel();
        dispatcher = new MockDispatcher();
        toolService = new ToolService(dispatcher);
        locatorService = new LocatorService(dispatcher);
        return channel;
    });

    // teardown(() => {
    //     dc.stop();
    // });


    suite('Local services', () => {

        test('Tool and Locator services should be added', () => {
            channel.setLocalService(toolService);
            channel.setLocalService(locatorService);
            assert.deepStrictEqual(Array.from(channel.getLocalServices()), [toolService, locatorService]);
        });

        test('Request an unknown service should produce error', () => {
            let name = 'Tool';
            let error = new Error(`[Channel] Unknown ${name} service`);
            assert.throws(() => {
                channel.getLocalService(name);
            }, error);
        });

        test('Request an existing service should return the service object', () => {
            let name = 'Tool';
             channel.setLocalService(toolService);
            assert.strictEqual(channel.getLocalService(name), toolService);
        });
    });

    suite('Remote services', () => {

        test('Services from string list should be added', () => {
            let remoteServices = ["firstService", "secondService", "thirdService"];
            channel.setRemoteServices(remoteServices);
            assert.strictEqual(channel.getRemoteServices(), remoteServices);
        });

        test('No remote services should return empty list', () => {
            assert.deepStrictEqual(channel.getRemoteServices(), []);
        });
    });
});