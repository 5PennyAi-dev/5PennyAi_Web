# Contrat JSON — Articles 5PennyAi v1

**Projet :** 5PennyAi  
**Section :** Ressources IA  
**Format :** Articles éducatifs  
**Version du contrat :** 1  
**Date :** 1er août 2026  
**Statut :** conception fonctionnelle prête à être testée

---

## 1. But du document

Ce document définit le format JSON utilisé pour préremplir le formulaire d’ajout ou de modification d’un article dans l’administration **Ressources IA** de 5PennyAi.

Il sert d’interface entre :

1. le générateur d’articles;
2. l’administration du site;
3. le rendu public de l’article.

Le générateur produit un fichier JSON contenant :

- les métadonnées éditoriales;
- le contenu complet en Markdown;
- les sources;
- les marqueurs de citation;
- le manifeste des médias;
- les instructions de couverture;
- les suggestions SEO.

Le JSON ne contient aucun fichier binaire et ne publie jamais directement l’article.

---

## 2. Principe fondamental

> Le JSON prépare l’article, mais Christian conserve toujours le contrôle de sa révision, de ses médias, de son enregistrement et de sa publication.

Le contrat distingue deux niveaux de conformité.

### 2.1 Import administratif permissif

L’administration doit accepter un JSON partiel.

Elle doit :

- importer les propriétés reconnues;
- conserver les valeurs utilisables;
- ignorer les propriétés inconnues;
- signaler les valeurs non reconnues sans bloquer;
- laisser Christian corriger le formulaire;
- ne jamais enregistrer ou publier automatiquement;
- ne jamais remplacer un contenu existant sans confirmation.

Un objet vide demeure importable :

```json
{}
```

Un objet partiel demeure importable :

```json
{
  "schemaVersion": 1,
  "contentType": "article",
  "title": "Introduction aux embeddings"
}
```

### 2.2 Production attendue du générateur

Le générateur d’articles doit normalement produire un paquet beaucoup plus complet contenant au minimum :

- `schemaVersion`;
- `contentType`;
- `language`;
- `title`;
- `subtitle`;
- `summary`;
- `theme`;
- `level`;
- `contentMarkdown`;
- `sources`;
- `media`;
- `seo`.

Cette exigence concerne le comportement attendu du générateur. Elle ne transforme pas les champs en conditions techniques de publication.

---

## 3. Structure complète de référence

```json
{
  "schemaVersion": 1,
  "contentType": "article",
  "language": "fr",
  "title": "Comment fonctionne le RAG?",
  "subtitle": "Relier un modèle de langage à des connaissances externes",
  "summary": "Découvrez comment un système RAG recherche des passages pertinents avant de les transmettre à un modèle de langage pour produire une réponse mieux fondée.",
  "theme": "IA générative",
  "level": "beginner",
  "series": {
    "name": "Les fondamentaux de l’IA générative",
    "episodeNumber": 6
  },
  "learningObjectives": [
    "Comprendre pourquoi un système RAG utilise une source de connaissances externe.",
    "Reconnaître les principales étapes de récupération et de génération.",
    "Distinguer les connaissances apprises pendant l’entraînement du contexte récupéré au moment de la requête."
  ],
  "prerequisites": [
    "Connaître la notion générale de modèle de langage."
  ],
  "takeaway": "Un système RAG ne réentraîne pas le modèle à chaque question : il récupère des informations pertinentes et les ajoute au contexte utilisé pour générer la réponse.",
  "contentMarkdown": "Un modèle de langage ne connaît pas nécessairement les documents propres à une organisation. Le RAG permet de lui fournir des passages externes au moment où une question est posée.\n\n## Que signifie RAG?\n\nL’expression *génération augmentée par récupération* désigne une architecture qui combine une étape de recherche et une étape de génération. {{cite:lewis-2020}}\n\n## Le flux principal\n\nLe système prépare d’abord une collection de documents, recherche les passages les plus pertinents, puis les ajoute au contexte transmis au modèle.\n\n{{media:flux-rag}}\n\n## Les principales étapes\n\n1. L’utilisateur pose une question.\n2. Le système représente ou reformule la requête.\n3. Un moteur recherche les passages pertinents.\n4. Les passages récupérés sont ajoutés au contexte.\n5. Le modèle génère une réponse.\n\n## Ce que le RAG ne garantit pas\n\nLa présence de documents externes ne garantit pas automatiquement une réponse exacte. La recherche peut sélectionner un mauvais passage, les documents peuvent être incomplets et le modèle peut mal interpréter le contexte. {{cite:microsoft-rag-overview}}\n\n## Conclusion\n\nLe RAG permet de relier un modèle de langage à des connaissances externes sans modifier directement ses paramètres. Sa qualité dépend toutefois autant de la récupération que de la génération.",
  "media": [
    {
      "key": "flux-rag",
      "kind": "diagram",
      "title": "Flux principal d’un système RAG",
      "caption": "La récupération documentaire précède la génération de la réponse.",
      "altText": "Diagramme montrant une question, une recherche dans une base de connaissances, des passages récupérés et une réponse produite par un modèle de langage.",
      "generationBrief": "Créer un diagramme horizontal pédagogique montrant cinq étapes : question de l’utilisateur, recherche, récupération de passages, ajout au contexte et génération de la réponse. Utiliser une composition claire, peu de texte et aucun logo.",
      "preferredAspectRatio": "16:9",
      "required": true,
      "sourceKeys": [
        "lewis-2020",
        "microsoft-rag-overview"
      ]
    }
  ],
  "cover": {
    "altText": "Illustration conceptuelle d’un modèle de langage relié à une bibliothèque de documents.",
    "generationBrief": "Créer une couverture éditoriale horizontale 16:9 consacrée au fonctionnement du RAG. Représenter une question qui traverse une bibliothèque documentaire avant d’atteindre un modèle de langage. Très peu de texte, aucune source, aucun logo et aucun numéro d’épisode.",
    "preferredAspectRatio": "16:9"
  },
  "keywords": [
    "RAG",
    "génération augmentée par récupération",
    "modèle de langage",
    "recherche sémantique",
    "IA générative"
  ],
  "sources": [
    {
      "key": "lewis-2020",
      "title": "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
      "authors": [
        "Patrick Lewis",
        "Ethan Perez",
        "Aleksandra Piktus"
      ],
      "sourceType": "research_paper",
      "publicationDate": "2020",
      "url": "https://example.org/research-paper"
    },
    {
      "key": "microsoft-rag-overview",
      "title": "Retrieval-augmented generation overview",
      "organization": "Microsoft",
      "sourceType": "official_documentation",
      "url": "https://example.org/official-documentation",
      "accessDate": "2026-08-01"
    }
  ],
  "seo": {
    "primaryQuery": "comment fonctionne le RAG",
    "secondaryQueries": [
      "qu'est-ce que le RAG",
      "RAG intelligence artificielle",
      "génération augmentée par récupération"
    ],
    "searchIntent": "informational",
    "seoTitle": "Comment fonctionne le RAG? Explication accessible",
    "metaDescription": "Découvrez comment un système RAG recherche des informations externes avant de générer une réponse avec un modèle de langage.",
    "suggestedSlug": "comment-fonctionne-rag",
    "internalLinkSuggestions": [
      {
        "targetTopic": "Embeddings",
        "suggestedAnchor": "représentation vectorielle des textes",
        "placementHint": "Après l’explication de la recherche sémantique"
      }
    ]
  }
}
```

Les URL `example.org` de cet exemple sont fictives et servent uniquement à montrer la structure. Le générateur réel ne doit jamais inventer une URL.

---

## 4. Propriétés principales

### 4.1 `schemaVersion`

Type attendu :

```text
nombre entier
```

Valeur de cette version :

```json
"schemaVersion": 1
```

La propriété est recommandée.

Lorsqu’elle est absente, l’administration peut interpréter le fichier comme un JSON Articles v1.

Une autre valeur produit un avertissement, mais les propriétés reconnues peuvent tout de même être importées.

### 4.2 `contentType`

Type attendu :

```text
chaîne de caractères
```

Valeur attendue :

```json
"contentType": "article"
```

Cette propriété permet de distinguer un article d’une infographie ou d’un autre format importable.

Une valeur différente produit un avertissement.

Elle ne doit pas déclencher automatiquement une redirection, une création ou une publication.

### 4.3 `language`

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

La langue représente la langue réelle du contenu, et non la langue de l’interface administrative.

Une autre valeur peut être conservée ou ignorée selon l’implantation, avec avertissement.

### 4.4 `title`

Type attendu :

```text
chaîne de caractères
```

Utilisation :

- liste d’administration;
- carte du catalogue;
- page détaillée;
- données structurées;
- fallback du titre SEO;
- génération du slug initial.

Le titre doit :

- annoncer clairement le sujet;
- être compréhensible hors contexte;
- éviter les formulations sensationnalistes;
- correspondre réellement au contenu.

Si le titre est absent, le formulaire reste utilisable.

Le site public peut employer un libellé neutre comme `Article`.

### 4.5 `subtitle`

Type attendu :

```text
chaîne de caractères
```

Le sous-titre précise l’angle de l’article sans répéter le titre.

S’il est absent, la ligne est masquée.

### 4.6 `summary`

Type attendu :

```text
chaîne de caractères
```

Utilisation :

- carte du catalogue;
- aperçu administratif;
- description de partage lorsque la meta description est absente;
- résumé éditorial de la ressource.

Le résumé est distinct de l’introduction contenue dans `contentMarkdown`.

Il doit pouvoir être compris sans lire l’article complet.

### 4.7 `theme`

Type attendu :

```text
chaîne de caractères
```

Le contrat n’impose pas une taxonomie fermée dans la v1.

Le générateur doit produire un thème :

- court;
- compréhensible;
- cohérent avec les thèmes déjà utilisés;
- non promotionnel.

Une harmonisation ou une taxonomie contrôlée pourra être ajoutée plus tard si l’utilisation réelle le justifie.

### 4.8 `level`

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

Une autre valeur produit un avertissement et peut être ignorée.

Le niveau décrit les connaissances supposées et la profondeur du contenu. Il ne représente pas uniquement la longueur de l’article.

---

## 5. Série

### 5.1 `series`

Type attendu :

```text
objet
```

Propriétés possibles :

- `name`;
- `episodeNumber`.

Exemple :

```json
{
  "series": {
    "name": "Les fondamentaux de l’IA générative",
    "episodeNumber": 6
  }
}
```

### 5.2 `series.name`

Type attendu :

```text
chaîne de caractères
```

Le nom doit correspondre exactement à une série existante lorsqu’elle existe déjà.

Le générateur ne doit jamais inventer une série sans instruction ou contexte suffisant.

### 5.3 `series.episodeNumber`

Type attendu :

```text
nombre entier positif
```

Le numéro représente la position pédagogique de la ressource dans la série.

Il ne dépend pas du format. Une même série peut contenir des articles et des infographies.

Les deux propriétés sont indépendantes. Un nom sans numéro demeure valide.

Si `series` est absente, l’article est indépendant.

---

## 6. Métadonnées pédagogiques

### 6.1 `learningObjectives`

Type attendu :

```text
tableau de chaînes de caractères
```

Les objectifs doivent décrire ce que le lecteur sera en mesure de comprendre après la lecture.

Ils doivent :

- utiliser des formulations concrètes;
- correspondre au niveau;
- rester cohérents avec le contenu;
- éviter les promesses non tenues.

Cible souple :

```text
2 à 5 objectifs
```

Si le tableau est absent ou vide, la section n’est pas affichée.

### 6.2 `prerequisites`

Type attendu :

```text
tableau de chaînes de caractères
```

Les prérequis décrivent les connaissances utiles avant la lecture.

Pour un article débutant, le tableau peut être absent ou vide.

Le générateur ne doit pas inventer des prérequis artificiels pour donner une apparence plus technique à l’article.

### 6.3 `takeaway`

Type attendu :

```text
chaîne de caractères
```

Utilisation possible :

- bloc de synthèse à la fin de la page;
- aperçu administratif;
- contrôle de cohérence éditoriale.

Le texte doit résumer l’idée principale en une ou deux phrases.

Le générateur doit éviter de répéter mot pour mot une conclusion déjà présente dans le Markdown.

---

## 7. Contenu Markdown

### 7.1 `contentMarkdown`

Type attendu :

```text
chaîne de caractères
```

Cette propriété contient le corps complet de l’article :

- introduction;
- sections;
- exemples;
- tableaux;
- code;
- conclusion;
- marqueurs de citations;
- marqueurs de médias.

Le titre principal n’est pas répété dans le Markdown. Il provient de `title`.

### 7.2 Structure recommandée

```markdown
Introduction en un ou plusieurs paragraphes.

## Première section

Contenu.

## Deuxième section

Contenu.

## Conclusion

Synthèse finale.
```

L’introduction apparaît avant le premier titre de niveau 2.

### 7.3 Markdown permis

Le rendu doit prendre en charge au minimum :

- paragraphes;
- titres `##`, `###` et `####`;
- texte en gras;
- texte en italique;
- listes à puces;
- listes numérotées;
- citations Markdown;
- liens;
- tableaux de type GitHub Flavored Markdown;
- code en ligne;
- blocs de code clôturés;
- séparateurs horizontaux;
- marqueurs de médias;
- marqueurs de citations.

### 7.4 Éléments interdits ou déconseillés

Le générateur ne doit pas inclure dans `contentMarkdown` :

- un titre `#` de niveau 1;
- du HTML brut;
- du JavaScript;
- des scripts;
- des styles CSS;
- des iframes;
- des formulaires;
- des images encodées;
- des URL d’images externes;
- une balise Markdown d’image `![...](...)`;
- une section Sources rédigée manuellement;
- le titre principal répété;
- des marqueurs techniques non définis par le contrat.

Les images internes doivent utiliser `{{media:key}}`.

Les sources doivent utiliser `{{cite:key}}` et le tableau `sources`.

### 7.5 HTML importé malgré tout

Si du HTML est présent dans un JSON importé :

- l’import peut conserver le texte;
- le rendu public doit l’échapper ou le nettoyer;
- aucun HTML non fiable ne doit être exécuté;
- l’administration doit afficher un avertissement.

---

## 8. Tableaux

Les tableaux ordinaires sont écrits directement en Markdown.

Exemple :

```markdown
| Aspect | Entraînement | Inférence |
|---|---|---|
| Objectif | Ajuster le modèle | Utiliser le modèle |
| Entrée | Données d’apprentissage | Nouvelle requête |
| Coût typique | Élevé | Plus faible |
```

Un tableau Markdown est préférable à une image lorsqu’il sert à :

- comparer des propriétés;
- présenter quelques critères;
- organiser des valeurs textuelles;
- résumer des options.

Le tableau demeure ainsi :

- accessible;
- sélectionnable;
- modifiable;
- adaptable au mobile;
- indexable.

Un tableau très complexe peut être remplacé par une visualisation seulement lorsque cela améliore réellement la compréhension.

---

## 9. Marqueurs de médias

### 9.1 Syntaxe

Un média externe est placé dans le Markdown avec la syntaxe :

```markdown
{{media:flux-rag}}
```

Le marqueur doit :

- apparaître seul sur sa ligne;
- utiliser une clé présente dans `media`;
- ne pas contenir d’espace;
- ne pas contenir de texte de remplacement.

### 9.2 Format des clés

Format recommandé :

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Exemples valides :

```text
flux-rag
comparaison-modeles
espace-vectoriel
architecture-agentique
```

Exemples invalides :

```text
Flux RAG
image_01
média-rag
flux/rag
```

Chaque clé doit être unique dans le manifeste.

### 9.3 Correspondance

Pour chaque marqueur :

```markdown
{{media:flux-rag}}
```

un objet correspondant doit exister :

```json
{
  "key": "flux-rag"
}
```

### 9.4 Média manquant

Lorsqu’un marqueur existe sans objet correspondant :

- l’import du reste du JSON réussit;
- l’administration affiche un avertissement;
- l’aperçu administratif affiche un placeholder explicite;
- le rendu public omet le marqueur non résolu.

Lorsqu’un objet `media` n’est utilisé par aucun marqueur :

- l’objet est conservé;
- un avertissement est affiché;
- le média n’est pas inséré automatiquement.

---

## 10. Manifeste des médias

### 10.1 `media`

Type attendu :

```text
tableau d’objets
```

Un tableau vide est valide :

```json
"media": []
```

Chaque objet peut contenir :

```json
{
  "key": "flux-rag",
  "kind": "diagram",
  "title": "Flux principal d’un système RAG",
  "caption": "La récupération précède la génération.",
  "altText": "Diagramme montrant les étapes principales d’un système RAG.",
  "generationBrief": "Créer un diagramme horizontal...",
  "preferredAspectRatio": "16:9",
  "required": true,
  "sourceKeys": [
    "lewis-2020"
  ]
}
```

### 10.2 `media[].key`

Type attendu :

```text
chaîne de caractères
```

La clé relie le manifeste au marqueur Markdown.

Elle doit être unique.

### 10.3 `media[].kind`

Type attendu :

```text
chaîne de caractères
```

Valeurs initiales permises :

```text
diagram
illustration
infographic
chart
screenshot
```

#### `diagram`

Pour :

- flux;
- architecture;
- cycle;
- relations entre composants;
- séquence d’étapes.

#### `illustration`

Pour rendre intuitif un concept abstrait ou fournir une métaphore visuelle contrôlée.

#### `infographic`

Pour une synthèse visuelle plus riche couvrant plusieurs idées reliées.

Cette valeur doit être utilisée avec modération.

#### `chart`

Pour une visualisation fondée sur des données réelles et vérifiables.

Le générateur ne doit jamais inventer des données pour justifier un graphique.

#### `screenshot`

Pour une capture d’interface ou de résultat réel.

Le générateur ne doit pas fabriquer une fausse capture présentée comme un produit existant.

Une valeur inconnue peut être importée comme média générique avec avertissement.

### 10.4 `media[].title`

Titre administratif et légende courte du média.

Il doit décrire le contenu, et non son emplacement.

### 10.5 `media[].caption`

Texte facultatif affiché sous le média.

La légende peut :

- expliquer ce que montre la figure;
- préciser une limite;
- mentionner la source des données;
- orienter la lecture.

Elle ne doit pas répéter simplement le titre.

### 10.6 `media[].altText`

Texte alternatif destiné à l’accessibilité.

Il doit :

- expliquer l’information utile transmise par l’image;
- rester adapté à son contexte;
- éviter l’accumulation de mots-clés;
- ne pas recopier le `generationBrief`.

Un média pédagogique interne devrait normalement avoir un texte alternatif.

### 10.7 `media[].generationBrief`

Instruction destinée à produire ou à faire produire l’image.

Le brief doit préciser :

- le concept à représenter;
- les relations exactes;
- la composition recommandée;
- les textes nécessaires;
- les éléments interdits;
- le ratio souhaité;
- les contraintes factuelles.

Le brief ne doit pas être affiché publiquement.

Il ne remplace pas le texte alternatif.

### 10.8 `media[].preferredAspectRatio`

Valeurs initiales permises :

```text
16:9
4:3
1:1
4:5
```

Recommandations :

- `16:9` : diagrammes horizontaux et architectures;
- `4:3` : explications générales;
- `1:1` : illustrations conceptuelles compactes;
- `4:5` : infographies verticales.

Cette valeur demeure une préférence. Le fichier réel peut être normalisé par l’application.

### 10.9 `media[].required`

Type attendu :

```text
booléen
```

Interprétation :

- `true` : le média joue un rôle important dans l’explication;
- `false` : le média améliore l’article, mais le texte reste autonome.

Un média requis manquant produit un avertissement fort, mais ne bloque pas automatiquement la publication.

Valeur par défaut recommandée si absente :

```text
false
```

### 10.10 `media[].sourceKeys`

Type attendu :

```text
tableau de chaînes de caractères
```

Chaque valeur doit correspondre à une clé du tableau `sources`.

Ce champ est particulièrement important pour :

- graphiques;
- données chiffrées;
- diagrammes représentant une architecture officielle;
- captures ou explications dépendant d’une source précise.

Une clé inconnue produit un avertissement.

---

## 11. Couverture de l’article

### 11.1 `cover`

Type attendu :

```text
objet
```

La couverture est distincte des médias intégrés dans le corps de l’article.

Elle sert principalement :

- à la carte du catalogue;
- à l’en-tête de l’article;
- au partage social;
- aux aperçus de série.

Structure :

```json
{
  "cover": {
    "altText": "Illustration conceptuelle d’un modèle relié à des documents.",
    "generationBrief": "Créer une couverture éditoriale horizontale...",
    "preferredAspectRatio": "16:9"
  }
}
```

### 11.2 `cover.altText`

Texte alternatif suggéré.

Une couverture purement décorative peut utiliser une chaîne vide :

```json
"altText": ""
```

L’application conserve la décision finale selon le contexte d’affichage.

### 11.3 `cover.generationBrief`

Instruction de génération ou de conception.

Le brief doit produire une couverture :

- lisible dans une petite carte;
- simple;
- évocatrice;
- non promotionnelle;
- sans source;
- sans URL;
- sans logo généré;
- sans microtexte;
- sans numéro d’épisode;
- sans reproduction complète de l’article.

### 11.4 `cover.preferredAspectRatio`

Valeur attendue pour la v1 :

```text
16:9
```

Le JSON ne contient jamais :

- le fichier de couverture;
- son URL publique;
- son chemin de stockage;
- son identifiant Supabase.

---

## 12. Mots-clés éditoriaux

### 12.1 `keywords`

Type attendu :

```text
tableau de chaînes de caractères
```

Les mots-clés servent à :

- décrire le sujet;
- faciliter une future recherche interne;
- soutenir la classification;
- rapprocher des contenus connexes.

Ils ne constituent pas une balise `meta keywords`.

Le générateur doit éviter :

- les doublons;
- les variantes inutiles;
- les expressions sans rapport;
- l’accumulation de mots-clés SEO.

Cible souple :

```text
3 à 10 mots-clés
```

---

## 13. Sources

### 13.1 `sources`

Type attendu :

```text
tableau d’objets
```

Un tableau vide est valide :

```json
"sources": []
```

Le générateur doit toutefois rechercher et fournir des sources pour les affirmations importantes.

### 13.2 `sources[].key`

Clé utilisée par les marqueurs de citation.

Elle suit les mêmes règles que les clés de médias :

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Chaque clé doit être unique.

### 13.3 `sources[].title`

Titre réel de la source.

Le générateur ne doit jamais inventer un titre.

### 13.4 `sources[].authors`

Type attendu :

```text
tableau de chaînes de caractères
```

Le champ peut être omis lorsque les auteurs ne sont pas clairement identifiés.

Le générateur ne doit pas deviner ou reconstituer des auteurs.

Chaque entrée du tableau représente une personne et contient son nom complet vérifié. Ne jamais utiliser « et al. » comme valeur. Lorsque la liste complète est trop longue ou incertaine, omettre authors.

### 13.5 `sources[].organization`

Organisation responsable ou éditrice.

Le champ est facultatif.

### 13.6 `sources[].sourceType`

Valeurs initiales permises :

```text
official_documentation
research_paper
standard
government
book
technical_article
other
```

Cette propriété soutient la révision éditoriale. Elle n’a pas besoin d’être affichée publiquement.

### 13.7 `sources[].publicationDate`

Type attendu :

```text
chaîne de caractères
```

Formats acceptés :

```text
YYYY
YYYY-MM
YYYY-MM-DD
```

La date doit être omise lorsqu’elle n’est pas connue.

### 13.8 `sources[].url`

Type attendu :

```text
chaîne de caractères
```

Protocoles acceptés :

```text
https
http
```

Le générateur ne doit inclure une URL que lorsqu’elle a été fournie ou vérifiée.

Une URL invalide peut être ignorée tout en conservant le reste de la source.

### 13.9 `sources[].accessDate`

Date à laquelle la source Web a été consultée.

Format attendu :

```text
YYYY-MM-DD
```

Cette propriété est facultative.

Elle est particulièrement utile pour une documentation ou une page Web susceptible d’évoluer.

---

## 14. Marqueurs de citations

### 14.1 Syntaxe

Une citation est placée immédiatement après l’affirmation concernée :

```markdown
Le RAG combine une étape de récupération et une étape de génération. {{cite:lewis-2020}}
```

Syntaxe :

```text
{{cite:source-key}}
```

### 14.2 Plusieurs sources

Pour soutenir une même affirmation avec plusieurs sources, utiliser plusieurs marqueurs consécutifs :

```markdown
Cette approche est utilisée dans plusieurs architectures documentaires. {{cite:source-a}}{{cite:source-b}}
```

La v1 ne définit pas de marqueur contenant plusieurs clés séparées par des virgules.

### 14.3 Résolution

L’application relie le marqueur à l’objet correspondant du tableau `sources`.

Elle peut ensuite afficher :

- un numéro en exposant;
- un lien vers la section Sources;
- une infobulle;
- un autre rendu accessible conforme au design retenu.

### 14.4 Citation non résolue

Si la clé n’existe pas :

- l’import réussit;
- l’administration affiche un avertissement;
- l’aperçu indique la citation manquante;
- le rendu public omet le marqueur non résolu.

### 14.5 Sources inutilisées

Une source présente dans `sources` mais jamais citée peut demeurer dans la bibliographie.

L’administration peut néanmoins signaler qu’elle n’est associée à aucune affirmation précise.

---

## 15. SEO

### 15.1 `seo`

Type attendu :

```text
objet
```

Le bloc SEO contient des suggestions éditoriales produites par le générateur.

Il ne contient pas les données techniques contrôlées par le site.

Structure :

```json
{
  "seo": {
    "primaryQuery": "comment fonctionne le RAG",
    "secondaryQueries": [
      "qu'est-ce que le RAG"
    ],
    "searchIntent": "informational",
    "seoTitle": "Comment fonctionne le RAG? Explication accessible",
    "metaDescription": "Découvrez comment un système RAG recherche des informations externes avant de générer une réponse.",
    "suggestedSlug": "comment-fonctionne-rag",
    "internalLinkSuggestions": []
  }
}
```

### 15.2 `seo.primaryQuery`

Type attendu :

```text
chaîne de caractères
```

L’expression représente la principale question ou formulation de recherche à laquelle l’article répond.

Elle doit :

- refléter le contenu réel;
- correspondre au langage du public;
- rester naturelle;
- ne pas entraîner une répétition artificielle dans le texte.

### 15.3 `seo.secondaryQueries`

Type attendu :

```text
tableau de chaînes de caractères
```

Le tableau contient des formulations connexes utiles.

Cible souple :

```text
2 à 6 expressions
```

Un tableau vide est valide.

### 15.4 `seo.searchIntent`

Valeurs initiales permises :

```text
informational
comparative
tutorial
```

#### `informational`

Le lecteur cherche à comprendre un concept ou un mécanisme.

#### `comparative`

Le lecteur cherche à comparer plusieurs méthodes, notions ou options.

#### `tutorial`

Le lecteur cherche à suivre une procédure ou une implantation.

Une valeur inconnue produit un avertissement.

### 15.5 `seo.seoTitle`

Titre suggéré pour la balise HTML `<title>`.

Il peut être identique ou légèrement différent de `title`.

Il doit :

- rester fidèle au contenu;
- contenir naturellement le sujet principal;
- être compréhensible hors contexte;
- éviter les formulations trompeuses;
- éviter le bourrage de mots-clés.

Une longueur inhabituelle produit un avertissement, pas un blocage.

### 15.6 `seo.metaDescription`

Description suggérée pour les résultats de recherche et le partage.

Elle doit :

- décrire ce que le lecteur apprendra;
- rester spécifique;
- éviter les promesses non tenues;
- éviter les formulations génériques;
- être distincte du résumé lorsque cela améliore la présentation.

### 15.7 `seo.suggestedSlug`

Proposition de slug lisible.

Le slug suggéré doit :

- être en minuscules;
- utiliser des tirets;
- éviter les accents;
- éviter les espaces;
- éviter les mots inutiles;
- rester stable et descriptif.

L’application demeure responsable de :

- la normalisation;
- l’unicité;
- l’enregistrement du slug définitif;
- la gestion d’un changement après publication.

### 15.8 `seo.internalLinkSuggestions`

Type attendu :

```text
tableau d’objets
```

Structure :

```json
{
  "targetTopic": "Embeddings",
  "suggestedAnchor": "représentation vectorielle des textes",
  "placementHint": "Après la section sur la recherche sémantique"
}
```

#### `targetTopic`

Sujet ou ressource recherchée.

Le générateur ne doit pas inventer une URL interne.

#### `suggestedAnchor`

Texte de lien naturel et descriptif.

Le texte ne doit pas être une accumulation de mots-clés.

#### `placementHint`

Indication éditoriale permettant à Christian de trouver un emplacement pertinent.

Les suggestions ne sont pas insérées automatiquement lors de l’import.

---

## 16. Propriétés techniques interdites

Le générateur ne doit pas produire les propriétés contrôlées par l’application, notamment :

```text
id
articleId
slug
status
contentHtml
thumbnailPath
thumbnailUrl
coverPath
coverUrl
mediaPath
mediaUrl
publishedAt
createdAt
updatedAt
deletedAt
authorId
authorUrl
viewCount
readingTimeMinutes
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
- une URL temporaire de génération;
- un statut de publication;
- un identifiant de base de données;
- le HTML rendu;
- les données structurées JSON-LD définitives.

### 16.1 Temps de lecture

Le temps de lecture est calculé par l’application à partir de `contentMarkdown`.

Le générateur ne fournit pas `readingTimeMinutes`.

### 16.2 Slug définitif

Le générateur fournit seulement :

```text
seo.suggestedSlug
```

Le champ technique `slug` appartient à l’application.

---

## 17. Règles de cohérence

Le générateur doit vérifier que les éléments suivants décrivent le même article :

- titre;
- sous-titre;
- résumé;
- thème;
- niveau;
- série;
- objectifs;
- contenu Markdown;
- message à retenir;
- médias;
- couverture;
- mots-clés;
- sources;
- SEO.

Exemples d’incohérences à éviter :

- titre consacré au RAG, mais contenu portant surtout sur le fine-tuning;
- article débutant contenant des équations non expliquées;
- média mentionnant des composants absents du texte;
- source citée pour une affirmation qu’elle ne soutient pas;
- meta description promettant un tutoriel alors que l’article reste conceptuel;
- couverture consacrée aux agents alors que l’article traite des embeddings;
- numéro d’épisode inventé;
- graphique utilisant des données absentes des sources.

---

## 18. Comportement attendu lors de l’import

### 18.1 JSON valide et complet

L’application :

- préremplit les champs reconnus;
- crée les emplacements de médias;
- prépare l’aperçu;
- signale les avertissements;
- n’enregistre rien automatiquement;
- ne publie rien automatiquement.

### 18.2 JSON valide mais partiel

L’application importe toutes les valeurs utilisables.

Les champs absents demeurent vides ou utilisent les fallbacks prévus.

### 18.3 Objet vide

Le JSON suivant est valide :

```json
{}
```

Il n’apporte aucune modification au formulaire vide.

### 18.4 Valeur non reconnue

Exemple :

```json
{
  "level": "expert",
  "language": "french",
  "seo": {
    "searchIntent": "commercial"
  }
}
```

Comportement :

- les valeurs inconnues sont ignorées ou laissées à corriger;
- les autres propriétés valides sont importées;
- un avertissement est affiché;
- aucun contenu valide n’est perdu.

### 18.5 Propriété inconnue

Exemple :

```json
{
  "title": "Comprendre les embeddings",
  "visualMood": "futuriste",
  "promotionScore": 10
}
```

L’application importe `title`.

Elle ignore `visualMood` et `promotionScore`.

### 18.6 JSON syntaxiquement invalide

Si le fichier n’est pas un objet JSON lisible :

- aucun champ du formulaire n’est modifié;
- aucun média existant n’est supprimé;
- un message compréhensible est affiché;
- l’édition manuelle demeure disponible.

### 18.7 Réimportation

Lorsqu’un formulaire contient déjà des valeurs :

- une confirmation est demandée;
- les fichiers déjà téléversés ne sont pas supprimés;
- les chemins de médias ne sont pas remplacés par le JSON;
- les nouvelles métadonnées de médias peuvent être rapprochées par `key`;
- les médias qui ne figurent plus dans le JSON ne sont pas supprimés automatiquement.

---

## 19. Validations et avertissements

Les validations éditoriales assistent Christian sans prendre la décision à sa place.

### 19.1 Avertissements généraux possibles

- titre absent;
- résumé absent;
- contenu Markdown vide;
- niveau inconnu;
- thème absent;
- article très court;
- article très long;
- aucun objectif d’apprentissage;
- source absente;
- citation non résolue;
- source jamais citée;
- URL invalide;
- média requis manquant;
- média sans texte alternatif;
- média non utilisé;
- marqueur sans manifeste;
- clé dupliquée;
- tableau trop large;
- HTML brut détecté;
- titre de niveau 1 dans le Markdown;
- image Markdown externe détectée;
- bloc SEO incomplet;
- slug suggéré invalide;
- meta description très courte ou très longue;
- titre SEO très court ou très long;
- incohérence apparente entre le titre et la requête principale.

### 19.2 Validations techniques réellement bloquantes

Seules quelques erreurs empêchent l’import lui-même :

- fichier illisible;
- JSON syntaxiquement invalide;
- valeur racine qui n’est pas un objet.

Même dans ces cas, le formulaire existant ne doit pas être effacé.

---

## 20. Affichage public en présence de valeurs manquantes

| Valeur manquante | Comportement public |
|---|---|
| `title` | Afficher `Article` |
| `subtitle` | Masquer la ligne |
| `summary` | Masquer le résumé de la carte |
| `theme` | Afficher seulement le type `Article` |
| `level` | Masquer le niveau |
| `series` | Masquer les informations de série |
| `learningObjectives` | Masquer la section |
| `prerequisites` | Masquer la section |
| `contentMarkdown` | Afficher un message neutre indiquant que le contenu n’est pas disponible |
| `takeaway` | Masquer le bloc final |
| `cover` ou fichier de couverture | Utiliser le fallback public |
| média facultatif | Omettre le média |
| média requis | Omettre le média et conserver le texte; avertissement administratif |
| `sources` | Masquer la section Sources |
| `seo.seoTitle` | Utiliser `title` |
| `seo.metaDescription` | Utiliser `summary` lorsqu’il existe |
| `seo.suggestedSlug` | Générer une proposition depuis `title` |
| `keywords` | Aucun effet visible obligatoire |

Une donnée manquante ne doit pas produire une zone vide ou une erreur non gérée.

---

## 21. Noms de fichiers recommandés

Le fichier JSON et les médias proposés devraient partager une base descriptive.

Exemple :

```text
comment-fonctionne-rag.article.json
comment-fonctionne-rag-cover.webp
comment-fonctionne-rag-flux-rag.webp
```

Recommandations :

- minuscules;
- aucun accent;
- aucun espace;
- mots séparés par des tirets;
- suffixe `.article.json` pour distinguer le contrat d’article;
- nom court mais descriptif.

L’application ne doit pas dépendre d’une correspondance exacte entre les noms.

---

## 22. Exemple minimal

```json
{
  "schemaVersion": 1,
  "contentType": "article",
  "language": "fr",
  "title": "Introduction aux embeddings",
  "contentMarkdown": "Un embedding est une représentation numérique produite par un modèle.\n\n## Pourquoi utiliser des embeddings?\n\nIls permettent notamment de comparer des contenus selon certaines propriétés apprises."
}
```

Cet exemple demeure importable.

Il produira plusieurs avertissements éditoriaux, mais aucune erreur bloquante.

---

## 23. Exemple avec tableau sans média

```json
{
  "schemaVersion": 1,
  "contentType": "article",
  "language": "fr",
  "title": "Entraînement et inférence : quelles différences?",
  "subtitle": "Deux phases distinctes dans la vie d’un modèle",
  "summary": "Comparez la phase pendant laquelle un modèle apprend à celle pendant laquelle il est utilisé.",
  "theme": "Apprentissage automatique",
  "level": "beginner",
  "contentMarkdown": "L’entraînement et l’inférence répondent à deux objectifs différents.\n\n## Comparaison\n\n| Aspect | Entraînement | Inférence |\n|---|---|---|\n| Objectif | Ajuster les paramètres | Utiliser les paramètres appris |\n| Entrée | Données d’apprentissage | Nouvelle entrée |\n| Coût | Généralement élevé | Généralement plus faible |\n\n## Conclusion\n\nL’entraînement permet au modèle d’apprendre à partir d’exemples. L’inférence utilise ensuite ce qui a été appris.",
  "media": [],
  "sources": [],
  "seo": {
    "primaryQuery": "différence entre entraînement et inférence",
    "secondaryQueries": [],
    "searchIntent": "comparative",
    "seoTitle": "Entraînement et inférence : comprendre la différence",
    "metaDescription": "Découvrez la différence entre la phase d’entraînement d’un modèle d’IA et son utilisation pendant l’inférence.",
    "suggestedSlug": "entrainement-inference-difference",
    "internalLinkSuggestions": []
  }
}
```

---

## 24. Responsabilités du générateur

Le générateur doit :

1. comprendre le sujet et le niveau;
2. effectuer la recherche nécessaire;
3. privilégier les sources primaires et officielles;
4. préparer une structure pédagogique;
5. rédiger le contenu en Markdown;
6. choisir les tableaux et médias pertinents;
7. placer les marqueurs de médias;
8. placer les marqueurs de citations;
9. produire les briefs de médias et de couverture;
10. préparer les suggestions SEO;
11. vérifier la cohérence du paquet;
12. produire un JSON syntaxiquement valide;
13. ne jamais publier ni se connecter directement au site.

---

## 25. Responsabilités de l’application

L’application doit :

1. lire et valider le JSON;
2. préserver les propriétés reconnues;
3. ignorer les propriétés inconnues;
4. afficher les avertissements;
5. permettre la correction manuelle;
6. rendre le Markdown de manière sécuritaire;
7. résoudre les citations;
8. résoudre les marqueurs de médias;
9. gérer les fichiers séparément;
10. calculer le temps de lecture;
11. déterminer le slug définitif;
12. produire les métadonnées techniques;
13. produire les données structurées;
14. enregistrer en brouillon ou publier seulement après action humaine;
15. préserver les données existantes lors d’une erreur d’import.

---

## 26. Invariants critiques

Pendant toute l’implantation :

- un JSON partiel reste importable;
- l’import ne publie jamais;
- les propriétés inconnues sont ignorées;
- les validations éditoriales ne bloquent pas la publication;
- un JSON invalide ne modifie pas le formulaire;
- le Markdown brut n’exécute jamais de code;
- les images ne sont jamais encodées dans le JSON;
- les chemins de stockage restent contrôlés par l’application;
- les URL et sources ne sont jamais inventées;
- un média manquant ne rend pas tout l’article inutilisable;
- un tableau ordinaire reste du contenu HTML accessible;
- une série demeure indépendante du format;
- le temps de lecture est calculé par le site;
- le slug suggéré n’est pas le slug définitif;
- le SEO aide à découvrir l’article sans dicter artificiellement son contenu;
- Christian conserve toujours la décision finale.

---

## 27. Résumé du contrat v1

```text
Article
├── Métadonnées générales
├── Classification et niveau
├── Série facultative
├── Objectifs et prérequis
├── Contenu Markdown
├── Marqueurs de médias
├── Manifeste des médias
├── Brief de couverture
├── Mots-clés
├── Sources et citations
└── Suggestions SEO
```

Flux cible :

```text
Sujet et niveau
→ recherche
→ proposition éditoriale
→ rédaction Markdown
→ choix des médias
→ citations et sources
→ préparation SEO
→ export JSON
→ import administratif
→ révision humaine
→ ajout ou génération des images
→ aperçu
→ publication
```
