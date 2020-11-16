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
    JtagClock: number;
}

/**
 * Interface that describes a Tool object from the tool TCF service
 */
interface ISwd extends IKeepTimersRunning {
    SwdClock: number;
}

interface IKeepTimersRunning {
    KeepTimersRunning: boolean;
}