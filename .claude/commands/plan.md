# Planning

Create a comprehensive plan in specs/<plan_name>/ to implement the task using the two-step workflow below. Follow the `Instructions` to create the plan, use the `Relevant Files` to focus on the right files.

## Instructions

- You're planning a task that may encompass multiple related features and foundational work.
- IMPORTANT: Before starting, read previous specifications in `specs/` to understand context and dependencies.
- Follow the two-step workflow:
  - **Step 1**: Create summary of phase + ask clarifying questions
  - **Step 2**: After questions answered, create detailed plan
- Use your reasoning model: THINK HARD about the phase requirements, architecture, dependencies, and implementation sequence.
- If specification documents don't clarify implementation choices (tech stack, AI/agent workflows, architecture patterns, etc.), ask explicit questions. Don't assume.
- Deploy research sub-agents when needed to:
  - Gather complete documentation for complex implementations (e.g., LLM workflows, hallucination reduction techniques)
  - Research best practices and implementation approaches
  - Create research documentation in the plan folder
- Create all outputs in `specs/<plan_name>/` where <plan_name> is derived from the task description.
- Follow existing patterns and conventions in the codebase. Don't reinvent the wheel.
- If you need a new library, use `npm install` and be sure to report it in the `Notes` section.
-IMPORTANT: If the feature includes UI components or user interactions:
Add a task in the Step by Step Tasks section to create a separate E2E test file in .claude/commands/e2e/test_<descriptive_name>.md based on examples in that directory
Add E2E test validation to your Validation Commands section
IMPORTANT: When you fill out the Plan Format: Relevant Files section, add an instruction to read .claude/commands/test_e2e.md, and .claude/commands/e2e/test_basic_query.md to understand how to create an E2E test file. List your new E2E test file to the Plan Format: New Files section.
To be clear, we're not creating a new E2E test file, we're creating a task to create a new E2E test file in the Plan Format below
- Respect requested files in the `Relevant Files` section.
- Start your research by reading the `ai_docs/documentation/CONTEXT.md` and `ai_docs/documentation/PRD.md` files.

## Plan Structure Requirements

When creating the detailed plan (Step 2), ensure:

1. **Single Clear Structure**: Use only "Step by Step Tasks" section with numbered steps (### 1, ### 2, etc.). Avoid dual structures (implementation phases + steps).

2. **Execution Directive**: Add immediately before step 1:
   ```
   **EXECUTION RULES:**
   - Execute ALL steps below in exact order
   - Check Acceptance Criteria - all items are REQUIRED
   - Do NOT skip UI/frontend steps if in acceptance criteria
   - If blocked, document and continue other steps
   ```

3. **Checkpoints**: Add after major section transitions:
   ```
   ---
   ✅ CHECKPOINT: Steps X-Y complete (Backend/Frontend/etc). Continue to step Z.
   ---
   ```

4. **Acceptance Criteria First**: Place Acceptance Criteria section BEFORE "Step by Step Tasks" so requirements are clear upfront.

5. **Logging Instructions**: Add to validation commands section:
   ```
   # Implementation log created at:
   # {plan_directory}/{phase_name}_implementation.log
   ```

## Relevant Files

Focus on the following files:
- `ai_docs/documentation/CONTEXT.md` - Contains the project context and overview.
- `ai_docs/documentation/PRD.md` - Contains the product requirements document.
- `ai_docs/documentation/standards/*` - Contains coding patterns and standards.

Ignore all other files in the codebase.

## Step 1: Summary and Questions

After reading all relevant documentation, provide:

1. **Plan Summary** (concise, 3-5 bullet points covering main objectives)
2. **Unresolved Questions** (list all choices/decisions needed):
   - Tech stack choices
   - Implementation approach options
   - AI/agent workflow design decisions
   - Architecture pattern selections
   - Integration strategies
   - Any other ambiguities in the specification

Format as:
```md
## Plan Summary
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

IMPORTANT: Replace every <placeholder> in the `Plan Format` with the requested value. Add as much detail as needed to implement the task successfully.

If complex implementation research is needed (e.g., LLM workflows, agent architectures), deploy research sub-agent first:
- Research sub-agent creates documentation in `specs/<plan_name>/research_<topic>.md`
- Then incorporate findings into the plan

## Plan Format

```md
# Plan: <plan_name>

## Plan Description
<describe the task in detail, including its scope, objectives, and value to the application>

## Plan Objectives
<list the key objectives this task aims to achieve>

## Problem Statement
<clearly define the specific problems or opportunities this task addresses>

## Solution Statement
<describe the proposed solution approach and how it addresses the problems>

## Dependencies
### Previous Plans
<list previous plans this depends on and what specifically is needed from them>

### External Dependencies
<list any external libraries, services, or resources needed>

## Relevant Files
Use these files to implement the task:

<find and list the files that are relevant to the task, describe why they are relevant in bullet points. If there are new files that need to be created to implement the task, list them in an h3 'New Files' section.>

## Acceptance Criteria
<list specific, measurable criteria that must be met for the task to be considered complete>

## Step by Step Tasks

**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. <First Step Name>

<list step details as bullet points>

### 2. <Second Step Name>

<list step details as bullet points>

<continue with all steps... use as many h3 headers as needed to implement the task. Order matters, start with the foundational shared changes required then move on to the specific implementation. No testing, keep things simple. Your last step should be running the `Validation Commands` to validate the task works correctly.>

<Add checkpoints after major transitions:>
---
✅ CHECKPOINT: Steps X-Y complete (Backend/Frontend/etc). Continue to step Z.
---

## Validation Commands
Execute every command to validate the task works correctly.

<list commands you'll use to validate the task is implemented correctly. every command must execute without errors. Include commands to validate the task end-to-end.>


<list commands you'll use to validate with 100% confidence the feature is implemented correctly with zero regressions. every command must execute without errors so be specific about what you want to run to validate the feature works as expected. Include commands to test the feature end-to-end.>

<If you created an E2E test, include the following validation step: `Read .claude/commands/test_e2e.md`, then read and execute your new E2E `.claude/commands/e2e/test_<descriptive_name>.md` test file to validate this functionality works.>

**E2E Testing Strategy:**
- Use pre-configured test credentials from test_e2e.md (DO NOT create new users)
- Reference absolute paths for test fixtures in test_fixtures/
- Sign in via email/password: test@tendercreator.dev / TestPass123!
- you will write the detailed tests in format of the workflow in the /Users/varunprasad/code/prjs/tendercreator/tendercreator/.claude/commands/test_e2e.md

# Implementation log created at:
# specs/<plan_name>/<plan_name>_implementation.log

## Notes
<optionally list any additional notes, future considerations, or context that are relevant to the task that will be helpful to the developer>

## Research Documentation
<if research sub-agents were deployed, list the research documentation files created and their purpose>
```

## Plan Description
$ARGUMENTS
