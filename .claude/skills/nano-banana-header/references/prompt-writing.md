# Comment bien écrire le prompt Nano Banana

Ce fichier rassemble les **principes de rédaction** et les **pièges à éviter** pour que Nano Banana produise ce que tu as imaginé, pas autre chose.

---

## 🧠 Principe de base

Un prompt Nano Banana doit **décrire ce que tu vois dans ton image imaginée** comme si tu la décrivais à quelqu'un qui va la peindre pour toi. Sois **précis** mais **naturel** — pas un cahier des charges technique.

**Structure libre** : tu peux organiser ton prompt comme tu veux. Ce qui compte c'est qu'il contienne les informations essentielles.

---

## 📋 Éléments à inclure dans le prompt

### 1. Le style général
Une phrase qui pose l'esthétique : *"a flat vector editorial illustration in the style of a modern tech magazine header"*.

### 2. La description de l'image
**Décris la scène ou la composition** telle que tu l'imagines. Sois concret :
- Que voit-on en premier (élément dominant) ?
- Qu'y a-t-il autour ?
- Quelle est la composition générale (centré, asymétrique, divisé, etc.) ?

### 3. Le texte à afficher
**Tous les textes entre guillemets** avec leur emplacement approximatif :
- Titre
- Sous-titre (optionnel)
- Pastille éditoriale

### 4. La palette exacte
Les HEX précis de 5PennyAi, avec pour chaque couleur son rôle dans l'image.

### 5. La section "avoid"
Bloque les dérives connues (voir plus bas).

---

## ⚠️ Les 5 pièges absolus

### Piège 1 — Les specs techniques qui fuitent dans l'image

❌ **Ne JAMAIS écrire** dans le prompt des choses comme :
- `tilted 15 degrees`
- `at 48px bold`
- `280px diameter`
- `at 40% opacity`
- Tout nombre suivi d'une unité (px, deg, %)

Ces indications **se retrouvent littéralement écrites dans l'image**. On les voit apparaître comme des annotations parasites ("15°", "280px", "40%").

✅ **À la place**, utilise des descriptions qualitatives :
- "slightly tilted" au lieu de "tilted 15 degrees"
- "large and bold" au lieu de "at 48px bold"
- "prominently sized" au lieu de "280px diameter"
- "subtle" ou "faint" au lieu de "at 40% opacity"

Pour les HEX de couleurs, **c'est OK** — Nano Banana les interprète comme des instructions de couleur, pas comme du texte à afficher.

### Piège 2 — Le cercle orange avec un chiffre

❌ **BANNI** : ne jamais écrire de consigne qui décrit un petit cercle orange avec un numéro dedans. C'était devenu un tic visuel de la skill.

✅ **À la place**, si tu veux un focal orange, intègre-le autrement :
- Un mot du titre en orange
- Un soulignement orange sous un mot
- Un objet qui a une partie orange (ex : la poignée d'un outil)
- Une petite tache de couleur dans une scène
- Une typographie principale en orange

### Piège 3 — L'accumulation d'objets sans liens

❌ **Évite** de lister des objets indépendants :
*"A magnifying glass, a book, a document, a compass, an envelope — all floating in the image"*

→ Résultat : une bibliothèque d'icônes éparpillée sans sens.

✅ **Préfère** une scène ou une composition cohérente :
*"An artisan workshop scene: a wooden workbench with a few tools laid out thoughtfully — a carpenter's square, a pencil, and a small notebook opened at a fresh page. The tools tell the story of a craftsperson starting a new project."*

→ Résultat : une image qui raconte quelque chose.

**Règle pragmatique** : si tu énumères plus de 3 objets et qu'ils ne racontent pas ensemble une mini-histoire, simplifie.

### Piège 4 — Le texte inventé

Nano Banana peut inventer des mots français mal orthographiés si le prompt ne spécifie pas **exactement** le texte à rendre.

❌ *"Subtitle about AI myths"* → le modèle invente un sous-titre.

✅ *"Subtitle in bold navy: '5 MYTHES À OUBLIER'"* → le modèle rend ce texte précis.

**Toujours les textes entre guillemets**, avec emplacement approximatif.

### Piège 5 — Les descriptions trop vagues

❌ *"Make it beautiful and professional"* → générique, mauvais résultats.

✅ Descriptions concrètes de ce que tu vois dans ta tête : formes, couleurs, positions, atmosphère.

---

## 📏 Longueur du prompt

- **Trop court (<100 mots)** : Nano Banana comble les blancs avec du générique
- **Bon (150-300 mots)** : assez de détails pour guider sans sur-spécifier
- **Trop long (>400 mots)** : le modèle s'y perd, certaines instructions sont ignorées

Vise **200-250 mots** en moyenne.

---

## 🎯 Section "avoid" obligatoire

À inclure **à la fin de chaque prompt** pour bloquer les dérives connues :

```
Avoid: photorealism, 3D rendering, isometric perspective, color gradients,
drop shadows, glow effects, lens flare, hand-drawn or sketch style,
watercolor textures, paper grain, corporate memphis illustration style
with cartoon characters or stylized figures or disembodied hands,
plastic or metallic textures, cartoon robots or AI mascots, real brand
logos, watermarks, emojis, serif or script typography, pure white
backgrounds, pure black backgrounds, warm beige or cream backgrounds
in light version, orange circle badge containing a number (this specific
element is banned from this blog), annotations with pixel measurements
or degree values or percentage opacity written as text, website URLs
or footer signatures or "5pennyai.com" in the image, random floating
objects without narrative connection.
```

Tu peux enrichir cette liste avec des anti-patterns spécifiques au contexte si utile.

---

## 🔁 Structure de prompt conseillée (flexible)

Voici un ordre qui fonctionne bien, à adapter selon l'image imaginée :

```
[1] Style général (1 phrase)

[2] Description de l'image — ce qu'on voit, la scène, la composition
(le cœur du prompt, le plus long)

[3] Typographie : titre, sous-titre, pastille avec textes exacts entre
guillemets et positions approximatives

[4] Palette : fond + couleurs d'accent avec HEX et rôle de chaque couleur

[5] Section "avoid:"
```

Mais tu peux t'en écarter si une autre structure sert mieux ton image. Un prompt pour composition typographique commencera par la typographie. Un prompt de scène commencera par la scène.

---

## 🧪 Test avant d'envoyer

Avant de livrer le prompt, relis-le et vérifie :

1. ✅ Y a-t-il des nombres suivis d'unités (px, deg, %) dans les parties descriptives ? → Si oui, les retirer ou les qualifier autrement.

2. ✅ Y a-t-il mention d'un cercle orange avec un chiffre ? → Si oui, le retirer.

3. ✅ Les objets décrits **dialoguent-ils entre eux** (scène, composition, narrative) ? Ou sont-ils accumulés sans lien ?

4. ✅ Le prompt pourrait-il fonctionner pour **n'importe quel article** ? Ou est-il spécifique à CET article ?

5. ✅ La section "avoid:" est-elle présente et complète ?

Si tu réponds "non" à l'un de ces points, retravaille avant d'envoyer.

---

## 💡 Un dernier conseil

Si tu hésites entre un prompt simple et un prompt élaboré, **choisis le simple**. Un prompt qui décrit clairement une scène ou un objet unique bien pensé donne presque toujours de meilleurs résultats qu'un prompt qui empile des détails.

Nano Banana est un bon modèle. Laisse-lui un peu d'espace pour interpréter intelligemment.
