// Session related types
export interface Session {
  id: string;
  createdAt: Date;
}

// SSE Event types
export type EventType = 'step' | 'final_answer' | 'execution_time' | 'error';

export interface BaseEvent {
  type: EventType;
}

export interface StepEvent extends BaseEvent {
  type: 'step';
  thought: string;
  action: string;
  action_input?: string | object; // Can be either string or object
  observation?: string; // Optional field for observation
}

export interface FinalAnswerEvent extends BaseEvent {
  type: 'final_answer';
  thought: string;
  answer: string;
}

export interface ExecutionTimeEvent extends BaseEvent {
  type: 'execution_time';
  time: number;
}

export interface ErrorEvent extends BaseEvent {
  type: 'error';
  error: string;
}

export type TaskEvent = StepEvent | FinalAnswerEvent | ExecutionTimeEvent | ErrorEvent;

// Task type
export interface Task {
  id: string;
  query: string;
  events: TaskEvent[];
  status: 'running' | 'waiting' | 'stopped' | 'completed' | 'error';
  createdAt: Date;
}

// Tab type for agent execution UI
export type TabType = 'vscode' | 'terminal' | 'app' | 'browser';