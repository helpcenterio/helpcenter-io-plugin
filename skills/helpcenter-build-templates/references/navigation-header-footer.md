# Navigation, header and footer

## The menu is one global list

`helpcenter_set_template_navigation` replaces the help center's single menu. Every
Navigation component draws that same list; a Navigation's own settings change only how it
is drawn. Guide topic: `navigation`.

- Items: `{id?, label, href, type?, cssClass?, children?}`, at most 30. `type` is `link`
  (a help center page, the default), `category`, or `external` (a full `https://` URL that
  opens in a new tab). `children` (one level) are drawn only under `category` items in a
  `vertical` Navigation with `showSubcategories` on; a horizontal menu has no dropdowns.
- hrefs: `/` (home), `/categories` (all top-level categories), `/category/<id>` (ids from
  `helpcenter_list_categories`), `/content/<article slug>`, `/contacts`, `/search?q=…`, a
  full `https://` URL, or `mailto:`. No `#anchor`, `tel:` or `//host` links. Paths starting
  with `/` get the visitor's language prefix by themselves.
- The call replaces the whole menu. To keep an item, send it again **with its `id`**
  (section `navigation` of `helpcenter_get_template`), or its translations are lost. An
  empty list clears the menu.
- A link to `/contacts` is hidden on the live site until the ContactForm has a
  `recipientEmail`. Do not make it the only way to reach a person.
- Only link to pages that exist: real category ids, real article slugs, URLs the user gave
  you. Never invent a status page, store or API reference.
- Keep the top level to about five items. A horizontal menu wraps on small screens; it has
  no hamburger.

## Where the menu shows (the trap)

The menu appears **only** where a page has a Navigation component, or a Footer whose
`columnBlocks` is empty (that footer lists the menu under "Links"). Setting navigation on
a design with no Navigation shows nothing anywhere. Some help centers have none in their
header, depending on the theme and when it was applied.

1. After `helpcenter_set_template_navigation`, find every Navigation in the outline.
2. None in the header? Add one: once if the header is synced (it reaches every page), on
   each page otherwise. `config: {position: "block"}` gives it a row of its own;
   `left` / `center` / `right` joins the Logo's row.
3. Never add a second Navigation to a region that has one: the menu is drawn twice.
   Reposition the existing one (`helpcenter_update_template_components` for `position`,
   `helpcenter_move_template_components` for order). Write results include a warning when
   a batch leaves two Navigations in a region or leaves the menu nowhere to show; read
   and act on warnings.

`variant`: `horizontal` (a row of links), `pills` (rounded chips), `vertical` (a stacked
list, with `showSubcategories`, for a sidebar). A button-like item such as "Contact
support" is a menu item with a `cssClass`, styled with custom CSS:

```css
.hc-region-header a.nav-cta {
  background: var(--hc-color-primary-fill, var(--hc-color-primary));
  color: var(--hc-color-on-primary);
  padding: .45rem .9rem; border-radius: var(--hc-radius-pill); text-decoration: none;
}
```

## Laying out the header

The header is the sticky top bar. Its inline components (Logo, Navigation, SearchBar,
LanguageSwitcher) share rows by `position`: consecutive `left` / `center` / `right`
components form one row; `block` gives a component a row of its own. Anything else in the
header (RichText, CustomHtml, Spacer, Divider) takes a full-width row.

Common shapes:

| Shape | Components |
|---|---|
| Classic | Logo `left`, Navigation `right` |
| Search-first inner pages | Logo `left`, SearchBar `compact` `center`, Navigation `right` |
| Two-tier | Logo `left` + SearchBar `right` on row one, Navigation `block` on row two |
| Minimal (hero does the work) | Logo `left` only on home, with search in the Hero |

- Pages without a hero should have a compact SearchBar in the header.
- Home usually has its search in the Hero, so its header differs from inner pages. That is
  fine: unsync the header and edit it per page, or build it on one page and copy it with
  `helpcenter_copy_template_region`, then adjust.
- To give every page the same header, build it on one page and run
  `helpcenter_sync_template_region {region: "header", enabled: true, source_page: <that page>}`.
- Paint the bar with `helpcenter_update_template_region` (`background`, `borderBottom`). If
  the outline marks the header `styledByCustomCss`, a theme block paints it; override with
  your own CSS block on `.hc-region-header`.
- A coloured header band: put the SearchBar in `backgroundMode: "transparent"` or
  `"translucent"` so it does not look pasted on, and keep links legible with
  `color: var(--hc-color-on-primary)` when the band is the primary colour.
- Announcement banners do not go in the header: put a full-bleed CustomHtml at index 0 of
  the `hero` region, or at the top of `main`.
- If you restyle header rows with CSS, never fix the header's height (use `min-height` on
  its members), and let rows wrap. Customers add rows later.

## The footer

One Footer component, usually in a synced footer region (identical on every page).

- `columns` 1–4. `columnBlocks` is the ordered list of blocks:
  - `brand`: brand name and tagline.
  - `links`: a `heading` and `items` `[{id, label, dest: {type: url|home|category|article, value}}]`
    (`value` is a URL, a category id or an article slug; `home` needs none).
  - `text`: `content` is a paragraph. `html`: `content` is HTML (scripts and styles stripped).
  - `social`: `content` is `{network: handle-or-url}` for twitter, linkedin, github,
    facebook, instagram, youtube.
- Empty `columnBlocks` falls back to the brand block plus the global menu under "Links".
- `showAttribution` shows or hides the "Powered by HelpCenter.io" line. Its wording cannot be
  changed. Leave it as the help center has it unless the user asks.
- Use only links the user gave you or pages that exist. A footer of placeholder links
  ("Careers", "Press") is worse than a short one.
- Give the footer region a background (`helpcenter_update_template_region`) or a top
  border to separate it from the content, and check its text in dark mode.
