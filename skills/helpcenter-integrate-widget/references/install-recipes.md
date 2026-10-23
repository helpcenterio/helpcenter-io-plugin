# Installing the loader, per stack

Every recipe does the same two things, in this order, once per page:

1. Set `window.hcOptions` (at least `app_id`). The loader reads it once, when it runs.
2. Load `https://helpcenter.io/js/init.js`, async, after `<body>` exists.

The address is the same for every help center, custom domains included. The widget ID is
public, so it can live in a public config value. Name it after the stack's convention:
`NEXT_PUBLIC_HELPCENTER_WIDGET_ID`, `VITE_HELPCENTER_WIDGET_ID`,
`NUXT_PUBLIC_HELPCENTER_WIDGET_ID`, or `HELPCENTER_WIDGET_ID` on a server. Render nothing
when it's empty, so a missing value never loads a broken widget.

Options, callbacks and the `window.hcWidget` API are in widget-api.md. TypeScript projects
need the `Window` declaration from there.

## Plain HTML

The dashboard's snippet (`install_snippet` from `helpcenter_get_widget_install` is the same
string), right before `</body>` on every page (in `<head>` it fails, because `document.body`
doesn't exist yet):

```html
<!-- HelpCenter.io smart widget code -->
<script type="text/javascript">(function(){
    var s = document.createElement('script');
    s.src = "//helpcenter.io/js/init.js";
    s.async = true;
    window.hcOptions = {
        app_id: 'WIDGET_ID'
    };
    document.body.appendChild(s);
})();
</script>
<!-- End HelpCenter.io smart widget code -->
```

`//helpcenter.io` takes the page's scheme, so on an `http://` page (local development) the
loader is fetched over http and redirected. Writing `https://helpcenter.io/js/init.js`
avoids that hop; every recipe below does.

The same without an inline loader, which also suits a strict Content Security Policy when
the options live in a file of the site's own:

```html
<script>window.hcOptions = { app_id: 'WIDGET_ID' };</script>
<script src="https://helpcenter.io/js/init.js" async></script>
```

On a multi-page static site, put it in the shared footer include or template, not by hand in
each file.

## Next.js, App Router

`next/script` in the root layout. The options go in a `beforeInteractive` inline script,
which Next puts in the server HTML ahead of everything else, and the loader goes after the
page is interactive:

```tsx
// app/layout.tsx
import Script from 'next/script';

const helpCenterWidgetId = process.env.NEXT_PUBLIC_HELPCENTER_WIDGET_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        {helpCenterWidgetId ? (
          <>
            <Script id="helpcenter-widget-options" strategy="beforeInteractive">
              {`window.hcOptions = { app_id: ${JSON.stringify(helpCenterWidgetId)} };`}
            </Script>
            <Script id="helpcenter-widget" src="https://helpcenter.io/js/init.js" strategy="afterInteractive" />
          </>
        ) : null}
      </body>
    </html>
  );
}
```

Options that are functions (`onWidgetReady`, `onAuthExpired`, `onContactsRequest`) or that
depend on the signed-in user belong in a client component instead. Set `window.hcOptions`
in an effect, then render the loader:

```tsx
// app/components/HelpCenterWidget.tsx
'use client';
import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function HelpCenterWidget({ appId }: { appId: string }) {
  const [optionsSet, setOptionsSet] = useState(false);

  useEffect(() => {
    if (window.hcOptions) {
      setOptionsSet(true);
      return;
    }
    window.hcOptions = {
      app_id: appId,
      onWidgetReady: () => window.dispatchEvent(new Event('helpcenter:ready')),
    };
    setOptionsSet(true);
  }, [appId]);

  return optionsSet ? (
    <Script id="helpcenter-widget" src="https://helpcenter.io/js/init.js" strategy="afterInteractive" />
  ) : null;
}
```

Render `<HelpCenterWidget appId={process.env.NEXT_PUBLIC_HELPCENTER_WIDGET_ID!} />` once,
in `app/layout.tsx`, and use only one of the two forms. `next/script` loads a given `id` once,
so client-side navigation doesn't add a second widget. Route changes: widget-api.md.

## Next.js, Pages Router

In `pages/_app.tsx`, both scripts `afterInteractive`, options first (Next runs them in the
order they render):

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import Script from 'next/script';

const helpCenterWidgetId = process.env.NEXT_PUBLIC_HELPCENTER_WIDGET_ID;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      {helpCenterWidgetId ? (
        <>
          <Script id="helpcenter-widget-options" strategy="afterInteractive">
            {`window.hcOptions = { app_id: ${JSON.stringify(helpCenterWidgetId)} };`}
          </Script>
          <Script id="helpcenter-widget" src="https://helpcenter.io/js/init.js" strategy="afterInteractive" />
        </>
      ) : null}
    </>
  );
}
```

Route changes come from `router.events.on('routeChangeComplete', …)`; see widget-api.md.

## React, Vue or Svelte with Vite (single-page apps)

One small module, called once at startup. The guard keeps React StrictMode's double effects
and hot reloads from adding a second widget:

```ts
// src/helpcenter.ts
const LOADER_ID = 'helpcenter-widget-loader';

export function loadHelpCenterWidget(options: HelpCenterOptions): void {
  if (!options.app_id || document.getElementById(LOADER_ID)) return;
  window.hcOptions = options;
  const script = document.createElement('script');
  script.id = LOADER_ID;
  script.src = 'https://helpcenter.io/js/init.js';
  script.async = true;
  document.body.appendChild(script);
}
```

```ts
// src/main.tsx (React) or src/main.ts (Vue, Svelte), after the app is created
import { loadHelpCenterWidget } from './helpcenter';

loadHelpCenterWidget({ app_id: import.meta.env.VITE_HELPCENTER_WIDGET_ID });
```

Add `VITE_HELPCENTER_WIDGET_ID=` to `.env.example`. Don't call it from a component that
mounts per route. For per-route behaviour, sign-in and your own button, see widget-api.md.

## Nuxt 3

A client-only plugin, with the ID in public runtime config:

```ts
// plugins/helpcenter.client.ts
export default defineNuxtPlugin(() => {
  const appId = useRuntimeConfig().public.helpcenterWidgetId as string;
  if (!appId || document.getElementById('helpcenter-widget-loader')) return;
  window.hcOptions = { app_id: appId };
  const script = document.createElement('script');
  script.id = 'helpcenter-widget-loader';
  script.src = 'https://helpcenter.io/js/init.js';
  script.async = true;
  document.body.appendChild(script);
});
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: { public: { helpcenterWidgetId: '' } }, // NUXT_PUBLIC_HELPCENTER_WIDGET_ID
});
```

Nuxt 2: the same code in a plugin registered with `mode: 'client'`.

## Server-rendered templates

Put the two tags in the base layout, before `</body>`, reading the ID from configuration. If
the app sends a Content Security Policy with nonces, give the inline tag the nonce.

**Laravel (Blade).** `config/services.php`:
`'helpcenter' => ['widget_id' => env('HELPCENTER_WIDGET_ID'), 'sso_secret' => env('HELPCENTER_SSO_SECRET')]`.
In `resources/views/layouts/app.blade.php`:

```blade
@if (config('services.helpcenter.widget_id'))
    <script>window.hcOptions = { app_id: @json(config('services.helpcenter.widget_id')) };</script>
    <script src="https://helpcenter.io/js/init.js" async></script>
@endif
```

With Laravel's Vite nonces, add `nonce="{{ Vite::cspNonce() }}"` to the inline tag.

**Rails (ERB).** In `app/views/layouts/application.html.erb`; `nonce: true` adds the CSP
nonce when the app has a nonce generator:

```erb
<% if ENV["HELPCENTER_WIDGET_ID"].present? %>
  <%= javascript_tag nonce: true do %>
    window.hcOptions = { app_id: <%= raw ENV["HELPCENTER_WIDGET_ID"].to_json %> };
  <% end %>
  <script src="https://helpcenter.io/js/init.js" async></script>
<% end %>
```

**Django.** Expose the setting through a context processor
(`HELPCENTER_WIDGET_ID = os.environ.get("HELPCENTER_WIDGET_ID", "")` in settings), then in
`templates/base.html`:

```django
{% if HELPCENTER_WIDGET_ID %}
  <script>window.hcOptions = { app_id: "{{ HELPCENTER_WIDGET_ID|escapejs }}" };</script>
  <script src="https://helpcenter.io/js/init.js" async></script>
{% endif %}
```

Other server frameworks (Express with a view engine, Flask/Jinja, Phoenix, ASP.NET): the
same two tags in the layout, the ID from configuration, escaped for a JavaScript string.

## WordPress

In a theme or plugin you maintain (not a parent theme that updates overwrite: use a child
theme or a small plugin):

```php
// functions.php of a child theme, or a must-use plugin
add_action('wp_enqueue_scripts', function () {
    $widget_id = defined('HELPCENTER_WIDGET_ID') ? HELPCENTER_WIDGET_ID : '';
    if ($widget_id === '') {
        return;
    }
    wp_enqueue_script('helpcenter-widget', 'https://helpcenter.io/js/init.js', [], null, [
        'in_footer' => true,
        'strategy' => 'async',
    ]);
    wp_add_inline_script(
        'helpcenter-widget',
        'window.hcOptions = ' . wp_json_encode(['app_id' => $widget_id]) . ';',
        'before'
    );
});
```

Define `HELPCENTER_WIDGET_ID` in `wp-config.php`. (The array form of the last argument needs
WordPress 6.3; on older versions pass `true` for the footer.) Without code access: a
header-and-footer snippets plugin, pasting the dashboard's snippet into the footer. A FAQ
section goes in a **Custom HTML** block where it should appear.

## Website builders (no repository)

Give the user these steps. Builders usually need a paid plan for custom code. Remind them to
publish the site afterwards and to add the live domain, and the builder's own domain if the
site is also served there, to Embedding origins.

- **Webflow.** Site settings → **Custom code** → **Footer code** (before `</body>`): paste
  the snippet → Save → publish. A FAQ section: an **Embed** (Code Embed) element on the page
  with the `<div class="hc-faq-section" …>` markup. Add the `.webflow.io` staging host as an
  exact host if they test there.
- **Shopify.** Online Store → Themes → ⋯ → **Edit code** → `layout/theme.liquid`: paste the
  snippet just before `</body>` → Save. In a theme repository, edit the same file. A FAQ
  section: in the theme editor, add a **Custom Liquid** section with the markup. Hosts: the
  store's domain and its `.myshopify.com` host, each exactly.
- **Squarespace.** **Code Injection** (Settings → Advanced, or Website → Website Tools on
  newer dashboards) → **Footer**: paste the snippet → Save. A FAQ section: a **Code** block
  with the markup.
- **Wix.** Settings → **Custom Code** (Advanced) → **+ Add Custom Code** → paste the snippet,
  **All pages**, place it at **Body - end** → Apply. This puts the widget on the site's own
  pages. Wix has no way to put plain markup into a page: its **Embed HTML** element runs
  inside a frame served from a separate `filesusr.com` host. For a FAQ section, put the
  snippet with `widgetEnabled: false` and the FAQ markup together in one Embed HTML element,
  then add that frame's host to the section's Display on URLs (the user finds it as the
  `src` of the embed's iframe in the browser's developer tools). The whole help center in an
  Embed HTML element needs both the site's host and the frame's host in Embedding origins:
  see csp-and-embedding.md.
