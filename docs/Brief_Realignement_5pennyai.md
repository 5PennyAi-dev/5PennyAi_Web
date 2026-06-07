# Brief de réalignement — 5pennyai.com

**Objectif** : Repositionner 5pennyai.com de site d'entreprise « solutions IA pour PME » vers **portfolio personnel d'AI Solutions Engineer** cohérent avec le CV et le LinkedIn de Christian Couillard.

**Contexte** : Christian recherche activement un poste salarié senior en IA ou des mandats consultants. Le site actuel envoie un signal commercial fort (« je vends des services aux PME ») qui contredit cette recherche d'emploi. Le réalignement doit présenter Christian comme un professionnel ouvert à des opportunités d'emploi/mandats, en valorisant ses réalisations comme preuves de compétence plutôt que comme produits à vendre.

**Stratégie** : B2 — repositionnement par redesign léger. Le branding 5PennyAi reste (nom du domaine et du « laboratoire personnel »), mais le narratif devient personnel et les éléments commerciaux disparaissent.

---

## Phase 1 — Meta-tags & SEO (30 min)

### `app/layout.tsx` ou équivalent

**À remplacer** :

```tsx
// AVANT
title: "5PennyAi"
description: "Solutions IA sur mesure pour PME — développement d'apps, intégration de modèles, prompt engineering, audit & stratégie AI."
ogTitle: "5PennyAi — Solutions IA pour PME"
ogSiteName: "5PennyAi"
```

**Par** :

```tsx
// APRÈS
title: "Christian Couillard — AI Solutions Engineer"
description: "AI Solutions Engineer · Builder & Consultant IA appliquée. Je construis et déploie des produits IA de bout en bout — RAG, agents, automatisation. 20+ ans en livraison logicielle, basé à Québec."
ogTitle: "Christian Couillard — AI Solutions Engineer"
ogSiteName: "Christian Couillard"
ogImage: [créer une nouvelle image OG avec ton portrait professionnel + titre]
```

### Image OG à régénérer

L'actuelle est `pennyseo-logo.png`. À remplacer par une image 1200×630 px qui montre ton nom + titre. Tu peux la générer dans Canva ou avec NanoBanana.

---

## Phase 2 — Suppressions (1 h)

### Pages à supprimer ou désindexer

1. **Page FAQ** — toute la page (`app/faq/page.tsx` ou équivalent)
2. **Page « Réserver un appel »** — la page avec calendrier de booking
3. **Référence FAQ dans la navigation et le footer**

### Bouton CTA « Réserver un appel » dans le header

Le bouton orange en haut à droite. À **supprimer complètement**. Il apparaît probablement dans `components/Navbar.tsx` ou équivalent.

### Bouton « ADMIN »

Visible dans certaines captures. À cacher en production (visible seulement si authentifié).

### Tester

Après ces suppressions :
- `/faq` devrait retourner 404
- `/contact` ou `/reserver-un-appel` (selon le routing) — ne devrait plus exister
- La navbar a maintenant 4 items (au lieu de 6+1 CTA)

---

## Phase 3 — Page d'accueil (2-3 h)

C'est le gros morceau. La page actuelle a 9 sections, la nouvelle en aura 5.

### Nouvelle structure proposée

1. **Hero** (réécrit complètement)
2. **Réalisations** (PennySEO + Pipeline éditorial)
3. **Mes outils quotidiens** (stack technique reframée)
4. **Derniers articles** (blog teaser, garder tel quel)
5. **Contact** (simple, pas commercial)

### Section 1 — HERO

**Remplacer le hero actuel par** :

```
[Petit badge en haut]
• PORTFOLIO PERSONNEL

[H1]
Christian Couillard

[Sous-titre — taille H2]
AI Solutions Engineer · Builder & Consultant IA appliquée

[Paragraphe descriptif]
Je construis et déploie des produits IA de bout en bout. 20+ ans
d'expérience en livraison logicielle au service de l'IA générative
appliquée — RAG, agents, automatisation. Basé à Québec.

[CTAs - 2 boutons côte à côte]
[Bouton primaire] Voir mes réalisations  →  ancre vers #realisations
[Bouton secondaire] Me contacter         →  /contact

[Stats - garder le format actuel mais ajuster les valeurs]
20+        Années en livraison logicielle
5          Certifications IA & Data (Microsoft, Coursera)
2+         Années en IA générative appliquée

[Visuel à droite] — garder l'image actuelle du dashboard PennySEO,
elle est cohérente
```

**Note de ton** : tu n'es plus en train de pitcher un service. Tu te présentes comme un professionnel. Plus de « pour vous », « votre business », etc. C'est « moi », « mes réalisations ».

### Section 2 — RÉALISATIONS

**Titre actuel** : « Réalisation »
**Nouveau titre** : « Réalisations »

**Format** : 2 cartes côte à côte au lieu d'une seule.

**Carte 1 — PennySEO** (existe déjà, garder presque tel quel) :

```
[Logo PennySEO]
PennySEO — SaaS d'optimisation SEO par IA

Application qui transforme une simple photo de produit Etsy en
fiche optimisée SEO en moins de 60 secondes. Pipeline IA multi-
modèles, architecture full-stack serverless. Conçu, développé
et déployé en solo.

[Tags] React  Supabase  Gemini AI  Vercel

[Lien] Voir l'étude de cas →  /portfolio/pennyseo
```

**Carte 2 — Pipeline éditorial** (à créer) :

```
[Visuel ou logo "5PennyAi Blog" ou icône pipeline]
Pipeline éditorial automatisé — Génération de contenu IA multimodale

Pipeline complet de génération d'articles SEO-optimisés pour le
blog 5pennyai.com. Trois LLMs orchestrés : recherche web, rédaction
structurée par skill custom, génération d'images et infographies.
Une dizaine d'articles publiés.

[Tags] Perplexity  Claude API  Gemini Image  Skills custom

[Lien] Voir l'étude de cas →  /portfolio/pipeline-editorial
            ou
[Lien] Voir le blog →  /blog
```

### Section 3 — MES OUTILS QUOTIDIENS

**Titre actuel** : « Technologies maîtrisées » (page Services)
**Nouveau titre sur la home** : « Mes outils quotidiens »

**Sous-titre** :
```
Stack avec laquelle je construis et déploie au quotidien.
```

**Format** : grille de pastilles comme actuellement, mais regroupées :

```
IA & LLMs
Claude API · Gemini · OpenAI · Perplexity · MCP · Pinecone

Développement
React 19 · Node.js · TypeScript · Python · Tailwind CSS

Cloud & Architecture
Vercel Serverless · Supabase · Azure AI · n8n
```

### Section 4 — DERNIERS ARTICLES

Garder telle quelle. C'est déjà bien.

**Petit ajustement** : le titre de section pourrait passer de « Derniers articles » à « Réflexions et tutoriels » ou rester tel quel (peu important).

### Section 5 — CONTACT

**Remplacer la section actuelle « Prêt à intégrer l'IA dans votre business? »** + **« Planifiez votre appel découverte »** (qui ensemble font 2 sections commerciales) par UNE section simple :

```
[Titre]
Travaillons ensemble

[Sous-titre]
Ouvert à un poste temps plein en IA appliquée ou à un mandat
consultant — région de Québec, hybride ou remote.

[CTAs ou liens — simples, sans bouton orange agressif]
📩 christian.couillard@gmail.com
💼 LinkedIn → [lien]
🐙 GitHub → github.com/5PennyAi-dev
```

**Pas de bouton « Réserver un appel »**. Pas de calendrier embarqué. Juste les coordonnées.

---

## Phase 4 — Page Services → Page Expertise (1-2 h)

### Renommer la route

`/services` → `/expertise`

Ajouter une redirection 301 dans `next.config.js` pour préserver le SEO si la page est indexée.

### Nouveau titre de page

**Avant** : *« Des solutions IA adaptées à chaque besoin »*
**Après** : *« Mes domaines d'expertise »*

**Sous-titre** :
**Avant** : *« Que vous ayez besoin d'un prototype rapide ou d'une intégration complète, je m'adapte à votre réalité. »*
**Après** : *« Voici les domaines où j'apporte le plus de valeur, illustrés par des projets concrets. »*

### Reformulation des 5 cartes de services

#### Carte 1 — Applications IA fullstack

**Avant** :
```
Applications IA sur mesure
Développement complet d'applications propulsées par l'intelligence
artificielle. Du concept au produit déployé.
[tags] SaaS · Outils internes · Dashboards · Automatisation
Cas typique : PennySEO — plateforme SaaS d'analyse SEO avec scoring
IA, analyse d'images, et rapports automatisés.
```

**Après** :
```
Applications IA fullstack
Je conçois et développe des applications IA de bout en bout,
du concept au produit déployé. Architecture serverless, pipelines
multi-modèles, intégration LLM en production.
[tags] SaaS · Pipelines IA · Architecture serverless · Production
Projet phare : PennySEO — plateforme SaaS d'analyse SEO avec
scoring IA et analyse d'images. Conçu et déployé en solo.
```

#### Carte 2 — Intégration LLM

**Avant** :
```
Intégration IA dans vos systèmes
Connecter des modèles IA (Gemini, Claude, OpenAI) à vos outils et
workflows existants. API, webhooks, bases de données.
[tags] APIs IA · Webhooks · Supabase · CRM / ERP
Cas typique : Une PME veut ajouter de la génération de contenu IA
dans son CMS existant, ou automatiser la classification de tickets
support avec un modèle.
```

**Après** :
```
Intégration LLM & orchestration multi-modèles
J'intègre des modèles IA (Claude, Gemini, OpenAI, Perplexity)
dans des systèmes existants ou en pipelines orchestrés. API,
webhooks, bases vectorielles, MCP, n8n.
[tags] Multi-LLM · MCP · Pinecone · n8n · Webhooks
Projet phare : Pipeline éditorial automatisé — orchestration de
3 LLMs en cascade pour générer articles + illustrations en
production.
```

#### Carte 3 — Prompt engineering

**Avant** :
```
Prompt engineering & optimisation
Calibrer vos prompts, concevoir des pipelines de scoring, et
optimiser la qualité des résultats IA. Le détail qui fait la
différence entre un prototype et un produit fiable.
[tags] Calibration · Scoring · Pipelines · Évaluation
Cas typique : Vous avez un chatbot ou un outil IA mais les résultats
sont inconsistants. J'optimise les prompts et mets en place un
système de scoring pour garantir la qualité.
```

**Après** :
```
Prompt engineering & qualité IA
Je calibre des prompts complexes, conçois des pipelines de scoring
et systèmes d'évaluation pour garantir la qualité IA en production.
Le détail qui fait la différence entre un POC et un produit fiable.
[tags] Calibration · Scoring · Pipelines · Évaluation
Projet phare : PennySEO — calibration sur 100+ exemples, scoring
composite à 4 paliers, pipelines multi-prompts.
```

#### Carte 4 — RAG & Agents

**Avant** : « Prototypage rapide (MVP) »
**Après** : remplacer par cette carte beaucoup plus pertinente :

```
RAG, Agents & automatisation
Je construis des systèmes RAG (retrieval-augmented generation),
des agents autonomes et des automatisations de processus en
production. Skills Claude custom, MCP, orchestration multi-outils.
[tags] RAG · Agents · MCP · Skills custom · Automatisation
Domaine d'exploration : PennyAudit — système d'audit IA orchestré
par 5-6 skills Claude custom (en construction).
```

#### Carte 5 — Conseil & architecture

**Avant** :
```
Audit & stratégie IA
Évaluer où l'IA peut avoir un impact concret dans votre entreprise.
Recommandations d'approche, estimation des coûts API, choix de modèles.
[tags] Diagnostic · Roadmap IA · Estimation coûts
```

**Après** :
```
Conseil & architecture IA
J'apporte une expertise d'architecture pour les organisations qui
veulent passer du POC IA à la production. Choix de modèles, design
de pipelines, estimation des coûts, gouvernance.
[tags] Architecture · Choix de modèles · Coûts API · Gouvernance
Contexte : 20 ans d'expérience en livraison logicielle dans des
environnements complexes (gouvernement, santé, institutionnel).
```

### Section CTA en bas de la page Expertise

**Avant** : « Un projet en tête? Discutons-en lors d'un appel découverte gratuit de 30 minutes. »

**Après** :
```
Curieux ou intéressé?
Je suis ouvert à un poste temps plein en IA appliquée ou à un
mandat consultant. Écrivez-moi à christian.couillard@gmail.com
ou trouvez-moi sur LinkedIn.

[CTA simple, pas de bouton orange agressif]
Me contacter
```

---

## Phase 5 — Ajout Pipeline éditorial au portfolio (2-3 h)

Créer une nouvelle étude de cas à `/portfolio/pipeline-editorial` qui suit le même template que `/portfolio/pennyseo`.

### Structure (calquée sur PennySEO)

#### Hero

```
[Badge] • ÉTUDE DE CAS

[Logo ou visuel — peut-être un schéma de pipeline]

[Sous-titre]
Pipeline éditorial automatisé — Génération de contenu IA multimodale

[Tags]
Perplexity · Claude API · Gemini Image · Skills custom · Vercel

[CTA]
Voir le blog (le résultat en production)  →  /blog
```

#### Section « Le défi »

```
Maintenir un blog technique de qualité demande des heures de
recherche, de rédaction et d'illustration. Comment automatiser
ce flux complet sans sacrifier la qualité éditoriale?
```

#### Section « La solution »

```
Un pipeline orchestrant trois LLMs en cascade : Perplexity
explore le web en temps réel pour valider les sujets et trouver
des sources, Claude rédige des articles structurés via une skill
custom calibrée pour la qualité SEO, et Gemini 2.5 Flash Image
(NanoBanana) génère les illustrations et infographies. Résultat :
production d'articles publiables divisée par 5 à 10.
```

#### Section « Architecture technique »

Format identique à PennySEO (boîtes connectées par flèches) :

```
Sujet → Perplexity Search → Claude (skill blog-generator) →
Gemini Image → Markdown + assets → Publication
```

#### Section « En action »

3 cartes décrivant le workflow :

```
Carte 1 — Recherche & validation SEO
Le sujet est validé via recherche web temps réel. Score SEO
calculé pour prioriser les angles à plus fort potentiel.

Carte 2 — Rédaction structurée
La skill Claude custom génère un article complet avec structure
H1/H2/H3, intro accrocheuse, sources citées, et CTA conformes
aux guidelines SEO.

Carte 3 — Illustration multimodale
NanoBanana génère hero image + infographies cohérentes avec
l'identité visuelle. Iterations automatiques jusqu'au résultat
satisfaisant.
```

#### Section « Résultats & Chiffres clés »

```
3        LLMs orchestrés
10+      Articles publiés
1        Skill Claude custom
~15 min  Temps total par article (vs 3-4 h manuel)
```

#### CTA en bas

Identique au hero, lien vers le blog ou contact.

### Mise à jour de la page Portfolio (index)

Si la page `/portfolio` ou `/realisations` liste plusieurs projets, ajouter une carte pour Pipeline éditorial à côté de PennySEO.

---

## Phase 6 — Polish (1 h)

### Footer

**Avant** :
```
5PennyAi
SOLUTIONS IA POUR ENTREPRISES
Fait avec passion à Québec, QC
```

**Après** :
```
Christian Couillard
AI SOLUTIONS ENGINEER
Basé à Québec, QC

[Footer subtitle]
5pennyai.com — laboratoire personnel d'IA appliquée
```

### Tous les CTAs résiduels

Faire un grep dans le code pour ces formulations à adoucir :

| Chercher | Remplacer par |
|---|---|
| Réserver un appel | Me contacter |
| Appel découverte | (supprimer ou remplacer par contact) |
| Discutons-en | Écrivez-moi |
| Votre projet | (selon contexte, retirer) |
| Votre business | (selon contexte, retirer) |

### Vérifications croisées

- ✅ Aucun bouton orange « Réserver un appel » nulle part
- ✅ Aucune mention de prix, de durée de mandat, de processus de vente
- ✅ Le mot « PME » apparaît seulement dans le contenu du blog (articles), pas dans la nav ou les pages structurelles
- ✅ Le hero parle de Christian (« Je »), pas de l'entreprise (« Nous », « 5PennyAi »)
- ✅ La page `/contact` contient juste les coordonnées, pas de formulaire commercial

---

## Tests finaux

Après tous les changements :

1. **Test Google preview** — utilise `https://www.opengraph.xyz/url/https%3A%2F%2F5pennyai.com` ou similaire pour voir comment le site apparaîtra en partage social. Le titre devrait commencer par ton nom.

2. **Test recruteur** — demande à quelqu'un (ami, famille) qui ne connaît pas ton site de le visiter pendant 30 secondes et te dire ce qu'il en retient. La réponse attendue : « C'est le site personnel d'un ingénieur en IA basé à Québec, qui semble chercher du travail. » Pas : « C'est une boîte qui vend des services. »

3. **Test mobile** — vérifie que toutes les modifications passent bien sur mobile.

4. **Test recherche Google** — au bout de 1-2 semaines, retape « Christian Couillard 5pennyai » dans Google. Le snippet devrait avoir changé.

---

## Ordre d'opérations recommandé

| # | Phase | Durée | Priorité |
|---|---|---|---|
| 1 | Meta-tags & SEO | 30 min | 🔴 Critique |
| 2 | Suppressions (FAQ, booking, CTA) | 1 h | 🔴 Critique |
| 3 | Page d'accueil (hero + sections) | 2-3 h | 🔴 Critique |
| 4 | Services → Expertise | 1-2 h | 🟡 Important |
| 5 | Pipeline éditorial portfolio | 2-3 h | 🟢 Bonus |
| 6 | Polish (footer, CTAs résiduels) | 1 h | 🟡 Important |

**Total : 8-10 heures.** Réaliste sur 2-3 jours en parallèle de tes autres priorités.

Si tu manques de temps, fais **Phases 1-3 en priorité** (4-5 h). C'est ce qui change la perception. Le reste peut suivre.

---

## Note finale

Ce brief est conçu pour être donné directement à Claude Code en lui disant : « Voici un brief de réalignement complet pour mon site. Procède phase par phase, demande-moi confirmation avant chaque suppression de fichier. » Il aura alors tout le contexte nécessaire pour t'assister efficacement.

Bonne chance avec le réalignement!
