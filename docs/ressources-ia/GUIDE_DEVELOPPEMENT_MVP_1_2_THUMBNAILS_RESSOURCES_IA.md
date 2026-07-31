# Guide de développement — MVP 1.2 Thumbnails Ressources IA

**Projet :** 5PennyAi  
**Section :** Ressources IA  
**Date :** 31 juillet 2026  
**Statut :** conception fonctionnelle prête à être implantée par incréments

---

## 1. Rôle du document

Ce guide encadre l’évolution **MVP 1.2** de la section Ressources IA.

Il prolonge le MVP 1.1 sans reconstruire la bibliothèque, la page de série ou le parcours de publication existant. Il sert de fil conducteur pratique pour ajouter des **thumbnails dédiés** aux fiches et aux séries.

Il ne constitue pas une spécification figée. L’inspection du dépôt, des fonctions serverless et de l’intégration actuelle aux modèles d’images demeure la source de vérité technique.

La priorité reste une implantation simple, contrôlable et visible après chaque incrément.

---

## 2. Contexte observé

Le MVP 1.1 a remplacé l’affichage presque complet des infographies par des aperçus compacts. Cette amélioration réduit fortement la hauteur des cartes et clarifie les séries.

L’utilisation réelle a toutefois révélé une limite persistante :

- les infographies sont conçues comme des documents pédagogiques verticaux et denses;
- même recadrées, elles contiennent des petits caractères et plusieurs zones visuelles;
- dans une carte de catalogue, ces détails deviennent du bruit plutôt qu’une information utile;
- les compositions de plusieurs infographies dans une carte de série accentuent le problème;
- les fichiers originaux restent lourds pour un usage de simple aperçu.

Des essais de génération ont confirmé qu’une image conçue spécifiquement comme **couverture horizontale 16:9** produit un résultat nettement plus lisible : grand titre, épisode, illustration simplifiée et très peu de texte.

La décision retenue est donc de distinguer deux assets :

```text
Infographie complète
→ document pédagogique détaillé affiché dans la fiche

Thumbnail
→ couverture simplifiée affichée dans le catalogue
```

---

## 3. Objectif du MVP 1.2

Permettre à Christian de :

- associer un thumbnail dédié à une infographie;
- générer ce thumbnail directement depuis l’administration;
- prévisualiser et régénérer le résultat;
- utiliser un thumbnail produit ailleurs lorsque nécessaire;
- conserver un fallback propre lorsqu’aucun thumbnail n’existe;
- générer une couverture dédiée pour une série;
- afficher cette couverture dans la vue Séries et dans la série mise en vedette;
- réduire sensiblement le poids des images chargées par le catalogue;
- conserver l’infographie originale intacte dans la page détaillée.

Le résultat doit rester compatible avec le contrat JSON v1 et le flux de publication actuel.

---

## 4. Principes directeurs

### 4.1 Le thumbnail est un asset dérivé

Le thumbnail ne remplace pas l’infographie. Il sert uniquement de couverture dans les contextes de catalogue.

Une infographie publiée reste valide même si aucun thumbnail n’a été généré.

### 4.2 Génération à la demande

Le MVP ne génère pas automatiquement un thumbnail à chaque publication.

Christian déclenche explicitement l’action :

```text
Générer le thumbnail
```

Cela permet de contrôler les coûts, de vérifier le résultat et de régénérer seulement lorsque nécessaire.

### 4.3 Fallback obligatoire

Si aucun thumbnail n’existe :

- une carte individuelle continue d’utiliser l’infographie originale recadrée;
- une carte de série continue d’utiliser la composition actuelle de quelques épisodes;
- aucune ressource ne disparaît;
- aucune publication n’est bloquée.

### 4.4 Contrôle humain

La génération assiste Christian, mais ne publie jamais silencieusement un nouvel asset sans contrôle visible.

Le formulaire doit montrer :

- le thumbnail actuel;
- le résultat nouvellement généré;
- l’action de remplacement ou de sauvegarde selon le fonctionnement réel du formulaire;
- un message clair en cas d’échec.

### 4.5 Une skill serveur, pas une dépendance à un GPT personnalisé

Un GPT personnalisé peut servir à prototyper les prompts, mais le site ne doit pas dépendre d’une conversation ChatGPT ou d’un GPT interactif pour fonctionner.

Dans le MVP 1.2, le terme **skill thumbnail** désigne :

- un contrat d’entrée contrôlé;
- un prompt serveur versionné;
- des règles visuelles stables;
- un appel au modèle d’image depuis le backend;
- la validation et le stockage du résultat.

Le frontend ne reçoit jamais la clé du fournisseur d’images.

### 4.6 Pas de CMS ou de studio graphique générique

Cette phase ne doit pas introduire :

- un éditeur de prompt libre;
- un éditeur graphique;
- plusieurs variantes enregistrées;
- un historique de versions complet;
- une file de production complexe;
- un gestionnaire générique de médias;
- une abstraction multi-fournisseurs sans besoin réel.

---

## 5. Terminologie

### Thumbnail individuel

Couverture 16:9 représentant une infographie précise.

Il peut contenir :

- un titre court ou le titre principal;
- le numéro d’épisode;
- le nom de la série de façon discrète;
- une illustration simplifiée;
- quelques grandes relations visuelles.

### Thumbnail de série

Couverture 16:9 représentant une série entière.

Il peut contenir :

- le titre de la série;
- un motif de progression ou de collection;
- quelques éléments visuels représentant les sujets principaux.

Le nombre d’épisodes et le niveau sont de préférence affichés en HTML dans la carte, et non intégrés dans l’image, afin d’éviter qu’ils deviennent périmés.

### Source visuelle

Infographie complète pouvant être fournie au modèle comme référence de style et de sujet.

Elle ne doit pas être simplement réduite ou recadrée par le modèle. La skill doit créer une nouvelle couverture simplifiée.

### Skill thumbnail

Fonction serveur qui prépare le contenu, construit le prompt, appelle le modèle, valide l’image et la stocke.

---

## 6. Direction visuelle cible

### 6.1 Format

Format de référence :

```text
16:9
```

Dimension cible recommandée après normalisation :

```text
1280 × 720 px
```

Une autre dimension 16:9 proche est acceptable si elle correspond mieux aux capacités du fournisseur, à condition que le frontend affiche un ratio uniforme.

### 6.2 Style

Les thumbnails reprennent l’univers visuel des Ressources IA :

- fond off-white;
- texte Navy;
- accents Blue, Teal et Violet;
- Orange utilisé ponctuellement;
- cartes légèrement arrondies;
- illustrations techniques simples;
- langage éditorial tech;
- doodles discrets;
- haute lisibilité à petite taille.

### 6.3 Densité

Le thumbnail n’est pas une petite infographie.

Il doit éviter :

- les paragraphes;
- les listes détaillées;
- les sources;
- les URL;
- les tableaux complets;
- plus de quelques libellés courts;
- les petits caractères;
- la reproduction de toutes les sections de l’image originale.

### 6.4 Branding

Le site possède déjà son propre branding autour des cartes. Le thumbnail n’a pas besoin de reproduire un logo.

Pour éviter les logos approximatifs générés par le modèle :

- ne pas demander de logo 5PennyAi dans l’image;
- ne pas demander de marque tierce;
- ne pas afficher de filigrane;
- utiliser la palette et le langage visuel comme éléments de cohérence.

### 6.5 Texte dans l’image

Le texte doit rester minimal :

- titre principal;
- épisode lorsque pertinent;
- éventuellement une phrase très courte;
- au maximum quelques libellés de schéma.

La génération de texte dans une image peut produire des erreurs. Le MVP repose donc sur :

- une prévisualisation obligatoire;
- la possibilité de régénérer;
- un prompt qui limite fortement la quantité de texte.

Une composition déterministe du texte par le serveur pourra être évaluée plus tard seulement si les erreurs deviennent fréquentes.

---

## 7. Skill de génération

## 7.1 Modes

Une seule skill peut gérer deux modes :

```text
resource_thumbnail
series_thumbnail
```

Le code peut utiliser deux fonctions spécialisées si cela correspond mieux à l’architecture existante, mais les règles visuelles doivent demeurer centralisées.

## 7.2 Entrée côté client

Le client ne doit pas envoyer un prompt libre ni être la source de vérité des métadonnées.

Entrée minimale recommandée :

```json
{
  "mode": "resource_thumbnail",
  "resourceId": "uuid"
}
```

ou :

```json
{
  "mode": "series_thumbnail",
  "seriesSlug": "les-fondamentaux-de-l-ia-generative"
}
```

Le serveur récupère ensuite les données autorisées.

## 7.3 Données utilisées pour une fiche

La skill peut utiliser :

- titre;
- sous-titre;
- résumé;
- thème;
- niveau;
- série;
- numéro d’épisode;
- points essentiels;
- texte à retenir;
- image originale comme référence facultative.

Elle ne doit pas transmettre inutilement :

- les sources complètes;
- les URL;
- des champs administratifs;
- des données privées;
- un contenu non nécessaire à la composition.

## 7.4 Données utilisées pour une série

La skill peut utiliser :

- nom exact de la série;
- titres de quelques épisodes représentatifs;
- thèmes dominants;
- niveau commun lorsque disponible;
- un maximum raisonnable de visuels de référence.

Le nombre d’épisodes peut guider la composition, mais ne devrait pas nécessairement être intégré dans l’image. Le nombre public reste calculé et affiché par l’application.

## 7.5 Sortie

La skill produit :

- une seule image;
- un ratio 16:9;
- aucun JSON éditorial supplémentaire;
- aucun texte de publication;
- aucune modification directe du statut de la ressource.

Le backend normalise ensuite le fichier si l’architecture le permet.

## 7.6 Prompt versionné

Le prompt doit être conservé dans le code serveur avec une version explicite, par exemple :

```text
thumbnail-skill-v1
```

Ne pas exposer un éditeur de prompt dans l’administration.

Une évolution de la direction visuelle donnera lieu à une nouvelle version du prompt, sans modifier les thumbnails existants automatiquement.

---

## 8. Modèle de données

## 8.1 Infographies

Ajouter au minimum :

```text
thumbnail_path text null
```

Propriété facultative utile :

```text
thumbnail_generated_at timestamptz null
```

Cette date peut aider à comprendre quand l’asset a été produit, mais elle ne doit pas introduire un workflow complexe.

Aucun champ thumbnail n’est ajouté au contrat JSON v1. Le thumbnail est contrôlé par l’application, comme l’image stockée et le statut.

## 8.2 Séries

Le besoin d’une couverture propre à la série justifie maintenant une petite entité persistante.

Créer une table minimale, par exemple :

```text
resource_series
- slug text primary key
- name text not null
- thumbnail_path text null
- thumbnail_generated_at timestamptz null
- created_at timestamptz
- updated_at timestamptz
```

Cette table ne devient pas une administration complète des séries.

Elle ne contient pas dans ce MVP :

- description;
- statut;
- ordre manuel;
- niveau éditorial;
- nombre d’épisodes stocké;
- couverture supplémentaire;
- contenu riche.

Les épisodes continuent d’être regroupés à partir de `series_name` et de leur slug dérivé. La visibilité d’une série continue de dépendre de la présence de ressources publiées.

Si l’inspection révèle une solution plus simple et aussi sûre, elle peut être retenue, mais le thumbnail de série doit avoir une source de vérité persistante unique.

## 8.3 RLS et sécurité

Règles minimales :

- lecture publique seulement des données nécessaires à l’affichage des thumbnails de séries;
- écriture réservée à l’administration authentifiée;
- génération accessible uniquement à l’administrateur;
- clés de modèles conservées côté serveur;
- aucune confiance accordée à un titre ou un chemin fourni arbitrairement par le client.

---

## 9. Stockage des fichiers

Réutiliser de préférence le bucket actuel des infographies, avec des sous-répertoires clairs :

```text
thumbnails/infographics/{resourceId}/{uniqueName}.webp
thumbnails/series/{seriesSlug}/{uniqueName}.webp
```

Un nom unique par génération évite les problèmes de cache après régénération.

Séquence de remplacement recommandée :

1. générer et valider le nouveau fichier;
2. téléverser sous un nouveau chemin;
3. mettre à jour la base;
4. supprimer l’ancien fichier en meilleur effort;
5. conserver l’ancien asset si la mise à jour de la base échoue.

Ne jamais supprimer l’ancien thumbnail avant que le nouveau soit utilisable.

### Format et poids

Format recommandé :

```text
WebP
```

Le PNG ou JPEG peut être accepté en entrée manuelle, puis normalisé si l’outillage existant le permet.

Le thumbnail doit être sensiblement plus léger que l’infographie originale. Une cible de quelques centaines de kilo-octets peut guider la validation, sans bloquer arbitrairement la sauvegarde si la qualité exige davantage.

---

## 10. Administration — thumbnail individuel

Ajouter une section dédiée dans le formulaire Ajouter/Modifier une infographie.

## 10.1 État sans thumbnail

Afficher :

- un aperçu du fallback actuel;
- un message indiquant qu’aucun thumbnail dédié n’existe;
- l’action `Générer le thumbnail`;
- une action de téléversement manuel si elle est implantée dans l’incrément correspondant.

## 10.2 État avec thumbnail

Afficher :

- le thumbnail actuel en 16:9;
- la date de génération si disponible;
- `Régénérer`;
- `Remplacer par un fichier` lorsque l’upload manuel est disponible;
- `Supprimer le thumbnail` avec confirmation.

## 10.3 Nouvelle infographie non enregistrée

La génération exige un identifiant et une image source déjà stockée.

Pour une nouvelle fiche non sauvegardée :

- désactiver la génération;
- afficher une instruction claire pour enregistrer d’abord la ressource;
- ne pas créer de brouillon technique invisible ou de ressource temporaire complexe.

## 10.4 Publication

L’absence de thumbnail :

- ne bloque pas la sauvegarde;
- ne bloque pas la publication;
- produit seulement le fallback public.

## 10.5 Erreur de génération

En cas d’erreur :

- conserver le thumbnail existant;
- afficher un message utile;
- permettre une nouvelle tentative;
- ne pas rendre le reste du formulaire inutilisable;
- ne pas modifier le statut de la ressource.

---

## 11. Administration — thumbnail de série

Lorsqu’une infographie possède un `series_name`, afficher un bloc partagé :

```text
Thumbnail de la série
```

Ce bloc indique clairement que l’image appartient à la série entière et sera utilisée par tous ses épisodes.

Contenu :

- nom de la série;
- couverture actuelle ou fallback;
- action `Générer le thumbnail de la série`;
- action `Régénérer`;
- téléversement manuel si disponible;
- suppression avec confirmation.

La génération peut être accessible depuis n’importe quel épisode de la série, mais elle met à jour le même enregistrement `resource_series`.

Le bloc ne doit pas laisser croire que chaque épisode possède une couverture de série indépendante.

Une page d’administration complète des séries reste hors périmètre.

---

## 12. Expérience publique

## 12.1 Cartes individuelles

Utiliser un conteneur uniforme :

```text
16:9
```

Règle :

```text
thumbnail_path présent
→ afficher le thumbnail dédié

thumbnail_path absent
→ afficher l’infographie originale avec le fallback recadré
```

Les cartes continuent d’afficher en HTML :

- série;
- épisode;
- titre;
- résumé;
- thème;
- niveau;
- durée;
- action.

Le thumbnail peut être décoratif avec `alt=""` puisque le titre est annoncé dans la carte.

## 12.2 Page détaillée

La page détaillée continue d’afficher :

- l’infographie originale;
- son vrai texte alternatif;
- la visionneuse actuelle.

Le thumbnail n’y remplace jamais l’image principale.

## 12.3 Cartes de séries

Règle :

```text
thumbnail de série présent
→ afficher une seule couverture 16:9

thumbnail de série absent
→ conserver la composition actuelle de quelques épisodes
```

Le nombre d’épisodes et le niveau continuent d’être affichés en HTML.

## 12.4 Série mise en vedette

Utiliser la couverture de série lorsqu’elle existe.

Ne pas ajouter la couverture de série et trois autres images simultanément sans besoin réel. L’objectif est de simplifier le visuel et de réduire les chargements.

## 12.5 Page publique de série

La couverture peut être utilisée dans l’en-tête si cela améliore réellement la page, mais elle ne doit pas repousser inutilement la liste des épisodes.

Cette intégration reste facultative dans le MVP si la couverture est déjà visible dans la carte de série.

---

## 13. Comportement de génération et sauvegarde

### 13.1 Générer

Le bouton :

1. vérifie que la ressource est enregistrée;
2. appelle une route serveur authentifiée;
3. affiche un état de génération;
4. reçoit ou récupère le nouvel asset;
5. présente le résultat dans le formulaire;
6. met à jour le chemin selon le mécanisme de sauvegarde retenu.

### 13.2 Régénérer

Si un thumbnail existe :

- demander une confirmation simple avant remplacement si le remplacement est immédiat;
- conserver l’ancien thumbnail en cas d’échec;
- actualiser l’aperçu après succès;
- éviter un cache obsolète grâce au nouveau chemin ou à une version d’URL.

### 13.3 Téléverser manuellement

L’upload manuel est recommandé dès la fondation, car il permet :

- d’utiliser les thumbnails produits dans ChatGPT;
- de corriger une génération insatisfaisante;
- de tester le système sans dépendre immédiatement du backend de génération.

Formats acceptés à confirmer après inspection :

```text
PNG
JPEG
WebP
```

Le fichier doit être une image et respecter une limite raisonnable.

### 13.4 Supprimer

La suppression :

- retire la référence de base;
- supprime l’asset en meilleur effort;
- rétablit immédiatement le fallback public;
- ne touche jamais à l’infographie originale.

---

## 14. Gestion des erreurs et cohérence

### Génération échouée

- aucun changement public;
- ancien thumbnail conservé;
- bouton réutilisable.

### Téléversement échoué

- aucune référence invalide enregistrée;
- message clair;
- ancien thumbnail conservé.

### Mise à jour de base échouée après téléversement

- tenter de supprimer le nouvel asset orphelin;
- ne pas supprimer l’ancien;
- rapporter l’erreur.

### Suppression du fichier échouée après remplacement

- garder la nouvelle référence valide;
- rapporter ou journaliser l’ancien asset orphelin;
- ne pas annuler une mise à jour réussie uniquement pour ce nettoyage.

### Thumbnail introuvable publiquement

- utiliser le fallback lorsque l’application peut détecter l’absence;
- préserver le placeholder existant en dernier recours;
- ne pas faire échouer toute la carte.

---

## 15. Découpage du développement

Le MVP 1.2 est découpé en **trois incréments fonctionnels**, précédés d’une inspection courte.

Ce découpage permet d’obtenir un premier résultat utile avant même d’intégrer la génération automatique.

---

## Incrément 0 — Inspection ciblée

### Objectif

Confirmer l’architecture réelle après le MVP 1.1 et déterminer le chemin le plus simple pour le stockage, l’upload et l’appel au modèle d’image.

### À inspecter

- état Git, branche, remotes et derniers commits;
- migrations et structure actuelle de `infographics`;
- bucket Supabase et conventions de chemins;
- formulaire Ajouter/Modifier une infographie;
- logique actuelle d’upload, remplacement et suppression de l’image principale;
- composant public `InfographicCard` extrait au MVP 1.1;
- cartes de séries et série mise en vedette;
- requêtes publiques et administratives;
- RLS et authentification admin;
- fonctions serverless existantes;
- intégrations OpenAI ou autres modèles déjà présentes;
- dépendances disponibles pour redimensionner ou convertir une image;
- limites de Vercel et du fournisseur pour les requêtes d’images;
- comportement de cache des fichiers publics;
- tests existants et scripts de validation.

### Questions à résoudre

1. Où ajouter `thumbnail_path` sans modifier le contrat JSON?
2. Le bucket existant peut-il accueillir les thumbnails?
3. Quelle logique d’upload de l’image principale peut être réutilisée?
4. Une bibliothèque de traitement d’image est-elle déjà installée?
5. Quel endpoint serveur existant sert de meilleur modèle?
6. Le fournisseur actuel permet-il d’utiliser l’infographie originale comme référence?
7. Comment préserver l’ancien asset lors d’un remplacement?
8. Comment associer un thumbnail unique à une série sans créer un CMS de séries?
9. Comment le frontend récupère-t-il le thumbnail de série avec le moins de requêtes possible?
10. Quelles limites de taille, durée et coût doivent être surveillées?

### Résultat visible

Aucun changement public. Produire un rapport court et un périmètre précis pour l’incrément 1.

### Hors périmètre

- aucune modification de code;
- aucune migration;
- aucun appel réel de génération;
- aucune installation de dépendance;
- aucun commit ou push.

---

## Incrément 1 — Fondation des assets et upload manuel

### Objectif

Permettre d’associer immédiatement un thumbnail dédié à une infographie et de l’utiliser publiquement, sans dépendre encore de la génération automatique.

### Inclus

- migration ajoutant `thumbnail_path` à `infographics`;
- champ de date seulement si l’inspection confirme son utilité;
- conventions de stockage pour les thumbnails individuels;
- section Thumbnail dans le formulaire d’infographie;
- téléversement manuel;
- remplacement;
- suppression;
- prévisualisation 16:9;
- validation de type et de taille;
- nettoyage raisonnable des anciens fichiers;
- utilisation publique du thumbnail lorsqu’il existe;
- fallback vers l’infographie originale lorsqu’il est absent;
- passage des aperçus individuels à un conteneur 16:9 uniforme;
- maintien de l’image originale dans la page détaillée;
- traductions FR et EN;
- tests ciblés de sélection de l’URL et de gestion des chemins.

### Résultat visible

> Christian peut téléverser un thumbnail généré dans ChatGPT, le voir dans l’administration et constater son utilisation immédiate dans les cartes publiques.

### Hors périmètre

- appel à un modèle d’image;
- bouton de génération automatique;
- thumbnail de série persistant;
- table `resource_series`;
- génération en lot;
- traitement asynchrone complexe;
- prompt éditable;
- articles.

### Critères d’acceptation

- une infographie existante accepte un thumbnail 16:9;
- le thumbnail est visible dans le formulaire;
- la carte publique utilise le thumbnail dédié;
- une autre fiche sans thumbnail utilise toujours le fallback;
- remplacer un thumbnail ne supprime pas l’infographie originale;
- supprimer le thumbnail rétablit le fallback;
- une erreur d’upload conserve l’ancien asset;
- aucun brouillon n’est exposé;
- le contrat JSON v1 fonctionne sans modification;
- le build réussit;
- le rendu est vérifié à 1440, 768 et 390 px.

### Tests recommandés

- fonction de résolution `thumbnail → fallback`;
- validation des extensions ou types acceptés;
- construction des chemins;
- absence de mutation des données publiques;
- vérification manuelle d’un remplacement et d’une suppression.

---

## Incrément 2 — Génération du thumbnail individuel

### Objectif

Ajouter dans l’administration le bouton `Générer le thumbnail` pour une infographie enregistrée.

### Inclus

- skill `resource_thumbnail` versionnée;
- route serveur authentifiée;
- récupération serveur des métadonnées par identifiant;
- utilisation facultative de l’infographie originale comme référence;
- prompt 16:9 spécialisé;
- appel à un seul modèle d’image retenu après inspection;
- validation du résultat;
- conversion ou normalisation si l’outillage le permet;
- téléversement dans le stockage;
- mise à jour sûre de `thumbnail_path`;
- bouton Générer/Régénérer;
- état de chargement;
- succès et erreur;
- conservation de l’ancien thumbnail en cas d’échec;
- confirmation simple avant remplacement lorsque nécessaire;
- journalisation minimale côté serveur;
- traduction FR/EN;
- tests ciblés du constructeur de prompt et des validations, sans appeler réellement le modèle dans les tests.

### Résultat visible

> Christian ouvre une infographie enregistrée, clique sur Générer, obtient une couverture 16:9 et la voit apparaître dans la carte publique.

### Hors périmètre

- génération automatique à la publication;
- génération en lot;
- choix de modèle dans l’interface;
- saisie d’un prompt libre;
- plusieurs variantes simultanées;
- historique complet;
- file de jobs;
- thumbnail de série;
- articles.

### Critères d’acceptation

- le bouton est disponible seulement pour une ressource enregistrée;
- l’endpoint refuse un utilisateur non authentifié;
- le serveur récupère les données réelles et n’accepte pas un titre arbitraire du client;
- une seule image est demandée;
- le résultat respecte approximativement le 16:9 et peut être affiché dans le conteneur;
- un thumbnail existant n’est jamais perdu si la génération échoue;
- une erreur fournisseur n’empêche pas de modifier la fiche;
- les clés restent côté serveur;
- la page détaillée reste intacte;
- le build, le lint ciblé et les tests réussissent;
- au moins trois infographies différentes sont vérifiées manuellement.

### Vérifications éditoriales

Pour les tests réels, vérifier :

- titre lisible;
- absence de microtexte;
- épisode correct;
- aucun logo incorrect;
- aucun filigrane;
- illustration cohérente avec le sujet;
- rendu satisfaisant à la taille réelle d’une carte.

---

## Incrément 3 — Thumbnail de série et finalisation

### Objectif

Permettre de générer et d’afficher une couverture dédiée à une série entière.

### Inclus

- table minimale `resource_series` ou solution persistante équivalente validée par l’inspection;
- migration et RLS strictement nécessaires;
- création ou mise à jour de l’enregistrement de série par slug;
- stockage du thumbnail de série;
- bloc partagé dans le formulaire d’une infographie appartenant à une série;
- upload manuel de la couverture de série si la logique peut être réutilisée simplement;
- skill `series_thumbnail`;
- récupération serveur du nom et des épisodes représentatifs;
- génération 16:9;
- sauvegarde sûre et régénération;
- affichage dans la vue Séries;
- affichage dans la série mise en vedette;
- fallback vers la composition actuelle si aucune couverture n’existe;
- éventuellement utilisation légère dans l’en-tête de la page de série si cela améliore réellement le rendu;
- vérification de la suppression et du nettoyage;
- traductions FR et EN;
- tests ciblés;
- génération d’une couverture pour la série existante;
- vérification finale de performance et responsive.

### Résultat visible

> La vue Séries affiche une véritable couverture horizontale pour « Les fondamentaux de l’IA générative » plutôt que trois infographies miniaturisées.

### Hors périmètre

- page complète d’administration des séries;
- description de série;
- statut de série;
- ordre manuel;
- traduction du nom de série;
- couverture par langue;
- génération automatique lorsque le nombre d’épisodes change;
- batch de toutes les séries;
- articles;
- refonte générale du catalogue.

### Critères d’acceptation

- la série peut posséder un seul thumbnail partagé;
- le thumbnail peut être généré depuis n’importe quel épisode de la série;
- toutes les pages utilisent le même asset;
- le nombre d’épisodes reste calculé par l’application;
- le thumbnail ne doit pas devenir la source de vérité de ce nombre;
- une série sans thumbnail conserve le fallback existant;
- une série inexistante ou sans épisode publié n’est pas créée publiquement;
- une erreur de génération conserve l’ancienne couverture;
- les cartes individuelles continuent de fonctionner;
- la page détaillée continue d’utiliser l’infographie originale;
- le build, le lint ciblé et les tests réussissent;
- le rendu est vérifié à 1440, 768 et 390 px.

### Finalisation

À la fin de l’incrément :

- générer ou téléverser des thumbnails pour quelques fiches existantes;
- générer la couverture de la série actuelle;
- mesurer le poids et le nombre d’images chargées dans le catalogue;
- comparer avec le chargement des infographies originales;
- documenter les limites observées sans créer une optimisation supplémentaire non demandée.

---

## 16. Tableau de progression

| Incrément | Résultat fonctionnel | État | Commit |
|---|---|---|---|
| 0 | Inspection de l’architecture thumbnail et génération | À faire | — |
| 1 | Upload manuel, stockage et affichage public | À faire | — |
| 2 | Génération du thumbnail individuel | À faire | — |
| 3 | Génération et affichage du thumbnail de série | À faire | — |

États recommandés :

```text
À faire
En cours
À valider
Accepté
Bloqué
```

---

## 17. Discipline pour chaque session Codex

Chaque prompt doit préciser :

1. le résultat visible attendu;
2. les documents à lire;
3. l’état Git requis;
4. la portée exacte de l’incrément;
5. les éléments hors périmètre;
6. les invariants de données et de stockage;
7. les validations techniques;
8. le scénario manuel;
9. le rapport final;
10. l’interdiction de commit ou push sauf demande explicite.

Le rapport final doit contenir :

- résultat obtenu;
- décisions techniques;
- fichiers modifiés et créés;
- migrations éventuelles;
- stockage et nettoyage;
- sécurité et authentification;
- comportement avec et sans thumbnail;
- commandes et tests;
- vérification manuelle;
- poids des assets observés;
- limites connues;
- état Git;
- diff résumé.

---

## 18. Invariants critiques

Pendant toute la phase 1.2 :

- les brouillons restent invisibles publiquement;
- le contrat JSON v1 reste inchangé;
- l’image complète reste intacte;
- la visionneuse détaillée reste fonctionnelle;
- l’absence de thumbnail ne bloque jamais une publication;
- un fallback existe toujours;
- une génération échouée ne supprime jamais un asset valide;
- les clés de modèles restent côté serveur;
- seuls les administrateurs peuvent générer, remplacer ou supprimer;
- le client ne fournit pas un prompt libre au backend;
- une série possède au maximum un thumbnail actif;
- le nombre d’épisodes reste calculé à partir des publications;
- aucune description de série n’est inventée;
- aucune nouvelle dépendance majeure n’est ajoutée sans inspection;
- aucune abstraction de CMS ou de studio graphique n’est créée;
- aucune génération automatique en masse n’est lancée.

---

## 19. Critères de clôture du MVP 1.2

La phase est terminée lorsque Christian peut :

1. ouvrir une infographie existante;
2. téléverser un thumbnail 16:9;
3. le voir dans la carte publique;
4. retirer ce thumbnail et retrouver le fallback;
5. cliquer sur Générer le thumbnail;
6. obtenir une image lisible à la taille d’une carte;
7. régénérer sans perdre l’ancien asset en cas d’erreur;
8. conserver l’infographie originale dans la fiche détaillée;
9. générer un thumbnail partagé pour une série;
10. voir cette couverture dans la vue Séries;
11. voir cette couverture dans la série mise en vedette;
12. conserver le fallback pour une autre série sans couverture;
13. utiliser l’administration en français et en anglais;
14. constater que seuls les administrateurs peuvent effectuer ces actions;
15. constater une réduction réelle du poids d’images chargé dans le catalogue;
16. utiliser l’ensemble du parcours sur ordinateur et mobile;
17. vérifier que le build et les tests ciblés réussissent.

---

## 20. Évolutions volontairement reportées

À réévaluer seulement après utilisation du MVP 1.2 :

- génération automatique à la publication;
- génération en lot pour les anciennes ressources;
- file de jobs asynchrones;
- plusieurs propositions par génération;
- historique et restauration de versions;
- éditeur de prompt;
- sélection du fournisseur ou du modèle;
- texte composé de manière déterministe après génération;
- détection automatique d’un thumbnail périmé;
- thumbnails multilingues;
- administration complète des séries;
- descriptions et couvertures éditoriales supplémentaires;
- thumbnails d’articles;
- gestion générique des médias;
- CDN ou stratégie de cache avancée;
- génération automatique de plusieurs résolutions.

La priorité reste de valider un flux simple :

```text
Créer ou importer un thumbnail
→ vérifier
→ enregistrer
→ afficher dans le catalogue
```
