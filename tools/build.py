"""Build the static site from src/ into the repository root.

Run from anywhere:  python3 tools/build.py

- src/site.json         contact details, links and navigation (edit this first)
- src/partials/*.html   shared head, header and footer
- src/pages/**.html     one file per page; the first line is a meta comment:
                        <!--meta {"title": "...", "description": "...", "css": ["home"], "js": ["hero"]} -->

src/pages/about.html becomes about/index.html, src/pages/services/websites.html
becomes services/websites/index.html, and index.html / 404.html stay where
they are. Output files are committed so GitHub Pages can serve them as-is.
Tokens such as {{root}}, {{email}} or {{whatsappUrl}} are replaced in every file.

Project cards come from assets/data/work.json. Only items with "publish": true and
"rightsConfirmed": true that pass validation are rendered, into {{featuredWork}} (home),
{{allWork}} (work page) and {{serviceWork_video_ads}} etc. (service pages). Refused
items are listed as warnings. assets/js/work.js only adds filters and playback.
"""
import html
import json
import re
from pathlib import Path
from urllib.parse import quote, urlparse

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
META = re.compile(r"^<!--meta (\{.*?\}) -->\n", re.S)


def load_site():
    site = json.loads((SRC / "site.json").read_text())
    site["whatsappUrl"] = f"https://wa.me/{site['whatsapp']}?text={quote(site['whatsappMessage'])}"
    site["mailtoUrl"] = f"mailto:{site['email']}"
    return site


def output_path(page: Path) -> Path:
    rel = page.relative_to(SRC / "pages")
    if rel.name in ("index.html", "404.html") and rel.parent == Path("."):
        return ROOT / rel
    if rel.name == "index.html":
        return ROOT / rel.parent / "index.html"
    return ROOT / rel.with_suffix("") / "index.html"


def nav_links(site, root, section, cls):
    items = []
    for item in site["nav"]:
        current = ' aria-current="page"' if item["section"] == section else ""
        items.append(f'<a class="{cls}" href="{root}{item["href"]}"{current}>{item["label"]}</a>')
    return "\n".join(items)


# ---------- Project data ----------

SERVICE_NAMES = {}
MEDIA_TYPES = ("image", "youtube", "video")
YOUTUBE_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
CONCEPT_NOTICE = "Self-initiated concept — not commissioned by the featured brand."


def esc(value):
    return html.escape(str(value), quote=True)


def media_ok(path):
    """A local media path must exist; a remote one must be https."""
    if not path:
        return False
    if path.startswith("https://"):
        return bool(urlparse(path).netloc)
    if "://" in path or path.startswith(("/", "data:", "javascript:")) or ".." in path:
        return False
    return (ROOT / path).is_file()


def check_item(item):
    """Return a list of problems; an empty list means the item may be published."""
    problems = []
    for key in ("slug", "title", "service", "brief", "contribution"):
        if not str(item.get(key) or "").strip():
            problems.append(f"missing {key}")
    if any("OWNER_SUPPLIED" in str(v) for v in item.values()):
        problems.append("contains OWNER_SUPPLIED placeholder text")
    if item.get("service") not in SERVICE_NAMES:
        problems.append(f"unknown service {item.get('service')!r}")
    kind = item.get("mediaType") or ("youtube" if item.get("id") else None)
    if kind not in MEDIA_TYPES:
        problems.append(f"mediaType must be one of {', '.join(MEDIA_TYPES)}")
    if kind == "youtube" and not YOUTUBE_ID.match(str(item.get("id") or "")):
        problems.append("youtube item needs a valid 11-character id")
    if kind == "video" and not media_ok(item.get("videoSrc")):
        problems.append("video item needs an existing videoSrc file or https URL")
    if kind in ("image", "video") and not media_ok(item.get("poster")):
        problems.append("missing or broken poster")
    if item.get("poster") and not media_ok(item["poster"]):
        problems.append("poster file not found")
    if item.get("poster") and not str(item.get("posterAlt") or "").strip():
        problems.append("poster needs posterAlt")
    if item.get("viewUrl") and not str(item["viewUrl"]).startswith("https://"):
        problems.append("viewUrl must be an https URL")
    if item.get("client") is None and not item.get("concept"):
        problems.append("set client, or concept: true")
    return problems


def load_work():
    data = json.loads((ROOT / "assets" / "data" / "work.json").read_text())
    published = []
    for n, item in enumerate(data.get("items", []), 1):
        label = item.get("slug") or item.get("title") or f"item {n}"
        if not item.get("publish") or not item.get("rightsConfirmed"):
            print(f"work.json: {label}: not shown (needs publish and rightsConfirmed true)")
            continue
        problems = check_item(item)
        if problems:
            print(f"work.json: {label}: not shown: {'; '.join(problems)}")
            continue
        item.setdefault("mediaType", "youtube" if item.get("id") else "image")
        published.append(item)
    return published


def work_card(item, root, heading="h3"):
    kind = item["mediaType"]
    title = esc(item["title"])
    vertical = bool(item.get("vertical"))
    if item.get("poster"):
        src = item["poster"] if item["poster"].startswith("https://") else root + item["poster"]
        w, h = item.get("posterWidth") or (720 if vertical else 1280), item.get("posterHeight") or (1280 if vertical else 800)
        srcset = ""
        if item.get("posterSrcset"):
            srcset = ' srcset="' + esc(", ".join(f"{root}{s} {int(width)}w" for s, width in item["posterSrcset"])) + '"' \
                     ' sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw"'
        img = (f'<img src="{esc(src)}"{srcset} alt="{esc(item["posterAlt"])}" width="{int(w)}" height="{int(h)}" '
               f'loading="lazy" decoding="async" style="object-position:{esc(item.get("focalPoint") or "50% 50%")}">')
    else:  # YouTube without its own poster: the video's thumbnail
        img = (f'<img src="https://i.ytimg.com/vi/{esc(item["id"])}/hqdefault.jpg" alt="{esc(item.get("posterAlt") or "")}" '
               f'width="480" height="360" loading="lazy" decoding="async">')
    play = ""
    if kind == "youtube":
        play = f'<button class="work-play" type="button" data-youtube="{esc(item["id"])}" data-title="{title}" aria-label="Play video: {title}"><span class="work-icon" aria-hidden="true"></span></button>'
    elif kind == "video":
        vsrc = item["videoSrc"] if item["videoSrc"].startswith("https://") else root + item["videoSrc"]
        play = f'<button class="work-play" type="button" data-video="{esc(vsrc)}" data-title="{title}" aria-label="Play video: {title}"><span class="work-icon" aria-hidden="true"></span></button>'
    name = title
    if item.get("viewUrl") and kind == "image":
        name = f'<a href="{esc(item["viewUrl"])}" target="_blank" rel="noopener">{title}</a>'
    tags = [f'<span class="tag">{esc(SERVICE_NAMES[item["service"]])}</span>']
    if item.get("format"):
        tags.append(f'<span class="tag">{esc(item["format"])}</span>')
    tags.append('<span class="tag tag-concept">Concept</span>' if item.get("concept") else '<span class="tag">Client work</span>')
    who = esc(item.get("conceptNotice") or CONCEPT_NOTICE) if item.get("concept") else esc(item.get("client") or "")
    outcome = f'\n    <p><b>Outcome:</b> {esc(item["outcome"])}</p>' if item.get("outcome") else ""
    return f"""<article class="work-card" data-service="{esc(item['service'])}">
  <div class="work-frame{' is-portrait' if vertical else ''}">{img}{play}</div>
  <div class="work-meta">
    <{heading} class="work-title">{name}</{heading}>
    <div class="work-tags">{''.join(tags)}</div>
    <p class="work-who">{who}</p>
    <p><b>Brief:</b> {esc(item['brief'])}</p>
    <p><b>Our role:</b> {esc(item['contribution'])}</p>{outcome}
  </div>
</article>"""


def work_grid(items, root, extra=""):
    return f'<div class="work-grid" data-work{extra}>\n' + "\n".join(work_card(i, root) for i in items) + "\n</div>"


def featured_work(items, root):
    featured = [i for i in items if i.get("featured")][:3] or items[:3]
    if not featured:
        return f"""<div class="work-empty">
      <h2 class="h-section" id="selected-work-title">See examples relevant to your project</h2>
      <p>Our public portfolio is being prepared. Ask us for examples suited to your business.</p>
      <a class="btn btn-primary" href="{root}contact/">Ask for examples <span class="arrow" aria-hidden="true">→</span></a>
    </div>"""
    return (f'<h2 class="h-section" id="selected-work-title">Selected work</h2>\n'
            f'<p class="section-intro muted">A closer look at what we create.</p>\n'
            + work_grid(featured, root)
            + f'\n<a class="text-link" href="{root}work/">See all work <span class="arrow" aria-hidden="true">→</span></a>')


def all_work(items, root, site):
    if not items:
        return f"""<div class="work-empty">
    <h2 class="h-sub">See examples relevant to your project</h2>
    <p>Our public portfolio is being prepared. Ask us for examples suited to your business.</p>
    <div class="btn-row">
      <a class="btn btn-primary" href="{root}contact/">Ask for examples <span class="arrow" aria-hidden="true">→</span></a>
      <a class="btn btn-ghost" href="{esc(site['facebook'])}" target="_blank" rel="noopener">See us on Facebook</a>
    </div>
  </div>"""
    used = [s for s in SERVICE_NAMES if any(i["service"] == s for i in items)]
    buttons = ['<button type="button" data-filter="all" aria-pressed="true">All</button>'] + [
        f'<button type="button" data-filter="{s}" aria-pressed="false">{esc(SERVICE_NAMES[s])}</button>' for s in used]
    filters = ""
    if len(used) > 1:  # Filters only help when there is more than one category; work.js reveals them.
        filters = '<div class="filters" role="group" aria-label="Filter by service" data-work-filters hidden>\n  ' + "\n  ".join(buttons) + "\n</div>\n"
    return filters + work_grid(items, root)


def service_work(items, root, slug):
    mine = [i for i in items if i["service"] == slug][:3]
    if not mine:
        return (f'<p class="muted">We share examples relevant to your project on request.</p>\n'
                f'<a class="text-link" href="{root}contact/?service={slug}">Ask for examples <span class="arrow" aria-hidden="true">→</span></a>')
    return work_grid(mine, root)


def render(text, tokens):
    def sub(match):
        key = match.group(1)
        if key not in tokens:
            raise KeyError(f"unknown token {{{{{key}}}}}")
        return str(tokens[key])
    return re.sub(r"\{\{(\w+)\}\}", sub, text)


def build():
    site = load_site()
    SERVICE_NAMES.update({s["slug"]: s["name"] for s in site["services"]})
    work = load_work()
    partials = {p.stem: p.read_text() for p in (SRC / "partials").glob("*.html")}
    pages = sorted((SRC / "pages").rglob("*.html"))
    urls = []
    for page in pages:
        raw = page.read_text()
        match = META.match(raw)
        if not match:
            raise SystemExit(f"{page}: missing <!--meta {{...}} --> first line")
        meta = json.loads(match.group(1))
        body = raw[match.end():]
        out = output_path(page)
        depth = len(out.relative_to(ROOT).parts) - 1
        is_404 = out.name == "404.html"
        # 404.html is served from any missing URL, so it needs absolute paths.
        root = site["basePath"] if is_404 else "../" * depth
        folder = out.relative_to(ROOT).parent
        canonical = site["siteUrl"] + ("" if folder == Path(".") else folder.as_posix() + "/")
        title = meta["title"]
        tokens = {
            **{k: v for k, v in site.items() if isinstance(v, str)},
            "root": root,
            "title": html.escape(title if title.startswith(site["name"]) else f"{title} · {site['name']}"),
            "description": html.escape(meta["description"]),
            "canonical": canonical,
            "year": "2026",
            "pageClass": meta.get("bodyClass", ""),
            "navDesktop": nav_links(site, root, meta.get("section"), "nav-link"),
            "navMobile": nav_links(site, root, meta.get("section"), "menu-link"),
            "extraCss": "".join(f'<link rel="stylesheet" href="{root}assets/css/{c}.css">\n' for c in meta.get("css", [])),
            "extraJs": "".join(f'<script src="{root}assets/js/{j}.js" defer></script>\n' for j in meta.get("js", [])),
            "noindex": '<meta name="robots" content="noindex">\n' if meta.get("noindex") else "",
            "featuredWork": featured_work(work, root),
            "allWork": all_work(work, root, site),
            **{f"serviceWork_{s.replace('-', '_')}": service_work(work, root, s) for s in SERVICE_NAMES},
        }
        # Partials may use tokens and other partials ({{partial_lockup}}); pages may use both.
        # Two passes resolve one level of nesting; {{content}} is filled in last.
        tokens["content"] = "{{content}}"
        tokens.update({f"partial_{k}": v for k, v in partials.items()})
        for _ in range(2):
            tokens.update({f"partial_{k}": render(v, tokens) for k, v in partials.items()})
        result = render(tokens["partial_layout"], {**tokens, "content": render(body, tokens)})
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(result)
        if not is_404 and not meta.get("noindex"):
            urls.append(canonical)
        print("built", out.relative_to(ROOT))

    config = {k: site[k] for k in ("name", "email", "whatsapp", "whatsappMessage", "facebook", "bookingUrl", "formEndpoint")}
    (ROOT / "assets" / "js" / "config.js").write_text(
        "/* Generated by tools/build.py from src/site.json. Edit src/site.json, not this file. */\n"
        f"window.SPYD = {json.dumps(config, indent=2)};\n")
    sitemap = "".join(f"  <url><loc>{u}</loc></url>\n" for u in urls)
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        f'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{sitemap}</urlset>\n')
    (ROOT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {site['siteUrl']}sitemap.xml\n")


if __name__ == "__main__":
    build()
