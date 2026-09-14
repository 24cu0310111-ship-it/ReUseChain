# Graph Report - ReUseChain  (2026-09-14)

## Corpus Check
- 81 files · ~87,397 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 2, .example 1, .prisma 1)

## Summary
- 431 nodes · 737 edges · 39 communities (23 shown, 12 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `81bfa934`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react
- run-telegram-bots.ts
- prisma.ts
- workflow.ts
- package.json
- compilerOptions
- Stage 2 — Production MVP
- ReUseChain AI Reasoning Engine - Maintenance & Architecture Guide
- simulate-day/route.ts
- windows-telemetry/route.ts
- external/route.ts
- telegram/route.ts
- layout.tsx
- Collect-WindowsTelemetry.ps1
- next-env.d.ts
- Stage 1 — Prototype
- ReUseChain-present1.md
- Website Overview
- ReUseChain: System Architecture & Knowledge Graph
- remediate/route.ts
- media/route.ts
- services/route.ts
- Introduction to GitHub
- approvals/route.ts
- settings/route.ts
- verify-wipe/route.ts
- keyboard/route.ts
- devDependencies
- intake/route.ts
- rules/graphify.md
- workflows/graphify.md
- dependencies
- gsd-help.md
- dispatch/route.ts
- cancel/route.ts

## God Nodes (most connected - your core abstractions)
1. `prisma` - 33 edges
2. `react` - 22 edges
3. `lucide-react` - 19 edges
4. `recordLearnedResolution()` - 15 edges
5. `compilerOptions` - 15 edges
6. `Button` - 14 edges
7. `Stage 2 — Production MVP` - 14 edges
8. `Badge()` - 13 edges
9. `cn()` - 12 edges
10. `Stage 1 — Prototype` - 12 edges

## Surprising Connections (you probably didn't know these)
- `pollBackupBot()` --calls--> `understandAndDiagnoseWithAi()`  [EXTRACTED]
  scripts/run-telegram-bots.ts → src/lib/hardware-ai-agent.ts
- `pollBackupBot()` --calls--> `findLearnedKnowledgeMatch()`  [EXTRACTED]
  scripts/run-telegram-bots.ts → src/lib/self-learning-agent.ts
- `pollBackupBot()` --calls--> `dispatchEscalationToTelegram()`  [EXTRACTED]
  scripts/run-telegram-bots.ts → src/lib/telegram-service.ts
- `pollBackupBot()` --calls--> `downloadTelegramFileAsBase64()`  [EXTRACTED]
  scripts/run-telegram-bots.ts → src/lib/telegram-service.ts
- `pollBackupBot()` --calls--> `sendTelegramMessage()`  [EXTRACTED]
  scripts/run-telegram-bots.ts → src/lib/telegram-service.ts

## Import Cycles
- None detected.

## Communities (39 total, 12 thin omitted)

### Community 0 - "react"
Cohesion: 0.09
Nodes (22): class-variance-authority, lucide-react, react, ActionProofDetails, ChatMessage, DiagnosticAssistantPage(), GraphEdge, GraphNode (+14 more)

### Community 1 - "run-telegram-bots.ts"
Cohesion: 0.09
Nodes (43): pollAdminBot(), pollBackupBot(), sha256(), runVerification(), runVerification(), execAsync, POST(), sha256() (+35 more)

### Community 2 - "prisma.ts"
Cohesion: 0.15
Nodes (4): dynamic, dynamic, dynamic, prisma

### Community 3 - "workflow.ts"
Cohesion: 0.10
Nodes (34): POST(), SimulatorPage(), AssessmentDossier, evaluateDeviceAfterlife(), sha256(), adminEscalationLoopNode(), compliancePolicyAgent(), createReUseChainWorkflow() (+26 more)

### Community 4 - "package.json"
Cohesion: 0.06
Nodes (32): name, private, scripts, build, dev, prisma:generate, prisma:push, seed (+24 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+9 more)

### Community 6 - "Stage 2 — Production MVP"
Cohesion: 0.11
Nodes (19): Acceptance Criteria Checklist, Circularity Passport Architecture, Configurable Automation Profile Schema, Curated Cross-Purpose Reuse Directory, Deterministic Server-Side Enforcement Order, End-to-End Decision, Approval & Custody Sequence, Goal and Scope, Initial Adaptation Algorithm (+11 more)

### Community 7 - "ReUseChain AI Reasoning Engine - Maintenance & Architecture Guide"
Cohesion: 0.22
Nodes (8): 1. Provider & Model Architecture, 2. Using & Maintaining Google Gemini Models, 3. Where Core Files Live, 4. How to Verify All Providers, ReUseChain AI Reasoning Engine - Maintenance & Architecture Guide, Step 1: Obtain a Gemini API Key, Step 2: Configure the Key (Two Methods), Step 3: Automatic Provider Auto-Detection & Fallback

### Community 8 - "simulate-day/route.ts"
Cohesion: 0.31
Nodes (7): GET(), dynamic, POST(), sha256(), analyzeComponentTrend(), HealthPoint, TrendAnalysisResult

### Community 9 - "windows-telemetry/route.ts"
Cohesion: 0.43
Nodes (7): ComponentDiagnosticStat, computeIndividualComponentStats(), execAsync, generateVectorEmbedding(), GET(), POST(), sha256()

### Community 10 - "external/route.ts"
Cohesion: 0.43
Nodes (6): deduceSpecificFailure(), ExternalDiagnosticPayload, generateVectorEmbedding(), POST(), RootCauseDossier, sha256()

### Community 11 - "telegram/route.ts"
Cohesion: 0.47
Nodes (4): analyzeScreenPhotoOrQuery(), POST(), ScreenPhotoAnalysis, sha256()

### Community 19 - "Stage 1 — Prototype"
Cohesion: 0.08
Nodes (24): 1. Component Health Classification, 2. Repairability Score Formula, 3. Economic Viability Rule, 4. Reuse Decision Framework, 5. Recycling Gating Criteria, Agent Tool Specification, Component-Level Disassembly & Afterlife Matrix, Explicitly Excluded Scope (+16 more)

### Community 20 - "ReUseChain-present1.md"
Cohesion: 0.17
Nodes (11): Above all the architecture everything will loops to different architecture literate accordingly in background., Comparison:, \-> data extraction: Through the application manually, live tracking of the pc, if it dies the external automation will allow u to telegram bot for support, \->data processing and improving : AI chat assist or the application will understand the user query ,issue ,policy ,if it doesn't  understand the query the immediate automation concern the admin then it asks what to answer the complex query and understands it and learn from the user or it will be updated periodically by the open source sales magazines for instance. It also consist of continuous loops running, \->execution according to the data: The chat bot or the application will takes the all the data by the chat text(Including telegram bot ),control panel (viewing control panel for predicting) and do the whole work without any human interaction ., Faults: This is where all the open-source hardware control software and proprietary software will get stuck., The application comes in and automate and solves the issues and supports the environment and sustainable life ., The impact: (+3 more)

### Community 21 - "Website Overview"
Cohesion: 0.17
Nodes (11): 1. Manual Data Entry, 2. Chat-Based Agent, 3. Final Action After Diagnosis, Complete Website Flow, If an anomaly is found, If no anomaly is found, If the agent cannot answer the user's query, Recycle (+3 more)

### Community 22 - "ReUseChain: System Architecture & Knowledge Graph"
Cohesion: 0.29
Nodes (6): 🌐 1. High-Level Distributed Topology Graph, 🔄 2. Three-Architecture Multi-Agent LangGraph State Machine, 📱 3. Dual Telegram Bot Event Flow Sequence, 🔐 4. Circularity Passport Blockchain Proof Chain, 🗂️ 5. Component & Source File Mapping Table, ReUseChain: System Architecture & Knowledge Graph

### Community 23 - "remediate/route.ts"
Cohesion: 0.47
Nodes (4): execAsync, POST(), RemediationStepResult, sha256()

### Community 24 - "media/route.ts"
Cohesion: 0.60
Nodes (3): generateVectorEmbedding(), POST(), sha256()

### Community 25 - "services/route.ts"
Cohesion: 0.60
Nodes (3): parseSingleTurnPrompt(), POST(), sha256()

### Community 26 - "Introduction to GitHub"
Cohesion: 0.50
Nodes (3): Introduction to GitHub, :keyboard: Activity: Your first branch, Step 1: Create a branch

### Community 29 - "verify-wipe/route.ts"
Cohesion: 0.67
Nodes (3): dynamic, POST(), sha256()

### Community 31 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, postcss, prisma, tailwindcss, tailwindcss-animate, tsx, @types/node (+3 more)

### Community 35 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, class-variance-authority, clsx, @langchain/core, @langchain/langgraph, lucide-react, next, @prisma/client (+4 more)

## Knowledge Gaps
- **167 isolated node(s):** `name`, `version`, `private`, `dev`, `build` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 218 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@prisma/client` connect `package.json` to `prisma.ts`?**
  _High betweenness centrality (0.200) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `workflow.ts`, `package.json`, `layout.tsx`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `prisma` connect `prisma.ts` to `intake/route.ts`, `run-telegram-bots.ts`, `workflow.ts`, `dispatch/route.ts`, `cancel/route.ts`, `simulate-day/route.ts`, `windows-telemetry/route.ts`, `external/route.ts`, `telegram/route.ts`, `remediate/route.ts`, `media/route.ts`, `services/route.ts`, `approvals/route.ts`, `settings/route.ts`, `verify-wipe/route.ts`, `keyboard/route.ts`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.09435028248587571 - nodes in this community are weakly interconnected._
- **Should `run-telegram-bots.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08942139099941554 - nodes in this community are weakly interconnected._
- **Should `workflow.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1039136302294197 - nodes in this community are weakly interconnected._