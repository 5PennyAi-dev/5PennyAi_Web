# Direction visuelle commune — Images d’articles 5PennyAi v1

**Projet :** 5PennyAi  
**Section :** Ressources IA  
**Nom de la direction :** `article-visual-style-v1`  
**Date :** 2 août 2026  
**Statut :** spécification visuelle prête à être intégrée et testée

---

## 1. Rôle du document

Ce document définit la direction visuelle commune de toutes les images générées pour les articles éducatifs de la section **Ressources IA** de 5PennyAi.

Il encadre principalement :

- les couvertures d’articles;
- les diagrammes pédagogiques;
- les illustrations conceptuelles;
- les infographies internes;
- les autres images dérivées qui pourraient être ajoutées ultérieurement.

Son objectif est que toutes les images semblent appartenir à la même collection, même lorsqu’elles remplissent des fonctions différentes et utilisent des compositions différentes.

Principe central :

> Même studio éditorial, même grammaire graphique, compositions adaptées au contenu.

Ce document ne remplace pas le contrat JSON Articles v1. Il fournit la couche visuelle commune que l’application ajoute aux briefs de couverture et de médias contenus dans le JSON.

---

## 2. Sources de référence

La direction `article-visual-style-v1` consolide les décisions déjà établies dans :

```text
GUIDE_STYLE_INFOGRAPHIES_5PENNYAI
PROMPT_COUVERTURES_ARTICLES_5PENNYAI_V2
CONCEPTION_GENERATEUR_THUMBNAILS_V3
CONTRAT_JSON_ARTICLES_5PENNYAI_V1
GRILLE_REVUE_ARTICLES_5PENNYAI_V1
```

Répartition des responsabilités :

```text
Guide de style des infographies
→ identité visuelle 5PennyAi

Prompt de couvertures v2
→ rôle éditorial et contraintes des couvertures

Conception des thumbnails v3
→ simplicité, variété et véritable cadrage

Contrat JSON Articles v1
→ rôles, types, ratios et briefs des assets

Grille de révision Articles v1
→ exactitude, accessibilité et interdictions factuelles
```

En cas de contradiction :

1. les contraintes factuelles et de sécurité ont priorité;
2. le rôle du type d’image a priorité sur une préférence de composition;
3. le socle visuel commun reste obligatoire;
4. le brief propre à l’article détermine le contenu précis à représenter;
5. la liberté créative s’exerce seulement à l’intérieur de ces limites.

---

## 3. Positionnement visuel

Les images d’articles 5PennyAi sont des visuels pédagogiques et éditoriaux consacrés à l’intelligence artificielle, aux données, à l’automatisation et aux technologies connexes.

Elles doivent aider le lecteur à :

- reconnaître rapidement le sujet;
- comprendre un concept ou une relation;
- construire un modèle mental;
- distinguer des approches;
- suivre un flux;
- retenir une idée importante.

Elles ne doivent pas ressembler à :

- une publicité;
- une miniature YouTube;
- une présentation PowerPoint d’entreprise;
- une interface SaaS fictive;
- une illustration d’IA générique;
- une fiche éducative enfantine;
- un rendu 3D promotionnel.

### Priorité éditoriale

```text
FIDÉLITÉ
→ COMPRÉHENSION
→ MÉMORISATION
→ LISIBILITÉ
→ ESTHÉTIQUE
```

### Direction artistique

```text
Editorial tech
+ technical notebook
+ subtle doodle
+ strict flat 2D
```

Le résultat doit paraître :

- plus vivant qu’une documentation technique ordinaire;
- plus structuré qu’un whiteboard;
- plus sérieux qu’une illustration scolaire;
- plus pédagogique qu’une présentation commerciale;
- plus distinctif qu’un visuel générique sur l’intelligence artificielle.

---

## 4. Architecture des instructions de génération

Chaque génération doit assembler quatre couches dans cet ordre :

```text
1. article-visual-style-v1
   → identité visuelle commune obligatoire

2. profil fonctionnel
   → cover | diagram | illustration | infographic

3. contexte éditorial
   → titre, résumé, niveau et autres données utiles

4. generationBrief
   → contenu précis à représenter
```

Un éventuel post-traitement de l’application intervient ensuite :

```text
image générée
→ normalisation du format
→ ajout déterministe du titre si retenu
→ compression
→ stockage
```

Le frontend ne doit pas construire librement le prompt. Le serveur doit récupérer les données réelles de l’article et appliquer les blocs versionnés.

---

# PARTIE A — SOCLE VISUEL COMMUN

## 5. Principes non négociables

Toutes les images produites avec `article-visual-style-v1` doivent partager les caractéristiques suivantes :

- illustration strictement 2D;
- composition frontale;
- fond off-white uniforme et dominant;
- contours Navy nets;
- aplats de couleur;
- formes géométriques simples;
- pictogrammes techniques dessinés de face;
- espaces respirants;
- hiérarchie visuelle claire;
- quelques doodles discrets;
- légère texture éditoriale ou imprimée;
- ton pédagogique, professionnel et calme;
- absence de photoréalisme;
- absence de perspective et de volume.

La cohérence doit provenir de :

- la palette;
- le style des traits;
- le langage des formes;
- le niveau de simplification;
- la typographie;
- les doodles;
- la densité;
- le niveau de finition.

Elle ne doit pas provenir d’une mise en page identique répétée sur toutes les images.

---

## 6. Palette officielle

### Navy — `#143054`

Couleur structurelle principale.

Utilisations :

- titres;
- texte principal;
- contours;
- connecteurs;
- flèches;
- traits structurants;
- doodles principaux.

### Blue — `#4F7CD4`

Accent principal.

Utilisations suggérées :

- modèles;
- applications;
- services;
- composants techniques;
- inférence;
- éléments de confiance.

### Teal — `#14B8A6`

Accent secondaire.

Utilisations suggérées :

- données;
- connaissances;
- recherche;
- connexions;
- intégrations;
- flux d’information.

### Violet — `#8B5CF6`

Accent spécialisé.

Utilisations suggérées :

- agents;
- orchestration;
- raisonnement;
- décisions du système;
- automatisation intelligente.

### Orange — `#DD8737`

Accent focal limité.

Utilisations :

- avertissement;
- décision importante;
- idée clé;
- marque d’emphase;
- annotation doodle;
- point d’attention.

L’Orange ne doit pas devenir une couleur décorative dominante.

### Lavender — `#DBCFEE`

Utilisations :

- zones secondaires;
- regroupements;
- arrière-plans légers;
- contexte visuel discret.

### Off-white — `#F7F5F2`

Fond général obligatoire par défaut.

### White — `#FFFFFF`

Utilisations :

- cartes;
- surfaces principales;
- zones de contenu;
- documents stylisés.

### Règles de couleur

- ne pas introduire de couleur saturée supplémentaire sans nécessité explicite;
- utiliser la couleur pour distinguer, guider ou signaler;
- ne pas utiliser la couleur seulement pour décorer;
- ne pas transmettre une distinction essentielle uniquement par la couleur;
- maintenir un contraste suffisant;
- éviter les grands dégradés;
- préférer les aplats et les variations légères de la palette officielle.

---

## 7. Traits et contours

Les traits doivent être immédiatement reconnaissables comme appartenant à la même collection.

### Caractéristiques

- couleur Navy;
- épaisseur visuellement constante;
- contours nets mais légèrement éditoriaux;
- extrémités simples;
- connecteurs faciles à suivre;
- flèches claires;
- aucun effet de profondeur réaliste.

### Tolérance

Une légère irrégularité dessinée est permise pour :

- certains doodles;
- une flèche d’emphase;
- un encadrement secondaire;
- une annotation ponctuelle.

Elle ne doit pas affecter les composants techniques principaux.

### Interdictions

- contours noirs lourds;
- traits métalliques;
- contours lumineux;
- ombres réalistes;
- glow;
- lignes en perspective;
- mélange incohérent de plusieurs styles de traits.

---

## 8. Formes et objets

### Formes privilégiées

- rectangles légèrement arrondis;
- cercles et demi-cercles simples;
- cartes plates;
- documents stylisés;
- jauges;
- filtres;
- nœuds;
- connecteurs;
- piles simples;
- modules techniques;
- pictogrammes dessinés de face.

### Traitement

- aplats de couleur;
- aucune extrusion;
- aucun angle isométrique;
- aucun volume réaliste;
- très peu ou pas d’ombre;
- asymétrie légère permise;
- proportions simples et lisibles.

### Niveau de simplification

Les objets doivent :

- être reconnaissables rapidement;
- conserver le même niveau de détail d’une image à l’autre;
- rester lisibles en réduction;
- servir directement le sujet;
- éviter les détails décoratifs non fonctionnels.

---

## 9. Texture et finition

Une texture très légère peut être utilisée pour éviter un rendu trop numérique ou clinique.

Texture permise :

- grain imprimé discret;
- légère variation d’aplat;
- finition dessinée très subtile;
- imperfections contrôlées sur certains doodles.

La texture ne doit jamais :

- réduire la lisibilité;
- créer un effet vintage dominant;
- imiter du papier froissé;
- ajouter du bruit visuel;
- transformer l’image en collage;
- ressembler à une photo.

---

## 10. Typographie

### Style général

- sans-serif;
- géométrique ou condensée;
- moderne;
- professionnelle;
- éditoriale;
- très lisible sur écran.

### Familles visuelles de référence

- Barlow Condensed;
- Roboto Condensed;
- Archivo Narrow;
- Oswald;
- autre famille sans-serif proche déjà utilisée par l’application.

La police exacte utilisée par le post-traitement doit correspondre aux choix techniques réels du site. Le modèle d’image doit surtout respecter la famille visuelle.

### Hiérarchie

**Titre principal**  
Fort, visible et immédiatement lisible.

**Titre ou libellé de média**  
Court et secondaire lorsque réellement nécessaire.

**Libellé de diagramme**  
Très bref et assez grand pour être lu sans zoom.

**Annotation doodle**  
Très courte et facultative.

### Règles communes

- le Navy est la couleur de texte par défaut;
- une couleur d’accent peut souligner un mot ou une notion;
- aucune police manuscrite pour le contenu principal;
- aucun pseudo-texte;
- aucun texte décoratif illisible;
- aucun paragraphe dans l’image;
- aucun texte ajouté uniquement pour remplir l’espace.

---

## 11. Langage doodle

Les doodles représentent environ 10 % du langage visuel.

### Éléments autorisés

- flèches légèrement irrégulières;
- cercles d’emphase;
- soulignements imparfaits;
- petits traits rayonnants;
- étoiles ou marques d’attention;
- cadres légèrement esquissés;
- annotations très courtes;
- pictogrammes techniques légèrement dessinés.

### Couleurs

Principalement :

- Navy `#143054`;
- Orange `#DD8737`.

### Fonction

Un doodle doit :

- attirer l’attention;
- clarifier une relation;
- souligner une décision;
- rendre une idée mémorable;
- renforcer la lecture.

### Interdictions

- mascottes décoratives;
- style enfantin;
- accumulation de flèches;
- grandes illustrations manuscrites;
- personnages caricaturaux;
- annotations longues;
- doodles sans fonction.

---

## 12. Densité et espace

La densité varie selon le rôle de l’image, mais toutes les images doivent conserver :

- une hiérarchie évidente;
- des zones respirantes;
- un nombre limité d’objets principaux;
- des regroupements visuels clairs;
- des textes courts;
- un parcours de lecture naturel.

### Prioriser

- relations;
- distinctions;
- étapes;
- décisions;
- objets clés;
- mots-clés;
- micro-explications nécessaires.

### Éviter

- paragraphes;
- listes longues;
- répétitions;
- accumulation de petites cartes;
- détails administratifs;
- miniatures de toutes les sections de l’article;
- contenu ajouté seulement pour remplir l’espace.

---

## 13. Composition

Le concept doit déterminer la structure.

Familles de compositions possibles :

- métaphore visuelle centrale;
- comparaison en deux ou trois zones;
- flux horizontal;
- architecture;
- cycle;
- couches;
- carte conceptuelle;
- anatomie d’un concept;
- arbre de décision limité;
- composition typographique forte;
- composition hybride simple.

### Règles

- la direction de lecture doit être évidente;
- les relations comptent davantage que la liste des composants;
- le sujet principal doit être compris rapidement;
- l’image doit conserver un point focal;
- les éléments essentiels doivent rester loin des bords;
- aucun gabarit unique ne doit dominer toute une série.

---

## 14. Métaphores visuelles communes

Les métaphores doivent être simples, techniques et non ambiguës.

### Modèle

- moteur;
- noyau;
- bloc de traitement;
- réseau abstrait.

### Agent ou orchestration

- nœud central;
- réseau de décisions;
- rôles spécialisés;
- modules coordonnés.

Éviter le cerveau lumineux générique.

### Outil

- connecteur;
- module externe;
- prise;
- clé anglaise stylisée.

### Sécurité et identité

- clé;
- badge;
- bouclier;
- verrou;
- identité.

### Recherche et récupération

- loupe;
- documents;
- filtre;
- index;
- passages sélectionnés;
- bibliothèque.

### Observation et évaluation

- trajectoire;
- journal;
- jauge;
- coche;
- grille de mesure;
- comparaison attendu/réel.

### Données et connaissances

- documents;
- piles;
- base;
- nœuds reliés;
- bibliothèque;
- flux d’information.

---

# PARTIE B — PROFILS FONCTIONNELS

## 15. Profil `cover`

### Rôle

La couverture est une image éditoriale utilisée dans :

- la carte du catalogue;
- l’en-tête de l’article;
- le partage social;
- les aperçus de série.

### Objectif

Elle doit :

- faire reconnaître rapidement le sujet;
- communiquer une idée forte;
- donner envie d’ouvrir l’article;
- fonctionner en miniature;
- rester simple;
- avoir une identité propre au sujet;
- appartenir clairement à la collection 5PennyAi.

### Contraintes

- ratio final 16:9;
- titre exact de l’article obligatoire;
- titre lisible dans une petite carte;
- une seule idée visuelle dominante;
- très peu de texte autre que le titre;
- aucun nom de série;
- aucun numéro d’épisode;
- aucune source;
- aucune URL;
- aucun tableau complet;
- aucun processus détaillé;
- aucune reproduction complète de l’article.

### Composition

Le titre peut être :

- à gauche;
- en haut;
- au centre;
- intégré à une composition adaptée.

La position ne doit pas devenir un gabarit fixe.

### Titre déterministe recommandé

Pour maximiser la fidélité du texte :

```text
illustration générée avec zone de titre
→ titre exact composé par l’application
→ couverture finale
```

Si le titre est produit directement par le modèle, la couverture n’est acceptable que si :

- tous les mots sont présents;
- l’orthographe est exacte;
- les accents et la ponctuation sont exacts;
- aucun mot n’est coupé;
- le titre est lisible en miniature.

---

## 16. Profil `diagram`

### Rôle

Le diagramme explique :

- un flux;
- une architecture;
- un cycle;
- une relation;
- une séquence;
- une décision;
- une circulation de données.

### Objectif

Le lecteur doit comprendre rapidement :

1. quels sont les composants principaux;
2. comment ils sont reliés;
3. dans quel ordre ou selon quelle logique ils interagissent.

### Contraintes

- peu de texte;
- libellés courts;
- flèches simples;
- direction de lecture évidente;
- distinctions visibles autrement que par la couleur seule;
- aucun faux écran;
- aucune architecture inventée;
- aucun détail non soutenu par le brief ou les sources;
- aucune accumulation de petites cartes.

### Structures privilégiées

- flux horizontal;
- architecture en couches;
- cycle;
- comparaison de deux parcours;
- arbre de décision limité;
- boucle de rétroaction;
- système central avec entrées et sorties.

---

## 17. Profil `illustration`

### Rôle

L’illustration rend intuitif :

- un concept abstrait;
- une différence;
- une limite;
- une relation générale;
- une métaphore pédagogique contrôlée.

### Objectif

Elle doit communiquer une idée sans chercher à expliquer toutes les étapes.

### Contraintes

- une métaphore centrale;
- peu ou pas de texte;
- objets immédiatement compréhensibles;
- aucune ambiguïté importante;
- aucun anthropomorphisme inutile;
- aucune représentation générique de l’IA;
- aucune scène enfantine;
- aucune fausse interface.

### Composition

- objet central;
- scène conceptuelle simple;
- opposition en deux zones;
- système abstrait de nœuds;
- quelques objets techniques spécialisés.

---

## 18. Profil `infographic`

### Rôle

Une infographie interne synthétise plusieurs idées reliées lorsqu’une seule couverture ou un diagramme minimal ne suffit pas.

### Utilisation

Ce profil doit être utilisé avec modération.

### Contraintes

- densité plus élevée que les autres profils, mais toujours lisible;
- structure principale unique;
- nombre limité de sections;
- textes courts;
- aucun long paragraphe;
- aucun résumé intégral de l’article;
- aucune répétition du contenu déjà présenté dans le texte;
- aucune accumulation de cartes identiques;
- aucun pied de page publicitaire.

### Formats

Selon le contrat JSON :

- 16:9 pour une synthèse horizontale;
- 4:3 pour une explication générale;
- 4:5 pour une synthèse verticale.

Le ratio doit être déterminé par le brief et le contexte d’affichage.

---

## 19. Profils non générables automatiquement dans la première version

### `chart`

Un graphique doit être fondé sur des données réelles, structurées et vérifiables.

Le modèle d’image ne doit jamais inventer :

- une valeur;
- une série;
- un axe;
- une proportion;
- une tendance;
- une comparaison quantitative.

La génération automatique d’un `chart` reste désactivée tant qu’un pipeline déterministe de données n’existe pas.

### `screenshot`

Une capture doit représenter une interface ou un résultat réel.

Le modèle ne doit jamais fabriquer une fausse capture présentée comme un produit existant.

La première version utilise l’upload manuel pour ce type.

---

# PARTIE C — DONNÉES ET CONSTRUCTION DES PROMPTS

## 20. Données utilisées pour une couverture

Le serveur peut utiliser :

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

Le titre est la seule chaîne obligatoirement visible.

Le sous-titre, le résumé, le thème, le niveau et le message principal servent à comprendre le sujet. Ils ne doivent pas être automatiquement recopiés dans l’image.

Ne pas transmettre inutilement :

- les sources complètes;
- les URL;
- les citations;
- les mots-clés SEO;
- les tableaux;
- les propriétés administratives;
- les chemins de stockage;
- les identifiants;
- le statut.

---

## 21. Données utilisées pour un média

Le serveur peut utiliser :

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
media.required
media.sourceKeys
```

Les sources reliées par `media.sourceKeys` peuvent être utilisées pour comprendre les contraintes factuelles.

Elles ne doivent pas être reproduites dans l’image sous forme :

- d’URL;
- de bibliographie;
- de citation complète;
- de microtexte.

---

## 22. Priorité des instructions

Le prompt final doit appliquer cette priorité :

```text
1. sécurité et exactitude factuelle
2. rôle du profil fonctionnel
3. contenu obligatoire du generationBrief
4. identité article-visual-style-v1
5. format et cadrage
6. liberté de composition
```

Le brief propre à l’article peut :

- choisir le concept;
- préciser les objets;
- préciser les relations;
- imposer des étapes;
- interdire des éléments spécifiques;
- recommander une composition.

Il ne peut pas :

- autoriser le 3D;
- autoriser un logo ou une marque;
- rendre acceptable une donnée inventée;
- supprimer le titre obligatoire d’une couverture;
- demander du microtexte;
- remplacer le langage visuel commun;
- transmettre un sens uniquement par la couleur.

---

## 23. Bloc maître — `article-visual-style-v1`

Le bloc suivant est destiné à être injecté dans toutes les générations :

```text
DIRECTION VISUELLE COMMUNE — ARTICLE-VISUAL-STYLE-V1

Créer une image appartenant à la collection éditoriale « Ressources IA » de 5PennyAi.

Appliquer une illustration strictement 2D, frontale et pédagogique :
- fond off-white uniforme et dominant;
- contours Navy nets et cohérents;
- Blue et Teal comme accents principaux;
- Violet comme accent spécialisé;
- Orange uniquement comme accent focal ponctuel;
- White et Lavender pour les surfaces et regroupements secondaires;
- aplats de couleur;
- formes géométriques simples et légèrement arrondies;
- pictogrammes techniques dessinés de face;
- flèches et connecteurs clairs;
- quelques doodles Navy ou Orange, rares et fonctionnels;
- légère texture imprimée ou dessinée;
- grands espaces respirants;
- hiérarchie visuelle immédiatement compréhensible;
- ton professionnel, calme et pédagogique.

La cohérence doit venir de la palette, du style de trait, des formes, de la typographie, des doodles, de la densité et du niveau de finition. Ne pas appliquer un gabarit fixe.

Utiliser une typographie sans-serif forte, éditoriale et très lisible. Tout texte visible doit être utile, bref et assez grand. Aucun pseudo-texte, paragraphe ou microtexte.

Ne pas utiliser :
- perspective, isométrie, 2,5D, volume ou extrusion;
- rendu 3D, plastique, verre, métal ou surfaces brillantes;
- ombres réalistes, néons, glow ou particules lumineuses;
- fond sombre cinématographique;
- grand dégradé bleu-violet-orange;
- esthétique startup IA générique;
- cerveau lumineux, robot humanoïde, cube ou cristal IA générique;
- fausse interface, faux écran ou faux dashboard;
- mascotte, cartoon ou style enfantin;
- logo, marque tierce, URL, source, filigrane ou signature;
- contenu essentiel près des bords;
- titre ou objet principal coupé;
- bordure ou bande artificielle autour de l’image.

La couleur ne doit jamais être le seul moyen de transmettre une distinction importante.
```

---

## 24. Bloc profil — `article-cover-profile-v1`

```text
PROFIL FONCTIONNEL — COUVERTURE D’ARTICLE

Créer une véritable couverture éditoriale, et non une mini-infographie.

La couverture doit :
- communiquer une idée visuelle forte;
- représenter clairement le sujet;
- rester lisible dans une petite carte;
- fonctionner dans l’en-tête de l’article;
- conserver une composition simple et respirante;
- avoir une personnalité propre au sujet.

Le titre exact de l’article est obligatoire. Conserver tous les mots, l’orthographe, les accents et la ponctuation. Ne pas reformuler ni raccourcir. Permettre seulement les retours à la ligne nécessaires à la mise en page.

Le titre est le seul texte obligatoire. Ne pas ajouter automatiquement le sous-titre, le niveau, le thème, le résumé, le message principal, le nom de série ou le numéro d’épisode.

Ne pas créer un tableau, un processus détaillé, une interface fictive ou une accumulation de petites cartes.

Format final : 16:9 réel, rempli naturellement, sans bande ni cadre artificiel.
```

---

## 25. Bloc profil — `article-diagram-profile-v1`

```text
PROFIL FONCTIONNEL — DIAGRAMME PÉDAGOGIQUE

Créer un diagramme qui explique clairement les composants, les relations et l’ordre de lecture.

Choisir une structure adaptée au brief : flux, architecture, cycle, couches, comparaison, arbre de décision limité ou boucle de rétroaction.

Utiliser :
- peu de texte;
- des libellés courts et lisibles;
- des formes distinctes;
- des flèches simples;
- une direction de lecture évidente;
- des différences perceptibles autrement que par la couleur seule.

Les relations comptent davantage que la liste des composants.

Ne pas inventer un composant, une relation, une étape, une mesure ou une architecture. Ne pas produire une fausse interface, un dashboard ou un tableau détaillé.
```

---

## 26. Bloc profil — `article-illustration-profile-v1`

```text
PROFIL FONCTIONNEL — ILLUSTRATION CONCEPTUELLE

Créer une illustration conceptuelle simple qui rend immédiatement intuitive l’idée principale.

Privilégier :
- une métaphore technique centrale;
- quelques objets bien choisis;
- une opposition simple;
- une scène conceptuelle frontale;
- peu ou pas de texte.

L’illustration doit suggérer le concept sans chercher à expliquer toutes les étapes.

Éviter les métaphores ambiguës, enfantines, anthropomorphiques ou génériques sur l’intelligence artificielle.
```

---

## 27. Bloc profil — `article-infographic-profile-v1`

```text
PROFIL FONCTIONNEL — INFOGRAPHIE INTERNE

Créer une synthèse visuelle structurée de plusieurs idées reliées.

Utiliser une structure principale adaptée au contenu et limiter le nombre de sections. Prioriser les relations, distinctions, étapes et idées essentielles.

Le contenu doit rester lisible sans zoom excessif. Utiliser des titres courts, des mots-clés et des micro-explications seulement lorsque nécessaires.

Ne pas reproduire l’article complet. Ne pas créer une grille uniforme de cartes, une longue liste de points, des paragraphes, un tableau de bord ou une présentation commerciale.
```

---

# PARTIE D — FORMAT, TEXTE ET POST-TRAITEMENT

## 28. Formats

Ratios permis selon le contrat :

```text
16:9
4:3
1:1
4:5
```

### Recommandations

- `16:9` : couvertures, flux horizontaux, architectures;
- `4:3` : explications générales;
- `1:1` : illustrations conceptuelles compactes;
- `4:5` : infographies verticales.

### Règles

- le fichier final doit réellement utiliser le ratio demandé;
- aucune bande ou bordure artificielle;
- aucun canevas intérieur couvrant presque toute l’image;
- aucun élément essentiel près des bords;
- aucune normalisation `contain` créant un cadre visible;
- préférer une génération native au ratio demandé;
- si un recadrage est nécessaire, garder tous les éléments essentiels dans une zone sûre centrale.

---

## 29. Zone sûre

L’application ou le prompt doit réserver une marge visuelle suffisante sur tous les côtés.

Les éléments suivants doivent toujours rester entièrement visibles :

- titre;
- objet principal;
- première et dernière étape d’un flux;
- flèche de retour;
- légende indispensable;
- nœud central;
- relation importante.

Les marges exactes dépendent du modèle et de la dimension finale. Elles doivent être testées dans les vraies cartes et pages du site.

---

## 30. Politique de texte

### Couvertures

- titre exact obligatoire;
- aucun autre texte par défaut;
- aucun nom de série;
- aucun épisode;
- aucune source;
- aucune URL.

### Diagrammes

- libellés essentiels seulement;
- mots ou expressions courtes;
- aucun paragraphe;
- aucune légende complète dans l’image si elle peut rester en HTML sous le média.

### Illustrations

- aucun texte par défaut;
- un ou deux mots seulement si le brief l’exige réellement.

### Infographies

- titres courts;
- mots-clés;
- micro-explications;
- aucun bloc dense.

### Post-traitement déterministe

Lorsque la fidélité textuelle est critique, l’application devrait composer le texte après la génération :

```text
illustration sans texte critique
→ texte SVG ou image déterministe
→ asset final
```

Priorité recommandée :

1. titre de couverture;
2. libellés critiques de diagrammes;
3. textes secondaires seulement si les erreurs deviennent fréquentes.

---

## 31. Accessibilité

Le visuel doit rester compréhensible sans dépendre uniquement de la couleur.

Utiliser également :

- formes distinctes;
- libellés;
- motifs simples;
- position;
- connecteurs;
- icônes;
- contours.

Le texte alternatif reste fourni par :

```text
cover.altText
media[].altText
```

Le texte alternatif :

- décrit l’information utile;
- ne recopie pas le `generationBrief`;
- ne sert pas de liste de mots-clés;
- n’est pas intégré visuellement dans l’image.

---

## 32. Exactitude et sources

Le modèle ne doit jamais :

- inventer une donnée;
- inventer une source;
- inventer une architecture officielle;
- inventer un résultat;
- fabriquer une capture;
- créer une relation non soutenue;
- présenter une approximation comme un fait certain.

Pour les médias utilisant `sourceKeys` :

- les sources servent à comprendre les contraintes;
- les affirmations visuelles doivent être compatibles avec elles;
- les références complètes restent dans l’article;
- aucune URL ou bibliographie ne doit apparaître dans l’image.

---

# PARTIE E — INTERDICTIONS UNIVERSELLES

## 33. Style interdit

Ne pas utiliser :

- 2,5D;
- perspective;
- isométrie;
- volume;
- extrusion;
- objets flottants;
- rendu 3D;
- photoréalisme;
- plastique;
- verre;
- métal;
- surfaces brillantes;
- ombres réalistes;
- néons;
- cyberpunk;
- fond sombre cinématographique;
- grand dégradé saturé;
- particules lumineuses;
- glow;
- esthétique « startup IA »;
- esthétique publicitaire;
- cerveau lumineux générique;
- robot humanoïde;
- cube, sphère ou cristal IA générique;
- podium futuriste;
- dashboard fictif;
- interface SaaS inventée;
- miniature YouTube;
- cartoon;
- mascotte;
- composition enfantine;
- collage de Post-it;
- photographie ou photo-illustration.

---

## 34. Contenu interdit

- logo généré;
- marque tierce;
- URL;
- source complète;
- filigrane;
- signature;
- pseudo-texte;
- microtexte;
- fait inventé;
- chiffre inventé;
- graphique sans données;
- capture fictive;
- nombre d’épisodes inventé;
- nom de série non demandé;
- élément essentiel coupé;
- cadre intérieur dominant;
- bande artificielle;
- texte illisible;
- sens essentiel transmis uniquement par la couleur.

---

# PARTIE F — COHÉRENCE DE COLLECTION

## 35. Constantes obligatoires entre les images

Toutes les images retenues doivent conserver :

- le même fond général;
- la même palette;
- le même style de contours;
- le même niveau de simplification;
- la même famille typographique;
- le même langage de cartes et surfaces;
- le même style de flèches;
- le même niveau de doodles;
- la même absence de profondeur;
- un niveau de finition comparable;
- un ton éditorial semblable.

---

## 36. Variations souhaitées

Les images peuvent varier par :

- famille de composition;
- métaphore;
- orientation du parcours;
- nombre d’objets;
- accent secondaire dominant;
- échelle de l’illustration;
- position du titre;
- densité selon le type de média;
- degré d’abstraction.

### À éviter dans une série

- toujours placer le titre à gauche;
- toujours placer une illustration à droite;
- toujours utiliser deux colonnes;
- toujours utiliser un noyau central;
- toujours utiliser trois cartes;
- toujours produire le même flux;
- toujours utiliser les mêmes objets;
- toujours utiliser la même couleur dominante secondaire.

La variété ne doit jamais faire perdre l’identité commune.

---

## 37. Références visuelles communes

Une planche de style peut être utilisée comme référence commune pour renforcer la cohérence.

Elle devrait montrer :

- la palette;
- les contours;
- les formes;
- quelques cartes;
- des documents;
- une jauge;
- des nœuds;
- des connecteurs;
- des flèches;
- des doodles;
- le niveau de texture;
- le traitement typographique.

Elle ne devrait représenter aucun sujet précis ni imposer une composition.

Instruction associée :

```text
Utilise la référence uniquement pour comprendre la palette, le style des traits, les formes, la typographie, les doodles, le niveau de texture et le niveau de finition.

Ne copie aucune composition, métaphore, disposition ou structure précise.
```

La planche visuelle est recommandée, mais elle ne remplace pas la spécification textuelle.

---

# PARTIE G — VALIDATION

## 38. Validation individuelle

Chaque image est évaluée de 1 à 5.

| Critère | Question |
|---|---|
| Fidélité | Le visuel respecte-t-il exactement le brief et les contraintes factuelles? |
| Style commun | Appartient-il clairement à la collection 5PennyAi? |
| Lisibilité | Fonctionne-t-il dans son contexte réel d’affichage? |
| Pertinence | L’idée centrale est-elle immédiatement perceptible? |
| Simplicité | La densité correspond-elle au rôle de l’image? |
| Hiérarchie | Le regard suit-il naturellement la composition? |
| Texte | Les textes utiles sont-ils exacts, courts et lisibles? |
| Accessibilité | Le sens demeure-t-il compréhensible sans dépendre uniquement de la couleur? |
| Cadrage | Le ratio est-il rempli sans coupure ni bordure artificielle? |
| Finition | Le résultat est-il propre, éditorial et professionnel? |

Score maximal :

```text
50
```

Seuil recommandé :

```text
40/50
```

Une image présentant un problème éliminatoire est rejetée indépendamment du score.

---

## 39. Validation de collection

Les images doivent également être évaluées ensemble.

Questions :

1. Semblent-elles provenir du même studio éditorial?
2. Le fond et la palette sont-ils cohérents?
3. Les contours ont-ils le même langage?
4. Le niveau de simplification est-il comparable?
5. La typographie semble-t-elle appartenir à la même famille?
6. Les doodles sont-ils cohérents et discrets?
7. Les compositions sont-elles suffisamment variées?
8. Une image paraît-elle 3D ou générique parmi des images 2D?
9. Une image semble-t-elle être une présentation PowerPoint ou une publicité?
10. La collection demeure-t-elle calme, pédagogique et professionnelle?

Critère principal :

> Sans logo ni contexte de page, il doit être évident que les images appartiennent à la même collection.

---

## 40. Problèmes éliminatoires

Rejeter une image si elle présente l’un des problèmes suivants :

- rendu 3D dominant;
- perspective ou isométrie;
- fond fortement dégradé;
- esthétique néon, cyberpunk ou publicitaire;
- cerveau, robot, cube ou cristal IA générique;
- faux écran ou faux dashboard;
- microtexte dominant;
- paragraphe dense;
- source ou URL;
- logo ou filigrane;
- donnée inventée;
- graphique sans données vérifiées;
- capture fictive;
- titre de couverture absent;
- titre incomplet ou incorrect;
- texte français central manifestement erroné;
- concept sans rapport avec l’article;
- palette étrangère à 5PennyAi;
- élément principal coupé;
- bandes ou bordures artificielles;
- fichier final au mauvais ratio;
- composition pratiquement identique à plusieurs autres images;
- sens essentiel transmis uniquement par la couleur.

---

## 41. Banc d’essai initial

La direction doit être testée sur les trois articles pilotes acceptés :

- un article débutant;
- un article intermédiaire;
- un article avancé.

Ensemble minimal :

```text
3 couvertures
+ 3 médias internes représentatifs
```

Les médias doivent inclure au moins :

- un flux ou pipeline;
- une comparaison ou deux parcours;
- une architecture ou un processus d’évaluation.

L’évaluation doit se faire :

- individuellement;
- dans la carte du catalogue;
- dans l’en-tête de l’article;
- dans le corps de l’article;
- comme collection de six images.

---

## 42. Critères d’acceptation de la v1

`article-visual-style-v1` peut être considéré comme validé lorsque :

- les trois couvertures fonctionnent dans les cartes;
- les trois médias sont pédagogiquement lisibles;
- aucun résultat retenu ne présente de problème éliminatoire;
- les six images semblent appartenir à la même collection;
- au moins trois familles de compositions sont représentées;
- aucune disposition unique ne domine l’ensemble;
- la palette et les traits sont cohérents;
- les textes critiques sont exacts;
- les ratios finaux sont respectés;
- aucun asset valide n’est remplacé en cas d’échec de génération;
- Christian valide la direction visuelle dans le site réel.

---

# PARTIE H — INTÉGRATION ET VERSIONNAGE

## 43. Noms de version recommandés

```text
article-visual-style-v1
article-cover-profile-v1
article-diagram-profile-v1
article-illustration-profile-v1
article-infographic-profile-v1
```

Le serveur devrait enregistrer ou journaliser la version utilisée pour faciliter les diagnostics, sans ajouter cette donnée au contrat JSON de l’article.

---

## 44. Génération côté serveur

Entrées minimales recommandées :

### Couverture

```json
{
  "articleId": "uuid",
  "assetType": "cover"
}
```

### Média

```json
{
  "articleId": "uuid",
  "assetType": "media",
  "mediaKey": "flux-rag"
}
```

Le serveur doit :

1. authentifier l’administrateur;
2. récupérer l’article;
3. récupérer le média demandé;
4. valider le type et le brief;
5. assembler les blocs de prompt versionnés;
6. appeler le modèle d’image;
7. valider le résultat;
8. normaliser le format;
9. ajouter les textes déterministes si applicable;
10. téléverser sous un nouveau chemin;
11. mettre à jour la base;
12. supprimer l’ancien fichier en meilleur effort seulement après succès.

---

## 45. Hors périmètre

Ce document ne définit pas :

- un modèle de données complet;
- une migration Supabase;
- une médiathèque générique;
- une génération automatique à la publication;
- une génération en lot;
- plusieurs variantes enregistrées;
- un historique complet;
- un éditeur de prompt libre;
- un éditeur graphique;
- une sélection de modèle dans l’interface;
- une refonte du contrat JSON;
- un pipeline déterministe de graphiques;
- la fabrication de captures d’écran.

---

## 46. Évolution de la direction

Une modification importante doit produire une nouvelle version :

```text
article-visual-style-v2
```

Une nouvelle version est justifiée notamment par :

- changement de palette;
- changement important du style de trait;
- nouvelle politique de texte;
- ajout d’une planche visuelle obligatoire;
- modification du niveau de densité;
- nouveau mécanisme de composition déterministe;
- changement du modèle d’image nécessitant une adaptation majeure.

Les images existantes ne doivent pas être régénérées automatiquement lors d’un changement de version.

---

## 47. Résumé opérationnel

```text
Article enregistré
→ sélection de la couverture ou du média
→ récupération serveur des données
→ article-visual-style-v1
→ profil fonctionnel
→ contexte éditorial
→ generationBrief
→ génération d’une seule image
→ normalisation et texte déterministe
→ validation humaine
→ remplacement sécurisé
→ affichage public
```

Principe final :

> La cohérence de la collection est obligatoire. La répétition des compositions ne l’est pas.
