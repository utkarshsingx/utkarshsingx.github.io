# utkarshsingx.github.io

Personal site for **Utkarsh Singh** — platform engineer, Greater Noida, India.
Live at **https://utkarshsingx.github.io/**

A single-page technical dossier: hero field report, how-I-work dossier, an
architecture diagram, measured output, a role timeline, personal builds, a reads
section, a capability matrix, FAQ and contact.

## Stack

Hand-written HTML, CSS and vanilla JS. No framework, no build step, no bundler,
no trackers. GitHub Pages serves the repository root as-is.

```
index.html          every section, in order
assets/styles.css   design tokens + layout (dark default, light theme)
assets/main.js      clock, nav tracking, reveal, diagram inspector, charts
scripts/refresh-stats.sh   re-pulls the §04 numbers from the GitHub API
```

## Design system

| Token | Dark | Light |
|---|---|---|
| Surface | `#000` | `#f3efe6` |
| Ink | `#ede6d3` | `#16130e` |
| Signal (accent) | `#ff4a1c` | `#c2340a` |
| Pulse (live) | `#c8ff5e` | `#456b08` |

Type: **Instrument Serif** (display), **JetBrains Mono** (labels, data),
**Onest** (body). Both accents pass WCAG AA against their own surface — the
light theme is a separate set of steps, not an inverted dark one.

## Running it locally

```bash
python3 -m http.server 4178
# → http://localhost:4178
```

## Refreshing the numbers in §04

Every figure in the velocity section was read from the GitHub API, not typed by
hand. To update it after a few more months of commits:

```bash
./scripts/refresh-stats.sh          # needs: gh auth login
```

It prints the stat values and the two data arrays. Paste `WEEKS` and `REPOS`
into `assets/main.js`, and update the matching prose figures in `index.html`
(§01 "if you're counting", the §04 stat tiles and paragraphs).

## Editing

- **Roles** — `index.html`, `§05 · TIMELINE`, one `<article class="tl__row">` each.
- **Projects** — `§06 · MANIFEST`, one `<article class="mf__row">` each.
- **Capability grid** — `§08`, a `<td class="cell lvN">` per year, `lv1`–`lv4`
  (empty class = not used). The legend under the table explains the levels.
- **Diagram** — `§03`, each `<g class="node">` carries `data-t` (title) and
  `data-d` (the text the inspector panel shows on hover).
