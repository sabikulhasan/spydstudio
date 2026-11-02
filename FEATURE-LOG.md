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
