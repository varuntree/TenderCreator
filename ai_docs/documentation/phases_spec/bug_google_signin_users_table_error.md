# Bug: Google Sign-in Fails with "Cannot coerce result to single JSON object" Error

## Bug Description
After completing Phase 1 Google OAuth signin flow, users get redirected to `/projects` page which crashes with error:
```
[Error: {"code":"PGRST116","details":"The result contains 0 rows","hint":null,"message":"Cannot coerce the result to a single JSON object"}]
GET /projects 500 in 1100ms
```

Additionally, non-critical warnings appear:
- metadataBase property warning for social images
- images.domains deprecated configuration warning

Symptoms:
- Google signin redirects successfully (307 to /projects)
- /projects page fails with 500 error
- User authentication works but page crashes

Expected behavior:
- After Google signin, user sees /projects page
- New user gets organization created automatically
- Projects page renders (empty state or with projects)

## Problem Statement
When a new user signs in via Google OAuth, they don't have a record in the `users` table. The `getOrganizationByUserId()` function in `/projects` page queries the `users` table with `.single()` which throws PGRST116 error when no row exists. This prevents new users from accessing the app after successful authentication.

## Solution Statement
1. Create user record in `users` table during auth callback (after OAuth exchange)
2. Handle case where user exists but has no organization (prompt org creation)
3. Fix Next.js config warnings (metadataBase, images.remotePatterns)
4. Add error boundaries to gracefully handle missing user data

## Steps to Reproduce
1. Start dev server on port 3000: `npm run dev`
2. Navigate to `/signin`
3. Click "Sign in with Google"
4. Complete Google OAuth flow
5. Observe redirect to `/auth/callback?code=...` (307 status)
6. Observe redirect to `/projects`
7. Error occurs: PGRST116 "result contains 0 rows"
8. GET /projects returns 500

## Root Cause Analysis
**Primary cause**: New users signing in via OAuth don't have records in `users` table

**Chain of events**:
1. User completes Google OAuth → Supabase auth.users record created ✓
2. Auth callback exchanges code for session ✓
3. Redirects to `/projects` ✓
4. `/projects` page calls `getOrganizationByUserId(supabase, user.id)` (line 16)
5. Function queries `users` table with `.eq('id', userId).single()` (organizations.ts:18-19)
6. Query returns 0 rows because user record doesn't exist in custom `users` table
7. `.single()` throws PGRST116 error
8. Page crashes with 500

**Why user record missing**:
- Supabase Auth creates record in `auth.users` (internal table) ✓
- Custom `users` table (for org membership, roles) requires manual insertion
- No automatic trigger or callback handler to create user record
- Phase 1 implementation assumes manual org creation flow, not OAuth

**Secondary issues**:
- Next.js metadataBase not set (warnings for OG images)
- images.domains deprecated (should use remotePatterns)

## Relevant Files
Use these files to fix bug:

- **app/auth/callback/route.ts** - Auth callback handler, needs user creation logic after code exchange
- **libs/repositories/organizations.ts** - Contains `getOrganizationByUserId()` and `createOrganization()` functions
- **app/(dashboard)/projects/page.tsx** - Projects page that crashes when user/org doesn't exist
- **migrations/phase_1/001_initial_schema.sql** - Schema shows users table structure
- **next.config.ts** - Config warnings for images.domains deprecation
- **app/layout.tsx** - Root layout, needs metadataBase in metadata export

### New Files
None required

## Step by Step Tasks

### 1. Fix auth callback to create user record
- Read current auth callback handler (app/auth/callback/route.ts)
- After `exchangeCodeForSession`, get authenticated user
- Check if user exists in custom `users` table
- If not exists, handle new user flow:
  - Option A: Create default organization + user record
  - Option B: Redirect to org setup page
- Use `createOrganization()` from repositories (takes name, userId)
- Add error handling for database operations

### 2. Make projects page resilient to missing org
- Update projects page to handle null org gracefully
- If no org, show "Setup Organization" UI instead of crash
- Use optional chaining: `org?.id || ''` (already exists line 17)
- Add redirect or prompt if org is null

### 3. Fix Next.js config warnings
- Add metadataBase to root layout metadata export
- Use environment variable for base URL (NEXT_PUBLIC_SITE_URL or default localhost:3000)
- Update next.config.ts images config
- Change `domains` to `remotePatterns` for image hosts

### 4. Run Validation Commands
- Start dev server
- Test Google signin with fresh account
- Verify /projects loads without errors
- Check no PGRST116 errors in console
- Verify warnings are gone

## Validation Commands
Execute every command to validate bug is fixed.

```bash
# Start dev server
npm run dev

# In browser:
# 1. Open http://localhost:3000/signin
# 2. Sign in with Google (use test account or new account)
# 3. Verify redirect to /projects succeeds
# 4. Check console - no PGRST116 errors
# 5. Check terminal - no metadataBase warnings, no images.domains warnings

# Check database has user record
# (run in Supabase SQL editor or via psql)
# SELECT * FROM users WHERE email = 'test-user-email@gmail.com';
# Should return 1 row after signin
```

## Notes
- Decision needed: Auto-create default org (name = user email?) vs prompt user for org name
- Consider: Migration path for existing auth.users who don't have custom users records
- Phase 1 spec didn't account for OAuth onboarding flow - this fills that gap
- metadataBase should use env var for production (NEXT_PUBLIC_SITE_URL)
- images.remotePatterns is more secure than domains (glob patterns)
