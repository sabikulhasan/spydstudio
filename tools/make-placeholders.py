"""Generate the branded sample artwork used until real portfolio media exists.

Run from the repository root:  python3 tools/make-placeholders.py
Writes SVG files to assets/img/placeholders/. Every file is labelled SAMPLE so
it is never mistaken for client work. Replace them by pointing the media
entries in src/site.json at real images.
"""
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "img" / "placeholders"
INK, IVORY, ORANGE, SLATE, RULE, WHITE = "#0B0B0B", "#FFF7EC", "#FF4B00", "#6B7280", "#DCD6CE", "#FFFFFF"

emblem = (ROOT / "assets" / "logo" / "spyd-emblem.svg").read_text()
HAT, BAND = re.findall(r' d="([^"]+)"', emblem)


def hat(x, y, scale, fill, band=None, rotate=0):
    band_path = f'<path fill="{band}" fill-rule="evenodd" d="{BAND}"/>' if band else ""
    return (f'<g transform="translate({x} {y}) rotate({rotate}) scale({scale})">'
            f'<path fill="{fill}" fill-rule="evenodd" d="{HAT}"/>{band_path}</g>')


def bar(cx, cy, length, thick, fill, opacity=1):
    # The 7 degree accent bar from the brand guide (the hatband angle).
    return (f'<rect x="{cx - length / 2}" y="{cy - thick / 2}" width="{length}" height="{thick}" '
            f'fill="{fill}" opacity="{opacity}" transform="rotate(-7 {cx} {cy})"/>')


def label(text, w, h, fill):
    return (f'<text x="40" y="{h - 40}" fill="{fill}" font-family="Nunito Sans, Avenir Next, sans-serif" '
            f'font-size="22" font-weight="600" letter-spacing="4">SAMPLE · {text.upper()}</text>')


def phone(x, y, w, h, frame, screen, accent):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{w * .12}" fill="{frame}"/>'
            f'<rect x="{x + w * .06}" y="{y + w * .06}" width="{w * .88}" height="{h - w * .12}" rx="{w * .08}" fill="{screen}"/>'
            # A creator-style frame: subject and on-screen caption bars. No play symbol, since
            # the artwork is not a playable video.
            f'<circle cx="{x + w / 2}" cy="{y + h * .36}" r="{w * .2}" fill="{accent}"/>'
            f'<rect x="{x + w * .2}" y="{y + h * .7}" width="{w * .6}" height="{h * .045}" rx="{h * .02}" fill="{accent}"/>'
            f'<rect x="{x + w * .28}" y="{y + h * .78}" width="{w * .44}" height="{h * .045}" rx="{h * .02}" fill="{accent}" opacity=".6"/>')


def card(i, motif, bg, fg, accent, tag):
    w, h = 600, 800
    body = [f'<rect width="{w}" height="{h}" fill="{bg}"/>']
    if motif == "crop":
        body.append(hat(-120, 120, 2.6, fg, accent, -4))
    elif motif == "glasses":
        body.append(hat(-40, 120, 2.1, fg, accent))
        body.append(bar(300, 690, 700, 26, accent))
    elif motif == "bars":
        for k in range(6):
            body.append(bar(300, 140 + k * 105, 760, 34 if k % 2 else 14, accent if k == 2 else fg, 1 if k == 2 else .85))
    elif motif == "phone":
        body.append(phone(170, 120, 260, 520, fg, bg if bg != fg else IVORY, accent))
        body.append(bar(300, 700, 640, 18, accent))
    elif motif == "grid":
        for r in range(3):
            for c in range(2):
                fill = accent if (r, c) == (1, 0) else fg
                body.append(f'<rect x="{70 + c * 240}" y="{90 + r * 200}" width="220" height="180" rx="14" fill="{fill}" opacity="{1 if fill == accent else .9}"/>')
    elif motif == "deck":
        for k in range(3):
            body.append(f'<rect x="{90 + k * 30}" y="{160 + k * 40}" width="380" height="250" rx="14" fill="{fg}" opacity="{.35 + k * .3}"/>')
        body.append(bar(300, 600, 300, 22, accent))
        body.append(f'<rect x="120" y="640" width="260" height="14" rx="7" fill="{fg}" opacity=".5"/>')
    body.append(label(tag, w, h, fg if motif != "bars" else SLATE))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">{"".join(body)}</svg>\n'


CARDS = [
    ("crop", INK, WHITE, ORANGE, "Video ads"),
    ("phone", ORANGE, INK, IVORY, "UGC content"),
    ("bars", RULE, INK, ORANGE, "Campaigns"),
    ("grid", INK, "#2A2A2A", ORANGE, "Websites"),
    ("glasses", ORANGE, INK, WHITE, "Brand study"),
    ("deck", RULE, INK, ORANGE, "Decks"),
    ("phone", INK, "#2A2A2A", ORANGE, "Product demos"),
    ("crop", RULE, INK, ORANGE, "Ad edits"),
    ("bars", INK, WHITE, ORANGE, "Marketing"),
    ("glasses", INK, WHITE, ORANGE, "Research"),
    ("grid", RULE, IVORY, ORANGE, "Landing pages"),
    ("deck", INK, WHITE, ORANGE, "Proposals"),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for i, (motif, bg, fg, accent, tag) in enumerate(CARDS, 1):
        (OUT / f"card-{i:02d}.svg").write_text(card(i, motif, bg, fg, accent, tag))
    print(f"wrote {len(CARDS)} cards to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
