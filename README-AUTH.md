For the current college-email activation requirement, migration, and server secrets, see [README-VERIFICATION.md](README-VERIFICATION.md). Email verification supersedes the original immediate registration behavior described below.

# EVENT HUB — College ID login and registration

The application now uses real College ID accounts stored in SQLite/D1. The old local demo cookie does not authenticate these accounts. The hosted Site retains its existing ChatGPT access gate; College ID login is an additional application account inside that gate. Existing event demo records remain in the database, and newly registered accounts have separate workspaces.

## Run the application

1. Extract the ZIP into a normal writable folder.
2. Double-click **START EVENT HUB.cmd** inside the extracted project.
3. The Windows launcher uses a project-local Node.js 24/npm runtime. If unavailable, it downloads the official distribution and checks its SHA-256 checksum. The first dependency installation needs internet access.
4. Open **http://127.0.0.1:5173/** and select **Register**. There are no preset account passwords.
5. Choose your own College ID and password. Registration signs you in. Use the account menu to change your password or sign out.

For command-line development with Node.js 24 and npm installed:

```sh
npm ci
npm start
```

`npm start` prepares the local database and runs the app. **STOP EVENT HUB.cmd** stops this app's process; **CHECK EVENT HUB.cmd** checks HTTP availability and SQLite integrity. Keep `.wrangler/state` to retain local data. Local and hosted databases are separate. Do not copy a live database into public source packages.

## Code structure

```text
app/components/CollegeAuth.tsx       Login, registration and password-change forms
app/college-auth.css                 Responsive account-page styling
app/api/auth/[action]/route.ts       Auth HTTP endpoints
lib/auth-validation.ts               Shared, pure ID/password validation
lib/portal-auth.ts                   bcrypt, database lookups, sessions, rate limits
app/api/[...path]/route.ts           Authenticated application operations
db/schema.ts                        Drizzle schema, constraints and indexes
drizzle/0001_first_prowler.sql       Account/session/rate-limit schema migration
scripts/local-eventhub.mjs           Local process and migration management
scripts/test-auth.mjs                Validation and bcrypt tests
scripts/test-auth-http.mjs           Real HTTP/database security tests
examples/auth/mock-user-store.mjs    Isolated in-memory mock lookup adapter
```

## Validation and password storage

College IDs are trimmed and converted to uppercase before validation on both client and server:

```js
const collegeId = input.trim().toUpperCase();
const valid = /^[0-9]{2}1FA[A-Z0-9]{5}$/.test(collegeId);
```

`251FA0AI65` and `251fa0ai65` identify the same account. The canonical ID is unique in the database. It must have exactly two year digits, literal `1FA`, and five ASCII uppercase letters or digits.

Passwords are never trimmed, uppercased, logged or returned in API responses. Registration and password changes require at least eight Unicode characters and at most 72 UTF-8 bytes, preventing bcrypt's silent input truncation. There is no forced uppercase/digit/symbol rule. Passwords are hashed with **bcryptjs**, cost **12**, using a fresh random salt before insertion or update. Login uses `bcrypt.compare` against the stored hash.

## API

All POST requests must use JSON and an `Origin` header matching the application's origin. Browsers set this automatically for same-origin form requests made by the application.

| Method | Endpoint | Input / result |
|---|---|---|
| POST | `/api/auth/register` | `{collegeId,password,name?,confirmPassword?}`; returns safe user fields, sets session cookie |
| POST | `/api/auth/login` | `{collegeId,password}`; returns safe user fields, rotates browser session |
| GET | `/api/auth/me` | Returns current user's ID, display name and role; otherwise 401 |
| POST | `/api/auth/logout` | `{}`; revokes current session and expires cookie |
| POST | `/api/auth/password` | `{currentPassword,newPassword}`; changes hash, revokes **all** account sessions, requires login again |

Errors use `{error: "message"}`. Relevant status codes are 400 (validation), 401 (credentials/session), 403 (origin or permissions), 409 (duplicate ID/concurrent account change), 429 (attempt limit) and 503 (unavailable storage).

## Database lookup and authorization

The live lookup is parameterized SQL:

```sql
SELECT college_id, password_hash, display_name, role
FROM portal_users WHERE college_id = ?;
```

`portal_users` contains the canonical ID, bcrypt hash, display name, server-assigned role and timestamps. `auth_sessions` stores only SHA-256 hashes of cryptographically random 256-bit tokens, user references and expiry. `auth_rate_limits` stores hashed attempt bucket identifiers and expiry. Requests never select a workspace based on a caller-supplied user ID.

New registrations always receive the **student** role. A submitted `role: "admin"` cannot change this. Every event operation uses the database account role; browser role switching has been removed. Privileged roles require an authorized database/operator provisioning process. There are no default administrator credentials.

The mock adapter under `examples/auth/` demonstrates `findByCollegeId` and `insert` without a database server. It accepts bcrypt hashes only and assigns student access. It is never imported by the application routes and is intended for isolated tests.

## Session and deployment behavior

Sessions last eight hours and survive application restarts. Cookies are HTTP-only, `SameSite=Strict`, host-only and `Path=/`; HTTPS adds `Secure` and uses a `__Host-` cookie name. Logout revokes the database session. Password changes use an atomic database batch and invalidate every session. Login checks that the password hash has not changed during verification before issuing a new session.

Login, registration and password changes have persistent rate limits. Unknown-account login follows a bcrypt comparison path, and credential failures use one message. JSON body limits and same-origin checks apply before authentication mutations. SQL values are bound parameters. The database also constrains canonical College ID format and allowed roles.

Before institutional deployment, connect registration to an authorized enrollment source or invite process: matching this ID format alone does **not** prove ownership of a student's College ID. HTTPS is required outside loopback development. This implementation includes current-password changes, but does not claim to implement a verified forgotten-password recovery channel, MFA or institutional SSO. Campus events/certificates in this project remain demonstration data.

## Tests

```sh
npm test
npm run test:auth
npm run typecheck
npm run build
# Against the running LOCAL app, with synthetic test accounts:
npm run test:auth:http
# Windows persistence test also stops/restarts the owned local process:
node scripts/test-auth-http.mjs --restart
```

The HTTP test uses random credentials only in process memory and records sanitized evidence in `outputs/auth-verification.json`. Synthetic verification accounts remain in the local test database. Never run destructive or noisy tests against an institutional production database.

Implementation references: [bcryptjs API and input limits](https://github.com/dcodeIO/bcrypt.js), [OWASP password storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [OWASP session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
