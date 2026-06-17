# Style — Infographie ressource autonome 5PennyAi

## Nature

Une **fiche aide-mémoire premium DENSE** — une page verticale complète avec **plusieurs sections riches**, cartes blanches arrondies, hiérarchie visuelle forte. **PAS** une simple illustration mono-bloc. Référence mentale : les infographies LlamaIndex, « Comment fonctionne le RAG », « RAG vs fine-tuning ».

## Palette EXACTE (aucune autre couleur)

- Navy `#143054` — bandeau d'en-tête, titres, texte principal, structure.
- Surface `#F7F5F2` — fond de page.
- Blanc `#FFFFFF` — cartes.
- Orange `#DD8737` — **accent focal UNIQUE** : un seul point d'attention par fiche (« À retenir » ou l'élément le plus important). **Jamais sur plusieurs éléments. Un seul accent orange par infographie.**
- Steel blue `#81AED7`, Cobalt `#4F7CD4`, Violet `#8B5CF6`, Teal `#14B8A6` — accents catégoriels : **une couleur par section**, pas par élément individuel.
- Lavender `#DBCFEE` — fonds doux d'encadrés secondaires.

## Mise en page

Verticale (portrait 2:3), dense mais respirante, **5 à 7 grands blocs distincts**. Structure type :

1. **Bandeau d'en-tête** : fond navy, titre blanc + sous-titre, pastille catégorie.
2. **Bloc définition/contexte** : fond surface, 2-3 lignes concises.
3. **Grille de concepts clés** : 3-6 cartes blanches arrondies (icône + titre + brève définition, 1-2 lignes max).
4. **Bloc central** selon archétype : schéma de processus numéroté, colonnes comparatives, couches empilées, ou grille catégorisée.
5. **Usages / exemples concrets** : liste à puces courtes (3-5 items), icônes simples.
6. **Encadré « À retenir »** : fond orange `#DD8737` (c'est LE seul élément orange de toute la fiche), texte blanc, 1-2 phrases.
7. **Pied de page** : fond navy, synthèse courte.

## Composants autorisés

- Carte concept (icône linéaire + titre + définition courte, fond blanc, coins arrondis `8-12px`)
- Étape numérotée (cercle de couleur catégorielle + texte)
- Flèches sobres pour flux/processus (lignes fines, pas de dégradé)
- Liste à puces (max 5 items, icône check ou point de couleur)
- Mini-diagramme à flèches sobres
- Bloc résultat/usage avec icône

## Typographie

Sans-serif géométrique moderne (style Inter, DM Sans, Outfit). Titres courts et impactants (bold), corps très lisible (regular), labels en monospace pour codes/termes techniques. Lisible sur mobile.

## Icônes

Simples, linéaires, cohérentes dans le même style. Lignes fines (1-2px stroke). Taille cohérente dans toute la fiche.

## Test de qualité

Avant de finaliser le prompt, vérifier mentalement :
- [ ] L'infographie a 5-7 sections distinctes visibles ?
- [ ] L'orange n'apparaît qu'une seule fois (encadré « À retenir ») ?
- [ ] Les cartes de concepts sont nombreuses et informatives ?
- [ ] Les colonnes/blocs comparatifs sont bien remplis ?
- [ ] Le fond est surface `#F7F5F2`, pas blanc ni gris ?

## À éviter ABSOLUMENT

- Version trop simple ou mono-bloc (bannir toute infographie à 1-2 sections seulement)
- Surcharge visuelle (20+ couleurs, 10+ polices)
- Trop de styles typographiques (max 3 niveaux)
- Paragraphes longs dans les cartes (max 2 lignes)
- Couleurs hors palette
- **Plusieurs accents orange** — UNE SEULE zone orange par infographie
- Style cartoon, dessiné à la main, aquarelle
- Logo, URL, filigrane, signature dans l'image
- Contenu inventé ou imprécis
- Infographie qui ressemble à une slide PowerPoint vide
