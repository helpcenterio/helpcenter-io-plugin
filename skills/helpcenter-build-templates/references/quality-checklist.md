# Quality pass and handover

Run this before you tell the user the design is ready for review. Fix what fails; report
what you could not check.

## Read it back

- `helpcenter_get_template` (outline) after your last write: every component you meant to
  add is there, in the right region and order, on every page you meant.
- No region holds two Navigations; the menu shows somewhere (`navigation-header-footer.md`).
- No `syncedButDiverged` region you created by accident.
- The write results carried no warnings you have not acted on or reported.
- The category page has no ArticleList or Breadcrumbs in `main`; the article page has no
  Breadcrumbs.

## Accessibility (WCAG 2.2 AA)

- **Contrast, in both palettes:** body text, muted text and link text at 4.5:1 on `bg`
  and on `surface`; large headings at 3:1; field outlines and focus rings at 3:1. Compute
  it (`theme-tokens.md`).
- **Bands:** text and links on a primary-coloured band use `var(--hc-color-on-primary)`
  and are underlined; nothing accent-coloured sits on a primary band.
- **Hero:** with `textColor: auto` on a gradient, both stops should carry the same text
  colour; with an image, force `textColor` and keep `coverEnabled` on.
- **Focus:** you did not remove or recolour focus outlines (no `outline: none`, no
  accent-coloured rings).
- **Motion:** every transition or transform you added is switched off under
  `prefers-reduced-motion: reduce`. No autoplaying animation.
- **Structure:** the Hero heading is the home page's h1. Headings you write in RichText
  follow on in order (h2, then h3); an eyebrow above the hero heading is a short paragraph,
  not a heading.
- **Images:** a logo image needs `brand.name` set (it is the logo's accessible name).
  Decorative imagery belongs in CSS, not in CustomHtml `<img>` tags without `alt=""`.
- **Targets:** links and buttons you style stay at least 24×24px.

## Mobile (check at 390px wide)

- Columns stack below 1024px: sidebar content comes first. A ContentTree or
  TableOfContents collapses into a bar; a docked sidebar becomes a drawer.
- The header wraps rather than overflows: keep the top-level menu short and the brand name
  reasonable; prefer a compact SearchBar.
- Hero: `heightVariant: tall` on a phone is a whole screen of banner before any content;
  consider `standard`.
- Card grids collapse to one column; check that card padding and hover-only styling still
  read without hover.
- No horizontal scroll: no fixed widths in CSS, no wide tables in CustomHtml.

## Languages and right-to-left

- Text you set is the default language's; other languages are translated in the
  dashboard, and changing a text leaves its old translations in place. List the texts you
  changed so they can be retranslated. Keep copy short so translations fit.
- A multilingual help center needs a LanguageSwitcher in the header (inline position) or
  footer.
- For an RTL default language (`meta.direction: rtl`), use logical CSS properties only,
  `align: start` where offered, and check that icons that imply direction are mirrored.

## Content states

- A section that needs content the help center does not have yet (Faqs with no FAQ
  articles, FeaturedArticles with no views, a ContactForm with no recipient) shows an
  empty or hidden state. Leave it out, or tell the user what to add.
- Never fill gaps with invented content: no fake articles, testimonials, phone numbers,
  status pages or links.

## Visual check

If you can open a browser, look at every page kind at desktop (1440px) and phone (390px)
widths, in the light and the dark appearance. The Template Editor link (`urls.customizer`
from `helpcenter_get_template`) shows the draft with a live preview for a signed-in team
member; the live site shows only the published design. Use sample content, and keep
account details out of any screenshot you share. If you cannot look, say so plainly:
describe what you built and what the user should check, rather than claiming it looks
right.

## Handover message

Tell the user, briefly:

1. What the design is (identity in one line: palette, type, mood).
2. What changed, page by page, and anything you deliberately left alone.
3. Anything that needs their input: a logo, a contact address for the form, FAQ articles,
   real links for the footer.
4. The Template Editor link for review, and that nothing is live yet.
5. That you will publish only when they say so, and that publishing ships the whole draft,
   including any earlier unpublished edits.
6. If the help center itself is not published yet (new help centers are visible to their
   team only), that its owner publishes it from the dashboard: the design tools cannot.
