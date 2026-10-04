# Batch 3 writing spec (read fully before writing)

You are ghost-writing legal-information blog articles for the website of Mirza Fahad, Advocate High Court, practising in Tandlianwala and Faisalabad, Punjab, Pakistan (District Courts Faisalabad + Lahore High Court). Audience: ordinary Pakistanis and overseas Pakistanis searching Google for practical legal answers. A site-wide disclaimer is added by the layout — do not add one.

## Files
For each assigned topic write TWO files:
- English: `/home/claude/mf/src/posts/en/<slug>.md`
- Urdu:    `/home/claude/mf/src/posts/ur/<slug>.md` (same slug, same key, same date)

## Front matter — EXACT pattern
English:
```
---
title: "Full engaging title (may be longer, sentence style)"
coverTitle: "Short title for the cover image"
description: "SEO meta description, max 160 characters, plain factual promise."
date: 2026-09-12T20:00:00
category: Procedure
key: post-<slug>
faq:
  - q: "Question one?"
    a: "Answer, 1-3 sentences, self-contained."
  - q: "Question two?"
    a: "Answer."
  - q: "Question three?"
    a: "Answer."
---
```
Urdu: identical structure but NO `coverTitle` line; title/description/faq in Urdu; `category:` uses the Urdu category from the topics list; `key` and `date` identical to the English file.

Rules:
- `date`: topic number N (from tools/batch3-topics.md) gets 2026-09-12T21:00:00 minus (N-1)*5 minutes. N=1 -> 21:00:00, N=2 -> 20:55:00, N=13 -> 20:00:00, N=50 -> 16:55:00. Always full `THH:MM:00` form.
- `coverTitle` <= 45 characters, no colon, works as a 2-3 line headline.
- YAML safety: every title/description/q/a value wrapped in double quotes; NO unescaped double quotes inside values (use 'single' quotes or rephrase); every `a:` line MUST have the colon after `a`.
- `category` strings exactly as given in the topics list (EN file gets the EN category, UR file the UR one).

## Body
- 600-900 words (Urdu may run slightly shorter). Start with a 2-4 sentence hook paragraph (no heading). Then 4-7 `##` sections. Bullet lists and **bold** welcome where they aid scanning. Numbered steps for procedures.
- Content: accurate Pakistani law (cite statutes/sections by name where confident: CPC, CrPC 1898, PPC, Family Courts Act 1964, MFLO 1961, Qanun-e-Shahadat, Punjab-specific acts). NEVER invent case citations, exact fee amounts, or current rupee figures — describe mechanisms, not numbers that go stale; where an amount matters say it changes and must be checked.
- Practical, specific, calm, authoritative. Address the reader as "you"/آپ. Where natural, ground examples in Punjab/Faisalabad/Tandlianwala practice (tehsil courts, patwari, union council) — but don't force it.
- End with a short closing paragraph nudging that a brief consultation with relevant documents settles most of the strategy (no hard sell, no phone numbers).
- Urdu version: a faithful, natural Urdu rendering of the same article (may condense), proper legal Urdu terms (دعویٰ، ڈگری، دفعہ، ضابطہ دیوانی، مسل، اپیل، نگرانی/ریویژن), everyday register, no Hindi-isms. Numbers/section references stay in Arabic numerals (دفعہ 12)۔
- No links needed inside the body (interlinking is added later by script). No images. No HTML. Never mention being an AI.

## Style reference
Read `/home/claude/mf/src/posts/en/reply-to-legal-notice.md` and `/home/claude/mf/src/posts/ur/reply-to-legal-notice.md` once before writing — match their tone, density and front matter exactly.
