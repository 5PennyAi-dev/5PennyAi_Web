# Guide de développement — Refonte de la page d’accueil 5PennyAi v1

**Projet :** 5PennyAi
**Évolution :** repositionnement du site vers une plateforme éducative sur l’IA
**Périmètre principal :** page d’accueil publique, navigation publique et intégration des contenus existants
**Date :** 15 août 2026
**Statut :** conception UX/UI V1 approuvée provisoirement — prête pour inspection technique puis développement par incréments

---

# 1. Rôle du document

Ce guide encadre la refonte de la page d’accueil publique de **5PennyAi** afin de faire évoluer le site d’un positionnement principalement **portfolio-first** vers un positionnement **éducatif-first**.

Le site doit désormais présenter en priorité :

- les ressources éducatives sur l’intelligence artificielle;
- les séries pédagogiques;
- la bibliothèque de prompts;
- la recherche et les sujets;
- plus tard, les **Parcours** d’apprentissage.

Les pages de profil, projets et contact demeurent importantes, mais deviennent secondaires dans la hiérarchie de la page d’accueil.

Le document sert de source de vérité pour :

- l’intention UX de la nouvelle page;
- son architecture de contenu;
- sa direction visuelle;
- son comportement responsive;
- les invariants fonctionnels;
- le découpage du développement;
- les validations attendues de Codex.

Il ne constitue pas une spécification pixel-perfect. L’inspection du dépôt demeure la source de vérité technique pour les composants, routes, styles, helpers et données réellement disponibles.

---

# 2. Contexte actuel

5PennyAi a été conçu initialement comme un site personnel mettant de l’avant :

```text
Profil professionnel
→ réalisations / projets
→ compétences
→ quelques ressources
```

La section **Ressources IA** est depuis devenue une bibliothèque éducative structurée comprenant notamment :

- des articles;
- des infographies;
- des prompts réutilisables;
- des séries persistantes;
- une recherche;
- des filtres par format, niveau, sujet et série;
- des pages détaillées;
- des fonctions de partage;
- une architecture de séries basée sur `resource_series` et `resource_series_memberships`.

La hiérarchie réelle du produit a donc changé.

La nouvelle page d’accueil doit refléter cette évolution sans reconstruire les capacités déjà présentes dans Ressources IA.

---

# 3. Repositionnement stratégique

Le modèle mental de la page d’accueil devient :

```text
AVANT
« Voici qui je suis, ce que je fais et quelques ressources. »

APRÈS
« Voici un endroit où comprendre et utiliser l’IA.
Si vous souhaitez savoir qui construit ce site,
mon profil et mes réalisations sont accessibles ensuite. »
```

La page d’accueil doit permettre au visiteur de comprendre rapidement :

1. de quoi parle 5PennyAi;
2. ce qu’il peut y apprendre;
3. où commencer;
4. comment explorer librement;
5. comment approfondir;
6. qui est derrière le site lorsqu’il souhaite en savoir davantage.

Message central retenu :

> **Comprendre l’IA, un concept à la fois.**

---

# 4. Principes UX directeurs

## 4.1 Éducation avant portfolio

La première moitié de la page ne doit pas être centrée sur Christian, ses années d’expérience, sa stack ou ses projets.

Le profil devient une preuve de crédibilité située plus bas dans la page.

## 4.2 Orienter avant d’exposer le catalogue

La page d’accueil ne doit pas être une copie de `/ressources-ia`.

Elle doit d’abord aider le visiteur à choisir une direction :

```text
Je découvre l’IA
Je cherche un concept
Je veux utiliser l’IA
```

## 4.3 Les contenus réels deviennent la matière visuelle

Le hero et les sections éditoriales doivent utiliser les vraies couvertures, thumbnails et couvertures de séries 5PennyAi.

Ne pas utiliser comme visuel principal :

- robot générique;
- cerveau lumineux;
- réseau neuronal décoratif;
- interface de chatbot fictive;
- esthétique cyber / néon;
- image de banque générique sur l’IA.

## 4.4 Série, Sujet et futur Parcours restent distincts

### Sujet

> « Montre-moi ce qui existe sur ce domaine. »

### Série

> « Je veux explorer un ensemble cohérent de contenus liés. »

### Parcours

> « Guide-moi dans un ordre précis afin d’atteindre un objectif d’apprentissage. »

Ces notions ne doivent pas être présentées comme des synonymes.

## 4.5 Modernité par la composition, pas par les effets

Le rendu doit sembler actuel grâce à :

- la typographie;
- les proportions;
- les espaces;
- la hiérarchie;
- les compositions asymétriques;
- les vraies couvertures;
- les changements de rythme entre les sections;
- quelques micro-interactions.

Ne pas chercher un look moderne avec des effets gratuits.

---

# 5. Référence visuelle V1

La maquette approuvée provisoirement est conservée sous le nom :

```text
MAQUETTE_REFONTE_ACCUEIL_5PENNYAI_V1.png
```

Elle constitue une **référence de direction visuelle**, non une spécification à reproduire pixel par pixel.

Elle illustre notamment :

- le hero en deux zones;
- les couvertures superposées;
- la section d’orientation;
- la série recommandée;
- la bande Navy des sujets;
- les séries en trois colonnes;
- la sélection éditoriale « À découvrir »;
- les trois formats;
- la place secondaire du profil;
- le footer sombre.

## 5.1 Éléments de maquette non contractuels

Les éléments suivants sont illustratifs et ne doivent jamais être considérés comme des données métier :

- titres d’exemple;
- nombres de ressources;
- niveaux;
- séries montrées;
- comptes par sujet;
- descriptions;
- portrait généré;
- contenus éditoriaux exacts.

Les données réelles de l’application ont toujours priorité.

## 5.2 Correction retenue — « Explorer par sujet »

La section sombre doit être perçue comme **une bande continue et unifiée**.

Deux colonnes sont permises, mais :

- aucune coupure centrale dominante;
- aucun séparateur vertical lourd;
- alignements équilibrés;
- séparateurs horizontaux discrets;
- lecture d’un seul ensemble visuel.

---

# 6. Architecture cible de la page d’accueil

Ordre retenu pour la V1 :

```text
HEADER
↓
1. HERO — Positionnement + recherche
↓
2. PAR OÙ COMMENCER? — Orientation rapide
↓
3. UN BON POINT DE DÉPART — Série recommandée
↓
4. EXPLORER PAR SUJET — Exploration libre
↓
5. APPROFONDIR AVEC LES SÉRIES — Collections éditoriales
↓
6. À DÉCOUVRIR — Sélection éditoriale de ressources
↓
7. UNE IDÉE, PLUSIEURS FAÇONS D’APPRENDRE — Formats
↓
8. DERRIÈRE 5PENNYAI — Profil et projets secondaires
↓
FOOTER
```

Lorsque **Parcours** sera réellement implanté, la zone 3 pourra évoluer sans changer toute l’architecture de la page.

---

# 7. Header

## 7.1 Navigation V1

Tant que Parcours n’est pas implanté :

```text
5PennyAi

Ressources
Séries
Prompts
À propos

Recherche
FR / EN
```

Ne pas afficher :

- `Parcours` désactivé;
- `Parcours — bientôt`;
- une route vide;
- un lien vers une fonctionnalité inexistante.

## 7.2 Navigation future

Après implantation réelle de Parcours :

```text
Ressources
Parcours
Séries
Prompts
À propos
```

## 7.3 Comportement

- header sticky;
- fond cohérent avec le site;
- séparation basse discrète;
- aucune grosse ombre;
- aucun CTA commercial permanent;
- navigation compacte sur tablette étroite et mobile;
- administration hors périmètre.

L’inspection doit confirmer si le header est global ou spécifique à certaines routes avant toute modification.

---

# 8. Hero

## 8.1 Objectif

Répondre immédiatement :

> « Qu’est-ce que 5PennyAi et que puis-je y faire? »

## 8.2 Contenu

Eyebrow recommandé :

```text
RESSOURCES POUR COMPRENDRE L’IA
```

H1 :

> **Comprendre l’IA, un concept à la fois.**

Texte de direction :

> Des ressources claires et pédagogiques pour comprendre comment fonctionne l’intelligence artificielle et mieux l’utiliser.

La formulation finale pourra être ajustée pendant la finition sans changer l’architecture.

## 8.3 Recherche

Champ :

```text
Rechercher un concept, un sujet ou une question…
```

Règles :

- réutiliser la recherche existante du catalogue;
- ne pas créer un deuxième moteur de recherche;
- soumettre vers `/ressources-ia` avec le paramètre réellement utilisé par l’application;
- conserver l’insensibilité actuelle aux accents/casse/espaces si gérée par le catalogue;
- une recherche vide ne doit pas produire une URL incohérente.

## 8.4 Actions

Primaire :

```text
Explorer les ressources
```

Secondaire :

```text
Commencer par les bases →
```

Dans la V1, l’action secondaire pointe vers une **série débutante réelle** choisie éditorialement.

Elle ne doit pas pointer vers un Parcours tant que Parcours n’existe pas.

## 8.5 Visuel

Desktop : 2 à 3 couvertures réelles.

Mobile : maximum 2.

Règles :

- ratio 16:9 lorsque l’asset disponible le permet;
- petites superpositions contrôlées;
- ombres faibles;
- connecteurs doodle discrets;
- aucune animation permanente;
- aucun carrousel.

---

# 9. Section « Par où commencer? »

## 9.1 Objectif

Aider le visiteur qui ne sait pas encore quoi chercher.

## 9.2 Trois intentions

### 01 — Je découvre l’IA

Action :

```text
Commencer par les bases →
```

### 02 — Je cherche un concept

Action :

```text
Explorer les sujets →
```

### 03 — Je veux utiliser l’IA

Action :

```text
Explorer les prompts →
```

## 9.3 Design

Desktop :

- trois colonnes;
- séparateurs fins;
- grands numéros 01 / 02 / 03;
- pas de cartes lourdes;
- pas de grandes icônes rondes.

Mobile :

- liste verticale;
- séparateurs horizontaux;
- actions facilement accessibles.

---

# 10. Section « Un bon point de départ »

## 10.1 Rôle actuel

Mettre en avant une **série débutante réelle** que 5PennyAi recommande comme porte d’entrée.

Le choix de la série ne doit pas être déduit d’un titre présent dans la maquette.

Il doit être déterminé à partir des séries existantes et du choix éditorial de Christian.

## 10.2 Contenu

Afficher :

- couverture de série;
- label de niveau si disponible;
- titre;
- description;
- nombre de ressources publiées;
- CTA `Commencer la série`;
- éventuellement un aperçu compact de l’ordre des premiers membres sur desktop.

Ne pas inventer une description ou un niveau.

## 10.3 Préparation à Parcours

Cette zone ne doit pas être codée comme un composant impossible à faire évoluer.

Quand Parcours sera implanté, elle pourra devenir :

```text
APPRENDRE AVEC UN OBJECTIF
→ 2 ou 3 parcours guidés
```

Dans la V1 publique, elle reste cependant exclusivement une mise en avant de contenu existant.

---

# 11. Section « Explorer par sujet »

## 11.1 Objectif

Permettre une entrée transversale vers les ressources d’un domaine.

## 11.2 Données

Les sujets doivent provenir de la taxonomie réellement utilisée par Ressources IA.

Ne pas créer une nouvelle taxonomie uniquement pour la homepage.

V1 recommandée : environ 6 sujets visibles.

## 11.3 Sélection

La homepage peut utiliser une petite sélection éditoriale stable parmi les sujets existants.

Ne pas créer une table administrative ou un CMS de homepage dans ce chantier.

## 11.4 Interaction

Chaque ligne mène au catalogue filtré avec les paramètres réellement supportés par l’application.

Le nombre de ressources n’est affiché que s’il est calculé depuis les publications réelles.

## 11.5 Design

- bande Navy continue;
- largeur visuelle pleine;
- contenu contraint au même max-width général;
- deux colonnes desktop;
- une colonne mobile;
- séparateurs horizontaux discrets;
- aucune coupure verticale forte au centre;
- accents de couleur ponctuels.

---

# 12. Section « Approfondir avec les séries »

## 12.1 Objectif

Montrer quelques collections structurées, distinctes d’une simple recherche par sujet.

## 12.2 Nombre

V1 : maximum 3 séries sur desktop.

## 12.3 Contenu

Pour chaque série :

- couverture 16:9;
- niveau commun seulement s’il est réellement déterminable;
- nom;
- description courte;
- nombre de ressources publiées;
- action `Voir la série →`.

L’objectif pédagogique complet reste principalement dans la page de série.

## 12.4 Source de vérité

Les données proviennent de :

```text
resource_series
+
resource_series_memberships
+
ressources publiées
```

Ne pas réintroduire de logique legacy basée sur `series_name` ou `episode_number`.

## 12.5 Design

- trois colonnes desktop;
- deux colonnes tablette;
- une colonne mobile;
- cover comme élément principal;
- pas de gros encadrement autour de chaque série;
- texte directement posé dans la mise en page éditoriale.

---

# 13. Section « À découvrir »

## 13.1 Objectif

Créer une **une éditoriale** qui donne envie d’ouvrir immédiatement une ressource.

Cette section ne doit pas être un doublon de la grille du catalogue.

## 13.2 V1

Afficher environ :

```text
1 ressource principale
+
2 ressources secondaires
```

Mélanger les formats lorsque les contenus disponibles le permettent :

- Article;
- Infographie;
- Prompt.

## 13.3 Sélection éditoriale

La V1 doit privilégier une **curation explicite** plutôt que « les trois plus récentes ».

La solution de stockage de cette sélection doit rester simple :

- petite configuration dans le code;
- slugs ou identifiants existants;
- aucun nouveau CMS ou champ de base uniquement pour la homepage, sauf nécessité démontrée par l’inspection.

## 13.4 Fallbacks

L’inspection doit déterminer le comportement si une ressource sélectionnée :

- n’existe plus;
- passe en brouillon;
- est retirée.

Le site ne doit jamais afficher un lien cassé ou exposer un brouillon.

## 13.5 Design

Desktop : composition asymétrique.

```text
8 colonnes : ressource principale
4 colonnes : deux ressources secondaires
```

Mobile :

- ressource principale verticale;
- deux ressources secondaires en format horizontal compact.

Pas de :

- carrousel;
- slider automatique;
- grille de six cartes identiques.

---

# 14. Section « Une idée, plusieurs façons d’apprendre »

## 14.1 Objectif

Expliquer le rôle complémentaire des formats.

Positionnement retenu :

```text
Article
→ comprendre en profondeur

Infographie
→ comprendre visuellement

Prompt
→ agir avec l’aide de l’IA
```

## 14.2 Design

Trois blocs typographiques :

```text
01 ARTICLE
Approfondir

02 INFOGRAPHIE
Visualiser

03 PROMPT
Agir
```

Règles :

- pas de thumbnails;
- pas de grosses cartes;
- courte explication;
- lien vers chaque format;
- fond légèrement distinct permis, par exemple Lavender très pâle.

---

# 15. Section « Derrière 5PennyAi »

## 15.1 Objectif

Présenter brièvement la personne derrière le projet sans faire revenir le portfolio au premier plan.

## 15.2 Contenu

Afficher :

- petit portrait ou visuel réel adapté;
- courte présentation;
- domaine général de crédibilité;
- lien `À propos →`;
- lien `Voir les projets →`.

Ne pas réintroduire ici :

- CV complet;
- longue stack technique;
- grande chronologie;
- longue liste de certifications;
- énorme bloc PennySEO;
- métriques personnelles.

Ces informations appartiennent aux pages secondaires.

---

# 16. Footer

## 16.1 Structure V1

```text
5PennyAi
Comprendre l’IA, un concept à la fois.

APPRENDRE
Séries

EXPLORER
Ressources
Articles
Infographies
Prompts

5PENNYAI
À propos
Projets
Contact

FR / EN
```

## 16.2 Futur

Lorsque Parcours existe :

```text
APPRENDRE
Parcours
Séries
```

Ne pas afficher Parcours avant.

---

# 17. Grille et proportions desktop

Viewport de référence :

```text
1440 px
```

Fondation recommandée :

- max-width : environ 1200 à 1240 px;
- 12 colonnes;
- gouttières autour de 24 px;
- marges latérales responsives;
- système d’espacement basé sur multiples cohérents, idéalement proche de 8 px.

Proportions conceptuelles :

```text
Header                         ~72 px
Hero                           ~620–680 px
Par où commencer              ~300–360 px
Un bon point de départ         ~440–500 px
Explorer par sujet             ~450–520 px
Séries                         ~600–680 px
À découvrir                    ~620–720 px
Formats                        ~400–460 px
Derrière 5PennyAi              ~380–440 px
Footer                         ~320–380 px
```

Ces valeurs servent de cible de rythme, pas de hauteur CSS obligatoire.

---

# 18. Responsive

## 18.1 Desktop

Environ ≥ 1024 px :

- grille 12 colonnes;
- hero texte + visuels;
- trois séries;
- sujets en deux colonnes;
- sélection éditoriale asymétrique.

## 18.2 Tablette

Environ 640–1024 px :

- navigation compacte si nécessaire;
- hero 55/45 ou bascule verticale selon le contenu réel;
- deux séries par rangée;
- sujet 2 colonnes tant que lisible;
- une grande ressource + deux secondaires sous forme 2 colonnes;
- pas de compression artificielle.

## 18.3 Mobile

Référence : environ 390 px.

### Hero

- texte avant les visuels;
- maximum 2 covers;
- recherche pleine largeur;
- CTA principal pleine largeur ou quasi pleine largeur.

### Par où commencer

Liste verticale.

### Bon point de départ

Cover puis texte.

### Sujets

Liste verticale sur fond Navy.

### Séries

Une colonne.

### À découvrir

- grande ressource;
- deux ressources secondaires horizontales.

### Formats

Trois blocs verticaux.

### Profil

Petit portrait + texte compact.

## 18.4 Principe mobile

Ne pas simplement empiler tous les contenus desktop.

Sur mobile, retirer les métadonnées secondaires qui n’aident pas à la décision afin de garder une page raisonnablement compacte.

---

# 19. Système visuel

## 19.1 Direction

Conserver l’ADN 5PennyAi existant :

```text
Editorial tech
+
technical notebook
+
subtle doodle
```

## 19.2 Palette de référence

Réutiliser la palette déjà présente dans l’univers Ressources IA :

```text
Navy      #143054
Blue      #4F7CD4
Teal      #14B8A6
Violet    #8B5CF6
Orange    #DD8737
Lavender  #DBCFEE
Off-white #F7F5F2
White     #FFFFFF
```

L’inspection doit vérifier la palette réellement utilisée par le site et réutiliser les tokens/classes existants lorsqu’ils sont cohérents.

## 19.3 Typographie

La maquette utilise une hiérarchie éditoriale forte, mais elle ne doit pas justifier à elle seule l’ajout d’une nouvelle famille de polices.

Règle :

> Préserver le système typographique réel du site autant que possible. N’ajouter une nouvelle police que si un besoin clair est validé après inspection.

Le H1 doit néanmoins posséder une présence éditoriale forte :

- grande taille;
- interligne serré;
- largeur limitée;
- rupture nette avec le texte courant.

## 19.4 Surfaces

- fond principal off-white ou équivalent actuel;
- surfaces secondaires blanches;
- Lavender très léger possible;
- Navy pour la grande rupture « Explorer par sujet » et le footer.

## 19.5 Rayons

Ordres de grandeur :

- grands panneaux : 20–24 px;
- covers : 14–18 px;
- boutons selon système existant.

Ne pas appliquer un arrondi excessif à chaque élément.

## 19.6 Ombres

Très faibles.

Priorité à :

- l’espace;
- la typographie;
- les bordures;
- la couleur de fond.

---

# 20. Motion et micro-interactions

Autorisées :

- léger scale sur cover;
- déplacement de flèche de quelques pixels;
- variation de contraste;
- transition courte autour de 150–220 ms;
- header sticky;
- feedbacks de focus/hover propres.

À éviter :

- parallax;
- scroll hijacking;
- carrousels automatiques;
- grandes animations d’entrée;
- texte animé en permanence;
- tilt 3D;
- glow;
- éléments suivant le curseur;
- animations décoratives coûteuses.

Respecter `prefers-reduced-motion`.

---

# 21. Accessibilité

La refonte doit intégrer dès le développement :

- un seul `<h1>`;
- hiérarchie H2/H3 cohérente;
- focus clavier visible;
- toutes les actions utilisables sans souris;
- tailles tactiles suffisantes;
- contraste conforme au système visuel;
- aucun sens transmis uniquement par la couleur;
- recherche correctement étiquetée;
- textes de liens explicites;
- images décoratives avec `alt=""` lorsqu’une information équivalente est annoncée juste après;
- vrais alt texts lorsque l’image transmet une information propre;
- navigation mobile accessible;
- pas de hover-only;
- respect du mouvement réduit.

---

# 22. Données et curation

## 22.1 Données réelles uniquement

La page ne doit jamais inventer :

- compte de ressources;
- compte de séries;
- niveau;
- description;
- sujet;
- date;
- existence d’un Parcours.

## 22.2 Brouillons

Aucun brouillon ne doit apparaître :

- dans le hero;
- dans les sujets;
- dans les séries;
- dans À découvrir;
- dans les compteurs.

## 22.3 Curation homepage

Pour la V1, la curation peut rester simple et versionnée dans le code :

- série recommandée;
- sujets mis en avant;
- 2 à 3 ressources du hero;
- ressources de « À découvrir »;
- séries mises en avant.

Ne pas créer une administration ou une table dédiée à la homepage uniquement pour éviter quelques constantes éditoriales.

L’inspection doit déterminer la forme la plus simple et sûre, idéalement basée sur des slugs ou identifiants déjà stables.

## 22.4 Fallbacks de curation

Une ressource sélectionnée explicitement peut ensuite devenir indisponible.

La V1 doit éviter :

- carte cassée;
- image manquante non gérée;
- lien vers un draft;
- section vide incohérente.

La stratégie exacte de fallback est à confirmer à l’incrément 0.

---

# 23. Routes et réutilisation des capacités existantes

La homepage doit consommer les routes et comportements existants plutôt que les dupliquer.

Exemples conceptuels :

```text
Explorer les ressources
→ /ressources-ia

Recherche
→ /ressources-ia?q=...

Prompt
→ /ressources-ia?format=prompt

Sujet
→ /ressources-ia?sujet=...

Série
→ /ressources-ia/series/{slug}
```

Les vrais noms des paramètres doivent être confirmés dans le dépôt.

Ne pas inventer une nouvelle convention d’URL uniquement pour la homepage.

---

# 24. Parcours — invariant de la V1

La notion de **Parcours** est prévue dans l’évolution du produit, mais elle n’est pas encore implémentée.

Un Parcours doit à terme pouvoir réutiliser des ressources existantes dans un ordre construit autour d’un **objectif d’apprentissage précis**, potentiellement à travers :

- plusieurs séries;
- plusieurs sujets;
- plusieurs formats.

Dans la V1 :

```text
Architecture préparée
→ oui

Navigation publique Parcours
→ non

Carte Parcours
→ non

Route Parcours
→ non

CTA Parcours
→ non

« bientôt disponible »
→ non
```

La zone « Un bon point de départ » fournit aujourd’hui une expérience utile avec une série réelle et pourra évoluer plus tard.

---

# 25. Hors périmètre de la refonte homepage

Ne pas reconstruire dans ce chantier :

- catalogue Ressources IA;
- recherche interne;
- filtres;
- pagination;
- pages de séries;
- page de détail d’un article;
- page de détail d’une infographie;
- page de détail d’un prompt;
- administration;
- contrats JSON;
- production orchestrée;
- thumbnails;
- génération d’images;
- partage public;
- memberships des séries;
- SEO interne des ressources;
- sitemap, sauf ajustement directement nécessaire à la nouvelle homepage;
- Parcours;
- newsletter;
- comptes utilisateur;
- progression d’apprentissage.

La page d’accueil réutilise ces fondations lorsqu’elles existent.

---

# 26. Invariants critiques

Pendant tout le développement :

- aucun brouillon ne devient public;
- les routes existantes restent fonctionnelles;
- la recherche du catalogue n’est pas dupliquée;
- les filtres du catalogue ne sont pas réécrits;
- `resource_series` et `resource_series_memberships` restent les seules sources de vérité des séries;
- aucune logique legacy de séries n’est réintroduite;
- Parcours n’est pas exposé avant son implantation;
- les données de la maquette ne sont pas utilisées comme données métier;
- aucune dépendance lourde n’est ajoutée pour une simple finition visuelle;
- aucune nouvelle police n’est ajoutée sans validation;
- le site reste FR/EN;
- le style général de 5PennyAi reste reconnaissable;
- le portfolio reste accessible mais secondaire;
- aucun commit ou push n’est effectué sans demande explicite;
- chaque incrément produit un résultat visible et vérifiable.

---

# 27. Découpage du développement

Le chantier est découpé en **cinq incréments fonctionnels**, précédés d’une inspection ciblée.

```text
Inspection
→ fondation + hero
→ orientation + point de départ + sujets
→ séries + sélection éditoriale + formats
→ profil + footer + responsive
→ finition UX/UI et validation
```

---

# Incrément 0 — Inspection ciblée de la page actuelle

## Objectif

Comprendre l’implantation réelle de la page d’accueil et identifier les composants, helpers et requêtes à réutiliser avant toute modification.

## Documents à lire

Au minimum :

```text
GUIDE_DEVELOPPEMENT_REFONTE_ACCUEIL_5PENNYAI_V1.md
Guide de développement — Refonte de l’architecture des séries Ressources IA.md
GUIDE_DEVELOPPEMENT_MVP_6_0_BIBLIOTHEQUE_PROMPTS_RESSOURCES_IA.md
```

Puis les guides existants pertinents uniquement si nécessaires à l’inspection.

## À inspecter

- état Git, branche, remotes et derniers commits;
- route réelle de la homepage;
- composant actuel de la homepage;
- header public;
- footer public;
- structure globale du layout;
- système de conteneurs et max-width;
- tokens/classes Tailwind et palette réellement utilisés;
- typographie actuelle;
- composants de boutons et liens;
- composants de cartes publics;
- composants de séries;
- helpers de thumbnails et covers;
- fonctions publiques de chargement des articles, infographies et prompts;
- modèle public commun utilisé par le catalogue;
- recherche et paramètres d’URL;
- taxonomie Sujet;
- `resource_series` et memberships;
- routes de séries;
- routes des prompts;
- conventions i18n FR/EN;
- Helmet / métadonnées de homepage;
- tests existants;
- comportement responsive actuel;
- éventuels composants de section réutilisables;
- performances des requêtes et images de la homepage actuelle.

## Questions à résoudre

1. Quel composant doit être refondu plutôt que remplacé?
2. Le header est-il global et quelles pages seraient affectées par sa modification?
3. Le footer est-il global?
4. Quels composants du catalogue peuvent être réutilisés sans reproduire une grille standard?
5. Quel helper construit les URLs canoniques du catalogue, des formats et des séries?
6. Quel paramètre de recherche doit être utilisé depuis le hero?
7. Comment récupérer les comptes par sujet sans dupliquer la logique du catalogue?
8. Comment sélectionner proprement une série recommandée?
9. Comment sélectionner 2–3 séries et 3 ressources éditoriales sans nouvelle table?
10. Quel fallback appliquer si un élément configuré n’est plus publié?
11. Comment charger les ressources du hero sans multiplier les requêtes?
12. Quelles polices et tailles existantes peuvent produire la hiérarchie éditoriale souhaitée?
13. Les couleurs 5PennyAi existent-elles déjà comme tokens réutilisables?
14. Quelles contraintes réelles apparaissent à 1440, 768 et 390 px?
15. Quelles parties de l’ancienne homepage peuvent être supprimées sans casser le profil ou les autres pages?

## Livrable

Rapport court comprenant :

- état réel;
- fichiers exacts concernés;
- composants réutilisables;
- routes et helpers confirmés;
- stratégie de données homepage;
- stratégie de curation;
- risques;
- ajustements nécessaires au présent guide;
- périmètre exact de l’incrément 1.

## Hors périmètre

- aucune modification de code;
- aucun changement de contenu;
- aucune migration;
- aucune nouvelle dépendance;
- aucun commit;
- aucun push.

## Critère de clôture

L’incrément 1 peut être développé sans hypothèse importante sur l’architecture existante.

---

# Incrément 1 — Fondation, navigation et hero

## Objectif

Transformer immédiatement le premier écran afin que 5PennyAi soit perçu comme un site éducatif plutôt que comme un portfolio.

## Inclus

- nouvelle structure principale de homepage;
- conteneur et rythme de base;
- adaptation du header public si validée à l’inspection;
- hero;
- eyebrow;
- H1;
- texte introductif;
- recherche reliée au catalogue existant;
- CTA `Explorer les ressources`;
- CTA secondaire vers une série réelle;
- composition de covers réelles;
- responsive hero;
- traductions FR/EN;
- métadonnées de homepage ajustées si nécessaire;
- tests ciblés.

## Résultat visible

> Le premier écran de 5PennyAi présente clairement le site comme une plateforme de ressources éducatives sur l’IA.

## Hors périmètre

- autres sections de la nouvelle homepage;
- Parcours;
- refonte du catalogue;
- modification des cartes Ressources IA;
- nouvelle recherche;
- changement de base de données.

## Critères d’acceptation

- H1 éducatif visible;
- recherche fonctionne avec le vrai catalogue;
- CTA Ressources fonctionne;
- CTA secondaire pointe vers un contenu réel;
- 2–3 covers publiées seulement;
- aucune image générique IA;
- aucun contenu portfolio dominant au-dessus du fold;
- header cohérent desktop/mobile;
- aucune route existante cassée;
- build réussi;
- lint ciblé réussi;
- vérification à 1440, 768 et 390 px.

---

# Incrément 2 — Orientation, point de départ et sujets

## Objectif

Aider le visiteur à choisir une direction avant de lui présenter le catalogue ou les séries en profondeur.

## Inclus

- section `Par où commencer?`;
- trois intentions;
- liens réels vers les destinations existantes;
- bloc `Un bon point de départ`;
- sélection de la série recommandée;
- section Navy `Explorer par sujet`;
- sélection de sujets réels;
- comptes réels si disponibles proprement;
- liens vers les filtres réels du catalogue;
- responsive;
- FR/EN;
- tests ciblés.

## Résultat visible

> Un nouveau visiteur peut soit commencer par les bases, soit explorer un sujet, soit accéder directement aux prompts.

## Hors périmètre

- Parcours;
- nouvelles pages Sujet;
- taxonomie supplémentaire;
- administration de la homepage;
- séries mises en avant de la section suivante.

## Critères d’acceptation

- les trois intentions sont clairement distinctes;
- la série recommandée est publiée;
- aucun texte de série n’est inventé;
- les sujets proviennent du catalogue réel;
- la section Navy est continue et équilibrée;
- aucun gros séparateur central ne coupe la bande;
- les URL sont partageables et existantes;
- mobile = liste lisible;
- build/lint/tests réussis;
- contrôle à 1440, 768 et 390 px.

---

# Incrément 3 — Séries, À découvrir et formats

## Objectif

Présenter la richesse du catalogue sans reproduire la grille Ressources IA.

## Inclus

- `Approfondir avec les séries`;
- 3 séries maximum;
- couvertures et données persistantes;
- `À découvrir`;
- curation de 3 ressources;
- composition asymétrique desktop;
- formats mixtes lorsque disponibles;
- fallbacks si un élément n’est plus publié;
- section `Une idée, plusieurs façons d’apprendre`;
- liens vers Articles, Infographies, Prompts;
- responsive;
- FR/EN;
- tests ciblés.

## Résultat visible

> La homepage montre des séries et quelques ressources fortes tout en conservant une personnalité éditoriale distincte du catalogue.

## Hors périmètre

- carrousel;
- recommandations personnalisées;
- nouveau système de featured content en base;
- nouveau CMS;
- Parcours;
- modification des ressources elles-mêmes.

## Critères d’acceptation

- aucune série legacy;
- aucune ressource draft;
- trois séries maximum;
- trois ressources de découverte par défaut;
- composition non identique à la grille du catalogue;
- Article / Infographie / Prompt clairement distinguables;
- aucun lien cassé si une sélection devient indisponible;
- responsive conforme;
- build/lint/tests réussis.

---

# Incrément 4 — Profil secondaire, footer et responsive complet

## Objectif

Finaliser la nouvelle hiérarchie du site tout en conservant le profil et les projets accessibles.

## Inclus

- section `Derrière 5PennyAi`;
- contenu personnel court;
- liens À propos / Projets;
- footer restructuré;
- aucune mention Parcours avant implantation;
- navigation mobile finalisée;
- comportement tablette finalisé;
- vérification de toutes les sections à 1440, 768 et 390 px;
- petites corrections de densité mobile;
- FR/EN;
- tests ciblés.

## Résultat visible

> La page est complète de bout en bout et le portfolio est clairement secondaire par rapport à la mission éducative.

## Hors périmètre

- refonte des pages À propos ou Projets;
- nouveau contenu professionnel détaillé;
- newsletter;
- nouveau formulaire de contact;
- Parcours.

## Critères d’acceptation

- section personnelle compacte;
- aucun retour à une logique portfolio-first;
- footer cohérent avec la nouvelle architecture;
- navigation mobile utilisable au clavier;
- aucun débordement horizontal;
- densité mobile raisonnable;
- build/lint/tests réussis.

---

# Incrément 5 — Finition UX/UI, accessibilité, performance et validation

## Objectif

Comparer le résultat à la direction visuelle approuvée, corriger les écarts et clôturer la refonte sans ajouter de nouvelles fonctions.

## Inclus

- comparaison visuelle avec la maquette V1;
- ajustement des espacements;
- ajustement de la hiérarchie typographique;
- harmonisation des rayons et bordures;
- micro-interactions;
- focus clavier;
- `prefers-reduced-motion`;
- audit des alt texts;
- vérification des titres H1/H2/H3;
- performance images;
- lazy loading lorsque pertinent;
- absence de chargements inutiles;
- vérification console;
- vérification SEO homepage;
- tests ciblés et régression pertinente;
- validation finale FR/EN;
- état Git.

## Résultat visible

> La nouvelle page d’accueil semble appartenir à l’univers 5PennyAi, fonctionne sur tous les principaux viewports et présente les ressources comme le cœur du site.

## Hors périmètre

- nouvelle fonctionnalité;
- Parcours;
- nouveau CMS;
- nouvelle taxonomie;
- nouvelle police sans décision explicite;
- refonte des pages internes;
- analytics supplémentaires sauf instrumentation existante triviale.

## Critères d’acceptation UX/UI

- hero clairement éducatif;
- aucune esthétique SaaS générique dominante;
- sections visuellement distinctes;
- bande Sujet unifiée;
- séries image-led;
- sélection À découvrir réellement éditoriale;
- profil secondaire;
- footer cohérent;
- rythme visuel clair / sombre maîtrisé.

## Critères d’acceptation techniques

- build réussi;
- lint ciblé réussi;
- tests ciblés réussis;
- aucune erreur console;
- aucun débordement horizontal;
- navigation clavier complète;
- recherche fonctionnelle;
- aucune route cassée;
- aucun draft exposé;
- chargement d’images raisonnable;
- FR/EN fonctionnels;
- `git diff --check` réussi;
- aucune modification étrangère au chantier.

---

# 28. Tableau de progression

| Incrément | Résultat fonctionnel | État | Commit |
|---|---|---|---|
| 0 | Inspection de la homepage et des composants réutilisables | À faire | — |
| 1 | Fondation, navigation et hero éducatif | À faire | — |
| 2 | Orientation, série de départ et exploration par sujet | À faire | — |
| 3 | Séries, À découvrir et logique des formats | À faire | — |
| 4 | Profil secondaire, footer et responsive complet | À faire | — |
| 5 | Finition UX/UI, accessibilité et validation | À faire | — |

États recommandés :

```text
À faire
En cours
À valider
Accepté
Bloqué
```

---

# 29. Discipline de chaque session Codex

Chaque prompt Codex doit préciser :

1. le résultat visible attendu;
2. les documents à lire;
3. l’état Git attendu;
4. la portée exacte de l’incrément;
5. les éléments explicitement hors périmètre;
6. les invariants fonctionnels;
7. les règles UX/UI pertinentes;
8. les données réelles à utiliser;
9. les validations techniques;
10. les viewports à vérifier;
11. le rapport final attendu;
12. l’interdiction de commit ou push sauf demande explicite.

Le rapport final doit contenir :

- résultat obtenu;
- fichiers modifiés;
- composants réutilisés/créés;
- données utilisées;
- routes et helpers utilisés;
- comportement responsive;
- accessibilité;
- commandes et tests exécutés;
- vérifications manuelles;
- limites connues;
- état Git;
- diff résumé.

---

# 30. Stratégie de déploiement

Le chantier peut être développé par incréments localement.

Pour la production, deux approches sont possibles après inspection :

## Option A — Déploiement incrémental

À utiliser si chaque incrément produit une homepage cohérente et publiable indépendamment.

## Option B — Déploiement groupé

À privilégier si les premiers incréments créent temporairement une page hybride entre l’ancienne et la nouvelle architecture.

La décision doit être prise après l’incrément 0.

Aucun push n’est effectué automatiquement par Codex.

---

# 31. Critères de clôture

La refonte est terminée lorsque Christian peut ouvrir la page d’accueil et constater que :

1. 5PennyAi est immédiatement perçu comme un site éducatif sur l’IA;
2. le message « Comprendre l’IA, un concept à la fois » domine le premier écran;
3. la recherche Ressources IA est accessible immédiatement;
4. un visiteur débutant reçoit une direction claire;
5. les sujets peuvent être explorés facilement;
6. les séries sont visibles comme collections éditoriales;
7. quelques ressources fortes sont mises en avant sans reproduire le catalogue;
8. Article, Infographie et Prompt ont chacun un rôle compréhensible;
9. le profil et les projets sont accessibles mais secondaires;
10. Parcours n’est pas montré avant son implantation;
11. la structure pourra accueillir Parcours plus tard sans refonte majeure;
12. le design demeure reconnaissable comme 5PennyAi;
13. le site ne ressemble ni à une landing page SaaS générique ni à un portail de cours traditionnel;
14. la page est utilisable sur desktop, tablette et mobile;
15. le clavier permet d’utiliser les fonctions principales;
16. aucun brouillon n’est exposé;
17. les routes Ressources IA existantes fonctionnent;
18. la recherche existante est réutilisée;
19. les séries utilisent uniquement la nouvelle architecture persistante;
20. le site reste fonctionnel en français et en anglais;
21. le build, le lint ciblé et les tests réussissent;
22. aucune erreur console importante n’est présente;
23. Christian valide la page dans le navigateur réel.

---

# 32. Évolutions volontairement reportées

À réévaluer après la refonte :

- Parcours d’apprentissage;
- pages dédiées par Sujet;
- CMS de mise en avant homepage;
- personnalisation des recommandations;
- progression utilisateur;
- compte utilisateur;
- favoris;
- historique d’apprentissage;
- newsletter;
- recommandations algorithmiques;
- instrumentation analytics spécifique à chaque bloc;
- featured content administrable;
- A/B testing;
- nouvelles animations avancées.

---

# 33. Principe final

La nouvelle page d’accueil doit appliquer une hiérarchie simple :

```text
COMPRENDRE
→ le rôle de 5PennyAi

S’ORIENTER
→ savoir où commencer

EXPLORER
→ sujets et ressources

APPROFONDIR
→ séries

AGIR
→ prompts et formats

DÉCOUVRIR L’AUTEUR
→ profil et projets en second plan
```

Le design ne doit pas chercher à impressionner par la complexité.

Il doit donner une impression de **clarté, de sérieux, de modernité et de personnalité éditoriale**, tout en faisant des ressources existantes le cœur visuel et fonctionnel de 5PennyAi.
