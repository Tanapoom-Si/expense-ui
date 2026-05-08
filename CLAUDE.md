# Expense Tracker — Design Handoff for Claude Code

A high-fidelity Thai-language personal finance dashboard. Use this doc when adjusting the design or porting it to a real codebase.

---

## 1. Project Overview

- **Product**: เว็บแอปบันทึกรายรับ-รายจ่ายส่วนบุคคล (Personal expense tracker)
- **Audience**: Thai users tracking daily transactions, savings goals, and category spending
- **Language**: 100% Thai UI copy. Number formatting uses Latin digits with `฿` prefix and Buddhist-era years (พ.ศ. = ค.ศ. + 543)
- **Currency**: Thai Baht (`฿`) only
- **Tone**: Motivating, friendly-but-professional. Hero copy nudges toward savings goals (e.g. "เก็บออมเพิ่มอีก ฿2,400 เพื่อบรรลุเป้าหมาย")

---

## 2. File Structure

```
Expense Tracker.html   ← entry point. Loads fonts, React, Babel, app.jsx, tweaks-panel.jsx
app.jsx                ← all React components + seed data + utils (single file by design)
styles.css             ← all styles, design tokens, layout, components
tweaks-panel.jsx       ← starter component for the Tweaks UI (don't edit unless extending)
```

When porting to a real codebase, split `app.jsx` along the section dividers (each `// ===== SECTION =====` block becomes its own component file).

---

## 3. Design System

### 3.1 Color Tokens (CSS variables in `:root`)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#07101F` | Page background (deep navy) |
| `--bg-soft` | `#0B1626` | Slightly elevated surfaces |
| `--panel` | `#0F1A2E` | Hero card, modal background (top of gradient) |
| `--panel-2` | `#131F36` | Hero card, modal background (bottom of gradient) |
| `--line` | `rgba(255,255,255,.06)` | Default borders, dividers |
| `--line-2` | `rgba(255,255,255,.10)` | Hover/elevated borders |
| `--ink` | `#E6EDF7` | Primary text |
| `--ink-2` | `#B8C2D4` | Secondary text |
| `--ink-3` | `#7C8AA3` | Tertiary text, eyebrows |
| `--ink-4` | `#4A5872` | Disabled, placeholders |

**Accent (themable via Tweaks):**

| Token | Default | Notes |
|---|---|---|
| `--acc-1` | `#5EEAD4` (mint) | Primary brand color, gradient start |
| `--acc-2` | `#7DD3FC` (sky) | Gradient end |

**Semantic:**

| Token | Value | Usage |
|---|---|---|
| `--mint` | `#5EEAD4` | Income, positive deltas |
| `--coral` | `#FB923C` | Expenses, warnings |
| `--rose` | `#FB7185` | Errors, destructive actions |
| `--violet` | `#A78BFA` | AI insights, savings rate |
| `--sky` | `#7DD3FC` | Average spending, info |

**Category colors** (defined in `CAT_META` in app.jsx):
- salary `#5EEAD4` · freelance `#7DD3FC` · investment `#A78BFA`
- food `#FB923C` · transport `#60A5FA` · shopping `#F472B6`
- bills `#FBBF24` · entertainment `#34D399` · health `#F87171`

### 3.2 Typography

- **Latin / numbers**: `Inter` (400, 500, 600, 700)
- **Thai**: `IBM Plex Sans Thai` (300, 400, 500, 600, 700)
- Both loaded from Google Fonts in the HTML head
- Font stack: `'Inter', 'IBM Plex Sans Thai', -apple-system, BlinkMacSystemFont, sans-serif`
- Numbers always use `font-variant-numeric: tabular-nums` for alignment
- Heading letter-spacing: `-0.02em` (titles) to `-0.04em` (display)

**Type scale (px):** 10, 11, 11.5, 12, 12.5, 13, 13.5, 14, 16, 17, 18, 22, 26, 28, 36, 48, 56

### 3.3 Spacing & Radii

- Card padding: `--pad-card` = 22px (comfortable) / 16px (compact, via `[data-density]`)
- Radii: `--r-sm` 8px · `--r-md` 12px · `--r-lg` 18px · `--r-xl` 24px
- Page gutters: 32px (desktop), 18px (≤880px)

### 3.4 Shadows & Effects

- Glow on accent surfaces: `0 8px 24px -8px rgba(94,234,212,.5)`
- Modal lift: `0 30px 80px -20px rgba(0,0,0,.6)`
- Inset highlights on accent buttons: `inset 0 1px 0 rgba(255,255,255,.3)`
- Backdrop blur: 16-20px on sticky topbar / sidebar / modal backdrop

---

## 4. Component Map

### 4.1 Layout Skeleton
- `<App>` — root, holds page state, transactions state, modal state
- `<Sidebar>` — 264px (76px collapsed). Brand · Nav · PRO upsell · Collapse · User card
- `<TopBar>` — sticky, blurred. Search · notifications · settings · CTA
- `.page-head` — page title + subtitle
- `.page-body` — content router

### 4.2 Pages

**Dashboard** (`<Dashboard>`):
1. `<section class="hero">` — greeting + net balance + `<GoalRing>` on right (240×240 SVG ring)
2. `<section class="stat-strip">` — 4× `<StatCard>` with `<Sparkline>` (220×36 SVG)
3. `<section class="grid-2">`:
   - `<CashflowChart>` — 720×240 SVG, smoothed bezier paths, dashed expense line
   - `<CategoryDonut>` — 200×200 SVG arcs + legend bars
4. `<section class="grid-2">`:
   - AI insights list (3 items with colored icon tiles)
   - Upcoming bills list (date tile + label + amount)
5. Recent transactions (last 5)

**Transactions** (`<Transactions>`):
1. 4× summary cards (count / income / expense / net)
2. Toolbar — type filter (segmented), month select, export CSV button
3. Full `<TxList>` with hover-to-reveal edit/delete actions

**Budgets / Goals** — empty states with `✦` glyph (placeholder for future work)

### 4.3 Reusable Patterns
- `.card` — bordered glass surface with subtle vertical gradient
- `.seg` / `.seg-btn` — segmented control (used for time ranges, type filters, modal type toggle)
- `.cta` — primary mint→sky gradient button with inner highlight
- `.ghost-btn` / `.ghost-btn.outlined` — secondary actions
- `.icon-btn` — 36×36 square icon button
- `.cat-chip` — pill with `--c` CSS var driving tinted bg/border/text
- `.pill.ai` — violet→pink AI tag

---

## 5. Data Model

```ts
type Transaction = {
  id: number;
  date: string;          // ISO 'YYYY-MM-DD'
  type: 'income' | 'expense';
  cat: keyof typeof CAT_META;  // category key
  label: string;         // Thai description
  amount: number;        // positive baht, signedness derives from `type`
};
```

Seed data: 18 transactions in `SEED_TX` (top of `app.jsx`).

---

## 6. Interactions Implemented

- Sidebar nav between Dashboard / Transactions / Budgets / Goals
- Sidebar collapse toggle (persists during session)
- Add Transaction modal (Esc to close, click backdrop to close, autofocus amount, type toggle re-defaults category)
- Live search across labels + category names (top bar input, also visible on transactions)
- Filter chips: ทั้งหมด / รายรับ / รายจ่าย
- Edit / delete row buttons (hover-reveal). Delete is wired; edit is a stub — wire to modal when extending.
- Animated number counters on hero + stat values (cubic ease-out, 900ms)
- Goal ring animates on mount via `stroke-dashoffset` transition

---

## 7. Tweaks (Edit-mode panel)

Lives in `<ExpenseTweaks>` at the bottom of `app.jsx`. Defaults are inside `EDITMODE-BEGIN/END` markers so the host persists changes to disk.

| Key | Type | Effect |
|---|---|---|
| `accent` | `'mint' \| 'violet' \| 'amber' \| 'coral' \| 'emerald'` | Sets `--acc-1` / `--acc-2` |
| `density` | `'comfortable' \| 'compact'` | Sets `[data-density]`, tightens card padding + tx row padding |
| `showSidebarUpsell` | boolean | Toggles PRO card visibility |

Add a tweak: extend `TWEAK_DEFAULTS` (must stay valid JSON), apply in the `useEffect`, render a control inside `<TweaksPanel>`.

---

## 8. Conventions to Preserve

- **Never** invent a new color outside the token set; thread accents via `--acc-1/--acc-2` or extend `CAT_META`.
- **Never** hand-draw illustrative SVGs — keep iconography to simple stroke icons (1.8px stroke, 24×24 viewBox).
- **All amounts** go through `fmt()` / `fmtSigned()` so `฿` prefix and locale stay consistent.
- **All dates** use `fmtThaiDate()` / `fmtThaiDateShort()` for พ.ศ. years and Thai month abbreviations.
- **Thai copy first**, then English in UI is fine only inside dev comments or aria-labels.
- **Numbers** always `font-variant-numeric: tabular-nums`.
- **Eyebrows** above titles use uppercase, 11px, `letter-spacing: 0.08em`, `--ink-3`.

---

## 9. Common Adjustments

**Change the brand accent permanently** — edit `--acc-1` / `--acc-2` defaults in `styles.css` `:root`, AND change `accent` default in the `EDITMODE` block, AND add the matching key to `ACCENT_PRESETS`.

**Add a new category** — add an entry to `CAT_META` in `app.jsx` (label, icon glyph, color), then it's available in seed data, donut, chips, and the modal picker.

**Add a new page** — add an entry to the `items` array in `<Sidebar>`, add a router branch in `<App>`'s `page-body`, add a title in `<TopBar>`'s `titles` map.

**Swap to light mode** — invert `--bg/--panel/--ink*` tokens; the rest of the system uses semantic tokens that should mostly carry over. Audit `linear-gradient` background fills in `.hero`, `.card`, `.stat` for light-mode contrast.

**Replace seed data with API** — `<App>` holds `tx` in `useState(SEED_TX)`. Replace with a `useEffect` fetch + loading state. Keep the `Transaction` shape.

---

## 10. Things Deliberately Left Unbuilt

- Budgets and Goals pages (empty states only) — wire when product spec lands
- Edit transaction (icon shows but action is a stub)
- Real export CSV (button is decorative)
- Notifications panel (bell shows badge dot only)
- Multi-month / date-range picker (select has fixed options)
- Mobile breakpoint below 880px is functional but not polished — design for ≥1280px first
