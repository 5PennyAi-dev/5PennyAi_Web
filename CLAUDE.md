# CLAUDE.md — 5PennyAi Website

## Contexte
Site vitrine bilingue (FR/EN) pour **5PennyAi** (5pennyai.com). Entreprise solo de services AI : développement d'apps AI sur mesure, intégration de modèles, prompt engineering, prototypage rapide, audit & stratégie AI. Objectif : convaincre des PME de réserver un appel découverte. Pas de produit SaaS, pas d'abonnement — services uniquement.

## Stack
- React 18+ / Vite
- Tailwind CSS v4 (config via `@theme` dans `src/index.css`, pas de `tailwind.config.js`)
- React Router v6
- react-i18next (JSON dans `src/locales/{fr,en}/translation.json`, import statique)
- react-helmet-async (SEO)
- Lucide React (icônes outline, 24px par défaut)
- Déploiement : Vercel sur 5pennyai.com

## Conventions de code
- Composants `.jsx` en PascalCase, un par fichier
- Hooks custom dans `src/hooks/`
- Pas de TypeScript
- Tailwind uniquement — pas de CSS modules ni styled-components
- Pas de state management global
- Imports avec alias `@/` mappé vers `src/`
- Toute string visible passe par i18next, jamais en dur dans le JSX
- Langue par défaut : français
- Animations : CSS transitions + Intersection Observer seulement, pas de Framer Motion

## Design

### Skill frontend-design
Avant toute tâche visuelle (création ou modification de page, composant, style), lire la skill frontend-design. Appliquer ses principes de qualité (micro-interactions, espacements, contrastes, accessibilité) tout en respectant les contraintes ci-dessous.

### Typographie
- **Headings** : Outfit (Semi-Bold 600 / Bold 700) — via Google Fonts
- **Body** : DM Sans (Regular 400 / Medium 500) — via Google Fonts, line-height 1.7
- Ne pas changer ces fonts sans demander.

### Palette de couleurs
| Token       | Hex       | Usage                          |
|-------------|-----------|--------------------------------|
| `steel`     | `#81AED7` | Bleu principal ("5Penny")      |
| `accent`    | `#DD8737` | Orange ("Ai"), CTAs, accents   |
| `navy`      | `#143054` | Texte, hero, footer            |
| `lavender`  | `#DBCFEE` | Fonds clairs, accents subtils  |
| `surface`   | `#F7F5F2` | Fonds de section alternés      |
| `white`     | `#FFFFFF` | Fonds, texte sur dark          |
- Ne pas utiliser de couleurs hors palette sans demander.

### Boutons
- Primary : fond `accent`, texte blanc, `rounded-full`. Pas de gradient.
- Outline : bordure fine, texte navy, `rounded-full`

### Style — clean tech
Le site est sobre, professionnel et crédible. Style inspiré de Linear, Vercel, Stripe.

Règles :
- Layouts symétriques, cartes avec structure identique
- Grilles régulières (2 colonnes desktop, 1 colonne mobile)
- Beaucoup d'espace blanc (`py-16` à `py-24`)
- `rounded-xl` sur les cartes, padding `p-6` minimum
- Hover subtils : shadow-md + border-color, transition 200ms
- Mobile-first, responsive, hamburger menu sur mobile

Interdit :
- Style magazine, editorial, brutalist, ou artistic
- Gros numéros décoratifs, formes flottantes, lignes ornementales
- Gradients, glassmorphism, shadows lourdes
- Éléments purement décoratifs sans fonction
- Alternance gauche/droite, layouts asymétriques

### Cohérence
Chaque nouvelle page doit avoir le même look que les pages existantes (Home, Services, About). Même typo, mêmes espacements, mêmes couleurs, mêmes cartes.

## Structure du projet
```
5PennyAi_Web/
├── docs/                          # Brand assets — NE PAS MODIFIER
├── public/images/
├── src/
│   ├── components/
│   │   ├── layout/                # Navbar, Footer
│   │   ├── sections/              # Hero, Comparison, Services, Benefits, Process, CaseStudy, FAQ, CTABlock, Booking
│   │   └── ui/                    # Button, SectionHeader, Card, Accordion
│   ├── hooks/                     # useScrollReveal
│   ├── locales/{fr,en}/           # translation.json
│   ├── pages/                     # Home, ServicesPage, About
│   ├── i18n.js
│   ├── App.jsx, main.jsx, index.css
├── CLAUDE.md
├── vite.config.js, package.json
```

## Commandes
```bash
npm run dev        # localhost:5173
npm run build      # Build production
npm run preview    # Preview du build
```

## Interdictions globales
- Pas de dépendances inutiles
- Pas de Framer Motion
- Pas de texte hardcodé — tout via i18next
- Pas de fichiers .ts/.tsx
- Pas de couleurs hors palette
- Pas de pricing ou métriques chiffrées
- Ne pas modifier `docs/`
