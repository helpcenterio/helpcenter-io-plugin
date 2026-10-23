# Content Security Policy, referrers and embedding

## Does the site send a policy?

Look for a `Content-Security-Policy` header set in server config, middleware or framework
config (`next.config.*` `headers()`, `middleware.ts`, helmet in Express, Rails
`config/initializers/content_security_policy.rb`, Django `CSP_*` settings or
`django-csp`, Laravel middleware or a CSP package, `vercel.json`, `netlify.toml`, `_headers`,
Cloudflare rules) and for `<meta http-equiv="Content-Security-Policy">` in the layout. If
there is none, skip this section. If there is one, add only these sources to it; don't
replace or loosen what's there.

## HelpCenter.io hosts

| Host | What the page loads from it |
|---|---|
| `https://helpcenter.io` | The loader `/js/init.js` and the scripts it loads under `/js/`; `embed.js` |
| `https://embed.helpcenter.io` | The widget's frame; requests for its configuration, proactive messages and FAQ sections |
| `https://metrics.helpcenter.io` | Usage statistics for the widget and FAQ sections |
| `https://fonts.bunny.net` | Web fonts of the FAQ section designs |
| The help center's own address (`https://acme.helpcenter.io` or its custom domain) | The whole help center in a frame (embed.js) |

These are the same for every help center; a custom domain changes only the help center's
own address.

## Directives

The widget:

```
script-src  https://helpcenter.io        + a nonce or hash for the inline options script
frame-src   https://embed.helpcenter.io
connect-src https://embed.helpcenter.io https://metrics.helpcenter.io
```

FAQ sections add (they render in the page, so the page's policy applies to them):

```
style-src   'unsafe-inline' https://fonts.bunny.net
font-src    https://fonts.bunny.net
img-src     <the hosts the answers' images load from>
```

The whole help center in a frame adds:

```
frame-src   https://<the help center's address>   (and the Login URL's origin, for a private one)
```

What breaks without each one:

| Missing | Symptom |
|---|---|
| `script-src https://helpcenter.io` | Nothing loads; a script-src violation in the console |
| A nonce/hash for the inline options script | Nothing loads. Give the tag the nonce the framework already generates, or move `window.hcOptions` into a script file of the site's own |
| `frame-src https://embed.helpcenter.io` | No launcher; a frame-src violation |
| `connect-src https://embed.helpcenter.io` | The widget appears, but proactive messages and FAQ sections don't load |
| `connect-src https://metrics.helpcenter.io` | Everything works; usage statistics aren't recorded |
| `style-src 'unsafe-inline'` | FAQ sections show unstyled |
| fonts.bunny.net | FAQ sections fall back to system fonts |

The widget's frame is its own document: its fonts, styles and images don't count against the
page's policy.

Framework notes:

- **Next.js:** a static header in `next.config.js` `headers()`; with nonces generated in
  `middleware.ts`, read the nonce in the root layout (`headers().get('x-nonce')`) and pass it
  as the `nonce` prop of the `<Script>` elements.
- **Rails:** `policy.script_src :self, "https://helpcenter.io"`,
  `policy.frame_src "https://embed.helpcenter.io"`,
  `policy.connect_src :self, "https://embed.helpcenter.io", "https://metrics.helpcenter.io"`;
  `javascript_tag nonce: true` covers the inline tag.
- **helmet (Express):** add the hosts to the matching `directives` arrays.

## Referrer-Policy

The widget learns which site it's on from the referrer. Keep at least the origin in it, as the
default `strict-origin-when-cross-origin` does. With `no-referrer` or `same-origin`, the
widget doesn't render in Firefox ("Parent domain not found. Cannot render the widget." in the
console). If the site sets one of those globally, set `strict-origin-when-cross-origin` on
the pages that carry the widget, or tell the user.

## Embedding origins in one place

The widget checks the host of the page it sits on against Embedding origins: hosts only,
ports ignored, exact matches, a leading dot for a domain and its subdomains, an empty list
blocks everything. FAQ sections use their own list, Display on URLs, matched the same way.
Collect every host the site runs on, and add them with `helpcenter_update_embedding_origins`
when your tool list has it (dashboard-steps.md has the user's steps otherwise). A leading dot
over a shared platform domain is refused: list the exact host there.

## The whole help center on a page (embed.js)

For a dedicated "Help" page that shows the full help center (search, categories, articles) in
a frame that sizes to its content. Growth and Catalyst plans. The widget suits most other
cases better.

```html
<div id="hc_embed"></div>
<script>window._hcEmbedOpts = { subdomain: 'acme' };</script>
<script src="https://helpcenter.io/js/embed.js"></script>
```

With a custom domain, use `{ customDomain: 'help.acme.com' }` instead (domain only, no
`https://`). `#hc_embed` must come before the script. The embed writes the reader's position
into the page's URL fragment (`#/en/content/…`), so it doesn't fit a page whose router uses
the fragment. Give the frame a title for screen readers after the script:
`document.querySelector('#hc_embed iframe')?.setAttribute('title', 'Help center')`.

Framing is allowed only from Embedding origins, enforced by the help center's
`frame-ancestors` header, which browsers check against **every** page in the chain of frames,
not only the one containing the help center. And its sources match only `https://` pages on
the standard port, so it can't be tested on `http://localhost:3000`; test on an https
preview host listed in Embedding origins.

**Website builders that wrap custom code in a frame.** Wix's Embed HTML element runs inside a
frame on a separate `filesusr.com` host. The help center embedded there sits two frames deep,
so Embedding origins needs both the site's host (`www.example.com`) and that frame's exact
host (the `src` of the embed's iframe, found in the browser's developer tools). The same
applies to any tool that shows the page inside another page (a reporting tool, an intranet
portal): list every host in the chain.

A private help center in this frame keeps readers signed in only when the help center and the
page share a site (a custom domain such as `help.example.com` inside `app.example.com`). On
another site the browser drops the help center's session cookie inside the frame and readers
loop through the Login URL. For private content on another site, use the widget with JWT
sign-in, which needs no cookie.

## Custom domain and subfolder

These change where the help center itself lives, not the widget (its loader and frame
addresses stay the same). Both are dashboard settings: Settings → **Custom domain** (then a
CNAME record to `<subdomain>.helpcenter.io` at the DNS provider) and Settings → **Subfolder
hosting** (serving the help center at `https://www.example.com/docs` through the site's own
proxy, Growth and Catalyst, public help centers). If the user asks for subfolder hosting, the
dashboard card generates the proxy rules for nginx, Apache, Cloudflare, Vercel/Next.js,
Netlify, CloudFront and IIS; add the generated rules to the site's config as given, then the
user runs **Check setup** and **Go live**.
