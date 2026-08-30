# mirzafahad.com

Personal website of Mirza Fahad, Advocate High Court. Static site built with [Eleventy](https://www.11ty.dev/), deployed on Cloudflare Pages.

## Editing

| What | Where |
|---|---|
| Name, phone, WhatsApp, email, address, hours, enrolment details | `src/_data/site.json` |
| UI text in English and Urdu | `src/_data/t.json` |
| Practice areas (both languages) | `src/_data/practice.json` |
| About page text | `src/_includes/pages/about.njk` |
| Blog posts — English | `src/posts/en/*.md` |
| Blog posts — Urdu | `src/posts/ur/*.md` (same filename as the English post links them) |
| Profile photo | `src/assets/img/mirza-fahad.jpg` (portrait, ~800×1000) |
| Styles | `src/assets/css/style.css` |

### Adding a blog post

Create `src/posts/en/my-post.md`:

```md
---
title: "Post title"
description: "One or two sentences for the listing and Google."
date: 2026-09-01
category: Family
key: post-my-post
---
Article text in Markdown…
```

For an Urdu version, create `src/posts/ur/my-post.md` with the same `key`. Push to `main` and Cloudflare publishes it.

## Cloudflare Pages settings

- Build command: `npx @11ty/eleventy`
- Build output directory: `_site`
- Environment variables (for the contact form): `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`

## Local preview

```
npm install
npm run dev
```
