# User Task List

A Claude Code mod that shows your own task list, the things you are working on in Claude Code, in a box above the prompt, with a progress bar and ✓ for finished tasks. Tasks persist across sessions.

![Task list above the Claude Code prompt](docs/screenshot.png)

## Install

Needs Claude Code 2.1.287 or later. In Claude Code, run:

```
/plugin install user-task-list --marketplace jatinmayekar/claude-task-list
```

Then run `/reload-plugins`, or restart Claude Code.

## Use

| Command | Does |
|---|---|
| `/task add <text>` | Add a task |
| `/task done <n> [note]` | Toggle task n done/undone |
| `/task rm <n>` | Remove task n |
| `/task clear` | Remove finished tasks |
| `/task hide` / `/task show` | Hide or show the box |

## Examples

1. **Plan a session:** `/task add fix login bug`, `/task add write tests`, `/task add open PR`. The box shows all three with a 0/3 progress bar.
2. **Track progress as you go:** `/task done 1 - fixed in auth.ts` ticks task 1 and the bar moves to 1/3. Run it again to undo.
3. **Tidy up:** `/task clear` removes finished tasks, and `/task hide` gets the box out of the way for a screen share. `/task show` brings it back.

## Data and privacy

Your tasks are saved locally in the plugin's own store on your machine. The mod makes no network requests, runs no shell commands, and sends nothing anywhere. It registers one slash command, `/task`, and handles that command itself. It hooks the `command.run` event only for `/task` and passes every other command through unchanged. It also draws the box above the prompt. The box shows in the terminal and the Desktop Code tab.

## What the mod hooks

The mod is one TypeScript file, `hooks/register.tsx`. It hooks three events:

- `session.start`: registers the `/task` command and loads your saved tasks.
- `command.run`, matched to `/task` only: handles `/task` and returns its reply. It never sees or changes any other command.
- `ui.render`, matched to the `AbovePrompt` area only: draws the task box above the prompt, or passes through when the list is empty or hidden.

## Develop

```bash
git clone https://github.com/jatinmayekar/claude-task-list && cd claude-task-list
claude plugin validate .
claude plugin test .
```

## Support

Report bugs or ask questions in [GitHub Issues](https://github.com/jatinmayekar/claude-task-list/issues).

## License

MIT
