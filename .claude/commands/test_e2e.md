# E2E Test Runner

Execute end-to-end (E2E) tests using Playwright browser automation (MCP Server). If any errors occur and assertions fail mark the test as failed and explain exactly what went wrong.

## Variables

e2e_test_file: $ARGUMENTS
application_url: http://localhost:3000
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

## Setup

- Ensure Next.js dev server is running (`npm run dev`)
- Application should be accessible at http://localhost:3000


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