# SPY-D Studio website

Static site for SPY-D Studio: plain HTML, CSS and JavaScript, served by GitHub Pages.
Design follows *SPY-D Brand Guidelines v1.2*; layout and motion take their cue from framia.converge.ai.
See [PLAN.md](PLAN.md) for the full plan.

## Editing

Edit files in `src/`, then rebuild:

```sh
python3 tools/build.py
```

The build writes the pages (`index.html`, `services/…/index.html`, `work/index.html` and so on), `sitemap.xml`, `robots.txt` and `assets/js/config.js`. Commit the output too; GitHub Pages serves it as-is.

| To change | Edit |
|---|---|
| Email, WhatsApp, Facebook, booking link, form service | `src/site.json` |
| Page text | `src/pages/*.html` |
| Header, footer, closing call to action | `src/partials/*.html` |
| Colours, fonts, spacing | `assets/css/tokens.css` |
| Home hero gallery images | the `hero-media` list and `hero-collage` images in `src/pages/index.html` (keep both on the same files) |
| Service artwork (home services panel and service pages) | `src/partials/art_*.html` |
| Projects (home, work and service pages) | `assets/data/work.json`, then rebuild |

### Add a project

Add an entry to `items` in `assets/data/work.json` and run `python3 tools/build.py`. The build renders the cards into the pages, so projects are readable without JavaScript; `assets/js/work.js` only adds filters and click-to-play.

```json
{ "slug": "launch-ad", "title": "Product launch ad", "service": "video-ads",
  "client": "Client name", "concept": false,
  "brief": "What the client asked for.", "contribution": "What SPY-D did.",
  "poster": "assets/media/work/launch-ad.webp", "posterAlt": "Describe the image",
  "posterWidth": 1280, "posterHeight": 800,
  "mediaType": "youtube", "id": "YOUTUBE_ID", "format": "9:16 · 30s", "vertical": true,
  "featured": true, "publish": true, "rightsConfirmed": true }
```

An item appears only when `publish` and `rightsConfirmed` are both `true` and its media exists; the build prints why anything was left out. `mediaType` is `image`, `youtube` (needs `id`) or `video` (needs `videoSrc`). For self-initiated work set `"client": null, "concept": true`; the card then says “Self-initiated concept — not commissioned by the featured brand.” Up to three `featured` items show in a Selected work section on the home page, below Creative directions. With no published items, that section is left out and the Work page shows an honest “Ask for examples” panel instead.

### Turn on the contact form

The form currently opens WhatsApp or the visitor's email app with the message filled in. To receive messages directly instead, create a free form at Formspree or Web3Forms, put its URL in `formEndpoint` in `src/site.json`, and rebuild.

### Editorial artwork

`assets/media/editorial/` holds the curated Pexels photos (P01–P06, at 320/640/960px) and silent clips with posters (M01–M02). They are website artwork and service illustrations, not client work: they must never be added to `work.json`. Credits, source pages, checksums and focal points are in `assets/media/media-inventory.json`; the site itself shows only category captions. Each image's focal point is applied as `object-position` (in the HTML and in the hero inventory).

`assets/media/studio/site-home-*.webp` is a screenshot of this site's home page, used as the Websites artwork. Regenerate it when the home page changes.

### Logo

The header and footer use exported PNGs of the approved horizontal lockup (`assets/logo/spyd-horizontal.png` and the one-colour reverse), so the lettering does not depend on the page font.

## Preview locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000/. The 404 page uses absolute `/spydstudio/` paths so it works on GitHub Pages; it looks unstyled on a local server.

## Publish

In the repository settings: Pages → Deploy from a branch → `main`, folder `/ (root)`. The site will then be available at https://sabikulhasan.github.io/spydstudio/.
