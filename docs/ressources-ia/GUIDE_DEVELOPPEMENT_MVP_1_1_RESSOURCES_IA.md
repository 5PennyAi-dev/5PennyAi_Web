# Guide de développement — MVP 1.1 Ressources IA

**Projet :** 5PennyAi  
**Section :** Ressources IA  
**Date :** 31 juillet 2026  
**Statut :** conception fonctionnelle prête à être implantée par incréments

---

## 1. Rôle du document

Ce guide encadre l’évolution **MVP 1.1** de la section publique Ressources IA.

Il prolonge la phase 1.0 sans la reconstruire. Il sert de fil conducteur pratique pour le développement et peut être ajusté si l’inspection du dépôt révèle une contrainte réelle.

Il ne constitue pas une spécification canonique ou une invitation à créer un CMS générique.

---

## 2. Contexte observé

La phase 1.0 permet maintenant de publier et d’afficher des infographies pédagogiques. La publication d’une première série de sept épisodes a fait ressortir deux limites de présentation :

1. les cartes affichent l’infographie presque entière, alors que son texte est illisible à cette taille et que la grille devient très haute;
2. les épisodes d’une même série ressemblent à des ressources indépendantes, même lorsque le nom de la série et le numéro d’épisode sont présents.

La section doit aussi pouvoir accueillir plus tard d’autres formats, notamment des articles, sans afficher dès maintenant des fonctions ou des types de contenu inexistants.

---

## 3. Objectif du MVP 1.1

Faire évoluer la page Ressources IA d’une simple grille d’infographies vers une **bibliothèque pédagogique structurée**, où l’utilisateur peut :

- parcourir toutes les ressources publiées;
- reconnaître immédiatement les contenus appartenant à une série;
- consulter uniquement les séries;
- filtrer les ressources par série;
- ouvrir une page consacrée à une série;
- parcourir ses épisodes dans l’ordre prévu;
- passer facilement à l’épisode précédent ou suivant;
- consulter une grille plus compacte grâce à des aperçus recadrés.

Le résultat doit rester simple, lisible, rapide et cohérent avec le site 5PennyAi.

---

## 4. Principes directeurs

### 4.1 Une série n’est pas un type de contenu

Une infographie ou un article est un **format de contenu**.

Une série est un **regroupement ordonné** pouvant éventuellement contenir plusieurs formats.

La page ne doit donc pas présenter un même sélecteur du type :

```text
Infographies | Articles | Séries
```

La navigation distingue plutôt :

- la vue du catalogue : `Toutes les ressources` ou `Séries`;
- le format, plus tard : `Tous`, `Infographies`, `Articles`;
- la série : filtre facultatif dans la vue des ressources.

### 4.2 Utiliser les données déjà disponibles

Le MVP 1.1 s’appuie d’abord sur les champs existants :

```text
series_name
episode_number
```

Le contrat JSON v1 reste valide et ne nécessite pas de nouvelle propriété.

### 4.3 Ne pas créer un CMS générique

Cette phase ne doit pas introduire :

- une table générique `resources`;
- un moteur abstrait de types de contenu;
- une administration complète des séries;
- une table `articles` avant la conception réelle des articles;
- des catégories ou taxonomies avancées.

### 4.4 Un incrément doit produire un résultat visible

Chaque incrément doit pouvoir être vérifié directement dans le navigateur et accepté avant de poursuivre.

Codex ne doit pas préparer silencieusement l’incrément suivant ni refactoriser des zones non liées.

### 4.5 Tests ciblés

Les changements sont surtout visuels et de navigation. Les validations doivent donc privilégier :

- le build;
- quelques tests ciblés sur le regroupement et l’ordre des épisodes;
- une vérification manuelle sur ordinateur et mobile.

Ne pas multiplier les snapshots, les mocks ou les tests de classes CSS.

---

## 5. Expérience publique cible

## 5.1 En-tête de la page

Le texte d’introduction devient indépendant du format actuellement publié.

Formulation recommandée :

> Des ressources pédagogiques claires et pratiques pour mieux comprendre l’intelligence artificielle.

Ne pas afficher un onglet ou un filtre `Articles` tant qu’aucun article public n’existe.

## 5.2 Deux vues principales

Sous l’en-tête, afficher un contrôle simple :

```text
[Toutes les ressources] [Séries]
```

### Toutes les ressources

- affiche les ressources individuelles publiées;
- ordre par défaut : `published_at` décroissant;
- permet de filtrer par série;
- conserve la grille de cartes.

### Séries

- affiche une carte par série;
- ne répète pas chaque épisode comme une entrée principale;
- permet d’ouvrir la page de la série.

L’état de la vue doit être représenté dans l’URL, par exemple :

```text
/ressources-ia
/ressources-ia?vue=series
/ressources-ia?serie=les-fondamentaux-de-l-ia-generative
```

Le bouton Retour du navigateur doit rétablir correctement la vue précédente.

## 5.3 Série mise en vedette

Dans la vue `Toutes les ressources`, afficher au-dessus de la grille une série mise en évidence lorsqu’au moins une série publiée existe.

Pour le MVP 1.1 :

- s’il n’existe qu’une série, elle est mise en vedette;
- s’il en existe plusieurs, utiliser celle dont l’activité publiée est la plus récente;
- ne pas ajouter de champ administratif `featured` dans cette phase.

La section affiche :

- le titre de la série;
- le nombre d’épisodes publiés;
- le niveau lorsqu’il est uniforme dans la série;
- une composition de deux ou trois aperçus;
- une action `Commencer la série`;
- une action `Voir les épisodes` si les deux actions restent visuellement utiles.

Ne pas inventer de description si aucune donnée éditoriale ne la fournit.

## 5.4 Filtre par série

Dans la vue `Toutes les ressources`, ajouter un filtre :

```text
Série : [Toutes les séries ▼]
```

Règles :

- le filtre n’affiche que les séries possédant au moins une ressource publiée;
- la sélection est conservée dans l’URL;
- lorsqu’une série est sélectionnée, les épisodes sont triés par ordre d’épisode;
- le filtre doit pouvoir être retiré facilement;
- aucun bouton `Appliquer` n’est requis.

## 5.5 Ordre des épisodes

Dans une série, utiliser l’ordre suivant :

1. `episode_number` croissant pour les valeurs entières valides;
2. épisodes sans numéro ou avec une valeur invalide à la fin;
3. `published_at` croissant pour départager les égalités;
4. titre comme dernier critère stable si nécessaire.

Dans la vue générale non filtrée, conserver l’ordre `published_at` décroissant.

---

## 6. Cartes de ressources compactes

## 6.1 Aperçu de l’image

La carte ne doit plus afficher l’infographie complète dans son ratio vertical.

Utiliser un aperçu éditorial :

```text
Ratio : 4:3
Recadrage : haut de l’infographie
Comportement : cover
```

Principe CSS :

```css
object-fit: cover;
object-position: top;
```

La partie supérieure est privilégiée parce que le guide des infographies y place le titre et l’introduction visuelle.

L’image complète reste disponible uniquement dans la page détaillée et dans la visionneuse.

### Décision de performance

Le MVP 1.1 utilise d’abord l’image existante avec recadrage CSS, `loading="lazy"` et `decoding="async"`.

La création et le stockage d’un fichier miniature distinct sont reportés. Ils ne seront ajoutés que si une mesure réelle montre que le poids des images ralentit sensiblement le catalogue.

## 6.2 Hiérarchie d’une carte appartenant à une série

Ordre recommandé :

```text
Nom de la série
Épisode 02

Titre de la ressource
Résumé court

Infographie · Thème
Débutant · 5 min

Consulter
```

Le nom de la série et le numéro d’épisode doivent être plus faciles à repérer qu’actuellement.

Utiliser `Épisode 02` plutôt que `02 / 07`, car le total pourrait évoluer ou être incomplet.

## 6.3 Hiérarchie d’une ressource hors série

Ordre recommandé :

```text
Infographie · Thème

Titre de la ressource
Résumé court

Débutant · 5 min

Consulter
```

Ne pas réserver de zone vide pour une série absente.

## 6.4 Hauteur et densité

- hauteur d’aperçu uniforme;
- titre limité visuellement à environ trois lignes;
- résumé limité à deux ou trois lignes;
- métadonnées compactes;
- action placée de façon stable;
- trois cartes par ligne sur grand écran, deux sur tablette, une sur mobile, sauf si l’inspection démontre qu’un autre seuil existant est plus cohérent.

L’ensemble de la carte peut être cliquable, mais une action visible demeure nécessaire.

## 6.5 Accessibilité

- focus clavier clairement visible;
- interaction utilisable sans survol;
- contraste conforme au système visuel existant;
- si le titre complet est déjà annoncé juste après l’image, l’aperçu peut utiliser `alt=""` pour éviter une répétition inutile;
- l’image détaillée conserve le véritable texte alternatif de la ressource.

---

## 7. Cartes de séries

Une carte de série doit être visuellement différente d’une carte de ressource.

Contenu minimal :

- composition de deux ou trois aperçus d’épisodes;
- titre de la série;
- nombre d’épisodes publiés;
- niveau si les épisodes partagent le même niveau;
- action `Voir la série`.

Les aperçus sont choisis selon l’ordre d’épisode. S’il n’existe qu’un seul épisode, afficher un seul aperçu sans simuler artificiellement une pile.

Les cartes de séries sont triées par date de publication la plus récente parmi leurs épisodes.

---

## 8. Page publique d’une série

## 8.1 Route

Forme recommandée :

```text
/ressources-ia/series/{series-slug}
```

Le slug est dérivé de `series_name` par une fonction unique et testée : minuscules, suppression des accents, espaces remplacés par des tirets, caractères non utiles supprimés.

Pour le MVP 1.1, le nom de la série demeure la source de vérité. Une modification du nom peut donc modifier son URL. Une table de séries avec slug permanent sera évaluée seulement lorsque ce besoin devient réel.

## 8.2 En-tête

Afficher :

- libellé `Ressources IA · Série`;
- titre de la série;
- nombre d’épisodes publiés;
- niveau si uniforme;
- action `Commencer avec l’épisode 1` ou, plus exactement, avec le premier épisode disponible.

Ne pas inventer de résumé de série.

## 8.3 Liste des épisodes

- tri selon les règles définies à la section 5.5;
- cartes compactes;
- numéro d’épisode visible;
- le nom complet de la série n’a pas besoin d’être répété sur chaque carte;
- les épisodes sans numéro restent accessibles à la fin.

## 8.4 Série inexistante

Si aucune ressource publiée ne correspond au slug :

- afficher une page non disponible ou 404;
- proposer un retour vers Ressources IA;
- ne jamais exposer un brouillon.

---

## 9. Navigation dans une série

Sur la page détaillée d’une infographie appartenant à une série, ajouter après le contenu principal :

```text
← Épisode précédent      Épisode suivant →
```

et un lien :

```text
Voir tous les épisodes de la série
```

Règles :

- utiliser uniquement les épisodes publiés;
- suivre exactement l’ordre de la série;
- masquer `Précédent` sur le premier épisode;
- masquer `Suivant` sur le dernier;
- ne pas afficher le bloc si la ressource n’appartient pas à une série;
- ne pas afficher de lien vers un brouillon ou une ressource supprimée.

---

## 10. Préparation à l’arrivée des articles

Cette phase prépare l’interface sans implanter les articles.

### À faire maintenant

- employer une description générale de la page;
- utiliser des libellés publics génériques comme `Ressources` et `Consulter` lorsque cela convient;
- traiter la série comme une dimension distincte du format;
- éviter que les composants publics dépendent inutilement du mot `infographie` lorsqu’ils représentent une carte de catalogue;
- garder les pages détaillées actuelles spécialisées pour les infographies.

### À faire lorsque les articles seront réellement conçus

- créer une table spécialisée `articles`;
- ajouter un filtre de format seulement lorsqu’au moins deux formats publics existent;
- adapter les articles et infographies vers un petit modèle d’affichage commun pour la grille;
- évaluer une table `resource_series` si une série doit contenir plusieurs formats, posséder une description, une couverture ou un slug permanent.

### À ne pas faire maintenant

- afficher un onglet `Articles` vide;
- créer une table `resources` générique;
- migrer les infographies vers un nouveau modèle abstrait;
- créer une administration de séries sans besoin éditorial confirmé.

---

# 11. Découpage du développement

Le MVP 1.1 est découpé en **trois incréments fonctionnels**, précédés d’une inspection courte. Ce découpage limite les dépendances et permet une validation visuelle après chaque étape.

## Incrément 0 — Inspection ciblée de l’implantation actuelle

### Objectif

Confirmer l’état réel de la phase 1.0 avant toute modification.

### À inspecter

- état Git, branche, remotes et derniers commits;
- route et composant actuels de `/ressources-ia`;
- composant de carte publique;
- requête Supabase des ressources publiées;
- page détaillée d’une infographie;
- conventions de traduction FR/EN;
- styles et composants réutilisables;
- présence éventuelle de tests;
- taille réelle des images chargées dans la grille;
- valeurs réelles de `series_name` et `episode_number` pour les sept épisodes.

### Questions à résoudre

1. Où centraliser le tri et le regroupement par série?
2. Le filtre et la vue peuvent-ils être gérés simplement par les paramètres d’URL existants?
3. Quel composant de carte doit être adapté plutôt que remplacé?
4. La route de série peut-elle utiliser le routeur actuel sans nouvelle dépendance?
5. Existe-t-il des incohérences de données à corriger avant l’affichage ordonné?
6. Le chargement des images complètes crée-t-il déjà un problème de performance mesurable?

### Résultat visible

Aucun changement public. Produire un rapport court et un périmètre précis pour l’incrément 1.

### Hors périmètre

- aucune modification de code;
- aucune migration;
- aucun refactoring;
- aucune préparation des incréments suivants.

---

## Incrément 1 — Cartes compactes et fondation du catalogue

### Objectif

Réduire immédiatement la hauteur de la page et clarifier la hiérarchie des cartes.

### Inclus

- texte d’introduction général de Ressources IA;
- aperçu 4:3 recadré en haut;
- hauteur d’image uniforme;
- `object-cover` et `object-position: top`;
- chargement différé des images non prioritaires;
- nom de série et numéro d’épisode plus visibles;
- titre et résumé limités visuellement;
- action publique `Consulter` ou autre libellé générique retenu;
- comportement propre lorsqu’une métadonnée manque;
- responsive et focus clavier de la carte.

### Résultat visible

> La page présente une grille plus compacte et les épisodes d’une série sont identifiables au premier regard.

### Hors périmètre

- vue `Séries`;
- filtre par série;
- page de série;
- précédent/suivant;
- création de fichiers miniatures distincts;
- modification de la base de données.

### Critères d’acceptation

- aucune infographie complète n’est visible dans une carte;
- le titre de l’infographie reste visible dans l’aperçu lorsque sa composition respecte le guide;
- les cartes gardent une hauteur cohérente;
- les cartes sans série restent équilibrées;
- la grille est lisible sur grand écran et mobile;
- la page détaillée continue d’afficher l’image complète;
- aucun brouillon ne devient public.

### Vérifications minimales

- build;
- contrôle manuel avec une ressource de série et une ressource sans série;
- contrôle à 1440 px, tablette et environ 390 px;
- aucune nouvelle suite de tests automatisés sauf si une logique non triviale est introduite.

---

## Incrément 2 — Exploration par séries dans la page Ressources IA

### Objectif

Permettre à l’utilisateur de distinguer le catalogue de ressources de la collection de séries.

### Inclus

- contrôle `Toutes les ressources / Séries`;
- état de la vue dans l’URL;
- regroupement des ressources publiées par série;
- série mise en vedette dans la vue générale;
- filtre par série;
- ordre par épisode lorsqu’une série est sélectionnée;
- cartes de séries avec composition de miniatures;
- compte d’épisodes publiés;
- niveau commun lorsqu’il est calculable;
- états vide, chargement et erreur adaptés aux deux vues.

### Résultat visible

> L’utilisateur peut consulter toutes les ressources, filtrer une série ou afficher uniquement les séries.

### Hors périmètre

- page détaillée d’une série;
- navigation précédent/suivant;
- filtre par format;
- recherche textuelle;
- pagination;
- administration des séries;
- nouvelle table Supabase.

### Critères d’acceptation

- une seule carte représente la série dans la vue `Séries`;
- le nombre d’épisodes ne compte que les publications;
- le filtre n’expose aucune série vide;
- le tri général reste par date décroissante;
- le tri filtré suit les numéros d’épisode;
- les paramètres d’URL sont partageables et compatibles avec Retour/Avancer;
- une ressource sans série reste visible dans `Toutes les ressources`;
- aucune description de série n’est inventée.

### Tests ciblés recommandés

Un ou deux tests suffisent pour protéger :

1. le regroupement des ressources par série;
2. l’ordre des épisodes, y compris une valeur manquante.

Ajouter le build et une vérification manuelle des deux vues.

---

## Incrément 3 — Page de série, navigation des épisodes et finalisation

### Objectif

Transformer une série en parcours pédagogique consultable de bout en bout.

### Inclus

- route publique de série;
- génération centralisée du slug;
- en-tête de série;
- liste des épisodes ordonnés;
- action pour commencer la série;
- lien des cartes de série vers cette page;
- lien `Voir tous les épisodes de la série` dans la page détaillée;
- navigation épisode précédent/suivant;
- 404 ou page non disponible pour une série inexistante;
- vérification responsive, clavier et états incomplets;
- petites corrections de présentation directement liées au MVP 1.1.

### Résultat visible

> L’utilisateur peut ouvrir une série, suivre ses épisodes dans l’ordre et naviguer d’un épisode à l’autre.

### Hors périmètre

- table et administration de séries;
- descriptions ou couvertures éditoriales de séries;
- articles;
- filtre par format;
- moteur de recommandations;
- progression utilisateur;
- favoris;
- statistiques;
- téléchargement ou partage avancé;
- création automatique de fichiers WebP ou AVIF distincts.

### Critères d’acceptation

- la page de série n’affiche que des ressources publiées;
- le premier épisode disponible est correctement déterminé;
- l’ordre est identique dans la page de série et la navigation précédent/suivant;
- les liens de bord sont masqués au début et à la fin;
- un épisode sans numéro reste accessible à la fin;
- une série inexistante ne provoque pas d’erreur non gérée;
- le retour vers Ressources IA conserve une navigation cohérente;
- le build réussit;
- le site reste fonctionnel en français et en anglais selon les conventions existantes.

### Tests ciblés recommandés

- test de la fonction de slug;
- test de résolution précédent/suivant;
- test confirmant l’exclusion des brouillons si cette logique n’est pas déjà garantie par la requête;
- vérification manuelle complète avec la série de sept épisodes.

---

# 12. Tableau de progression

| Incrément | Résultat fonctionnel | État | Commit |
|---|---|---|---|
| 0 | Inspection ciblée de la phase 1.0 | À faire | — |
| 1 | Cartes compactes et hiérarchie de série | À faire | — |
| 2 | Vues et filtre par séries | À faire | — |
| 3 | Page de série et navigation des épisodes | À faire | — |

États recommandés :

```text
À faire
En cours
À valider
Accepté
Bloqué
```

---

# 13. Discipline pour chaque session de développement

Chaque prompt Codex doit préciser :

1. le résultat visible attendu;
2. les fichiers de référence à lire;
3. la portée exacte de l’incrément;
4. les éléments hors périmètre;
5. les invariants critiques;
6. les validations à exécuter;
7. le scénario manuel à vérifier;
8. le rapport final attendu.

Le rapport final doit contenir :

- résultat obtenu;
- fichiers modifiés;
- commandes et tests exécutés;
- vérification manuelle effectuée ou restant à faire;
- limites connues;
- état Git;
- aucun push sans demande explicite.

---

# 14. Invariants critiques

Pendant toute la phase 1.1 :

- les brouillons restent invisibles publiquement;
- l’image complète reste intacte dans la page détaillée;
- les métadonnées facultatives ne créent pas de zones vides;
- une ressource sans série reste parfaitement valide;
- un épisode sans numéro reste consultable;
- le contrat JSON v1 continue de fonctionner;
- aucune donnée de série n’est inventée;
- aucune nouvelle dépendance majeure n’est ajoutée sans nécessité;
- aucune abstraction de CMS générique n’est introduite;
- la conception des articles n’est pas anticipée par des écrans vides ou des tables inutilisées.

---

# 15. Critères de clôture du MVP 1.1

La phase est terminée lorsque Christian peut :

1. ouvrir Ressources IA et voir des cartes compactes;
2. reconnaître immédiatement la série et le numéro d’un épisode;
3. consulter toutes les ressources par date de publication;
4. sélectionner une série et voir ses épisodes dans l’ordre;
5. afficher uniquement les séries;
6. ouvrir la page d’une série;
7. commencer par son premier épisode disponible;
8. passer à l’épisode précédent ou suivant;
9. revenir à la liste complète;
10. utiliser le parcours sur ordinateur et mobile;
11. constater qu’aucun brouillon n’est exposé;
12. continuer à publier les infographies avec le JSON v1 existant.

---

# 16. Évolutions volontairement reportées

À réévaluer seulement après utilisation du MVP 1.1 :

- fichiers de miniatures séparés et optimisation d’images;
- table `resource_series` avec slug permanent, description et couverture;
- administration des séries;
- articles et filtre par format;
- recherche;
- thèmes et niveaux comme filtres publics;
- pagination;
- recommandations et ressources associées;
- progression de lecture;
- statistiques de consultation.

La priorité reste une amélioration ciblée de la bibliothèque actuelle, sans reproduire la complexité d’une plateforme éditoriale complète.
