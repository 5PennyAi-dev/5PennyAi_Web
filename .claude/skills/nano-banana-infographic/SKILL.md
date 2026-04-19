---
name: nano-banana-infographic
description: Génère des prompts optimisés pour Nano Banana (Google Gemini 2.5 Flash Image) afin de produire des infographies éditoriales flat vector pour le blog 5PennyAi — illustrations + schémas + texte intégré + data-viz. Utilise cette skill dès que l'utilisateur demande une infographie, un visuel explicatif, une illustration informative, un header d'article, une figure pour le blog, un prompt image, un prompt Gemini, un prompt Nano Banana, ou mentionne "crée un visuel pour l'article", "infographie sur", "illustration avec données", "schéma illustré avec chiffres", "visuel récapitulatif", "carte des outils", "dashboard visuel". Se déclenche aussi quand un article contient des statistiques, des listes d'outils, des étapes numérotées, ou des comparaisons chiffrées qui gagneraient à être visualisés ensemble.
---

# Nano Banana Infographic — Infographies flat vector pour le blog 5PennyAi

Skill de génération de prompts pour **Nano Banana** (Google Gemini 2.5 Flash Image) afin de produire des **infographies éditoriales flat vector** pour le blog 5PennyAi — des visuels qui combinent **illustrations stylisées, schémas, texte intégré et data-viz** dans une composition dense, structurée et **visuellement vibrante**.

## Contexte et intention

Le blog 5PennyAi cible des PME et professionnels intéressés par l'IA appliquée. Les articles contiennent souvent des **statistiques, des listes d'outils, des étapes numérotées, des comparaisons chiffrées** — exactement le type de contenu qui gagne à être synthétisé en une infographie.

Les infographies produites doivent :

- **Condenser l'information** clé de l'article en un visuel autoportant
- Combiner **icônes, texte, chiffres, mini-graphiques** en une composition claire
- Utiliser la **palette 5PennyAi enrichie** (ancrage marque + accents vifs)
- Être **partageables** (LinkedIn, newsletter, Pinterest) en plus de servir dans l'article

**Quand ne PAS utiliser cette skill** :
- Pour un schéma technique précis → utiliser `excalidraw-diagram`
- Pour une simple illustration décorative sans donnée → pas besoin d'infographie

**Nano Banana et le texte** : la version Gemini 2.5 Flash Image rend désormais le texte très bien. Tu peux intégrer titres, stats chiffrées, labels courts, sous-titres. Règle : chaque label reste concis, chiffres et pourcentages sont tes meilleurs amis.

**Pas de footer / signature** : l'infographie ne contient **jamais** de footer avec URL, nom de site, ou signature dans l'image elle-même. Le branding se fait côté publication (contexte d'article, watermark ajouté après).

## Style visuel à produire

**Infographie éditoriale flat vector vibrante** : composition propre, icônes géométriques flat, typographie sans-serif nette avec hiérarchie claire, **palette colorée affirmée** (couleurs d'ancrage marque + accents vifs : cobalt, violet, teal), données chiffrées mises en valeur, mini-éléments de data-viz, pastilles et cartouches pour les labels, lignes de connexion fines.

**Pas** de hand-drawn, **pas** de watercolor, **pas** de 3D, **pas** de corporate memphis, **pas** de pastels diluées.

Détails techniques complets dans `references/visual-style.md` — **lis ce fichier en début de session**.

## Processus

### Étape 1 — Analyser l'article et extraire le matériau

Extraire :

1. **Titre principal de l'infographie** (accrocheur, 5-8 mots)
2. **Sous-titre optionnel** (10-15 mots max)
3. **Éléments structurants** : outils, étapes, catégories
4. **Chiffres clés et statistiques** (3-6 max, les plus frappants)
5. **Une citation ou phrase-choc** (optionnelle)

Si l'article est vague, poser 2 questions :
- Quel est le message principal ?
- Format header horizontal ou figure portrait ?

### Étape 2 — Choisir le type d'infographie

Consulter `references/diagram-types.md` pour les 7 types :

1. **Système annoté** (stations autour d'un centre)
2. **Processus numéroté** (étapes 1→N)
3. **Comparaison chiffrée** (A vs B avec données)
4. **Concept + stats constellation**
5. **Stack hiérarchique** (couches verticales)
6. **Dashboard multi-widgets**
7. **Catalogue en grille** (N outils/éléments)

Le choix est **piloté par la structure du contenu**, pas l'inverse.

### Étape 2bis — Choisir le format (aspect ratio)

**⚠️ Étape importante** : consulter `references/format-guide.md` pour choisir le **format approprié**.

**Règle par défaut** : privilégier le **landscape (16:9 ou 3:2)** qui s'intègre naturellement au flux de lecture. Le **portrait 4:5** doit être **justifié** (vraiment nécessaire pour 5+ items verticaux).

**Format recommandé par type** (voir format-guide.md pour le détail) :
- Comparaison (3), Concept + stats (4), Système annoté (1) → **16:9 landscape**
- Dashboard (6), Processus 4-5 étapes (2) → **3:2 landscape**
- Catalogue 4 items équilibré → **1:1 square**
- Catalogue 5-7 items (7A/7B), Stack hiérarchique (5), Processus 6+ étapes → **4:5 portrait** (avec justification)

**Objectif éditorial** : un article standard ne devrait pas contenir plus d'**1 infographie portrait 4:5** pour préserver le rythme de lecture.

### Étape 3 — Rédiger le prompt Nano Banana

Utiliser le template de `references/prompt-patterns.md`. Chaque prompt contient dans l'ordre :

1. **Médium + style global**
2. **Composition détaillée par zones**
3. **Éléments typographiques exacts** (TOUS les textes entre guillemets)
4. **Data-viz spécifiques**
5. **Icônes** (style + liste par zone, couleurs des pastilles)
6. **Palette HEX** (ancrage + 2-3 accents vifs de la palette enrichie)
7. **Éléments structurants**
8. **Format et aspect ratio**
9. **Négatifs** (avoid:)

### Étape 4 — Livrer

Format de sortie standard :

```markdown
## Infographie proposée

**Titre de l'infographie** : [titre final, 5-8 mots]
**Sous-titre** : [10-15 mots] *(si applicable)*
**Type** : [ex. "Catalogue en grille — 7 outils"]
**Message principal** : [1 phrase]
**Format recommandé** : [ex. "Portrait 4:5 pour figure inline"]

### Éléments textuels extraits de l'article

- **Titre** : "[texte]"
- **Sous-titre** : "[texte]"
- **Stats clés** : "[XX%]", "[YY]", etc.
- **Labels** : [liste]

### Prompt Nano Banana (EN — recommandé)

```
[Prompt complet en anglais, 200-400 mots]
```

### Prompt Nano Banana (FR — alternative)

```
[Version française adaptée]
```

### Alt text pour le blog

- **FR** : [description accessible, 2-3 phrases]
- **EN** : [English alt text]

### Notes pour itération

[3-5 suggestions d'ajustement]
```

## Règles dures

- **Toujours** inclure la palette HEX enrichie avec rôles attribués
- **Toujours** fournir les textes exacts entre guillemets
- **Toujours** section "avoid:" explicite, incluant "no website URLs or footer signatures inside the image"
- **Jamais** nommer un artiste ou studio réel
- **Jamais** photoréalisme, 3D, ou hand-drawn
- **Jamais** de logos de marques réelles (icônes catégoriques génériques)
- **Jamais** de footer / URL / signature dans l'image
- **Jamais** les pastels `#81AED7` ou `#DBCFEE` comme pastilles d'icônes (préférer les accents vifs `#4F7CD4`, `#8B5CF6`, `#14B8A6`)
- **Orange `#DD8737`** : accent focal unique, pas de dominante
- **Texte** : illimité en nombre, mais chaque label reste court et lisible
- **Jamais** spécifier une taille de police en pixels collée à un texte (`"57%" at 38px` → le modèle écrira "38px" dans l'image). Utiliser "oversized", "very large", "medium", etc.
- **Alterner les variantes de takeaway** entre infographies d'une même série éditoriale (voir `visual-style.md` section "Variantes de zone takeaway")

## 🌡️ Paramètres de génération recommandés

Pour Nano Banana / Gemini 2.5 Flash Image (via API ou Google AI Studio) :

- **Température : 0.4** (✅ validée empiriquement sur 5+ infographies 5PennyAi). C'est l'équilibre idéal entre respect strict des spécifications (textes exacts, palette, HEX) et créativité sur les détails (composition des icônes, disposition). Le défaut 1.0 produit des fautes typographiques inventées et des artefacts parasites comme l'écriture littérale de specs techniques ("38px" rendu en texte).
- **Seed** : fixer une seed pour reproductibilité si itération sur un prompt précis.
- **Aspect ratio** : toujours spécifier dans le prompt ET dans les paramètres de génération si possible.

### Signes qu'il faut baisser la température encore plus (0.2–0.3)

- Fautes typographiques récurrentes dans les textes français avec accents
- Palette qui dérive (ex : bleu trop clair à la place du cobalt)
- Éléments décoratifs qui apparaissent sans être demandés

### Signes qu'on peut monter un peu (0.5–0.6)

- Les icônes sont systématiquement trop simples / génériques
- On veut de la variété créative sur les compositions d'icônes pour un même article-série

## Checklist avant livraison

- [ ] Titre principal formulé (5-8 mots)
- [ ] 3-6 stats chiffrées identifiées
- [ ] Type d'infographie choisi selon la structure du contenu
- [ ] Prompt contient les 9 sections dans l'ordre
- [ ] Tous les textes entre guillemets avec emplacement
- [ ] Palette HEX enrichie avec rôles (ancrage + 2-3 accents vifs)
- [ ] Section "avoid:" présente avec "no footer / URL / signature in image"
- [ ] Aspect ratio adapté à l'usage
- [ ] Alt text FR + EN
- [ ] Prompt EN (principal) + FR (alternative)
- [ ] Notes d'itération

## Fichiers de référence

- `references/visual-style.md` — style flat vector infographique en détail : composition, typographie, icônographie, data-viz, **palette enrichie**, do/don't
- `references/diagram-types.md` — les 7 types avec exemples de composition
- `references/format-guide.md` — **choix du format (aspect ratio)** selon le type d'infographie, recommandations éditoriales
- `references/prompt-patterns.md` — template 9-sections, **exemples complets**, anti-patterns

**Lis `visual-style.md` en début de session.** Les deux autres au moment du choix de type et de la rédaction du prompt.
