# Dashboard steps

Each step below is what the user does in the HelpCenter.io dashboard. Four of them have a
connector tool, named under the step's heading: when that tool is in your tool list, do the
step yourself (with the user's agreement for settings) and skip it in the hand-off. Hand the
user the manual path when the tool is missing from your list or refused for a permission.
The rest have no tool.

Hand the user what's left as a short checklist, with the exact values filled in (hosts,
event names, the token route), and only the steps the task still needs. They need an Owner
or Admin of the help center.

| Step | Tool |
|---|---|
| Copy the widget ID | `helpcenter_get_widget_install` |
| Add the site's hosts to Embedding origins | `helpcenter_update_embedding_origins` |
| Create a FAQ section, pick its FAQs | `helpcenter_create_faq_section`, `helpcenter_add_faq_section_articles` and the other FAQ-section tools |
| Publish, widget appearance, proactive messages, single sign-on, AI Answers, contact recipient, a section's custom CSS, FAQ import from a URL | None: always the user |

## Dashboard links

The dashboard lives at `https://helpcenter.io/app/sites/{subdomain}`, where `{subdomain}` is
the help center's subdomain (the `acme` in `acme.helpcenter.io`), even when the help center
uses a custom domain. When the HelpCenter.io connector is connected, read it from
`helpcenter_list_sites` with `response_format: json`. Otherwise use
`https://helpcenter.io/app/sites`, which opens the help center picker.

| Page | Link |
|---|---|
| Embeddables, Widget tab | `https://helpcenter.io/app/sites/{subdomain}/widget` |
| Embeddables, FAQ sections tab | `https://helpcenter.io/app/sites/{subdomain}/widget?tab=faqs` |
| Settings | `https://helpcenter.io/app/sites/{subdomain}/settings` |

The Proactive messages tab sits beside the other two on Embeddables.

## The steps

### Copy the widget ID
**With the connector:** `helpcenter_get_widget_install` returns `install_snippet` (byte for
byte what the dashboard shows), `app_id`, the current `embedding_origins`, whether the widget
has been seen running (`installed`, `last_seen_at`), whether visitors are served
(`visitors.served`, `reason`) and what the plan includes (`entitlements`). The first call
creates the widget if the help center has none yet, as opening the dashboard page does.

Embeddables → Widget → **Installation** card ("Paste this snippet before the closing
</body> tag of your site.") → **Copy**. The snippet holds `app_id: '…'`, five characters.
One help center has one widget and one ID. The user can send you the ID or the whole
snippet; neither is secret.

### Add the site's hosts to Embedding origins
**With the connector:** `helpcenter_update_embedding_origins` with
`add: ["www.example.com", "example.com", "localhost"]`, after the user agrees to the list.
`add` and `remove` change only the entries they name; `replace` sets the whole list, so use
it only when the user asks for exactly that. The result lists `added`, `removed`, `not_listed`
and the new `frame_ancestors` header. It needs `embed.manage` and an Owner or Admin. Refused
entries come back as a validation error naming the entry: fix it (the exact host instead of a
wildcard) rather than retrying. Leaving the list empty needs `allow_block_all: true`, and
that stops the widget everywhere. At most 50 entries.

Embeddables → Widget → **Configuration** → **Embedding origins** (the same list as Settings →
General → Embedding origins) → type a host → **Add** → **Save changes**.

- Hosts only: `https://www.example.com/help` is saved as `www.example.com`. Ports are
  ignored by the widget, so `localhost` covers `http://localhost:3000`.
- `example.com` and `www.example.com` are different entries. List both when both serve
  pages.
- A leading dot covers a domain and all its subdomains: `.example.com`. `*.example.com` is
  saved as `.example.com`.
- Refused: `*`, a leading dot over a top-level or country domain (`.com`, `.co.uk`) and over
  a shared platform domain (`.vercel.app`, `.netlify.app`, `.myshopify.com`, `.webflow.io`,
  `.wixsite.com`, `.github.io`, `.pages.dev` and others), which would let every site on the
  platform show the help center. List the exact preview or store host instead
  (`acme.vercel.app`). Entries already on the list are kept as they are.
- An empty list blocks every site. Changes can take a couple of minutes to reach visitors.
- The list decides where the help center may appear, not who may read it. Reading is
  controlled by making the help center Private and signing readers in.

Give the user the exact list: production apex and `www`, staging, preview hosts, and
`localhost` for local development.

### Publish the help center
No tool. `helpcenter_get_widget_install` tells you whether it's needed: `visitors.reason`
`unpublished`.

Settings → **Publishing** → **Publish help center**. Until then a public help center is
open to its team only, and the widget shows visitors no articles. Publishing needs an
active plan. A private help center doesn't need this step; it needs single sign-on.

### Create a FAQ section
**With the connector:** `helpcenter_create_faq_section` with `type`, `title`, `display_urls`
(the same hosts you allowed as Embedding origins) and optionally `template` (ids from
`helpcenter_list_faq_sections`, `templates.ids`; a new section starts on `slate`), `design`
and `show_heading`. For a Custom section, `helpcenter_add_faq_section_articles` with the ids of
FAQ articles (type `faq`), then `helpcenter_reorder_faq_section_articles` or
`helpcenter_remove_faq_section_article` as needed. Every section result carries
`install_snippet`. Creating, updating and deleting sections needs an Admin or Owner; adding,
removing and reordering FAQs an Editor or above. The order and details are in
faq-sections.md. A section's custom CSS and importing FAQs from a URL stay in the dashboard.

Embeddables → **FAQ sections** → **New section**:

- **Section type**: "Full — all FAQs organized by category" shows every published FAQ entry,
  grouped by category, and picks up new ones by itself. "Custom — only the FAQs you pick"
  shows only the entries chosen in Manage FAQs. The type can't be changed later.
- **Section title**, optional **Section description**.
- **Display on URLs**: the host names of the pages that show the section, separated by
  commas. `www.example.com` and `example.com` are different; a leading dot (`.example.com`)
  covers a domain and all its subdomains. This is a separate list from Embedding origins.
  The help center's own domain is always allowed.
- **Create and design** → pick one of the 27 designs. **Show title and description** off
  when the page already has its own heading for the FAQs.
- For a Custom section: **Manage FAQs** → add the entries.
- **Install** → **Copy** gives the markup:
  `<div class="hc-faq-section" data-id="KEY" data-type="custom"></div>` (or
  `data-type="full"`). Ask for the markup or just the key and type.

The section's "⋮" menu has **Preview** and **Open share page**
(`https://<help center>/share/faqs/<KEY>`), which show the section on its own.

### Create proactive messages
No tool.

Embeddables → **Proactive messages** → **New message**:

- **Message** tab: the text of the bubble.
- **When it shows** tab: rules such as Page URL and Time on page, and, on Growth and
  Catalyst, Scroll depth, Visitor idle, Clicked or Hovered an element, Exit intent, Form
  abandoned, **Custom event**, Referrer, URL parameter, First-time or returning. A Custom
  event rule names the event your code fires with `hcWidget.trigger('<name>')`: letters,
  numbers and `_ . : -` only, matched exactly.
- **Delivery** tab: **Active** (new messages start switched off) and the quiet period.
- **Test** tab.

Give the user the exact event names your code fires.

### Set up single sign-on (JWT)
No tool, and none should carry the secret.

Settings → **Single sign-on** (Catalyst plan) → **Enable Single Sign-On** → **JWT (HS256)**:

- **Login URL** (required): the address of the sign-in endpoint you built, such as
  `https://app.example.com/auth/helpcenter`. It's required even when only the widget uses
  sign-in, and it must have no query string of its own.
- **Shared secret** (required): **Generate**, then copy it straight into the server's
  environment as `HELPCENTER_SSO_SECRET` (or the host's secret store), not into the
  conversation. **Regenerate** signs every reader out.
- Optional: **Issuer (iss claim)** and **Audience (aud claim)**, which every token must then
  match, and **Token TTL (seconds)**, the widget's limit on token age (300 recommended).
- **Save JWT settings**.
- Then set the help center to **Private** (Settings → General → Access & visibility) so
  only signed-in readers see it.

### Turn on AI answers
Settings → **AI features** → **AI Answers**. Needs Catalyst, or the AI add-on. Without it
the widget still searches and shows articles, and "Can this help?" page suggestions don't
appear.

### Let visitors message the team
The widget's built-in contact form needs a recipient email on the help center's contact
form. Without one the widget shows no contact option at all, unless the site's code
handles contact itself (`onContactsRequest`, see widget-api.md).

### Change how the widget looks
No tool. Embeddables → Widget → **Configuration**: colours, launcher icon, heading, custom
content and translations. The code can still hide the launcher and use the site's own button
(`showButton: false`, widget-api.md).

## The hand-off message

Keep it to the steps still open, in order, with values filled in. With the connector's widget
tools most of the dashboard half is done, so the message is short. For example:

> Code's in place, and in HelpCenter.io I added `www.acme.com`, `acme.com` and `localhost`
> to the allowed websites and created the "Billing questions" FAQ section with six FAQs
> (drafts until you say so). Two things only you can do (Owner or Admin):
>
> 1. **Publish** the help center (Settings → Publishing): until then visitors see the
>    launcher but no articles.
> 2. **Proactive message** (Embeddables → Proactive messages → New message): a Custom event
>    rule for `payment_failed`, then switch it on.
>
> Dashboard: https://helpcenter.io/app/sites/acme/widget

Without those tools (or with the origins tool refused), the same task hands over more:

> Code's in place. Three things only you can do in HelpCenter.io (Owner or Admin):
>
> 1. **Embedding origins** (Embeddables → Widget → Configuration): add `www.acme.com`,
>    `acme.com`, `staging.acme.com` and `localhost`, then Save changes.
> 2. **FAQ section** (Embeddables → FAQ sections → New section): type Full, Display on URLs
>    `www.acme.com, acme.com`, then Create and design. Send me the markup from Install.
> 3. **Publish** the help center (Settings → Publishing) if it isn't yet: until then
>    visitors see the launcher but no articles.
>
> Dashboard: https://helpcenter.io/app/sites/acme/widget

## Steps still without a tool

When the connector gains tools for these, the matching step moves from the user to you:

| Step | What a tool would do |
|---|---|
| Proactive messages | Create messages and rules, switch them on |
| Widget appearance | Colours, launcher icon, heading, custom content, translations |
| FAQ section custom CSS, FAQ import from a URL | Edit the CSS, run the import |
| Single sign-on | Read whether it's set up, set the Login URL, issuer, audience and TTL. The secret itself should still go from the dashboard to the server, never through the conversation |
| Publishing, AI Answers, contact recipient | Read and change these settings |
