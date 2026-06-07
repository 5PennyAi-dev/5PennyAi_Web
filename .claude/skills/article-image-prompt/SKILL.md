---
name: article-image-prompt
description: Génère des prompts d'image hero/couverture pour les articles de blog 5PennyAi, optimisés pour Nano Banana Pro. Utilise cette skill quand l'utilisateur demande un prompt d'image pour un article, une image de couverture, une hero image, un visuel de blog, une illustration d'article, ou dit "génère l'image pour l'article", "image prompt", "cover image", "hero image", "visuel pour le post", "illustration blog". Se déclenche aussi après la rédaction d'un article via blog-generator quand vient le moment de créer l'image.
---

## What This Skill Does

Generates **2 image prompt variants** (English + French) optimized for **Nano Banana Pro** (Google Gemini image model) to illustrate a blog article's hero image. The article title will be overlaid on the image by the app — the image itself contains NO text.

## Core Principle

**The meta-description defines WHAT to illustrate. The image must visually represent the specific concept of the article, not a generic tech/business scene.** If someone reads the meta-description and looks at the image, the connection should be immediate and obvious.

A chatbot article should look different from an automation article. A ROI article should look different from a data strategy article. If two different meta-descriptions could produce the same image, the prompt is too generic.

## Input

The user (or blog app) provides:
- **Meta-description** — the single source for the image subject

That's it. If the user pastes an article without a meta-description, ask for it before proceeding.

## Steps

### Step 1 — Concept extraction (MOST IMPORTANT STEP)

Read the meta-description and answer these questions before writing any prompt:

1. **What is the specific subject?** (not "AI for business" — that's too vague. More like "chatbot answering customer questions" or "automating invoice processing")
2. **What is the central object or action?** (a conversation, a filter, a bridge, a funnel, a scale, a path, etc.)
3. **What makes this article DIFFERENT from other AI articles?** (this is what the image must capture)

### Step 2 — Choose a visual metaphor

The central subject of the image must be a **concrete visual representation of the concept**, NOT a laptop or workspace by default.

**Examples of concept → central subject:**

| Meta-description concept | ❌ Generic (don't do this) | ✅ Concept-driven |
|---|---|---|
| Chatbot for customer service | Laptop with chat bubbles | A large friendly speech bubble acting as a reception desk, with small question marks entering one side and checkmarks exiting the other |
| 5 myths about RAG | Laptop with documents | Five colorful myth bubbles being popped by a pin, with document fragments floating out |
| AI automation saving time | Laptop with clock | A conveyor belt transforming messy paper stacks into neat organized folders, with a clock showing time saved |
| ROI of AI for SMBs | Laptop with charts | A balance scale with a small AI chip on one side outweighing a large pile of coins on the other |
| Data strategy for beginners | Laptop with data | A roadmap with signposts, starting from a tangled mess and leading to an organized destination |
| Email automation | Laptop with emails | A mailbox with envelopes flowing through a funnel that sorts them into colored bins |

**Rules:**
- A laptop may appear as a SECONDARY prop, never as the central subject (unless the article is specifically about a software tool)
- The central subject must be a visual metaphor or literal representation of the article's core concept
- Each image should be immediately distinguishable from other blog images at thumbnail size

### Step 3 — Write the prompt

**Each variant MUST describe:**

- **Visual style** — flat vector editorial illustration, clean geometric shapes, bold outlines, flat fills, no gradients, subtle or no shadows. Professional SaaS-blog aesthetic. **Never photorealistic. Never childish or cartoonish.**
- **Central subject** — the concept-driven metaphor from Step 2. Describe it precisely in 2-3 sentences.
- **Supporting props** — 3-5 small thematic objects around the central subject that reinforce the article's topic. These should be specific to the subject, not generic office items.
- **Composition** — varies based on what best serves the concept: centered, asymmetric, top-down, isometric, split-view, etc. No default composition.
- **Color palette** — anchor on 5PennyAi brand colors: **sky blue (#81AED7)** as dominant, **warm orange (#DD8737)** as accent. Complement with 1-3 colors from: cream, navy, teal, mint, coral, warm yellow. Light background (off-white, cream, or pale blue).
- **No text in the image** — always end with "No text, words, or lettering in the image."

### Step 4 — Generate 2 variants

- **Variant 1 — Literal:** A direct visual representation of the concept
- **Variant 2 — Metaphorical:** A symbolic/abstract take on the same concept using a different central metaphor

The two variants must have **different central subjects**, not just different arrangements of the same elements.

### Step 5 — Output

Write each prompt in English first, then French translation. Print the 2 English prompts in the chat for easy copy-paste.

## Output Template

```markdown
# Image Prompts

**Meta-description:** [the meta-description used as the source]
**Core concept:** [one phrase summarizing what the image must show]
**Target model:** Nano Banana Pro (Google Gemini)
**Date:** [YYYY-MM-DD]

---

## Variant 1 — Literal

**EN:**
[Full English prompt — 3 to 5 sentences]

**FR:**
[French translation]

---

## Variant 2 — Metaphorical

**EN:**
[Full English prompt]

**FR:**
[French translation]
```

## Example

**Meta-description:** "Trop cher, trop complexe, réservé aux grandes entreprises ? On démonte les mythes sur les chatbots pour PME, données à l'appui."

**Core concept:** Debunking myths/misconceptions about chatbots for small businesses.

### Variant 1 — Literal

**EN:**
Flat vector editorial illustration. A large magnifying glass in the center examining a friendly speech bubble, revealing its inner workings — simple gears and a small heart icon inside, showing it's not as complex as feared. Around the magnifying glass, five small myth bubbles with crossed-out icons (a dollar sign, a complexity symbol, a skyscraper, a lock, a clock) float and crack apart. Small props: a tiny storefront, an "open" sign, a thumbs-up icon. Color palette: sky blue (#81AED7) dominant on the magnifying glass and speech bubble, warm orange (#DD8737) on the crossed-out myths and heart icon, cream background, navy outlines. No text, words, or lettering in the image.

### Variant 2 — Metaphorical

**EN:**
Flat vector editorial illustration. A solid brick wall with padlock, dollar, and warning icons is crumbling apart in the center, revealing a bright open landscape behind it with a small friendly chatbot character waving. Brick fragments scatter outward. On the bright side: a small shop, happy simplified customer silhouettes, ascending bar chart. The wall side is in muted navy tones; the revealed side is vibrant sky blue (#81AED7) and warm orange (#DD8737) with cream background. Clean geometric shapes, flat fills, bold outlines, no gradients. No text, words, or lettering in the image.

## Nano Banana Pro prompt guidelines

- Write in natural descriptive English, not tag-based syntax
- Order: **style → central subject (2-3 sentences) → supporting props → palette → no-text instruction**
- 3 to 5 sentences per prompt
- Use specific visual vocabulary ("sky blue (#81AED7) dominant, warm orange (#DD8737) accent" not "colorful")
- Always name the medium: "flat vector editorial illustration"
- Always end with: "No text, words, or lettering in the image."

## Hard exclusions

- **No text, words, letters, labels, banners, or typography in the image**
- **No laptop as central subject** (allowed only as a small secondary prop)
- **No generic workspace scenes** — every image must be concept-specific
- **No named people or celebrities**
- **No brand names, logos, or trademarked visuals**

## Self-check before outputting

Before finalizing each prompt, verify:
1. Could this image be confused with another article's image? If yes → make it more specific
2. Does the central subject directly represent the meta-description concept? If no → rethink the metaphor
3. Is a laptop the main element? If yes → replace it with a concept-driven subject
4. Would a reader understand the article's topic from the image alone? If no → clarify the visual

## Style iteration notes

Core constants (don't change without explicit request):
- Flat vector editorial illustration
- 5PennyAi brand colors (#81AED7 blue, #DD8737 orange)
- No text in the image
- Professional SaaS-blog aesthetic
- Concept-driven composition (no default layout)

Open to refinement: prop density, background treatment, additional accent colors, level of abstraction.
