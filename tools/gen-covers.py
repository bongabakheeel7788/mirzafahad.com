#!/usr/bin/env python3
"""Generate branded SVG cover images for every English blog post.
Output: src/assets/img/covers/<slug>.svg  (1200x630)
Urdu posts share the English post's slug and therefore its cover.
Run from repo root:  python3 tools/gen-covers.py
"""
import os, re, glob, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS = os.path.join(ROOT, "src", "posts", "en")
OUT = os.path.join(ROOT, "src", "assets", "img", "covers")
os.makedirs(OUT, exist_ok=True)

# stroke icon paths on a 48x48 grid, per category
ICONS = {
    "Family": '<path d="M8 22 24 8l16 14v16a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z"/><path d="M24 40v-8a4 4 0 0 1 8 0v8" opacity=".6"/><path d="M17 26c0-2 1.6-3.5 3.5-3.5S24 24 24 26c0-2 1.6-3.5 3.5-3.5S31 24 31 26c0 3.5-7 7.5-7 7.5s-7-4-7-7.5z" transform="translate(0,-9) scale(.62) translate(14,10)"/>',
    "Inheritance": '<path d="M24 6v10M24 16l-12 5v3h24v-3z"/><path d="M9 24v12M39 24v12M17 24v12M31 24v12" opacity=".7"/><path d="M6 40h36"/><path d="M6 44h36" opacity=".4"/>',
    "Civil & Property": '<path d="M6 42h36"/><path d="M10 42V20l14-11 14 11v22"/><rect x="20" y="30" width="8" height="12"/><path d="M15 24h4M29 24h4" opacity=".7"/>',
    "Criminal": '<path d="M24 5l15 5v11c0 9-6.3 15.4-15 18-8.7-2.6-15-9-15-18V10z"/><path d="M17 23.5l5 5 9-9"/>',
    "Corporate & Business": '<rect x="6" y="14" width="36" height="26" rx="3"/><path d="M18 14v-4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4M6 24h36"/><path d="M21 24v4h6v-4" opacity=".7"/>',
    "Overseas": '<circle cx="24" cy="24" r="18"/><path d="M6 24h36M24 6c5 5.5 7.5 11.5 7.5 18S29 37.5 24 42c-5-4.5-7.5-11.5-7.5-18S19 11.5 24 6z"/>',
    "Local": '<path d="M6 42h36M8 38h32"/><path d="M10 20v14M17 20v14M24 20v14M31 20v14M38 20v14" opacity=".8"/><path d="M6 20h36L24 7z"/>',
}
DEFAULT_ICON = '<rect x="16" y="6" width="12" height="20" rx="2.4" transform="rotate(45 22 16)"/><path d="M26 20 40 34"/><path d="M8 42h20"/>'

def icon_for(cat):
    for key, v in ICONS.items():
        if key.lower().split(" ")[0] in cat.lower():
            return v
    return DEFAULT_ICON

def wrap(text, limit=21, max_lines=3):
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 <= limit or not cur:
            cur = (cur + " " + w).strip()
        else:
            lines.append(cur); cur = w
    if cur: lines.append(cur)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1][:limit-1].rstrip(",;:") + "…"
    return lines

TPL = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" font-family="Georgia, 'Times New Roman', serif">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f6e2a8"/><stop offset=".55" stop-color="#e8c96a"/><stop offset="1" stop-color="#c9a227"/>
    </linearGradient>
    <radialGradient id="glow" cx="88%" cy="8%" r="70%">
      <stop offset="0" stop-color="#c9a227" stop-opacity=".22"/><stop offset="1" stop-color="#c9a227" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M60 0H0v60" fill="none" stroke="#ffffff" stroke-opacity=".045" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#0a0a0d"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="14" y="14" width="1172" height="602" rx="18" fill="none" stroke="#c9a227" stroke-opacity=".3" stroke-width="2"/>
  <!-- icon plate -->
  <rect x="76" y="120" width="200" height="200" rx="28" fill="#c9a227" fill-opacity=".07" stroke="#c9a227" stroke-opacity=".35" stroke-width="2"/>
  <g transform="translate(112 156) scale(2.7)" fill="none" stroke="url(#gold)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">{icon}</g>
  <!-- category chip -->
  <text x="340" y="172" font-family="Verdana, Arial, sans-serif" font-size="24" letter-spacing="7" fill="#e8c96a">{category}</text>
  {title_lines}
  <path d="M76 500h140" stroke="url(#gold)" stroke-width="3"/>
  <text x="76" y="576" font-family="Verdana, Arial, sans-serif" font-size="22" letter-spacing="3" fill="#8a8a95">MIRZAFAHAD.COM · MIRZA FAHAD, ADVOCATE HIGH COURT</text>
</svg>
"""

def make(slug, title, cat):
    lines = wrap(title)
    size = 56 if len(lines) >= 3 else 64
    y0 = 250
    tl = "".join(
        f'<text x="340" y="{y0 + i * (size + 16)}" font-size="{size}" font-weight="600" fill="#f2f2f4">{html.escape(l)}</text>'
        for i, l in enumerate(lines)
    )
    svg = TPL.replace("{icon}", icon_for(cat)).replace("{category}", html.escape(cat.upper())).replace("{title_lines}", tl)
    open(os.path.join(OUT, slug + ".svg"), "w").write(svg)

count = 0
for f in sorted(glob.glob(os.path.join(POSTS, "*.md"))):
    src = open(f).read()
    m_t = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', src, re.M)
    m_c = re.search(r'^category:\s*(.+?)\s*$', src, re.M)
    m_ct = re.search(r'^coverTitle:\s*["\']?(.+?)["\']?\s*$', src, re.M)
    if not m_t: continue
    slug = os.path.splitext(os.path.basename(f))[0]
    title = (m_ct.group(1) if m_ct else m_t.group(1)).split(":")[0]
    make(slug, title, m_c.group(1) if m_c else "Law")
    count += 1
print("covers:", count)
