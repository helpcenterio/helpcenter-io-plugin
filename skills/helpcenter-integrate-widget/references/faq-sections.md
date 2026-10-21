# FAQ sections

A FAQ section is a block of questions and answers drawn inline on the site's page, from the
help center's FAQ entries (articles of type FAQ), in one of 27 designs chosen in the
dashboard. The work splits three ways:

| Part | Who |
|---|---|
| Write the questions and answers | You, through the connector, or the user in the dashboard |
| Create the section, its design and its Display on URLs; pick FAQs for a Custom section | The user, in the dashboard |
| Put the markup on the page and load the script | You, in the site's code |

## Choose the section type with the user

- **Full** shows every published FAQ entry, grouped by category, and picks up new entries by
  itself. Entries without a category don't appear. Best when you'll keep adding FAQs through
  the connector, or for one FAQ page.
- **Custom** shows only the entries picked in **Manage FAQs**, in that order. Best for a
  short, page-specific set (pricing questions on the pricing page). Picking entries is a
  dashboard step today.

The type can't be changed after the section is created.

## Writing the questions and answers through the connector

Only with the HelpCenter.io connector connected, content access granted, and the user asking
for it.

1. If the connection reaches several help centers, `helpcenter_list_sites`, confirm which,
   and pass its `site_id` on every call.
2. `helpcenter_list_categories`: pick the category the FAQs belong in, or create one with
   `helpcenter_create_category` if the user agrees. A Full section groups by category.
3. `helpcenter_list_articles` with `include_content: false`: look for existing entries with
   `type: "faq"` so you don't duplicate them.
4. Draft from material the user gives you or the site's own pages (pricing, policies, docs).
   Don't invent prices, policies, limits or dates: ask, or leave the question out. One
   question per entry, the answer short and complete on its own.
5. Create them with `helpcenter_bulk_create_articles` (up to 50 per call), each with
   `type: "faq"`, the question as `title`, the answer as `content` (with
   `content_format: "markdown"` when you write Markdown), the `category_id`, and a stable
   `external_id` such as `faq-pricing-refunds` so a retry updates instead of duplicating.
   Leave them unpublished (`published: false`, the default).
6. Show the user the list. A section shows only **published**, public entries, so publish
   when they agree: `published: true` on each with `helpcenter_update_article`, or the user
   publishes in the dashboard. Read back and report each entry's ID and state.
7. For a Custom section, give the user the entry titles to pick in Manage FAQs.

FAQ entries are help-center articles too: published ones also appear in the widget's lists
and search, and in their category on the help center.

## The markup

The dashboard's Install button gives:

```html
<div class="hc-faq-section" data-id="KEY" data-type="custom"></div>
```

`data-type` is `custom` or `full`, as the dashboard shows it. Put it where the block belongs;
it fills the width of its container. In JSX the attribute is `className`. The page needs the
loader (install-recipes.md). On a page that should show FAQs but no floating widget, set
`widgetEnabled: false` in that page's `hcOptions`. `lang` shows the section in another of
the help center's languages, with the entries translated into it.

The section draws its own title and description above the questions. If the page already
has a heading for them, drop one of the two: remove the page's heading, or ask the user to
switch off **Show title and description** in the section's **Design**.

The script draws only the sections that are on the page when it runs. Keep the key in
config rather than scattered literals when several pages share a section.

## Single-page apps

A section that mounts after the first page load stays empty. Render it through a component
that asks for a redraw when it mounts: newer versions of the loader have
`window.hcWidget.refresh()`; until then, loading the FAQ script again redraws every section on
the page.

```tsx
// React. Vue: the same in onMounted, with `class` instead of `className`.
import { useEffect } from 'react';

export function HelpCenterFaqSection({ sectionKey, type }: { sectionKey: string; type: 'custom' | 'full' }) {
  useEffect(() => {
    if (typeof window.hcWidget?.refresh === 'function') {
      window.hcWidget.refresh();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://helpcenter.io/js/faqs.js';
    script.async = true;
    document.body.appendChild(script);
    return () => script.remove();
  }, [sectionKey]);

  return <div className="hc-faq-section" data-id={sectionKey} data-type={type} />;
}
```

The `hcOptions` (for `lang`) must be set before the component mounts, which the install
recipes already do.

## Display on URLs

The section answers only pages whose host is in its **Display on URLs** list: exact hosts,
`www.example.com` and `example.com` separately, `localhost` for local development, no
wildcards (a leading dot is accepted by the form but never matches). The help center's own
domain is always allowed. On any other host the section stays empty without a visible error;
the browser's network tab shows the section's request answering 400. Give the user the exact
host list.

## Styles, fonts and images

Sections render in the page itself, so the page's Content Security Policy applies to them:
inline styles (`style-src 'unsafe-inline'`), the design's web fonts from
`https://fonts.bunny.net` (`style-src` and `font-src`), and the hosts the answers' images load
from (`img-src`). Without inline styles the questions load unstyled. The site's own CSS can
also leak into the section (a global `button` or `h3` rule); check the rendered section and
scope the site's rule rather than restyling the section. Full CSP lines: csp-and-embedding.md.

## Check it

- The section's share page, `https://<help center>/share/faqs/KEY` (the section's ⋮ menu →
  Open share page), shows whether it has content at all.
- An empty block on the site with a share page that works means the host isn't in Display on
  URLs, the script didn't load (CSP), or the section mounted after load (single-page apps).
- A Full section with fewer entries than expected: unpublished entries, entries without a
  category, or entries in a non-public category.
