# E2E Test Runner

Execute end-to-end (E2E) tests using Playwright browser automation (MCP Server). If any errors occur and assertions fail mark the test as failed and explain exactly what went wrong.

## Variables

e2e_test_file: $ARGUMENTS
application_url: http://localhost:3000

## Test Credentials (Pre-configured)

**IMPORTANT: Use these credentials for ALL E2E tests. DO NOT create new test users.**

- **Email:** test@tendercreator.dev
- **Password:** TestPass123!
- **User ID:** 7856a8ca-f238-4696-bbf4-ecf5540055f1
- **Org ID:** 887e21fd-d6ea-4770-803d-c5dcdad8bcf2
- **Org Name:** Test Organization

## Test Fixtures

**Available test fixtures with absolute paths:**

- **RFT Document:** `/Users/varunprasad/code/prjs/tendercreator/tendercreator/test_fixtures/sample_rft.pdf`
- **Company Document:** `/Users/varunprasad/code/prjs/tendercreator/tendercreator/test_fixtures/sample_company_doc.pdf`

**Usage in tests:** Reference these absolute paths when uploading documents. Files are pre-created and ready for testing.

## Instructions

- Read the `e2e_test_file`
- Digest the `User Story` to first understand what we're validating
- IMPORTANT: Execute the `Test Steps` detailed in the `e2e_test_file` using Playwright browser automation
- Review the `Success Criteria` and if any of them fail, mark the test as failed and explain exactly what went wrong
- Review the steps that say '**Verify**...' and if they fail, mark the test as failed and explain exactly what went wrong
- Capture screenshots as specified
- IMPORTANT: Return results in the format requested by the `Output Format`
- Initialize Playwright browser in headed mode for visibility
- Use the `application_url`
- Allow time for async operations and element visibility
- IMPORTANT: After taking each screenshot, save it to `Screenshot Directory` with descriptive names. Use absolute paths to move the files to the `Screenshot Directory` with the correct name.
- Capture and report any errors encountered
- Ultra think about the `Test Steps` and execute them in order
- If you encounter an error, mark the test as failed immediately and explain exactly what went wrong and on what step it occurred. For example: '(Step 1 ❌) Failed to find element with selector "query-input" on page "http://localhost:3000"'
- Save screenshots to `test_results/<test_name>/` directory with descriptive filenames

## Prerequisites

**Before running E2E tests, ensure:**

1. ✅ Test user already exists (one-time setup completed)
   - Email/password auth configured in Supabase
   - User linked to Test Organization
2. ✅ Test fixtures available in `test_fixtures/` directory

3. 🔄 Next.js dev server running (`npm run dev`)( Check if the user is already running the dev server in port 3000. Usually he does.s)
4. 🔄 Application accessible at http://localhost:3000

**Note:** Test user and org are pre-configured. DO NOT recreate them.


## Screenshot Directory

test_results/<test_name>/*.png

Each screenshot should be saved with a descriptive name that reflects what is being captured (e.g., 01_initial_page.png, 02_form_filled.png).

## Report

- Exclusively return the JSON output as specified in the test file
- Capture any unexpected errors
- IMPORTANT: Ensure all screenshots are saved in the `Screenshot Directory`

### Output Format

```json
{
  "test_name": "Test Name Here",
  "status": "passed|failed",
  "screenshots": [
    "test_results/<test_name>/01_<descriptive name>.png",
    "test_results/<test_name>/02_<descriptive name>.png",
    "test_results/<test_name>/03_<descriptive name>.png"
  ],
  "error": null
}
```