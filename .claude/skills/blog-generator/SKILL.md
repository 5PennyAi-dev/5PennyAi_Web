---
name: blog-generator
description: Génère des articles de blog bilingues (FR/EN) optimisés SEO pour le site 5PennyAi. Utilise cette skill quand l'utilisateur demande de créer un article de blog, rédiger un post, générer du contenu pour le blog, écrire sur un sujet pour le blog, ou préparer un article. Se déclenche aussi pour "nouveau post", "article sur [sujet]", "blog post about", "rédige un article", "écris un blog", ou toute mention de contenu éditorial destiné au blog 5PennyAi.
---

# Blog Generator — 5PennyAi

Skill de génération d'articles de blog bilingues pour 5PennyAi. Produit des articles prêts à publier dans l'admin blog Supabase ou via l'API n8n.

## Contexte

5PennyAi est une entreprise solo de services AI (développement d'apps, intégration, prompt engineering, prototypage, audit). Le blog cible des PME et des professionnels intéressés par l'IA appliquée. Le ton est accessible, concret et orienté action — pas académique.

## Audience cible

- Dirigeants et gestionnaires de PME québécoises/canadiennes
- Professionnels curieux de l'IA mais pas techniques
- Entrepreneurs qui cherchent à automatiser ou innover

## Processus de génération

### Étape 1 — Comprendre le sujet

Si l'utilisateur donne juste un sujet vague ("écris un article sur l'IA"), poser 2-3 questions :
- Quel angle spécifique? (ex: "IA pour le service client" vs "IA en général")
- Quel type d'article? (tutoriel, liste, étude de cas, opinion, actualité)
- Y a-t-il un lien avec les services 5PennyAi à mettre en valeur?

Si le sujet est déjà clair, passer directement à l'étape 2.

### Étape 1b — Données SEO (si fournies)

Si l'utilisateur fournit des données SEO (mots-clés avec volumes de recherche validés par DataForSEO), les utiliser pour optimiser l'article :

- Le **mot-clé principal** (celui avec le plus haut volume) doit apparaître dans :
  - Le titre FR et EN
  - L'extrait FR et EN
  - Le premier paragraphe
  - Au moins 2 sous-titres H2
  - Les meta title et meta description
  - 3-5 fois naturellement dans le corps

- Les **mots-clés secondaires** doivent apparaître naturellement dans le corps, idéalement dans des H2/H3

- L'**intention de recherche** guide le ton :
  - Informationnel → éduquer, expliquer, donner des exemples
  - Transactionnel → guider vers l'action, montrer le ROI
  - Commercial → comparer, recommander, lister les options

- IMPORTANT : ne jamais sacrifier la lisibilité pour le SEO. Un article naturel et bien écrit pour un humain est toujours meilleur qu'un article bourré de mots-clés.

### Étape 2 — Recherche

Utiliser le web search pour :
- Trouver des données récentes et des statistiques sur le sujet
- Identifier les tendances actuelles
- Trouver des exemples concrets d'entreprises qui utilisent la technologie
- Vérifier les faits et les chiffres

### Étape 3 — Rédaction

Générer l'article complet avec TOUS les champs nécessaires pour le formulaire admin du blog.

### Étape 4 — Livraison

Produire un fichier Markdown structuré avec tous les champs séparés, prêt à copier-coller dans le formulaire admin ou à envoyer via l'API Supabase.

## Format de sortie

Chaque article généré doit contenir EXACTEMENT ces sections, dans cet ordre :

```
# [TITRE DE L'ARTICLE]

## MÉTADONNÉES
- **Slug** : [slug-en-kebab-case-sans-accents]
- **Tags** : [tag1, tag2, tag3, tag4, tag5]
- **Temps de lecture** : [X] minutes
- **Date de publication** : [YYYY-MM-DD]

## TITRE (FR)
[Titre en français — accrocheur, max 70 caractères pour le SEO]

## TITRE (EN)
[Titre en anglais — traduction adaptée, pas littérale]

## EXTRAIT (FR)
[2-3 phrases qui résument l'article et donnent envie de lire. Max 160 caractères pour le SEO.]

## EXTRAIT (EN)
[Traduction adaptée de l'extrait]

## IMAGE DE COUVERTURE
[Prompt détaillé pour générer une image AI avec DALL-E, Midjourney ou autre. Décrire le style, les couleurs (bleu #81AED7 et orange #DD8737 de la marque), le sujet, l'ambiance. Format 16:9, style moderne et professionnel.]

## CONTENU MARKDOWN (FR)
[Article complet en français — voir règles de rédaction ci-dessous]

## CONTENU MARKDOWN (EN)
[Article complet en anglais — traduction adaptée, pas mot à mot]

## META TITLE (FR)
[Titre SEO — max 60 caractères | 5PennyAi]

## META DESCRIPTION (FR)
[Description SEO — max 155 caractères, avec mots-clés principaux]

## META TITLE (EN)
[SEO title — max 60 chars | 5PennyAi]

## META DESCRIPTION (EN)
[SEO description — max 155 chars, with main keywords]
```

## Règles de rédaction

### Structure de l'article
- **Longueur** : 800-1500 mots (FR), adaptation équivalente en EN
- **Introduction** : poser le problème ou la question en 2-3 phrases. Accrocher le lecteur.
- **Corps** : 3-7 sections avec des sous-titres H2 clairs
- **Conclusion** : résumer les points clés + CTA vers 5PennyAi
- **CTA final** : toujours terminer par un appel à l'action vers `/contact` avec un lien Markdown

### Ton et style
- **Accessible** : pas de jargon technique non expliqué. Si un terme technique est utilisé, l'expliquer en une phrase.
- **Concret** : chaque point doit être illustré par un exemple réel ou un scénario concret
- **Actionnable** : le lecteur doit pouvoir faire quelque chose avec l'information
- **Direct** : phrases courtes, paragraphes courts (3-4 phrases max)
- **Tutoiement** : utiliser le "vous" (vouvoiement professionnel)
- **Pas de clichés IA** : éviter "révolutionner", "game-changer", "à l'ère de l'IA". Préférer un langage sobre et factuel.

### Formatage Markdown
- Titres : H2 (`##`) pour les sections principales, H3 (`###`) pour les sous-sections
- **Gras** pour les points clés et les chiffres importants
- Listes à puces pour les énumérations (max 5-7 items)
- Blocs de citation (`>`) pour les statistiques ou citations
- Séparateur (`---`) avant le CTA final
- Liens internes vers les pages du site quand pertinent (`[services](/services)`, `[contact](/contact)`)
- Pas de blocs de code sauf si l'article est un tutoriel technique

### SEO
- Si des mots-clés SEO validés sont fournis (avec volumes DataForSEO), les utiliser en priorité
- Si aucun mot-clé n'est fourni, identifier le mot-clé principal du sujet et l'utiliser
- Le mot-clé principal doit apparaître dans : le titre, l'extrait, le premier paragraphe, au moins 2 sous-titres, et la meta description
- Utiliser des variantes du mot-clé (synonymes, termes connexes, mots-clés secondaires fournis)
- Les sous-titres H2 doivent être des questions ou des phrases que les gens recherchent
- Longueur meta title : max 60 caractères
- Longueur meta description : max 155 caractères

### Mention de 5PennyAi
- L'article ne doit PAS être une publicité déguisée
- Mentionner 5PennyAi ou PennySEO naturellement si c'est pertinent au sujet (max 1-2 fois)
- Le CTA final est le seul endroit ouvertement promotionnel
- Format du CTA final :

```markdown
---

*Vous voulez explorer comment l'IA pourrait s'appliquer à votre entreprise? [Réservez un appel découverte gratuit](/contact) avec 5PennyAi — 30 minutes, sans engagement.*
```

### Sources et références
- TOUJOURS utiliser le web search pour trouver des données récentes avant de rédiger
- Inclure 3-5 sources fiables avec liens URL en fin d'article, dans une section `## Sources`
- Privilégier les sources francophones pour la version FR quand disponibles, anglophones pour la version EN
- Formats acceptés : articles de presse, études, blogs tech reconnus, rapports d'industrie, publications académiques
- **Ne JAMAIS inventer de sources, de statistiques ou d'URLs** — n'utiliser que les résultats effectivement retournés par web_search
- Section `## Sources` placée juste avant le CTA final, en H2, sous forme de liste à puces Markdown
- Format : `- [Titre de la source](https://url-complète.com)`

### Image de couverture
- Toujours fournir un prompt détaillé pour générer l'image via un outil externe (DALL-E, Midjourney, Flux…)
- Le prompt doit être **spécifique au sujet de l'article**, pas générique (pas de "AI concept" ou "technology abstract")
- Décrire une scène ou composition visuelle concrète qui illustre le thème
- Inclure la palette de couleurs de la marque : bleu acier `#81AED7`, orange chaud `#DD8737`
- Style : moderne, professionnel, épuré, éditorial (inspiration Linear/Vercel/Stripe)
- Éclairage : doux, naturel, diffus
- Composition : épurée, generous negative space, rule of thirds
- Format : 16:9 paysage, haute résolution
- **Pas de texte, pas de logo, pas de watermark** dans l'image
- Éviter les visages génériques de stock photo — préférer scènes, objets, ou illustrations conceptuelles

## Types d'articles supportés

### 1. Liste ("X façons de...")
- Format : introduction + X sections numérotées + conclusion
- Chaque point : problème → solution → résultat typique
- Idéal pour : partage social, SEO longue traîne

### 2. Tutoriel
- Format : introduction + étapes numérotées + conclusion
- Chaque étape : explication + comment faire + capture ou exemple
- Idéal pour : démontrer l'expertise, SEO

### 3. Étude de cas
- Format : contexte → problème → solution → résultats → leçons
- Utiliser des données concrètes (chiffres, durées, coûts)
- Idéal pour : crédibilité, conversion

### 4. Actualité commentée
- Format : résumé de l'actualité → analyse → impact pour les PME → que faire
- Toujours lier à l'impact concret pour le lecteur
- Idéal pour : trafic court terme, pertinence

### 5. Démystification
- Format : mythe/idée reçue → réalité → preuves → conclusion
- Ton : rassurant, factuel, pas condescendant
- Idéal pour : rassurer les PME hésitantes

## API Supabase — Format JSON (pour n8n)

Si l'utilisateur demande le format API pour publication automatique, fournir aussi le JSON :

```json
{
  "slug": "mon-article",
  "status": "published",
  "title_fr": "Titre FR",
  "title_en": "Title EN",
  "excerpt_fr": "Extrait FR",
  "excerpt_en": "Excerpt EN",
  "content_fr": "Contenu Markdown FR",
  "content_en": "Markdown content EN",
  "cover_image": "",
  "tags": ["tag1", "tag2"],
  "reading_time_minutes": 6,
  "author": "Christian Couillard",
  "meta_title_fr": "Meta Title FR | 5PennyAi",
  "meta_description_fr": "Meta description FR",
  "meta_title_en": "Meta Title EN | 5PennyAi",
  "meta_description_en": "Meta description EN",
  "published_at": "2026-04-10T12:00:00Z"
}
```

## Checklist avant livraison

Avant de livrer un article, vérifier :
- [ ] Titre FR et EN présents et accrocheurs (max 70 caractères)
- [ ] Slug en kebab-case, sans accents, sans caractères spéciaux
- [ ] Extrait FR et EN (max 160 caractères chacun)
- [ ] Contenu FR : 800-1500 mots, bien structuré
- [ ] Contenu EN : traduction adaptée, même structure
- [ ] 4-6 tags pertinents
- [ ] Temps de lecture calculé (mots ÷ 200 = minutes, arrondi)
- [ ] Meta title FR et EN (max 60 caractères, inclut "| 5PennyAi")
- [ ] Meta description FR et EN (max 155 caractères)
- [ ] CTA final présent avec lien vers /contact
- [ ] Pas de clichés IA
- [ ] Pas de publicité déguisée (max 1-2 mentions naturelles de 5PennyAi)
- [ ] Prompt d'image de couverture fourni
- [ ] Tous les faits et chiffres sont vérifiés via web search
