# Design System & Interface Specification
# Yaksha FAQ Platform — VINS Cohort @ IIT Ropar

**Version:** 1.0  
**Design Direction:** Minimal Editorial / Precision Utility  
**Last Updated:** May 2026

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design Tokens](#2-design-tokens)
   - 2.1 [Color Palette](#21-color-palette)
   - 2.2 [Typography](#22-typography)
   - 2.3 [Spacing System](#23-spacing-system)
   - 2.4 [Border Radius](#24-border-radius)
   - 2.5 [Shadows & Elevation](#25-shadows--elevation)
   - 2.6 [Motion & Transitions](#26-motion--transitions)
3. [Layout System](#3-layout-system)
4. [Component Library](#4-component-library)
   - 4.1 [Global Header](#41-global-header)
   - 4.2 [Sidebar](#42-sidebar)
   - 4.3 [SearchBar](#43-searchbar)
   - 4.4 [AccordionCard](#44-accordioncard)
   - 4.5 [FilterTabs](#45-filtertabs)
   - 4.6 [DeadlineBanner](#46-deadlinebanner)
   - 4.7 [ChatbotWidget](#47-chatbotwidget)
   - 4.8 [ExitConfirmModal](#48-exitconfirmmodal)
   - 4.9 [PeerFootnote](#49-peerfootnote)
   - 4.10 [ThreadRow](#410-threadrow)
   - 4.11 [AnswerBlock](#411-answerblock)
   - 4.12 [StatusBar](#412-statusbar)
   - 4.13 [ConfidenceBadge](#413-confidencebadge)
   - 4.14 [AskQuestionModal](#414-askquestionmodal)
   - 4.15 [LeaderboardStrip](#415-leaderboardstrip)
   - 4.16 [EscalationForm](#416-escalationform)
   - 4.17 [AdminQueue Card](#417-adminqueue-card)
   - 4.18 [CohortPulseChart](#418-cohortpulsechart)
   - 4.19 [GapReport](#419-gapreport)
   - 4.20 [Buttons](#420-buttons)
   - 4.21 [Form Inputs](#421-form-inputs)
   - 4.22 [Toast Notifications](#422-toast-notifications)
5. [Page Designs](#5-page-designs)
   - 5.1 [Page 1 — Public FAQ (`/faq`)](#51-page-1--public-faq-faq)
   - 5.2 [Page 2 — Discussion Forum (`/forum`)](#52-page-2--discussion-forum-forum)
   - 5.3 [Page 3 — Escalation (`/escalate`)](#53-page-3--escalation-escalate)
   - 5.4 [Admin Dashboard (`/admin`)](#54-admin-dashboard-admin)
6. [Interaction States](#6-interaction-states)
7. [Responsive Breakpoints](#7-responsive-breakpoints)
8. [Iconography](#8-iconography)
9. [Accessibility](#9-accessibility)
10. [Tailwind Configuration](#10-tailwind-configuration)

---

## 1. Design Philosophy

### Direction: **Minimal Editorial Precision**

Yaksha is an internal tool used daily by 100 technically literate internship cohort members and one admin. The design must be:

- **Fast to scan** — information hierarchy is relentless. Every pixel either communicates or disappears.
- **Calm under load** — no gradients fighting for attention. Restraint creates trust.
- **Surgically branded** — one accent color (`#0044FF` electric blue) lands with force precisely because everything around it is monochrome.
- **Editorially spaced** — generous whitespace is not emptiness; it's silence before the answer.

### Aesthetic Anchors

| Quality | Expression |
|---|---|
| Minimalism | No decorative elements. No icons used purely aesthetically. |
| Precision | 4px base grid. Every size is a multiple of 4. |
| Legibility | All body text at minimum 14px/1.6 line-height. |
| Restraint | Maximum 2 font weights per page. Never 3. |
| Contrast | Black on white for content. Blue only on interactive. Orange/Green only for status. |
| Density | Medium. Enough breathing room to read quickly; not so spacious it feels wasteful for a utility tool. |

### The One Unforgettable Detail

The search bar on Page 1 is the product's face. It sits center-top, 56px tall, full-width of the content column, with a 2px electric-blue bottom border that animates in on focus. No drop shadow. No rounded corners. A single sharp line. Everything else on the page is built to serve it.

---

## 2. Design Tokens

All tokens are defined as CSS custom properties in `global.css` and mirrored as a Tailwind `extend` config.

### 2.1 Color Palette

#### Base (Used on both light + admin dark themes)

```css
:root {
  /* --- Neutrals --- */
  --color-ink-900:     #0A0A0A;   /* Primary text, headings */
  --color-ink-700:     #333333;   /* Secondary text, labels */
  --color-ink-400:     #888888;   /* Metadata, timestamps, placeholders */
  --color-ink-200:     #C8C8C8;   /* Borders, dividers */
  --color-ink-100:     #EFEFEF;   /* Subtle backgrounds, hover fill */
  --color-ink-50:      #F7F7F7;   /* Page background */
  --color-white:       #FFFFFF;   /* Card backgrounds */

  /* --- Brand --- */
  --color-blue-600:    #0033CC;   /* Blue pressed/active state */
  --color-blue-500:    #0044FF;   /* Primary action — THE accent */
  --color-blue-100:    #E6EEFF;   /* Blue ghost backgrounds */

  /* --- Semantic — Status --- */
  --color-status-open:       #AAAAAA;   /* Grey — waiting */
  --color-status-discuss:    #E8A000;   /* Amber — being discussed */
  --color-status-verifying:  #0044FF;   /* Blue — answer found, verifying */
  --color-status-resolved:   #16A34A;   /* Green — resolved */
  --color-status-escalated:  #DC6803;   /* Orange — escalated */

  /* --- Semantic — Confidence --- */
  --color-conf-unverified:   #888888;   /* Grey */
  --color-conf-community:    #CA8A04;   /* Yellow-700 */
  --color-conf-high:         #16A34A;   /* Green-600 */

  /* --- Semantic — Gap Report --- */
  --color-gap-red:     #DC2626;
  --color-gap-yellow:  #CA8A04;
  --color-gap-green:   #16A34A;

  /* --- Admin Dark Theme overrides (scoped to .admin-theme) --- */
  --admin-bg:          #0D0D0D;
  --admin-surface:     #161616;
  --admin-border:      #2A2A2A;
  --admin-ink-900:     #F0F0F0;
  --admin-ink-400:     #666666;
}
```

#### Color Usage Rules

- `--color-blue-500` appears ONLY on: primary buttons, active tab underlines, search bar focus border, link text, socket status "verifying" badge, confidence badge "high".
- `--color-ink-900` is for all headings and body text.
- `--color-ink-400` is for timestamps, counts, metadata labels — never for main content.
- **Never use blue as a background fill** except `--color-blue-100` for ghost states.
- **Never use color for decoration** — only to communicate state.

---

### 2.2 Typography

#### Font Stack

```css
:root {
  --font-display: 'DM Serif Display', Georgia, serif;  /* H1, hero headings only */
  --font-body:    'IBM Plex Sans', 'Helvetica Neue', sans-serif;  /* All UI text */
  --font-mono:    'IBM Plex Mono', 'Courier New', monospace;  /* Code, sectionIds, hashes */
}
```

**Import (Google Fonts):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Rationale:**
- `DM Serif Display` — authoritative, warm, editorial. Used sparingly (page H1 only on Page 1). Its serif contrast with the otherwise sans-serif UI creates a moment of intentionality.
- `IBM Plex Sans` — engineered for utility. Designed at IBM for technical products. Highly legible at small sizes. Feels institutional in the best sense.
- `IBM Plex Mono` — carries the same DNA as the body font. Used for metadata, sectionIds, and any code-adjacent strings.

#### Type Scale

All sizes follow a 4px-based modular scale.

```css
:root {
  --text-xs:   11px;   /* Tags, fine print */
  --text-sm:   13px;   /* Metadata, timestamps, help text */
  --text-base: 14px;   /* Body copy, default UI text */
  --text-md:   16px;   /* Card titles, list items */
  --text-lg:   18px;   /* Section headings (H3) */
  --text-xl:   22px;   /* Page subheadings (H2) */
  --text-2xl:  28px;   /* Page heading (H1 utility) */
  --text-3xl:  36px;   /* Hero heading (DM Serif Display only) */

  --leading-tight:  1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.65;

  --tracking-tight:  -0.02em;
  --tracking-normal:  0;
  --tracking-wide:    0.04em;
  --tracking-widest:  0.10em;  /* Uppercase labels */
}
```

#### Type Styles (Named)

| Name | Font | Size | Weight | Line-height | Letter-spacing | Usage |
|---|---|---|---|---|---|---|
| `hero` | DM Serif Display | 36px | 400 | 1.2 | -0.02em | Page 1 H1 only |
| `heading-1` | IBM Plex Sans | 28px | 600 | 1.25 | -0.02em | Section titles |
| `heading-2` | IBM Plex Sans | 22px | 600 | 1.3 | -0.015em | Card headers |
| `heading-3` | IBM Plex Sans | 18px | 500 | 1.35 | 0 | Sub-section |
| `label-caps` | IBM Plex Sans | 11px | 600 | 1.0 | 0.10em | Uppercase UI labels, tab names |
| `body` | IBM Plex Sans | 14px | 400 | 1.65 | 0 | All body copy |
| `body-medium` | IBM Plex Sans | 14px | 500 | 1.65 | 0 | Emphasized body text |
| `small` | IBM Plex Sans | 13px | 400 | 1.5 | 0 | Timestamps, metadata |
| `mono` | IBM Plex Mono | 12px | 400 | 1.5 | 0 | sectionIds, hashes |
| `thread-title` | IBM Plex Sans | 16px | 500 | 1.4 | -0.01em | Forum thread titles |

---

### 2.3 Spacing System

Base unit: **4px**.

```css
:root {
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;
  --space-20:  80px;
  --space-24:  96px;
}
```

#### Application Rules

- **Between components on a page:** `--space-8` (32px) minimum
- **Within a card:** `--space-6` (24px) padding
- **Between a label and its content:** `--space-2` (8px)
- **Between list items:** `--space-3` (12px)
- **Between sections in a page:** `--space-16` (64px)
- **Header height:** 56px fixed
- **Sidebar width:** 224px fixed on desktop

---

### 2.4 Border Radius

```css
:root {
  --radius-sm:   3px;   /* Tags, badges */
  --radius-md:   6px;   /* Cards, inputs */
  --radius-lg:  12px;   /* Modals, chatbot panel */
  --radius-full: 9999px; /* Pills, avatar circles */
}
```

**Rule:** The platform leans sharp. Default is `--radius-md` (6px). Only the chatbot panel and modals get `--radius-lg` (12px). Buttons are `--radius-sm` (3px) — not rounded pills. This communicates precision over friendliness.

---

### 2.5 Shadows & Elevation

Three levels only. Used sparingly.

```css
:root {
  /* Level 1 — Card hover lift */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);

  /* Level 2 — Dropdowns, floating elements */
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);

  /* Level 3 — Modals only */
  --shadow-lg: 0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
}
```

**Rules:**
- Default card state: **no shadow** — only a `1px solid var(--color-ink-200)` border.
- Shadow appears only on `hover` or when an element is `floating` (chatbot, modal, dropdown).
- The admin dashboard uses no shadows — borders only. (Dark surfaces + shadows = mud.)

---

### 2.6 Motion & Transitions

```css
:root {
  --ease-out:     cubic-bezier(0.16, 1, 0.3, 1);   /* Default for reveals */
  --ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);    /* State changes */
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1); /* Badges, toasts */

  --duration-fast:   100ms;   /* Hover fills, color changes */
  --duration-base:   180ms;   /* Accordion open/close, tab switch */
  --duration-slow:   280ms;   /* Modal enter, chatbot expand */
  --duration-xslow:  400ms;   /* Page-level reveals */
}
```

#### Motion Principles

- **One rule:** If removing the animation would not change the user's understanding of what happened, remove the animation.
- **Accordion:** `max-height` transition `180ms ease-out`. No fade — height change is enough.
- **Tab switch:** Active underline slides horizontally `180ms ease-in-out`.
- **Modal enter:** Fade in `opacity 0→1` + `translateY(8px→0)` in `280ms ease-out`.
- **Chatbot expand:** Scale from `0.95→1` + `opacity 0→1` from bottom-right origin, `280ms ease-out`.
- **Status badge change:** `background-color` crossfade `100ms`. No movement.
- **Confidence badge:** Spring scale `0.8→1` when first rendered, `200ms`.
- **Toast:** Slide in from right `280ms ease-out`. Slide out `200ms ease-in`.
- **Search bar focus border:** `border-color` change `100ms`. The blue line appears instantly — no delay.
- **Page load (Page 1):** Sidebar fades in `0→1` at `0ms`. Hero text at `60ms`. SearchBar at `100ms`. AccordionCards stagger in at `20ms` intervals starting `160ms`. Uses `animation-delay` on each card.

---

## 3. Layout System

### Grid

```
Desktop (≥1280px):
┌────────────────────────────────────────────────────────────┐
│  HEADER  [height: 56px, full-width, sticky]                │
├──────────────────────────────────────────────────────────  │
│  SIDEBAR [224px fixed]  │  CONTENT [max-w: 720px]  │ gap  │
│                         │                           │      │
│  (sticky, top: 56px)    │  centered in remaining   │      │
└──────────────────────────────────────────────────────────  ┘

Page wrapper:  max-width 1200px, margin: 0 auto, padding: 0 40px
Sidebar:       width 224px, padding-right 32px
Content area:  flex-1, max-width 720px
Right gutter:  auto (white space, no widget area needed)
```

### Content Column

The main content column is capped at **720px**. This is a deliberate editorial choice — at 14px body text, 720px produces ~80 characters per line, which is the optimal reading width for dense FAQ content.

### Sticky Behavior

- **Header:** `position: sticky; top: 0; z-index: 50;` — always visible
- **Sidebar:** `position: sticky; top: 56px; height: calc(100vh - 56px); overflow-y: auto;`
- **Back to Top button:** appears after 300px scroll, fixed bottom-right above chatbot

### Z-Index Scale

```css
:root {
  --z-base:      1;
  --z-sticky:   10;   /* Sidebar */
  --z-header:   20;   /* Global header */
  --z-dropdown: 30;   /* Filter dropdowns, search suggestions */
  --z-chatbot:  40;   /* Floating chatbot widget */
  --z-toast:    50;   /* react-hot-toast */
  --z-modal:    60;   /* ExitConfirmModal, AskQuestionModal */
  --z-overlay:  55;   /* Modal backdrop */
}
```

---

## 4. Component Library

Each component specification includes: dimensions, spacing, states, and Tailwind class approximations.

---

### 4.1 Global Header

**Height:** 56px  
**Background:** `--color-white`, `border-bottom: 1px solid var(--color-ink-200)`  
**Position:** `sticky top-0 z-[20]`

#### Layout (Page 1 — Public)

```
┌─────────────────────────────────────────────────────────────┐
│  [VINS Logo + Yaksha wordmark]    [Overview] [FAQ] [samagama]│
│  left-aligned, 24px from edge                  right: 24px  │
└─────────────────────────────────────────────────────────────┘
```

**Logo area:**
- `VINS` in `--font-mono` 13px, weight 500, `--color-ink-400`, uppercase, letter-spacing 0.10em
- `·` separator, ink-200
- `Yaksha` in `--font-body` 16px, weight 600, `--color-ink-900`
- No logo image — wordmark only

**Nav links:**
- Type: `label-caps` — IBM Plex Sans, 11px, weight 600, letter-spacing 0.10em, uppercase
- Color: `--color-ink-400` default; `--color-ink-900` on active route; `--color-blue-500` on hover
- No underline on default; `border-bottom: 1.5px solid var(--color-blue-500)` on active
- Gap between links: `--space-6` (24px)

#### Layout (Page 2 — Forum, authenticated)

```
┌─────────────────────────────────────────────────────────────┐
│  [Yaksha wordmark]                    [🔔 badge] [avatar]   │
└─────────────────────────────────────────────────────────────┘
```

**Notification bell:**
- Tabler `IconBell` 20px, `--color-ink-700`
- Red dot badge: 6px circle, `#DC2626`, no count number — presence only
- Badge position: top-right of icon, `position: absolute; top: 1px; right: 1px`

**User avatar:**
- 28px circle, `--radius-full`
- Google profile image if available; fallback: initials in `--color-ink-100` background, `--color-ink-700` text, 11px mono
- Clicking opens a micro-dropdown: "Notifications: on/off" toggle + "Sign out"

---

### 4.2 Sidebar

**Width:** 224px  
**Padding:** `24px 0 24px 0` (no left padding — content is flush-left within sidebar column)  
**Top offset:** 56px (below header)

#### Structure

```
Category Navigation
───────────────────
[icon]  NOC                    ← active: blue left border
[icon]  Offer Letter
[icon]  ViBe Platform
[icon]  Team Formation
[icon]  Stipend
[icon]  Timelines

────────────────── (divider: 1px, ink-100)

DISCUSSION            ← label-caps, ink-400
[icon]  All Threads
[icon]  My Posts
```

**Category item:**
- Height: 36px
- Layout: `display: flex; align-items: center; gap: 10px`
- Icon: Tabler icon, 16px, `--color-ink-400`
- Label: IBM Plex Sans, 14px, weight 400, `--color-ink-700`
- Padding: `8px 12px`
- Border-radius: `--radius-sm` (3px)
- Hover: `background: var(--color-ink-100)` + icon/label color → `--color-ink-900`, `100ms`
- Active: `background: var(--color-blue-100)` + `border-left: 2px solid var(--color-blue-500)` + icon/label → `--color-blue-500`, weight 500
- Active item has `padding-left: 10px` to compensate for the 2px border

**Section header (e.g., "DISCUSSION"):**
- IBM Plex Sans, 11px, weight 600, letter-spacing 0.10em, `--color-ink-400`, uppercase
- Padding: `16px 12px 8px 12px`

**Divider:**
- `1px solid var(--color-ink-100)`, margin `12px 0`

---

### 4.3 SearchBar

The most prominent element on Page 1. Defined with extreme precision.

**Container:**
```
width: 100% (of content column, max 720px)
height: 56px
background: var(--color-white)
border: 1.5px solid var(--color-ink-200)
border-bottom-width: 2px
border-radius: var(--radius-md) [6px]
display: flex
align-items: center
padding: 0 16px
gap: 12px
transition: border-color 100ms, box-shadow 100ms
```

**Focus state:**
```
border-color: var(--color-blue-500)        ← ALL borders turn blue
outline: none
box-shadow: 0 0 0 3px var(--color-blue-100)  ← soft outer glow, 3px, blue-100
```

**Icon:**
- Tabler `IconSearch`, 18px, `--color-ink-400`
- On focus: color transitions to `--color-blue-500`, `100ms`

**Input field:**
```
font-family: var(--font-body)
font-size: 15px
font-weight: 400
color: var(--color-ink-900)
background: transparent
border: none
outline: none
flex: 1
```

**Placeholder text:**
- "Search questions, topics, keywords…"
- Color: `--color-ink-400`
- Style: italic

**Clear button (appears when value is non-empty):**
- Tabler `IconX`, 16px, `--color-ink-400`
- Hover: `--color-ink-900`, `100ms`
- No background — inline with input

**"Did you mean this?" suggestion strip:**
- Appears below SearchBar when Fuse.js score is 0.60–0.84
- Background: `--color-white`, `border: 1px solid var(--color-ink-200)`, `--radius-md`
- Padding: `12px 16px`
- Text: IBM Plex Sans, 13px, `--color-ink-700`
- Format: `Did you mean: "[matched question text]" →`
- Arrow is `--color-blue-500`

**Popular chips (below SearchBar):**
- Container: `display: flex; gap: 8px; margin-top: 12px`
- Each chip: `height 28px`, `padding: 0 12px`, `--radius-full`, `border: 1px solid var(--color-ink-200)`, background `--color-white`
- Text: IBM Plex Sans, 12px, weight 500, `--color-ink-700`
- Hover: `background: var(--color-ink-100)`, border → `--color-ink-400`, `100ms`
- Active/selected: `background: var(--color-blue-100)`, `border-color: var(--color-blue-500)`, `color: var(--color-blue-500)`, weight 600

---

### 4.4 AccordionCard

**Container:**
```
background: var(--color-white)
border: 1px solid var(--color-ink-200)
border-radius: var(--radius-md)
margin-bottom: 2px    ← tight stacking, near-zero gap between items
overflow: hidden
transition: border-color 100ms
```

**Hover (collapsed):** `border-color: var(--color-ink-400)`

**Header row (the clickable trigger):**
```
padding: 16px 20px
display: flex
align-items: center
gap: 12px
cursor: pointer
user-select: none
```

- **Category badge (left):** 6px wide, 24px tall, `background: var(--color-blue-500)`, `--radius-sm` — a thin vertical bar. Shows "this item has an answer". Disappears in expanded state (content border takes over).
- **Question text:** IBM Plex Sans, 15px, weight 500, `--color-ink-900`, `flex: 1`
- **Helpful count:** IBM Plex Sans, 12px, `--color-ink-400` — `"47 helpful"` — right-aligned
- **Chevron:** Tabler `IconChevronDown`, 16px, `--color-ink-400`. Rotates `0°→180°` on expand, `180ms ease-out`.

**Expanded state:**
```
border-color: var(--color-blue-500)    ← whole card border turns blue
border-left-width: 2px                 ← left accent thickens
```

**Body (revealed):**
```
padding: 0 20px 20px 20px
border-top: 1px solid var(--color-ink-100)
margin-top: 0
```

- Answer text: IBM Plex Sans, 14px, weight 400, `--color-ink-700`, `line-height: 1.65`
- `mark.js` highlights: `background: #FFF8C5; border-radius: 2px; padding: 0 2px` (yellow highlight, never blue)
- Vertical spacing between answer and footnote: `16px`

**"N interns found this helpful" display:**
```
margin-top: 16px
font-family: IBM Plex Sans
font-size: 12px
color: var(--color-ink-400)
display: flex
align-items: center
gap: 6px
```
- Prefix: Tabler `IconThumbUp`, 13px, `--color-ink-400`
- Text: `"47 interns found this helpful"`

---

### 4.5 FilterTabs

Used on both Page 1 (FAQ filters) and Page 2 (Forum filters).

**Container:**
```
display: flex
gap: 0
border-bottom: 1px solid var(--color-ink-200)
margin-bottom: 24px
```

**Each tab:**
```
padding: 10px 16px
font-family: IBM Plex Sans
font-size: 13px
font-weight: 500
color: var(--color-ink-400)
cursor: pointer
position: relative
border-bottom: 2px solid transparent   ← placed below the container border
margin-bottom: -1px                     ← overlaps the container border
transition: color 100ms
```

**Active tab:**
```
color: var(--color-ink-900)
border-bottom-color: var(--color-blue-500)
font-weight: 600
```

**Hover:**
```
color: var(--color-ink-700)
```

**Tab label format:** Sentence case (not uppercase). "All", "Unresolved", "Resolved", "My Posts"

**Count badge (optional, on "Unresolved"):**
- Inline after label: ` · 12` in `--color-ink-400`, font-weight 400 — not a bubble

---

### 4.6 DeadlineBanner

**Appears:** Only when `useDeadlinePhase` returns an active phase.

**Container:**
```
background: var(--color-ink-900)
color: var(--color-white)
border-radius: var(--radius-md)
padding: 12px 16px
margin-bottom: 24px
display: flex
align-items: center
justify-content: space-between
gap: 16px
```

**Left content:**
- Tabler `IconCalendarEvent`, 16px, white, `opacity: 0.7`
- Banner text: IBM Plex Sans, 13px, weight 500, white, `gap-left: 10px`
- Example: `"Phase 1 is live — common questions this week:"`

**Right content:**
- Category chips: small pill buttons — `background: rgba(255,255,255,0.12)`, `border: 1px solid rgba(255,255,255,0.2)`, `color: white`, 11px, weight 600, `--radius-full`, `padding: 3px 10px`
- Dismiss button: Tabler `IconX`, 14px, `opacity: 0.5`, hover `opacity: 1`

---

### 4.7 ChatbotWidget

**Collapsed state (trigger button):**
```
position: fixed
bottom: 24px
right: 24px
z-index: var(--z-chatbot)

Button:
width: 48px
height: 48px
border-radius: var(--radius-full)
background: var(--color-ink-900)
color: var(--color-white)
display: flex
align-items: center
justify-content: center
box-shadow: var(--shadow-md)
cursor: pointer
```

- Icon: Tabler `IconMessageCircle2`, 22px, white
- **Pulse animation** (CSS only, always running on collapsed state):

```css
@keyframes pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(0,68,255,0.4); }
  70%  { box-shadow: 0 0 0 10px rgba(0,68,255,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,68,255,0); }
}
.chatbot-trigger {
  animation: pulse-ring 2.4s ease-out infinite;
}
```

- On hover: `background: var(--color-blue-500)`, `transform: scale(1.05)`, `180ms`

**Expanded panel:**
```
position: fixed
bottom: 84px
right: 24px
width: 340px
background: var(--color-white)
border: 1px solid var(--color-ink-200)
border-radius: var(--radius-lg)
box-shadow: var(--shadow-lg)
z-index: var(--z-chatbot)
overflow: hidden

Enter animation:
  opacity: 0 → 1
  transform: scale(0.95) → scale(1)  (origin: bottom right)
  duration: 280ms, ease-out
```

**Panel header:**
```
padding: 14px 16px
border-bottom: 1px solid var(--color-ink-100)
display: flex
justify-content: space-between
align-items: center
background: var(--color-ink-900)
```
- Left: `IconMessageCircle2` 15px white + "Yaksha" 13px IBM Plex Sans weight 600 white, gap 8px
- Right: `IconX` 16px, `opacity: 0.6`, hover full opacity, closes panel

**Panel body:**
```
padding: 16px
min-height: 80px
max-height: 280px
overflow-y: auto
```

**Result state:**
- FAQ match: show question + answer in a condensed card (`border: 1px solid ink-100`, `border-radius: radius-sm`, `padding: 12px`)
- No match: `"Couldn't find this in the FAQ."` in 13px ink-400, then a blue CTA button

**CTA button ("Ask the community →"):**
- Full-width, `background: var(--color-blue-500)`, `color: white`, 13px weight 600, 36px height, `--radius-sm`

---

### 4.8 ExitConfirmModal

**Backdrop:**
```
position: fixed
inset: 0
background: rgba(0,0,0,0.35)
z-index: var(--z-overlay)
backdrop-filter: blur(2px)
```

**Modal card:**
```
position: fixed
top: 50%
left: 50%
transform: translate(-50%, -50%)
z-index: var(--z-modal)
width: 380px
background: var(--color-white)
border-radius: var(--radius-lg)
box-shadow: var(--shadow-lg)
padding: 32px 28px

Enter animation:
  opacity: 0 → 1
  translateY(12px) → translateY(0)
  280ms ease-out
```

**Content:**
- Heading: IBM Plex Sans, 18px, weight 600, `--color-ink-900`, margin-bottom 8px
- Text: `"Did this answer your question?"`
- Subtext: 13px, `--color-ink-400` — `"Your feedback helps improve answers for the cohort."`
- Margin between heading and buttons: `24px`

**Buttons (side by side):**
- "Yes, thanks" — Primary button (see §4.20)
- "No, I need more help" — Ghost button (see §4.20)
- Gap between buttons: `12px`

---

### 4.9 PeerFootnote

**Container:**
```
margin-top: 12px
padding: 10px 14px
background: var(--color-ink-50)
border-left: 2px solid var(--color-ink-200)
border-radius: 0 var(--radius-sm) var(--radius-sm) 0
```

**Content:**
- Icon: Tabler `IconQuote`, 13px, `--color-ink-400`, float left
- Text: IBM Plex Sans, 13px, weight 400, `--color-ink-700`, italic — `"[quote text]"`
- Attribution: IBM Plex Sans, 12px, `--color-ink-400`, `"— [authorName]"`, margin-top 4px

---

### 4.10 ThreadRow

**Container:**
```
display: flex
gap: 16px
padding: 16px 0
border-bottom: 1px solid var(--color-ink-100)
cursor: pointer
transition: background 100ms

Hover:
  background: var(--color-ink-50)
  margin: 0 -16px
  padding: 16px
  border-radius: var(--radius-md)
```

**Vote column (left):**
```
width: 36px
flex-shrink: 0
display: flex
flex-direction: column
align-items: center
gap: 2px
```
- Upvote arrow: Tabler `IconChevronUp`, 16px, `--color-ink-400`; hover `--color-blue-500`; active/voted: `--color-blue-500` + filled state indicator (the number turns blue)
- Vote count: IBM Plex Mono, 13px, weight 500, `--color-ink-700`; if voted: `--color-blue-500`

**Content column (center, flex: 1):**
- Thread title: IBM Plex Sans, 15px, weight 500, `--color-ink-900`, `line-clamp: 1`
- Body preview: IBM Plex Sans, 13px, weight 400, `--color-ink-400`, `line-clamp: 1`, margin-top 3px
- Meta row (margin-top 8px): `display: flex; gap: 12px; align-items: center`
  - Author name: 12px, `--color-ink-400`
  - Separator: `·` in `--color-ink-200`
  - Timestamp: 12px, `--color-ink-400`
  - Answer count: `IconMessageCircle2` 12px + `"3 answers"`, 12px, `--color-ink-400`

**Status column (right):**
- `width: auto; flex-shrink: 0`
- StatusBar badge (see §4.12)

---

### 4.11 AnswerBlock

**Container:**
```
padding: 16px 0
border-bottom: 1px solid var(--color-ink-100)
```

**Header row:**
- Avatar: 24px circle, initials fallback, `--radius-full`
- Author name: IBM Plex Sans, 13px, weight 500, `--color-ink-900`
- Timestamp: 13px, `--color-ink-400`
- ConfidenceBadge (see §4.13) — right-aligned in the row

**Body:**
- IBM Plex Sans, 14px, weight 400, `--color-ink-700`, `line-height: 1.65`
- Margin-top: 10px

**Action row (below body, margin-top 12px):**
```
display: flex
align-items: center
gap: 16px
```

- **Upvote:** `IconThumbUp` 14px + vote count 13px. Default: `--color-ink-400`. Hover: `--color-blue-500`. Voted: `--color-blue-500` filled icon.
- **Flag:** `IconFlag` 14px, `--color-ink-400`. Hover: `#DC2626`. Already flagged: `#DC2626` + line-through on count.
- **Mark as helpful (author only):** `IconCheck` 14px + "Mark helpful" 12px weight 500. Default: `--color-ink-400`. Active: `--color-status-resolved` green. Appears only on the original poster's thread view.

**Hidden state (flagCount ≥ 3):**
```
opacity: 0.35
pointer-events: none
```
- Replaced with: `"[Answer hidden — flagged by community]"` in 12px, `--color-ink-400`, italic

---

### 4.12 StatusBar

A compact badge. Used inside `ThreadRow` (right side) and as a standalone banner inside the thread detail view.

**Badge layout:**
```
display: inline-flex
align-items: center
gap: 6px
padding: 3px 10px
border-radius: var(--radius-full)
font-size: 11px
font-weight: 600
letter-spacing: 0.03em
```

**State definitions:**

| State | Dot color | Background | Text color | Label |
|---|---|---|---|---|
| `open` | `#AAAAAA` | `#F5F5F5` | `#666666` | "Waiting" |
| `discussing` | `#E8A000` | `#FFF8E1` | `#8B5E00` | "Discussing" |
| `verifying` | `#0044FF` | `#E6EEFF` | `#0033CC` | "Verifying" |
| `community_resolved` | `#16A34A` | `#ECFDF5` | `#166534` | "Resolved" |
| `admin_resolved` | `#16A34A` | `#ECFDF5` | `#166534` | "Official" |
| `escalated` | `#DC6803` | `#FFF3E6` | `#923F00` | "Escalated" |

**Dot:**
```
width: 6px
height: 6px
border-radius: 50%
background: [state dot color]
flex-shrink: 0
```

For `discussing` state only, the dot has a subtle pulse (same `pulse-ring` keyframe as chatbot, but smaller scale).

**In-thread standalone banner:**
```
width: 100%
padding: 10px 16px
border-radius: var(--radius-md)
background: [state background]
margin-bottom: 20px
font-size: 13px
font-weight: 500
color: [state text color]
```

---

### 4.13 ConfidenceBadge

**Container:**
```
display: inline-flex
align-items: center
gap: 5px
padding: 2px 8px
border-radius: var(--radius-sm)
font-size: 11px
font-weight: 600
letter-spacing: 0.02em
```

| Score | Label | Background | Text |
|---|---|---|---|
| 0–4 | "Unverified" | `#F5F5F5` | `#888888` |
| 5–9 | "Community Pick" | `#FFFBEB` | `#92400E` |
| ≥10 | "High Confidence" | `#ECFDF5` | `#166534` |
| ≥15 + helpful + 0 flags | "Auto-publish ✦" | `#ECFDF5` | `#166534` + `IconStar` 10px |

**Enter animation:** `transform: scale(0.8) → scale(1)`, `200ms`, `--ease-spring`

---

### 4.14 AskQuestionModal

Same backdrop as ExitConfirmModal.

**Modal card:**
```
width: 520px
padding: 28px 28px 24px
border-radius: var(--radius-lg)
background: var(--color-white)
box-shadow: var(--shadow-lg)
```

**Header:**
- `"Ask the community"` — IBM Plex Sans, 18px, weight 600, `--color-ink-900`
- Subtext: 13px, `--color-ink-400` — `"Post a question for your cohort peers"`
- `IconX` close button, top-right, `--color-ink-400`

**Fields:**

*Title input:*
```
label: "Your question"  ← label-caps style
input height: 44px
font-size: 15px
placeholder: "Be specific — what exactly are you trying to figure out?"
char counter: right-aligned below input, "0 / 100", 11px ink-400
```

*Body textarea (optional):*
```
label: "More context (optional)"
height: 100px
resize: vertical, max-height 180px
font-size: 14px
placeholder: "Add details, what you've already tried, or relevant dates..."
char counter: "0 / 1500"
```

**Footer:**
- Left: Tabler `IconInfoCircle` 14px `--color-ink-400` + `"Text only — no file attachments"` 12px
- Right: "Cancel" ghost button + "Post Question" primary button

---

### 4.15 LeaderboardStrip

Located in the forum sidebar. Compact.

**Container:**
```
padding: 16px 12px
background: var(--color-ink-50)
border: 1px solid var(--color-ink-100)
border-radius: var(--radius-md)
margin-top: 24px
```

**Header:**
- `"THIS WEEK"` — label-caps, 11px, `--color-ink-400`, weight 600

**Rank rows (3 items):**
```
display: flex
align-items: center
gap: 10px
padding: 8px 0
border-bottom: 1px solid var(--color-ink-100) (not on last)
```

- Rank number: IBM Plex Mono, 12px, `--color-ink-400` — `"#1"`, `"#2"`, `"#3"`
- Avatar: 22px circle
- Name: 13px, weight 500, `--color-ink-900`
- Score: IBM Plex Mono, 12px, `--color-blue-500`, right-aligned — `"12 pts"`

**#1 rank:** Name is `--color-ink-900` weight 600. Rank number is `--color-blue-500`.

---

### 4.16 EscalationForm (Page 3)

**Page wrapper:**
```
max-width: 560px
margin: 80px auto
padding: 0 24px
```

**Page heading:**
- `"Submit to Admin"` — IBM Plex Sans, 22px, weight 600, `--color-ink-900`
- Subtext: 14px, `--color-ink-400`, `line-height: 1.6`
- `"Your question hasn't been answered by peers in 72 hours. Submit it for an official response."`

**Status banner (above form):**
- StatusBar badge (orange/escalated) + thread title, shown as context
- `padding: 12px 16px; background: #FFF3E6; border-radius: radius-md; margin-bottom: 28px`

**Form:**
- Thread title: read-only input, `background: var(--color-ink-50)`, `--color-ink-400`, italic
- Question summary: textarea, 120px height, required, `"Rephrase your question clearly for the admin..."`
- Char counter: `"0 / 500"`

**Submit button:** Full-width primary, "Submit to Admin", 44px height

**Below form:**
- 12px `--color-ink-400` centered: `"Expect a response within 24–48 hours. You'll be notified by email."`

---

### 4.17 AdminQueue Card

Used inside `AdminQueue.jsx`. Three variants (Approve / Override / Fresh).

**Base card:**
```
background: var(--admin-surface)
border: 1px solid var(--admin-border)
border-radius: var(--radius-md)
padding: 20px
margin-bottom: 12px
```

**Header row:**
- Task type chip: `"APPROVE"` / `"OVERRIDE"` / `"FRESH"` — label-caps, 10px, `--radius-sm`, 3px 8px padding
  - Approve: `background: #1A2F1A; color: #4ADE80`
  - Override: `background: #2F1A1A; color: #FCA5A5`
  - Fresh: `background: #1A1E2F; color: #93C5FD`
- Timestamp: IBM Plex Mono, 11px, `--admin-ink-400`, right-aligned
- Thread title: IBM Plex Sans, 15px, weight 500, `--admin-ink-900`, margin-top 8px

**Body:**
- Answer/summary text: 13px, `--admin-ink-400`, `line-height: 1.6`, `max-height: 72px`, overflow hidden with "Show more" link
- Confidence score (Approve only): ConfidenceBadge rendered in dark variant

**Admin text input (Override + Fresh):**
```
margin-top: 14px
width: 100%
height: 80px
background: var(--admin-bg)
border: 1px solid var(--admin-border)
border-radius: var(--radius-sm)
color: var(--admin-ink-900)
font-size: 13px
padding: 10px 12px
resize: vertical
```
Focus: `border-color: var(--color-blue-500)`

**Action row:**
- Right-aligned, gap 8px
- "Publish to FAQ" — primary button (blue), 32px height, 12px text
- "Dismiss" — ghost/text button, `--admin-ink-400`

---

### 4.18 CohortPulseChart

**Container:** Full-width of admin content area, `height: 240px`

**Chart type:** Recharts heatmap (custom `Cell`-based `BarChart` with square cells)

**Axes:**
- X-axis: Last 14 days, format `"May 12"` — IBM Plex Mono, 10px, `--admin-ink-400`
- Y-axis: FAQ categories — IBM Plex Sans, 12px, `--admin-ink-400`

**Cell colors (based on activity intensity):**
```
0 activity:    #1A1A1A  (near-invisible)
Low:           #0A1A3A  (dark blue tint)
Medium:        #0033AA  (mid blue)
High:          #0044FF  (full blue)
Very high:     #3366FF  (bright blue, oversaturated)
```

**Tooltip:** Custom tooltip — `background: #000; border: 1px solid admin-border; padding: 10px 14px; border-radius: radius-sm`
- Category name, date, event count breakdown (`search_hit`, `helpful_no`, `forum_posts`)

**Section title:**
- `"COHORT PULSE — LAST 14 DAYS"` — label-caps above chart, `--admin-ink-400`

---

### 4.19 GapReport

**Container:**
```
background: var(--admin-surface)
border: 1px solid var(--admin-border)
border-radius: var(--radius-md)
overflow: hidden
```

**Header:**
```
padding: 14px 20px
border-bottom: 1px solid var(--admin-border)
```
- `"GAP REPORT"` label-caps + `"Updated: [timestamp]"` 11px mono, right-aligned, `--admin-ink-400`

**Row:**
```
padding: 12px 20px
border-bottom: 1px solid var(--admin-border)
display: flex
align-items: center
gap: 14px
cursor: pointer
transition: background 100ms

Hover: background: rgba(255,255,255,0.03)
```

**Gap indicator:**
- `width: 4px; height: 32px; border-radius: 2px; flex-shrink: 0`
- Color: `--color-gap-red`, `--color-gap-yellow`, or `--color-gap-green`

**Category name:** IBM Plex Sans, 14px, weight 500, `--admin-ink-900`

**Gap score:** IBM Plex Mono, 13px, right-aligned, `--admin-ink-400`

**Signal tags (inline):**
- Small chips: `"Posted 4×"`, `"Low helpful_yes"`, etc.
- `background: rgba(255,255,255,0.06)`, `border: 1px solid admin-border`, 11px, `--admin-ink-400`, `padding: 2px 6px`, `--radius-sm`

---

### 4.20 Buttons

**Primary:**
```
height: 36px  (32px compact, 44px large)
padding: 0 16px
background: var(--color-blue-500)
color: white
font-size: 13px
font-weight: 600
border-radius: var(--radius-sm)
border: none
cursor: pointer
transition: background 100ms, transform 80ms

Hover:   background: var(--color-blue-600)
Active:  transform: scale(0.98)
Focus:   outline: 2px solid var(--color-blue-100); outline-offset: 2px
```

**Ghost:**
```
height: 36px
padding: 0 16px
background: transparent
color: var(--color-ink-700)
font-size: 13px
font-weight: 500
border-radius: var(--radius-sm)
border: 1px solid var(--color-ink-200)

Hover:  background: var(--color-ink-100); border-color: var(--color-ink-400)
Active: transform: scale(0.98)
```

**Text/Link:**
```
background: transparent
border: none
color: var(--color-blue-500)
font-size: 13px
font-weight: 500
padding: 0
cursor: pointer
text-decoration: none

Hover: text-decoration: underline
       text-underline-offset: 3px
```

**Destructive (admin only):**
```
Same as Primary but:
background: #DC2626
Hover: background: #B91C1C
```

**Disabled state (all variants):**
```
opacity: 0.45
cursor: not-allowed
pointer-events: none
```

**Icon button:**
```
width: 32px
height: 32px
display: flex
align-items: center
justify-content: center
border-radius: var(--radius-sm)
background: transparent
border: none
color: var(--color-ink-400)
cursor: pointer

Hover: background: var(--color-ink-100); color: var(--color-ink-900)
```

---

### 4.21 Form Inputs

**Text input:**
```
height: 40px
width: 100%
padding: 0 12px
background: var(--color-white)
border: 1.5px solid var(--color-ink-200)
border-radius: var(--radius-md)
font-family: var(--font-body)
font-size: 14px
color: var(--color-ink-900)
outline: none
transition: border-color 100ms, box-shadow 100ms

Focus:
  border-color: var(--color-blue-500)
  box-shadow: 0 0 0 3px var(--color-blue-100)

Error:
  border-color: #DC2626
  box-shadow: 0 0 0 3px rgba(220,38,38,0.1)

Disabled:
  background: var(--color-ink-100)
  color: var(--color-ink-400)
  cursor: not-allowed
```

**Label:**
```
display: block
margin-bottom: 6px
font-size: 11px
font-weight: 600
letter-spacing: 0.08em
text-transform: uppercase
color: var(--color-ink-400)
```

**Textarea:** Same as text input. `resize: vertical`. Min-height: 80px.

**Read-only input:**
```
background: var(--color-ink-50)
color: var(--color-ink-400)
border-color: var(--color-ink-100)
font-style: italic
cursor: default
```

**Character counter:**
```
display: flex
justify-content: flex-end
margin-top: 4px
font-family: IBM Plex Mono
font-size: 11px
color: var(--color-ink-400)
```
Near-limit (>80%): `color: #CA8A04`  
At-limit: `color: #DC2626`

---

### 4.22 Toast Notifications

Powered by `react-hot-toast`. Custom styled via `toastOptions`.

**Base:**
```
background: var(--color-ink-900)
color: var(--color-white)
border-radius: var(--radius-md)
padding: 12px 16px
font-family: IBM Plex Sans
font-size: 13px
font-weight: 500
max-width: 320px
box-shadow: var(--shadow-md)

Enter: translateX(100%) → translateX(0), 280ms ease-out
Exit:  translateX(0) → translateX(100%), 200ms ease-in
```

**Success variant:**
- Left border: `4px solid var(--color-status-resolved)` (green)
- Icon: `IconCheck` 15px, green

**Error variant:**
- Left border: `4px solid #DC2626`
- Icon: `IconAlertCircle` 15px, `#DC2626`

**Info variant:**
- Left border: `4px solid var(--color-blue-500)`
- Icon: `IconInfoCircle` 15px, blue

**Position:** top-right, `top: 64px` (below header), `right: 16px`

---

## 5. Page Designs

### 5.1 Page 1 — Public FAQ (`/faq`)

#### Full Layout (Desktop)

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER [56px] VINS · Yaksha             Overview  FAQ  samagama  │
├────────────────┬─────────────────────────────────────────────────┤
│                │                                                  │
│  SIDEBAR       │  [HERO SECTION]                                  │
│  224px sticky  │  ┌────────────────────────────────────────┐     │
│                │  │ "Find your answer." [DM Serif, 36px]   │     │
│  [icon] NOC ●  │  │ "Official answers for the VINS cohort" │     │
│  [icon] Offer  │  │ [subtitle, 14px ink-400]               │     │
│  [icon] ViBe   │  └────────────────────────────────────────┘     │
│  [icon] Team   │                                                  │
│  [icon] Stipend│  ┌───────────────────────────────────────────┐  │
│  [icon] Dates  │  │ 🔍  Search questions, topics...          │  │
│                │  └───────────────────────────────────────────┘  │
│  ────────────  │  [NOC]  [Offer Letter]  [Dates]  [Stipend]      │
│                │                                                  │
│  DISCUSSION    │  ┌─ DEADLINE BANNER (if active) ───────────────┐│
│  All Threads   │  │ 📅 Phase 1 is live — ...   [ViBe] [Teams]  ││
│  My Posts      │  └───────────────────────────────────────────┘  │
│                │                                                  │
│                │  [All]  [Resolved]  [Escalation-sourced]        │
│                │                                                  │
│                │  ┌──────────────────────────────────────────┐   │
│                │  │ ▌ What is ViBe Platform?     47 helpful ▾│   │
│                │  │──────────────────────────────────────────│   │
│                │  │ ViBe is the... [answer text]             │   │
│                │  │ 💬 peer footnote (if present)            │   │
│                │  │ 👍 47 interns found this helpful         │   │
│                │  └──────────────────────────────────────────┘   │
│                │                                                  │
│                │  ┌──────────────────────────────────────────┐   │
│                │  │ ▌ When is the NOC deadline?   12 helpful ▾│  │
│                │  └──────────────────────────────────────────┘   │
│                │                                                  │
└────────────────┴─────────────────────────────────────────────────┘
                                  [💬 chatbot FAB, bottom-right]
                                  [↑ back-to-top, above chatbot]
```

#### Hero Section Detail

- `padding-top: 48px; padding-bottom: 32px`
- `"Find your answer."` — DM Serif Display, 36px, weight 400, `--color-ink-900`, `letter-spacing: -0.02em`
- Subtitle — IBM Plex Sans, 14px, `--color-ink-400`, `margin-top: 6px`
- SearchBar — `margin-top: 24px`
- Popular chips — `margin-top: 12px`
- Deadline banner — `margin-top: 24px` (only if active)
- FilterTabs — `margin-top: 24px`
- First AccordionCard — `margin-top: 16px`

#### Page Load Animation Sequence

```
0ms:    Sidebar fades in (opacity 0→1, 300ms)
60ms:   Hero text slides up 8px + fades in (300ms)
120ms:  SearchBar fades in (250ms)
160ms:  Popular chips fade in (200ms)
200ms:  AccordionCard 1 (200ms)
220ms:  AccordionCard 2 (200ms)
240ms:  AccordionCard 3 (200ms)
... +20ms per card, capped at 10 cards animated (rest load instantly)
```

---

### 5.2 Page 2 — Discussion Forum (`/forum`)

#### Full Layout (Desktop)

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER [56px]  Yaksha                          [🔔] [avatar]     │
├────────────────┬─────────────────────────────────────────────────┤
│                │                                                  │
│  SIDEBAR       │  ┌────────────────┐  ┌──────────────────────┐  │
│  224px         │  │ 🔍 Search...   │  │  + Ask a Question    │  │
│                │  └────────────────┘  └──────────────────────┘  │
│  [icon] NOC    │                                                  │
│  [icon] Offer  │  [All · 48]  [Unresolved · 12]  [Resolved]     │
│  ...           │               [My Posts]                         │
│                │  ────────────────────────────────────────────   │
│  ────────────  │                                                  │
│                │  ▲ 14   What exactly is the NOC process?        │
│  THIS WEEK     │         Submit form by May 20, not sure about…  │
│  #1 Rahul  12  │         Priya · 2h ago · 3 answers              │
│  #2 Arun    9  │         [● Being discussed]                     │
│  #3 Meera   7  │  ────────────────────────────────────────────   │
│                │                                                  │
│                │  ▲  8   Is ViBe login same as LDAP?             │
│                │         Can we use college email or…            │
│                │         Amit · 5h ago · 1 answer                │
│                │         [● Waiting]                             │
│                │  ────────────────────────────────────────────   │
│                │                                                  │
│                │  ▲ 23   Stipend release date?    🔥 popular     │
│                │         Already past 15th, no…                  │
│                │         Riya · 1d ago · 7 answers               │
│                │         [● Resolved]                            │
└────────────────┴─────────────────────────────────────────────────┘
```

#### Forum Search Bar (Inline, Page 2)

- Narrower than Page 1 search — `flex: 1`, shares row with "Ask a Question" button
- Height: 40px
- Placeholder: `"Search active discussions…"`
- No hero section — forum is utility-first

#### "Ask a Question" Button

- `height: 40px; padding: 0 16px`
- `background: var(--color-blue-500)`, white text, weight 600, 13px
- `border-radius: var(--radius-sm)`
- Prefix: `IconPlus` 14px

---

### 5.3 Page 3 — Escalation (`/escalate`)

**Minimal, focused, single-task page.**

```
┌──────────────────────────────────────────────────────────────────┐
│ HEADER [56px]  Yaksha                          [🔔] [avatar]     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│         (centered column, max-width 560px)                       │
│                                                                  │
│   ← Back to forum                                                │
│                                                                  │
│   Submit to Admin                     [heading-1]                │
│   Your question hasn't been answered  [body, ink-400]            │
│   by peers in 72 hours...                                        │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ [● Escalated]  "What is the NOC process?"               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   YOUR QUESTION (read-only)                                      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ What is the NOC process?                                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   REPHRASE FOR ADMIN                                             │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                                                         │   │
│   │                                                 0 / 500 │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   [          Submit to Admin — full width primary          ]     │
│                                                                  │
│   ℹ  Expect a response within 24–48 hours.                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**"← Back to forum" link:**
- Tabler `IconArrowLeft` 14px + "Back to forum" — IBM Plex Sans, 13px, `--color-ink-400`
- Hover: `--color-ink-900`
- `margin-bottom: 32px`

---

### 5.4 Admin Dashboard (`/admin`)

**Theme:** `.admin-theme` class on `<body>`. Dark mode throughout.

```
┌──────────────────────────────────────────────────────────────────┐
│ ADMIN HEADER  [Yaksha Admin]  [VINS 2026]      [logout]          │
│ bg: admin-surface, border-bottom: admin-border                   │
├────────────┬─────────────────────────────────────────────────────┤
│            │                                                      │
│  ADMIN     │  ┌────────────────────────────────────────────┐     │
│  SIDEBAR   │  │ COHORT PULSE — LAST 14 DAYS               │     │
│  110px     │  │ [heatmap recharts, 14×N cells, blue tones] │     │
│            │  └────────────────────────────────────────────┘     │
│  [Queue]   │                                                      │
│  [Pulse]   │  QUEUE   [3 APPROVE]  [2 OVERRIDE]  [1 FRESH]       │
│  [Gaps]    │  ──────────────────────────────────────────────     │
│  [Settings]│                                                      │
│            │  ┌──── APPROVE ──────────────────────────────────┐  │
│            │  │ "ViBe Platform login uses college LDAP…"      │  │
│            │  │ [High Confidence ✦]    Meera · 3h ago        │  │
│            │  │ [Publish to FAQ]  [Dismiss]                   │  │
│            │  └───────────────────────────────────────────────┘  │
│            │                                                      │
│            │  ┌──── OVERRIDE ─────────────────────────────────┐  │
│            │  │ ⚑ 3 flags — "The deadline is May 10th"        │  │
│            │  │ ┌──────────────────────────────────────────┐  │  │
│            │  │ │ Write the correct answer…                │  │  │
│            │  │ └──────────────────────────────────────────┘  │  │
│            │  │ [Publish Override]  [Dismiss]                 │  │
│            │  └───────────────────────────────────────────────┘  │
│            │                                                      │
│            │  GAP REPORT                                          │
│            │  ┌───────────────────────────────────────────────┐  │
│            │  │ ■ NOC              92  [Posted 4×] [Low ✓]   │  │
│            │  │ ▪ Stipend          47  [High 🔍 low ✓]       │  │
│            │  │ ▫ ViBe Platform    12                         │  │
│            │  └───────────────────────────────────────────────┘  │
│            │                                                      │
└────────────┴─────────────────────────────────────────────────────┘
```

**Admin sidebar (narrow, 110px):**
- Icon + label stacked vertically, each item 72px tall
- Icons: 22px, `--admin-ink-400`; active: `--color-blue-500`
- Labels: 10px, letter-spacing 0.06em, uppercase

**Queue task-type filter chips:**
- `[3 APPROVE]` `[2 OVERRIDE]` `[1 FRESH]` — inline horizontal, each chip shows count + type
- Active chip: filled blue. Inactive: `--admin-border` bordered.
- Clicking filters the queue list below

---

## 6. Interaction States

Every interactive element must have all five states defined. No exceptions.

| State | Description |
|---|---|
| **Default** | Normal resting state |
| **Hover** | Mouse over (desktop only) — `100ms` transition |
| **Active / Pressed** | Mouse down — `scale(0.98)` or color darken |
| **Focus** | Keyboard navigation — `outline: 2px solid blue-100; outline-offset: 2px` |
| **Disabled** | `opacity: 0.45; pointer-events: none` |

Additionally:

| State | Component | Visual |
|---|---|---|
| **Voted** | Upvote button, ThreadRow vote count | Icon + number → blue |
| **Flagged** | Flag button | Icon → red, cursor disabled |
| **Expanded** | AccordionCard | Chevron rotated, border → blue |
| **Selected** | FilterTab | Blue underline, weight 600 |
| **Loading** | Submit buttons | Inline spinner (Tabler `IconLoader2` rotating, 16px) replaces label |
| **Error** | Inputs | Red border + error text below input, 11px red |

---

## 7. Responsive Breakpoints

```css
/* Mobile first */
--bp-sm:  640px;   /* Large mobile, small tablet */
--bp-md:  768px;   /* Tablet */
--bp-lg:  1024px;  /* Small laptop */
--bp-xl:  1280px;  /* Desktop (target) */
```

### Responsive Behavior Per Page

**Page 1 (< 768px):**
- Sidebar hidden; replaced by a horizontal scrollable category chip row below the search bar
- Header nav links collapsed into a hamburger menu (IconMenu2 → drawer)
- AccordionCards: full-width, padding reduced to 12px
- ChatbotWidget: button stays fixed bottom-right; panel opens full-width (100vw - 32px) instead of 340px

**Page 2 (< 768px):**
- Sidebar hidden
- LeaderboardStrip moves to bottom of thread list as a `<section>` heading strip
- AskQuestionModal: full-screen (covers header too), 0 border-radius

**Page 3:** Single-column by default; no changes needed below tablet

**Admin (< 1024px):** Admin is not designed for mobile. Show a "Please use a larger screen" message below 768px.

---

## 8. Iconography

All icons from **Tabler Icons** (`@tabler/icons-react`). Size convention:

| Context | Size |
|---|---|
| Inline with text (body) | 14px |
| Inline with text (small/label) | 13px |
| Button icon | 14–16px |
| Sidebar nav | 16px |
| Header | 18–20px |
| Standalone emphasis | 22–24px |

**Stroke width:** 1.5px (Tabler default). Do not change.

**Icon–label gap:** Always `6–8px` (never touching text, never too spaced).

### Icon Mapping

| Concept | Tabler Icon |
|---|---|
| Search | `IconSearch` |
| Question / Ask | `IconMessageCircle2` |
| Answer / Reply | `IconMessage` |
| Upvote | `IconChevronUp` |
| Flag | `IconFlag` |
| Mark helpful | `IconCheck` / `IconCircleCheck` |
| Resolved / Published | `IconCircleCheckFilled` (green) |
| Escalated | `IconAlertTriangle` |
| Admin | `IconShield` |
| Notification bell | `IconBell` |
| Calendar / Deadline | `IconCalendarEvent` |
| Dismiss / Close | `IconX` |
| Expand | `IconChevronDown` |
| Back | `IconArrowLeft` |
| Leaderboard | `IconTrophy` |
| Settings | `IconSettings` |
| Analytics | `IconChartBar` |
| Gap report | `IconBulb` |
| Popular / Hot | `IconFlame` |
| Peer footnote | `IconQuote` |
| No results | `IconMoodEmpty` |
| Info | `IconInfoCircle` |
| Loading | `IconLoader2` (animated rotation) |

---

## 9. Accessibility

### Requirements (WCAG 2.1 AA Minimum)

- **Color contrast:** All body text (ink-700 on white): 7.5:1. All metadata (ink-400 on white): 4.6:1. Blue (#0044FF) on white: 5.0:1. All pass AA.
- **Focus indicators:** All interactive elements have `outline: 2px solid var(--color-blue-100); outline-offset: 2px` on keyboard focus. Never `outline: none` without replacement.
- **Keyboard navigation:** Full tab order. AccordionCards toggle on `Enter`/`Space`. Modals trap focus. `Escape` closes modals and the chatbot panel.
- **ARIA labels:**
  - SearchBar: `aria-label="Search FAQ"`
  - Upvote button: `aria-label="Upvote this thread, currently N votes"` + `aria-pressed`
  - Flag button: `aria-label="Flag this answer"` + `aria-pressed`
  - AccordionCard header: `aria-expanded={true|false}` + `aria-controls="[panel-id]"`
  - StatusBar badge: `role="status"` + `aria-live="polite"`
  - Modal: `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- **Screen reader:** Thread vote counts use `<span class="sr-only">votes</span>` after the number. Status badges have their full label as `aria-label` (not just the dot).
- **Motion sensitivity:** All animations respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
  ```
- **Touch targets:** All tap targets minimum 44×44px on mobile (even if visually smaller — use padding).

---

## 10. Tailwind Configuration

`tailwind.config.js` — extend section only. All tokens mapped to Tailwind classes.

```js
module.exports = {
  content: ['./src/**/*.{jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body:    ['"IBM Plex Sans"', '"Helvetica Neue"', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '1.0' }],
        xs:    ['13px', { lineHeight: '1.5' }],
        sm:    ['14px', { lineHeight: '1.65' }],
        base:  ['15px', { lineHeight: '1.5' }],
        md:    ['16px', { lineHeight: '1.4' }],
        lg:    ['18px', { lineHeight: '1.35' }],
        xl:    ['22px', { lineHeight: '1.3' }],
        '2xl': ['28px', { lineHeight: '1.25' }],
        '3xl': ['36px', { lineHeight: '1.2' }],
      },
      colors: {
        ink: {
          900: '#0A0A0A',
          700: '#333333',
          400: '#888888',
          200: '#C8C8C8',
          100: '#EFEFEF',
          50:  '#F7F7F7',
        },
        blue: {
          600: '#0033CC',
          500: '#0044FF',
          100: '#E6EEFF',
        },
        status: {
          open:      '#AAAAAA',
          discuss:   '#E8A000',
          verifying: '#0044FF',
          resolved:  '#16A34A',
          escalated: '#DC6803',
        },
        admin: {
          bg:      '#0D0D0D',
          surface: '#161616',
          border:  '#2A2A2A',
        },
      },
      borderRadius: {
        sm: '3px',
        md: '6px',
        lg: '12px',
      },
      spacing: {
        4.5: '18px',
        13:  '52px',
        14:  '56px',  /* header height */
        56:  '224px', /* sidebar width */
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        md: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        lg: '0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)',
      },
      transitionTimingFunction: {
        'out':    'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        fast:   '100ms',
        base:   '180ms',
        slow:   '280ms',
        xslow:  '400ms',
      },
      maxWidth: {
        content: '720px',
        page:    '1200px',
      },
      zIndex: {
        sticky:   '10',
        header:   '20',
        dropdown: '30',
        chatbot:  '40',
        overlay:  '55',
        toast:    '50',
        modal:    '60',
      },
    },
  },
  plugins: [],
}
```

### Global CSS Additions (`global.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--color-ink-900);
    background: var(--color-ink-50);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  *, *::before, *::after { box-sizing: border-box; }
  ::selection { background: var(--color-blue-100); color: var(--color-ink-900); }
}

@layer components {
  .label-caps {
    @apply font-body text-2xs font-semibold uppercase tracking-widest text-ink-400;
  }
  .card {
    @apply bg-white border border-ink-200 rounded-md;
  }
  .card-hover {
    @apply hover:border-ink-400 transition-colors duration-fast;
  }
  .input-base {
    @apply h-10 w-full px-3 bg-white border-[1.5px] border-ink-200 rounded-md
           font-body text-sm text-ink-900 outline-none
           focus:border-blue-500 focus:shadow-[0_0_0_3px_#E6EEFF]
           transition-[border-color,box-shadow] duration-fast;
  }
  .btn-primary {
    @apply h-9 px-4 bg-blue-500 text-white text-xs font-semibold rounded-sm
           border-none cursor-pointer
           hover:bg-blue-600 active:scale-[0.98]
           focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-100 focus-visible:outline-offset-2
           transition-[background,transform] duration-fast;
  }
  .btn-ghost {
    @apply h-9 px-4 bg-transparent text-ink-700 text-xs font-medium rounded-sm
           border border-ink-200 cursor-pointer
           hover:bg-ink-100 hover:border-ink-400 active:scale-[0.98]
           transition-[background,border-color,transform] duration-fast;
  }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

*This Design System is the authoritative visual reference for Yaksha FAQ Platform V1. Every component, spacing value, color, and interaction must be implemented exactly as specified. Pixel-level precision is expected. Design decisions not covered here should default to the nearest established pattern — never introduce new visual styles without documenting them here first.*
