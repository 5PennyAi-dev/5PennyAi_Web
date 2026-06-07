# Style Guide — Admin Blog 5PennyAi

Ce document est la référence de style pour tout développement dans la section admin du site 5PennyAi. Lis ce document AVANT de coder quoi que ce soit dans l'admin. En cas de doute, respecte ce qui est déjà en place dans les composants existants.

---

## 1. Stack technique

- React 18+ / Vite / JSX (pas de TypeScript)
- Tailwind CSS v4 (config via `@theme` dans `src/index.css`)
- React Router v6
- react-i18next (toute string visible passe par i18next, jamais en dur)
- Supabase (PostgreSQL + Auth + Storage + RLS)
- Vercel Serverless Functions (routes `/api/*`)
- Lucide React pour les icônes (outline, 24px par défaut, 16px pour les icônes inline)

---

## 2. Typographie

| Rôle | Font | Weight | Taille |
|------|------|--------|--------|
| Headings (h1-h3) | Outfit | Semi-Bold 600 / Bold 700 | h1: 28-30px, h2: 22-24px, h3: 18px |
| Body | DM Sans | Regular 400 | 14-16px, line-height 1.7 |
| Labels, captions | DM Sans | Medium 500 | 12-13px |
| Mono (tags, badges, code) | DM Mono ou monospace system | Regular 400 | 11-12px |
| Boutons | DM Sans | Semi-Bold 600 | 14px |

### Règles
- Ne jamais changer ces fonts sans demander
- Les labels de formulaire sont en `text-sm font-medium text-navy`
- Les placeholders sont en `text-sm text-gray-400`
- Les titres de section admin sont en `text-xl font-semibold text-navy` (Outfit)

---

## 3. Palette de couleurs

### Couleurs principales

| Token Tailwind | Hex | Usage |
|----------------|---------|-------|
| `steel` | `#81AED7` | Bleu principal, liens, éléments informatifs |
| `accent` | `#DD8737` | Orange, CTAs, boutons primaires, accents actifs |
| `navy` | `#143054` | Texte principal, titres, hero, footer |
| `lavender` | `#DBCFEE` | Fonds clairs, accents doux, badges secondaires |
| `surface` | `#F7F5F2` | Fonds de section alternés, panels |
| `white` | `#FFFFFF` | Fonds de cartes, formulaires |

### Couleurs de statut (admin)

| Usage | Fond | Texte | Bordure |
|-------|------|-------|---------|
| Succès / Publié / Rédigé | `#d1fae5` (green-100) | `#065f46` (green-800) | `#6ee7b7` (green-300) |
| Avertissement / En cours | `#fef3c7` (amber-100) | `#92400e` (amber-800) | `#fcd34d` (amber-300) |
| Erreur / Alerte | `#fee2e2` (red-100) | `#991b1b` (red-800) | `#fca5a5` (red-300) |
| Info / En banque | `#dbeafe` (blue-100) | `#1e40af` (blue-800) | `#93c5fd` (blue-300) |
| Neutre / Brouillon | `#f3f4f6` (gray-100) | `#374151` (gray-700) | `#d1d5db` (gray-300) |
| Accent / À rédiger | `#fff7ed` (orange-50) | `#9a3412` (orange-800) | `#fdba74` (orange-300) |

### Règles
- Ne pas utiliser de couleurs hors palette sans demander
- Pas de gradients, pas de glassmorphism, pas de shadows lourdes
- Les fonds de panel utilisent `surface` (#F7F5F2) ou `white`

---

## 4. Composants UI

### Boutons

**Bouton primaire (CTA)**
```
bg-accent text-white rounded-full px-6 py-2.5 font-semibold text-sm
hover:bg-accent/90 transition-colors duration-200
disabled:opacity-50 disabled:cursor-not-allowed
```

**Bouton secondaire (outline)**
```
border border-gray-300 text-navy rounded-full px-5 py-2 text-sm font-medium
hover:border-accent hover:text-accent transition-colors duration-200
```

**Bouton petit (actions inline)**
```
border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium
hover:bg-gray-50 transition-colors duration-150
```

**Bouton danger**
```
border border-red-200 text-red-600 rounded-lg px-3 py-1.5 text-xs
hover:bg-red-50 transition-colors duration-150
```

### Inputs et formulaires

**Input text / textarea**
```
w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy
placeholder:text-gray-400
focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
transition-all duration-200
```

**Select**
```
rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy bg-white
focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
```

**Label**
```
block text-sm font-medium text-navy mb-1.5
```

**Groupe de champs** (label + input)
```
<div class="space-y-1.5">
  <label>...</label>
  <input>...</input>
</div>
```

**Espacement entre groupes de champs** : `space-y-5` ou `gap-5`

### Cartes

**Carte standard (admin)**
```
bg-white rounded-xl border border-gray-200 p-5
hover:border-gray-300 hover:shadow-sm transition-all duration-200
```

**Carte sélectionnée / active**
```
bg-white rounded-xl border-2 border-accent/30 p-5 shadow-sm
```

**Carte avec fond surface**
```
bg-surface rounded-xl p-5
```

### Badges

**Badge de statut**
```
inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
```
Appliquer les couleurs de statut du tableau ci-dessus.

**Badge de tag**
```
inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono
bg-gray-100 text-gray-600
```

**Badge SEO (volume, difficulté, CPC)**
```
inline-flex items-center gap-1 text-xs font-mono text-gray-500
```
Les valeurs (chiffres) sont en `font-medium text-navy`.

### Onglets (tabs)

**Tab bar**
```
flex border-b border-gray-200 gap-0
```

**Tab item**
```
px-5 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent
hover:text-navy hover:border-gray-300 transition-colors duration-200
cursor-pointer
```

**Tab active**
```
px-5 py-3 text-sm font-medium text-navy border-b-2 border-accent
```

### Indicateur d'étapes (stepper)

```
flex items-center gap-3
```

**Étape complétée** : cercle `bg-green-100 text-green-700`
**Étape courante** : cercle `bg-accent text-white`
**Étape future** : cercle `bg-gray-100 text-gray-400`
**Ligne entre étapes** : `w-8 h-px bg-gray-200`

### Loading / Spinner

**Spinner simple**
```
w-5 h-5 border-2 border-accent/20 border-t-accent rounded-full animate-spin
```

**Skeleton (loading placeholder)**
```
bg-gray-200 rounded-lg animate-pulse
```

### Messages d'état

**Erreur**
```
bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700
```

**Succès**
```
bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700
```

**Info**
```
bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700
```

---

## 5. Layout admin

### Structure de page admin
```
<div class="max-w-5xl mx-auto px-6 py-8">
  <!-- Breadcrumb -->
  <div class="text-sm text-gray-400 mb-2">Admin / Blog / Sujets</div>
  
  <!-- Titre de page -->
  <h1 class="text-2xl font-bold text-navy mb-6">Titre de la page</h1>
  
  <!-- Tab bar (si applicable) -->
  <div class="tabs">...</div>
  
  <!-- Contenu -->
  <div class="space-y-6">...</div>
</div>
```

### Grille de contenu
- Admin : `max-w-5xl` (1024px), centré
- Formulaire : colonnes avec `grid grid-cols-1 md:grid-cols-2 gap-5`
- Liste de cartes : `space-y-3` (vertical)

### Panels / Sections
Quand une section logique regroupe des éléments :
```
bg-surface rounded-xl p-6 space-y-4
```
Ou avec bordure :
```
bg-white border border-gray-200 rounded-xl p-6 space-y-4
```

### Section labels (titres de sous-section)
```
text-xs font-medium text-gray-400 uppercase tracking-wider mb-3
```

---

## 6. Patterns spécifiques au Topic Finder

### Carte de sujet (résultat de recherche)
```
bg-white rounded-xl border border-gray-200 p-5 cursor-pointer
hover:border-gray-300 hover:shadow-sm transition-all duration-200
```

Quand un sujet est ouvert (expanded) :
```
bg-white rounded-xl border-2 border-accent/20 p-5 shadow-sm
```

### Données SEO dans une carte de sujet
Afficher sur une ligne horizontale sous le titre :
```
<div class="flex items-center gap-4 mt-2 text-xs text-gray-500 font-mono">
  <span>Vol: <strong class="text-navy">2 400</strong>/mois</span>
  <span>Diff: <strong class="text-green-600">facile</strong></span>
  <span>CPC: <strong class="text-navy">2.80$</strong></span>
  <span>Intent: <strong class="text-steel">info</strong></span>
</div>
```

Couleurs de difficulté SEO :
- Facile : `text-green-600`
- Moyen : `text-amber-600`
- Élevée : `text-red-600`

### Filtres de la banque de sujets
Utiliser le même style que les filtres de tags du blog public, avec le compteur :
```
px-3 py-1.5 rounded-full text-xs font-medium border
```
- Inactif : `border-gray-200 text-gray-500 bg-white`
- Actif : `border-accent bg-accent/10 text-accent`

### Bouton "Rédiger cet article →"
C'est le CTA principal sur chaque carte de sujet :
```
bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold
hover:bg-accent/90 transition-colors duration-200
```

---

## 7. Responsive

- Desktop : layouts 2 colonnes, `max-w-5xl`
- Tablette : 1 colonne, `max-w-3xl`
- Mobile : 1 colonne, padding `px-4`
- L'admin n'a pas besoin d'être aussi raffiné que le site public — fonctionnel d'abord
- Les cartes de sujets passent en pleine largeur sur mobile
- Les données SEO wrappent sur 2 lignes sur mobile si nécessaire

---

## 8. Animations

- **CSS transitions seulement** — pas de Framer Motion
- `transition-all duration-200` pour les hover sur les cartes et boutons
- `animate-spin` pour les spinners
- `animate-pulse` pour les skeletons
- Intersection Observer pour les entrées en viewport (blog public)
- L'admin ne nécessite PAS d'animations d'entrée — simplicité

---

## 9. i18n

Toute string visible dans l'admin passe par react-i18next :
- Fichiers : `src/locales/{fr,en}/translation.json`
- Préfixe pour l'admin : `admin.*`
- Préfixe pour les sujets : `admin.topics.*`
- Ne jamais hardcoder du texte en français dans le JSX

---

## 10. Ce qu'il ne faut PAS faire

- Pas de couleurs hors palette
- Pas de fonts autres que Outfit (headings) et DM Sans (body)
- Pas de gradients, glassmorphism, shadows lourdes
- Pas de gros numéros décoratifs, formes flottantes
- Pas de librairies d'animation (Framer Motion, GSAP, etc.)
- Pas de dark mode dans l'admin (seulement le blog public en hérite du système)
- Pas de TypeScript
- Pas de CSS modules ni styled-components (Tailwind uniquement)
- Pas de state management global (Redux, Zustand, etc.)
- Pas de composants complexes d'une librairie UI externe (tout est fait maison avec Tailwind)
