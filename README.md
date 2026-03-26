# Steam Capsule Compare

Compare your game's capsule images and marketing assets side-by-side with similar games on the Steam store.

**[Live Demo](https://astro75.github.io/steam-capsule-compare/)**

![Screenshot](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/header.jpg)

## What it does

Search for any Steam game by name or App ID, and the tool automatically finds "More Like This" similar games and displays all their store assets in one view for easy comparison.

### Compared assets

- **Header Capsule** (460×215) — main store page image
- **Small Capsule** (231×87) — search results and wishlists
- **Library Capsule** (600×900) — vertical Steam library art
- **Screenshots** — first 6 screenshots per game

Your game is highlighted with a blue border so it stands out among competitors.

## Features

- Search by game name, App ID, or Steam store URL
- Automatically fetches similar games via Steam's "More Like This"
- Side-by-side comparison across multiple asset types
- Click any image to view full-size in a lightbox
- Fully static — no server required, runs entirely in the browser

## How it works

- Uses the [Steam Store API](https://store.steampowered.com/api/appdetails) for game details and search
- Parses Steam's "More Like This" recommendations page for similar games
- Images load directly from Steam's CDN
- API calls go through [corsproxy.io](https://corsproxy.io) to handle CORS

## Running locally

Just open `index.html` in a browser, or serve it with any static file server:

```bash
npx serve .
```

## License

MIT
