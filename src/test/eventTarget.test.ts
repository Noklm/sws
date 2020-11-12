/// <reference types="node" />
import assert = require('assert');

import { EventEmitter } from 'events';
import { IDispatcher } from './../idispatcher';
import { IEvent, IEventListener } from './../services/iservice';
import { MockDispatcher } from './mock/mockDispatcher';
import {
    ITool
} from './../services/tool/itool';

suite('Tests event targets', () => {
    let eventListener: IEventListener;

    setup(() => {
        eventListener = {
            handleEvent(event) {
                console.log(event.command);
            }
        };
    });

    // teardown(() => {
    //     dc.stop();
    // });


    suite('Event Target', () => {

        test("Should an event occurs", () => {
            let eventTarget = new EventEmitter();
            eventTarget.on("Tool", eventListener.handleEvent);
            let event: IEvent = {
                command: "bonjour",
                args: "je ne sais pas"
            };
            eventTarget.emit("Tool", event);
            assert.deepStrictEqual(eventTarget.listeners, true);
        });
    });
});