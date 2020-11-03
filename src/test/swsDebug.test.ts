import assert = require('assert');
import { DebugClient } from 'vscode-debugadapter-testsupport';
import { DebugProtocol } from 'vscode-debugprotocol';

suite('SWS Debug Adapter TESTS', () => {

    const DEBUG_ADAPTER = './out/swsDebugAdapter.js';

    let dc: DebugClient;

    setup(() => {
        dc = new DebugClient('node', DEBUG_ADAPTER, 'sws');
        return dc.start();
    });

    teardown(() => {
        dc.stop();
    });


    suite('basic', () => {

        test('unknown request should produce error', done => {
            dc.send('illegal_request').then(() => {
                done(new Error("does not report error on unknown request"));
            }).catch(() => {
                done();
            });
        });
    });

    suite('initialize', () => {

        test('should return supported features', () => {
            return dc.initializeRequest().then(response => {
                response.body = response.body || {};
                assert.strictEqual(response.body.supportsConfigurationDoneRequest, true);
            });
        });

    });
});