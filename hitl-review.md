# Human review checklist

## Gate 1: scope approval (after mockup agent)

Read product-spec.json and check:

- [ ] problem.statement is specific and actionable (not vague)
- [ ] user.primary.job_to_be_done follows the "When / I want / so I can" format
- [ ] scope.mvp.in has ≤5 features, each with a rationale linking to JTBD
- [ ] scope.mvp.out explicitly lists at least 3 deferred features
- [ ] scope.mvp.core_flow has ≤7 steps and makes sense end-to-end
- [ ] monetisation.model is consistent with problem.frequency
- [ ] scope.mmp.non_negotiables list is specific enough to verify (not vague)

To approve:
  edit product-spec.json → gates.scope_approved.status = "passed"
  add your notes to gates.scope_approved.notes
  then run: claude -p --agent mvp-agent

## Gate 2: ship approval (after mvp agent)

- [ ] core flow works end-to-end in Replit
- [ ] all scope.mvp.in features present and functional
- [ ] no scope.mvp.out features present in the UI
- [ ] .replit file exists and app starts cleanly
- [ ] all required env_vars documented

To approve:
  edit product-spec.json → gates.ship_approved.status = "passed"
  add your notes to gates.ship_approved.notes
  then run: claude -p --agent mmp-agent
