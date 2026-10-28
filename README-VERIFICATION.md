
# College email verification

College ID `251FA19106` maps to `251fa19106@vignan.ac.in`. Users cannot supply a different verification address. Registration sends a six-digit code; verification creates the student account and signs it in. Codes expire after ten minutes, allow five verification attempts, and cannot be reused. Sending is limited per ID and IP. Passwords and codes are stored as hashes and do not appear in API responses or logs.

Existing accounts must verify their college mailbox on their next login. Existing sessions cannot access the application until verification is complete. Existing accounts still require their password; mailbox-based password recovery is not included.

## Email service setup

This implementation uses the [Resend email API](https://resend.com/docs/api-reference/emails/send-email). An administrator must configure an email service account and approved sender before enabling registration. The sender can use a domain controlled by the operator; it does not need to be the recipient's college domain.

Configure these server-side secrets, never in browser code or committed files:

- `RESEND_API_KEY`: the email service API key.
- `VERIFICATION_EMAIL_FROM`: an approved sender address.

For local Wrangler development put these values in the ignored `.dev.vars` file. For deployment configure equivalent Worker secrets. Apply migration `0003_email_verification.sql` before running the new application. Normal local startup applies pending migrations automatically. Without the secrets, verification returns a clear service-unavailable error and creates no account or session. Automated tests mock email delivery and send no live messages.

## Shared records and exports

The first request creates `campus:shared:v1` from legacy account workspaces. Distinct proposal IDs are retained; the latest modified copy wins for conflicting IDs. Unmodified seed events do not overwrite changed proposals. Legacy rows remain unchanged as backups. Campus writes use one revision check, so concurrent edits return a conflict instead of overwriting another account's changes. Registrations, memberships, notifications and preferences remain per account; other accounts' preferences are never sent to the browser.

Registration closes at an explicit deadline, or the event's start time in India when no earlier deadline exists. Attendance assignments use cursor pagination: **Load more assignments** fetches the next page, and **Export all attendance** retrieves every page before producing a CSV. A failed page prevents a partial export. Exports reflect records read during the export, rather than a transaction snapshot if assignments change concurrently.

Run `node scripts/test-review-fixes.mjs` for an isolated SQLite test covering email verification, shared approvals, personal registrations, conflicting revisions and more than 200 assignments.
