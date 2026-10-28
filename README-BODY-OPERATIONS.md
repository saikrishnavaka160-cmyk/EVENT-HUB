# EVENT HUB — body files, assigned work and attendance

The **Assigned Work**, **Attendance Scanner**, and **Permission Letters & Photos** navigation entries open a shared workspace for SAC, ARC, NSS, NCC, Alumni, EEL/ECL and VSC. These records are shared across registered accounts, rather than stored in the older personal demonstration event workspace.

## College IDs

All account and body appointment/assignment endpoints use `^[0-9]{2}1FA[A-Z0-9]{5}$` after trimming and converting the ID to uppercase. `251FA19106` and `251FA0AI65` are valid. Passwords remain case sensitive and are never uppercased.

## Permissions

| Action | Who can perform it |
| --- | --- |
| Submit a permission letter or event photo | Any signed-in College ID account |
| List, open or download a body’s files | That body’s appointed POC, head/senior member or faculty advisor; administrators |
| Assign coordinator/volunteer work | That body’s leadership; administrators |
| See assignments | Assignee sees their own; body leadership sees the body’s assignments |
| Appoint or remove POCs, heads and advisors | Administrators |
| Appoint coordinators and volunteers | Body leadership; administrators |
| Display an attendance QR | The assigned person |
| Scan an attendance QR | Any other signed-in user, including students, volunteers and coordinators |

The attendance policy follows the instruction that scanning is **not restricted to POCs and senior members**. It prevents self-scanning, records the scanner’s College ID and timestamp, and keeps private files limited to body leadership. A global faculty/dean title alone does not grant access to every body’s files.

## Administrator setup

No student is automatically made an administrator, and there is no default administrator password. The intended administrator must first register their actual College ID.

For a local installation, the machine operator can explicitly appoint that registered account:

```sh
npm run admin:local -- YOUR_REGISTERED_COLLEGE_ID
```

This command changes only the local database. For hosted installation, the Site owner sets the Worker environment variable `BODY_ADMIN_COLLEGE_ID` to the intended registered account’s exact uppercase College ID using Sites environment settings. Never use the example ID unless it is the account that was actually chosen. Refresh the app after configuration. The administrator can then open **Assigned Work → select a body → Manage body** to appoint POCs and higher-position members. Only the configured administrator or a stored administrator can change leadership positions. Changing a body position affects the next request; no sign-out is needed.

Administrator configuration remains pending until the owner chooses the actual account. Upload submission and attendance scanning work for ordinary registered accounts. Leadership-only functions become available after appointment.

## Permission letters and photos

Select **Permission Letters & Photos**, select the body, and choose permission letter or event photo. **Scan letter** opens the camera and captures a page as JPEG. A file picker is available when there is no camera. JPEG, PNG, WebP and PDF permission letters are supported; photos accept images. Upload up to 10 files at once, each at most 8 MB. The scan is a digital image capture, not OCR or signature verification.

Files are stored in the private `BUCKET` R2 binding; metadata is stored in D1. No public R2 URLs are returned. Every file read checks the current account’s role in that specific body. PDF downloads use attachment headers and sandbox restrictions. The API checks file byte signatures, declared types, body IDs, sizes, same-origin requests and upload rates. Successful files remain saved if another file in a multi-file upload fails. Refresh the body to see new uploads from others.

## Assigned-work attendance

1. A body leader selects **Manage body**, enters an already registered College ID, chooses coordinator or volunteer, and assigns a duty, date and start/end times.
2. The assignee signs in with that ID, selects the same body, and opens **Assigned Work → Show check-in QR**.
3. Another signed-in person opens **Attendance Scanner** and scans the QR using the camera, uploads a clear QR image, or pastes the attendance code.
4. For check-out, the assignee refreshes the work list and generates the check-out QR. Check-out must occur at least one minute after check-in.

Times use India Standard Time. Attendance opens 30 minutes before the shift and closes 2 hours after it ends. QR codes contain random 256-bit one-time tokens, expire after two minutes, and only SHA-256 token hashes are stored. Regenerating a QR invalidates the previous code. Atomic database updates prevent duplicate scans. QR codes and camera photos are not sent to third-party scanning services. HTTPS or localhost and browser camera permission are required. Camera streams stop when a scanner or capture view closes.

Leaders can export their body’s saved attendance report. The recorded check-in/check-out timestamps are attendance evidence; they do not automatically issue certificates or grant service hours in the older demonstration workflow.

## Storage and verification

`drizzle/0002_opposite_moira_mactaggert.sql` adds body members, shared work assignments, temporary attendance passes and file metadata. Preserve `.wrangler/state` to retain local D1 and R2 files. Hosted D1/R2 and local storage are separate. START EVENT HUB applies pending local migrations.

```sh
npm run typecheck
npm test
npm run test:auth
npm run test:body
npm run test:body:http -- --restart
```

The HTTP test uses synthetic accounts in the loopback database, tests cross-account/role restrictions and real file retrieval, then removes only its own fixtures. It cannot run against a hosted URL. Camera hardware and browser permission prompts require device verification.
