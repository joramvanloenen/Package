# Package

**Small things. Somewhere.** A shared, public warehouse where visitors leave a parcel for someone else to find.

## Features

- Isometric warehouse, touch dragging, pinch/scroll zoom, and coordinate navigation.
- 240 × 240 aisles/bays, four shelf levels, and **168,000 usable package spaces**. Walkways stay clear.
- Colored wrapping and a custom label. Drag, rotate, and remove stamps, text, stickers, and your own 32 × 32 sticker drawings.
- Messages up to 1,400 characters.
- Optional **128 × 128 black-and-white Polaroid**, drawn with ink/eraser or converted from a camera capture/image upload. Threshold control and Floyd–Steinberg dithering.
- Public package reading, accessible list navigation, and coordinate-based share links.
- Local draft recovery. Shared packages are stored in a hosted Cloudflare D1 database, not localStorage.
- Atomic placement collision protection, server validation, payload-bound proof of work, and 12 writes per IP per hour.

## Frontend

Buildless: `index.html`, `style.css`, `app.js`, and `core.js`. Serve from the root of **`main`** with GitHub Pages. `.nojekyll` prevents Jekyll processing.

Expected website: https://joramvanloenen.github.io/Package/

In GitHub **Settings → Pages**, choose **Deploy from a branch → main → / (root) → Save**.

Run source checks with Node 24:

```sh
npm run check
```

The tests cover pixel serialization, photo conversion, aisle capacity, isometric picking, and the packing/placement flow using a mocked DOM. They do not replace device/browser camera or layout testing.

## Shared service

The API is deployed at:

`https://package-warehouse-api.ijsco123.chatgpt.site/api/packages`

The hosted service and D1 resource were provisioned through Sites. No paid third-party database plan or payment details were configured. The host's platform availability and usage policies apply; this is not a promise of unlimited free hosting.

- `GET ?x=0&y=0&w=60&h=60&level=0`: public parcel summaries and total count. Max 60 × 60 query region.
- `GET ?id=<uuid>`: complete package, including message, packed photo, and decorations.
- `POST {package, proof}`: store a package. Only one package can occupy `(x,y,level)`.
- `OPTIONS`: CORS preflight. Allowed frontend origin: `https://joramvanloenen.github.io`.

`photo` uses 4,096 hex characters (one bit per pixel); handmade sticker images use 256 hex characters. Images are never uploaded at full resolution.

Backend sources, schema migrations, and Sites build integration are in `backend/`. Production source also has its own Sites Git repository. Its local execution state and credentials are deliberately omitted.

To work on the backend separately, enter `backend/`, install with pnpm 11.25 (`pnpm install --no-frozen-lockfile`), and run `pnpm build`. D1 bindings and production migrations are managed by Sites. Keep the existing `.openai/hosting.json` project ID when updating this deployment. Applying local migrations does not update production. The platform source workflow must sync the changed backend before publishing a new version.

## First-edition boundaries

Everything placed is public. There are no accounts, private messages, package deletion, or moderation dashboard yet. Do not put personal information in packages. Read requests never expose IP hashes. Rate limits and proof of work reduce casual spam, but are not comprehensive abuse prevention.

Parcels are permanent in this version. A clearly authored welcome parcel at aisle 013 / bay 013 / shelf 1 introduces the archive.
