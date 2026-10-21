# The design document: pages, regions, components

A help center's whole design is one document, its v2 template:

```
brand            name, tagline, logo, dark logo, favicon, main-website link
theme            colors + darkColors (7 tokens each), fonts, radius, density
pages            home, category, article, search, contact, notFound
  └ page         settings (layout, widths, built-in listing options)
    └ regions    header, hero, sidebar, main, footer, utility
       └ components, in order (Hero and Container hold nested children)
globals          navigation (one menu), scripts
meta             title, description, social cards, direction, indexing
custom CSS       labelled blocks, applied in order
```

You always edit the **draft**. It is the same draft the dashboard's Template Editor
opens, with a live preview, and a person may be editing it while you work. Nothing reaches
visitors until `helpcenter_publish_template`.

## Reading it

`helpcenter_get_template` (default section `outline`) returns:

- `draft`: its `etag` (pass it to every write), `preset_key` (the theme it started from),
  `has_unpublished_changes`.
- `published`: the live version.
- `urls`: `customizer` is the Template Editor link to give the user for review (it needs
  their HelpCenter.io sign-in); `live_site` shows the PUBLISHED design, not the draft.
- `outline`: brand, theme and meta in full; every page's settings that differ from the
  defaults; every component with its id, type and only the settings that differ from
  their defaults; long values cut short (read them with section `component` and the id);
  `navigation`, `scripts` and `customCss` indexes.
- Markers that change what you do next:
  - `syncedRegions` and `sharedRegions`: regions that are one shared copy on every page.
  - `syncedButDiverged`: a synced region whose pages hold different copies. Edits to it
    are refused until you choose with `helpcenter_sync_template_region`.
  - `styledByCustomCss` on a region: CSS blocks (named) that lay it out or paint it.
    Region-background settings will not show there, and new components follow that CSS.

Read in parts: section `page` (with `page`), `region` (with `page` and `region`),
`component` (with `id`), `custom_css` / `scripts` (all, or one `id`), `navigation`,
`theme`, `brand`, `meta`, `translations`. Section `document` is the whole thing and large.

## Page kinds

| Page | What renders by itself | What you add |
|---|---|---|
| `home` | nothing | everything: hero, categories, featured, FAQs, calls to action |
| `category` | the category's title, breadcrumbs and its article listing (and subcategories) | extras only. Never add ArticleList or Breadcrumbs here: they duplicate. Style the listing with page settings (below). |
| `article` | breadcrumbs, title, the article body | metadata, rating, related, table of contents, export, share, comments, positioned by `zone` |
| `search` | its heading, a search field (only when the header and hero have none) and the results listing | fallbacks: a ContactCta, FeaturedArticles. Style results with page settings. |
| `contact` | nothing | a ContactForm. The page (and every link to it) stays hidden until the form has a `recipientEmail`. |
| `notFound` | the 404 message | a way forward: SearchBar, CategoryGrid, ContactCta |

Category page settings (`pages.category.*`): `articleListVariant` list | block,
`articleListColumns` 1–3, `articleListShowExcerpt` / `Author` / `UpdatedAt` /
`ReadingTime` / `Icon`, `articleListIcon`, `articleListSort` title | updated_at |
created_at | custom, `articleListSortDirection`, `articleListBackground`, `expandFaqs`,
`separateFaqs` + `faqsHeading`, `showSubcategories`, `subcategoryLayout` stacked | grid,
`subcategoryArticleLimit`, `subcategoryExpandInline`, `hideEmptySubcategories`,
`subcategoryEmptyDisplay` title_only | rows | chips | tree, `showCategoryImage`.

Search page settings (`pages.search.*`): `searchResultVariant` list | block,
`searchResultColumns`, `searchResultShowExcerpt`, `searchResultExcerptSource` match |
opening, `searchResultHighlightLimit`, `searchResultShowAuthor` / `UpdatedAt` /
`ReadingTime` / `Icon`, `searchResultIcon`, `searchResultBackground`.

Confirm names and ranges with the guide (topic `settings`) before setting them.

## Regions

| Region | Role |
|---|---|
| `header` | The top bar, sticky unless a theme's CSS changes that. Inline components (Logo, Navigation, SearchBar, LanguageSwitcher) share rows by `position` left / center / right; `block` takes a row of its own, and any other component (RichText, CustomHtml, Spacer…) is a full-width row. A row whose components draw nothing (an empty menu, a language switcher on a one-language site) is dropped. |
| `hero` | A band under the header, usually one Hero. An announcement banner goes at index 0 here (a full-bleed CustomHtml), never in the header. |
| `sidebar` | A side column beside main in `two-columns`, `three-columns` and `docked-sidebar`; stacked above main in `single`. |
| `main` | The page's content column. Components with `width: "half"` pair up two per row. Never synced. |
| `footer` | The bottom of every page, usually one Footer. |
| `utility` | The right-hand rail in `three-columns` and `docked-sidebar`. In `single` and `two-columns` it renders under the FOOTER, so use it only with those two layouts. |

Region wrappers take styling through `helpcenter_update_template_region`: `background`
(hex or a token such as `var(--hc-color-primary)`; text colour on it is chosen for you),
`padding` compact | standard | tall, `borderBottom`, `align` left | center. A region marked
`styledByCustomCss` ignores these where the CSS paints it: restyle it with a CSS block.

### Layouts and widths

`pages.<page>.layout`: `single` | `two-columns` | `three-columns` | `docked-sidebar` (a
full-height side panel, like developer documentation). A sidebar column appears only when
the sidebar region has something in it. Widths, in rem: `sidebarWidth` 12–28, `pageWidth`
48–112, `contentWidth` 32–72 (the reading measure), `columnGap` 0–8. These win over theme
CSS. Two `width: "half"` components in main pair up from 768px wide; below that they stack.

Below 1024px wide every layout stacks to one column. A TableOfContents or ContentTree in a
side region then collapses into a tap-to-open bar, and a docked sidebar becomes a
slide-out drawer with a toggle. Design the mobile order on purpose: sidebar content sits
above the article.

## Synced regions

A synced region is ONE region shared by every page: an edit on any page reaches all six,
under the same component ids. `header` and `footer` start synced only where every page of
the theme holds the same copy; most ready-made themes vary the header (a compact search on
inner pages), so their header starts per-page, while the footer is usually synced.

- `helpcenter_sync_template_region` `enabled: true` + `source_page` makes every page take
  that page's version (translations included), replacing the others where they differ.
  `enabled: false` lets each page keep its own copy, still under the same ids, so name the
  `page` when you edit one.
- `helpcenter_copy_template_region` copies one page's version of an unsynced region onto
  chosen pages once; they stay independent afterwards.
- `main` never syncs.
- Building a header that differs only slightly per page (a compact search on inner pages,
  none on home where the hero has one) is normal: unsync it and edit page by page.

## Components, nesting and ids

A component is `{id, type, config, children?}`. Its type decides where it may go (pages and
regions) and whether it is one per region; the guide's `components` topic lists both.
`Hero` and `Container` hold children; add into one with `parent_id`. To build a container
and its children in one call, give the container an `id` of your own and name it as
`parent_id` in the later entries of the same call.

Ids are unique within a page and repeat across pages on purpose (each page's copy of a
synced region shares them). They are how you update, move and remove components, and how
custom CSS targets one: `[data-hc-instance-id="<id>"]`. Rendered components carry no HTML
`id` attribute, so `#<id>` never matches.

Calls take up to 50 entries and are all-or-nothing: if one entry is refused, nothing from
that call is saved, and the error names the entry by position.

## Languages and translations

Text you set is the default language's. Translations are made in the dashboard; your
structural edits keep them attached to their components. Changing a component's text
changes the default language only: an existing translation of that text stays as it was,
so tell the user which texts need retranslating. The guide overview lists the help
center's `languages`; a LanguageSwitcher renders only when there is more than one.

Pages in a right-to-left language (Arabic, Hebrew…) are laid out right to left
automatically. `meta.direction: rtl` forces right-to-left for EVERY language, so set it only
when the whole help center reads that way. See `quality-checklist.md` for RTL design.

## Theme CSS

Ready-made themes ship custom CSS blocks (listed in the outline's `customCss`, with the
selectors they target). They outrank region and component settings. Before you restyle a
region the outline marks `styledByCustomCss`, read those blocks (section `custom_css`), then
override in a block of your own added after them. Switching a theme block off
(`helpcenter_update_template_css` `enabled: false`) shows the design without it and keeps
it for later; prefer that to deleting the customer's CSS.

The default theme for new help centers (Compass) paints the header and hero from its CSS,
lays the header out as one row, and puts small CustomHtml blocks (header tools, popular
searches, a footer contact strip) and two interaction scripts in the design. A complete
rebrand usually starts from a cleaner base; see `design-method.md`.
