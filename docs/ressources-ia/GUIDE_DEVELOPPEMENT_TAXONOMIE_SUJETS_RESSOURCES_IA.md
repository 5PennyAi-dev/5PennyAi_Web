# Guide de développement — Taxonomie des sujets Ressources IA

## Architecture cible

Les Articles et Infographies sont classifiés exclusivement par `resource_topics` et
`resource_topic_memberships`. Un membership est administré explicitement après la
création de la ressource ; une ressource peut avoir plusieurs sujets, mais en pratique
doit rester peu classifiée.

Les Topics sont des domaines durables. Ils ne sont ni de simples synonymes, ni des
outils individuels créés automatiquement. Les neuf sujets, leurs slugs et leurs
memberships existants ne sont pas modifiés par un import ou par une recherche.

## Responsabilités éditoriales

- **Topics** : classification des Articles et Infographies.
- **Keywords** : recherche, synonymes et vocabulaire libre ; ils ne créent aucun
  membership.
- **Séries** : collections éditoriales ordonnées, indépendantes des Topics.
- **Prompts** : `category`, `contexts`, `level` et `keywords`, sans Topic.

## Administration, RLS et brouillons

Les memberships sont gérés dans l’administration Ressources IA par le bloc « Sujets
associés ». Une ressource doit d’abord être enregistrée. Les lectures publiques ne
révèlent que les memberships de ressources publiées ; l’administration applique ses
contrôles existants aux brouillons.

## Public et recherche

Le catalogue public charge les Topics et memberships en lot. Ses filtres et compteurs
partent uniquement des memberships. La recherche indexe titre, sous-titre, résumé,
keywords, noms de Topics et noms de Séries lorsqu’ils sont présents.

Les URLs `?sujet=` utilisent les slugs canoniques. Les anciens slugs publics restent
normalisés côté client vers le sujet canonique ou retirent le filtre lorsqu’aucun
remplacement n’existe ; ils ne constituent pas une seconde source de vérité.

## Imports JSON

Les JSON servent au contenu éditorial, pas à la classification : ils ne contiennent ni
`topic`, ni `topics`, ni IDs ou memberships. Les anciens fichiers portant `theme`
restent importables avec un avertissement `legacyThemeIgnored`; ils ne modifient jamais
les memberships.

## Gouvernance

Créer un Topic est une décision éditoriale explicite. Ne pas inférer de Topics depuis
les keywords, un outil cité ou un import. Aucune limite DB « maximum trois sujets »
n’est imposée.
