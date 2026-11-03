# Live Relay

This is a synthetic demo relay, not a Salesforce API or an authenticated service.
It stores no story, payload history, credentials, or persistent rooms. GitHub
Pages serves the UI; the existing Salesforce-team Heroku app
`kevcassidy-a2a-relay-vision` runs only the Node WebSocket relay.
The user approved connecting this app to the public personal GitHub copy and
Pages for this prototype. This supersedes the previous internal-only hosting
restriction for this copy only. No hosting has been provisioned by this change.

## Local Verification

`npm ci`, `npm test`, `npm run build`, then `npm start`.
The relay listens on `PORT` (default 3000); `GET /health` returns `{"ok":true}`.
The existing `npm run demo` Vite transport remains unchanged and takes precedence
over the production relay. To exercise the production transport locally, build
with `VITE_RELAY_URL=ws://localhost:3000 npm run build`, then run
`npm run preview -- --port 5173` and use buyer/seller URLs with the same room.
Use `http://localhost:5173` consistently; origins match exactly.

## Heroku Web Deployment

1. Open the existing app `kevcassidy-a2a-relay-vision` in the Heroku dashboard.
2. In Deploy, choose GitHub and connect the approved **personal public repository**.
   Confirm the owner/repository, rather than connecting the internal origin.
3. Choose the branch containing these changes and use Deploy Branch. Enable
   automatic deploys only if desired. The relay code is published on `master`.
4. Use the Node.js buildpack. The root `Procfile` declares `web: npm start`.
   `heroku-postbuild` deliberately skips building the UI; Pages builds it.
   In Resources, ensure exactly **one web dyno** is running. Provisioning or
   scaling remains a user/dashboard action. Multiple dynos are unsupported
   because rooms are held in one process, with no shared broker.
5. Obtain the **exact app hostname** from Settings > Domains (or Open App).
   Heroku hostnames can include a generated suffix. Do **not** assume
   `kevcassidy-a2a-relay-vision.herokuapp.com`. Check
   `https://<exact-dashboard-hostname>/health` and confirm HTTP 200.

## GitHub Pages Configuration

1. In the personal repo's Settings > Secrets and variables > Actions > Variables,
   create the **repository variable** `VITE_RELAY_URL` with
   `wss://<exact-dashboard-hostname>/`. This is a public endpoint, not a secret.
2. Keep Pages configured to GitHub Actions. Run Deploy Prototypes (or push only
   when authorized). The workflow tests and builds using that repository variable.
   Changing the variable requires rebuilding Pages; it is not runtime config.
3. A blank/missing variable retains standalone playback. Even with the variable,
   a production page without a valid `room` stays standalone and opens no socket.
4. Generate a fresh random room token (16-64 ASCII letters/digits/underscore/hyphen),
   preferably `crypto.randomUUID()` in a browser console. Share the same token in
   `.../buyer/?room=<token>` and `.../seller/?room=<token>`. For a share HTML build,
   query parameters precede the hash: `share.html?room=<token>#buyer` / `#seller`.
   Do not reuse a predictable room between demos.
5. Open the buyer and seller on separate devices. Opening or reconnecting a peer
   resets both stories to step 1, playing. Test a quote beat, pause/play, restart,
   and jump. Close one side: the other resumes stand-in playback after about
   5-7 seconds. A transport close falls back immediately and retries every 2 seconds.
   On initial connection, stand-in playback waits up to about 5-7 seconds for a
   peer; no configured relay means immediate standalone playback.
6. Open another pair with a different room and confirm presenter actions do not
   cross rooms. Remove the variable and rebuild to verify the standalone rollback.

## Bounds and Trust

- Exact allowed browser origins: `https://kevcassidy01.github.io`,
  `http://localhost:5173`, `http://127.0.0.1:5173`. Missing origins are rejected.
  A different Pages owner, custom domain or local port requires an explicit code
  change. The Pages origin covers all repositories on that personal account.
- Maximum 100 rooms, 2 sockets per room, 1 KiB per message, 60 messages per socket
  per 10 seconds, and 8 KiB outgoing buffered data. No compression or offline queue.
- Hello is required within 5 seconds. Identity/side cannot change on a socket;
  opposite sides pair, and only the seven known owned beats, steps 1-15, boolean
  pause and presence messages are accepted. Binary/malformed traffic closes the socket.
- Ping/pong prunes dead connections; rooms disappear when their last socket closes.
  Restarting/redeploying the dyno loses all rooms; browsers retry and re-handshake.
- An origin allowlist is **not authentication**: non-browser clients can spoof
  Origin, and anyone knowing a room can join it. Use synthetic data only. Room
  tokens are demo isolation, not credentials. No secrets belong in this public repo
  or in `VITE_*` variables.

## Verification Limits

Automated tests open real local WebSocket clients and test isolation, health,
validation, origin checks, resource limits, expiry and cleanup. Browser transport
tests cover open-time hello, reconnect and disposal using a deterministic socket.
The build typechecks the React integration. Actual Heroku/Pages and two-device UI
verification must follow deployment; no hosting actions are part of this change.
