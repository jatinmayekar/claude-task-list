import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

const START = { cwd: '/tmp', surface: 'terminal', isInteractive: true } as const

// What the engine stamps on a typed /task, with the argument text
function run(args: string) {
  return {
    command: 'task',
    args,
    origin: { kind: 'composer' },
    presentation: { isFullscreen: false, columns: 80 },
  } as const
}

// Stands in for the engine: answers the store from memory and accepts the command
function world(on: On, entries?: Record<string, unknown>) {
  mock.store(on, entries)
  on('command.register', (_$, e) => ({ value: { command: e.name } }))
  on('session.start', (_$, e) => ({ cwd: e.cwd }))
  // The engine's own band when the mod passes: an empty Box
  on('ui.render', ($, e) => {
    const { Box } = $.ui.resolve(e)
    return <Box />
  })
}

const BAND = {
  hasSurvey: false,
  isWorking: true,
  maxRows: 10,
  bodyColumns: 80,
  scroll: { offset: 0, bodyRows: 10 },
  view: {},
}

test('commands add, toggle, remove and persist tasks', async ($, on) => {
  world(on)
  await $.session.start(START)

  expect((await $.command.run(run(''))).text).toContain('No tasks')
  await $.command.run(run('add flash the jetson'))
  await $.command.run(run('add set up tailscale'))
  await $.command.run(run('done 2'))

  const list = (await $.command.run(run('list'))).text
  expect(list).toBe('1. [ ] flash the jetson\n2. [x] set up tailscale')

  await $.command.run(run('clear'))
  expect((await $.command.run(run(''))).text).toBe('1. [ ] flash the jetson')
  expect((await $.command.run(run('rm 5'))).text).toContain('No task #5')
  expect((await $.command.run(run('done 1 - with a note'))).text).toContain('Toggled #1')
})

test('band above the prompt shows saved tasks and hides on request', async ($, on) => {
  world(on, { tasks: [{ text: 'review the PR', isDone: false }] })
  await $.session.start(START)

  for (const surface of ['terminal', 'desktop'] as const) {
    const band = await $.ui.mount({ plugin: 'task-list', surface, component: 'AbovePrompt', props: BAND })
    expect(JSON.stringify(await band.drawn())).toContain('review the PR')
  }

  await $.command.run(run('hide'))
  const hidden = await $.ui.mount({ plugin: 'task-list', surface: 'terminal', component: 'AbovePrompt', props: BAND })
  expect(JSON.stringify(await hidden.drawn())).not.toContain('review the PR')
})
