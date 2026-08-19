# Instagram integration setup (local development)

CreatorPulse uses the official **Instagram API with Instagram Login** (Meta Graph API). This is not scraping and not the deprecated Instagram Basic Display API.

Supported account types: **Instagram Professional** — Creator or Business. Personal accounts cannot be connected.

## 1. Create a Meta app

1. Open [Meta for Developers](https://developers.facebook.com/) and create an app.
2. Add the **Instagram** product to the app.
3. Choose **Instagram API with Instagram Login** (API setup with Instagram login — no Facebook Page required for basic profile + media).

## 2. Configure OAuth redirect URI

In the Meta app dashboard, add this redirect URI (must match exactly):

```
http://localhost:3000/api/instagram/callback
```

For production, use your deployed URL, e.g. `https://your-domain.com/api/instagram/callback`.

## 3. Request permissions (scopes)

CreatorPulse requests:

| Scope | Purpose |
| --- | --- |
| `instagram_business_basic` | Profile (username, ID, profile picture, follower count) |
| `instagram_business_manage_insights` | Insights-related data (future analytics sync) |

Adjust via `INSTAGRAM_OAUTH_SCOPES` in `.env` if Meta updates scope names for your app type.

## 4. Environment variables

Copy `.env.example` to `.env.local` and set:

```env
APP_URL="http://localhost:3000"
INSTAGRAM_CLIENT_ID="your-meta-app-id"
INSTAGRAM_CLIENT_SECRET="your-meta-app-secret"
INSTAGRAM_REDIRECT_URI="http://localhost:3000/api/instagram/callback"
AUTH_SECRET="..." # required — also used for token encryption if INSTAGRAM_TOKEN_ENCRYPTION_KEY is unset
```

Optional:

```env
INSTAGRAM_TOKEN_ENCRYPTION_KEY="..." # dedicated AES key material for access tokens at rest
INSTAGRAM_OAUTH_SCOPES="instagram_business_basic,instagram_business_manage_insights"
```

Never commit real secrets to git.

## 5. Add a test Instagram account

1. In the Meta app, add Instagram testers under **Roles** (Instagram Testers).
2. On the Instagram account, convert to **Professional** (Creator or Business) in Instagram app settings.
3. Accept the tester invitation on Instagram.

## 6. Run locally

```bash
npm run dev
```

1. Sign in to CreatorPulse.
2. Open **Profile**.
3. Click **Connect Instagram**.
4. Complete Meta authorization.
5. You should return to Profile with a connected `@username` and real follower count on Dashboard after sync.

Use **Sync Instagram** on Profile to refresh follower count, import Reels (up to 50 latest media), and update available metrics.

## 7. OAuth flow (server-side)

```
Profile → GET /api/instagram/connect → Instagram authorize
→ GET /api/instagram/callback → exchange code → long-lived token
→ encrypted storage in PostgreSQL → redirect /profile?instagram=connected
```

Access tokens are stored **server-side only** (encrypted). They are never sent to the browser, localStorage, or client components.

## 8. Troubleshooting

| Issue | Action |
| --- | --- |
| Redirect URI mismatch | Ensure `INSTAGRAM_REDIRECT_URI` matches Meta app settings exactly |
| Personal account | Convert to Creator/Business on Instagram |
| Connection expired | Use **Reconnect Instagram** on Profile |
| Integration not configured | Set all `INSTAGRAM_*` env vars and restart dev server |
| Rate limit | Wait and use **Sync Instagram** again |

## References

- [Instagram API with Instagram Login](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login)
- [Business Login for Instagram](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login)
