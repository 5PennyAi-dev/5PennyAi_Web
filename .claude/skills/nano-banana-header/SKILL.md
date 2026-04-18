---
name: nano-banana-header
description: Génère des prompts optimisés pour Nano Banana (Google Gemini 2.5 Flash Image) afin de produire des images d'en-tête éditoriales 16:9 pour les articles du blog 5PennyAi — composition asymétrique avec titre à gauche, objets conceptuels à droite, signature éditoriale variable (INSIGHTS, TUTORIEL, CAS D'USAGE, ACTUALITÉ, STRATÉGIE). Utilise cette skill dès que l'utilisateur demande une image d'en-tête, une bannière d'article, un header, une cover image, une illustration d'article, une image de couverture, un visuel principal, une hero image. Se déclenche aussi quand un nouvel article est créé et qu'il lui faut une image principale, ou quand une image existante doit être remplacée pour cohérence éditoriale.
---

# Nano Banana Header — Images d'en-tête éditoriales pour le blog 5PennyAi

Skill de génération de prompts pour **Nano Banana** (Google Gemini 2.5 Flash Image) afin de produire des **images d'en-tête éditoriales 16:9** pour les articles du blog 5PennyAi. Ces images servent à la fois de **bannière d'article** sur le site et d'**image de partage** sur LinkedIn, Twitter, Pinterest, newsletter.

## Contexte et intention

Contrairement aux **infographies internes** (voir skill `nano-banana-infographic`) qui expliquent et structurent de l'information, les **images d'en-tête** ont un rôle différent :

- **Rôle** : attirer l'œil, évoquer le sujet, donner le ton éditorial
- **Durée de regard** : 1-2 secondes (accroche), pas de lecture longue
- **Texte intégré** : titre + sous-titre + signature éditoriale (≤15 mots total dans l'image)
- **Format** : toujours 16:9 landscape (1920×1080)

Les images générées doivent :
- Partager la **palette 5PennyAi** avec les infographies (pour cohérence visuelle du blog)
- Utiliser un **registre éditorial clair** via le label (INSIGHTS, TUTORIEL, CAS D'USAGE, ACTUALITÉ, STRATÉGIE)
- Fonctionner aussi bien **sur le site** qu'en **partage social** (LinkedIn, newsletter)

## Style visuel à produire

**Hero éditorial asymétrique** : titre à gauche (~55% width), composition de 3-4 objets conceptuels métaphoriques à droite (~45% width), petite pastille éditoriale en haut centrée, un unique focal orange (petit badge avec chiffre ou symbole).

Deux variantes de fond au choix selon le registre de l'article :
- **Light (glacier `#EEF4FC`)** — registre accessible, pédagogique, pratique
- **Dark (navy profond `#0F1E3D`)** — registre premium, analytique, editorial

Détails techniques complets dans `references/visual-style.md` — **lis ce fichier en début de session**.

## Processus

### Étape 1 — Analyser l'article

Extraire de l'article :

1. **Le sujet central** (1 phrase : de quoi parle l'article)
2. **Le titre** (version courte pour l'image : 3-5 mots max)
3. **Le sous-titre** (accroche de 4-8 mots max, pas le sous-titre complet de l'article)
4. **Le registre éditorial** : pédagogique ? analytique ? pratique ? démystification ?
5. **Le "focal visuel"** : un chiffre ou symbole court qui évoque le contenu (ex : "5" pour "5 mythes", "×2" pour "doubler", "→" pour "transformation", "!" pour surprise, "?")

### Étape 2 — Choisir la catégorie éditoriale et le fond

Consulter `references/editorial-categories.md` pour choisir parmi les 5 labels :

- **INSIGHTS** 🌙 → dark navy
- **STRATÉGIE** 🌙 → dark navy
- **TUTORIEL** ☀️ → light glacier
- **CAS D'USAGE** ☀️ → light glacier
- **ACTUALITÉ** ☀️ → light glacier

La règle est automatique : **la catégorie détermine le fond**. Cette cohérence aide le lecteur à identifier le type de contenu au premier coup d'œil.

### Étape 3 — Choisir les 3-4 objets métaphoriques

Consulter `references/metaphor-library.md` pour trouver les bons objets selon le thème de l'article (IA, automatisation, vente, SEO, service client, etc.).

**Règles** :
- **3 à 4 objets maximum** (trop = encombré)
- **Objets complémentaires** qui racontent ensemble une mini-histoire (pas 4 objets au hasard)
- **Formes flat 2D** simples et reconnaissables
- **Tailles variées** mais dans une gamme cohérente (120-280px)

### Étape 4 — Rédiger le prompt Nano Banana

Utiliser le template de `references/prompt-patterns.md`. Chaque prompt contient :

1. **Médium + style global**
2. **Composition asymétrique détaillée** (titre gauche, objets droite)
3. **Pastille éditoriale** (texte et emplacement)
4. **Typographie exacte** (titre, sous-titre, séparateur orange)
5. **Objets métaphoriques** (liste précise avec position, taille, couleur, tilt)
6. **Focal accent** (petit badge orange avec chiffre/symbole)
7. **Palette HEX** (light ou dark selon registre)
8. **Format 16:9**
9. **Négatifs** (avoid:)

### Étape 5 — Livrer

Format de sortie standard :

```markdown
## Image d'en-tête proposée

**Catégorie éditoriale** : [INSIGHTS / TUTORIEL / CAS D'USAGE / ACTUALITÉ / STRATÉGIE]
**Fond** : [Light glacier ☀️ / Dark navy 🌙]
**Titre dans l'image** : "[3-5 mots]"
**Sous-titre dans l'image** : "[4-8 mots]"
**Focal visuel** : "[chiffre ou symbole court]"
**Objets métaphoriques** : [liste des 3-4 objets choisis]

### Prompt Nano Banana (EN — recommandé)

```
[Prompt complet, 200-400 mots]
```

### Prompt Nano Banana (FR — alternative)

```
[Version française]
```

### Alt text pour le blog

- **FR** : [description accessible, 2 phrases]
- **EN** : [English alt text]

### Notes pour itération

[3-5 suggestions d'ajustement]
```

## Règles dures

- **Toujours** inclure la pastille éditoriale en haut (variante B choisie pour 5PennyAi)
- **Toujours** utiliser la palette 5PennyAi (même HEX que les infographies)
- **Toujours** un seul focal orange (le petit badge avec chiffre/symbole)
- **Toujours** section "avoid:" explicite
- **Jamais** subtitle en orange (réservé au focal unique et aux petits accents)
- **Jamais** logos de marques réelles
- **Jamais** personnages cartoon, corporate memphis, figures stylisées
- **Jamais** d'autres textes que : pastille éditoriale + titre + sous-titre (3 blocs textuels maximum)
- **Titre dans l'image** : 3-5 mots maximum — si plus long, reformuler
- **Sous-titre dans l'image** : 4-8 mots maximum
- **Température Nano Banana** : 0.4 (validée empiriquement)

## Checklist avant livraison

- [ ] Catégorie éditoriale choisie et fond correspondant (light/dark) validé
- [ ] Titre image ≤ 5 mots
- [ ] Sous-titre image ≤ 8 mots
- [ ] 3-4 objets métaphoriques pertinents au sujet (pas décoratifs aléatoires)
- [ ] Un seul focal orange (badge avec chiffre/symbole)
- [ ] Prompt contient les 9 sections dans l'ordre
- [ ] Palette HEX cohérente avec skill `nano-banana-infographic`
- [ ] Section avoid: présente
- [ ] Alt text FR + EN
- [ ] Prompt EN (principal) + FR (alternative)

## Fichiers de référence

- `references/visual-style.md` — style cible en détail : composition, typographie, objets, palette light et dark, do/don't
- `references/editorial-categories.md` — les 5 catégories éditoriales + règle de choix automatique
- `references/metaphor-library.md` — répertoire d'objets métaphoriques par thème d'article
- `references/prompt-patterns.md` — template 9-sections, **3 exemples complets** (INSIGHTS dark, TUTORIEL light, CAS D'USAGE light), pièges de formulation

**Lis `visual-style.md` en début de session.** Les autres : au moment du choix de catégorie et de métaphores.

## 🌡️ Paramètres de génération recommandés

Identiques à la skill `nano-banana-infographic` (testés empiriquement) :

- **Température** : **0.4**
- **Aspect ratio** : 16:9 (spécifier dans le prompt ET en paramètre de génération)
- **Model** : `gemini-2.5-flash-image-preview`

## Cohérence avec les autres skills

- **Palette identique** à `nano-banana-infographic` (même HEX)
- **Typographie** du même registre (sans-serif géométrique Inter/Outfit)
- **Orange `#DD8737`** comme focal unique (même règle)
- **Pas de footer/URL dans l'image** (même règle)
- **Flat vector crisp** (même esthétique générale)

Le lecteur doit percevoir une **continuité visuelle** entre le header d'article et les infographies internes — c'est la signature du blog 5PennyAi.
