# Alchemical Agent Ecosystem — Brand Guide
### Magnum Opus (v2.0) Visual Identity System

> **"Where Intelligence is Forged, Not Fetched."**
> *The Magnum Opus of local-first AI orchestration.*

---

## Table of Contents

1. [Visual Identity](#1-visual-identity)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Logo Usage Rules](#4-logo-usage-rules)
5. [Glow Effects Guidelines](#5-glow-effects-guidelines)
6. [Animation Principles](#6-animation-principles)
7. [Voice & Tone](#7-voice--tone)
8. [Badge Styles](#8-badge-styles)
9. [Asset Files](#9-asset-files)
10. [Export Commands](#10-export-commands)

---

## 1. Visual Identity

### Project Name

**Alchemical Agent Ecosystem**

The full name is always written with each word capitalized. Never abbreviated as "AAE" in user-facing contexts. In code, identifiers, and CLI commands, `alchemical-agent-ecosystem` (kebab-case) or `AlchemicalAgentEcosystem` (PascalCase) are acceptable.

### Version Codename

**Magnum Opus** — v2.0

The codename is always written as two words, capitalized: *Magnum Opus*. It is never shortened to "MO". In versioned references, the format is `v2.0 "Magnum Opus"` (name in quotes).

### Taglines

| Context | Tagline |
|---|---|
| Primary | *Where Intelligence is Forged, Not Fetched.* |
| Sub-tagline | *The Magnum Opus of local-first AI orchestration.* |
| Short form | *Forge Intelligence.* |

The primary tagline is used on the hero section of the README, the landing page, and social cards. The sub-tagline accompanies it when space permits. The short form is used in space-constrained contexts (e.g., metadata descriptions, app store summaries).

Taglines are always rendered in sentence case with a terminal period. Never all-caps. Never truncated.

### Mascot: The Philosopher's Engine

The mascot of the Alchemical Agent Ecosystem is **The Philosopher's Engine** — a geometric hexagonal prism that glows with inner light. It represents the synthesis of ancient alchemical pursuit with modern computational intelligence.

**Conceptual attributes:**

- **Form:** A regular hexagonal prism, slightly elongated on the vertical axis, with clean beveled edges. Each face contains faint, engraved runic circuits — geometric patterns that suggest both circuit boards and alchemical sigils.
- **Glow:** The prism emits light from within, pulsing slowly in Aether (`#00FFAA`) at rest and shifting to Aurum (`#FFD700`) when active or processing. The glow is soft and diffuse, not harsh.
- **Material:** The surface reads as dark obsidian glass — translucent but deep, with internal luminescence visible through the faces.
- **Animation:** At rest, the prism rotates slowly on the vertical axis (one full revolution per 20 seconds). During active agent processing, the rotation accelerates and the glow intensifies. On task completion, the prism emits a brief radiant burst before returning to rest.
- **Usage:** The Philosopher's Engine appears in loading states, onboarding screens, the about page, and as a hero element. It is never used as a simple icon — its animated nature is integral. Static representations should show the prism at approximately 30° rotation with glow visible.

---

## 2. Color Palette

The Magnum Opus palette is built for dark environments. Every color is designed to be used on deep-obsidian backgrounds. **No color in this palette is intended for use on white or light-gray surfaces.**

### Core Swatches

| Name | Hex | RGB | Usage |
|---|---|---|---|
| Obsidian | `#0A0A0A` | `rgb(10, 10, 10)` | Primary backgrounds, page root |
| Obsidian Soft | `#111118` | `rgb(17, 17, 24)` | Secondary backgrounds, sidebars |
| Obsidian Mid | `#16161F` | `rgb(22, 22, 31)` | Card backgrounds, panel surfaces |
| Arcane | `#4B0082` | `rgb(75, 0, 130)` | Primary accent, section headers, active nav |
| Arcane Glow | `#9D4EDD` | `rgb(157, 78, 221)` | Interactive elements, hover states, focus rings |
| Aurum | `#FFD700` | `rgb(255, 215, 0)` | Call-to-action buttons, highlights, key borders |
| Aether | `#00FFAA` | `rgb(0, 255, 170)` | Success states, live indicators, emerald accents |
| Crimson | `#FF2D55` | `rgb(255, 45, 85)` | Errors, destructive actions, critical alerts |
| Mist | `#E8E8FF` | `rgb(232, 232, 255)` | Primary body text, headings on dark surfaces |
| Mist Dim | `#A0A0C0` | `rgb(160, 160, 192)` | Secondary text, captions, disabled labels |

### Usage Rules

**Obsidian / Obsidian Soft / Obsidian Mid**

These three values form the layered depth system of any surface. Obsidian (`#0A0A0A`) is reserved for the absolute root layer — the `<body>` background or the outermost shell of the application. Obsidian Soft (`#111118`) is used one level up: sidebars, drawers, persistent navigation. Obsidian Mid (`#16161F`) is for content surfaces: cards, modals, panels, and input fields. Never invert this layering — darker always means deeper, never elevated.

**Arcane & Arcane Glow**

Arcane (`#4B0082`) is a deep indigo-violet used exclusively as an accent — never as a text color on dark backgrounds (insufficient contrast). It is suitable for: active state fills on nav items, decorative borders, gradient start points, and section dividers. Arcane Glow (`#9D4EDD`) is its luminous counterpart, used when interaction is in progress: hover states, focus outlines, active tab underlines, and icon fills for selected states. The two values are always used together as a hover pair — rest state uses Arcane, hover/focus uses Arcane Glow.

**Aurum**

Aurum (`#FFD700`) is the attention color. It is used sparingly and with intent. Apply it to: primary call-to-action buttons, the key border or highlight on the most important UI element per view, gold star ratings, and decorative alchemical accent lines. Do not use Aurum for large fills — it is a highlight color. Never use it for body text. When used as a border, 1px–2px width is standard; thicker borders dilute impact.

**Aether**

Aether (`#00FFAA`) communicates success, health, and live activity. Use it for: success toast notifications, "connected" or "running" status indicators, progress bars that represent completion, and the pulsing glow on active agent nodes. It may be used as text on dark backgrounds (contrast ratio is adequate) but only for status labels, not body copy.

**Crimson**

Crimson (`#FF2D55`) is reserved for states that require immediate attention: error messages, failed agent states, destructive action confirmations, and critical system alerts. It is never used decoratively. Crimson text must always be accompanied by a non-color indicator (icon, label, or border) to maintain accessibility.

**Mist & Mist Dim**

Mist (`#E8E8FF`) is the primary text color for all body copy, headings, and UI labels on obsidian surfaces. The subtle blue tint prevents the harshness of pure white while preserving readability. Mist Dim (`#A0A0C0`) is used for supporting text: metadata, timestamps, placeholder text, secondary descriptions, and disabled UI elements. Never use pure white (`#FFFFFF`) for body text — always use Mist.

### Gradients

| Name | Definition | Usage |
|---|---|---|
| Arcane Veil | `linear-gradient(135deg, #0A0A0A 0%, #111118 50%, #16161F 100%)` | Page hero backgrounds |
| Philosopher's Gradient | `linear-gradient(180deg, #4B0082 0%, #9D4EDD 100%)` | Feature highlight panels |
| Aurum Edge | `linear-gradient(90deg, transparent 0%, #FFD700 50%, transparent 100%)` | Decorative horizontal dividers |
| Aether Pulse | `radial-gradient(ellipse at center, #00FFAA22 0%, transparent 70%)` | Active node background halo |

---

## 3. Typography

### Font Stack

| Role | Family | Source | Fallback |
|---|---|---|---|
| Display / Headers | Cinzel | Google Fonts | `Georgia, serif` |
| Body / UI | Inter | Google Fonts | `system-ui, sans-serif` |
| Monospace / Code | JetBrains Mono | Google Fonts / JetBrains | `'Courier New', monospace` |
| Decorative | Uncial Antiqua | Google Fonts | `Georgia, serif` |

### Font Usage Rules

**Cinzel — Display & Headers**

Cinzel is used for all headings: `<h1>` through `<h4>`, page titles, section headers, modal titles, and card headings. It carries the alchemical authority of the brand. Use it in weight 400 (Regular) for `h3`/`h4` and weight 700 (Bold) for `h1`/`h2`. Letter-spacing of `0.05em` to `0.1em` is recommended for display sizes (32px and above). Never use Cinzel for body copy, labels, or anything below 14px — it loses legibility at small sizes.

**Inter — Body & UI**

Inter is the workhorse font for all readable content: paragraphs, descriptions, UI labels, button text, form inputs, navigation items, and documentation prose. Use weights 400 (Regular) and 500 (Medium) for body, 600 (SemiBold) for emphasized labels and subheadings that don't warrant Cinzel. Inter is chosen for its exceptional screen legibility across all sizes.

**JetBrains Mono — Code & Terminal**

JetBrains Mono is used exclusively for: code blocks, inline code spans, terminal output, log viewers, configuration previews, and any monospace context. Use weight 400 for normal code, 700 for highlighted or emphasized tokens. Font size in code blocks should be no smaller than 13px. Line height 1.6 is recommended for multi-line code.

**Uncial Antiqua — Decorative Only**

Uncial Antiqua is a narrow-use decorative face for alchemical and mystical label contexts only. Appropriate uses: agent classification labels (e.g., "Artificer", "Seeker", "Architect"), sidebar section labels in the Agent Node Studio, transmutation stage names, and alchemical circle role designations. It must never be used for functional UI text, error messages, navigation, or any context where legibility is critical. Maximum usage: 3–4 instances per screen.

### Type Scale

| Token | Size | Weight | Font | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| `display-xl` | 64px | 700 | Cinzel | 1.1 | 0.08em |
| `display-lg` | 48px | 700 | Cinzel | 1.15 | 0.06em |
| `heading-1` | 36px | 700 | Cinzel | 1.2 | 0.05em |
| `heading-2` | 28px | 700 | Cinzel | 1.25 | 0.04em |
| `heading-3` | 22px | 400 | Cinzel | 1.3 | 0.03em |
| `heading-4` | 18px | 400 | Cinzel | 1.35 | 0.02em |
| `body-lg` | 18px | 400 | Inter | 1.7 | 0 |
| `body-md` | 16px | 400 | Inter | 1.65 | 0 |
| `body-sm` | 14px | 400 | Inter | 1.6 | 0 |
| `label` | 13px | 500 | Inter | 1.4 | 0.02em |
| `caption` | 12px | 400 | Inter | 1.4 | 0.01em |
| `code` | 14px | 400 | JetBrains Mono | 1.6 | 0 |
| `code-sm` | 13px | 400 | JetBrains Mono | 1.55 | 0 |
| `alchemical` | 13px | 400 | Uncial Antiqua | 1.3 | 0.04em |

---

## 4. Logo Usage Rules

### Logo Suite

The Magnum Opus logo suite consists of three primary files. All are vector SVGs designed for dark backgrounds.

| File | Variant | Dimensions | Primary Use |
|---|---|---|---|
| `logo-v2.svg` | Master (mark + wordmark, stacked) | 1024×1024 | Social cards, app icons, splash screens |
| `logo-horizontal-v2.svg` | Horizontal (mark + wordmark, inline) | 1200×280 | README headers, email headers, banners |
| `logo-mark-v2.svg` | Mark only (Philosopher's Engine icon) | 512×512 | Favicon, browser tab, avatar, small contexts |

### Placement Rules

**Dark backgrounds only.** All logo variants are designed with internal luminescence and glow effects that require a dark surface to render correctly. The minimum acceptable background darkness is `#1A1A2E`. Never place any logo variant on:
- White or light gray backgrounds
- Light-mode UI surfaces
- Photographs with bright or mid-tone subjects
- Colored backgrounds lighter than 30% lightness (HSL)

**Clear space.** Maintain a minimum clear space equal to the height of the "A" in "Alchemical" on all sides of any logo variant. This space must be free of text, other logos, decorative elements, and busy imagery.

**Minimum sizes.**

| Variant | Minimum Size |
|---|---|
| Mark (`logo-mark-v2.svg`) | 32×32 px |
| Horizontal (`logo-horizontal-v2.svg`) | 200px wide |
| Master (`logo-v2.svg`) | 120×120 px |

Below these minimums, switch to a simpler representation or plain text wordmark.

### Prohibited Modifications

- Do not recolor any part of the logo
- Do not apply drop shadows (logos contain their own glow effects)
- Do not stretch, skew, or distort proportions
- Do not add outlines or strokes not present in the original
- Do not use the mark in isolation and claim it represents a different product
- Do not animate the logo in ways inconsistent with the Transmutation animation principle (see §6)
- Do not place the logo inside a colored badge or container that alters its appearance

### Approved Contexts

| Context | Recommended Variant |
|---|---|
| GitHub README header | `logo-horizontal-v2.svg` |
| Social share card (1200×630) | `logo-v2.svg` (centered) |
| Browser favicon | `logo-mark-v2.svg` (at 32×32) |
| Discord server icon | `logo-mark-v2.svg` |
| Documentation site header | `logo-horizontal-v2.svg` |
| App loading / splash screen | `logo-v2.svg` |
| Email footer | `logo-mark-v2.svg` |

---

## 5. Glow Effects Guidelines

The glow system is a defining characteristic of the Magnum Opus visual language. Glows are implemented as layered `box-shadow` and/or `filter: drop-shadow()` values using the brand accent colors at reduced opacity. Three intensity levels are defined: **sm**, **md**, and **lg**.

### Gold (Aurum) Glows

Gold glows are used on elements that demand primary attention — the most important interactive element on a given surface.

| Level | CSS Value | When to Use |
|---|---|---|
| `glow-gold-sm` | `0 0 6px rgba(255, 215, 0, 0.4)` | Subtle Aurum border highlight; active state on secondary buttons; selected list items |
| `glow-gold-md` | `0 0 12px rgba(255, 215, 0, 0.5), 0 0 24px rgba(255, 215, 0, 0.25)` | Primary call-to-action button (hover/focus state); highlighted workflow node; featured card |
| `glow-gold-lg` | `0 0 20px rgba(255, 215, 0, 0.6), 0 0 40px rgba(255, 215, 0, 0.35), 0 0 80px rgba(255, 215, 0, 0.15)` | Hero element emphasis (Philosopher's Engine active state); transmutation completion burst; critical notification badge |

**Rule:** Never apply `glow-gold-lg` to more than one element per screen. It is a superlative — overuse destroys the hierarchy.

### Aether (Green) Glows

Aether glows communicate life, activity, and successful operation. They are used on status indicators and live elements.

| Level | CSS Value | When to Use |
|---|---|---|
| `glow-aether-sm` | `0 0 6px rgba(0, 255, 170, 0.35)` | Online/connected dot indicators; healthy status badges; idle agent nodes |
| `glow-aether-md` | `0 0 12px rgba(0, 255, 170, 0.45), 0 0 24px rgba(0, 255, 170, 0.2)` | Active agent node in workflow canvas; running task indicator; success toast notification |
| `glow-aether-lg` | `0 0 20px rgba(0, 255, 170, 0.55), 0 0 40px rgba(0, 255, 170, 0.3), 0 0 80px rgba(0, 255, 170, 0.12)` | Alchemical Circle formation complete; major task orchestration success; live dashboard "all systems operational" state |

**Rule:** `glow-aether-md` is the workhorse level for standard live/active indicators. Reserve `glow-aether-lg` for genuine system-level success events, not routine completions.

### Arcane (Purple) Glows

Arcane glows signal interaction, selection, and navigational focus. They are the most frequently used glow in the UI.

| Level | CSS Value | When to Use |
|---|---|---|
| `glow-arcane-sm` | `0 0 6px rgba(157, 78, 221, 0.4)` | Focus ring on interactive elements (keyboard navigation); subtle selected state on nav items |
| `glow-arcane-md` | `0 0 10px rgba(157, 78, 221, 0.5), 0 0 20px rgba(157, 78, 221, 0.25)` | Hover state on cards and panels; active tab underline region; workflow canvas node selection |
| `glow-arcane-lg` | `0 0 16px rgba(157, 78, 221, 0.6), 0 0 32px rgba(157, 78, 221, 0.35), 0 0 64px rgba(157, 78, 221, 0.15)` | Modal/dialog overlay emphasis; active Aether Mode toggle; Philosopher's Engine prism at rest (ambient) |

**Rule:** `glow-arcane-sm` must always be present as the focus indicator for keyboard-accessible elements — this is both a brand and accessibility requirement.

### Combining Glows

Glows from different color families may be combined for transitional states. For example, a node transitioning from idle (Aether) to processing (Arcane) may briefly show both: `glow-aether-sm` + `glow-arcane-md`. Keep combinations to two families maximum; three-family combinations are visually noisy.

---

## 6. Animation Principles

All animations in the Alchemical Agent Ecosystem serve a semantic purpose — they communicate system state, guide attention, and reinforce the alchemical metaphor. Decorative animation is used only where explicitly noted.

**Universal requirement:** All animations must respect `prefers-reduced-motion`. When this media query is active, replace motion with instant state changes or use opacity transitions at a maximum duration of 150ms with no transform changes. Never disable all visual feedback — only disable motion.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.15ms !important;
  }
}
```

---

### Transmutation

**Purpose:** Communicates agent state changes — the transformation from one mode to another.

**Use for:** Agent node state transitions (idle → active → processing → complete → idle), workflow execution phase changes, task status updates, onboarding step progression.

**Properties:**
- Duration: 600ms–900ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (smooth deceleration)
- Elements: opacity + scale + glow color shift
- Pattern: The element first dims slightly (opacity 0.7, scale 0.97), then expands to full presence (opacity 1.0, scale 1.02) with the new glow color, then settles (scale 1.0)

**Example keyframes:**
```css
@keyframes transmute {
  0%   { opacity: 1;   transform: scale(1);    }
  30%  { opacity: 0.7; transform: scale(0.97); }
  70%  { opacity: 1;   transform: scale(1.02); }
  100% { opacity: 1;   transform: scale(1);    }
}
```

**Do not use for:** Page navigation, simple hover states, or any context where the state change is trivial (e.g., toggling a checkbox).

---

### Glow Pulse

**Purpose:** Communicates ongoing live/active status. Draws attention to elements that represent real-time activity.

**Use for:** Active agent node indicators, live data stream badges, the "connected to model" status dot, Alchemical Circle "formation in progress" state, any persistent "running" indicator.

**Properties:**
- Duration: 2000ms–3000ms per cycle
- Easing: `ease-in-out`
- Iteration: infinite
- Elements: `box-shadow` intensity cycles between `glow-aether-sm` and `glow-aether-md` (or equivalent for the color in context)
- Amplitude: subtle — the glow breathes, it does not strobe

**Example keyframes:**
```css
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 6px rgba(0, 255, 170, 0.35); }
  50%       { box-shadow: 0 0 12px rgba(0, 255, 170, 0.55), 0 0 24px rgba(0, 255, 170, 0.25); }
}
```

**Do not use for:** Elements that are merely selected or focused (use static `glow-arcane-sm` instead). Do not use for error states — Crimson does not pulse.

---

### Particle Drift

**Purpose:** Background ambience. Creates the sense of a living, alchemical environment without distracting from content.

**Use for:** Page hero sections, the Agent Node Studio canvas background, the Aether Mode overlay, onboarding wizard background, loading splash screen.

**Properties:**
- Particle count: 20–40 per viewport (performance-sensitive — reduce on low-end devices)
- Movement: slow upward drift with slight lateral sinusoidal drift
- Colors: Arcane (`#4B0082`) at 15–25% opacity, Aether (`#00FFAA`) at 8–15% opacity, Aurum (`#FFD700`) at 5–10% opacity
- Size: 2px–6px, rounded
- Duration: 8s–20s per particle (randomized per particle)
- Respawn: particles fade out at top and respawn at bottom

**Critical constraints:**
- Never place particles over content areas — background layer only (`z-index: 0` or lower, behind all content)
- Reduce particle count to 8–12 on mobile
- Disable entirely (not just slow) when `prefers-reduced-motion` is active
- Cap particle animation CPU usage — use `will-change: transform` on particle elements and `contain: strict` on the particle container

**Do not use for:** Any inline content context, modal backgrounds, card surfaces, or any area where text readability is required.

---

### Materialize

**Purpose:** Introduces new content into the view — communicates that something has been created, retrieved, or summoned.

**Use for:** New agent cards appearing in a list, plugin marketplace item rendering, search results populating, chat messages arriving, workflow nodes being added to the canvas, toast notifications appearing.

**Properties:**
- Duration: 300ms–450ms
- Easing: `cubic-bezier(0.0, 0.0, 0.2, 1)` (fast start, smooth settle)
- Elements: opacity (0 → 1) + translateY (12px → 0) + subtle scale (0.96 → 1)
- Staggered lists: 40ms–60ms delay between successive items

**Example keyframes:**
```css
@keyframes materialize {
  0%   { opacity: 0; transform: translateY(12px) scale(0.96); }
  100% { opacity: 1; transform: translateY(0)    scale(1);    }
}
```

**Do not use for:** Elements that were already visible and are simply updating their content (use Transmutation). Do not use for destructive actions (deletions should use a fade-out + scale-down, not Materialize in reverse).

---

## 7. Voice & Tone

### Core Principle

The voice of the Alchemical Agent Ecosystem sits at the precise intersection of **technical precision** and **mystical poetry**. We describe real systems with real capabilities — but we frame them in the language of transformation, mastery, and discovery. We never sacrifice accuracy for aesthetics, nor aesthetics for mere utility.

### Perspective

- **Community documentation, README, and public-facing content:** First person plural — "we", "our", "us". This includes contribution guides, the main README, and feature announcements.
- **User documentation and tutorials:** Second person — "you", "your". Address the practitioner directly.
- **Technical specifications and API docs:** Third person, neutral. Describe systems as they are, without embellishment.

### Word Substitutions

These are non-negotiable brand voice rules. The left column is prohibited in user-facing copy; the right column is required.

| Never Say | Always Say |
|---|---|
| simple | elegant |
| easy | effortless |
| fast | swift / instantaneous |
| delete | dissolve / unmake |
| create | forge / summon / crystallize |
| run / execute | invoke / transmute |
| configure | attune |
| update | refine / evolve |
| error | disruption / misalignment |
| warning | caution / augury |
| connect | bind / attune |
| data | essence / substrate |
| pipeline | channel / conduit |
| install | invoke (for setup) |

These substitutions apply to UI copy, documentation prose, and marketing text. They do not apply to code identifiers, CLI argument names, or technical API documentation where precision and discoverability take precedence.

### Alchemical Metaphor Vocabulary

When describing system behavior and capabilities, draw from this vocabulary:

- **transmute** — to transform data, state, or agent behavior from one form to another
- **forge** — to create something of substance, power, and permanence
- **crystallize** — to bring clarity, to produce structured output from unstructured input
- **distill** — to extract essence; to summarize, reduce, or refine
- **illuminate** — to make visible; to explain, surface, or reveal
- **conjure** — to instantiate; to call into being from configuration
- **bind** — to connect, integrate, or associate two systems/agents
- **channel** — to direct flow; used for data routing, streaming, pipelines
- **inscribe** — to persist; to write to storage or memory
- **invoke** — to call a function, trigger a workflow, or execute an agent
- **the Opus** — the project itself; the ongoing work of the ecosystem
- **Practitioner** — a user of the system (preferred to "user" or "developer" in narrative contexts)
- **Artificer** — an agent with a constructive/generative role
- **Seeker** — an agent with a retrieval/research role
- **Architect** — an agent with a planning/orchestration role
- **the Circle** — an Alchemical Circle; a self-forming agent team
- **the Grimoire** — a saved/exported workflow bundle

### Voice Examples

**Feature announcement (community-facing):**
> We have forged something new. The Alchemical Circle engine — our answer to the question of how intelligent agents find one another, form purpose, and act in concert — is now live in v2.0. Where once you invoked agents individually, now you may summon a Circle: a self-forming coalition that crystallizes its own roles, distributes its own labor, and dissolves gracefully when the work is complete.

**Documentation (tutorial, user-facing):**
> To attune your first agent, open the Agent Node Studio and select "Forge New Agent" from the command palette. You will be guided through a brief inscription sequence — naming your agent, assigning its role archetype, and binding it to a local model. Once crystallized, your agent will appear in the canvas, ready to be woven into a workflow.

**Error message (UI copy):**
> The channel could not be established. Verify that the local model is active and reachable, then attempt to bind again.

**Status label:**
> Transmutation complete. Your workflow has been inscribed to the Grimoire.

**What not to do:**
> ~~"This simple feature makes it easy and fast to create and run your AI pipelines."~~

---

## 8. Badge Styles

The following shields.io badge URLs are used throughout the project. All badges use the `flat-square` style and the Arcane Glow color (`9D4EDD`) as the primary brand color.

### Standard Project Badges

```markdown
<!-- Version -->
![Version](https://img.shields.io/badge/version-2.0.0--magnum--opus-9D4EDD?style=flat-square&logo=data:image/svg+xml;base64,...)

<!-- License -->
![License](https://img.shields.io/badge/license-MIT-FFD700?style=flat-square)

<!-- Python Version -->
![Python](https://img.shields.io/badge/python-3.11%2B-4B0082?style=flat-square&logo=python&logoColor=FFD700)

<!-- Node Version -->
![Node](https://img.shields.io/badge/node-20%2B-4B0082?style=flat-square&logo=nodedotjs&logoColor=00FFAA)

<!-- Next.js -->
![Next.js](https://img.shields.io/badge/Next.js-15-111118?style=flat-square&logo=nextdotjs&logoColor=E8E8FF)

<!-- TypeScript -->
![TypeScript](https://img.shields.io/badge/TypeScript-strict-9D4EDD?style=flat-square&logo=typescript&logoColor=E8E8FF)

<!-- Local-First -->
![Local-First](https://img.shields.io/badge/local--first-100%25-00FFAA?style=flat-square)

<!-- Build Status -->
![CI](https://img.shields.io/github/actions/workflow/status/your-org/alchemical-agent-ecosystem/ci.yml?style=flat-square&label=forge&color=9D4EDD)

<!-- Coverage -->
![Coverage](https://img.shields.io/badge/coverage-passing-00FFAA?style=flat-square)

<!-- PRs Welcome -->
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-FFD700?style=flat-square)
```

### Recommended Badge Row (README Header)

```markdown
[![Version](https://img.shields.io/badge/version-2.0.0--magnum--opus-9D4EDD?style=flat-square)](./CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-FFD700?style=flat-square)](./LICENSE)
[![Python](https://img.shields.io/badge/python-3.11%2B-4B0082?style=flat-square&logo=python&logoColor=FFD700)](https://python.org)
[![Node](https://img.shields.io/badge/node-20%2B-4B0082?style=flat-square&logo=nodedotjs&logoColor=00FFAA)](https://nodejs.org)
[![Local-First](https://img.shields.io/badge/local--first-100%25-00FFAA?style=flat-square)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-FFD700?style=flat-square)](./CONTRIBUTING.md)
```

### Dynamic Badges (replace `your-org/alchemical-agent-ecosystem` with actual repo path)

```markdown
<!-- Stars -->
![Stars](https://img.shields.io/github/stars/your-org/alchemical-agent-ecosystem?style=flat-square&color=FFD700)

<!-- Last Commit -->
![Last Commit](https://img.shields.io/github/last-commit/your-org/alchemical-agent-ecosystem?style=flat-square&color=9D4EDD)

<!-- Open Issues -->
![Issues](https://img.shields.io/github/issues/your-org/alchemical-agent-ecosystem?style=flat-square&color=FF2D55)

<!-- Discussions -->
![Discussions](https://img.shields.io/github/discussions/your-org/alchemical-agent-ecosystem?style=flat-square&color=00FFAA)
```

---

## 9. Asset Files

All brand assets live under `assets/branding/`. The full inventory is:

| File | Purpose | Dimensions | Format |
|---|---|---|---|
| `logo-v2.svg` | Master logo (mark + stacked wordmark) | 1024×1024 | SVG (vector) |
| `logo-horizontal-v2.svg` | Horizontal logo (mark + inline wordmark) | 1200×280 | SVG (vector) |
| `logo-mark-v2.svg` | Mark only — Philosopher's Engine | 512×512 | SVG (vector) |
| `logo-v2@2x.png` | Master logo raster (retina) | 2048×2048 | PNG (lossless) |
| `logo-v2@1x.png` | Master logo raster (standard) | 1024×1024 | PNG (lossless) |
| `logo-horizontal-v2@2x.png` | Horizontal raster (retina) | 2400×560 | PNG (lossless) |
| `logo-horizontal-v2@1x.png` | Horizontal raster (standard) | 1200×280 | PNG (lossless) |
| `logo-mark-v2@2x.png` | Mark raster (retina) | 1024×1024 | PNG (lossless) |
| `logo-mark-v2@1x.png` | Mark raster (standard) | 512×512 | PNG (lossless) |
| `favicon-32.png` | Browser favicon | 32×32 | PNG (lossless) |
| `favicon-16.png` | Small browser favicon | 16×16 | PNG (lossless) |
| `favicon.ico` | Legacy favicon bundle | 16/32/48 multi | ICO |
| `apple-touch-icon.png` | iOS home screen icon | 180×180 | PNG (lossless) |
| `og-card.png` | Open Graph social share card | 1200×630 | PNG (lossless) |
| `alchemical-palette.css` | CSS custom properties (design tokens) | — | CSS |
| `tailwind-alchemical.js` | Tailwind CSS theme extension | — | JS (ESM) |
| `fonts.css` | Google Fonts import declarations | — | CSS |
| `README.md` | This document | — | Markdown |

### alchemical-palette.css

This file declares all brand colors, typography scales, glow values, and animation tokens as CSS custom properties. Import it once at the root of any web project:

```css
@import url('./assets/branding/alchemical-palette.css');
```

It does not include any selectors or rules — only `:root` custom property declarations. It is safe to import in any CSS environment.

### tailwind-alchemical.js

This file exports a Tailwind CSS `theme.extend` object that maps all brand tokens to Tailwind utility classes. Usage in `tailwind.config.js`:

```js
const alchemical = require('./assets/branding/tailwind-alchemical.js');

module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: alchemical,
  },
};
```

This enables classes such as `bg-obsidian`, `text-mist`, `border-aurum`, `glow-gold-md`, `font-cinzel`, etc.

---

## 10. Export Commands

Raster exports and favicon generation require either [librsvg](https://gitlab.gnome.org/GNOME/librsvg) (`rsvg-convert`) or [Inkscape](https://inkscape.org/) to be installed on the system. The scripts auto-detect which tool is available and use it accordingly.

```bash
# Export all PNG variants from SVG sources (1x and 2x)
# Outputs to assets/branding/exports/
./scripts/export-logo-formats.sh

# Generate favicons (favicon.ico, favicon-32.png, favicon-16.png, apple-touch-icon.png)
# Requires ImageMagick or sharp-cli in addition to SVG renderer
./scripts/generate-favicons.sh

# Generate the Open Graph social card (requires a card template)
./scripts/generate-og-card.sh

# Validate all SVG assets (checks for correct viewBox, no embedded rasters, etc.)
./scripts/validate-assets.sh

# Full export pipeline (runs all of the above in sequence)
./scripts/export-all.sh
```

### Dependency Check

Before running export scripts, verify dependencies are available:

```bash
# Check for rsvg-convert (librsvg)
rsvg-convert --version

# Or check for Inkscape
inkscape --version

# Check for ImageMagick (required for .ico generation)
convert --version

# Install librsvg on macOS (Homebrew)
brew install librsvg

# Install librsvg on Ubuntu/Debian
sudo apt-get install librsvg2-bin

# Install ImageMagick on macOS
brew install imagemagick

# Install ImageMagick on Ubuntu/Debian
sudo apt-get install imagemagick
```

---

*This brand guide is a living document. As the Alchemical Agent Ecosystem evolves, so too shall the visual language that represents it. All proposed changes to this guide must be reviewed and approved before implementation across the project. The Opus endures.*

---

**Alchemical Agent Ecosystem — Brand Guide v2.0 "Magnum Opus"**
Last updated: 2026-Q1
