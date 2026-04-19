# Style visuel — Règles de base

Ce fichier définit les règles **non négociables** pour tous les headers : palette, typographie, fonds. Tout le reste (composition, métaphores, scènes) est libre.

---

## 🎨 Palette 5PennyAi

### Couleurs d'ancrage (toujours présentes)

| Couleur | HEX | Utilisation |
|---------|-----|-------------|
| **Navy** | `#143054` | Texte principal, contours, éléments dominants |
| **Orange** | `#DD8737` | Accent — utilisé avec intention (jamais en cercle-avec-chiffre) |
| **Fond** | Light ou Dark selon catégorie | Voir ci-dessous |

### Fonds (déterminés par la catégorie éditoriale)

**Light — pour TUTORIEL, CAS D'USAGE, ACTUALITÉ** :
- Fond : glacier blue `#EEF4FC` (bleu très pâle teinté cobalt — **jamais** blanc pur, **jamais** crème/beige)
- Texte principal : navy `#143054`

**Dark — pour INSIGHTS, STRATÉGIE** :
- Fond : deep navy `#0F1E3D` (navy profond — **jamais** noir pur)
- Texte principal : cream `#F7F5F2` (jamais blanc pur — toujours un off-white chaud)

### Accents vifs (à utiliser selon besoin)

| Couleur | HEX | Pour |
|---------|-----|------|
| Cobalt blue | `#4F7CD4` | Éléments principaux, objets, zones structurelles |
| Royal violet | `#8B5CF6` | Éléments de contraste, objets secondaires |
| Fresh teal | `#14B8A6` | Accents de fraîcheur, points décoratifs |
| Golden amber | `#F59E0B` | Rare — pour un accent chaleureux ponctuel |

**Règle** : maximum 5-6 couleurs distinctes dans une image. Si tu as plus, simplifie.

---

## ✍️ Typographie

### Règles absolues

- **Sans-serif géométrique** (style Inter, Outfit, DM Sans)
- **Jamais** serif, **jamais** script, **jamais** handwritten
- Rendu anti-aliasé net et propre

### Hiérarchie (3 niveaux max)

1. **Titre principal** : grand, gras, couleur principale (navy en light / cream en dark)
   - **3 à 5 mots maximum**
   - Peut occuper une partie importante de l'image

2. **Sous-titre** (optionnel) : taille moyenne, medium weight
   - **4 à 8 mots maximum**
   - Généralement en all caps avec un léger letter-spacing
   - **Jamais en orange** (l'orange est réservé au focal unique)

3. **Pastille éditoriale** : petit texte en small caps
   - Format : `5PENNYAI · [CATÉGORIE]`
   - Cobalt sur fond blanc (light) ou transparent avec bordure cobalt (dark)

### Orange dans la typographie

L'orange peut apparaître sur **un seul mot** du titre ou du sous-titre si ça sert le sujet. Exemple : "5 **MYTHES** à oublier" avec "MYTHES" en orange. Mais **une seule emphase orange** par image.

---

## 🖼️ Règles visuelles générales

### Esthétique cible
- **Flat vector éditorial crisp** (magazine tech moderne haut de gamme)
- Formes nettes, aplats de couleur unis
- Qualité impression papier glacé

### Interdits absolus
- ❌ Photoréalisme, rendu 3D, perspective isométrique
- ❌ Dégradés de couleur (radiaux ou linéaires)
- ❌ Drop shadows, glow effects, lens flare
- ❌ Textures (papier, aquarelle, grain, hand-drawn)
- ❌ Corporate memphis (bonhommes stylisés, mains désincarnées, figures génériques)
- ❌ Cartoon, mascottes IA, robots mignons
- ❌ Logos de marques réelles, watermarks
- ❌ Emojis rendus comme icônes
- ❌ **Cercle orange avec un chiffre dedans** (tic visuel banni)
- ❌ Annotations techniques visibles (px, degrés, opacités, spec colors)
- ❌ URL, nom de site, signature dans l'image

### Composition
- **Respirer** : espace négatif généreux, pas de surcharge
- **Hiérarchie claire** : l'œil doit savoir où regarder en 1 seconde
- **Cohérence narrative** : si plusieurs éléments, ils doivent dialoguer (pas s'additionner)

---

## 📐 Format

- **Aspect ratio** : 16:9 landscape
- **Dimensions** : approximativement 1920×1080
- Spécifier l'aspect ratio dans le prompt ET dans les paramètres Nano Banana

---

## 🧪 Test de validation d'une image

Après génération, se demander :

1. Est-ce que je reconnais l'identité 5PennyAi (palette, style) ?
2. Est-ce que l'image évoque bien le sujet précis de l'article ?
3. Est-ce qu'il y a du texte parasite (px, degrés, labels aléatoires) ?
4. Est-ce que je vois un cercle orange avec un chiffre ? (si oui → mauvais)
5. Est-ce que la composition respire et a une hiérarchie claire ?

Si une réponse est décevante, régénérer avec un prompt ajusté.
