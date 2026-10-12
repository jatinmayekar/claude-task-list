# task-list

A Claude Code mod that shows your task list in a box above the prompt, with a progress bar and ✓ for finished tasks. Tasks persist across sessions.

![Task list above the Claude Code prompt](docs/screenshot.png)

## Install

Needs Claude Code 2.1.287 or later. In Claude Code, run:

```
/plugin install task-list --marketplace jatinmayekar/claude-task-list
```

Then run `/reload-plugins`, or restart Claude Code.

## Use

| Command | Does |
|---|---|
| `/task add <text>` | Add a task |
| `/task done <n>` | Toggle task n done/undone |
| `/task rm <n>` | Remove task n |
| `/task clear` | Remove finished tasks |
| `/task hide` / `/task show` | Hide or show the box |

## Develop

```bash
claude plugin validate ~/mods/task-list
claude plugin test ~/mods/task-list
```
