---
name: Yaksha
colors:
  surface: '#fbf8ff'
  surface-dim: '#d9d9e7'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f2ff'
  surface-container: '#edecfb'
  surface-container-high: '#e7e7f5'
  surface-container-highest: '#e2e1f0'
  on-surface: '#191b25'
  on-surface-variant: '#434657'
  inverse-surface: '#2e303b'
  inverse-on-surface: '#f0effe'
  outline: '#747688'
  outline-variant: '#c4c5da'
  surface-tint: '#0044fe'
  primary: '#0032c4'
  on-primary: '#ffffff'
  primary-container: '#0044ff'
  on-primary-container: '#d2d7ff'
  inverse-primary: '#b9c3ff'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#8d1800'
  on-tertiary: '#ffffff'
  tertiary-container: '#b72402'
  on-tertiary-container: '#ffcec3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dee1ff'
  primary-fixed-dim: '#b9c3ff'
  on-primary-fixed: '#001158'
  on-primary-fixed-variant: '#0032c3'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c9c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#ffdad3'
  tertiary-fixed-dim: '#ffb4a4'
  on-tertiary-fixed: '#3d0600'
  on-tertiary-fixed-variant: '#8c1800'
  background: '#fbf8ff'
  on-background: '#191b25'
  surface-variant: '#e2e1f0'
  ink-900: '#0A0A0A'
  ink-700: '#333333'
  ink-400: '#888888'
  ink-200: '#C8C8C8'
  ink-100: '#EFEFEF'
  ink-50: '#F7F7F7'
  blue-600: '#0033CC'
  blue-100: '#E6EEFF'
  status-open: '#AAAAAA'
  status-discuss: '#E8A000'
  status-verifying: '#0044FF'
  status-resolved: '#16A34A'
  status-escalated: '#DC6803'
  conf-unverified: '#888888'
  conf-community: '#CA8A04'
  conf-high: '#16A34A'
  admin-bg: '#0D0D0D'
  admin-surface: '#161616'
  admin-border: '#2A2A2A'
typography:
  display-lg:
    fontFamily: DM Serif Display
    fontSize: 36px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: DM Serif Display
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.3'
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-mono:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  header-height: 56px
  sidebar-width: 224px
  content-max-width: 720px
  container-margin: 24px
  gutter: 16px
---

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

---

## 2. Design Tokens

### 2.1 Color Palette

```css
:root {
  --color-ink-900:     #0A0A0A;
  --color-ink-700:     #333333;
  --color-ink-400:     #888888;
  --color-ink-200:     #C8C8C8;
  --color-ink-100:     #EFEFEF;
  --color-ink-50:      #F7F7F7;
  --color-white:       #FFFFFF;

  --color-blue-600:    #0033CC;
  --color-blue-500:    #0044FF;
  --color-blue-100:    #E6EEFF;

  --color-status-open:       #AAAAAA;
  --color-status-discuss:    #E8A000;
  --color-status-verifying:  #0044FF;
  --color-status-resolved:   #16A34A;
  --color-status-escalated:  #DC6803;

  --color-conf-unverified:   #888888;
  --color-conf-community:    #CA8A04;
  --color-conf-high:         #16A34A;

  --admin-bg:          #0D0D0D;
  --admin-surface:     #161616;
  --admin-border:      #2A2A2A;
}
```

### 2.2 Typography

- **Display:** 'DM Serif Display', Georgia, serif
- **Body:** 'IBM Plex Sans', 'Helvetica Neue', sans-serif
- **Mono:** 'IBM Plex Mono', 'Courier New', monospace

---

## 3. Layout System

Desktop (≥1280px):
- Header: 56px sticky
- Sidebar: 224px fixed sticky
- Content Column: max-width 720px, centered

---

## 4. Components

- **SearchBar:** 56px height, 1.5px border-ink-200, 2px bottom border. Blue focus state.
- **AccordionCard:** 1px border-ink-200, 6px radius. Blue focus state. 2px left accent.
- **FilterTabs:** Border-bottom 1px ink-200, active tab 2px blue underline.
- **StatusBar:** Compact badge with dot and text.
- **ConfidenceBadge:** Compact score badge with semantic colors.

---

## 5. Page Designs

- **Page 1 (FAQ):** Hero with "Find your answer." DM Serif 36px. Content list with AccordionCards.
- **Page 2 (Forum):** Search + Ask button. Thread list with ThreadRow (vote column + status badge).
- **Page 3 (Escalation):** Simple form for admin submission.
- **Admin Dashboard:** Dark theme, heatmap chart, queue cards, gap report.
