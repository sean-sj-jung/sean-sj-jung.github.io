---
layout: post
title: "Claude Code Tips from DLAI Short Course"
date: 2025-08-16
excerpt: "Claude Code Tips and Best Practices"
---

## Claude Code: Summary and Tips

### Popular Use Cases
- Discovery: "Make a cool visualization for me. I'm just getting started."
- Implement features in a web app with Playwright: "Add a button here"
- Spawn subagents to perform multiple tasks simultaneously; merge them using git worktrees.
- Write tests and debug.
- Refactor code.

### /init and CLAUDE.md
> Effectively a memory file.  
> Define your config, style guidelines, and common commands.  
> Will be automatically loaded when Claude Code launches.

#### Three types of CLAUDE.md
- **CLAUDE.md**
  - Generate with `/init`
  - Commit to source control
  - Shared with other engineers
  - Located in the project directory
  - You can have many of them in nested subfolders
- **CLAUDE.local.md**
  - Personal, not shared with other engineers
  - Like your own personal environment/terminal settings
  - For work-specific settings, e.g., Anthropic or Databricks connectors
  - Example: always use uv
  - Located in the project directory
- **~/.claude/CLAUDE.md**
  - Global for all projects on your machine

### Other Commands
- `/help`: Lists useful commands
- `/clear`: Removes conversation history (context window); helpful when starting a new feature
- `/compact`: Compacts memory
- `@`: Mentions a file to include its contents in the request
- `#`: Appends memory to a CLAUDE.md (you can choose which CLAUDE.md to target)

### Git Integration
- Plain language works: "add and commit these changes" will be understood

### Plan Mode
- Activate with Shift-Tab twice
- Plan first before writing any code; then give the go-ahead to start coding
- Useful for large codebases
- Write long, detailed prompts with clear instructions

### Adding an MCP Server
- Syntax:
  
  ```
  claude mcp add <name-of-mcp-server> <command-to-run-this-server>
  ```
- Example:
  
  ```
  claude mcp add playwright npx playwright@latest
  ```
- Use `/mcp` to manage available MCPs.
- Replace 'playwright@latest' with the correct package name for your setup.

### Using Screenshots
- Take a screenshot, copy it, and paste it into the CLI
- You will see something like `[Image #1]` in the terminal
- After adding a Playwright MCP, Claude can use Playwright to take a screenshot of a webpage and use the information

### Extended Thinking ("Think a lot")
- Add at the end of a prompt to enable extended thinking
- Useful for creating tests and debugging
- Levels: `think` < `think hard` < `think harder` < `ultrathink`

### Parallel Subagents
- Add this phrase at the end of the prompt
- Spawns sub-Claude Code agents for tasks
- Useful for exploring multiple options to solve a problem (e.g., code refactoring)

### Custom Slash Commands
- https://docs.anthropic.com/en/docs/claude-code/slash-commands

### /install-github-app
- For pull requests, etc.

### Reference
- [Short Course by DLAI and Anthropic](https://learn.deeplearning.ai/courses/claude-code-a-highly-agentic-coding-assistant/lesson/66b35/introduction)
- [Official Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview)
- [Official Best Practices for Claude Code](https://www.anthropic.com/engineering/claude-code-best-practices)
