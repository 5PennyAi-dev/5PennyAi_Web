# Référence de développement — MVP Ressources IA, phase 1

**Projet :** 5PennyAi  
**Section :** Ressources IA  
**Périmètre :** publication d’infographies pédagogiques  
**Date de consolidation :** 30 juillet 2026  
**Statut :** conception fonctionnelle largement terminée — GPT de test à valider avant le développement

---

## 1. Rôle de ce document

Ce document rassemble les décisions prises pendant la conception de la phase 1 du MVP **Ressources IA**.

Il complète :

- `GUIDE_PHASE_1_MVP_RESSOURCES_IA.md`;
- `CONTRAT_JSON_RESSOURCES_IA_V1.md`;
- le guide de style des infographies qui sera ajouté aux connaissances du GPT.

Ce document est une référence pratique de reprise pour la conception et le développement. Il n’est pas une spécification canonique ou figée. Il peut être corrigé si les essais du GPT ou l’utilisation réelle révèlent un besoin.

Aucun développement de cette fonctionnalité n’a encore commencé.

---

# 2. Objectif du MVP

Permettre à Christian de publier manuellement une infographie pédagogique à partir de deux fichiers produits par un GPT personnalisé :

1. une image d’infographie;
2. un fichier JSON contenant les métadonnées disponibles.

Parcours minimal :

```text
Le GPT produit l’image et le JSON
→ Christian ouvre l’administration
→ il importe l’image et le JSON
→ le formulaire est prérempli
→ il vérifie ou corrige les valeurs
→ il enregistre en brouillon ou publie
→ la ressource apparaît dans Ressources IA
→ il peut ensuite la modifier ou la supprimer
```

Le GPT ne communique pas directement avec le site ou Supabase.

---

# 3. Principes directeurs

## Simplicité

La phase 1 concerne uniquement les infographies.

Ne pas construire :

- un CMS générique;
- un workflow éditorial;
- un historique de versions;
- un moteur de publication complexe;
- des abstractions pour des besoins hypothétiques;
- une architecture semblable à PennyLearn.

Chaque fonction doit contribuer directement au parcours :

```text
Image + JSON → vérification → publication → affichage public
```

## Contrôle humain

Christian conserve toujours le contrôle de l’enregistrement et de la publication.

Le JSON :

- préremplit le formulaire;
- ne sauvegarde rien automatiquement;
- ne publie jamais automatiquement;
- peut être corrigé librement.

## Validations non bloquantes

Les métadonnées éditoriales ne doivent jamais empêcher :

- l’importation;
- l’enregistrement;
- la modification;
- la publication.

L’application peut afficher des avertissements, mais elle ne prend pas la décision à la place de Christian.

Principe retenu :

> Les validations assistent Christian, mais ne prennent jamais la décision à sa place.

---

# 4. Architecture générale de l’administration

L’administration ne sera pas exclusivement destinée aux infographies.

La navigation doit prévoir une administration générale de 5PennyAi, avec une section :

```text
Administration 5PennyAi
└── Ressources IA
    └── Infographies
```

**Infographies** est le premier type de contenu disponible.

Ne pas afficher dès maintenant des types futurs fictifs comme Guides, Vidéos ou Fiches pratiques. Ils seront ajoutés seulement lorsqu’un besoin réel sera conçu.

La page Infographies reste spécialisée. Il n’est pas nécessaire de créer une liste générique de toutes les ressources avec une colonne Type.

---

# 5. Page d’administration « Infographies »

## Rôle

Cette page sert de point d’entrée opérationnel pour :

- voir les infographies existantes;
- distinguer les brouillons des publications;
- ajouter une infographie;
- ouvrir ou modifier une ressource;
- supprimer une ressource;
- accéder à sa page publique lorsqu’elle est publiée.

Elle n’est pas un tableau de bord analytique.

## En-tête

Afficher :

- titre `Infographies`;
- courte description;
- bouton principal `Ajouter une infographie`.

## Filtres

Filtres retenus :

- Toutes;
- Brouillons;
- Publiées.

Des compteurs peuvent être affichés.

Le changement de filtre est immédiat. Aucun bouton Appliquer.

## Recherche et filtres reportés

Ne pas ajouter au MVP :

- recherche textuelle;
- filtre par thème;
- filtre par niveau;
- filtre par série;
- filtre par mots-clés;
- filtre par date;
- tri avancé.

## Liste sur ordinateur

Présentation recommandée : tableau simple.

Informations affichées :

| Colonne | Contenu |
|---|---|
| Infographie | miniature verticale |
| Titre | titre et série éventuelle |
| Thème | thème principal si disponible |
| Statut | Brouillon ou Publiée |
| Mise à jour | dernière modification |
| Actions | Modifier, Voir, Supprimer |

Le sous-titre complet et les mots-clés ne sont pas affichés dans la liste.

Ordre par défaut :

```text
updated_at décroissant
```

## Actions

### Ajouter

Ouvre le formulaire vide.

### Modifier

Ouvre le formulaire avec les données existantes.

### Voir

Disponible pour une ressource publiée.

Ouvre sa page publique, idéalement dans un nouvel onglet.

Pour un brouillon, cette action est absente ou désactivée. Aucun aperçu public privé n’est requis dans le MVP.

### Supprimer

La suppression exige une confirmation claire.

Elle supprime :

- la ligne de données;
- l’image associée lorsqu’elle existe.

Il n’y a pas de corbeille, d’archivage ou de restauration dans le MVP.

## États

### Aucune ressource

Afficher une carte guidant vers :

`Ajouter une infographie`

### Aucun résultat pour un filtre

Afficher un message propre au filtre et permettre de revenir à Toutes.

### Chargement

Afficher quelques lignes squelettes. Garder l’en-tête et les filtres visibles.

### Erreur

Afficher un message simple avec une action `Réessayer`.

## Mobile

Sur mobile, remplacer le tableau par des cartes compactes contenant :

- miniature;
- titre;
- thème;
- statut;
- date de modification;
- action Modifier;
- menu secondaire pour Voir et Supprimer.

L’administration mobile doit être fonctionnelle, mais l’usage principal demeure l’ordinateur.

---

# 6. Formulaire « Ajouter / Modifier une infographie »

Le même formulaire est utilisé en mode ajout et en mode modification.

## Disposition ordinateur

Deux colonnes :

- environ 65 % pour le formulaire;
- environ 35 % pour l’aperçu de l’image et les informations techniques.

La colonne d’aperçu peut rester visible pendant le défilement.

## Sections du formulaire

```text
1. Image de l’infographie
2. Métadonnées JSON
3. Informations générales
4. Classification
5. Série facultative
6. Points essentiels
7. À retenir
8. Sources
9. Mots-clés
10. Actions
```

---

## 6.1 Image

Accepter :

- PNG;
- JPG/JPEG;
- WebP.

Après le téléversement, afficher :

- aperçu;
- nom original;
- dimensions si détectées;
- poids;
- format;
- actions Remplacer et Retirer.

Ne pas ajouter :

- recadrage;
- retouche;
- génération d’image dans l’administration;
- plusieurs images par ressource.

L’absence d’image ne bloque ni l’enregistrement ni la publication. Le site public doit gérer ce cas proprement.

---

## 6.2 Métadonnées JSON

Deux modes :

- importer un fichier JSON;
- coller le JSON.

Action :

`Analyser et préremplir le formulaire`

Après import :

- remplir les propriétés reconnues;
- ne rien enregistrer automatiquement;
- afficher un résumé de l’import;
- signaler les valeurs inconnues ou non reconnues sans bloquer.

Si le formulaire contient déjà des données, demander confirmation avant de remplacer les métadonnées. L’import JSON ne remplace jamais l’image.

Un JSON syntaxiquement illisible ne modifie aucun champ. Le formulaire reste utilisable manuellement.

---

## 6.3 Informations générales

Champs :

- titre;
- sous-titre;
- résumé;
- introduction;
- texte alternatif.

Utilisation publique :

| Champ | Utilisation |
|---|---|
| Titre | administration, carte, page détaillée |
| Sous-titre | page détaillée |
| Résumé | carte publique |
| Introduction | page détaillée |
| Texte alternatif | accessibilité de l’image |

Les champs sont facultatifs.

---

## 6.4 Classification

Champs :

- thème;
- niveau;
- temps de consultation en minutes.

### Thème

Un seul thème principal.

Ne pas créer de table de thèmes ou d’écran de gestion des thèmes dans le MVP.

Le thème reste une valeur libre. Le formulaire peut éventuellement suggérer les thèmes déjà utilisés.

### Niveau

Valeurs recommandées :

```text
beginner → Débutant
intermediate → Intermédiaire
advanced → Avancé
```

Une autre valeur importée produit un avertissement et peut être ignorée ou corrigée manuellement.

### Temps

Nombre de minutes lorsqu’il est disponible.

Une valeur absente ou invalide ne bloque pas.

---

## 6.5 Série

Section facultative.

Champs :

- nom de la série;
- numéro d’épisode.

Le nom peut être présent sans numéro d’épisode.

Ne pas créer de table ou de page de gestion des séries dans le MVP.

Le nombre total d’épisodes n’est pas prévu.

---

## 6.6 Points essentiels

Liste ordonnée.

Chaque point peut contenir :

- un titre;
- une description.

Actions possibles :

- ajouter;
- supprimer;
- monter;
- descendre.

Les points partiels peuvent être conservés. Une liste vide ne bloque pas la publication.

---

## 6.7 À retenir

Zone de texte simple destinée au bloc pédagogique final de la page détaillée.

Aucun éditeur riche n’est nécessaire.

---

## 6.8 Sources

Liste répétable.

Chaque source peut contenir :

- titre;
- URL.

Une source sans URL est acceptable.

Une URL invalide peut être ignorée tout en conservant le titre.

Le GPT et l’application ne doivent jamais inventer une URL.

---

## 6.9 Mots-clés

Liste facultative de mots-clés.

Ils ne sont pas affichés publiquement dans le MVP.

Ne pas créer de gestion centrale, d’autocomplétion avancée ou de filtres associés.

---

## 6.10 Actions

### Mode ajout

- Annuler;
- Enregistrer en brouillon;
- Publier.

### Brouillon existant

- Annuler;
- Enregistrer les modifications;
- Publier.

### Ressource publiée

- Annuler;
- Enregistrer les modifications;
- Voir la page publique;
- Repasser en brouillon.

Repasser en brouillon retire immédiatement la ressource du site public sans supprimer ses données.

## Avertissements avant publication

L’application peut indiquer les informations manquantes :

> Certaines informations sont absentes. Les sections correspondantes ne seront pas affichées.

La publication reste toujours disponible.

## Sortie avec modifications non enregistrées

Afficher une confirmation avant de quitter le formulaire.

## Mobile

Une seule colonne :

1. image;
2. aperçu;
3. JSON;
4. champs;
5. actions.

Les actions principales peuvent occuper toute la largeur.

---

# 7. Comportement public avec des valeurs manquantes

Le site public affiche seulement les éléments disponibles.

| Information absente | Comportement |
|---|---|
| Titre | afficher `Infographie` |
| Sous-titre | masquer la ligne |
| Résumé | masquer le résumé |
| Introduction | commencer par l’image ou la section suivante |
| Image | afficher un espace réservé neutre |
| Texte alternatif | utiliser une description neutre |
| Thème | afficher seulement `Infographie` |
| Niveau | masquer |
| Temps | masquer |
| Série | masquer |
| Numéro d’épisode | afficher le nom de série seul s’il existe |
| Points essentiels | masquer la section |
| À retenir | masquer le bloc |
| Sources | masquer la section |
| Mots-clés | aucun effet visible |

Aucune zone vide ne doit être conservée uniquement pour maintenir une structure théorique.

---

# 8. Carte publique dans Ressources IA

## Contenu

La carte peut afficher :

- miniature;
- type `Infographie`;
- thème;
- série et épisode lorsqu’ils existent;
- titre;
- résumé;
- niveau;
- temps de consultation;
- lien `Voir l’infographie`.

L’ensemble de la carte peut être cliquable, avec un lien visible pour clarifier l’action.

## Image

- zone verticale 4:5;
- ratio original conservé;
- aucune déformation;
- petites marges neutres préférées à une découpe du contenu pédagogique;
- aucune superposition de texte sur l’image.

## Disposition de la grille

- 3 cartes par ligne sur grand écran;
- 2 sur tablette;
- 1 sur mobile.

Ordre :

```text
published_at décroissant
```

## Effets

Sur ordinateur :

- légère élévation;
- bordure légèrement renforcée;
- animation très discrète.

Le focus clavier doit être visible.

## État vide

Message public sobre annonçant l’arrivée prochaine des ressources.

## Fonctions reportées

- pagination;
- recherche;
- filtres publics;
- tri;
- favoris;
- partage;
- téléchargement;
- nombre de vues;
- auteur;
- date visible.

---

# 9. Page publique détaillée

## Structure

```text
Fil d’Ariane

Type · Thème

Titre
Sous-titre

Série · Épisode
Niveau · Temps

Introduction

Image complète
Action Agrandir

Points essentiels

À retenir

Sources

Retour aux Ressources IA
```

## Image

- centrée;
- ratio conservé;
- aucune découpe;
- largeur confortable sur ordinateur;
- largeur complète disponible sur mobile;
- aucune barre de défilement horizontale.

Une visionneuse simple peut permettre d’agrandir l’image :

- ouvrir;
- fermer;
- touche Échap;
- défilement si l’image dépasse l’écran.

Ne pas ajouter de zoom avancé.

## Points essentiels

Présentation en cartes ou lignes structurées.

Deux colonnes sur ordinateur lorsque les textes sont courts; une colonne sur mobile.

Aucun accordéon.

## À retenir

Bloc visuellement distinct, mais sobre.

## Sources

Afficher :

- titre ou organisme;
- lien externe lorsqu’une URL existe.

Une source sans URL reste du texte simple.

## Mots-clés

Conservés dans les données, mais non affichés dans le MVP.

## Navigation

Une action suffit :

`Retour aux Ressources IA`

## Ressource inexistante, en brouillon ou retirée

Afficher une page non disponible ou 404 avec retour vers Ressources IA.

Un brouillon ne doit pas être lisible publiquement par son URL.

## Fonctions reportées

- ressources associées;
- précédent/suivant;
- navigation de série;
- partage;
- téléchargement;
- commentaires;
- réactions;
- compteur de vues.

---

# 10. Contrat JSON v1

Le contrat complet est défini dans :

```text
CONTRAT_JSON_RESSOURCES_IA_V1.md
```

## Règles importantes

- toutes les métadonnées éditoriales sont facultatives;
- `schemaVersion` est recommandée mais facultative;
- un objet vide est importable;
- les propriétés reconnues sont traitées indépendamment;
- une propriété inconnue est ignorée;
- une valeur invalide ne rend pas tout le JSON inutilisable;
- aucun champ manquant ne bloque l’enregistrement ou la publication;
- l’image reste un fichier séparé;
- l’application garde le contrôle des données techniques.

## Propriétés prévues

```text
schemaVersion
title
subtitle
summary
introduction
imageAlt
theme
level
readingTimeMinutes
series
keyPoints
takeaway
keywords
sources
```

## Propriétés interdites au GPT

```text
id
slug
status
imageUrl
imagePath
publishedAt
createdAt
updatedAt
author
viewCount
```

Le JSON ne doit contenir ni image base64, ni chemin Supabase.

---

# 11. Stockage Supabase

## Structure minimale

```text
Supabase
├── Auth
│   └── un compte administrateur
├── table infographics
└── bucket public infographics
```

Aucune table secondaire n’est nécessaire pour :

- thèmes;
- séries;
- sources;
- points essentiels;
- mots-clés;
- historique;
- rôles.

---

## 11.1 Table `infographics`

### Champs techniques

| Champ | Type logique | Rôle |
|---|---|---|
| `id` | UUID | identifiant généré |
| `status` | texte | `draft` ou `published` |
| `created_at` | date/heure | création |
| `updated_at` | date/heure | dernière modification |
| `published_at` | date/heure nullable | publication la plus récente |
| `image_path` | texte nullable | chemin Storage |
| `image_metadata` | JSON nullable | nom, type, dimensions, poids |

### Champs éditoriaux nullables

```text
title
subtitle
summary
introduction
image_alt
theme
level
reading_time_minutes
series_name
episode_number
key_points
takeaway
keywords
sources
```

Tous les champs éditoriaux doivent être nullables ou accepter une valeur vide raisonnable.

### Colonnes JSON

Utiliser des colonnes JSON pour :

- `key_points`;
- `keywords`;
- `sources`;
- `image_metadata`.

Aucune table séparée.

---

## 11.2 Statuts

Valeurs :

```text
draft
published
```

### Brouillon

- visible dans l’administration;
- absent du site public;
- peut être incomplet;
- peut ne pas avoir d’image.

### Publiée

- visible dans l’administration;
- visible publiquement;
- peut être incomplète;
- les sections absentes sont simplement masquées.

---

## 11.3 Dates

- `created_at` généré à la création;
- `updated_at` actualisé à chaque enregistrement;
- `published_at` défini lors d’une publication;
- une republication après retour en brouillon peut actualiser `published_at`.

---

## 11.4 URL publique

Décision retenue pour le MVP : utiliser l’identifiant, sans slug obligatoire.

Forme proposée :

```text
/ressources-ia/infographies/{id}
```

Cette adresse :

- ne dépend pas du titre;
- accepte une ressource sans titre;
- évite la gestion de doublons;
- reste stable.

Un slug lisible pourra être ajouté plus tard si le besoin réel le justifie.

---

## 11.5 Storage

Bucket proposé :

```text
infographics
```

Organisation proposée :

```text
{infographic_id}/{image_id}.{extension}
```

Le nom original est conservé dans `image_metadata`.

Bucket public recommandé pour le MVP, car les infographies ne sont pas confidentielles et cela simplifie l’affichage public.

---

## 11.6 Remplacement d’image

Ordre :

1. téléverser la nouvelle image;
2. mettre à jour la ligne;
3. supprimer l’ancienne image.

L’import JSON ne modifie jamais l’image.

---

## 11.7 Suppression

Supprimer :

- l’image lorsqu’elle existe;
- la ligne.

Si l’image est déjà absente, la suppression de la ligne doit quand même réussir.

---

## 11.8 Authentification et accès

### Administrateur

- un seul compte Supabase;
- aucune inscription publique;
- aucune table `profiles`;
- aucun système de rôles;
- toute personne authentifiée dans cette zone est considérée administratrice.

### Public

Peut lire uniquement les ressources :

```text
status = published
```

### Administration

L’utilisateur authentifié peut :

- lire tous les statuts;
- créer;
- modifier;
- publier;
- repasser en brouillon;
- supprimer;
- gérer les images.

Aucune vue SQL ou procédure stockée spécialisée n’est nécessaire pour le parcours prévu.

---

# 12. GPT de génération

## Rôle

Le GPT produit :

1. une infographie en français;
2. un fichier JSON compatible;
3. des noms de fichiers cohérents.

Il ne se connecte pas au site.

## Ressources du GPT

À ajouter dans ses connaissances :

- guide de style des infographies 5PennyAi;
- `CONTRAT_JSON_RESSOURCES_IA_V1.md`.

Le guide de style contrôle l’image. Le contrat contrôle les métadonnées.

## Capacités

À activer :

- génération d’images;
- analyse de données pour produire le fichier JSON;
- recherche web.

Aucune action personnalisée ou connexion Supabase.

## Comportement attendu

- consulter le guide de style avant chaque génération;
- adapter la composition au sujet;
- conserver une identité visuelle uniforme;
- produire une seule image sauf demande contraire;
- ne pas bloquer si une métadonnée manque;
- ne pas inventer de sources;
- produire d’abord le JSON, puis l’image;
- faire correspondre le contenu de l’image et du JSON.

## Tests prévus

### Test simple

Infographie sur le RAG, niveau débutant.

### Test de série

Infographie appartenant à `Mon parcours AI-103`, avec numéro d’épisode.

### Test fondé sur des documents

Infographie utilisant uniquement les documents et sources fournis.

## État actuel

- instructions du GPT préparées;
- contrat JSON préparé;
- guide de style à ajouter ou confirmer dans les connaissances;
- premier test du GPT à effectuer.

Le développement peut tenir compte du contrat, mais il est préférable de tester au moins une sortie réelle du GPT avant de commencer l’import JSON.

---

# 13. Hors périmètre de la phase 1

Ne pas ajouter sans besoin observé :

- CMS générique;
- autres types de ressources;
- plusieurs administrateurs ou rôles;
- profils utilisateurs;
- workflow d’approbation;
- historique de versions;
- audit détaillé;
- corbeille;
- archivage;
- publication planifiée;
- sauvegarde automatique;
- édition collaborative;
- statistiques avancées;
- nombre de vues;
- génération IA dans l’administration;
- connexion directe GPT → Supabase;
- éditeur de prompts;
- gestion centrale des thèmes ou séries;
- relations entre ressources;
- duplication;
- sélection multiple;
- suppression en lot;
- aperçu public privé des brouillons;
- plusieurs images par ressource;
- automatisations et traitements en arrière-plan.

---

# 14. Ordre de développement recommandé

Le développement commencera après le test initial du GPT et une dernière revue rapide de cette référence.

## Incrément 1 — Accès administrateur et stockage

Construire seulement :

- authentification simple;
- table `infographics`;
- bucket d’images;
- accès protégé à la zone administrative.

Résultat visible :

> Christian peut se connecter et ouvrir l’administration.

## Incrément 2 — Liste des infographies

Construire :

- page Infographies;
- lecture de la table;
- filtres de statut;
- états vide, chargement et erreur;
- action Ajouter;
- ouverture de la modification.

Résultat visible :

> Les ressources enregistrées apparaissent dans l’administration.

## Incrément 3 — Formulaire manuel

Construire :

- téléversement d’image;
- aperçu;
- champs du formulaire;
- enregistrement en brouillon;
- publication;
- modification;
- retour en brouillon.

Résultat visible :

> Une infographie peut être créée et modifiée sans JSON.

## Incrément 4 — Import JSON

Construire :

- téléversement d’un JSON;
- collage du JSON;
- analyse permissive;
- préremplissage;
- avertissements non bloquants;
- confirmation avant remplacement.

Résultat visible :

> Le JSON produit par le GPT remplit les champs disponibles.

## Incrément 5 — Publication publique

Construire :

- lecture des ressources publiées;
- grille Ressources IA;
- carte;
- page détaillée;
- affichage adaptatif selon les valeurs présentes;
- page indisponible pour les brouillons ou ressources inexistantes.

Résultat visible :

> Le parcours complet fonctionne de l’import jusqu’à la page publique.

## Incrément 6 — Suppression et finitions essentielles

Construire :

- confirmation de suppression;
- suppression de l’image et de la ligne;
- vérification mobile;
- messages de réussite et d’erreur;
- petites corrections de présentation.

Résultat visible :

> Le MVP est utilisable de bout en bout.

---

# 15. Vérifications minimales attendues

Éviter une multiplication de tests.

Prévoir seulement les validations qui protègent le parcours réel :

- accès public refusé aux brouillons;
- accès administrateur protégé;
- création et modification d’une ressource;
- publication et retour en brouillon;
- import d’un JSON complet;
- import d’un JSON partiel;
- JSON invalide sans perte des données du formulaire;
- affichage public avec plusieurs champs absents;
- remplacement d’image;
- suppression de la ressource même si l’image manque;
- vérification visuelle sur ordinateur et mobile.

La vérification principale doit rester visible dans l’application.

---

# 16. Critères de réussite du MVP

La phase 1 est terminée lorsque Christian peut :

1. ouvrir l’administration protégée;
2. consulter la liste des infographies;
3. ajouter une infographie;
4. téléverser une image;
5. importer ou coller un JSON;
6. voir les champs disponibles se préremplir;
7. corriger librement les valeurs;
8. enregistrer en brouillon;
9. publier même si certaines métadonnées sont absentes;
10. voir la carte dans Ressources IA;
11. ouvrir la page publique détaillée;
12. modifier la ressource;
13. repasser la ressource en brouillon;
14. supprimer la ressource et son image.

---

# 17. Prochaine étape

Avant le premier prompt Codex :

1. tester le GPT avec au moins un exemple;
2. vérifier la forme réelle du JSON produit;
3. ajuster le contrat seulement si le test révèle un problème concret;
4. confirmer le guide de style utilisé par le GPT;
5. effectuer une dernière revue rapide de cette référence;
6. préparer un premier prompt Codex limité à l’incrément 1.

Ne pas démarrer plusieurs incréments ensemble.

La priorité reste :

> Livrer rapidement un parcours simple et utilisable, sans recréer la complexité de PennyLearn.
