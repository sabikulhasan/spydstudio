# SPY-D Studio website plan

Status: v1 built (see §10 for what changed after the Framia reference). Remaining placeholders are listed in §10.
Source of truth for look and voice: *SPY-D Brand Guidelines v1.2* (Orange direction, 2026).

---

## 1. Goals

| # | Goal | How the site serves it | Measure |
|---|------|------------------------|---------|
| 1 | Get enquiries | A contact path on every page: form, email, WhatsApp, booking link | Form submissions and WhatsApp clicks |
| 2 | Show the work | A Work page with embedded YouTube videos, filterable by service | Video plays and time on the Work page |
| 3 | Explain the offer | One page per service: what it is, what you get, how long it takes | Visits from service pages to Contact |
| 4 | Build trust | Process, FAQ and About: "clear scope, honest timelines" | Fewer "how does it work?" emails |

**Audience:** small and growing businesses that need video ads, UGC, a website or marketing, and want someone to understand the brand first.

**Out of scope for v1:** launch offer, blog, prices shown on the site, client login, Bangla version, custom domain.

---

## 2. Sitemap

```
/                      Home
/services/             Services overview
  /services/video-ads/
  /services/ugc-content/
  /services/websites/
  /services/marketing/
  /services/documents-decks/
/work/                 Portfolio (YouTube embeds, filter by service)
/process/              How we work + FAQ
/about/                About SPY-D Studio
/contact/              Form, email, WhatsApp, booking
/thanks/               Shown after the form is sent
/404.html              Not found
```

Twelve pages. Each folder holds an `index.html`, so URLs stay clean (`/work/`, not `/work.html`).

**Header nav (desktop):** Services · Work · Process · About · **Start a project** (orange button → /contact/)
**Header nav (phone):** logo + menu button → full-screen menu with the same links and the button.
**Footer (every page):** emblem, short line, nav links, email, WhatsApp, social links, © year.

---

## 3. Page by page

### 3.1 Home `/`
1. **Hero:** large heavy headline, one sentence of support, two buttons (Start a project / See the work). Uses a cropped emblem graphic on ink, as on guideline page 7.
   - Headline options (voice: direct, no guarantees):
     - "We study your brand before we make the ad."
     - "From insight to execution."
     - "A closer look. A better story."
2. **What we do:** the five services as rows (same layout as guideline page 2), each linking to its page.
3. **Featured work:** 3 YouTube videos (lazy-loaded), link to /work/.
4. **How we work:** 4 steps (Observe → Understand → Create → Deliver), link to /process/.
5. **Why SPY-D:** three short points from the brand promise (clear scope, honest timelines, reasoning explained).
6. **Brand moment:** ink panel with "See more. Create better." It appears only here, as the guide says.
7. **Call to action strip:** "Tell us about the project." + contact buttons.

### 3.2 Services overview `/services/`
Short intro, then 5 cards: name, one line, typical deliverables, link to the detail page.

### 3.3 Service detail (×5), all on one template
- Headline and one paragraph saying what it is and who it is for
- **What you get:** a concrete deliverables list (formats, lengths, ratios)
- **How it runs:** steps and a typical timeline ("first cut in X working days")
- **Related work:** 2–3 videos filtered to this service, or "work coming soon"
- **FAQ:** 3–5 questions
- Call to action: "Start a [service] project" → `/contact/?service=video-ads`, with the service already selected in the form

| Service | Starter deliverable list (to confirm) |
|---|---|
| Video Ads | Scripted promos, product demos, ad edits; 9:16 / 1:1 / 16:9 cut-downs |
| UGC Content | Creator-style clips for paid and organic feeds, hooks and variations |
| Websites | Landing pages and small business sites, mobile-first, handover included |
| Marketing | Campaign planning, ad management, performance reporting |
| Documents & Decks | Company profiles, proposals, presentations |

### 3.4 Work `/work/`
- Filter chips: All · Video Ads · UGC · Websites · Marketing · Decks
- Grid of cards: thumbnail, title, client or "Concept work", service tag, format (e.g. 9:16 · 30s)
- Selecting a card opens a lightbox with the YouTube player. On phone the player is full width.
- The list comes from one data file, `assets/data/work.json`. Adding a video means adding one entry:
  ```json
  {
    "id": "dQw4w9WgXcQ",
    "title": "Product launch ad",
    "client": "Client name",
    "service": "video-ads",
    "format": "9:16 · 30s",
    "concept": false,
    "featured": true
  }
  ```
- Rule from the guide: concept or self-initiated work gets a **"Concept"** label.
- The page works before any videos exist: it shows a "Portfolio coming soon" state and a contact call to action.

### 3.5 Process `/process/`
- 4–5 steps, each with what happens, what we need from you and how long it takes
- What is included and what is not; how revisions work
- FAQ: how payment works, turnaround, ownership and usage rights, revisions, working remotely

### 3.6 About `/about/`
Positioning, promise and personality (page 2 of the guide in plain words), "Observe. Understand. Create.", and optionally a team or founder note and photo.

### 3.7 Contact `/contact/`
Four ways in, side by side on desktop and stacked on phone:

| Channel | Implementation |
|---|---|
| **Form** | Name, email, WhatsApp/phone (optional), company, service (select), budget range (optional), timeline, message, honeypot field against spam. Sent through **Formspree** or **Web3Forms** (free tier, works on GitHub Pages because no server is needed). Redirects to `/thanks/`. |
| **Email** | `mailto:` link + copy button |
| **WhatsApp** | `https://wa.me/880XXXXXXXXXX?text=Hi%20SPY-D%20Studio...` with a pre-filled message. A floating WhatsApp button on phone screens on every page. |
| **Booking** | **Cal.com** or **Calendly** link for a free 20–30 min call (opens in a new tab; no heavy embed) |

Promise under the form, in the brand voice: "We reply within one working day." Only if that is true.

---

## 4. Design system (from the guidelines)

### 4.1 Colour tokens
```css
:root {
  --vermilion: #FF4B00;  /* accents, CTAs, hatband. Never body text */
  --ink:       #0B0B0B;  /* logo, headings, primary text */
  --ivory:     #FFF7EC;  /* page background */
  --slate:     #6B7280;  /* secondary text, captions */
  --rule:      #DCD6CE;  /* 12% ink tint: rules, borders */
  --on-ink-2:  #A8A29A;  /* secondary text on ink */
  --white:     #FFFFFF;
}
```
- Balance: about 70% light / 20% ink / 10% orange. One orange accent per section.
- Text on orange is **ink**, not white (white on orange is 3.4:1 and fails WCAG AA). Primary buttons are orange with ink text.
- Orange text only at 24 px and above.

### 4.2 Typography
- Avenir Next is not licensed for web, so use **Nunito Sans** (Google Fonts, self-hosted woff2), then `system-ui`, then `sans-serif`.
- Weights: 900 (Heavy stand-in), 600 (Demi), 500 (Medium), 400 (Regular).

| Role | Desktop | Phone | Weight |
|---|---|---|---|
| Display | 64/70 | 40/44 | 900 |
| H1 | 48/54 | 34/40 | 900 |
| H2 | 32/40 | 26/32 | 600 |
| H3 | 24/32 | 20/28 | 600 |
| Body | 18/28 | 16/26 | 400 |
| Caption / label | 14/20 | 13/18 | 500, spaced capitals for short labels only |

Sizes scale fluidly with `clamp()`. Body lines are 45–75 characters, left-aligned and in sentence case.

### 4.3 Layout and spacing
- 8 px base: spacing scale 8 / 16 / 24 / 32 / 48 / 64 (+ 96 / 128 for sections)
- Max content width 1200 px; gutters 16 px (phone), 24 px (tablet), 32 px (desktop)
- Breakpoints: 600, 900, 1200 px, built mobile-first
- Ivory sections by default; ink sections for hero and brand moments

### 4.4 Graphic language
- **Angled accent bar** at 7°: section breaks, tags, under headings
- **Cropped emblem** as decoration on ink panels, with the full logo still visible elsewhere on the page
- **Watermark** emblem at 5% opacity, lower right, in selected sections
- **Motion:** subtle fade or slide on scroll, one accent move per section, all off when the visitor has `prefers-reduced-motion` set

### 4.5 Logo usage on the site
| Place | Version |
|---|---|
| Header (ivory) | Horizontal, primary |
| Ink hero / footer | Horizontal reverse, or emblem reverse |
| Favicon / app icon | Emblem |
| Social share image (Open Graph) | Alternate "D in vermilion" + headline on ink |

Clear space is 30% of the emblem height. Minimum size is 110 px wide for horizontal and 32 px tall for the emblem.

---

## 5. Logo files: what we have and what is needed

| File received | Notes |
|---|---|
| `spyd-horizontal-alt-d.svg` | Clean, small (4 KB). **Wordmark is live text** in `AvenirNext-Heavy`, so it shows in the wrong font on Windows, Android and Linux. |
| `spyd-horizontal-mono.svg` | Same live-text problem. |
| `spyd-emblem.svg` / `-reverse` / `-mono` | Illustrator export, about 505 KB each, on a 1920×1080 artboard. The reverse version includes a black background rectangle. Colours are `#FC5101` / `#050404`, slightly off the brand hex. |

**Needed before build:**
1. **Outlined** (text converted to paths) versions of: `spyd-horizontal.svg` (primary), `-reverse`, `-mono`, `-alt-d`. In Illustrator: *Type → Create Outlines*, then export.
2. Ideally `spyd-stacked.svg` (+ reverse).
3. Approval for the optimisation step for the web. It **changes no artwork:** crop the artboard to the logo bounds, remove the background rectangle, round coordinates, set fills to the brand hex values, and run SVGO. Each emblem should go from about 505 KB to about 5 KB.

Until the outlined files arrive, the build can use the clean emblem paths already inside the horizontal SVGs.

---

## 6. Technical plan

### 6.1 Stack
- **Plain HTML + CSS + a little vanilla JavaScript.** No framework and no build step, so GitHub Pages serves it directly and anyone can edit it.
- Shared header and footer are kept consistent by a tiny `partials` approach: copied into each page and checked by a small script. A move to a static site generator such as Eleventy can come later if the site grows.
- Hosting: **GitHub Pages** from the `main` branch (root). Free HTTPS at `sabikulhasan.github.io/spydstudio/`.
  - All links are **relative**, so the site works both under `/spydstudio/` now and on a custom domain later.

### 6.2 File structure
```
/
├── index.html
├── services/
│   ├── index.html
│   ├── video-ads/index.html
│   ├── ugc-content/index.html
│   ├── websites/index.html
│   ├── marketing/index.html
│   └── documents-decks/index.html
├── work/index.html
├── process/index.html
├── about/index.html
├── contact/index.html
├── thanks/index.html
├── 404.html
├── assets/
│   ├── css/
│   │   ├── tokens.css      colours, type scale, spacing
│   │   ├── base.css        reset, typography, layout
│   │   ├── components.css  header, buttons, cards, forms, video, footer
│   │   └── pages.css       page-specific sections
│   ├── js/
│   │   ├── nav.js          mobile menu, active link
│   │   ├── work.js         loads work.json, filters, lightbox
│   │   ├── video.js        lite YouTube embed (click to load)
│   │   └── contact.js      form validation, ?service= preselect
│   ├── data/work.json      portfolio entries
│   ├── fonts/              Nunito Sans woff2 (self-hosted)
│   ├── logo/               optimised SVG logos
│   └── img/                favicons, OG image, photos (WebP/AVIF)
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── PLAN.md
└── README.md               how to edit content and add videos
```

### 6.3 Phone and desktop
- Built mobile-first; tested at 360, 390, 768, 1024, 1440 px
- Tap targets at least 44 px, thumb-reachable menu button, floating WhatsApp button (phone only)
- Fluid type with `clamp()`, no horizontal scroll, images with `srcset` and correct `sizes`
- Videos are 16:9 or 9:16 responsive frames (`aspect-ratio`), since UGC is usually vertical

### 6.4 Performance
- **Lite YouTube embeds:** show the thumbnail image and load the real player only on click. This saves about 500 KB to 1 MB per video and keeps the Work page fast on mobile data.
- Use `youtube-nocookie.com` for privacy
- Self-hosted fonts with `font-display: swap`, preload the 2 weights used above the fold
- Inline the critical CSS for the header and hero; defer all JS
- Targets: Lighthouse at least 95 for Performance, Accessibility, Best Practices and SEO on mobile; page weight under 300 KB before video

### 6.5 Accessibility
- WCAG 2.2 AA: contrast pairs from the guide (ink/ivory 18.5:1, ink/orange 5.9:1, slate/ivory 4.6:1)
- Semantic landmarks, skip link, visible focus ring, labelled form fields with inline error messages
- Keyboard-operable menu, filters and lightbox (Esc closes it, focus is trapped and then returned)
- `alt` text for images; titles on video iframes

### 6.6 SEO and sharing
- A unique `<title>` and meta description on each page
- Open Graph and Twitter card image (1200×630) built from the brand system
- `sitemap.xml`, `robots.txt`, canonical URLs
- JSON-LD `Organization` / `ProfessionalService` schema with contact details and social profiles

### 6.7 Third-party services (all free tiers)
| Need | Service | Setup needed from you |
|---|---|---|
| Contact form | Formspree or Web3Forms | Create an account and give me the form endpoint or access key |
| Booking | Cal.com or Calendly | Booking page URL |
| Video | YouTube | Video IDs or links (unlisted is fine) |
| Analytics (optional) | GoatCounter or Plausible: no cookies, no banner | Account, if wanted |

---

## 7. Build phases

| Phase | Deliverable | Review point |
|---|---|---|
| **0. Setup** | Folder structure, tokens, fonts, optimised logos, GitHub Pages on | You see a blank branded page live |
| **1. Shell** | Header, mobile menu, footer, buttons, type styles, 404 | Check on your phone and PC |
| **2. Home** | Full home page with placeholder video slots | Copy and visual review |
| **3. Services** | Overview + 5 detail pages on one template | Deliverables and timelines review |
| **4. Work** | `work.json`, filter, lite embeds, lightbox, empty state | Add your first real YouTube links |
| **5. Contact** | Form + Formspree, WhatsApp, email, booking, thanks page | Send a test enquiry |
| **6. Process + About** | Both pages + FAQ | Copy review |
| **7. Polish** | SEO, OG images, sitemap, accessibility and Lighthouse pass, cross-device test | Launch |

Each phase lands as its own commit or PR so you can review it on the live preview.

---

## 8. What I need from you

**Before Phase 0**
1. Outlined horizontal logo SVGs (primary, reverse, mono, alt-d) and stacked if available. See §5.
2. OK to optimise the emblem SVGs for web (crop, remove background, brand hex, compress).

**Before Phase 5 (contact)**
3. Business email to show (letterhead appears to read `work.spyystudio@gmail.com`; please confirm the exact address).
4. WhatsApp number in international format (letterhead appears to read `+880 1611 049489`; please confirm).
5. Booking page link (Cal.com or Calendly), or I can leave a placeholder.
6. Form service choice (Formspree or Web3Forms) and its endpoint or key.
7. Social profile links (Facebook, Instagram, TikTok, LinkedIn, YouTube, as applicable).

**Before Phase 3 and 6 (copy)**
8. For each service: typical deliverables and turnaround. Starting prices are optional and stay hidden in v1.
9. About: founder or team names and photos, location (city), year started. All optional.

**Before Phase 4**
10. YouTube links with title, client (or "concept"), service and format for each.

---

## 9. Open decisions

| Decision | Default if you don't choose |
|---|---|
| Hero headline | "We study your brand before we make the ad." |
| Show a budget field on the form? | Yes, optional, in ranges |
| Show prices? | No (v1) |
| Analytics | GoatCounter (privacy-friendly, free) |
| Floating WhatsApp button | Phone only |

---

## 10. Revision: Framia direction (7 Oct 2026)

Decisions from the owner:

| Question | Decision |
|---|---|
| Colour direction | Mostly ivory, as in the brand guide. Ink is used for the services showcase, the closing call to action and the footer. Vermilion replaces Framia's lime. |
| Hero media | Branded placeholder tiles labelled SAMPLE until real stills or YouTube thumbnails exist |
| Home sections | Core set: zooming hero gallery, pinned services showcase with a workflow finale, two alternating feature rows, closing call to action, FAQ, footer |
| Pages | Framia-style homepage plus simpler inner pages |
| Contact | work.spystudio@gmail.com (spelling taken from the guideline PDF's text layer), WhatsApp +880 1611 049489, facebook.com/spydstudio |
| Service details | Scoped per client in a meeting, so there are no fixed deliverable lists, timelines or prices on the site |

Changes from §1–9:
- **Typography:** the brand font stack (Avenir Next, then Nunito Sans) is kept instead of Framia's Archivo Narrow, because the brand guide takes precedence.
- **Hero:** a centre-out scale gallery. Wheel input over it zooms the cards outward while the page stays still, and normal scrolling resumes once the cycle completes. Drag and arrow keys also work. The desktop inquiry box hands the typed brief to the contact form.
- **Showcase:** pinned for about 5.6 viewport heights on desktop. The five services advance in turn, then an ivory dotted "From brief to delivery" diagram fades in. On phones and with reduced motion it is not pinned; buttons switch between services.
- **Contact form:** without a form service, it opens WhatsApp or the email app with the message filled in. Formspree or Web3Forms can be switched on later through `formEndpoint`.
- **Build:** `tools/build.py` turns `src/` into static pages, so the header and footer live in one place.

Still placeholder or missing:
1. **Outlined logo files.** The wordmark is live text taken from the supplied SVGs; it renders in Avenir Next on Apple devices and in Nunito Sans elsewhere. Outlined `spyd-horizontal*.svg` files would fix that.
2. Hero and showcase images are SAMPLE placeholders.
3. `work.json` is empty, so the Work page shows a "Portfolio coming soon" state.
4. No booking link. The booking card appears automatically when `bookingUrl` is set.
5. No form service. Messages go through WhatsApp or email.
6. Real phone testing (touch gestures on the hero gallery) is still to do.
