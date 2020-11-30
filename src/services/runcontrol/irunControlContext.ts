'use strict';

import { ResumeMode } from './resumeMode';
import { IContext } from './../icontext';

export interface IRunControlContext extends IContext {
	ParentID?: string; 		// ID of a parent context. 
	ProcessID?: string; 	// ID of a process (memory space) of the context.
	CreatorID?: string; 	// ID of a context that created (started) this context.
	Name?: string; 			// human redable context name.
	IsContainer?: boolean; 	//  true if the context is a container. Executing resume or suspend command on a container causes all its children to resume or suspend.
	HasState?: boolean 		// true if the context is an execution context, therefore has an execution state, like state of a program counter (PC). Only context that has a state can be resumed or suspended.
	CanSuspend?: boolean; 	// true if Suspend command is supported for this context.It does not mean that the command can be executed successfully in the current state of the context.For example, the command still can fail if context is already suspended.
	CanResume?: number; 	// <int: bitset of resume modes> - for each resume mode, corresponding bit is '1' if Resume command mode is supported for this context, and '0' otherwise. It does not mean that the command can be executed successfully in the current state of the context. For example, the command still can fail if context is already resumed.
	CanCount?: number; 		// <int: bitset of resume modes> - for each resume mode, corresponding bit is '1' if Resume command mode with count other then 1 is supported by the context.
	CanTerminate?: boolean; // true if Terminate command is supported by the context. 
	CanDetach?: boolean; 	// true if Detach command is supported by the context.
	RCGroup?: string; 		// context ID of a run control group that contains the context. Members of same group are always suspended and resumed together: resuming/suspending a context resumes/suspends all members of the group 
	BPGroup?: string; 		// context ID of a breakpoints group that contains the context. Members of same group share same breakpoint instances: a breakpoint is planted once for the group, no need to plant the breakpoint for each member of the group
	SymbolsGroup?: string;  // Context ID of a symbols group that contains the context.Members of a symbols group share same symbol reader configuration settings, like user defined memory map entries and source lookup info 
	/* the access types allowed for this context when accessing context registers
	"rd-running" - context supports reading registers, clients are not required to stop the context for register access
	"wr-running" - context supports writing registers, clients are not required to stop the context for register access
	"rd-stop" - context supports reading registers, clients should stop the context for register access
	"wr-stop" - context supports writing registers, clients should stop the context for register access*/
	RegAccessTypes?: Array<string>;
}