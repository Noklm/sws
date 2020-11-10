import assert = require('assert');
import { IDispatcher } from './../idispatcher';
import { LocatorService } from './../services/services';
import { MockDispatcher } from './mock/mockDispatcher';

suite('Locator service', () => {
    let dispatcher: MockDispatcher;
    let locatorService: LocatorService;


    setup(() => {

        dispatcher = new MockDispatcher();
        locatorService = new LocatorService(dispatcher);

        return dispatcher;
    });

    // teardown(() => {
    //     dc.stop();
    // });


    suite('Command Hello', () => {

        test("Should return a list of 21 remote services", () => {
            locatorService.hello((remoteServices: string[]) => {
                assert.strictEqual(remoteServices.length, 22);
            });

            dispatcher.mockDecodeEvent('Hello', locatorService);
        });
        test("Should include Breakpoints, StackTrace, Stream, Locator, Message, FileSystem services but not coucou", () => {
            locatorService.hello((remoteServices: string[]) => {
                assert.strictEqual(remoteServices.includes('Breakpoints'), true);
                assert.strictEqual(remoteServices.includes('StackTrace'), true);
                assert.strictEqual(remoteServices.includes('Stream'), true);
                assert.strictEqual(remoteServices.includes('Locator'), true);
                assert.strictEqual(remoteServices.includes('Message'), true);
                assert.strictEqual(remoteServices.includes('FileSystem'), true);
                assert.strictEqual(remoteServices.includes('coucou'), false);
            });
            dispatcher.mockDecodeEvent('Hello', locatorService);
        });
    });
});