import { create } from 'zustand';
import { Task, TaskEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';


interface TaskState {
  tasks: Task[];
  currentTaskId: string | null;
  
  // Actions
  createTask: (query: string) => string;
  addEventToTask: (taskId: string, event: TaskEvent) => void;
  setTaskStatus: (taskId: string, status: Task['status']) => void;
  clearTasks: () => void;
  setCurrentTask: (taskId: string | null) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTaskId: null,
  
  createTask: (query: string) => {
    const taskId = uuidv4();
    
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          id: taskId,
          query,
          events: [],
          status: 'running',
          createdAt: new Date(),
        },
      ],
      currentTaskId: taskId,
    }));
    
    return taskId;
  },
  
  addEventToTask: (taskId: string, event: TaskEvent) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            events: [...task.events, event],
            // Update status based on event type
            status: event.type === 'error' 
              ? 'error' 
              : event.type === 'final_answer' || event.type === 'execution_time'
                ? 'stopped'
                : task.status,
          };
        }
        return task;
      }),
    }));
  },
  
  setTaskStatus: (taskId: string, status: Task['status']) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id === taskId) {
          return { ...task, status };
        }
        return task;
      }),
    }));
  },
  
  clearTasks: () => {
    set({ tasks: [], currentTaskId: null });
  },
  
  setCurrentTask: (taskId: string | null) => {
    set({ currentTaskId: taskId });
  },
}));