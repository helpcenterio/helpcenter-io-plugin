# After the claim

Read `helpcenter_get_help_center` again and follow its `next_step`. Pass its `instruction` on
to the user as it is.

| `next_step.code` | What it means |
|---|---|
| `not_claimed` | Nobody has claimed it yet. Give the user the claim link again. While `claim.state` is `held`, someone used the link and is confirming their email address: nobody else can claim it until `held_until`, 24 hours after they started. |
| `wait_for_migration` | An open migration request is still moving content, and the help center takes no writes from you. Follow the request with `helpcenter_get_migration_request`. |
| `email_unverified`, `plan_not_activated`, `make_public` | The help center is the user's. These are their steps in the dashboard, in that order. You cannot publish it. |

`next_step` is null once nothing is left.

## Your key after the claim

On the claim page the user chooses whether you may finish setting up (ticked by default).

- **If they let you,** your key keeps working on the help center's content and design for 30
  days, and on nothing else of theirs. Publishing the help center for the first time asks
  them again; unless they say yes, the key stops working then (401), as it does if they
  revoke it sooner. What you write shows in their dashboard as "AI agent (setup)".
- **If they didn't,** the key stops working at the claim, and your part is done.

`capabilities` in the status says what your key may do now (`content`, `design`,
`redirects`, `custom_domain`), and what each one still waits for. After the claim,
`preview_url` follows the plan: until the user has activated one, or published the help
center, it is null.

## Redirects: keep the old help center's links working

Once the old help center's address points here, each of its old paths
(`/hc/en-us/articles/360001-Billing`) can send visitors on to the page that replaced it.
Redirects unlock with `capabilities.redirects`: the claim, a verified email address and an
activated plan. Before that, every redirect tool answers `capability_locked`.

- After an import, `helpcenter_get_import_redirect_map` gives each old article's and
  category's path with its new page, 200 a page, in the shape
  `helpcenter_bulk_create_redirects` takes. Send each page as it is. Sending it again
  re-points what is there and adds nothing, so read the map again before you re-apply it.
  With `response_format: "json"`, its `left_out` lists the old addresses the map could not
  give, and why: tell the user which old links will not forward.
- A redirect's target must be a published page of this help center. A draft is refused
  (`target_not_found`) until it is published, so apply the map again after the user
  publishes those articles. Another site is refused (`external_target_forbidden`): only the
  user can add one, in the dashboard.
- One-segment paths such as `/pricing` are read as a language and cannot be redirected
  (`source_not_redirectable`). Point each redirect at its final page: loops
  (`redirect_loop`) and chains of more than 3 (`too_many_hops`) are refused.
- `helpcenter_create_redirect` adds or re-points one, `helpcenter_list_redirects` lists them,
  `helpcenter_delete_redirect` removes one.

## The custom domain

It unlocks with `capabilities.custom_domain`, on the same conditions as redirects.

- `helpcenter_set_custom_domain` with the domain the user asked for, and only that one. Each
  change to a new domain counts against the help center's 4 a month and stops the old domain
  answering. `domain_taken`: another help center holds it.
- Give the user the `dns_records` from the result exactly as they are, to add at their DNS
  provider. Then check `helpcenter_get_custom_domain` every 5 minutes or so. Its `status`
  moves from `pending_dns` through `verifying` and `issuing_certificate` to `live`, usually
  within minutes of the record appearing. `failed` comes with a `failure` that says why.
- `helpcenter_remove_custom_domain` only when the user asks: the domain stops answering, and
  the help center goes back to its helpcenter.io address.
