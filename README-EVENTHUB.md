# EVENT HUB

A private, hosted demonstration of the Vignan EventHub blueprint. React runs on Vinext with a Cloudflare Worker API and a D1 database. This adapts the blueprint's Spring Boot/MySQL stack to Sites hosting.

## Included

- Dashboard and searchable academic/event month and list calendars.
- Seven organizations, organization memberships, SAC clubs, and volunteer assignments.
- Event drafts, edits, submission, faculty review, dean approval, rejection/resubmission, publication, and completion.
- Unique student registrations with capacity checks.
- Volunteer attendance, verified service hours, CSV reports, organization-specific certificate thresholds, PDF downloads, and verification codes.
- Account-isolated persistent demo workspaces behind Sites sign-in.

College ID accounts use bcrypt password hashing and persistent sessions; see `README-AUTH.md`. Account roles are enforced on the server. All university events, seed student names, academic dates and certificates are fictional examples. Official enrollment verification, records and certificate authority require a separate institutional integration. ARC sensitive records are excluded.

## Demonstration

1. As Coordinator, create a SAC event and submit it in Event Management.
2. As Faculty advisor, review and approve it.
3. As Dean, approve and publish it.
4. Open the calendar, inspect the event, and register.
5. As Coordinator, assign volunteers and mark the event complete.
6. Mark attendance and verify hours within the assigned shift.
7. Issue an eligible demonstration certificate in Certificate Center, download the PDF, and verify its code.

The seeded completed event, Frames of Campus, has one verified volunteer ready for certificate issuance and another attendance row ready for verification.

## Local development

Requires Node.js >=22.13 and npm. Use the Sites skill for managed installation/build/publication.

```sh
npm run dev
```

Open `/` to register or log in with your College ID and password. Hosted Sites access retains its separate platform access gate.

Generate future migrations with `npm run db:generate`. Build once, then apply each pending migration to the local database:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_nifty_nico_minoru.sql
```

Do not replay already applied migrations. Sites applies hosted migrations during publication.

## Verification

```sh
node scripts/test-workflows.mjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
npm run build
```

Core workflow tests exercise the real action reducer, including staged approvals, organization scopes, duplicate registration, capacity, separate attendance/service records, hour validation, and certificate eligibility.

## Images

Campus-life stock images from Unsplash: `photo-1459749411175-04bf5292ceea`, `photo-1516321318423-f06f85e504b3`, `photo-1559027615-cd4628902d4a`, and `photo-1546519638-68e109498ffc`. These are illustrative and do not depict Vignan's actual campus events.
