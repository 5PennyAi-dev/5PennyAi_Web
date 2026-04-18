# Types d'infographies — 7 formats pour le blog 5PennyAi

Ce fichier catalogue les 7 types d'infographies à produire. Lis-le au moment de **choisir le type** pour un article.

Pour chaque type : **quand l'utiliser**, **composition type**, **éléments requis**, **pièges à éviter**.

---

## 1. Système annoté (stations autour d'un centre)

**Quand l'utiliser** : l'article explique **un système, un outil ou une solution** qui a plusieurs composantes ou fonctions. Le lecteur doit comprendre **ce qui gravite autour d'une idée centrale**.

### Composition type

- **Élément central dominant** : une illustration symbolique (laptop, dashboard, brain, key visual du sujet) — centré, environ 30-40% de l'image
- **3-6 stations autour** disposées en cercle ou en étoile, reliées au centre par des lignes fines
- Chaque station = **une pastille ronde avec une icône** + **une étiquette alphabétique (A, B, C, D)** + **un court bloc de texte** (2-4 lignes) à côté
- **Titre en haut**, sous-titre optionnel
- **Footer discret** en bas (5pennyai.com)

### Éléments requis dans le prompt

- Titre principal (texte exact)
- Liste des 3-6 stations : chacune avec sa lettre, son icône décrite, son label (3-5 mots) et son texte descriptif (10-20 mots)
- Description de l'élément central
- Instructions pour les lignes de connexion (fines, en navy ou lavender)

### Pièges à éviter

- Plus de 6 stations → surcharge, regrouper
- Stations de tailles inégales → toutes les pastilles de même diamètre
- Texte par station trop long → viser 10-20 mots max, sinon c'est illisible
- Oublier les lignes de connexion → elles font le "système"

### Exemple d'application

> *Article : "Comment fonctionne un assistant IA RAG"*  
> Centre : un laptop avec un bulle de chat. 4 stations autour : A) Ingestion (icône de pipeline), B) Embeddings (icône de vecteurs), C) Retrieval (icône de loupe), D) Generation (icône de plume). Chaque station avec 2 lignes de texte explicatif.

---

## 2. Processus numéroté (étapes 1→N)

**Quand l'utiliser** : l'article décrit **une méthode, une procédure, une séquence d'étapes**. L'ordre compte.

### Composition type

- **Titre principal** en haut
- **3-6 étapes** disposées :
  - En **ligne horizontale** (si 3-4 étapes, format 16:9)
  - En **colonne verticale** (si 4-6 étapes, format 4:5 ou 3:4)
  - En **zig-zag** ou **S** (si 5-6 étapes)
- Chaque étape = **un gros numéro** (en orange `#DD8737`) + **un titre court** + **une description** + **une icône**
- **Flèches ou lignes directionnelles** entre les étapes (fines, en navy)
- **Mini-stat optionnelle** par étape (ex : "+ 47% efficacité")
- **Footer**

### Éléments requis dans le prompt

- Titre principal
- Pour chaque étape : numéro, titre court (3-5 mots), description (10-20 mots), icône
- Éventuelles stats associées à chaque étape
- Disposition (horizontale, verticale, zigzag)

### Pièges à éviter

- Plus de 6 étapes → regrouper ou faire deux infographies
- Étapes visuellement identiques → différencier par icônes distinctes et éventuellement nuances de couleur dans les pastilles
- Numérotation ambiguë → numéros ÉNORMES et bien visibles (en orange)

### Exemple d'application

> *Article : "4 étapes pour intégrer l'IA dans ton service client"*  
> 4 étapes horizontales. 1) Diagnostic (icône loupe) - "Identifier les points de friction". 2) Pilote (icône fusée) - "Tester sur un cas limité". 3) Intégration (icône engrenage) - "Déployer sur l'équipe". 4) Mesure (icône graphique) - "Suivre les KPIs".

---

## 3. Comparaison chiffrée (avant/après, A vs B)

**Quand l'utiliser** : l'article oppose deux situations, deux approches, deux ères (avec ou sans IA, méthode A vs B).

### Composition type

- **Titre principal** en haut
- **Image divisée verticalement en deux colonnes** égales, séparées par une fine ligne centrale ou un petit symbole "VS" en pastille
- **En-tête de chaque colonne** : un label clair ("AVANT" / "APRÈS", "SANS IA" / "AVEC IA", "MÉTHODE A" / "MÉTHODE B") dans une pastille ou bandeau
- **3-4 lignes de comparaison** alignées horizontalement : chaque ligne compare un aspect (durée, coût, taux, etc.)
- Chaque ligne : **icône à gauche** + **donnée chiffrée dans chaque colonne** + **label court**
- **Différenciation couleur entre les colonnes** : côté "problème" en lavender `#DBCFEE`, côté "solution" en steel blue `#81AED7` avec accents orange pour les chiffres-vedettes
- **Footer**

### Éléments requis dans le prompt

- Titre principal
- Labels des deux colonnes (ex : "AVANT" / "APRÈS")
- Liste des 3-4 critères comparés avec les valeurs chiffrées de chaque côté
- Icônes associées à chaque critère

### Pièges à éviter

- Comparer des éléments non-comparables → chaque ligne doit avoir un critère clair
- Pas assez de chiffres → une comparaison sans stats manque de mordant
- Caricature (tout mauvais à gauche, tout bon à droite) → rester crédible

### Exemple d'application

> *Article : "Gestion manuelle vs automatisée avec l'IA"*  
> Deux colonnes. Gauche "Manuel" en lavender. Droite "Avec IA" en steel blue. 4 lignes : Temps (2h / 20min en orange), Erreurs (12% / 2%), Coût (500$/mois / 150$/mois), Satisfaction (65% / 92% en orange). Chaque critère avec son icône.

---

## 4. Concept + stats constellation

**Quand l'utiliser** : l'article défend **une idée, un concept** ou présente **un phénomène** appuyé par plusieurs chiffres frappants.

### Composition type

- **Titre principal** en haut
- **Illustration centrale symbolique** qui incarne le concept (30-40% de l'image)
- **3-6 stats chiffrées** disposées en constellation autour
- Chaque stat = **un gros chiffre en orange** (47%, 12h, etc.) + **un label explicatif court** (2-5 mots) + optionnellement une **mini icône**
- Les stats peuvent être dans des **pastilles circulaires** ou simplement posées avec des lignes fines qui les relient au centre
- **Citation / accroche** en bas (optionnel)
- **Footer**

### Éléments requis dans le prompt

- Titre principal
- Description de l'illustration centrale (métaphore simple et directe)
- Les 3-6 stats : chiffre exact + label explicatif
- Éventuellement une citation / phrase-choc

### Pièges à éviter

- Trop de stats (>6) → le lecteur ne retient rien
- Stats non hiérarchisées → une d'entre elles doit être visuellement plus grosse (la plus frappante)
- Illustration centrale trop abstraite → préférer concret et reconnaissable

### Exemple d'application

> *Article : "L'impact de l'IA sur les ventes B2B"*  
> Centre : illustration stylisée d'une courbe ascendante avec un vendeur à la base. 5 stats autour : "47% plus productif", "12h économisées/semaine", "50% de leads en +", "60% de coûts en –", "83% de croissance". Citation en bas.

---

## 5. Stack hiérarchique (couches verticales)

**Quand l'utiliser** : l'article présente **une hiérarchie, une pile, des niveaux** — stack techno, pyramide de Maslow, niveaux de maturité, hiérarchie de besoins.

### Composition type

- **Titre principal** en haut
- **Stack vertical central** : 3-5 couches empilées, chaque couche étant un rectangle plein ou une bande large
- Chaque couche a :
  - **Une couleur différente** (dans la palette — navy, steel blue, lavender, avec orange pour la couche focale)
  - **Un label principal** au centre ou à gauche
  - **Une icône** à gauche ou à droite
  - **Une description courte** à droite de la couche (1 ligne)
  - Optionnel : **un pourcentage** ou chiffre à droite
- **Annotations latérales** : flèches avec labels ("Foundation", "Core", "Interface", etc.) à gauche de la stack
- **Footer**

### Éléments requis dans le prompt

- Titre principal
- Pour chaque couche (du bas vers le haut ou inverse) : label, icône, description, couleur, % optionnel
- Annotations latérales si pertinent

### Pièges à éviter

- Trop de couches (>5) → regrouper
- Couches toutes de même hauteur → varier légèrement pour suggérer l'importance
- Ordre ambigu → flèche verticale claire indiquant la direction (foundation vers top, ou l'inverse)

### Exemple d'application

> *Article : "Les 4 couches d'une stratégie IA"*  
> Stack vertical. De bas en haut : couche 1 "Données" en lavender (icône base de données), couche 2 "Modèles" en steel blue (icône cerveau), couche 3 "Interfaces" en orange focal (icône écran), couche 4 "Équipe" en navy (icône personnes). Chaque couche avec description courte à droite et annotation à gauche.

---

## 6. Dashboard multi-widgets

**Quand l'utiliser** : l'article présente **un ensemble d'indicateurs, de données, de métriques** autour d'un sujet. Style "tableau de bord éditorial".

### Composition type

- **Titre principal + sous-titre** en haut (comme un header de dashboard)
- **Grille de widgets** (2×2, 2×3, ou 3×2) — chaque widget est une mini-carte avec fond coloré subtil, bordure fine ou sans bordure
- Widgets variés :
  - **Donut chart** avec % au centre
  - **Bar chart** comparatif
  - **Icône + grand chiffre**
  - **Timeline horizontale**
  - **Progress bars** (3-4 barres)
  - **Top 3 list**
- Chaque widget a un **titre court** et des **valeurs claires**
- **Alignement impeccable** sur grille
- **Footer**

### Éléments requis dans le prompt

- Titre principal et sous-titre
- Pour chaque widget : type précis, titre, données chiffrées exactes, icône si applicable
- Disposition en grille (2×2, 2×3, etc.)

### Pièges à éviter

- Widgets incohérents entre eux (tailles, styles) → tous dans le même style
- Trop de widgets (>6) → alléger
- Trop de types différents de data-viz → maximum 3 types distincts

### Exemple d'application

> *Article : "L'état de l'IA en PME au Québec en 2026"*  
> Dashboard 2×3. Widget 1 : donut "34% des PME utilisent l'IA". Widget 2 : top 3 secteurs. Widget 3 : bar chart par taille d'entreprise. Widget 4 : grand chiffre "+ 47% adoption YoY". Widget 5 : timeline 2020-2026. Widget 6 : progress bars des 4 principaux usages.

---

## 7. Catalogue en grille (N outils/éléments)

**Quand l'utiliser** : l'article présente **une liste d'outils, de méthodes, de ressources, d'erreurs, de pièges** — chacun avec ses caractéristiques. Classique pour les articles "X outils pour Y", "N erreurs à éviter", "Les N clés de…".

### Variantes du type 7

**7A. Catalogue positif** (outils, méthodes, ressources)
- Grille ou stack d'éléments à adopter
- Chaque cellule = nom + icône + tagline + indicateur optionnel

**7B. Catalogue d'erreurs / pièges** (★ pattern recommandé)
- Stack vertical de 5-7 erreurs à éviter
- Chaque carte contient : numéro stylisé "01"–"0N" + icône contenu-riche + titre erreur + description + **pastille solution** à droite (pattern "erreur + remède")
- **Toujours** terminer par une barre de synthèse qui donne la règle d'or positive
- Touche ludique recommandée : un sticker "À ÉVITER !" sur la carte la plus critique (souvent la 1re)

### Composition type (7A)

- **Titre principal** en haut (souvent "Les N outils pour...")
- **Sous-titre** court qui précise le bénéfice
- **Grille régulière** des N éléments
- Chaque cellule = **une carte** avec numéro, icône, nom, mini-description, indicateur optionnel
- **Récap en bas** : 1-3 stats synthétiques

### Composition type (7B)

- **Ornement éditorial** en haut : pastille "SÉRIE · ÉTAPE X"
- **Titre principal**
- **Sous-titre**
- **Stack vertical** de 5-7 cartes d'erreurs identiques :
  - Numéro stylisé "01"–"0N" en orange + petit tiret
  - Pastille icône (80-100px, couleurs en rotation : cobalt/violet/teal)
  - Titre de l'erreur en bold navy
  - Description courte (10-20 mots)
  - **Pastille "solution" verticale à droite** (teal plein, texte blanc, 2-4 mots avec "✓")
- **Sticker ludique** qui déborde de l'erreur la plus critique (golden amber, une fois seulement)
- **Micro-motifs décoratifs** dans les marges (constellations de 3 points cobalt)
- **Barre de synthèse enrichie** en bas avec **mini-viz d'ancrage** (ex : 13 mini-carrés pour une règle "13 tags")

### Éléments requis dans le prompt (7B)

- Titre principal + sous-titre + pastille éditoriale
- Pour chaque erreur : numéro, titre, description, icône contenu-riche, texte pastille solution
- Spec du sticker ludique (quel carton ? quel texte ?)
- Spec de la barre de synthèse (texte + mini-viz)

### Pièges à éviter

- Plus de 7 éléments → 2 infographies ou regrouper
- Descriptions trop longues → ultra-concis (≤ 20 mots)
- Cellules de tailles différentes → même dimension
- Icônes génériques sans contenu → **toujours** mettre un mot, un chiffre, un signe distinctif dans l'icône
- Plus d'un sticker ludique → kitsch

### Exemples d'application

> *Article 7A : "7 outils IA gratuits pour la prospection B2B"*
> Grille 3×3 avec les 7 outils + 2 cellules stats. Icônes catégoriques (funnel, chat bubble, magnifying glass). Stats "12H / SEMAINE" et "47%".

> *Article 7B : "5 erreurs qui plombent vos tags Etsy"*
> Stack 5 cartes. Icônes contenu-riche (grille de 13 slots, mots "vintge→vintage", tags "FR"/"EN"). Pastilles solution teal. Sticker "À ÉVITER !" amber sur carte 1. Barre synthèse avec mini-viz de 13 carrés orange.

---

## Aide au choix rapide

| Si l'article est sur… | Type à choisir |
|-----------------------|----------------|
| Un système/outil avec composantes | 1 — Système annoté |
| Une méthode étape par étape | 2 — Processus numéroté |
| Une opposition avec chiffres | 3 — Comparaison chiffrée |
| Un concept + plusieurs stats | 4 — Concept constellation |
| Des niveaux, une stack, une pyramide | 5 — Stack hiérarchique |
| Un ensemble d'indicateurs / métriques | 6 — Dashboard multi-widgets |
| Une liste d'outils/éléments | 7A — Catalogue positif |
| Une liste d'erreurs/pièges | 7B — Catalogue d'erreurs (avec pastilles solution) |

**En cas de doute entre deux types** : regarder la structure des titres H2 dans l'article. Si ce sont des **étapes** → type 2. Des **outils** → type 7. Des **composantes** → type 1. Des **stats éparses** → type 4 ou 6.
