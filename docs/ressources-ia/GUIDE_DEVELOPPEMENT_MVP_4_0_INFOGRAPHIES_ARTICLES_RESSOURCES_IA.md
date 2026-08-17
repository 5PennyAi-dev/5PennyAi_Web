# Guide de développement — MVP 4.0 Infographies des articles Ressources IA

**Projet :** 5PennyAi
**Section :** Ressources IA
**Évolution :** infographie compagnon des articles et génération de couverture dérivée
**Date :** 8 août 2026
**Statut :** conception fonctionnelle prête à être inspectée puis implantée par incréments

---

> **État historique.** Les générateurs actifs ne lisent plus `theme`; consulter le
> guide Taxonomie des sujets Ressources IA pour l’architecture finale.

## 1. Rôle du document

Ce guide encadre l’évolution **MVP 4.0** de la section Ressources IA.

Il prolonge les phases déjà terminées, notamment :

- le MVP 1.2 pour les thumbnails d’infographies et de séries;
- le MVP 2.0 pour les articles, leurs couvertures et leurs médias internes;
- le MVP 3.0 pour les publications sociales administratives;
- le MVP 3.1 pour le partage public et le téléchargement des infographies.

Le MVP 4.0 ajoute à un article un nouvel asset spécialisé : une **infographie compagnon** qui synthétise visuellement le contenu de l’article.

Le flux cible est :

```text
Article rédigé et révisé
→ utiliser son contenu comme source éditoriale
→ produire une infographie 5PennyAi
→ téléverser l’infographie dans l’article
→ l’afficher comme synthèse visuelle téléchargeable
→ utiliser cette infographie comme référence visuelle
→ générer la couverture 16:9 de l’article
```

Le MVP 4.0 ne génère pas encore automatiquement l’infographie complète depuis l’administration. La production de cette infographie demeure, dans cette phase, un workflow éditorial externe contrôlé par Christian.

L’objectif est d’abord de valider trois fondations :

```text
article ↔ infographie compagnon
infographie compagnon → expérience publique
infographie compagnon → couverture dérivée
```

L’inspection du dépôt demeure la source de vérité technique. Elle peut ajuster les noms de colonnes, composants, routes, helpers ou fonctions sans modifier les objectifs fonctionnels du présent guide.

---

## 2. Documents de référence

### Références obligatoires

```text
GUIDE_DEVELOPPEMENT_MVP_4_0_INFOGRAPHIES_ARTICLES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_3_1_PARTAGE_SOCIAL_PUBLIC_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_2_0_ARTICLES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_1_2_THUMBNAILS_RESSOURCES_IA.md
CONCEPTION_GENERATEUR_THUMBNAILS_V3.md
CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md
GUIDE_STYLE_INFOGRAPHIES_5PENNYAI.md
```

### Références complémentaires

```text
PROMPT_COUVERTURES_ARTICLES_5PENNYAI_V2.md
GUIDE_DEVELOPPEMENT_MVP_2_1_GENERATION_IMAGES_ARTICLES_RESSOURCES_IA.md
REFERENCE_DEVELOPPEMENT_MVP_RESSOURCES_IA_PHASE_1.md
CONTRAT_JSON_RESSOURCES_IA_V1.md
```

Le guide du MVP 2.1 est une référence de contexte seulement. Cette phase de génération intégrée des images d’articles a été abandonnée et ne doit pas être réactivée telle quelle.

### Hiérarchie des responsabilités

- Le **contrat JSON Articles v1** demeure la référence du contenu éditorial importable.
- Le **MVP 2.0** demeure la référence pour les articles, leur publication, leurs médias internes et leur couverture active.
- Le **guide de style des infographies** demeure la référence pour l’infographie compagnon produite à partir du contenu de l’article.
- Le **MVP 1.2** et la conception des thumbnails v3 fournissent le modèle technique de référence pour transformer une infographie existante en couverture horizontale simplifiée.
- Le **MVP 3.1** fournit le modèle public de téléchargement d’une image pédagogique complète.
- Le serveur demeure la source de vérité pour les chemins de stockage, l’authentification et la génération d’images.
- Christian conserve la décision finale sur l’infographie et sur la couverture générée.

---

## 3. Contexte

Les articles Ressources IA possèdent actuellement trois familles de contenu visuel :

```text
Couverture 16:9
→ catalogue
→ en-tête public
→ Open Graph et partage social

Médias internes
→ diagrammes, illustrations ou autres figures
→ placés dans contentMarkdown avec {{media:key}}

Fallbacks
→ utilisés lorsqu’un asset est absent
```

La couverture est utile pour reconnaître l’article, mais elle ne peut pas résumer tout son contenu. Les médias internes servent des explications locales dans le corps de l’article, mais ils ne représentent pas nécessairement l’article comme un ensemble.

Il manque donc un niveau intermédiaire :

```text
Article complet
→ infographie compagnon
→ synthèse visuelle pédagogique autonome
```

Cette infographie répond à un besoin différent :

- fournir une synthèse visuelle du contenu;
- permettre au lecteur de retenir l’essentiel après la lecture;
- offrir un fichier pédagogique téléchargeable;
- créer une continuité visuelle entre les articles et les infographies 5PennyAi;
- fournir une source visuelle riche et déjà validée pour la génération de la couverture de l’article.

Le dernier point est particulièrement important. Les essais antérieurs de génération de couvertures directement depuis le texte de l’article ont produit des résultats trop variables ou trop génériques. Le générateur de thumbnails des infographies a montré qu’une image complète déjà structurée peut servir de référence efficace pour produire une couverture horizontale simplifiée.

Le MVP 4.0 applique donc ce principe aux articles.

---

## 4. Objectif du MVP 4.0

Permettre à Christian d’associer une infographie de synthèse à un article, de la rendre disponible au lecteur et de l’utiliser comme source visuelle pour générer la couverture de l’article.

À la fin du MVP, Christian doit pouvoir :

1. ouvrir un article enregistré;
2. voir un bloc administratif consacré à son infographie de synthèse;
3. téléverser une infographie 5PennyAi produite à partir du contenu de l’article;
4. prévisualiser l’image complète;
5. saisir ou corriger son texte alternatif;
6. remplacer l’infographie;
7. supprimer l’infographie sans supprimer l’article;
8. réimporter le JSON de l’article sans perdre l’infographie;
9. publier un article même sans infographie;
10. consulter l’article public avec ou sans infographie;
11. voir l’infographie dans un bloc de synthèse distinct;
12. agrandir l’infographie;
13. télécharger l’infographie complète;
14. obtenir un nom de fichier descriptif;
15. partager ou copier le lien de l’article comme auparavant;
16. générer une couverture 16:9 à partir de l’infographie associée;
17. régénérer cette couverture;
18. conserver l’ancienne couverture si la génération échoue;
19. continuer à téléverser une couverture manuellement;
20. conserver le contenu, le statut, les sources et les médias internes de l’article inchangés pendant une génération de couverture.

Principe central :

> L’infographie compagnon enrichit l’article sans devenir une nouvelle ressource indépendante. Elle sert à la compréhension, au téléchargement et à la dérivation visuelle de la couverture.

---

## 5. Modèle conceptuel

Un article possède maintenant jusqu’à trois types d’assets visuels distincts :

```text
ARTICLE
│
├── Couverture 16:9
│   → catalogue
│   → en-tête de l’article
│   → Open Graph
│   → partage social
│
├── Infographie compagnon 4:5 ou 2:3
│   → synthèse pédagogique de l’article
│   → affichage dans la page publique
│   → agrandissement
│   → téléchargement
│   → référence visuelle de génération de la couverture
│
└── Médias internes
    → diagrammes / illustrations / figures locales
    → insérés dans le Markdown par media.key
```

Ces trois rôles ne doivent pas être fusionnés.

### 5.1 Couverture

La couverture reste un asset horizontal simple et lisible en petite carte.

Elle ne doit pas devenir une infographie miniature.

### 5.2 Infographie compagnon

L’infographie compagnon est une synthèse visuelle autonome de l’article.

Elle suit le guide de style des infographies 5PennyAi et utilise normalement :

```text
4:5
ou
2:3 lorsque le contenu essentiel l’exige
```

### 5.3 Médias internes

Les médias internes conservent leur rôle actuel et leur association à `media[].key`.

Une infographie compagnon n’est pas un média placé par un marqueur `{{media:key}}`.

---

## 6. Statut de l’infographie compagnon

### 6.1 Ce qu’elle est

L’infographie compagnon est :

- un asset rattaché à un article précis;
- une synthèse de l’article complet;
- un contenu public seulement lorsque l’article est public;
- un fichier téléchargeable;
- une référence visuelle potentielle pour la couverture.

### 6.2 Ce qu’elle n’est pas

Elle n’est pas :

- une nouvelle entrée dans la table des infographies Ressources IA;
- une nouvelle carte indépendante dans le catalogue;
- un épisode supplémentaire d’une série;
- une ressource possédant son propre slug;
- une page publique indépendante;
- un élément de `media[]`;
- une couverture;
- un thumbnail;
- une couverture de série.

### 6.3 Conséquence sur les séries

Si un article appartient à une série :

```text
Article = un épisode
Infographie compagnon = asset de cet épisode
```

L’infographie compagnon ne modifie pas :

- le numéro d’épisode;
- le nombre d’épisodes;
- l’ordre de la série;
- la navigation précédent/suivant;
- la couverture de série.

### 6.4 Conséquence sur le catalogue

Le catalogue continue d’afficher une seule carte pour l’article.

La carte utilise la couverture 16:9 existante.

L’infographie compagnon n’est pas ajoutée comme deuxième carte et n’est pas utilisée directement comme thumbnail vertical de l’article.

---

## 7. Source éditoriale de l’infographie

L’infographie doit être produite à partir du contenu réel de l’article.

La source éditoriale disponible comprend notamment :

```text
title
subtitle
summary
level
learningObjectives
contentMarkdown
takeaway
sources
```

Le texte de l’article demeure la source principale. Les sources peuvent être consultées par le workflow externe lorsqu’elles sont nécessaires pour préserver la fidélité factuelle.

### 7.1 Workflow du MVP 4.0

Dans cette phase :

```text
article enregistré ou JSON final
→ contenu récupéré par Christian
→ GPT / workflow Infographies 5PennyAi
→ plan d’infographie
→ validation humaine
→ génération de l’image
→ upload dans l’administration de l’article
```

Le site n’effectue aucun appel de modèle pour produire l’infographie complète.

### 7.2 Aucun nouveau contrat d’export obligatoire

Le MVP 4.0 ne crée pas un nouveau schéma JSON pour transmettre l’article au générateur d’infographies.

Christian peut utiliser :

- le JSON Articles v1 déjà produit;
- le contenu Markdown de l’article;
- les métadonnées déjà présentes dans le workflow éditorial.

Si l’inspection montre qu’une action simple `Copier le contenu source` peut être ajoutée sans créer un deuxième format ni dupliquer la logique d’import, elle peut être recommandée comme petite amélioration de l’incrément 1. Elle ne doit pas devenir une dépendance du MVP.

### 7.3 Évolution future

Une phase ultérieure pourra automatiser :

```text
articleId
→ récupération serveur du contenu
→ génération d’un plan d’infographie
→ validation
→ génération de l’infographie
```

Cette automatisation est explicitement hors périmètre du MVP 4.0.

---

## 8. Contrat JSON Articles v1

### Décision

Le **contrat JSON Articles v1 reste inchangé**.

L’infographie compagnon est un asset technique et éditorial géré par l’application après l’import, comme les fichiers de couverture et les fichiers de médias.

Le générateur d’articles ne doit pas produire :

```text
infographicPath
infographicUrl
articleInfographicPath
articleInfographicUrl
coverPath
```

Aucune propriété n’est ajoutée au JSON pour le MVP 4.0.

### Réimportation

Une réimportation d’un JSON d’article :

- peut mettre à jour les champs éditoriaux reconnus;
- ne supprime jamais l’infographie compagnon;
- ne remplace jamais son fichier;
- ne modifie jamais son chemin;
- ne supprime jamais la couverture existante;
- ne déclenche aucune nouvelle génération.

---

## 9. Modèle de données

L’inspection doit confirmer les noms exacts, les types et les conventions actuelles.

### 9.1 Solution recommandée

Ajouter à l’entité `articles` une référence facultative spécialisée :

```text
infographic_path text null
```

Ajouter également un texte alternatif éditable :

```text
infographic_alt_text text null
```

Nom final à adapter aux conventions du dépôt, par exemple :

```text
companion_infographic_path
article_infographic_path
infographic_asset_path
```

La simplicité et la cohérence avec `cover_path` ont priorité.

### 9.2 Champs facultatifs à évaluer pendant l’inspection

Ajouter seulement s’ils apportent une valeur réelle :

```text
infographic_updated_at timestamptz null
```

Ne pas ajouter par défaut :

```text
infographic_status
infographic_version
infographic_prompt
infographic_model
infographic_provider
infographic_width
infographic_height
infographic_download_count
```

Le MVP ne crée pas un historique de versions.

### 9.3 Pourquoi ne pas utiliser `article_media_assets`

Le stockage physique peut réutiliser le même bucket et les mêmes helpers, mais le rôle fonctionnel ne doit pas être confondu avec les médias internes.

`article_media_assets` relie actuellement des fichiers à des clés du manifeste `media[]`.

L’infographie compagnon :

- n’a pas de `mediaKey`;
- n’a pas de marqueur Markdown;
- représente l’article entier;
- possède un emplacement public prédéterminé;
- peut servir de source à la génération de la couverture.

Une colonne spécialisée sur l’article est donc la solution fonctionnelle la plus simple, sauf si l’inspection révèle une structure existante explicitement conçue pour ce rôle.

### 9.4 Migration

L’incrément 1 prévoit normalement une petite migration.

Elle ne doit :

- modifier aucun contrat JSON;
- migrer aucun média existant;
- modifier aucune infographie autonome;
- rendre aucun asset public par défaut;
- changer aucun statut d’article.

---

## 10. Stockage

### 10.1 Bucket

Réutiliser de préférence le bucket spécialisé des assets d’articles déjà introduit au MVP 2.0.

Forme conceptuelle :

```text
articles/{articleId}/infographic/{uniqueName}.{ext}
```

La convention réelle du dépôt a priorité.

Ne pas créer un nouveau bucket uniquement pour ce type d’image si le bucket existant peut l’accueillir proprement.

### 10.2 Format

Formats d’entrée recommandés :

```text
PNG
JPEG
WebP
```

Le fichier doit être une vraie image et son type MIME doit être vérifié.

L’extension enregistrée et téléchargée doit correspondre au vrai type de fichier.

### 10.3 Dimensions et ratio

Les ratios attendus suivent le guide des infographies :

```text
4:5 par défaut
2:3 lorsque nécessaire
```

Le MVP ne doit pas rejeter une image valide uniquement parce qu’elle diffère légèrement du ratio attendu, mais il peut afficher un avertissement administratif.

Les dimensions de référence du guide restent :

```text
4:5 → 2400 × 3000 px
2:3 → 2400 × 3600 px
```

### 10.4 Taille maximale

L’inspection doit vérifier :

- la limite actuelle du bucket `article-assets`;
- le poids réel des infographies produites;
- la capacité des fonctions d’upload existantes;
- l’effet sur le téléchargement public.

Ne pas fixer arbitrairement la même limite qu’un média interne si elle empêche les infographies de qualité normale.

Si une augmentation de limite est nécessaire, la limiter au besoin réel et documenter son impact.

### 10.5 Remplacement sûr

Séquence recommandée :

```text
1. valider le nouveau fichier
2. téléverser sous un nouveau chemin
3. mettre à jour infographic_path
4. actualiser l’aperçu
5. supprimer l’ancien fichier en meilleur effort
```

Ne jamais supprimer l’ancien asset avant que le nouveau soit téléversé et référencé avec succès.

### 10.6 Suppression

La suppression de l’infographie :

- retire sa référence de l’article;
- supprime le fichier en meilleur effort;
- ne supprime pas la couverture;
- ne modifie pas les médias internes;
- ne modifie pas le contenu Markdown;
- ne modifie pas le statut de publication.

Si la couverture avait été générée depuis l’infographie supprimée, elle reste valide comme asset indépendant jusqu’à ce que Christian la remplace ou la supprime.

---

## 11. Administration — bloc Infographie de synthèse

Ajouter dans le formulaire d’article un bloc spécialisé.

Libellé recommandé :

```text
Infographie de synthèse
```

ou, si une formulation plus administrative est préférable :

```text
Infographie de l’article
```

Le libellé public peut rester `Infographie de synthèse`.

### 11.1 Article sans infographie

Afficher :

- un état neutre;
- une courte explication du rôle de l’asset;
- le ratio recommandé;
- l’action d’upload;
- un champ de texte alternatif;
- éventuellement un rappel que l’infographie doit être produite à partir du contenu de l’article.

Exemple conceptuel :

```text
Infographie de synthèse

Ajoutez une infographie 5PennyAi qui résume visuellement cet article.
Formats recommandés : 4:5 ou 2:3.

[Téléverser une infographie]
```

### 11.2 Article avec infographie

Afficher :

- un aperçu complet ou proportionnel;
- le texte alternatif;
- le nom ou le type du fichier si utile;
- `Remplacer`;
- `Supprimer`;
- une action d’agrandissement administratif si un viewer réutilisable existe;
- l’accès au bouton de génération de couverture lorsque l’incrément 3 sera implanté.

### 11.3 Article non enregistré

L’upload peut suivre le comportement actuel des autres assets.

Si les assets exigent un `articleId` persistant :

- désactiver l’upload;
- demander d’enregistrer d’abord le brouillon;
- ne pas créer un article technique temporaire.

### 11.4 Texte alternatif

Le texte alternatif doit être éditable.

Fallback administratif possible lorsqu’il est vide :

```text
Infographie de synthèse de l’article « {title} »
```

Le fallback ne doit pas empêcher Christian de fournir une description plus informative.

Le texte alternatif :

- décrit l’information utile de l’image;
- ne reproduit pas tout le contenu;
- ne sert pas de légende SEO;
- ne doit pas contenir de Markdown technique.

### 11.5 Publication

L’absence d’infographie :

- ne bloque pas la sauvegarde;
- ne bloque pas la publication;
- ne produit pas d’erreur publique;
- ne modifie pas le fallback de couverture.

Le MVP 4.0 doit permettre à des articles anciens de continuer à fonctionner sans migration éditoriale manuelle.

---

## 12. Expérience publique de l’article

### 12.1 Emplacement recommandé

Afficher l’infographie après le contenu principal et les éléments de synthèse de l’article, puis avant les sources ou la navigation finale lorsque cela respecte la structure réelle de la page.

Ordre conceptuel recommandé :

```text
En-tête et couverture
→ objectifs / prérequis
→ contenu de l’article
→ À retenir
→ Infographie de synthèse
→ Sources
→ navigation de série
→ retour Ressources IA
```

L’inspection peut ajuster légèrement cet ordre pour correspondre au composant public actuel.

### 12.2 Bloc public

Structure recommandée :

```text
Infographie de synthèse

[Aperçu de l’infographie]

Agrandir · Télécharger
```

Une courte phrase facultative peut expliquer :

> Retrouvez les idées principales de l’article dans une synthèse visuelle à conserver.

Ne pas transformer le bloc en publicité ou en appel à l’action dominant.

### 12.3 Aperçu

L’image doit :

- conserver son ratio réel;
- être suffisamment grande pour être reconnue;
- ne pas être recadrée comme un thumbnail;
- ne pas déformer le contenu;
- charger de manière raisonnable;
- utiliser le vrai texte alternatif.

Sur desktop, une largeur maximale peut empêcher l’infographie de devenir disproportionnée.

Sur mobile, elle peut utiliser la largeur disponible tout en conservant son ratio.

### 12.4 Visionneuse

Réutiliser, si possible, la visionneuse déjà utilisée pour les infographies autonomes.

L’action `Agrandir` doit permettre :

- de lire les petits détails;
- de fermer facilement la visionneuse;
- d’utiliser le clavier;
- de fonctionner sur mobile;
- de conserver l’image à son ratio réel.

Ne pas créer une deuxième visionneuse presque identique sans nécessité.

### 12.5 Article sans infographie

Si `infographic_path` est absent :

- ne pas afficher le bloc;
- ne pas réserver d’espace vide;
- ne pas afficher de placeholder public;
- conserver le reste de l’article exactement comme avant.

---

## 13. Téléchargement public de l’infographie

### 13.1 Rôle

Le lecteur peut télécharger l’infographie compagnon afin de :

- la conserver;
- la consulter hors ligne;
- l’utiliser comme aide-mémoire;
- la joindre manuellement à une publication;
- la partager comme image si son outil le permet.

### 13.2 Asset téléchargé

Toujours télécharger :

```text
l’infographie compagnon complète
```

Ne jamais substituer :

- la couverture de l’article;
- un média interne;
- une couverture de série;
- un fallback générique.

### 13.3 Nom du fichier

Nom recommandé :

```text
{slug-article}-infographie.{ext}
```

Exemple :

```text
qu-est-ce-qu-un-prompt-infographie.png
```

Règles :

- nom descriptif;
- minuscules lorsque possible;
- tirets;
- caractères problématiques retirés;
- extension correspondant au vrai fichier.

### 13.4 Mécanisme de téléchargement

Réutiliser les enseignements du MVP 3.1.

L’inspection doit confirmer si le bucket des articles permet directement :

```text
fetch
→ Blob
→ URL.createObjectURL
→ lien temporaire download
```

Si l’asset privé ou ses URLs signées rendent ce parcours fragile, utiliser une petite route publique contrôlée qui :

1. reçoit un `articleId` ou un slug contrôlé;
2. récupère l’article côté serveur;
3. confirme `status=published`;
4. résout elle-même `infographic_path`;
5. récupère le fichier autorisé;
6. retourne le vrai `Content-Type`;
7. retourne un `Content-Disposition` descriptif;
8. n’accepte jamais un chemin de stockage arbitraire.

L’inspection doit choisir la solution la plus simple compatible avec l’architecture réelle.

### 13.5 Sécurité

Une route éventuelle de téléchargement ne doit pas devenir un proxy générique vers `article-assets`.

Interdictions :

```text
?path=...
?bucket=...
URL Supabase fournie par le client
mediaKey arbitraire
accès à un draft
accès à un média interne par ce mécanisme
```

---

## 14. Partage social et URL canonique

L’ajout d’une infographie compagnon ne modifie pas le principe du MVP 3.1.

### Article

```text
Partager
→ URL canonique de l’article

Copier le lien
→ URL canonique de l’article
```

### Infographie compagnon

Le bloc de synthèse n’ajoute pas un second partage de page indépendant.

L’infographie n’a pas sa propre URL canonique.

Elle peut être téléchargée, mais le partage principal reste celui de l’article.

### Open Graph

L’image Open Graph reste :

```text
couverture 16:9 de l’article
→ fallback social 5PennyAi
```

L’infographie verticale ne devient pas automatiquement `og:image`.

Lorsque la couverture est régénérée à partir de l’infographie, les métadonnées sociales existantes utilisent naturellement la nouvelle couverture active selon le comportement du MVP 3.0.

---

## 15. Génération de la couverture à partir de l’infographie

### 15.1 Principe

La couverture ne doit plus dépendre uniquement d’un prompt textuel construit depuis l’article.

Lorsqu’une infographie compagnon existe :

```text
Infographie compagnon
→ référence visuelle
+ métadonnées essentielles de l’article
+ règles de couverture 5PennyAi
→ génération / édition d’image
→ couverture 16:9
```

L’objectif est de réutiliser le mécanisme éprouvé du générateur de thumbnails d’infographies.

### 15.2 Ce qui est réutilisé

Réutiliser autant que possible :

- authentification administrative;
- client OpenAI côté serveur;
- mécanisme `images.edit` ou équivalent actuel;
- récupération d’une image source;
- prompt versionné;
- validation de la réponse;
- normalisation 16:9;
- conversion WebP lorsque déjà utilisée;
- stockage sous un nouveau nom;
- mise à jour sûre de la base;
- nettoyage en meilleur effort;
- conservation de l’ancien asset en cas d’échec;
- états UX Générer / Régénérer.

### 15.3 Ce qui ne doit pas être réutilisé aveuglément

Le prompt de thumbnail d’une infographie autonome ne doit pas être copié mot pour mot si ses règles éditoriales ne correspondent pas à une couverture d’article.

Créer une petite variante spécialisée, par exemple :

```text
article-cover-from-infographic-v1
```

Cette variante conserve la technique du thumbnail, mais adapte l’objectif :

```text
thumbnail d’infographie
→ couverture de catalogue d’une infographie

couverture d’article
→ couverture éditoriale de l’article
```

### 15.4 Données utilisées

Le serveur récupère lui-même :

```text
article.id
article.title
article.subtitle
article.summary
article.theme
article.level
article.takeaway
article.infographic_path
article.cover_path actuel
```

Le contenu Markdown complet n’est normalement pas nécessaire puisque l’infographie représente déjà le contenu visuellement.

Il peut être consulté seulement si l’inspection ou les essais montrent qu’un court contexte additionnel améliore réellement la génération.

### 15.5 Entrée client

Entrée minimale recommandée :

```json
{
  "articleId": "uuid"
}
```

Le client ne transmet pas :

- le prompt;
- le titre;
- le résumé;
- le chemin de l’infographie;
- le chemin de la couverture;
- le modèle;
- la version du style;
- une URL signée.

### 15.6 Endpoint

Deux options sont acceptables après inspection.

#### Option A — endpoint spécialisé

```text
POST /api/generate-article-cover-from-infographic
```

Avantage : rôle clair et contrat simple.

#### Option B — extension contrôlée d’un générateur existant

Ajouter un mode spécialisé seulement si cela réduit réellement la duplication sans rendre l’endpoint ambigu.

Ne pas transformer tous les générateurs d’images du projet en abstraction générique.

### 15.7 Référence visuelle

Le serveur doit récupérer l’infographie depuis le stockage de manière contrôlée.

Si le bucket est privé :

- utiliser les permissions serveur appropriées;
- ne pas exposer l’URL privée au modèle depuis le client;
- transmettre le fichier selon le mécanisme d’édition déjà utilisé pour les thumbnails.

### 15.8 Objectif visuel

La couverture générée doit :

- être réellement en 16:9;
- reprendre la grammaire visuelle de l’infographie;
- préserver la palette 5PennyAi;
- reprendre une métaphore ou une structure pertinente;
- réduire fortement la densité;
- fonctionner en petite carte;
- éviter de reproduire l’infographie complète;
- posséder sa propre composition horizontale.

Elle ne doit pas être un simple crop de l’infographie.

### 15.9 Politique de titre

La politique éditoriale actuelle des couvertures d’articles reste applicable :

```text
le titre de l’article doit apparaître dans la couverture
```

La génération doit privilégier le titre exact, complet et lisible.

L’inspection doit confirmer si le mécanisme actuel de génération à partir d’une image source reproduit suffisamment bien le texte. Si les erreurs de titre deviennent fréquentes, une composition déterministe du titre pourra être réévaluée ultérieurement.

Le MVP 4.0 ne doit pas réintroduire une infrastructure lourde uniquement pour ce point avant d’avoir observé le résultat réel.

### 15.10 Contenu interdit

La couverture ne doit pas contenir :

- sources;
- URL;
- bibliographie;
- marqueurs de citation;
- long paragraphe;
- microtexte;
- contenu de toutes les sections;
- nom de série par défaut;
- numéro d’épisode par défaut;
- logo tiers;
- filigrane;
- élément inventé sans rapport avec l’article.

### 15.11 Remplacement sûr

Séquence obligatoire :

```text
1. récupérer et valider l’article
2. vérifier qu’une infographie compagnon existe
3. générer la nouvelle couverture
4. valider le fichier
5. normaliser en 16:9
6. téléverser sous un nouveau chemin
7. mettre à jour cover_path
8. actualiser l’administration
9. supprimer l’ancienne couverture en meilleur effort
```

L’ancienne couverture n’est jamais supprimée avant la réussite complète des étapes critiques.

---

## 16. Administration — génération de couverture

Le bloc de couverture existant demeure le point principal de gestion.

### 16.1 Article sans infographie compagnon

Conserver :

- upload manuel;
- aperçu de couverture;
- remplacement;
- suppression;
- fallback existant.

Le bouton de génération dérivée est :

- masqué;
- ou désactivé avec une explication courte.

Exemple :

> Ajoutez d’abord une infographie de synthèse pour générer la couverture à partir de celle-ci.

### 16.2 Article avec infographie compagnon

Ajouter :

```text
Générer depuis l’infographie
```

Si une couverture existe :

```text
Régénérer depuis l’infographie
```

Conserver simultanément :

```text
Remplacer par un fichier
Supprimer la couverture
```

### 16.3 Infographie remplacée

Le remplacement de l’infographie ne doit pas régénérer automatiquement la couverture.

Une couverture existante reste active.

L’administration peut afficher un rappel non bloquant :

> La couverture existante n’est pas mise à jour automatiquement après le remplacement de l’infographie.

Ne pas créer un système de dépendances ou de versions pour cette première phase.

### 16.4 Infographie supprimée

Si l’infographie est supprimée :

- la couverture reste active;
- le bouton de génération dérivée disparaît ou devient indisponible;
- aucune autre donnée n’est modifiée.

---

## 17. Gestion des erreurs

### Upload d’infographie échoué

- ancien fichier conservé;
- aucune référence invalide enregistrée;
- formulaire encore utilisable;
- couverture inchangée.

### Mise à jour de base échouée après upload

- tenter de supprimer le nouvel asset orphelin;
- conserver l’ancien asset actif;
- signaler l’erreur.

### Nettoyage de l’ancien fichier échoué

- conserver la nouvelle référence valide;
- journaliser ou signaler l’orphelin;
- ne pas annuler un remplacement réussi.

### Infographie absente publiquement

- ne pas afficher le bloc de synthèse;
- conserver l’article;
- conserver le partage et les autres médias.

### Téléchargement échoué

- afficher un message clair;
- conserver `Agrandir` si l’image reste visible;
- ne pas révéler un chemin Supabase;
- ne pas remplacer silencieusement par la couverture.

### Génération de couverture sans infographie

- refuser côté serveur même si le client tente la requête;
- conserver l’ancienne couverture;
- retourner une erreur contrôlée.

### Erreur du modèle d’image

- ancienne couverture conservée;
- aucune modification du statut;
- formulaire utilisable;
- nouvelle tentative possible.

### Réponse image invalide

Exemples :

- réponse sans image;
- type MIME non accepté;
- fichier vide;
- ratio inutilisable après normalisation.

Comportement :

- ne pas modifier `cover_path`;
- conserver l’ancienne couverture;
- nettoyer le nouvel asset temporaire si nécessaire;
- retourner une erreur contrôlée.

### Infographie supprimée pendant une génération

Le serveur doit revalider l’état nécessaire avant la mise à jour finale lorsqu’un risque de concurrence existe dans l’architecture actuelle.

Ne pas construire un système de verrouillage complexe si le scénario réel ne le justifie pas.

---

## 18. Sécurité et visibilité

Règles minimales :

- seuls les administrateurs peuvent téléverser, remplacer ou supprimer l’infographie compagnon;
- seuls les administrateurs peuvent déclencher la génération de couverture;
- les clés fournisseur restent côté serveur;
- le client ne fournit jamais de chemin de stockage arbitraire;
- le client ne fournit jamais le prompt de génération;
- le serveur récupère l’article et ses chemins réels;
- une infographie liée à un brouillon n’est jamais accessible par une route publique générique;
- le téléchargement public confirme que l’article est publié;
- aucune route ne devient un proxy générique vers `article-assets`;
- aucune modification de l’infographie ne change le statut de publication;
- aucune génération de couverture ne rend un brouillon public;
- aucune donnée privée du workflow administratif n’est affichée dans la page publique.

---

## 19. Performance et chargement

Une infographie compagnon est beaucoup plus lourde qu’une couverture 16:9.

Le MVP doit donc éviter de la charger dans les contextes où elle n’apporte pas de valeur.

### Catalogue

Ne jamais charger l’infographie compagnon dans les cartes.

Utiliser :

```text
cover_path
→ fallback de couverture
```

### Page de série

Ne pas charger l’infographie compagnon dans les cartes d’épisodes.

### Page publique de l’article

L’image peut utiliser :

```text
loading="lazy"
decoding="async"
```

lorsque cela correspond aux conventions du composant.

Le chargement différé est particulièrement approprié puisque le bloc est situé après le corps de l’article.

### Visionneuse

Ne pas télécharger une deuxième version plus lourde si le même fichier complet peut être réutilisé proprement.

### Couverture

La couverture générée reste l’asset léger destiné aux cartes et au partage social.

---

## 20. Accessibilité

### Image

- utiliser `infographic_alt_text` lorsqu’il est renseigné;
- utiliser un fallback cohérent lorsqu’il est vide;
- ne pas dupliquer inutilement une légende identique dans l’attribut `alt`;
- ne pas utiliser le nom du fichier comme texte alternatif.

### Visionneuse

Réutiliser les comportements accessibles existants :

- focus géré correctement;
- fermeture au clavier;
- bouton explicite;
- interaction non dépendante du survol.

### Actions

Les actions :

```text
Agrandir
Télécharger
Générer depuis l’infographie
Remplacer
Supprimer
```

doivent conserver :

- un focus visible;
- un libellé clair;
- une zone tactile suffisante;
- un statut accessible lors d’une opération asynchrone.

---

## 21. Journalisation minimale

La génération de couverture peut réutiliser la journalisation existante des fonctions d’images.

Journaliser seulement ce qui aide au diagnostic :

```text
articleId
action = cover_from_infographic
version du prompt
modèle utilisé
succès ou échec
étape de l’échec
durée générale si disponible
```

Ne pas journaliser inutilement :

- le contenu complet de l’article;
- toutes les sources;
- l’image en base64;
- les URLs signées;
- les secrets;
- le prompt complet si cela expose inutilement le contenu éditorial.

Aucun historique persistant de générations n’est requis.

---

# 22. Découpage du développement

Le MVP 4.0 est découpé en **trois incréments fonctionnels**, précédés d’une inspection ciblée.

```text
Inspection
→ asset compagnon dans l’administration
→ affichage et téléchargement publics
→ couverture dérivée et finalisation
```

---

## Incrément 0 — Inspection ciblée

### Objectif

Confirmer l’état réel du dépôt après le MVP 3.1 et déterminer la plus petite implantation fiable pour l’infographie compagnon et la couverture dérivée.

### Documents à lire

```text
GUIDE_DEVELOPPEMENT_MVP_4_0_INFOGRAPHIES_ARTICLES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_3_1_PARTAGE_SOCIAL_PUBLIC_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_2_0_ARTICLES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_1_2_THUMBNAILS_RESSOURCES_IA.md
CONCEPTION_GENERATEUR_THUMBNAILS_V3.md
CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md
GUIDE_STYLE_INFOGRAPHIES_5PENNYAI.md
PROMPT_COUVERTURES_ARTICLES_5PENNYAI_V2.md
```

### À inspecter

- état Git, branche, remotes et derniers commits;
- état réel et clôture du MVP 3.1;
- structure actuelle de `articles`;
- migrations des articles;
- `cover_path` réel et helpers associés;
- table ou structure `article_media_assets`;
- bucket `article-assets`;
- limite de taille du bucket;
- politiques RLS et Storage;
- conventions de chemins;
- logique actuelle d’upload, remplacement et suppression de couverture;
- logique actuelle d’upload, remplacement et suppression des médias internes;
- comportement de réimportation d’un article;
- suppression complète d’un article et nettoyage de ses assets;
- page publique d’article;
- emplacement actuel du bloc `À retenir`;
- emplacement de la section Sources;
- visionneuse actuelle des infographies autonomes;
- composant `ResourceShareActions` ou équivalent;
- mécanisme final de téléchargement implanté au MVP 3.1;
- comportement CORS du bucket `article-assets`;
- génération actuelle des thumbnails d’infographies;
- endpoint `/api/generate-resource-thumbnail` ou équivalent réel;
- client OpenAI actuel;
- appel `images.edit` ou équivalent;
- méthode utilisée pour envoyer l’image source;
- normalisation réelle en 16:9;
- conversion WebP;
- stockage et remplacement sécurisé du thumbnail;
- prompts/version du générateur de thumbnails;
- tests existants;
- traductions FR/EN;
- poids réel de quelques infographies 4:5 et 2:3 produites récemment.

### Questions à résoudre

1. Une colonne `infographic_path` sur `articles` est-elle la solution la plus simple?
2. Faut-il une colonne `infographic_alt_text` ou existe-t-il déjà un mécanisme équivalent?
3. Le bucket `article-assets` accepte-t-il les dimensions et poids réels des infographies?
4. Quelle logique d’upload existante peut être réutilisée?
5. Comment le nettoyage d’un article doit-il inclure le nouvel asset?
6. La visionneuse des infographies peut-elle être réutilisée directement?
7. Le téléchargement peut-il utiliser `fetch → Blob → URL.createObjectURL` avec les assets privés/signés des articles?
8. Si non, quelle petite route publique contrôlée est nécessaire?
9. Le générateur de thumbnails peut-il recevoir l’infographie compagnon depuis le bucket privé sans modification majeure?
10. Quelle extraction partagée minimale permet de réutiliser la logique `images.edit`?
11. Faut-il un nouvel endpoint spécialisé ou un nouveau mode contrôlé?
12. Le prompt de thumbnail actuel peut-il être adapté sans reprendre les défauts du MVP 2.1?
13. Le titre de couverture peut-il être reproduit avec une fiabilité suffisante?
14. Une migration autre que les deux champs de l’article est-elle nécessaire?
15. Une action simple de copie du contenu source apporterait-elle une vraie valeur sans créer un nouveau format d’export?

### Décisions attendues

Le rapport doit préciser :

- état réel des articles et de leurs assets;
- schéma exact proposé;
- migration exacte proposée;
- chemin de stockage retenu;
- limite de fichier retenue;
- composants administratifs à modifier;
- composants publics à modifier;
- stratégie de visionneuse;
- stratégie de téléchargement;
- endpoint de génération retenu;
- fonctions du générateur de thumbnails à réutiliser;
- stratégie de prompt;
- stratégie de titre;
- liste exacte des fichiers à modifier;
- risques et mesures de mitigation;
- périmètre précis de l’incrément 1.

### Résultat visible

Aucun changement public ou administratif.

### Hors périmètre

- aucune modification de code;
- aucune migration;
- aucune dépendance;
- aucun appel réel au modèle;
- aucun upload réel;
- aucun commit;
- aucun push.

### Critères d’acceptation

- le MVP 3.1 est confirmé fonctionnel;
- la structure des articles est documentée;
- le stockage du nouvel asset est cadré;
- le téléchargement est cadré;
- le mécanisme de génération réutilisable est identifié;
- aucune table générique de ressources n’est proposée;
- aucune modification du contrat JSON n’est proposée;
- le périmètre de l’incrément 1 est précis.

---

## Incrément 1 — Infographie compagnon dans l’administration

### Objectif

Permettre d’associer une infographie de synthèse à un article sans modifier son workflow éditorial ou sa publication.

### Inclus

- migration minimale de `articles`;
- `infographic_path` ou nom retenu;
- `infographic_alt_text` ou solution équivalente;
- adaptation des requêtes administratives;
- bloc `Infographie de synthèse` dans le formulaire;
- upload d’un fichier image;
- validation MIME et taille;
- aperçu;
- texte alternatif éditable;
- remplacement sûr;
- suppression;
- nettoyage en meilleur effort;
- préservation lors d’une réimportation JSON;
- préservation de la couverture et des médias internes;
- nettoyage du nouvel asset lors de la suppression complète d’un article lorsque la logique actuelle le prévoit;
- traductions FR/EN;
- tests ciblés.

Une action simple `Copier le contenu source` peut être incluse uniquement si l’inspection démontre qu’elle est triviale, claire et ne crée aucun nouveau contrat d’échange.

### Résultat visible

> Christian ouvre un article, téléverse une infographie 4:5 ou 2:3, la prévisualise et la retrouve toujours après avoir enregistré ou réimporté l’article.

### Hors périmètre

- affichage public de l’infographie;
- téléchargement public;
- génération de la couverture;
- génération automatique de l’infographie;
- prompt d’infographie dans le site;
- nouvelle page publique;
- nouvelle carte de catalogue;
- nouveau type de ressource;
- modification de `media[]`;
- modification du contrat JSON;
- historique de versions.

### Critères d’acceptation

- un article enregistré peut recevoir une infographie;
- l’image est conservée sous un chemin contrôlé;
- le texte alternatif peut être sauvegardé;
- une image valide est prévisualisée;
- un fichier invalide est refusé proprement;
- remplacer l’infographie ne supprime pas l’ancienne avant succès;
- supprimer l’infographie ne supprime pas la couverture;
- supprimer l’infographie ne supprime aucun média interne;
- une réimportation JSON conserve l’infographie;
- l’absence d’infographie reste valide;
- un article ancien reste éditable;
- aucun brouillon n’est rendu public;
- le build et les tests ciblés réussissent.

### Tests ciblés recommandés

- article sans infographie;
- upload valide;
- MIME invalide;
- taille excessive;
- construction du chemin;
- remplacement réussi;
- upload échoué;
- mise à jour DB échouée;
- suppression;
- réimportation JSON;
- suppression complète de l’article;
- texte alternatif vide et renseigné.

### Vérification manuelle

Tester au minimum :

- une infographie 4:5;
- une infographie 2:3;
- remplacement d’un fichier;
- suppression;
- réimportation de l’article;
- formulaire à 1440, 768 et environ 390 px.

---

## Incrément 2 — Affichage, agrandissement et téléchargement publics

### Objectif

Permettre au lecteur de consulter l’infographie de synthèse d’un article et de télécharger son fichier complet.

### Inclus

- récupération publique sécurisée de l’asset pour un article publié;
- adaptation de la requête publique de l’article;
- bloc `Infographie de synthèse`;
- affichage au ratio réel;
- texte alternatif;
- chargement différé lorsque pertinent;
- action `Agrandir`;
- réutilisation de la visionneuse existante;
- action `Télécharger` dans le bloc de l’infographie;
- nom de fichier descriptif;
- type MIME réel;
- stratégie `fetch → Blob` si compatible;
- route serveur contrôlée seulement si nécessaire;
- gestion des assets absents;
- gestion des erreurs;
- conservation des actions `Partager` et `Copier le lien` de l’article;
- traductions FR/EN;
- responsive;
- accessibilité;
- tests ciblés.

### Résultat visible

> Le lecteur termine un article, consulte son infographie de synthèse, peut l’agrandir et télécharger l’image complète sans quitter le contexte de l’article.

### Hors périmètre

- nouvelle page publique pour l’infographie;
- partage direct de l’image;
- nouveau `og:image` vertical;
- nouveau bouton social dédié;
- génération de couverture;
- génération d’infographie;
- compteur de téléchargements;
- analytics dédiés;
- téléchargement de la couverture;
- téléchargement des médias internes.

### Critères d’acceptation

- un article publié avec infographie affiche le bloc;
- un article publié sans infographie n’affiche aucun espace vide;
- un brouillon ne permet pas de récupérer l’asset par le parcours public;
- l’image respecte son ratio;
- l’image n’est pas recadrée comme un thumbnail;
- `Agrandir` utilise un viewer accessible;
- `Télécharger` récupère l’infographie complète;
- le fichier porte un nom descriptif;
- le type MIME est correct;
- la couverture n’est jamais téléchargée comme substitution;
- `Partager` continue de partager l’article;
- `Copier le lien` continue de copier l’URL canonique de l’article;
- aucune URL signée n’est utilisée comme URL principale de partage;
- les autres médias de l’article restent inchangés;
- le rendu fonctionne à 1440, 768 et environ 390 px;
- le build et les tests ciblés réussissent.

### Tests ciblés recommandés

- article publié avec infographie;
- article publié sans infographie;
- brouillon avec infographie;
- slug inconnu;
- asset absent;
- type MIME PNG;
- type MIME WebP;
- nom de fichier avec accents dans le titre;
- erreur de stockage;
- viewer clavier;
- téléchargement avec fallback technique retenu.

### Vérification manuelle

- ouvrir au moins deux articles avec infographie;
- agrandir les deux images;
- télécharger les deux fichiers;
- ouvrir les fichiers téléchargés;
- vérifier leurs noms;
- vérifier qu’il s’agit bien de l’infographie complète;
- tester ordinateur et mobile;
- confirmer que les actions sociales de l’article restent correctes.

---

## Incrément 3 — Génération de la couverture depuis l’infographie et finalisation

### Objectif

Générer une couverture d’article 16:9 en utilisant l’infographie compagnon comme référence visuelle, puis valider l’ensemble du parcours MVP 4.0.

### Inclus

- réutilisation du mécanisme technique du générateur de thumbnails;
- extraction partagée minimale si elle réduit une duplication réelle;
- prompt versionné `article-cover-from-infographic-v1` ou nom équivalent;
- endpoint authentifié spécialisé ou mode contrôlé retenu à l’inspection;
- récupération serveur de l’article;
- récupération serveur de l’infographie compagnon;
- validation de l’existence de l’asset;
- métadonnées éditoriales minimales;
- appel au modèle d’image avec l’infographie comme référence;
- production d’une seule image;
- normalisation réelle en 16:9;
- conservation du titre selon la politique actuelle des couvertures;
- téléversement sous un nouveau chemin;
- mise à jour sûre de `cover_path`;
- conservation de l’ancienne couverture lors d’un échec;
- nettoyage en meilleur effort;
- bouton `Générer depuis l’infographie`;
- bouton `Régénérer depuis l’infographie`;
- maintien de l’upload manuel;
- états de chargement et d’erreur;
- mise à jour immédiate de l’aperçu;
- vérification dans le catalogue;
- vérification dans l’en-tête public;
- vérification Open Graph selon la fondation existante;
- essais réels sur plusieurs articles;
- ajustements limités du prompt selon les résultats;
- build, lint ciblé et tests ciblés;
- documentation des limites restantes.

### Résultat visible

> Christian ajoute une infographie à un article, clique sur `Générer depuis l’infographie` et obtient une couverture horizontale cohérente avec le contenu et la grammaire visuelle de cette infographie.

### Hors périmètre

- génération automatique de l’infographie;
- génération à la publication;
- génération en lot;
- plusieurs variantes simultanées;
- historique de versions;
- choix de modèle dans l’interface;
- prompt libre;
- éditeur graphique;
- refonte générale du générateur de thumbnails;
- nouvelle version majeure du guide visuel sans décision explicite;
- modification du contrat JSON;
- régénération automatique des anciennes couvertures.

### Critères d’acceptation fonctionnels

- le bouton est disponible seulement lorsque l’article est enregistré et possède une infographie;
- l’endpoint refuse un utilisateur non autorisé;
- le serveur récupère l’article réel;
- le serveur récupère le chemin réel de l’infographie;
- aucun prompt libre n’est accepté;
- aucun chemin client n’est accepté;
- une seule image est demandée;
- le résultat final est réellement en 16:9;
- l’image est enregistrée comme couverture active;
- le catalogue utilise la nouvelle couverture;
- la page publique utilise la nouvelle couverture;
- Open Graph continue d’utiliser la couverture active selon la logique existante;
- l’ancienne couverture est conservée en cas d’échec;
- l’infographie compagnon n’est jamais modifiée par la génération;
- le contenu Markdown n’est jamais modifié;
- les sources et citations ne sont jamais modifiées;
- le statut de l’article n’est jamais modifié;
- l’upload manuel continue de fonctionner;
- supprimer l’infographie après génération ne supprime pas la couverture.

### Critères d’acceptation visuels

Tester au minimum trois articles aux sujets suffisamment différents.

Chaque couverture retenue doit :

- être clairement liée à l’infographie source;
- utiliser la palette et le langage graphique 5PennyAi;
- sembler appartenir à la même collection que les autres couvertures;
- avoir une composition horizontale propre;
- ne pas être un simple recadrage vertical;
- rester lisible dans une carte;
- contenir le titre selon la politique éditoriale en vigueur;
- éviter le microtexte;
- éviter les sources et URL;
- éviter la 3D générique;
- éviter les logos tiers;
- conserver une bonne zone sûre;
- remplir le 16:9 sans bandes artificielles.

### Tests ciblés recommandés

- article inexistant;
- article sans infographie;
- utilisateur non autorisé;
- infographie introuvable dans le stockage;
- assemblage du prompt;
- absence de données inutiles;
- réponse fournisseur invalide;
- normalisation du ratio;
- téléversement échoué;
- mise à jour DB échouée;
- conservation de l’ancienne couverture;
- nettoyage de l’ancien asset;
- double clic ou génération concurrente simple;
- bouton désactivé sans infographie.

### Vérification manuelle

- générer au moins trois couvertures;
- comparer chaque couverture à son infographie source;
- vérifier la carte du catalogue;
- vérifier l’en-tête public;
- vérifier le partage social/Open Graph selon les outils disponibles;
- provoquer ou simuler un échec et confirmer que l’ancienne couverture reste active;
- remplacer manuellement une couverture après une génération;
- supprimer l’infographie et confirmer que la couverture demeure;
- tester l’administration à 1440, 768 et environ 390 px.

### Finalisation

À la fin de l’incrément :

- conserver seulement les couvertures validées;
- documenter la version du prompt utilisée;
- documenter les limites du texte généré dans les couvertures;
- documenter les limites de poids des infographies;
- vérifier les assets orphelins évidents;
- vérifier la sécurité du téléchargement;
- vérifier l’état Git;
- ne pas régénérer automatiquement les articles existants.

---

## 23. Tableau de progression

| Incrément | Résultat fonctionnel | État | Commit |
|---|---|---|---|
| 0 | Inspection de l’architecture et des assets | À faire | — |
| 1 | Infographie compagnon dans l’administration | À faire | — |
| 2 | Affichage, agrandissement et téléchargement publics | À faire | — |
| 3 | Couverture dérivée de l’infographie et finalisation | À faire | — |

États recommandés :

```text
À faire
En cours
À valider
Accepté
Bloqué
```

---

## 24. Discipline pour chaque session Codex

Chaque prompt Codex doit préciser :

1. le résultat visible attendu;
2. les documents de référence à lire;
3. l’état Git requis;
4. l’incrément unique à réaliser;
5. les fichiers ou zones à inspecter;
6. les éléments inclus;
7. les éléments hors périmètre;
8. les invariants du contrat JSON;
9. les invariants des articles et médias existants;
10. les invariants du nouvel asset;
11. les invariants de stockage;
12. les invariants de visibilité publique;
13. les invariants de génération d’image lorsque pertinente;
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
- migration éventuelle;
- colonnes ajoutées;
- stockage et chemins;
- comportement de l’upload;
- comportement de la réimportation;
- comportement public;
- stratégie de téléchargement;
- stratégie de visionneuse;
- endpoint de génération lorsque pertinent;
- version du prompt lorsque pertinente;
- données transmises au modèle;
- comportement de remplacement;
- sécurité et authentification;
- accessibilité;
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
- modifier le contrat JSON Articles v1;
- ajouter l’infographie compagnon à `media[]`;
- créer une nouvelle ressource autonome;
- compter l’infographie comme épisode;
- créer une table générique `resources`;
- créer une médiathèque générique;
- ajouter un prompt libre dans l’administration;
- générer automatiquement une infographie;
- régénérer automatiquement une couverture lors d’un upload;
- lancer une génération en lot;
- exposer un bucket privé;
- accepter un chemin de stockage fourni arbitrairement par le client;
- refactoriser des zones étrangères;
- ajouter une dépendance majeure sans justification issue de l’inspection;
- effectuer un commit ou un push sans demande explicite.

---

## 25. Invariants critiques

Pendant tout le MVP 4.0 :

- le MVP 3.1 continue de fonctionner;
- le partage public des articles reste inchangé;
- le téléchargement des infographies autonomes reste inchangé;
- le contrat JSON Articles v1 reste inchangé;
- une réimportation ne supprime pas l’infographie compagnon;
- une réimportation ne supprime pas la couverture;
- une réimportation ne supprime pas les médias internes;
- l’infographie compagnon n’est pas un élément de `media[]`;
- l’infographie compagnon n’est pas une ressource autonome;
- l’infographie compagnon ne possède pas de slug public;
- l’infographie compagnon ne compte pas comme épisode;
- l’absence d’infographie ne bloque jamais l’enregistrement;
- l’absence d’infographie ne bloque jamais automatiquement la publication;
- le catalogue continue d’utiliser la couverture de l’article;
- la page de série continue d’utiliser la couverture de l’article;
- le partage social continue de partager l’URL canonique de l’article;
- Open Graph continue d’utiliser la couverture active;
- le téléchargement récupère l’infographie complète;
- aucun brouillon n’est exposé par le téléchargement;
- aucun chemin de stockage arbitraire n’est accepté;
- seul un administrateur peut modifier l’infographie compagnon;
- seul un administrateur peut générer une couverture;
- une génération échouée ne supprime jamais une couverture valide;
- l’infographie source n’est jamais modifiée par la génération de couverture;
- la génération ne modifie jamais le contenu Markdown;
- la génération ne modifie jamais les sources;
- la génération ne modifie jamais les citations;
- la génération ne modifie jamais le statut;
- l’upload manuel de couverture reste disponible;
- aucune génération d’infographie complète n’est effectuée par le site dans cette phase;
- aucune génération automatique en lot n’est lancée;
- aucune table générique de ressources n’est introduite;
- aucune médiathèque générique n’est créée;
- chaque incrément est validé avant le suivant;
- Christian conserve la décision finale.

---

## 26. Critères de clôture du MVP 4.0

La phase est terminée lorsque Christian peut :

1. ouvrir un article enregistré;
2. ajouter une infographie de synthèse;
3. voir son aperçu administratif;
4. fournir un texte alternatif;
5. remplacer l’infographie;
6. supprimer l’infographie;
7. réimporter le JSON sans perdre l’infographie;
8. publier un article sans infographie;
9. publier un article avec infographie;
10. voir le bloc de synthèse dans la page publique;
11. constater qu’un article sans infographie ne possède pas de bloc vide;
12. agrandir l’infographie;
13. télécharger l’infographie complète;
14. obtenir un fichier correctement nommé;
15. constater que la couverture n’est pas téléchargée par erreur;
16. partager l’article comme auparavant;
17. copier son URL canonique comme auparavant;
18. constater que l’infographie ne devient pas une ressource distincte;
19. constater qu’elle ne compte pas comme épisode de série;
20. générer une couverture à partir de l’infographie;
21. voir la couverture générée dans l’administration;
22. voir la couverture générée dans le catalogue;
23. voir la couverture générée dans l’en-tête public;
24. voir la couverture utilisée pour Open Graph selon le mécanisme existant;
25. régénérer la couverture;
26. conserver l’ancienne couverture lorsqu’une génération échoue;
27. remplacer manuellement une couverture générée;
28. supprimer l’infographie sans supprimer la couverture;
29. constater qu’aucun contenu éditorial n’est modifié par une génération;
30. utiliser le parcours sur ordinateur et mobile;
31. utiliser les actions principales au clavier;
32. vérifier que les brouillons restent invisibles;
33. exécuter le build avec succès;
34. exécuter le lint ciblé avec succès;
35. exécuter les tests ciblés avec succès;
36. valider fonctionnellement et visuellement le résultat réel.

---

## 27. Évolutions volontairement reportées

À réévaluer seulement après utilisation du MVP 4.0 :

- génération automatique de l’infographie depuis l’article;
- bouton `Générer l’infographie` dans l’administration;
- génération d’un plan d’infographie côté serveur;
- validation interactive d’un plan avant génération;
- génération en plusieurs étapes dans l’application;
- régénération automatique lorsque l’article change;
- détection d’une infographie devenue périmée;
- génération automatique de la couverture après upload;
- génération automatique de la couverture après publication;
- plusieurs infographies pour un même article;
- historique de versions d’infographies;
- restauration d’une version précédente;
- plusieurs couvertures candidates;
- comparaison de variantes;
- partage direct du fichier d’infographie avec Web Share;
- page publique indépendante de l’infographie compagnon;
- promotion de l’infographie compagnon comme ressource autonome;
- création automatique d’une infographie Ressources IA à partir de l’asset compagnon;
- compteur de téléchargements;
- analytics détaillés;
- génération multilingue liée;
- traduction automatique de l’infographie;
- téléchargement PDF de l’article et de son infographie;
- médiathèque globale;
- table universelle de contenus;
- pipeline asynchrone de génération;
- éditeur graphique intégré.

Une évolution naturelle après validation du MVP 4.0 serait un **MVP 4.1 — Génération intégrée de l’infographie d’un article**, avec un flux contrôlé :

```text
Article enregistré
→ récupérer le contenu côté serveur
→ préparer un plan d’infographie
→ validation humaine
→ générer l’infographie
→ vérifier
→ conserver ou régénérer
→ générer éventuellement la couverture dérivée
```

La priorité du MVP 4.0 reste toutefois un flux simple et fiable :

```text
Article
→ produire l’infographie
→ l’ajouter à l’article
→ la rendre consultable et téléchargeable
→ générer la couverture depuis cette référence visuelle
```
