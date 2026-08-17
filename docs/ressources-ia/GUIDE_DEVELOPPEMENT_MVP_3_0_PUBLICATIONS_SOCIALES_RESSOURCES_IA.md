# Guide de développement — MVP 3.0 Publications sociales Ressources IA

**Projet :** 5PennyAi
**Section :** Ressources IA
**Évolution :** génération de publications Facebook et LinkedIn
**Date :** 5 août 2026
**Statut :** conception fonctionnelle prête à être inspectée puis implantée par incréments

---

> **État historique.** L’architecture actuelle retire `theme` des ressources ; les
> générateurs actifs utilisent les données éditoriales encore disponibles.

## 1. Rôle du document

Ce guide encadre l’évolution **MVP 3.0** de la section Ressources IA.

Il ajoute une fonction administrative permettant de préparer les textes qui accompagnent le partage d’un article ou d’une infographie sur Facebook et LinkedIn.

Le flux cible est volontairement simple :

```text
Ressource enregistrée
→ générer deux publications courtes
→ vérifier ou modifier les textes
→ copier la publication choisie
→ la coller manuellement sur le réseau social
```

Le MVP 3.0 ne publie rien directement sur Facebook ou LinkedIn. Il ne nécessite aucune connexion OAuth aux plateformes et ne devient pas un calendrier éditorial.

Le guide prolonge les fonctions déjà implantées sans reconstruire :

- l’administration des articles;
- l’administration des infographies;
- les contrats JSON existants;
- les couvertures d’articles;
- les thumbnails d’infographies;
- les pages publiques;
- les métadonnées SEO;
- les séries;
- le catalogue Ressources IA.

L’inspection du dépôt demeure la source de vérité technique. Elle peut ajuster les noms de composants, de routes et de fonctions sans modifier les objectifs fonctionnels du présent guide.

---

## 2. Documents de référence

### Références obligatoires

```text
GUIDE_DEVELOPPEMENT_MVP_3_0_PUBLICATIONS_SOCIALES_RESSOURCES_IA.md
CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md
CONTRAT_JSON_RESSOURCES_IA_V1.md
GUIDE_DEVELOPPEMENT_MVP_2_0_ARTICLES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_1_2_THUMBNAILS_RESSOURCES_IA.md
```

### Références de contexte

```text
REFERENCE_DEVELOPPEMENT_MVP_RESSOURCES_IA_PHASE_1.md
GUIDE_DEVELOPPEMENT_MVP_1_1_RESSOURCES_IA.md
```

### Hiérarchie des responsabilités

- Les contrats JSON définissent les métadonnées éditoriales disponibles.
- Les tables et routes publiques existantes déterminent les URL réelles.
- Les couvertures et thumbnails existants fournissent les images de partage.
- Le serveur construit le contexte de génération à partir des données réelles.
- Le modèle produit uniquement les textes et les hashtags.
- L’application ajoute l’URL canonique et affiche l’aperçu social.
- Christian vérifie, modifie et copie le résultat.

Aucune propriété de publication sociale n’est ajoutée aux contrats JSON dans ce MVP.

---

## 3. Contexte

La section Ressources IA permet maintenant de publier deux formats :

```text
Article
Infographie
```

Chaque format possède déjà :

- des métadonnées éditoriales;
- une route publique;
- un titre et un résumé;
- une image de couverture ou un thumbnail;
- des métadonnées destinées au partage ou au référencement;
- une administration spécialisée.

Pour partager une ressource, Christian doit actuellement rédiger manuellement un texte adapté à chaque plateforme. Cette étape est répétitive, même si les données nécessaires sont déjà présentes dans l’application.

Le MVP 3.0 doit réduire ce travail sans automatiser la publication :

```text
Données existantes de la ressource
→ génération de deux accroches adaptées
→ validation humaine
→ copie manuelle
```

Le besoin concerne d’abord :

- la page Facebook 5PennyAi;
- le profil ou la page LinkedIn utilisée pour diffuser les ressources.

---

## 4. Objectif du MVP 3.0

Permettre à Christian de générer, depuis l’administration d’une ressource :

- une publication Facebook courte;
- une publication LinkedIn courte;
- des émojis appropriés au sujet;
- quelques hashtags pertinents;
- un texte prêt à être copié avec l’URL publique correcte.

À la fin du MVP, Christian doit pouvoir :

1. ouvrir un article ou une infographie enregistrée;
2. lancer la génération des publications sociales;
3. obtenir deux textes réellement distincts;
4. voir l’image qui devrait accompagner le lien;
5. voir l’URL publique qui sera copiée;
6. modifier librement chaque texte;
7. copier la publication Facebook complète;
8. copier la publication LinkedIn complète;
9. régénérer une seule plateforme lorsque nécessaire;
10. conserver les textes déjà présents lorsqu’une régénération échoue;
11. constater que la fonction ne publie rien automatiquement;
12. continuer à utiliser les workflows actuels de publication des ressources.

Principe central :

> Une publication sociale 5PennyAi attire vers la ressource; elle ne reproduit pas son contenu.

---

## 5. Principes directeurs

### 5.1 Une accroche, pas un résumé

La publication doit :

```text
attirer l’attention
→ soulever une question ou une idée
→ donner une raison de consulter la ressource
→ diriger vers le lien
```

Elle ne doit pas :

- résumer toutes les sections;
- expliquer le concept en détail;
- dévoiler toute la conclusion;
- recopier les objectifs d’apprentissage;
- reproduire les points essentiels de l’infographie;
- remplacer la lecture de l’article;
- remplacer la consultation de l’infographie.

Le générateur choisit une seule idée, distinction ou question comme point d’entrée.

### 5.2 Publications brèves

Les textes doivent rester suffisamment courts pour être lus rapidement dans un fil social.

Les longueurs sont calculées sans l’URL et sans les hashtags.

```text
Facebook : 150 à 350 caractères
LinkedIn : 200 à 450 caractères
```

Ces cibles sont éditoriales. Elles guident la génération et l’interface, mais ne bloquent pas Christian lorsqu’il modifie manuellement le texte.

Plafonds de sécurité recommandés pour la sortie générée :

```text
Facebook : 450 caractères
LinkedIn : 550 caractères
```

Si le modèle dépasse un plafond, le serveur peut effectuer une seule tentative de correction ciblée. Si le résultat demeure trop long, l’interface le présente avec un avertissement plutôt que de perdre toute la génération.

### 5.3 Émojis appropriés

Chaque publication générée doit normalement contenir entre **un et trois émojis**.

Les émojis doivent :

- soutenir le sens;
- correspondre au sujet;
- aider à structurer visuellement le texte;
- conserver un ton professionnel et accessible.

Ils ne doivent pas :

- former une longue séquence décorative;
- remplacer des mots techniques;
- rendre le ton enfantin;
- donner une impression de publicité agressive;
- être identiques dans toutes les publications.

Exemples utiles selon le contexte :

```text
🤖 intelligence artificielle
🧠 apprentissage, modèles ou raisonnement
🧩 composants, relations ou concepts
🔎 recherche, découverte ou explication
📚 article ou apprentissage
📊 infographie, données ou comparaison
⚙️ fonctionnement technique
💡 idée ou distinction importante
🚀 évolution ou changement
⚠️ risque, limite ou vigilance
🔗 lien vers la ressource
👇 invitation à consulter
```

Le générateur peut utiliser d’autres émojis pertinents. Il ne doit pas ajouter systématiquement `🤖` à tous les sujets liés à l’IA.

### 5.4 Plateformes distinctes

Facebook et LinkedIn ne doivent pas recevoir le même texte avec seulement un mot changé.

La différence porte notamment sur :

- le ton;
- la formulation de l’accroche;
- la mise en contexte;
- l’appel à l’action;
- les hashtags;
- les émojis choisis.

Les deux versions restent cependant brèves.

### 5.5 Contrôle humain

Les textes générés sont toujours :

- visibles;
- modifiables;
- copiés seulement après une action de Christian;
- sans effet sur le contenu de la ressource;
- sans effet sur son statut de publication.

### 5.6 Le serveur est la source de vérité

Le client envoie uniquement :

```text
resourceType
resourceId
platform facultative lors d’une régénération
```

Le serveur récupère lui-même :

- le titre;
- le résumé;
- les métadonnées pédagogiques utiles;
- le contenu éditorial nécessaire;
- le slug réel;
- le statut;
- la route publique;
- l’image sociale active.

Le client ne transmet jamais :

- un prompt libre;
- un titre arbitraire;
- un résumé temporaire;
- une URL construite manuellement;
- un chemin de stockage;
- un modèle;
- une clé de fournisseur.

### 5.7 Aucune recherche Web

La génération utilise uniquement le contenu de la ressource.

Elle ne doit pas :

- rechercher des informations supplémentaires;
- actualiser le sujet;
- ajouter un événement récent;
- ajouter une statistique externe;
- enrichir la publication avec un fait non présent dans la ressource.

### 5.8 Aucun nouveau système de médias

L’image accompagnant le partage existe déjà :

```text
Article
→ couverture de l’article

Infographie
→ thumbnail individuel

Asset absent
→ image sociale par défaut de 5PennyAi
```

Le MVP 3.0 ne génère aucune nouvelle image.

---

## 6. Libellés et emplacement dans l’administration

### 6.1 Bouton principal

Libellé recommandé :

```text
Générer les publications sociales
```

Ce libellé est préférable à `Générer médias sociaux`, qui pourrait être interprété comme une fonction de création d’images.

### 6.2 Emplacement

Ajouter une section spécialisée dans les formulaires administratifs :

- d’un article;
- d’une infographie.

Emplacement recommandé près des actions de publication :

```text
Publication
├── Statut et slug
├── Aperçu public
├── Publications sociales
└── Actions de publication
```

L’inspection peut retenir un panneau repliable, une fenêtre modale ou une section intégrée selon les composants existants.

### 6.3 États du bouton

```text
Ressource non enregistrée
→ bouton désactivé

Ressource enregistrée sans slug exploitable
→ bouton désactivé avec explication

Ressource enregistrée avec slug
→ génération disponible

Génération en cours
→ action concernée désactivée

Erreur
→ textes précédents conservés
```

---

## 7. Expérience administrative cible

## 7.1 Aperçu de partage

Le panneau affiche d’abord :

- l’image sociale retenue;
- le type de ressource;
- le titre;
- l’URL publique absolue;
- le statut de la ressource.

Exemple conceptuel :

```text
[Couverture ou thumbnail 16:9]

Article
Qu’est-ce qu’un modèle de fondation?
https://www.5pennyai.com/ressources-ia/articles/...
```

Cet aperçu confirme les données utilisées. Il ne doit pas tenter de reproduire exactement l’interface visuelle de Facebook ou de LinkedIn.

## 7.2 Section Facebook

Afficher :

- libellé `Facebook`;
- zone de texte modifiable;
- compteur de caractères du corps;
- hashtags modifiables ou intégrés à la zone de texte;
- bouton `Copier la publication`;
- bouton `Régénérer Facebook`;
- message de succès après copie;
- avertissement si la longueur dépasse la cible.

## 7.3 Section LinkedIn

Afficher les mêmes fonctions avec :

- libellé `LinkedIn`;
- bouton `Régénérer LinkedIn`;
- cible de longueur propre à LinkedIn.

## 7.4 Assemblage lors de la copie

L’application assemble la publication au moment de la copie :

```text
corps modifiable

URL publique absolue

hashtags
```

Le modèle ne génère jamais l’URL.

Exemple :

```text
🧩 Un même socle peut-il vraiment alimenter plusieurs applications d’IA?

Cette ressource propose une explication simple pour mieux comprendre le rôle des modèles de fondation. 👇

https://www.5pennyai.com/ressources-ia/articles/...

#IntelligenceArtificielle #IAGenerative
```

## 7.5 Comportement des brouillons

Une ressource enregistrée en brouillon peut servir à préparer les textes si son slug permet de déterminer l’URL future.

Afficher clairement :

> Cette ressource n’est pas encore publique. Le lien fonctionnera après sa publication.

L’interface peut permettre la copie afin que Christian prépare sa publication ailleurs, mais elle ne doit jamais laisser croire que le lien est déjà accessible.

Si l’inspection montre que le slug n’est pas suffisamment stable avant publication, limiter la génération aux ressources publiées dans la première version.

---

## 8. Ligne éditoriale commune

Le générateur doit produire un texte :

- clair;
- bref;
- pédagogique;
- naturel;
- accessible;
- fidèle au niveau de la ressource;
- non promotionnel;
- sans sensationnalisme.

Il doit :

- choisir une seule question ou idée;
- conserver une part de curiosité;
- indiquer le bénéfice de consulter la ressource;
- nommer correctement le format : `article` ou `infographie`;
- employer la langue réelle de la ressource;
- utiliser un appel à l’action sobre;
- intégrer naturellement un à trois émojis;
- proposer peu de hashtags et éviter leur répétition artificielle.

Il ne doit pas :

- écrire un mini-article;
- utiliser une liste à puces;
- multiplier les paragraphes explicatifs;
- dévoiler la réponse complète;
- recopier le `takeaway` mot pour mot;
- reprendre tous les `keyPoints`;
- écrire « Dans cet article, vous apprendrez » suivi d’une liste;
- employer `révolutionnaire`, `ultime`, `incontournable` ou des superlatifs semblables;
- annoncer que la ressource est nouvelle sans donnée ou instruction explicite;
- citer directement les documents sources;
- inclure les marqueurs de citations;
- inclure une source ou une URL autre que le lien ajouté par l’application;
- inventer une statistique, un exemple ou une promesse.

Consigne centrale du prompt :

```text
La publication n’est pas un résumé de la ressource.

Son objectif est de susciter l’intérêt, de présenter brièvement la question traitée et d’inciter le lecteur à ouvrir le lien.

Choisis une seule idée, distinction ou question comme accroche. Ne reproduis pas les explications, les étapes, les objectifs d’apprentissage ou la conclusion complète de la ressource.

Utilise naturellement de un à trois émojis directement liés au sujet.
```

---

## 9. Profil Facebook

### 9.1 Rôle

La publication Facebook doit être accueillante, facile à parcourir et adaptée à un public qui souhaite découvrir ou mieux comprendre un sujet lié à l’IA.

### 9.2 Style attendu

- ton chaleureux et naturel;
- accroche immédiate;
- question ou constat simple;
- une phrase indiquant l’intérêt de la ressource;
- appel à consulter l’article ou l’infographie;
- un à trois émojis;
- deux ou trois hashtags au maximum.

### 9.3 Longueur

```text
Cible : 150 à 350 caractères
Plafond généré recommandé : 450 caractères
```

L’URL et les hashtags ne sont pas comptés.

### 9.4 Structure indicative

```text
[Émoji] Question ou accroche courte.

Une phrase présentant l’intérêt de la ressource. [Émoji facultatif]

L’application ajoute ensuite l’URL et les hashtags.
```

La structure est indicative. Le modèle peut varier la disposition tout en respectant la brièveté.

---

## 10. Profil LinkedIn

### 10.1 Rôle

La publication LinkedIn doit adopter un ton professionnel et pédagogique sans devenir une publication longue ou une analyse autonome.

### 10.2 Style attendu

- formulation professionnelle, mais directe;
- question, distinction ou constat pertinent;
- une phrase expliquant pourquoi le sujet mérite d’être compris;
- invitation sobre à consulter la ressource;
- un à trois émojis;
- deux à quatre hashtags au maximum;
- aucun mini-article.

### 10.3 Longueur

```text
Cible : 200 à 450 caractères
Plafond généré recommandé : 550 caractères
```

L’URL et les hashtags ne sont pas comptés.

### 10.4 Structure indicative

```text
[Émoji] Question ou constat professionnel.

Une phrase présentant l’angle ou l’intérêt de la ressource. [Émoji facultatif]

L’application ajoute ensuite l’URL et les hashtags.
```

La version LinkedIn peut être légèrement plus contextuelle que Facebook, mais elle doit rester brève.

---

## 11. Données utilisées pour la génération

Le serveur doit construire un petit modèle éditorial commun sans créer une table générique `resources`.

Forme conceptuelle :

```text
id
resourceType
language
title
subtitle
summary
theme
level
seriesName
episodeNumber
mainIdea
supportingContext
status
slug
publicUrl
socialImageUrl
```

Ce modèle existe uniquement dans la couche serveur de génération ou dans un adaptateur partagé.

## 11.1 Article

Données utiles :

```text
title
subtitle
summary
theme
level
series.name
series.episodeNumber
learningObjectives
takeaway
contentMarkdown
language
slug
status
coverPath
```

Le contexte transmis au modèle doit privilégier :

- le titre;
- le sous-titre;
- le résumé;
- le message à retenir;
- quelques objectifs utiles;
- un extrait nettoyé du contenu si nécessaire.

Le serveur doit retirer :

- `{{cite:...}}`;
- `{{media:...}}`;
- les sources complètes;
- les URL de sources;
- les briefs de génération d’images;
- les chemins de stockage;
- les données SEO inutiles;
- les propriétés administratives.

Le Markdown complet ne doit être envoyé que si l’inspection démontre qu’il est nécessaire. Une version nettoyée et limitée est préférable.

## 11.2 Infographie

Données utiles :

```text
title
subtitle
summary
introduction
theme
level
series.name
series.episodeNumber
keyPoints
takeaway
keywords
language
slug
status
thumbnailPath
```

Le modèle ne doit pas analyser l’image ni effectuer d’OCR. Les métadonnées structurées fournissent le contexte éditorial.

## 11.3 Données exclues

Ne pas transmettre au modèle :

- identifiants techniques non nécessaires;
- chemins Supabase;
- URL signées;
- contenu des sources;
- informations d’authentification;
- statut administratif autre que le contexte utile;
- données personnelles;
- prompts de création d’images;
- propriétés inconnues importées.

---

## 12. Contrat de l’endpoint

Forme recommandée :

```text
POST /api/generate-social-posts
```

### 12.1 Génération initiale

Entrée :

```json
{
  "resourceType": "article",
  "resourceId": "uuid"
}
```

ou :

```json
{
  "resourceType": "infographic",
  "resourceId": "uuid"
}
```

La génération initiale retourne les deux plateformes dans un seul appel afin de réduire la latence et le coût.

### 12.2 Régénération d’une plateforme

Entrée possible :

```json
{
  "resourceType": "article",
  "resourceId": "uuid",
  "platform": "facebook"
}
```

Valeurs permises :

```text
facebook
linkedin
```

### 12.3 Sortie stricte

```json
{
  "schemaVersion": 1,
  "resourceType": "article",
  "resourceId": "uuid",
  "language": "fr",
  "facebook": {
    "body": "Texte bref contenant les émojis appropriés.",
    "hashtags": [
      "#IntelligenceArtificielle",
      "#IAGenerative"
    ]
  },
  "linkedin": {
    "body": "Texte LinkedIn bref et distinct.",
    "hashtags": [
      "#IntelligenceArtificielle",
      "#IAGenerative",
      "#TransformationNumerique"
    ]
  }
}
```

Lors d’une régénération ciblée, la réponse peut contenir seulement la plateforme demandée si cela simplifie le contrat sans rendre le frontend ambigu.

### 12.4 Données que le modèle ne produit pas

Le modèle ne produit jamais :

- `publicUrl`;
- `socialImageUrl`;
- un chemin de stockage;
- un statut;
- une date de publication;
- du HTML;
- une image;
- une action de publication;
- une programmation de publication.

L’application ajoute l’URL réelle au moment de la copie.

---

## 13. Skill serveur

Nom fonctionnel recommandé :

```text
social-post-generator-v1
```

Versions proposées :

```text
social-post-style-v1
facebook-post-profile-v1
linkedin-post-profile-v1
```

La skill orchestre :

1. l’authentification;
2. la validation de l’entrée;
3. la récupération de la ressource;
4. l’adaptation de ses données;
5. la résolution de son URL publique;
6. la résolution de son image sociale;
7. la construction du prompt;
8. l’appel au modèle textuel;
9. la validation du JSON retourné;
10. la validation des longueurs;
11. la normalisation des hashtags;
12. le retour des données à l’administration.

### 13.1 Assemblage du prompt

Ordre recommandé :

```text
1. rôle éditorial 5PennyAi
2. règle « accroche, pas résumé »
3. contraintes de brièveté
4. politique des émojis
5. profil Facebook
6. profil LinkedIn
7. contexte éditorial contrôlé
8. schéma JSON de sortie
```

### 13.2 Modèle textuel

Réutiliser un client et un modèle textuel déjà présents dans le projet lorsque cela est compatible avec :

- une sortie JSON structurée;
- le français;
- les limites de coût;
- les fonctions serverless actuelles;
- les conventions de sécurité du dépôt.

Le choix final doit être confirmé pendant l’inspection. Aucun sélecteur de modèle n’est ajouté dans l’interface.

### 13.3 Validation de la sortie

Vérifier au minimum :

- JSON lisible;
- plateformes attendues présentes;
- `body` non vide;
- hashtags sous forme de tableau;
- nombre raisonnable de hashtags;
- absence d’URL dans le corps généré;
- absence de Markdown complexe;
- longueurs sous les plafonds après une éventuelle correction;
- langue cohérente avec la ressource.

Ne pas introduire une validation complexe ou fragile des émojis. La présence et la pertinence des émojis sont surtout protégées par le prompt, les essais réels et le contrôle humain.

---

## 14. URL publique et image sociale

La génération du texte n’est utile que si le lien produit un aperçu social fiable.

Chaque page publique doit fournir au minimum :

```text
og:title
og:description
og:url
og:type
og:image
```

Ajouter lorsque possible :

```text
og:image:width
og:image:height
og:image:type
```

## 14.1 Article

Priorité :

```text
couverture de l’article
→ image sociale par défaut
```

La couverture sert déjà à la carte et à l’en-tête. Le MVP 3.0 ne crée pas une image sociale distincte.

## 14.2 Infographie

Priorité :

```text
thumbnail individuel
→ image sociale par défaut
```

Lorsque le thumbnail existe, il doit être préféré à l’infographie verticale complète, car il est conçu comme une couverture horizontale lisible.

## 14.3 Stabilité de l’image

L’inspection doit vérifier que l’URL de l’image :

- est absolue;
- est accessible sans connexion;
- peut être chargée par les robots sociaux;
- ne dépend pas d’une session administrateur;
- reste valide suffisamment longtemps;
- ne devient pas inutilisable après l’expiration d’une URL signée;
- correspond uniquement à une ressource publiée lorsque l’accès public l’exige.

Si les assets sont privés et servis par des URL temporaires, l’incrément 1 doit retenir la solution minimale compatible avec l’architecture réelle, par exemple :

- une route publique contrôlée qui sert l’image d’une ressource publiée;
- un mécanisme de proxy ou de redirection stable;
- un emplacement public spécialisé pour les couvertures destinées au partage.

Ne pas rendre tous les médias internes publics uniquement pour résoudre l’image sociale.

## 14.4 URL canonique

L’URL copiée doit :

- être absolue;
- utiliser le domaine canonique du site;
- provenir des helpers ou conventions de routes existants;
- correspondre au slug réel;
- ne jamais être inventée par le modèle;
- ne pas contenir de paramètre administratif ou temporaire.

---

## 15. Persistance des textes

### Décision recommandée pour le MVP

Ne pas enregistrer les publications sociales en base de données.

Le flux initial reste :

```text
générer
→ vérifier
→ modifier
→ copier
```

Les textes sont conservés dans l’état du composant tant que Christian reste dans l’écran concerné.

Cette décision évite :

- une migration;
- des colonnes dupliquées dans deux tables;
- une table polymorphe;
- un historique prématuré;
- des textes enregistrés devenant périmés après une modification de la ressource;
- un nouveau workflow de validation.

### Évolution possible

À réévaluer après utilisation réelle :

- sauvegarde de la dernière version;
- historique des générations;
- version modifiée manuellement;
- date de génération;
- version du prompt;
- état `préparée`, `publiée` ou autre.

Aucune de ces fonctions n’est nécessaire pour valider le besoin actuel.

---

## 16. Sécurité, confidentialité et coûts

Règles minimales :

- endpoint réservé à l’administrateur autorisé;
- clé du fournisseur uniquement côté serveur;
- récupération de la ressource côté serveur;
- aucune confiance accordée aux champs éditoriaux envoyés par le client;
- contexte limité aux données nécessaires;
- aucun contenu complet journalisé;
- aucune source ou URL externe transmise inutilement;
- aucune image encodée envoyée au modèle;
- une seule génération initiale pour les deux plateformes;
- prévention des doubles clics;
- régénération ciblée d’une plateforme;
- aucun appel Web additionnel;
- aucune publication automatique.

Journalisation minimale :

```text
resourceType
resourceId
platform ou génération complète
modèle utilisé
version du prompt
succès ou échec
étape de l’échec
durée générale si disponible
```

Ne pas journaliser :

- le texte complet de l’article;
- le texte complet de l’infographie;
- la sortie complète si elle contient du contenu éditorial inutile au diagnostic;
- les secrets;
- les clés;
- les données personnelles.

---

## 17. Gestion des erreurs

### Utilisateur non autorisé

- aucune génération;
- aucune donnée retournée;
- message administratif générique;
- aucun détail sensible.

### Ressource inexistante

- aucune génération;
- aucune ressource créée implicitement;
- message clair.

### Ressource non enregistrée

- bouton désactivé;
- instruction d’enregistrer d’abord.

### Slug absent ou inutilisable

- génération ou copie désactivée selon la décision issue de l’inspection;
- aucune URL approximative inventée.

### Ressource en brouillon

- génération possible seulement si le futur lien peut être déterminé de façon fiable;
- avertissement visible;
- aucun accès public rendu disponible par cette fonction.

### Contexte éditorial insuffisant

Si le titre et les données principales sont absents :

- refuser la génération ou produire un message clair;
- ne pas inventer le sujet;
- conserver l’édition manuelle du formulaire.

### Erreur du modèle

- textes précédents conservés;
- nouvelle tentative possible;
- autres fonctions du formulaire disponibles;
- aucun changement de statut.

### Réponse JSON invalide

- résultat rejeté;
- aucun texte partiel appliqué silencieusement;
- une seule nouvelle tentative technique peut être effectuée;
- message contrôlé si la correction échoue.

### Texte trop long

- effectuer au maximum une correction ciblée;
- conserver le résultat avec avertissement si la correction échoue;
- permettre la modification et la copie manuelles.

### Copie refusée par le navigateur

- conserver le texte affiché;
- sélectionner le contenu lorsque possible;
- indiquer comment le copier manuellement;
- ne pas régénérer le texte.

### Image sociale absente

- utiliser le fallback;
- ne pas bloquer la génération du texte;
- signaler le fallback dans l’aperçu administratif si utile.

---

# 18. Découpage du développement

Le MVP 3.0 est découpé en **quatre incréments fonctionnels**, précédés d’une inspection ciblée.

```text
Inspection
→ fiabilité du partage public
→ génération serveur
→ interface de copie
→ validation et finalisation
```

---

## Incrément 0 — Inspection ciblée

### Objectif

Confirmer l’architecture réelle et le chemin minimal avant toute modification.

### Documents à lire

```text
GUIDE_DEVELOPPEMENT_MVP_3_0_PUBLICATIONS_SOCIALES_RESSOURCES_IA.md
CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md
CONTRAT_JSON_RESSOURCES_IA_V1.md
GUIDE_DEVELOPPEMENT_MVP_2_0_ARTICLES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_1_2_THUMBNAILS_RESSOURCES_IA.md
```

### À inspecter

- état Git, branche, remotes et derniers commits;
- formulaires administratifs des articles et infographies;
- actions de publication existantes;
- composants réutilisables de panneaux ou fenêtres;
- gestion actuelle du presse-papiers;
- structure réelle de `articles`;
- structure réelle de `infographics`;
- routes publiques des deux formats;
- helpers de construction des URL;
- slugs avant et après publication;
- métadonnées Open Graph actuelles;
- résolution des couvertures d’articles;
- résolution des thumbnails d’infographies;
- comportement des fallbacks;
- caractère public ou privé des buckets;
- durée des URL signées;
- capacité des robots sociaux à accéder aux images;
- fonctions serverless existantes;
- authentification administrative;
- clients de modèles textuels disponibles;
- possibilités de sortie JSON structurée;
- conventions de gestion des erreurs;
- traductions FR et EN;
- tests existants;
- scripts de build et de lint.

### Questions à résoudre

1. Où placer le bouton dans les deux formulaires?
2. Quel composant partagé peut présenter les deux plateformes?
3. Peut-on créer un adaptateur commun sans table générique?
4. Quel modèle textuel existant convient le mieux?
5. Quel endpoint et quel schéma de validation utiliser?
6. Les URLs publiques peuvent-elles être déterminées pour les brouillons?
7. Les images Open Graph utilisent-elles des URLs durables?
8. Les robots Facebook et LinkedIn peuvent-ils charger les images?
9. Une correction de métadonnées sociales est-elle nécessaire avant la génération?
10. Une migration est-elle réellement nécessaire?
11. Quels tests protègent déjà les métadonnées de page?
12. Comment conserver les textes dans l’état du formulaire sans persistance?

### Décisions attendues

Le rapport doit préciser :

- état réel des deux workflows;
- fichiers exacts à modifier;
- composant administratif retenu;
- endpoint retenu;
- modèle et client retenus;
- contrat d’entrée et de sortie;
- stratégie de slug pour les brouillons;
- stratégie d’image sociale stable;
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
- les URLs et images sociales sont comprises;
- les points de réutilisation sont identifiés;
- le périmètre de l’incrément 1 est précis;
- aucune intégration directe aux réseaux sociaux n’est proposée;
- aucune persistance prématurée n’est proposée.

---

## Incrément 1 — Fiabilisation de l’aperçu social public

### Objectif

Garantir qu’un lien public d’article ou d’infographie fournit une image, un titre et une description utilisables par les plateformes sociales.

### Inclus

- inspection et correction des métadonnées Open Graph;
- URL canonique absolue;
- image sociale absolue;
- couverture d’article prioritaire;
- thumbnail d’infographie prioritaire;
- fallback social 5PennyAi;
- titre avec fallback;
- description avec fallback;
- dimensions et type d’image lorsque disponibles;
- exclusion des brouillons et ressources retirées;
- stratégie stable pour les assets privés;
- tests ciblés;
- vérification manuelle sur plusieurs pages publiées.

### Résultat visible

> Une page publiée expose les métadonnées nécessaires pour que son lien puisse afficher la bonne image, le bon titre et la bonne description sur un réseau social.

### Hors périmètre

- génération de texte;
- bouton administratif;
- publication directe;
- génération d’une nouvelle image;
- modification des contrats JSON.

### Critères d’acceptation

- l’URL de page est absolue et canonique;
- l’image est accessible sans session;
- l’image reste disponible assez longtemps pour les robots sociaux;
- un article utilise sa couverture lorsqu’elle existe;
- une infographie utilise son thumbnail lorsqu’il existe;
- un asset absent utilise le fallback;
- un brouillon ne devient pas public;
- aucune donnée administrative n’est exposée;
- le build et les tests ciblés réussissent.

### Vérification manuelle

Tester au minimum :

- un article avec couverture;
- un article sans couverture;
- une infographie avec thumbnail;
- une infographie sans thumbnail;
- une URL inconnue;
- une ressource en brouillon.

Utiliser les outils de diagnostic des plateformes seulement si cela fait partie du scénario manuel disponible. Ne pas automatiser une dépendance externe dans les tests du dépôt.

---

## Incrément 2 — Générateur serveur commun

### Objectif

Générer des publications Facebook et LinkedIn brèves à partir d’un article ou d’une infographie réelle.

### Inclus

- module `social-post-generator-v1`;
- profil Facebook;
- profil LinkedIn;
- règle centrale « accroche, pas résumé »;
- règles de longueur;
- politique des émojis;
- adaptateur pour les articles;
- adaptateur pour les infographies;
- endpoint authentifié;
- récupération serveur de la ressource;
- nettoyage des marqueurs techniques;
- limitation du contexte;
- appel à un modèle textuel;
- sortie JSON stricte;
- validation et normalisation;
- régénération ciblée d’une plateforme;
- journalisation minimale;
- gestion des erreurs;
- tests sans appel réel au modèle;
- essais réels contrôlés sur quelques ressources.

### Résultat visible

> L’endpoint retourne deux publications courtes, distinctes, fidèles et accompagnées d’émojis appropriés pour un article ou une infographie.

### Hors périmètre

- interface finale;
- publication directe;
- connexion OAuth;
- persistance des textes;
- plusieurs variantes;
- recherche Web;
- génération d’image;
- calendrier éditorial;
- analytics sociaux.

### Critères d’acceptation fonctionnels

- l’endpoint refuse un utilisateur non autorisé;
- `resourceType` accepte seulement les valeurs prévues;
- la ressource est récupérée côté serveur;
- aucun prompt libre n’est accepté;
- l’URL n’est pas produite par le modèle;
- Facebook et LinkedIn sont distincts;
- chaque texte reste bref;
- chaque texte contient normalement un à trois émojis appropriés;
- les hashtags restent peu nombreux;
- aucune information absente n’est volontairement ajoutée;
- les marqueurs techniques ne sont pas reproduits;
- une réponse invalide ne remplace pas un résultat valide;
- la génération ne modifie ni le contenu ni le statut de la ressource.

### Critères d’acceptation éditoriaux

Tester au minimum :

- un article débutant;
- un article plus technique;
- une infographie conceptuelle;
- une infographie de comparaison;
- une ressource en série;
- une ressource indépendante.

Vérifier :

- l’accroche donne envie de cliquer;
- le texte ne remplace pas la ressource;
- une seule idée centrale est utilisée;
- les émojis soutiennent le sens;
- le ton reste 5PennyAi;
- aucune formulation sensationnaliste;
- aucune liste de contenu;
- aucun détail inventé.

### Tests ciblés recommandés

- type de ressource inconnu;
- ressource inexistante;
- utilisateur non autorisé;
- article minimal;
- infographie minimale;
- suppression des marqueurs;
- limitation du contexte;
- JSON invalide retourné par le modèle;
- plateforme ciblée inconnue;
- dépassement de longueur;
- hashtags trop nombreux;
- corps contenant une URL;
- conservation d’un résultat existant après erreur.

---

## Incrément 3 — Interface administrative et copie

### Objectif

Permettre à Christian de générer, modifier et copier les publications depuis les formulaires existants.

### Inclus

- bouton `Générer les publications sociales`;
- composant partagé articles/infographies;
- aperçu de l’image sociale;
- titre et URL publique;
- statut de la ressource;
- zone Facebook modifiable;
- zone LinkedIn modifiable;
- compteurs de caractères;
- indication des cibles de longueur;
- boutons de copie;
- boutons de régénération ciblée;
- état de génération initiale;
- états de génération indépendants par plateforme;
- succès et erreurs;
- conservation des textes en mémoire pendant la session d’édition;
- avertissement pour les brouillons;
- fallback de copie manuelle;
- traductions FR et EN;
- responsive;
- accessibilité clavier;
- tests ciblés.

### Résultat visible

> Christian ouvre une ressource, génère deux publications, ajuste leur contenu et copie chacune d’elles avec l’URL publique correcte.

### Hors périmètre

- sauvegarde en base;
- historique;
- publication automatique;
- programmation;
- bouton de partage dans la page publique;
- intégration à d’autres plateformes;
- génération de variantes multiples.

### Critères d’acceptation

- le bouton est disponible seulement pour une ressource enregistrée et exploitable;
- le panneau montre l’image réellement utilisée pour le partage;
- l’URL affichée est absolue;
- les deux textes sont modifiables;
- modifier Facebook ne change pas LinkedIn;
- régénérer Facebook ne remplace pas LinkedIn;
- la copie inclut le corps, l’URL et les hashtags;
- la copie n’inclut aucune donnée administrative;
- les compteurs excluent l’URL et les hashtags selon la convention retenue;
- un texte hors cible produit un avertissement non bloquant;
- une erreur conserve les textes présents;
- un brouillon affiche un avertissement clair;
- aucun changement de statut n’est effectué;
- le parcours fonctionne à 1440, 768 et environ 390 px;
- le build et les tests ciblés réussissent.

### Tests ciblés recommandés

- état sans génération;
- génération réussie;
- génération partielle;
- erreur initiale;
- erreur de régénération Facebook;
- erreur de régénération LinkedIn;
- modification manuelle;
- assemblage de la copie;
- presse-papiers indisponible;
- compteur de caractères;
- brouillon;
- slug absent;
- image fallback;
- navigation clavier.

---

## Incrément 4 — Validation éditoriale, robustesse et finalisation

### Objectif

Valider le résultat sur des ressources réelles et corriger uniquement les problèmes révélés par l’utilisation.

### Banc d’essai minimal

Tester :

- deux articles débutants;
- un article intermédiaire ou avancé;
- deux infographies;
- une ressource appartenant à une série;
- une ressource sans série;
- une ressource sans image dédiée;
- une ressource en brouillon.

Cela produit au minimum :

```text
8 ressources
× 2 plateformes
= 16 publications à évaluer
```

### Grille d’évaluation

Noter chaque publication de 1 à 5.

| Critère | Question |
|---|---|
| Brièveté | Le texte se lit-il rapidement? |
| Curiosité | Donne-t-il envie d’ouvrir la ressource? |
| Fidélité | Représente-t-il correctement le sujet? |
| Non-résumé | Évite-t-il de reproduire le contenu? |
| Ton | Correspond-il à 5PennyAi et à la plateforme? |
| Émojis | Sont-ils pertinents, naturels et peu nombreux? |
| Appel à l’action | L’invitation à consulter est-elle claire? |
| Différenciation | Facebook et LinkedIn sont-ils réellement distincts? |
| Hashtags | Sont-ils pertinents et limités? |
| Aperçu | L’image et l’URL correspondent-elles à la ressource? |

Score maximal :

```text
50
```

Seuil recommandé :

```text
40/50
```

Le jugement éditorial de Christian reste prioritaire.

### Problèmes éliminatoires

- fait inventé;
- promesse absente de la ressource;
- texte qui résume presque tout le contenu;
- URL incorrecte;
- image associée à une autre ressource;
- publication très longue;
- émojis sans rapport ou envahissants;
- ton publicitaire ou sensationnaliste;
- source ou citation technique visible;
- marqueur `{{cite:...}}` ou `{{media:...}}` visible;
- texte Facebook et LinkedIn pratiquement identique;
- publication automatique déclenchée;
- exposition d’un brouillon.

### Finalisation incluse

- ajustements limités du prompt;
- ajustements limités des longueurs si les essais le justifient;
- amélioration de la variété des émojis;
- amélioration des hashtags;
- correction des métadonnées sociales restantes;
- validation des erreurs;
- validation du presse-papiers;
- build;
- lint ciblé;
- tests ciblés;
- documentation des limites connues;
- vérification de l’état Git.

### Résultat visible

> Les articles et infographies peuvent être accompagnés rapidement de publications Facebook et LinkedIn brèves, attrayantes et prêtes à copier.

### Hors périmètre

- nouvelle version majeure du style sans décision explicite;
- stockage des publications;
- intégration directe aux plateformes;
- ajout de nouvelles plateformes;
- statistiques sociales;
- calendrier éditorial;
- génération automatique lors de la publication.

### Critères d’acceptation

- les publications retenues atteignent généralement le seuil recommandé;
- les textes sont courts;
- une seule idée est mise de l’avant;
- les émojis sont appropriés;
- les plateformes sont distinctes;
- les aperçus utilisent la bonne image;
- les URLs sont correctes;
- les erreurs ne détruisent pas les textes existants;
- le parcours fonctionne sur ordinateur et mobile;
- le build, le lint ciblé et les tests réussissent;
- Christian valide le résultat réel.

---

## 19. Tableau de progression

| Incrément | Résultat fonctionnel | État | Commit |
|---|---|---|---|
| 0 | Inspection de l’architecture et du partage social | Accepté | — |
| 1 | Métadonnées et images sociales fiables | Accepté | `feat(resources): add social metadata for infographics` |
| 2 | Génération serveur Facebook et LinkedIn | Accepté | `feat(resources): add social post generator` |
| 3 | Interface de modification et copie | À faire | — |
| 4 | Validation éditoriale et finalisation | À faire | — |

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
4. l’incrément unique à réaliser;
5. les fichiers ou zones à inspecter;
6. les éléments inclus;
7. les éléments hors périmètre;
8. les invariants éditoriaux;
9. les invariants de sécurité;
10. les invariants de données et d’URL;
11. les validations techniques;
12. les appels réels au modèle permis ou interdits;
13. le scénario manuel à vérifier;
14. le rapport final attendu;
15. l’interdiction de commit ou push sauf demande explicite.

Le rapport final doit contenir :

- résultat obtenu;
- décisions techniques;
- fichiers créés ou modifiés;
- migrations éventuelles;
- endpoint et contrat d’entrée;
- prompt et versions utilisés;
- données envoyées au modèle;
- URL et image sociale;
- sécurité et authentification;
- comportement des brouillons;
- gestion des erreurs;
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
- modifier les contrats JSON;
- ajouter une publication automatique;
- connecter Facebook ou LinkedIn;
- créer un calendrier éditorial;
- enregistrer les textes sans demande explicite;
- ajouter une plateforme supplémentaire;
- lancer une recherche Web depuis le générateur;
- créer une table générique `resources`;
- créer une abstraction sociale générique disproportionnée;
- refactoriser des zones étrangères;
- ajouter une dépendance majeure sans justification issue de l’inspection;
- effectuer un commit ou un push sans demande explicite.

---

## 21. Invariants critiques

Pendant tout le MVP 3.0 :

- les articles et infographies restent des formats spécialisés;
- aucune table générique `resources` n’est créée;
- les contrats JSON restent inchangés;
- le contenu existant demeure la source de vérité;
- le modèle ne reçoit pas un prompt libre du client;
- le modèle ne génère jamais l’URL;
- le modèle ne génère aucune image;
- la fonction ne publie jamais sur un réseau social;
- la fonction ne programme jamais une publication;
- la fonction ne modifie jamais le statut de la ressource;
- la fonction ne modifie jamais le contenu de la ressource;
- les brouillons restent invisibles publiquement;
- les publications sont brèves;
- les publications servent d’accroches, pas de résumés;
- une seule idée principale est mise de l’avant;
- chaque publication contient normalement un à trois émojis pertinents;
- les émojis ne dominent pas le texte;
- Facebook et LinkedIn restent distincts;
- les hashtags restent limités;
- aucune information n’est inventée;
- aucune recherche Web n’est déclenchée;
- l’URL copiée est construite par l’application;
- l’image sociale provient d’un asset existant ou du fallback;
- les URLs d’images sociales sont accessibles aux plateformes;
- une erreur conserve les textes déjà présents;
- les textes restent modifiables;
- Christian conserve la décision finale;
- aucune persistance n’est ajoutée sans besoin démontré;
- chaque incrément est validé avant le suivant.

---

## 22. Critères de clôture du MVP 3.0

La phase est terminée lorsque Christian peut :

1. ouvrir un article enregistré;
2. générer ses deux publications sociales;
3. obtenir une publication Facebook brève;
4. obtenir une publication LinkedIn brève;
5. constater que les deux textes sont distincts;
6. constater qu’ils ne résument pas toute la ressource;
7. voir entre un et trois émojis appropriés dans chaque texte;
8. modifier chaque texte;
9. copier la publication Facebook complète;
10. copier la publication LinkedIn complète;
11. constater que l’URL est exacte;
12. constater que la couverture de l’article apparaît dans l’aperçu social;
13. répéter le parcours avec une infographie;
14. constater que son thumbnail est utilisé;
15. utiliser le fallback lorsqu’aucune image dédiée n’existe;
16. régénérer uniquement Facebook;
17. régénérer uniquement LinkedIn;
18. conserver l’autre plateforme lors d’une régénération;
19. conserver les textes présents lors d’une erreur;
20. voir un avertissement clair pour un brouillon;
21. constater qu’aucune publication n’est envoyée automatiquement;
22. utiliser le parcours sur ordinateur et mobile;
23. utiliser le parcours au clavier;
24. vérifier les métadonnées sociales des deux formats;
25. exécuter le build avec succès;
26. exécuter le lint ciblé avec succès;
27. exécuter les tests ciblés avec succès;
28. valider éditorialement les résultats réels.

---

## 23. Évolutions volontairement reportées

À réévaluer seulement après utilisation du MVP 3.0 :

- publication directe sur Facebook;
- publication directe sur LinkedIn;
- OAuth et gestion des autorisations;
- programmation des publications;
- calendrier éditorial;
- sauvegarde des textes générés;
- historique de versions;
- statut d’une publication sociale;
- plusieurs variantes par plateforme;
- génération automatique lors de la publication d’une ressource;
- génération en lot;
- approbation multiutilisateur;
- ajout d’Instagram;
- ajout de X;
- ajout de Bluesky;
- statistiques de portée et d’engagement;
- récupération des réactions et commentaires;
- recommandation d’heures de publication;
- tests A/B;
- image sociale distincte de la couverture;
- insertion automatique d’un paramètre de campagne;
- bibliothèque de modèles de publications;
- traduction automatique des textes sociaux.

La priorité reste un flux simple :

```text
Ressource enregistrée
→ générer deux accroches courtes
→ vérifier et modifier
→ copier avec l’URL
→ publier manuellement
```
