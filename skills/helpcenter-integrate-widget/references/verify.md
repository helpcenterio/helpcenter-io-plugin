# Verifying the integration

Check what you can yourself, say plainly what you checked and how, and give the user the
rest. Never report "the widget works" from reading the code alone.

## Checks without a browser

Run the project's own checks first: its build, type check and linter, so the integration
compiles in production mode, not only in the dev server.

**With the connector's widget tools, read the state first.** `helpcenter_get_widget_install`
answers in one call what would otherwise take a browser to find out:

- `visitors.served: true`: anonymous visitors get articles. `false` names why in `reason`:
  `unpublished` (the user publishes it; until then the widget answers only the team, signed
  in, and FAQ sections load nowhere else), `signed_in_readers_only` (private or password
  protected: visitors need single sign-on, jwt-sso.md), `ip_restricted` (only listed
  networks), `suspended`.
- `embedding_origins` holds every host the site runs on, and `frame_ancestors` is the header
  that list makes. A missing host is the "Parent domain is not in the allowed list." failure
  before it happens.
- `entitlements`: `widget` false means the plan doesn't include it; `ai_answers` and
  `proactive_messages` say whether Ask AI and messages beyond Page URL and Time on page will
  work.
- `installed` and `last_seen_at` come from the widget's usage records, not from this call,
  so they may not reflect a page you loaded moments ago. Don't treat `installed: false` as a
  failure; the browser checks below are the proof.

For a Custom FAQ section, `helpcenter_get_faq_section` lists its FAQs in order with `shown`:
every one should be true once the user has agreed to publish them. Check `display_urls` holds
the same hosts as `embedding_origins`.

Report these in the hand-off: they're the published and allowed-hosts checks, done without
the user. Then three requests against HelpCenter.io's public widget endpoints (no credentials
needed, except the token test); without the connector's widget tools they are the checks:

```bash
# 1. The widget ID exists. 200 = yes; 410 with "WIDGET_NOT_FOUND" = a wrong app_id.
curl -s -o /dev/null -w '%{http_code}\n' https://embed.helpcenter.io/widget/WIDGET_ID

# 2. Visitors can read articles. 200 with articles = published public help center.
#    403 with "SITE_AUTH_REQUIRED" = not published yet, or private (sign-in needed).
curl -s https://embed.helpcenter.io/widget/WIDGET_ID/articles | head -c 300; echo
```

3. **A signing test, for a private help center.** Sign one token with the project's own token
function and send it as `Authorization: Bearer <token>` to the same `/articles` address. 200
means the token authenticated; 403 `SITE_AUTH_REQUIRED` means it didn't (jwt-sso.md lists
why). Run it as a small script that reads `HELPCENTER_SSO_SECRET` from the environment and
prints only the status code: the secret and the token stay out of the output. Each token
works once, so sign a new one per attempt. On a public help center this test proves nothing:
the articles answer 200 with or without a token.

A FAQ section's content: `https://<help center>/share/faqs/KEY` shows it on its own.

## Checks in a browser

Run the site locally (or open the preview deployment) on a host that's in Embedding origins:
`localhost` covers any port. If you can drive a browser (Playwright, a browser tool), load
the page and check the following; otherwise hand this list to the user.

1. **The launcher** appears in the corner (or your own button turns enabled, with
   `showButton: false`).
2. **The console** has no Content Security Policy violation and no "Parent domain is not in
   the allowed list." (that line comes from the widget's frame; in Chrome DevTools it shows
   in the page console).
3. **The network tab:** `init.js` 200; `https://embed.helpcenter.io/widget/WIDGET_ID` 200 (a
   frame). Opening the widget lists articles. `/articles` or `/category/…` answering 403
   `SITE_AUTH_REQUIRED` means "not published" on a public help center, and "the token never
   authenticated" on a private one.
4. **Single-page apps:** navigate between routes without reloading; the widget stays, and the
   home list follows the route if you wired `setCategory`. Exactly one widget frame exists
   (`document.querySelectorAll('iframe[src*="embed.helpcenter.io/widget/"]').length === 1`).
5. **Articles from links:** a `data-hc-article` (or your delegated) link opens the article
   inside the widget.
6. **FAQ sections:** the block fills with questions; clicking one opens its answer. An empty
   block: network shows `/widget/faqs/KEY` answering 400 (host not in Display on URLs), or
   no request at all (the section mounted after load, or the script was blocked).
7. **Sign-in:** signed in, the widget shows the private help center's articles; the token
   endpoint is called once per widget request and answers 200; signed out, it answers 401
   and the widget isn't loaded.
8. **Proactive messages:** with the user's message switched on, the event fires
   (`?hcnudge=debug` on the page's address logs each rule's verdict in the console).
9. **Mobile width** (under 450 px): the widget opens full screen and the site's own fixed
   elements (cookie banners, chat buttons) don't cover the launcher.

## Symptoms and causes

| What you see | Likely cause | Fix |
|---|---|---|
| No launcher, "Parent domain is not in the allowed list." | Host missing from Embedding origins | Add the exact host (`helpcenter_update_embedding_origins`), or the user does |
| No launcher, `window.hcOptions` undefined | The snippet never ran: CSP, a tag manager not published, or a component that never mounted | Check the console and where the code is mounted |
| No launcher, "Cannot read properties of null (reading 'appendChild')" | Snippet in `<head>` | Move it before `</body>` or load it after the body exists |
| Two launchers, or calls hit the wrong one | The loader runs twice (per-route component, StrictMode without a guard, two copies of the snippet) | Load once, with the guard |
| Launcher shows, no articles, 403 `SITE_AUTH_REQUIRED` | Help center not published, or private without a valid token (`visitors.reason` says which) | Publish (user), or fix sign-in |
| Frame request answers 410 `WIDGET_NOT_FOUND` | Wrong `app_id` | Copy the ID again |
| Works in Chrome and Safari, not in Firefox | Referrer-Policy `no-referrer` or `same-origin` | csp-and-embedding.md |
| `hcWidget.show()` does nothing | Called before the widget was ready, or `window.hcWidget` undefined at that moment | `onWidgetReady` / `onReady` |
| FAQ block empty on a route reached client-side | Section mounted after load | The component in faq-sections.md |
| FAQ block unstyled | `style-src` lacks `'unsafe-inline'` | Add it |
| FAQ block empty, `/widget/faqs/KEY` answers 400 | Host not in the section's Display on URLs | `helpcenter_update_faq_section` with the full `display_urls` list, or the user |
| FAQ block empty, `/widget/faqs/KEY` answers 403 `SITE_NOT_PUBLISHED` | Help center not published | Publish (user) |
| Custom FAQ block shows fewer questions than added | Some FAQs unpublished (`shown: false` in `helpcenter_get_faq_section`) | Publish them, once the user agrees |
| Widget asks "Reconnecting your secure session…" | Token refused or `onAuthExpired` missing | jwt-sso.md |
| Ask AI or "Can this help?" missing | No AI on the plan, or AI Answers off | User's plan and Settings → AI features |
| No "Message our team" | No contact recipient on the help center | User sets one, or `onContactsRequest` |
| Widget shows "Not available on this network" | The help center's IP allow-list | User's settings |
