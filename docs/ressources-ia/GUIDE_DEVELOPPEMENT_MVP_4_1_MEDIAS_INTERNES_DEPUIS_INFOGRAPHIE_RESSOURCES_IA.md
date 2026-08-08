# Guide de développement — MVP 4.1 Médias internes dérivés de l’infographie

**Projet :** 5PennyAi
**Section :** Ressources IA
**Évolution :** génération des médias internes d’un article à partir de son infographie compagnon
**Date :** 8 août 2026
**Statut :** conception fonctionnelle prête à être inspectée puis implantée par incréments

---

## 1. Rôle du document

Ce guide encadre l’évolution **MVP 4.1** de la section Ressources IA.

Il prolonge directement le MVP 4.0, qui permet maintenant à un article de posséder :

- une infographie compagnon;
- une couverture générée à partir de cette infographie;
- des médias internes déclarés dans le contrat JSON Articles v1.

Le MVP 4.1 ajoute une nouvelle capacité : générer ou régénérer les médias internes d’un article en utilisant **l’infographie compagnon comme référence visuelle**, tout en conservant le `generationBrief` de chaque média comme source de vérité du contenu à représenter.

Le flux cible est :

```text
Article enregistré
→ infographie compagnon disponible
→ média déclaré dans media[]
→ generationBrief du média
+ infographie compagnon comme référence visuelle
→ génération d’une nouvelle image
→ association automatique à la bonne mediaKey
→ aperçu
→ validation humaine
```

Le MVP 4.1 ne crée pas un nouveau workflow éditorial et ne modifie pas le contrat JSON Articles v1.

L’objectif est de faire en sorte que :

```text
Couverture
Infographie compagnon
Médias internes
```

semblent provenir du même studio éditorial, tout en conservant des rôles distincts.

L’inspection du dépôt demeure la source de vérité technique. Elle peut ajuster les noms de fichiers, fonctions, routes ou helpers sans modifier les objectifs fonctionnels du présent guide.

---

## 2. Documents de référence

### Références obligatoires

```text
GUIDE_DEVELOPPEMENT_MVP_4_1_MEDIAS_INTERNES_DEPUIS_INFOGRAPHIE_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_4_0_INFOGRAPHIES_ARTICLES_RESSOURCES_IA.md
CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md
GUIDE_DEVELOPPEMENT_MVP_2_0_ARTICLES_RESSOURCES_IA.md
GUIDE_STYLE_INFOGRAPHIES_5PENNYAI.md
```

### Références techniques complémentaires

```text
GUIDE_DEVELOPPEMENT_MVP_2_1_GENERATION_IMAGES_ARTICLES_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_1_2_THUMBNAILS_RESSOURCES_IA.md
CONCEPTION_GENERATEUR_THUMBNAILS_V3.md
PROMPT_COUVERTURES_ARTICLES_5PENNYAI_V2.md
```

Le guide MVP 2.1 demeure une référence de contexte seulement. Cette phase avait tenté de produire une identité visuelle commune à partir d’instructions textuelles. Le MVP 4.1 ne doit pas réactiver cette approche telle quelle : la nouvelle source de cohérence est l’infographie compagnon réelle de chaque article.

### Hiérarchie des responsabilités

- Le **contrat JSON Articles v1** définit le média, sa clé, son type, son brief, son ratio, son texte alternatif et ses sources éventuelles.
- Le **generationBrief** du média détermine ce qui doit être représenté.
- L’**infographie compagnon** détermine la grammaire visuelle à reprendre.
- Le **guide de style des infographies 5PennyAi** demeure la référence générale de l’identité graphique.
- Le **MVP 4.0** fournit le modèle technique déjà validé pour utiliser l’infographie comme référence d’une génération d’image.
- Le **MVP 2.0** demeure la source de vérité pour les assets de médias internes et leur association à `mediaKey`.
- Le serveur demeure la source de vérité pour les données, les chemins, l’authentification, les prompts et le choix du modèle.
- Christian conserve la décision finale sur chaque image produite.

---

## 3. Contexte

Les articles possèdent maintenant trois familles d’assets visuels :

```text
Couverture 16:9
→ catalogue
→ en-tête public
→ Open Graph

Infographie compagnon 4:5 ou 2:3
→ synthèse globale de l’article
→ téléchargement
→ référence visuelle

Médias internes
→ explications locales dans le corps
→ media[].key
→ {{media:key}}
```

Le MVP 4.0 a résolu une partie importante du problème de cohérence visuelle : la couverture peut désormais être générée depuis l’infographie compagnon plutôt que depuis le texte seul.

Le problème restant concerne les médias internes. Ceux-ci peuvent être pertinents sur le plan pédagogique, mais présenter une identité différente de la couverture et de l’infographie lorsque leur génération repose uniquement sur un prompt textuel.

Cela affaiblit la cohérence globale de l’article :

```text
Couverture cohérente avec l’infographie
→ oui

Médias internes cohérents avec l’infographie
→ pas garanti
```

Le MVP 4.1 applique donc le même principe de référence visuelle aux médias internes.

---

## 4. Objectif du MVP 4.1

Permettre à Christian de générer ou régénérer les médias internes d’un article à partir de leur brief existant, tout en utilisant l’infographie compagnon comme référence de style.

À la fin du MVP, Christian doit pouvoir :

1. ouvrir un article enregistré;
2. voir les médias internes déclarés dans `media[]`;
3. constater quels médias sont générables;
4. voir si une infographie compagnon est disponible;
5. cliquer sur `Générer depuis l’infographie` pour un média sans fichier;
6. cliquer sur `Régénérer depuis l’infographie` pour un média existant;
7. utiliser le `generationBrief` réel du média;
8. utiliser l’infographie compagnon comme référence visuelle;
9. associer automatiquement le résultat à la bonne `mediaKey`;
10. voir immédiatement le média dans l’administration;
11. voir le média au bon emplacement dans l’aperçu de l’article;
12. conserver l’ancien média si une génération échoue;
13. continuer à téléverser manuellement un fichier;
14. continuer à supprimer ou remplacer un média;
15. conserver les `chart` et `screenshot` en upload manuel;
16. constater que le contenu Markdown, le manifeste, les sources, les citations et le statut restent inchangés;
17. obtenir des médias visuellement cohérents avec l’infographie et la couverture;
18. conserver des compositions adaptées à chaque brief plutôt qu’une copie de l’infographie.

Principe central :

> **Le generationBrief définit le contenu du média. L’infographie compagnon définit son langage visuel.**

---

## 5. Principe fondamental — contenu et style

Le MVP 4.1 doit séparer explicitement deux responsabilités.

### 5.1 Autorité sur le contenu

Le contenu à représenter provient du média déclaré dans le contrat JSON :

```text
media.key
media.kind
media.title
media.caption
media.altText
media.generationBrief
media.preferredAspectRatio
media.sourceKeys
```

Le `generationBrief` est l’autorité principale sur :

- les concepts à représenter;
- les relations entre les éléments;
- les étapes d’un processus;
- les comparaisons;
- les libellés nécessaires;
- les contraintes factuelles;
- la composition pédagogique souhaitée.

### 5.2 Autorité sur le style

L’infographie compagnon sert de référence pour :

- la palette réelle;
- le langage des contours;
- les formes;
- les aplats de couleur;
- les cartes et encadrés;
- le style des flèches et connecteurs;
- les pictogrammes;
- les doodles;
- la densité visuelle;
- le niveau de simplification;
- la personnalité éditoriale;
- le niveau général de finition.

### 5.3 Règle de priorité

En cas de divergence :

```text
generationBrief
→ priorité sur ce qui doit être représenté

infographie compagnon
→ priorité sur la manière de le représenter visuellement
```

Le modèle ne doit pas utiliser l’infographie comme source de faits supplémentaires ni remplacer le brief par une interprétation de l’image.

---

## 6. Ce que l’infographie peut et ne peut pas influencer

### 6.1 À reprendre

Le média généré peut reprendre :

- les couleurs dominantes;
- la manière d’utiliser Navy, Blue, Teal, Violet et Orange;
- l’épaisseur et le caractère des traits;
- les formes de cartes;
- les arrondis;
- les encadrés;
- le style des flèches;
- les pictogrammes techniques;
- les accents doodle;
- les textures légères;
- la proportion entre surfaces claires et aplats colorés;
- le niveau de simplification;
- la qualité éditoriale générale.

### 6.2 À ne pas recopier automatiquement

Le média ne doit pas reprendre mécaniquement :

- la mise en page complète de l’infographie;
- son en-tête;
- son pied de page;
- son titre principal;
- son branding;
- ses sources;
- ses autres sections;
- ses blocs sans rapport avec le brief;
- la même métaphore si elle ne convient pas au média;
- la même hiérarchie si le média exige une structure différente.

### 6.3 Pas de recadrage déguisé

Le résultat ne doit jamais être :

- un crop de l’infographie;
- un extrait agrandi;
- une reproduction partielle de plusieurs cartes de l’infographie;
- une miniature verticale placée dans un canevas horizontal;
- un collage d’éléments de l’infographie sans nouvelle composition.

Le média doit être une nouvelle image conçue pour son propre rôle pédagogique.

---

## 7. Types de médias pris en charge

Le contrat JSON Articles v1 définit :

```text
diagram
illustration
infographic
chart
screenshot
```

### 7.1 Types générables

```text
diagram
→ oui

illustration
→ oui

infographic
→ oui, avec prudence
```

### 7.2 Types non générables dans ce MVP

```text
chart
→ upload manuel seulement

screenshot
→ upload manuel seulement
```

Raison :

- un graphique doit reposer sur des données réelles et vérifiées;
- une capture doit représenter une interface ou un résultat réel;
- une référence stylistique ne justifie pas d’inventer des données ou une interface.

### 7.3 Type inconnu

Une valeur inconnue est refusée proprement par la génération.

L’upload manuel reste disponible.

---

## 8. Expérience administrative cible

Chaque carte de média interne existante conserve ses fonctions actuelles et reçoit une nouvelle action conditionnelle.

### 8.1 Média générable sans fichier

Afficher :

```text
[Générer depuis l’infographie]
[Téléverser un fichier]
```

### 8.2 Média générable avec fichier

Afficher :

```text
[Régénérer depuis l’infographie]
[Remplacer par un fichier]
[Supprimer]
```

### 8.3 Article sans infographie compagnon

La génération n’est pas disponible.

Afficher un message court :

> Ajoutez d’abord une infographie de synthèse pour générer ce média à partir de son style.

L’upload manuel reste disponible.

### 8.4 Brief manquant

La génération est refusée.

Afficher :

> Ce média ne possède pas de brief de génération.

### 8.5 Type non générable

Pour `chart` et `screenshot` :

```text
Génération depuis l’infographie
→ indisponible

Upload manuel
→ disponible
```

Le message doit expliquer brièvement pourquoi le type exige un fichier réel ou des données vérifiées.

### 8.6 États indépendants

Chaque média possède son propre état :

```text
Prêt
Génération en cours
Génération réussie
Génération échouée
Indisponible sans infographie
Brief manquant
Type non générable
```

Une génération sur `media-a` ne doit pas bloquer inutilement `media-b`.

---

## 9. Endpoint recommandé

Forme recommandée :

```text
POST /api/generate-article-media-from-infographic
```

Entrée minimale :

```json
{
  "articleId": "uuid",
  "mediaKey": "flux-rag"
}
```

Le client ne transmet pas :

- le prompt;
- le `generationBrief`;
- le titre;
- le `kind`;
- le ratio;
- le chemin de l’infographie;
- le chemin du média existant;
- une URL signée;
- le modèle;
- la version du style;
- le statut.

Le serveur récupère toutes les données réelles.

### 9.1 Pourquoi un endpoint spécialisé

Le rôle est suffisamment distinct de la génération de couverture pour justifier un contrat clair :

```text
cover_from_infographic
→ produit cover_path

media_from_infographic
→ produit article_media_assets[mediaKey]
```

Une extraction partagée de logique technique est permise, mais l’API ne doit pas devenir un générateur d’assets universel difficile à raisonner.

---

## 10. Pipeline serveur

Le traitement cible est :

```text
articleId + mediaKey
        ↓
authentification admin
        ↓
validation stricte de l’entrée
        ↓
récupération de l’article
        ↓
vérification du statut autorisé
        ↓
vérification de infographic_path
        ↓
résolution de media[mediaKey]
        ↓
validation kind + generationBrief + ratio
        ↓
récupération du média actif existant
        ↓
récupération de l’infographie compagnon
        ↓
construction du prompt versionné
        ↓
images.edit ou mécanisme équivalent
        ↓
validation du résultat
        ↓
normalisation au ratio demandé
        ↓
conversion WebP lorsque appropriée
        ↓
upload sous nouveau UUID
        ↓
mise à jour article_media_assets
        ↓
actualisation de l’administration
        ↓
suppression de l’ancien fichier en meilleur effort
```

Le serveur doit réutiliser autant que possible la chaîne technique déjà implantée pour la couverture dérivée du MVP 4.0.

---

## 11. Prompt versionné

Nom recommandé :

```text
article-media-from-infographic-v1
```

Profils fonctionnels recommandés :

```text
article-diagram-from-infographic-v1
article-illustration-from-infographic-v1
article-infographic-from-infographic-v1
```

### 11.1 Ordre d’assemblage

```text
1. rôle du média interne
2. type fonctionnel du média
3. generationBrief — autorité sur le contenu
4. contexte éditorial minimal
5. infographie compagnon — autorité sur le style
6. ratio et zone sûre
7. politique de texte
8. contraintes de sortie
```

### 11.2 Règle centrale du prompt

Le prompt doit contenir explicitement une règle équivalente à :

> Utilise l’infographie fournie uniquement comme référence de grammaire visuelle : palette, formes, traits, pictogrammes, doodles, densité et niveau de finition. Ne copie pas sa composition. Ne récupère pas son contenu pour remplacer le brief. Le `generationBrief` du média est la source de vérité sur ce qui doit être représenté.

### 11.3 Contexte éditorial minimal

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
- les sources complètes;
- les URL;
- les citations;
- le SEO;
- le slug;
- les chemins de stockage;
- le statut;
- les données administratives;
- le brief de couverture.

### 11.4 sourceKeys

`media.sourceKeys` peut servir à confirmer que le média est lié à des sources précises, mais les sources complètes ne doivent pas être envoyées au modèle dans le MVP 4.1 sauf nécessité démontrée.

Si un média exige des données précises que son brief ne contient pas, le générateur doit refuser ou produire une erreur claire plutôt que d’inventer l’information.

---

## 12. Politique de texte dans les médias

Contrairement à la couverture, le titre complet de l’article n’est pas obligatoire dans les médias internes.

Le média peut contenir :

- quelques libellés courts;
- des noms d’étapes;
- des noms de composants;
- un mot ou une courte expression nécessaire à une comparaison;
- des nombres seulement lorsqu’ils proviennent explicitement du brief.

Il ne doit pas contenir :

- le titre de l’article par défaut;
- un sous-titre de l’article;
- un paragraphe;
- une longue liste;
- du pseudo-texte;
- du microtexte;
- une bibliographie;
- des sources;
- des URL;
- des marqueurs de citations;
- du texte simplement copié de l’infographie.

Si le modèle produit des erreurs fréquentes dans les libellés, une composition déterministe du texte pourra être réévaluée plus tard. Elle n’est pas exigée dans le MVP 4.1.

---

## 13. Formats et normalisation

Le ratio provient de :

```text
media.preferredAspectRatio
```

Valeurs permises du contrat :

```text
16:9
4:3
1:1
4:5
```

### 13.1 Règles

- produire une image finale au ratio attendu;
- ne pas étirer l’image;
- ne pas ajouter de bandes artificielles;
- ne pas utiliser `contain` avec un fond différent;
- conserver les éléments essentiels dans une zone sûre;
- ne pas couper un libellé important;
- ne pas couper une relation ou une flèche essentielle;
- privilégier un recadrage contrôlé lorsque nécessaire;
- refuser un résultat si la normalisation détruit l’information pédagogique.

### 13.2 Dimensions finales

L’inspection doit confirmer les dimensions normalisées actuellement utilisées par l’application pour les différents ratios.

Ne pas inventer une nouvelle politique de tailles si les helpers existants peuvent être réutilisés.

### 13.3 Format de fichier

WebP demeure recommandé lorsque la chaîne actuelle le permet.

Le résultat doit rester adapté au Web et raisonnablement léger.

---

## 14. Stockage et persistance

Le MVP 4.1 ne prévoit **aucune migration par défaut**.

Les médias internes utilisent déjà une structure spécialisée permettant d’associer :

```text
article_id
media_key
storage_path
```

La nouvelle génération remplit le même emplacement fonctionnel que l’upload manuel.

Forme conceptuelle :

```text
articles/{articleId}/media/{mediaKey}/{uuid}.webp
```

Le chemin réel existant dans le dépôt demeure la source de vérité.

### 14.1 Remplacement sûr

Séquence obligatoire :

```text
1. générer le nouveau fichier
2. valider le résultat
3. normaliser le fichier
4. téléverser sous un nouveau chemin
5. mettre à jour l’asset de la mediaKey
6. actualiser l’administration
7. supprimer l’ancien fichier en meilleur effort
```

Ne jamais supprimer l’ancien média avant la réussite complète des étapes critiques.

### 14.2 Réimportation

Une réimportation JSON continue de :

- conserver les fichiers existants;
- rapprocher les médias par `key`;
- ne pas supprimer automatiquement un asset devenu orphelin;
- ne pas déclencher automatiquement une régénération.

---

## 15. Sécurité

Règles minimales :

- endpoint réservé à l’administrateur autorisé;
- clé fournisseur uniquement côté serveur;
- validation stricte de `articleId`;
- validation stricte de `mediaKey`;
- article récupéré côté serveur;
- média résolu depuis le manifeste réel;
- `kind` récupéré côté serveur;
- ratio récupéré côté serveur;
- brief récupéré côté serveur;
- chemin d’infographie récupéré côté serveur;
- chemin du média actif récupéré côté serveur;
- aucun prompt libre accepté;
- aucun chemin client accepté;
- aucune URL signée fournie par le client;
- aucune modification du statut de l’article;
- aucun brouillon rendu public;
- aucune source privée exposée dans l’interface publique;
- aucune route générique de fichiers créée.

La protection doit suivre le mécanisme réel déjà utilisé par l’endpoint du MVP 4.0.

---

## 16. Gestion des erreurs

### Article inexistant

- aucune génération;
- aucune création implicite;
- message clair.

### Article non enregistré

- bouton désactivé;
- aucune requête.

### Infographie absente

- génération refusée;
- ancien média conservé;
- upload manuel disponible.

### Infographie introuvable dans le stockage

- génération refusée;
- aucun asset modifié;
- erreur contrôlée.

### mediaKey inconnue

- génération refusée;
- aucun média créé arbitrairement.

### Brief absent

- génération refusée;
- upload manuel disponible.

### Type non générable

- génération refusée;
- message clair;
- upload manuel disponible.

### Erreur fournisseur

- ancien média conservé;
- statut inchangé;
- autres médias utilisables;
- nouvelle tentative possible.

### Réponse image invalide

Exemples :

- réponse sans image;
- fichier vide;
- MIME inattendu;
- ratio inutilisable;
- erreur de décodage.

Comportement :

- ne pas mettre à jour l’asset;
- conserver l’ancien;
- nettoyer le nouvel asset temporaire si nécessaire;
- retourner une erreur contrôlée.

### Upload échoué

- ancien média conservé;
- aucune référence invalide.

### Mise à jour DB échouée

- ancien média conservé;
- nettoyage du nouvel asset en meilleur effort.

### Nettoyage de l’ancien fichier échoué

- garder la nouvelle référence valide;
- journaliser l’orphelin;
- ne pas annuler une génération autrement réussie.

### Double clic ou concurrence simple

- désactiver l’action concernée pendant la requête;
- éviter deux remplacements simultanés pour la même `mediaKey`;
- ne pas construire un système de verrouillage complexe sans nécessité démontrée.

---

## 17. Journalisation minimale

Journaliser seulement ce qui aide au diagnostic :

```text
articleId
mediaKey
kind
action = media_from_infographic
version du prompt
profil utilisé
modèle utilisé
ratio demandé
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
- le prompt complet si cela expose inutilement du contenu éditorial.

Aucun historique persistant de générations n’est requis.

---

## 18. Cohérence visuelle attendue

Le but n’est pas que toutes les images soient identiques.

Le but est que :

```text
Couverture
Infographie compagnon
Médias internes
```

partagent la même grammaire visuelle.

Les éléments cohérents peuvent inclure :

- palette;
- contours;
- niveau de simplification;
- pictogrammes;
- doodles;
- formes;
- densité;
- traitement des cartes;
- typographie générale;
- qualité de finition.

La composition doit rester déterminée par le contenu du média.

### 18.1 Exemples

Un média de type `diagram` peut devenir :

```text
flux horizontal
architecture
cycle
arbre de décision
```

selon son brief.

Un média de type `illustration` peut devenir :

```text
métaphore visuelle
objet technique stylisé
composition conceptuelle
```

Un média de type `infographic` peut être plus riche, mais doit rester distinct de l’infographie compagnon globale de l’article.

---

# 19. Découpage du développement

Le MVP 4.1 est découpé en **trois incréments fonctionnels**, précédés d’une inspection ciblée.

```text
Inspection
→ génération serveur
→ interface administrative
→ cohérence visuelle et finalisation
```

---

## Incrément 0 — Inspection ciblée

### Objectif

Confirmer l’état réel du dépôt après la clôture du MVP 4.0 et déterminer la plus petite implantation fiable pour générer les médias internes depuis l’infographie compagnon.

### Documents à lire

```text
GUIDE_DEVELOPPEMENT_MVP_4_1_MEDIAS_INTERNES_DEPUIS_INFOGRAPHIE_RESSOURCES_IA.md
GUIDE_DEVELOPPEMENT_MVP_4_0_INFOGRAPHIES_ARTICLES_RESSOURCES_IA.md
CONTRAT_JSON_ARTICLES_5PENNYAI_V1.md
GUIDE_DEVELOPPEMENT_MVP_2_0_ARTICLES_RESSOURCES_IA.md
GUIDE_STYLE_INFOGRAPHIES_5PENNYAI.md
GUIDE_DEVELOPPEMENT_MVP_2_1_GENERATION_IMAGES_ARTICLES_RESSOURCES_IA.md
```

### À inspecter

- état Git, branche, remotes et derniers commits;
- état réel et clôture du MVP 4.0;
- endpoint réel de couverture depuis l’infographie;
- contrat exact de cet endpoint;
- authentification et autorisation;
- récupération réelle de l’infographie depuis le bucket privé;
- appel `images.edit` ou équivalent;
- client OpenAI réel;
- modèle utilisé;
- transformation des fichiers source avant l’appel;
- récupération du résultat;
- validation du MIME;
- conversion WebP;
- normalisation 16:9;
- limite Vercel réellement utilisée;
- gestion des erreurs fournisseur;
- structure actuelle de `articles.media`;
- structure réelle de `article_media_assets`;
- helpers de résolution `articleId + mediaKey`;
- fonctions d’upload manuel d’un média;
- fonctions de remplacement sûr;
- nettoyage des anciens fichiers;
- comportement de réimportation;
- composants administratifs des cartes de médias;
- états de chargement actuels;
- ratios réellement présents dans les articles existants;
- types `kind` réellement présents;
- tests existants;
- traductions FR et EN.

### Questions à résoudre

1. Quelle logique exacte du générateur de couverture peut être réutilisée?
2. Une extraction partagée minimale de `images.edit` est-elle utile?
3. Où placer le constructeur de prompt des médias?
4. Faut-il un endpoint spécialisé ou un mode contrôlé d’un endpoint existant?
5. Comment résoudre strictement `mediaKey` contre le manifeste réel?
6. Comment réutiliser la logique d’upload/remplacement des médias existants?
7. Comment normaliser chacun des ratios permis?
8. Quelles dimensions finales sont déjà utilisées pour 16:9, 4:3, 1:1 et 4:5?
9. Comment préserver l’ancien asset en cas d’échec?
10. Comment gérer les états indépendants par média dans l’interface?
11. Une migration est-elle réellement nécessaire?
12. Quels médias réels serviront de banc d’essai?
13. Quels risques de durée proviennent de l’utilisation d’une infographie verticale comme référence?
14. Quels tests peuvent être partagés avec la couverture dérivée?

### Décisions attendues

Le rapport doit préciser :

- fichiers exacts à modifier;
- fonctions exactes à réutiliser;
- éventuelle extraction partagée minimale;
- endpoint retenu;
- contrat exact d’entrée;
- stratégie de récupération de l’infographie;
- stratégie de résolution du média;
- profils de prompt retenus;
- stratégie de ratio;
- stockage retenu;
- besoin ou absence de migration;
- risques et mesures de mitigation;
- périmètre précis de l’incrément 1.

### Résultat visible

Aucun changement public ou administratif.

### Hors périmètre

- aucune modification de code;
- aucune migration;
- aucune dépendance;
- aucun appel réel au modèle;
- aucune génération;
- aucun commit;
- aucun push.

### Critères d’acceptation

- le MVP 4.0 est confirmé fonctionnel;
- le pipeline `infographie → couverture` est documenté;
- le stockage des médias internes est documenté;
- le chemin de réutilisation est clair;
- le besoin de migration est explicitement tranché;
- aucune architecture générique disproportionnée n’est proposée;
- le périmètre de l’incrément 1 est précis.

---

## Incrément 1 — Génération serveur d’un média depuis l’infographie

### Objectif

Implanter le pipeline serveur permettant de générer un média interne déclaré en utilisant son brief comme source de contenu et l’infographie compagnon comme référence visuelle.

### Inclus

- endpoint spécialisé `POST /api/generate-article-media-from-infographic` ou solution équivalente validée à l’inspection;
- contrat minimal `{ articleId, mediaKey }`;
- authentification administrative;
- validation stricte de l’UUID;
- récupération serveur de l’article;
- validation de l’état autorisé;
- validation de la présence de l’infographie;
- récupération serveur de l’infographie;
- résolution stricte de `mediaKey` dans le manifeste réel;
- validation du `generationBrief`;
- validation de `kind`;
- validation de `preferredAspectRatio`;
- support initial : `diagram`, `illustration`, `infographic`;
- refus de `chart` et `screenshot`;
- prompt versionné `article-media-from-infographic-v1`;
- profils fonctionnels spécialisés;
- appel au modèle avec l’infographie comme référence;
- production d’une seule image;
- validation de la réponse;
- normalisation au ratio attendu;
- conversion WebP lorsque possible;
- stockage sous un nouveau UUID;
- mise à jour sûre de l’asset associé à la `mediaKey`;
- conservation de l’ancien média en cas d’échec;
- nettoyage de l’ancien fichier en meilleur effort;
- journalisation minimale;
- tests ciblés sans appel réel au modèle.

### Résultat visible

> Un appel authentifié avec `articleId + mediaKey` peut produire un nouvel asset correctement associé au média déclaré, en utilisant l’infographie comme référence visuelle.

### Hors périmètre

- interface finale;
- génération automatique de tous les médias;
- génération en lot;
- plusieurs variantes;
- édition interactive;
- génération de graphiques;
- fabrication de captures;
- modification du contrat JSON;
- nouvelle table de médias;
- historique de versions;
- prompt libre;
- nouvelle médiathèque.

### Critères d’acceptation fonctionnels

- l’endpoint refuse un utilisateur non autorisé;
- l’endpoint refuse un UUID invalide;
- l’article doit exister;
- l’infographie compagnon doit exister;
- la `mediaKey` doit exister;
- le brief doit exister;
- le type doit être pris en charge;
- le ratio doit être valide;
- le client ne peut fournir ni prompt, ni chemin, ni type, ni ratio;
- une seule image est générée;
- le résultat est associé à la bonne clé;
- l’ancien média reste actif en cas d’échec;
- le contenu de l’article reste inchangé;
- le manifeste reste inchangé;
- le statut reste inchangé;
- aucune publication n’est déclenchée;
- aucune migration n’est ajoutée sauf nécessité démontrée par l’inspection.

### Critères d’acceptation visuels

Pour les essais réels ultérieurs, le prompt doit déjà viser :

- style cohérent avec l’infographie;
- nouvelle composition adaptée au brief;
- absence de crop déguisé;
- absence de sources et URL;
- absence de microtexte;
- absence de 3D générique;
- respect des libellés utiles;
- aucune donnée inventée.

### Tests ciblés recommandés

- utilisateur non autorisé;
- UUID invalide;
- article inexistant;
- article sans infographie;
- infographie absente du stockage;
- mediaKey inconnue;
- brief absent;
- kind `diagram`;
- kind `illustration`;
- kind `infographic`;
- refus `chart`;
- refus `screenshot`;
- ratio inconnu;
- assemblage du prompt;
- absence de données inutiles;
- réponse fournisseur invalide;
- normalisation du ratio;
- upload échoué;
- mise à jour DB échouée;
- conservation de l’ancien asset;
- nettoyage de l’ancien fichier.

### Vérification manuelle

Après implantation technique :

- exécuter une génération contrôlée sur un média représentatif si autorisé;
- vérifier le nouvel asset en stockage;
- vérifier la ligne liée à `articleId + mediaKey`;
- confirmer que l’ancien asset est conservé lors d’une erreur simulée;
- confirmer que l’infographie source est intacte.

---

## Incrément 2 — Interface administrative de génération

### Objectif

Ajouter la génération depuis l’infographie aux cartes de médias existantes sans perturber l’upload manuel ou les autres fonctions du formulaire.

### Inclus

- bouton `Générer depuis l’infographie`;
- bouton `Régénérer depuis l’infographie` lorsqu’un asset existe;
- disponibilité conditionnelle selon :
  - article enregistré;
  - infographie présente;
  - mediaKey valide;
  - brief présent;
  - type générable;
- états de chargement indépendants par média;
- prévention du double clic;
- messages de succès et d’erreur;
- mise à jour immédiate de l’aperçu du média;
- maintien de `Téléverser` / `Remplacer`;
- maintien de `Supprimer`;
- indication claire pour `chart` et `screenshot`;
- indication claire si l’infographie manque;
- indication claire si le brief manque;
- traductions FR et EN;
- accessibilité clavier;
- statut accessible lors de la génération;
- responsive;
- tests ciblés.

### Résultat visible

> Christian ouvre un article, choisit un média déclaré, clique sur `Générer depuis l’infographie` et voit le résultat apparaître automatiquement dans la carte du média et dans l’aperçu de l’article.

### Hors périmètre

- génération de tous les médias en un clic;
- génération automatique après import;
- génération automatique après upload d’une infographie;
- comparaison de variantes;
- prompt éditable;
- choix du modèle;
- historique;
- nouvelle page administrative;
- refonte du renderer public.

### Critères d’acceptation

- un média générable sans fichier propose `Générer depuis l’infographie`;
- un média générable avec fichier propose `Régénérer depuis l’infographie`;
- un article sans infographie n’offre pas une action trompeuse;
- un `chart` n’offre pas de génération active;
- un `screenshot` n’offre pas de génération active;
- un brief manquant est signalé;
- la génération d’un média ne bloque pas les autres cartes;
- le résultat met à jour la bonne carte;
- l’aperçu administratif utilise le nouvel asset;
- une erreur conserve l’ancien média;
- l’upload manuel continue de fonctionner;
- la suppression continue de fonctionner;
- une réimportation continue de préserver les assets;
- le contenu Markdown n’est pas modifié;
- le manifeste n’est pas modifié;
- le statut n’est pas modifié;
- le parcours fonctionne à 1440, 768 et environ 390 px;
- le build et les tests ciblés réussissent.

### Tests ciblés recommandés

- état sans infographie;
- état avec infographie;
- état sans brief;
- état `chart`;
- état `screenshot`;
- génération réussie;
- régénération réussie;
- erreur initiale;
- erreur de régénération;
- conservation de l’ancien aperçu;
- deux médias dans le même article;
- état indépendant de chargement;
- double clic;
- navigation clavier;
- traduction FR/EN.

### Vérification manuelle

Tester au minimum :

- un article avec deux médias générables;
- génération du premier média;
- génération du second média;
- régénération du premier;
- upload manuel sur le second après génération;
- suppression d’un média;
- erreur simulée;
- vérification de l’aperçu;
- administration sur desktop, tablette et mobile.

---

## Incrément 3 — Cohérence visuelle, robustesse et finalisation

### Objectif

Valider que les médias générés depuis l’infographie sont pédagogiquement exacts, visuellement cohérents et suffisamment variés, puis corriger uniquement les problèmes révélés par les essais réels.

### Banc d’essai minimal

Tester au minimum quatre médias couvrant des familles différentes :

```text
1 flux ou pipeline
1 comparaison
1 illustration conceptuelle
1 architecture, cycle ou décomposition
```

Utiliser idéalement plusieurs articles afin d’éviter de valider le système sur une seule infographie.

### Évaluation individuelle

Chaque média doit être évalué sur deux axes distincts.

#### Exactitude pédagogique

- respecte le `generationBrief`;
- relations correctes;
- direction des flèches correcte;
- étapes correctes;
- libellés utiles corrects;
- aucune donnée inventée;
- aucun élément central absent;
- aucune interprétation provenant de l’infographie qui contredit le brief.

#### Cohérence visuelle

- palette cohérente avec l’infographie source;
- contours cohérents;
- formes cohérentes;
- doodles cohérents;
- niveau de simplification comparable;
- niveau de finition comparable;
- pas de 3D générique;
- pas de copie directe de la mise en page de l’infographie;
- composition adaptée à la fonction du média.

### Évaluation de collection

Comparer pour chaque article :

```text
Couverture générée depuis l’infographie
Infographie compagnon
Médias internes générés depuis l’infographie
```

La collection doit sembler cohérente sans devenir répétitive.

### Inclus

- essais réels sur plusieurs médias;
- comparaison avec les briefs;
- comparaison avec les infographies sources;
- comparaison avec les couvertures dérivées;
- ajustements limités du prompt commun;
- ajustements limités des profils;
- correction des problèmes de ratio;
- correction des problèmes de zone sûre;
- correction des problèmes de texte;
- validation du poids des fichiers;
- validation du remplacement sûr;
- validation des erreurs;
- validation de la journalisation;
- petites corrections UX directement liées à la génération;
- build;
- lint ciblé;
- tests ciblés;
- documentation des limites restantes.

### Résultat visible

> Les couvertures, infographies compagnons et médias internes des articles semblent provenir du même studio éditorial, tout en respectant le rôle pédagogique propre à chaque image.

### Hors périmètre

- nouvelle version majeure du guide de style;
- changement de fournisseur sans nécessité démontrée;
- génération en lot;
- historique de versions;
- plusieurs variantes simultanées;
- comparaison automatique de variantes;
- éditeur graphique;
- éditeur de prompt;
- génération de graphiques;
- fabrication de captures;
- génération automatique après modification du brief;
- détection automatique d’un média périmé;
- modification du contrat JSON.

### Critères d’acceptation visuels

- chaque média respecte son brief;
- chaque média est clairement relié visuellement à l’infographie source;
- les médias ne sont pas de simples crops;
- au moins trois familles de compositions sont visibles dans le banc d’essai;
- aucune disposition unique ne domine l’ensemble;
- la palette reste cohérente;
- les contours restent cohérents;
- les doodles restent discrets;
- les libellés utiles restent lisibles;
- aucune source ou URL n’apparaît;
- aucun microtexte ne domine;
- aucune image ne dérive vers la 3D ou l’esthétique IA générique;
- aucun fait ou chiffre n’est inventé;
- les médias restent lisibles dans le corps des articles;
- Christian valide la cohérence dans le site réel.

### Critères d’acceptation techniques

- les anciens assets sont conservés lors d’un échec;
- les bonnes `mediaKey` sont toujours utilisées;
- aucun asset orphelin évident n’est créé dans les scénarios normaux;
- les ratios finaux sont corrects;
- les poids restent raisonnables;
- les clés et prompts restent côté serveur;
- aucun chemin client n’est accepté;
- aucun prompt libre n’est exposé;
- les brouillons restent invisibles;
- le contenu éditorial reste inchangé;
- le build réussit;
- le lint ciblé réussit;
- les tests ciblés réussissent;
- le dépôt ne contient aucune modification étrangère au MVP 4.1.

### Finalisation

À la fin de l’incrément :

- conserver seulement les médias validés;
- documenter la version du prompt utilisée;
- documenter les types pris en charge;
- documenter les limites du texte généré;
- documenter les limites de ratio observées;
- vérifier les assets orphelins évidents;
- vérifier l’état Git;
- ne pas régénérer automatiquement les médias des autres articles;
- préparer la clôture du MVP 4.1 après validation fonctionnelle et visuelle de Christian.

---

## 20. Tableau de progression

| Incrément | Résultat fonctionnel | État | Commit |
|---|---|---|---|
| 0 | Inspection du pipeline de génération et des médias existants | Accepté | — |
| 1 | Génération serveur d’un média depuis l’infographie | Accepté | — |
| 2 | Interface Générer/Régénérer sur les médias internes | Accepté | — |
| 3 | Cohérence visuelle, robustesse et finalisation | Accepté | — |

États recommandés :

```text
À faire
En cours
À valider
Accepté
Bloqué
```

---

## 21. Discipline pour chaque session Codex

Chaque prompt Codex doit préciser :

1. le résultat visible attendu;
2. les documents de référence à lire;
3. l’état Git requis;
4. l’incrément unique à réaliser;
5. les fichiers ou zones à inspecter;
6. les éléments inclus;
7. les éléments hors périmètre;
8. les invariants du contrat JSON;
9. les invariants des médias existants;
10. les invariants de l’infographie compagnon;
11. les invariants de génération d’image;
12. les invariants de stockage;
13. les invariants de sécurité;
14. les validations techniques;
15. les appels réels au modèle autorisés ou interdits;
16. le scénario manuel à vérifier;
17. le rapport final attendu;
18. l’interdiction de commit ou push sauf demande explicite.

Le rapport final doit contenir :

- résultat obtenu;
- décisions techniques;
- fichiers créés ou modifiés;
- migration éventuelle et justification;
- endpoint et contrat d’entrée;
- prompt et profils utilisés;
- données transmises au modèle;
- stratégie de référence visuelle;
- stratégie de ratio;
- stockage et remplacement;
- association à la mediaKey;
- sécurité et authentification;
- types de médias pris en charge;
- comportement des types refusés;
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
- modifier le contrat JSON Articles v1;
- modifier silencieusement `media[]`;
- créer une nouvelle mediaKey;
- générer un média absent du manifeste;
- accepter un prompt libre;
- accepter un chemin de stockage fourni par le client;
- générer un `chart` librement;
- fabriquer un `screenshot`;
- lancer une génération en lot;
- régénérer automatiquement les médias existants;
- créer une médiathèque générique;
- créer un générateur universel d’assets;
- refactoriser des zones étrangères;
- ajouter une dépendance majeure sans justification issue de l’inspection;
- effectuer un commit ou un push sans demande explicite.

---

## 22. Invariants critiques

Pendant tout le MVP 4.1 :

- le MVP 4.0 continue de fonctionner;
- l’infographie compagnon reste intacte;
- la couverture reste indépendante des médias internes;
- le contrat JSON Articles v1 reste inchangé;
- les médias restent associés par `mediaKey`;
- le `generationBrief` reste la source de vérité du contenu visuel;
- l’infographie reste la source de vérité du style visuel;
- l’infographie ne devient pas une source factuelle supplémentaire;
- une réimportation ne supprime pas les médias;
- une réimportation ne déclenche pas de génération;
- l’upload manuel reste disponible;
- l’absence d’infographie ne bloque pas l’édition ou la publication;
- l’absence d’un média ne bloque pas automatiquement la publication;
- une génération échouée ne supprime jamais un asset valide;
- l’ancien média n’est supprimé qu’après succès complet;
- le serveur récupère le média réel;
- le serveur récupère le brief réel;
- le serveur récupère le ratio réel;
- le serveur récupère le type réel;
- le serveur récupère l’infographie réelle;
- le client ne transmet pas de prompt libre;
- le client ne transmet pas de chemin;
- `diagram`, `illustration` et `infographic` sont les seuls types générables dans cette phase;
- `chart` reste manuel;
- `screenshot` reste manuel;
- aucune donnée n’est inventée;
- aucune source ou URL n’est demandée dans l’image;
- aucun logo tiers ou filigrane n’est demandé;
- aucun brouillon n’est rendu public;
- la génération ne publie jamais;
- la génération ne modifie jamais `contentMarkdown`;
- la génération ne modifie jamais les sources;
- la génération ne modifie jamais les citations;
- la génération ne modifie jamais le statut;
- les pages publiques continuent d’utiliser les assets associés aux mêmes clés;
- les images existantes ne sont pas régénérées automatiquement;
- aucune génération en lot n’est ajoutée;
- aucune médiathèque générique n’est créée;
- aucune abstraction multi-fournisseurs n’est créée sans besoin réel;
- chaque incrément est validé avant le suivant;
- Christian conserve la décision finale.

---

## 23. Critères de clôture du MVP 4.1

La phase est terminée lorsque Christian peut :

1. ouvrir un article enregistré avec infographie compagnon;
2. voir ses médias internes déclarés;
3. identifier les médias générables;
4. générer un `diagram` depuis l’infographie;
5. générer une `illustration` depuis l’infographie;
6. générer un média `infographic` lorsque pertinent;
7. voir chaque résultat associé à la bonne `mediaKey`;
8. voir chaque résultat au bon emplacement dans l’aperçu;
9. régénérer un média existant;
10. conserver l’ancien média lors d’un échec;
11. utiliser l’upload manuel après une génération;
12. supprimer un média généré;
13. constater qu’un `chart` reste en upload manuel;
14. constater qu’un `screenshot` reste en upload manuel;
15. constater qu’un article sans infographie reste parfaitement éditable;
16. constater qu’un brief manquant empêche seulement la génération concernée;
17. constater que l’infographie source n’est jamais modifiée;
18. constater que la couverture n’est pas modifiée;
19. constater que le contenu Markdown n’est pas modifié;
20. constater que le manifeste n’est pas modifié;
21. constater que les sources et citations ne sont pas modifiées;
22. constater que le statut n’est pas modifié;
23. comparer une couverture, une infographie compagnon et plusieurs médias;
24. reconnaître une identité visuelle commune;
25. constater que les médias conservent des compositions adaptées à leur brief;
26. constater qu’ils ne sont pas de simples crops de l’infographie;
27. vérifier les ratios finaux;
28. vérifier les poids des fichiers;
29. vérifier la conservation des assets lors d’un échec;
30. utiliser l’administration sur ordinateur et mobile;
31. utiliser les actions au clavier;
32. vérifier que les brouillons restent invisibles;
33. exécuter le build avec succès;
34. exécuter le lint ciblé avec succès;
35. exécuter les tests ciblés avec succès;
36. valider fonctionnellement et visuellement le résultat réel.

### Clôture actée

```text
Incrément 0 → Accepté
Incrément 1 → Accepté
Incrément 2 → Accepté
Incrément 3 → Accepté
MVP 4.1 → Terminé
```

- `diagram` a été validé réellement avec un média 4:3 retenu à 44/45 et un remplacement sûr confirmé.
- Les profils `illustration` et `infographic`, ainsi que les ratios 1:1 et 4:5, restent des validations futures non bloquantes.
- Aucune migration n’a été nécessaire et le contrat JSON Articles v1 demeure inchangé.

---

## 24. Évolutions volontairement reportées

À réévaluer seulement après utilisation du MVP 4.1 :

- génération automatique de tous les médias après upload de l’infographie;
- génération automatique après réimportation;
- détection d’un média devenu périmé;
- régénération automatique après modification du brief;
- génération en lot;
- plusieurs variantes par média;
- comparaison et sélection de variantes;
- historique de versions;
- restauration d’un ancien média;
- prompt libre;
- choix du modèle dans l’interface;
- choix du fournisseur;
- édition interactive d’un diagramme;
- composition déterministe de tous les libellés;
- génération de graphiques à partir de données structurées;
- génération de captures réelles par navigateur;
- analyse automatique de la cohérence visuelle;
- évaluation automatique contre le brief;
- détection automatique d’un crop trop proche de l’infographie;
- génération multilingue liée;
- médiathèque globale;
- pipeline asynchrone de génération;
- génération intégrée de l’infographie compagnon elle-même.

Une évolution naturelle après validation du MVP 4.1 pourra être évaluée autour de la **génération intégrée de l’infographie compagnon**, mais elle doit rester distincte du présent MVP.

La priorité du MVP 4.1 reste un flux simple :

```text
Article + infographie compagnon
→ choisir un média déclaré
→ utiliser son brief
→ utiliser l’infographie comme référence visuelle
→ générer
→ vérifier
→ conserver ou régénérer
```
