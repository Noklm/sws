import assert = require('assert');
import { IDispatcher } from './../idispatcher';
import { ToolService } from './../services/services';
import { MockDispatcher } from './mock/mockDispatcher';
import {
    ITool
} from './../services/tool/itool';

suite('Tool service', () => {
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


    suite('Command getAttachedTools', () => {

        test("Should return an ITool's list of size 3", () => {
            return toolService.getAttachedTools().then(
                (tools: ITool[]) => {
                    assert.strictEqual(tools.length, 3);
                });
        });

        test("Should have tools of type simulator, nedbg, atmelice", () => {
            return toolService.getAttachedTools().then(
                (tools: ITool[]) => {
                    assert.strictEqual(tools.some((tool) => {
                        return tool.ToolType === 'com.atmel.avrdbg.tool.simulator';
                    }), true);
                    assert.strictEqual(tools.some((tool) => {
                        return tool.ToolType === 'com.atmel.avrdbg.tool.nedbg';
                    }), true);
                    assert.strictEqual(tools.some((tool) => {
                        return tool.ToolType === 'com.atmel.avrdbg.tool.atmelice';
                    }), true);
                    // assert.strictEqual(tools[0], true);
                });
        });
    });
});