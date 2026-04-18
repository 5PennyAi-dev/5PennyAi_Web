# Prompt patterns — Nano Banana pour infographies

Ce fichier fournit le **template 9-sections**, des **exemples complets** pour chaque type, et les **anti-patterns fréquents**. Lis-le au moment de rédiger le prompt final.

## Template en 9 sections

```
[1] MEDIUM + STYLE GLOBAL
[2] COMPOSITION DÉTAILLÉE (zones spatiales)
[3] ÉLÉMENTS TYPOGRAPHIQUES EXACTS (tous textes entre guillemets)
[4] DATA-VIZ SPÉCIFIQUES (type, valeur, emplacement)
[5] ICÔNES (style + liste par zone)
[6] PALETTE HEX (ancrage + accents vifs)
[7] ÉLÉMENTS STRUCTURANTS (lignes, cartouches, grille)
[8] FORMAT (aspect ratio, dimensions)
[9] NÉGATIFS (avoid:)
```

## Template brut (copier-coller)

```
[1] A clean flat vector editorial infographic in the style of a modern
tech dashboard or contemporary editorial report page, crisp and
structured, designed for maximum readability.

[2] Composition: [DESCRIBE LAYOUT — e.g., "portrait 4:5 format with
bold title at top taking the upper 18%, central illustration occupying
25% of the height, grid of 6 content cards in 3x2 arrangement below".
Be specific about positions.]

[3] Typography (all text rendered as crisp geometric sans-serif):
- Main title (top center, large bold): "EXACT TITLE TEXT"
- Subtitle (below title, medium weight): "EXACT SUBTITLE TEXT"
- Section labels: "LABEL 1", "LABEL 2", "LABEL 3"
- Featured statistics (oversized bold numbers in orange): "47%", "12H",
"83%"
- Body descriptions (small regular): "Short description 1 here", ...

[4] Data visualization elements:
- [DESCRIBE EACH SPECIFICALLY]

[5] Icons: consistent flat pictogram style, all filled (or all outlined
— choose one), each inside a circular badge approximately 80-100px
diameter in vibrant palette colors (cobalt, violet, or teal, varied).
- [LIST EACH ICON BY ZONE]

[6] Strict color palette — anchor colors always present:
- Background: glacier blue #EEF4FC (pale cobalt-tinted blue, never pure white, never warm beige)
- Primary text, outlines, main filled icons: deep navy #143054
- Single focal accent (featured numbers and hero element only): vivid
orange #DD8737

Vibrant accent palette — use 2-3 of these for icon badges and data-viz:
- Cobalt blue #4F7CD4
- Royal violet #8B5CF6
- Fresh teal #14B8A6
- (Optional) Golden amber #F59E0B

All vibrant accents share consistent saturation (richly saturated but
not neon). Maximum 5 distinct colors total. The vivid orange remains
the single brightest focal.

[7] Structural elements: [DESCRIBE — thin connection lines, rounded
cards, dividers, grid alignment]

[8] Aspect ratio [16:9 / 4:5 / 1:1 / 3:4], dimensions approximately
[e.g., 1200x1500].

[9] Avoid: photorealism, 3D rendering, color gradients, drop shadows,
glow effects, lens flare, hand-drawn or sketch style, watercolor
textures, paper grain, corporate memphis illustration style, plastic
or metallic textures, brand logos, watermarks, mixing filled and
outlined icons, emojis, serif or script typography, cluttered layouts,
pure white backgrounds, warm beige or cream backgrounds, washed-out pastel colors, website URLs or
footer signatures inside the image.
```

---

## Exemples complets par type

### Exemple 1 — Catalogue en grille (type 7)

**Contexte** : article "7 outils IA gratuits pour la prospection B2B".

```
A clean flat vector editorial infographic in the style of a modern
product catalog page, crisp and well-structured, designed for easy
scanning and sharing on LinkedIn and Pinterest.

Composition: portrait 4:5 format. Top zone (20% height): bold centered
title and subtitle. Middle zone (72% height): 3x3 grid of square cards
with rounded corners, identical sizes, 24px gutters between cards.
Cards 1-7 are tool cards, cards 8-9 are oversized statistical callouts.
No footer zone — the composition ends cleanly with the last row.

Typography (crisp geometric sans-serif similar to Inter or Outfit):
- Main title (top center, extra-large bold 56px, dark navy): "7 OUTILS
IA GRATUITS"
- Subtitle (below title, medium 22px, navy): "Pour automatiser votre
prospection B2B en 4 semaines"
- In each tool card: large orange numeral top-left ("1" through "7"),
bold navy tool name below the central icon ("CHATGPT", "HUBSPOT",
"HUNTER", "PERPLEXITY", "SCRAPER", "COPY.AI", "ZAPIER"), small navy
tagline at bottom (2-4 words each)
- In cells 8 and 9 (stat cards): oversized orange numbers "12H" and
"47%" with small navy labels beneath ("ÉCONOMISÉES / SEMAINE", "PLUS
PRODUCTIF")

Data visualization: no traditional charts — the 2 stat cards serve as
typographic data callouts with oversized orange numbers.

Icons: consistent flat filled pictogram style, each icon in dark navy
centered inside a circular badge 90px diameter. Badge colors rotate
across the 7 tool cards using the vibrant accent palette: card 1 =
cobalt blue, card 2 = royal violet, card 3 = fresh teal, card 4 =
cobalt blue, card 5 = royal violet, card 6 = fresh teal, card 7 =
cobalt blue (rhythmic rotation of 3 accent colors).

Strict color palette — anchor colors always present:
- Background: glacier blue #EEF4FC
- Tool card backgrounds: pure white, thin 1px cobalt #4F7CD4 border
at 40% opacity, 10px rounded corners
- Stat callout card backgrounds (cells 8, 9): pure white with cobalt
#4F7CD4 fill at 12% opacity, thin 1px cobalt border at 50% opacity,
10px rounded corners
- Primary text, tool names, taglines, stat labels, icons: deep navy
#143054
- Icon badge fills: rotating cobalt blue #4F7CD4, royal violet
#8B5CF6, and fresh teal #14B8A6 as specified
- Card numerals (1-7) AND stat numbers ("12H", "47%"): vivid orange
#DD8737
- Subtle divider line below title: cobalt blue #4F7CD4 at 30% opacity,
1px

All vibrant accents share consistent saturation. Maximum 5 distinct
colors total. Vivid orange is the single brightest focal.

Structural elements: 9 cards aligned on strict 3-column grid with
24px gutters; 10px rounded corners uniformly; thin horizontal divider
below title; 60px outer margins; no footer.

Aspect ratio 4:5 portrait, dimensions approximately 1200x1500.

Avoid: photorealism, 3D rendering, color gradients, drop shadows, glow
effects, lens flare, hand-drawn or sketch style, watercolor textures,
paper grain, corporate memphis illustration style, plastic or metallic
textures, real brand logos (no OpenAI, ChatGPT, HubSpot, Zapier
logos — use only generic category icons), watermarks, mixing filled
and outlined icons, emojis, serif typography, cluttered layouts, pure white backgrounds, warm beige or cream backgrounds, washed-out pastel colors, website URLs or footer
signatures inside the image.
```

### Exemple 2 — Processus numéroté (type 2)

**Contexte** : article "4 étapes pour intégrer l'IA dans ton service client".

```
A clean flat vector editorial infographic in the style of a modern
step-by-step guide page, crisp and structured.

Composition: landscape 16:9 format. Top zone (22%): title and subtitle
centered. Middle zone (68%): four step cards in a single horizontal
row, separated by stylized right-pointing arrows in the gutters.
Bottom zone (10%): one highlighted statistical callout centered. No
footer.

Typography (geometric sans-serif):
- Main title (top center, large bold 52px, navy): "INTÉGRER L'IA EN 4
ÉTAPES"
- Subtitle (below, medium 22px, navy): "La méthode recommandée pour
les PME B2B"
- In each step card: oversized orange numeral ("1", "2", "3", "4") in
the upper portion, bold navy step title below the icon ("DIAGNOSTIC",
"PILOTE", "INTÉGRATION", "MESURE"), short navy description 8-12 words
beneath
- Bottom callout: oversized orange "+47%" with small navy label "DE
PRODUCTIVITÉ EN MOYENNE"

Data viz: thin horizontal progress bar in navy at 20% opacity at the
top of each card, filled progressively in vibrant colors: 25% cobalt
(step 1), 50% violet (step 2), 75% teal (step 3), 100% orange (step 4,
completion signal).

Icons: flat filled pictograms in navy, centered in circular badges
100px diameter. Colors rotate: step 1 = cobalt #4F7CD4, step 2 =
violet #8B5CF6, step 3 = teal #14B8A6, step 4 = cobalt #4F7CD4.
- Step 1: magnifying glass
- Step 2: paper plane / small rocket
- Step 3: interconnected gears
- Step 4: upward-trending bar chart

Between cards: thin dark navy right-pointing arrows 3px stroke,
approximately 40px wide.

Strict color palette — anchor colors always present:
- Background: glacier blue #EEF4FC
- Step card backgrounds: pure white, thin 1px cobalt #4F7CD4 border
at 40% opacity, 12px rounded corners
- Primary text, icons, titles: deep navy #143054
- Icon badges: rotating cobalt blue #4F7CD4, royal violet #8B5CF6,
fresh teal #14B8A6 as specified
- Step numbers and bottom stat callout: vivid orange #DD8737
- Connecting arrows: deep navy #143054

Structural: 12px rounded corners; 32px gutters with arrows centered;
thin horizontal divider (1px #4F7CD4 at 30% opacity) below title; 80px
outer margins; no footer.

Aspect ratio 16:9 landscape, approximately 1920x1080.

Avoid: photorealism, 3D rendering, color gradients, drop shadows, glow
effects, lens flare, hand-drawn style, watercolor textures, paper
grain, corporate memphis, plastic textures, brand logos, watermarks,
emojis, serif typography, cluttered layouts, pure white backgrounds,
washed-out pastel colors, website URLs or footer signatures inside
the image.
```

### Exemple 3 — Système annoté (type 1)

**Contexte** : article "Comment fonctionne un assistant IA avec RAG".

```
A clean flat vector editorial infographic in the style of modern
technical documentation, crisp and informative.

Composition: portrait 4:5 format. Top zone (18%): title and subtitle.
Middle-main zone (72%): central laptop illustration displaying a chat
interface, ~35% of width, centered. Four station-badges at cardinal
positions around it (upper-left, upper-right, lower-left, lower-right),
each connected to the central laptop by a thin navy dashed line. Each
station has a letter label ("A", "B", "C", "D") in a small orange
pastille, an icon in a larger colored circle, and a short text block
beside it. Bottom zone (10%): single key statistic callout. No footer.

Typography (geometric sans-serif):
- Main title (top center, bold 44px, navy): "COMMENT FONCTIONNE UN
ASSISTANT IA RAG"
- Subtitle (below, 18px navy): "Le pipeline en 4 composantes"
- Letter labels in small orange circles: "A", "B", "C", "D"
- Station titles (bold navy 18px): "INGESTION", "EMBEDDINGS",
"RETRIEVAL", "GÉNÉRATION"
- Station descriptions (regular navy 12px, 2 lines each)
- Bottom stat callout (oversized orange 48px): "×3" with small navy
label "PRÉCISION VS CHATBOT STANDARD"

Data viz: no charts. The 4 dashed connection lines from center to
stations suggest the data pipeline.

Icons: flat filled pictograms in navy, each station icon in a 110px
circular badge. Badge colors rotate: station A = cobalt #4F7CD4,
station B = royal violet #8B5CF6, station C = fresh teal #14B8A6,
station D = cobalt #4F7CD4. Central laptop rendered in navy and
cobalt with a minimal chat interface on its screen (two chat bubbles:
one cobalt, one violet).

Strict color palette — anchor colors always present:
- Background: glacier blue #EEF4FC
- Central laptop body: navy #143054, screen: cobalt #4F7CD4
- Chat bubbles on laptop screen: one cobalt #4F7CD4, one violet #8B5CF6
- Station badges: rotating cobalt, violet, teal
- Station letter pastilles (A, B, C, D) AND the bottom "×3" number:
vivid orange #DD8737
- Connection lines: navy #143054 dashed 1.5px
- Station card backgrounds: pure white, thin 1px cobalt #4F7CD4
border at 40% opacity, 10px rounded corners
- All text: navy #143054

Structural: soft 10px rounded corners on station cards; dashed
connection lines from laptop to each station; thin horizontal divider
(1px cobalt 30% opacity) below title; 60px outer margins; no footer.

Aspect ratio 4:5 portrait, approximately 1200x1500.

Avoid: photorealism, 3D rendering, color gradients, drop shadows, glow
effects, lens flare, hand-drawn style, watercolor, paper grain,
corporate memphis, plastic textures, brand logos (no OpenAI or
ChatGPT logo — use only a generic chat bubble), watermarks, emojis,
serif typography, cluttered layouts, pure white backgrounds, warm
beige or cream backgrounds, washed-out pastel colors, website URLs
or footer signatures inside the image.
```

---

## ⚠️ Pièges de formulation du prompt

Certaines formulations provoquent des artefacts chez Nano Banana. À éviter systématiquement :

### Piège 1 — Spécifier la taille en pixels à côté du texte

❌ **NE PAS écrire** : `oversized orange "57%" at 38px bold` → Nano Banana affiche littéralement "38px" dans l'image sous le 57%.

✅ **Écrire à la place** : `oversized bold orange "57%"` ou `very large orange "57%"`.

**Règle** : les specs numériques techniques (px, pt, %, opacité) doivent être **séparées** des strings à rendre. Toujours écrire *"[TEXTE À RENDRE], [instruction typo dans une autre phrase]"*.

### Piège 2 — Textes longs avec accents français

❌ **Attendre un rendu parfait de** : "taux doublé en un an" → peut devenir "taux diblé".

✅ **Raccourcir ou simplifier** : "×2 en un an" ou remplacer par chiffre pur.

**Règle** : pour les stats, privilégier **la forme numérique pure** (%, ×, nombres) sur les phrases descriptives.

### Piège 3 — Température du modèle trop élevée

Nano Banana / Gemini 2.5 Flash Image par défaut à **température 1.0**. Recommandation pour les infographies éditoriales : **0.4** (via API ou Google AI Studio). Baisse les fautes typographiques et stabilise la palette.

### Piège 4 — Spécifier trop de chiffres proches

❌ `"62%" at 42px next to "1.1 SEC" at 42px` → le modèle mélange les nombres.

✅ Décomposer chaque stat dans sa propre ligne de prompt, bien séparée.

### Piège 5 — Données proportionnelles floues

❌ `"bar at -30% reduction"` → le modèle ne calcule pas la proportion, il met juste une barre orange au hasard.

✅ **Être géométriquement explicite** : `"orange bar filling approximately 30% of the container width, with a faded lavender bar filling the remaining 70% behind it, labeled '−30%' on the right"`.

---

## Exemple bonus — catalogue d'erreurs avec pattern complet

### Exemple 4 — Catalogue d'erreurs enrichi (type 7B) ★ Pattern complet avec touches ludiques

**Contexte** : article "5 erreurs qui plombent vos tags Etsy" — section d'un tutoriel plus large.

Ce pattern combine : ornement éditorial header, numérotation "01-05", pastilles solution, sticker ludique, micro-motifs décoratifs, mini-viz d'ancrage dans le takeaway. C'est le pattern **le plus riche** et le plus distinctif pour les listes d'erreurs/pièges.

```
A clean flat vector editorial infographic in the style of a modern
editorial publication like a data-journalism feature, crisp and
structured with a vibrant saturated palette on a fresh glacier blue
background, with tasteful playful accents that give personality
without becoming cartoonish or corporate-memphis.

Composition: portrait 4:5 format. Three zones without footer:
- Zone A (top 16%): editorial tag pill, centered title, subtitle
- Zone B (middle 70%): 5 error cards stacked vertically, decorative
motifs in margins
- Zone C (bottom 14%): enriched takeaway bar with mini-visualization

Zone A:
- Small caps editorial pill near top, centered, 14px bold cobalt
#4F7CD4 on white pill with 1px cobalt border: "GUIDE ETSY · ÉTAPE 4"
- Main title (42px bold navy, 1-2 lines): "5 ERREURS QUI PLOMBENT
VOS TAGS ETSY"
- Subtitle (18px medium navy): "À éviter pour maximiser la visibilité
de vos fiches"

Each error card in Zone B (horizontal layout): (1) large orange
stylized numeral "01"–"05" at 52px bold with thin orange dash
underneath, (2) circular icon badge 80px with content-rich icon, (3)
error text block (bold title + description), (4) vertical teal
solution pill on right edge with "✓ [ACTION]" text.

Card 1 has a playful floating sticker overlapping its upper-right
corner: oval tilted 12°, amber #F59E0B with white bold 11px text
"À ÉVITER !". This sticker appears ONLY on card 1.

[Cards content specified with exact text, icon descriptions, solution
pill text — see Etsy tags example for full detail]

Content-rich icons (flat filled navy in badges):
- Card 1 (cobalt badge): grid of 13 small squares, ~5 filled solid
and 8 outlined only — illustrates the 13 Etsy tag slots with empties
- Card 2 (violet badge): two overlapping tag-shapes both showing
"vintage" at 6px
- Card 3 (teal badge): two "BLEU" tags, one struck through
- Card 4 (cobalt badge): "vintge" with wavy underline, arrow to
"vintage"
- Card 5 (violet badge): two small tags "FR" and "EN" separated by
thin navy line

Micro-decorative motifs in Zone B margins: constellations of 3
cobalt dots (3px each at 60% opacity) at 3 vertical points on both
margins, creating visual rhythm.

Zone C enriched takeaway bar: horizontal rounded-rectangle, teal 20%
opacity fill. Left 60%: bold navy text "CHAQUE TAG = UNE PORTE
D'ENTRÉE UNIQUE" with orange diamond marker. Right 40%: mini-viz of
13 small squares all filled vivid orange in a single row — visual
anchor of the "13 tags" rule. Thin navy vertical divider between
text and mini-viz.

Strict color palette — anchor colors always present:
- Background: glacier blue #EEF4FC
- Cards: pure white with 1px cobalt #4F7CD4 border at 40% opacity,
12px rounded corners
- Editorial pill: white with cobalt border
- Playful sticker on card 1: amber #F59E0B with white text
- Takeaway bar: teal #14B8A6 at 20% opacity with 1px teal border
- Text: deep navy #143054
- Icon badges: rotating cobalt (1, 4), violet (2, 5), teal (3)
- Solution pills: teal #14B8A6 solid with white bold text
- Numerals "01"–"05", tiny dashes, diamond marker, 13 mini-squares:
vivid orange #DD8737
- Decorative margin dots: cobalt #4F7CD4 at 60% opacity

Icon badges MUST have completely flat uniform solid color fills —
no gradient, no radial lighting, no shading, no shine.

Maximum 6 distinct colors (glacier, navy, orange, cobalt, violet,
teal, + amber on the single sticker only).

Structural: 5 cards identical dimensions, 14px gaps, 12px rounded
corners, thin dividers between zones, 48px margins, strict vertical
alignment. No footer.

Aspect ratio 4:5 portrait, ~1200×1500.

Avoid: photorealism, 3D, gradients including radial gradients on
icon badges, drop shadows, glow, lens flare, hand-drawn style,
watercolor, paper grain, corporate memphis with cartoon characters
or disembodied hands, plastic/metallic textures, real Etsy brand
logo, watermarks, mixing filled/outlined icons, emoji characters
(only typographic ✓ × acceptable), serif typography, cluttered
layouts, pure white backgrounds, warm beige or cream backgrounds,
washed-out pastel colors, red or alarm colors (palette stays
approved despite error topic), website URLs or footer signatures
inside the image.
```

---

## 🎈 Patterns ludiques optionnels

Pour donner de la personnalité sans tomber dans le cartoon. **Maximum 3 touches par infographie**.

### Pattern A — Numérotation stylisée
Format "01", "02", "03"... plutôt que "1", "2", "3" nus. Ajoute un petit tiret orange horizontal (8px) sous chaque numéro. **Applicable** à presque toute infographie avec numérotation.

**Dans le prompt** :
> "Numerals in the format '01', '02', '03'... at 52px bold vivid orange, each with a thin 8px orange dash centered beneath the numeral."

### Pattern B — Sticker floatant qui déborde
Un sticker ovale tilté 10-15°, golden amber `#F59E0B` avec texte blanc bold court (2-3 mots en majuscules), qui déborde du coin d'une carte/bloc. **Une seule fois** par infographie, sur l'élément le plus important.

**Exemples de textes** : "À ÉVITER !", "À LIRE !", "POPULAIRE", "NOUVEAU", "PRO TIP", "GAME CHANGER", "N°1 ERREUR"

**Dans le prompt** :
> "A playful floating sticker overlapping the upper-right corner of [element]: oval shape tilted 12 degrees, golden amber #F59E0B background with bold white text '[TEXTE]' at 11px, subtly overlapping by about 15px. This sticker appears ONLY on this element."

### Pattern C — Micro-motifs décoratifs dans les marges
Constellations de 2-3 points ou tirets dans les marges, en couleur d'accent à 50-60% opacité. Crée du rythme visuel.

**Dans le prompt** :
> "Micro-decorative motifs in margins: small constellations of 3 cobalt dots (3px each at 60% opacity) positioned at 3 vertical points in both left and right margins, giving visual rhythm without clutter."

### Pattern D — Pastille éditoriale en header
Petit pill small caps au-dessus du titre qui positionne l'infographie dans une série. **Applicable** à toute infographie faisant partie d'un guide/série.

**Exemples** : "GUIDE ETSY · ÉTAPE 4", "SÉRIE IA POUR PME · N°3", "DATA 2026", "TUTORIEL · PARTIE 2"

**Dans le prompt** :
> "Small caps editorial pill near the top, centered, 14px bold cobalt #4F7CD4 text on pure white pill background with 1px cobalt border: '[TEXTE]'."

### Pattern E — Mini-viz d'ancrage dans le takeaway
Dans la barre de synthèse, ajouter une mini-visualisation qui **incarne** la règle. Rangée de petits carrés, cercles, barres selon le chiffre clé de l'article.

**Dans le prompt** :
> "Right portion of the takeaway bar: mini-visualization of [N] small [squares/circles/bars] in a single row, all filled vivid orange #DD8737 — visually anchoring the [règle] rule. Thin navy vertical divider separates text from mini-viz."

### Pattern F — Pastilles solution (pour les listes d'erreurs/pièges)
À droite de chaque carte d'erreur, une petite pastille verticale teal plein avec le remède en 2-4 mots avec "✓".

**Dans le prompt** :
> "Vertical solution pill on far right edge of each card: rounded-rectangle, teal #14B8A6 solid fill with bold white text on 2 lines 11px: '✓ [ACTION] / [OBJET]'."

### Pattern G — Quadrillage éditorial subtil en arrière-plan

Motif de grille très discret en arrière-plan de l'infographie : lignes croisées cobalt à 10-15% opacité, espacement régulier de 30-40px. Donne un **feel "fiche de travail" / "page de rapport éditorial"** sans jamais concurrencer le contenu. Testé avec succès sur des infographies de type tutoriel et dashboard.

**Idéal pour** : infographies denses (tutoriels, dashboards, processus complexes) où on veut évoquer le sérieux méthodique sans charger l'image.

**Dans le prompt** :
> "Very subtle grid pattern in the background: thin 1px cobalt #4F7CD4 lines at 12% opacity forming a regular grid with 32px spacing, visible but extremely discrete, giving the infographic an editorial worksheet feel without competing with the foreground content. The grid sits strictly behind all cards and elements."

**À éviter** :
- Grille trop contrastée (>20% opacité) — dominerait visuellement
- Grille visible par-dessus les éléments (elle doit être strictement en arrière-plan)
- Espacement trop serré (<20px) — devient bruit visuel

### Combinaisons recommandées

| Type infographie | Touches recommandées |
|------------------|----------------------|
| Catalogue d'outils (7A) | A (numérotation) + D (pastille éditoriale) + G (grille subtile) |
| Catalogue d'erreurs (7B) | A + B + C + D + E + F (pattern complet) |
| Processus numéroté (2) | A + D + G |
| Concept + stats (4) | B (sticker focal) + D |
| Comparaison (3) | D uniquement (rester sobre) |
| Système annoté (1) | D + E + G |
| Stack hiérarchique (5) | A + D |
| Dashboard multi-widgets (6) | D + E + G (la grille rehausse le feel "dashboard") |

**Règle finale** : si tu hésites à ajouter une touche, ne l'ajoute pas. La personnalité vient de la cohérence, pas de l'accumulation.

---

## Anti-patterns fréquents

### ❌ Prompt trop vague sur les textes
Nano Banana inventera du Lorem Ipsum. **Toujours spécifier chaque texte entre guillemets** avec emplacement exact.

### ❌ Trop d'éléments (>9 focaux)
Infographies lisibles = 7-9 éléments focaux max. Si plus, passer en format portrait 4:5 ou 2:3.

### ❌ Palette diluée en pastels
Les pastels `#81AED7` et `#DBCFEE` sont **dépréciés pour les infographies**. Toujours préférer les accents vifs (`#4F7CD4`, `#8B5CF6`, `#14B8A6`).

### ❌ Mélanger styles d'icônes
Choisir filled OU outlined et s'y tenir pour toute l'image.

### ❌ Oublier les données chiffrées
Une infographie sans stats ≠ une infographie. **Au moins 2-3 valeurs chiffrées précises**.

### ❌ Logos de marques réelles
Droits + Nano Banana les rend mal. **Icônes catégoriques génériques** uniquement.

### ❌ Ajouter un footer / URL
**Jamais** de "5pennyai.com" ou autre signature dans l'image. Le branding se fait côté publication.

### ❌ Oublier la section avoid:
Sans anti-patterns explicites, Nano Banana dérive vers dégradés, drop shadows, 3D.

---

## Conseils pour itération

**Rendu trop "stock Freepik"** → ajouter plus de spécificité (chiffres exacts, labels exacts), renforcer "editorial tech report style, not generic clipart".

**Dégradés ou drop-shadows apparaissent** → durcir [9] : "absolutely no gradients anywhere, no drop shadows whatsoever, completely flat colors".

**Texte illisible ou inventé** → vérifier guillemets et positions, raccourcir labels, ajouter "all text must be rendered exactly as specified".

**Composition chaotique** → instructions de grille explicites : "strict 12-column grid alignment", "all cards perfectly aligned".

**Orange prend trop de place** → "Orange #DD8737 MUST appear ONLY on: [specific list]. Nowhere else."

**Icônes incohérentes** → "All icons share: identical visual weight, identical stroke width, identical level of detail, identical circular badge of the same diameter."

**Manque d'"éditorial"** → ajouter dividers, pastilles de numéro, ligne sous le titre.

**Rendu fade (palette terne)** → renforcer "vibrant saturated colors, not pastel, not washed-out", préciser HEX des accents explicitement.

**Un footer apparaît malgré tout** → ajouter à [9] "no footer text, no URL, no website, no signature, no watermark anywhere in the image".

**Nano Banana rend mal en français** → tester EN en principal, ou s'assurer des accents présents dans guillemets (é, è, ê, à, ù).
