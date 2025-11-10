# Plan: fix_project_creation_organization_error

## Plan Description
The create project flow currently fails whenever `/api/projects` runs because the API helper is still returning the temporary `temp-user` stub instead of the authenticated Supabase user. Without a valid UUID user, `getOrganizationByUserId` logs that it skipped the lookup and returns `null`, so every POST winds up with "Organization not found" even though the organization should have been created via `/auth/callback`. We need to rewire `withAuth` (and the surrounding repository calls it powers) to obtain the real session user and reject requests when no session exists. That will unblock project creation and keep the existing backend organization creation flow intact.

## User Story
As a signed-in user
I want the API routes to run with my real Supabase identity
So that creating a project finds my organization instead of returning "Organization not found"

## Problem Statement
`withAuth` currently short-circuits authentication by returning a hard-coded `{ id: 'temp-user' }`, which is not a UUID. Every repository helper that looks up the organization or inserts rows relies on valid UUIDs, so `getOrganizationByUserId` returns `null` and POST `/api/projects` aborts with 404. This makes project creation unusable because the user context never reaches Supabase.

## Solution Statement
Re-enable real Supabase session handling inside `withAuth`, so it first calls `supabase.auth.getUser()` and returns `401 Unauthorized` whenever the session is missing. Once the handler receives the actual user object, existing repository helpers like `getOrganizationByUserId` will discover the organization created via `/auth/callback`, and POST `/api/projects` can insert with a valid `organization_id` and `created_by`. Keep the logging and error handling aligned with current patterns.

## Pattern Analysis
- `/app/api/organizations/route.ts` already demonstrates how to guard for preview users and compose the organization from the Supabase user (lines 15‑38 show the organization lookup + preview fallback). We can mirror the real-user branch of that handler when configuring `withAuth` so downstream routers rely on the same validated identity. 
- `/app/auth/callback/route.ts` is the canonical place an organization and user are created after the OAuth exchange; it already uses `createOrganization`/`createOrganization` to sync the database, so once we deliver an actual `user.id` to the API helper the rest of the stack follows existing patterns.
- `/ai_docs/documentation/standards/coding_patterns.md` stresses consistent logging, retry handling, and not mixing preview stubs into production logic, so the new auth helper should keep explicit error logging + clean separation between authorized vs unauthorized flows.

## Dependencies
### Previous Plans
- None. This is a standalone fix that only relies on the standard auth flow already implemented.

### External Dependencies
- Supabase Auth (requires valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to resolve the session)

## Relevant Files
Use these files to implement the task:
- `libs/api-utils/index.ts` – `withAuth` is the auth wrapper used by every API route; it currently returns the stub user and needs to call `supabase.auth.getUser()` instead before delegating to handlers.
- `app/api/projects/route.ts` – consumes `withAuth` and `getOrganizationByUserId`, so after the new helper returns the real user the 404 should disappear; we still need to ensure errors there remain consistent.
- `libs/repositories/organizations.ts` – `getOrganizationByUserId` currently returns `null` for non-UUID IDs; this behavior stays, so the fix is upstream.
- `app/api/organizations/route.ts` – demonstrates the expected flow when an organization is missing and how to create a preview org; keep this behavior untouched while ensuring real auth prevails.
- `app/(dashboard)/projects/page.tsx` – the page already fetches the Supabase session server-side, so the new auth helper must align with that pattern (it relies on the same cookies). 
- `ai_docs/documentation/CONTEXT.md` and `ai_docs/documentation/PRD.md` – already read per instructions to understand the auth/organization expectations.

## Acceptance Criteria
- [ ] `withAuth` calls `supabase.auth.getUser()` and only proceeds when Supabase returns a real user (UUID).
- [ ] Requests without a session now respond with `401 Unauthorized` instead of silently using `temp-user`.
- [ ] POST `/api/projects` succeeds with the real `organization_id` and `created_by` now that `getOrganizationByUserId` sees the valid user.
- [ ] Logs remain clear (errors go through `apiError`) and we do not regress any other API route behavior.

## Step by Step Tasks
**EXECUTION RULES:**
- Execute ALL steps below in exact order
- Check Acceptance Criteria - all items are REQUIRED
- Do NOT skip UI/frontend steps if in acceptance criteria
- If blocked, document and continue other steps

### 1. Audit the auth helper and organization expectations
- Re-read `libs/api-utils/index.ts` to understand the current stubbed `withAuth` behavior and how it feeds into the API handlers.
- Confirm that `/app/auth/callback/route.ts` and `/app/api/organizations/route.ts` already expect a real Supabase user and ensure no other code paths rely on the `temp-user` stub.
- Note any logging or error patterns documented in `ai_docs/documentation/standards/coding_patterns.md` that we should replicate when tightening auth.

---
✅ CHECKPOINT: Steps 1 complete (Auth auditing). Continue to step 2.
---

### 2. Re-implement `withAuth` to use the Supabase session
- In `libs/api-utils/index.ts`, remove the hard-coded `{ id: 'temp-user' }` and instead call `supabase.auth.getUser()` (respecting the existing cookies) before invoking the handler.
- Guard against missing/errored sessions by returning `apiError('Unauthorized', 401)` so downstream routes never try to resolve an organization with an invalid ID.
- Keep the handler signature and logging unchanged so the other routes that import `withAuth` continue working out of the box.

---
✅ CHECKPOINT: Steps 1-2 complete (Auth helper updated). Continue to step 3.
---

### 3. Validate the fix and record testing commands
- Run the configured validation commands (`npm run lint`, any focused tests) to ensure no TypeScript or lint regressions.
- Exercise POST `/api/projects` using the authenticated dev session (via the UI or a curl that supplies cookies) to verify a project now lands in Supabase instead of returning 404.
- Update the implementation log at `specs/fix_project_creation_organization_error/fix_project_creation_organization_error_implementation.log` with a short summary of the work and test results.
- Collect `git diff --stat` output for reporting along with any manual findings.

## Testing Strategy
### Unit Tests
- No new unit tests are necessary because this change updates the shared auth helper used by existing API routes; rely on the current API routes' implicit tests and any future test suites that hit those endpoints.

### Edge Cases
- Missing or expired session should now return `401 Unauthorized` instead of `500`/`404` because `withAuth` will no longer invoke handlers without a valid user.
- Handlers that rely on `apiError` logging should continue to emit the same error stack when `supabase.auth.getUser()` throws.

## Validation Commands
Execute every command to validate the task works correctly with zero regressions.
- `npm run lint` – should pass without new lint or type errors.
- `npm run test` (if available) – expect the existing suite to pass (if the repo has a test target; otherwise skip with a note).
- `POST /api/projects` via the UI (Create Project dialog) or a scripted curl with valid session cookies should now return `success: true` and the new project ID (before it was a 404 error). Replace `http://localhost:3000` with the running instance.

# Implementation log created at:
# specs/fix_project_creation_organization_error/fix_project_creation_organization_error_implementation.log

## Definition of Done
- [ ] All acceptance criteria met
- [ ] All validation commands pass with expected output
- [ ] No regressions (existing tests still pass)
- [ ] Patterns followed (documented in Pattern Analysis)
- [ ] E2E test created and passing (if UI change)

## Notes
- The request logging already flows through `apiError`, so additional instrumentation is not needed.
- If we still need a preview experience later, we can add a separate helper that conditionally injects the `temp-user`; this fix focuses on the true auth path.

## Research Documentation
- None
