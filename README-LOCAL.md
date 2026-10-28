# EVENT HUB on your computer

All application source code is in:

`C:\Users\Lenovo\Documents\ChatGPT\Event hub\vignan-eventhub`

## Start, stop, and check

Open `C:\Users\Lenovo\Documents\ChatGPT\Event hub` in File Explorer and double-click:

- **START EVENT HUB.cmd** — prepares the local runtime and database, starts the application, and opens the browser.
- **CHECK EVENT HUB.cmd** — checks the running application and reports database integrity, record counts, and revision.
- **STOP EVENT HUB.cmd** — stops this application's background server and keeps its saved data.

The same three launchers are also inside the `vignan-eventhub` source folder.

Local application: **http://127.0.0.1:5173**

Keep the source folder in place while the application is running. To move it, stop the application first and move the whole folder, including its hidden data folders.

## College ID sign-in

Open http://127.0.0.1:5173/ and select **Register**. Use a 10-character College ID such as `251FA0AI65` and choose your own password of at least eight characters. IDs are case-insensitive; passwords are case-sensitive. There are no preset credentials. Account activation requires a code sent to the College ID’s @vignan.ac.in mailbox; an administrator must configure email delivery first. See README-VERIFICATION.md. The account menu provides password changes and sign-out.

New verified accounts have Student access. Campus events and approvals are shared across accounts. Privileged roles must be provisioned by an authorized operator; a browser cannot assign itself a role. The old local demo cookie no longer authenticates application accounts. See `README-AUTH.md`.

## Database and saved data

The application uses a local **SQLite database through D1**. It does not need a separate database service, MySQL, or Java. Application changes are written to SQLite files under:

`C:\Users\Lenovo\Documents\ChatGPT\Event hub\vignan-eventhub\.wrangler\state\v3\d1`

Startup checks the existing database and applies pending schema migrations using Wrangler’s migration ledger. Stopping and starting the application preserves its records. **Do not delete `.wrangler\state`**: that folder contains the local database.

To make a backup, stop EVENT HUB, then copy the entire `.wrangler\state` folder to a safe location. Keep the full folder together rather than copying individual files while the app is running.

The published website and this local application have **separate databases**. Records entered on one do not automatically appear on the other.

To check persistence yourself:

1. Start EVENT HUB and log in with an authorized Coordinator account.
2. Create a SAC event draft with a recognizable title.
3. Run **CHECK EVENT HUB.cmd**.
4. Stop and start EVENT HUB again.
5. Open Event Management and confirm the draft is still there.

## Runtime and troubleshooting

Setup keeps a portable Node.js runtime and npm inside `.eventhub-local\runtime`. After setup, ordinary startup uses those project-local tools and does not depend on Codex being open. Missing application dependencies require an internet connection to install. No global Java or MySQL installation is required.

If startup fails, inspect these files in the source folder:

- `.eventhub-local\server.log` — application startup output.
- `.eventhub-local\server-error.log` — errors from the application process.
- `.eventhub-local\last-check.json` — results of the most recent CHECK run.

Port 5173 must be available. If EVENT HUB is already running, START reuses it. If another application occupies the port, close that application before starting EVENT HUB. STOP checks the recorded process before stopping it; it does not stop unrelated Node.js applications.

## Developer commands

After local setup, open PowerShell and run:

```powershell
Set-Location -LiteralPath 'C:\Users\Lenovo\Documents\ChatGPT\Event hub\vignan-eventhub'
$env:PATH = "$PWD\.eventhub-local\runtime;$env:PATH"
& '.\.eventhub-local\runtime\npm.cmd' test
& '.\.eventhub-local\runtime\npm.cmd' run typecheck
& '.\.eventhub-local\runtime\npm.cmd' run build
```

`npm start` runs the local application with College ID authentication and database initialization. `npm run preview:worker` is the advanced built-Worker preview and uses the same College ID endpoints; run local setup/migrations before using it. Use the START launcher for normal use.

The application remains a university workflow demonstration with fictional seed records and demonstration certificates. See `README-EVENTHUB.md` for its features and workflow.
