# Signing users into a private help center (JWT)

Use this when the help center is **Private** and the site's own signed-in users should read
it in the widget, and on the help center itself, without a second login. A public help
center needs no tokens: the widget shows everything public to everyone.

## What gets built

| Piece | Where | Who |
|---|---|---|
| Single sign-on settings, the **Shared secret**, the help center set to Private | Dashboard (Settings → Single sign-on, Catalyst) | The user |
| The secret in the server's environment as `HELPCENTER_SSO_SECRET` | Hosting settings or secret store | The user |
| A token function: HS256, claims below | Server code | You |
| **Widget token endpoint**, e.g. `GET /api/helpcenter-token` | Server code, behind the app's sign-in | You |
| **Login URL**, e.g. `GET /auth/helpcenter`, for readers who open the help center itself (also from the widget's links to it) | Server code, behind the app's sign-in | You |
| The widget gets the first token in `jwt` and new ones from `onAuthExpired` | Client code | You |

The dashboard requires a Login URL even when only the widget uses sign-in, so build both.

## The secret

- Read it only on the server, from `HELPCENTER_SSO_SECRET` (or the framework's config that
  reads that variable, such as `config('services.helpcenter.sso_secret')` in Laravel). Fail
  loudly when it's missing.
- Never in client code or a public variable (`NEXT_PUBLIC_*`, `VITE_*`, `NUXT_PUBLIC_*`,
  `REACT_APP_*`), never in a commit, a log line or the conversation. In Next.js, start the
  token module with `import 'server-only'`, so a client import fails the build (the
  `server-only` package is tiny; if the project doesn't have it, say that you added it).
- Add `HELPCENTER_SSO_SECRET=` (empty) to `.env.example` and confirm `.env` is git-ignored.
- Use it exactly as the dashboard shows it, as a string. Don't base64-decode it.
- Don't log the tokens either; they're short-lived credentials.

## The token

Header `{"alg":"HS256","typ":"JWT"}`, signed with HMAC-SHA256. Claims:

| Claim | Value |
|---|---|
| `jti` | Widget: a new random value for every token (a UUID). Login URL: the `key` query parameter HelpCenter.io sent. Each one works once. |
| `iat` | Now, in **seconds** (`Math.floor(Date.now() / 1000)`, never `Date.now()`) |
| `exp` | `iat + 300` |
| `email` | The user's email. Required. |
| `name` | The user's name. Required and non-empty: fall back to the email. |
| `external_id` | The app's stable user ID, as a string. Strongly recommended: it keeps the reader the same when their email changes. |
| `iss`, `aud` | Only if the dashboard has an Issuer or Audience set, then exactly that value. One string each, never a list (a list fails with a server error). |

`role` is ignored (every signed-in visitor is a reader), and `sub` doesn't replace `email`.
The widget refuses a token older than the dashboard's Token TTL (300 seconds by default)
plus 30 seconds, so sign each token when it's asked for, never ahead of time. Clocks may
differ by 30 seconds at most.

If the project already uses a JWT library, it's fine to use it with `HS256`, times in
seconds and `aud` as a string. Otherwise these standard-library versions add no dependency.

### Node.js (18+)

```js
// lib/helpcenter-token.js (server only)
import { createHmac, randomUUID } from 'node:crypto';

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

export function helpCenterToken(user, { jti = randomUUID() } = {}) {
  const secret = process.env.HELPCENTER_SSO_SECRET;
  if (!secret) throw new Error('HELPCENTER_SSO_SECRET is not set');
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const payload = encode({
    jti,
    iat: now,
    exp: now + 300,
    email: user.email,
    name: user.name || user.email,
    external_id: String(user.id),
  });
  const signature = createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}
```

### Python (3.8+)

```python
# help_center_token.py (server only)
import base64, hashlib, hmac, json, os, time, uuid

def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")

def help_center_token(user, jti=None) -> str:
    secret = os.environ["HELPCENTER_SSO_SECRET"]  # KeyError when missing, on purpose
    now = int(time.time())
    header = _b64url(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload = _b64url(json.dumps({
        "jti": jti or str(uuid.uuid4()),
        "iat": now,
        "exp": now + 300,
        "email": user.email,
        "name": user.get_full_name() or user.email,  # adapt to the user model
        "external_id": str(user.pk),
    }).encode())
    signature = hmac.new(secret.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()
    return f"{header}.{payload}.{_b64url(signature)}"
```

### PHP (8+)

```php
function help_center_token(array $user, ?string $jti = null): string
{
    // Laravel: config('services.helpcenter.sso_secret'); elsewhere getenv('HELPCENTER_SSO_SECRET').
    $secret = (string) getenv('HELPCENTER_SSO_SECRET');
    if ($secret === '') {
        throw new RuntimeException('HELPCENTER_SSO_SECRET is not set');
    }
    $b64url = fn (string $data): string => rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    $now = time();
    $header = $b64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = $b64url(json_encode([
        'jti' => $jti ?? bin2hex(random_bytes(16)),
        'iat' => $now,
        'exp' => $now + 300,
        'email' => $user['email'],
        'name' => $user['name'] ?: $user['email'],
        'external_id' => (string) $user['id'],
    ]));
    $signature = $b64url(hash_hmac('sha256', "$header.$payload", $secret, true));

    return "$header.$payload.$signature";
}
```

### Ruby

```ruby
require "base64"
require "json"
require "openssl"
require "securerandom"

def help_center_token(user, jti: SecureRandom.uuid)
  secret = ENV.fetch("HELPCENTER_SSO_SECRET") # KeyError when missing, on purpose
  now = Time.now.to_i
  encode = ->(value) { Base64.urlsafe_encode64(JSON.generate(value), padding: false) }
  header = encode.call({ alg: "HS256", typ: "JWT" })
  payload = encode.call({
    jti: jti, iat: now, exp: now + 300,
    email: user.email,
    name: user.name.to_s.empty? ? user.email : user.name,
    external_id: user.id.to_s
  })
  signature = Base64.urlsafe_encode64(OpenSSL::HMAC.digest("SHA256", secret, "#{header}.#{payload}"), padding: false)
  "#{header}.#{payload}.#{signature}"
end
```

## The widget token endpoint

Behind the app's existing sign-in. It answers 401 to anyone not signed in, returns a fresh
token on every call, and isn't cached:

```ts
// Next.js App Router: app/api/helpcenter-token/route.ts
import { NextResponse } from 'next/server';
import { helpCenterToken } from '@/lib/helpcenter-token'; // starts with: import 'server-only';
import { getCurrentUser } from '@/lib/auth';              // the app's own session lookup

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new NextResponse(null, { status: 401 });
  return NextResponse.json({ jwt: helpCenterToken(user) }, { headers: { 'Cache-Control': 'no-store' } });
}
```

The same shape elsewhere: an Express route behind the session middleware; a Laravel route in
the `auth` middleware group returning
`response()->json(['jwt' => …])->header('Cache-Control', 'no-store')`; a Rails controller
action behind `authenticate_user!` with `response.headers["Cache-Control"] = "no-store"`; a
Django view with `@login_required` and `@never_cache`. Keep it on the site's own domain; it
needs no CORS.

## Hand the tokens to the widget

Load the widget only for signed-in users, with the first token in `jwt` and a function that
fetches the next ones in `onAuthExpired`. Both are needed: every widget request uses its own
single-use token, so after the first one the widget asks `onAuthExpired` before each
request. Without it, each later request waits 8 seconds and is refused.

```js
async function fetchHelpCenterToken() {
  const response = await fetch('/api/helpcenter-token', { credentials: 'same-origin', cache: 'no-store' });
  if (!response.ok) throw new Error(`HelpCenter.io token request failed: ${response.status}`);
  return (await response.json()).jwt;
}

// After the app knows the user is signed in, once per page load:
fetchHelpCenterToken().then((jwt) => {
  loadHelpCenterWidget({ app_id: WIDGET_ID, jwt, onAuthExpired: fetchHelpCenterToken });
});
```

`loadHelpCenterWidget` is the guarded loader from install-recipes.md. In Next.js, do this in
the client component's effect before rendering the loader `<Script>`. A server-rendered
page can write the first token into the page (`jwt: "…"`) instead of fetching it.

Expect a burst of token requests when the widget opens and one per search, list or article
after that: keep the endpoint fast. On sign-out, `window.hcWidget?.destroy()` and a full
page load; a different user needs a page load too (`setJwt` never switches identity).

## The Login URL

HelpCenter.io sends readers without a session to the Login URL with `?subdomain=…&key=…`.
The endpoint:

1. Reads `key`; answers 400 when it's missing.
2. Requires a signed-in user: if there's none, sends them to the app's login and back to this
   same URL, `key` included.
3. Signs a token with `jti` set to `key`.
4. Redirects (302) to `HELPCENTER_URL + "/sso/jwt?jwt=" + token`, where `HELPCENTER_URL`
   is the help center's address from configuration: its custom domain, or
   `https://<subdomain>.helpcenter.io`. Never build it from the `subdomain` parameter.

```js
// Express-style; adapt to the framework's router and auth guard.
app.get('/auth/helpcenter', requireSignedIn, (req, res) => {
  const key = typeof req.query.key === 'string' ? req.query.key : '';
  if (!key) return res.status(400).send('Missing key');
  const token = helpCenterToken(req.user, { jti: key });
  res.set('Cache-Control', 'no-store');
  res.redirect(302, `${process.env.HELPCENTER_URL}/sso/jwt?jwt=${encodeURIComponent(token)}`);
});
```

The Login URL goes into the dashboard without a query string of its own.

## When it doesn't work

A widget request with a missing or refused token answers 403 with
`"code": "SITE_AUTH_REQUIRED"`, and the widget shows "Reconnecting your secure session…"
while it retries once. On a private help center that code means the token never
authenticated. HelpCenter.io doesn't say why; check, in order:

1. The secret: the same value as the dashboard, used as a string, read on the server (log
   only whether it's set, never its value).
2. Times in seconds, `exp` after `iat`, the server clock correct.
3. `email` and `name` present and non-empty; `aud` a string.
4. A new `jti` for every widget token; a token is never reused or cached.
5. `iss`/`aud` exactly as set in the dashboard, or not set in either place.
6. `onAuthExpired` passed and returning a token string.

A 403 with `SITE_IP_RESTRICTED` is the help center's IP allow-list, which no token changes.
A test that needs no browser is in verify.md.
