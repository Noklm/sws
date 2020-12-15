export type InterfaceType = IUpdi | IJtag | ISwd;
export type InterfaceNameType = "UPDI" | "JTAG" | "SWD";

/**
 * Interface that describes the UPDI interface
 */
interface IUpdi extends IKeepTimersRunning {
    UpdiClock: number;
}

/**
 * Interface that describes the JTAG interface
 */
interface IJtag extends IKeepTimersRunning {
    JtagProgClock: number;
    JtagDbgClock: number;
}

/**
 * Interface that describes the SWD interface
 */
interface ISwd extends IKeepTimersRunning {
    SwdClock: number;
}

interface IKeepTimersRunning {
    KeepTimersRunning: boolean;
}