# UPSC Atlas

Google sign-in, private cloud study progress, optional Google Drive backup, DeepSeek text generation, and a sanitized RSS reader.

## Run locally

Use Node.js 22.14+ (latest Node 22 recommended).

1. Install dependencies with `npm ci`.
2. Create a local `.env` from `.env.example` and configure the server credentials below.
3. Run `npm run dev`, or `npm run build && npm start`.
4. Open http://127.0.0.1:3000.

The production build places browser assets in `dist/client` and the server in `dist/server`. Only the browser directory is served publicly. Set `HOST=0.0.0.0` and `PORT` when your hosting platform requires them. Terminate HTTPS at your host/reverse proxy.

## Credentials and Firebase

- Revoke the previously committed DeepSeek key before deployment. Removing it from current source does not revoke it or remove it from Git history.
- Set a replacement `DEEPSEEK_API_KEY` in the server environment or hosting secret manager. Never use a `VITE_` prefix for secrets.
- Configure `FIREBASE_PROJECT_ID` and `FIRESTORE_DATABASE_ID` to match `firebase-applet-config.json`.
- Enable Google as a Firebase Auth provider and add your development and production domains to Firebase's authorized domains.
- Use Application Default Credentials / workload identity on the host. For local development, `GOOGLE_APPLICATION_CREDENTIALS` can point to a service account JSON outside the repository. Grant only the permissions needed to verify/revoke-check Firebase users and access the selected Firestore database.
- Apply `firestore.rules` to the selected database. Client SDK access is denied; the authenticated Node backend performs all database operations. Admin SDK access bypasses rules, so server ownership checks remain mandatory.
- The existing Firebase browser config is public project configuration, not a server secret.
- `GEMINI_API_KEY` is optional and used for scanned-document OCR. Text answers, chat, and text generation use DeepSeek. Scanned files require OCR configuration; failures do not fabricate an evaluation.

Drive and Calendar access is requested separately from Google sign-in. OAuth access tokens are held in memory and expire locally after 50 minutes; reconnect when prompted. Public release of these integrations also requires completing the relevant Google OAuth consent configuration/verification.

## Accounts, progress, and migration

Every API operation requires a verified Firebase ID token sent in `X-Firebase-Token`. Cloud workspace paths use only the verified user ID, never a user ID supplied in the request body.

The app fetches cloud progress before mounting study screens. Existing browser data is assigned to the importing account; an explicit choice is shown if local and cloud copies differ. The displaced copy is downloaded before replacement. Recovery copies are stored per account in IndexedDB. Drive restore is explicit, exports the current copy first, and writes through the same cloud revision checks.

Writes use optimistic revisions. A stale device receives HTTP 409 and must choose which copy to keep. The backend keeps five rotating snapshots and supports up to 4 MB of workspace data using chunked Firestore documents. Snapshot restoration currently requires an administrative recovery operation; there is no version-history UI.

## AI allowances and plans

- Every actual AI provider call reserves one persistent usage slot in a Firestore transaction.
- Free accounts receive five calls per UTC day. Accounts with a server-managed `entitlements/{uid}` document containing `status: "active"` and a future `expiresAtMs` receive 100.
- At most two AI calls may run per user. Leases expire after three minutes to recover from terminated processes.
- Input is limited to 80 KB and DeepSeek output to 8,192 tokens. The SDK's automatic retries are disabled.
- The platform tracks input/output tokens and a conservative daily reservation budget. `AI_RESERVATION_MICRO_USD` defaults to $1 per provider invocation; `AI_DAILY_BUDGET_MICRO_USD` defaults to $10 across all users. Reservations are retained on failure. These are conservative admission controls, not invoiced spend: confirm each configured model's maximum cost fits the reservation before launch.
- Existing feature fallback paths can make more than one provider call, each counted separately.
- No checkout, payment webhook, or automatic subscription provisioning is included. Only trusted server/admin operations may grant entitlements. Add and verify the chosen payment provider before selling subscriptions.

## RSS reader

Feed and article requests use HTTPS-only destination validation, public-address DNS checks at connection time, bounded redirects, response limits, and timeouts. Google proxy operations are restricted to supported Drive and primary-calendar paths. The server shares a bounded five-minute feed/article cache; reading history and saved content remain account-specific.

Article HTML is sanitized. Publisher pages open at their original origin instead of running inside an app-origin iframe. Recently extracted articles are retained in a bounded, account-specific browser cache for recovery when a source request fails. This is not a complete offline-installable PWA.

Feed categorization and keyword extraction are local heuristics, avoiding paid AI calls during ordinary browsing. Explicit AI summaries and study tools consume the account's allowance. DeepSeek responses must not claim live Google Search verification.

## Validation and deployment

Run:
```sh
npm run lint
npm test
npm run build
```

CI runs these checks on pushes and pull requests. Tests cover destination restrictions, hostile article HTML, workspace isolation, stale writes, same-length edits, anonymous requests, and AI allowances.

Before public launch, complete real-account Google sign-in/Drive testing, Firestore deployment and credentials, DeepSeek key rotation and live evaluation checks, and payment integration if charging customers. Those external services are not configured by this source change. The existing large application bundle still warrants further route-level splitting for performance.
