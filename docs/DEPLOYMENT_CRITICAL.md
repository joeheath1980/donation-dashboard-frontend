# 🚨 Critical Frontend Deployment Notes

This file distils the non-negotiable checks you must run when deploying the Do-Nation frontend. For the full walkthrough, follow `docs/FRONTEND_DEPLOYMENT_GUIDE.md`.

## Must-Know Facts
- Nginx serves from the symlink `/var/www/do-nation.space` → `/var/www/donation-dashboard/`.
- Deploy new builds into `/var/www/donation-dashboard/` (never `/var/www/html/`).
- Keep permissions set to `www-data:www-data` ownership with `755` mode.

## Mandatory Verification Commands
```bash
# 1. Symlink in place
ssh do-nation-server "ls -la /var/www/ | grep do-nation.space"
# expect: do-nation.space -> /var/www/donation-dashboard

# 2. Latest files deployed
ssh do-nation-server "ls -la /var/www/donation-dashboard/ | head"

# 3. Nginx pointed at the symlink
ssh do-nation-server "grep -E '^\s*root' /etc/nginx/sites-available/default | grep -v '#'"
# expect: root /var/www/do-nation.space;

# 4. Site responds
curl -I https://do-nation.space | head -1
```

If any check fails:
1. Recreate the symlink:
   ```bash
   ssh do-nation-server "sudo ln -sf /var/www/donation-dashboard /var/www/do-nation.space"
   ```
2. Redeploy the build contents to `/var/www/donation-dashboard/` and re-run the guide.
3. Reload nginx: `ssh do-nation-server "sudo systemctl reload nginx"`.

That’s it—run these checks every time to avoid serving stale or missing assets.
