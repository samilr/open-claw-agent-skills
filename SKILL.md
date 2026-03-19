---
name: dev-team
description: >
  Orchestrates a virtual software development team of 6 AI agents (PM, Architect, 
  Frontend, Backend, QA, DevOps) powered by Claude Opus 4.6. Each agent builds on 
  the previous one's output to produce a full project analysis. Invoke when the user 
  wants to plan a software project, design a system, get a technical breakdown, or 
  say phrases like "analiza este proyecto", "diseña el sistema", "lanza el equipo de 
  desarrollo", "plan this feature", "design this app", "analyze this system".
version: 1.0.0
metadata:
  openclaw:
    emoji: "🦞"
    primaryEnv: ANTHROPIC_API_KEY
    requires:
      env:
        - ANTHROPIC_API_KEY
      bins:
        - node
    install:
      - kind: node
        package: "@anthropic-ai/sdk"
        bins: []
        label: "Install Anthropic SDK (npm)"
---

# 🦞 AI Dev Team — OpenClaw Skill

You now have access to a full virtual software development team. When this skill is active, you orchestrate 6 specialized AI agents that collaborate sequentially using Claude Opus 4.6.

## How It Works

When the user asks you to plan, design, or analyze a software project, run:

```bash
node ~/.openclaw/skills/dev-team/devteam.js "<user's project description>"
```

Then **stream each agent's output to the user as it arrives**, formatting each section clearly with the agent's name and role.

## Agent Pipeline (sequential — each reads the previous output)

```
User Request
    │
    ▼
📋 Product Manager     → User stories, acceptance criteria, MVP scope, risks
    │
    ▼
🏗️  Architect          → Tech stack, system design, data models, API design
    │
    ▼
🎨 Frontend Dev        → UI components, state management, screens, UX
    │  (parallel context from Architect)
    ▼
⚙️  Backend Dev        → API endpoints, DB schema, business logic, security
    │
    ▼
🧪 QA Engineer         → Test plan, critical scenarios, edge cases, quality gates
    │
    ▼
🚀 DevOps Engineer     → Infrastructure, CI/CD, monitoring, costs & timeline
```

## Output Format

For each agent, present their analysis like this:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PRODUCT MANAGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[agent output here]
```

After all agents complete, add a **Team Summary** with the key decisions and recommended next steps.

## Important Notes

- Always respond in the **same language as the user's project description**
- If `ANTHROPIC_API_KEY` is not set, instruct the user to add it to their OpenClaw config
- Each agent call may take 10–30 seconds — keep the user informed with progress updates
- Save the full report to `~/openclaw-reports/<project-slug>-<date>.md` after completion
