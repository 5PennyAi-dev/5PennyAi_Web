---
name: blog-to-social
description: Transforme un article de blog 5PennyAi en posts pour LinkedIn, Facebook et Twitter/X, bilingues (FR/EN). Utilise cette skill quand l'utilisateur demande de créer des posts sociaux à partir d'un article, promouvoir un article sur les réseaux, générer du contenu social, ou dit "posts pour LinkedIn", "partage sur les réseaux", "social media posts", "promote this article", "posts réseaux sociaux", "générer les posts". Se déclenche aussi via le bouton "Générer posts sociaux" dans l'admin blog.
---

## What This Skill Does

Transforms a 5PennyAi blog article into **3 platform-specific social media posts** (LinkedIn, Facebook, Twitter/X), each in **French and English**. The posts are ready to copy-paste.

## Core Principle

**Each platform gets a different angle, not a different length of the same text.** A LinkedIn post argues a professional insight. A Facebook post sparks a conversation. A Twitter post delivers a punchy takeaway. The article is the source material — the posts are not summaries, they are hooks.

## Input

The user (or blog app) provides:
- **Full article content** (Markdown) — including title, content FR and EN
- **Article URL** — the link to append to each post (e.g. `https://5pennyai.com/blog/[slug]`)

If the URL is not provided, use a placeholder `[LIEN]` that the user can replace.

## Platform Rules

### LinkedIn (FR + EN)

- **Length:** 1000-1300 characters (stays visible before "voir plus" fold at ~210 chars — the hook MUST be in those first 210)
- **Structure:**
  1. **Hook** (first line): A bold statement, surprising stat, contrarian take, or direct question. This line decides if anyone reads the rest. NO emoji on the first line.
  2. **Body** (3-5 short paragraphs): Develop ONE key insight from the article. Use line breaks between paragraphs. Can use 2-3 relevant emojis sparingly as paragraph markers.
  3. **CTA**: Invite to read the full article. End with the link on its own line.
  4. **Hashtags**: 3-5 relevant hashtags on a final line
- **Tone:** Professional but accessible. First person ("J'ai constaté que..."). Share an opinion, not just facts. Thought-leadership voice.
- **What to extract from the article:** The most surprising finding, the most contrarian point, or the most actionable advice. NOT a summary of all points.

### Facebook (FR + EN)

- **Length:** 400-600 characters
- **Structure:**
  1. **Hook**: A question or relatable scenario that makes people stop scrolling ("Vous avez déjà essayé de... ?")
  2. **Body**: 2-3 sentences that tease the answer without giving everything away
  3. **CTA + link**: "L'article complet est ici 👇" + link on its own line
- **Tone:** Conversational, warm, inclusive. Like talking to a colleague over coffee. More emojis OK (3-5). Use "vous" (not "tu").
- **What to extract from the article:** The most relatable pain point or the most practical tip — something that triggers "oh, that's me" recognition.

### Twitter/X (FR + EN)

- **Length:** Max 280 characters (including the link, which takes ~23 characters)
- **Structure:**
  1. One punchy statement or hot take
  2. Link
- **Tone:** Sharp, direct, no filler. Can be provocative or surprising. Minimal or no emojis (0-1).
- **What to extract from the article:** The single most tweetable insight — a stat, a myth-bust, a counterintuitive truth.
- **Hashtags:** 1-2 max, only if they fit naturally within the character limit.

## Steps

### Step 1 — Read the article and identify angles

Read the full article and extract:
1. **The headline insight** — the one thing that would make someone share this
2. **The surprising stat or fact** — if there is one
3. **The relatable pain point** — what problem does the reader recognize
4. **The contrarian take** — what does this article say that goes against common belief

### Step 2 — Assign angles to platforms

- **LinkedIn** gets the headline insight or contrarian take (professional authority)
- **Facebook** gets the relatable pain point (conversation starter)
- **Twitter** gets the surprising stat or most tweetable line (shareable punch)

Each platform must use a **different angle**. If all three posts say the same thing in different lengths, the skill has failed.

### Step 3 — Write the posts

Write FR first, then EN adaptation (not literal translation — adapt the tone and references to each language's social media culture).

### Step 4 — Output

Print all 6 posts (3 platforms × 2 languages) in the chat, clearly separated, ready to copy-paste.

## Output Template

```markdown
# Posts sociaux — [Article Title]

**Article:** [URL]
**Date:** [YYYY-MM-DD]

---

## LinkedIn

### FR
[post français]

### EN
[post anglais]

---

## Facebook

### FR
[post français]

### EN
[post anglais]

---

## Twitter/X

### FR
[post français]

### EN
[post anglais]
```

## Example

**Article title:** "Un chatbot est-il vraiment utile pour une PME ?"
**Article URL:** https://5pennyai.com/blog/chatbot-pme-mythes-et-realites

### LinkedIn — FR

```
La majorité des PME pensent qu'un chatbot, c'est réservé aux grandes entreprises avec des budgets tech illimités.

Les données racontent une autre histoire.

📊 67 % des consommateurs dans le monde ont interagi avec un chatbot au cours des 12 derniers mois. Et les PME qui en déploient un voient une réduction de 30 % des demandes au service client dès le premier mois.

Le vrai frein, ce n'est pas le coût (certaines solutions commencent à 0 $). C'est la perception que "c'est compliqué" ou "nos clients n'aimeront pas ça."

J'ai démystifié les 5 mythes les plus courants dans cet article, données à l'appui.

👉 https://5pennyai.com/blog/chatbot-pme-mythes-et-realites

#ChatbotPME #IntelligenceArtificielle #ServiceClient #IAappliquée
```

### Facebook — FR

```
Vous avez probablement déjà fermé une de ces petites fenêtres de chat sur un site web en vous disant "encore un robot inutile" 😅

Et si je vous disais que pour une PME, un chatbot bien configuré peut répondre à 30 % de vos demandes clients — sans intervention humaine ?

J'ai regardé les vrais chiffres et démonté 5 mythes tenaces. Le résultat est surprenant.

L'article complet est ici 👇
https://5pennyai.com/blog/chatbot-pme-mythes-et-realites
```

### Twitter/X — FR

```
67 % des consommateurs ont utilisé un chatbot cette année. Certaines solutions commencent à 0 $.

Pourquoi les PME hésitent encore ?

https://5pennyai.com/blog/chatbot-pme-mythes-et-realites
```

## Hard exclusions

- **Ne jamais résumer l'article entier** — chaque post prend UN angle
- **Ne jamais utiliser les mêmes phrases que l'article** — reformuler complètement
- **Ne jamais commencer par "Nouvel article !" ou "Je viens de publier..."** — c'est le post social le moins engageant possible
- **Ne jamais dépasser les limites de caractères** de chaque plateforme
- **Ne pas utiliser de jargon technique non expliqué**

## Quality check

Before outputting, verify:
1. Les 3 posts utilisent-ils des angles DIFFÉRENTS ? Si non → varier
2. Le hook LinkedIn tient-il en moins de 210 caractères ? Si non → raccourcir
3. Le tweet fait-il moins de 280 caractères (lien inclus) ? Si non → couper
4. Les posts FR et EN sont-ils adaptés (pas traduits mot à mot) ? Si non → réécrire
5. Quelqu'un qui ne connaît pas l'article aurait-il envie de cliquer ? Si non → renforcer le hook
