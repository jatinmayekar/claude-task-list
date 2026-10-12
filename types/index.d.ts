export type Task = { text: string; isDone: boolean }

declare module 'claude-code' {
  interface PluginState {
    'task-list': { tasks: Task[]; isHidden: boolean }
  }
}
