# Phase Planning

Create a comprehensive plan in ai_docs/documentation/phases_spec/<phase_name>/ to implement the `Phase` using the two-step workflow below. Follow the `Instructions` to create the plan, use the `Relevant Files` to focus on the right files.

## Instructions

- You're planning an entire phase of development that encompasses multiple related features and foundational work.
- IMPORTANT: Before starting, read previous phase specifications in `ai_docs/documentation/phases_spec/` to understand context and dependencies.
- Follow the two-step workflow:
  - **Step 1**: Create summary of phase + ask clarifying questions
  - **Step 2**: After questions answered, create detailed plan
- Use your reasoning model: THINK HARD about the phase requirements, architecture, dependencies, and implementation sequence.
- If specification documents don't clarify implementation choices (tech stack, AI/agent workflows, architecture patterns, etc.), ask explicit questions. Don't assume.
- Deploy research sub-agents when needed to:
  - Gather complete documentation for complex implementations (e.g., LLM workflows, hallucination reduction techniques)
  - Research best practices and implementation approaches
  - Create research documentation in the phase folder
- Create all outputs in `ai_docs/documentation/phases_spec/<phase_name>/` where <phase_name> is derived from the phase description.
- Follow existing patterns and conventions in the codebase. Don't reinvent the wheel.
- If you need a new library, use `uv add` and be sure to report it in the `Notes` section.
- Respect requested files in the `Relevant Files` section.
- Start your research by reading the `ai_docs/documentation/CONTEXT.md` and `ai_docs/documentation/PRD.md` files.

## Relevant Files

Focus on the following files:
- `ai_docs/documentation/CONTEXT.md` - Contains the project context and overview.
- `ai_docs/documentation/PRD.md` - Contains the product requirements document.
- `ai_docs/documentation/standards/coding_patterns.md` - Contains coding patterns and standards.
- `ai_docs/documentation/phases_spec/*/` - Contains previous phase specifications.

Ignore all other files in the codebase.

## Step 1: Summary and Questions

After reading all relevant documentation, provide:

1. **Phase Summary** (concise, 3-5 bullet points covering main objectives)
2. **Unresolved Questions** (list all choices/decisions needed):
   - Tech stack choices
   - Implementation approach options
   - AI/agent workflow design decisions
   - Architecture pattern selections
   - Integration strategies
   - Any other ambiguities in the specification

Format as:
```md
## Phase Summary
- <main objective 1>
- <main objective 2>
- <main objective 3>

## Unresolved Questions

### Question 1: <category>
<specific question requiring user decision>
- Option A: <description>
- Option B: <description>
- Option C: <description>

### Question 2: <category>
<specific question requiring user decision>
...
```

STOP after providing summary and questions. Wait for user to answer before proceeding to Step 2.

## Step 2: Detailed Planning (After Questions Answered)

Create the detailed plan using the `Plan Format` below.

IMPORTANT: Replace every <placeholder> in the `Plan Format` with the requested value. Add as much detail as needed to implement the phase successfully.

If complex implementation research is needed (e.g., LLM workflows, agent architectures), deploy research sub-agent first:
- Research sub-agent creates documentation in `ai_docs/documentation/phases_spec/<phase_name>/research_<topic>.md`
- Then incorporate findings into the plan

## Plan Format

```md
# Phase: <phase name>

## Phase Description
<describe the phase in detail, including its scope, objectives, and value to the application>

## Phase Objectives
<list the key objectives this phase aims to achieve>

## Problem Statement
<clearly define the specific problems or opportunities this phase addresses>

## Solution Statement
<describe the proposed solution approach and how it addresses the problems>

## Dependencies
### Previous Phases
<list previous phases this depends on and what specifically is needed from them>

### External Dependencies
<list any external libraries, services, or resources needed>

## Relevant Files
Use these files to implement the phase:

<find and list the files that are relevant to the phase, describe why they are relevant in bullet points. If there are new files that need to be created to implement the phase, list them in an h3 'New Files' section.>

## Implementation Plan
### Phase 1: Foundation
<describe the foundational work needed before implementing the main features>

### Phase 2: Core Implementation
<describe the main implementation work for the phase's features>

### Phase 3: Integration
<describe how the phase features will integrate with existing functionality and previous phases>

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

<list step by step tasks as h3 headers plus bullet points. use as many h3 headers as needed to implement the phase. Order matters, start with the foundational shared changes required then move on to the specific implementation. No testing, keep things simple. Your last step should be running the `Validation Commands` to validate the phase works correctly.>

## Acceptance Criteria
<list specific, measurable criteria that must be met for the phase to be considered complete>

## Validation Commands
Execute every command to validate the phase works correctly.

<list commands you'll use to validate the phase is implemented correctly. every command must execute without errors. Include commands to validate the phase end-to-end.>

## Notes
<optionally list any additional notes, future considerations, or context that are relevant to the phase that will be helpful to the developer>

## Research Documentation
<if research sub-agents were deployed, list the research documentation files created and their purpose>
```

## Phase Description
$ARGUMENTS
