#!/usr/bin/env python3
"""Insert >=2 contextual in-body links into every EN and UR article.
EN links -> /blog/<slug>/ ; UR links -> /ur/blog/<slug>/
Selection: 2 same-category neighbours + 1 cross-category pick, rotating so
link equity spreads across the archive. Idempotent: skips files that already
contain the Related-reading marker. Run from repo root: python3 tools/interlink.py
"""
import os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARK_EN = "**Related reading:**"
MARK_UR = "**مزید مطالعہ:**"

def load(lang):
    posts = []
    for f in sorted(glob.glob(os.path.join(ROOT, "src", "posts", lang, "*.md"))):
        src = open(f, encoding="utf-8").read()
        m = re.match(r"^---\n(.*?)\n---\n", src, re.S)
        if not m:
            continue
        fm = m.group(1)
        t = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', fm, re.M)
        ct = re.search(r'^coverTitle:\s*["\']?(.+?)["\']?\s*$', fm, re.M)
        c = re.search(r'^category:\s*(.+?)\s*$', fm, re.M)
        slug = os.path.splitext(os.path.basename(f))[0]
        posts.append({
            "file": f, "slug": slug,
            "title": (ct.group(1) if ct else (t.group(1) if t else slug)),
            "cat": c.group(1) if c else "",
            "src": src,
        })
    return posts

def pick(posts, i):
    me = posts[i]
    order = sorted([p for p in posts if p["cat"] == me["cat"] and p["slug"] != me["slug"]],
                   key=lambda p: p["slug"])
    picks, seen = [], {me["slug"]}
    if order:
        k = i % len(order)
        for step in (0, 1):
            p = order[(k + step) % len(order)]
            if p["slug"] not in seen:
                picks.append(p); seen.add(p["slug"])
    allp = sorted(posts, key=lambda p: p["slug"])
    j = (i * 7 + 3) % len(allp)
    while len(picks) < 3 and len(seen) <= len(allp):
        p = allp[j % len(allp)]
        j += 1
        if p["slug"] in seen:
            continue
        picks.append(p); seen.add(p["slug"])
    return picks

def run(lang, prefix, mark):
    posts = load(lang)
    changed = 0
    for i, po in enumerate(posts):
        if mark in po["src"]:
            continue
        links = [f'[{p["title"]}]({prefix}{p["slug"]}/)' for p in pick(posts, i)]
        if len(links) < 2:
            print("WARN <2 links for", po["slug"]); continue
        open(po["file"], "w", encoding="utf-8").write(
            po["src"].rstrip() + f"\n\n{mark} {' · '.join(links)}\n")
        changed += 1
    print(f"{lang}: {len(posts)} posts, {changed} updated")

if __name__ == "__main__":
    run("en", "/blog/", MARK_EN)
    run("ur", "/ur/blog/", MARK_UR)
