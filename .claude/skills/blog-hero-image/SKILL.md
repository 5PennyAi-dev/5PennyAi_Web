---
name: blog-hero-image
description: Génère des prompts d'images titre/hero pour les articles de blog 5PennyAi. Utilise cette skill quand l'utilisateur demande un prompt d'image pour un article de blog, une image de couverture, une hero image, un visuel de blog, ou quand le blog-generator a besoin de remplir la section "IMAGE DE COUVERTURE". Se déclenche aussi pour "image pour l'article", "visuel de blog", "cover image", "hero image", "thumbnail blog", ou toute demande de prompt d'image liée au blog 5PennyAi.
---

# Blog Hero Image Prompt Generator — 5PennyAi

Génère des prompts d'image cohérents, distinctifs et conceptuellement riches pour les articles de blog 5PennyAi. L'outil cible est **Nano Banana Pro**, mais les prompts fonctionnent aussi avec DALL-E, Midjourney ou Flux.

## Le problème qu'on résout

Les prompts génériques ("un robot devant un ordinateur", "des engrenages avec un cerveau") produisent des images interchangeables. Ce skill force une approche **métaphore d'abord** : chaque image raconte visuellement le sujet spécifique de l'article.

## Style visuel — La signature 5PennyAi

Chaque prompt DOIT inclure ces constantes stylistiques pour garantir la cohérence :

### Constantes obligatoires (à inclure textuellement dans chaque prompt)

```
Style: flat minimalist vector illustration, clean geometric shapes, 
limited color palette, bold outlines, no gradients, no shadows, 
no photorealism, no 3D rendering. Negative space as design element.
```

### Palette de couleurs

- **Primaire** : bleu 5PennyAi `#81AED7` (ciel, confiance, tech)
- **Accent** : orange 5PennyAi `#DD8737` (énergie, action, CTA)
- **Fond** : blanc cassé `#F8F6F2` ou bleu très pâle `#EDF4F9`
- **Contraste** : gris charbon `#2D3142` pour les contours et le texte visuel
- **Règle** : max 4 couleurs par image. Le bleu domine (~60%), l'orange accentue (~15%), le reste en neutres.

### Format

- Ratio : **16:9** (1792×1024 ou équivalent)
- Composition : **décentrée**, sujet principal au tiers gauche ou droit
- Espace négatif : minimum 30% de l'image doit rester "vide" pour permettre la superposition de texte

## Processus de génération du prompt

### Étape 1 — Extraire le concept central

À partir du titre et du contenu de l'article, identifier :
1. **Le sujet concret** : de quoi parle l'article ? (ex: "automatisation des emails par IA")
2. **La transformation** : quel est le avant/après ? (ex: "boîte de réception chaotique → flux organisé")
3. **L'émotion cible** : que doit ressentir le lecteur ? (ex: soulagement, curiosité, ambition)

### Étape 2 — Trouver la métaphore visuelle

C'est l'étape clé. NE PAS illustrer littéralement. Chercher une **métaphore concrète et originale**.

#### Méthode : la chaîne d'associations

1. Prendre le concept central
2. Lister 5 associations d'idées (pas les premières qui viennent — celles-là sont les clichés)
3. Combiner 2 associations inattendues

#### Exemples de bonnes vs mauvaises métaphores

| Sujet de l'article | ❌ Cliché | ✅ Métaphore originale |
|---|---|---|
| IA pour le service client | Robot avec casque d'écoute | Entonnoir qui transforme des points d'interrogation en coches vertes |
| Automatisation des workflows | Engrenages connectés | Dominos colorés tombant en cascade sur un bureau minimaliste |
| Sécurité des données IA | Cadenas sur un nuage | Parapluie géométrique protégeant des formes abstraites d'une pluie de 0 et 1 |
| SEO et IA | Loupe sur un écran | Phare stylisé éclairant un chemin parmi des étoiles-mots-clés |
| Prompt engineering | Personne qui tape au clavier | Clé à molette ajustant un diamant brut qui émet de la lumière |
| Réduction des coûts par IA | Graphique descendant | Balance géométrique avec une plume (IA) qui soulève une pile de pièces |

### Étape 3 — Composer le prompt

Structure obligatoire du prompt final :

```
[STYLE] + [SCÈNE/MÉTAPHORE] + [PALETTE] + [COMPOSITION] + [EXCLUSIONS]
```

#### Template

```
Flat minimalist vector illustration, clean geometric shapes, bold outlines, 
no gradients, no shadows, no photorealism. 

[DESCRIPTION DE LA MÉTAPHORE VISUELLE — 2-3 phrases précises et concrètes].

Color palette: sky blue (#81AED7) as dominant, warm orange (#DD8737) as accent 
on [élément spécifique à accentuer], off-white (#F8F6F2) background, 
charcoal (#2D3142) outlines. Maximum 4 colors.

Composition: [position du sujet — ex: "subject positioned at right third"], 
generous negative space on [left/right/top] for text overlay. 
16:9 aspect ratio.

No: photorealism, 3D rendering, gradients, drop shadows, human faces, 
stock photo aesthetic, busy backgrounds, text or letters in the image.
```

### Étape 4 — Variations

Toujours fournir **2 prompts** :
- **Option A** : la métaphore principale
- **Option B** : une métaphore alternative (angle différent sur le même sujet)

Cela donne du choix sans multiplier les itérations.

## Règles absolues

1. **Jamais de visages humains** — les personnages sont des silhouettes géométriques ou absents
2. **Jamais de texte dans l'image** — le titre sera superposé après
3. **Jamais de clichés visuels IA** : pas de cerveau-circuit, pas de robot humanoïde, pas de main qui touche un écran holographique, pas de réseau neuronal lumineux
4. **Toujours la palette de marque** — chaque image doit être immédiatement reconnaissable comme 5PennyAi
5. **Toujours du negative space** — l'image doit "respirer" et permettre la lisibilité du titre superposé

## Exemple complet

### Input
Article : "5 façons d'utiliser l'IA pour gagner du temps dans votre PME"

### Output

**Concept** : Gain de temps grâce à l'IA dans les opérations quotidiennes d'une PME.
**Transformation** : journées surchargées → temps libéré pour l'essentiel.
**Émotion** : soulagement, légèreté.

**Option A — Le sablier libérateur**

```
Flat minimalist vector illustration, clean geometric shapes, bold outlines, 
no gradients, no shadows, no photorealism.

A large geometric hourglass tilted on its side, with its sand replaced by 
tiny task icons (envelopes, spreadsheets, checkmarks) flowing out and 
transforming into birds taking flight. The birds are simple triangular shapes 
ascending toward the upper right corner.

Color palette: sky blue (#81AED7) as dominant fill for the hourglass, 
warm orange (#DD8737) on the birds and a few task icons, off-white (#F8F6F2) 
background, charcoal (#2D3142) outlines. Maximum 4 colors.

Composition: hourglass positioned at right third, birds flowing toward 
upper right. Generous negative space on left side for text overlay. 
16:9 aspect ratio.

No: photorealism, 3D rendering, gradients, drop shadows, human faces, 
stock photo aesthetic, busy backgrounds, text or letters in the image.
```

**Option B — Le bureau allégé**

```
Flat minimalist vector illustration, clean geometric shapes, bold outlines, 
no gradients, no shadows, no photorealism.

A split-view desk scene. Left side: a cluttered geometric desk with stacked 
rectangles (papers), small squares (sticky notes), overlapping circles 
(notifications). Right side: the same desk nearly empty, with a single 
clean rectangle (screen) showing a simple checkmark, and a small geometric 
plant. A subtle dotted arrow connects the two sides.

Color palette: sky blue (#81AED7) on the clean side elements, 
warm orange (#DD8737) on the checkmark and plant, off-white (#F8F6F2) 
background, charcoal (#2D3142) outlines and clutter. Maximum 4 colors.

Composition: split view centered, with slightly more visual weight on 
the clean right side. Balanced negative space above for text overlay. 
16:9 aspect ratio.

No: photorealism, 3D rendering, gradients, drop shadows, human faces, 
stock photo aesthetic, busy backgrounds, text or letters in the image.
```

## Intégration avec le blog-generator

Quand ce skill est utilisé dans le contexte du blog-generator, le prompt final remplace la section `## IMAGE DE COUVERTURE` du format de sortie. Fournir les 2 options (A et B) pour que l'utilisateur choisisse.
