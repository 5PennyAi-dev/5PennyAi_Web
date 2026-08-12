# Guide de développement — MVP 5.0 Découverte et filtrage Ressources IA

**Projet :** 5PennyAi  
**Section :** Ressources IA  
**Évolution :** recherche, filtrage par niveau et sujet, combinaison des facettes  
**Date :** 11 août 2026  
**Statut :** conception fonctionnelle prête à être inspectée puis implantée par incréments

---

## 1. Rôle du document

Ce guide encadre l’évolution **MVP 5.0** de la section Ressources IA.

Il prolonge la bibliothèque déjà implantée sans reconstruire :

- le catalogue public;
- les cartes d’articles et d’infographies;
- la vue `Toutes les ressources / Séries`;
- le filtre de format;
- le filtre de série;
- les pages publiques de séries;
- la navigation précédent/suivant;
- les thumbnails;
- les couvertures d’articles;
- les infographies compagnons;
- les médias internes;
- le partage social;
- les workflows de production éditoriale.

Le MVP 5.0 ajoute une couche de **découverte** au catalogue afin que la croissance du nombre de ressources n’entraîne pas une page difficile à parcourir.

Le flux cible devient :

```text
Ressources publiées
→ modèle public commun léger
→ recherche textuelle
→ filtres combinables
→ tri existant
→ grille de résultats
```

La phase doit rester cohérente avec les décisions architecturales des MVP précédents :

```text
Articles et infographies
→ formats spécialisés

Série
→ regroupement indépendant du format

Catalogue
→ petite couche de lecture commune

Recherche et filtres
→ fonctions de découverte du catalogue
```

L’inspection du dépôt demeure la source de vérité technique. Elle peut ajuster les noms de composants, helpers, paramètres d’URL et fonctions sans modifier les objectifs fonctionnels du présent guide.

---

## 2. Documents de référence

### Références obligatoires

```text
GUIDE_DEVELOPPEMENT_MVP_5_0_DECOUVERTE_FILTRAGE_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_1_1_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_2_0_ARTICLES_RESSOURCES_IA.md
CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md
CONTRAT_JSON_RESSOURCES_IA_V1.md
```

### Références de contexte

```text
REFERENCE_DEVELOPPEMENT_MVP_RESSOURCES_IA_PHASE_1.md
GUIDE_DEVELOPPEMENT_MVP_1_2_THUMBNAILS_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_4_0_INFOGRAPHIES_ARTICLES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_4_1_MEDIAS_INTERNES_DEPUIS_INFOGRAPHIE_RESSOURCES_IA.md
```

Les MVP 4.0 et 4.1 servent seulement à confirmer l’état actuel des articles et de leurs assets. Le MVP 5.0 ne modifie aucun workflow d’image.

### Hiérarchie des responsabilités

- Les **contrats JSON existants** demeurent la source des métadonnées éditoriales comme `theme`, `level`, `keywords` et la série.
- Les **tables spécialisées** des articles et infographies demeurent les sources persistantes.
- La **couche publique commune** adapte les deux formats pour le catalogue.
- La **recherche et les filtres** s’appliquent à cette couche commune.
- L’URL représente l’état partageable des filtres.
- L’application conserve les règles de visibilité existantes : seules les ressources publiées peuvent entrer dans le catalogue public.

---

## 3. Contexte

La section Ressources IA contient maintenant plusieurs formats et plusieurs façons de naviguer :

```text
Toutes les ressources
Séries

Tous les formats
Infographies
Articles

Toutes les séries
Une série précise
```

La bibliothèque dispose également déjà, dans ses données éditoriales, de dimensions supplémentaires utiles :

```text
level
theme
keywords
series
contentType
```

Le contrat Articles v1 prévoit explicitement que `keywords` peut servir à une future recherche interne et au rapprochement de contenus connexes.

Le contrat des infographies possède également des métadonnées de thème, niveau et mots-clés.

Le besoin n’est donc pas de créer immédiatement une nouvelle taxonomie.

Le besoin est d’exploiter les données déjà disponibles afin de répondre rapidement à des questions comme :

```text
Je débute : quelles ressources sont adaptées à mon niveau?

Je cherche quelque chose sur le RAG : où sont les ressources pertinentes?

Je veux seulement les articles intermédiaires.

Je veux les ressources d’une série qui parlent d’un sujet précis.

Je me souviens d’un terme, mais pas du titre exact de la ressource.
```

Le MVP 5.0 doit transformer la page Ressources IA d’un catalogue principalement chronologique vers une bibliothèque plus facile à explorer, sans perdre la simplicité actuelle.

---

## 4. Objectif du MVP 5.0

Permettre à un visiteur de trouver rapidement une ressource pertinente à partir :

- d’un texte de recherche;
- du format;
- du niveau;
- du sujet;
- de la série.

À la fin du MVP, un visiteur doit pouvoir :

1. ouvrir Ressources IA;
2. rechercher un terme dans le catalogue;
3. retrouver une ressource même si le terme apparaît dans ses mots-clés plutôt que dans son titre;
4. filtrer par niveau;
5. filtrer par sujet;
6. continuer à filtrer par format;
7. continuer à filtrer par série;
8. combiner plusieurs filtres;
9. voir clairement les filtres actifs;
10. retirer un filtre précis;
11. réinitialiser tous les filtres;
12. connaître le nombre de résultats;
13. obtenir un état vide utile lorsque rien ne correspond;
14. partager ou recharger l’URL filtrée;
15. utiliser Retour et Avancer du navigateur;
16. utiliser le parcours sur mobile;
17. utiliser le parcours au clavier;
18. constater que les séries et ressources existantes continuent de fonctionner;
19. constater qu’aucun brouillon n’apparaît;
20. conserver un catalogue rapide sans nouveau moteur de recherche externe.

Principe central :

> **Utiliser d’abord les métadonnées éditoriales existantes comme facettes de découverte avant de créer une nouvelle taxonomie.**

---

## 5. Principes directeurs

### 5.1 Ne pas créer une table générique `resources`

Le MVP 5.0 conserve les sources spécialisées :

```text
articles
infographics
resource_series
```

Il ne doit pas introduire une nouvelle table universelle uniquement pour permettre la recherche.

La fusion continue de se faire dans une petite couche de lecture publique.

### 5.2 Ne pas créer une taxonomie complète de tags

Le MVP ne doit pas ajouter par défaut :

```text
tags
categories
topics
resource_tags
resource_categories
```

Les propriétés actuelles ont déjà des rôles suffisants :

| Donnée | Rôle |
|---|---|
| `contentType` | format de la ressource |
| `level` | difficulté |
| `seriesName` | parcours éditorial |
| `theme` | sujet principal |
| `keywords[]` | recherche et rapprochement |
| `publishedAt` | ordre général |
| `episodeNumber` | ordre dans une série |

Le terme public recommandé est **Sujet** plutôt que `theme`, mais la propriété persistante peut rester `theme`.

### 5.3 Les mots-clés alimentent la recherche

`keywords[]` ne devient pas, dans cette phase, une longue liste de tags cliquables.

Les mots-clés servent principalement à enrichir le champ :

```text
Rechercher une ressource
```

Ils peuvent permettre par exemple qu’une recherche sur :

```text
vectoriel
```

retrouve une ressource consacrée aux embeddings même si le mot n’est pas dans son titre.

### 5.4 Le niveau est une facette contrôlée

Le niveau repose sur les valeurs existantes :

```text
beginner
intermediate
advanced
```

Affichage français :

```text
Débutant
Intermédiaire
Avancé
```

Aucune nouvelle valeur n’est créée dans ce MVP.

### 5.5 Le sujet reste léger

Le champ `theme` n’est pas encore une taxonomie fermée.

L’incrément 0 doit inventorier les valeurs réellement publiées avant de choisir entre deux stratégies :

#### Stratégie A — valeurs déjà cohérentes

Utiliser directement les thèmes existants comme sujets publics.

#### Stratégie B — variantes ou doublons éditoriaux

Créer une petite configuration de normalisation côté application.

Exemple conceptuel :

```text
"IA générative"
"Intelligence artificielle générative"
→ sujet public : "IA générative"
```

Ne pas modifier les contrats JSON uniquement pour résoudre ce besoin.

Ne pas créer une table de taxonomie tant que l’usage réel ne le justifie pas.

### 5.6 Filtrage côté client en première version

Le catalogue charge déjà un ensemble raisonnable de ressources publiées.

Le MVP 5.0 doit donc privilégier :

```text
charger les ressources publiées
→ adapter vers le modèle commun
→ filtrer en mémoire
```

Cette décision reste valable tant que :

- le nombre de ressources reste modéré;
- le temps de chargement reste bon;
- aucune mesure réelle ne démontre un problème.

Ne pas introduire dans cette phase :

- Elasticsearch;
- Algolia;
- Meilisearch;
- pgvector;
- embeddings de recherche;
- service de recherche dédié;
- endpoint de recherche spécialisé;
- index plein texte complexe.

### 5.7 La recherche ne remplace pas le tri

La recherche filtre les ressources admissibles.

Elle ne crée pas encore un moteur de classement par pertinence complexe.

Après filtrage :

```text
vue générale
→ published_at décroissant

série sélectionnée
→ episode_number croissant
→ ressources sans numéro à la fin
→ published_at croissant
→ titre comme dernier critère stable
```

### 5.8 Tous les filtres se combinent en logique AND

Exemple :

```text
format = article
niveau = intermediate
sujet = rag-recherche
q = evaluation
```

signifie :

```text
Article
ET
Intermédiaire
ET
Sujet RAG/recherche
ET
correspondant à "evaluation"
```

Le visiteur doit toujours comprendre pourquoi une ressource apparaît.

### 5.9 L’état utile est représenté dans l’URL

Conserver les paramètres déjà utilisés et ajouter les nouvelles dimensions.

Forme conceptuelle :

```text
?format=article
&niveau=intermediate
&sujet=rag-recherche
&serie=vocabulaire-ia-generative
&q=embedding
```

Les noms exacts doivent suivre les conventions du dépôt.

Valeurs neutres comme `all` ne doivent pas obligatoirement être sérialisées.

### 5.10 La vue Séries reste distincte

Le MVP 5.0 concerne d’abord l’exploration des **ressources individuelles**.

La vue :

```text
Séries
```

conserve son comportement actuel.

Les filtres :

```text
format
niveau
sujet
serie
q
```

s’appliquent à la vue `Toutes les ressources`.

Lorsque `vue=series`, les filtres de ressources ne doivent pas produire un comportement ambigu.

L’inspection doit choisir le comportement URL le plus cohérent avec l’implantation actuelle, avec la préférence suivante :

- les contrôles de filtrage des ressources sont masqués dans la vue Séries;
- la vue Séries ne simule pas une recherche de séries dans ce MVP;
- l’interface n’émet pas de nouveaux paramètres de filtres lorsqu’elle est en vue Séries.

Une recherche spécialisée des séries pourra être évaluée plus tard.

---

## 6. Modèle public commun

Le MVP 2.0 a déjà introduit le principe d’un modèle public commun minimal pour combiner articles et infographies.

Le MVP 5.0 doit étendre ce modèle uniquement avec les propriétés nécessaires à la découverte.

Forme conceptuelle :

```text
PublicResource
├── id
├── contentType
├── title
├── subtitle
├── summary
├── theme
├── level
├── keywords[]
├── seriesName
├── episodeNumber
├── publishedAt
├── readingTimeMinutes
├── thumbnailUrl
├── thumbnailSources
└── publicUrl
```

La forme exacte dépend de l’implantation actuelle.

### 6.1 Données à ajouter si elles sont absentes

Les adaptateurs publics doivent rendre accessibles au filtrage :

```text
subtitle
keywords
```

si ces propriétés ne sont pas déjà présentes.

### 6.2 Données à ne pas ajouter

Ne pas élargir le modèle commun avec :

- `contentMarkdown`;
- sources complètes;
- citations;
- briefs de génération;
- médias internes;
- chemins de stockage;
- prompts;
- données SEO complètes;
- données administratives.

Le modèle doit rester adapté au catalogue.

### 6.3 Données publiques

Les mots-clés utilisés pour la recherche sont des métadonnées éditoriales.

L’inspection doit confirmer qu’ils peuvent être inclus dans la requête publique sans exposer de données techniques ou privées.

Ils n’ont pas besoin d’être affichés dans les cartes.

---

## 7. Recherche textuelle

## 7.1 Champ de recherche

Libellé recommandé :

```text
Rechercher une ressource
```

Placeholder possible :

```text
RAG, embeddings, agents, contexte...
```

Le champ doit être utilisable sans bouton `Rechercher`.

La liste peut se mettre à jour pendant la saisie puisque le filtrage est local.

## 7.2 Champs recherchés

Pour la première version, la recherche porte sur :

```text
title
subtitle
summary
theme
seriesName
keywords[]
```

Ne pas rechercher dans :

```text
contentMarkdown
sources
citations
SEO
briefs
altText
```

Cette limitation réduit le bruit et évite de charger du contenu lourd uniquement pour le catalogue.

## 7.3 Normalisation

La recherche doit être au minimum :

- insensible à la casse;
- insensible aux accents;
- tolérante aux espaces multiples;
- tolérante aux espaces au début et à la fin.

Exemple :

```text
generative
```

peut correspondre à :

```text
générative
```

si la normalisation retenue retire les signes diacritiques.

### 7.4 Recherche multi-termes

Approche recommandée :

```text
chaîne normalisée
→ découpage en termes utiles
→ chaque terme doit être présent quelque part
   dans le texte de recherche de la ressource
```

Exemple :

```text
rag documents
```

peut correspondre si :

- `rag` est dans le titre;
- `documents` est dans le résumé ou les mots-clés.

Une logique de score de pertinence est reportée.

### 7.5 Ordre des résultats

La recherche ne modifie pas le tri général.

Elle filtre l’ensemble puis applique les règles de tri existantes.

### 7.6 Historique navigateur

La saisie caractère par caractère ne doit pas créer des dizaines d’entrées dans l’historique.

Comportement recommandé :

```text
q modifié pendant la saisie
→ mise à jour URL par replace

sélection d’un filtre structuré
→ navigation selon la convention existante
```

L’inspection doit vérifier les helpers actuels du routeur avant l’implantation.

### 7.7 Absence de recherche avancée

Le MVP ne doit pas ajouter :

- opérateurs booléens;
- guillemets de phrase;
- autocomplétion distante;
- suggestions IA;
- correction orthographique complexe;
- stemming linguistique;
- synonymes administrables;
- classement ML;
- recherche sémantique.

---

## 8. Filtres publics

## 8.1 Format

Conserver le filtre existant :

```text
Tous
Infographies
Articles
```

Il reste distinct de la vue `Toutes les ressources / Séries`.

## 8.2 Niveau

Ajouter :

```text
Niveau
├── Tous les niveaux
├── Débutant
├── Intermédiaire
└── Avancé
```

Paramètre conceptuel :

```text
niveau=beginner
```

La valeur interne doit rester celle du contrat.

## 8.3 Sujet

Ajouter :

```text
Sujet
├── Tous les sujets
├── ...
└── ...
```

Le contenu réel est déterminé à partir des thèmes publiés et de l’éventuelle normalisation décidée à l’inspection.

Règles :

- ne proposer que des sujets possédant au moins une ressource publiée;
- ne pas inventer de catégorie vide;
- utiliser un identifiant URL stable et normalisé;
- afficher un libellé humain en français;
- conserver une architecture permettant les traductions selon les conventions existantes.

## 8.4 Série

Conserver le filtre existant :

```text
Série
→ Toutes les séries
→ séries possédant des ressources publiées
```

Le filtre de série reste combinable avec les autres facettes.

## 8.5 Combinaison

Ordre logique :

```text
ressources publiées
→ recherche
→ format
→ niveau
→ sujet
→ série
→ tri
```

L’ordre interne exact des filtres n’affecte pas le résultat si toutes les opérations sont des intersections.

---

## 9. Interface publique cible

## 9.1 Structure générale

Sous l’introduction et le contrôle :

```text
[Toutes les ressources] [Séries]
```

la vue `Toutes les ressources` contient :

```text
[ Rechercher une ressource........................ ]

[Format] [Niveau] [Sujet] [Série]

[Filtres actifs...]

N ressources

[grille]
```

La disposition réelle peut utiliser les composants existants.

## 9.2 Desktop

Disposition recommandée :

```text
Recherche sur une ligne
Filtres sur une ligne ou deux lignes
Résultat et réinitialisation sous les filtres
```

Éviter une barre trop dense ressemblant à un dashboard d’entreprise.

## 9.3 Mobile

Ne pas créer un drawer complexe sans nécessité.

Première approche recommandée :

```text
Recherche pleine largeur
Filtres empilés ou en grille 2 colonnes lorsque possible
Filtres actifs avec retour à la ligne
```

Si l’inspection montre que les contrôles occupent trop d’espace à environ 390 px, un bouton simple `Filtres` peut être évalué à l’incrément 3.

### 9.4 Filtres actifs

Lorsqu’au moins un filtre est actif, afficher des repères supprimables.

Exemple :

```text
[Articles ×] [Intermédiaire ×] [RAG et recherche ×]
```

Le texte de recherche peut être représenté par :

```text
[Recherche : embedding ×]
```

si cela reste lisible.

### 9.5 Tout effacer

Afficher :

```text
Tout effacer
```

seulement lorsqu’au moins un filtre ou une recherche est actif.

L’action revient à l’état neutre de `Toutes les ressources`.

### 9.6 Nombre de résultats

Afficher un compte simple :

```text
18 ressources
1 ressource
Aucune ressource
```

Le nombre représente les ressources après tous les filtres.

Le comptage ne doit inclure aucun brouillon.

### 9.7 État vide

Si aucune ressource ne correspond :

```text
Aucune ressource ne correspond à ces critères.
```

Actions possibles :

```text
Effacer les filtres
```

ou :

```text
Voir toutes les ressources
```

Ne pas proposer automatiquement de contenu hors critères dans la grille vide.

### 9.8 Série mise en vedette

La série mise en vedette de la vue générale demeure visible seulement lorsque le catalogue est dans son état neutre.

Masquer la section lorsqu’au moins un des éléments suivants est actif :

```text
q
format spécifique
niveau
sujet
serie
```

Raison :

> Lorsqu’un visiteur filtre, le contenu principal de la page doit représenter exclusivement le résultat de sa recherche.

---

## 10. Paramètres d’URL

Les paramètres existants doivent être conservés selon leur convention réelle.

Forme conceptuelle cible :

```text
/ressources-ia
/ressources-ia?format=article
/ressources-ia?niveau=beginner
/ressources-ia?sujet=rag-recherche
/ressources-ia?serie=les-fondamentaux
/ressources-ia?q=embedding
```

Combinaison :

```text
/ressources-ia?format=article&niveau=intermediate&sujet=rag-recherche&q=evaluation
```

### 10.1 Valeurs inconnues

Si un paramètre possède une valeur inconnue :

- ne pas faire échouer la page;
- ignorer la valeur invalide ou utiliser l’état neutre;
- ne pas afficher un filtre actif inexistant;
- préserver les autres paramètres valides.

### 10.2 Recherche vide

Les valeurs suivantes sont équivalentes à aucune recherche :

```text
q absent
q=""
q composé uniquement d’espaces
```

Éviter de conserver `?q=` dans une URL normalisée si les helpers existants permettent de l’enlever proprement.

### 10.3 Ordre des paramètres

Aucune logique métier ne doit dépendre de l’ordre des paramètres.

### 10.4 URL partageable

Copier ou partager l’URL depuis le navigateur doit reproduire l’état courant des filtres.

Le bouton public `Partager` d’une ressource détaillée n’est pas modifié par cette phase.

---

## 11. SEO et indexation des filtres

Les combinaisons de filtres sont des états d’interface, pas de nouvelles pages éditoriales.

Le MVP 5.0 ne doit pas créer :

- une entrée sitemap par filtre;
- une page SEO par sujet;
- une page SEO par niveau;
- une page SEO par mot-clé;
- des URLs de facettes présentées comme contenus éditoriaux autonomes.

La page canonique du catalogue reste la route principale Ressources IA selon le mécanisme SEO déjà en place.

Une future phase pourra créer de vraies pages éditoriales de sujet si un besoin SEO et pédagogique est démontré. Ces pages seraient différentes de simples paramètres de filtre.

---

## 12. Performance

### 12.1 Première stratégie

Filtrage en mémoire sur le tableau public commun.

Utiliser les outils React existants et une fonction pure, par exemple conceptuellement :

```text
applyResourceFilters(resources, state)
```

Une mémorisation simple est suffisante si nécessaire.

### 12.2 Données légères

Ne pas charger le Markdown complet pour permettre la recherche.

Les données supplémentaires attendues sont limitées à :

```text
subtitle
keywords
```

et éventuellement une clé de sujet dérivée.

### 12.3 Aucun debounce réseau

Puisque la recherche est locale :

- aucune requête n’est déclenchée à chaque caractère;
- aucun debounce réseau n’est nécessaire.

Une petite temporisation UX n’est pas interdite si un composant existant l’impose, mais elle n’est pas requise.

### 12.4 Critère de migration future

Réévaluer une recherche serveur seulement si une mesure réelle montre notamment :

- un temps de chargement du catalogue problématique;
- plusieurs centaines de ressources;
- un besoin de pagination serveur;
- un besoin de recherche dans le corps des articles;
- un besoin de classement par pertinence;
- un besoin de synonymes ou recherche sémantique.

---

## 13. Accessibilité

### 13.1 Recherche

Le champ possède :

- un vrai label accessible;
- un focus visible;
- une action claire pour effacer le texte lorsque présente;
- aucune dépendance au placeholder comme seul libellé.

### 13.2 Filtres

Les sélecteurs possèdent des labels explicites :

```text
Format
Niveau
Sujet
Série
```

Le sens ne dépend pas uniquement d’une icône.

### 13.3 Filtres actifs

Un filtre supprimable doit annoncer clairement l’action.

Exemple conceptuel :

```text
Retirer le filtre Niveau : Intermédiaire
```

### 13.4 Résultats

Le nombre de résultats peut être placé dans une zone accessible permettant d’annoncer une variation raisonnable.

Éviter toutefois une annonce trop agressive à chaque caractère tapé.

### 13.5 Clavier

Le visiteur doit pouvoir :

- atteindre la recherche;
- modifier chaque filtre;
- retirer les filtres actifs;
- utiliser `Tout effacer`;
- atteindre ensuite la grille;
- ouvrir une ressource.

### 13.6 État vide

L’état vide doit être compréhensible sans couleur ni illustration.

---

## 14. Gestion des thèmes / sujets

Le sujet est le seul élément du MVP 5.0 pouvant révéler une incohérence éditoriale dans les données actuelles.

### 14.1 Inspection obligatoire

Avant d’implanter le filtre Sujet, produire l’inventaire des valeurs `theme` publiées dans :

```text
articles
infographics
```

Relever :

- doublons exacts;
- différences de casse;
- différences d’accents;
- singulier/pluriel;
- synonymes évidents;
- thèmes trop larges;
- thèmes trop précis;
- valeurs utilisées une seule fois;
- incohérences entre articles et infographies.

### 14.2 Solution minimale

Si une harmonisation est nécessaire, préférer un module de configuration simple.

Forme conceptuelle :

```text
RESOURCE_TOPIC_GROUPS
```

Chaque groupe contient seulement ce qui est nécessaire :

```text
key
labelKey
themeValues
```

Exemple conceptuel :

```text
key: "rag-recherche"
label: "RAG et recherche"
themeValues:
- "RAG"
- "Recherche sémantique"
```

Cet exemple est illustratif. Les vraies valeurs doivent provenir de l’inventaire.

### 14.3 Pas de migration automatique des données

Ne pas réécrire en masse les thèmes dans la base uniquement pour lancer ce filtre.

Christian peut décider ultérieurement de normaliser les données éditoriales à la source si la configuration devient trop importante.

### 14.4 Critère d’alerte

Si l’inventaire démontre que `theme` est trop incohérent pour produire des sujets publics crédibles sans une taxonomie beaucoup plus complexe :

- ne pas improviser;
- terminer l’incrément 1 avec recherche + niveau;
- présenter le constat;
- décider avec Christian avant l’incrément 2.

---

## 15. Aucune modification des contrats JSON par défaut

Le MVP 5.0 utilise les propriétés déjà prévues.

Ne pas ajouter :

```text
topic
topicSlug
tags
searchText
searchVector
filterCategory
```

aux contrats JSON.

Une nouvelle propriété ne serait justifiée que si l’inspection démontrait qu’un besoin fonctionnel essentiel est impossible à représenter avec :

```text
theme
keywords
level
series
contentType
```

Ce scénario est peu probable et doit être explicitement soumis à Christian avant modification.

---

## 16. Aucune migration par défaut

La phase ne prévoit normalement aucune migration Supabase.

L’inspection doit confirmer :

- où `keywords` est stocké pour chaque format;
- si les requêtes publiques peuvent déjà le récupérer;
- si les index actuels sont suffisants pour le chargement du catalogue.

Puisque le filtrage initial est côté client, aucun index de recherche supplémentaire n’est nécessaire par défaut.

Une migration doit être justifiée avant toute modification.

---

## 17. Gestion des erreurs et états incomplets

### Ressource sans niveau

- reste visible avec `Tous les niveaux`;
- n’apparaît pas lorsqu’un niveau précis est sélectionné.

### Ressource sans thème

- reste visible avec `Tous les sujets`;
- n’apparaît pas lorsqu’un sujet précis est sélectionné.

### Ressource sans mots-clés

- reste recherchable par titre, sous-titre, résumé, thème et série;
- aucune erreur.

### Ressource sans sous-titre

- recherche simplement dans les autres champs.

### Ressource sans série

- reste visible dans le catalogue général;
- n’apparaît pas lorsqu’une série précise est sélectionnée.

### Paramètre URL inconnu

- ignorer proprement;
- ne pas faire échouer la page.

### Recherche sans résultat

- afficher l’état vide;
- conserver les contrôles pour permettre l’ajustement.

### Erreur de chargement du catalogue

- conserver l’état d’erreur existant;
- ne pas afficher zéro résultat comme si la requête avait réussi.

---

# 18. Découpage du développement

Le MVP 5.0 est découpé en **trois incréments fonctionnels**, précédés d’une inspection ciblée.

```text
Inspection
→ recherche + niveau
→ sujet + filtres combinés
→ robustesse, accessibilité et finalisation
```

---

## Incrément 0 — Inspection ciblée du catalogue actuel

### Objectif

Confirmer l’implantation réelle après les phases précédentes et déterminer le chemin minimal pour exploiter les métadonnées existantes.

### Documents à lire

```text
GUIDE_DEVELOPPEMENT_MVP_5_0_DECOUVERTE_FILTRAGE_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_1_1_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_2_0_ARTICLES_RESSOURCES_IA.md
CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md
CONTRAT_JSON_RESSOURCES_IA_V1.md
```

### À inspecter

- état Git, branche, remotes et derniers commits;
- état réel de la page `/ressources-ia`;
- composant principal du catalogue;
- contrôle `Toutes les ressources / Séries`;
- filtre de format;
- filtre de série;
- paramètres d’URL actuellement utilisés;
- helpers de lecture et écriture des search params;
- composant de carte public;
- adaptateur public des articles;
- adaptateur public des infographies;
- structure réelle du modèle commun;
- requête publique des articles;
- requête publique des infographies;
- présence réelle de `subtitle`, `theme`, `level`, `keywords`;
- type réel de stockage des mots-clés;
- valeurs réelles de `level`;
- valeurs réelles de `theme`;
- qualité réelle des `keywords`;
- nombre actuel de ressources publiées;
- ordre actuel du catalogue;
- ordre actuel lors d’un filtre de série;
- comportement de la série mise en vedette;
- états chargement, erreur et vide;
- responsive à 1440, 768 et environ 390 px;
- conventions de traduction;
- composants de formulaire/select existants;
- tests existants;
- helpers de normalisation de texte éventuellement présents.

### Inventaire obligatoire des thèmes

Produire la liste des valeurs de thème réellement utilisées dans les ressources publiées, avec :

```text
theme
nombre d’articles
nombre d’infographies
nombre total
variantes proches éventuelles
```

### Questions à résoudre

1. Quel est le modèle public commun réel?
2. `keywords` est-il déjà chargé publiquement pour les deux formats?
3. Faut-il seulement étendre les `select` publics existants?
4. Où centraliser la logique de filtrage?
5. Existe-t-il déjà une fonction de normalisation des accents?
6. Comment le routeur met-il à jour les search params?
7. Comment éviter une entrée d’historique à chaque caractère de recherche?
8. Quels thèmes peuvent être utilisés directement?
9. Quels thèmes doivent être regroupés?
10. Une simple configuration de sujets est-elle suffisante?
11. Les filtres doivent-ils être représentés par des `select` natifs ou composants existants?
12. Comment le mode `vue=series` traite-t-il les paramètres de ressources?
13. Comment masquer la série mise en vedette lorsqu’un filtre est actif?
14. Le volume actuel justifie-t-il toujours un filtrage client?
15. Une migration est-elle réellement nécessaire?
16. Quels tests peuvent protéger les fonctions pures sans tester les classes CSS?

### Décisions attendues

Le rapport doit préciser :

- fichiers exacts à modifier;
- modèle commun réel;
- propriétés à ajouter au modèle commun;
- requêtes publiques à ajuster;
- fonction de recherche retenue;
- stratégie de normalisation;
- paramètres d’URL retenus;
- stratégie d’historique navigateur;
- inventaire des thèmes;
- stratégie de sujets;
- comportement de la vue Séries;
- comportement de la série mise en vedette;
- besoin ou absence de migration;
- périmètre précis de l’incrément 1.

### Résultat visible

Aucun changement public.

### Hors périmètre

- aucune modification de code;
- aucune migration;
- aucune nouvelle dépendance;
- aucune modification de données;
- aucun nouveau thème;
- aucun refactoring;
- aucun commit;
- aucun push.

### Critères d’acceptation

- le catalogue actuel est documenté;
- la couche commune est identifiée;
- les champs recherchables sont confirmés;
- les valeurs de thème sont inventoriées;
- la stratégie de sujet est décidée ou explicitement bloquée;
- la stratégie URL est précise;
- le périmètre de l’incrément 1 est clair;
- aucune architecture de recherche disproportionnée n’est proposée.

---

## Incrément 1 — Recherche textuelle et filtre par niveau

### Objectif

Apporter immédiatement deux moyens de découverte à forte valeur sans dépendre encore de la normalisation des thèmes.

### Inclus

- extension minimale du modèle public commun pour inclure les champs de recherche nécessaires;
- récupération de `subtitle` si nécessaire;
- récupération de `keywords` si nécessaire;
- helper de normalisation textuelle;
- helper de construction du texte de recherche;
- fonction pure de recherche;
- champ `Rechercher une ressource`;
- recherche sur :
  - titre;
  - sous-titre;
  - résumé;
  - thème;
  - série;
  - mots-clés;
- recherche insensible à la casse;
- recherche insensible aux accents;
- recherche multi-termes simple;
- paramètre `q`;
- mise à jour de `q` sans pollution de l’historique;
- filtre `Niveau`;
- valeurs `beginner`, `intermediate`, `advanced`;
- paramètre `niveau`;
- combinaison avec :
  - format;
  - série;
  - recherche;
- nombre de résultats;
- état vide;
- action `Tout effacer`;
- masquage de la série mise en vedette lorsqu’un filtre est actif;
- traductions FR/EN selon les conventions existantes;
- responsive;
- tests ciblés.

### Résultat visible

> Le visiteur peut rechercher « embeddings » ou « vectoriel », puis limiter les résultats au niveau Débutant, tout en combinant le format ou la série.

### Hors périmètre

- filtre Sujet;
- nouvelle taxonomie;
- tags publics;
- recherche dans le Markdown;
- classement par pertinence;
- moteur serveur;
- pagination;
- recommandations;
- autocomplétion;
- modification des contrats JSON.

### Critères d’acceptation fonctionnels

- une recherche vide affiche le catalogue normal;
- la casse n’affecte pas le résultat;
- les accents n’affectent pas le résultat;
- une correspondance dans `keywords` peut faire apparaître une ressource;
- une ressource sans `keywords` reste recherchable;
- `niveau=beginner` affiche seulement les ressources débutantes;
- une ressource sans niveau reste visible lorsque le filtre est neutre;
- format + niveau fonctionnent ensemble;
- série + niveau fonctionnent ensemble;
- recherche + série fonctionnent ensemble;
- recherche + format + niveau + série fonctionnent ensemble;
- la série sélectionnée conserve son tri par épisode;
- la vue générale conserve son tri par publication;
- le compteur représente l’ensemble filtré;
- zéro résultat ne produit pas une page vide ambiguë;
- `Tout effacer` revient à l’état neutre;
- les search params sont partageables;
- Retour/Avancer conserve un comportement cohérent;
- une saisie de recherche ne crée pas une entrée historique par caractère;
- les brouillons restent exclus;
- la vue Séries continue de fonctionner;
- le build et les tests ciblés réussissent.

### Tests ciblés recommandés

- normalisation de casse;
- normalisation des accents;
- espaces multiples;
- recherche par titre;
- recherche par résumé;
- recherche par thème;
- recherche par série;
- recherche par keyword;
- recherche multi-termes;
- niveau valide;
- niveau inconnu;
- combinaison des filtres;
- ressource sans niveau;
- ressource sans keywords;
- ordre général;
- ordre d’une série;
- détection de filtre actif;
- sérialisation et lecture de `q`;
- sérialisation et lecture de `niveau`.

### Vérification manuelle

Tester au minimum :

- recherche `RAG`;
- recherche sur un mot-clé absent du titre;
- recherche avec accent puis sans accent;
- chaque niveau;
- article seulement;
- infographie seulement;
- une série;
- plusieurs filtres combinés;
- zéro résultat;
- `Tout effacer`;
- rechargement de l’URL;
- Retour/Avancer;
- viewport 1440, 768 et environ 390 px.

---

## Incrément 2 — Filtre Sujet et expérience combinée des facettes

### Objectif

Ajouter le filtre Sujet à partir de l’inventaire réel des thèmes et consolider l’expérience complète de filtrage.

### Prérequis

L’incrément 0 doit avoir conclu qu’une représentation publique des sujets est suffisamment claire.

Si ce prérequis n’est pas satisfait :

- ne pas inventer une taxonomie;
- produire un blocage explicite;
- proposer les options de normalisation à Christian.

### Inclus

- configuration de sujets si nécessaire;
- mapping des thèmes existants lorsque nécessaire;
- clé URL stable du sujet;
- filtre `Sujet`;
- paramètre `sujet`;
- sujets limités aux ressources publiées;
- combinaison avec :
  - recherche;
  - format;
  - niveau;
  - série;
- affichage des filtres actifs;
- suppression individuelle d’un filtre;
- `Tout effacer`;
- ajustement de la hiérarchie visuelle de la zone de filtres;
- conservation du compteur;
- conservation de l’état vide;
- masquage de la série mise en vedette lorsque nécessaire;
- traductions;
- tests ciblés;
- vérification du rendu avec plusieurs combinaisons.

### Résultat visible

> Le visiteur peut demander : « Articles · Intermédiaire · RAG et recherche » puis ajouter une recherche textuelle ou sélectionner une série, tout en voyant clairement ses critères actifs.

### Hors périmètre

- nouvelle table de sujets;
- administration des sujets;
- tags cliquables;
- modification du contrat JSON;
- réécriture massive des thèmes;
- page SEO de sujet;
- recommandations;
- recherche sémantique;
- pagination.

### Critères d’acceptation

- chaque sujet proposé possède au moins une ressource publiée;
- aucun sujet vide n’est affiché;
- un thème inconnu ne fait pas échouer le catalogue;
- `sujet` possède une valeur URL stable;
- une URL avec sujet valide restaure le filtre;
- une valeur sujet inconnue est ignorée proprement;
- sujet + niveau fonctionnent ensemble;
- sujet + format fonctionnent ensemble;
- sujet + série fonctionnent ensemble;
- sujet + recherche fonctionnent ensemble;
- tous les filtres peuvent être combinés;
- chaque filtre actif peut être retiré indépendamment;
- retirer un filtre préserve les autres;
- `Tout effacer` réinitialise tout;
- la série mise en vedette revient lorsque l’état redevient neutre;
- le catalogue ne change pas les données éditoriales;
- aucun brouillon n’est exposé;
- le build et les tests ciblés réussissent.

### Tests ciblés recommandés

- génération des sujets disponibles;
- mapping d’un thème vers un sujet;
- thème non mappé;
- sujet sans ressource publiée;
- paramètre sujet valide;
- paramètre sujet inconnu;
- combinaison sujet + niveau;
- combinaison sujet + format;
- combinaison sujet + série;
- combinaison sujet + recherche;
- suppression individuelle d’un filtre;
- réinitialisation complète;
- détection d’état neutre.

### Vérification manuelle

Tester au minimum :

- chaque sujet public;
- une ressource article et une infographie du même sujet lorsque disponibles;
- plusieurs filtres actifs;
- suppression des chips;
- `Tout effacer`;
- actualisation de l’URL;
- lien copié dans un nouvel onglet;
- desktop, tablette et mobile.

---

## Incrément 3 — Robustesse, accessibilité et finalisation

### Objectif

Valider la découverte sur un catalogue réel, corriger seulement les problèmes observés et préparer la clôture de la phase.

### Banc d’essai minimal

Tester :

- plusieurs articles;
- plusieurs infographies;
- plusieurs niveaux;
- plusieurs sujets;
- au moins une série;
- au moins une ressource hors série;
- une ressource sans mot-clé si elle existe;
- une ressource sans thème ou niveau si elle existe;
- recherche avec accents;
- recherche sans accents;
- recherche multi-termes;
- zéro résultat;
- URL invalide partielle;
- navigation Retour/Avancer;
- vue Séries;
- mobile.

### Inclus

- validation de la hiérarchie finale des contrôles;
- validation du comportement de la vue Séries;
- validation de la série mise en vedette;
- validation des paramètres d’URL;
- validation des états invalides;
- validation du nombre de résultats;
- validation clavier;
- validation des labels accessibles;
- validation des annonces de résultats;
- validation du focus;
- validation responsive;
- petites corrections UX directement liées aux filtres;
- vérification du poids des données du catalogue;
- vérification du temps de filtrage;
- vérification qu’aucun contenu lourd n’a été ajouté inutilement;
- build;
- lint ciblé;
- tests ciblés;
- documentation des limites restantes;
- vérification de l’état Git.

### Décisions à confirmer à la finalisation

Évaluer, sans les ajouter automatiquement :

```text
Affichage de tags publics
Bouton mobile repliable "Filtres"
Recherche de séries
Pages éditoriales par sujet
Pagination
Recherche serveur
Recherche dans le corps des articles
Classement par pertinence
```

Ces points restent hors périmètre sauf correction indispensable révélée par l’usage.

### Résultat visible

> Ressources IA se comporte comme une bibliothèque pédagogique exploratoire : le visiteur peut chercher, filtrer, combiner des critères, partager l’URL obtenue et revenir facilement au catalogue complet.

### Hors périmètre

- nouveau moteur de recherche;
- algorithme de recommandation;
- embeddings de recherche;
- tags éditoriaux administrables;
- taxonomie en base de données;
- pagination sans besoin mesuré;
- nouvelle version des contrats JSON;
- modification de la production éditoriale;
- modification des workflows d’images;
- refonte de la page de série.

### Critères d’acceptation

- la recherche est utile avec les ressources réelles;
- les keywords enrichissent effectivement certains résultats;
- les résultats correspondent toujours aux filtres affichés;
- les filtres combinés restent compréhensibles;
- le nombre de résultats est exact;
- l’état vide est clair;
- les filtres actifs sont faciles à retirer;
- l’URL restaure l’état;
- Retour/Avancer fonctionne;
- la vue Séries reste cohérente;
- la série mise en vedette ne parasite pas une recherche active;
- la page reste utilisable au clavier;
- le mobile reste lisible;
- aucun brouillon n’apparaît;
- aucun Markdown complet n’est chargé pour la recherche;
- aucune dépendance importante n’a été ajoutée;
- aucune migration non justifiée n’a été introduite;
- le build réussit;
- le lint ciblé réussit;
- les tests ciblés réussissent;
- Christian valide le résultat réel.

---

# 19. Tableau de progression

| Incrément | Résultat fonctionnel | État | Commit |
|---|---|---|---|
| 0 | Inspection du catalogue, des métadonnées et des thèmes | À faire | — |
| 1 | Recherche textuelle et filtre par niveau | À faire | — |
| 2 | Filtre Sujet et facettes combinées | À faire | — |
| 3 | Robustesse, accessibilité et finalisation | À faire | — |

États recommandés :

```text
À faire
En cours
À valider
Accepté
Bloqué
```

---

# 20. Discipline pour chaque session Codex

Chaque prompt Codex doit préciser :

1. le résultat visible attendu;
2. les documents de référence à lire;
3. l’état Git requis;
4. l’incrément unique à réaliser;
5. les fichiers ou zones à inspecter;
6. les éléments inclus;
7. les éléments hors périmètre;
8. les invariants du catalogue;
9. les invariants de visibilité publique;
10. les invariants des paramètres d’URL;
11. les invariants des contrats JSON;
12. les invariants de performance;
13. les exigences d’accessibilité;
14. les validations techniques;
15. le scénario manuel à vérifier;
16. le rapport final attendu;
17. l’interdiction de commit ou push sauf demande explicite.

Le rapport final doit contenir :

- résultat obtenu;
- décisions techniques;
- fichiers créés ou modifiés;
- migration éventuelle et justification;
- modèle public commun utilisé;
- données ajoutées aux requêtes publiques;
- fonctions de recherche et filtrage;
- paramètres d’URL;
- stratégie de normalisation;
- stratégie de sujet;
- comportement de la vue Séries;
- comportement de la série mise en vedette;
- accessibilité;
- responsive;
- commandes exécutées;
- tests exécutés;
- vérification manuelle effectuée ou restant à faire;
- limites connues;
- état Git;
- résumé du diff;
- aucun push sans demande explicite.

Codex ne doit pas :

- commencer l’incrément suivant;
- créer une table générique `resources`;
- créer une table de tags;
- créer une table de catégories;
- modifier les contrats JSON sans validation;
- modifier en masse les thèmes sans demande;
- charger le Markdown complet dans le catalogue;
- ajouter un moteur de recherche externe;
- ajouter une recherche vectorielle;
- ajouter une dépendance majeure sans justification issue de l’inspection;
- créer une page SEO par facette;
- ajouter de la pagination sans besoin mesuré;
- modifier les pages détaillées sans nécessité;
- modifier les workflows d’images;
- refactoriser des zones étrangères;
- effectuer un commit ou push sans demande explicite.

---

# 21. Invariants critiques

Pendant tout le MVP 5.0 :

- les articles restent un format spécialisé;
- les infographies restent un format spécialisé;
- aucune table générique `resources` n’est créée;
- les séries restent indépendantes du format;
- la vue Séries reste distincte des filtres de ressources;
- les contrats JSON restent inchangés par défaut;
- les données existantes demeurent la source de vérité;
- `level` conserve ses valeurs actuelles;
- `theme` reste la métadonnée éditoriale principale de sujet;
- `keywords` sert principalement à la recherche;
- aucun système parallèle de tags n’est créé;
- les filtres se combinent en logique AND;
- la recherche ne modifie pas le tri existant;
- le tri général reste par publication décroissante;
- le tri d’une série reste par épisode;
- les brouillons restent invisibles;
- les ressources retirées restent exclues;
- une valeur manquante ne casse pas le catalogue;
- une valeur URL invalide ne casse pas la page;
- l’état des filtres utiles demeure partageable;
- la saisie de recherche ne pollue pas l’historique navigateur;
- la série mise en vedette est masquée pendant un filtrage actif;
- aucun contenu Markdown complet n’est chargé pour la recherche;
- le filtrage reste côté client tant qu’aucune mesure ne justifie le contraire;
- aucune recherche sémantique n’est ajoutée dans cette phase;
- aucune dépendance majeure n’est ajoutée sans nécessité;
- aucune migration n’est ajoutée sans justification;
- aucun workflow d’image ou de publication n’est modifié;
- chaque incrément est validé avant le suivant;
- Christian conserve la décision finale sur la normalisation éditoriale des sujets.

---

# 22. Critères de clôture du MVP 5.0

La phase est terminée lorsqu’un visiteur peut :

1. ouvrir Ressources IA;
2. voir la vue générale normale sans filtre;
3. rechercher un titre;
4. rechercher un terme présent dans un résumé;
5. rechercher un terme présent uniquement dans les mots-clés;
6. rechercher sans se soucier des majuscules;
7. rechercher avec ou sans accents;
8. filtrer Débutant;
9. filtrer Intermédiaire;
10. filtrer Avancé;
11. filtrer les Articles;
12. filtrer les Infographies;
13. filtrer une série;
14. filtrer un sujet;
15. combiner format et niveau;
16. combiner niveau et sujet;
17. combiner sujet et série;
18. combiner recherche, format, niveau, sujet et série;
19. voir le nombre de résultats;
20. voir les filtres actifs;
21. retirer un filtre précis;
22. effacer tous les filtres;
23. obtenir un état vide clair;
24. copier une URL filtrée;
25. ouvrir cette URL dans un nouvel onglet et retrouver le même état;
26. utiliser Retour et Avancer;
27. constater que le tri général reste cohérent;
28. constater qu’une série filtrée reste ordonnée par épisode;
29. constater que la série mise en vedette disparaît pendant une recherche;
30. revenir à l’état neutre et revoir la série mise en vedette;
31. passer à la vue Séries sans comportement ambigu;
32. revenir à Toutes les ressources;
33. utiliser la recherche et les filtres au clavier;
34. utiliser le catalogue sur mobile;
35. constater qu’aucun brouillon n’apparaît;
36. constater qu’aucun contenu lourd n’a été ajouté inutilement;
37. exécuter le build avec succès;
38. exécuter le lint ciblé avec succès;
39. exécuter les tests ciblés avec succès;
40. valider fonctionnellement l’expérience réelle.

---

# 23. Évolutions volontairement reportées

À réévaluer seulement après utilisation du MVP 5.0 :

- tags publics cliquables;
- administration d’une taxonomie;
- table `resource_tags`;
- table `resource_topics`;
- pages éditoriales de sujets;
- filtres multiples sur plusieurs sujets;
- recherche dans le corps complet des articles;
- recherche plein texte PostgreSQL;
- classement par pertinence;
- recherche floue;
- synonymes configurables;
- autocomplétion;
- suggestions de recherche;
- historique des recherches;
- recherche sémantique;
- embeddings du catalogue;
- pgvector;
- moteur externe;
- recherche par source;
- recherche par date;
- filtre par durée de lecture;
- filtre par série multiple;
- recherche dédiée aux séries;
- recommandations;
- ressources similaires;
- favoris;
- progression utilisateur;
- analytics détaillés des recherches;
- statistiques des filtres;
- pagination;
- chargement infini;
- pages de destination SEO générées à partir des filtres.

La priorité reste un flux simple :

```text
Ouvrir Ressources IA
→ chercher ou choisir quelques facettes
→ comprendre les critères actifs
→ trouver la ressource pertinente
→ ouvrir la ressource
```

---

# 24. Principe final

Le MVP 5.0 doit faire évoluer la bibliothèque sans créer un moteur de recherche ou un CMS prématuré.

Architecture cible :

```text
Articles spécialisés ───────┐
                            │
Infographies spécialisées ─┤
                            ↓
                 Modèle public commun léger
                            ↓
              Recherche + filtres en mémoire
                            ↓
                 État représenté dans l’URL
                            ↓
                   Catalogue filtré
```

La phase est réussie si la croissance de Ressources IA reste facile à explorer avec les métadonnées déjà disponibles, tout en préservant l’architecture simple et spécialisée construite dans les MVP précédents.
