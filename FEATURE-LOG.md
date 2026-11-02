# Feature log

Ten improvement rounds, each run as **create → see → update**: build one feature, look at it in a real
browser (desktop 1280px and phone 390px screenshots), then fix what looked wrong.
Each round starts with a fresh web search for inspiration.

The "Not done" list exists so later rounds don't re-propose the same ideas.

## Done

| # | Feature | Inspiration | What changed after "see" |
|---|---------|-------------|--------------------------|
| 1 | **Page transitions** (cross-document View Transitions): header stays still, page body fades and rises between pages. Pure CSS, ignored by browsers without support, off with reduced motion or "Pause motion". | 2026 trend round-ups: micro-interactions and app-like smoothness, but performance-first ([growthfolks](https://growthfolks.io/tech/website-design-for-video-production-agencies/), [elcom](https://www.elcom.com.au/resources/blog/website-design-trends-in-2026)) | Mid-transition screenshot showed the nav underline cross-fading nicely; pinned the WhatsApp button so it doesn't flash on phones, and shortened the header group. |
| 2 | **Quick-brief chips on the contact form**: tap answers for goal, platforms and what you already have; they're added to the WhatsApp/email draft (and posted to the form service when one is set). Platforms only show for feed-based services. | Agency intake forms that tailor questions per project type instead of one blank box ([ClickUp brief guide](https://consultevo.com/clickup-agency-brief-how-to-guide/), [Paperform agency intake](https://paperform.co/templates/agency-creative-project-brief-intake-form/)) | Phone screenshot showed three groups eating ~700px and a repeated "(optional, tap any)": merged into one intro line, shortened labels. Made "Starting from scratch"/"Not sure yet" exclusive, and the message box optional once chips are picked. |
| 3 | **"One idea, made for every feed" format preview** (Video Ads page): switch 9:16 / 4:5 / 1:1 / 16:9; the frame reshapes, the headline and button move per shape, "Runs on" names the placements, and a toggle shows where app UI covers a vertical video. Uses the existing stock poster, labelled as illustration. | Platform specs (Google, Meta, TikTok) and the "compose each ratio, don't crop one master" advice ([Google Ads](https://support.google.com/google-ads/answer/9128498?hl=en), [Marpipe 9x16](https://www.marpipe.com/ad-glossary/9x16-aspect-ratio)); no agency site found doing this, so it differentiates. | Button sat on the caption zone (percentage padding follows width, so switched to `inset`); controls moved below the frame on phones and the stage got a fixed height so taps never move the page; safe-zone toggle now jumps to 9:16; fixed an awkward 1:1 headline break. |
| 4 | **Hook switcher** (UGC page): one phone-framed clip, four openings (problem / result / question / contrarian). Tapping swaps the feed-style caption and explains what that hook does; a Hook / Body / Ask timeline shows that only the first seconds change. | UGC testing guides: 3–5 hooks per brief, one body, change one variable at a time ([Cometly](https://www.cometly.com/post/ugc-ads), [Pixis hook library](https://pixis.ai/blog/ugc-in-2026-whats-working-whats-stale-and-how-to-refresh-your-hook-library/), [AI Advantage](https://aiadvantageagency.com/ugc-testing-framework-for-ecommerce/)) | Plain ink caption was unreadable over hands and robe → white per-line caption boxes like real feeds; timeline labels truncated on phones → "Hook / Body / Ask"; phone moved above the buttons on small screens so the change is visible while tapping. |
| 5 | **Sample written plan** (Process page, `#sample-plan`): a document-style preview of what a client approves before production (goal, audience, message, deliverables by format, review points, revisions, usage, not included), with margin notes on why each part exists. Linked from step 03 and from the home page process section. | Trust guides for new agencies without testimonials: "talk about the process, rather than the person", show clarity instead of claims ([Sendible](https://www.sendible.com/insights/how-to-build-credibility-as-an-agency), [Nusii](https://nusii.com/blog/5-tips-creating-trustworthy-website-converts-new-clients/)) | Review steps wrapped with dangling arrows on phones → stacked list; removed "Raw footage on request" (a commitment the owner never made); added links in, since nothing pointed to it. |


## Not done (and why)

| Idea | Why not |
|------|---------|
| Client logos / testimonials / case-study numbers | Would be invented. The site rule is never to show unevidenced claims; `work.json` is empty until the owner supplies real cases. |
| Public price list or calculator | Owner decision (PLAN §10): every project is scoped in a meeting, no prices on the site. |
| Bangla version | Out of scope for v1 (PLAN §1) and needs owner-approved translations. |
| Analytics (GoatCounter/Plausible) | Needs the owner's account; nothing to plug in yet. |
| Booking embed / form service | Needs `bookingUrl` / `formEndpoint` from the owner; the site already switches them on when set. |
| Custom cursor | Most visitors are on phones (no cursor); on desktop it hurts usability and accessibility for little gain. |
| Full-screen background video hero | The hero is the approved zoom gallery (PLAN §10); a heavy autoplay video would also hurt mobile data users. |
| Multi-step "wizard" contact form | Vendor conversion claims (e.g. "700% higher") are unverified, and splitting six fields into steps adds taps for phone users. Chips on one page (round 2) get the guided feel without the extra steps. |
| Team / founder section with photos | Strong trust signal per round-5 research, but needs the owner's names, photos and consent (PLAN §8 item 9). |
| Free trial / pay-per-result offer | A pricing and business decision for the owner, not a website feature. |
| Blog / insights section | Needs a steady stream of owner-written content; an empty or AI-filled blog hurts trust more than it helps. Out of scope in PLAN §1. |
