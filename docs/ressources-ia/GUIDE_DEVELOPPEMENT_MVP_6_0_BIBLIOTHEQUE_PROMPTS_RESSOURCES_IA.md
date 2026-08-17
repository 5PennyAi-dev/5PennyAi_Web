# Guide de développement — MVP 6.0 Bibliothèque de prompts Ressources IA

**Projet :** 5PennyAi
**Section :** Ressources IA
**Format ajouté :** Prompts réutilisables
**Date :** 13 août 2026
**Statut :** conception fonctionnelle prête à être inspectée puis implantée par incréments

---

> **État historique.** Les Prompts restent hors Topics et ne disposent pas de
> `theme`; leur classification demeure `category` et `contexts`.

## 1. Rôle du document

Ce guide encadre l’ajout d’une **bibliothèque de prompts réutilisables** à la section Ressources IA de 5PennyAi.

Il prolonge les évolutions déjà implantées autour :

- du catalogue Ressources IA;
- des articles;
- des infographies;
- des thumbnails et couvertures;
- des filtres et de la recherche;
- du partage public;
- des métadonnées sociales et SEO;
- des workflows administratifs d’import et de publication.

Le MVP 6.0 ajoute un troisième format spécialisé :

```text
Article
→ comprendre en profondeur

Infographie
→ comprendre visuellement

Prompt
→ agir avec l’aide de l’IA
```

L’objectif n’est pas de créer une collection de « prompts magiques » ni un cours de prompt engineering.

L’objectif est de permettre à une personne non technique de répondre rapidement à une question simple :

> **« Qu’est-ce que j’essaie de faire avec l’aide d’une IA? »**

puis de trouver un modèle de demande qu’elle peut comprendre, personnaliser et copier.

Le guide sert de fil conducteur pratique. L’inspection du dépôt demeure la source de vérité technique et peut ajuster les noms de tables, colonnes, composants, helpers, routes ou fonctions sans modifier les objectifs fonctionnels.

Le MVP ne doit pas être utilisé pour créer :

- une table universelle `resources`;
- un CMS générique;
- une marketplace de prompts;
- un éditeur avancé de prompts;
- un système communautaire;
- une orchestration automatique de plusieurs prompts;
- une plateforme de formation complète.

---

# 2. Documents de référence

## 2.1 Références obligatoires

```text
GUIDE_DEVELOPPEMENT_MVP_6_0_BIBLIOTHEQUE_PROMPTS_RESSOURCES_IA.md
CONTRAT_JSON_PROMPTS_5PENNYAI_V1.md
GUIDE_DEVELOPPEMENT_MVP_2_0_ARTICLES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_1_2_THUMBNAILS_RESSOURCES_IA.md
CONCEPTION_GENERATEUR_THUMBNAILS_V3.md
GUIDE_DEVELOPPEMENT_MVP_3_1_PARTAGE_SOCIAL_PUBLIC_RESSOURCES_IA.md
```

## 2.2 Références de contexte

```text
REFERENCE_DEVELOPPEMENT_MVP_RESSOURCES_IA_PHASE_1.md
GUIDE_DEVELOPPEMENT_MVP_1_1_RESSOURCES_IA.md
CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md
CONTRAT_JSON_RESSOURCES_IA_V1.md
GUIDE_DEVELOPPEMENT_MVP_3_0_PUBLICATIONS_SOCIALES_RESSOURCES_IA.md
```

## 2.3 Hiérarchie des responsabilités

- `CONTRAT_JSON_PROMPTS_5PENNYAI_V1.md` définit la structure éditoriale importable d’une fiche Prompt.
- Le présent guide définit l’expérience administrative et publique ainsi que l’ordre de développement.
- Les mécanismes existants du catalogue demeurent la référence pour les ressources publiées, les filtres, la recherche et les URL partageables.
- Le système actuel de thumbnails fournit la référence technique pour l’upload, le stockage, le remplacement sécurisé, le fallback et éventuellement la génération intégrée.
- Le système de partage public existant demeure la référence pour `Partager` et `Copier le lien`.
- L’application contrôle toujours les données techniques, les fichiers, les slugs, le statut, les dates et les URL réelles.
- Christian conserve la décision finale d’enregistrer, de publier, de remplacer un thumbnail ou de retenir un prompt.

---

# 3. Contexte et positionnement

La section Ressources IA possède déjà deux formats publics complémentaires :

```text
Articles
Infographies
```

Elle dispose aussi d’une fondation de bibliothèque :

- catalogue commun;
- filtre par format;
- filtre par niveau;
- filtre par sujet;
- filtre par série;
- recherche textuelle;
- paramètres d’URL partageables;
- cartes adaptées aux formats;
- pages détaillées;
- partage public;
- SEO technique;
- administration spécialisée par format.

La bibliothèque de prompts ajoute une troisième fonction éditoriale.

Le visiteur ne cherche plus seulement :

```text
« explique-moi quelque chose »
```

mais aussi :

```text
« aide-moi à faire quelque chose »
```

Le positionnement retenu est :

> **Des modèles de prompts simples et réutilisables pour mieux réfléchir, écrire, apprendre, organiser, décider et vérifier avec l’aide de l’IA.**

Le public cible est volontairement large :

- vie quotidienne;
- travail;
- études;
- communication;
- créativité;
- apprentissage personnel.

Aucune connaissance préalable du prompt engineering n’est supposée.

La première bibliothèque doit privilégier environ **15 à 25 excellents modèles**, avec une cible initiale de **20 prompts**, plutôt qu’une collection volumineuse de modèles génériques ou redondants.

---

# 4. Objectif du MVP 6.0

Permettre à Christian de produire, importer, administrer, illustrer et publier des fiches Prompt, puis permettre à un visiteur de les découvrir et de les copier facilement.

À la fin du MVP, Christian doit pouvoir :

1. ouvrir l’administration Ressources IA;
2. accéder à une section spécialisée `Prompts`;
3. créer un prompt manuellement;
4. importer un fichier `.prompt.json`;
5. importer un JSON partiel ou vide;
6. voir les avertissements déterministes;
7. corriger les métadonnées;
8. corriger le modèle de prompt;
9. gérer les variables structurées;
10. voir l’exemple rempli calculé automatiquement;
11. enregistrer le prompt comme brouillon;
12. rouvrir et modifier le brouillon;
13. téléverser un thumbnail 16:9 produit à l’extérieur;
14. remplacer ou supprimer le thumbnail;
15. conserver le thumbnail lors d’une réimportation JSON;
16. éventuellement générer le thumbnail dans l’application si cette option est retenue après inspection;
17. prévisualiser la fiche publique;
18. publier explicitement le prompt;
19. retrouver le prompt dans le catalogue Ressources IA;
20. filtrer le catalogue sur `Prompts`;
21. filtrer les prompts par catégorie;
22. combiner la recherche, la catégorie et le niveau;
23. ouvrir la fiche publique;
24. copier le prompt principal;
25. copier la version rapide lorsqu’elle existe;
26. consulter les variables et leur exemple;
27. voir un exemple rempli cohérent;
28. partager la fiche publique;
29. copier son URL canonique;
30. constater qu’un brouillon reste invisible;
31. utiliser le parcours sur ordinateur et mobile;
32. utiliser les principales actions au clavier;
33. publier les 20 modèles initiaux sans créer de structure spéciale pour chacun.

Principe central :

> **Trouver un besoin → comprendre le modèle → personnaliser → copier → utiliser.**

---

# 5. Principes directeurs

## 5.1 Prompt est un format spécialisé

Les prompts possèdent leur propre :

- entité persistante;
- administration;
- formulaire;
- import JSON;
- page publique;
- logique de rendu;
- comportement de copie;
- thumbnail facultatif.

Ils partagent seulement avec les autres formats les données nécessaires au catalogue, à la recherche, au partage et au SEO.

---

## 5.2 Ne pas créer une table générique `resources`

Le MVP ne doit pas migrer :

```text
infographics
articles
prompts
```

vers une table universelle uniquement pour simplifier le catalogue.

L’unification continue de se faire par une petite couche de lecture publique.

Forme conceptuelle :

```text
id
contentType
title
summary
level
publishedAt
thumbnailUrl
publicUrl
```

avec des propriétés spécialisées facultatives comme :

```text
category
contexts
seriesName
episodeNumber
theme
```

selon le format.

---

## 5.3 Grand public avant technicité

Une fiche Prompt doit pouvoir être comprise par une personne qui ne connaît pas :

- few-shot prompting;
- chain-of-thought;
- température;
- tokens;
- rôles système;
- méthodes formelles de prompt engineering.

Les titres décrivent ce que la personne veut accomplir.

Préférer :

```text
Comparer deux options selon mes critères
Expliquer un concept simplement
Transformer des notes en plan clair
```

Éviter :

```text
Prompt multicritère
Framework de contextualisation
Template de raisonnement avancé
```

---

## 5.4 Import permissif

Conformément au contrat Prompts v1 :

- `{}` reste importable;
- un JSON partiel reste importable;
- les propriétés reconnues sont conservées;
- les propriétés inconnues sont ignorées;
- les valeurs inconnues produisent un avertissement;
- une autre version de schéma produit un avertissement;
- l’import ne sauvegarde jamais automatiquement;
- l’import ne publie jamais;
- un JSON invalide ne modifie pas le formulaire.

---

## 5.5 Données techniques séparées du JSON

Le JSON ne fournit jamais :

- `id`;
- `slug` définitif;
- `status`;
- `thumbnail_path`;
- URL de stockage;
- dates techniques;
- URL canonique;
- compteur de copies;
- image encodée.

L’application contrôle ces données.

---

## 5.6 Variables structurées dès la v1

Les variables ne doivent pas être seulement détectées dans le texte du prompt.

Le contrat conserve pour chaque variable :

```text
key
label
description
example
```

Cette décision permet :

- des validations déterministes;
- un exemple rempli fiable;
- une meilleure accessibilité;
- une future fonction `Personnaliser` sans modifier le principe du contrat.

---

## 5.7 Exemple calculé, pas dupliqué

L’application ne stocke pas un deuxième prompt complet pour l’exemple.

Elle calcule :

```text
promptTemplate
+
variables[].example
→ exemple rempli
```

La substitution est littérale, déterministe et non récursive.

---

## 5.8 Thumbnail facultatif mais prévu dès la fondation

Pour conserver l’uniformité visuelle du catalogue, une fiche Prompt peut posséder une couverture horizontale 16:9.

Le thumbnail :

- est facultatif;
- est un asset séparé du JSON;
- peut être produit à l’extérieur;
- peut être téléversé manuellement;
- peut éventuellement être généré dans l’application;
- peut servir au catalogue et au partage social;
- utilise toujours un fallback lorsqu’il est absent.

L’absence de thumbnail ne bloque jamais la publication.

---

## 5.9 Pas de personnalisation interactive dans le MVP initial

Le MVP affiche les variables et permet de copier le modèle.

Il ne fournit pas encore :

```text
[Personnaliser]
→ formulaire des variables
→ prompt final calculé
```

Le modèle de données doit toutefois rendre cette évolution possible sans migration conceptuelle importante.

---

## 5.10 Pas de séries pour les prompts v1

Le contrat Prompts v1 ne définit pas `series`.

Les prompts sont d’abord organisés par :

- catégorie;
- niveau;
- recherche;
- contextes affichés comme tags.

Les futurs kits, parcours ou collections seront évalués séparément.

---

## 5.11 Contextes stockés, mais pas nécessairement filtrables au lancement

Les contextes sont conservés :

```text
daily_life
work
studies
communication
creativity
```

Ils peuvent être affichés sur les cartes ou fiches.

Le MVP initial n’a pas besoin d’ajouter une seconde rangée de filtres par contexte tant que la taille de la bibliothèque ne le justifie pas.

---

## 5.12 Un incrément doit produire un résultat vérifiable

Chaque incrément doit produire une capacité visible et testable.

Codex ne doit pas :

- préparer silencieusement l’incrément suivant;
- refactoriser des zones non liées;
- ajouter des fonctionnalités reportées;
- transformer le MVP en architecture générique.

---

# 6. Expérience publique cible

## 6.1 Catalogue général

Le filtre de format devient conceptuellement :

```text
Tous
Infographies
Articles
Prompts
```

L’apparition exacte du filtre doit suivre la convention existante : un format n’a pas besoin d’être présenté publiquement tant qu’aucune ressource correspondante n’est publiée.

---

## 6.2 Mode Bibliothèque de prompts

Lorsque :

```text
format=prompt
```

est sélectionné, la page peut adapter son en-tête ou son sous-titre :

```text
Bibliothèque de prompts

Des modèles simples et réutilisables pour mieux travailler avec une IA.
```

Sous cet en-tête, afficher :

```text
Que voulez-vous faire?
```

puis les catégories :

```text
Tout
Comprendre
Apprendre
Écrire
Résumer
Réfléchir
Organiser
Décider
Vérifier
```

Le contrôle doit rester compact, responsive et utilisable au clavier.

---

## 6.3 Filtres applicables

### Format Prompt sélectionné

Afficher ou conserver :

```text
Recherche
Niveau
Catégorie
```

Les contextes peuvent être affichés sur les cartes, mais ne deviennent pas un filtre public dans la v1.

### Filtres Sujet et Série

Les prompts v1 ne possèdent ni `theme` ni `series`.

Lorsque `format=prompt` est actif :

- masquer les filtres `Sujet` et `Série` s’ils ne sont pas applicables;
- ne pas réserver d’espace vide;
- nettoyer les paramètres incompatibles de l’URL de manière atomique lorsque nécessaire.

Exemple :

```text
?format=prompt&serie=...
```

peut être normalisé vers :

```text
?format=prompt
```

si la convention actuelle du catalogue privilégie la suppression des paramètres incompatibles.

### Niveau

Le filtre de niveau demeure applicable :

```text
beginner
intermediate
advanced
```

---

## 6.4 URL

Formes fonctionnelles envisagées :

```text
/ressources-ia?format=prompt
/ressources-ia?format=prompt&categorie=decide
/ressources-ia?format=prompt&niveau=beginner
/ressources-ia?format=prompt&categorie=write&q=reformuler
```

Les conventions réelles de paramètres du dépôt ont priorité.

Les URL doivent rester :

- partageables;
- compatibles avec Retour/Avancer;
- normalisées;
- insensibles aux paramètres invalides selon les règles existantes.

---

# 7. Taxonomie fonctionnelle

## 7.1 Catégorie principale

Une fiche possède exactement une catégorie principale.

Valeurs v1 :

| Valeur | Français | Intention |
|---|---|---|
| `understand` | Comprendre | Clarifier une notion |
| `learn` | Apprendre | Apprendre ou pratiquer |
| `write` | Écrire | Produire ou améliorer un texte |
| `summarize` | Résumer | Aller à l’essentiel |
| `think` | Réfléchir | Explorer idées et perspectives |
| `organize` | Organiser | Structurer informations et actions |
| `decide` | Décider | Comparer et préparer un choix |
| `verify` | Vérifier | Examiner de façon critique |

La catégorie répond à :

> **« Que voulez-vous faire? »**

---

## 7.2 Niveau

Utiliser les valeurs existantes :

```text
beginner
intermediate
advanced
```

Le niveau décrit la complexité d’utilisation du modèle, pas la difficulté du sujet fourni par l’utilisateur.

---

## 7.3 Contextes

Valeurs initiales :

```text
daily_life
work
studies
communication
creativity
```

Une fiche peut avoir plusieurs contextes.

Ils servent :

- de tags;
- de signal de découvrabilité;
- de donnée préparatoire à un futur filtre.

---

## 7.4 Types de résultat

Valeurs initiales :

```text
text
list
table
plan
checklist
questions
ideas
analysis
other
```

Cette propriété est principalement descriptive dans le MVP.

Elle ne nécessite pas un filtre public.

---

## 7.5 Taxonomie versionnée dans le code

Ne pas créer de tables administratives pour :

- catégories;
- contextes;
- types de résultat.

Le petit nombre de valeurs contrôlées justifie une configuration versionnée et testée dans le code.

Une administration de taxonomie pourra être évaluée seulement si l’usage réel démontre qu’elle est nécessaire.

---

# 8. Modèle de données fonctionnel

L’inspection doit confirmer les noms exacts et les conventions Supabase existantes.

Le besoin fonctionnel minimal est toutefois connu.

## 8.1 Entité spécialisée `prompts`

Une table ou structure spécialisée doit pouvoir conserver :

### Données éditoriales importées

```text
schema_version
content_type
language
title
summary
category
level
contexts
result_types
when_to_use
prompt_template
variables
tip
quick_template
caution
editorial_objective
thumbnail_metadata
keywords
seo
```

Les noms exacts de colonnes peuvent suivre la convention réelle du dépôt.

### Données techniques contrôlées par l’application

```text
id
slug
status
thumbnail_path
published_at
created_at
updated_at
```

Éventuellement :

```text
thumbnail_generated_at
```

uniquement si l’inspection confirme une utilité réelle.

---

## 8.2 Colonnes vs `jsonb`

Décision fonctionnelle recommandée :

### Colonnes directement interrogeables

```text
language
title
summary
category
level
when_to_use
prompt_template
tip
quick_template
caution
editorial_objective
slug
status
thumbnail_path
published_at
created_at
updated_at
```

### Structures potentiellement adaptées à `jsonb` ou tableaux

```text
contexts
result_types
variables
thumbnail metadata
keywords
seo
```

L’inspection doit confirmer ce qui correspond le mieux aux conventions du dépôt et aux besoins réels de requête.

Ne pas normaliser chaque variable dans une table enfant uniquement pour produire une architecture relationnelle plus « pure ».

---

## 8.3 RLS et visibilité

Règles minimales :

- lecture publique seulement des prompts publiés;
- brouillons invisibles publiquement;
- écriture administrative réservée à l’utilisateur autorisé;
- thumbnail d’un brouillon non exposé par une route publique générique;
- statut et slug contrôlés par l’application;
- aucun chemin fourni par le JSON appliqué directement.

---

# 9. Import JSON

## 9.1 Entrée

L’administration doit accepter au minimum :

```text
*.prompt.json
```

Le collage direct de JSON peut être ajouté seulement si une logique commune existe déjà et si cela ne duplique pas inutilement le code.

---

## 9.2 Comportement d’import

Lorsqu’un fichier valide est choisi :

1. lire le fichier;
2. confirmer que la racine est un objet;
3. extraire les propriétés reconnues;
4. ignorer les propriétés inconnues;
5. préserver les valeurs utilisables;
6. produire les avertissements;
7. analyser les placeholders;
8. vérifier les variables;
9. préparer l’exemple calculé;
10. demander confirmation si le formulaire contient déjà des données;
11. préremplir le formulaire;
12. ne rien enregistrer automatiquement;
13. ne rien publier automatiquement;
14. ne modifier aucun thumbnail existant.

---

## 9.3 Contrôles déterministes

L’administration doit pouvoir vérifier au minimum :

- `schemaVersion`;
- `contentType`;
- `language`;
- `category`;
- `level`;
- `contexts`;
- `resultTypes`;
- type de `variables`;
- format et unicité de `variables[].key`;
- placeholders du `promptTemplate`;
- placeholders du `quickTemplate`;
- variables utilisées mais non déclarées;
- variables déclarées mais inutilisées;
- exemples manquants;
- structure du bloc thumbnail;
- ratio thumbnail;
- propriétés techniques interdites;
- structure SEO;
- slug suggéré.

---

## 9.4 Erreur d’import

Si le fichier est :

- illisible;
- syntaxiquement invalide;
- ou possède une racine non objet;

alors :

- aucun champ n’est modifié;
- aucun thumbnail existant n’est supprimé;
- aucun statut n’est modifié;
- un message clair est affiché;
- l’édition manuelle reste disponible.

---

## 9.5 Réimportation

Une réimportation :

- demande confirmation avant de remplacer les données éditoriales;
- conserve `thumbnail_path`;
- ne supprime jamais un thumbnail existant;
- ne déclenche aucune génération d’image;
- ne modifie pas automatiquement `status`;
- ne modifie pas automatiquement `slug`;
- recalcule l’exemple à partir du nouveau template et des nouveaux exemples de variables.

---

# 10. Variables et génération de l’exemple

## 10.1 Convention des clés

Format recommandé :

```text
^[A-Z0-9]+(?:_[A-Z0-9]+)*$
```

Exemples :

```text
SUJET
OPTION_A
OPTION_B
MA_SITUATION
CRITERES
PUBLIC
```

---

## 10.2 Placeholders

Dans les templates :

```text
[KEY]
```

Exemple :

```text
Compare [OPTION_A] et [OPTION_B].
```

---

## 10.3 Exemple calculé

L’application construit l’exemple à partir de :

```text
prompt_template
+
variables[].example
```

La substitution :

- est littérale;
- s’effectue en une seule passe;
- n’interprète pas le contenu de l’exemple;
- ne relance pas une substitution sur un placeholder apparaissant dans un exemple.

---

## 10.4 Variables manquantes

### Placeholder non déclaré

Afficher un avertissement du type :

```text
[PUBLIC] est utilisé dans le prompt mais aucune variable PUBLIC n’est déclarée.
```

### Variable inutilisée

Afficher :

```text
CONTEXTE est déclaré mais n’est pas utilisé dans le prompt principal.
```

### Exemple absent

Afficher un avertissement.

L’exemple public peut être masqué si sa génération serait incomplète ou ambiguë.

Le prompt principal reste utilisable.

---

# 11. Administration des prompts

## 11.1 Navigation administrative

Ajouter une entrée spécialisée :

```text
Ressources IA
├── Infographies
├── Articles
└── Prompts
```

Ne pas créer une administration universelle de toutes les ressources dans ce MVP.

---

## 11.2 Liste administrative

Afficher au minimum :

- titre ou fallback `Prompt`;
- catégorie;
- niveau;
- langue;
- statut;
- présence ou absence de thumbnail si utile;
- date de modification;
- date de publication lorsqu’elle existe;
- actions Modifier, Supprimer et Prévisualiser/Voir selon le statut.

---

## 11.3 Formulaire

Organisation recommandée :

```text
1. Import JSON
2. Métadonnées générales
3. Classification
4. Quand l’utiliser
5. Prompt principal
6. Variables
7. Exemple calculé
8. Conseil
9. Version rapide
10. Limite / précision
11. Thumbnail
12. Objectif éditorial
13. Mots-clés
14. SEO
15. Avertissements
16. Enregistrement et publication
```

Le formulaire doit rester simple.

Il peut utiliser :

- champs texte;
- textarea;
- sélecteurs contrôlés;
- listes répétables simples;
- cartes ou lignes de variables;
- aperçu préformaté du prompt;
- aperçu de l’exemple;
- aperçu 16:9 du thumbnail.

Il ne doit pas devenir un éditeur de prompt visuel ou un constructeur de workflow.

---

## 11.4 Édition des variables

Pour chaque variable :

```text
Clé
Libellé
Description
Exemple
```

Fonctions minimales :

- ajouter;
- modifier;
- supprimer;
- réordonner seulement si l’interface existante le rend simple;
- signaler clé dupliquée;
- signaler clé invalide;
- signaler variable inutilisée;
- signaler placeholder manquant.

L’ordre d’affichage public suit de préférence l’ordre du tableau `variables`.

---

## 11.5 Aperçu administratif

L’aperçu doit montrer au minimum :

- titre;
- résumé;
- catégorie et niveau;
- thumbnail ou fallback;
- `whenToUse`;
- prompt principal;
- variables;
- exemple calculé;
- conseil;
- quickTemplate;
- caution.

L’aperçu doit utiliser autant que possible les mêmes composants de rendu que la page publique afin d’éviter deux comportements divergents.

---

## 11.6 Slug

Distinguer :

```text
seo.suggestedSlug
→ suggestion éditoriale

slug
→ valeur technique définitive
```

Le slug définitif doit être :

- normalisé;
- unique;
- modifiable avant publication;
- protégé contre les collisions;
- traité prudemment après publication selon les conventions existantes.

---

## 11.7 Enregistrement et publication

Offrir au minimum :

```text
Enregistrer le brouillon
Prévisualiser
Publier
Repasser en brouillon / retirer selon conventions existantes
Supprimer
```

Avant publication, afficher les avertissements encore présents.

Les avertissements éditoriaux ne doivent pas automatiquement bloquer la publication, sauf contrainte technique minimale explicitement retenue par l’application.

---

# 12. Thumbnail des prompts

## 12.1 Rôle

Le thumbnail est une **couverture de catalogue 16:9**.

Il doit :

- évoquer l’action du prompt;
- rester lisible dans une petite carte;
- contribuer à l’uniformité visuelle de Ressources IA;
- pouvoir servir comme image sociale;
- conserver une identité propre à la fiche.

Il ne doit pas :

- reproduire le prompt complet;
- reproduire toutes les variables;
- devenir une mini-infographie;
- contenir un paragraphe;
- contenir du microtexte;
- remplir l’image de logos d’assistants IA;
- inventer un fait ou un chiffre.

Exemples de direction :

```text
Expliquer un concept simplement
→ une idée complexe qui devient claire

Comparer deux options
→ deux choix mis en balance selon quelques critères

Transformer des notes en plan
→ éléments dispersés qui deviennent structurés

Vérifier une réponse
→ contenu examiné avec une loupe ou une grille
```

Le visuel doit représenter **l’action**, pas systématiquement un robot ou une interface de chatbot.

---

## 12.2 Format

Format de référence :

```text
16:9
```

Dimension cible recommandée après normalisation :

```text
1280 × 720 px
```

La dimension exacte doit suivre les helpers et conventions déjà utilisés si une autre taille 16:9 est retenue dans le dépôt.

---

## 12.3 Métadonnées éditoriales

Le contrat fournit :

```text
thumbnail.altText
thumbnail.generationBrief
thumbnail.preferredAspectRatio
```

Le fichier réel reste contrôlé par l’application.

---

## 12.4 Données techniques

Ajouter conceptuellement à l’entité Prompt :

```text
thumbnail_path text null
```

Évaluer seulement si utile :

```text
thumbnail_generated_at timestamptz null
```

Ne pas ajouter un historique de versions dans le MVP.

---

## 12.5 Stockage

Réutiliser de préférence l’infrastructure existante de thumbnails.

Forme conceptuelle :

```text
thumbnails/prompts/{promptId}/{uniqueName}.webp
```

La convention réelle du dépôt a priorité.

Ne pas créer un nouveau bucket uniquement pour les prompts si le stockage existant peut être réutilisé proprement.

---

## 12.6 Upload manuel

L’upload manuel fait partie de la fondation du MVP.

Il permet :

- d’utiliser une image produite dans ChatGPT ou un autre outil;
- de lancer la bibliothèque sans dépendre d’un endpoint de génération;
- de remplacer un résultat généré insatisfaisant;
- de conserver un fallback opérationnel si le générateur est indisponible.

Formats à confirmer après inspection :

```text
PNG
JPEG
WebP
```

Fonctions :

- téléverser;
- prévisualiser;
- remplacer;
- supprimer;
- rétablir le fallback.

---

## 12.7 Remplacement sûr

Séquence recommandée :

```text
1. valider le nouveau fichier
2. téléverser sous un nouveau chemin
3. mettre à jour thumbnail_path
4. actualiser l’aperçu
5. supprimer l’ancien fichier en meilleur effort
```

Ne jamais supprimer l’ancien thumbnail avant que le nouveau soit utilisable.

---

## 12.8 Fallback

Si aucun thumbnail n’existe :

```text
carte
→ fallback Prompt 5PennyAi

partage social
→ fallback social 5PennyAi
```

L’absence de thumbnail :

- ne bloque pas l’enregistrement;
- ne bloque pas la publication;
- ne masque pas la fiche;
- ne doit pas produire une carte vide.

---

# 13. Génération intégrée du thumbnail — décision conditionnelle

Le modèle de données et le contrat doivent permettre la génération intégrée, mais la bibliothèque ne doit pas dépendre de cette capacité pour son lancement.

## 13.1 Principe

Flux possible :

```text
Prompt enregistré
→ cliquer Générer le thumbnail
→ récupérer les données réelles côté serveur
→ construire le prompt visuel
→ générer une image 16:9
→ vérifier
→ stocker
→ afficher
```

---

## 13.2 Données serveur utiles

Le serveur peut utiliser :

```text
title
summary
category
editorialObjective
thumbnail.generationBrief
thumbnail.preferredAspectRatio
```

Éventuellement :

```text
whenToUse
keywords
```

si cela améliore la pertinence sans surcharger le contexte.

Ne pas transmettre inutilement :

- l’intégralité du `promptTemplate`;
- toutes les variables;
- le SEO;
- le slug;
- les chemins de stockage;
- les données administratives.

---

## 13.3 Entrée client

Entrée minimale recommandée :

```json
{
  "promptId": "uuid"
}
```

Le client ne transmet pas :

- le prompt d’image;
- le titre arbitraire;
- le brief arbitraire;
- le chemin du thumbnail;
- le modèle;
- une URL de stockage.

Le serveur récupère les données réelles.

---

## 13.4 Réutilisation de l’infrastructure existante

L’inspection doit déterminer s’il est préférable :

- d’étendre proprement le générateur de thumbnails existant avec un mode spécialisé;
- ou de créer un petit endpoint `generate-prompt-thumbnail`.

Une extraction partagée minimale est permise.

Ne pas transformer tous les générateurs d’images en système universel disproportionné.

---

## 13.5 Direction visuelle

Le générateur doit reprendre les leçons de la direction thumbnail v3 :

- couverture de catalogue, pas mini-fiche;
- très peu de texte;
- pas de série ni épisode;
- pas de source ou URL;
- pas de logo généré;
- pas de filigrane;
- pas de microtexte;
- composition réellement 16:9;
- liberté de composition;
- variété entre les fiches;
- cohérence de palette et de niveau de finition.

---

## 13.6 Condition d’inclusion dans le MVP

L’upload manuel est obligatoire pour le MVP 6.0.

La génération intégrée est incluse seulement si l’inspection confirme qu’elle peut être ajoutée en réutilisant l’infrastructure actuelle sans complexité disproportionnée.

Si elle est reportée :

- le contrat reste inchangé;
- `generationBrief` reste utilisable à l’extérieur;
- la bibliothèque peut être clôturée avec l’upload manuel;
- une évolution mineure ultérieure pourra ajouter le bouton Générer.

---

# 14. Page publique d’un prompt

## 14.1 Route

Forme fonctionnelle envisagée :

```text
/ressources-ia/prompts/{slug}
```

La convention réelle du routeur a priorité.

---

## 14.2 En-tête

Afficher selon les données disponibles :

```text
Ressources IA · Prompt
Catégorie
Niveau
Titre
Résumé
Contextes
Thumbnail, si la composition retenue le justifie
Actions de partage
```

Le thumbnail ne doit pas repousser inutilement l’action principale de la fiche.

Sur desktop, une disposition texte + visuel peut être évaluée.

Sur mobile, préserver d’abord :

- titre;
- résumé;
- prompt;
- action Copier.

---

## 14.3 Ordre recommandé

```text
En-tête
→ Quand l’utiliser
→ Prompt principal
→ Copier le prompt
→ À personnaliser
→ Exemple rempli
→ Conseil
→ Version rapide facultative
→ Limite facultative
→ Ressources connexes facultatives
→ Partage / retour Ressources IA selon la composition retenue
```

---

## 14.4 Prompt principal

Afficher dans un bloc préformaté :

- texte sélectionnable;
- retours de ligne préservés;
- largeur confortable;
- scroll local seulement si nécessaire;
- aucune exécution HTML;
- aucun rendu arbitraire de code.

Action principale :

```text
Copier le prompt
```

Après succès :

```text
Prompt copié
```

---

## 14.5 À personnaliser

Afficher les variables dans un format lisible :

```text
[OPTION_A]
Première option
La première possibilité que vous voulez comparer.
Exemple : Louer une voiture
```

Le rendu exact peut être :

- liste;
- petites cartes;
- tableau responsive.

La lisibilité mobile a priorité sur la densité.

---

## 14.6 Exemple rempli

Calculer l’exemple depuis le modèle et les exemples de variables.

L’exemple doit :

- utiliser le même style préformaté;
- être clairement identifié comme exemple;
- ne pas être stocké séparément;
- être masqué si la substitution ne peut pas produire un résultat cohérent.

Une action de copie de l’exemple n’est pas requise dans le MVP.

---

## 14.7 Version rapide

Si `quickTemplate` existe :

- afficher une section `Version rapide`;
- afficher une action `Copier`;
- utiliser le même système de Clipboard et fallback;
- ne pas afficher une section vide lorsqu’elle est absente.

---

## 14.8 Limite

Si `caution` existe :

- afficher un bloc discret;
- ne pas transformer toutes les fiches en avertissement;
- conserver un ton pédagogique;
- éviter une présentation alarmiste.

---

## 14.9 Fallbacks publics

| Valeur absente | Comportement |
|---|---|
| `title` | afficher `Prompt` |
| `summary` | masquer |
| `category` | afficher seulement `Prompt` |
| `level` | masquer |
| `contexts` | masquer |
| `whenToUse` | masquer la section |
| `promptTemplate` | message neutre; masquer Copier |
| `variables` | masquer `À personnaliser` si vide |
| exemples incomplets | masquer l’exemple rempli |
| `tip` | masquer |
| `quickTemplate` | masquer |
| `caution` | masquer |
| thumbnail réel | fallback Prompt 5PennyAi |
| `seo.seoTitle` | utiliser `title` |
| `seo.metaDescription` | utiliser `summary` |

Aucune valeur manquante ne doit produire un espace vide ou une erreur non gérée.

---

# 15. Copie du prompt

## 15.1 Action principale

La copie est un comportement central du format Prompt.

L’application doit utiliser le mécanisme existant de Clipboard lorsque possible.

Flux :

```text
clic
→ copier promptTemplate
→ confirmer Prompt copié
```

---

## 15.2 Fallback

Si l’API Clipboard est indisponible ou refusée :

- conserver le texte visible;
- permettre sa sélection;
- utiliser le fallback existant du site si disponible;
- afficher une instruction courte de copie manuelle;
- ne pas altérer le prompt;
- ne pas déclencher une requête réseau.

---

## 15.3 Accessibilité

Le statut :

```text
Prompt copié
Impossible de copier automatiquement
```

 doit être annoncé au moyen du mécanisme accessible déjà utilisé par le site, par exemple une zone `aria-live` ou un composant de statut commun.

---

## 15.4 Pas de copie personnalisée dans la v1

Le bouton copie exactement :

```text
promptTemplate
```

avec ses placeholders.

La personnalisation directe dans le site est reportée.

---

# 16. Carte Prompt dans le catalogue

## 16.1 Rôle

La carte doit être immédiatement reconnaissable comme une ressource à utiliser.

Structure conceptuelle :

```text
[Thumbnail 16:9 ou fallback]

PROMPT · CATÉGORIE

Titre
Résumé

Débutant
Contextes facultatifs

Voir le prompt
```

---

## 16.2 Thumbnail

Le thumbnail peut utiliser :

```text
alt=""
```

si le titre et l’information utile sont déjà annoncés immédiatement dans la carte et si l’image est décorative dans ce contexte.

La page détaillée peut utiliser le `thumbnail.altText` selon la fonction réelle du visuel.

---

## 16.3 Action

Action recommandée :

```text
Voir le prompt
```

Ne pas ajouter `Copier` directement dans la carte dans le MVP initial.

La fiche doit d’abord permettre à l’utilisateur de comprendre ce qu’il copie.

---

# 17. Intégration au catalogue et aux filtres

## 17.1 Modèle public commun

Adapter les prompts publiés vers le modèle de catalogue existant.

Forme conceptuelle :

```text
id
contentType = prompt
title
summary
level
publishedAt
thumbnailUrl
publicUrl
category
contexts
```

Aucune table universelle n’est requise.

---

## 17.2 Tri

Dans la vue générale :

```text
published_at décroissant
```

Le format Prompt ne modifie pas la règle générale.

---

## 17.3 Catégorie

Le filtre Catégorie est pertinent seulement pour les prompts.

Comportement recommandé :

```text
format != prompt
→ ne pas afficher le filtre Catégorie

format = prompt
→ afficher les catégories
```

Une valeur invalide dans l’URL est nettoyée selon les conventions existantes.

---

## 17.4 Niveau

Le niveau reste combinable avec la catégorie en logique AND.

Exemple :

```text
format=prompt
AND
categorie=write
AND
niveau=beginner
```

---

## 17.5 Recherche

La recherche demeure combinable avec les filtres.

Exemple :

```text
format=prompt
categorie=decide
q=voiture
```

---

## 17.6 Sujet et Série

Les prompts n’appartiennent pas à la taxonomie Sujet ni aux séries dans le MVP v1.

Lorsque le format Prompt est sélectionné :

- masquer ces filtres;
- retirer proprement leurs paramètres incompatibles lorsque nécessaire;
- éviter un état vide incompréhensible causé uniquement par une combinaison impossible.

---

# 18. Recherche interne

## 18.1 Champs recommandés

Inclure au minimum :

```text
title
summary
category
contexts
keywords
```

Le moteur existant peut aussi inclure `whenToUse` si les essais montrent que cela améliore la pertinence.

---

## 18.2 `promptTemplate`

Ne pas inclure automatiquement tout le prompt dans l’index initial.

Raison :

- répétition de formulations génériques;
- bruit;
- nombreuses occurrences de mots comme « explique », « indique », « présente »;
- risque de dégrader la pertinence des résultats.

Les mots-clés éditoriaux doivent servir à améliorer la découvrabilité sans dépendre du corps complet du template.

---

## 18.3 Normalisation

Réutiliser les conventions actuelles :

- casse;
- accents;
- espaces;
- multi-termes;
- logique AND lorsque prévue;
- état de la recherche dans l’URL.

Ne pas créer un moteur de recherche spécial uniquement pour les prompts.

---

# 19. Séries, kits et parcours

## 19.1 Séries

Les prompts v1 ne participent pas aux séries existantes.

Ils ne doivent pas :

- compter comme épisode;
- apparaître dans la vue Séries;
- modifier le nombre d’épisodes;
- participer à la navigation précédent/suivant d’une série.

---

## 19.2 Kits et parcours

Des regroupements futurs peuvent être utiles :

```text
Kit — Mieux écrire avec l’IA
Kit — Prompts pour les études
Parcours — Bien débuter avec l’IA
```

Ils sont volontairement reportés.

Ne pas simuler ces fonctions dans le MVP avec une propriété `series`, `collection` ou `kit` non définie.

---

# 20. Partage public

## 20.1 Principe

Une fiche Prompt est une ressource publique partageable comme un article ou une infographie.

Elle doit pouvoir utiliser le composant de partage public existant.

Actions :

```text
Partager
Copier le lien
```

---

## 20.2 Distinction essentielle

```text
Copier le prompt
→ promptTemplate

Copier le lien
→ URL canonique de la fiche
```

Les deux actions doivent être visuellement et sémantiquement distinctes.

---

## 20.3 Web Share

Réutiliser le mécanisme existant :

```text
navigator.share
→ lorsqu’il est disponible

Copier le lien
→ fallback permanent
```

Ne pas créer une deuxième logique de partage spécifique au format Prompt.

---

# 21. SEO et métadonnées sociales

## 21.1 Suggestions éditoriales

Le JSON fournit :

```text
seo.primaryQuery
seo.secondaryQueries
seo.seoTitle
seo.metaDescription
seo.suggestedSlug
seo.internalLinkSuggestions
```

L’application contrôle :

```text
slug définitif
canonical
robots
publishedAt
updatedAt
URL réelle du thumbnail
Open Graph
sitemap
données structurées
```

---

## 21.2 Métadonnées de page

Produire selon les conventions du site :

- `<title>`;
- meta description;
- canonical;
- Open Graph;
- convention Twitter/X Card existante si elle est déjà utilisée;
- langue de la page;
- image sociale.

Fallbacks :

```text
seo.seoTitle absent
→ title

seo.metaDescription absente
→ summary

thumbnail absent
→ image sociale 5PennyAi par défaut
```

---

## 21.3 Image sociale

Priorité :

```text
thumbnail du prompt
→ fallback social 5PennyAi
```

L’URL doit suivre les règles existantes :

- absolue;
- accessible sans session pour une ressource publiée;
- stable pour les crawlers;
- jamais issue d’un brouillon exposé publiquement.

---

## 21.4 Données structurées

Ne pas présenter artificiellement une fiche Prompt comme un `Article` ou un `HowTo` uniquement pour obtenir un type enrichi.

L’inspection doit retenir le schéma le plus simple et fidèle aux conventions du site, avec au minimum le fil d’Ariane lorsque cette fondation existe déjà.

Aucun changement de framework ou refonte SSR n’est justifié uniquement pour ce format.

---

## 21.5 Sitemap

Inclure seulement les prompts publiés.

Exclure :

- brouillons;
- ressources retirées;
- slugs non publics.

---

# 22. Sécurité et intégrité

Règles minimales :

- prompt public récupéré uniquement parmi les ressources publiées;
- brouillons invisibles;
- contenu du prompt traité comme texte, jamais comme HTML exécutable;
- aucune propriété technique du JSON appliquée directement;
- chemins de stockage contrôlés par l’application;
- upload réservé à l’administration;
- génération de thumbnail réservée à l’administration si elle est implantée;
- clé fournisseur côté serveur;
- client de génération limité à `promptId` si génération intégrée;
- aucun prompt d’image libre envoyé par le client;
- aucun chemin de stockage arbitraire accepté;
- aucun modèle IA public appelé lors de la consultation ou de la copie d’une fiche;
- aucune donnée personnelle collectée par la fonction Copier.

---

# 23. Gestion des erreurs

## Import échoué

- formulaire inchangé;
- thumbnail inchangé;
- message clair;
- nouvelle tentative possible.

## Placeholder inconnu

- avertissement administratif;
- prompt conservé;
- aucune variable inventée.

## Variable inutilisée

- avertissement;
- aucune suppression automatique.

## Exemple incomplet

- avertissement;
- masquer l’exemple public si nécessaire;
- prompt principal conservé.

## Copie échouée

- texte toujours visible;
- fallback manuel;
- aucune modification de la fiche.

## Thumbnail manquant

- fallback;
- aucune erreur bloquante.

## Upload thumbnail échoué

- ancien thumbnail conservé;
- aucune référence invalide;
- reste du formulaire utilisable.

## Génération thumbnail échouée

- ancien thumbnail conservé;
- fallback conservé si aucun thumbnail n’existait;
- statut du prompt inchangé;
- nouvelle tentative possible.

## Prompt public inconnu

- 404 ou page non disponible;
- aucune fuite de données administratives.

---

# 24. Performance et accessibilité

## 24.1 Catalogue

- thumbnail 16:9 optimisé;
- `loading="lazy"` pour les cartes non prioritaires selon les conventions existantes;
- pas de chargement d’un asset lourd inutile;
- fallback léger.

---

## 24.2 Page détaillée

Le prompt doit rester confortable à lire et sélectionner sur mobile.

- largeur de texte maîtrisée;
- bloc préformaté responsive;
- pas de débordement horizontal global;
- scroll local si nécessaire;
- taille de texte lisible.

---

## 24.3 Clavier

Doivent être utilisables au clavier :

- navigation vers la fiche;
- Copier le prompt;
- Copier la version rapide;
- Partager lorsque disponible;
- Copier le lien;
- actions administratives.

---

## 24.4 Focus

Tous les boutons doivent conserver un focus visible.

Les tags ou filtres interactifs doivent suivre les conventions accessibles du catalogue actuel.

---

## 24.5 Statuts dynamiques

Les messages :

```text
Prompt copié
Lien copié
Erreur de copie
Thumbnail téléversé
Génération échouée
```

 doivent être annoncés de manière accessible sans provoquer de déplacement important de mise en page.

---

# 25. Banc d’essai initial

Utiliser au minimum les quatre prototypes déjà conçus :

```text
1. Expliquer un concept simplement
2. Produire un premier brouillon
3. Comparer deux options selon mes critères
4. Identifier ce qui devrait être vérifié dans une réponse de l’IA
```

Ils couvrent :

- peu de variables;
- plusieurs variables;
- exemples multiligne;
- résultat texte;
- résultat tableau;
- analyse;
- checklist;
- quickTemplate;
- caution;
- usage très grand public;
- usage spécifique à la fiabilité de l’IA.

Avant clôture, intégrer les **20 prompts initiaux** retenus pour le lancement.

---

# 26. Découpage du développement

Le MVP 6.0 est découpé en **cinq incréments fonctionnels**, précédés d’une inspection ciblée.

```text
Inspection
→ données / administration / upload thumbnail
→ fiche publique et copie
→ catalogue / catégories / recherche
→ génération intégrée du thumbnail [conditionnelle]
→ SEO / partage / 20 prompts / finalisation
```

---

## Incrément 0 — Inspection ciblée

### Objectif

Confirmer l’architecture réelle après les évolutions actuelles de Ressources IA et ajuster le périmètre technique des incréments suivants.

### Documents à lire

```text
GUIDE_DEVELOPPEMENT_MVP_6_0_BIBLIOTHEQUE_PROMPTS_RESSOURCES_IA.md
CONTRAT_JSON_PROMPTS_5PENNYAI_V1.md
GUIDE_DEVELOPPEMENT_MVP_2_0_ARTICLES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_1_2_THUMBNAILS_RESSOURCES_IA.md
CONCEPTION_GENERATEUR_THUMBNAILS_V3.md
GUIDE_DEVELOPPEMENT_MVP_3_1_PARTAGE_SOCIAL_PUBLIC_RESSOURCES_IA.md
```

### À inspecter

- état Git, branche, remotes et derniers commits;
- état réel de Ressources IA;
- structure actuelle de `articles`;
- structure actuelle de `infographics`;
- table `resource_series`;
- filtres publics actuels;
- recherche et normalisation;
- gestion des paramètres d’URL;
- modèle public commun des cartes;
- composants `ArticleCard` / `InfographicCard` ou équivalents;
- routeur public;
- pages détaillées;
- composant de partage public;
- implémentation du presse-papiers;
- système de toasts/statuts accessibles;
- administration articles et infographies;
- patterns d’import JSON;
- validation permissive existante;
- conventions de formulaire;
- RLS;
- migrations Supabase;
- bucket(s) de thumbnails;
- upload/remplacement/suppression de thumbnails;
- endpoint actuel de génération de thumbnails;
- client image actuel;
- stratégie 16:9 réelle;
- helpers de normalisation WebP;
- métadonnées Open Graph;
- sitemap;
- traductions FR/EN;
- tests existants;
- scripts build/lint.

### Questions à résoudre

1. Quelle structure minimale utiliser pour `prompts`?
2. Quels champs doivent être des colonnes ou du `jsonb`?
3. Quel import JSON existant peut être réutilisé?
4. Comment centraliser l’analyse des placeholders?
5. Comment construire l’exemple rempli sans duplication?
6. Quel composant de carte doit être spécialisé pour les prompts?
7. Comment intégrer `format=prompt` au catalogue actuel?
8. Comment masquer/normaliser Sujet et Série lorsque Prompt est sélectionné?
9. Quel nom de paramètre URL utiliser pour la catégorie?
10. Quels champs de prompts intégrer à la recherche actuelle?
11. Quel bucket et quels helpers réutiliser pour `thumbnail_path`?
12. L’upload manuel peut-il réutiliser directement le pipeline de thumbnail existant?
13. Le générateur de thumbnail actuel peut-il être étendu simplement à une ressource sans image source?
14. Faut-il un endpoint spécialisé pour les thumbnails de prompts?
15. La génération intégrée doit-elle être dans le MVP ou reportée?
16. Quel fallback visuel Prompt utiliser?
17. Comment intégrer le thumbnail au partage social?
18. Quel renderer public existant peut servir de base?
19. Comment réutiliser `ResourceShareActions` ou équivalent?
20. Une migration autre que la table `prompts` est-elle nécessaire?

### Décisions attendues

Le rapport doit préciser :

- état réel du dépôt;
- schéma exact proposé;
- migration proposée;
- RLS;
- stockage des thumbnails;
- stratégie d’upload;
- stratégie de fallback;
- stratégie de génération intégrée et décision incluse/reportée;
- fonctions à réutiliser;
- composants à créer ou adapter;
- paramètres URL;
- stratégie de recherche;
- stratégie de rendu public;
- stratégie de partage;
- risques;
- liste exacte des fichiers à modifier dans l’incrément 1.

### Résultat visible

Aucun changement public ou administratif.

### Hors périmètre

- aucune modification de code;
- aucune migration;
- aucun appel réel au modèle;
- aucun upload réel;
- aucune dépendance;
- aucun commit;
- aucun push.

### Critères d’acceptation

- l’état réel du catalogue est documenté;
- les points de réutilisation sont identifiés;
- la structure `prompts` est cadrée;
- l’import est cadré;
- le thumbnail est cadré;
- la décision sur la génération intégrée est explicite;
- le périmètre de l’incrément 1 est précis;
- aucune abstraction générique inutile n’est proposée.

---

## Incrément 1 — Fondation des prompts, import, brouillons et thumbnail manuel

### Objectif

Pouvoir importer ou créer un prompt, corriger ses données, enregistrer un brouillon et lui associer un thumbnail 16:9 produit à l’extérieur.

### Inclus

- migration initiale `prompts`;
- contraintes et index strictement nécessaires;
- RLS administrative et protection publique;
- entrée `Prompts` dans l’administration;
- liste administrative;
- formulaire Ajouter/Modifier;
- import `.prompt.json`;
- import permissif conforme au contrat;
- confirmation avant remplacement d’un formulaire rempli;
- champs pour toutes les propriétés reconnues;
- taxonomies contrôlées;
- gestion des variables;
- analyse des placeholders;
- avertissements déterministes;
- génération de l’exemple rempli;
- aperçu administratif minimal;
- slug suggéré distinct du slug définitif;
- sauvegarde du brouillon;
- modification;
- suppression;
- stockage `thumbnail_path`;
- upload manuel 16:9;
- prévisualisation du thumbnail;
- remplacement;
- suppression;
- fallback administratif;
- conservation du thumbnail lors d’une réimportation;
- traductions FR/EN nécessaires;
- tests ciblés.

### Résultat visible

> Christian importe un fichier `.prompt.json`, voit le modèle, ses variables, les avertissements et l’exemple calculé, enregistre un brouillon, puis téléverse un thumbnail 16:9 sans modifier le JSON.

### Hors périmètre

- page publique définitive;
- publication publique;
- intégration au catalogue;
- filtre Catégorie public;
- génération intégrée du thumbnail;
- personnalisation interactive;
- SEO public final;
- kits et séries.

### Critères d’acceptation

- `{}` est importable;
- un JSON partiel est importable;
- un JSON complet préremplit le formulaire;
- une propriété inconnue est ignorée;
- une valeur contrôlée inconnue produit un avertissement;
- un JSON invalide ne modifie pas le formulaire;
- une réimportation demande confirmation;
- le brouillon peut être sauvegardé et rouvert;
- un placeholder inconnu est signalé;
- une variable inutilisée est signalée;
- une clé dupliquée est signalée;
- une clé invalide est signalée;
- l’exemple rempli correspond aux `variables[].example`;
- la substitution n’est pas récursive;
- le thumbnail peut être téléversé, remplacé et supprimé;
- une réimportation conserve le thumbnail;
- un upload échoué conserve l’ancien thumbnail;
- aucun brouillon n’est publiquement accessible;
- le build et les tests ciblés réussissent.

### Tests recommandés

- objet vide;
- import partiel;
- JSON invalide;
- racine non objet;
- propriété inconnue;
- catégorie inconnue;
- contexte inconnu;
- résultat inconnu;
- variable valide;
- variable dupliquée;
- variable inutilisée;
- placeholder inconnu;
- exemple multiligne;
- substitution non récursive;
- quickTemplate avec variable inconnue;
- thumbnail upload valide;
- thumbnail invalide;
- remplacement;
- suppression;
- réimportation avec thumbnail existant.

### Vérification manuelle

Utiliser les quatre prototypes et vérifier :

- formulaire desktop;
- formulaire tablette;
- environ 390 px;
- import;
- correction manuelle;
- brouillon;
- thumbnail;
- réimportation.

---

## Incrément 2 — Page publique, rendu et copie

### Objectif

Publier un prompt et permettre au visiteur de comprendre le modèle et de le copier facilement.

### Inclus

- route publique `/ressources-ia/prompts/{slug}` ou équivalent;
- récupération par slug;
- action Publier;
- date de publication;
- exclusion des brouillons;
- 404/non disponible;
- en-tête spécialisé;
- catégorie;
- niveau;
- contextes;
- thumbnail ou fallback;
- `whenToUse`;
- bloc prompt préformaté;
- `Copier le prompt`;
- fallback Clipboard;
- statut accessible;
- liste des variables;
- exemple rempli;
- conseil;
- version rapide facultative;
- copie de la version rapide;
- caution facultative;
- aperçu administratif utilisant le même renderer lorsque possible;
- responsive;
- accessibilité;
- métadonnées HTML minimales;
- tests ciblés.

### Résultat visible

> Un prompt publié peut être ouvert à son URL, compris rapidement et copié avec ses placeholders. Les variables et l’exemple calculé expliquent comment le personnaliser.

### Hors périmètre

- catalogue général;
- filtre Prompts;
- filtre Catégorie;
- personnalisation interactive;
- génération de thumbnail;
- kits;
- favoris;
- SEO final et sitemap.

### Critères d’acceptation

- seul un prompt publié est accessible;
- un slug inconnu retourne un état propre;
- le prompt est affiché comme texte sécurisé;
- le HTML présent dans un template n’est jamais exécuté;
- les retours de ligne sont préservés;
- Copier le prompt copie exactement le template;
- le fallback de copie reste utilisable;
- la version rapide est copiable lorsqu’elle existe;
- une fiche sans quickTemplate n’affiche pas de section vide;
- une fiche sans caution n’affiche pas de section vide;
- les variables sont lisibles sur mobile;
- l’exemple est calculé et non stocké séparément;
- un exemple incomplet peut être masqué proprement;
- le thumbnail absent utilise le fallback;
- aucun objectif éditorial ou chemin de stockage n’est public;
- le rendu fonctionne à 1440, 768 et environ 390 px;
- le build et les tests ciblés réussissent.

### Tests recommandés

- prompt publié;
- brouillon inaccessible;
- slug inconnu;
- prompt sans variables;
- prompt avec plusieurs variables;
- variable multiligne;
- quickTemplate présent/absent;
- caution présente/absente;
- Clipboard disponible;
- Clipboard refusé;
- thumbnail présent/absent;
- HTML ou script comme texte du prompt;
- navigation clavier.

---

## Incrément 3 — Catalogue, catégories, recherche et filtres

### Objectif

Faire des prompts des ressources de premier niveau dans le catalogue Ressources IA.

### Inclus

- adaptateur public Prompt;
- chargement conjoint des prompts publiés avec les autres ressources;
- filtre de format `Prompts`;
- état du format dans l’URL;
- carte Prompt spécialisée;
- thumbnail ou fallback dans la carte;
- libellé `Prompt · Catégorie`;
- niveau;
- contextes facultatifs;
- action `Voir le prompt`;
- mode/en-tête Bibliothèque de prompts lorsque `format=prompt`;
- contrôle `Que voulez-vous faire?`;
- filtre Catégorie;
- état Catégorie dans l’URL;
- combinaison catégorie + niveau + recherche;
- recherche sur les champs retenus;
- normalisation des paramètres incompatibles Sujet/Série;
- états vide, chargement et erreur;
- traductions FR/EN;
- tests ciblés.

### Résultat visible

> Le visiteur peut filtrer Ressources IA sur Prompts, choisir ce qu’il veut faire, rechercher un besoin et ouvrir une fiche adaptée.

### Hors périmètre

- filtre par contexte;
- filtre par type de résultat;
- série Prompt;
- kits;
- parcours;
- copie directement depuis la carte;
- personnalisation interactive;
- génération intégrée du thumbnail si elle est prévue à l’incrément suivant.

### Critères d’acceptation

- `Prompts` apparaît seulement lorsqu’au moins un prompt public existe selon la convention du catalogue;
- les prompts et autres formats utilisent le même tri général par publication;
- une carte Prompt est visuellement distincte mais cohérente;
- la catégorie est visible;
- `format=prompt` affiche le contrôle Catégorie;
- Sujet et Série ne créent pas de combinaisons incohérentes avec Prompt;
- les paramètres incompatibles sont nettoyés selon les règles retenues;
- catégorie + niveau + recherche utilisent une logique AND;
- Retour/Avancer restaurent l’état;
- les URL sont partageables;
- les contextes peuvent être affichés sans devenir un filtre;
- `promptTemplate` n’est pas nécessairement inclus dans la recherche;
- aucun brouillon n’entre dans le catalogue;
- le build et les tests ciblés réussissent.

### Tests recommandés

- fusion de trois formats;
- filtre Prompt;
- catégorie valide;
- catégorie invalide;
- catégorie + niveau;
- catégorie + q;
- q multi-termes;
- changement Prompt → Article;
- nettoyage de `categorie`;
- Prompt avec `serie` dans URL;
- Prompt avec `sujet` dans URL;
- contextes affichés;
- thumbnail/fallback;
- exclusion des brouillons.

### Vérification manuelle

Tester :

- catalogue mixte;
- vue Prompts;
- au moins quatre catégories;
- recherche;
- niveau;
- Retour/Avancer;
- partage d’une URL filtrée;
- 1440, 768 et environ 390 px.

---

## Incrément 4 — Génération intégrée du thumbnail [conditionnel]

### Objectif

Si l’inspection confirme un chemin simple, permettre de générer et régénérer un thumbnail de Prompt directement depuis l’administration.

### Condition

Cet incrément n’est réalisé dans le MVP 6.0 que si l’inspection confirme que l’infrastructure actuelle permet une implantation ciblée et raisonnable.

Sinon, il est reporté sans bloquer la clôture du MVP, puisque l’upload manuel et `thumbnail.generationBrief` couvrent déjà le besoin fonctionnel.

### Inclus si retenu

- endpoint authentifié spécialisé ou mode contrôlé;
- entrée minimale `{ promptId }`;
- récupération serveur des données réelles;
- prompt visuel versionné;
- style de couverture 16:9;
- génération d’une seule image;
- validation du résultat;
- normalisation 16:9;
- conversion WebP si conventions existantes;
- stockage sous nouveau chemin;
- mise à jour sûre de `thumbnail_path`;
- conservation de l’ancien thumbnail lors d’un échec;
- nettoyage de l’ancien fichier en meilleur effort;
- `Générer le thumbnail`;
- `Régénérer le thumbnail`;
- maintien de l’upload manuel;
- états de chargement;
- erreurs;
- journalisation minimale;
- tests ciblés sans appel réel au modèle;
- essais réels sur plusieurs catégories.

### Résultat visible

> Christian peut générer un thumbnail horizontal à partir d’une fiche Prompt enregistrée, le vérifier dans l’administration et le voir dans le catalogue.

### Hors périmètre

- génération automatique à l’import;
- génération automatique à la publication;
- génération en lot;
- plusieurs variantes;
- historique;
- choix de modèle;
- prompt libre;
- éditeur graphique;
- image distincte par langue;
- analyse automatique de qualité.

### Critères d’acceptation fonctionnels

- bouton disponible seulement pour un prompt enregistré;
- utilisateur non autorisé refusé;
- données réelles récupérées côté serveur;
- aucun prompt d’image libre fourni par le client;
- une seule image générée;
- résultat final réellement en 16:9;
- l’ancien thumbnail est conservé lors d’un échec;
- upload manuel continue de fonctionner;
- supprimer le thumbnail rétablit le fallback;
- le contenu éditorial et le statut restent inchangés;
- aucun brouillon n’est exposé publiquement.

### Critères d’acceptation visuels

Tester au minimum :

```text
Comprendre
Écrire
Décider
Vérifier
```

Les thumbnails retenus doivent :

- fonctionner à petite taille;
- représenter l’action du prompt;
- éviter les robots génériques répétés;
- éviter le microtexte;
- éviter les paragraphes;
- éviter les URL et sources;
- éviter les logos générés;
- remplir le 16:9;
- conserver une cohérence avec Ressources IA;
- présenter suffisamment de variété entre les catégories.

---

## Incrément 5 — SEO, partage, 20 prompts pilotes et finalisation

### Objectif

Finaliser l’intégration du format Prompt, valider la qualité de la bibliothèque initiale et rendre les pages prêtes pour l’indexation et le partage.

### Inclus

- titre SEO;
- meta description;
- canonical;
- Open Graph;
- thumbnail comme image sociale;
- fallback social;
- données structurées fidèles aux conventions retenues;
- sitemap;
- exclusion des brouillons;
- intégration au composant public `Partager / Copier le lien`;
- distinction entre `Copier le prompt` et `Copier le lien`;
- vérification responsive;
- vérification clavier;
- vérification des statuts accessibles;
- vérification du poids des thumbnails;
- petites corrections UX liées au MVP;
- import et publication des 20 prompts initiaux;
- vérification des catégories;
- vérification des contextes;
- vérification des niveaux;
- vérification des exemples;
- vérification des thumbnails ou fallbacks;
- build;
- lint ciblé;
- tests ciblés;
- documentation des limites restantes.

### Résultat visible

> La bibliothèque initiale propose environ 20 modèles pratiques, filtrables par besoin, faciles à comprendre et à copier, avec une identité visuelle cohérente dans Ressources IA.

### Hors périmètre

- personnalisation interactive;
- sauvegarde de prompts personnalisés;
- comptes lecteurs;
- favoris;
- notation;
- commentaires;
- génération publique d’un prompt;
- comparaison automatique entre assistants;
- séquences multi-prompts;
- filtre par contexte;
- filtre par type de résultat;
- kits;
- parcours;
- série Prompt;
- compteur de copies;
- analytics dédiés;
- génération automatique en lot des thumbnails.

### Critères d’acceptation

- les 20 prompts initiaux sont importables;
- les prompts publiés apparaissent dans le catalogue;
- chaque fiche répond à un besoin distinct;
- la majorité est adaptée aux débutants;
- chaque modèle peut être compris sans jargon de prompt engineering;
- les variables sont explicites;
- les exemples sont utiles;
- les conseils restent courts;
- les cautions ne sont utilisées que lorsque nécessaires;
- les catégories sont cohérentes;
- les contextes sont cohérents;
- la recherche retrouve les modèles attendus;
- les filtres sont combinables;
- Copier le prompt fonctionne;
- Copier le lien fonctionne;
- Partager fonctionne lorsque disponible;
- le thumbnail ou fallback fonctionne pour chaque fiche;
- les métadonnées sociales utilisent la bonne image;
- les brouillons sont absents du sitemap et du public;
- le parcours fonctionne sur ordinateur et mobile;
- les actions principales fonctionnent au clavier;
- le build, le lint ciblé et les tests réussissent;
- Christian valide la bibliothèque réelle.

---

# 27. Tableau de progression

| Incrément | Résultat fonctionnel | État | Commit |
|---|---|---|---|
| 0 | Inspection ciblée et décisions techniques | À faire | — |
| 1 | Import, administration, brouillons et thumbnail manuel | À faire | — |
| 2 | Fiche publique et copie | À faire | — |
| 3 | Catalogue, catégories, recherche et filtres | À faire | — |
| 4 | Génération intégrée du thumbnail — conditionnelle | À évaluer après inspection | — |
| 5 | SEO, partage, 20 prompts et finalisation | À faire | — |

États recommandés :

```text
À faire
En cours
À valider
Accepté
Bloqué
Reporté
```

---

# 28. Discipline pour chaque session Codex

Chaque prompt Codex doit préciser :

1. le résultat visible attendu;
2. les documents de référence à lire;
3. l’état Git requis;
4. l’incrément unique à réaliser;
5. les fichiers ou zones à inspecter;
6. les éléments inclus;
7. les éléments hors périmètre;
8. les invariants du contrat JSON;
9. les invariants de variables et placeholders;
10. les invariants de thumbnail lorsqu’ils s’appliquent;
11. les invariants de visibilité publique;
12. les invariants d’URL et de filtres;
13. les invariants de sécurité;
14. les exigences d’accessibilité;
15. les validations techniques;
16. les appels réels au modèle autorisés ou interdits;
17. le scénario manuel à vérifier;
18. le rapport final attendu;
19. l’interdiction de commit ou push sauf demande explicite.

Le rapport final doit contenir :

- résultat obtenu;
- décisions techniques;
- fichiers créés ou modifiés;
- migrations;
- schéma et RLS;
- comportement d’import;
- validations déterministes;
- comportement des variables;
- comportement de l’exemple calculé;
- stockage thumbnail;
- comportement avec et sans thumbnail;
- génération intégrée lorsque pertinente;
- catalogue et filtres lorsque pertinents;
- URL et partage lorsque pertinents;
- sécurité;
- accessibilité;
- commandes exécutées;
- tests exécutés;
- générations réelles effectuées lorsque autorisées;
- vérification manuelle effectuée ou restant à faire;
- limites connues;
- état Git;
- résumé du diff;
- aucun push sans demande explicite.

Codex ne doit pas :

- commencer l’incrément suivant;
- modifier `CONTRAT_JSON_PROMPTS_5PENNYAI_V1.md` sans demande explicite;
- créer une table générique `resources`;
- intégrer les prompts aux séries;
- créer une taxonomie administrable inutile;
- ajouter le filtre Contextes dans le MVP sans demande explicite;
- ajouter la personnalisation interactive prématurément;
- ajouter un prompt libre de génération d’image;
- accepter un chemin de stockage fourni par le client;
- générer automatiquement tous les thumbnails;
- créer un historique de versions;
- créer une marketplace;
- ajouter des comptes ou favoris;
- refactoriser des zones étrangères;
- ajouter une dépendance majeure sans justification issue de l’inspection;
- effectuer un commit ou push sans demande explicite.

---

# 29. Invariants critiques

Pendant tout le MVP 6.0 :

- les articles et infographies existants continuent de fonctionner;
- Prompt reste un format spécialisé;
- aucune table générique `resources` n’est créée;
- le contrat Prompts v1 demeure la référence éditoriale;
- un JSON partiel reste importable;
- un objet vide reste importable;
- l’import ne sauvegarde jamais automatiquement;
- l’import ne publie jamais;
- un JSON invalide ne modifie jamais le formulaire;
- les propriétés inconnues sont ignorées;
- les valeurs contrôlées inconnues produisent des avertissements;
- les propriétés techniques interdites ne sont jamais appliquées;
- `promptTemplate` reste du texte non exécutable;
- les placeholders utilisent `[KEY]`;
- les clés des variables restent distinctes de leurs libellés publics;
- un placeholder inconnu produit un avertissement;
- une variable inutilisée produit un avertissement;
- l’exemple est calculé depuis les variables;
- aucun `examplePrompt` redondant n’est nécessaire;
- la substitution reste non récursive;
- la version rapide ne peut pas utiliser une variable inconnue silencieusement;
- chaque prompt possède une seule catégorie principale;
- les contextes restent secondaires;
- les contextes ne sont pas un filtre public obligatoire en v1;
- les types de résultat restent secondaires;
- Prompt ne participe pas aux séries dans la v1;
- aucun kit ou parcours n’est simulé par une propriété non définie;
- le thumbnail est facultatif;
- le fichier thumbnail reste séparé du JSON;
- une réimportation ne supprime jamais un thumbnail;
- l’absence de thumbnail utilise toujours un fallback;
- l’upload manuel reste disponible;
- la génération intégrée, si implantée, reste à la demande;
- une génération échouée ne supprime jamais un thumbnail valide;
- aucune génération en lot n’est lancée;
- les clés fournisseur restent côté serveur;
- le client ne transmet pas un prompt d’image libre;
- aucun brouillon n’est exposé publiquement;
- Copier le prompt ne modifie aucune donnée;
- Copier le lien partage l’URL canonique, pas le template;
- aucune requête IA n’est effectuée pour un visiteur lorsqu’il consulte ou copie un prompt;
- la recherche générale continue de fonctionner;
- le catalogue conserve des URL partageables;
- la bibliothèque reste destinée en priorité au grand public;
- Christian conserve la décision finale.

---

# 30. Critères de clôture du MVP 6.0

La phase est terminée lorsque Christian peut :

1. ouvrir l’administration Prompts;
2. importer `{}`;
3. importer un JSON partiel;
4. importer un JSON complet;
5. voir les propriétés inconnues ignorées;
6. voir les valeurs contrôlées inconnues signalées;
7. voir un placeholder inconnu signalé;
8. voir une variable inutilisée signalée;
9. corriger les variables;
10. voir l’exemple calculé;
11. enregistrer un brouillon;
12. rouvrir le brouillon;
13. réimporter sans perdre le thumbnail;
14. téléverser un thumbnail;
15. remplacer le thumbnail;
16. supprimer le thumbnail et retrouver le fallback;
17. prévisualiser la fiche;
18. publier explicitement le prompt;
19. ouvrir son URL publique;
20. consulter `Quand l’utiliser`;
21. consulter le prompt principal;
22. copier le prompt;
23. consulter les variables;
24. consulter l’exemple rempli;
25. consulter le conseil;
26. copier une version rapide lorsqu’elle existe;
27. voir la caution seulement lorsqu’elle existe;
28. retrouver le prompt dans Ressources IA;
29. filtrer le format Prompts;
30. filtrer par catégorie;
31. combiner catégorie, niveau et recherche;
32. utiliser Retour et Avancer avec les filtres;
33. partager une URL filtrée;
34. partager la fiche publique;
35. copier son lien canonique;
36. constater que le thumbnail sert d’image sociale lorsqu’il existe;
37. constater que le fallback social fonctionne sinon;
38. constater qu’un brouillon reste invisible;
39. constater qu’un prompt ne devient pas un épisode de série;
40. utiliser le parcours au clavier;
41. utiliser le parcours sur mobile;
42. publier les 20 prompts initiaux;
43. constater que les 20 fiches restent simples et non techniques;
44. exécuter le build avec succès;
45. exécuter le lint ciblé avec succès;
46. exécuter les tests ciblés avec succès;
47. valider fonctionnellement et éditorialement la bibliothèque réelle.

Si la génération intégrée du thumbnail a été retenue à l’inspection, ajouter :

48. générer un thumbnail depuis l’administration;
49. régénérer un thumbnail;
50. conserver l’ancien thumbnail lors d’un échec;
51. continuer à utiliser l’upload manuel après une génération.

---

# 31. Évolutions volontairement reportées

À réévaluer seulement après utilisation du MVP 6.0 :

- formulaire `Personnaliser`;
- remplacement interactif des variables;
- prompt final généré par le navigateur;
- sauvegarde des valeurs personnalisées;
- comptes utilisateurs;
- favoris;
- historique personnel;
- notation des prompts;
- commentaires;
- prompts communautaires;
- soumission de prompts par les visiteurs;
- marketplace;
- filtre public par contexte;
- filtre public par type de résultat;
- kits de prompts;
- parcours pédagogiques;
- collections éditoriales;
- séries de prompts;
- séquences multi-prompts;
- workflows guidés;
- génération IA d’un prompt personnalisé;
- test automatique d’un prompt;
- exécution directe d’un prompt vers ChatGPT, Claude, Gemini ou autre assistant;
- variantes spécifiques à chaque fournisseur;
- détection automatique de compatibilité par modèle;
- mesure de taux de copie;
- classement des prompts les plus copiés;
- analytics dédiés;
- génération automatique du thumbnail à la publication;
- génération en lot des thumbnails;
- plusieurs thumbnails candidats;
- historique de versions des thumbnails;
- génération multilingue liée;
- traduction automatique des fiches;
- administration complète de taxonomies;
- table universelle de contenus.

Une évolution naturelle après validation du MVP pourra être :

```text
Personnaliser
→ remplir les variables dans la fiche
→ prévisualiser le prompt final
→ copier
```

Cette évolution doit réutiliser les données `variables` existantes et ne doit pas exiger de reconstruire le contrat v1.

---

# 32. Catalogue initial prévu

La première bibliothèque doit viser environ 20 modèles polyvalents.

Répartition de référence :

| Catégorie | Nombre initial |
|---|---:|
| Comprendre | 2 |
| Apprendre | 3 |
| Écrire | 4 |
| Résumer | 2 |
| Réfléchir | 2 |
| Organiser | 3 |
| Décider | 2 |
| Vérifier | 2 |
| **Total** | **20** |

Cible de niveaux :

```text
majorité Débutant
quelques Intermédiaires
très peu ou aucun Avancé au lancement
```

Le critère de sélection principal demeure :

> **« Est-ce qu’une personne ordinaire pourrait avoir besoin de ce modèle cette semaine? »**

Les prompts trop spécialisés pourront être ajoutés ensuite sous forme de nouvelles collections éditoriales, sans modifier le MVP technique.

---

# 33. Mesure principale de succès

Le MVP n’est pas réussi parce qu’il contient beaucoup de prompts.

Il est réussi si le visiteur peut :

```text
reconnaître son besoin
→ trouver un modèle pertinent
→ comprendre quoi remplacer
→ voir un exemple concret
→ copier le prompt
→ l’utiliser sans connaître le prompt engineering
```

La qualité doit être évaluée sur :

- utilité réelle;
- clarté;
- simplicité;
- polyvalence;
- découvrabilité;
- qualité des exemples;
- cohérence des catégories;
- faible friction de copie;
- qualité mobile;
- cohérence visuelle avec Ressources IA.

---

# 34. Principe final

La bibliothèque de prompts doit renforcer l’objectif de 5PennyAi :

> **Aider les gens à comprendre et à maîtriser l’IA de façon concrète.**

Elle doit donc rester plus proche d’une **boîte à outils pédagogique** que d’une base de données de prompts.

Architecture cible :

```text
RESSOURCES IA
│
├── Articles
│   └── comprendre en profondeur
│
├── Infographies
│   └── comprendre visuellement
│
└── Prompts
    └── agir avec l’IA
        │
        ├── Comprendre
        ├── Apprendre
        ├── Écrire
        ├── Résumer
        ├── Réfléchir
        ├── Organiser
        ├── Décider
        └── Vérifier
```

Le flux initial doit rester volontairement simple :

```text
Produire le prompt
→ réviser
→ exporter JSON
→ importer
→ corriger
→ ajouter ou générer facultativement le thumbnail
→ prévisualiser
→ publier
→ trouver dans Ressources IA
→ comprendre
→ copier
```

La sophistication future doit venir seulement après validation de ce flux de base.
