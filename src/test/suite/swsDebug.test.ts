import assert = require('assert');
import * as Path from 'path';
import { DebugClient } from 'vscode-debugadapter-testsupport';
import { DebugProtocol } from 'vscode-debugprotocol';

suite('SWS Debug Adapter', () => {

    const DEBUG_ADAPTER = './out/swsDebug.js';

    // const PROJECT_ROOT = Path.join(__dirname, '../../');
    // const DATA_ROOT = Path.join(PROJECT_ROOT, 'src/tests/data/');


    let dc: DebugClient;

    setup(() => {
        dc = new DebugClient('sws', DEBUG_ADAPTER, 'sws');
        return dc.start();
    });

    teardown(() => dc.stop());


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

        // test('should produce error for invalid \'pathFormat\'', done => {
        //     dc.initializeRequest({
        //         adapterID: 'mock',
        //         linesStartAt1: true,
        //         columnsStartAt1: true,
        //         pathFormat: 'url'
        //     }).then(response => {
        //         done(new Error("does not report error on invalid 'pathFormat' attribute"));
        //     }).catch(err => {
        //         // error expected
        //         done();
        //     });
        // });
    });

    // suite('launch', () => {

    //     test('should run program to the end', () => {

    //         const PROGRAM = Path.join(DATA_ROOT, 'test.md');

    //         return Promise.all([
    //             dc.configurationSequence(),
    //             dc.launch({ program: PROGRAM }),
    //             dc.waitForEvent('terminated')
    //         ]);
    //     });

    //     test('should stop on entry', () => {

    //         const PROGRAM = Path.join(DATA_ROOT, 'test.md');
    //         const ENTRY_LINE = 1;

    //         return Promise.all([
    //             dc.configurationSequence(),
    //             dc.launch({ program: PROGRAM, stopOnEntry: true }),
    //             dc.assertStoppedLocation('entry', { line: ENTRY_LINE })
    //         ]);
    //     });
    // });
});