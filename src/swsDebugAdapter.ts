import {
    DebugSession,
} from 'vscode-debugadapter';
import { SwsDebugSession } from './swsDebug';

// DebugSession.run(SwsDebugSession);
// const session = new SwsDebugSession();
// process.on('SIGTERM', () => {
//     session.shutdown();
// });
// session.start(process.stdin, process.stdout);