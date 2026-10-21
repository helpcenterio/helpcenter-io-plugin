# Custom CSS: hooks, rules and recipes

Custom CSS is what turns a token swap into a theme with character: the category cards,
the hero's texture, the reading column. Add it with `helpcenter_add_template_css`, as
labelled blocks with one concern each ("Cards · lift on hover", "Hero · mesh"). Guide
topic: `css`. Do structure with components and settings first; reach for CSS for the
look.

## How your CSS is treated

- **Scoped automatically.** Every selector is prefixed with `#hc-site`, the wrapper around
  all regions. Write `.hc-region-hero h1 { … }`, never `#hc-site …`, `body …` or `html …`.
  A bare `html`, `body`, `*` or `:root` becomes `#hc-site`. The prefix gives your rules
  id-level specificity, so they beat the built-in utility classes without `!important`.
- `#hc-site` is `display: contents`: it has no box, so a background set on `body` or
  `:root` paints nothing. The page background is the `bg` token.
- **Stripped:** `@import`, `@charset`, `@namespace`, `expression()`, `behavior:`,
  `javascript:` URLs. A block with unbalanced braces renders as nothing at all. Allowed:
  `@media`, `@supports`, `@keyframes`, `@font-face`, `:has()`, `color-mix()`, `clamp()`.
- **Commas split selectors, even inside `:is()`, `:not()` and `:has()`.** Each part gets the
  prefix, so `.card:not(.a, .b)` becomes invalid and the browser drops the whole rule, with
  no warning. Chain instead: `.card:not(.a):not(.b)`, or write two rules.
- **Your own markup gets no utility framework.** Classes such as `flex`, `grid-cols-3` or
  `btn` in CustomHtml work only by accident. Give your elements your own class names and
  style them here.
- **Order matters.** Blocks apply in list order and a later one wins. Theme blocks come
  first; add yours after them rather than editing the theme's. Limit: about 200 KB in all.
- The customer edits these same blocks in the dashboard (Advanced → Custom CSS), so label
  them clearly and keep each one readable.

## Stable hooks (target these)

| What | Selector |
|---|---|
| One component | `[data-hc-instance-id="<id>"]` (ids from the outline; `#<id>` never matches) |
| Every component of a type | `[data-hc-component-type="Hero"]` (most types carry it; Breadcrumbs, ContactCta, SocialLinks and Divider use the classes below instead) |
| Regions | `.hc-region-header`, `.hc-region-hero`, `.hc-region-sidebar`, `.hc-region-main`, `.hc-region-footer`, `.hc-region-utility` (also `[data-hc-region="…"]`) |
| Header rows | `.hc-region-header .hc-header-row--inline` (Logo/Navigation/Search rows), `.hc-region-header .hc-header-row--block` (full-width rows) |
| Hero | `.hc-hero` (the band), `.hc-hero-content` (its centred column), `.hc-hero-content > h1`, `.hc-hero-header` (a header overlaid on the hero) |
| Category grid | `.hc-card-list` (the section), `.hc-category-grid--cards` (the grid of the cards, horizontal and with-articles variants), `li[data-hc-category-id]` (one per category), `section.hc-category-section` (the sections variant) |
| Category card | cards / horizontal: the card is the link, `.hc-category-grid--cards > li > a`. with-articles: the card is the item, `.hc-category-grid--cards > li` (its title link is `> li > a`, and its article list `.hc-cat-articles`) |
| Card title | `.hc-category-grid--cards > li > a span.font-heading` (also used by the built-in themes) |
| Article page | `.hc-article`, `.hc-article__header`, `.hc-article__eyebrow`, `.hc-article__title`, `.hc-article__content` (the body), `.hc-article-meta` with `__author`, `__date`, `__reading-time`, `__sep` |
| Sidebar tools | `.hc-toc` (table of contents), `.hc-content-tree`, `.hc-breadcrumbs` |
| Blocks | `[data-hc-component-type="Container"]` (plus `.hc-container--primary` when filled with the primary), `.hc-custom-html`, `.hc-custom-html--bleed`, `.hc-contact-cta`, `.hc-faq-list`, `.hc-search-results` |
| Your own markup | classes you put in CustomHtml (prefix them with the brand, e.g. `.acme-banner`) |

Avoid the other utility class names in the markup (spacing, colour and layout classes such
as `p-4`, `text-lg`, `rounded-md`): they are an implementation detail and change.

## Component anatomy (where the hook sits)

`[data-hc-component-type]` and `[data-hc-instance-id]` sit on the component's OUTERMOST
element. For some components that element is the interactive one itself, so a descendant
selector such as `[data-hc-component-type="Logo"] a` matches nothing.

| Component | Structure | Style |
|---|---|---|
| Logo | `a[data-hc-component-type="Logo"]` is the link; inside, a `span` with the brand name (text variant) or `img.hc-logo-img` | `[data-hc-component-type="Logo"]` itself, e.g. `{ font-weight: 800; letter-spacing: -.03em; }`; an image's size via `[data-hc-component-type="Logo"] img { height: 40px; }` |
| Navigation | `nav[data-hc-component-type="Navigation"] > ul > li > a` | the `a`; a single item via its `cssClass` |
| SearchBar | `form[data-hc-component-type="SearchBar"]` > `.hc-search-shell` (the visible field: border, background, radius, height) > `.hc-search-icon`, a transparent borderless `input`, `.hc-search-submit` / `.hc-ask-ai` buttons; helper text is a `p` after the shell; instant results in `.hc-search-dropdown` | the **shell**. Never give the `input` its own border, background or padding: it doubles the field and overflows on phones. Colour the placeholder with `input::placeholder`. |
| Hero | `.hc-hero` (paint) > `.hc-hero-content` (a flex column: the h1 heading, the subheading `p`, then the children in order) | see the Hero recipe; to show a child above the heading (an eyebrow), give it `order: -1`: `.hc-hero-content [data-hc-instance-id="<id>"] { order: -1; }` |
| CategoryGrid | `section.hc-card-list[data-hc-component-type="CategoryGrid"]` > optional `h2` heading > `ul.hc-category-grid--cards` > `li[data-hc-category-id]` > `a` (the card, for cards and horizontal) | see the card recipes |
| Container | `div[data-hc-component-type="Container"]`, a flex box (`.hc-container--primary` when filled with the primary) | the container, or one instance by id; its children keep their own hooks |
| CustomHtml | `.hc-custom-html` (`.hc-custom-html--bleed` when full-bleed) > your markup | your own classes |

## Variables

Colours: `--hc-color-primary`, `-accent`, `-fg`, `-bg`, `-muted`, `-surface`, `-border`,
and the derived `--hc-color-primary-text`, `-accent-text`, `-primary-fill`, `-on-primary`,
`-on-accent`, `-field-border`, `--hc-hero-fg`. Fonts: `--hc-font-body`, `-heading`, `-mono`.
Shape: `--hc-radius-sm`, `-md`, `-lg`, `-pill`; `--hc-density-gap`, `-pad`. Focus:
`--hc-focus-ring`.

Change the palette through settings, not by overriding these variables in CSS: the derived
values (button labels, text forms) are computed from the settings.

## Rules that keep a design correct

1. **Colours through tokens.** `var(--hc-color-*)` switches with the visitor's
   appearance; a literal hex does not. For tints and shadows use
   `color-mix(in srgb, var(--hc-color-primary) 30%, transparent)` instead of a fixed rgba,
   so they follow a later brand-colour change too.
2. **Brand colour as text** is `var(--hc-color-primary-text, var(--hc-color-primary))`,
   never the raw primary, which is the fill colour.
3. **Anything filled with the primary** takes `background: var(--hc-color-primary-fill,
   var(--hc-color-primary))` and `color: var(--hc-color-on-primary)`, and so do its links
   (underline them). Accent fills take `var(--hc-color-on-accent)`. Never put accent text on a
   primary band: two brand colours rarely contrast.
4. **A block with its own background sets its own text colour**, or dark mode inherits a
   light-mode text colour onto it.
5. **Dark-only tweaks** go in `@media (prefers-color-scheme: dark) { … }`. That follows the
   system setting; `[data-theme]` selectors cannot match from custom CSS. Token-based rules
   need no dark variant at all, which is why they are preferred.
6. **Text at 4.5:1**, large text and UI outlines at 3:1, in both appearances.
7. **Leave focus alone.** Every keyboard stop already gets a visible outline. If you must
   restyle it, keep an `outline` (not a box-shadow, which vanishes in forced-colours mode)
   coloured `var(--hc-focus-ring)`, and never use the accent for it.
8. **Respect reduced motion.** Wrap transitions and transforms you add:
   `@media (prefers-reduced-motion: reduce) { <selector> { transition: none; transform: none; } }`.
9. **Right-to-left.** Use logical properties (`margin-inline-start`, `padding-inline`,
   `border-inline-start`, `inset-inline-end`, `text-align: start`), never left/right.
   Mirror a directional icon with `:dir(rtl)`; `[dir="rtl"]` ancestors cannot match.
10. **Mobile.** Check every rule at 390px wide. Breakpoints the layout uses: 40rem (640px),
    64rem (1024px, where columns start), 80rem (1280px). Never fix a header height; never
    reorder header rows with `order` (keyboard focus would jump).

## Recipes (token-driven: they follow the palette and dark mode)

**Category cards: lift on hover** (cards or horizontal variant)
```css
.hc-category-grid--cards > li > a {
  background: var(--hc-color-surface);
  border: 1px solid var(--hc-color-border);
  border-radius: var(--hc-radius-lg);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}
.hc-category-grid--cards > li > a:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--hc-color-primary) 45%, var(--hc-color-border));
  box-shadow: 0 14px 30px -16px color-mix(in srgb, var(--hc-color-primary) 55%, transparent);
}
@media (prefers-reduced-motion: reduce) {
  .hc-category-grid--cards > li > a { transition: none; }
  .hc-category-grid--cards > li > a:hover { transform: none; }
}
```

**Category cards: status rule** (precise, fintech or enterprise)
```css
.hc-category-grid--cards > li > a {
  background: var(--hc-color-bg);
  border: 1px solid var(--hc-color-border);
  border-top: 3px solid var(--hc-color-accent);
  border-radius: var(--hc-radius-sm);
  box-shadow: none;
}
.hc-category-grid--cards > li > a:hover { border-color: var(--hc-color-primary); }
.hc-category-grid--cards > li > a span.font-heading { letter-spacing: -.01em; }
```

**Category cards: care bar** (calm, health or education)
```css
.hc-category-grid--cards > li > a {
  background: var(--hc-color-bg);
  border-inline-start: 4px solid var(--hc-color-primary);
  border-radius: var(--hc-radius-md);
  box-shadow: 0 1px 3px color-mix(in srgb, var(--hc-color-fg) 8%, transparent);
}
.hc-category-grid--cards > li > a:hover { background: var(--hc-color-surface); }
```

**Category cards: glow** (dark, bold brands)
```css
.hc-category-grid--cards > li > a {
  background: linear-gradient(160deg, var(--hc-color-surface), var(--hc-color-bg));
  border: 1px solid var(--hc-color-border);
  border-radius: var(--hc-radius-lg);
  transition: box-shadow .3s ease, border-color .3s ease;
}
.hc-category-grid--cards > li > a:hover {
  border-color: var(--hc-color-primary);
  box-shadow: 0 0 24px -4px color-mix(in srgb, var(--hc-color-primary) 60%, transparent),
              0 0 48px -12px color-mix(in srgb, var(--hc-color-accent) 45%, transparent);
}
```

**Module cards** (with-articles variant: the card is the `li`)
```css
.hc-category-grid--cards > li {
  background: var(--hc-color-surface);
  border: 2px solid transparent;
  border-radius: var(--hc-radius-lg);
  padding: var(--hc-density-pad);
}
.hc-category-grid--cards > li:hover { border-color: var(--hc-color-primary); }
.hc-category-grid--cards > li > a { font-size: 1.15rem; }
```

**Icon tiles** (when categories have Font Awesome icons and `showImage` is on)
```css
.hc-category-grid--cards > li > a i {
  display: inline-grid; place-items: center; width: 48px; height: 48px;
  border-radius: var(--hc-radius-md);
  background: color-mix(in srgb, var(--hc-color-primary) 14%, var(--hc-color-surface));
  color: var(--hc-color-primary-text, var(--hc-color-primary));
}
```

**Hero: mesh glow over the brand gradient**
```css
.hc-hero {
  background:
    radial-gradient(40% 60% at 85% 15%, color-mix(in srgb, var(--hc-color-accent) 55%, transparent), transparent 70%),
    radial-gradient(35% 55% at 10% 90%, color-mix(in srgb, var(--hc-color-primary) 60%, transparent), transparent 70%),
    var(--hc-color-primary-fill, var(--hc-color-primary));
}
.hc-hero-content > h1 { letter-spacing: -.02em; }
```
Painting `.hc-hero` from CSS overrides the Hero's own background, and the automatic text
colour is measured from the Hero's settings, not your CSS. Keep the result dark enough for
white text or light enough for black, set the Hero's `textColor` to match, and check it in
both appearances.

**Header band in the brand colour**
```css
.hc-region-header {
  background: var(--hc-color-primary-fill, var(--hc-color-primary));
  color: var(--hc-color-on-primary);
}
.hc-region-header a { color: inherit; }
```
(Prefer `helpcenter_update_template_region` `background: "var(--hc-color-primary)"` when no
theme CSS paints the header: the text colour is then chosen for you.)

**Reading column polish** (article page)
```css
.hc-article__title { letter-spacing: -.015em; }
.hc-article__content h2 {
  padding-block-start: .5rem;
  border-block-start: 1px solid var(--hc-color-border);
}
.hc-article__content a { text-underline-offset: .2em; }
.hc-article-meta__author, .hc-article-meta__author + .hc-article-meta__sep { display: none; }
```

**Announcement banner** (a CustomHtml with `fullBleed: true` at index 0 of the hero region)
```html
<div class="acme-banner"><p><strong>New:</strong> Faster payouts are live. <a href="/content/faster-payouts">Read the guide</a></p></div>
```
```css
.acme-banner {
  background: var(--hc-color-accent);
  color: var(--hc-color-on-accent);
  text-align: center; padding: .6rem 1rem; font-size: .9rem;
}
.acme-banner a { color: inherit; text-decoration: underline; }
```
Link only to pages that exist, with text the user approved.
