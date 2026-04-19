---
name: nano-banana-header
description: Génère des prompts Nano Banana pour produire des images d'en-tête éditoriales 16:9 qui représentent visuellement le sujet d'un article du blog 5PennyAi. Chaque image est pensée spécifiquement pour son article — scène, métaphore ou illustration conceptuelle selon ce qui sert le mieux le contenu. Utilise cette skill quand l'utilisateur demande une image d'en-tête, une bannière d'article, un header, une cover image, une illustration principale, une hero image, un visuel de couverture.
---

# Nano Banana Header — Images d'en-tête pour le blog 5PennyAi

Skill qui génère des prompts pour **Nano Banana** (Google Gemini 2.5 Flash Image) afin de produire une **image d'en-tête 16:9** qui représente bien l'article.

---

## 🎯 Principe unique

**Une image d'en-tête doit faire une chose : représenter l'article de manière mémorable.**

Pas de formule obligatoire, pas de check-list complexe. L'important est que l'image :

1. **Parle du sujet précis** de l'article (pas d'une thématique générale)
2. **Soit visuellement belle et éditoriale** (qualité magazine haut de gamme)
3. **Respecte l'identité visuelle** 5PennyAi (palette, typographie)

C'est tout. Pour le reste, fais preuve de jugement éditorial.

---

## 📋 Processus en 3 étapes

### Étape 1 — Comprendre l'article en profondeur

Lire le contenu de l'article et répondre à ces questions :

1. **De quoi parle précisément l'article ?** (en 1 phrase spécifique, pas "IA" mais "comment un entrepreneur en peinture utilise l'IA pour gérer ses devis")
2. **Quel est le message ou l'émotion centrale ?** (démystification, conseil, surprise, etc.)
3. **Quel titre court pourrait apparaître dans l'image ?** (3-5 mots max)
4. **Quel sous-titre court ?** (4-8 mots max, optionnel)
5. **Quelle catégorie éditoriale ?** (INSIGHTS, TUTORIEL, CAS D'USAGE, ACTUALITÉ, STRATÉGIE — voir `editorial-categories.md`)

### Étape 2 — Imaginer l'image qui représente le mieux ce sujet

**Il n'y a pas de formule**. Choisis librement ce qui sert le mieux l'article. Ça peut être :

- **Une scène illustrée** (ex : un atelier d'artisan au travail, un jardin, une cuisine, un paysage symbolique)
- **Un objet unique et fort** (métaphore dominante qui occupe la composition)
- **Une typographie audacieuse** avec une lettre qui devient un élément visuel
- **Deux situations en diptyque** (avant/après, ici/ailleurs)
- **Une composition conceptuelle abstraite** (formes géométriques qui évoquent le sujet)
- **Autre chose** que tu trouves plus approprié

Le seul impératif : **cette image doit être spécifique à CET article**, pas interchangeable avec un autre.

Pour t'aider, `references/inspiration.md` contient des pistes (pas des règles) organisées par grand type d'article.

### Étape 3 — Rédiger le prompt Nano Banana

**Principes de rédaction du prompt** (voir `references/prompt-writing.md` pour détails) :

- Décris **ce que tu vois dans l'image** comme si tu la décrivais à quelqu'un qui ne peut pas la voir
- Sois **précis** sur la palette (HEX exacts de 5PennyAi — voir `visual-style.md`)
- Sois **précis** sur le texte à afficher (entre guillemets)
- **Ne mentionne jamais de tailles en pixels, de tilts en degrés, d'opacités en pourcentages** dans les descriptions qui pourraient fuiter dans l'image rendue
- Inclus **toujours** la section "avoid:" pour bloquer les dérives connues

---

## ✅ Règles dures (seulement 5)

1. **Palette 5PennyAi** : fond glacier `#EEF4FC` (light) OU navy `#0F1E3D` (dark) selon la catégorie éditoriale. Accents : navy `#143054`, orange `#DD8737`, cobalt `#4F7CD4`, violet `#8B5CF6`, teal `#14B8A6`.

2. **Pas de cercle orange avec un chiffre dedans** (banni — c'était devenu un tic visuel). L'orange peut apparaître autrement : typographie, soulignement, tache de couleur intégrée dans la scène, etc.

3. **Pas d'accumulation d'objets flottants sans lien**. Si plusieurs éléments sont présents, ils doivent **dialoguer entre eux** (une scène, pas une bibliothèque d'icônes éparpillées).

4. **Texte dans l'image** : titre (3-5 mots) + sous-titre optionnel (4-8 mots) + pastille éditoriale. Rien d'autre. Pas de labels d'objets, pas de specs techniques, pas d'annotations.

5. **Style général** : flat vector éditorial crisp. Pas de 3D, pas de photoréalisme, pas de corporate memphis (bonhommes stylisés), pas de cartoon, pas de hand-drawn, pas de dégradés visibles.

---

## 📤 Format de livraison

```markdown
## Image d'en-tête proposée

**Catégorie éditoriale** : [INSIGHTS / TUTORIEL / CAS D'USAGE / ACTUALITÉ / STRATÉGIE]
**Fond** : [Light glacier ☀️ / Dark navy 🌙]
**Concept de l'image** : [1-2 phrases qui décrivent ce que l'image représente et POURQUOI ça sert l'article]
**Titre dans l'image** : "[3-5 mots]"
**Sous-titre dans l'image** : "[4-8 mots]" ou "aucun"

### Prompt Nano Banana (EN — recommandé)

```
[Prompt complet, 150-300 mots]
```

### Prompt Nano Banana (FR — alternative)

```
[Version française]
```

### Alt text pour le blog

- **FR** : [description accessible, 2 phrases]
- **EN** : [English alt text]
```

---

## 🌡️ Paramètres Nano Banana

- **Température** : **0.4**
- **Aspect ratio** : 16:9
- **Model** : `gemini-2.5-flash-image-preview`

---

## Fichiers de référence

- `references/visual-style.md` — palette, typographie, light/dark (règles visuelles de base)
- `references/editorial-categories.md` — les 5 catégories éditoriales + règle light/dark automatique
- `references/inspiration.md` — **pistes d'inspiration par type d'article** (pas des règles à suivre à la lettre, des idées à adapter)
- `references/prompt-writing.md` — **comment bien écrire un prompt Nano Banana** (principes + pièges à éviter)

---

## 🎨 Note finale sur l'approche

Cette skill est conçue pour être **souple**. Elle te fait confiance pour comprendre l'article et imaginer l'image appropriée. Les fichiers de référence donnent des **matières premières** (palette, exemples d'approches, pièges techniques) mais ne dictent pas quoi faire.

Si tu sens qu'un article mérite une image très simple (une seule forme, beaucoup de blanc), fais-le. S'il mérite une scène riche, fais-le aussi. L'important est le **jugement éditorial** au service de l'article.

Cohérence avec `nano-banana-infographic` : même palette, même typographie, même qualité éditoriale — pour que le lecteur perçoive un blog unifié.
