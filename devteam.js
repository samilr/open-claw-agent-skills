#!/usr/bin/env node
// dev-team/devteam.js — AI Dev Team Orchestrator for OpenClaw
// Uses Claude Opus 4.6 to run 7 specialized agents sequentially.

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import os from "os";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-opus-4-6";
const MAX_TOKENS = 1500;

const AGENTS = [
  {
    id: "pm",
    emoji: "📋",
    title: "PRODUCT MANAGER",
    system: `You are a senior Product Manager in a software development team.
Analyze the project request and produce a structured analysis with:
1. **User Stories** (3–5 key stories in "As a [user], I want [feature] so that [benefit]" format)
2. **Acceptance Criteria** (clear, testable criteria for each story)
3. **MVP Scope** (what's in scope vs out of scope for v1)
4. **Key Risks** (top 3 risks to watch)
Be concise, actionable, and think about the end user.
Respond in the same language as the project request.`,
  },
  {
    id: "architect",
    emoji: "🏗️",
    title: "SOFTWARE ARCHITECT",
    system: `You are a Software Architect in a software development team.
Based on the PM's requirements, design the technical solution:
1. **Tech Stack** (recommended technologies with justification)
2. **System Architecture** (components, services, data flow — use ASCII diagrams if helpful)
3. **Data Models** (key entities and their relationships)
4. **API Design** (key endpoints or service interfaces)
5. **Scalability Considerations** (how the system grows)
Be precise, technical, and pragmatic. Respond in the same language as the project request.`,
  },
  {
    id: "uiux",
    emoji: "🖌️",
    title: "UI/UX DESIGNER",
    system: `You are a Senior UI/UX Designer in a software development team.
Based on the PM requirements and architecture, design the full user experience:
1. **Design System** (color palette with hex codes, typography scale, spacing system, component library recommendation e.g. shadcn, MUI, Tailwind)
2. **Wireframes** (describe each key screen as a detailed ASCII layout or structured text, including element positions, sizes, and hierarchy)
3. **User Flows** (step-by-step journeys for the 3 most critical user tasks, with decision points and edge states)
4. **Interaction Design** (micro-interactions, hover/focus/active states, loading skeletons, transitions and their durations)
5. **Accessibility** (WCAG 2.1 AA requirements, color contrast ratios, keyboard navigation, ARIA labels, focus management)
6. **Design Tokens** (provide ready-to-use CSS custom properties: --color-*, --font-*, --shadow-*, --radius-*, --spacing-*)
Be visual, specific, and think about emotion, delight, and usability. Provide enough detail that a developer can implement without ambiguity.
Respond in the same language as the project request.`,
  },
  {
    id: "frontend",
    emoji: "🎨",
    title: "FRONTEND DEVELOPER",
    system: `You are a Senior Frontend Developer in a software development team.
Based on the PM requirements, architecture, and UI/UX design specs, plan the frontend implementation:
1. **UI Components** (list every component to build with its props, state, and purpose — follow the designer's design system)
2. **State Management** (how data flows through the UI, global vs local state, data fetching strategy)
3. **Key Screens/Views** (implement the designer's wireframes, describe the exact HTML structure and CSS approach)
4. **UX Considerations** (implement the designer's interaction specs: loading states, error handling, transitions, responsiveness)
5. **Implementation Priorities** (what to build first for fastest value delivery, estimated effort per component)
Follow the design tokens and component library specified by the UI/UX designer. Respond in the same language as the project request.`,
  },
  {
    id: "backend",
    emoji: "⚙️",
    title: "BACKEND DEVELOPER",
    system: `You are a Senior Backend Developer in a software development team.
Based on the PM requirements and architecture, plan the backend implementation:
1. **API Endpoints** (list with HTTP method, path, request/response structure)
2. **Business Logic** (key algorithms and processes to implement)
3. **Database Schema** (tables/collections with key fields)
4. **Authentication & Security** (auth strategy and security measures)
5. **Performance Considerations** (caching, queuing, optimization strategies)
Be thorough, think about edge cases and scalability. Respond in the same language as the project request.`,
  },
  {
    id: "qa",
    emoji: "🧪",
    title: "QA ENGINEER",
    system: `You are a QA Engineer in a software development team.
Review the entire team's work and provide quality analysis:
1. **Test Plan** (types of testing needed: unit, integration, e2e, performance)
2. **Critical Test Scenarios** (5–8 most important test cases to validate)
3. **Edge Cases & Risks** (potential failure points the team might have missed)
4. **Quality Gates** (criteria that must pass before release)
5. **Concerns & Recommendations** (anything the team should reconsider)
Be critical, thorough, and advocate for the end user. Respond in the same language as the project request.`,
  },
  {
    id: "devops",
    emoji: "🚀",
    title: "DEVOPS ENGINEER",
    system: `You are a DevOps Engineer in a software development team.
Based on the full project plan, define the deployment and operations strategy:
1. **Infrastructure** (cloud provider recommendation and key services to use)
2. **CI/CD Pipeline** (stages: build, test, staging, production deployment)
3. **Containerization** (Docker/Kubernetes strategy if applicable)
4. **Monitoring & Alerting** (key metrics to track, alerting thresholds)
5. **Estimated Costs & Timeline** (rough infra cost estimate and delivery timeline)
Focus on reliability, automation, and operational excellence. Respond in the same language as the project request.`,
  },
];

function separator(title, emoji) {
  const bar = "━".repeat(50);
  return `\n${bar}\n${emoji}  ${title}\n${bar}\n`;
}

async function callAgent(agent, messages) {
  process.stdout.write(separator(agent.title, agent.emoji));
  process.stdout.write("\n");

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: agent.system,
    messages,
  });

  let fullText = "";
  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta?.type === "text_delta"
    ) {
      process.stdout.write(event.delta.text);
      fullText += event.delta.text;
    }
  }

  process.stdout.write("\n");
  return fullText;
}

async function saveReport(projectDesc, outputs) {
  const reportsDir = path.join(os.homedir(), "openclaw-reports");
  fs.mkdirSync(reportsDir, { recursive: true });

  const slug = projectDesc
    .slice(0, 40)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const date = new Date().toISOString().split("T")[0];
  const filename = `${slug}-${date}.md`;
  const filepath = path.join(reportsDir, filename);

  const content = [
    `# AI Dev Team Report`,
    `**Project:** ${projectDesc}`,
    `**Date:** ${new Date().toLocaleString()}`,
    `**Model:** ${MODEL}`,
    `\n---\n`,
    ...AGENTS.map(
      (a, i) =>
        `## ${a.emoji} ${a.title}\n\n${outputs[i] || "_No output_"}\n`
    ),
  ].join("\n");

  fs.writeFileSync(filepath, content, "utf8");
  return filepath;
}

async function main() {
  const projectDesc = process.argv.slice(2).join(" ").trim();

  if (!projectDesc) {
    console.error(
      "Usage: node devteam.js <project description>\nExample: node devteam.js \"Build a task management app for remote teams\""
    );
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error(
      "❌ ANTHROPIC_API_KEY is not set.\nAdd it to your OpenClaw config:\n  ~/.openclaw/openclaw.json → skills.entries.dev-team.env.ANTHROPIC_API_KEY"
    );
    process.exit(1);
  }

  console.log(`\n🦞 AI DEV TEAM — Claude ${MODEL}`);
  console.log(`${"═".repeat(50)}`);
  console.log(`📝 Project: ${projectDesc}`);
  console.log(`👥 Agents: ${AGENTS.length} specialists (+ UI/UX Designer)`);
  console.log(`${"═".repeat(50)}\n`);

  const baseContext = `Project/Feature Request:\n${projectDesc}`;
  const outputs = [];

  // 1. PM
  const pmOut = await callAgent(AGENTS[0], [
    { role: "user", content: baseContext },
  ]);
  outputs.push(pmOut);

  // 2. Architect (reads PM)
  const archOut = await callAgent(AGENTS[1], [
    {
      role: "user",
      content: `${baseContext}\n\n=== PM REQUIREMENTS ===\n${pmOut}`,
    },
  ]);
  outputs.push(archOut);

  // 3. UI/UX Designer (reads PM + Arch)
  const uiuxOut = await callAgent(AGENTS[2], [
    {
      role: "user",
      content: `${baseContext}\n\n=== PM REQUIREMENTS ===\n${pmOut}\n\n=== ARCHITECTURE ===\n${archOut}`,
    },
  ]);
  outputs.push(uiuxOut);

  // 4. Frontend (reads PM + Arch + UI/UX)
  const feOut = await callAgent(AGENTS[3], [
    {
      role: "user",
      content: `${baseContext}\n\n=== PM REQUIREMENTS ===\n${pmOut}\n\n=== ARCHITECTURE ===\n${archOut}\n\n=== UI/UX DESIGN ===\n${uiuxOut}`,
    },
  ]);
  outputs.push(feOut);

  // 5. Backend (reads PM + Arch)
  const beOut = await callAgent(AGENTS[4], [
    {
      role: "user",
      content: `${baseContext}\n\n=== PM REQUIREMENTS ===\n${pmOut}\n\n=== ARCHITECTURE ===\n${archOut}`,
    },
  ]);
  outputs.push(beOut);

  // 6. QA (reads everything)
  const qaOut = await callAgent(AGENTS[5], [
    {
      role: "user",
      content: `${baseContext}\n\n=== PM ===\n${pmOut}\n\n=== ARCHITECTURE ===\n${archOut}\n\n=== UI/UX DESIGN ===\n${uiuxOut}\n\n=== FRONTEND ===\n${feOut}\n\n=== BACKEND ===\n${beOut}`,
    },
  ]);
  outputs.push(qaOut);

  // 7. DevOps (reads everything)
  const devopsOut = await callAgent(AGENTS[6], [
    {
      role: "user",
      content: `${baseContext}\n\n=== PM ===\n${pmOut}\n\n=== ARCHITECTURE ===\n${archOut}\n\n=== UI/UX DESIGN ===\n${uiuxOut}\n\n=== FRONTEND ===\n${feOut}\n\n=== BACKEND ===\n${beOut}`,
    },
  ]);
  outputs.push(devopsOut);

  // Save report
  const reportPath = await saveReport(projectDesc, outputs);

  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ All agents completed!`);
  console.log(`📄 Report saved → ${reportPath}`);
  console.log(`${"═".repeat(50)}\n`);
}

main().catch((err) => {
  console.error("❌ Dev team error:", err.message);
  process.exit(1);
});
