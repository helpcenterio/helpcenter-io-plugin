# Changelog

All notable changes to the HelpCenter.io plugin. Versions apply to both the Claude plugin
(`.claude-plugin/plugin.json`) and the ChatGPT plugin (`openai/plugin.json`), which share
one set of skills.

## 1.5.0 (2026-10-23)

Adding help to a website now does the HelpCenter.io side too.

- **helpcenter-integrate-widget** uses the connector's widget and FAQ-section tools
  (connector 2.2.0) for the steps it used to hand to the user. It reads the widget's install
  code and whether visitors are served (`helpcenter_get_widget_install`), adds the site's
  hosts to the allowed websites once the user agrees (`helpcenter_update_embedding_origins`),
  and creates the FAQ section with the same hosts, writes its FAQ entries and adds them
  (`helpcenter_create_faq_section`, `helpcenter_add_faq_section_articles` and the rest), in
  that order. It decides by the tools it actually has, not by a version, and keeps the
  dashboard path for connections without them or without the permission.
- What stays with the user: publishing the help center, the widget's appearance, proactive
  messages, a FAQ section's custom CSS, FAQ import from a URL, and single sign-on with its
  secret. The hand-off lists only those.
- Allowing websites needs an Owner or Admin and a new permission ("Choose which websites may
  embed your help center"). A connection made before it existed reconnects once; the skill
  says so instead of retrying.
- Verification reads `visitors.served` and its `reason` as the published check, and the
  allowed hosts as the embedding check, before anything is tested in a browser.
- Corrected for the platform as it is now: a leading dot in a FAQ section's Display on URLs
  covers subdomains, `*.example.com` is saved as `.example.com`, wildcards over shared
  platform domains are refused, and an unpublished help center's FAQ sections load nowhere
  else (403 `SITE_NOT_PUBLISHED`).

## 1.4.0 (2026-10-21)

Add help to a client's website in minutes.

- **helpcenter-integrate-widget**, a new skill for the website's own code: the widget
  (loaded once, its own button, per-page articles, links that open articles inside it,
  contact hand-off, events for proactive messages), inline FAQ sections, and JWT single
  sign-on for a private help center (the token endpoint and the Login URL, in Node.js,
  Python, PHP and Ruby). Recipes for plain HTML, Next.js (App and Pages Router), React and
  Vue with Vite, Nuxt, Laravel, Rails, Django and WordPress, and paste-in steps for Webflow,
  Wix, Shopify and Squarespace. It updates an existing Content Security Policy with only the
  sources the widget needs, writes FAQ entries through the connector, verifies the result,
  and hands the user the dashboard steps no tool can do yet, with the values filled in.
  The single sign-on secret stays in the server's environment and out of the conversation.
- Tested by fresh Claude Code sessions with only this plugin, on a static site, a React
  single-page app and a Next.js app with sign-in, each checked in a browser afterwards.

## 1.3.0 (2026-10-21)

First release from this repository, and the first for Claude.

- **helpcenter-build-templates** rewritten so an assistant with only the HelpCenter.io
  tools can design and build a complete theme from a short brief: a lean workflow with
  ground rules, plus references for the document model, colour tokens and contrast,
  components, navigation, custom CSS (stable hooks, component anatomy, recipes), a
  from-brief design method with worked examples, and a quality checklist. Tested by
  fresh Claude sessions building three themes from scratch.
- **helpcenter-maintain-articles** covers bulk import, image upload, moving articles to
  the Trash, one-call reordering, and change sets.
- Claude plugin manifest, connector reference (`https://mcp.helpcenter.io`, the same URL
  as the connector listing) and a one-plugin marketplace for Claude Code.
- Licensed MIT.

## 1.2.0 and earlier

Shipped from the HelpCenter.io connector's repository as the ChatGPT plugin: five skills
over the HelpCenter.io connector, choosing the help center per call (`site_id`), and
dashboard links built from the site's subdomain.
