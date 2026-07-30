# Backlog — MVP Ressources IA, phase 1

**Projet :** 5PennyAi  
**Périmètre :** publication d’infographies pédagogiques  
**Outil de développement :** Codex  
**Date de création :** 30 juillet 2026  
**Statut global :** conception terminée; préparation du développement  
**Prochain incrément :** Incrément 0 — Inspection technique du dépôt

---

## 1. Rôle de ce document

Ce backlog permet de suivre le développement du MVP Ressources IA sur plusieurs sessions sans créer une liste de dizaines ou de centaines de tâches.

Il indique :

- l’incrément actif;
- le résultat fonctionnel attendu;
- les limites de chaque incrément;
- les critères d’acceptation;
- les validations minimales;
- le commit associé une fois l’incrément accepté;
- la prochaine étape.

Les détails techniques temporaires restent dans le prompt Codex de l’incrément. Ils ne deviennent pas des tâches permanentes dans ce backlog.

Ce document est une référence pratique et évolutive. Il ne s’agit pas d’une spécification canonique ou figée.

---

## 2. Documents de référence

Codex doit lire les documents pertinents présents dans le dépôt avant de modifier le code.

Références fonctionnelles principales :

- `GUIDE_PHASE_1_MVP_RESSOURCES_IA.md`;
- `REFERENCE_DEVELOPPEMENT_MVP_RESSOURCES_IA_PHASE_1.md`;
- `CONTRAT_JSON_RESSOURCES_IA_V1.md`;
- `GUIDE_STYLE_INFOGRAPHIES_5PENNYAI.md`;
- `BACKLOG_MVP_RESSOURCES_IA.md`;
- `AGENTS.md`, s’il existe.

Le backlog indique **quoi livrer et dans quel ordre**.

La référence de développement contient les décisions détaillées sur :

- l’administration;
- le formulaire;
- la carte publique;
- la page détaillée;
- Supabase;
- le JSON;
- les validations non bloquantes;
- le GPT de génération.

Ne pas recopier l’intégralité de ces documents dans chaque prompt Codex.

---

## 3. Objectif du MVP

Le parcours final doit être :

```text
Le GPT produit une image et un JSON
→ Christian ouvre l’administration
→ il importe l’image et le JSON
→ les champs disponibles sont préremplis
→ il vérifie ou corrige les valeurs
→ il enregistre en brouillon ou publie
→ l’infographie apparaît dans Ressources IA
→ il peut ensuite la modifier, la retirer ou la supprimer
```

La phase 1 concerne uniquement les infographies.

---

## 4. Principes de développement

### 4.1 Un incrément = un résultat visible

Chaque incrément doit produire une fonction directement observable dans l’application.

Éviter les incréments qui ne livrent que :

- une abstraction;
- une couche intermédiaire;
- une préparation pour plus tard;
- un ensemble de tests sans résultat visible;
- un refactoring sans bénéfice immédiat.

### 4.2 Simplicité avant généralisation

Ne pas construire :

- un CMS générique;
- une table générique `resources`;
- un moteur de types de ressources;
- un workflow d’approbation;
- un historique de versions;
- un système de rôles;
- une architecture prévue pour des besoins hypothétiques.

Les futurs types de contenus seront conçus lorsqu’un besoin réel apparaîtra.

### 4.3 Validations non bloquantes

Les métadonnées éditoriales manquantes ou imparfaites ne doivent jamais empêcher :

- l’importation;
- l’enregistrement;
- la modification;
- la publication.

L’application peut afficher des avertissements. Christian conserve la décision.

### 4.4 Peu de tests, ciblés sur les risques

Tester uniquement les comportements qui protègent le parcours réel.

Ne pas créer une batterie de tests pour :

- chaque composant visuel;
- chaque classe CSS;
- chaque champ facultatif;
- chaque libellé;
- chaque détail d’implémentation.

### 4.5 Pas de travail spéculatif

Codex ne doit pas :

- préparer l’incrément suivant;
- ajouter des fonctions futures non demandées;
- refactoriser des zones non liées;
- ajouter une bibliothèque majeure sans nécessité;
- toucher de nombreux fichiers uniquement pour uniformiser l’architecture.

---

# 5. États du backlog

Utiliser seulement les états suivants :

| État | Signification |
|---|---|
| `À faire` | non commencé |
| `En cours` | Codex travaille sur l’incrément |
| `À valider` | implémentation terminée, vérification manuelle requise |
| `Accepté` | résultat approuvé et commité |
| `Bloqué` | obstacle réel empêchant de poursuivre |

---

# 6. Tableau de progression

| Incrément | Résultat fonctionnel | État | Commit |
|---|---|---|---|
| 0 | Inspection technique du dépôt | Accepté | — (aucun commit de code) |
| 1 | Accès administrateur et stockage minimal | Accepté | — |
| 2 | Liste administrative des infographies | Accepté | — |
| 3 | Formulaire manuel et cycle de publication | À faire | — |
| 4 | Import JSON permissif | À faire | — |
| 5 | Section publique Ressources IA | À faire | — |
| 6 | Suppression et finalisation du MVP | À faire | — |

---

# 7. Préparation avant développement

## État des éléments de conception

- page administrative conçue;
- formulaire Ajouter/Modifier conçu;
- carte publique conçue;
- page publique détaillée conçue;
- stockage Supabase minimal conçu;
- contrat JSON v1 produit;
- instructions du GPT produites;
- guide de style adapté à Ressources IA;
- premier JSON réel du GPT vérifié et jugé conforme.

## Vérification restante du GPT

Avant ou pendant l’inspection technique, effectuer un test complet avec le guide de style révisé :

- image générée;
- JSON généré;
- noms de fichiers cohérents;
- absence de série inventée;
- sources réelles;
- cohérence entre l’image et le JSON.

Cette vérification ne bloque pas l’incrément 0, qui est en lecture seule.

Elle doit être terminée avant l’acceptation de l’import JSON de l’incrément 4.

---

# 8. Incrément 0 — Inspection technique du dépôt

**État :** À faire

## Objectif

Comprendre l’architecture réelle de `5PennyAiWeb` avant toute modification.

## Résultat attendu

Un rapport court permettant de préparer l’incrément 1 sans supposition importante.

Aucun code ne doit être modifié.

## À inspecter

- `AGENTS.md`, s’il existe;
- `git status`;
- branche active;
- remotes;
- cinq derniers commits;
- structure des routes;
- structure des pages publiques;
- composants de mise en page réutilisables;
- mécanisme Supabase existant;
- variables d’environnement;
- authentification déjà présente ou absente;
- migrations et tables existantes;
- buckets Storage existants;
- conventions de formulaires;
- gestion actuelle des erreurs et chargements;
- commandes de build et de test;
- composants pouvant servir à l’administration.

## Questions auxquelles le rapport doit répondre

1. Quel mécanisme minimal utiliser pour protéger l’administration?
2. Où placer les routes administratives?
3. Quels composants existants peuvent être réutilisés?
4. Quelle migration Supabase minimale est réellement nécessaire?
5. Existe-t-il déjà une table, un bucket ou une authentification pouvant être réutilisés?
6. Quelles contraintes du dépôt pourraient modifier notre plan?
7. Quel périmètre précis recommander pour l’incrément 1?

## Hors périmètre

- aucun code;
- aucune migration;
- aucun nouveau fichier d’architecture;
- aucun backlog détaillé;
- aucune proposition de CMS générique;
- aucune préparation des incréments 2 à 6.

## Critères d’acceptation

- dépôt réellement inspecté;
- état Git clairement rapporté;
- approche minimale recommandée;
- risques concrets identifiés;
- aucune modification du dépôt.

## Validation

- `git status` identique avant et après l’inspection.

---

# 9. Incrément 1 — Accès administrateur et stockage minimal

**État :** À faire

## Objectif

Créer la fondation minimale permettant à Christian d’accéder à une administration protégée et de disposer du stockage requis.

## Résultat visible

> Christian peut se connecter et ouvrir la section administrative `Ressources IA → Infographies`.

## Inclus

- authentification administrateur simple;
- réutilisation de Supabase Auth;
- route administrative protégée;
- structure générale de navigation administrative;
- entrée `Ressources IA`;
- sous-section `Infographies`;
- table `infographics`;
- bucket Storage `infographics`;
- politiques d’accès minimales;
- page Infographies provisoire ou état vide simple.

## Modèle de données minimal

La table doit prévoir les champs techniques et éditoriaux décidés dans la référence de développement.

Principes obligatoires :

- champs éditoriaux nullables;
- statuts `draft` et `published`;
- aucune contrainte de complétude éditoriale;
- listes stockées simplement en JSON;
- aucun slug obligatoire;
- aucune table secondaire de thèmes, séries ou sources.

## Hors périmètre

- liste administrative complète;
- formulaire complet;
- import JSON;
- publication publique;
- suppression;
- rôles multiples;
- profils administrateurs;
- tableau de bord;
- statistiques.

## Critères d’acceptation

- un visiteur non authentifié ne peut pas accéder à l’administration;
- Christian peut se connecter;
- la navigation administrative apparaît;
- la route Infographies est accessible;
- la table existe;
- le bucket existe;
- une ressource publiée peut théoriquement être lue publiquement;
- un brouillon n’est pas lisible publiquement;
- aucune architecture générique de ressources n’a été ajoutée.

## Vérifications minimales

- build;
- accès refusé sans authentification;
- accès réussi avec le compte administrateur;
- vérification des politiques Supabase;
- aucun test supplémentaire si la vérification manuelle suffit.

## Rapport Codex attendu

- résultat;
- fichiers modifiés;
- migration créée;
- validations exécutées;
- procédure manuelle de vérification;
- limites connues;
- état Git.

---

# 10. Incrément 2 — Liste administrative des infographies

**État :** À faire

## Objectif

Permettre à Christian de consulter les infographies enregistrées et d’ouvrir le parcours d’ajout ou de modification.

## Résultat visible

> Les ressources enregistrées apparaissent dans l’administration avec leur statut.

## Inclus

- page `Infographies`;
- état vide;
- lecture Supabase;
- tri par `updated_at` décroissant;
- filtres :
  - Toutes;
  - Brouillons;
  - Publiées;
- compteurs simples si faciles à ajouter;
- miniature lorsqu’une image existe;
- titre ou libellé neutre;
- thème lorsqu’il existe;
- badge de statut;
- dernière modification;
- action Ajouter;
- action Modifier;
- action Voir pour une ressource publiée;
- états chargement et erreur;
- cartes compactes sur mobile.

## Hors périmètre

- recherche;
- pagination;
- tri manuel;
- filtres avancés;
- sélection multiple;
- formulaire fonctionnel complet;
- import JSON;
- duplication;
- publication depuis la liste;
- changement de statut dans la liste.

## Critères d’acceptation

- état vide clair;
- ressources triées correctement;
- filtres fonctionnels;
- brouillons et publications distinguables;
- action Ajouter ouvre la future route du formulaire;
- action Modifier ouvre la bonne ressource;
- action Voir n’est disponible que pour une ressource publiée;
- présentation utilisable sur ordinateur;
- présentation mobile fonctionnelle.

## Vérifications minimales

- build;
- vérification manuelle de l’état vide;
- vérification avec au moins un brouillon et une publication;
- vérification des trois filtres;
- aucun test automatisé requis si la logique reste simple.

---

# 11. Incrément 3 — Formulaire manuel et cycle de publication

**État :** À faire

## Objectif

Permettre de créer, modifier, publier et retirer une infographie sans utiliser le JSON.

## Résultat visible

> Une infographie peut être gérée entièrement à la main.

## Inclus

### Image

- téléversement PNG, JPG/JPEG ou WebP;
- aperçu;
- nom original;
- dimensions si disponibles;
- poids et type;
- remplacement;
- retrait.

### Champs

- titre;
- sous-titre;
- résumé;
- introduction;
- texte alternatif;
- thème;
- niveau;
- temps de consultation;
- nom de série;
- numéro d’épisode;
- points essentiels;
- À retenir;
- sources;
- mots-clés.

### Cycle de vie

- ajouter;
- modifier;
- enregistrer en brouillon;
- publier;
- enregistrer les changements;
- repasser en brouillon;
- avertissements non bloquants;
- confirmation avant de quitter avec des changements non enregistrés.

## Principes obligatoires

- aucun champ éditorial obligatoire;
- l’image n’est pas obligatoire;
- la publication reste possible avec des champs manquants;
- les avertissements ne bloquent pas;
- le même formulaire sert à l’ajout et à la modification;
- aucune sauvegarde automatique.

## Hors périmètre

- import JSON;
- éditeur riche;
- recadrage;
- génération d’image;
- historique;
- versions;
- aperçu public privé;
- gestion centrale des thèmes;
- gestion centrale des séries.

## Critères d’acceptation

- création d’un brouillon vide ou presque vide;
- ajout d’une image;
- remplacement de l’image;
- retrait de l’image;
- modification des champs;
- publication d’une ressource incomplète;
- retour en brouillon;
- données persistées correctement;
- interface cohérente avec la maquette;
- usage mobile possible.

## Vérifications minimales

- build;
- un test ciblé sur le contrôle public du statut si nécessaire;
- scénario manuel complet :
  1. créer;
  2. enregistrer;
  3. modifier;
  4. publier;
  5. repasser en brouillon;
  6. remplacer l’image.

---

# 12. Incrément 4 — Import JSON permissif

**État :** À faire

## Objectif

Préremplir le formulaire à partir du JSON produit par le GPT, sans introduire de validation bloquante.

## Résultat visible

> Le JSON du GPT remplit les propriétés disponibles et laisse Christian libre de corriger le reste.

## Inclus

- import d’un fichier `.json`;
- collage du contenu JSON;
- action Analyser et préremplir;
- prise en charge du contrat v1;
- objet partiel accepté;
- objet vide accepté;
- propriétés inconnues ignorées;
- valeurs invalides signalées;
- champs valides importés indépendamment;
- confirmation avant de remplacer un formulaire déjà rempli;
- image toujours indépendante du JSON;
- résumé de l’import.

## Cas de test réels

### Cas 1 — JSON RAG complet

Utiliser le JSON déjà produit par le GPT.

### Cas 2 — JSON partiel

Exemple :

```json
{
  "title": "Introduction au RAG",
  "series": {
    "name": "Ressources IA"
  }
}
```

### Cas 3 — JSON imparfait

Exemple :

```json
{
  "title": "Architecture agentique",
  "level": "expert",
  "readingTimeMinutes": "cinq",
  "unknownField": true
}
```

### Cas 4 — JSON invalide

Contenu syntaxiquement illisible.

## Hors périmètre

- publication automatique;
- sauvegarde du JSON original;
- historique des imports;
- versionnement complexe du contrat;
- correction automatique par IA;
- génération de métadonnées dans l’application.

## Critères d’acceptation

- JSON complet importé;
- JSON partiel importé;
- objet vide accepté;
- valeur invalide non bloquante;
- propriété inconnue ignorée;
- JSON invalide ne modifie pas le formulaire;
- formulaire prérempli mais non enregistré;
- confirmation avant remplacement;
- image existante conservée;
- aucun champ manquant ne bloque la publication.

## Tests ciblés recommandés

Maximum recommandé : trois tests automatisés.

1. import partiel;
2. import avec valeurs invalides;
3. JSON syntaxiquement invalide sans perte des valeurs présentes.

La vérification manuelle avec le JSON réel du GPT demeure obligatoire.

---

# 13. Incrément 5 — Section publique Ressources IA

**État :** À faire

## Objectif

Afficher les infographies publiées sur le site et rendre leur contenu consultable.

## Résultat visible

> Le parcours fonctionne de la publication administrative jusqu’à la page publique.

## Inclus

### Page Ressources IA

- en-tête de la section;
- grille des infographies publiées;
- tri par `published_at` décroissant;
- trois cartes par ligne sur grand écran;
- deux sur tablette;
- une sur mobile;
- état vide;
- chargement;
- erreur.

### Carte

- image ou espace réservé;
- type `Infographie`;
- thème si disponible;
- série et épisode si disponibles;
- titre ou libellé `Infographie`;
- résumé si disponible;
- niveau si disponible;
- temps si disponible;
- action `Voir l’infographie`.

### Page détaillée

- fil d’Ariane;
- type et thème;
- titre;
- sous-titre;
- série et épisode;
- niveau et temps;
- introduction;
- image;
- agrandissement simple;
- points essentiels;
- bloc À retenir;
- sources;
- retour aux Ressources IA.

### Accès

- seules les ressources `published` sont publiques;
- les brouillons et identifiants inexistants affichent une page non disponible ou 404.

## Affichage adaptatif

Masquer toute section dont les données sont absentes.

Ne pas conserver de zone vide.

## Hors périmètre

- recherche;
- filtres publics;
- pagination;
- téléchargement;
- partage;
- commentaires;
- favoris;
- compteur de vues;
- ressources associées;
- navigation entre épisodes;
- page de série;
- auteur;
- date de publication visible.

## Critères d’acceptation

- publication visible dans la grille;
- carte conforme à la conception;
- page détaillée fonctionnelle;
- sections absentes masquées;
- brouillon inaccessible;
- image manquante gérée proprement;
- sources externes utilisables;
- affichage mobile lisible;
- aucune obligation de slug.

## Vérifications minimales

- build;
- un test ciblé confirmant qu’un brouillon n’est pas public;
- scénario manuel avec :
  - ressource complète;
  - ressource partielle;
  - ressource sans image;
  - identifiant inexistant.

---

# 14. Incrément 6 — Suppression et finalisation du MVP

**État :** À faire

## Objectif

Terminer le cycle de gestion et valider le parcours complet.

## Résultat visible

> Le MVP est utilisable de bout en bout par Christian.

## Inclus

- action Supprimer dans l’administration;
- confirmation;
- suppression de l’image;
- suppression de la ligne;
- suppression de la ligne même si l’image manque;
- messages de réussite;
- messages d’erreur;
- vérification mobile;
- correction des problèmes observés pendant le parcours complet;
- petites finitions visuelles nécessaires.

## Hors périmètre

- corbeille;
- restauration;
- archivage;
- suppression en lot;
- tâches en arrière-plan;
- nettoyage général du dépôt;
- nouvelles fonctions non requises pour le parcours.

## Critères d’acceptation

Christian peut :

1. se connecter;
2. voir la liste;
3. ajouter une infographie;
4. importer une image;
5. importer ou coller un JSON;
6. corriger les champs;
7. enregistrer en brouillon;
8. publier avec des données manquantes;
9. voir la carte publique;
10. ouvrir la page détaillée;
11. modifier la ressource;
12. repasser en brouillon;
13. republier;
14. supprimer la ressource et son image.

## Vérifications minimales

- build;
- suppression avec image;
- suppression sans image;
- parcours complet sur ordinateur;
- vérification sommaire sur mobile;
- aucune nouvelle fonction ajoutée pendant la finition.

---

# 15. Discipline des prompts Codex

Chaque prompt doit contenir les sections suivantes.

## Résultat attendu

Un seul résultat fonctionnel, exprimé clairement.

## Contexte minimal

Nommer les documents à lire, sans les recopier.

## Portée

Préciser ce qui doit être construit.

## Hors périmètre

Lister explicitement ce qui ne doit pas être ajouté.

## Invariants critiques

Seulement les règles qui ne doivent pas être violées.

Exemples :

- métadonnées facultatives;
- publication non bloquée;
- brouillons non publics;
- aucune table générique;
- aucune préparation du prochain incrément.

## Validation

Limiter les tests et commandes au risque réel.

## Vérification manuelle

Décrire le scénario visible à exécuter.

## Rapport final

Demander :

- résultat;
- fichiers modifiés;
- validations exécutées;
- vérification manuelle;
- limites connues;
- état Git;
- aucun push sans demande explicite.

---

# 16. Politique de tests et vérifications

## Principe

Tester les comportements risqués, pas chaque ligne.

## Limite habituelle par incrément

- changement surtout visuel : aucun nouveau test automatisé;
- logique simple : un ou deux tests ciblés;
- import JSON : jusqu’à trois tests ciblés;
- build réussi;
- vérification manuelle obligatoire.

Cette limite est une orientation, pas une règle absolue. Toute suite de tests plus importante doit être justifiée par un risque concret.

## Comportements à protéger

- accès administrateur protégé;
- brouillons non publics;
- publication et retour en brouillon;
- import JSON partiel;
- JSON invalide sans perte du formulaire;
- affichage public avec champs absents;
- remplacement d’image;
- suppression même si l’image manque.

## À éviter

- tests de classes CSS;
- snapshots volumineux;
- tests de tous les libellés;
- tests de chaque champ facultatif;
- mocks complexes de Supabase sans bénéfice;
- duplication de tests existants;
- couverture arbitraire comme objectif.

---

# 17. Protocole de début de session

Au début de chaque session de développement :

1. lire `AGENTS.md`, s’il existe;
2. lire la référence de développement;
3. lire ce backlog;
4. identifier l’incrément actif;
5. inspecter `git status`;
6. vérifier la branche active;
7. consulter les derniers commits;
8. vérifier le rapport de la session précédente;
9. préparer un seul prompt Codex.

Ne pas commencer deux incréments dans la même session, sauf si le premier est minuscule, accepté et commité, et que Christian le demande explicitement.

---

# 18. Protocole de fin de session

À la fin d’une session :

1. vérifier le résultat dans l’application;
2. corriger seulement les problèmes observés;
3. exécuter les validations minimales;
4. faire accepter le résultat par Christian;
5. créer un commit local;
6. mettre à jour le tableau de progression;
7. inscrire le commit et les limites connues;
8. identifier l’incrément suivant;
9. ne pas pousser sans demande explicite.

Format de clôture recommandé :

```text
Incrément : 3 — Formulaire manuel
État : Accepté
Commit : abc1234
Résultat : création, modification, brouillon et publication fonctionnels
Validations : build + scénario manuel complet
Limite connue : import JSON reporté à l’incrément 4
Prochain incrément : 4 — Import JSON permissif
```

---

# 19. Signaux de dérive

Arrêter et réviser le prompt si Codex :

- crée une architecture générique de ressources;
- ajoute plusieurs tables non prévues;
- introduit un système de rôles;
- ajoute un workflow;
- modifie de nombreuses zones sans rapport;
- prépare plusieurs incréments;
- ajoute une grande bibliothèque sans besoin;
- multiplie les tests pour une petite fonction;
- bloque la publication selon la complétude;
- refait le design général du site;
- ajoute des fonctions futures « tant qu’à y être ».

Une implémentation déjà commencée ne justifie pas de conserver une complexité inutile.

---

# 20. Critères de clôture de la phase 1

Le MVP est terminé lorsque le parcours suivant fonctionne réellement :

```text
GPT
→ image + JSON
→ administration protégée
→ import
→ correction
→ brouillon ou publication
→ carte publique
→ page détaillée
→ modification
→ retrait
→ suppression
```

La phase 1 n’exige pas :

- une architecture commerciale;
- une couverture de tests élevée;
- un CMS extensible;
- des automatisations;
- une finition parfaite de toutes les variantes futures.

Elle exige un outil simple, fiable et réellement utilisable par Christian.

---

# 21. Journal des incréments

Ajouter une entrée seulement lorsqu’un incrément change d’état.

## Modèle

```text
### AAAA-MM-JJ — Incrément X

État :
Commit :
Résultat :
Validation :
Limite connue :
Prochaine étape :
```

### 2026-07-30 — Incrément 0

État : Accepté
Commit : aucun commit de code
Résultat : dépôt inspecté, architecture et contraintes documentées
Validation : état Git identique avant et après l’inspection
Limite connue : état Supabase distant à vérifier manuellement
Prochaine étape : Incrément 1 — Accès administrateur et stockage minimal

### 2026-07-30 — Incrément 1

État : Accepté
Commit : —
Résultat : route protégée et stockage Supabase minimal opérationnels
Validation : route, authentification, table et bucket vérifiés par Christian
Limite connue : aucune pour le périmètre accepté
Prochaine étape : Incrément 2 — Liste administrative des infographies

### 2026-07-30 — Incrément 2

État : Accepté
Commit : —
Résultat : liste Supabase, filtres, tableau bureau, cartes mobiles et états d’interface fonctionnels
Validation : build, lint ciblé, traductions JSON, `git diff --check` et vérification manuelle authentifiée
Limite connue : Ajouter et Modifier restent reportés à l’incrément 3
Prochaine étape : Incrément 3 — Formulaire manuel et cycle de publication

---

# 22. Première action

Préparer et exécuter un prompt Codex d’inspection technique en lecture seule pour l’incrément 0.

Après acceptation du rapport :

1. ajuster si nécessaire le périmètre de l’incrément 1;
2. marquer l’incrément 0 `Accepté`;
3. inscrire le commit seulement si un document du dépôt a été modifié;
4. lancer l’incrément 1 dans une nouvelle session ou après validation explicite.

La priorité reste :

> Livrer rapidement un parcours simple et utilisable, sans recréer la complexité de PennyLearn.
