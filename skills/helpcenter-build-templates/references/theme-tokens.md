# Theme tokens, type, brand and SEO

Everything here is a document setting, changed with `helpcenter_update_template_settings`
(the guide's `set` operation). Paths and accepted values: `helpcenter_get_template_guide`
topic `settings`; token meanings and derived variables: topic `theme`. A path outside the
list is refused with the list of paths that exist.

Set a whole group in one entry when you can: `{path: "theme.colors", value: {…all seven…}}`.
Up to 50 entries per call, applied all-or-nothing.

## Colour tokens

Seven tokens, each in two palettes: `theme.colors` (light appearance) and
`theme.darkColors` (dark appearance). Every help center serves both and follows each
visitor's system setting, so **always set both palettes**, and keep them the same brand.

| Token | Role | CSS variable |
|---|---|---|
| `primary` | Brand colour: links, primary buttons, focus rings, the hero gradient's first stop | `--hc-color-primary` |
| `accent` | Second brand colour: highlights, eyebrows, the hero gradient's second stop | `--hc-color-accent` |
| `fg` | Body text | `--hc-color-fg` |
| `bg` | Page background | `--hc-color-bg` |
| `muted` | Secondary text: dates, counts, captions | `--hc-color-muted` |
| `surface` | Cards, panels, raised areas | `--hc-color-surface` |
| `border` | Hairlines and dividers | `--hc-color-border` |

Values: `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`, `hsl()` or `hsla()` (stored as
hex; four-digit `#rgba` is refused). Token values cannot be `var(...)`. In CSS use only the
variables listed here: a `var()` naming one that does not exist (`--hc-color-text`, say;
body text is `--hc-color-fg`) fails silently.

### What the renderer derives for you (never set these)

- `--hc-color-on-primary`: the label colour on anything filled with the primary (buttons,
  active pills, a primary Container). It is black or white, whichever contrasts better.
  `--hc-color-on-accent` does the same for accent fills.
- `--hc-color-primary-fill`: the opaque form of the primary for fills.
- `--hc-color-primary-text` / `--hc-color-accent-text`: the brand colours nudged just far
  enough to read as text (links, eyebrows) on the page background.
- `muted` is emitted clamped to 4.5:1 against both `bg` and `surface`. Author a muted that
  already passes, so the swatch the customer sees is the colour that renders.
- `--hc-color-field-border`: the border token raised to 3:1 for form-field outlines.
- `--hc-hero-fg`: the hero's text colour (see Hero in `components.md`).

### Choosing a primary, knowing the label follows it

White text on a colour reaches 4.5:1 only when that colour's relative luminance is about
0.18 or less. A mid-tone brand colour (a bright blue like `#3b82f6`, a pink like `#dd5784`,
most oranges, yellows and light greens) therefore gets a **black** label on its buttons.
If the brand wants white-on-brand buttons, darken the primary until white clears 4.5:1
(`#2563eb` gives 5.2:1) and use the brighter brand tone as `accent` or in a hero gradient.

Dark palettes usually need a *lighter* primary (it is text and focus colour on a dark
page). Its buttons then get black labels, which is correct; do not force white.

### Building a palette pair

1. Start from the brand's primary and one secondary colour.
2. Light: `bg` white or a faint tint of the primary hue; `surface` one step off `bg`
   (e.g. 2–4% darker or tinted); `border` a little darker than `surface`; `fg` a near-black
   with a hint of the brand hue; `muted` the same hue at about 4.6–6:1 on `bg`.
3. Dark: `bg` a deep, slightly hue-tinted near-black (`#0b1220`, `#131b18`), not pure
   `#000`; `surface` one step lighter; `border` one step lighter again; `fg` an off-white;
   `muted` around 5–7:1 on `bg`; `primary` and `accent` lifted (lighter, a little less
   saturated) so they read on the dark ground.
4. Check every text pair at 4.5:1 in both palettes: `fg`/`bg`, `fg`/`surface`,
   `muted`/`bg`, `muted`/`surface`, `primary`/`bg` (as link text). Large display text
   (24px+, or 19px+ bold) needs 3:1. UI outlines and focus rings need 3:1.

Compute contrast rather than eyeballing it: relative luminance
`L = 0.2126 R + 0.7152 G + 0.0722 B` on linearised channels
(`c <= 0.04045 ? c/12.92 : ((c+0.055)/1.055)^2.4`), ratio `(L1+0.05)/(L2+0.05)`.

**Dark-by-default brands** (gaming, some developer tools): put the dark palette in
`theme.colors` too, so the site is dark in the light appearance as well, and keep
`theme.darkColors` dark.

## Fonts

Paths: `theme.fonts.body`, `theme.fonts.heading`, `theme.fonts.mono` (mono may be null).
Variables: `--hc-font-body`, `--hc-font-heading`, `--hc-font-mono`.

| Format | Meaning |
|---|---|
| `bunny:<Family>:<weights>` | A family from fonts.bunny.net (a mirror of most Google Fonts), e.g. `bunny:Inter:400,500,600,700`. Family: letters, digits and spaces only. Weights: three-digit values, comma-separated, up to nine. |
| `custom:<id>` | A font the customer uploaded in the dashboard. The guide overview lists them under `site.customFonts`. |
| `Georgia` | A bare family name: used if the visitor has it, or if a custom CSS `@font-face` block loads it. |

Load only the weights you use (each weight is a download). Fonts load through these
settings; `@import` in custom CSS is stripped. The format is checked, not the family: a
misspelt family or a weight the family lacks silently falls back to the system font, so
use the family's exact name as fonts.bunny.net lists it.

Pairings that read as designed (all on bunny):

| Mood | Heading / body |
|---|---|
| Calm, modern SaaS | Inter / Inter, or Manrope / Inter |
| Precise, financial | Space Grotesk / IBM Plex Sans, with IBM Plex Mono for figures |
| Editorial, premium | Fraunces or Playfair Display / Source Sans 3 |
| Friendly, consumer | Plus Jakarta Sans / Plus Jakarta Sans, or Baloo 2 / Nunito |
| Accessible, health | Lexend / Lexend, or Atkinson Hyperlegible / Source Sans 3 |
| Developer docs | IBM Plex Sans or Inter / same, with JetBrains Mono |
| Bold, gaming | Orbitron or Chakra Petch / Exo 2 |

The heading font sets page and component headings; the body font is everything else.
One family in two weights is a perfectly good choice.

## Radius and density

- `theme.radius.sm` / `md` / `lg`: CSS lengths (`"4px"`, `"0.5rem"`, `"0"`). `sm` is chips
  and inputs, `md` cards and buttons, `lg` panels and the hero. Also emitted:
  `--hc-radius-pill`. Sharp (2/4/6px) reads precise and corporate; soft (12/16/24px) reads
  friendly.
- `theme.density`: `compact` | `comfortable` | `spacious`, the site-wide gap and padding
  scale (`--hc-density-gap`, `--hc-density-pad`). Dense reference docs: `compact`.
  Consumer and health: `spacious`.

## Brand

| Path | Notes |
|---|---|
| `brand.name` | Shown by a text Logo, the footer brand block, page titles, emails. Never empty. Publishing the design also renames the help center in the dashboard to it. |
| `brand.tagline` | A short line under the name in the footer brand block. |
| `brand.logoAssetId` | Logo image. Takes a URL, or `{"source_url": "https://…"}` to copy an image (PNG, JPEG, GIF, WebP, SVG, ICO) onto this help center. The Logo renders it 32px tall; resize with CSS if needed. |
| `brand.logoDarkAssetId` | Optional logo for dark mode; the Logo swaps to it automatically. Use it when the main logo is dark ink. |
| `brand.faviconAssetId` | Favicon, URL or `{"source_url": …}`. |
| `brand.connectedSiteUrl` | The company's main website, where a Logo with `linkTarget: "parentSite"` points. |

Prefer `{"source_url": …}` over a bare URL for images on another host: the copy keeps
working if that host changes or disappears. Use only images the user supplied or pointed
you to.

## Meta and SEO

`meta.title` (home page title and suffix of every other title), `meta.description`,
`meta.keywords`, `meta.ogTitle`, `meta.ogDescription`, `meta.ogImageAssetId` (URL or
`{"source_url": …}`), `meta.noindex`, `meta.nofollowExternalLinks`,
`meta.nofollowWhitelist`, and `meta.direction` (`ltr` | `rtl`, the default language's text
direction; `rtl` forces right-to-left for every language, and right-to-left languages
are detected without it). Change `meta.noindex` only when the user asks: it hides the help
center from search engines.

## Page-level settings

Per page kind, `pages.<page>.<setting>`. Common to every page: `layout`
(`single` | `two-columns` | `three-columns` | `docked-sidebar`), `sidebarWidth` (12–28 rem),
`pageWidth` (48–112 rem), `contentWidth` (32–72 rem), `columnGap` (0–8 rem); null keeps the
theme's value. The category page adds its built-in article listing (`articleList*`,
`separateFaqs`, `faqsHeading`, `showSubcategories`, `subcategory*`, `showCategoryImage`);
the search page its results listing (`searchResult*`). See `document-model.md`.
