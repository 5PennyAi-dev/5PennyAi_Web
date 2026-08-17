# Contrat JSON — Ressources IA v1

## But du document

Ce document décrit le format JSON utilisé pour préremplir le formulaire d’ajout ou de modification d’une infographie dans l’administration **Ressources IA** de 5PennyAi.

Il sert de référence au GPT qui produit les métadonnées et à l’application qui les importe.

Ce contrat est volontairement simple et permissif. Il peut évoluer avec le MVP. Il ne doit pas empêcher Christian d’importer, d’enregistrer ou de publier une infographie lorsque certaines valeurs sont absentes ou imparfaites.

---

La classification par Sujets est gérée explicitement dans l’administration : aucun
champ `topic`, `topics` ou membership ne fait partie du JSON. Les `keywords` sont
réservés à la recherche. Un ancien champ `theme` reste importable pour compatibilité,
mais est ignoré et signalé sans modifier les memberships.

## Principe fondamental

> Le JSON aide à remplir le formulaire, mais ne décide jamais si une infographie peut être enregistrée ou publiée.

Toutes les métadonnées éditoriales sont facultatives.

L’application doit :

- importer les propriétés qu’elle reconnaît;
- conserver les valeurs utilisables;
- ignorer les propriétés inconnues;
- signaler les valeurs non reconnues sans bloquer;
- laisser Christian corriger librement le formulaire;
- ne jamais publier automatiquement après un import.

Un JSON partiel, ou même un objet vide, peut être importé.

Exemples valides :

```json
{}
```

```json
{
  "schemaVersion": 1,
  "title": "Introduction au RAG"
}
```

---

## Ce que le JSON contient

Le JSON peut décrire :

- le titre et le sous-titre;
- le résumé destiné à la carte publique;
- l’introduction destinée à la page détaillée;
- le texte alternatif de l’image;
- le niveau;
- le temps de consultation;
- les points essentiels;
- le texte « À retenir »;
- les mots-clés;
- les sources.

Le JSON ne contient pas l’image elle-même.

L’image est importée séparément dans l’administration.

---

## Structure complète de référence

La structure suivante montre toutes les propriétés prévues. Elles ne sont pas obligatoires.

```json
{
  "schemaVersion": 1,
  "title": "Solutions multi-agents",
  "subtitle": "Plusieurs agents spécialisés, une orchestration commune",
  "summary": "Découvrez comment plusieurs agents spécialisés collaborent dans un processus commun.",
  "introduction": "Une solution multi-agent répartit un problème entre plusieurs agents possédant des responsabilités différentes. Un mécanisme d’orchestration coordonne leur travail.",
  "imageAlt": "Infographie expliquant comment un orchestrateur coordonne plusieurs agents spécialisés, leurs outils et une mémoire partagée.",
  "level": "intermediate",
  "readingTimeMinutes": 5,
  "keyPoints": [
    {
      "title": "Des rôles spécialisés",
      "description": "Chaque agent reçoit une responsabilité adaptée à ses capacités."
    },
    {
      "title": "Une orchestration commune",
      "description": "L’orchestrateur coordonne les étapes et les échanges entre les agents."
    },
    {
      "title": "Un contrôle nécessaire",
      "description": "Les traces, permissions et évaluations rendent le système plus fiable."
    }
  ],
  "takeaway": "La valeur d’une solution multi-agent dépend de la séparation des rôles, de l’orchestration et du contrôle des actions.",
  "keywords": [
    "agents IA",
    "multi-agent",
    "orchestration",
    "Azure AI"
  ],
  "sources": [
    {
      "title": "Microsoft Learn — Connected agents",
      "url": "https://learn.microsoft.com/"
    },
    {
      "title": "Documentation de référence fournie par Christian"
    }
  ]
}
```

---

# Description des propriétés

## `schemaVersion`

Type attendu : nombre entier.

Valeur recommandée pour cette version :

```json
"schemaVersion": 1
```

Cette propriété est recommandée, mais son absence ne bloque pas l’import. Lorsqu’elle est absente, l’application interprète le fichier comme un JSON v1.

Une valeur différente peut produire un avertissement, mais les propriétés reconnues peuvent tout de même être importées.

---

## `title`

Type attendu : chaîne de caractères.

Exemple :

```json
"title": "Solutions multi-agents"
```

Utilisation :

- liste d’administration;
- carte publique;
- page détaillée.

Si le titre est absent, le formulaire reste vide. La publication demeure possible. Le site public peut utiliser un libellé neutre comme **Infographie**.

---

## `subtitle`

Type attendu : chaîne de caractères.

Exemple :

```json
"subtitle": "Plusieurs agents spécialisés, une orchestration commune"
```

Utilisation :

- page publique détaillée.

Si la valeur est absente ou vide, la ligne du sous-titre n’est pas affichée.

---

## `summary`

Type attendu : chaîne de caractères.

Exemple :

```json
"summary": "Une présentation visuelle du fonctionnement des solutions multi-agents."
```

Utilisation :

- carte dans la page Ressources IA.

Si la valeur est absente, la carte n’affiche pas de résumé.

---

## `introduction`

Type attendu : chaîne de caractères.

Exemple :

```json
"introduction": "Une solution multi-agent répartit un problème entre plusieurs agents spécialisés."
```

Utilisation :

- introduction de la page publique détaillée.

Le texte peut contenir plusieurs paragraphes séparés par des retours à la ligne.

Aucun HTML n’est requis.

---

## `imageAlt`

Type attendu : chaîne de caractères.

Exemple :

```json
"imageAlt": "Infographie montrant un orchestrateur relié à plusieurs agents spécialisés."
```

Utilisation :

- texte alternatif de l’image;
- accessibilité.

Si la valeur est absente, l’application peut utiliser une description neutre fondée sur le titre disponible.

---

## `level`

Type attendu : chaîne de caractères.

Valeurs recommandées :

```text
beginner
intermediate
advanced
```

Correspondance d’affichage :

| Valeur JSON | Affichage |
|---|---|
| `beginner` | Débutant |
| `intermediate` | Intermédiaire |
| `advanced` | Avancé |

Une valeur différente ne bloque pas l’import. L’application peut l’ignorer et afficher un avertissement afin que Christian choisisse le niveau manuellement.

---

## `readingTimeMinutes`

Type attendu : nombre entier positif.

Exemple :

```json
"readingTimeMinutes": 5
```

La valeur ne doit pas contenir le mot « minutes ».

Une valeur absente, négative, décimale ou textuelle ne bloque pas l’import. Elle peut simplement être ignorée.

---

## Associations aux séries

Les nouveaux paquets Infographie ne doivent pas contenir de propriété `series`.

Les associations, ainsi que leur position pédagogique, sont gérées directement dans l’administration après l’import.

Pour préserver la rétrocompatibilité, les anciens fichiers peuvent encore contenir une propriété `series`. L’administration la reconnaît comme donnée legacy, l’ignore avec un avertissement et ne modifie aucun membership existant.

---

## `keyPoints`

Type attendu : tableau d’objets.

Chaque élément peut contenir :

- `title` : chaîne de caractères;
- `description` : chaîne de caractères.

Exemple :

```json
"keyPoints": [
  {
    "title": "Des rôles spécialisés",
    "description": "Chaque agent reçoit une responsabilité précise."
  }
]
```

Les deux propriétés sont recommandées, mais un élément partiel peut être importé.

Exemple :

```json
"keyPoints": [
  {
    "title": "Planification"
  },
  {
    "description": "L’agent choisit l’action suivante selon le contexte."
  }
]
```

L’ordre du tableau doit être conservé.

Si le tableau est absent ou vide, la section **Points essentiels** n’est pas affichée.

---

## `takeaway`

Type attendu : chaîne de caractères.

Exemple :

```json
"takeaway": "L’orchestration donne une structure commune au travail de plusieurs agents spécialisés."
```

Utilisation :

- bloc **À retenir** de la page détaillée.

Si la valeur est absente, le bloc n’est pas affiché.

---

## `keywords`

Type attendu : tableau de chaînes de caractères.

Exemple :

```json
"keywords": [
  "agents IA",
  "orchestration",
  "multi-agent"
]
```

Les mots-clés ne sont pas nécessairement affichés dans le MVP. Ils peuvent être conservés pour un usage futur.

Les valeurs vides ou non textuelles peuvent être ignorées.

---

## `sources`

Type attendu : tableau d’objets.

Chaque source peut contenir :

- `title` : chaîne de caractères;
- `url` : chaîne de caractères.

Exemple complet :

```json
"sources": [
  {
    "title": "Microsoft Learn — Connected agents",
    "url": "https://learn.microsoft.com/"
  }
]
```

Exemple sans URL :

```json
"sources": [
  {
    "title": "Documentation interne du projet"
  }
]
```

Une source partielle peut être importée. Une URL non reconnue peut être ignorée sans supprimer le titre.

Le GPT ne doit jamais inventer une URL ou une source pour remplir cette section.

Si aucune source n’est disponible, la propriété peut être omise ou contenir un tableau vide.

---

# Propriétés techniques interdites

Le GPT ne doit pas produire les propriétés contrôlées par l’application, notamment :

```text
id
slug
status
imageUrl
imagePath
publishedAt
createdAt
updatedAt
author
viewCount
```

Le JSON ne doit pas contenir :

- l’image encodée en base64;
- une URL d’image générée par ChatGPT;
- un chemin Supabase;
- un statut de publication;
- un identifiant de base de données.

---

# Comportement attendu lors de l’import

## JSON valide et complet

L’application préremplit les champs reconnus.

Elle n’enregistre et ne publie rien automatiquement.

---

## JSON valide mais partiel

L’application importe toutes les valeurs utilisables.

Les champs absents restent vides.

Aucun champ manquant ne bloque l’import, l’enregistrement ou la publication.

---

## Valeur non reconnue

L’application conserve les autres propriétés valides et signale seulement la valeur problématique.

Exemples :

- `level: "expert"` : niveau ignoré;
- `readingTimeMinutes: "cinq"` : durée ignorée;
- URL invalide : URL ignorée, titre de la source conservé;
- point essentiel partiel : contenu disponible conservé.

---

## Propriété inconnue

Une propriété qui n’appartient pas au contrat est ignorée.

Exemple :

```json
{
  "title": "Introduction au RAG",
  "visualMood": "futuriste"
}
```

Le champ `title` est importé. Le champ `visualMood` est ignoré.

---

## JSON syntaxiquement invalide

Si le contenu n’est pas un objet JSON lisible, aucun champ n’est modifié.

L’application affiche un message compréhensible et laisse le formulaire utilisable manuellement.

---

## Réimportation dans un formulaire déjà rempli

L’application demande confirmation avant de remplacer les métadonnées présentes.

L’import du JSON ne modifie jamais l’image déjà téléversée.

---

# Affichage public en présence de valeurs manquantes

Le site public affiche uniquement les sections qui contiennent une valeur utilisable.

| Valeur manquante | Comportement |
|---|---|
| Titre | Afficher un libellé neutre comme `Infographie` |
| Sous-titre | Masquer la ligne |
| Résumé | Masquer le résumé de la carte |
| Introduction | Commencer directement par l’image ou la section suivante |
| Texte alternatif | Utiliser une description neutre |
| Niveau | Masquer le niveau |
| Temps | Masquer la durée |
| Points essentiels | Masquer la section |
| À retenir | Masquer le bloc |
| Sources | Masquer la section |
| Mots-clés | Aucun effet visible |

Une valeur manquante ne doit pas créer une zone vide dans la page.

---

# Noms de fichiers recommandés

L’image et le JSON devraient partager le même nom de base.

Exemple :

```text
solutions-multi-agents.png
solutions-multi-agents.json
```

Recommandations :

- lettres minuscules;
- chiffres si nécessaires;
- tirets;
- aucun accent;
- aucun espace.

Cette convention facilite l’importation, mais l’application ne doit pas dépendre de noms identiques.

---

# Exemple complet

```json
{
  "schemaVersion": 1,
  "title": "Solutions multi-agents",
  "subtitle": "Plusieurs agents spécialisés, une orchestration commune",
  "summary": "Découvrez comment plusieurs agents spécialisés collaborent dans un processus commun.",
  "introduction": "Une solution multi-agent répartit un problème entre plusieurs agents possédant des responsabilités différentes. Un mécanisme d’orchestration coordonne leur travail.",
  "imageAlt": "Infographie expliquant comment un orchestrateur coordonne plusieurs agents spécialisés, leurs outils et une mémoire partagée.",
  "level": "intermediate",
  "readingTimeMinutes": 5,
  "keyPoints": [
    {
      "title": "Des rôles spécialisés",
      "description": "Chaque agent reçoit une responsabilité adaptée à ses capacités."
    },
    {
      "title": "Une orchestration commune",
      "description": "L’orchestrateur coordonne les étapes et les échanges entre les agents."
    },
    {
      "title": "Un contrôle nécessaire",
      "description": "Les traces, permissions et évaluations rendent le système plus fiable."
    }
  ],
  "takeaway": "La valeur d’une solution multi-agent dépend de la séparation des rôles, de l’orchestration et du contrôle des actions.",
  "keywords": [
    "agents IA",
    "multi-agent",
    "orchestration",
    "Azure AI"
  ],
  "sources": [
    {
      "title": "Microsoft Learn — Connected agents",
      "url": "https://learn.microsoft.com/"
    },
    {
      "title": "Documentation de référence fournie par Christian"
    }
  ]
}
```

---

# Exemple minimal

```json
{
  "schemaVersion": 1,
  "title": "Introduction au RAG"
}
```

---

# Exemple volontairement imparfait mais importable

Ce fichier doit produire des avertissements, sans bloquer l’import.

```json
{
  "title": "Architecture agentique",
  "level": "expert",
  "keyPoints": [
    {
      "title": "Planification"
    },
    {
      "description": "L’agent choisit l’action suivante selon le contexte."
    }
  ],
  "sources": [
    {
      "title": "Documentation interne"
    },
    {
      "url": "https://example.com/reference"
    }
  ]
}
```

Comportement attendu :

- le titre est importé;
- le niveau `expert` est ignoré ou laissé à corriger;
- les deux points partiels sont conservés;
- la première source conserve son titre;
- la seconde source conserve son URL si elle est valide;
- l’enregistrement et la publication restent possibles.

---

# Résumé des règles du contrat

1. Toutes les métadonnées éditoriales sont facultatives.
2. Le JSON préremplit le formulaire; il ne publie jamais.
3. Les propriétés reconnues sont importées indépendamment.
4. Une valeur invalide ne rend pas tout le fichier inutilisable.
5. Les propriétés inconnues sont ignorées.
6. Christian peut toujours corriger, enregistrer ou publier.
7. L’image, le statut et les données techniques restent contrôlés par l’application.
8. Le GPT ne doit jamais inventer de source ou d’URL.
9. Le site public masque les sections sans contenu.
10. Ce contrat est une référence pratique et évolutive, non une spécification figée.
