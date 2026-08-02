# Prompt de couvertures d’articles 5PennyAi v1

**Projet :** 5PennyAi
**Section :** Ressources IA
**Nom de la direction :** `article-cover-style-v1`
**Date :** 1er août 2026
**Statut :** prompt validé sur trois articles pilotes

---

## 1. Rôle du document

Ce document définit le prompt commun utilisé pour générer les couvertures des articles éducatifs de la section Ressources IA.

Il complète le contrat JSON Articles v1 sans le modifier.

Le JSON décrit :

- le sujet;
- l’angle éditorial;
- le résumé;
- le message principal;
- le brief propre à la couverture.

Le présent prompt impose :

- l’identité visuelle 5PennyAi;
- le style 2D;
- la palette;
- la sobriété;
- le niveau de détail;
- les contraintes de format;
- les éléments interdits.

Flux cible :

```text
JSON de l’article
→ extraction des champs utiles
→ ajout de article-cover-style-v1
→ génération de la couverture
→ validation humaine
→ upload manuel dans l’administration
```

---

## 2. Données à utiliser

Extraire seulement les champs suivants du JSON :

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

Le contenu complet `contentMarkdown` n’est pas nécessaire.

Ne pas transmettre inutilement :

- les sources;
- les citations;
- les URL;
- les mots-clés SEO;
- les tableaux;
- les propriétés administratives;
- les chemins de stockage;
- les identifiants;
- le statut de publication.

Pour un article très complexe, les objectifs d’apprentissage peuvent être consultés afin de comprendre le sujet, mais ils ne doivent pas être reproduits dans l’image.

---

## 3. Prompt maître

Remplacer les valeurs entre doubles accolades par les données de l’article.

```text
Créer une image de couverture éditoriale horizontale 16:9 pour un article de la section « Ressources IA » de 5PennyAi.

CONTEXTE ÉDITORIAL

Titre :
{{title}}

Sous-titre :
{{subtitle}}

Résumé :
{{summary}}

Thème :
{{theme}}

Niveau :
{{level}}

Message principal :
{{takeaway}}

Brief éditorial de la couverture :
{{cover.generationBrief}}

Texte alternatif suggéré :
{{cover.altText}}

OBJECTIF

Créer une véritable couverture éditoriale qui :

- fait reconnaître rapidement le sujet;
- donne envie d’ouvrir l’article;
- communique une idée forte;
- reste lisible dans une petite carte;
- fonctionne aussi dans l’en-tête de la page publique;
- appartient clairement à l’univers visuel 5PennyAi;
- évoque le contenu sans chercher à résumer tout l’article.

L’image ne doit pas être une mini-infographie, une publicité, une miniature YouTube, un tableau de bord ou une interface fictive.

DIRECTION VISUELLE — ARTICLE-COVER-STYLE-V1

Créer une illustration éditoriale strictement 2D.

Utiliser :

- un fond off-white uniforme et dominant;
- des contours Navy nets;
- Blue et Teal comme accents principaux;
- Violet et Orange uniquement comme accents ponctuels;
- des aplats de couleur;
- des formes géométriques simples;
- des pictogrammes dessinés de face;
- des flèches et lignes claires;
- quelques doodles discrets;
- une légère texture imprimée ou dessinée;
- une composition frontale;
- de grands espaces respirants;
- une hiérarchie visuelle immédiatement compréhensible;
- un ton pédagogique, professionnel et calme.

Le style doit être cohérent avec les ressources éducatives 5PennyAi, sans reproduire un gabarit fixe.

LIBERTÉ DE CONCEPTION

Choisir silencieusement la composition la mieux adaptée au sujet.

Familles possibles, sans obligation :

- métaphore visuelle centrale;
- comparaison simple en deux zones;
- flux horizontal;
- diagramme éditorial minimal;
- composition de quelques cartes plates;
- système abstrait de nœuds, lignes ou couches;
- objet technique stylisé;
- composition typographique forte.

Ne pas reprendre automatiquement la même structure que les autres couvertures.

La cohérence de la collection doit venir de la palette, du dessin, de la sobriété et du niveau de finition — pas d’une mise en page identique.

POLITIQUE DE TEXTE

Le titre complet est déjà affiché en HTML sur le site.

Le titre peut apparaître dans l’image seulement s’il améliore clairement la couverture.

Lorsqu’un titre est utilisé :

- reproduire exactement le titre fourni ou une version courte fidèle;
- utiliser une typographie sans-serif forte et lisible;
- ne pas ajouter de sous-titre long;
- ne pas inventer d’accroche;
- ne pas ajouter de paragraphes;
- ne pas ajouter de liste;
- ne pas ajouter de pseudo-texte décoratif.

L’image doit rester compréhensible même sans texte.

CONTRAINTES FERMES

- format final réellement en 16:9;
- fond occupant toute l’image;
- aucun cadre intérieur couvrant presque toute la surface;
- aucun élément essentiel près des bords;
- aucun titre ou objet principal coupé;
- aucun logo;
- aucune marque tierce;
- aucune URL;
- aucune source;
- aucun filigrane;
- aucune signature;
- aucun nom de série;
- aucun numéro d’épisode;
- aucun microtexte;
- aucun fait ou chiffre inventé;
- aucune fausse capture d’interface;
- aucun tableau complet;
- aucun processus détaillé rempli d’annotations.

STYLE INTERDIT

Ne pas utiliser :

- de 2,5D;
- de perspective;
- de vue isométrique;
- de volume;
- d’extrusion;
- de blocs empilés;
- d’objets flottants;
- de rendu 3D;
- de plastique;
- de verre;
- de métal;
- de surfaces brillantes;
- d’ombres réalistes;
- de néons;
- de cyberpunk;
- de fond sombre cinématographique;
- de grand dégradé bleu-violet-orange couvrant le fond;
- de particules lumineuses;
- d’esthétique « startup IA »;
- de cerveau lumineux générique;
- de robot humanoïde;
- de cube ou cristal IA générique;
- de podium futuriste;
- de composition publicitaire.

QUALITÉ ATTENDUE

Le résultat final doit :

- sembler appartenir immédiatement à la collection Ressources IA;
- représenter clairement l’idée centrale de l’article;
- fonctionner en miniature;
- rester sobre;
- conserver une personnalité propre au sujet;
- éviter toute esthétique IA générique;
- remplir naturellement le format 16:9;
- être prêt à être utilisé comme couverture d’article.

Produire une seule image.
```

---

## 4. Utilisation dans un projet ChatGPT

Pour générer une couverture :

1. téléverser ou fournir le JSON de l’article;
2. demander :

```text
Génère la couverture de cet article avec article-cover-style-v1.
```

3. extraire les champs définis à la section 2;
4. appliquer le prompt maître;
5. produire une seule image 16:9;
6. valider visuellement;
7. téléverser manuellement le résultat dans l’administration.

Le texte complet de l’article n’a pas à être recopié dans le prompt.

---

## 5. Utilisation avec des références visuelles

Les références visuelles ne sont pas obligatoires.

Elles peuvent être ajoutées si le modèle dérive vers un style générique.

Dans ce cas, fournir plusieurs références volontairement différentes et ajouter :

```text
Utilise les images de référence uniquement pour comprendre :

- la palette;
- le fond;
- le style de dessin;
- les contours;
- les formes;
- la sobriété;
- le niveau de finition.

Ne copie aucune composition, métaphore, disposition, hiérarchie ou structure précise.
Crée une nouvelle couverture adaptée au sujet.
```

Éviter d’utiliser une seule référence dominante.

---

## 6. Grille de validation

Évaluer chaque couverture de 1 à 5.

| Critère | Question |
|---|---|
| Branding | L’image appartient-elle clairement à Ressources IA? |
| Lisibilité | Fonctionne-t-elle dans une petite carte? |
| Pertinence | Représente-t-elle réellement l’idée centrale? |
| Sobriété | Évite-t-elle le style IA générique? |
| Créativité | Possède-t-elle une identité propre? |
| Variété | Se distingue-t-elle des autres couvertures? |
| Cadrage | Le 16:9 est-il rempli sans coupure ni bordure? |

Score maximal :

```text
35
```

Seuil recommandé :

```text
28/35
```

Le jugement éditorial reste prioritaire.

---

## 7. Problèmes éliminatoires

Rejeter une couverture si elle présente l’un des problèmes suivants :

- rendu 3D dominant;
- perspective ou isométrie;
- fond fortement dégradé;
- esthétique néon, cyberpunk ou publicitaire;
- cerveau, robot, cube ou cristal IA générique;
- microtexte;
- faux écran;
- logo ou filigrane;
- URL ou source;
- titre central incorrect;
- concept sans rapport avec l’article;
- image interchangeable avec n’importe quel sujet IA;
- palette étrangère à 5PennyAi;
- élément principal coupé;
- bandes ou bordures artificielles;
- fichier final non réellement 16:9.

---

## 8. Variété entre les couvertures

Pour une série de plusieurs articles :

- ne pas utiliser systématiquement un grand titre en haut;
- ne pas toujours placer un noyau au centre;
- ne pas toujours produire deux colonnes;
- ne pas répéter le même nombre de cartes;
- varier la famille de composition;
- varier la couleur dominante secondaire;
- conserver la même grammaire visuelle.

La collection doit être cohérente, mais non répétitive.

---

## 9. Version et évolution

Nom de version :

```text
article-cover-style-v1
```

Toute modification importante de la direction visuelle doit produire une nouvelle version :

```text
article-cover-style-v2
```

Les couvertures existantes ne doivent pas être régénérées automatiquement.

Une évolution peut être envisagée si l’utilisation réelle révèle :

- une trop grande répétition des compositions;
- une lisibilité insuffisante en carte;
- des erreurs fréquentes de texte;
- une perte de cohérence visuelle;
- un besoin de génération intégrée au site.

---

## 10. Hors périmètre

Ce prompt ne définit pas :

- un endpoint de génération;
- un bouton dans l’administration;
- un fournisseur de modèle;
- un historique de variantes;
- une génération en lot;
- une médiathèque;
- un éditeur graphique;
- une modification du contrat JSON;
- un thumbnail distinct de la couverture.

L’utilisation actuelle reste :

```text
JSON
→ génération dans ChatGPT
→ validation humaine
→ upload manuel
```
