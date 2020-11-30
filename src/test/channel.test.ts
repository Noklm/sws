import assert = require('assert');
import { Channel } from './../channel/channel';
import { IDispatcher } from './../idispatcher';
import { LocatorService, ToolService } from './../services/services';
import { MockDispatcher } from './mock/mockDispatcher';

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


    suite('Local services', () => {

        test('Tool and Locator services should be added', () => {
            channel.setLocalService(toolService);
            channel.setLocalService(locatorService);
            assert.deepStrictEqual(channel.getLocalServices(), ["Tool", "Locator"]);
        });

        test('Request an unknown service by peers should produce error', () => {
            let name = 'Tool';
            let error = new Error(`[Channel] Unknown ${name} service`);
            assert.throws(() => {
                channel.getService(name);
            }, error);
            channel.setLocalService(locatorService);
            assert.throws(() => {
                channel.getService(name);
            }, error);
        });

        test('Service needs to be known by two peers to be return', () => {
            let name = 'Tool';
            channel.setLocalService(toolService);
            channel.setRemoteServices([name]);
            assert.strictEqual(channel.getService(name), toolService);
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