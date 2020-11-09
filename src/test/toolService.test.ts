import assert = require('assert');
import { IDispatcher } from './../idispatcher';
import { ToolService } from './../services/services';
import { MockDispatcher } from './mock/mockDispatcher';
import {
    ITool
} from './../services/tool/itool';

suite('Test tool service', () => {
    let dispatcher: IDispatcher;
    let toolService: ToolService;

    setup(() => {

        dispatcher = new MockDispatcher();
        toolService = new ToolService(dispatcher);

        return dispatcher;
    });

    // teardown(() => {
    //     dc.stop();
    // });


    suite('Tool service', () => {

        test('Tool getAttachedTools should return a ITool list of size 3', () => {
            return toolService.getAttachedTools().then(
                (tools: ITool[]) => {
                    assert.strictEqual(tools.length, 3);
                });
        });
    });
});