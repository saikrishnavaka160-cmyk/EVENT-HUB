# EVENT HUB

College ID login, registration and a campus event workspace.

**Windows:** extract the source ZIP and double-click `START EVENT HUB.cmd`. The first run needs internet access to install missing Node/npm dependencies. Open http://127.0.0.1:5173/ and register with your own College ID and password.

- [Account setup, endpoints and security](README-AUTH.md)
- [Local running, backups and diagnostics](README-LOCAL.md)
- [Event workflows](README-EVENTHUB.md)
- [Private body files, assigned work and attendance scanners](README-BODY-OPERATIONS.md)

IDs use `^[0-9]{2}1FA[A-Z0-9]{5}$` after trimming and uppercasing. Passwords retain their exact case and spaces, require eight characters, and are stored only as bcrypt hashes. There are no default account passwords.

The ZIP contains source, migrations, tests and assets. Installed dependencies, private database files, sessions, runtime caches, secrets and Git history are excluded.
