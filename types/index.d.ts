export type Task = { text: string; isDone: boolean }

declare module 'claude-code' {
  interface PluginState {
    'user-task-list': { tasks: Task[]; isHidden: boolean }
  }
}
