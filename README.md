# task-list

A Claude Code mod that shows your task list in a box above the prompt, with a progress bar and ✓ for finished tasks. Tasks persist across sessions.

![Task list above the Claude Code prompt](docs/screenshot.png)

## Install

1. Clone it:
   ```bash
   git clone git@github.com:jatinmayekar/claude-task-list.git ~/mods/task-list
   ```
2. Load it in every session by adding this to `~/.claude/settings.json` (separate multiple mod dirs with `:`):
   ```json
   "env": { "CLAUDE_CODE_PLUGIN_DIRS": "/home/<you>/mods/task-list" }
   ```
3. Restart Claude Code.

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
