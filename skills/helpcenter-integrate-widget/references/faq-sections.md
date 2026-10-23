# FAQ sections

A FAQ section is a block of questions and answers drawn inline on the site's page, from the
help center's FAQ entries (articles of type FAQ), in one of 27 designs. The work splits
three ways:

| Part | Who |
|---|---|
| Write the questions and answers | You, through the connector, or the user in the dashboard |
| Create the section, its design and its Display on URLs; pick FAQs for a Custom section | You, with the FAQ-section tools when your tool list has them; otherwise the user, in the dashboard |
| Put the markup on the page and load the script | You, in the site's code |

A section's custom CSS and importing FAQs from a URL are dashboard-only.

## Choose the section type with the user

- **Full** shows every published FAQ entry, grouped by category, and picks up new entries by
  itself. Entries without a category don't appear. Best when you'll keep adding FAQs through
  the connector, or for one FAQ page.
- **Custom** shows only the entries added to it, in that order: with
  `helpcenter_add_faq_section_articles`, or in the dashboard's **Manage FAQs**. Best for a
  short, page-specific set (pricing questions on the pricing page).

The type can't be changed after the section is created.

## The whole job through the connector

Only with the HelpCenter.io connector connected and the user asking for it. Do it in this
order: a section on a host that isn't allowed yet stays blank, and a step done out of order
looks like a broken install.

1. **Which help center.** If the connection reaches several, `helpcenter_list_sites`,
   confirm which, and pass its `site_id` on every call below.
2. **The widget.** `helpcenter_get_widget_install`: `install_snippet`, the current
   `embedding_origins`, and `visitors`. The section needs the widget's script on its page
   even when the floating widget is switched off there.
3. **Allow the hosts.** Every host the section's pages run on (apex and `www` separately,
   staging, preview, `localhost`) that isn't in `embedding_origins` yet:
   `helpcenter_update_embedding_origins` with `add`, once the user agrees to the list. Without
   that tool, or when it's refused for a permission, hand this step to the user
   (dashboard-steps.md) and carry on: the section still gets created, it just stays blank on
   those hosts until they're added.
4. **Create the section.** Agree the type with the user (above), then
   `helpcenter_create_faq_section` with `type`, `title` (a string, or text by language such as
   `{"default": "Billing questions", "fr": "Questions de facturation"}`), `display_urls` set to
   the **same hosts** as step 3, and optionally `description`, `template`, `design` and
   `show_heading`. Template ids are in `helpcenter_list_faq_sections` → `templates.ids`; a new
   section starts on `slate`, and `classic` is the plain one. `design` takes `accent`
   (`#rrggbb`), `radius` (0-24), `iconStyle`, `headFont` (`page` uses the site's own font),
   `theme` (`light`, `dark`, `auto`), `animate` and `contactUrl`; on update it replaces the
   stored design, so send every token you want kept. Keep the result's `id` (for the other
   tools) and `install_snippet` (for the page).
5. **Write the FAQ entries** (next section): articles with `type: "faq"`. Keep their IDs.
6. **Fill a Custom section.** `helpcenter_add_faq_section_articles` with the entries' IDs, in
   the order they should show (at most 100 a call). Only FAQ articles of this help center are
   accepted; anything else refuses the whole call. Change the order later with
   `helpcenter_reorder_faq_section_articles` (every listed ID, each once), take one off with
   `helpcenter_remove_faq_section_article`. A Full section needs none of this: it lists every
   published FAQ entry that has a category.
7. **Place the snippets** in the site's code: the widget loader once in the layout
   (install-recipes.md) and `install_snippet` where the block belongs (below).
8. **Verify** (end of this file and verify.md). `helpcenter_get_faq_section` lists a Custom
   section's FAQs with `shown` for each: false means a visitor won't see it yet, usually
   because it's unpublished.

Every change to a section is live on the pages carrying it at their next load: there is no
draft. Delete a section (`helpcenter_delete_faq_section`) only when the user asks; its FAQ
articles are kept.

## Writing the questions and answers

1. `helpcenter_list_categories`: pick the category the FAQs belong in, or create one with
   `helpcenter_create_category` if the user agrees. A Full section groups by category, and
   leaves out entries without one.
2. `helpcenter_list_articles` with `include_content: false`: look for existing entries with
   `type: "faq"` so you don't duplicate them.
3. Draft from material the user gives you or the site's own pages (pricing, policies, docs).
   Don't invent prices, policies, limits or dates: ask, or leave the question out. One
   question per entry, the answer short and complete on its own.
4. Create them with `helpcenter_bulk_create_articles` (up to 50 per call), each with
   `type: "faq"`, the question as `title`, the answer as `content` (with
   `content_format: "markdown"` when you write Markdown), the `category_id`, and a stable
   `external_id` such as `faq-pricing-refunds` so a retry updates instead of duplicating.
   Leave them unpublished (`published: false`, the default).
5. Show the user the list. A section shows only **published**, public entries, so publish
   when they agree: `published: true` on each with `helpcenter_update_article`, or the user
   publishes in the dashboard. Read back and report each entry's ID and state.
6. Without the FAQ-section tools, give the user the entry titles to pick in Manage FAQs.

FAQ entries are help-center articles too: published ones also appear in the widget's lists
and search, and in their category on the help center.

## The markup

`install_snippet` on every section result is exactly what the dashboard's Install button
gives:

```html
<div class="hc-faq-section" data-id="KEY" data-type="custom"></div>
```

`data-type` is `custom` or `full`, as the snippet has it. Put it where the block belongs.
The block takes the width of its container, and designs such as `slate` (the default) center
their questions in a column at most 720px wide inside it, so on a wider page column the
questions sit indented against the page's own heading. Put it in a container about that
wide, or let the section show its own title (`show_heading: true`) so title and questions
line up. In JSX the attribute is `className`. The page needs the loader
(install-recipes.md). On a page that should show FAQs but no floating widget, set
`widgetEnabled: false` in that page's `hcOptions`. `lang` shows the section in another of
the help center's languages, with the entries translated into it.

The section draws its own title and description above the questions. If the page already
has a heading for them, drop one of the two: remove the page's heading, or switch the
section's off (`show_heading: false` with `helpcenter_update_faq_section`, or **Show title and
description** in the section's **Design**).

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

The section answers only pages whose host is in its **Display on URLs** list:
`www.example.com` and `example.com` separately, `localhost` for local development, and a
leading dot (`.example.com`) for a domain and all its subdomains, as in Embedding origins. A
full URL is reduced to its host. The help center's own domain is always allowed. On any
other host the section stays empty without a visible error; the browser's network tab shows
the section's request answering 400. Set it as `display_urls` on create, or later with
`helpcenter_update_faq_section` (which replaces the list), or give the user the exact host
list. Display on URLs decides where the section's data loads; Embedding origins decides
where the widget runs. A page with both needs its host on both lists, which is why step 4
above uses the same hosts as step 3.

## Styles, fonts and images

Sections render in the page itself, so the page's Content Security Policy applies to them:
inline styles (`style-src 'unsafe-inline'`), the design's web fonts from
`https://fonts.bunny.net` (`style-src` and `font-src`), and the hosts the answers' images load
from (`img-src`). Without inline styles the questions load unstyled. The site's own CSS can
also leak into the section (a global `button` or `h3` rule); check the rendered section and
scope the site's rule rather than restyling the section. Full CSP lines: csp-and-embedding.md.

## Check it

- The section's share page, `https://<help center>/share/faqs/KEY` (the section's ⋮ menu →
  Open share page; `KEY` is the snippet's `data-id`), shows whether it has content at all.
- `helpcenter_get_faq_section` shows a Custom section's FAQs in order, each with `shown`.
- An empty block on the site with a share page that works means the host isn't in Display on
  URLs, the script didn't load (CSP), or the section mounted after load (single-page apps).
- An empty block whose request answers 403 `SITE_NOT_PUBLISHED`: the help center isn't
  published yet, so its FAQs don't reach other websites. `helpcenter_get_widget_install`
  shows the same as `visitors.reason: unpublished`. Publishing is the user's step.
- A Full section with fewer entries than expected: unpublished entries, entries without a
  category, or entries in a non-public category.
