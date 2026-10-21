# Dashboard steps the user does

No HelpCenter.io tool can do these yet. Hand them to the user as a short checklist, with
the exact values filled in (hosts, event names, the token route), and only the steps the
task still needs. They need an Owner or Admin of the help center.

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
Embeddables → Widget → **Installation** card ("Paste this snippet before the closing
</body> tag of your site.") → **Copy**. The snippet holds `app_id: '…'`, five characters.
One help center has one widget and one ID. The user can send you the ID or the whole
snippet; neither is secret.

### Add the site's hosts to Embedding origins
Embeddables → Widget → **Configuration** → **Embedding origins** (the same list as Settings →
General → Embedding origins) → type a host → **Add** → **Save changes**.

- Hosts only: `https://www.example.com/help` is saved as `www.example.com`. Ports are
  ignored by the widget, so `localhost` covers `http://localhost:3000`.
- `example.com` and `www.example.com` are different entries. List both when both serve
  pages.
- A leading dot covers a domain and all its subdomains: `.example.com`. `*.example.com` is
  not recognised.
- Don't use a leading dot on a shared platform domain (`.vercel.app`, `.netlify.app`,
  `.myshopify.com`, `.webflow.io`, `.wixsite.com`, `.github.io`): that lets every site on
  the platform show the help center. List the exact preview or store host instead.
- An empty list blocks every site. Changes can take a couple of minutes to reach visitors.
- The list decides where the help center may appear, not who may read it. Reading is
  controlled by making the help center Private and signing readers in.

Give the user the exact list: production apex and `www`, staging, preview hosts, and
`localhost` for local development.

### Publish the help center
Settings → **Publishing** → **Publish help center**. Until then a public help center is
open to its team only, and the widget shows visitors no articles. Publishing needs an
active plan. A private help center doesn't need this step; it needs single sign-on.

### Create a FAQ section
Embeddables → **FAQ sections** → **New section**:

- **Section type**: "Full — all FAQs organized by category" shows every published FAQ entry,
  grouped by category, and picks up new ones by itself. "Custom — only the FAQs you pick"
  shows only the entries chosen in Manage FAQs. The type can't be changed later.
- **Section title**, optional **Section description**.
- **Display on URLs**: the host names of the pages that show the section, separated by
  commas. Exact hosts only: no leading dot, no wildcard, and `www.example.com` and
  `example.com` are different. This is a separate list from Embedding origins. The help
  center's own domain is always allowed.
- **Create and design** → pick one of the 27 designs. **Show title and description** off
  when the page already has its own heading for the FAQs.
- For a Custom section: **Manage FAQs** → add the entries.
- **Install** → **Copy** gives the markup:
  `<div class="hc-faq-section" data-id="KEY" data-type="custom"></div>` (or
  `data-type="full"`). Ask for the markup or just the key and type.

The section's "⋮" menu has **Preview** and **Open share page**
(`https://<help center>/share/faqs/<KEY>`), which show the section on its own.

### Create proactive messages
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

## The hand-off message

Keep it to the steps still open, in order, with values filled in. For example:

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

## Steps that API tools would remove

When the connector gains tools for these, the matching step moves from the user to you:

| Step | What a tool would do |
|---|---|
| Copy the widget ID | Read the help center's widget ID |
| Embedding origins | Read and add allowed hosts |
| FAQ sections | Create a section, set Display on URLs, choose a design, attach FAQs, read its markup |
| Proactive messages | Create messages and rules, switch them on |
| Single sign-on | Read whether it's set up, set the Login URL, issuer, audience and TTL. The secret itself should still go from the dashboard to the server, never through the conversation |
| Publishing, AI Answers, contact recipient | Read and change these settings |
