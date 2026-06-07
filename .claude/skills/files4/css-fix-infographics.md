# Correctif CSS — Dimensions des images dans les articles du blog 5PennyAi

## Problème identifié

Les infographies portrait (4:5) s'affichent à **pleine largeur du container de lecture** sur desktop, ce qui les rend disproportionnées par rapport au texte environnant. Le lecteur doit scroller 3-4 écrans pour passer une seule infographie.

## Solution

Système à 3 classes CSS selon le type d'image + comportement responsive qui préserve la lisibilité sur mobile.

---

## 1. CSS à ajouter

Dans ton fichier CSS principal (ou le composant `ArticleContent`), ajouter ces règles :

```css
/* ============================================
   IMAGES DANS LES ARTICLES DU BLOG
   ============================================ */

/* Base : toutes les images d'article */
.article-content img {
  display: block;
  border-radius: 12px;
  margin: 2rem auto;
  height: auto;
}

/* ---- HEADER IMAGE (16:9, en haut de l'article) ---- */
/* Toujours pleine largeur du container d'article */
.article-header-image {
  width: 100%;
  margin-bottom: 2.5rem;
  border-radius: 12px;
}

.article-header-image img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 12px;
}

/* ---- INFOGRAPHIE LANDSCAPE (16:9 ou 3:2) ---- */
/* Largeur généreuse mais contenue sur desktop */
.article-content .infographic-landscape,
.article-content img[data-format="landscape"] {
  width: 100%;
  max-width: 100%;
}

@media (min-width: 768px) {
  .article-content .infographic-landscape,
  .article-content img[data-format="landscape"] {
    max-width: 880px;
  }
}

/* ---- INFOGRAPHIE PORTRAIT (4:5 ou 3:4) ---- */
/* Pleine largeur sur mobile, contenue sur desktop */
.article-content .infographic-portrait,
.article-content img[data-format="portrait"] {
  width: 100%;
  max-width: 100%;
}

@media (min-width: 768px) {
  .article-content .infographic-portrait,
  .article-content img[data-format="portrait"] {
    max-width: 620px;
  }
}

/* ---- INFOGRAPHIE CARRÉE (1:1) ---- */
/* Format intermédiaire, bonne balance */
.article-content .infographic-square,
.article-content img[data-format="square"] {
  width: 100%;
  max-width: 100%;
}

@media (min-width: 768px) {
  .article-content .infographic-square,
  .article-content img[data-format="square"] {
    max-width: 700px;
  }
}

/* ---- FALLBACK : images sans classe spécifique ---- */
/* Comportement par défaut sécurisant : pleine largeur mobile, contenu desktop */
.article-content img:not([class*="infographic-"]):not([data-format]) {
  width: 100%;
  max-width: 100%;
}

@media (min-width: 768px) {
  .article-content img:not([class*="infographic-"]):not([data-format]) {
    max-width: 780px;
  }
}
```

---

## 2. Adaptation du rendu Markdown

Si tu utilises `react-markdown` (ou équivalent) pour rendre le contenu de l'article, il faut que les images générées reçoivent la classe appropriée selon leur format.

### Option A — Via attribut `data-format` dans le markdown

Stocker le format dans la DB (colonne `format` de `article_infographics`) et le passer au rendu :

```jsx
// Dans le composant qui rend un infographic embedded
<img 
  src={infographic.image_url} 
  alt={infographic.alt_text}
  data-format={infographic.format === "16:9" || infographic.format === "3:2" 
    ? "landscape" 
    : infographic.format === "1:1" 
    ? "square" 
    : "portrait"}
/>
```

### Option B — Via classe CSS sur le wrapper Markdown

Si le markdown insère directement `![alt](url)`, utiliser un composant custom dans `react-markdown` :

```jsx
import ReactMarkdown from 'react-markdown';

const markdownComponents = {
  img: ({ src, alt, ...props }) => {
    // Déterminer le format depuis la DB ou depuis le chemin
    const infographic = findInfographicByUrl(src); // lookup depuis article.infographics
    const formatClass = infographic 
      ? getFormatClass(infographic.format)
      : ""; // fallback naturel
    
    return (
      <img 
        src={src} 
        alt={alt}
        className={`infographic-${formatClass}`}
        {...props}
      />
    );
  }
};

function getFormatClass(format) {
  if (format === "16:9" || format === "3:2") return "landscape";
  if (format === "1:1") return "square";
  return "portrait"; // 4:5, 3:4
}

<ReactMarkdown components={markdownComponents}>
  {article.content_fr}
</ReactMarkdown>
```

### Option C — Insérer HTML directement dans le markdown

Modifier l'insertion markdown dans `/api/save-infographic.js` pour utiliser HTML au lieu de syntaxe markdown :

```javascript
// Au lieu de :
const markdownFr = `\n\n![${alt_fr}](${urlFr})\n\n`;

// Utiliser :
const formatClass = getFormatClass(format);
const markdownFr = `\n\n<img src="${urlFr}" alt="${alt_fr}" class="infographic-${formatClass}" />\n\n`;
```

**Recommandation** : Option B (composant React custom) — propre, maintenable, cohérent avec l'écosystème moderne.

---

## 3. Vérification visuelle

Après déploiement, vérifier sur :

- **Desktop large** (1920px) : infographies portrait ≈ 620px, landscape ≈ 880px, bien centrées
- **Desktop standard** (1440px) : même comportement
- **Tablette** (768-1024px) : transition fluide, infographies encore contenues
- **Mobile** (<768px) : toutes les images passent en pleine largeur, lisibilité optimale

Tester spécifiquement que :
- Le header prend bien toute la largeur (pas contenu)
- L'infographie portrait est bien **réduite** sur desktop (ne prend plus 100% du container)
- Le texte environnant respire mieux autour des infographies

---

## 4. Bonus — effet "breakout" optionnel

Si un article a besoin d'une infographie **vraiment impactante** (rare, à utiliser avec parcimonie), ajouter une classe spéciale :

```css
/* Infographie "breakout" qui déborde légèrement du container de lecture */
@media (min-width: 1024px) {
  .article-content .infographic-breakout {
    max-width: 1100px !important;
    margin-left: calc(-1 * (1100px - 100%) / 2);
    margin-right: calc(-1 * (1100px - 100%) / 2);
  }
}
```

À utiliser **maximum 1 fois par article**, pour une infographie vraiment phare.
