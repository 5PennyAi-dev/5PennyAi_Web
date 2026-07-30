# Guide de développement — Phase 1 du MVP Ressources IA

## But du document

Ce guide sert uniquement de fil conducteur pour concevoir et développer la première version de la section **Ressources IA** de 5PennyAi.

Il n’est pas un document canonique, ni une spécification figée. Il peut être ajusté à mesure que la conception avance.

L’objectif est simple : éviter de perdre de vue le parcours minimal à livrer.

---

## Objectif de la phase 1

Permettre à Christian de publier une infographie pédagogique sur le site à partir de deux fichiers produits par un GPT dédié :

1. une image d’infographie;
2. un fichier JSON contenant les métadonnées associées.

Le parcours complet visé est :

> Créer l’infographie et le JSON → les importer dans l’administration → vérifier ou corriger les champs → publier → voir l’infographie sur le site public.

---

## Périmètre du MVP

La phase 1 concerne uniquement les **infographies**.

### Éléments à livrer

- une page d’administration listant les infographies;
- une page d’ajout et de modification;
- le téléversement d’une image;
- l’importation d’un fichier JSON ou le collage de son contenu;
- le préremplissage automatique du formulaire;
- la correction manuelle des champs;
- l’enregistrement en brouillon;
- la publication;
- l’affichage de la ressource dans la page publique Ressources IA;
- une page publique détaillée pour chaque infographie;
- le stockage des données et des images dans Supabase;
- une authentification administrateur simple.

### Hors périmètre

Ne pas ajouter pendant cette phase :

- gestion de plusieurs rôles;
- workflow d’approbation;
- historique des versions;
- planification de publication;
- statistiques avancées;
- génération de l’infographie dans l’application;
- connexion directe entre le GPT et le site;
- moteur générique pour tous les futurs types de ressources;
- gestion avancée des catégories;
- automatisations ou traitements en arrière-plan;
- architecture prévue pour des besoins hypothétiques.

---

## Principe de développement

Chaque étape doit produire un résultat visible et directement utile.

Avant d’ajouter une fonction, vérifier qu’elle contribue au parcours minimal :

> Image + JSON → vérification → publication → affichage public.

Si ce n’est pas le cas, elle est probablement hors périmètre.

---

# Ordre de conception

La conception doit être terminée avant le développement.

## 1. Modèle de contenu d’une infographie

Définir les informations réellement nécessaires :

- titre;
- sous-titre;
- résumé;
- introduction;
- texte alternatif;
- thème;
- niveau;
- temps de consultation;
- série et numéro d’épisode, si applicable;
- points essentiels;
- texte « À retenir »;
- mots-clés;
- sources;
- image;
- statut de publication.

Pour chaque champ, décider :

- s’il est obligatoire;
- s’il est facultatif;
- son format;
- où il apparaît dans le site public.

## 2. Page d’administration « Infographies »

Concevoir la page qui liste les ressources.

Éléments minimaux :

- miniature;
- titre;
- thème;
- statut;
- date;
- bouton « Ajouter une infographie »;
- actions Voir, Modifier et Supprimer;
- filtres simples Toutes, Brouillons et Publiées;
- état vide lorsqu’aucune infographie n’existe.

## 3. Page « Ajouter une infographie »

Concevoir le formulaire complet.

Sections minimales :

1. téléversement et aperçu de l’image;
2. importation ou collage du JSON;
3. informations générales;
4. classification;
5. points essentiels;
6. texte « À retenir »;
7. sources et mots-clés;
8. actions Enregistrer en brouillon et Publier.

La page de modification doit réutiliser le même formulaire.

## 4. Affichage public

Définir quels champs apparaissent :

### Dans la carte Ressources IA

- image;
- type « Infographie »;
- titre;
- résumé;
- thème;
- niveau;
- temps de consultation.

### Dans la page détaillée

- titre;
- sous-titre;
- introduction;
- métadonnées;
- image complète;
- points essentiels;
- texte « À retenir »;
- sources;
- ressources associées, seulement si cette fonction reste simple.

## 5. Contrat JSON

Créer une version 1 simple correspondant exactement aux champs approuvés.

Le contrat doit préciser :

- les propriétés obligatoires;
- les propriétés facultatives;
- les valeurs permises;
- les types attendus;
- un exemple valide.

Le JSON doit préremplir le formulaire, mais ne doit jamais publier automatiquement.

## 6. Supabase

Une fois les champs confirmés, concevoir le stockage minimal :

- Supabase Auth pour l’administrateur;
- une table `infographics`;
- un bucket Storage pour les images;
- lecture publique des ressources publiées;
- accès complet réservé à l’administrateur;
- suppression de la ligne et de l’image associée.

Éviter les tables secondaires et fonctions SQL qui ne sont pas nécessaires au MVP.

## 7. GPT minimal de test

Créer rapidement un GPT capable de produire :

- une infographie;
- un JSON conforme;
- des noms de fichiers cohérents.

Le style visuel n’a pas besoin d’être final pendant les tests.

Préparer au moins trois exemples :

- une infographie simple;
- une infographie appartenant à une série;
- une infographie contenant plusieurs sources.

---

# Ordre de développement

Le développement commencera seulement après l’approbation de la conception.

## Incrément 1 — Accès administrateur et stockage

- authentification simple;
- table Supabase;
- bucket d’images;
- accès à la zone admin.

**Résultat visible :** la page d’administration est accessible.

## Incrément 2 — Liste des infographies

- affichage des données;
- statuts;
- bouton d’ajout;
- actions principales.

**Résultat visible :** les infographies existantes apparaissent dans l’administration.

## Incrément 3 — Formulaire manuel

- téléversement de l’image;
- saisie des champs;
- enregistrement en brouillon;
- modification.

**Résultat visible :** une infographie peut être créée sans utiliser le JSON.

## Incrément 4 — Importation du JSON

- téléversement ou collage;
- validation;
- préremplissage;
- erreurs compréhensibles.

**Résultat visible :** le JSON produit par le GPT remplit le formulaire.

## Incrément 5 — Publication publique

- publication;
- carte dans Ressources IA;
- page publique détaillée.

**Résultat visible :** le parcours complet fonctionne.

## Incrément 6 — Finitions essentielles

- suppression avec confirmation;
- états vides;
- messages d’erreur;
- vérification mobile;
- petites corrections de présentation.

Aucune fonction supplémentaire ne doit être ajoutée sans besoin observé.

---

# Critères de réussite du MVP

La phase 1 est terminée lorsque Christian peut :

1. ouvrir l’administration;
2. cliquer sur « Ajouter une infographie »;
3. téléverser l’image;
4. importer le JSON;
5. vérifier et modifier les champs;
6. enregistrer en brouillon ou publier;
7. voir l’infographie apparaître dans Ressources IA;
8. ouvrir sa page publique;
9. modifier ou supprimer la ressource.

---

# Règle de simplicité

Lorsqu’une décision semble introduire beaucoup de code, de tables, de tests ou de concepts, revenir à ces questions :

- Est-ce nécessaire pour publier une première infographie?
- Est-ce utile dans l’interface dès maintenant?
- Existe-t-il une solution plus directe?
- Peut-on reporter cette fonction après le MVP?

La priorité est de livrer rapidement un parcours complet, compréhensible et utilisable.
