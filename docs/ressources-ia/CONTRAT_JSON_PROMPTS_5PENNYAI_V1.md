# Contrat JSON — Prompts 5PennyAi v1

**Projet :** 5PennyAi
**Section :** Ressources IA
**Format :** Prompts réutilisables
**Version du contrat :** 1
**Date :** 13 août 2026
**Statut :** conception fonctionnelle prête à être utilisée pour le développement du MVP Bibliothèque de prompts

---

## 1. But du document

Ce document définit le format JSON utilisé pour préremplir le formulaire d’ajout ou de modification d’un prompt dans l’administration **Ressources IA** de 5PennyAi.

Il sert d’interface entre :

1. le processus de production éditoriale des prompts;
2. l’administration du site;
3. le rendu public de la bibliothèque de prompts.

Le JSON contient les données éditoriales nécessaires pour présenter un modèle de prompt simple, pratique et réutilisable :

- les métadonnées générales;
- la classification;
- le contexte d’utilisation;
- le modèle de prompt à copier;
- les variables à personnaliser;
- les exemples utilisés pour produire un exemple rempli;
- un conseil d’utilisation;
- une variante rapide facultative;
- une mise en garde facultative;
- les métadonnées éditoriales du thumbnail;
- les mots-clés;
- les suggestions SEO.

Le JSON ne contient aucun fichier binaire et ne publie jamais directement le prompt.

---

## 2. Principe fondamental

> Le JSON décrit le prompt et son usage, mais l’application contrôle les données techniques, les fichiers, l’enregistrement et la publication.

La bibliothèque est destinée en priorité à un public non technique.

Un prompt 5PennyAi doit donc être conçu comme un **modèle de demande réutilisable**, et non comme une démonstration de prompt engineering.

Le contrat distingue deux niveaux de conformité.

### 2.1 Import administratif permissif

L’administration doit accepter un JSON partiel.

Elle doit :

- importer les propriétés reconnues;
- conserver les valeurs utilisables;
- ignorer les propriétés inconnues;
- signaler les valeurs non reconnues sans bloquer;
- laisser Christian corriger le formulaire;
- ne jamais enregistrer automatiquement;
- ne jamais publier automatiquement;
- ne jamais remplacer un formulaire déjà rempli sans confirmation;
- préserver les fichiers déjà associés au prompt lors d’une réimportation.

Un objet vide demeure importable :

```json
{}
```

Un objet partiel demeure importable :

```json
{
  "schemaVersion": 1,
  "contentType": "prompt",
  "title": "Comparer deux options"
}
```

### 2.2 Production attendue du générateur

Le processus éditorial qui produit les prompts doit normalement générer un paquet plus complet contenant au minimum :

- `schemaVersion`;
- `contentType`;
- `language`;
- `title`;
- `summary`;
- `category`;
- `level`;
- `whenToUse`;
- `promptTemplate`;
- `variables`;
- `tip`;
- `editorialObjective`;
- `keywords`;
- `seo`.

Le bloc `thumbnail` est recommandé afin de permettre la génération externe ou intégrée d’une couverture cohérente avec le catalogue, mais l’absence de thumbnail réel ne bloque jamais la publication.

Cette exigence décrit la qualité attendue du paquet produit. Elle ne transforme pas tous les champs en conditions techniques de publication.

---

## 3. Positionnement éditorial du format

Une fiche Prompt répond d’abord à la question :

> **« Qu’est-ce que j’essaie de faire avec l’aide d’une IA? »**

Le format doit rester :

- pratique;
- compréhensible sans connaissance du prompt engineering;
- utilisable avec plusieurs assistants généralistes;
- orienté vers une tâche concrète;
- simple à personnaliser;
- facile à copier;
- explicite sur ses limites lorsque nécessaire.

Les titres doivent décrire le résultat recherché.

Préférer :

```text
Comparer deux options selon mes critères
Expliquer un concept simplement
Transformer des notes en plan clair
Identifier ce qui devrait être vérifié
```

Éviter :

```text
Prompt comparatif multicritère
Technique de contextual prompting
Framework de raisonnement décisionnel
Prompt chain avancé
```

---

## 4. Structure complète de référence

```json
{
  "schemaVersion": 1,
  "contentType": "prompt",
  "language": "fr",
  "title": "Comparer deux options selon mes critères",
  "summary": "Comparez deux possibilités en fonction de votre situation et des critères qui comptent réellement pour vous.",
  "category": "decide",
  "level": "beginner",
  "contexts": [
    "daily_life",
    "work"
  ],
  "resultTypes": [
    "table",
    "analysis"
  ],
  "whenToUse": "Utilisez ce modèle lorsque vous hésitez entre deux possibilités et souhaitez comprendre leurs avantages, leurs limites et leurs compromis selon votre propre situation.",
  "promptTemplate": "Compare [OPTION_A] et [OPTION_B] pour la situation suivante :\n\n[MA_SITUATION]\n\nLes critères qui comptent pour moi sont :\n[CRITERES]\n\nPour chaque critère :\n- compare les deux options;\n- explique leurs principaux avantages et limites;\n- indique les compromis importants;\n- signale toute information qui te manque ou dont tu n’es pas certain.\n\nPrésente d’abord la comparaison dans un tableau.\n\nEnsuite, explique dans quelles situations chaque option pourrait être préférable.\n\nNe choisis pas automatiquement un gagnant si les informations disponibles ne permettent pas de le faire raisonnablement.",
  "variables": [
    {
      "key": "OPTION_A",
      "label": "Première option",
      "description": "La première possibilité que vous voulez comparer.",
      "example": "Louer une voiture"
    },
    {
      "key": "OPTION_B",
      "label": "Deuxième option",
      "description": "La deuxième possibilité que vous voulez comparer.",
      "example": "Acheter une voiture"
    },
    {
      "key": "MA_SITUATION",
      "label": "Ma situation",
      "description": "Les éléments de votre situation qui peuvent influencer le choix.",
      "example": "Je parcours environ 12 000 km par année, je change généralement de véhicule tous les quatre ou cinq ans et je préfère avoir des dépenses prévisibles."
    },
    {
      "key": "CRITERES",
      "label": "Mes critères",
      "description": "Les aspects qui comptent réellement dans votre décision.",
      "example": "- coût total\n- mensualités\n- entretien\n- flexibilité\n- valeur de revente"
    }
  ],
  "tip": "Plus vos critères reflètent vos vraies priorités, plus la comparaison sera utile.",
  "quickTemplate": "Compare [OPTION_A] et [OPTION_B] selon [CRITERES] dans la situation suivante : [MA_SITUATION]. Présente les principaux avantages, limites et compromis dans un tableau.",
  "caution": "La comparaison dépend des informations fournies. Pour une décision importante, vérifiez les faits, prix, règles ou conditions susceptibles d’avoir changé.",
  "editorialObjective": "Aider l’utilisateur à remplacer une demande vague comme « laquelle est meilleure? » par une comparaison structurée qui tient compte de sa situation et de ses propres critères.",
  "thumbnail": {
    "altText": "",
    "generationBrief": "Créer une couverture horizontale 16:9 pour un prompt permettant de comparer deux options selon des critères personnels. Représenter visuellement deux choix mis en balance autour de quelques critères. Composition simple et immédiatement lisible en petite carte. Le visuel doit évoquer l’action de comparer et décider, sans reproduire le prompt, sans paragraphe, sans microtexte, sans source, sans URL, sans logo généré et sans filigrane.",
    "preferredAspectRatio": "16:9"
  },
  "keywords": [
    "comparer",
    "choisir",
    "décision",
    "critères",
    "options"
  ],
  "seo": {
    "primaryQuery": "prompt pour comparer deux options",
    "secondaryQueries": [
      "prompt pour faire un choix",
      "comparer deux options avec une IA",
      "prompt comparaison critères"
    ],
    "seoTitle": "Prompt pour comparer deux options selon vos critères",
    "metaDescription": "Utilisez ce modèle de prompt pour comparer deux possibilités selon votre situation, vos critères et vos priorités.",
    "suggestedSlug": "comparer-deux-options-selon-mes-criteres",
    "internalLinkSuggestions": []
  }
}
```

---

# 5. Propriétés principales

## 5.1 `schemaVersion`

Type attendu :

```text
nombre entier
```

Valeur de cette version :

```json
"schemaVersion": 1
```

La propriété est recommandée.

Lorsqu’elle est absente, l’administration peut interpréter le fichier comme un JSON Prompts v1.

Une autre valeur produit un avertissement, mais les propriétés reconnues peuvent tout de même être importées.

---

## 5.2 `contentType`

Type attendu :

```text
chaîne de caractères
```

Valeur attendue :

```json
"contentType": "prompt"
```

Une valeur différente produit un avertissement.

Elle ne doit jamais :

- créer automatiquement un autre type de ressource;
- provoquer une redirection silencieuse;
- enregistrer;
- publier.

---

## 5.3 `language`

Type attendu :

```text
chaîne de caractères
```

Valeurs initiales permises :

```text
fr
en
```

Exemple :

```json
"language": "fr"
```

La langue représente la langue réelle du prompt et de sa fiche, et non la langue de l’interface administrative.

Une valeur inconnue produit un avertissement.

---

## 5.4 `title`

Type attendu :

```text
chaîne de caractères
```

Utilisation :

- liste d’administration;
- carte du catalogue;
- page détaillée;
- métadonnées de page;
- fallback du titre SEO;
- génération initiale du slug;
- contexte de génération du thumbnail.

Le titre doit :

- décrire une action ou un résultat;
- être compréhensible par un non-spécialiste;
- rester utilisable hors contexte;
- éviter le jargon de prompt engineering;
- éviter les promesses absolues ou sensationnalistes.

Si le titre est absent, le formulaire reste utilisable.

Le site public peut utiliser un fallback neutre comme :

```text
Prompt
```

---

## 5.5 `summary`

Type attendu :

```text
chaîne de caractères
```

Le résumé décrit en une ou deux phrases ce que le modèle permet d’accomplir.

Utilisation :

- carte du catalogue;
- en-tête de la fiche;
- description de partage;
- fallback de la meta description;
- recherche interne.

Le résumé ne doit pas :

- répéter le prompt;
- expliquer toute la méthode;
- employer du jargon inutile;
- promettre un résultat garanti.

---

# 6. Classification

## 6.1 `category`

Type attendu :

```text
chaîne de caractères
```

Une fiche possède **exactement une catégorie principale**.

Valeurs initiales permises :

| Valeur JSON | Affichage français | Intention |
|---|---|---|
| `understand` | Comprendre | Clarifier un concept ou une idée |
| `learn` | Apprendre | Apprendre, pratiquer ou vérifier sa compréhension |
| `write` | Écrire | Produire, reformuler ou améliorer un texte |
| `summarize` | Résumer | Aller à l’essentiel ou extraire l’information importante |
| `think` | Réfléchir | Explorer des idées, possibilités ou perspectives |
| `organize` | Organiser | Structurer des informations, étapes ou tâches |
| `decide` | Décider | Comparer des possibilités ou préparer un choix |
| `verify` | Vérifier | Examiner de façon critique, repérer les limites ou les éléments à confirmer |

Une autre valeur produit un avertissement et peut être laissée à corriger dans l’administration.

La catégorie sert à répondre à la question :

> **« Qu’est-ce que je veux faire? »**

Elle ne représente pas le contexte d’utilisation.

---

## 6.2 `level`

Type attendu :

```text
chaîne de caractères
```

Valeurs permises :

```text
beginner
intermediate
advanced
```

Correspondance publique :

| Valeur JSON | Affichage français |
|---|---|
| `beginner` | Débutant |
| `intermediate` | Intermédiaire |
| `advanced` | Avancé |

### Débutant

Le modèle peut être utilisé après avoir remplacé quelques éléments simples.

### Intermédiaire

Le modèle demande davantage de contexte, de critères ou d’itération.

### Avancé

Le modèle peut orchestrer plusieurs phases ou une analyse plus structurée.

Le niveau décrit la complexité d’utilisation du modèle, et non la difficulté du sujet sur lequel il peut être appliqué.

---

## 6.3 `contexts`

Type attendu :

```text
tableau de chaînes de caractères
```

Valeurs initiales permises :

| Valeur JSON | Affichage français |
|---|---|
| `daily_life` | Vie quotidienne |
| `work` | Travail |
| `studies` | Études |
| `communication` | Communication |
| `creativity` | Créativité |

Exemple :

```json
"contexts": [
  "daily_life",
  "work"
]
```

Les contextes :

- sont facultatifs;
- peuvent être multiples;
- servent à décrire dans quelles situations le prompt est particulièrement utile;
- peuvent être affichés comme tags;
- ne sont pas nécessairement des filtres publics dans le MVP initial.

Une valeur inconnue produit un avertissement.

Le contexte de bibliothèque est distinct du contexte que l’utilisateur fournit à l’IA dans le prompt lui-même.

---

## 6.4 `resultTypes`

Type attendu :

```text
tableau de chaînes de caractères
```

Valeurs initiales permises :

```text
text
list
table
plan
checklist
questions
ideas
analysis
other
```

Correspondance indicative :

| Valeur JSON | Affichage français |
|---|---|
| `text` | Texte |
| `list` | Liste |
| `table` | Tableau |
| `plan` | Plan |
| `checklist` | Checklist |
| `questions` | Questions |
| `ideas` | Idées |
| `analysis` | Analyse |
| `other` | Autre |

Une fiche peut produire plusieurs types de résultat.

Exemple :

```json
"resultTypes": [
  "table",
  "analysis"
]
```

Cette propriété est une donnée secondaire de classification.

Le MVP initial n’est pas obligé d’en faire un filtre public.

---

# 7. Contexte d’utilisation

## 7.1 `whenToUse`

Type attendu :

```text
chaîne de caractères
```

Ce champ explique **dans quelle situation le modèle est utile**.

Il doit :

- être court;
- employer un vocabulaire courant;
- expliquer le besoin plutôt que la technique;
- aider le lecteur à savoir si le modèle correspond à sa situation.

Exemple :

```text
Utilisez ce modèle lorsque vous hésitez entre deux possibilités et souhaitez comprendre leurs avantages, leurs limites et leurs compromis selon votre propre situation.
```

Il ne doit pas devenir une introduction longue ou un mini-article.

Si le champ est absent, la section publique est simplement masquée.

---

# 8. Modèle de prompt

## 8.1 `promptTemplate`

Type attendu :

```text
chaîne de caractères
```

Cette propriété contient le texte exact proposé au lecteur.

Le texte est traité comme **texte brut préformaté**, et non comme du HTML exécutable.

Il peut contenir :

- paragraphes;
- retours de ligne;
- listes simples;
- ponctuation;
- variables entre crochets;
- instructions structurées.

Il ne nécessite pas de syntaxe Markdown particulière.

Exemple :

```text
Explique-moi [SUJET] comme si je découvrais ce concept pour la première fois.

Mon niveau actuel :
[CONNAISSANCES_ACTUELLES]

Commence par une explication simple...
```

### Règles éditoriales

Le modèle doit :

- répondre à un besoin principal;
- rester compréhensible par un non-technicien;
- demander uniquement les informations réellement utiles;
- éviter les rôles artificiellement grandiloquents;
- éviter les longues chaînes de contraintes sans valeur;
- demander à l’IA de signaler l’incertitude lorsque pertinent;
- éviter de présenter l’IA comme infaillible;
- pouvoir être adapté à plusieurs assistants généralistes lorsque possible.

### Affichage et copie

L’application doit :

- afficher le texte en préservant les retours de ligne;
- permettre sa sélection;
- proposer une action `Copier le prompt`;
- copier exactement le texte affiché;
- ne jamais exécuter une balise ou un script contenu dans le modèle.

Si `promptTemplate` est absent ou vide :

- la fiche peut rester éditable dans l’administration;
- un avertissement fort est affiché;
- l’action de copie publique est désactivée ou absente;
- la page publique utilise un message neutre si la publication est malgré tout autorisée.

---

# 9. Variables

## 9.1 `variables`

Type attendu :

```text
tableau d’objets
```

Chaque variable décrit un élément que le lecteur doit personnaliser dans le modèle.

Structure :

```json
{
  "key": "SUJET",
  "label": "Sujet",
  "description": "Le concept ou la question que vous voulez comprendre.",
  "example": "Les taux d’intérêt"
}
```

Un tableau vide est techniquement valide :

```json
"variables": []
```

Un prompt sans variable peut donc exister, même si cela demeure rare dans la bibliothèque initiale.

---

## 9.2 `variables[].key`

Type attendu :

```text
chaîne de caractères
```

Format recommandé :

```text
^[A-Z0-9]+(?:_[A-Z0-9]+)*$
```

Exemples valides :

```text
SUJET
PUBLIC
OPTION_A
OPTION_B
MA_SITUATION
CRITERES
NIVEAU_ACTUEL
```

Exemples invalides :

```text
Sujet
MON SUJET
option-a
CRITÈRES
[SUJET]
```

La clé :

- ne contient pas les crochets;
- est unique dans le tableau;
- sert à résoudre les placeholders du modèle;
- ne doit pas être traduite dynamiquement.

---

## 9.3 Syntaxe des placeholders

Dans `promptTemplate`, une variable est référencée avec :

```text
[KEY]
```

Exemple :

```text
[SUJET]
```

La clé entre crochets doit correspondre exactement à `variables[].key`.

Le format reconnu est conceptuellement :

```text
\[([A-Z0-9]+(?:_[A-Z0-9]+)*)\]
```

L’administration peut ignorer les autres textes entre crochets qui ne correspondent pas à cette convention.

---

## 9.4 `variables[].label`

Type attendu :

```text
chaîne de caractères
```

Le libellé est destiné au lecteur.

Exemple :

```json
"label": "Ma situation"
```

Il doit :

- être naturel;
- être court;
- ne pas exposer la convention technique de la clé;
- pouvoir servir plus tard comme libellé d’un champ de personnalisation.

---

## 9.5 `variables[].description`

Type attendu :

```text
chaîne de caractères
```

La description explique ce que le lecteur doit fournir.

Exemple :

```text
Les éléments de votre situation qui peuvent influencer le choix.
```

Elle doit être suffisamment concrète pour aider un débutant.

Éviter :

```text
Ajoutez du contexte.
```

Préférer :

```text
Indiquez les éléments de votre situation qui pourraient changer la réponse.
```

---

## 9.6 `variables[].example`

Type attendu :

```text
chaîne de caractères
```

La valeur peut être :

- courte;
- longue;
- multiligne.

Elle sert à :

1. montrer ce qu’il faut écrire;
2. générer automatiquement l’exemple rempli de la fiche.

Pour la production éditoriale v1, chaque variable utilisée dans `promptTemplate` devrait normalement posséder un exemple non vide.

L’absence d’exemple produit un avertissement, mais ne bloque pas l’import.

---

# 10. Exemple rempli

## 10.1 Principe

Le contrat **ne stocke pas un deuxième prompt complet** uniquement pour afficher un exemple.

L’application construit l’exemple à partir de :

```text
promptTemplate
+
variables[].example
```

Cela évite la divergence entre :

```text
promptTemplate
examplePrompt
```

Aucune propriété `examplePrompt` n’est nécessaire dans la v1.

---

## 10.2 Substitution

Pour chaque placeholder reconnu :

```text
[KEY]
```

l’application remplace la valeur par :

```text
variables[key].example
```

La substitution doit être :

- littérale;
- déterministe;
- effectuée en une seule passe;
- non récursive.

Si un exemple contient lui-même un texte ressemblant à `[AUTRE_CLE]`, cette chaîne n’est pas réinterprétée pendant la même génération d’exemple.

---

## 10.3 Exemple incomplet

Si une variable utilisée dans le modèle ne possède pas de valeur `example` :

- l’administration affiche un avertissement;
- l’aperçu administratif peut montrer le placeholder non résolu;
- le rendu public peut masquer la section Exemple si l’exemple serait ambigu ou incomplet;
- le prompt principal reste utilisable.

L’application ne doit jamais inventer une valeur d’exemple manquante.

---

# 11. Conseil d’utilisation

## 11.1 `tip`

Type attendu :

```text
chaîne de caractères
```

Le conseil fournit un seul réflexe pratique permettant de mieux utiliser le modèle.

Exemple :

```text
Plus vos critères reflètent vos vraies priorités, plus la comparaison sera utile.
```

Le conseil doit :

- être court;
- être actionnable;
- éviter la théorie;
- apporter quelque chose de plus que le prompt lui-même.

Cible éditoriale :

```text
une ou deux phrases
```

Si le champ est absent, la section publique est masquée.

---

# 12. Variante rapide

## 12.1 `quickTemplate`

Type attendu :

```text
chaîne de caractères ou null
```

Exemple :

```json
"quickTemplate": "Compare [OPTION_A] et [OPTION_B] selon [CRITERES] dans la situation suivante : [MA_SITUATION]. Présente les principaux avantages, limites et compromis dans un tableau."
```

La variante rapide :

- est facultative;
- doit conserver l’utilité principale du modèle;
- peut utiliser un sous-ensemble des variables déclarées;
- ne doit pas introduire une variable absente de `variables`;
- possède sa propre action de copie lorsqu’elle est affichée.

Elle ne doit pas être produite artificiellement pour toutes les fiches.

Si elle n’apporte pas une vraie simplification, l’omettre.

---

# 13. Limite ou précision particulière

## 13.1 `caution`

Type attendu :

```text
chaîne de caractères ou null
```

Cette propriété sert uniquement lorsqu’une limite importante mérite d’être visible.

Exemples :

```text
Ce prompt aide à identifier quoi vérifier. Il ne remplace pas la vérification elle-même.
```

```text
Pour une décision importante, vérifiez les prix, règles, exigences ou autres informations susceptibles d’avoir changé.
```

Le bloc :

- doit rester court;
- ne doit pas devenir un avertissement générique présent partout;
- doit correspondre au risque réel du modèle.

Si aucune limite particulière ne mérite d’être soulignée, utiliser :

```json
"caution": null
```

ou omettre la propriété.

---

# 14. Objectif éditorial

## 14.1 `editorialObjective`

Type attendu :

```text
chaîne de caractères
```

Cette propriété est destinée principalement à l’administration et au workflow de production.

Elle décrit **pourquoi ce modèle existe**.

Exemple :

```text
Aider l’utilisateur à remplacer une demande vague comme « laquelle est meilleure? » par une comparaison structurée qui tient compte de sa situation et de ses propres critères.
```

Elle peut servir à :

- réviser la qualité du modèle;
- vérifier que le prompt répond à un besoin distinct;
- éviter les doublons dans la bibliothèque;
- maintenir la cohérence éditoriale.

Elle n’a pas besoin d’être affichée publiquement.

---

# 15. Thumbnail

## 15.1 Principe

Un prompt peut posséder un **thumbnail horizontal 16:9** afin de conserver l’uniformité visuelle du catalogue Ressources IA.

Le thumbnail est une **couverture de catalogue**, pas une image du prompt complet.

Il doit :

- faire reconnaître rapidement l’action ou l’intention du modèle;
- rester lisible en petite carte;
- avoir une identité propre;
- compléter les informations HTML sans les répéter inutilement;
- pouvoir servir comme image sociale lorsqu’elle existe.

Il ne doit pas :

- reproduire le prompt;
- afficher toutes les variables;
- devenir une mini-fiche;
- contenir un paragraphe;
- contenir du microtexte;
- inventer un fait ou un chiffre.

Le fichier réel demeure séparé du JSON.

---

## 15.2 `thumbnail`

Type attendu :

```text
objet
```

Structure :

```json
{
  "thumbnail": {
    "altText": "",
    "generationBrief": "Créer une couverture horizontale 16:9...",
    "preferredAspectRatio": "16:9"
  }
}
```

Le bloc est facultatif pour l’import.

Il est recommandé dans les paquets complets afin que le thumbnail puisse être produit :

- à l’extérieur de l’application;
- dans ChatGPT;
- ou plus tard par une fonction de génération intégrée.

---

## 15.3 `thumbnail.altText`

Type attendu :

```text
chaîne de caractères
```

Le texte alternatif est une suggestion éditoriale.

Une couverture décorative dont le titre est immédiatement répété dans la carte peut utiliser :

```json
"altText": ""
```

L’application conserve la décision finale selon le contexte d’affichage.

---

## 15.4 `thumbnail.generationBrief`

Type attendu :

```text
chaîne de caractères
```

Le brief doit décrire :

- l’action ou l’idée principale à représenter;
- une métaphore ou relation visuelle pertinente lorsque nécessaire;
- le besoin de lisibilité à petite taille;
- la faible densité de texte;
- les éléments importants à éviter.

Il doit produire une **couverture**, pas une mini-infographie.

Le brief doit éviter :

- le prompt complet;
- les longues listes;
- les variables détaillées;
- les sources;
- les URL;
- les logos générés;
- les marques tierces inutiles;
- les filigranes;
- les petits caractères;
- les données non fournies.

La génération peut utiliser le titre, le résumé, la catégorie, l’objectif éditorial et le brief comme contexte, sans reproduire toutes ces informations dans l’image.

---

## 15.5 `thumbnail.preferredAspectRatio`

Valeur attendue pour la v1 :

```text
16:9
```

Exemple :

```json
"preferredAspectRatio": "16:9"
```

Une autre valeur produit un avertissement.

Le fichier final peut être normalisé par l’application selon les conventions techniques retenues.

---

## 15.6 Fichier réel

Le JSON ne contient jamais :

- le fichier du thumbnail;
- son URL publique;
- son chemin de stockage;
- son identifiant Supabase;
- une image encodée;
- une URL temporaire de génération.

L’application contrôle le fichier réel.

---

## 15.7 Absence de thumbnail

L’absence de thumbnail :

- ne bloque pas l’import;
- ne bloque pas l’enregistrement;
- ne bloque pas la publication;
- utilise un fallback visuel cohérent avec le format Prompt;
- n’empêche pas l’accès à la fiche.

Dans le catalogue :

```text
thumbnail disponible
→ afficher le thumbnail

thumbnail absent
→ afficher le fallback Prompt 5PennyAi
```

Pour le partage social :

```text
thumbnail disponible et publiquement exploitable
→ peut servir d’image sociale

thumbnail absent
→ image sociale 5PennyAi par défaut
```

---

# 16. Mots-clés

## 16.1 `keywords`

Type attendu :

```text
tableau de chaînes de caractères
```

Les mots-clés servent à :

- améliorer la recherche interne;
- décrire le besoin;
- rapprocher des modèles connexes;
- couvrir des formulations naturelles utilisées par le public.

Exemple :

```json
"keywords": [
  "comparer",
  "choisir",
  "décision",
  "critères",
  "options"
]
```

Ils ne constituent pas une balise `meta keywords`.

Le générateur doit éviter :

- les doublons;
- les variantes inutiles;
- le bourrage SEO;
- les termes trop techniques sans rapport avec le public.

Cible souple :

```text
3 à 10 mots-clés
```

---

# 17. SEO

## 17.1 `seo`

Type attendu :

```text
objet
```

Le bloc SEO contient des suggestions éditoriales.

Il ne contient pas les données techniques contrôlées par le site.

Structure :

```json
{
  "seo": {
    "primaryQuery": "prompt pour comparer deux options",
    "secondaryQueries": [
      "prompt pour faire un choix",
      "comparer deux options avec une IA"
    ],
    "seoTitle": "Prompt pour comparer deux options selon vos critères",
    "metaDescription": "Utilisez ce modèle de prompt pour comparer deux possibilités selon votre situation, vos critères et vos priorités.",
    "suggestedSlug": "comparer-deux-options-selon-mes-criteres",
    "internalLinkSuggestions": []
  }
}
```

---

## 17.2 `seo.primaryQuery`

Type attendu :

```text
chaîne de caractères
```

La requête principale représente la formulation de recherche à laquelle la fiche souhaite répondre.

Elle doit :

- être naturelle;
- correspondre au besoin réel;
- refléter le contenu de la fiche;
- éviter le jargon inutile.

---

## 17.3 `seo.secondaryQueries`

Type attendu :

```text
tableau de chaînes de caractères
```

Le tableau contient des formulations connexes.

Cible souple :

```text
2 à 6 expressions
```

Un tableau vide est valide.

---

## 17.4 `seo.seoTitle`

Type attendu :

```text
chaîne de caractères
```

Le titre SEO peut être différent de `title` afin de mieux refléter la façon dont le public cherche un modèle.

Exemple :

```text
Prompt pour comparer deux options selon vos critères
```

Il doit :

- rester fidèle à la fiche;
- éviter le clickbait;
- éviter le bourrage de mots-clés;
- décrire clairement l’utilité du modèle.

---

## 17.5 `seo.metaDescription`

Type attendu :

```text
chaîne de caractères
```

La meta description doit expliquer brièvement ce que le lecteur pourra faire avec le modèle.

Elle doit être :

- spécifique;
- naturelle;
- exacte;
- non promotionnelle.

---

## 17.6 `seo.suggestedSlug`

Type attendu :

```text
chaîne de caractères
```

Le slug suggéré doit :

- être en minuscules;
- utiliser des tirets;
- éviter les accents;
- éviter les espaces;
- rester descriptif.

Exemple :

```text
comparer-deux-options-selon-mes-criteres
```

L’application reste responsable :

- de la normalisation;
- de l’unicité;
- du slug définitif;
- des éventuelles redirections après publication.

---

## 17.7 `seo.internalLinkSuggestions`

Type attendu :

```text
tableau d’objets
```

Structure possible :

```json
{
  "targetTopic": "Comment bien parler à une IA?",
  "suggestedAnchor": "formuler une demande plus claire",
  "placementHint": "Dans les ressources connexes"
}
```

Ces suggestions :

- servent à l’administration;
- ne contiennent pas d’URL inventée;
- ne sont pas insérées automatiquement;
- peuvent pointer vers un article, une infographie ou un autre prompt.

---

# 18. Séries, kits et collections

## 18.1 Séries

Le contrat Prompts v1 ne définit pas de propriété `series`.

Dans le MVP initial, les prompts sont organisés principalement par :

- catégorie;
- niveau;
- contextes;
- recherche.

Le format Prompt n’est pas automatiquement intégré aux séries pédagogiques existantes.

Une propriété `series` présente dans un JSON importé est traitée comme propriété inconnue tant qu’aucune évolution explicite du contrat ne la prend en charge.

---

## 18.2 Kits, parcours et collections

Les regroupements tels que :

```text
Kit — Mieux écrire avec l’IA
Parcours — Bien débuter avec l’IA
Collection — Prompts pour les études
```

sont volontairement reportés.

Ils ne doivent pas être simulés au moyen de propriétés non définies dans le contrat v1.

---

# 19. Propriétés techniques interdites

Le générateur ne doit pas produire les propriétés contrôlées par l’application, notamment :

```text
id
promptId
slug
status
thumbnailPath
thumbnailUrl
thumbnailGeneratedAt
publishedAt
createdAt
updatedAt
deletedAt
authorId
authorUrl
viewCount
copyCount
canonicalUrl
robots
ogImageUrl
structuredData
sitemapPriority
hreflang
```

Le générateur ne doit pas inclure :

- un fichier en base64;
- une image encodée;
- un chemin Supabase;
- une URL signée;
- une URL temporaire de génération;
- un statut de publication;
- un identifiant de base de données;
- le HTML rendu;
- les données structurées définitives;
- des paramètres techniques de modèle comme `temperature`, `maxTokens` ou `model`;
- une propriété `examplePrompt` redondante avec l’exemple calculé;
- un prompt déjà personnalisé pour un utilisateur particulier.

### 19.1 Slug définitif

Le générateur fournit seulement :

```text
seo.suggestedSlug
```

Le champ technique `slug` appartient à l’application.

### 19.2 Thumbnail réel

Le générateur peut fournir :

```text
thumbnail.generationBrief
thumbnail.altText
thumbnail.preferredAspectRatio
```

mais jamais :

```text
thumbnailPath
thumbnailUrl
```

---

# 20. Validations déterministes

L’administration doit pouvoir effectuer des contrôles simples et fiables.

Ces validations assistent Christian sans prendre la décision éditoriale à sa place.

## 20.1 Contrôles généraux

Vérifier notamment :

- `schemaVersion`;
- `contentType`;
- `language`;
- `category`;
- `level`;
- valeurs de `contexts`;
- valeurs de `resultTypes`;
- types des tableaux et objets;
- propriétés techniques interdites;
- structure du bloc `thumbnail`;
- ratio du thumbnail;
- structure du bloc `seo`.

---

## 20.2 Cohérence des variables

L’application doit comparer :

```text
placeholders présents dans promptTemplate
↔
variables[].key
```

Avertissements possibles :

### Placeholder non déclaré

```text
[PUBLIC]
```

est utilisé dans le prompt, mais aucune variable `PUBLIC` n’existe.

### Variable déclarée mais inutilisée

```text
CONTEXTE
```

est déclarée, mais `[CONTEXTE]` n’apparaît jamais dans `promptTemplate`.

### Clé dupliquée

Deux objets utilisent :

```text
"key": "SUJET"
```

### Clé invalide

Exemple :

```text
"key": "Mon sujet"
```

### Exemple manquant

Une variable utilisée dans le modèle ne possède pas de valeur `example`.

---

## 20.3 Cohérence de `quickTemplate`

Si `quickTemplate` est présent :

- les placeholders doivent respecter la même convention;
- chaque clé utilisée doit exister dans `variables`;
- le template peut utiliser seulement une partie des variables;
- une variable déclarée uniquement pour le prompt principal n’a pas besoin d’apparaître dans la version rapide.

Un placeholder inconnu produit un avertissement.

---

## 20.4 Cohérence du thumbnail

Avertissements possibles :

- bloc `thumbnail` présent sans `generationBrief`;
- ratio autre que `16:9`;
- brief contenant une demande explicite de paragraphe ou de microtexte;
- brief demandant une URL, une source ou un logo généré.

Les contrôles éditoriaux complexes restent toutefois humains.

---

## 20.5 Cohérence SEO

Avertissements possibles :

- requête principale absente;
- titre SEO absent;
- meta description absente;
- slug suggéré invalide;
- incohérence apparente entre `title` et `seo.primaryQuery`;
- longueurs inhabituelles.

Ces avertissements ne bloquent pas automatiquement la publication.

---

# 21. Import administratif

## 21.1 JSON valide et complet

L’application :

- préremplit les champs reconnus;
- prépare l’aperçu;
- génère l’exemple rempli lorsque possible;
- signale les avertissements;
- ne sauvegarde rien automatiquement;
- ne publie rien automatiquement;
- ne modifie aucun fichier déjà associé.

---

## 21.2 JSON valide mais partiel

L’application importe toutes les valeurs utilisables.

Les champs absents restent vides ou utilisent les fallbacks prévus.

---

## 21.3 Objet vide

Le JSON suivant est valide :

```json
{}
```

Il n’apporte aucune valeur au formulaire vide et ne déclenche aucune création automatique.

---

## 21.4 Valeur non reconnue

Exemple :

```json
{
  "category": "productivity",
  "level": "expert",
  "contexts": [
    "business"
  ]
}
```

Comportement :

- les valeurs inconnues sont signalées;
- les autres propriétés valides restent importées;
- aucune donnée valide n’est effacée.

---

## 21.5 Propriété inconnue

Exemple :

```json
{
  "title": "Résumer un texte",
  "promptScore": 98,
  "favoriteModel": "ExampleAI"
}
```

L’application importe `title`.

Elle ignore `promptScore` et `favoriteModel`, avec avertissement si le comportement administratif retenu le prévoit.

---

## 21.6 JSON syntaxiquement invalide

Si le fichier n’est pas un objet JSON lisible :

- aucun champ du formulaire n’est modifié;
- aucun thumbnail existant n’est supprimé;
- un message compréhensible est affiché;
- l’édition manuelle reste disponible.

---

## 21.7 Réimportation

Lorsqu’un formulaire ou un prompt enregistré contient déjà des valeurs :

- une confirmation est demandée avant remplacement des données éditoriales;
- le thumbnail déjà téléversé n’est jamais supprimé;
- son chemin n’est jamais remplacé par le JSON;
- une absence de bloc `thumbnail` dans le nouveau JSON ne supprime pas l’asset existant;
- l’import ne déclenche aucune génération de thumbnail;
- le statut reste contrôlé par l’application.

---

# 22. Validations réellement bloquantes

Seules quelques erreurs empêchent l’import lui-même :

- fichier illisible;
- JSON syntaxiquement invalide;
- valeur racine qui n’est pas un objet.

Les autres problèmes produisent des avertissements et laissent Christian corriger le formulaire.

La publication peut posséder ses propres contraintes techniques minimales définies par l’application, mais elles ne doivent pas être confondues avec la validité du fichier JSON.

---

# 23. Affichage public en présence de valeurs manquantes

| Valeur manquante | Comportement public recommandé |
|---|---|
| `title` | Afficher `Prompt` |
| `summary` | Masquer le résumé |
| `category` | Afficher seulement le format `Prompt` |
| `level` | Masquer le niveau |
| `contexts` | Masquer les tags de contexte |
| `resultTypes` | Aucun effet visible obligatoire |
| `whenToUse` | Masquer la section |
| `promptTemplate` | Afficher un message neutre; masquer/désactiver Copier |
| `variables` | Afficher le prompt; masquer `À personnaliser` si vide |
| `variables[].description` | Afficher le label et l’exemple disponibles |
| `variables[].example` | Masquer l’exemple rempli si incomplet |
| `tip` | Masquer le conseil |
| `quickTemplate` | Masquer la version rapide |
| `caution` | Masquer la mise en garde |
| `editorialObjective` | Aucun effet public |
| bloc `thumbnail` | Aucun effet sur l’asset existant |
| fichier thumbnail | Utiliser le fallback Prompt 5PennyAi |
| `keywords` | Aucun effet visible obligatoire |
| `seo.seoTitle` | Utiliser `title` |
| `seo.metaDescription` | Utiliser `summary` lorsqu’il existe |
| `seo.suggestedSlug` | Générer une proposition depuis `title` |

Une valeur absente ne doit pas créer une zone vide ou une erreur non gérée.

---

# 24. Carte publique dans le catalogue

Une carte Prompt doit être adaptée au modèle commun du catalogue sans perdre son identité.

Structure conceptuelle :

```text
PROMPT · CATÉGORIE

Titre

Résumé court

Débutant
[Contextes facultatifs]

Voir le prompt
```

Lorsqu’un thumbnail existe :

```text
[Thumbnail 16:9]
```

est affiché selon les conventions du catalogue.

Lorsqu’il est absent :

```text
[Fallback Prompt 5PennyAi]
```

est utilisé.

Le titre, la catégorie et le résumé continuent d’être rendus en HTML. Le thumbnail ne doit pas devenir la seule source d’information de la carte.

---

# 25. Page publique du prompt

Route fonctionnelle envisagée :

```text
/ressources-ia/prompts/{slug}
```

La route réelle est déterminée par l’application.

Structure publique recommandée :

```text
Format / Catégorie / Niveau
Titre
Résumé
Contextes

Quand l’utiliser

Prompt
[Copier le prompt]

À personnaliser

Exemple rempli

Conseil

Version rapide [facultatif]
[Copier]

Limite / précision [facultatif]

Ressources connexes [facultatif]
```

Le thumbnail peut être utilisé dans l’en-tête si la conception publique le justifie, mais il ne doit pas repousser inutilement l’action principale `Copier le prompt`.

---

# 26. Recherche et découvrabilité interne

Les champs particulièrement utiles pour la recherche interne sont :

```text
title
summary
category
contexts
keywords
```

Le MVP peut également indexer d’autres champs si l’inspection du moteur de recherche actuel le justifie.

Le `promptTemplate` complet n’a pas besoin d’être inclus dans la recherche initiale si cela ajoute du bruit ou rend les résultats moins prévisibles.

La catégorie reste la principale dimension de découverte pour répondre à :

> **« Que voulez-vous faire? »**

---

# 27. Partage social

La fiche Prompt partage son **URL canonique**, pas le texte complet du prompt comme destination principale.

Principe :

```text
Partager
→ URL canonique de la fiche

Copier le prompt
→ contenu de promptTemplate
```

Si un thumbnail dédié existe et peut être servi publiquement :

```text
thumbnail
→ image sociale prioritaire
```

Sinon :

```text
fallback social 5PennyAi
```

Le comportement final doit rester cohérent avec les mécanismes de partage déjà présents dans Ressources IA.

---

# 28. Noms de fichiers recommandés

Le fichier JSON utilise le suffixe :

```text
.prompt.json
```

Exemples :

```text
comparer-deux-options.prompt.json
expliquer-un-concept-simplement.prompt.json
transformer-notes-en-plan.prompt.json
verifier-reponse-ia.prompt.json
```

Recommandations :

- minuscules;
- aucun accent;
- aucun espace;
- mots séparés par des tirets;
- nom court mais descriptif.

Pour un thumbnail produit à l’extérieur :

```text
comparer-deux-options-thumbnail.webp
```

Le nom du fichier n’est pas une clé fonctionnelle et l’application ne doit pas dépendre d’une correspondance exacte.

---

# 29. Exemple minimal

```json
{
  "schemaVersion": 1,
  "contentType": "prompt",
  "language": "fr",
  "title": "Expliquer un concept simplement",
  "promptTemplate": "Explique-moi [SUJET] simplement, avec un exemple concret.",
  "variables": [
    {
      "key": "SUJET",
      "label": "Sujet",
      "description": "Le concept que vous voulez comprendre.",
      "example": "Les taux d’intérêt"
    }
  ]
}
```

Cet exemple demeure importable.

Il produira plusieurs avertissements éditoriaux, mais aucune erreur technique bloquante.

---

# 30. Exemple sans variables

Un modèle sans variable est permis lorsqu’il est réellement utile tel quel.

```json
{
  "schemaVersion": 1,
  "contentType": "prompt",
  "language": "fr",
  "title": "M’aider à améliorer ma prochaine question",
  "summary": "Demandez à l’IA de vous aider à formuler une demande plus précise avant d’y répondre.",
  "category": "think",
  "level": "beginner",
  "promptTemplate": "Avant de répondre à ma prochaine demande, pose-moi les questions essentielles qui te permettraient de mieux comprendre mon objectif et les contraintes importantes. Ne pose que les questions qui pourraient réellement changer la réponse.",
  "variables": [],
  "tip": "Répondez seulement aux questions qui sont pertinentes pour votre situation."
}
```

---

# 31. Responsabilités du générateur

Le processus de production doit :

1. identifier un besoin concret et suffisamment universel;
2. choisir une seule catégorie principale;
3. définir un niveau réaliste;
4. rédiger un titre orienté vers l’action;
5. produire un résumé clair;
6. expliquer quand utiliser le modèle;
7. rédiger un prompt réellement réutilisable;
8. créer uniquement les variables nécessaires;
9. fournir un libellé, une description et un exemple utiles pour chaque variable;
10. vérifier la correspondance entre placeholders et variables;
11. produire un conseil court;
12. produire une version rapide seulement si elle apporte une vraie valeur;
13. ajouter une mise en garde seulement lorsqu’elle est utile;
14. définir l’objectif éditorial;
15. préparer les mots-clés;
16. préparer le brief de thumbnail lorsque pertinent;
17. préparer les suggestions SEO;
18. vérifier la cohérence du paquet;
19. produire un JSON syntaxiquement valide;
20. ne jamais publier ni se connecter directement au site.

Le générateur doit éviter de transformer chaque modèle en prompt long ou sophistiqué simplement pour donner une impression d’expertise.

---

# 32. Responsabilités de l’application

L’application doit :

1. lire et valider le JSON;
2. préserver les propriétés reconnues;
3. ignorer les propriétés inconnues;
4. afficher les avertissements;
5. permettre la correction manuelle;
6. valider les valeurs contrôlées;
7. analyser les placeholders;
8. rapprocher les placeholders des variables;
9. générer l’exemple rempli de manière déterministe;
10. afficher le prompt en texte préformaté sécurisé;
11. permettre la copie du prompt;
12. permettre la copie de la version rapide lorsqu’elle existe;
13. gérer le thumbnail séparément du JSON;
14. préserver le thumbnail lors d’une réimportation;
15. produire le fallback lorsqu’aucun thumbnail n’existe;
16. déterminer le slug définitif;
17. contrôler le statut;
18. contrôler les dates de publication;
19. produire les métadonnées techniques;
20. produire l’URL canonique;
21. produire les métadonnées sociales;
22. inclure seulement les prompts publiés dans les requêtes publiques et le sitemap;
23. ne jamais exposer un brouillon par une route publique;
24. enregistrer ou publier seulement après une action humaine explicite.

---

# 33. Invariants critiques

Pendant toute l’implantation :

- un JSON partiel reste importable;
- un objet vide reste importable;
- l’import ne sauvegarde jamais automatiquement;
- l’import ne publie jamais;
- un JSON invalide ne modifie pas le formulaire;
- les propriétés inconnues sont ignorées;
- les valeurs inconnues produisent des avertissements;
- les propriétés techniques interdites ne sont jamais appliquées;
- le prompt reste du texte et n’exécute jamais de HTML ou de script;
- une variable utilise une clé stable et distincte de son libellé public;
- les placeholders utilisent la forme `[KEY]`;
- une variable manquante produit un avertissement sans casser l’import;
- une variable inutilisée produit un avertissement;
- l’exemple rempli est généré depuis `promptTemplate` et `variables[].example`;
- l’application ne stocke pas un `examplePrompt` redondant;
- la substitution de l’exemple est non récursive;
- la version rapide ne peut pas introduire silencieusement une variable inconnue;
- les contextes restent distincts des catégories;
- une fiche possède une seule catégorie principale;
- l’absence de contextes reste valide;
- l’absence de `resultTypes` reste valide;
- le thumbnail est facultatif;
- le fichier thumbnail reste séparé du JSON;
- une réimportation ne supprime jamais le thumbnail;
- l’absence de thumbnail utilise un fallback;
- aucune image n’est encodée dans le JSON;
- aucun chemin de stockage n’est fourni par le générateur;
- aucune génération d’image n’est déclenchée automatiquement à l’import;
- le slug suggéré n’est pas le slug définitif;
- les brouillons restent invisibles publiquement;
- le contrat v1 ne définit pas de série pour les prompts;
- aucun kit ou parcours n’est simulé par une propriété non définie;
- la bibliothèque reste orientée vers des besoins du grand public;
- aucun assistant, fournisseur ou modèle particulier n’est requis par défaut;
- Christian conserve toujours la décision finale.

---

# 34. Résumé du contrat v1

```text
Prompt
├── Métadonnées générales
├── Catégorie
├── Niveau
├── Contextes facultatifs
├── Types de résultat facultatifs
├── Quand l’utiliser
├── Modèle de prompt
├── Variables structurées
│   ├── clé
│   ├── libellé
│   ├── description
│   └── exemple
├── Exemple rempli calculé par l’application
├── Conseil
├── Variante rapide facultative
├── Limite facultative
├── Objectif éditorial
├── Thumbnail éditorial facultatif
├── Mots-clés
└── Suggestions SEO
```

Flux cible :

```text
Besoin utilisateur
→ conception du modèle
→ définition des variables
→ exemple
→ révision éditoriale
→ export JSON
→ import administratif
→ avertissements déterministes
→ correction humaine
→ ajout ou génération facultative du thumbnail
→ aperçu
→ publication
→ catalogue Ressources IA
→ fiche publique
→ personnalisation manuelle
→ copie du prompt
```

---

# 35. Principe final

> Une bonne fiche Prompt 5PennyAi doit aider le lecteur à faire quelque chose de concret tout en lui apprenant, progressivement et sans jargon, à mieux formuler ses demandes à une IA.

Le contrat v1 doit donc préserver trois qualités :

```text
SIMPLE À COMPRENDRE
+
SIMPLE À PERSONNALISER
+
SIMPLE À COPIER
```

sans empêcher l’évolution future vers :

```text
Personnaliser dans le site
→ remplir les variables
→ générer le prompt final
→ copier
```

Cette évolution doit pouvoir être ajoutée sans modifier le principe fondamental du contrat : les variables restent structurées, le modèle reste la source de vérité et l’application contrôle les données techniques.
