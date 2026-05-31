# Operations Runbook

Owner-only operational procedures for Store Auditor.
All steps assume Lovable Cloud (Supabase) admin access via the Lovable backend panel.

---

## 1. Rotating the Cron Edge-Invoker Anon Key (W4)

**When:** any time the project's anon/publishable key is rotated, or on a
quarterly cadence as a hygiene measure.

**Why:** `pg_cron` jobs invoke Edge Functions via `public._invoke_edge_function`,
which reads the bearer token from `public._app_secrets` (key
`edge_invoker_anon_key`). Rotating this key is a single `UPDATE` — no cron
schedule needs to be touched.

### Procedure

1. **Mint the new key.**
   - In the Lovable backend panel, rotate the project's publishable/anon key.
   - Copy the new value to a secure clipboard.

2. **Update the vaulted copy.**
   ```sql
   UPDATE public._app_secrets
      SET value = '<NEW_ANON_KEY>',
          updated_at = now()
    WHERE key = 'edge_invoker_anon_key';
   ```

3. **Smoke-test.** Run any cron-driven function manually through the wrapper:
   ```sql
   SELECT public._invoke_edge_function('cleanup-old-data', '{}'::jsonb);
   ```
   Then check **Admin → Observability** within ~30 seconds — there must be no
   new `function_errors` row tied to that invocation, and the `request_id`
   returned should resolve to a `2xx` status in `net._http_response`.

4. **Revoke the old key** in the Lovable backend panel.

5. **Log the rotation.** As an admin, this is auto-captured if the rotation is
   triggered through the UI. For SQL-only rotations, manually log it:
   ```sql
   SELECT public.log_admin_action(
     'cron.rotate_anon_key',
     'app_secret',
     'edge_invoker_anon_key',
     jsonb_build_object('rotated_at', now())
   );
   ```

### Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Cron jobs silently stop firing | `_app_secrets` row missing | Re-insert with the current anon key. |
| `401` in `net._http_response` after rotation | Old key still in `_app_secrets` | Re-run step 2 with the new value. |
| `RAISE EXCEPTION 'edge_invoker_anon_key not configured'` | Row deleted | Insert a fresh row; jobs resume on next tick. |

---

## 2. Rotating the Invite Token Pepper

Same shape as section 1, but the key is `invite_token_pepper` and the value
must be ≥32 characters. **Rotating this invalidates every outstanding pending
invite** (team and client). Send a comms note before rotating, and re-issue
any active invites afterward via the agency Team panel.

---

## 3. Cron Jobs Inventory

| Job name | Schedule (UTC) | Wrapper call |
|---|---|---|
| `composio-refresh-tokens-hourly` | `0 * * * *` | `_invoke_edge_function('composio-refresh-tokens', …)` |
| `cleanup-old-invites-daily` | `30 3 * * *` | `_invoke_edge_function('cleanup-old-invites', …)` |
| `cleanup-old-data-daily` | `15 3 * * *` | `_invoke_edge_function('cleanup-old-data', …)` |

To inspect: `SELECT jobname, schedule, command FROM cron.job ORDER BY jobname;`
The `command` column should contain only `SELECT public._invoke_edge_function(...)`
— **never** an inline bearer token.
