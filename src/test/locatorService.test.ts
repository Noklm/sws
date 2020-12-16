import assert = require('assert');

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


});