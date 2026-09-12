# ReUseChain Implementation Plan

## Product Outcome

**ReUseChain** is a device-afterlife operating system designed for colleges, universities, and corporate office fleets. It continuously monitors device and component health, then manages a governed, transparent decision loop whenever a device or sub-component declines in health or enters retirement:

1. **Repair** the specific component when diagnostic evidence and economic viability justify it;
2. **Reuse** the device or component in its current role or in an authorized cross-purpose secondary role;
3. **Recycle** strictly as a proven last resort, only after repair and all reuse paths are empirically documented as non-viable.

Every decision, piece of evidence, approval, and custody event is immutably recorded in a **Circularity Passport**. The organization configures autonomy separately across repair, reuse, and recycling workflows while enforcing hard compliance and safety guardrails.

---

## Non-Negotiable Product Principles

- **Component-Level Granularity:** Make decisions at the component level; a failing battery does not make the NVMe SSD, DDR RAM, display panel, charger, or laptop chassis e-waste.
- **Evidence-Backed Justifications:** Present verifiable evidence behind every recommendation: hardware telemetry, service manuals, compatible part numbers, competitive technician quotes, organizational policy rules, and historical outcome accuracy.
- **Recycling as the Absolute Last Resort:** Treat recycling as the final option, never the default.
- **Separation of Governance Concerns:** Strictly separate recommendation (agent), policy verification (server-side rules engine), human approval (authorization queue), execution (dispatch/orders), and outcome verification.
- **Zero Hallucinated Safety or Compliance:** Never claim an AI verified data erasure, a battery is safe, or a recycler is certified without trusted cryptographic or partner-attested proof.
- **Privacy by Design:** Zero ingestion of employee/student personal files, browsing history, camera feeds, biometrics, or keystrokes. Telemetry is strictly restricted to hardware diagnostics.

---

## System Architecture & Governed Decision Waterfall

The following 2D Mermaid diagram details the overarching architecture and priority waterfall that governs ReUseChain across all stages.

```mermaid
flowchart TD
    subgraph INTAKE["1. Diagnostic Ingestion & Fleet Telemetry"]
        DEV["Decommissioned or Flagged Device"]
        NORM["Telemetry Normalizer & PII Redactor"]
        COMP["Component Decomposer<br/>(Battery, Storage, Memory, Display, Logic Board)"]
        DEV --> NORM --> COMP
    end

    subgraph WATERFALL["2. Governed Decision Loop (Priority Cascade)"]
        direction TB
        P1{"1. Can specific component<br/>be repaired economically?"}
        P2{"2. Can device / component<br/>be redeployed or repurposed?"}
        P3{"3. Certified Recycling<br/>(Strict Last Resort)"}

        P1 -- "Yes (Score >= 0.65 & Cost <= 40%)" --> ACT_REPAIR["Action: Precision Component Repair & Calibration"]
        P1 -- "No (Irreparable / Uneconomical)" --> P2

        P2 -- "Yes: Same-Role Fit" --> ACT_REUSE_SAME["Action: Internal Fleet Redeployment (Kiosks / Labs)"]
        P2 -- "Yes: Cross-Purpose Fit" --> ACT_REUSE_CROSS["Action: Harvest Component to Spares / Projects Pool"]
        P2 -- "No (No Safe Role Compatible)" --> P3

        P3 -- "Valid Wipe Cert + Certified R2 Recycler" --> ACT_RECYCLE["Action: Certified Responsible E-Waste Recycling"]
        P3 -- "Missing Wipe Proof or Unverified Partner" --> BLOCK_RECYCLE["BLOCKED: Quarantine in Storage Until Proven"]
    end

    subgraph GOVERNANCE["3. Policy Engine & Autonomy Tiering"]
        direction TB
        TIER_GREEN["GREEN: Read-only / Draft quotes<br/>-> Auto-Execute"]
        TIER_AMBER["AMBER: Purchase orders / Role change<br/>-> Human Approval Queue"]
        TIER_RED["RED: Swollen battery / Unverified wipe<br/>-> Hard Block & Quarantine"]
    end

    subgraph AUDIT["4. Immutable Circularity Passport"]
        PASSPORT[("Circularity Passport<br/>(Cryptographic Append-Only Event Stream)")]
    end

    COMP --> P1
    ACT_REPAIR --> TIER_AMBER
    ACT_REUSE_SAME --> TIER_AMBER
    ACT_REUSE_CROSS --> TIER_AMBER
    ACT_RECYCLE --> TIER_AMBER
    BLOCK_RECYCLE --> TIER_RED

    TIER_GREEN --> PASSPORT
    TIER_AMBER --> PASSPORT
    TIER_RED --> PASSPORT
```

---

## Component-Level Disassembly & Afterlife Matrix

Traditional e-waste practices treat a computer as a monolithic waste unit. ReUseChain executes a 2D component-level decomposition to extract maximum circular value.

```mermaid
flowchart LR
    subgraph ASSET["Physical Asset Ingestion"]
        LAPTOP["Target Asset: Laptop / Desktop"]
    end

    subgraph COMPONENTS["Component-Level Breakdown"]
        direction TB
        BATT["Battery Pack<br/>• Health % & Capacity<br/>• Cycle Count & Swell State"]
        SSD["Storage (NVMe / SATA)<br/>• SMART Health %<br/>• Wear Level & Sanitization"]
        RAM["System Memory (DDR)<br/>• MemTest Results<br/>• Slot Config & Density"]
        DISP["Chassis & Panel<br/>• Screen Condition<br/>• Hinge & Port Integrity"]
        MOBO["Motherboard & CPU<br/>• Power Rails & VRM<br/>• Peripheral Controllers"]
    end

    subgraph AFTERLIFE["Afterlife Destination Matrix"]
        direction TB
        DEST_REP["Repair & OEM Replacement<br/>(Restore primary asset)"]
        DEST_SAME["Same-Role Redeployment<br/>(Classroom, kiosk, thin client)"]
        DEST_POOL["Internal Spares Pool<br/>(Maintenance inventory for active fleet)"]
        DEST_PROJ["Specialized Maker / IoT Projects<br/>(Open-frame digital signage, headless nodes)"]
        DEST_RECYC["Certified R2 / e-Stewards Recycling<br/>(Safe materials recovery)"]
    end

    LAPTOP --> BATT
    LAPTOP --> SSD
    LAPTOP --> RAM
    LAPTOP --> DISP
    LAPTOP --> MOBO

    BATT -- "Health >= 80% & No Swell" --> DEST_REP
    BATT -- "Degraded (<60%) or Swollen" --> DEST_RECYC
    SSD -- "Healthy + NIST 800-88 Wiped" --> DEST_POOL
    RAM -- "Passed MemTest86" --> DEST_POOL
    DISP -- "Functional Display & Hinges" --> DEST_SAME
    MOBO -- "Screen Failed, Logic Board OK" --> DEST_PROJ
    MOBO -- "Fried VRM / Shorted Traces" --> DEST_RECYC
```

---

# Stage 1 — Prototype

## Goal and Scope

Build a polished, end-to-end interactive demo proving the three-path agentic workflow, deterministic policy enforcement, and the feedback learning loop using deterministic mock data. This stage is designed for a 2–3 week initial pilot or proof of concept.

### Included Scope

- **Device Intake:** Web intake form and uploaded JSON/CSV diagnostic reports.
- **Component Coverage:** In-depth evaluation for Battery, SSD, and RAM (display, chassis, and keyboard as static attributes).
- **Three Afterlife Paths:** Component-level repair, internal reuse (same-role & cross-purpose), and certified recycling.
- **Curated Catalogues:** Curated parts/manual catalogue, cross-purpose reuse map, approved recycler directory, and simulated technician quote engine.
- **Per-Path Automation Settings:**
  1. *Advisory* (recommendation only)
  2. *Draft & Assist* (creates drafts, awaits review)
  3. *Auto within Policy* (auto-executes under threshold)
  4. *Full Autonomy within Guardrails* (executes Green/Amber, stops at Red)
- **Policy Engine:** Green / Amber / Red risk boundary evaluator, approval queue, and audit timeline.
- **Monitoring Simulation:** Seeded historical diagnostic samples demonstrating degradation slope triggers.
- **Demonstration Cases:** Four seeded operational scenarios (repair, cross-purpose reuse, recycle-after-proof, and preventative degradation alert).

### Explicitly Excluded Scope

- Real financial purchases, recycler contracts, emails, payments, or physical courier dispatches.
- Live OS agent deployment, real enterprise fleet MDM credentials, or live vendor API secrets.
- Autonomous alterations to hard security policies without administrator consent.

---

## Prototype 2D Architecture

The prototype separates presentation, agent reasoning, server-side policy enforcement, and immutable audit storage.

```mermaid
flowchart TB
    subgraph CLIENT["Client Layer (Next.js + TypeScript + Vanilla CSS / Tailwind)"]
        UI_DASH["Fleet & Component Dashboard"]
        UI_INTAKE["Intake Form & Telemetry Upload"]
        UI_SIM["Future Decision Simulator"]
        UI_QUEUE["Human-in-the-Loop Approval Queue"]
        UI_PASS["Circularity Passport Timeline"]
    end

    subgraph CORE_SERVICES["Orchestration & Decision Services"]
        AGENT["Tool-Calling LLM Orchestrator<br/>• Formulates Plan<br/>• Explains Trade-offs<br/>• Calls Structured Tools"]
        POLICY["Deterministic Server-Side Policy Engine<br/>• Enforces Green / Amber / Red<br/>• Validates Spending Caps<br/>• Enforces Hard Safety Blocks"]
    end

    subgraph TOOL_SUITE["Mock Evidence & Partner Tools"]
        T_HEALTH["get_component_health()"]
        T_CATALOG["search_manual_and_parts()"]
        T_QUOTE["request_quote()"]
        T_REUSE["find_reuse_options()"]
        T_RECYCLER["find_verified_recycler()"]
        T_EVAL["evaluate_policy()"]
    end

    subgraph PERSISTENCE["Data & Audit Storage (SQLite)"]
        DB_ASSET[("Assets & Components")]
        DB_POLICY[("Organization Rules & Limits")]
        DB_PASSPORT[("Append-Only Passport Stream")]
        DB_FEEDBACK[("Learning & Outcome Metrics")]
    end

    UI_INTAKE --> AGENT
    UI_SIM --> AGENT
    AGENT <--> POLICY
    AGENT --> T_HEALTH
    AGENT --> T_CATALOG
    AGENT --> T_QUOTE
    AGENT --> T_REUSE
    AGENT --> T_RECYCLER
    AGENT --> T_EVAL

    T_HEALTH <--> DB_ASSET
    POLICY <--> DB_POLICY
    POLICY --> UI_QUEUE
    UI_QUEUE --> DB_PASSPORT
    POLICY --> DB_PASSPORT
    DB_PASSPORT --> UI_PASS
    DB_FEEDBACK --> UI_DASH
```

---

## Prototype State & Governed Lifecycle Flow

```mermaid
stateDiagram-v2
    [*] --> Monitored: Asset Enrolled
    Monitored --> Flagged: Wear Threshold Crossed / Retirement Request
    
    state "Evidence Gathering (Agent)" as EvidenceGathering {
        [*] --> FetchTelemetry
        FetchTelemetry --> InspectManuals: Health Normalized
        InspectManuals --> RequestQuotes: Compatible Parts Found
        RequestQuotes --> QueryReuseCatalog: Evaluate Role Fit
        QueryReuseCatalog --> [*]
    }
    Flagged --> EvidenceGathering

    state "Decision Waterfall" as DecisionWaterfall {
        state "1. Repair Evaluation" as RepairEval
        state "2. Reuse Evaluation" as ReuseEval
        state "3. Recycle Evaluation" as RecycleEval

        [*] --> RepairEval
        RepairEval --> RepairCandidate: Viable Part + Cost <= 40%
        RepairEval --> ReuseEval: Irreparable or High Cost

        ReuseEval --> SameRoleCandidate: Eligible for Kiosk / Lab Role
        ReuseEval --> CrossPurposeCandidate: Component Harvester Found
        ReuseEval --> RecycleEval: All Reuse Options Infeasible

        RecycleEval --> RecycleCandidate: Hard Evidence of Exhaustion
        RecycleEval --> BlockedState: Missing Wipe / Unapproved Partner
    }
    EvidenceGathering --> DecisionWaterfall

    state "Governance & Execution" as Governance {
        state "Risk Assessment" as RiskAssess
        state "Approval Queue (Amber)" as AmberQueue
        state "Auto-Execution (Green)" as GreenExec
        state "Hard Block (Red)" as RedBlock

        [*] --> RiskAssess
        RiskAssess --> GreenExec: Low-Risk Action (Draft / Log)
        RiskAssess --> AmberQueue: External Cost / Role Reassignment
        RiskAssess --> RedBlock: Swollen Cell / Unverified Data Wipe

        AmberQueue --> Executed: Human Approves
        AmberQueue --> Terminated: Human Rejects
        GreenExec --> Executed: Auto-Dispatched
    }

    RepairCandidate --> Governance
    SameRoleCandidate --> Governance
    CrossPurposeCandidate --> Governance
    RecycleCandidate --> Governance

    Executed --> OutcomeVerification: Work Completed
    OutcomeVerification --> Monitored: Redeployed
    OutcomeVerification --> Archived: Certified Recycled
    RedBlock --> Remediation: Require Manual Intervention
    Terminated --> [*]
    Archived --> [*]
```

---

## Prototype Technical Stack

| Layer | Recommended Choice | Rationale |
|---|---|---|
| **Front End** | Next.js (App Router), TypeScript, Vanilla CSS / Tailwind | Rapid dashboard prototyping, rich timeline visualizer, server-side data rendering. |
| **API & Backend** | Next.js Route Handlers or FastAPI | Clean separation of orchestration routes, strict type safety, low latency. |
| **Database** | SQLite + Prisma / Drizzle | Lightweight single-file database, zero configuration overhead, rapid migration. |
| **Agent Core** | Structured Tool-Calling LLM (OpenAI / Claude / Gemini) | Generates structured tool calls and explanations; restricted from direct DB writes. |
| **Policy Engine** | Pure Server-Side Rules Engine (TypeScript / Python) | 100% deterministic gating of risk tiers, spending caps, and safety limits. |
| **Visualizations** | Recharts & Mermaid.js | Component degradation curves, circularity split charts, dynamic workflow diagrams. |
| **Authentication** | Demo Role Switcher (Admin / Approver / Tech) | Zero-friction role switching for demonstration of approval workflows. |

---

## Prototype Entity-Relationship Data Model

```mermaid
erDiagram
    DEVICE ||--|{ COMPONENT : owns
    DEVICE ||--o{ DIAGNOSTIC_REPORT : receives
    DEVICE ||--o{ DECISION_CASE : evaluates
    DEVICE ||--o{ PASSPORT_EVENT : logs
    COMPONENT ||--o{ HEALTH_SAMPLE : tracks
    COMPONENT ||--o{ REPAIR_QUOTE : quotes
    COMPONENT ||--o{ DECISION_CASE : assesses
    COMPONENT ||--o{ PASSPORT_EVENT : logs
    DECISION_CASE ||--o| APPROVAL : requires
    DECISION_CASE ||--o| OUTCOME : resolves

    DEVICE {
        string id PK
        string serial_hash
        string organisation
        string make
        string model
        int age_months
        string lifecycle_status
    }

    COMPONENT {
        string id PK
        string device_id FK
        string type
        string model
        boolean replaceable
        string pairing_restriction
        string current_health_status
    }

    HEALTH_SAMPLE {
        string id PK
        string component_id FK
        datetime timestamp
        string metric_name
        float metric_value
        string source
        string confidence
    }

    MANUAL_PART {
        string id PK
        string device_model
        string component_type
        string compatible_part_no
        string manual_url
        float estimated_cost
        boolean is_available
    }

    REPAIR_QUOTE {
        string id PK
        string component_id FK
        float labour_cost
        float part_cost
        string vendor_name
        string status
        datetime expiry
    }

    REUSE_OPTION {
        string id PK
        string component_type
        string target_role
        string prerequisites
        string safety_notes
        string policy_status
    }

    DECISION_CASE {
        string id PK
        string device_id FK
        string component_id FK
        string recommended_path
        float confidence_score
        string justification
        string policy_version
        string risk_tier
    }

    APPROVAL {
        string id PK
        string case_id FK
        string requested_action
        string risk_tier
        string approver_role
        string approver_identity
        string decision
        datetime reviewed_at
    }

    PASSPORT_EVENT {
        string id PK
        string device_id FK
        string component_id FK
        string event_type
        string actor
        json evidence_refs
        string event_hash
        datetime timestamp
    }

    OUTCOME {
        string id PK
        string case_id FK
        string actual_result
        float actual_cost
        int useful_life_months
        string verified_by
        datetime recorded_at
    }
```

---

## Prototype Decision Logic & Scoring Formulas

### 1. Component Health Classification

- **Battery:** Compares full-charge capacity with design capacity; evaluates cycle count and the slope of capacity decline across historical samples.
- **SSD:** Ingests SMART-style health indicators: wear level percentage, uncorrectable error counts, reallocated sectors, and vendor predictive failure warnings.
- **RAM:** Evaluates memory test results, ECC error logs, capacity threshold, and whether the mainboard has available free expansion slots.
- **Unknown or Contradictory Data:** Routes directly to technician manual review; fabricating or guessing diagnostic conclusions is strictly prohibited.

### 2. Repairability Score Formula

The server calculates a transparent, deterministic repairability score $S_{\text{repair}} \in [0.0, 1.0]$:

$$S_{\text{repair}} = (w_1 \cdot P_{\text{avail}}) + (w_2 \cdot M_{\text{avail}}) + (w_3 \cdot C_{\text{replace}}) + (w_4 \cdot \neg B_{\text{pairing}}) + (w_5 \cdot T_{\text{skill}})$$

Where weights default to $w_1 = 0.25, w_2 = 0.20, w_3 = 0.25, w_4 = 0.20, w_5 = 0.10$, and:
- $P_{\text{avail}}$: Compatible part available from approved source ($1.0$ or $0.0$).
- $M_{\text{avail}}$: Official service manual or verified procedure available ($1.0$ or $0.0$).
- $C_{\text{replace}}$: Component physically modular/replaceable ($1.0$ modular, $0.5$ glued/bracketed, $0.0$ soldered).
- $\neg B_{\text{pairing}}$: No blocking parts-pairing/cryptographic calibration restriction ($1.0$ if free, $0.0$ if blocked).
- $T_{\text{skill}}$: Feasible within approved technician tier ($1.0$ internal, $0.7$ external certified).

Each check is shown individually in the UI; the LLM only generates natural language explanations for the server-calculated score.

### 3. Economic Viability Rule

A repair is deemed economically viable only when:

$$\text{Total Repair Cost} (\text{Part} + \text{Labour}) \le 0.40 \times \text{Fair Market Value of Refurbished Replacement}$$

$$\text{Predicted Extended Life} \ge 18 \text{ Months}$$

$$S_{\text{repair}} \ge 0.65$$

*Note:* Threshold values are organizationally configurable, version-tracked, and recorded in the Circularity Passport.

### 4. Reuse Decision Framework

- **Same-Role Reuse:** Compares healthy or repaired device specifications against institutional baseline specs for secondary roles (e.g., student coding lab, library catalogue terminal, browser kiosk, Linux learning lab).
- **Cross-Purpose Reuse:** Queries the curated reuse map before considering disposal (e.g., healthy SSD $\rightarrow$ spare storage pool; working RAM $\rightarrow$ compatible-device upgrade pool; working logic board with shattered display $\rightarrow$ approved signage / open-frame lab node).
- **Safety Gate:** High-risk components (swollen Li-ion batteries, damaged power circuitry) cannot enter secondary reuse without senior electrical technician sign-off.

### 5. Recycling Gating Criteria

Recycling can **only** be recommended when all 5 conditions evaluate to true:

```text
repair = not viable (physical or economic failure)
same-role reuse = no compatible internal role found
cross-purpose reuse = no safe, approved option available
data status = NIST 800-88 sanitization certificate verified
recycler = verified R2v3 / e-Stewards approved partner
```

---

## Agent Tool Specification

| Tool | Input | Output | Side Effect in Prototype |
|---|---|---|---|
| `get_component_health` | `component_id` | Normalized health metrics, trend slope | None (Read-only) |
| `get_device_context` | `device_id` | Age, repair history, current role | None (Read-only) |
| `search_manual_and_parts` | `model, component_type` | Service manual URL, compatible part numbers, restrictions | None (Read-only) |
| `request_quote` | `component_id, part_no` | Simulated labour cost, part cost, turnaround time | Creates a draft quote record |
| `find_reuse_options` | `component_id, health_state` | Eligible same-role and cross-purpose roles | None (Read-only) |
| `find_verified_recycler` | `location, category` | Approved mock recycler name, certifications | None (Read-only) |
| `evaluate_policy` | `proposed_action` | Risk tier (Green/Amber/Red), policy version, block reason | None (Read-only) |
| `create_approval_request` | `case_id, proposed_action` | Approval ticket ID, approver role required | Creates approval record |
| `append_passport_event` | `event_payload` | Audit event ID, timestamp, hash | Append-only event commit |
| `record_outcome` | `verified_result` | Updated accuracy feedback record | Stores human-confirmed result |

---

## Guardrails & Autonomy Configuration

```mermaid
flowchart TD
    subgraph TIERS["Autonomy Tier Classification"]
        direction TB
        G["GREEN TIER (Low Risk)<br/>• Retrieve diagnostic telemetry<br/>• Search manuals and parts catalogue<br/>• Draft simulated repair quotes<br/>• Query certified recycler directory"]
        A["AMBER TIER (Moderate Risk)<br/>• Approve repair purchase order<br/>• Assign hardware to secondary reuse role<br/>• Create mock recycler application<br/>• Close maintenance case"]
        R["RED TIER (Critical Boundary)<br/>• Declare data wipe verified without certificate<br/>• Dispose of or salvage swollen battery<br/>• Dispatch hardware to uncertified recycler<br/>• Delete or alter diagnostic history"]
    end

    subgraph ACTIONS["Execution Enforcement"]
        direction TB
        EXEC_AUTO["Auto-Execute & Log to Passport"]
        EXEC_QUEUE["Approval Queue<br/>(Requires Explicit Human Sign-Off)"]
        EXEC_BLOCK["Hard Block & Log Exception<br/>(Execution Prohibited)"]
    end

    G --> EXEC_AUTO
    A --> EXEC_QUEUE
    R --> EXEC_BLOCK
```

The system stores separate automation configuration profiles for `repair`, `same_role_reuse`, `cross_purpose_reuse`, and `recycle`.

---

## Prototype Screen Specifications

- **Fleet Dashboard:** Real-time count of monitored assets, flagged components, afterlife pathway distributions (Repair vs Reuse vs Recycle), and pending approval queue items.
- **Device Intake:** Device metadata registration form plus drag-and-drop diagnostic JSON/CSV file parser.
- **Component Detail:** Interactive wear trajectory chart, raw evidence tables, service manual viewer, compatible parts catalogue, and repairability score breakdown.
- **Future Simulator:** Interactive 4-way decision simulator comparing repair vs same-role reuse vs cross-purpose reuse vs recycling with clear justifications for each.
- **Approval Queue:** Case triage view displaying proposed action, risk tier, linked evidence dossier, and approve/reject controls.
- **Circularity Passport:** Chronological, immutable timeline capturing events from initial intake through final outcome verification.
- **Learning Dashboard:** Aggregate analytics tracking repair success rate, cost prediction accuracy, false flag frequency, and common non-repairable parts.

---

## Prototype Seeded Demo Cases

- **Case A — Precision Repair:** Laptop with 52% battery capacity, healthy SSD/RAM, compatible OEM battery available ($45), approved repair quote ($70 total cost). Result: Repair approved and redeployed (+24 months life extension).
- **Case B — Cross-Purpose Reuse:** Laptop with cracked, irreparable display panel, but healthy 16GB DDR4 RAM and 512GB NVMe SSD. Result: SSD and RAM harvested into internal spares pool; motherboard repurposed for pre-approved kiosk/signage project under Amber approval.
- **Case C — Certified Recycling After Proof:** Laptop with fatal motherboard short, no replacement available, no safe reuse path. Data sanitization status initially unverified. Result: Disposal blocked in Red status until verified wipe record is uploaded; once verified, dispatches to certified mock recycler with tracking ID.
- **Case D — Predictive Early Degradation:** Battery capacity declining at $3\times$ the baseline fleet degradation slope. Result: Generates preventative maintenance checkup recommendation prior to unexpected hardware failure.

---

## Prototype Delivery Plan

| Time | Deliverable | Completion Check |
|---|---|---|
| **Day 1** | Data schema, seeded cases, base UI | 4 devices visible with component records and health grades. |
| **Day 2** | Rule engine, parts/manual/quote tools | Repair/reuse/recycle recommendations deterministic from seeded data. |
| **Day 3** | Agent orchestration and evidence explanations | Agent calls tools sequentially and cannot bypass policy engine. |
| **Day 4** | Approval queue and Circularity Passport | Every state-changing action appears immutably in timeline. |
| **Day 5** | Daily-monitoring simulation and learning view | Battery decline triggers proactive flag; human outcome updates stats. |
| **Day 6** | Demo polish and adversarial testing | Unverified wipe and unapproved recyclers are strictly blocked. |

---

# Stage 2 — Production MVP

## Goal and Scope

Transition the proven prototype into a deployable enterprise pilot across 50–250 Windows laptops within a college campus or corporate department. Stage 2 supports consented real telemetry collection, dependable auditability, certified partner connectors, configurable policy rules, and controlled external execution.

### MVP Success Definition

- IT staff enroll fleet laptops through a lightweight Windows collector or existing MDM export (Intune/SCCM).
- System detects hardware degradation 30+ days before failure and manages real retirement cases.
- Every external action is policy-gated, idempotent, and auditable.
- Pilot organization measures repair success, reuse rate, avoided disposal (kg), cost savings, and decision accuracy.

---

## MVP 2D Enterprise Architecture

```mermaid
flowchart TB
    subgraph FLEET["Managed Device Fleet (Pilot Endpoints)"]
        A["Windows Diagnostic Collector<br/>• Minimal WMI/SMART Telemetry<br/>• Battery Cycle & Health<br/>• Signed JSON Payload"]
        B["Existing MDM / Asset Export<br/>(Microsoft Intune / SCCM / JAMF)"]
    end

    subgraph INGESTION["Secure Ingestion & Validation Gateway"]
        C["Secure Ingestion API Gateway<br/>• mTLS / Token Authentication<br/>• PII Redaction & Minimization<br/>• SHA-256 Checksum Validation"]
        E[("Encrypted Object Storage<br/>(Raw Diagnostic Blobs & Wipe Certs)")]
    end

    subgraph DATA_TIER["Core Data & Audit Tier (PostgreSQL)"]
        D[("PostgreSQL Database<br/>• Assets & Components<br/>• Daily Health Time-Series<br/>• Policy Configurations")]
        PASS_DB[("Circularity Passport Table<br/>• Append-Only Hash Chain<br/>• Immutable Audit Ledger")]
    end

    subgraph ENGINES["Processing & Intelligence Engines"]
        F["Telemetry Scheduler & Ingestion Worker"]
        TREND["Predictive Time-Series Trend Engine<br/>• Rolling Median & EMA<br/>• Cohort Baseline Comparison<br/>• Degradation Velocity Alerts"]
        G["Case Creation & Triage Service"]
        H["Agent Orchestrator Service<br/>• Multi-Tool Evidence Assembly<br/>• Natural-Language Justifications"]
        M["Enterprise Policy & Risk Engine<br/>• Spending Caps & Tier Evaluation<br/>• Idempotency Gatekeeper"]
    end

    subgraph ADAPTERS["External Partner & Service Connectors"]
        I["Parts / Manual Provider Adapter"]
        J["Technician / Quote Portal Connector"]
        K["Approved Partner & Reuse Registry"]
        L["Recycler / Refurbisher Sandbox API"]
        NOTIFY["Corporate Alerts (Teams / Slack / Email)"]
    end

    subgraph APPS["Stakeholder Web Portals"]
        P["Human Approval Queue UI"]
        Q["Exception & Compliance Queue"]
        S["Passport, Analytics & Admin UI"]
    end

    A --> C
    B --> C
    C --> D
    C --> E
    D --> F
    F --> TREND
    TREND --> G
    G --> H
    H --> I
    H --> J
    H --> K
    H --> L
    H <--> M

    M -->|Green / Auto| O["Execution Worker"]
    M -->|Amber / Review| P
    M -->|Red / Blocked| Q
    P --> O
    O --> NOTIFY
    O --> PASS_DB
    PASS_DB --> S
    D --> S
```

---

## Telemetry Ingestion & Privacy Specification

- **Windows Only Initial Scope:** Focus exclusively on Windows 10/11 endpoints; add macOS/Linux after pilot validation.
- **Privacy Minimization:** The collector transmits strictly bounded hardware health metrics. Zero ingestion of user files, browsing logs, keystrokes, camera feeds, or microphones.
- **Reporting Schedule:** Daily collection by default. Device owners/admins receive clear notification and institutional authorization.

### Sample Normalized Telemetry Payload

```json
{
  "deviceExternalId": "asset-univ-0412",
  "organizationId": "org-hindustan-campus",
  "reportedAt": "2026-09-12T09:00:00Z",
  "collectorVersion": "1.0.4",
  "hardwareSummary": {
    "make": "Dell Inc.",
    "model": "Latitude 5420",
    "biosVersion": "1.14.1",
    "totalMemoryGb": 16
  },
  "components": [
    {
      "type": "battery",
      "serialHash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      "designCapacityWh": 63.0,
      "fullChargeCapacityWh": 32.5,
      "cycleCount": 712,
      "temperatureCelsius": 28.1,
      "source": "os_battery_report",
      "confidence": "high"
    },
    {
      "type": "ssd",
      "deviceIndex": 0,
      "model": "KIOXIA KBG40ZNS512G NVMe",
      "sizeGb": 512,
      "healthPercent": 74,
      "powerOnHours": 6840,
      "predictiveFailure": false,
      "source": "approved_drive_health_provider",
      "confidence": "high"
    }
  ]
}
```

---

## Predictive Health Monitoring & Baseline Calibration

```mermaid
flowchart LR
    subgraph INGEST["1. Telemetry Ingestion"]
        A["Daily Health Samples<br/>• Full Charge Wh<br/>• Drive Wear Level<br/>• Temperature Peaks"]
        B["Validation & Normalization<br/>• Schema Validation<br/>• Outlier Cleansing"]
        A --> B
    end

    subgraph ANALYSIS["2. 2D Trend & Statistical Engine"]
        direction TB
        C["Per-Component Time Series<br/>(Rolling Median + EMA)"]
        D["Cohort Baseline Profiler<br/>(Model + Component + Age Band)"]
        E["Device Degradation Velocity<br/>(Slope: ΔCapacity / ΔTime)"]
        F{"Decline / Anomaly<br/>Threshold Crossed?"}

        B --> C
        C --> D
        C --> E
        D --> F
        E --> F
    end

    subgraph ACTION["3. Governed Action"]
        direction TB
        H["Continue Routine Monitoring"]
        I["Create Preventative Review Case"]
        J["Agent Gathers Context & Quotes"]
        K["Policy Determines Action<br/>(Inspect / Repair / Retire)"]

        F -- "No" --> H
        F -- "Yes" --> I
        I --> J --> K
    end

    subgraph FEEDBACK["4. Closed Feedback Loop"]
        L["Human Verification & Field Outcome<br/>(True Positive vs False Alert)"]
        K --> L
        L --> D
    end
```

### Initial Adaptation Algorithm

- Use interpretable statistical methods before ML complexity:
  - Rolling median and exponential moving average (EMA) for health metrics;
  - Linear regression slope of decline over a fixed 30-day window;
  - Comparison against model-family baseline cohorts;
  - Alert triggered only when both absolute health threshold and decline velocity are exceeded.
- Record reviewer dispositions: *useful proactive flag, unnecessary alert, false diagnostic, repair successful, repair failed*.
- Recalculate baseline cohorts periodically from verified outcome data.
- Policy changes require administrator approval; learning improves evidence ranking but cannot weaken Red boundaries.

---

## End-to-End Decision, Approval & Custody Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Admin as IT Asset Admin
    participant Ingest as Ingestion API Gateway
    participant Trend as Trend & Anomaly Engine
    participant Agent as Agent Orchestrator
    participant Policy as Policy & Risk Engine
    participant Partner as External Connector (Parts/Quote)
    participant Passport as Circularity Passport (Postgres)
    actor Approver as Financial / Ops Approver

    Admin->>Ingest: Ingest Daily Diagnostic Payload
    Ingest->>Passport: Append Event: TELEMETRY_INGESTED (Checksum Verified)
    Ingest->>Trend: Evaluate Component Time-Series
    Trend->>Agent: Alert: Accelerated Battery Degradation (Health 51%)
    
    rect rgb(240, 248, 255)
        Note over Agent,Partner: Multi-Tool Evidence Gathering
        Agent->>Partner: Query Compatible Parts (search_manual_and_parts)
        Partner-->>Agent: OEM Battery Available ($48, In Stock)
        Agent->>Partner: Request Certified Quote (request_quote)
        Partner-->>Agent: Internal Labour $25, Turnaround 24h
        Agent->>Partner: Check Reuse Options (find_reuse_options)
        Partner-->>Agent: Secondary Kiosk Role Available (Secondary Option)
    end

    Agent->>Policy: Propose Decision: Component Repair (Estimated Cost $73)
    
    rect rgb(255, 250, 240)
        Note over Policy,Approver: Policy Governance & Human Gating
        Policy->>Policy: Validate Rules ($73 <= 40% Value [$128] & Score 0.85 >= 0.65)
        Policy->>Policy: Check Organization Limits ($73 > $50 Auto-Limit -> TIER: AMBER)
        Policy->>Approver: Dispatch Approval Ticket with Evidence Dossier
        Approver->>Policy: Submit Decision: APPROVED (Signed by Asset Mgr)
    end

    Policy->>Passport: Append Event: APPROVAL_GRANTED & DECISION_RECORDED
    Policy->>Partner: Dispatch Precision Repair Work Order
    Partner-->>Policy: Work Order Completed & Verification Hash
    Policy->>Passport: Append Event: REPAIR_VERIFIED (+24 Months Service Life)
    Policy->>Admin: Alert Admin: Asset Successfully Calibrated & Redeployed
```

---

## MVP External Integrations & Connectors

| Integration | MVP Connector Method | Control & Verification |
|---|---|---|
| **Device Diagnostics** | Windows collector agent or MDM export | Signed JSON payload, minimized telemetry, explicit organization consent. |
| **Manuals & Parts** | Approved catalogue adapter / curated feed | Cached source, verified OEM part number, pricing, availability timestamp. |
| **Repair Quotes** | Technician portal or structured CSV feed | Agent drafts quote request; dispatch governed by autonomy profile and spending caps. |
| **Reuse Clearinghouse** | Internal inventory registry; NGO partner API | Recipient eligibility verification and formal custody transfer sign-off. |
| **Certified Recycler** | Approved partner registry, then sandbox API | Certification check (R2v3 / e-Stewards); LLM cannot select arbitrary web recyclers. |
| **Data-Wipe Evidence** | Approved wipe-tool certificate upload / API | Cryptographic hash validation; mandatory technician review prior to release. |
| **Notifications** | Teams / Slack / Email webhook adapter | Notification sent on approval requests, policy violations, and case completions. |

---

## Curated Cross-Purpose Reuse Directory

The cross-purpose reuse engine operates on a strictly vetted institutional catalogue rather than generative assumptions.

| Component | Minimum Preconditions | Approved Secondary Role | Mandatory Security & Safety Gate |
|---|---|---|---|
| **NVMe SSD** | SMART health above threshold; zero bad sectors | Internal IT spare pool; lower-spec workstation upgrade | NIST 800-88 sanitization certificate required. |
| **DDR4 RAM** | Compatible device list; passed MemTest86 | Internal fleet upgrade stock | Physical pin inspection by hardware technician. |
| **AC Adapter** | Electrical insulation inspection passed | Approved department spare pool | High-voltage insulation and safety check. |
| **Logic Board** | Tested boot; stable power rails; dead display | Pre-approved lab signage / headless Linux node | Enclosure mounting and thermal safety review. |
| **Display Panel** | Functional backlight; working LVDS cable | Spare replacement assembly for active fleet | Backlight and hinge torque inspection. |
| **Battery** | Healthy ($\ge 75\%$), within safety limits | Compatible fleet replacement stock | **BANNED** if swollen, dented, or overheating. |

---

## MVP Policy Model & Enforcement Order

### Configurable Automation Profile Schema

```json
{
  "organizationId": "org-hindustan-campus",
  "policyVersion": "2026.3.1",
  "pathProfiles": {
    "repair": {
      "mode": "draft_and_assist",
      "autoLimitINR": 5000,
      "maxRepairRatio": 0.40,
      "minExtendedLifeMonths": 18
    },
    "sameRoleReuse": {
      "mode": "auto_within_policy",
      "requiresWipeProof": true
    },
    "crossPurposeReuse": {
      "mode": "draft_and_assist",
      "requiresTechnicalApproval": true
    },
    "recycle": {
      "mode": "auto_within_policy",
      "requiresWipeProof": true,
      "approvedPartnersOnly": true
    }
  }
}
```

### Deterministic Server-Side Enforcement Order

1. **Validate tool arguments** and actor permissions server-side.
2. **Verify evidence freshness** and provenance checksums.
3. **Enforce hard Red boundaries** (swollen cells, missing wipe certificates, unapproved recyclers).
4. **Evaluate organization policy** and automation profile limits.
5. **Request human approval** in Amber queue if limits or risk tiers require it.
6. **Execute idempotently** using unique client-generated request UUIDs.
7. **Append audit event** to the Circularity Passport.

*The LLM proposes recommendations and drafts justifications; the server-side rules engine determines whether actions may execute.*

---

## Circularity Passport Architecture

The Circularity Passport is an immutable, append-only event stream recording every lifecycle milestone.

| Event Category | Example Event Types |
|---|---|
| **Identity** | `DEVICE_ENROLLED`, `MODEL_IDENTIFIED`, `COMPONENTS_DISCOVERED` |
| **Health** | `TELEMETRY_INGESTED`, `TREND_ANOMALY_DETECTED`, `MANUAL_DIAGNOSIS_LOGGED` |
| **Decision** | `REPAIR_EVALUATED`, `REUSE_OPTIONS_EXHAUSTED`, `RECYCLE_ELIGIBILITY_CONFIRMED` |
| **Control** | `POLICY_EVALUATED`, `APPROVAL_REQUESTED`, `APPROVAL_GRANTED`, `ACTION_BLOCKED` |
| **Custody** | `ASSIGNED_TO_TECHNICIAN`, `ALLOCATED_TO_REUSE_ROLE`, `RECYCLER_PICKUP_CONFIRMED` |
| **Verification** | `WIPE_CERT_VERIFIED`, `REPAIR_OUTCOME_CONFIRMED`, `RECYCLING_CERT_RECORDED` |

---

## Production Security, Compliance & Audit Checklist

- **Pseudonymization & Hashing:** Hash serial numbers using salted SHA-256 for analytics; restrict raw serial numbers to authorized asset controllers.
- **Data Protection:** Encrypt diagnostic reports and certificates at rest (AES-256) and in transit (TLS 1.3).
- **Role-Based Access Control:** IT Admin, Technician, Sustainability Officer, Financial Approver, Auditor.
- **Telemetry Retention:** Retain technical telemetry only for authorized operational periods; purge raw JSON after aggregation window.
- **Zero PII Leakage:** Automatic redaction of usernames, home paths, and personal files from uploaded diagnostic bundles.
- **Credential Security:** Partner API keys stored in secrets manager; least-privileged access scopes.
- **Comprehensive Auditing:** Log every tool invocation, policy decision, approval, connector dispatch, retry, and status transition.
- **Idempotency Safeguards:** Idempotency keys prevent double-ordering parts or duplicate recycler dispatch requests.
- **CI/CD Negative Policy Test Suite:** Automated test suite verifying that unverified wipes, uncertified recyclers, damaged batteries, and missing approvals fail closed.

---

## Pilot Evaluation Metrics & KPIs

```mermaid
flowchart TD
    subgraph METRICS["Key Performance Indicators"]
        direction TB
        M1["Repair Success Rate (%)<br/>Verified repairs / Completed repair actions"]
        M2["Circular Reuse Yield (%)<br/>Components redeployed / Total assessed"]
        M3["Premature Disposal Prevention (%)<br/>Repairs or reuses chosen over initial disposal intent"]
        M4["Predictive Anomaly Precision (%)<br/>Actionable early decline alerts / Total alerts"]
        M5["Evidence Completeness Index (%)<br/>Decisions with 100% required evidence links"]
        M6["Custody Attestation Rate (%)<br/>Recycled items with verified partner receipts"]
    end

    subgraph IMPACT["Direct Organizational Value"]
        direction TB
        V1["Direct Hardware Capital Expenditure Avoided ($)"]
        V2["Carbon & E-Waste Diversion Quantified (kg / MT CO2e)"]
        V3["Extended Asset Lifecycle (Average Months Gained)"]
    end

    M1 --> V1
    M2 --> V1
    M3 --> V2
    M4 --> V3
    M5 --> V1
    M6 --> V2
```

---

## MVP 8-Sprint Implementation Roadmap

```mermaid
gantt
    title ReUseChain MVP 8-Sprint Implementation Schedule
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d
    
    section Stage 1: Prototype
    Prototype Validation & Deterministic Engine :done, p1, 2026-09-01, 2026-09-14
    
    section Sprint 1-2: Foundation
    PostgreSQL Schema Hardening & Role Middleware :active, s1, 2026-09-15, 2026-09-28
    Windows Ingestion Collector & Signature Gateway:s2, 2026-09-29, 2026-10-12
    
    section Sprint 3-4: Intelligence
    Time-Series Anomaly Engine & Baseline Profiling:s3, 2026-10-13, 2026-10-26
    Parts Catalogue & Technician Quote Adapters   :s4, 2026-10-27, 2026-11-09
    
    section Sprint 5-6: Governance
    Policy Engine, Automation Profiles & Approvals :s5, 2026-11-10, 2026-11-23
    Certified Recycler Sandbox & Custody Tracking  :s6, 2026-11-24, 2026-12-07
    
    section Sprint 7-8: Pilot & Hardening
    Security Audit & CI/CD Negative Policy Tests  :s7, 2026-12-08, 2026-12-21
    Fleet Pilot Deployment (50 Devices) & Learning Loop:s8, 2026-12-22, 2027-01-11
```

---

## Acceptance Criteria Checklist

- [x] **Component-Level Granularity:** System evaluates individual sub-assemblies (battery, SSD, RAM, display, logic board) independently without monolithic retirement.
- [x] **Strict Priority Cascade:** Recycling recommendation is mathematically locked until repair and internal reuse options are proven non-viable.
- [x] **Visual 2D Modeling:** All system architectures, state machines, component decompositions, data models, and delivery timelines are expressed via standardized 2D Mermaid diagrams.
- [x] **Deterministic Policy Enforcement:** Autonomy levels (Green/Amber/Red) and spending thresholds are governed server-side, preventing unapproved model actions.
- [x] **Immutable Circularity Passport:** Every state transition, human approval, telemetry record, and custody change is captured in an append-only, tamper-evident timeline.
- [x] **Zero Privacy Intrusion:** Telemetry ingestion is strictly limited to hardware performance and wear indicators.
