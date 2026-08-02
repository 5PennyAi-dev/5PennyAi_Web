# Guide de développement — MVP 2.1 Génération des images d’articles

**Projet :** 5PennyAi  
**Section :** Ressources IA  
**Évolution :** génération intégrée des couvertures et médias d’articles  
**Date :** 2 août 2026  
**Statut :** conception fonctionnelle prête à être inspectée puis implantée par incréments

---

## 1. Rôle du document

Ce guide encadre l’évolution **MVP 2.1** de la section Ressources IA.

Il prolonge le MVP 2.0 maintenant terminé sans reconstruire :

- l’administration des articles;
- l’import du contrat JSON Articles v1;
- les brouillons et la publication;
- le stockage actuel des couvertures;
- le stockage actuel des médias internes;
- l’upload, le remplacement et la suppression manuels;
- l’aperçu administratif;
- le renderer Markdown;
- les pages publiques d’articles;
- le catalogue et les séries mixtes;
- le SEO technique;
- le générateur de thumbnails des infographies et des séries.

Le MVP 2.1 ajoute une nouvelle manière de remplir les emplacements d’images déjà existants :

```text
Avant
→ générer l’image dans un outil externe
→ télécharger le fichier
→ téléverser le fichier dans l’administration

Après
→ cliquer sur Générer dans l’administration
→ vérifier le résultat
→ conserver, régénérer ou remplacer manuellement
```

Ce document sert de fil conducteur pratique. L’inspection du dépôt demeure la source de vérité technique et peut ajuster les noms de fichiers, fonctions ou routes sans modifier les objectifs fonctionnels.

Le MVP 2.1 ne doit pas devenir un studio graphique, une médiathèque générique ou un système de production automatique en lot.

---

## 2. Documents de référence

### Références obligatoires

```text
GUIDE_DEVELOPPEMENT_MVP_2_1_GENERATION_IMAGES_ARTICLES_RESSOURCES_IA.md
ARTICLE_VISUAL_STYLE_5PENNYAI_V1.md
CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md
GUIDE_DEVELOPPEMENT_MVP_2_0_ARTICLES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_1_2_THUMBNAILS_RESSOURCES_IA.md
CONCEPTION_GENERATEUR_THUMBNAILS_V3.md
```

### Références complémentaires

```text
GUIDE_STYLE_INFOGRAPHIES_5PENNYAI.md
PROMPT_COUVERTURES_ARTICLES_5PENNYAI_V2.md
GRILLE_REVUE_ARTICLES_5PENNYAI_V1.md
les trois articles pilotes acceptés
les couvertures et thumbnails 5PennyAi déjà validés
```

### Hiérarchie des responsabilités

- Le **contrat JSON Articles v1** définit les données éditoriales disponibles, les types de médias et les briefs de génération.
- `ARTICLE_VISUAL_STYLE_5PENNYAI_V1.md` définit la direction graphique commune et les profils fonctionnels.
- Le **MVP 2.0 existant** demeure la source de vérité pour les articles, les assets, l’upload et l’affichage.
- Le **générateur de thumbnails existant** fournit le modèle technique de génération côté serveur, d’authentification, de stockage et de remplacement sécurisé.
- Le serveur assemble les instructions et récupère les données réelles. Le navigateur ne fournit jamais un prompt libre.
- Christian conserve la validation finale de chaque image.

---

## 3. Contexte

Le MVP 2.0 permet maintenant de :

- créer et importer des articles;
- conserver leurs briefs de couverture et de médias;
- téléverser une couverture;
- associer des fichiers aux médias par leur clé;
- remplacer ou supprimer les assets;
- prévisualiser et publier les articles;
- afficher les images dans les pages publiques;
- intégrer les articles au catalogue et aux séries.

Le MVP 1.2 permet déjà de générer directement depuis l’administration des thumbnails d’infographies et de séries au moyen :

- d’un endpoint authentifié;
- d’un prompt versionné;
- d’un appel serveur au modèle d’image;
- du stockage Supabase;
- d’un remplacement sûr;
- d’un fallback public;
- d’une validation humaine.

Le workflow éditorial des articles contient déjà les données nécessaires :

```text
cover.generationBrief
media[].generationBrief
media[].kind
media[].preferredAspectRatio
media[].altText
media[].sourceKeys
```

Le problème restant est opérationnel : la génération externe des images est lente, répétitive et difficile à reproduire avec un style stable.

Le MVP 2.1 doit donc intégrer la génération sans modifier le contrat JSON ni le fonctionnement public des articles.

---

## 4. Objectif du MVP 2.1

Permettre à Christian de générer directement dans l’administration :

- la couverture 16:9 d’un article;
- un diagramme pédagogique déclaré dans l’article;
- une illustration conceptuelle déclarée dans l’article;
- une infographie interne lorsque le brief et le format s’y prêtent.

À la fin du MVP 2.1, Christian doit pouvoir :

1. ouvrir un article enregistré;
2. cliquer sur `Générer la couverture`;
3. obtenir une image conforme à `article-visual-style-v1`;
4. voir immédiatement la couverture dans le formulaire;
5. régénérer la couverture;
6. conserver l’ancienne couverture si la génération échoue;
7. générer un média interne à partir de sa clé;
8. voir le média associé au bon emplacement;
9. régénérer un média existant;
10. continuer à téléverser manuellement un fichier;
11. publier un article même sans image générée;
12. constater que toutes les images retenues partagent une identité visuelle commune;
13. utiliser le parcours sur ordinateur et mobile;
14. conserver les brouillons invisibles publiquement;
15. vérifier que les générations ne modifient pas le contenu éditorial de l’article.

Principe central :

> La génération remplit les emplacements existants; elle ne crée pas un nouveau workflow éditorial.

---

## 5. Principes directeurs

### 5.1 Génération à la demande

Aucune image n’est générée automatiquement :

- lors de l’import;
- lors de l’enregistrement;
- lors de la publication;
- lors d’une réimportation;
- lorsqu’un brief est modifié.

Christian déclenche explicitement chaque génération.

### 5.2 Contrôle humain

Une image générée doit être visible avant d’être considérée comme satisfaisante.

Christian peut :

- conserver le résultat;
- régénérer;
- remplacer par un fichier manuel;
- supprimer l’image et revenir au fallback.

La génération ne publie jamais l’article et ne change jamais son statut.

### 5.3 Style commun obligatoire

Chaque génération utilise obligatoirement :

```text
article-visual-style-v1
+ profil fonctionnel correspondant
+ contexte éditorial contrôlé
+ generationBrief propre à l’asset
```

Les couvertures et médias doivent sembler provenir du même studio éditorial, même lorsque leurs compositions et fonctions diffèrent.

### 5.4 Le serveur est la source de vérité

Le client envoie uniquement des identifiants contrôlés :

```json
{
  "articleId": "uuid",
  "assetType": "cover"
}
```

ou :

```json
{
  "articleId": "uuid",
  "assetType": "media",
  "mediaKey": "flux-rag"
}
```

Le serveur récupère :

- l’article;
- le manifeste du média;
- le brief;
- le ratio;
- le type;
- le chemin actif;
- les autres métadonnées nécessaires.

Le client ne transmet pas :

- un prompt libre;
- un titre arbitraire;
- un brief modifié uniquement pour la requête;
- un chemin Supabase;
- une URL de stockage;
- un modèle;
- une version de style;
- un statut de publication.

### 5.5 Réutiliser avant d’abstraire

Le MVP 2.1 doit réutiliser autant que possible :

- l’authentification du générateur de thumbnails;
- le client OpenAI existant;
- la gestion des erreurs fournisseur;
- la logique d’upload;
- les conventions de fichiers;
- le remplacement sûr;
- le nettoyage en meilleur effort;
- les composants administratifs d’aperçu;
- les traductions existantes.

Une petite extraction partagée est permise si elle réduit une duplication réelle. Une refonte générique de tous les générateurs est hors périmètre.

### 5.6 Upload manuel toujours disponible

La génération intégrée complète l’upload manuel; elle ne le remplace pas.

L’upload reste nécessaire pour :

- corriger un résultat insatisfaisant;
- utiliser une image produite ailleurs;
- ajouter un graphique réel;
- ajouter une capture réelle;
- conserver une solution de secours en cas d’indisponibilité du modèle.

### 5.7 Fallback obligatoire

L’absence de couverture ou de média généré :

- ne bloque pas l’enregistrement;
- ne bloque pas automatiquement la publication;
- ne casse pas la page publique;
- conserve les fallbacks du MVP 2.0.

### 5.8 Pas de modification du contrat JSON

Le MVP 2.1 n’ajoute aucune propriété au contrat JSON Articles v1.

Les données techniques suivantes restent contrôlées par l’application :

- chemin du fichier;
- date de génération;
- version du style;
- fournisseur;
- modèle;
- identifiant de requête éventuel.

### 5.9 Pas de génération factuellement risquée

Dans la première version :

- `diagram` : générable;
- `illustration` : générable;
- `infographic` : générable avec prudence;
- `chart` : upload manuel seulement;
- `screenshot` : upload manuel seulement.

Un graphique doit reposer sur des données structurées et vérifiées. Une capture doit représenter une interface réelle.

### 5.10 Un incrément doit produire un résultat visible

Chaque incrément fonctionnel doit pouvoir être vérifié directement dans l’administration et, lorsque pertinent, sur le site public.

Codex ne doit pas préparer silencieusement les incréments suivants.

---

## 6. Expérience administrative cible

## 6.1 Couverture d’article

Dans le bloc de couverture déjà existant :

### Article sans couverture

Afficher :

- le fallback actuel;
- le brief de génération;
- le ratio attendu;
- `Générer la couverture`;
- l’upload manuel existant.

### Article avec couverture

Afficher :

- l’image active;
- `Régénérer la couverture`;
- `Remplacer par un fichier`;
- `Supprimer la couverture`;
- la date ou version de génération seulement si cette information peut être ajoutée simplement.

### Article non enregistré

La génération nécessite un identifiant persistant.

Pour un nouvel article non enregistré :

- désactiver le bouton;
- indiquer qu’il faut enregistrer le brouillon;
- ne pas créer un article temporaire automatiquement.

## 6.2 Médias internes

Pour chaque média déclaré :

- afficher sa clé;
- afficher son type;
- afficher son titre;
- afficher son brief;
- afficher son ratio;
- afficher l’asset actuel ou le placeholder existant;
- offrir la génération lorsque le type est pris en charge;
- conserver l’upload manuel;
- permettre le remplacement et la suppression.

Libellés possibles :

```text
Générer le média
Régénérer le média
```

Pour `chart` et `screenshot` :

- ne pas afficher de bouton de génération actif;
- conserver l’upload;
- expliquer brièvement que ce type exige un fichier réel ou des données vérifiées.

## 6.3 États de l’interface

L’interface doit gérer :

```text
Prêt
Génération en cours
Génération réussie
Génération échouée
Type non générable
Brief manquant
Article non enregistré
```

Pendant une génération :

- désactiver l’action concernée;
- éviter un double déclenchement;
- ne pas bloquer inutilement tout le formulaire;
- conserver les autres assets visibles;
- afficher un message compréhensible.

---

## 7. Architecture fonctionnelle cible

## 7.1 Endpoint

Forme recommandée :

```text
POST /api/generate-article-asset
```

Entrée :

```json
{
  "articleId": "uuid",
  "assetType": "cover"
}
```

ou :

```json
{
  "articleId": "uuid",
  "assetType": "media",
  "mediaKey": "flux-rag"
}
```

L’inspection peut recommander deux endpoints spécialisés si l’architecture existante le justifie clairement. La logique de style et de stockage ne doit toutefois pas être dupliquée.

## 7.2 Skill serveur

Nom fonctionnel recommandé :

```text
article-asset-generator-v1
```

Elle orchestre :

1. l’authentification;
2. la validation de l’entrée;
3. la récupération de l’article;
4. la résolution de l’asset demandé;
5. la sélection du profil visuel;
6. la construction du prompt;
7. l’appel au modèle d’image;
8. la validation du résultat;
9. la normalisation;
10. le stockage;
11. la mise à jour de la référence active;
12. le nettoyage de l’ancien asset.

## 7.3 Module de style versionné

Le document Markdown n’est pas lu ou interprété dynamiquement à chaque requête.

Codex transpose les blocs opérationnels dans un module serveur versionné, par exemple :

```text
articleVisualStyle.js
```

Exports fonctionnels recommandés :

```text
ARTICLE_VISUAL_STYLE_VERSION
ARTICLE_VISUAL_STYLE_BASE
ARTICLE_ASSET_PROFILES
buildArticleAssetPrompt
resolveArticleAssetProfile
```

Versions initiales :

```text
article-visual-style-v1
article-cover-profile-v1
article-diagram-profile-v1
article-illustration-profile-v1
article-infographic-profile-v1
```

## 7.4 Assemblage du prompt

Ordre obligatoire :

```text
1. socle article-visual-style-v1
2. profil fonctionnel
3. contexte éditorial utile
4. brief propre à l’image
5. format et zone sûre
6. exigences de sortie
```

### Couverture

Données utiles :

```text
title
subtitle
summary
theme
level
takeaway
cover.altText
cover.generationBrief
cover.preferredAspectRatio
```

### Média

Données utiles :

```text
article.title
article.summary
article.level
media.key
media.kind
media.title
media.caption
media.altText
media.generationBrief
media.preferredAspectRatio
media.sourceKeys
```

Ne pas transmettre inutilement :

- le Markdown complet;
- toutes les sources;
- les URL;
- les citations;
- le SEO;
- les chemins de stockage;
- les champs techniques;
- les données administratives.

## 7.5 Sélection du profil

```text
cover
→ article-cover-profile-v1

diagram
→ article-diagram-profile-v1

illustration
→ article-illustration-profile-v1

infographic
→ article-infographic-profile-v1

chart
→ génération refusée

screenshot
→ génération refusée
```

Une valeur inconnue doit être refusée proprement sans toucher à l’asset existant.

## 7.6 Modèle d’image

Réutiliser le modèle et le client déjà implantés pour les thumbnails, sauf si l’inspection révèle une incompatibilité réelle avec :

- les ratios requis;
- les références visuelles;
- les contraintes de durée;
- le format de sortie;
- la limite des fonctions serverless.

Le choix du modèle reste côté serveur et n’est pas exposé dans l’administration.

## 7.7 Références visuelles communes

La spécification textuelle est obligatoire dès le premier incrément.

L’inspection doit aussi déterminer si l’intégration actuelle permet simplement de fournir une planche de style ou une référence visuelle commune au modèle.

Si cette option est fiable et n’introduit pas de complexité disproportionnée :

- conserver la référence dans le dépôt ou dans un emplacement serveur contrôlé;
- utiliser la même référence pour les couvertures et médias;
- indiquer explicitement de ne pas copier sa composition.

Si elle n’est pas simple ou fiable :

- ne pas bloquer l’incrément 1;
- utiliser le socle textuel versionné;
- évaluer la cohérence sur le banc d’essai;
- rendre la référence visuelle obligatoire seulement si les résultats montrent une dérive réelle.

La cohérence de collection demeure un critère de clôture, quelle que soit la méthode retenue.

---

## 8. Texte dans les images

## 8.1 Couvertures

Le titre complet de l’article doit être présent, exact et lisible.

Deux stratégies sont permises :

### Stratégie A — Titre généré par le modèle

À retenir seulement si les essais montrent une fiabilité suffisante :

- titre complet;
- accents exacts;
- ponctuation exacte;
- aucune omission;
- lisibilité en carte.

### Stratégie B — Titre ajouté par l’application

Approche recommandée si elle peut être implantée sans infrastructure disproportionnée :

```text
illustration sans titre
→ composition déterministe du titre
→ couverture finale
```

Elle améliore :

- l’exactitude du texte;
- la cohérence typographique;
- les marges;
- la reproductibilité;
- la lisibilité.

L’inspection doit vérifier :

- les bibliothèques déjà disponibles;
- la compatibilité Vercel;
- la police réellement utilisable;
- les contraintes de licence et d’empaquetage;
- le traitement des titres longs;
- le retour à la ligne;
- la zone sûre.

Ne pas ajouter une dépendance lourde avant cette vérification.

## 8.2 Médias internes

Les médias peuvent contenir quelques libellés courts nécessaires à la compréhension.

Ils ne doivent pas contenir :

- de paragraphes;
- de longues listes;
- de pseudo-texte;
- de sources;
- d’URL;
- de microtexte;
- de texte décoratif.

Une composition déterministe des libellés est reportée, sauf si les essais révèlent que les erreurs textuelles rendent les médias inutilisables.

---

## 9. Formats et normalisation

Le ratio demandé provient du manifeste ou du profil :

```text
cover
→ 16:9

diagram
→ ratio du manifeste, souvent 16:9

illustration
→ ratio du manifeste

infographic
→ ratio du manifeste
```

Règles :

- produire un fichier final au ratio attendu;
- ne pas ajouter de bandes artificielles;
- ne pas utiliser `contain` avec un fond différent;
- conserver tous les éléments essentiels dans la zone sûre;
- éviter un recadrage qui coupe du texte ou une relation;
- utiliser les mêmes conventions de compression que les assets existants lorsque possible;
- privilégier WebP si la chaîne actuelle le permet;
- conserver une taille raisonnable pour l’affichage Web.

Pour une sortie fournisseur non conforme au ratio :

- privilégier un recadrage contrôlé;
- ne pas étirer l’image;
- ne pas ajouter de cadre intérieur;
- refuser le résultat si le recadrage détruit l’information essentielle.

---

## 10. Stockage et remplacement

Réutiliser les conventions existantes du MVP 2.0.

Formes conceptuelles attendues :

```text
articles/{articleId}/cover/{uniqueName}.webp
articles/{articleId}/media/{mediaKey}/{uniqueName}.webp
```

L’inspection doit confirmer les chemins réels déjà implantés.

Séquence de remplacement obligatoire :

```text
1. générer le nouveau fichier
2. valider le résultat
3. normaliser le fichier
4. téléverser sous un nouveau chemin
5. mettre à jour la référence en base
6. actualiser l’administration
7. supprimer l’ancien fichier en meilleur effort
```

Ne jamais supprimer l’ancien asset avant que le nouveau soit généré, téléversé et référencé avec succès.

Si la mise à jour de la base échoue après le téléversement :

- tenter de supprimer le nouvel asset orphelin;
- conserver l’ancien asset actif;
- retourner une erreur claire.

---

## 11. Sécurité et accès

Règles minimales :

- endpoint accessible uniquement à l’administrateur autorisé;
- clé du fournisseur uniquement côté serveur;
- article récupéré depuis la base par le serveur;
- mediaKey validée contre le manifeste réel;
- type et ratio validés côté serveur;
- chemins de stockage construits côté serveur;
- aucune confiance accordée au titre, brief ou chemin envoyé par le client;
- aucune exposition publique des prompts complets;
- aucune exposition des erreurs sensibles du fournisseur;
- aucune modification du statut de l’article;
- aucun brouillon rendu public par cette évolution.

La protection doit suivre le mécanisme réel déjà utilisé par `/api/generate-resource-thumbnail` ou son équivalent actuel.

---

## 12. Gestion des erreurs

### Authentification refusée

- aucune génération;
- aucune modification;
- réponse appropriée;
- message administratif générique.

### Article inexistant

- aucune génération;
- aucune création implicite;
- message clair.

### Article non enregistré

- bouton désactivé;
- aucune requête envoyée.

### Brief absent ou vide

- génération refusée;
- upload manuel toujours disponible;
- message lié au bon asset.

### Média inconnu

- génération refusée;
- aucun asset modifié.

### Type non générable

- génération refusée;
- upload manuel conservé.

### Erreur fournisseur

- ancien asset conservé;
- statut de l’article inchangé;
- formulaire utilisable;
- nouvelle tentative possible.

### Sortie invalide

Exemples :

- fichier vide;
- type MIME inattendu;
- ratio inutilisable;
- réponse sans image.

Comportement :

- ne pas téléverser ou référencer l’asset;
- conserver l’ancien;
- retourner une erreur contrôlée.

### Téléversement échoué

- ancien asset conservé;
- aucune référence invalide;
- erreur affichée.

### Mise à jour de base échouée

- ancien asset conservé;
- nettoyage du nouvel asset en meilleur effort;
- erreur affichée.

### Nettoyage de l’ancien fichier échoué

- garder la nouvelle référence valide;
- journaliser l’orphelin;
- ne pas annuler une génération autrement réussie.

---

## 13. Journalisation minimale

Le backend doit journaliser suffisamment pour diagnostiquer :

- type d’asset;
- article concerné;
- mediaKey lorsque pertinente;
- version du style;
- profil utilisé;
- modèle utilisé;
- succès ou échec;
- étape de l’échec;
- durée générale si elle est déjà facilement disponible.

Ne pas journaliser inutilement :

- le contenu complet de l’article;
- toutes les sources;
- des secrets;
- une image en base64;
- des données personnelles.

Une persistance en base de l’historique complet n’est pas requise.

---

# 14. Découpage du développement

Le MVP 2.1 est découpé en **trois incréments fonctionnels**, précédés d’une inspection ciblée.

```text
Inspection
→ génération des couvertures
→ génération des médias
→ cohérence de collection et finalisation
```

---

## Incrément 0 — Inspection ciblée du MVP 2.0 terminé

### Objectif

Identifier l’implantation réelle à étendre et confirmer le chemin minimal avant toute modification.

### Documents à lire

```text
GUIDE_DEVELOPPEMENT_MVP_2_1_GENERATION_IMAGES_ARTICLES_RESSOURCES_IA.md
ARTICLE_VISUAL_STYLE_5PENNYAI_V1.md
CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md
GUIDE_DEVELOPPEMENT_MVP_1_2_THUMBNAILS_RESSOURCES_IA.md
CONCEPTION_GENERATEUR_THUMBNAILS_V3.md
```

### À inspecter

- état Git, branche, remotes et derniers commits;
- état réel du MVP 2.0;
- formulaire Ajouter/Modifier un article;
- composant de couverture;
- composants des médias internes;
- structure de `articles`;
- structure réelle des assets de médias;
- conventions de stockage;
- fonctions d’upload, remplacement et suppression;
- préservation des fichiers lors d’une réimportation;
- endpoint actuel de génération de thumbnails;
- authentification de cet endpoint;
- client et version OpenAI;
- appel `images.generate`, `images.edit` ou équivalent;
- traitement des réponses d’image;
- normalisation actuelle des ratios;
- dépendances de traitement d’image;
- limites de durée et de taille des fonctions Vercel;
- logique de mise à jour Supabase;
- logique de nettoyage des anciens fichiers;
- traductions FR et EN;
- tests existants;
- trois articles pilotes et leurs briefs réels;
- images existantes déjà validées comme références stylistiques.

### Questions à résoudre

1. Quel code du générateur de thumbnails peut être réutilisé directement?
2. Quelles fonctions méritent une extraction partagée minimale?
3. Où placer le module `articleVisualStyle`?
4. Un endpoint commun est-il compatible avec l’architecture existante?
5. Comment retrouver de façon sûre la couverture et un média par sa clé?
6. Comment mettre à jour les assets sans dupliquer la logique d’upload manuel?
7. Le modèle actuel peut-il produire les ratios demandés de façon acceptable?
8. Une référence visuelle commune peut-elle être fournie simplement?
9. Une composition déterministe du titre est-elle réaliste avec les dépendances et le runtime actuels?
10. Le stockage actuel permet-il d’enregistrer une version de style sans migration?
11. Une migration est-elle réellement nécessaire?
12. Quels tests protègent déjà le remplacement et le fallback?
13. Quels risques proviennent de la durée d’une génération dans Vercel?
14. Quels types de médias sont réellement présents dans les trois articles pilotes?

### Décisions attendues

Le rapport doit préciser :

- fichiers exacts à modifier;
- fonctions exactes à réutiliser;
- éventuelle extraction partagée;
- contrat final de l’endpoint;
- stratégie de titre de couverture;
- stratégie de ratio;
- stratégie de référence visuelle;
- besoin ou absence de migration;
- périmètre précis de l’incrément 1;
- risques et mesures de mitigation.

### Résultat visible

Aucun changement public ou administratif.

### Hors périmètre

- aucune modification de code;
- aucune migration;
- aucune dépendance;
- aucun appel réel au modèle;
- aucun commit;
- aucun push.

### Critères d’acceptation

- l’état réel du dépôt est documenté;
- le MVP 2.0 est confirmé fonctionnel;
- les points de réutilisation sont identifiés;
- le périmètre de l’incrément 1 est précis;
- aucune architecture générique inutile n’est proposée;
- les incertitudes techniques importantes sont explicitement signalées.

---

## Incrément 1 — Génération intégrée des couvertures d’articles

### Objectif

Permettre de générer et régénérer une couverture d’article depuis le bloc de couverture existant.

### Inclus

- module serveur `article-visual-style-v1`;
- profil `article-cover-profile-v1`;
- constructeur de prompt versionné;
- endpoint authentifié ou mode `cover` de l’endpoint commun;
- récupération serveur de l’article;
- récupération du brief réel;
- validation de l’article et du brief;
- appel au modèle d’image;
- normalisation en 16:9;
- stratégie de titre décidée pendant l’inspection;
- téléversement sous un nouveau chemin;
- mise à jour sûre de la couverture active;
- conservation de l’ancienne couverture en cas d’échec;
- nettoyage de l’ancien asset en meilleur effort;
- bouton `Générer la couverture`;
- bouton `Régénérer la couverture`;
- état de chargement;
- messages de succès et d’erreur;
- maintien de l’upload manuel;
- traduction FR et EN;
- tests ciblés sans appel réel au modèle;
- essais réels sur les trois articles pilotes.

### Résultat visible

> Christian ouvre un article enregistré, clique sur Générer la couverture et obtient une couverture 16:9 conforme à l’identité visuelle 5PennyAi.

### Hors périmètre

- génération des médias internes;
- génération automatique à la publication;
- génération en lot;
- plusieurs variantes simultanées;
- historique complet;
- choix de modèle dans l’interface;
- prompt libre;
- refonte du stockage des articles;
- modification du contrat JSON;
- création d’une médiathèque.

### Critères d’acceptation fonctionnels

- le bouton est disponible seulement pour un article enregistré;
- l’endpoint refuse un utilisateur non autorisé;
- le serveur récupère le titre et le brief réels;
- le client ne fournit pas un prompt arbitraire;
- une seule image est demandée;
- le résultat final est réellement en 16:9;
- le titre exact est présent et lisible;
- la couverture est visible dans l’administration après succès;
- la carte et la page publique utilisent l’asset selon le comportement existant;
- une génération échouée conserve l’ancienne couverture;
- l’upload manuel continue de fonctionner;
- la suppression continue de rétablir le fallback;
- le statut et le contenu de l’article restent inchangés;
- aucun brouillon n’est exposé publiquement.

### Critères d’acceptation visuels

Pour les trois articles pilotes :

- fond off-white dominant;
- contours Navy;
- style strictement 2D;
- palette 5PennyAi;
- aucun rendu générique d’IA;
- aucun microtexte;
- titre exact;
- lisibilité en petite carte;
- compositions suffisamment variées;
- impression de collection commune.

### Tests ciblés recommandés

- sélection du profil `cover`;
- assemblage du prompt;
- absence de données inutiles;
- article inexistant;
- brief absent;
- utilisateur non autorisé;
- réponse fournisseur invalide;
- téléversement échoué;
- mise à jour de base échouée;
- conservation de l’ancien asset;
- construction du chemin;
- normalisation du ratio;
- désactivation du bouton pour un article non enregistré.

### Vérification manuelle

- générer une couverture débutante;
- générer une couverture intermédiaire;
- générer une couverture avancée;
- vérifier le formulaire;
- vérifier une carte de catalogue;
- vérifier l’en-tête public;
- provoquer ou simuler une erreur sans perdre l’ancien asset;
- tester à 1440, 768 et environ 390 px.

---

## Incrément 2 — Génération intégrée des médias internes

### Objectif

Permettre de générer et régénérer les médias déclarés dans un article à partir de leur clé.

### Inclus

- mode `media` de l’endpoint commun ou endpoint spécialisé;
- récupération serveur du manifeste;
- résolution stricte par `mediaKey`;
- sélection automatique du profil;
- profils :
  - `article-diagram-profile-v1`;
  - `article-illustration-profile-v1`;
  - `article-infographic-profile-v1`;
- refus contrôlé de `chart` et `screenshot`;
- validation du brief et du ratio;
- contexte éditorial limité;
- appel au modèle;
- normalisation au ratio demandé;
- téléversement sous le chemin du média;
- mise à jour sûre de l’asset associé à la clé;
- conservation de l’ancien fichier en cas d’échec;
- bouton Générer/Régénérer sur chaque média pris en charge;
- état de chargement indépendant par média;
- message pour les types non générables;
- maintien de l’upload manuel;
- traduction FR et EN;
- tests ciblés;
- essais réels sur les médias des trois articles pilotes.

### Résultat visible

> Christian ouvre un article, choisit un média déclaré, clique sur Générer et obtient une image associée automatiquement à la bonne clé et au bon emplacement dans l’aperçu.

### Hors périmètre

- génération de graphiques à partir de données;
- fabrication de captures;
- édition interactive du diagramme;
- texte déterministe pour tous les libellés;
- plusieurs variantes;
- génération en lot de tous les médias;
- médiathèque commune;
- prompt libre;
- nouvelle taxonomie des médias.

### Critères d’acceptation fonctionnels

- la mediaKey doit exister dans le manifeste réel;
- le profil correspond au `kind` réel;
- un type inconnu est refusé;
- `chart` et `screenshot` restent en upload manuel;
- le brief réel est utilisé;
- le ratio préféré est respecté ou normalisé proprement;
- le fichier est associé à la bonne clé;
- l’aperçu administratif affiche le média au bon endroit;
- la page publique continue d’utiliser le renderer existant;
- une génération échouée conserve l’ancien fichier;
- une autre carte de média n’est pas bloquée inutilement;
- une réimportation continue de préserver les fichiers;
- le contenu Markdown et le manifeste ne sont pas modifiés silencieusement.

### Critères d’acceptation visuels

Les essais doivent inclure au minimum :

- un flux ou pipeline;
- une comparaison ou deux parcours;
- une architecture ou un processus d’évaluation.

Chaque média retenu doit :

- respecter le brief;
- appartenir au même univers que les couvertures;
- utiliser le style strictement 2D;
- conserver des contours et formes cohérents;
- être lisible dans le corps de l’article;
- éviter le microtexte;
- ne pas inventer de données;
- ne pas dépendre uniquement des couleurs;
- rester compréhensible avec son `altText` et sa légende.

### Tests ciblés recommandés

- résolution de la mediaKey;
- clé inconnue;
- média absent du manifeste;
- sélection des trois profils;
- refus de `chart`;
- refus de `screenshot`;
- brief manquant;
- ratio inconnu;
- assemblage du prompt;
- remplacement sûr;
- conservation de l’ancien asset;
- association du chemin à la bonne clé;
- états indépendants de l’interface;
- upload manuel toujours disponible.

### Vérification manuelle

- générer au moins trois médias représentatifs;
- vérifier l’aperçu administratif;
- vérifier la page publique;
- régénérer un média existant;
- simuler une erreur;
- vérifier que les autres médias restent utilisables;
- tester le rendu à 1440, 768 et environ 390 px.

---

## Incrément 3 — Cohérence de collection, robustesse et finalisation

### Objectif

Valider que l’ensemble des images produites forme une collection cohérente et finaliser les points révélés par l’usage réel.

Cet incrément ne doit pas devenir une refonte générale. Il corrige seulement les problèmes observés pendant les essais des incréments 1 et 2.

### Inclus

- banc d’essai complet des trois articles pilotes;
- au moins trois couvertures;
- au moins trois médias représentatifs;
- évaluation individuelle avec la grille de `article-visual-style-v1`;
- évaluation des six images comme collection;
- validation dans les contextes réels :
  - carte;
  - en-tête d’article;
  - corps d’article;
  - grille comparative des six images;
- ajustements limités du prompt commun;
- ajustements limités des profils;
- intégration d’une référence visuelle commune si la cohérence textuelle est insuffisante et si l’architecture le permet proprement;
- amélioration du titre déterministe si les essais montrent des erreurs récurrentes;
- amélioration du recadrage ou de la normalisation si nécessaire;
- validation du poids des fichiers;
- validation des erreurs et du remplacement;
- journalisation minimale;
- petites corrections UX directement liées à la génération;
- build, lint et tests ciblés;
- documentation des limites restantes.

### Résultat visible

> Les couvertures et médias des trois articles pilotes semblent provenir du même studio éditorial, tout en conservant des compositions adaptées à leur fonction et à leur sujet.

### Hors périmètre

- changement de fournisseur sans nécessité démontrée;
- refonte complète du style;
- génération en lot;
- historique de versions;
- comparaison automatique de plusieurs variantes;
- éditeur graphique;
- éditeur de prompt;
- génération de graphiques;
- génération de captures;
- remplacement automatique des images existantes;
- nouvelle version `article-visual-style-v2` sans décision explicite.

### Critères d’acceptation de collection

- les six images semblent appartenir à la même collection;
- le fond et la palette sont cohérents;
- les contours partagent le même langage;
- le niveau de simplification est comparable;
- la typographie appartient à la même famille;
- les doodles restent discrets et cohérents;
- aucune image ne dérive vers la 3D ou une esthétique IA générique;
- au moins trois familles de compositions sont visibles;
- aucune disposition unique ne domine l’ensemble;
- les couvertures fonctionnent en petite carte;
- les médias restent lisibles dans le corps des articles;
- aucun problème éliminatoire de la direction v1 n’est présent;
- Christian valide la collection dans le site réel.

### Critères d’acceptation techniques

- les anciens assets sont conservés lors d’un échec;
- les chemins restent cohérents;
- aucun asset orphelin évident n’est créé dans les scénarios normaux;
- les fichiers finaux ont le bon ratio;
- les poids sont raisonnables;
- les clés et prompts restent côté serveur;
- aucun prompt libre n’est exposé;
- les brouillons restent invisibles;
- le build réussit;
- le lint ciblé réussit;
- les tests ciblés réussissent;
- le dépôt ne contient aucune modification étrangère au MVP 2.1.

### Finalisation

À la fin de l’incrément :

- conserver seulement les images validées;
- documenter la version du style utilisée;
- documenter les limites connues;
- ne pas régénérer automatiquement les autres articles;
- ne pas modifier le contrat JSON;
- préparer la clôture du MVP 2.1 après validation fonctionnelle et visuelle de Christian.

---

## 15. Tableau de progression

| Incrément | Résultat fonctionnel | État | Commit |
|---|---|---|---|
| 0 | Inspection ciblée de l’implantation existante | À faire | — |
| 1 | Génération des couvertures d’articles | À faire | — |
| 2 | Génération des médias internes | À faire | — |
| 3 | Cohérence de collection et finalisation | À faire | — |

États recommandés :

```text
À faire
En cours
À valider
Accepté
Bloqué
```

---

## 16. Discipline pour chaque session Codex

Chaque prompt Codex doit préciser :

1. le résultat visible attendu;
2. les documents de référence à lire;
3. l’état Git requis;
4. l’incrément unique à réaliser;
5. les fichiers ou zones à inspecter;
6. les éléments inclus;
7. les éléments hors périmètre;
8. les invariants de sécurité;
9. les invariants de stockage;
10. les invariants visuels;
11. les validations techniques;
12. les générations réelles autorisées ou interdites;
13. le scénario manuel à vérifier;
14. le rapport final attendu;
15. l’interdiction de commit ou push sauf demande explicite.

Le rapport final doit contenir :

- résultat obtenu;
- décisions techniques;
- fichiers créés ou modifiés;
- migrations éventuelles;
- endpoint et contrat d’entrée;
- prompt et versions utilisées;
- stockage et remplacement;
- sécurité et authentification;
- comportement avec et sans asset existant;
- types de médias pris en charge;
- commandes exécutées;
- tests exécutés;
- générations réelles effectuées;
- vérification manuelle effectuée ou restant à faire;
- limites connues;
- état Git;
- résumé du diff;
- aucun push sans demande explicite.

Codex ne doit pas :

- commencer l’incrément suivant;
- modifier le contrat JSON;
- lancer une génération en lot;
- régénérer silencieusement des assets existants;
- refactoriser des zones étrangères;
- créer un gestionnaire de médias générique;
- ajouter une dépendance majeure sans justification issue de l’inspection.

---

## 17. Invariants critiques

Pendant tout le MVP 2.1 :

- le MVP 2.0 continue de fonctionner;
- les articles existants restent lisibles;
- le contrat JSON Articles v1 reste inchangé;
- l’import reste permissif;
- une réimportation ne supprime pas les fichiers;
- l’upload manuel reste disponible;
- l’absence d’image ne bloque pas l’enregistrement;
- l’absence d’image ne bloque pas automatiquement la publication;
- les fallbacks publics restent fonctionnels;
- une génération échouée ne supprime jamais un asset valide;
- l’ancien fichier n’est supprimé qu’après succès complet;
- les clés du fournisseur restent côté serveur;
- seuls les administrateurs peuvent générer;
- le client ne transmet pas un prompt libre;
- le client ne transmet pas un chemin de stockage;
- le serveur récupère l’article et le média réels;
- `article-visual-style-v1` est appliqué à toutes les générations;
- les profils sont sélectionnés selon le type réel;
- les `chart` ne sont pas générés librement;
- les `screenshot` ne sont pas fabriqués;
- aucune donnée n’est inventée;
- aucun logo, URL, source ou filigrane n’est demandé dans l’image;
- les brouillons restent invisibles publiquement;
- la génération ne publie jamais;
- la génération ne modifie jamais le contenu Markdown;
- la génération ne modifie jamais les sources ou citations;
- les pages publiques continuent d’utiliser les assets existants;
- les images existantes ne sont pas régénérées automatiquement;
- aucune file asynchrone complexe n’est ajoutée;
- aucune médiathèque générique n’est créée;
- aucune abstraction multi-fournisseurs n’est créée sans besoin réel;
- chaque incrément est validé avant le suivant;
- Christian conserve la décision finale.

---

## 18. Critères de clôture du MVP 2.1

La phase est terminée lorsque Christian peut :

1. ouvrir un article enregistré;
2. générer sa couverture;
3. voir la couverture dans l’administration;
4. voir la couverture dans la carte et la page publique;
5. régénérer la couverture;
6. conserver l’ancienne couverture lors d’un échec;
7. remplacer la couverture par un upload manuel;
8. supprimer la couverture et retrouver le fallback;
9. générer un diagramme;
10. générer une illustration;
11. générer une infographie interne lorsque pertinente;
12. voir chaque média associé à la bonne clé;
13. régénérer un média sans affecter les autres;
14. conserver l’ancien média lors d’un échec;
15. utiliser l’upload manuel pour un graphique;
16. utiliser l’upload manuel pour une capture;
17. constater qu’aucun brouillon n’est exposé;
18. constater que le contenu éditorial n’est pas modifié;
19. comparer trois couvertures et trois médias;
20. reconnaître une identité visuelle commune;
21. constater des compositions suffisamment variées;
22. vérifier le rendu sur ordinateur et mobile;
23. vérifier que les fichiers ont le bon ratio;
24. vérifier que les poids sont raisonnables;
25. exécuter le build avec succès;
26. exécuter le lint ciblé avec succès;
27. exécuter les tests ciblés avec succès;
28. valider fonctionnellement et visuellement le résultat.

---

## 19. Évolutions volontairement reportées

À réévaluer seulement après utilisation du MVP 2.1 :

- génération automatique à la publication;
- génération automatique à l’import;
- génération en lot;
- plusieurs variantes par requête;
- comparaison et sélection de variantes;
- historique et restauration de versions;
- file de jobs asynchrones;
- notification différée;
- éditeur graphique;
- prompt libre;
- choix du modèle dans l’interface;
- choix du fournisseur;
- génération de graphiques depuis des données structurées;
- génération de captures réelles par navigateur;
- composition déterministe de tous les libellés de diagrammes;
- détection automatique d’une image périmée;
- régénération après changement de brief;
- génération multilingue liée;
- médiathèque globale;
- CDN ou pipeline multi-résolutions avancé;
- analyse automatique de la cohérence visuelle;
- nouvelle version de la direction visuelle;
- génération des couvertures de séries à partir des articles.

La priorité reste un flux simple :

```text
Article enregistré
→ générer un asset
→ vérifier
→ conserver ou régénérer
→ publier selon le workflow existant
```
