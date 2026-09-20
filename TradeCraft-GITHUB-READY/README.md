# TradeCraft ACM-W — Market Sprint Platform

Deployment-ready full-stack platform for the fictional-market simulation.

## Architecture

- **Netlify** serves `public/` as the participant/admin web app.
- **Node backend** runs `server.js` and owns authentication, trading, ticks, orders, SSE, audit logs, and the private engine.
- **Persistent data** is controlled by `DATA_FILE`; the included Render blueprint mounts `/var/data`.
- `private/engine.json` is never served by the backend's static file handler. Keep the backend repository private because it contains organizer-only event data.

## Local run

```bash
npm install
node server.js
```

Open `http://localhost:3000`. The frontend defaults to the local API when `config.js` has not been replaced by a deployment build.

## Production deployment

### 1. Deploy the Node backend

The project includes `render.yaml` for a Render Node service. Create/deploy the service from the repository and set these environment variables:

```text
NODE_ENV=production
ADMIN_EMAIL=<real organizer email>
ADMIN_PASSWORD=<long random password>
FRONTEND_ORIGIN=https://<your-netlify-site>.netlify.app
DATA_FILE=/var/data/data.json
```

If you use a custom Netlify domain, set `FRONTEND_ORIGIN` to that exact origin. Multiple allowed origins can be comma-separated.

The backend exposes `GET /api/health`. After deployment, verify that it returns `{"ok":true,...}`.

### 2. Deploy the frontend to Netlify

Do **not** publish the whole project as the Netlify site root. Netlify must publish `public/`.

The included `netlify.toml` already sets:

```text
build command: node scripts/write-config.js
publish directory: public
```

In Netlify, set this environment variable for the site build:

```text
TRADECRAFT_API_BASE=https://<your-backend>.onrender.com
```

Then redeploy. The build writes the backend URL into `public/config.js`.

### 3. Test the full flow

1. Open the Netlify URL.
2. Open **Admin** and sign in with the production `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Create a team in Control Room.
4. Open Team Login in another browser/incognito window.
5. Start the market from Control Room.
6. Place a test order and verify it fills on the next tick.
7. Verify the public market receives live updates.
8. Verify `/private/engine.json` is not accessible from the Netlify URL.

## Security boundary

- Admin/team sessions use HttpOnly cookies.
- Production cross-origin sessions use `Secure; SameSite=None` cookies plus an explicit CORS origin.
- Participant APIs do not expose the locked engine.
- The admin API is role-protected.
- Production credentials come from environment variables instead of source code.
- Do not commit real production credentials.
- Keep the backend repository private if the confidential event script is stored in `private/engine.json`.

## Event rules implemented

- 10,000 V-Coins starting balance
- 6 fictional companies
- Tick 0–96
- 75 seconds per tick
- 14 headline events
- Next-tick order execution
- 22 trade maximum
- 35% maximum buy size by portfolio
- 60% maximum company concentration
- 0.4% fee
- 7-second cooldown
- Eligibility: at least 6 trades across at least 3 companies
- Final portfolio value at tick 96

## Deployment correction
The frontend no longer defaults to localhost in production. For Netlify + Render, set the `TRADECRAFT_API_BASE` Netlify environment variable to the Render backend URL. For manual Netlify drag-and-drop, edit `public/config.js` and replace `PASTE_YOUR_RENDER_BACKEND_URL_HERE` with the Render URL before uploading the contents of `public/`.
