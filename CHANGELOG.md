# Changelog

All notable changes to the HelpCenter.io plugin. Versions apply to both the Claude plugin
(`.claude-plugin/plugin.json`) and the ChatGPT plugin (`openai/plugin.json`), which share
one set of skills.

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
