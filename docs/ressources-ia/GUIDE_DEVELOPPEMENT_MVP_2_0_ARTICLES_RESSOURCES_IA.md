# Guide de développement — MVP 2.0 Articles Ressources IA

**Projet :** 5PennyAi  
**Section :** Ressources IA  
**Format ajouté :** Articles éducatifs  
**Date :** 1er août 2026  
**Statut :** conception fonctionnelle prête à être inspectée puis implantée par incréments

---

> **État historique.** L’architecture actuelle est définie par le guide Taxonomie
> des sujets Ressources IA. Le champ `theme` a été retiré : les Topics sont gérés
> dans l’administration et les keywords servent à la recherche.

## 1. Rôle du document

Ce guide encadre l’ajout des **articles éducatifs** à la section Ressources IA.

Il prolonge les MVP 1.1 et 1.2 sans reconstruire :

- le catalogue public;
- les cartes de ressources;
- les séries;
- la page publique d’une série;
- la navigation entre les épisodes;
- les thumbnails des infographies et des séries;
- l’administration existante des infographies.

Il sert de fil conducteur pratique pour l’inspection, la conception technique et le développement par incréments.

Il ne constitue pas une spécification figée. L’inspection du dépôt demeure la source de vérité technique et peut conduire à ajuster les détails d’implantation sans changer les objectifs fonctionnels.

Ce guide ne doit pas être utilisé pour créer un CMS générique ou pour réintroduire l’ancien Pipeline éditorial.

---

## 2. Documents de référence

### Références obligatoires du développement

```text
GUIDE_DEVELOPPEMENT_MVP_2_0_ARTICLES_RESSOURCES_IA.md
CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md
les trois articles pilotes acceptés
```

Les trois articles pilotes acceptés — débutant, intermédiaire et avancé — doivent servir de cas d’essai réels pendant le développement.

### Références de contexte existantes

```text
REFERENCE_DEVELOPPEMENT_MVP_RESSOURCES_IA_PHASE_1.md
CONTRAT_JSON_RESSOURCES_IA_V1.md
GUIDE_DEVELOPPEMENT_MVP_1_1_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_1_2_THUMBNAILS_RESSOURCES_IA.md
```

### Références facultatives

```text
CONCEPTION_GENERATEUR_THUMBNAILS_V3.md
GRILLE_REVUE_ARTICLES_5PENNYAI_V1.md
```

La grille de révision appartient au workflow éditorial effectué avant l’import. Le site ne reproduit pas ses contrôles factuels ou pédagogiques.

La conception des thumbnails v3 n’est pas requise pour l’import, les brouillons ou l’upload manuel. L’absence de ces deux références facultatives dans le dépôt ne bloque pas les incréments 1 à 3.

### Hiérarchie des responsabilités

- Le **contrat JSON Articles v1** définit la structure importable et les comportements attendus de l’application.
- La **grille de révision** encadre le travail du GPT Réviseur avant l’import.
- Le **site** ne doit pas reproduire le travail éditorial ou factuel du Réviseur.
- L’administration effectue des validations déterministes, affiche des avertissements et laisse Christian décider de la publication.

---

## 3. Contexte

Le système de production des articles est maintenant prêt :

- contrat JSON Articles 5PennyAi v1;
- GPT Générateur v1;
- GPT Réviseur et grille de révision v1;
- workflow de production dans un projet ChatGPT;
- trois articles pilotes acceptés.

Le site permet déjà de publier des infographies, de les afficher dans une bibliothèque structurée, de les regrouper en séries et de leur associer des thumbnails dédiés.

Le MVP 2.0 doit maintenant ajouter un deuxième format de contenu sans affaiblir les décisions prises dans les phases précédentes.

Principe central :

```text
Infographie ou article
→ format de contenu spécialisé

Série
→ regroupement ordonné indépendant du format
```

Une série peut donc contenir :

- uniquement des infographies;
- uniquement des articles;
- des infographies et des articles.

---

## 4. Objectif du MVP 2.0

Permettre à Christian de publier des articles pédagogiques produits avec le workflow Articles 5PennyAi, puis de les intégrer naturellement à la bibliothèque Ressources IA.

À la fin du MVP, Christian doit pouvoir :

- importer un fichier `.article.json`;
- conserver et corriger toutes les propriétés reconnues;
- enregistrer l’article comme brouillon;
- rouvrir et modifier le brouillon;
- téléverser une couverture 16:9;
- associer un fichier aux médias déclarés dans le JSON;
- consulter les avertissements techniques et éditoriaux déterministes;
- prévisualiser l’article;
- publier l’article par une action explicite;
- ouvrir sa page publique;
- rendre correctement son Markdown;
- afficher ses citations, ses sources et ses médias;
- retrouver l’article dans le catalogue Ressources IA;
- filtrer les ressources par format;
- intégrer un article à une série;
- naviguer entre des épisodes de formats différents;
- produire les métadonnées SEO techniques attendues;
- conserver tous les brouillons invisibles publiquement.

Le résultat doit rester simple, contrôlable et cohérent avec l’architecture actuelle du site.

---

## 5. Principes directeurs

### 5.1 Un article est un format spécialisé

Les articles possèdent leur propre :

- table ou structure persistante;
- formulaire administratif;
- page détaillée;
- logique de rendu;
- gestion de couverture et de médias.

Ils partagent seulement avec les infographies les propriétés nécessaires au catalogue et aux séries.

### 5.2 Ne pas créer une table générique `resources`

Le MVP ne doit pas migrer les infographies et les articles vers une table universelle uniquement pour simplifier l’affichage.

L’unification doit se faire dans une petite couche de lecture publique, par exemple :

```text
id
contentType
title
summary
theme
level
seriesName
episodeNumber
publishedAt
thumbnailUrl
publicUrl
```

La forme exacte sera confirmée pendant l’inspection.

### 5.3 Importer ne signifie pas enregistrer ou publier

L’import JSON :

- préremplit le formulaire;
- affiche des avertissements;
- ne sauvegarde rien automatiquement;
- ne publie jamais;
- ne remplace pas un formulaire déjà rempli sans confirmation.

Christian conserve toujours la décision finale.

### 5.4 Import administratif permissif

Conformément au contrat Articles v1 :

- un objet vide est importable;
- un JSON partiel est importable;
- les propriétés reconnues sont conservées;
- les propriétés inconnues sont ignorées;
- les valeurs non reconnues produisent un avertissement;
- une version de contrat différente peut produire un avertissement sans empêcher l’import des propriétés reconnues.

Seules les erreurs techniques suivantes empêchent l’import :

- fichier illisible;
- JSON syntaxiquement invalide;
- valeur racine qui n’est pas un objet.

Dans ces cas, le formulaire existant ne doit pas être modifié.

### 5.5 Les avertissements assistent sans décider

Les contrôles déterministes peuvent signaler :

- titre absent;
- contenu vide;
- niveau inconnu;
- clé dupliquée;
- citation non résolue;
- média non résolu;
- source jamais citée;
- média déclaré mais inutilisé;
- URL invalide;
- HTML brut;
- titre `#` dans le Markdown;
- image Markdown externe;
- bloc SEO incomplet;
- média requis sans fichier.

Ces avertissements ne doivent pas automatiquement bloquer la publication.

Un média marqué `required: true` et encore absent produit un avertissement fort, mais Christian peut décider de publier lorsque le texte reste autonome.

### 5.6 Le site ne remplace pas le GPT Réviseur

Le site ne doit pas :

- vérifier les faits sur le Web;
- noter la qualité pédagogique;
- juger l’angle éditorial;
- confirmer qu’une source soutient réellement une affirmation;
- reproduire la grille de révision complète;
- réécrire automatiquement le contenu.

Ces contrôles appartiennent au workflow de production avant l’import.

### 5.7 Les fichiers restent séparés du JSON

Le JSON contient :

- les métadonnées de la couverture;
- le manifeste des médias;
- les briefs de génération;
- les textes alternatifs;
- les relations avec les sources.

Le JSON ne contient jamais :

- un fichier;
- une image en base64;
- un chemin Supabase;
- une URL de stockage;
- un statut;
- un identifiant de base de données.

### 5.8 Pas de génération d’images obligatoire dans ce MVP

L’upload manuel doit suffire pour publier les premiers articles.

Les briefs du JSON peuvent être utilisés dans ChatGPT ou un autre outil, puis le fichier obtenu est téléversé dans l’administration.

Une génération intégrée de couverture ou de médias pourra être évaluée plus tard.

### 5.9 Un incrément doit produire un résultat visible

Chaque incrément doit pouvoir être vérifié dans l’administration ou sur le site public avant de commencer le suivant.

Codex ne doit pas préparer silencieusement les incréments futurs ni refactoriser des zones non liées.

### 5.10 Tests ciblés

Les validations doivent privilégier :

- le build;
- le lint ciblé;
- quelques tests unitaires sur les transformations non triviales;
- des scénarios manuels avec les trois articles pilotes;
- une vérification responsive.

Éviter les snapshots massifs, les tests de classes CSS et les mocks complexes sans valeur fonctionnelle.

---

## 6. Flux fonctionnel cible

```text
Article accepté par le GPT Réviseur
→ import du fichier JSON
→ formulaire prérempli
→ avertissements déterministes
→ corrections manuelles
→ enregistrement du brouillon
→ ajout de la couverture
→ ajout des médias internes
→ aperçu
→ publication explicite
→ page publique
→ catalogue et séries
→ métadonnées SEO techniques
```

Une réimportation peut mettre à jour les métadonnées reconnues, mais ne doit jamais supprimer automatiquement :

- la couverture déjà téléversée;
- les médias déjà téléversés;
- les chemins de stockage;
- les médias qui ne figurent plus dans le nouveau JSON.

Les métadonnées de médias peuvent être rapprochées des fichiers existants par `media[].key`.

---

## 7. Modèle de données fonctionnel

L’inspection doit confirmer les types exacts, les noms de colonnes et les conventions existantes. Le besoin fonctionnel minimal est toutefois connu.

## 7.1 Article principal

Une entité spécialisée `articles` doit pouvoir conserver :

### Données importées

- `schemaVersion`;
- `contentType`;
- `language`;
- `title`;
- `subtitle`;
- `summary`;
- `theme`;
- `level`;
- `series.name`;
- `series.episodeNumber`;
- `learningObjectives`;
- `prerequisites`;
- `takeaway`;
- `contentMarkdown`;
- `media`;
- `cover`;
- `keywords`;
- `sources`;
- `seo`.

### Données contrôlées par l’application

- identifiant;
- slug public définitif;
- statut;
- chemin de couverture;
- dates de création et de modification;
- date de publication;
- éventuelle date de retrait ou suppression selon les conventions existantes.

### Décision à confirmer pendant l’inspection

Les propriétés simples devraient normalement devenir des colonnes directement interrogeables.

Les structures riches suivantes peuvent probablement rester en `jsonb` ou sous une forme équivalente :

- objectifs;
- prérequis;
- manifeste des médias;
- couverture éditoriale;
- mots-clés;
- sources;
- SEO.

L’inspection doit vérifier si cette stratégie correspond aux pratiques déjà présentes dans le dépôt.

## 7.2 Assets des médias internes

Les fichiers associés aux médias doivent être séparés du manifeste importé.

Une structure spécialisée peut relier :

```text
article_id
media_key
storage_path
created_at
updated_at
```

Cette séparation permet :

- de préserver les fichiers lors d’une réimportation;
- de rapprocher un fichier du manifeste par `key`;
- de remplacer ou supprimer un fichier sans modifier le contrat JSON;
- de détecter les médias devenus orphelins;
- d’éviter un gestionnaire de médias générique.

La forme exacte — table enfant ou solution équivalente — doit être confirmée pendant l’inspection.

## 7.3 Couverture

Le MVP utilise une seule couverture 16:9 par article.

Cette couverture sert :

- dans la carte du catalogue;
- dans l’en-tête de l’article;
- dans les aperçus de série;
- comme image sociale lorsque disponible.

Il n’est pas nécessaire de créer un thumbnail d’article distinct dans cette phase.

Si la couverture est absente, le site utilise un fallback public et la publication demeure possible.

## 7.4 Séries

Les articles doivent utiliser les mêmes notions que les infographies :

```text
series_name
episode_number
```

ou leur équivalent confirmé par l’inspection.

La table `resource_series` demeure la source persistante des informations propres à la série, notamment son slug et sa couverture.

Le nombre d’épisodes reste calculé à partir des ressources publiées. Il ne doit pas être stocké comme vérité éditoriale dans la série.

## 7.5 RLS et sécurité

Règles minimales :

- lecture publique limitée aux articles publiés;
- lecture et écriture administratives réservées à l’utilisateur authentifié autorisé;
- brouillons invisibles publiquement;
- chemins de stockage contrôlés par l’application;
- aucune confiance accordée à un chemin, un statut ou une URL fournis par le JSON;
- aucune clé de fournisseur exposée au client.

---

## 8. Import JSON

## 8.1 Entrée

L’administration doit au minimum accepter un fichier :

```text
*.article.json
```

Le collage direct du JSON peut être ajouté seulement si l’inspection montre qu’il améliore simplement l’expérience sans dupliquer inutilement le code.

## 8.2 Comportement

Lorsqu’un JSON valide est choisi :

1. lire le fichier;
2. confirmer que la racine est un objet;
3. extraire les propriétés reconnues;
4. ignorer les propriétés inconnues;
5. conserver les valeurs utilisables;
6. produire les avertissements;
7. demander confirmation si le formulaire contient déjà des valeurs;
8. préremplir le formulaire;
9. ne rien enregistrer automatiquement;
10. préserver tous les fichiers déjà téléversés.

## 8.3 Validations déterministes

L’import doit notamment pouvoir vérifier :

- `schemaVersion`;
- `contentType`;
- `language`;
- `level`;
- `series.episodeNumber`;
- types des tableaux et objets;
- valeurs de `media[].kind`;
- ratios permis;
- format et unicité des clés;
- correspondance des marqueurs `{{media:key}}`;
- correspondance des marqueurs `{{cite:key}}`;
- correspondance de `media[].sourceKeys`;
- formats des URL et dates;
- valeurs de `seo.searchIntent`;
- propriétés techniques interdites;
- HTML brut;
- titre Markdown `#`;
- images Markdown externes;
- blocs de code non fermés lorsque cela peut être détecté simplement.

Les propriétés techniques interdites doivent être ignorées et signalées. Elles ne doivent jamais être copiées dans les champs techniques du formulaire.

## 8.4 Erreur d’import

Si le fichier est illisible, le JSON invalide ou la racine non objet :

- aucun champ n’est modifié;
- aucun fichier existant n’est supprimé;
- un message clair est affiché;
- l’édition manuelle reste disponible.

---

## 9. Administration des articles

## 9.1 Navigation

Ajouter une entrée spécialisée dans l’administration Ressources IA :

```text
Ressources IA
├── Infographies
└── Articles
```

Une administration universelle de tous les formats n’est pas nécessaire dans ce MVP.

## 9.2 Liste des articles

La liste doit afficher au minimum :

- titre ou fallback `Article`;
- statut;
- langue;
- niveau lorsqu’il existe;
- série et épisode lorsqu’ils existent;
- date de modification;
- date de publication lorsqu’elle existe;
- actions Modifier et Supprimer;
- action Voir ou Prévisualiser selon le statut.

## 9.3 Formulaire

Le formulaire doit permettre de corriger toutes les propriétés reconnues du contrat.

Organisation recommandée :

```text
1. Import JSON
2. Métadonnées générales
3. Série
4. Objectifs et prérequis
5. Contenu Markdown
6. Médias internes
7. Couverture
8. Sources et citations
9. Mots-clés
10. SEO
11. Avertissements
12. Enregistrement et publication
```

Le formulaire peut utiliser :

- champs texte;
- zones de texte;
- listes répétables simples;
- panneaux repliables;
- éditeur Markdown texte avec aperçu;
- cartes de médias par clé.

Il ne doit pas devenir :

- un constructeur de page;
- un éditeur visuel riche;
- un studio graphique;
- un outil de recherche Web;
- un système de révision automatique.

## 9.4 Slug

Le formulaire distingue :

```text
seo.suggestedSlug
→ suggestion éditoriale importée

slug
→ valeur technique définitive contrôlée par l’application
```

Le slug définitif doit être :

- normalisé;
- unique;
- modifiable avant publication;
- protégé contre les collisions;
- traité prudemment après publication.

La stratégie de redirection après changement d’un slug publié doit être déterminée pendant l’inspection. Elle peut être reportée si l’architecture actuelle ne la prend pas en charge simplement.

## 9.5 Enregistrement et publication

L’administration doit offrir au minimum :

- Enregistrer le brouillon;
- Prévisualiser;
- Publier;
- Repasser en brouillon ou retirer selon les conventions existantes;
- Supprimer avec confirmation.

Avant la publication, afficher un résumé des avertissements encore présents.

La publication doit toujours être une action humaine explicite.

---

## 10. Gestion de la couverture

## 10.1 Métadonnées

Le JSON fournit :

- `cover.altText`;
- `cover.generationBrief`;
- `cover.preferredAspectRatio`.

Le fichier réel est contrôlé par l’application.

## 10.2 Fonctions administratives

Le MVP doit permettre :

- upload manuel;
- aperçu 16:9;
- remplacement;
- suppression;
- affichage du fallback;
- conservation de l’ancienne couverture en cas d’échec;
- validation du type et de la taille;
- nettoyage raisonnable des anciens fichiers.

Formats acceptés à confirmer après inspection :

```text
PNG
JPEG
WebP
```

WebP demeure le format de sortie recommandé lorsque l’outillage existant le permet.

## 10.3 Fallback

L’absence de couverture :

- ne bloque pas l’enregistrement;
- ne bloque pas automatiquement la publication;
- utilise un fallback dans le catalogue et la page publique;
- utilise un fallback social si aucune image adaptée n’existe.

## 10.4 Hors périmètre

- génération automatique à l’import;
- plusieurs couvertures enregistrées;
- historique de versions;
- couverture par langue;
- éditeur graphique;
- thumbnail séparé de la couverture.

---

## 11. Gestion des médias internes

## 11.1 États administratifs

Pour chaque objet de `media`, l’administration doit pouvoir afficher :

```text
Média déclaré et utilisé
Média déclaré mais non utilisé
Marqueur sans manifeste
Fichier présent
Fichier manquant
Média requis manquant
Source de média non résolue
```

## 11.2 Fonctions

Pour chaque média déclaré :

- afficher sa clé;
- afficher son type;
- afficher son titre et sa légende;
- permettre de modifier le texte alternatif;
- montrer le brief de génération sans l’afficher publiquement;
- afficher le ratio préféré;
- afficher les sources associées;
- téléverser un fichier;
- remplacer le fichier;
- supprimer le fichier;
- prévisualiser le résultat.

## 11.3 Règles de publication

Un fichier manquant :

- n’empêche pas l’enregistrement du brouillon;
- produit un avertissement;
- produit un avertissement fort si `required: true`;
- n’empêche pas automatiquement Christian de publier.

Sur la page publique :

- un média sans fichier est omis;
- son marqueur technique n’est jamais affiché;
- le reste du texte demeure visible;
- aucun placeholder administratif n’est exposé au lecteur.

## 11.4 Réimportation

Une réimportation :

- rapproche les métadonnées par `key`;
- conserve les fichiers déjà téléversés;
- ne supprime pas automatiquement les assets dont la clé disparaît;
- signale les assets devenus orphelins;
- laisse Christian décider de leur suppression.

---

## 12. Rendu Markdown

## 12.1 Éléments pris en charge

Le renderer public doit prendre en charge au minimum :

- paragraphes;
- titres `##`, `###` et `####`;
- gras;
- italique;
- listes à puces;
- listes numérotées;
- citations Markdown;
- liens;
- tableaux GitHub Flavored Markdown;
- code en ligne;
- blocs de code clôturés;
- séparateurs horizontaux;
- marqueurs de citations;
- marqueurs de médias.

## 12.2 Sécurité

Le rendu public doit :

- échapper ou nettoyer le HTML brut;
- ne jamais exécuter de script;
- refuser les iframes et formulaires non fiables;
- ne pas interpréter les événements JavaScript;
- ne pas charger une image externe déclarée directement dans le Markdown;
- sécuriser les liens externes;
- préserver le texte même lorsqu’une structure est invalide.

## 12.3 Marqueurs de citations

Syntaxe :

```text
{{cite:source-key}}
```

Le renderer doit :

- associer la clé à `sources`;
- produire un appel de citation accessible;
- permettre d’atteindre la source correspondante;
- gérer plusieurs marqueurs consécutifs;
- omettre proprement un marqueur non résolu;
- ne pas interpréter un faux marqueur situé dans un bloc de code.

Le modèle exact — numéro, exposant ou lien — doit rester simple et cohérent avec le design du site.

## 12.4 Marqueurs de médias

Syntaxe :

```text
{{media:media-key}}
```

Le marqueur doit normalement être seul sur sa ligne.

Le renderer doit :

- associer la clé au manifeste;
- associer le manifeste au fichier téléversé;
- produire un composant React contrôlé;
- utiliser le texte alternatif;
- afficher la légende lorsqu’elle existe;
- omettre le média s’il n’est pas résolu;
- ne pas interpréter un faux marqueur dans un bloc de code.

## 12.5 Tableaux et code sur mobile

Les tableaux et blocs de code doivent :

- rester lisibles;
- permettre un défilement horizontal local si nécessaire;
- ne pas élargir toute la page;
- conserver une taille de texte raisonnable;
- rester accessibles au clavier.

## 12.6 Temps de lecture

Le temps de lecture est calculé par l’application à partir de `contentMarkdown`.

Le calcul doit ignorer autant que possible :

- la syntaxe Markdown;
- les marqueurs techniques;
- le contenu purement structurel des blocs de code si la convention retenue le justifie.

Une estimation simple et stable est préférable à un algorithme complexe.

---

## 13. Page publique d’un article

## 13.1 Route

La route exacte doit suivre les conventions confirmées pendant l’inspection.

Forme fonctionnelle envisagée :

```text
/ressources-ia/articles/{slug}
```

## 13.2 En-tête

Afficher selon les données disponibles :

- fil d’Ariane;
- libellé `Ressources IA · Article`;
- série et épisode;
- thème;
- niveau;
- titre;
- sous-titre;
- résumé;
- temps de lecture;
- date de publication;
- couverture.

Les valeurs absentes ne doivent pas créer de zones vides.

## 13.3 Contenu pédagogique

La page peut afficher avant le corps :

- objectifs d’apprentissage;
- prérequis.

Après le corps :

- bloc À retenir;
- sources;
- mots-clés lorsque leur affichage apporte une valeur réelle;
- navigation de série;
- retour vers Ressources IA.

L’ordre exact doit être validé visuellement pendant l’incrément public.

## 13.4 Fallbacks publics

| Valeur absente | Comportement |
|---|---|
| titre | afficher `Article` |
| sous-titre | masquer |
| résumé | masquer |
| thème | afficher seulement `Article` |
| niveau | masquer |
| série | masquer |
| objectifs | masquer la section |
| prérequis | masquer la section |
| contenu Markdown | afficher un message neutre |
| takeaway | masquer le bloc |
| couverture | utiliser le fallback |
| média | omettre |
| sources | masquer la section |
| titre SEO | utiliser le titre |
| meta description | utiliser le résumé lorsqu’il existe |

## 13.5 Visibilité

- un article publié est accessible;
- un brouillon n’est jamais accessible publiquement;
- un slug inconnu affiche une 404 ou une page non disponible;
- un article retiré ne doit pas rester exposé par une requête publique;
- aucune donnée administrative ou brief de génération n’est affiché.

---

## 14. Intégration au catalogue

## 14.1 Filtre par format

Le filtre apparaît lorsque le premier article est réellement publié :

```text
Tous
Infographies
Articles
```

Il reste distinct de :

```text
Toutes les ressources
Séries
```

et du filtre par série.

## 14.2 URL

L’état du format doit être représenté dans l’URL selon les conventions existantes afin que :

- le lien soit partageable;
- Retour et Avancer fonctionnent;
- le filtre par série puisse être combiné;
- la vue Séries demeure indépendante.

## 14.3 Carte d’article

La carte doit afficher :

```text
Nom de la série, si présent
Épisode, si présent

Article · Thème
Titre
Résumé
Niveau · Temps de lecture
Consulter
```

La couverture 16:9 sert d’aperçu.

Si elle est absente, utiliser un fallback cohérent avec le catalogue.

## 14.4 Tri

Dans la vue générale :

```text
published_at décroissant
```

Lorsqu’une série est sélectionnée :

1. numéro d’épisode croissant;
2. ressources sans numéro à la fin;
3. date de publication croissante pour départager;
4. titre comme dernier critère stable.

Le format ne modifie pas l’ordre.

---

## 15. Intégration aux séries

## 15.1 Modèle mixte

La page de série doit pouvoir charger les infographies et les articles publiés, puis les adapter à un modèle commun.

Aucune migration vers une table générique n’est nécessaire si les deux requêtes peuvent être combinées simplement dans la couche de lecture.

## 15.2 Cartes et compte d’épisodes

Le compte d’épisodes inclut toutes les ressources publiées de la série, indépendamment du format.

Les cartes indiquent clairement le format de chaque épisode.

## 15.3 Navigation précédent et suivant

La navigation doit suivre l’ordre commun de la série.

Exemple valide :

```text
Infographie — épisode 2
→ Article — épisode 3
→ Infographie — épisode 4
```

Les liens de bord restent masqués sur le premier et le dernier épisode.

Aucun brouillon ne doit apparaître dans cette navigation.

## 15.4 Couverture de série

La couverture persistante de `resource_series` demeure prioritaire pour :

- la carte de série;
- la série mise en vedette;
- l’en-tête de série lorsque déjà utilisé.

Les couvertures des articles ne remplacent pas la couverture de série.

---

## 16. SEO technique

## 16.1 Données éditoriales et données techniques

Le JSON fournit des suggestions :

- requête principale;
- requêtes secondaires;
- intention;
- titre SEO;
- meta description;
- slug suggéré;
- suggestions de liens internes.

L’application contrôle :

- slug définitif;
- URL canonique;
- date de publication;
- date de modification;
- URL réelle de la couverture;
- directives robots;
- données structurées;
- sitemap.

## 16.2 Métadonnées de page

La page publique doit produire selon les conventions existantes :

- `<title>`;
- meta description;
- canonical;
- Open Graph;
- Twitter Card ou équivalent actuel;
- langue de la page;
- image sociale lorsqu’une couverture existe.

Fallbacks :

```text
seo.seoTitle absent
→ title

seo.metaDescription absente
→ summary

couverture absente
→ image sociale par défaut du site
```

## 16.3 Données structurées

Données minimales à évaluer :

```text
Article
BreadcrumbList
```

Les données structurées doivent utiliser les valeurs techniques réelles, et non recopier aveuglément les suggestions du JSON.

## 16.4 Sitemap et indexation

Le sitemap doit inclure seulement les articles publiés.

Les brouillons et pages non disponibles doivent être exclus ou recevoir les directives appropriées selon l’architecture existante.

L’inspection doit confirmer les limites éventuelles du rendu React actuel pour l’indexation. Le MVP ne doit pas introduire une refonte SSR ou un changement de framework sans nécessité démontrée.

## 16.5 Liens internes

`seo.internalLinkSuggestions` demeure une aide administrative.

L’application ne doit pas :

- inventer une URL interne;
- insérer automatiquement un lien dans le Markdown;
- modifier silencieusement le contenu.

---

## 17. Gestion des erreurs et cohérence

### Import échoué

- formulaire inchangé;
- fichiers inchangés;
- message clair;
- nouvelle tentative possible.

### Upload de couverture échoué

- ancienne couverture conservée;
- aucune référence invalide enregistrée;
- formulaire encore utilisable.

### Upload de média échoué

- ancien fichier conservé;
- manifeste inchangé;
- message lié à la bonne clé.

### Mise à jour de base échouée après upload

- tenter de supprimer le nouvel asset orphelin;
- ne pas supprimer l’ancien asset;
- signaler l’erreur.

### Suppression du fichier échouée après remplacement

- garder la nouvelle référence valide;
- journaliser ou signaler l’ancien asset orphelin;
- ne pas annuler une mise à jour réussie uniquement pour ce nettoyage.

### Citation non résolue

- avertissement administratif;
- marqueur omis publiquement;
- article toujours lisible.

### Média non résolu

- avertissement administratif;
- média omis publiquement;
- marqueur non affiché;
- texte conservé.

---

# 18. Découpage du développement

Le MVP 2.0 est découpé en **cinq incréments fonctionnels**, précédés d’une inspection ciblée.

Ce découpage permet de valider successivement :

```text
Données et import
→ assets et aperçu
→ page publique
→ catalogue et séries
→ SEO et finalisation
```

---

## Incrément 0 — Inspection ciblée

### Objectif

Confirmer l’architecture réelle après les MVP 1.1 et 1.2 et ajuster le périmètre technique des incréments suivants.

### À inspecter

- état Git, branche, remotes et derniers commits;
- migrations et structure de `infographics`;
- structure de `resource_series`;
- politiques RLS;
- bucket Supabase et conventions de chemins;
- administration Ajouter/Modifier une infographie;
- import JSON actuel;
- upload, remplacement et suppression des images;
- catalogue Ressources IA;
- modèle et composants de cartes;
- vue Séries et série mise en vedette;
- page publique d’une série;
- navigation précédent/suivant;
- routeur;
- ancien rendu du blogue, uniquement comme référence technique;
- dépendances Markdown;
- gestion de Helmet ou équivalent;
- sitemap et robots;
- traductions FR/EN;
- tests existants et scripts de validation.

### Questions à résoudre

1. Quelle structure minimale utiliser pour `articles`?
2. Quelles propriétés deviennent des colonnes ou du `jsonb`?
3. Une table spécialisée pour les fichiers de médias est-elle la solution la plus simple?
4. Quelle logique d’import peut être réutilisée?
5. Quelle bibliothèque Markdown est déjà disponible ou la plus compatible?
6. Comment transformer les marqueurs sans les interpréter dans les blocs de code?
7. Quelle route publique suit les conventions du site?
8. Comment produire un modèle public commun sans table `resources`?
9. Comment fusionner les ressources d’une série mixte?
10. Comment préserver les fichiers lors d’une réimportation?
11. Comment intégrer les articles au sitemap actuel?
12. Quelles limites SEO proviennent du rendu React actuel?

### Résultat visible

Aucun changement public.

Produire un rapport court comprenant :

- état réel du dépôt;
- décisions techniques recommandées;
- risques;
- ajustements du plan;
- périmètre précis de l’incrément 1.

### Hors périmètre

- aucune modification de code;
- aucune migration;
- aucune installation de dépendance;
- aucun refactoring;
- aucun commit;
- aucun push.

### Décisions issues de l’inspection

- l’incrément 1 reste limité aux brouillons et n’ajoute aucune action Publier active;
- `cover_path` et `article_media_assets` sont reportés à l’incrément 2;
- l’aperçu et le renderer Markdown commun commencent à l’incrément 2;
- les adaptateurs vers le modèle public commun commencent à l’incrément 4;
- le sitemap et `robots.txt` devront être créés à l’incrément 5, puisqu’ils n’existent pas actuellement;
- un fixture de série mixte pourra être ajouté à l’incrément 4 sans modifier les trois articles pilotes acceptés;
- la régénération des couvertures de séries à partir des articles demeure hors périmètre.

---

## Incrément 1 — Fondation des articles, import et brouillons

### Objectif

Pouvoir importer un article JSON, corriger ses données, l’enregistrer comme brouillon et le rouvrir dans l’administration.

### Inclus

- migration initiale `articles`;
- contraintes et index strictement nécessaires;
- RLS administrative et protection de la lecture publique;
- entrée Articles dans l’administration;
- liste des articles;
- formulaire Ajouter/Modifier;
- import d’un fichier `.article.json`;
- import permissif conforme au contrat;
- confirmation avant remplacement d’un formulaire rempli;
- champs pour toutes les propriétés reconnues;
- avertissements déterministes;
- slug suggéré distinct du slug définitif;
- sauvegarde du brouillon;
- modification;
- suppression;
- préservation des données existantes en cas d’erreur;
- traductions FR/EN nécessaires;
- tests ciblés de parsing, import et avertissements.

### Résultat visible

> Christian importe chacun des trois articles pilotes, voit les données reconnues dans le formulaire, enregistre un brouillon et le retrouve dans la liste administrative.

### Hors périmètre

- upload de couverture;
- upload de médias;
- renderer public complet;
- publication publique;
- catalogue;
- séries mixtes;
- SEO technique public.

### Critères d’acceptation

- `{}` est importable;
- un JSON partiel est importable;
- un JSON complet préremplit les champs;
- une propriété inconnue est ignorée sans affecter les propriétés reconnues;
- une valeur inconnue n’efface pas les autres valeurs;
- un JSON invalide ne modifie pas le formulaire;
- une réimportation demande confirmation;
- le brouillon peut être sauvegardé et rouvert;
- aucune propriété technique interdite n’est appliquée;
- aucun brouillon n’est publiquement accessible;
- le build et les tests ciblés réussissent.

### Tests recommandés

- parsing d’un objet vide;
- import partiel;
- valeur racine non objet;
- JSON invalide;
- propriétés inconnues;
- valeurs contrôlées inconnues;
- clés dupliquées;
- marqueurs non résolus;
- préservation du formulaire en cas d’échec.

---

## Incrément 2 — Couverture, médias et aperçu administratif

### Objectif

Permettre de compléter les assets d’un article et de prévisualiser son rendu avant publication.

### Inclus

- stockage de la couverture;
- stockage spécialisé des médias internes;
- conventions de chemins;
- upload manuel;
- aperçu;
- remplacement;
- suppression;
- validation du type et de la taille;
- rapprochement des médias par `key`;
- préservation des fichiers lors d’une réimportation;
- détection des fichiers manquants et orphelins;
- états requis, facultatifs, utilisés et inutilisés;
- affichage des briefs de génération;
- aperçu administratif du Markdown;
- rendu administratif des marqueurs résolus;
- placeholders explicites pour les marqueurs non résolus;
- résumé des avertissements;
- calcul initial du temps de lecture;
- tests ciblés du stockage et de la résolution.

### Résultat visible

> Christian ouvre un brouillon, téléverse sa couverture et ses médias, voit chaque asset associé à la bonne clé et consulte un aperçu complet avant publication.

### Hors périmètre

- génération automatique d’images;
- page publique définitive;
- catalogue;
- séries mixtes;
- sitemap;
- données structurées finales.

### Critères d’acceptation

- une couverture peut être téléversée, remplacée et supprimée;
- chaque média est associé par sa clé;
- un fichier existant survit à une réimportation;
- un média supprimé du JSON n’est pas supprimé automatiquement du stockage;
- un média requis manquant produit un avertissement fort;
- un média facultatif manquant produit un avertissement normal;
- les briefs restent administratifs;
- l’aperçu montre les problèmes sans exposer les marqueurs bruts comme contenu normal;
- une erreur d’upload conserve l’ancien asset;
- le build et les tests ciblés réussissent.

### Tests recommandés

- construction des chemins;
- résolution `media key → asset`;
- remplacement sûr;
- suppression et fallback;
- réimportation avec mêmes clés;
- réimportation avec clé supprimée;
- couverture absente;
- média absent.

---

## Incrément 3 — Page publique, renderer et publication

### Objectif

Publier un article et le rendre lisible à son URL définitive.

### Inclus

- route publique d’article;
- récupération par slug;
- action Publier;
- date de publication;
- exclusion des brouillons;
- page 404 ou non disponible;
- renderer Markdown sécurisé;
- GitHub Flavored Markdown;
- tableaux;
- blocs de code;
- liens sécurisés;
- citations;
- sources;
- médias internes;
- couverture;
- objectifs;
- prérequis;
- bloc À retenir;
- temps de lecture;
- fallbacks publics;
- aperçu utilisant le même renderer que la page publique lorsque possible;
- mise en page responsive;
- accessibilité de base;
- métadonnées HTML minimales;
- tests ciblés du renderer et des requêtes publiques.

### Résultat visible

> Un article pilote publié peut être lu de bout en bout avec sa couverture, son Markdown, ses tableaux, son code, ses médias, ses citations et ses sources.

### Hors périmètre

- filtre Articles dans le catalogue;
- séries mixtes;
- navigation entre formats;
- données structurées finales;
- sitemap final;
- génération automatique d’images.

### Critères d’acceptation

- seul un article publié est accessible;
- le titre principal n’est pas répété depuis le Markdown;
- le HTML brut n’est pas exécuté;
- les images Markdown externes ne sont pas rendues comme assets libres;
- les tableaux et le code restent utilisables sur mobile;
- les citations résolues renvoient aux sources;
- les citations non résolues sont omises;
- les médias résolus s’affichent au bon endroit;
- les médias absents sont omis sans casser le texte;
- aucun brief ou chemin de stockage n’est public;
- les fallbacks du contrat sont respectés;
- le rendu est vérifié à 1440, 768 et environ 390 px;
- le build et les tests ciblés réussissent.

### Tests recommandés

- marqueurs hors et dans les blocs de code;
- plusieurs citations consécutives;
- citation inconnue;
- média inconnu;
- média sans fichier;
- HTML brut;
- tableau large;
- bloc de code;
- brouillon inaccessible;
- slug inconnu.

---

## Incrément 4 — Catalogue et séries mixtes

### Objectif

Faire des articles des ressources de premier niveau dans la bibliothèque existante.

### Inclus

- modèle public commun minimal;
- chargement conjoint des infographies et articles publiés;
- filtre `Tous / Infographies / Articles`;
- état du filtre dans l’URL;
- combinaison avec le filtre par série;
- cartes d’articles;
- tri général par publication;
- regroupement commun par série;
- page de série mixte;
- compte commun des épisodes;
- ordre commun des épisodes;
- navigation précédent/suivant entre formats;
- série mise en vedette;
- cartes de séries;
- fallbacks de couverture;
- traductions FR/EN;
- états vide, chargement et erreur;
- tests ciblés de fusion, filtrage et ordre.

### Résultat visible

> L’utilisateur peut filtrer les articles, ouvrir un article depuis le catalogue et suivre une série contenant des infographies et des articles.

### Hors périmètre

- recherche textuelle;
- pagination;
- catégories avancées;
- recommandations;
- progression utilisateur;
- favoris;
- nouvelle administration complète des séries;
- table générique `resources`.

### Critères d’acceptation

- le filtre de format apparaît seulement lorsqu’un article est publié;
- la vue Séries demeure distincte du filtre de format;
- une ressource indépendante reste visible;
- une série mixte possède une seule carte;
- le compte inclut les deux formats publiés;
- l’ordre ne dépend pas du format;
- précédent et suivant peuvent relier deux formats différents;
- aucun brouillon n’entre dans le catalogue ou les séries;
- Retour et Avancer restaurent les filtres;
- la couverture de série reste prioritaire;
- le build et les tests ciblés réussissent.

### Tests recommandés

- fusion de deux types de ressources;
- filtre de format;
- filtre de série combiné;
- ordre avec épisodes manquants;
- précédent/suivant entre formats;
- exclusion des brouillons;
- compte d’épisodes publiés.

---

## Incrément 5 — SEO technique et finalisation

### Objectif

Finaliser la découvrabilité, la robustesse et la qualité du MVP 2.0.

### Inclus

- titre SEO;
- meta description;
- canonical;
- Open Graph;
- image sociale;
- Twitter Card ou convention équivalente;
- données structurées `Article`;
- données structurées `BreadcrumbList`;
- dates de publication et de modification;
- sitemap;
- exclusion des brouillons;
- gestion des slugs selon les possibilités confirmées;
- vérification des liens externes;
- validation responsive et clavier;
- vérification du poids des couvertures et médias;
- vérification des trois articles pilotes;
- vérification de la série mixte si elle existe;
- petites corrections directement liées au MVP;
- documentation des limites restantes;
- build, lint et tests ciblés.

### Résultat visible

> Les trois articles pilotes sont publiables, navigables, intégrés à Ressources IA et techniquement prêts pour l’indexation et le partage.

### Hors périmètre

- changement de framework;
- refonte SSR complète;
- calendrier éditorial;
- génération d’articles dans le site;
- génération automatique des médias;
- insertion automatique des liens internes;
- commentaires;
- comptes lecteurs;
- recommandations automatiques;
- analytics éditorial avancé;
- traduction automatique.

### Critères d’acceptation

- chaque article possède un titre et une description avec fallbacks;
- canonical utilise l’URL réelle;
- Open Graph utilise la couverture réelle ou le fallback;
- les données structurées utilisent les valeurs techniques réelles;
- les brouillons sont absents du sitemap;
- les articles publiés attendus sont présents;
- aucune propriété SEO suggérée ne remplace silencieusement une valeur technique;
- les trois niveaux d’article sont vérifiés;
- le parcours complet fonctionne sur ordinateur et mobile;
- le build, le lint et les tests ciblés réussissent.

---

## 19. Tableau de progression

| Incrément | Résultat fonctionnel | État | Commit |
|---|---|---|---|
| 0 | Inspection ciblée et décisions techniques | Accepté | — |
| 1 | Import, administration et brouillons | Accepté | — |
| 2 | Couverture, médias et aperçu administratif | Accepté | — |
| 3 | Publication et page publique d’article | Accepté | — |
| 4 | Catalogue et séries mixtes | À faire | — |
| 5 | SEO technique et finalisation | À faire | — |

États recommandés :

```text
À faire
En cours
À valider
Accepté
Bloqué
```

---

## 20. Discipline pour chaque session Codex

Chaque prompt Codex doit préciser :

1. le résultat visible attendu;
2. les documents de référence à lire;
3. l’état Git requis;
4. la portée exacte de l’incrément;
5. les éléments hors périmètre;
6. les invariants du contrat JSON;
7. les invariants de stockage et de publication;
8. les validations techniques à exécuter;
9. le scénario manuel à vérifier;
10. le rapport final attendu;
11. l’interdiction de commit ou push sauf demande explicite.

Le rapport final doit contenir :

- résultat obtenu;
- décisions techniques prises;
- fichiers créés ou modifiés;
- migrations;
- stockage et nettoyage;
- sécurité et RLS;
- comportement d’import;
- comportement des fallbacks;
- commandes et tests;
- vérification manuelle;
- limites connues;
- état Git;
- résumé du diff;
- aucun push sans demande explicite.

---

## 21. Invariants critiques

Pendant tout le MVP 2.0 :

- un JSON partiel reste importable;
- un objet vide reste importable;
- l’import ne sauvegarde jamais automatiquement;
- l’import ne publie jamais;
- un JSON invalide ne modifie pas le formulaire;
- les propriétés inconnues sont ignorées;
- les valeurs inconnues produisent des avertissements;
- les propriétés techniques interdites ne sont jamais appliquées;
- les fichiers restent séparés du JSON;
- une réimportation ne supprime pas les fichiers;
- les avertissements éditoriaux ne bloquent pas automatiquement la publication;
- un média requis manquant produit un avertissement fort, pas un blocage automatique;
- un média manquant ne rend pas tout l’article inutilisable;
- aucun marqueur technique non résolu n’est affiché publiquement;
- le Markdown brut n’exécute jamais de code;
- les images Markdown externes ne remplacent pas le système de médias;
- les chemins de stockage restent contrôlés par l’application;
- le temps de lecture est calculé par le site;
- le slug suggéré n’est pas le slug définitif;
- les suggestions de liens internes ne sont pas appliquées automatiquement;
- les brouillons restent invisibles publiquement;
- les infographies existantes continuent de fonctionner;
- les thumbnails existants restent intacts;
- une série demeure indépendante du format;
- une série peut contenir plusieurs formats;
- aucune table générique `resources` n’est introduite sans nécessité démontrée;
- aucune médiathèque générique n’est créée;
- aucune génération automatique en lot n’est lancée;
- aucune nouvelle dépendance majeure n’est ajoutée avant inspection;
- chaque incrément est validé avant le suivant;
- Christian conserve toujours la décision finale.

---

## 22. Critères de clôture du MVP 2.0

La phase est terminée lorsque Christian peut :

1. importer un objet JSON vide sans erreur;
2. importer un JSON partiel;
3. importer les trois articles pilotes complets;
4. voir les propriétés inconnues ignorées;
5. voir les valeurs inconnues signalées;
6. enregistrer les articles comme brouillons;
7. rouvrir et modifier les brouillons;
8. réimporter sans perdre les fichiers existants;
9. téléverser une couverture;
10. remplacer ou supprimer la couverture;
11. téléverser chaque média interne;
12. associer les médias par clé;
13. voir les médias requis manquants signalés;
14. prévisualiser le Markdown;
15. publier explicitement un article;
16. ouvrir sa page publique;
17. lire correctement ses titres, listes et tableaux;
18. consulter ses blocs de code;
19. utiliser ses liens de façon sécurisée;
20. ouvrir ses citations;
21. consulter ses sources;
22. voir ses médias au bon endroit;
23. constater qu’un média manquant est omis proprement;
24. retrouver l’article dans le catalogue;
25. filtrer les articles;
26. intégrer un article à une série;
27. naviguer entre un article et une infographie;
28. constater qu’un brouillon reste invisible;
29. vérifier les métadonnées SEO;
30. vérifier les données structurées;
31. vérifier le sitemap;
32. utiliser le parcours sur ordinateur et mobile;
33. exécuter le build, le lint ciblé et les tests avec succès.

---

## 23. Évolutions volontairement reportées

À réévaluer seulement après utilisation du MVP 2.0 :

- génération automatique de couvertures;
- génération automatique des médias internes;
- génération en lot;
- plusieurs variantes d’images;
- historique et restauration de versions;
- éditeur Markdown riche;
- constructeur de pages;
- médiathèque globale;
- workflow éditorial multiutilisateur;
- commentaires;
- comptes lecteurs;
- progression de lecture;
- favoris;
- moteur de recommandations;
- recherche avancée;
- taxonomie complète;
- pagination;
- traduction automatique;
- articles multilingues liés;
- insertion automatique des liens internes;
- redirections historiques avancées de slugs;
- analytics éditorial;
- CDN ou stratégie d’images multi-résolutions;
- refonte SSR ou changement de framework;
- administration complète des séries;
- table universelle de contenus.

La priorité reste de valider un flux simple et fiable :

```text
Produire et réviser l’article
→ importer le JSON
→ corriger
→ ajouter les fichiers
→ prévisualiser
→ publier
→ afficher dans Ressources IA
```
