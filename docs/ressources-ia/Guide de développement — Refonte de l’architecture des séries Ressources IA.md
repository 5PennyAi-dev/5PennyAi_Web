# Guide de développement — Refonte de l’architecture des séries Ressources IA

**Projet :** 5PennyAi
**Section :** Ressources IA
**Évolution :** séries persistantes, associations multiples et gestion administrative
**Statut :** conception fonctionnelle prête à être inspectée puis implantée par incréments

---

# 1. Rôle du document

Ce guide encadre la refonte de l’architecture des **séries** dans la section Ressources IA.

L’architecture actuelle a été construite progressivement :

```text
series_name + episode_number sur les ressources
→ regroupement côté application
→ page publique de série
→ table resource_series minimale pour le thumbnail
```

Cette approche était adaptée au MVP initial. La table `resource_series` actuelle ne contient toutefois que l’identité minimale de la série et son thumbnail; l’appartenance des ressources demeure stockée dans `series_name` et `episode_number`.

Cette architecture présente maintenant plusieurs limites :

- le nom de série est saisi comme texte libre;
- une faute de frappe peut créer un regroupement distinct;
- le nom sert indirectement d’identité;
- une ressource ne peut appartenir proprement qu’à une seule série;
- `episode_number` est stocké sur la ressource alors qu’il représente sa position dans une série;
- une série ne possède pas encore de description ou d’objectif éditorial;
- l’administration ne permet pas de créer et gérer explicitement les séries.

La nouvelle architecture doit transformer la série en **entité éditoriale persistante**, puis représenter l’appartenance d’une ressource à une série par une relation dédiée.

Principe central :

```text
Le contenu décrit la ressource.
L’application organise les ressources en séries.
```

---

# 2. Objectif

À la fin de cette évolution, Christian doit pouvoir :

1. créer une série indépendamment de ses ressources;
2. lui attribuer un nom;
3. lui attribuer un slug stable;
4. lui fournir une description;
5. lui fournir un objectif pédagogique;
6. conserver ou remplacer son thumbnail;
7. modifier son nom sans modifier automatiquement son identité ou son URL;
8. associer une infographie à zéro, une ou plusieurs séries;
9. associer un article à zéro, une ou plusieurs séries;
10. définir une position différente pour la même ressource dans chaque série;
11. retirer une ressource d’une série sans modifier son contenu;
12. gérer les associations depuis l’administration;
13. afficher correctement les séries dans le catalogue;
14. filtrer le catalogue par série;
15. ouvrir une page de série;
16. parcourir les ressources dans l’ordre défini;
17. naviguer précédent/suivant dans le contexte de chaque série;
18. conserver les séries mixtes Articles + Infographies;
19. empêcher toute création implicite de série à partir d’un texte libre;
20. empêcher tout import JSON de créer ou d’associer automatiquement une série;
21. migrer les séries actuelles sans perte de données;
22. retirer ensuite `series_name` et `episode_number` comme sources de vérité.

---

# 3. Principes directeurs

## 3.1 La série devient une entité de premier niveau

Une série possède sa propre identité indépendante des ressources qui la composent.

```text
SÉRIE
→ identité
→ nom
→ slug
→ description
→ objectif
→ thumbnail
```

Une série peut exister dans l’administration avant qu’une ressource publiée lui soit associée.

Elle n’a pas besoin d’être exposée publiquement tant qu’elle ne possède aucune ressource publiée.

---

## 3.2 L’appartenance est une relation

Une ressource n’« a » plus une série.

Elle possède zéro ou plusieurs **associations à des séries**.

```text
RESSOURCE
    │
    ├── Série A → position 2
    └── Série B → position 5
```

La position appartient donc à l’association.

---

## 3.3 Aucune table générique `resources`

Les formats spécialisés restent séparés :

```text
infographics
articles
prompts
```

La nouvelle architecture ne crée pas une table universelle uniquement pour faciliter les séries.

Les séries mixtes Articles + Infographies existent déjà conceptuellement dans Ressources IA et doivent continuer à fonctionner sans migration vers une table générique.

---

## 3.4 Les Prompts restent hors séries dans cette version

Le MVP Bibliothèque de prompts prévoit explicitement que les prompts ne participent pas aux séries actuelles.

Cette refonte couvre donc initialement :

```text
Infographies
Articles
```

Une évolution future pourra ajouter les prompts sans remettre en cause le modèle général.

---

## 3.5 Aucun texte libre pour choisir une série

Une ressource ne peut être associée qu’à une série qui existe réellement dans `resource_series`.

Interdiction après migration :

```text
Série : [champ texte libre]
```

Remplacement :

```text
[ + Associer à une série ]
```

avec sélection parmi les séries existantes.

---

## 3.6 Le JSON ne gère plus les séries

Les contrats JSON décrivent le contenu éditorial de la ressource.

Ils ne doivent plus être la source de :

```text
series
series.name
series.episodeNumber
```

L’association est effectuée dans l’application après l’enregistrement de la ressource.

Les anciens JSON contenant encore `series` doivent rester importables pendant la transition, mais la propriété ne doit :

- créer aucune série;
- créer aucune association;
- modifier aucune association existante.

---

# 4. Architecture cible de la base de données

## 4.1 Évolution de `resource_series`

La table existe déjà avec :

```text
slug
name
thumbnail_path
thumbnail_generated_at
created_at
updated_at
```

Elle doit être enrichie plutôt que remplacée.

Structure cible conceptuelle :

```text
resource_series
────────────────────────────────
id uuid PK
slug text NOT NULL UNIQUE
name text NOT NULL
description text NULL
objective text NULL
thumbnail_path text NULL
thumbnail_generated_at timestamptz NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

### `id`

Devient l’identité technique stable.

### `slug`

Devient l’identité publique stable.

Le slug :

- est généré initialement à partir du nom;
- est unique;
- n’est jamais modifié automatiquement lors d’un changement de nom;
- peut être modifié explicitement seulement si l’administration le permet;
- doit afficher un avertissement lorsqu’un changement modifierait l’URL publique.

### `name`

Nom éditorial affiché.

Il peut être corrigé sans casser les associations.

### `description`

Courte présentation de la série.

Utilisations possibles :

- carte de série;
- en-tête de la page publique.

### `objective`

Objectif pédagogique de la série.

Exemple :

> Donner aux débutants les repères essentiels pour commencer à utiliser une IA générative de façon plus claire et réfléchie.

Il peut être affiché dans la page publique sans être répété sur chaque carte.

---

# 5. Table d’association

Créer une table spécialisée, par exemple :

```text
resource_series_memberships
────────────────────────────────
id uuid PK
series_id uuid NOT NULL
article_id uuid NULL
infographic_id uuid NULL
position integer NULL
created_at timestamptz NOT NULL
updated_at timestamptz NOT NULL
```

Relations :

```text
series_id
→ resource_series.id
→ ON DELETE CASCADE

article_id
→ articles.id
→ ON DELETE CASCADE

infographic_id
→ infographics.id
→ ON DELETE CASCADE
```

Ajouter une contrainte garantissant qu’exactement **une** ressource est renseignée :

```text
article_id renseigné XOR infographic_id renseigné
```

Ne jamais permettre :

```text
article_id + infographic_id
```

sur la même ligne.

Ne jamais permettre non plus une ligne sans ressource.

---

## 5.1 Contraintes d’unicité

Une ressource ne peut apparaître qu’une fois dans une même série.

Prévoir conceptuellement :

```text
UNIQUE(series_id, article_id)
WHERE article_id IS NOT NULL
```

et :

```text
UNIQUE(series_id, infographic_id)
WHERE infographic_id IS NOT NULL
```

---

## 5.2 Position

`position` représente l’ordre pédagogique dans cette série.

Exemple :

```text
Article A
→ Série X : position 3
→ Série Y : position 1
```

Valeurs :

```text
entier positif
ou
NULL
```

Un `NULL` reste permis afin de ne pas rendre une association inutilisable lorsqu’un ordre n’a pas encore été décidé.

Ordre public :

1. `position` croissante;
2. positions nulles à la fin;
3. `published_at` croissante;
4. titre comme dernier critère stable.

Cette règle reprend le comportement d’ordre déjà établi pour les séries.

### Unicité de position

Avant d’imposer une contrainte unique sur :

```text
series_id + position
```

l’inspection doit vérifier les données existantes.

Si aucune raison éditoriale ne justifie deux ressources à la même position, une contrainte unique partielle est recommandée :

```text
UNIQUE(series_id, position)
WHERE position IS NOT NULL
```

---

# 6. Visibilité publique

Une série peut exister administrativement sans être visible publiquement.

Règle :

```text
Série possédant au moins une ressource publiée
→ visible publiquement

Série vide
ou
série contenant uniquement des brouillons
→ administration seulement
```

Il n’est donc pas nécessaire d’ajouter immédiatement :

```text
status
published_at
```

à `resource_series`.

Le statut public reste dérivé de la présence de membres publiés.

---

# 7. Migration des données existantes

La migration doit être **contrôlée**, pas déduite aveuglément à partir des noms actuels.

## 7.1 Inventaire préalable obligatoire

Avant toute modification :

extraire les valeurs distinctes de :

```text
infographics.series_name
articles.series_name
resource_series.name
resource_series.slug
```

et produire pour chacune :

- nom rencontré;
- format;
- nombre de ressources;
- positions actuelles;
- slug calculé;
- correspondance éventuelle avec une série existante.

Repérer :

- différences de casse;
- accents;
- espaces;
- apostrophes;
- fautes de frappe;
- doublons potentiels;
- séries existantes sans ressources;
- ressources faisant référence à une série absente de `resource_series`;
- positions dupliquées.

---

## 7.2 Validation humaine du mapping

Ne jamais fusionner automatiquement deux séries uniquement parce que leurs noms se ressemblent.

Produire un mapping explicite :

```text
"Les fondamentaux de l’IA générative"
→ série canonique A

"Les fondamentaux de l'IA générative"
→ série canonique A

"Les fondamentaux de l’IA génératve"
→ à valider
```

Les variantes ambiguës doivent être corrigées avant le backfill.

---

## 7.3 Évolution de `resource_series`

Une fois le mapping validé :

1. ajouter `id`;
2. remplir tous les `id`;
3. ajouter `description`;
4. ajouter `objective`;
5. rendre `slug` unique;
6. faire de `id` la clé primaire;
7. conserver `slug` comme clé publique unique;
8. conserver les thumbnails existants.

Aucune couverture existante ne doit être déplacée ou régénérée.

---

## 7.4 Création des memberships

Pour chaque ressource actuellement associée :

```text
series_name
+
episode_number
```

créer :

```text
series_id
+
resource FK
+
position = episode_number
```

Une valeur `episode_number` absente ou invalide devient :

```text
position = NULL
```

---

## 7.5 Vérification du backfill

Avant de considérer la migration valide, vérifier :

```text
nombre de ressources liées avant
=
nombre de memberships après
```

et par série :

```text
nombre ancien de membres
=
nombre nouveau de membres
```

Vérifier aussi :

- aucun membership sans série;
- aucun membership sans ressource;
- aucune ressource associée à une mauvaise série;
- aucune position perdue;
- aucun thumbnail de série perdu.

---

## 7.6 Colonnes legacy

Ne pas supprimer immédiatement :

```text
series_name
episode_number
```

des tables `articles` et `infographics`.

Séquence recommandée :

```text
migration + backfill
→ validation
→ bascule des lectures
→ bascule des écritures
→ période de validation
→ suppression finale des colonnes legacy
```

Pendant la période de transition, ces champs ne doivent plus être considérés comme la source de vérité.

---

# 8. Administration des séries

Ajouter une entrée spécialisée :

```text
Ressources IA
├── Infographies
├── Articles
├── Prompts
└── Séries
```

---

## 8.1 Liste des séries

Afficher au minimum :

- nom;
- slug;
- nombre total de ressources associées;
- nombre de ressources publiées;
- présence du thumbnail;
- date de modification;
- action Modifier;
- action Voir lorsque la série est publiquement accessible;
- action Supprimer.

Une série vide reste visible ici.

---

## 8.2 Création d’une série

Formulaire :

```text
Nom
Slug
Description
Objectif pédagogique
Thumbnail
```

Le slug est proposé depuis le nom lors de la création.

Après création, modifier le nom ne modifie pas automatiquement le slug.

---

## 8.3 Modification d’une série

Permettre :

- modifier le nom;
- modifier la description;
- modifier l’objectif;
- gérer le thumbnail;
- consulter les ressources associées;
- ajuster leur position;
- retirer une ressource de la série.

---

## 8.4 Suppression

Une suppression de série :

```text
supprime les memberships
ne supprime jamais les ressources
```

Afficher une confirmation explicite lorsqu’elle possède des membres.

Exemple :

> Cette série contient 7 ressources. La supprimer retirera leurs associations à cette série, mais ne supprimera pas les ressources.

Le thumbnail de série est supprimé selon la stratégie sûre déjà utilisée par le système actuel.

---

# 9. Administration d’une ressource

Les formulaires Article et Infographie ne doivent plus contenir :

```text
Nom de série
Numéro d’épisode
```

sous forme de propriétés éditoriales libres.

Ajouter un bloc indépendant :

```text
Séries associées
```

---

## 9.1 Ressource non enregistrée

Une association exige un identifiant persistant.

Pour une nouvelle ressource :

```text
Enregistrez d’abord la ressource pour gérer ses séries.
```

Aucune association temporaire ne doit être créée.

---

## 9.2 Ressource enregistrée sans série

Afficher :

```text
Cette ressource n’appartient à aucune série.

[ + Associer à une série ]
```

---

## 9.3 Ressource avec associations

Exemple :

```text
Séries associées

Bien débuter avec l’IA
Position : 4
[Voir la série] [Retirer]

Le vocabulaire de l’IA générative
Position : 2
[Voir la série] [Retirer]

[ + Associer à une série ]
```

---

## 9.4 Ajout à une série

Le sélecteur :

- charge uniquement les séries existantes;
- exclut les séries déjà associées;
- ne permet aucun texte libre;
- permet de choisir une position;
- signale une position déjà utilisée.

Il ne doit jamais proposer :

```text
Créer automatiquement « texte saisi »
```

La création d’une nouvelle série passe par l’administration Séries.

---

# 10. Gestion depuis la fiche Série

La page d’administration d’une série doit également présenter ses membres.

Exemple :

```text
Ressources de la série

01 — Comprendre ce qu’est une IA générative
     Infographie

02 — Comment fonctionne un modèle de langage?
     Article

03 — Comment bien parler à une IA?
     Infographie
```

Actions minimales :

- modifier la position;
- retirer;
- ouvrir la ressource.

Une fonction `Ajouter une ressource` peut être ajoutée si elle reste simple.

Elle doit sélectionner une ressource existante et ne jamais créer de contenu.

Un drag-and-drop n’est pas requis dans la première version.

La saisie numérique de la position suffit.

---

# 11. Modification des imports JSON

Les contrats actuels Articles et Infographies contiennent encore une notion de série.
La nouvelle règle devient :

```text
JSON
→ contenu éditorial

Application
→ organisation en séries
```

---

## 11.1 Nouveaux imports

Les processus de production ne doivent plus produire :

```json
"series": {
  "name": "...",
  "episodeNumber": 3
}
```

---

## 11.2 Compatibilité avec les anciens JSON

Pendant la transition, si un ancien JSON contient `series` :

- le JSON reste importable;
- les autres propriétés sont importées normalement;
- `series` est ignorée pour les associations;
- aucune série n’est créée;
- aucun membership n’est créé;
- aucune association existante n’est supprimée.

Afficher éventuellement un avertissement :

> Les séries sont maintenant gérées directement dans l’application. Les informations `series` de ce JSON n’ont pas été appliquées.

---

## 11.3 Documentation

Mettre à jour les contrats de production Articles et Infographies afin de retirer la série de la sortie recommandée.

Le changement de `schemaVersion` peut être évalué séparément; il ne doit pas bloquer la migration technique.

Les contrats restent permissifs.

---

# 12. Adaptation du catalogue public

La logique actuelle regroupe encore les ressources à partir de `series_name` et `episode_number`.

Elle doit être remplacée par des données explicites :

```text
resource_series
+
resource_series_memberships
+
ressources publiées
```

---

## 12.1 Modèle public d’une ressource

Une ressource peut maintenant porter :

```text
seriesMemberships: [
  {
    seriesId,
    slug,
    name,
    position
  }
]
```

au lieu de :

```text
seriesName
episodeNumber
```

comme source unique.

---

## 12.2 Vue générale

Une ressource appartenant à plusieurs séries ne doit apparaître qu’une seule fois dans la grille générale.

Affichage recommandé :

### Une série

```text
Bien débuter avec l’IA · Épisode 3
```

### Plusieurs séries

```text
Bien débuter avec l’IA
+1 série
```

ou un traitement visuel équivalent compact.

Ne pas dupliquer la carte.

---

## 12.3 Catalogue filtré par série

Lorsque :

```text
?serie=slug
```

est actif, le contexte est sans ambiguïté.

Afficher :

```text
Nom de la série
Épisode / position dans cette série
```

et trier selon `membership.position`.

---

## 12.4 Vue Séries

La vue Séries ne groupe plus des chaînes de caractères.

Elle charge les entités `resource_series` possédant au moins un membre publié.

Chaque carte peut afficher :

- thumbnail;
- nom;
- description;
- nombre de ressources publiées;
- niveau commun lorsqu’il reste pertinent;
- action `Voir la série`.

---

## 12.5 Série mise en vedette

Conserver la logique actuelle :

```text
activité publiée la plus récente
```

sauf décision éditoriale ultérieure.

L’activité récente est calculée depuis les membres publiés.

Ne pas stocker cette information sur la série.

---

# 13. Page publique d’une série

Route conservée :

```text
/ressources-ia/series/{slug}
```

La différence fondamentale est que le slug provient directement de l’entité série au lieu d’être recalculé à partir d’un nom de ressource.

---

## 13.1 En-tête

Afficher selon les données disponibles :

```text
Ressources IA · Série

Nom

Description

Objectif pédagogique

Nombre de ressources
Niveau commun, si pertinent

Commencer la série
```

Une description ou un objectif absent ne crée aucune zone vide.

---

## 13.2 Membres

Charger uniquement :

- les memberships de cette série;
- dont la ressource correspondante est publiée.

Trier selon la règle définie pour `position`.

Le compte public ne comprend jamais :

- brouillons;
- ressources supprimées;
- associations orphelines.

---

# 14. Navigation précédent / suivant

La navigation devient dépendante du **contexte de série**.

Une ressource peut appartenir à plusieurs séries.

---

## 14.1 Une seule série

Conserver le comportement actuel :

```text
← Épisode précédent
Voir la série
Épisode suivant →
```

---

## 14.2 Plusieurs séries

Afficher un bloc pour chaque appartenance pertinente.

Exemple :

```text
Dans « Bien débuter avec l’IA » — Épisode 4

← Épisode précédent
Voir la série
Épisode suivant →

Dans « Le vocabulaire de l’IA générative » — Épisode 2

Voir la série
Épisode suivant →
```

Ne jamais choisir silencieusement une série « principale » si aucune notion de série principale n’existe dans le modèle.

---

# 15. RLS et sécurité

## `resource_series`

Lecture publique :

- seulement les colonnes nécessaires à l’affichage public;
- une série vide ne doit pas apparaître dans les requêtes publiques du catalogue.

Administration :

- réservée à l’utilisateur administrateur réellement autorisé.

---

## `resource_series_memberships`

Administration :

- création;
- modification;
- suppression.

Lecture publique :

- uniquement pour des associations dont la ressource correspondante est publiée.

Un membership vers un brouillon ne doit pas permettre de découvrir son existence publiquement.

Les politiques doivent couvrir séparément :

```text
article_id
infographic_id
```

---

# 16. Suppression et intégrité

## Suppression d’une ressource

Grâce aux FK :

```text
suppression Article
→ memberships Article supprimés

suppression Infographie
→ memberships Infographie supprimés
```

La série reste intacte.

---

## Suppression d’une série

```text
suppression Série
→ memberships supprimés
→ ressources intactes
```

---

## Renommage d’une série

```text
name modifié
→ associations intactes
→ slug intact
→ URL intacte
```

---

# 17. Découpage du développement

La refonte est découpée en cinq incréments, précédés d’une inspection ciblée.

```text
Inspection
→ schéma et migration
→ administration Série
→ associations dans les ressources
→ bascule publique
→ nettoyage legacy
```

---

# Incrément 0 — Inspection et inventaire des données

## Objectif

Confirmer l’état réel du dépôt et préparer un mapping sûr des séries existantes.

## À inspecter

- état Git;
- migrations actuelles;
- structure réelle de `resource_series`;
- structure actuelle de `articles`;
- structure actuelle de `infographics`;
- données distinctes `series_name`;
- positions existantes;
- thumbnails de séries;
- RLS;
- formulaires Article et Infographie;
- importeurs JSON;
- `resourceSeries.js`;
- catalogue;
- page publique de série;
- navigation précédent/suivant;
- filtres URL;
- tests existants.

## Livrable obligatoire

Produire un tableau :

```text
Série canonique
Slug actuel
Variantes de noms trouvées
Infographies
Articles
Positions
Anomalies
Décision de migration
```

## Hors périmètre

- aucune migration;
- aucune modification;
- aucune association créée;
- aucun nettoyage automatique;
- aucun commit;
- aucun push.

## Critère de clôture

Toutes les valeurs legacy sont comprises et aucune variante ambiguë ne sera transformée silencieusement en nouvelle série.

---

# Incrément 1 — Schéma relationnel et migration des données

## Objectif

Créer la nouvelle architecture sans encore retirer les anciennes colonnes.

## Inclus

- ajout de `id` à `resource_series`;
- passage à `id` comme clé technique;
- unicité de `slug`;
- `description`;
- `objective`;
- création de `resource_series_memberships`;
- FK;
- CHECK exactement une ressource;
- contraintes d’unicité;
- index;
- RLS;
- backfill contrôlé;
- vérifications post-migration;
- tests SQL ou applicatifs ciblés.

## Résultat

La nouvelle structure contient exactement les séries et associations validées, tandis que l’ancien système reste encore disponible pour comparaison.

## Hors périmètre

- modification publique;
- modification des formulaires;
- suppression de `series_name`;
- suppression de `episode_number`.

## Critères d’acceptation

- aucune ressource liée n’est perdue;
- aucun thumbnail n’est perdu;
- aucune série supplémentaire n’est créée accidentellement;
- chaque membership pointe vers une vraie série;
- chaque membership pointe vers une vraie ressource;
- les comptes avant/après correspondent.

---

# Incrément 2 — Administration des séries

## Objectif

Permettre de gérer explicitement les séries comme entités.

## Inclus

- entrée `Séries`;
- liste;
- création;
- modification;
- description;
- objectif;
- slug stable;
- thumbnail existant;
- affichage des membres;
- modification des positions;
- suppression contrôlée;
- FR/EN;
- responsive;
- tests ciblés.

## Résultat visible

> Christian peut créer une série avant d’y associer une ressource et gérer ses métadonnées sans saisir son nom dans une ressource.

## Hors périmètre

- bascule du catalogue public;
- suppression des anciens champs;
- drag-and-drop.

---

# Incrément 3 — Associations multiples dans Articles et Infographies

## Objectif

Remplacer les champs libres de série par la gestion des memberships.

## Inclus

- retrait du champ libre Série;
- retrait du champ Épisode dans le formulaire éditorial;
- bloc `Séries associées`;
- sélection parmi les séries existantes;
- multi-association;
- position par série;
- retrait;
- validation des collisions;
- gestion uniquement pour une ressource enregistrée;
- préservation lors des imports JSON;
- ancien `series` JSON ignoré;
- tests ciblés.

## Résultat visible

> Une même ressource peut être associée à plusieurs séries avec une position différente dans chacune.

## Invariant

Un import JSON ne modifie jamais ce bloc.

---

# Incrément 4 — Bascule publique

## Objectif

Faire de la nouvelle architecture l’unique source de vérité du catalogue et des pages publiques.

## Inclus

- chargement des séries par entité;
- chargement des memberships;
- adaptation du modèle public;
- filtre par série;
- vue Séries;
- cartes de séries;
- série mise en vedette;
- page publique;
- ordre;
- compte;
- précédent/suivant;
- ressources multi-séries;
- description et objectif;
- exclusion des brouillons;
- URL existantes conservées lorsque les slugs restent identiques;
- tests ciblés.

## Résultat visible

> Le fonctionnement public reste familier, mais toutes les séries et positions proviennent désormais du modèle relationnel.

## Tests essentiels

- article + infographie dans une même série;
- ressource dans deux séries;
- série vide;
- série avec uniquement un brouillon;
- position absente;
- premier et dernier membre;
- filtre URL;
- Retour/Avancer;
- compte publié;
- renommage sans changement de slug.

---

# Incrément 5 — Retrait du modèle legacy et finalisation

**Statut : implanté le 14 août 2026.** Les colonnes legacy ont été retirées après la bascule complète du runtime et la validation des données relationnelles.

## Objectif

Éliminer la double source de vérité.

## Inclus

- arrêter définitivement toute lecture de `series_name`;
- arrêter toute lecture de `episode_number`;
- retirer leur écriture;
- retirer leur import;
- mettre à jour les contrats JSON Articles et Infographies;
- conserver une compatibilité d’import des anciens fichiers en ignorant `series`;
- retirer les colonnes legacy après validation;
- retirer les index devenus inutiles;
- simplifier `resourceSeries.js`;
- supprimer les helpers de slug basés sur `series_name` lorsqu’ils ne sont plus nécessaires;
- mettre à jour fixtures et tests;
- build;
- lint ciblé;
- tests complets pertinents;
- vérification responsive;
- vérification Git.

## Résultat

```text
resource_series
+
resource_series_memberships
```

sont les seules sources de vérité des séries.

---

# 18. Déploiement recommandé

Les incréments sont utiles pour développer et valider progressivement, mais la bascule de production doit éviter une longue période où :

```text
administration écrit l’ancien modèle
mais
public lit le nouveau
```

Deux stratégies sont possibles.

## Stratégie recommandée

Développer les incréments séparément, puis déployer ensemble :

```text
migration
+
nouvelle administration
+
nouvelle lecture publique
```

dans une même fenêtre de mise en production.

Les colonnes legacy restent présentes pendant cette première mise en production.

Après validation réelle :

```text
deuxième déploiement
→ suppression legacy
```

Cette stratégie évite un mécanisme temporaire de double écriture.

---

# 19. Hors périmètre

Cette refonte n’inclut pas :

- table générique `resources`;
- séries de Prompts;
- kits de Prompts;
- parcours utilisateurs;
- progression de lecture;
- statistiques;
- recommandations automatiques;
- séries imbriquées;
- sous-séries;
- série principale vs secondaire;
- traduction structurée des séries;
- drag-and-drop obligatoire;
- publication planifiée;
- génération automatique des descriptions;
- génération automatique des objectifs;
- création automatique d’une série depuis un JSON;
- création automatique d’une série depuis une valeur inconnue;
- migration SSR ou changement de framework.

---

# 20. Invariants critiques

Pendant toute la refonte :

- aucune ressource publiée ne disparaît;
- aucun brouillon ne devient public;
- aucun thumbnail existant n’est perdu;
- aucune série n’est créée automatiquement depuis une chaîne;
- aucune série n’est créée par un import JSON;
- une ressource sans série reste valide;
- une ressource peut appartenir à plusieurs séries;
- la position appartient à l’association;
- un renommage de série ne change pas automatiquement son slug;
- une suppression de série ne supprime jamais ses ressources;
- une suppression de ressource nettoie ses memberships;
- les séries peuvent mélanger Articles et Infographies;
- les Prompts restent hors séries dans cette version;
- aucune table universelle de ressources n’est ajoutée;
- les URL existantes sont préservées autant que possible;
- les contrats JSON restent permissifs;
- les imports legacy restent lisibles;
- chaque incrément est validé avant le suivant;
- aucun commit ou push n’est effectué sans demande explicite.

---

# 21. Critères de clôture

La refonte est terminée lorsque Christian peut :

1. créer une série sans créer de ressource;
2. lui donner un nom, une description et un objectif;
3. lui attribuer un thumbnail;
4. modifier son nom sans casser son URL;
5. associer une infographie à une série;
6. associer un article à une série;
7. associer la même ressource à deux séries;
8. donner une position différente à chaque association;
9. retirer une association;
10. gérer les membres depuis une série;
11. voir le nombre correct de ressources publiées;
12. voir uniquement les séries ayant du contenu publié dans le catalogue public;
13. filtrer Ressources IA par série;
14. ouvrir la page d’une série;
15. voir sa description et son objectif;
16. parcourir ses ressources dans le bon ordre;
17. naviguer précédent/suivant;
18. naviguer correctement lorsqu’une ressource appartient à plusieurs séries;
19. renommer une série sans modifier son slug;
20. constater qu’une faute de frappe dans une ressource ne peut plus créer une série;
21. importer un ancien JSON contenant `series` sans créer d’association;
22. constater qu’un nouveau JSON n’a plus besoin de connaître les séries;
23. constater que `series_name` et `episode_number` ne sont plus utilisés;
24. constater qu’aucun brouillon n’est exposé;
25. constater que les thumbnails existants sont intacts;
26. exécuter le build avec succès;
27. exécuter le lint ciblé avec succès;
28. exécuter les tests ciblés avec succès;
29. vérifier le parcours à 1440, 768 et environ 390 px;
30. valider la migration réelle des données existantes.

---

# 22. Principe final

La nouvelle architecture repose sur trois responsabilités distinctes :

```text
RESSOURCE
→ contenu

SÉRIE
→ identité et intention pédagogique

MEMBERSHIP
→ appartenance et position
```

Cette séparation élimine le principal défaut du modèle actuel :

```text
nom libre dans une ressource
→ création implicite d’une série
```

et le remplace par :

```text
créer explicitement une série
→ associer explicitement des ressources
→ ordonner explicitement le parcours
```

La série devient ainsi une véritable entité éditoriale sans transformer Ressources IA en CMS générique.
