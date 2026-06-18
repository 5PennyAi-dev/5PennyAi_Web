# Style — Cheat Sheet ressource autonome 5PennyAi

> Fichier distinct de `infographic-resource-style.md`. Ne jamais mélanger les deux styles.

## Nature

Une **fiche de référence technique visuelle** — portrait dense, sections numérotées en cartes color-codées, **pills monospace** pour les commandes / termes / valeurs exactes. Ce n'est pas une infographie explicative : c'est un **outil de consultation rapide**, style « reference card » ou « dev cheat sheet ».

Référence mentale : les cheat sheets de VS Code, Git, Docker, Tailwind CSS.

## RÈGLE D'OR — FIDÉLITÉ VERBATIM

Le contenu textuel (commandes, termes, définitions) a été vérifié AVANT la génération de l'image.
**L'image doit rendre ce contenu mot pour mot, sans rien inventer.**

- Chaque commande visible dans l'image DOIT exister dans le contenu source.
- Chaque terme / définition courte DOIT correspondre exactement à la source.
- En cas de manque de place : **omettre** des items plutôt qu'en abréger ou réinterpréter.
- **N'inventer aucune commande, aucune valeur, aucun paramètre.**

## Palette EXACTE (aucune autre couleur)

- Navy `#143054` — bandeau d'en-tête, numéros de section, texte principal, structure.
- Surface `#F7F5F2` — fond de page.
- Blanc `#FFFFFF` — fond des cartes de section.
- **Orange `#DD8737` — accent focal UNIQUE** : réservé UNIQUEMENT au bandeau final « À retenir ». Un seul élément orange par cheat sheet.
- Steel blue `#81AED7` — accent section 1 (header de carte).
- Cobalt `#4F7CD4` — accent section 2.
- Violet `#8B5CF6` — accent section 3.
- Teal `#14B8A6` — accent section 4.
- Si plus de 4 sections : alterner les 4 couleurs ci-dessus (pas d'orange).
- Lavender `#DBCFEE` — fond optionnel pour pills de catégorie dans les cartes.

## Mise en page — Portrait strict

Format **portrait 2:3** (1024×1536 px). Structure de haut en bas :

1. **Bandeau d'en-tête** : fond navy `#143054`, texte blanc.
   - Étiquette chips : « CHEAT SHEET » en monospace small caps, accent color (steel ou teal).
   - Titre principal : sans-serif bold, grande taille, blanc.
   - Sous-titre/scope optionnel : regular, blanc 70%.

2. **Cartes de sections numérotées** : une carte par section, fond blanc, coins arrondis `12px`.
   - Header de carte : fond couleur d'accent de section (steel/cobalt/violet/teal), texte blanc.
   - Numéro de section en cercle accent + titre de section en bold.
   - Corps : pills monospace + labels, selon l'archétype.

3. **Bandeau « À retenir »** (optionnel mais recommandé) : fond orange `#DD8737`, texte blanc.
   - Icône check ou ampoule + phrase percutante, sans-serif bold.
   - **C'est le seul élément orange de toute la fiche.**

## Composants — Pills monospace (composant central)

La cheat sheet se distingue de l'infographie par son usage intense de **pills monospace**.

### Règle de couleur des pills — OBLIGATOIRE

**Chaque pill hérite de la couleur de sa section.** Pas de pill à fond sombre/noir.

| Section | Fond du pill | Bordure | Texte |
|---|---|---|---|
| Steel `#81AED7` | `#81AED7` à 15% (très pâle bleu) | `#81AED7` (1px) | `#81AED7` ou navy `#143054` |
| Cobalt `#4F7CD4` | `#4F7CD4` à 15% (très pâle cobalt) | `#4F7CD4` (1px) | `#4F7CD4` ou navy `#143054` |
| Violet `#8B5CF6` | `#8B5CF6` à 15% (très pâle violet) | `#8B5CF6` (1px) | `#8B5CF6` ou navy `#143054` |
| Teal `#14B8A6` | `#14B8A6` à 15% (très pâle teal) | `#14B8A6` (1px) | `#14B8A6` ou navy `#143054` |

**Résultat visuel attendu** : pill léger, presque transparent, avec un contour coloré et du texte monospace lisible — comme les tags de Tailwind CSS, GitHub ou Linear.

**INTERDIT** : fond sombre (`#1E293B` ou similaire) avec texte blanc. Ce style n'est pas celui de 5PennyAi.

### Types de pills

- **Pill commande/code** : police monospace, fond très clair de la couleur de section + bordure fine + texte coloré, coins arrondis petits, padding horizontal généreux.
- **Pill valeur/paramètre** : même principe que commande/code, légèrement plus petit.
- **Label catégorie** : fond lavender `#DBCFEE`, texte navy, sans-serif small caps, coins très arrondis (20px).
- **Ligne de référence** (archétype lexique) : `[pill terme]  →  [description courte sans-serif]` sur une ligne.

## Archétypes de layout

Choisir celui qui correspond le mieux au sujet :

- **commands** : 2-4 cartes de commandes CLI/API, chaque carte liste des pills `commande` + description courte. Adapté : Git, Docker, Claude Code, curl.
- **lexicon** : 2-3 cartes en colonnes (ou stacked) `[pill terme]  →  définition`. Adapté : Lexique IA générative, Glossaire ML.
- **comparison** : 2-3 colonnes comparatives côte à côte dans une grande carte, header couleur par colonne. Adapté : RAG vs Fine-tuning, REST vs GraphQL.
- **workflow** : étapes numérotées en séquence (flèche fine entre chaque étape), pills commande à chaque étape. Adapté : setup d'un projet, CI/CD pipeline.
- **mixed** : combinaison libre (ex. : 1 carte workflow + 2 cartes commandes + 1 carte lexique). Pour les sujets denses et variés.

## Typographie

- Titres de section : sans-serif bold (style Inter / DM Sans / Outfit), lisible à 12-14pt.
- Corps : sans-serif regular, très lisible.
- Commandes / termes : **monospace exclusif** (style Fira Code, JetBrains Mono ou équivalent).
- **Jamais de taille en `px` dans le prompt** (ex. ~~« texte 14px »~~) — décrire la hiérarchie en termes relatifs (« titre plus grand », « label small »).

## Icônes

Linéaires, simples, stroke 1.5px. Cohérentes dans un seul style. Optionnelles — la lisibilité des pills prime.

## Règles absolues (apprises)

- **Jamais de footer avec URL, domaine ou attribution dans l'image.** (L'attribution va dans le texte d'accompagnement.)
- **Jamais de taille en `px` adjacente à une chaîne de texte** dans le prompt.
- **Un seul accent orange** sur toute la fiche (bandeau « À retenir » uniquement).
- Fond de page : surface `#F7F5F2`, jamais blanc pur ni gris.
- Pas de dégradés, pas de glassmorphism, pas de shadows lourdes.
- Pas de logo ni filigrane dans l'image.

## Test de qualité avant de finaliser le prompt image

- [ ] Chaque commande / terme visible est-il extrait verbatim de la source ?
- [ ] L'orange apparaît-il une seule fois (bandeau « À retenir ») ?
- [ ] Les pills monospace sont-elles utilisées pour toutes les commandes / termes ?
- [ ] Les pills ont-ils un fond clair + bordure + texte dans la couleur de leur section (pas de fond sombre) ?
- [ ] Le fond est-il surface `#F7F5F2` ?
- [ ] Le prompt ne contient-il aucune taille en `px` adjacente à une chaîne ?
- [ ] Y a-t-il 3-5 cartes de sections distinctes et riches ?
