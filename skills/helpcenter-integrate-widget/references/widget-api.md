# Driving the widget from the site's code

## `window.hcOptions`

Read once, when `init.js` runs. Changing the object afterwards does nothing.

| Option | Value | Effect |
|---|---|---|
| `app_id` | string, required | The widget ID. |
| `position` | `'bottom-left'` | Launcher and panel in the bottom-left corner. Default bottom right. |
| `lang` | a language of the help center, e.g. `'es'` | Interface texts and articles in that language. Searches still match the default language. |
| `category` | category ID (number) | The home screen lists that category's articles instead of the most viewed. |
| `href` | `'/content/<slug>'` | The widget opens on that article when the visitor opens it. |
| `showButton` | `false` | No launcher: the widget opens only from your code, as a full-height panel 460 px wide (full screen under 450 px). Proactive messages don't show. |
| `widgetEnabled` | `false` | No widget at all, no `window.hcWidget`; FAQ sections on the page still load. |
| `nudgesEnabled` | `false` | No proactive messages on this page. |
| `jwt`, `onAuthExpired` | token, function | Sign-in for a private help center: jwt-sso.md. |
| `onWidgetReady` | function | Called once, when the widget takes commands. |
| `onStateChange` | function `(isOpen) => …` | Called each time the panel opens or closes. |
| `onContactsRequest` | function | Called instead of the built-in contact form when a visitor asks to contact you. |
| `analyticsAllowed` | function returning boolean | Usage statistics are sent only while it returns true (a consent check). |
| `privacyMode` | `'essential'` | Search and articles only: no usage statistics, no stored identifiers, no page text, no proactive messages, no FAQ sections. For pages before consent. |

**Page text.** To suggest articles under "Can this help?", the widget sends the page's
visible text to HelpCenter.io once, when it loads. Setting `category` or `href` turns that
off. On pages that show personal data (account pages, admin screens), set one of them or
use `privacyMode: 'essential'`, and tell the user.

## When the API exists, and when it listens

`window.hcWidget` appears a moment after `init.js` runs, once the loader has fetched its
parts; it isn't there synchronously. The widget takes commands only once its frame has
loaded and found the page's host in Embedding origins. So:

- Startup code goes in `onWidgetReady`.
- Code that runs later (click handlers, route changes) checks `window.hcWidget` first, then
  calls the method inside `window.hcWidget.onReady(…)`.
- On a host missing from Embedding origins the widget never becomes ready, and every call
  is silently lost.

| Method | Does | Before ready |
|---|---|---|
| `show()` | Opens the widget (and brings it back after `hideAll()`) | Lost |
| `hide()` | Closes it to the launcher | Lost |
| `hideAll()` | Hides widget and launcher until the next `show()` | Works |
| `setCategory(id)` | Lists that category's articles on the home screen; doesn't open the widget | Lost |
| `setHref(href, open)` | Loads an article; opens the widget on it when `open` is true. Without `true` it closes an open widget | Lost |
| `setHrefAndOpen(href)` | `setHref(href, true)` | Lost |
| `setJwt(token)` | Hands over a sign-in token (jwt-sso.md) | See there |
| `trigger(name)` | Fires a custom event for proactive messages | Queued (20) |
| `onReady(fn)` | Runs `fn` once ready, or on the next tick if it already is | Queued |
| `isReady()` | true once ready | false |
| `destroy()` | Removes the widget, its listeners and its proactive messages from the page | Works |

None of them throws. To switch to another user, or back to the first state, reload the page:
there is no reset.

## TypeScript

```ts
// src/types/helpcenter.d.ts (any .d.ts the project's tsconfig includes)
export {};

declare global {
  interface HelpCenterOptions {
    app_id: string;
    position?: 'bottom-left' | 'bottom-right';
    lang?: string;
    category?: number;
    href?: string;
    showButton?: boolean;
    widgetEnabled?: boolean;
    nudgesEnabled?: boolean;
    jwt?: string;
    onAuthExpired?: () => string | Promise<string>;
    onWidgetReady?: () => void;
    onStateChange?: (isOpen: boolean) => void;
    onContactsRequest?: () => void;
    analyticsAllowed?: () => boolean;
    privacyMode?: 'essential';
  }
  interface HelpCenterWidget {
    show(): void;
    hide(): void;
    hideAll(): void;
    setCategory(categoryId: number | string): void;
    setHref(href: string, open?: boolean): void;
    setHrefAndOpen(href: string): void;
    setJwt(token: string): void;
    trigger(eventName: string): void;
    onReady(callback: () => void): void;
    isReady(): boolean;
    destroy(): void;
    /** Newer loaders only: picks up FAQ sections and links added after load. */
    refresh?(): void;
  }
  interface Window {
    hcOptions?: HelpCenterOptions;
    hcWidget?: HelpCenterWidget;
    hcPendingEvents?: string[];
  }
}
```

## Your own help button

Hide the launcher and open the widget from the site's own button. Enable the button only
when the widget is ready, so an early click isn't lost:

```js
window.hcOptions = {
  app_id: 'WIDGET_ID',
  showButton: false,
  onWidgetReady: () => document.getElementById('help-button')?.removeAttribute('disabled'),
  onStateChange: (isOpen) => document.getElementById('help-button')?.setAttribute('aria-expanded', String(isOpen)),
};
document.getElementById('help-button')?.addEventListener('click', () => window.hcWidget?.show());
```

In React, keep the readiness in state (set it from a `helpcenter:ready` window event that
`onWidgetReady` dispatches) and render `<button disabled={!ready}>`. A button can also sit
beside the normal launcher; `show()` works either way.

## Single-page apps

- **Load once** in the app shell (install-recipes.md). The widget survives client-side
  navigation.
- **Per-route articles.** Map routes to category IDs and call `setCategory` after each
  navigation. Get IDs from `helpcenter_list_categories` (use categories whose `privacy` is
  `public`, under public parents) or from the number in a category's address,
  `/category/4821-billing`. A hidden or unknown ID shows the most viewed articles. There is
  no call back to the default list, so map every route you care about, or accept that the
  last category stays until a reload. `setCategory` changes the home list only, not search.

  ```ts
  const helpCategories: Record<string, number> = { '/billing': 4821, '/account': 4822 };

  export function showHelpFor(pathname: string): void {
    const categoryId = Object.entries(helpCategories)
      .find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))?.[1];
    if (categoryId && window.hcWidget) {
      window.hcWidget.onReady(() => window.hcWidget?.setCategory(categoryId));
    }
  }
  ```

  Call it after every navigation: React Router, `useEffect(() => showHelpFor(location.pathname), [location.pathname])`
  with `useLocation()`; Next.js App Router, the same with `usePathname()` in a client
  component rendered in the root layout; Next.js Pages Router,
  `router.events.on('routeChangeComplete', showHelpFor)`; Vue Router or Nuxt,
  `router.afterEach((to) => showHelpFor(to.path))`. Also call it once in `onWidgetReady` for
  the first page.
- **Proactive messages** follow `pushState` and `popstate` route changes, but at most one
  shows per full page load: after the first, later routes show none until a reload, and a
  shown bubble isn't hidden when the route changes. Say so when the user expects
  per-route messages.
- **"Can this help?"** suggestions come from the first page's text only.
- **Links rendered after load** aren't bound (next section).
- **FAQ sections** rendered after load stay empty: faq-sections.md.
- **Resize handlers.** The loader assigns `window.onresize`; use
  `addEventListener('resize', …)` in the site's code so neither replaces the other.

## Open articles from the page

A link with `data-hc-article` to an article address opens it inside the widget instead of
leaving the page:

```html
<a href="https://help.example.com/content/reset-your-password" data-hc-article>Reset your password</a>
```

The address must contain `/content/` followed by the slug in the help center's default
language (from `helpcenter_list_articles`, or the article's address); what comes before
`/content/` is ignored, so it still works as a normal link without JavaScript. Only links
present when `init.js` runs are bound, and only clicks on the link element itself (not an
icon inside it).

In a single-page app, or for links with icons, use one delegated handler with an attribute of
your own instead:

```js
document.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-help-article]');
  if (!link || event.defaultPrevented || event.button !== 0
      || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (window.hcWidget?.isReady()) {
    event.preventDefault();
    window.hcWidget.setHrefAndOpen(link.href);
  }
});
```

Until the widget is ready, those links go to the help center, which is a sensible fallback.
From code: `window.hcWidget.setHrefAndOpen('/content/reset-your-password')`.

## Hand contact requests to the site's own support

```js
window.hcOptions = {
  app_id: 'WIDGET_ID',
  onContactsRequest: () => {
    window.hcWidget?.hide();
    openSupportChat(); // the site's own chat, form or contact page
  },
};
```

The function gets no arguments (not the search or the visitor's email). With it set, the
contact entry points show even when the help center has no contact recipient, and the
widget's frame sits just below the top of the stacking order so a chat can open over it.

## Custom events for proactive messages

A proactive message with a **Custom event** rule shows when the page fires that event. Use
names the user then types into the rule exactly (letters, numbers, `_ . : -`):

```js
// Events fired before window.hcWidget exists would be lost: queue them.
export function helpCenterEvent(name) {
  if (window.hcWidget) {
    window.hcWidget.trigger(name);
  } else {
    (window.hcPendingEvents ||= []).push(name);
  }
}
// In hcOptions.onWidgetReady:
//   (window.hcPendingEvents || []).splice(0).forEach((name) => window.hcWidget.trigger(name));
```

Call it where the moment happens: `helpCenterEvent('checkout_failed')` in the payment error
handler, `helpCenterEvent('import_started')` when a long job starts. Messages don't show while
the widget is open or with `showButton: false`, and at most one shows per page load.
Adding `?hcnudge=debug` to a page's address logs in the console how each rule evaluates.
List the event names in the hand-off: the messages themselves are created in the dashboard.

## Sign-out

When a signed-in user signs out of a single-page app, call `window.hcWidget?.destroy()` so
the widget stops making requests, then reload or navigate with a full page load. Signing in
as someone else also needs a reload, because the widget keeps its first identity.
