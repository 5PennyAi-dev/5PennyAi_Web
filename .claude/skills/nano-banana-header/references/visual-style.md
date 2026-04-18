# Style visuel — Hero éditorial asymétrique

Ce fichier définit le style cible pour toutes les images d'en-tête du blog 5PennyAi. Lis-le en début de session.

## Philosophie du style

**Hero éditorial asymétrique** à la Stripe Press, Ramp blog, Notion blog : une composition en deux zones où la typographie porte le sujet d'un côté, et 3-4 objets conceptuels flat racontent une mini-histoire de l'autre. Une petite signature éditoriale en haut ancre l'article dans une catégorie (série).

**Trois mots-clés** : *éditorial, asymétrique, signature*.

**Inspiration générique** (à décrire techniquement, jamais à nommer dans un prompt) : blog heroes de publications tech premium contemporaines, couvertures de magazines business haut de gamme, pages d'accueil de SaaS leaders (Linear, Vercel, Stripe).

## Structure de la composition

```
┌──────────────────────────────────────────┐
│         [PASTILLE ÉDITORIALE]            │  ← zone haute
│                                           │
│   TITRE DE                                │
│   L'ARTICLE         [OBJET 1]   [OBJET 2]│
│   ───                                     │
│   SOUS-TITRE         [OBJET 3] 🟠        │  ← focal orange
│                       [OBJET 4]           │
│                                           │
└──────────────────────────────────────────┘
       Zone titre (55%)    Zone objets (45%)
```

- **Pastille éditoriale** en haut centrée (petite, discrète)
- **Zone titre** à gauche (55% width) : titre + séparateur + sous-titre
- **Zone objets** à droite (45% width) : 3-4 objets flat
- **Focal orange** : un petit badge circulaire (48px) intégré dans la zone objets, près d'un des objets (souvent la loupe si présente)

## Caractéristiques techniques

### Composition asymétrique

- **Titre aligné à gauche**, vertical-centré dans les 75% inférieurs
- **Objets à droite** arrangés asymétriquement mais équilibrés
- **Tilts variés** (5-15°) sur les objets pour éviter l'aspect rigide
- **Espace négatif généreux** dans les coins (upper-right, lower-left)
- **Overlap léger** entre 2-3 objets pour créer de la profondeur visuelle (pas trop)

### Typographie

**Hiérarchie stricte à 3 niveaux** :

1. **Pastille éditoriale** : small caps, cobalt `#4F7CD4`, 14px bold, dans un pill blanc (light) ou transparent (dark)
2. **Titre principal** : large bold, navy `#143054` (light) ou cream `#F7F5F2` (dark), left-aligned
3. **Sous-titre** : medium weight, navy (light) ou cream à 85% (dark), all caps avec slight letter-spacing

**Règle importante** : le sous-titre **n'est jamais en orange** (l'orange est réservé au focal unique).

**Rendu du texte dans Nano Banana** :
- Encapsuler chaque texte entre guillemets
- **Titre : 3-5 mots maximum** (si plus long, le modèle l'écrase ou le tronque)
- **Sous-titre : 4-8 mots maximum**
- Séparer titre et sous-titre par un petit trait orange de 3px × 60px

### Objets métaphoriques

- **Flat vector 2D pur** — pas de 3D, pas d'isométrique pour les headers (réservé aux infographies type stack si besoin)
- **3 à 4 objets maximum** par image
- **Tailles variées** mais coordonnées : un objet principal (220-280px), 2 secondaires (120-160px), 1 discret (80-100px)
- **Tilts variés** (5-15°) pour le mouvement
- **Contours navy** fins (2px) quand le contraste l'exige
- **Cohérence de style** : tous les objets dans le même registre (tous "illustrés au trait" ou tous "solides")

Voir `metaphor-library.md` pour les combinaisons d'objets par thème.

### Focal accent orange

**Un seul élément** en orange vif `#DD8737` dans toute l'image :

- **Format** : petit cercle solide de 40-50px diamètre, positionné près d'un objet (souvent partiellement overlap sur la loupe ou le document principal)
- **Contenu** : un chiffre ou symbole court en blanc bold (ex : "5", "7", "×2", "→", "!", "?")
- **Rôle** : point focal visuel qui attire immédiatement l'œil et donne un indice du contenu (chiffre dans le titre, symbole d'action, etc.)
- **Jamais dupliqué** — s'il y a un "5", pas d'autre pastille orange ailleurs

### Pastille éditoriale (signature variable)

Petit pill rectangulaire arrondi positionné en haut centré, ~60px du bord supérieur :

- **Light version** : fond blanc pur, bordure 1px cobalt `#4F7CD4`, texte small caps bold cobalt
- **Dark version** : fond transparent, bordure 1px cobalt à 80% opacité, texte small caps bold cobalt
- **Contenu** : "5PENNYAI · [CATÉGORIE]" (ex : "5PENNYAI · INSIGHTS")
- **Taille texte** : 14px bold
- **Letter-spacing** : léger (+0.05em)

---

## 🎨 Palette — Variantes Light et Dark

### Variante Light (fond glacier) — pour TUTORIEL, CAS D'USAGE, ACTUALITÉ

| Couleur | HEX | Rôle |
|---------|-----|------|
| **Glacier** | `#EEF4FC` | Fond de l'image |
| **Navy** | `#143054` | Titre, sous-titre, contours, objets dominants |
| **Orange** | `#DD8737` | Focal accent unique + séparateur court sous le titre |
| **Cobalt** | `#4F7CD4` | Objets secondaires (livre, éléments structurels), pastille éditoriale |
| **Violet** | `#8B5CF6` | Objets secondaires alternatifs (documents, formes) |
| **Teal** | `#14B8A6` | Petits points décoratifs, mini data-viz si présente |

### Variante Dark (fond navy) — pour INSIGHTS, STRATÉGIE

| Couleur | HEX | Rôle |
|---------|-----|------|
| **Deep navy** | `#0F1E3D` | Fond de l'image (pas pur noir) |
| **Cream** | `#F7F5F2` | Titre, sous-titre (85% opacity), contours, pages de livre |
| **Orange** | `#DD8737` | Focal accent unique + séparateur court |
| **Cobalt** | `#4F7CD4` | Objets principaux (livre), pastille bordure |
| **Violet** | `#8B5CF6` | Objets secondaires |
| **Teal** | `#14B8A6` | Petits points décoratifs |

**Effet dark mode** : les accents (cobalt, violet, teal, orange) deviennent **lumineux et électriques** sur le fond navy profond — c'est la signature recherchée de cette variante.

## À ne JAMAIS faire

- ❌ Photoréalisme, 3D, isométrique (réservé aux infographies si besoin)
- ❌ Dégradés, ombres portées fortes, glow effects
- ❌ Hand-drawn, watercolor, textures papier
- ❌ Personnages cartoon, visages, mains, corporate memphis
- ❌ Mascottes "AI" stylisées (le robot mignon à éviter absolument)
- ❌ Logos de marques réelles
- ❌ Plus de 6 couleurs distinctes
- ❌ Plus de 4 objets métaphoriques
- ❌ Titre de plus de 5 mots / sous-titre de plus de 8 mots
- ❌ Sous-titre en orange (orange réservé au focal unique)
- ❌ Plus d'un accent orange (un seul focal par image)
- ❌ Fond pur blanc ou pur noir (toujours glacier ou deep navy)
- ❌ Typographie serif ou script (toujours sans-serif géométrique)
- ❌ Spécifier une taille en pixels collée à un texte (bug "38px")
- ❌ Plusieurs textes non prévus (titre + sous-titre + pastille seulement)

## Formulation négative standard

```
Avoid: photorealism, 3D rendering, isometric perspective, color
gradients, drop shadows, glow effects, lens flare, hand-drawn or
sketch style, watercolor textures, paper grain, corporate memphis
illustration style with cartoon characters or stylized figures or
disembodied hands, plastic or metallic textures, cartoon robots or
AI mascots, real brand logos, watermarks, mixing filled and outlined
icons, emojis, serif or script typography, cluttered layouts, pure
white backgrounds, pure black backgrounds, warm beige or cream
backgrounds (in light version), washed-out pastel colors, multiple
orange elements competing for attention, subtitle rendered in orange
color, additional text beyond title/subtitle/editorial pill, text
labels containing pixel measurements, website URLs or footer
signatures or "5pennyai.com" anywhere in the image.
```

## Feel test

1. L'image pourrait-elle apparaître en bannière d'un article Ramp, Notion ou Stripe sans dépareiller ?
2. La signature éditoriale est-elle reconnaissable même en miniature (LinkedIn feed) ?
3. Le focal orange attire-t-il l'œil immédiatement ?
4. Le ton (light/dark) reflète-t-il bien le registre de l'article (pédagogique vs analytique) ?
5. Les objets métaphoriques racontent-ils une mini-histoire cohérente avec le sujet ?

Si tu hésites sur l'un de ces 5 points, retravaille.
