# Component catalog: what each is for and when to choose it

This is a design guide, not the schema. Before you add or configure a component, read its
exact settings, defaults and allowed values with `helpcenter_get_template_guide`
(topic `components`, `component_types` up to 8 at a time). Those values are generated from
the live registry; a value off by a word is refused. Omitted settings keep their defaults.

Every component can also take `width: "half"` (main region only: two neighbours share a
row) and, on the article page's main region, `zone` (`before-title` | `after-title` |
`after-content`). Header/hero inline components take `position` (`left` | `center` |
`right` | `block`).

"Where" below is the registry's placement (pages · regions). Adding one elsewhere is
refused.

## Site chrome: header and footer

**Logo** (every page · header, hero, footer · one per region · inline)
The logo image (`brand.logoAssetId`) or the brand name as text (`variant`). `linkTarget`
`parentSite` sends it to `brand.connectedSiteUrl` instead of the help center home. With no
logo uploaded, use the text variant and set `brand.name`.

**Navigation** (every page · header, hero, footer, sidebar · inline)
Draws the ONE global menu (`helpcenter_set_template_navigation`). Its own settings only
change how it is drawn: `variant` horizontal | vertical | pills; `showSubcategories` for
vertical. Read `navigation-header-footer.md` before adding one: the menu shows only where
a Navigation (or a Footer without columns) exists, and two Navigations in one region draw
the menu twice.

**SearchBar** (every page · any region · one per region · inline)
`size` `compact` for headers, `large` for heroes, `custom` with `fieldWidth` /
`fieldHeight`; `cornerRadius`; `backgroundMode` `solid` | `translucent` (frosted, best on a
photo or coloured banner) | `transparent` (outline only, for a coloured header band);
`showButton`; `instantSearch` and `resultsVariant` (`detailed` shows excerpts);
`helperText` for a "Popular: billing, invoices" line; `showAskAi` (renders only when the
help center has AI answers on). Pages without a hero should carry a compact SearchBar in
the header, or visitors lose search.

**LanguageSwitcher** (every page · header, hero, footer, utility · inline)
Renders only on multilingual help centers (the guide overview lists `site.languages`).
`variant` dropdown | inline; `labelStyle` name | native | code.

**Footer** (every page · footer · one)
`columns` 1–4 and `columnBlocks`: an ordered list of blocks, each
`{id, type: brand|links|text|social|html, heading?, content?, items?}`. `links` items are
`{id, label, dest: {type: url|home|category|article, value}}`. An empty `columnBlocks`
falls back to brand + the navigation menu under "Links". `showAttribution` shows or hides
the "Powered by HelpCenter.io" line (its wording cannot be changed). The guide's
`components` topic has the exact block shapes.

**SocialLinks** (every page · footer, header, utility)
Icon links for twitter, linkedin, github, facebook, instagram, youtube (a handle or full
URL each; empty hides it).

## Banners and free content

**Hero** (every page · hero, header · container)
The banner: `heading`, `subheading` (a little inline HTML: br, strong, em), `align`,
`heightVariant` compact | standard | tall, and `background`:
- `gradient`: `gradientStyle` linear (`gradientFrom` → `gradientTo` along `gradientAngle`)
  or radial (a corner glow of `gradientFrom` over `gradientTo`). Empty stops use the
  theme's primary and accent, so the hero follows the palette in both modes. Explicit hex
  stops do NOT switch with dark mode.
- `solid`: the primary colour.
- `image`: `backgroundImageUrl` (URL or `{"source_url": …}`), `backgroundColor` under a
  transparent image, `coverEnabled` + `coverOpacity` for a darkening overlay.
`textColor` `auto` picks black or white per appearance by measured contrast, and where no
text colour reads across a whole linear gradient it lays a wash over the band just strong
enough that one does (pick stops that carry one text colour to avoid it). Force
`light`/`dark` on an image, which cannot be measured. A Hero holds children: RichText, SearchBar, CategoryGrid,
Faqs, CustomHtml, Spacer, Divider, Container, and Logo / Navigation / LanguageSwitcher for
a header overlaid on the banner. The heading and subheading render first and the children
follow in order, so an eyebrow (a short RichText) lands BELOW the heading unless CSS lifts it
(`order: -1`, see `custom-css.md`). A new Hero comes with a large SearchBar child; it has no
search of its own, so keep one.

**Container** (home, category, article, search, notFound · main, sidebar, hero, utility ·
container)
A styled box: `boxBackground` none | surface (a visible card) | muted (paints the page
background colour, so it shows only on a coloured region) | primary (filled, with text and
links switched to the on-primary colour); `padding`; `maxWidth` full | prose (42rem) |
narrow (28rem); `align`; `direction` vertical | horizontal (children side by side). Holds
RichText, SearchBar, CategoryGrid, Faqs, CustomHtml, Spacer, Divider and other Containers.
Use it for welcome callouts, a two-up "Still stuck? / Status" band, or to group a section.

**RichText** (anywhere): CommonMark Markdown in `markdown`. Eyebrows above a hero heading,
short intros, callouts.

**CustomHtml** (anywhere): your own markup in `html`; `fullBleed` spans the viewport width.
`<script>` and `<style>` are stripped: style it from custom CSS through your own class
names. Right for an announcement bar, a logo strip, a "status" pill. Not for anything a
native component already does (search, categories, menus), which would not stay in sync
with the help center's content.

**Spacer** (`size` xs–xl or custom `height`) and **Divider**: rhythm between sections.

## Helping readers find content

**CategoryGrid** (home, category, search, notFound · main, sidebar · one per region)
The home page's centrepiece. `variant`:
- `cards`: vertical cards, best with category icons or images (`showImage`, `imageSize`,
  `fullWidth`, `centered`).
- `horizontal`: icon beside title and description; tidy in two columns.
- `list`: divided rows, quiet and dense.
- `minimal`: plain title links.
- `with-articles`: each card lists its top `articlesPerCategory` articles (topic hubs,
  course modules).
- `sections`: each top-level category becomes a heading (`sectionHeadingStyle` plain |
  eyebrow | divider) with its subcategories as cards. Only for nested category trees.
Cards take one column on phones, at most two from 640px, and `columns` from 1024px.
Category icons are Font Awesome Free 6 classes set on the categories. Plus `heading`,
`columns` 1–4, `limit`, `hideEmpty`, `showCount`, `showDescription`,
`showBrowse` + `browseLabel`, `spacing`, author/updated meta. Check
`helpcenter_list_categories` first: the variant must suit how many categories there are
and whether they nest. Category icons and images belong to the categories themselves,
not to the theme.

**FeaturedArticles** (home, category, search · main, sidebar)
Hand-picked `articleIds` (published, in order). With none, the home page shows the most
viewed articles; other pages show nothing. A new help center has no views yet, so curate
`articleIds` (from `helpcenter_list_articles`) or the section is a heading over an empty
list. `variant` grid | list, `limit`, `heading`, `headingIcon`. Top level only: Heroes and
Containers do not accept it.

**ArticleList** (home, category, search, notFound · main, sidebar)
Recent or ordered articles (`sortBy` updated_at | created_at | position | title |
title_desc), `variant` list | block. On the home page it draws from the 10 most recently
updated articles; on search and 404 pages it has nothing to list. Never on the category
page: that page lists its own articles (configure it with `pages.category.articleList*`).

**Faqs** (home, category, search, notFound · main, sidebar)
An accordion of FAQ-type articles, all of them or one FAQ section (`faqSectionKey`, from
the guide overview's `site.faqSections`). With no FAQ articles it shows a "no FAQs yet"
line, so leave it out until the help center has some.

**ContentTree** (home, category, article, search, notFound · sidebar, main)
A docs-style tree of categories and articles. `variant` plain | tiles | grouped,
`container` card | minimal, `density`, `maxDepth`, `showArticles`, `highlightCurrent`,
`collapsible`, `sticky`. The backbone of a documentation layout.

**Breadcrumbs** (category, article, search · main, header): the article and category pages
already render their own breadcrumbs, so adding one there duplicates it.

## The article page

The article body renders itself in main. Components placed in main go before the title,
after the title or after the body by `zone`.

- **TableOfContents** (sidebar, utility): "On this page" from the article's h2–h5
  headings (`maxDepth` 1–4 = down to h2…h5); it draws nothing for an article without
  headings. For a right-hand rail use `utility` WITH the `three-columns` layout: in other
  layouts the utility region sits under the footer.
- **ArticleMetadata** (main, sidebar · one): author, updated date, reading time; default
  zone after-title.
- **ArticleRating** (main): "Was this helpful?" with `scale` 3 or 2 and `askForFeedback`.
- **RelatedArticles** (sidebar, main): `matchBy` default (similar content) | category | recent.
- **RecentlyViewed** (sidebar, main): the reader's own history.
- **ShareButtons** (main, sidebar): `channels`, `variant`.
- **ArticleExport** (main, sidebar · one): copy as Markdown, print, PDF, open in an AI
  assistant; each option toggles separately.
- **ArticleComments** (main): reader comments, approval and notification settings.
  Comments are public conversation; add only when the user wants them.

## Getting in touch

- **ContactForm** (contact, home · main · one): `fields`, `heading`, `submitLabel`,
  `successMessage`, `suggestArticles`. **The contact page and every link to it stay hidden
  until `recipientEmail` is set.** Set the recipient only to an address the user gave you.
- **ContactCta** (home, category, search, notFound · main, utility, footer): a "Can't find
  it? Ask us" band with a button (`buttonUrl` defaults to `/contacts`; empty hides the
  button) or your own HTML (`customContent` + `body`).

## Not for design work

**CustomScript** loads one external script and exists for older designs. Scripts belong in
`helpcenter_add_template_script`, and only when the user asks for one.

## Choosing per page kind (defaults that work)

| Page | Header | Hero | Main | Sidebar / utility |
|---|---|---|---|---|
| home | Logo, Navigation | Hero + SearchBar (+ RichText eyebrow) | CategoryGrid, then FeaturedArticles or Faqs, ContactCta | usually empty (`single`) |
| category | Logo, Navigation, compact SearchBar | none, or a compact Hero | extras only (built-in listing) | ContentTree for docs |
| article | Logo, Navigation, compact SearchBar | none | ArticleMetadata, ArticleRating, RelatedArticles | ContentTree / TableOfContents |
| search | Logo, Navigation | optional compact Hero + SearchBar | results are built in; add a ContactCta | |
| contact | Logo, Navigation | optional compact Hero, no search | ContactForm | |
| notFound | Logo, Navigation, compact SearchBar | | a friendly RichText, SearchBar or CategoryGrid | |

A 404 page with no search and no way back is a dead end; give it one of each.
