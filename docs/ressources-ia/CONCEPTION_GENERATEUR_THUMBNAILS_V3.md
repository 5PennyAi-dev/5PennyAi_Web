# Conception du générateur de thumbnails v3

**Projet :** 5PennyAi
**Section :** Ressources IA
**Date :** 31 juillet 2026
**Statut :** document de travail à valider avant développement

---

## 1. Rôle du document

Ce document prépare une nouvelle direction pour la génération des thumbnails individuels.

Il ne remplace pas le guide du MVP 1.2 et n’est pas une spécification figée. Il sert à concevoir la skill visuelle avant un nouveau correctif Codex.

L’infrastructure technique de l’incrément 2 demeure valable : génération à la demande, endpoint authentifié, stockage Supabase, remplacement sécurisé, upload manuel et fallback public.

La révision porte sur :

- le rôle éditorial du thumbnail;
- la quantité de texte;
- la liberté de composition;
- la variété entre les fiches;
- le véritable format 16:9.

---

## 2. Leçons tirées des premiers essais

### Première direction

Les images étaient pertinentes et créatives, mais trop proches de mini-infographies :

- trop de petites écritures;
- trop de cartes, libellés et explications;
- série et épisode répétés dans l’image;
- lisibilité insuffisante dans le catalogue.

### Deuxième direction

La densité a été réduite, mais les contraintes ont produit un gabarit répétitif :

- grand titre à gauche;
- illustration à droite;
- hiérarchie presque identique;
- perte de personnalité entre les sujets.

La normalisation `contain` d’une image 3:2 dans un canevas 16:9 a aussi créé :

- des marges ou contours visibles;
- une différence de blanc cassé;
- une image placée dans un cadre plutôt que réellement composée en 16:9.

### Conclusion

La v3 doit conserver peu de contraintes fermes et laisser au modèle une grande liberté de conception.

```text
Contraintes fermes
→ lisibilité, contenu interdit, cadrage

Liberté créative
→ métaphore, composition, hiérarchie, quantité de texte utile
```

---

## 3. Rôle éditorial du thumbnail

Le thumbnail est une **couverture de catalogue**.

Il doit :

- faire reconnaître rapidement le sujet;
- donner envie d’ouvrir la ressource;
- rester lisible dans une petite carte;
- avoir une identité propre;
- compléter les informations HTML sans les répéter;
- évoquer le contenu sans chercher à tout enseigner.

Il ne doit être ni une infographie miniature, ni un gabarit fixe appliqué à toutes les ressources.

Principe central :

> Le thumbnail communique une idée forte. La fiche détaillée fournit l’explication complète.

---

## 4. Contraintes fermes

Ces règles s’appliquent à toutes les générations.

### Contenu interdit

- aucun nom de série;
- aucun numéro d’épisode;
- aucune source ou URL;
- aucun logo généré;
- aucune marque tierce;
- aucun filigrane;
- aucune signature;
- aucun fait ou chiffre inventé;
- aucun pseudo-texte décoratif.

### Densité interdite

- aucun paragraphe;
- aucune longue liste;
- aucun bloc « À retenir »;
- aucun tableau complet;
- aucune accumulation de petites cartes;
- aucun processus détaillé rempli d’annotations;
- aucun microtexte illisible dans la carte.

### Cadrage

- aucun titre ou élément principal coupé;
- aucun contenu essentiel près des bords;
- aucun contour ou bande artificielle;
- fichier final réellement en 16:9.

Ces règles ne doivent imposer aucune disposition précise.

---

## 5. Liberté créative

Le modèle choisit la composition la mieux adaptée au sujet.

Familles possibles, sans obligation :

1. composition typographique forte;
2. métaphore visuelle centrale;
3. comparaison simple en deux zones;
4. objet ou système technique stylisé;
5. scène conceptuelle;
6. diagramme minimal;
7. composition abstraite liée au sujet.

Le modèle peut choisir une autre approche pertinente.

Le prompt ne doit pas imposer systématiquement :

- le titre à gauche;
- l’illustration à droite;
- une répartition 50/50;
- une icône centrale;
- des pastilles sous le titre;
- le même nombre d’éléments;
- une hiérarchie identique d’une fiche à l’autre.

La cohérence de la collection doit venir de la palette, du niveau de finition, de la simplicité et du ton visuel — pas d’un gabarit unique.

---

## 6. Politique de texte

La quantité de texte est déterminée par la lisibilité et l’utilité, non par une limite numérique rigide.

Le thumbnail peut contenir :

- le titre principal ou une version courte fidèle;
- un sous-titre bref;
- une courte accroche;
- quelques mots-clés;
- un ou deux libellés nécessaires à un diagramme minimal.

Il ne doit pas contenir :

- un résumé complet;
- plusieurs phrases explicatives;
- les points essentiels recopiés;
- une liste de concepts;
- du texte uniquement destiné à remplir l’espace;
- des mots trop petits pour être lus dans la carte.

Règle qualitative :

> Chaque texte visible doit être utile, bref et suffisamment grand. Lorsqu’il n’est pas nécessaire à la compréhension immédiate de la couverture, il doit être omis.

Le titre complet demeure affiché en HTML sous l’image. Le thumbnail peut donc utiliser une version légèrement raccourcie lorsqu’un titre très long nuirait à la composition, à condition de préserver son sens.

---

## 7. Cohérence visuelle

Les thumbnails partagent :

- un univers pédagogique et technologique;
- une qualité d’illustration comparable;
- une typographie sans-serif claire;
- des formes propres et modernes;
- une bonne utilisation de l’espace;
- la palette générale de Ressources IA.

Palette de référence :

```text
Off-white : fond clair
Navy : texte et structure
Blue : accent principal
Teal : accent secondaire
Violet : profondeur et variation
Orange : accent ponctuel
```

Le modèle peut faire varier :

- la couleur dominante;
- la position du titre;
- le niveau d’abstraction;
- l’échelle de l’illustration;
- la présence d’un sous-titre;
- la disposition générale.

---

## 8. Stratégie de format 16:9

La méthode `contain` avec fond ajouté doit être abandonnée.

Deux stratégies seront comparées avant de modifier le dépôt.

### Option A — Génération native en 16:9

Utiliser un modèle ou une configuration qui produit directement une image 16:9.

À vérifier :

- disponibilité dans l’architecture actuelle;
- qualité du texte français;
- créativité;
- coût et durée;
- complexité d’intégration.

### Option B — Recadrage central contrôlé

Si la sortie reste en 1536 × 1024 :

```text
Source : 1536 × 1024
Recadrage central : 1536 × 864
Sortie : 1280 × 720
```

Cette approche retire environ 80 pixels en haut et en bas, sans ajouter de bandes latérales.

Le prompt doit alors réserver une zone centrale sûre et garder les éléments essentiels loin des bandes supprimées.

### Décision provisoire

Ne pas choisir uniquement sur la base de la théorie.

Comparer les deux stratégies, si la génération native 16:9 est disponible simplement, sur trois sujets et dans les vraies cartes du site.

La stratégie retenue doit produire :

- un fichier final 16:9;
- aucune bande visible;
- aucune différence de fond;
- aucun titre ou élément important coupé.

---

## 9. Architecture du futur prompt v3

Le futur `thumbnail-skill-v3` devrait rester relativement court et comporter cinq blocs.

### 1. Rôle

Définir l’image comme une couverture de catalogue lisible, évocatrice et non comme une mini-infographie.

### 2. Contenu éditorial

Fournir le titre, le sous-titre, le résumé, le thème, les points essentiels et le message principal pour comprendre le sujet.

Préciser que ces informations ne doivent pas toutes être reproduites.

### 3. Contraintes fermes

Inclure uniquement les interdictions universelles :

- pas de série ni d’épisode;
- pas de paragraphe ni de microtexte;
- pas de sources, URL, logos ou filigranes;
- pas de contenu essentiel hors de la zone sûre.

### 4. Liberté de conception

Demander au modèle de choisir :

- la métaphore;
- la famille de composition;
- la quantité de texte utile;
- la disposition;
- le niveau d’abstraction.

Les familles de compositions sont proposées comme inspiration, sans choix imposé.

### 5. Qualité finale

Demander :

- une lisibilité réelle dans une petite carte;
- un concept immédiatement reconnaissable;
- une identité propre au sujet;
- une composition qui évite les gabarits génériques;
- une cohérence avec la palette Ressources IA;
- un cadrage sûr pour le format final.

---

## 10. Stratégie de variété

La première version de la v3 ne doit pas ajouter :

- un autre modèle de langage;
- un historique de compositions;
- un sélecteur administratif;
- une nouvelle table de données.

Approche initiale :

- proposer plusieurs familles de compositions;
- laisser le modèle choisir selon le sujet;
- ne prescrire aucune disposition fixe;
- évaluer la série comme un ensemble;
- régénérer manuellement les résultats trop semblables.

Si la répétition demeure problématique, une direction visuelle facultative ou un mécanisme de sélection de famille pourra être évalué plus tard.

---

## 11. Ensemble d’essai

La série **Les fondamentaux de l’IA générative** sert de banc d’essai :

1. IA, apprentissage automatique et IA générative;
2. entraînement et inférence;
3. génération d’une réponse par un modèle de langage;
4. prompt, instructions et contexte;
5. embeddings;
6. RAG;
7. hallucinations et fiabilité.

Premier test sur trois sujets représentatifs :

- entraînement et inférence;
- embeddings;
- hallucinations et fiabilité.

Ils permettent de comparer une opposition, une représentation spatiale et un sujet de risque.

---

## 12. Grille d’évaluation

Chaque thumbnail est noté de 1 à 5.

| Critère | Question |
|---|---|
| Lisibilité | Les textes utiles restent-ils faciles à lire dans la carte? |
| Simplicité | L’image ressemble-t-elle à une couverture plutôt qu’à une mini-fiche? |
| Pertinence | Le concept visuel représente-t-il réellement le sujet? |
| Créativité | La composition possède-t-elle une identité propre? |
| Variété | Se distingue-t-elle des autres thumbnails de la série? |
| Cadrage | Le 16:9 est-il rempli sans coupure ni bordure artificielle? |

Score maximal : 30
Seuil de validation recommandé : 24/30

Le jugement éditorial reste prioritaire sur le score.

### Problèmes éliminatoires

- titre ou élément principal coupé;
- bande ou bordure artificielle;
- série ou épisode dans l’image;
- microtexte dominant;
- paragraphe ou bloc explicatif dense;
- source ou URL;
- logo incorrect ou filigrane;
- concept sans rapport;
- texte français central manifestement incorrect;
- composition pratiquement identique à plusieurs autres résultats;
- fichier final qui n’est pas réellement 16:9.

---

## 13. Critères d’acceptation de la direction v3

La direction peut être acceptée lorsque :

- les sept sujets ont été testés;
- les images retenues atteignent environ 24/30 ou plus;
- aucun résultat retenu ne présente de problème éliminatoire;
- au moins quatre familles de compositions sont visibles dans la série;
- aucune disposition unique ne domine presque tout l’ensemble;
- les textes utiles restent lisibles dans les cartes;
- les images ressemblent à des couvertures;
- les fichiers finaux remplissent réellement le 16:9;
- aucune bande ajoutée ni coupure importante n’est visible.

---

## 14. Plan de travail

### Étape 1 — Prompt expérimental

Rédiger un premier prompt v3 fondé sur ce document, sans modifier immédiatement le dépôt.

### Étape 2 — Trois essais

Produire des essais pour :

- entraînement et inférence;
- embeddings;
- hallucinations et fiabilité.

### Étape 3 — Comparaison du format

Comparer, lorsque possible :

- une production native 16:9;
- la sortie actuelle avec recadrage central contrôlé.

Observer les résultats dans une vraie carte du site.

### Étape 4 — Évaluation

Noter les résultats avec la grille et relever :

- les points forts;
- les répétitions;
- les problèmes de texte;
- le cadrage;
- le poids du fichier final.

### Étape 5 — Ajustement

Modifier uniquement les règles responsables des problèmes observés, sans transformer le prompt en longue liste d’interdictions.

### Étape 6 — Série complète

Tester les sept sujets et évaluer l’ensemble comme une collection.

### Étape 7 — Correctif Codex

Après validation seulement :

- implanter `thumbnail-skill-v3`;
- remplacer la stratégie `contain`;
- conserver l’infrastructure sécurisée de l’incrément 2;
- mettre à jour les tests ciblés;
- régénérer manuellement les thumbnails retenus.

---

## 15. Hors périmètre

- thumbnail de série;
- génération automatique;
- génération en lot;
- plusieurs variantes enregistrées;
- historique de versions;
- éditeur graphique;
- prompt libre dans l’administration;
- sélection du fournisseur ou du modèle dans l’interface;
- nouvelle table de composition;
- modification du contrat JSON;
- refonte des cartes publiques.

---

## 16. Prochaine action

Préparer un **prompt expérimental v3** pour les trois sujets représentatifs, puis évaluer les résultats avant tout nouveau prompt Codex de développement.

```text
Conception v3
→ prompt expérimental
→ essais sur 3 sujets
→ comparaison du format
→ évaluation
→ ajustement
→ essais sur les 7 sujets
→ validation éditoriale
→ correctif Codex
```
