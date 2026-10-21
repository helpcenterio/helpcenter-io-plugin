---
name: helpcenter-improve-content
description: Identify HelpCenter.io content gaps from analytics and reader feedback, or address private editorial feedback when the user requests those workflows.
---

Use `helpcenter_get_search_queries` for failed searches, `helpcenter_get_content_performance` for article views and ratings, and `helpcenter_get_analytics_summary` for overall trends. Respect the user's date range. When dates are omitted, use the API default and report the actual returned range. A top-N list is not a total, absent data is not zero, and unavailable analytics is not evidence of healthy performance. Stop on rate limits rather than repeatedly requesting a costly query.

Use `helpcenter_list_comments` or `helpcenter_get_article_comments` for reader feedback. Reader emails are redacted by default, IPs are never returned, and internal editorial notes are excluded. Do not request `include_email` unless the user's authorized task specifically requires those addresses. Summarizing feedback does not authorize public replies or moderation.

Reader replies publish immediately and can email the reader. Before `helpcenter_reply_to_comment` or `helpcenter_moderate_comment`, establish the user's authorization for the affected comment and exact response or moderation action. Read the thread after an uncertain send before retrying; replies are not idempotent.

For internal editorial review, use `helpcenter_list_article_notes` only when the task and connection grant notes access. Notes permissions are separate from content permissions. Keep notes private: never quote or paraphrase them into a published article, public reader reply, or external destination. Revise article content from independently authorized product facts. Reply internally or resolve a thread only when requested and after actually addressing the feedback.

Recommend changes with supporting article IDs, source URLs when returned, date ranges, and observed signals. Label proposed priorities as recommendations. Create or revise content only if the user's task authorizes it; use drafts or staged changes for work awaiting review. On `site_required`, pass the `site_id` of the help center the user means (from `helpcenter_list_sites`), asking them if it is unclear. Explicit user instructions govern the task and take precedence over workflow defaults.
