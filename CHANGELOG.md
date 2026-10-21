# Changelog

All notable changes to the HelpCenter.io plugin. Versions apply to both the Claude plugin
(`.claude-plugin/plugin.json`) and the ChatGPT plugin (`openai/plugin.json`), which share
one set of skills.

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
