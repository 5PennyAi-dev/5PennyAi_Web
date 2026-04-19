# Guide des formats d'infographie

Ce fichier guide le choix du **format (aspect ratio)** selon le type d'infographie. Le format détermine comment l'infographie s'affichera dans l'article et influence la densité d'information possible.

**Pourquoi c'est important** : sur desktop, une infographie portrait 4:5 peut occuper plusieurs écrans de scroll et interrompre le flux de lecture. Un format landscape 16:9 s'intègre beaucoup mieux dans le rythme textuel. Le choix doit être **intentionnel**, pas par défaut.

---

## 🎯 Principe de choix

**Deux critères à considérer** :

1. **Densité d'information** : combien d'éléments faut-il afficher ? (7 outils demandent plus de place que 3 widgets)
2. **Rythme éditorial** : l'infographie interrompt-elle le flux de lecture (portrait) ou s'y intègre-t-elle (landscape) ?

**Règle de base** : privilégier les formats **moins hauts** (landscape, carré) quand c'est possible. Le portrait doit être réservé aux cas où il est vraiment nécessaire.

---

## 📐 Les 4 formats utilisables

### 16:9 Landscape (1920×1080)
**Quand l'utiliser** :
- Comparaisons 2 colonnes (type 3)
- Concept + 3-5 stats satellites (type 4, version compacte)
- Système annoté avec 2-4 stations (type 1)
- Dashboard simple avec 2-4 widgets (type 6, version compacte)
- **Header-infographie** pour ouvrir un article de façon visuelle

**Avantages** : parfaitement intégré au flux de lecture, naturel à l'œil, partageable comme bannière
**Limites** : ne convient pas pour 5+ éléments verticaux

### 3:2 Landscape (1500×1000)
**Quand l'utiliser** :
- Dashboards multi-widgets (type 6) avec 4-6 widgets
- Concept + stats constellation (type 4) avec 4-5 stats
- Systèmes annotés (type 1) avec 4-5 stations

**Avantages** : un peu plus haut que 16:9, laisse respirer sans exploser verticalement
**Limites** : moins standard que 16:9, demande parfois un peu plus de max-width à l'affichage

### 1:1 Square (1200×1200)
**Quand l'utiliser** :
- Infographies **sociales** (LinkedIn, Instagram) en priorité
- Concept central fort avec 3-4 éléments en gravitation
- Infographies autoportantes pensées pour le partage

**Avantages** : format **universel partage social**, équilibré visuellement
**Limites** : moyennement adapté au flux d'article (ni horizontal ni vertical)

### 4:5 Portrait (1200×1500)
**Quand l'utiliser** : **seulement quand vraiment nécessaire** pour :
- Catalogues longs avec 5-7 items (type 7A, 7B)
- Processus linéaires avec 5-7 étapes verticales (type 2)
- Stack hiérarchique avec 4+ couches empilées (type 5)

**Avantages** : permet la densité verticale, bon sur mobile (prend 1 écran)
**Limites** : **casse le rythme de lecture sur desktop** — à utiliser avec parcimonie (max 1-2 par article)

---

## 🗂️ Format recommandé par type d'infographie

| Type | Format recommandé | Alternative |
|------|-------------------|-------------|
| 1 — Système annoté | **16:9 landscape** (2-4 stations) | 3:2 si 5+ stations |
| 2 — Processus numéroté | **3:2 landscape** (4-5 étapes) | 4:5 portrait si 6-7 étapes linéaires |
| 3 — Comparaison chiffrée | **16:9 landscape** (toujours 2 colonnes) | — |
| 4 — Concept + stats constellation | **16:9 landscape** (3-4 stats) | 3:2 ou 1:1 si 5-6 stats |
| 5 — Stack hiérarchique | **4:5 portrait** (couches empilées) | 3:4 si moins de couches |
| 6 — Dashboard multi-widgets | **3:2 landscape** (4 widgets) | 1:1 si 4 widgets équilibrés, 4:5 si 6 widgets |
| 7A — Catalogue positif (outils) | **4:5 portrait** si 5-7 items | 1:1 si 4 items, 3:2 si catalogue 2×3 |
| 7B — Catalogue d'erreurs | **4:5 portrait** (liste verticale) | — |

---

## 🧪 Test de décision rapide

Avant de choisir 4:5 portrait, poser ces 3 questions :

1. **Ai-je vraiment 5+ items à aligner verticalement ?**
   - Non → préférer 16:9 ou 3:2
   - Oui → continuer

2. **Ces items peuvent-ils être réorganisés en grille 2×3 ou 3×2 ?**
   - Oui → choisir 3:2 landscape avec grille
   - Non → continuer

3. **Le portrait est-il vraiment le meilleur format ou une facilité ?**
   - Si je peux raconter la même chose en landscape avec une mise en page différente, le faire
   - Si la verticalité est vraiment essentielle au message (processus linéaire, stack empilé), alors 4:5 est justifié

---

## 💡 Recommandation éditoriale

Pour un article standard du blog 5PennyAi :

- **1 header** (16:9 landscape) — généré par la skill `nano-banana-header`
- **0 à 2 infographies inline** :
  - Si 2 infographies : **varier les formats** (une 16:9 + une 4:5 par exemple)
  - Si 1 infographie : privilégier **16:9 ou 3:2** pour ne pas dominer l'article
- **Jamais** 3+ infographies portrait 4:5 dans le même article (effet de scroll infini)

---

## 📋 Format à déclarer dans le prompt Nano Banana

Le prompt doit spécifier le format explicitement. Exemples :

**16:9 Landscape** :
> "Aspect ratio 16:9 landscape, dimensions approximately 1920x1080."

**3:2 Landscape** :
> "Aspect ratio 3:2 landscape, dimensions approximately 1500x1000."

**1:1 Square** :
> "Aspect ratio 1:1 square, dimensions approximately 1200x1200."

**4:5 Portrait** :
> "Aspect ratio 4:5 portrait, dimensions approximately 1200x1500."

**Important** : cohérence entre le format déclaré dans le prompt ET le paramètre `aspect_ratio` de l'API Gemini. Les deux doivent correspondre sinon Nano Banana peut produire une image mal cadrée.

---

## 🔄 Retour d'expérience 5PennyAi

**Apprentissage** (validé sur plusieurs articles) :

- **Le 4:5 portrait était surutilisé** dans les premières versions → résultait en articles dominés visuellement par les infographies
- **Le 16:9 et 3:2 landscape** s'intègrent beaucoup mieux dans le flux textuel
- **Le carré 1:1** est sous-exploité mais excellent pour le partage social

**Pour cette raison**, cette skill **privilégie maintenant le landscape par défaut** et demande une justification explicite pour choisir le portrait.
