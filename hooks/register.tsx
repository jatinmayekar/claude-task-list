import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Task } from '../types'

// Live copies the band redraws from; $.store keeps the tasks between sessions
const tasks = atom({ plugin: 'user-task-list', key: 'tasks' } as const, [])
const isHidden = atom({ plugin: 'user-task-list', key: 'isHidden' } as const, false)

const HELP = [
  '/task add <text>   add a task',
  '/task done <n>     mark task n done (again to undo)',
  '/task rm <n>       remove task n',
  '/task clear        remove all done tasks',
  '/task hide | show  hide or show the list above the prompt',
  '/task              list the tasks',
].join('\n')

function listText(list: readonly Task[]): string {
  if (list.length === 0) return 'No tasks. Add one with /task add <text>'
  return list.map((t, i) => `${i + 1}. ${t.isDone ? '[x]' : '[ ]'} ${t.text}`).join('\n')
}

// Ten-cell bar: filled for done, empty for open
function progressBar(done: number, total: number): string {
  const filled = total === 0 ? 0 : Math.round((done / total) * 10)
  return '▰'.repeat(filled) + '▱'.repeat(10 - filled)
}

// Applies a change to the list, redraws the band and saves it for later sessions
async function change($: EngineInterface, fn: (list: readonly Task[]) => Task[]): Promise<Task[]> {
  let result: Task[] = []
  await update($, tasks, list => (result = fn(list)))
  await $.store.set('tasks', result)
  return result
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'task',
      description: 'Manage the task list shown above the prompt',
      argumentHint: 'add <text> | done <n> | rm <n> | clear | hide | show',
      immediate: true,
    })
    const saved = (await $.store.get('tasks')) as Task[] | undefined
    await update($, tasks, () => saved ?? [])
    return next(e)
  })

  on('command.run', { command: 'task' }, async ($, e) => {
    const [verb = '', ...rest] = e.args.trim().split(/\s+/)
    const arg = rest.join(' ')
    const current = await read($, tasks)
    // done/rm take the leading number; anything after it is a free-form note
    const n = Number(rest[0])
    const isValidIndex = Number.isInteger(n) && n >= 1 && n <= current.length

    switch (verb.toLowerCase()) {
      case '':
      case 'list':
        return { text: listText(current) }
      case 'add': {
        if (!arg) return { text: 'Usage: /task add <text>' }
        const list = await change($, l => [...l, { text: arg, isDone: false }])
        return { text: `Added #${list.length}: ${arg}` }
      }
      case 'done': {
        if (!isValidIndex) return { text: `No task #${arg}. ${listText(current)}` }
        await change($, l => l.map((t, i) => (i === n - 1 ? { ...t, isDone: !t.isDone } : t)))
        return { text: `Toggled #${n}: ${current[n - 1]?.text}` }
      }
      case 'rm': {
        if (!isValidIndex) return { text: `No task #${arg}. ${listText(current)}` }
        await change($, l => l.filter((_, i) => i !== n - 1))
        return { text: `Removed: ${current[n - 1]?.text}` }
      }
      case 'clear': {
        const list = await change($, l => l.filter(t => !t.isDone))
        return { text: `Removed ${current.length - list.length} done task(s).` }
      }
      case 'hide':
        await update($, isHidden, () => true)
        return { text: 'Task list hidden. /task show brings it back.' }
      case 'show':
        await update($, isHidden, () => false)
        return { text: 'Task list shown.' }
      default:
        return { text: HELP }
    }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, tasks)
    if (e.props.hasSurvey || list.length === 0 || (await read($, isHidden))) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    const done = list.filter(t => t.isDone).length
    const width = Math.min(e.props.bodyColumns, 64)
    // Border (2 rows) and header (1 row) come off the band's height
    const room = Math.max(1, e.props.maxRows - 3)
    // Leave a row for the "+N more" line when the list does not fit
    const shown = list.length > room ? list.slice(0, Math.max(1, room - 1)) : list
    const numberWidth = String(list.length).length + 1

    return (
      <Box flexDirection="column" width={width} borderStyle="round" borderColor="subtle" paddingX={1}>
        <Box flexDirection="row" justifyContent="space-between">
          <Text bold color="claude">
            Tasks
          </Text>
          <Box flexDirection="row" columnGap={1}>
            <Text color="success">{progressBar(done, list.length)}</Text>
            <Text dimColor>
              {done}/{list.length}
            </Text>
          </Box>
        </Box>
        {shown.map((t, i) => (
          <Box key={`t${i}`} flexDirection="row" columnGap={1}>
            <Box width={numberWidth} justifyContent="flex-end">
              <Text dimColor>{`${i + 1}.`}</Text>
            </Box>
            <Box width={2}>
              <Text color={t.isDone ? 'success' : 'suggestion'}>{t.isDone ? '✓' : '○'}</Text>
            </Box>
            <Text dimColor={t.isDone} strikethrough={t.isDone} wrap="truncate-end">
              {t.text}
            </Text>
          </Box>
        ))}
        {list.length > shown.length && <Text dimColor>{`  +${list.length - shown.length} more`}</Text>}
      </Box>
    )
  })
}
