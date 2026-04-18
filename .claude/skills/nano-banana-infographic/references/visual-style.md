# Style visuel — Infographie éditoriale flat vector

Ce fichier définit le style cible pour toutes les infographies du blog 5PennyAi. Lis-le en début de session.

## Philosophie du style

**Éditorial, dense, structuré, pro** — avec une **palette colorée affirmée** qui capte l'attention sans tomber dans le criard. L'infographie doit ressembler à une page soignée d'un rapport tech moderne ou d'un dashboard UI récent — pas à une affiche marketing saturée, pas à du stock SaaS isométrique, pas à du hand-drawn.

**Trois mots-clés** : *crisp, informatif, vibrant*.

**Références génériques** (à décrire techniquement, jamais à nommer dans un prompt) : infographies éditoriales de magazines tech contemporains, dashboards UI type Linear/Notion/Figma, rapports annuels bien designés, pages de présentation produit type landing SaaS premium récente.

## Caractéristiques techniques

### Composition

- **Structure lisible immédiatement** : l'œil comprend la hiérarchie en 2 secondes
- **Titre principal en haut**, clair et fort
- **Contenu organisé en zones distinctes** (sections séparées par espacement, lignes fines ou fonds légèrement teintés)
- **Une zone focale dominante** (centre géométrique ou haut-centre) qui porte le message principal
- **Marges internes généreuses** (l'infographie doit "respirer" même si dense)
- **Grille sous-jacente** (visible ou non) : les éléments s'alignent sur des rails invisibles
- **Pas de footer signature dans le visuel** — l'infographie n'est pas signée par un site dans l'image même (le branding se fera côté publication : watermark ajouté après, ou contexte d'article)

**Dans le prompt** :
> "Clean editorial infographic layout with clear hierarchy: bold title at the top, organized content zones separated by generous spacing, one central focal element, underlying grid alignment giving the composition precision and calm. No footer signature, no website URL, no branding in the image itself."

### Formes et style graphique

- **Flat vector pur** : aplats de couleur unis, aucun dégradé, aucune texture, aucune ombre (ou très minimale)
- **Formes géométriques nettes** : cercles parfaits, rectangles aux coins arrondis (4-12px), lignes droites
- **Pastilles circulaires** pour grouper icône + texte, ou pour mettre en avant un chiffre
- **Cartouches rectangulaires** pour les blocs de texte, avec bordure fine ou fond coloré léger
- **Lignes de connexion fines** (1-2px) en navy pour relier les éléments
- **Pictogrammes flat 2D** : icônes pleines ou au trait, jamais 3D ni ombrées

### Typographie

La typographie est **centrale** dans une infographie. Hiérarchie minimum à 4 niveaux :

1. **Titre principal** (H1) : gros, gras, sans-serif géométrique — 3-4× la taille du body
2. **Sous-titres / labels de section** (H2) : medium-bold, 1.5-2× la taille du body
3. **Body / labels** : regular, lisible
4. **Chiffres-vedettes** : très gros, bold, en orange `#DD8737`
5. **Micro-labels** (sous-texte) : small, medium weight

**Dans le prompt** :
> "Typography: clean geometric sans-serif throughout (similar to Inter, Outfit, or DM Sans), strong hierarchy with bold large title at top, medium-weight section labels, regular-weight body text, oversized bold numbers for featured statistics rendered in orange (#DD8737) as visual anchors, consistent letter spacing, crisp anti-aliased rendering."

**Rendu du texte dans Nano Banana** :
- Encapsuler **tous les textes attendus entre guillemets**
- Être **explicite sur l'emplacement** ("top center", "below the donut", "right of the icon")
- Préférer **plusieurs labels courts** à un seul long bloc
- Vérifier que chaque texte a une position claire

### Iconographie

- **Style flat pictogram** : simple, reconnaissable au premier coup d'œil
- **Deux sous-styles acceptables** (ne pas mélanger dans la même image) :
  - **Filled** : icônes pleines colorées
  - **Outlined** : icônes au trait
- **Taille homogène** : toutes les icônes d'une zone font la même taille
- **Dans une pastille colorée** : icône centrée dans un cercle de couleur de la **palette enrichie** (cobalt, violet, teal), effet "bouton" éditorial

### Data-viz miniatures

- **Donuts circulaires**, **barres horizontales**, **jauges**, **pie charts simples**, **timelines**, **icônes-stats**, **barres verticales**
- **Règles** :
  - Maximum 2-3 data-viz différentes par infographie
  - Chaque data-viz a un label court et une valeur chiffrée claire
  - Utiliser les **accents vifs de la palette enrichie** (pas les pastels)

---

## 🎨 Palette 5PennyAi enrichie (pour infographies)

La palette combine **3 couleurs d'ancrage de marque** (toujours présentes) + **2-3 couleurs d'accent vives** (choisies parmi une palette enrichie). Cohérence avec l'identité 5PennyAi + pep visuel d'un blog techno contemporain.

### Couleurs d'ancrage (toujours présentes)

| Couleur | HEX | Rôle |
|---------|-----|------|
| **Glacier** (défaut) | `#EEF4FC` | Fond de l'image — dérivé pâle du cobalt, donne un feel tech moderne et fait pop les accents |
| **Navy** | `#143054` | Texte, contours, icônes filled, dominant |
| **Orange** | `#DD8737` | **Accent focal unique** — chiffres vedettes |

**Alternative dark** (sur demande explicite, pour contexte premium) : fond navy profond `#0F1E3D`, texte crème `#F7F5F2`. Dans ce mode, les accents vifs deviennent électriques. Utiliser uniquement quand l'utilisateur veut un look dashboard dark/premium.

**Ancien crème `#F7F5F2`** : toujours valide pour le site web et autres identités calmes, mais **déprécié comme fond d'infographie** — il tire vers le "papier journal fade" et amortit l'énergie visuelle.

### Palette d'accents vifs (2-3 par infographie)

| Couleur | HEX | Rôle type |
|---------|-----|-----------|
| **Bleu cobalt** | `#4F7CD4` | Pastille principale, data-viz neutre |
| **Violet royal** | `#8B5CF6` | Pastille, contraste |
| **Teal frais** | `#14B8A6` | Pastille, positif/growth |
| **Jaune doré** | `#F59E0B` | Highlight secondaire rare |
| **Rose corail** | `#EC4899` | Accent chaud alternatif rare |

### Règles d'usage

- **Toujours** : glacier (ou navy dark) + navy (ou crème en mode dark) + orange (ancrage identité)
- **2-3 accents vifs** pour les pastilles et data-viz — **alterner** entre eux plutôt que tous différents
- **L'orange reste le seul focal vedette** — les chiffres-clés en orange sont la seule zone "qui crie"
- **Fonds de cartes** : blanc pur sur fond glacier (tranche nettement) OU navy légèrement éclairci `#1A2F56` sur fond dark. Bordure cobalt fine pour bien délimiter.
- **Maximum 5 couleurs** distinctes totales
- **Saturation cohérente** : les accents vifs ont tous une saturation franche mais pas fluo

**Dans le prompt (mode light par défaut)** :
```
Strict color palette — anchor colors always present:
- Background: glacier blue #EEF4FC (a very pale cobalt-tinted blue,
never pure white, never warm beige)
- Primary text, outlines, main filled icons: deep navy #143054
- Single focal accent (featured numbers and hero element only): vivid
  orange #DD8737

Vibrant accent palette — use 2-3 of these for icon badges and data-viz:
- Cobalt blue #4F7CD4
- Royal violet #8B5CF6
- Fresh teal #14B8A6
- (Optional) Golden amber #F59E0B
- (Optional rare) Punchy pink #EC4899

All vibrant accents share consistent saturation (richly saturated but
not neon, not fluorescent). Maximum of 5 distinct colors total in the
image. The vivid orange remains the single brightest focal — no other
accent should compete with it for attention.

Card backgrounds: pure white with thin cobalt #4F7CD4 border at 40%
opacity, 12px rounded corners. The white cards create a crisp
contrast against the glacier blue background.
```

**Dans le prompt (mode dark, sur demande)** :
```
Strict dark-mode color palette:
- Background: deep navy #0F1E3D (never pure black)
- Primary text, labels: warm cream #F7F5F2
- Card backgrounds: slightly lighter navy #1A2F56 with subtle cobalt
border at 40% opacity
- Vibrant accents (cobalt, violet, teal) appear electric against the
dark background
- Single focal: vivid orange #DD8737 for featured numbers
```

### Anciens pastels (DÉPRÉCIÉS pour infographies)

`#81AED7` (steel blue pastel) et `#DBCFEE` (lavender pastel) **ne sont plus utilisés** dans les infographies. Ils rendent l'image fade. **Toujours remplacer** :
- `#81AED7` → `#4F7CD4` (cobalt)
- `#DBCFEE` → `#8B5CF6` (violet)

Le crème `#F7F5F2` reste l'ancienne surface — également déprécié comme fond d'infographie (voir plus haut). Ces couleurs restent valides dans le reste de l'identité 5PennyAi (site, documents calmes).

---

## Format et aspect ratios

- **Header blog horizontal** : 16:9 (1920×1080)
- **Figure inline portrait** : 4:5 (1200×1500) ou 3:4 (1200×1600) — polyvalent
- **Social carré** : 1:1 (1200×1200)
- **Long-form vertical** : 2:3 (1200×1800) ou 9:16 (1080×1920)

**Par défaut pour 5PennyAi** :
- Beaucoup de données à synthétiser → **4:5 portrait**
- Header d'article → **16:9**
- Partage social → **1:1** ou **2:3**

## À ne JAMAIS faire

- ❌ Photoréalisme, rendu 3D, lens flare, glow
- ❌ Dégradés de couleur
- ❌ Ombres portées fortes
- ❌ Hand-drawn, watercolor, croquis, textures papier
- ❌ Corporate memphis
- ❌ Textures 3D
- ❌ Mélanger icônes filled et outlined
- ❌ Logos de marques réelles
- ❌ Plus de 5 couleurs différentes
- ❌ Utiliser les pastels `#81AED7` ou `#DBCFEE` comme pastilles d'icônes
- ❌ Fond `#F7F5F2` crème (déprécié — utiliser glacier `#EEF4FC`)
- ❌ Fond blanc pur `#FFFFFF`
- ❌ Police manuscrite ou serif
- ❌ Emojis
- ❌ Remplir tout l'espace
- ❌ **Footer / URL / signature dans le visuel**

## Formulation négative standard

```
Avoid: photorealism, 3D rendering, color gradients, drop shadows, glow
effects, lens flare, hand-drawn or sketch style, watercolor textures,
paper grain, corporate memphis illustration style, plastic or metallic
textures, brand logos, watermarks, mixing filled and outlined icons,
emojis, serif or script typography, cluttered layouts, pure white
backgrounds, warm beige or cream backgrounds, washed-out pastel colors
that make the composition feel dull, website URLs or footer signatures
inside the image.
```

## Feel test

1. La palette est-elle **vibrante sans être criarde** ?
2. L'infographie pourrait-elle apparaître dans un rapport annuel Stripe/Ramp/Notion récent sans dépareiller ?
3. Un lecteur comprend-il le message principal en 3 secondes ?
4. L'orange est-il le seul focal vedette ?
5. Aucun footer/URL dans l'image ?

Si tu hésites, retravaille.

---

## 🎈 Touches ludiques (registre "éditorial avec personnalité")

Le style par défaut est pro-éditorial, mais on peut (et doit) ajouter des **touches ludiques raffinées** qui donnent de la personnalité sans casser le sérieux. Le registre cible est "data-journalism feature" ou "Pudding/Polygon feature" — **pas** "startup fun" ni "corporate memphis".

### Patterns ludiques OK (à utiliser avec parcimonie)

**Numérotation stylisée** : privilégier "01, 02, 03..." plutôt que "1, 2, 3" nus. Ajoute un petit tiret orange horizontal sous chaque numéro pour le singulariser. Plus chic, plus éditorial.

**Sticker floatant qui déborde** : un seul sticker ovale légèrement tilté (8-12°), en couleur d'accent supplémentaire (`#F59E0B` amber doré est idéal) qui déborde d'une carte ou d'un bloc. Texte court, en majuscules, blanc sur fond vif. À utiliser **une seule fois** par infographie, sur l'élément le plus important pour attirer le regard. Exemples : "À ÉVITER !", "À LIRE !", "POPULAIRE", "NOUVEAU", "PRO TIP".

**Micro-motifs décoratifs dans les marges** : petites constellations de 2-3 points ou tirets dans les marges gauche/droite, en couleur d'accent à 50-60% opacité. Donnent une "respiration visuelle" rythmique sans encombrer. Alignés sur des points précis de la composition (entre les cartes, au niveau des titres).

**Pastille éditoriale en header** : petit pill small caps (ex : "GUIDE ETSY · ÉTAPE 4", "SÉRIE IA POUR PME", "DATA 2026") au-dessus du titre, qui positionne l'infographie dans une série éditoriale. Crée une identité récurrente.

**Mini-viz d'ancrage** : ajouter à la barre de takeaway une mini-visualisation qui **incarne** le message central. Exemple : l'article parle de 13 tags Etsy → rangée de 13 mini-carrés orange à côté du texte. L'article parle de 4 étapes → 4 petits cercles. Double le pouvoir didactique du takeaway.

**Typographie des signes** : les signes "✓", "×", "→", "!" utilisés comme **accents typographiques**, pas comme icônes. En orange pour positif, en navy sobre ailleurs. Donnent du rythme sans tomber dans l'emoji.

**Pastilles "solution" / "remède"** : pour les infographies de type "erreurs / pièges / mauvaises pratiques", ajouter systématiquement une petite pill à droite de chaque carte avec le remède (ton direct, 2-4 mots : "✓ VARIER", "✓ COMPLÉTER"). Transforme un constat en mode d'emploi.

### Patterns ludiques PAS OK

- ❌ **Personnages stylisés** (corporate memphis, bonhommes génériques, visages)
- ❌ **Emojis** rendus comme images (😀 🎉 👍) — jamais
- ❌ **Ornements "fun" clichés** : cœurs, étoiles scintillantes, nuages cartoon
- ❌ **Motifs gribouillés main levée** (le style reste crisp vector)
- ❌ **Couleurs criardes "fun"** : fluo, couleurs pop saturées hors palette
- ❌ **Humour visuel explicite** : GIFs-style, punchlines visuelles lourdes
- ❌ **Plus d'un sticker** par infographie (devient kitsch)

### Règle d'or

**Une infographie = au maximum 3 touches ludiques.** Ex : numérotation stylisée + sticker + micro-motifs = OK. Tout ajouter en plus devient chargé.

L'objectif : donner de la personnalité sans que le lecteur ne voie "les touches ludiques" — elles doivent sembler naturelles, comme si l'infographie avait été designée avec soin.

---

## 📐 Variantes de la zone "takeaway" (anti-uniformité)

Si **chaque** infographie du blog termine par une barre teal identique avec un losange orange, ça devient du template au lieu du design. Pour varier, puiser dans ces **5 variantes** — idéalement alterner entre articles pour éviter la signature répétitive.

### Variante A — Bandeau teal (actuel, sobre et efficace)
Rectangle horizontal teal `#14B8A6` à 20% opacité, bordure teal à 50%, coins 10px, texte bold navy centré avec losange orange marqueur. **Idéal pour** : règles et vérités synthétiques, usage courant.

### Variante B — Pull-quote éditorial (style magazine)
Pas de fond coloré. Un trait vertical épais (6px) orange `#DD8737` à gauche du texte, texte en navy bold **plus grand** (28px), italique optionnel. Style "citation de magazine". **Idéal pour** : articles opinion, démystification, messages forts.

**Dans le prompt** :
> "Editorial pull-quote style zone: no background fill, a thick 6px vertical orange #DD8737 bar at the far left, followed by bold navy italic text 28px: '[TEXTE]'. No box, no rounded rectangle — clean open layout."

### Variante C — Bandeau cobalt inversé (fond plein)
Rectangle **plein cobalt** `#4F7CD4` (100% opacité), texte blanc bold, accent orange sur un seul mot-clé du texte (surligné ou encadré). Plus audacieux. **Idéal pour** : articles "action", CTA visuels, moments d'accroche forte.

**Dans le prompt** :
> "Bold statement bar: solid cobalt #4F7CD4 background fill at full opacity, 12px rounded corners, centered white bold text 22px: '[TEXTE DÉBUT] [MOT-CLÉ] [TEXTE FIN]' with the [MOT-CLÉ] word highlighted by a small orange #DD8737 underline stroke below it."

### Variante D — Signature badge compacte (pas plein-largeur)
Petit badge cobalt ou violet compact, aligné à droite ou à gauche (pas centré sur toute la largeur). Typographie plus petite, format "tag conclusion". **Idéal pour** : infographies où la stat principale est déjà visuellement dominante ailleurs.

**Dans le prompt** :
> "Conclusion badge, not full-width: a small rounded-rectangle approximately 40% of width, aligned to the right edge, cobalt #4F7CD4 solid fill, white bold text 16px: '[TEXTE COURT]'."

### Variante E — Pas de zone takeaway
Certaines infographies n'ont pas besoin d'un takeaway explicite : si le titre + les stats parlent d'eux-mêmes, laisser la zone basse **vide** (espacement respirant) est souvent plus élégant que de forcer une signature. **Idéal pour** : concept + stats constellation (type 4), certaines comparaisons évidentes.

### Règle de rotation

Pour varier entre articles :

| Si l'article précédent utilisait… | Privilégier pour le suivant… |
|-----------------------------------|------------------------------|
| Variante A (teal classique) | B, C ou D |
| Variante B (pull-quote) | A, C, ou E |
| Variante C (cobalt plein) | A, B ou D |
| Variante D (badge compacte) | A, B ou C |
| Variante E (aucune) | A, B ou C |

**Principe** : **ne jamais répéter la même variante** deux infographies d'affilée dans la même série éditoriale. Cela évite la signature répétitive et donne au blog un rythme visuel varié.
