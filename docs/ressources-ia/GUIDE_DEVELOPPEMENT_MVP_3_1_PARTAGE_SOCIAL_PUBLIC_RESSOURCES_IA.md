# Guide de développement — MVP 3.1 Partage social public Ressources IA

**Projet :** 5PennyAi  
**Section :** Ressources IA  
**Évolution :** partage public des articles et infographies  
**Date :** 7 août 2026  
**Statut :** conception fonctionnelle prête à être inspectée puis implantée par incréments

---

## 1. Rôle du document

Ce guide encadre l’évolution **MVP 3.1** de la section Ressources IA.

Il prolonge le MVP 3.0 en ajoutant cette fois des fonctions destinées au **visiteur du site** qui souhaite partager une ressource qu’il vient de consulter.

Le MVP 3.0 couvre le besoin administratif :

```text
Ressource enregistrée
→ générer des publications Facebook et LinkedIn
→ vérifier ou modifier
→ copier
→ publier manuellement
```

Le MVP 3.1 couvre un besoin différent :

```text
Visiteur consulte une ressource publique
→ partager la page
ou
→ copier son lien
ou
→ télécharger l’infographie
```

Le MVP 3.1 ne publie rien automatiquement sur un réseau social. Il ne connecte aucun compte Facebook, LinkedIn ou autre plateforme. Il ne nécessite aucun OAuth et ne crée aucun calendrier éditorial.

L’objectif est de rendre chaque ressource publique **facile à diffuser partout**, en utilisant d’abord les mécanismes standards du navigateur et du système d’exploitation.

L’inspection du dépôt demeure la source de vérité technique. Elle peut ajuster les noms de composants, helpers, routes et fonctions sans modifier les objectifs fonctionnels du présent guide.

---

## 2. Documents de référence

### Références obligatoires

```text
GUIDE_DEVELOPPEMENT_MVP_3_1_PARTAGE_SOCIAL_PUBLIC_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_3_0_PUBLICATIONS_SOCIALES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_2_0_ARTICLES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_1_2_THUMBNAILS_RESSOURCES_IA.md
CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md
CONTRAT_JSON_RESSOURCES_IA_V1.md
```

### Références de contexte

```text
GUIDE_DEVELOPPEMENT_MVP_1_1_RESSOURCES_IA.md
REFERENCE_DEVELOPPEMENT_MVP_RESSOURCES_IA_PHASE_1.md
```

### Références techniques vérifiées

Le développement doit respecter les principes actuels des standards Web suivants :

- **Web Share API — W3C Recommendation** : partage de texte, liens et, lorsque pris en charge, fichiers vers une destination choisie par l’utilisateur;
- **Clipboard API and Events — W3C** : copie programmatique de texte dans le presse-papiers;
- **Open Graph protocol** : métadonnées permettant aux plateformes de construire l’aperçu d’une URL partagée.

L’implantation doit utiliser la détection de capacités du navigateur et prévoir des fallbacks. Elle ne doit pas supposer que `navigator.share`, `navigator.canShare` ou `navigator.clipboard` sont disponibles partout.

### Hiérarchie des responsabilités

- Le **MVP 3.0** demeure la référence pour les URL canoniques, les images sociales et les métadonnées Open Graph.
- Les **pages publiques existantes** demeurent la source de vérité du titre, du résumé, du slug et du statut publié.
- Le navigateur peut ouvrir son mécanisme natif de partage lorsqu’il le prend en charge.
- L’application construit toujours l’URL à partager; elle n’accepte pas une URL arbitraire fournie par un visiteur.
- Le partage public ne modifie aucune donnée éditoriale, aucun statut et aucun asset.
- L’infographie originale demeure l’asset téléchargeable; le thumbnail demeure principalement une couverture de catalogue et une image sociale.

---

## 3. Contexte

La section Ressources IA permet maintenant de publier deux formats :

```text
Article
Infographie
```

Le MVP 3.0 prévoit déjà une fondation de partage social fiable :

```text
Article
→ couverture 16:9 comme image sociale

Infographie
→ thumbnail 16:9 comme image sociale

Asset absent
→ fallback social 5PennyAi
```

Il prévoit également des métadonnées Open Graph et des URL canoniques afin que Facebook, LinkedIn et d’autres services puissent produire un aperçu lorsqu’un lien est partagé.

Le besoin du MVP 3.1 apparaît **après** cette fondation : un visiteur qui apprécie une ressource doit pouvoir la diffuser sans devoir sélectionner manuellement l’URL dans la barre d’adresse ni chercher le fichier original.

Le système doit donc ajouter une couche d’actions publiques simples :

```text
Partager
Copier le lien
Télécharger l’infographie
```

Le partage doit favoriser **la page de la ressource**, et non un asset isolé, afin de conserver :

- le contexte pédagogique;
- les sources;
- le branding;
- l’URL canonique;
- l’aperçu Open Graph;
- la possibilité de découvrir d’autres Ressources IA.

---

## 4. Objectif du MVP 3.1

Permettre à un visiteur d’un article ou d’une infographie publiée de partager facilement cette ressource depuis sa page publique.

À la fin du MVP, un visiteur doit pouvoir :

1. ouvrir un article publié;
2. cliquer sur `Partager` lorsque le navigateur prend en charge le partage natif;
3. choisir une destination proposée par son appareil ou son navigateur;
4. partager l’URL canonique de l’article;
5. copier le lien de l’article;
6. ouvrir une infographie publiée;
7. partager son URL canonique;
8. copier son lien;
9. télécharger l’infographie originale;
10. obtenir un nom de fichier propre et descriptif;
11. constater que le partage utilise le bon titre, la bonne description et la bonne image sociale;
12. utiliser les actions même lorsqu’aucun partage natif n’est disponible grâce aux fallbacks;
13. utiliser les fonctions au clavier et sur mobile;
14. ne jamais accéder par ces fonctions à un brouillon ou à un asset privé arbitraire.

Principe central :

> Le visiteur partage d’abord la **ressource 5PennyAi**. Le téléchargement de l’infographie est une action complémentaire lorsqu’il souhaite conserver ou republier directement l’image.

---

## 5. Principes directeurs

### 5.1 Partager la page avant de partager le fichier

L’action principale `Partager` transmet l’URL canonique de la page publique.

Elle ne transmet pas par défaut :

- une URL signée vers un asset;
- le chemin Supabase;
- le fichier de couverture;
- le thumbnail;
- l’infographie originale;
- une URL administrative.

Les plateformes qui reçoivent le lien peuvent ensuite construire leur aperçu à partir des métadonnées Open Graph de la page.

### 5.2 Utiliser le partage natif lorsqu’il existe

Lorsque `navigator.share` est disponible, l’action `Partager` utilise la Web Share API.

Données conceptuelles :

```text
title
text court
url canonique
```

Le partage doit être déclenché directement par une action de l’utilisateur.

L’application ne doit pas ouvrir le dialogue de partage automatiquement au chargement d’une page.

### 5.3 Fallback permanent

Le partage natif n’est pas disponible de manière uniforme sur tous les navigateurs.

Le MVP doit donc garantir indépendamment :

```text
Copier le lien
```

Si le partage natif n’est pas disponible :

- masquer l’action `Partager` ou la remplacer proprement selon le design retenu;
- conserver `Copier le lien` pleinement fonctionnel;
- ne pas afficher un bouton qui échoue systématiquement.

### 5.4 Copier avec l’API du presse-papiers

Lorsque disponible, utiliser l’API asynchrone du presse-papiers pour copier l’URL canonique.

Si elle n’est pas disponible ou si la copie est refusée :

- conserver l’URL visible ou accessible;
- permettre de la sélectionner facilement;
- afficher une instruction de copie manuelle;
- ne pas utiliser une nouvelle requête réseau pour résoudre le problème.

### 5.5 Télécharger uniquement lorsqu’un fichier apporte une vraie valeur

Le MVP ajoute `Télécharger l’infographie` sur les pages d’infographies.

Il n’ajoute pas `Télécharger` par défaut aux articles.

L’asset téléchargé est :

```text
Infographie complète
→ document pédagogique original
```

Le thumbnail 16:9 n’est pas le fichier principal à télécharger.

### 5.6 Aucun bouton par réseau obligatoire

Le MVP ne doit pas afficher une longue rangée du type :

```text
Facebook | LinkedIn | X | WhatsApp | Reddit | ...
```

Le mécanisme natif laisse l’utilisateur choisir parmi les destinations disponibles sur son appareil.

Des raccourcis spécialisés pourront être évalués plus tard seulement si les données d’usage démontrent leur utilité.

### 5.7 Aucun appel à un modèle d’IA

Le MVP 3.1 ne génère aucun texte de partage pour les visiteurs.

Il ne doit pas :

- appeler le générateur social du MVP 3.0;
- exposer cet endpoint aux visiteurs anonymes;
- générer une publication à chaque clic;
- introduire un coût IA public;
- enregistrer un texte social par visiteur.

### 5.8 Aucun changement aux contrats JSON

Le partage public utilise les données et assets déjà existants.

Aucune propriété n’est ajoutée à :

```text
CONTRAT_JSON_ARTICLES_5PENNYAI_V1
CONTRAT_JSON_RESSOURCES_IA_V1
```

### 5.9 Aucun changement de statut

Partager, copier ou télécharger :

- ne publie pas une ressource;
- ne modifie pas une ressource;
- ne crée aucun enregistrement;
- ne change aucune date;
- ne modifie aucun compteur éditorial dans le MVP initial.

### 5.10 Une ressource non publiée reste inaccessible

Toutes les actions publiques reposent sur le même principe de visibilité que les pages existantes :

```text
published
→ partage possible

draft / withdrawn / inconnu
→ aucune exposition publique
```

---

## 6. Expérience publique cible

## 6.1 Composant partagé

Créer un petit composant public commun, par exemple :

```text
ResourceShareActions
```

Nom réel à confirmer pendant l’inspection.

Le composant ne crée pas une abstraction générique de contenu. Il reçoit seulement les données publiques déjà résolues dont il a besoin.

Forme conceptuelle :

```text
resourceType
title
shareText
canonicalUrl
download facultatif
```

### Actions principales

Pour un article :

```text
[Partager] [Copier le lien]
```

Pour une infographie :

```text
[Partager] [Copier le lien] [Télécharger]
```

Les icônes peuvent accompagner le texte, mais les actions ne doivent pas dépendre uniquement d’icônes ambiguës.

## 6.2 Emplacement — article

Emplacement recommandé : sous les métadonnées principales ou à proximité immédiate de la couverture, avant le corps long de l’article.

L’action doit être visible sans devenir un appel à l’action dominant.

Une répétition légère en fin d’article peut être évaluée pendant la validation visuelle seulement si elle améliore réellement l’usage.

Ne pas créer deux composants de partage concurrents par défaut.

## 6.3 Emplacement — infographie

Emplacement recommandé : dans la zone d’actions associée à l’infographie, près de l’image ou de la visionneuse.

Le visiteur doit comprendre la distinction :

```text
Partager
→ diffuser la page de la ressource

Télécharger
→ récupérer le fichier de l’infographie
```

## 6.4 Confirmation de copie

Après `Copier le lien` :

```text
Lien copié
```

ou équivalent traduit.

Le message doit :

- être bref;
- être annoncé aux technologies d’assistance;
- disparaître sans déplacer fortement la mise en page;
- ne pas empêcher une nouvelle copie.

## 6.5 Partage annulé

Si l’utilisateur ouvre le dialogue de partage puis l’annule :

- ne pas afficher un message d’erreur alarmant;
- ne pas journaliser l’annulation comme panne applicative;
- conserver la page intacte.

## 6.6 Share text

Le petit texte transmis au mécanisme natif reste factuel et non promotionnel.

Priorité recommandée :

### Article

```text
title
+ summary lorsque disponible et suffisamment courte
+ canonicalUrl
```

### Infographie

```text
title
+ summary ou introduction courte lorsque disponible
+ canonicalUrl
```

Si aucun résumé utile n’existe :

```text
title
+ canonicalUrl
```

Le texte transmis ne doit pas contenir :

- hashtags automatiques;
- URL de source;
- citation;
- marqueur technique;
- texte généré par IA à la volée.

---

## 7. Résolution de l’URL à partager

## 7.1 Source de vérité

L’URL de partage est toujours l’URL canonique réelle de la ressource.

Elle doit :

- être absolue;
- utiliser le domaine canonique;
- être construite à partir des helpers de routes existants;
- correspondre au slug réel;
- ne contenir aucun paramètre d’administration;
- ne contenir aucune URL signée;
- ne pas être construite par le navigateur à partir de données non fiables lorsqu’un helper canonique existe déjà.

## 7.2 Article

Forme conceptuelle :

```text
/ressources-ia/articles/{slug}
```

La route réelle confirmée par le dépôt a priorité.

## 7.3 Infographie

Utiliser la route publique existante de la fiche d’infographie.

Le partage ne doit pas pointer directement vers le PNG/WebP original.

## 7.4 URL courante vs canonique

Ne pas utiliser aveuglément `window.location.href` si l’URL peut contenir :

- paramètres de filtre;
- ancre temporaire;
- paramètres de suivi;
- état d’interface;
- variante non canonique.

Le helper canonique du site doit être préféré.

---

## 8. Open Graph et aperçu social

Le MVP 3.1 **réutilise** la fondation du MVP 3.0. Il ne doit pas reconstruire un second système de métadonnées.

Chaque page partageable doit continuer de fournir au minimum :

```text
og:title
og:description
og:url
og:type
og:image
```

Lorsque disponibles :

```text
og:image:width
og:image:height
og:image:type
```

## 8.1 Article

Priorité :

```text
couverture de l’article
→ fallback social 5PennyAi
```

## 8.2 Infographie

Priorité :

```text
thumbnail 16:9
→ fallback social 5PennyAi
```

L’infographie verticale complète ne devient pas l’image Open Graph par défaut lorsque le thumbnail existe.

## 8.3 Vérification réelle

L’inspection et la validation doivent vérifier les métadonnées **réellement accessibles au crawler**, pas seulement le DOM après exécution dans le navigateur.

Si l’architecture React actuelle produit des différences entre :

```text
HTML initial reçu
et
DOM final après JavaScript
```

le MVP 3.1 ne doit corriger que ce qui est nécessaire au partage social, sans déclencher une migration SSR ou un changement de framework.

## 8.4 Asset social stable

L’URL de `og:image` doit :

- être accessible sans session;
- être adaptée aux crawlers;
- ne pas expirer trop rapidement;
- ne pas révéler un chemin administratif sensible;
- ne jamais rendre public un asset d’un brouillon.

Si le MVP 3.0 a déjà résolu ce point, réutiliser exactement cette solution.

---

## 9. Téléchargement des infographies

## 9.1 Rôle

Le téléchargement permet au visiteur de :

- conserver l’infographie;
- la consulter hors ligne;
- la joindre manuellement à une publication;
- la partager dans un outil qui préfère un fichier à un lien.

Il ne remplace pas l’action `Partager`.

## 9.2 Asset téléchargé

Priorité :

```text
image complète de l’infographie publiée
```

Ne pas télécharger par défaut :

- le thumbnail;
- la couverture de série;
- un asset temporaire de génération;
- une image d’administration.

## 9.3 Nom du fichier

Nom recommandé :

```text
{slug-ou-titre-normalise}.webp
```

ou conserver l’extension réelle lorsque l’asset n’est pas WebP.

Règles :

- minuscules lorsque possible;
- tirets;
- aucun caractère problématique;
- nom descriptif;
- extension correspondant au vrai type du fichier.

## 9.4 Stockage privé ou URL signée

L’inspection doit déterminer comment l’image complète est servie actuellement.

Si un simple lien de téléchargement est fiable et sécurisé, le réutiliser.

Si le stockage privé, les URLs signées, CORS ou le comportement du navigateur rendent le téléchargement fragile, utiliser une route contrôlée spécialisée, par exemple conceptuellement :

```text
GET /api/public-resource-download?type=infographic&id=...
```

Le nom réel et le contrat sont à déterminer pendant l’inspection.

Une telle route doit :

1. recevoir uniquement un identifiant ou slug contrôlé;
2. récupérer la ressource côté serveur;
3. confirmer qu’elle est publiée;
4. résoudre elle-même le chemin de l’asset;
5. servir uniquement l’image autorisée;
6. utiliser un `Content-Type` correct;
7. utiliser un `Content-Disposition` approprié;
8. refuser tout chemin fourni arbitrairement par le client.

## 9.5 Aucun téléchargement d’un brouillon

Une route de téléchargement publique ne doit jamais transformer un chemin de stockage privé en mécanisme d’accès générique.

Interdictions :

- `?path=...` arbitraire;
- téléchargement par `articleId` pour un article sans fonction de téléchargement;
- accès à un draft;
- accès à un média interne privé non prévu;
- traversal ou manipulation de chemin.

---

## 10. Partage de fichier via Web Share API

La Web Share API peut, dans certains environnements, accepter des fichiers. Cette capacité varie selon le navigateur et le type de fichier.

### Décision du MVP 3.1

Le partage de **fichier image directement par Web Share** n’est pas requis pour la première version.

Le parcours principal reste :

```text
Partager
→ URL de la ressource

Télécharger
→ fichier de l’infographie
```

### Pourquoi le reporter

Partager directement un fichier nécessiterait notamment :

- récupérer le binaire de l’image;
- créer un objet `File` avec le bon type MIME;
- vérifier `navigator.canShare({ files })`;
- gérer les limites de taille et de type;
- gérer CORS et les assets privés;
- maintenir un fallback lorsque le partage de fichier est refusé.

Cette amélioration pourra être évaluée après le MVP si le téléchargement manuel crée une friction réelle.

---

## 11. Accessibilité et UX

### 11.1 Boutons

Chaque action doit :

- être utilisable au clavier;
- avoir un libellé explicite;
- avoir un focus visible;
- ne pas dépendre du survol;
- conserver une zone tactile suffisante sur mobile.

### 11.2 Icônes

Une icône de partage, lien ou téléchargement peut accompagner le texte.

Ne pas utiliser une icône seule si son sens n’est pas évident et correctement nommé pour les technologies d’assistance.

### 11.3 États dynamiques

Les messages comme :

```text
Lien copié
Impossible de copier automatiquement
Téléchargement indisponible
```

doivent être accessibles, idéalement au moyen d’une zone `aria-live` ou du composant de statut déjà utilisé dans le site.

### 11.4 Mobile

Sur environ 390 px :

- les actions peuvent passer sur plusieurs lignes;
- aucun texte ne doit être tronqué de façon ambiguë;
- l’infographie ne doit pas être repoussée excessivement par le bloc;
- le bouton Partager doit rester facile à atteindre.

### 11.5 Desktop

Sur les navigateurs qui ne prennent pas en charge le partage natif, le composant doit rester équilibré avec :

```text
Copier le lien
Télécharger, pour une infographie
```

Aucun espace vide ne doit être réservé à un bouton Partager absent.

---

## 12. Gestion des erreurs

### Web Share API indisponible

- ne pas traiter comme une panne;
- masquer ou adapter l’action;
- conserver `Copier le lien`.

### Dialogue de partage annulé

- ne pas afficher une erreur technique;
- ne pas modifier la page;
- ne pas relancer automatiquement.

### Partage échoué

- afficher un message court si l’échec est réel;
- proposer ou laisser visible `Copier le lien`;
- ne pas envoyer de requête supplémentaire inutile.

### Presse-papiers indisponible

- conserver l’URL accessible;
- proposer la sélection/copie manuelle;
- ne pas effacer le focus ou le contenu.

### URL canonique impossible à résoudre

- ne jamais partager une URL approximative;
- masquer ou désactiver l’action concernée;
- journaliser le problème côté développement si un mécanisme existe déjà;
- corriger la résolution de route plutôt que bricoler une URL côté UI.

### Asset d’infographie absent

- masquer `Télécharger` ou afficher un état neutre selon le design retenu;
- conserver `Partager` et `Copier le lien`;
- ne pas télécharger le thumbnail comme substitution silencieuse.

### Téléchargement échoué

- afficher un message clair;
- conserver les autres actions;
- ne pas révéler le chemin de stockage dans l’erreur.

### Ressource non publiée

- les actions ne doivent pas être accessibles sur une page publique inexistante;
- une route publique de téléchargement doit également refuser la ressource.

---

## 13. Sécurité et confidentialité

Règles minimales :

- aucune clé API nécessaire;
- aucune authentification sociale;
- aucune donnée personnelle collectée;
- aucune liste de destinations récupérée par le site;
- le choix du réseau reste dans le mécanisme natif de l’utilisateur;
- aucune URL de brouillon exposée;
- aucun chemin de stockage arbitraire accepté;
- aucun asset privé générique rendu public;
- partage et presse-papiers déclenchés seulement par une action utilisateur appropriée;
- aucun contenu fourni par l’utilisateur réinjecté dans une URL sans validation;
- aucun ajout automatique de paramètre de suivi dans le MVP initial.

Si une directive `Permissions-Policy` existe déjà, vérifier qu’elle ne bloque pas involontairement `web-share` sur les pages concernées.

---

## 14. Mesure et analytics

### Décision du MVP

Ne pas ajouter une infrastructure analytics dédiée uniquement au partage.

Si le site possède déjà un mécanisme simple d’événements, l’inspection peut recommander des événements non bloquants tels que :

```text
resource_share_opened
resource_link_copied
infographic_downloaded
```

Seulement si cette instrumentation peut être ajoutée sans :

- nouvelle plateforme;
- nouveau consentement;
- nouveau cookie;
- nouvelle table;
- dépendance externe importante.

Sinon, reporter entièrement la mesure.

Le MVP ne doit pas prétendre mesurer un **partage réellement publié** : l’application peut savoir que le dialogue a été ouvert, mais pas nécessairement ce que l’utilisateur a fait dans l’application cible.

---

## 15. Persistance et modèle de données

### Décision recommandée

Aucune migration n’est prévue pour le MVP 3.1.

Le système ne stocke pas :

- nombre de partages;
- destination choisie;
- texte partagé;
- utilisateur ayant partagé;
- historique de téléchargements;
- état de diffusion.

Si l’inspection révèle qu’une migration est nécessaire uniquement pour réparer une fondation existante du MVP 3.0, elle doit être explicitement justifiée avant toute modification.

---

## 16. Hors périmètre général

Le MVP 3.1 n’inclut pas :

- publication directe sur Facebook;
- publication directe sur LinkedIn;
- OAuth;
- programmation de publications;
- calendrier éditorial;
- connexion à Instagram, X, Bluesky, Reddit ou autre API;
- boutons dédiés à une longue liste de réseaux;
- génération IA publique de texte social;
- persistance d’un texte de partage public;
- compte de partages affiché;
- classement des ressources les plus partagées;
- suivi de la destination choisie;
- paramètres UTM automatiques;
- raccourcisseur d’URL;
- QR code;
- partage direct du fichier image via Web Share dans la première version;
- téléchargement des couvertures d’articles;
- téléchargement des médias internes d’articles;
- modification des contrats JSON;
- table générique `resources`;
- refonte du système Open Graph du MVP 3.0;
- refonte SSR ou changement de framework.

---

# 17. Découpage du développement

Le MVP 3.1 est découpé en **trois incréments fonctionnels**, précédés d’une inspection ciblée.

```text
Inspection
→ partage de lien public
→ téléchargement des infographies
→ intégration, accessibilité et finalisation
```

---

## Incrément 0 — Inspection ciblée

### Objectif

Confirmer l’état réel du partage social après le MVP 3.0 et déterminer la plus petite implantation fiable pour les actions publiques.

### Documents à lire

```text
GUIDE_DEVELOPPEMENT_MVP_3_1_PARTAGE_SOCIAL_PUBLIC_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_3_0_PUBLICATIONS_SOCIALES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_2_0_ARTICLES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_1_2_THUMBNAILS_RESSOURCES_IA.md
CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md
CONTRAT_JSON_RESSOURCES_IA_V1.md
```

### À inspecter

- état Git, branche, remotes et derniers commits;
- état réel du MVP 3.0;
- pages publiques d’articles;
- pages publiques d’infographies;
- composants d’actions existants;
- composants de boutons, toasts et statuts;
- helpers de construction des URL canoniques;
- gestion de `canonical`;
- métadonnées Open Graph actuelles;
- HTML initial réellement retourné aux crawlers;
- couverture d’article comme image sociale;
- thumbnail d’infographie comme image sociale;
- fallback social 5PennyAi;
- caractère public ou privé des assets;
- durée et fonctionnement des URLs signées;
- fonction actuelle de téléchargement éventuelle;
- présence d’un helper de nom de fichier;
- configuration CORS pertinente;
- headers `Content-Type` et `Content-Disposition` existants;
- `Permissions-Policy` éventuelle;
- conventions React pour la détection de capacités navigateur;
- gestion actuelle du presse-papiers;
- système analytics éventuel;
- traductions FR/EN;
- tests existants;
- scripts de build et lint.

### Questions à résoudre

1. Le MVP 3.0 fournit-il déjà des métadonnées sociales fiables sur les deux formats?
2. Les crawlers voient-ils réellement ces métadonnées dans la réponse appropriée?
3. Quel helper construit déjà l’URL canonique de chaque format?
4. Où placer un composant partagé sans créer une abstraction `resources`?
5. `navigator.share` peut-il être utilisé directement dans l’architecture actuelle?
6. Une `Permissions-Policy` bloque-t-elle `web-share`?
7. Quelle stratégie de fallback du presse-papiers existe déjà?
8. L’infographie complète peut-elle être téléchargée directement?
9. Si non, faut-il une petite route publique de téléchargement contrôlé?
10. Quel nom de fichier doit être utilisé?
11. Une migration est-elle réellement nécessaire?
12. Un système analytics existant peut-il recevoir quelques événements sans nouvelle infrastructure?

### Décisions attendues

Le rapport doit préciser :

- état réel des métadonnées sociales du MVP 3.0;
- fichiers exacts à modifier;
- composant partagé retenu;
- données minimales de ce composant;
- stratégie de `navigator.share`;
- stratégie de copie;
- stratégie de téléchargement;
- besoin ou absence d’une route serveur;
- besoin ou absence de migration;
- besoin ou absence d’instrumentation;
- risques de compatibilité navigateur;
- périmètre précis de l’incrément 1.

### Résultat visible

Aucun changement public.

### Hors périmètre

- aucune modification de code;
- aucune migration;
- aucune dépendance;
- aucune route nouvelle;
- aucun commit;
- aucun push.

### Critères d’acceptation

- les deux pages publiques sont comprises;
- les helpers canoniques sont identifiés;
- le comportement Open Graph réel est confirmé;
- la stratégie de fallback est définie;
- le téléchargement est techniquement cadré;
- aucune intégration sociale disproportionnée n’est proposée;
- le périmètre de l’incrément 1 est précis.

---

## Incrément 1 — Partage public et copie du lien

### Objectif

Permettre à un visiteur de partager l’URL canonique d’un article ou d’une infographie et de copier son lien.

### Inclus

- composant partagé d’actions publiques;
- intégration sur la page publique d’article;
- intégration sur la page publique d’infographie;
- action `Partager` conditionnelle;
- détection de `navigator.share`;
- utilisation de l’URL canonique;
- titre de partage;
- texte court avec fallback;
- gestion de l’annulation utilisateur;
- gestion des erreurs réelles;
- action `Copier le lien`;
- Clipboard API lorsque disponible;
- fallback de copie manuelle;
- message de succès;
- statut accessible;
- traductions FR/EN;
- responsive;
- focus clavier;
- tests ciblés;
- vérification des métadonnées sociales héritées du MVP 3.0 sans les reconstruire.

### Résultat visible

> Un visiteur peut ouvrir une ressource publiée, lancer le partage natif lorsque son environnement le permet ou copier immédiatement son URL canonique.

### Hors périmètre

- téléchargement de l’infographie;
- partage de fichier image;
- bouton Facebook dédié;
- bouton LinkedIn dédié;
- texte généré par IA;
- statistiques de partage;
- modification des contrats JSON;
- modification de l’administration;
- persistance.

### Critères d’acceptation fonctionnels

- `Partager` n’est affiché que lorsque la capacité nécessaire existe ou possède un fallback explicitement retenu;
- le partage est déclenché uniquement après un clic ou une activation équivalente;
- l’URL partagée est canonique et absolue;
- aucune URL signée n’est partagée;
- le titre correspond à la ressource;
- un résumé absent n’empêche pas le partage;
- annuler le dialogue ne produit pas une erreur alarmante;
- `Copier le lien` fonctionne indépendamment de Web Share;
- une erreur du presse-papiers permet une copie manuelle;
- un draft n’est pas exposé;
- aucune donnée n’est modifiée;
- aucune requête IA n’est effectuée.

### Critères d’acceptation visuels

- les actions sont discrètes mais repérables;
- la page ne ressemble pas à un site de boutons sociaux;
- l’article conserve la priorité sur son contenu;
- l’infographie conserve la priorité sur son image;
- les actions sont lisibles à environ 390 px;
- aucun bouton vide n’apparaît lorsque Web Share n’est pas disponible.

### Tests ciblés recommandés

- article avec résumé;
- article sans résumé;
- infographie avec résumé;
- Web Share disponible;
- Web Share absent;
- partage annulé;
- partage échoué;
- Clipboard API disponible;
- Clipboard API refusée/absente;
- URL canonique attendue;
- clavier et focus;
- traduction FR/EN.

### Vérification manuelle

Tester au minimum :

- Chrome/Edge desktop;
- navigateur mobile disponible;
- une page d’article;
- une page d’infographie;
- partage vers au moins une cible réelle lorsque l’environnement le permet;
- copie du lien;
- annulation volontaire du dialogue;
- viewport 1440, 768 et environ 390 px.

---

## Incrément 2 — Téléchargement public des infographies

### Objectif

Permettre à un visiteur de récupérer proprement le fichier complet d’une infographie publiée.

### Inclus

- action `Télécharger` sur une infographie;
- résolution de l’asset complet réel;
- nom de fichier descriptif;
- type MIME correct;
- préservation de l’extension réelle;
- utilisation de la méthode la plus simple si le stockage actuel le permet;
- route publique contrôlée seulement si nécessaire;
- vérification stricte du statut publié;
- aucune confiance accordée à un chemin client;
- gestion des assets absents;
- gestion des erreurs;
- traductions FR/EN;
- accessibilité;
- responsive;
- tests ciblés;
- vérification manuelle du fichier obtenu.

### Résultat visible

> Un visiteur peut télécharger l’infographie complète depuis sa page publique et obtient un fichier correctement nommé et exploitable.

### Hors périmètre

- téléchargement des articles;
- téléchargement de la couverture d’article;
- téléchargement des médias internes;
- téléchargement de la couverture de série;
- partage du fichier directement via Web Share;
- zip ou plusieurs formats;
- conversion à la demande;
- watermark ajouté au téléchargement;
- génération d’une nouvelle image;
- compteur de téléchargements en base.

### Critères d’acceptation

- le fichier téléchargé est l’infographie complète, pas le thumbnail;
- le nom du fichier est descriptif;
- le type MIME correspond au contenu;
- l’asset est utilisable après téléchargement;
- une ressource sans asset n’affiche pas une action trompeuse;
- aucun chemin de stockage arbitraire n’est accepté;
- un brouillon ou une ressource retirée est refusé;
- l’endpoint éventuel ne devient pas un proxy générique de fichiers;
- le partage et la copie continuent de fonctionner;
- le build et les tests ciblés réussissent.

### Tests ciblés recommandés

- infographie publiée avec asset;
- asset absent;
- slug/id inconnu;
- brouillon;
- ressource retirée;
- tentative de chemin arbitraire si une route existe;
- extension et MIME;
- nom contenant accents ou caractères spéciaux;
- erreur stockage;
- comportement mobile.

### Vérification manuelle

- télécharger au moins deux infographies;
- ouvrir les fichiers téléchargés;
- vérifier leur nom;
- vérifier que le thumbnail n’a pas été utilisé;
- vérifier le comportement depuis mobile si possible;
- tester à 1440, 768 et environ 390 px.

---

## Incrément 3 — Robustesse, accessibilité et finalisation

### Objectif

Valider l’expérience de partage public sur les deux formats et corriger uniquement les problèmes révélés par l’utilisation réelle.

### Banc d’essai minimal

Tester :

- deux articles publiés;
- deux infographies publiées;
- une infographie sans thumbnail mais avec image complète;
- une ressource avec métadonnées partielles;
- un slug inconnu;
- une ressource non publiée;
- un environnement avec Web Share;
- un environnement sans Web Share;
- un environnement où le presse-papiers fonctionne;
- un cas de fallback de copie.

### Inclus

- validation des positions finales des actions;
- validation responsive;
- validation clavier;
- validation des messages `aria-live` ou mécanisme équivalent;
- vérification de contraste et états de focus;
- vérification des URL canoniques;
- vérification Open Graph réelle;
- vérification des images sociales;
- validation des fallbacks;
- vérification du téléchargement;
- petites corrections UX directement liées au partage;
- instrumentation minimale uniquement si le système analytics existant le permet sans nouvelle infrastructure;
- build;
- lint ciblé;
- tests ciblés;
- documentation des limites restantes;
- vérification de l’état Git.

### Résultat visible

> Les articles et infographies publiés peuvent être partagés ou copiés facilement depuis leurs pages publiques, et les infographies peuvent aussi être téléchargées proprement.

### Hors périmètre

- ajout d’une plateforme sociale spécifique;
- OAuth;
- publication automatique;
- génération IA publique;
- persistance sociale;
- compte public de partages;
- changement majeur d’architecture;
- partage de fichier natif;
- nouvelle version des contrats.

### Critères d’acceptation

- le partage natif fonctionne lorsqu’il est disponible;
- l’absence de Web Share ne dégrade pas la page;
- la copie du lien possède un fallback;
- les URL sont canoniques;
- l’aperçu social utilise la bonne image;
- les infographies téléchargées sont complètes;
- les brouillons restent inaccessibles;
- les actions sont utilisables au clavier;
- le parcours fonctionne sur ordinateur et mobile;
- aucune dépendance sociale externe n’a été ajoutée inutilement;
- aucune migration non justifiée n’a été introduite;
- le build réussit;
- le lint ciblé réussit;
- les tests ciblés réussissent;
- Christian valide le résultat réel.

---

## 18. Tableau de progression

| Incrément | Résultat fonctionnel | État | Commit |
|---|---|---|---|
| 0 | Inspection du partage public et des assets | À faire | — |
| 1 | Partager et copier le lien | À faire | — |
| 2 | Télécharger les infographies | À faire | — |
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

## 19. Discipline pour chaque session Codex

Chaque prompt Codex doit préciser :

1. le résultat visible attendu;
2. les documents de référence à lire;
3. l’état Git requis;
4. l’incrément unique à réaliser;
5. les fichiers ou zones à inspecter;
6. les éléments inclus;
7. les éléments hors périmètre;
8. les invariants de visibilité publique;
9. les invariants d’URL et d’assets;
10. les invariants de sécurité;
11. les exigences d’accessibilité;
12. les validations techniques;
13. le scénario manuel à vérifier;
14. le rapport final attendu;
15. l’interdiction de commit ou push sauf demande explicite.

Le rapport final doit contenir :

- résultat obtenu;
- décisions techniques;
- fichiers créés ou modifiés;
- migration éventuelle et justification;
- composant public ajouté ou modifié;
- stratégie Web Share;
- stratégie Clipboard;
- stratégie de téléchargement;
- URL canoniques utilisées;
- comportement Open Graph vérifié;
- sécurité et visibilité des assets;
- gestion des erreurs;
- accessibilité;
- instrumentation éventuelle;
- commandes exécutées;
- tests exécutés;
- vérification manuelle effectuée ou restant à faire;
- limites connues;
- état Git;
- résumé du diff;
- aucun push sans demande explicite.

Codex ne doit pas :

- commencer l’incrément suivant;
- modifier les contrats JSON;
- connecter directement une plateforme sociale;
- ajouter OAuth;
- appeler un modèle d’IA pour un visiteur;
- ajouter des boutons pour de nombreuses plateformes;
- inventer une URL de ressource;
- partager une URL signée comme URL principale;
- exposer un chemin de stockage arbitraire;
- créer un proxy générique de fichiers;
- créer une table générique `resources`;
- créer une table de partage sans besoin démontré;
- refactoriser des zones étrangères;
- ajouter une dépendance majeure sans justification issue de l’inspection;
- effectuer un commit ou un push sans demande explicite.

---

## 20. Invariants critiques

Pendant tout le MVP 3.1 :

- le MVP 3.0 continue de fonctionner;
- les publications administratives Facebook/LinkedIn restent inchangées;
- les contrats JSON restent inchangés;
- les articles et infographies restent des formats spécialisés;
- aucune table générique `resources` n’est créée;
- les pages publiques existantes restent la source de vérité;
- l’URL partagée est canonique;
- aucune URL administrative n’est partagée;
- aucune URL signée n’est utilisée comme URL principale de partage;
- `Partager` dépend de la capacité réelle du navigateur;
- `Copier le lien` possède un fallback;
- le dialogue de partage n’est jamais ouvert automatiquement;
- une annulation utilisateur n’est pas traitée comme une panne;
- aucune publication n’est envoyée automatiquement;
- aucun compte social n’est connecté;
- aucun modèle d’IA n’est appelé pour le partage public;
- le choix de la destination reste à l’utilisateur;
- les métadonnées Open Graph du MVP 3.0 sont réutilisées;
- l’article utilise sa couverture comme image sociale lorsqu’elle existe;
- l’infographie utilise son thumbnail comme image sociale lorsqu’il existe;
- le téléchargement récupère l’infographie complète;
- le thumbnail n’est pas substitué silencieusement comme fichier à télécharger;
- aucun brouillon n’est exposé;
- aucun chemin de stockage arbitraire n’est accepté;
- aucune donnée personnelle n’est collectée par cette fonction;
- aucune migration n’est ajoutée sans nécessité démontrée;
- aucun analytics dédié n’est créé sans nécessité;
- chaque incrément est validé avant le suivant.

---

## 21. Critères de clôture du MVP 3.1

La phase est terminée lorsqu’un visiteur peut :

1. ouvrir un article publié;
2. voir les actions de partage prévues;
3. utiliser `Partager` lorsque son navigateur le permet;
4. choisir une destination native;
5. annuler le partage sans erreur inquiétante;
6. copier le lien de l’article;
7. utiliser un fallback si la copie automatique échoue;
8. ouvrir une infographie publiée;
9. partager sa page;
10. copier son lien;
11. télécharger l’infographie complète;
12. obtenir un fichier correctement nommé;
13. constater que le lien partagé utilise l’URL canonique;
14. constater qu’un article partagé utilise sa couverture comme image sociale lorsqu’elle existe;
15. constater qu’une infographie partagée utilise son thumbnail comme image sociale lorsqu’il existe;
16. voir le fallback 5PennyAi lorsqu’aucune image dédiée n’existe;
17. utiliser les actions au clavier;
18. utiliser le parcours sur mobile;
19. utiliser le parcours sur ordinateur;
20. constater qu’un environnement sans Web Share conserve les fonctions utiles;
21. constater qu’aucun compte social n’est requis;
22. constater qu’aucune publication n’est envoyée automatiquement;
23. constater qu’un brouillon reste inaccessible;
24. vérifier que le build réussit;
25. vérifier que le lint ciblé réussit;
26. vérifier que les tests ciblés réussissent;
27. valider fonctionnellement le résultat réel.

---

## 22. Évolutions volontairement reportées

À réévaluer seulement après utilisation du MVP 3.1 :

- partage direct du fichier image avec `navigator.canShare({ files })`;
- bouton LinkedIn dédié;
- bouton Facebook dédié;
- raccourcis WhatsApp, courriel ou autres plateformes;
- texte public de partage préétabli;
- persistance de suggestions de publication publiques;
- paramètres UTM automatiques;
- analytics détaillés de clics de partage;
- compteur public de partages;
- classement des ressources les plus partagées;
- QR code;
- raccourcisseur de liens;
- bouton `Partager` dans les cartes du catalogue;
- partage d’une série complète;
- téléchargement d’un article en PDF;
- téléchargement de couvertures d’articles;
- téléchargement de médias internes;
- génération automatique d’une image sociale distincte;
- installation du site comme PWA pour recevoir des partages;
- publication directe via API de plateforme;
- OAuth;
- programmation des publications.

La priorité reste un flux public simple :

```text
Consulter une ressource
→ partager son lien
ou
→ copier son lien
ou
→ télécharger l’infographie
```
