import {
    TerminalOptions,
} from 'vscode';

export class SWSTerminalOptions implements TerminalOptions{
    name: string;
    env: { [key: string]: string | null };
    constructor(config: { [key: string]: string | null }) {
        this.name = "SWS";
        this.env = config;
    }
}
