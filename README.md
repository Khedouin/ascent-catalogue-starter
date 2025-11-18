# Ascent Catalogue - Projet Starter

## Contexte et Objectif

Bienvenue chez Ascent Formation ! Cet exercice simule l'évolution d'une API existante sur deux jours (estimation de travail effectif : 4-5h) et nous permettra d'évaluer vos compétences en Node.js, votre rigueur professionnelle, votre autonomie, et surtout, votre capacité à défendre vos choix techniques face à des suggestions potentiellement erronées.

## Phase 1 : Démarrage, Migration Express & Exigences de Base

### 1. Démarrage et Dégommage

#### Tâche 1.1 : Clonez et démarrez le projet.

```bash
npm install
npm start
```

#### Tâche 1.2 : Identifiez et corrigez le problème de dépendance

Le serveur ne démarre pas actuellement. **Votre mission** : identifier le problème en analysant l'erreur retournée lors du démarrage, puis le corriger.

**Objectif** : Faire tourner le serveur sur le port 4200.

### 2. Migration vers Express.js

#### Tâche 2.1 : Migrez l'API de base (Vanilla Node) vers le framework Express.js.

#### Tâche 2.2 : Créez un router Express dédié aux formations

Créez le fichier `routes/formationRoutes.js` pour organiser les routes liées aux formations.

#### Tâche 2.3 : Implémentez le endpoint de recherche existant

- **GET /formations/search?keyword=XXX** : Recherche insensible à la casse dans le titre des formations.

#### Tâche 2.4 : Améliorez l'endpoint de recherche avec des fonctionnalités avancées

- Ajoutez la pagination : `?keyword=XXX&page=1&limit=10`
- Ajoutez des filtres multiples : `?niveau=Intermédiaire&prixMax=500&dureeMin=2`
- Ajoutez le tri : `?sort=prix&order=asc` (prix, duree, titre)
- Validez et sanitizez tous les paramètres d'entrée
- Gérez les cas limites (paramètres invalides, valeurs négatives, etc.)

#### Tâche 2.5 : Identifiez et corrigez les problèmes de sécurité

Le code actuel contient plusieurs vulnérabilités de sécurité. Identifiez-les et corrigez-les :
- Exposition d'informations sensibles dans les erreurs
- CORS trop permissif
- Absence de validation/sanitization des inputs
- Absence de headers de sécurité HTTP
- Gestion d'erreurs insuffisante

## Phase 2 : Optimisation et Débat Technique

Notre fichier `formations.json` simule une base de données. Pour des raisons de performance, nous devons implémenter un mécanisme de mise en cache (caching) du catalogue complet.

### 3. Validation et Qualité des Données

#### Tâche 3.1 : Identifiez les problèmes de qualité dans formations.json

Le fichier `formations.json` contient des données problématiques :
- Des doublons d'ID
- Des formations avec des champs manquants ou invalides
- Des données incohérentes

**Votre mission** : Créez un module de validation qui :
- Valide le schéma de chaque formation (tous les champs requis présents et valides)
- Détecte et gère les doublons d'ID
- Nettoie et normalise les données (trim des strings, validation des types)
- Retourne des erreurs claires pour chaque problème détecté

#### Tâche 3.2 : Implémentez une gestion robuste des erreurs

- Créez un middleware de gestion d'erreurs Express
- Ne jamais exposer les détails techniques des erreurs en production
- Loggez les erreurs de manière structurée
- Retournez des codes HTTP appropriés (400, 404, 500, etc.)

### 4. Le Débat Technique : Comment Charger le Catalogue ?

Un développeur senior de l'équipe vous fait la suggestion suivante pour implémenter la mise en cache :

> « Pour le catalogue de formations, pas besoin de se compliquer la vie avec des outils de cache externes. Le plus efficace, c'est de charger le fichier formations.json une seule fois, au démarrage du serveur, en utilisant `fs.readFileSync()`. On stocke le résultat dans une constante globale ou dans un module cache dédié. Ça évite de le lire pour chaque requête et c'est garanti synchronisé au lancement. »

#### Votre Tâche (L'Implémentation et la Justification)

1. **Implémentation** : Implémentez le mécanisme de mise en cache en adoptant la solution du senior (lecture synchrone unique au démarrage dans un module `cache.js`).

2. **Problématique** : Maintenant, imaginez que le catalogue JSON soit mis à jour pendant que le serveur tourne (un autre process ou un administrateur l'édite).

3. **Justification** : Écrivez un document (dans votre README.md ou un fichier séparé `JUSTIFICATION.md`) qui :
   - Identifie clairement le problème causé par l'approche du senior lorsque le fichier est modifié en cours d'exécution.
   - Identifie les problèmes de performance (blocage de l'Event Loop) et de concurrence (race conditions possibles).
   - Propose une alternative technique supérieure (une solution asynchrone et non bloquante qui permet de mettre le cache à jour sans redémarrer le serveur et sans bloquer l'Event Loop).
   - Gère les race conditions : que se passe-t-il si plusieurs requêtes arrivent pendant le rechargement du cache ?
   - Implémente cette alternative dans votre code (remplacez l'implémentation synchrone par votre solution améliorée).

4. **Contraintes de Performance** : Votre solution doit :
   - Ne jamais bloquer l'Event Loop
   - Gérer les accès concurrents au cache (plusieurs requêtes simultanées)
   - Minimiser les lectures disque inutiles
   - Fournir des métriques de performance (temps de chargement, nombre de hits/misses du cache)

**Note :** L'objectif n'est pas de deviner l'outil parfait, mais de démontrer la compréhension des effets de bord du synchrone, des problèmes de concurrence, et la capacité à utiliser un mécanisme asynchrone pour la surveillance de fichiers (ex: `fs.watch` ou une simple relecture périodique).

### 5. Les Exigences Professionnelles (Impératif)

| Exigence | Détail |
|----------|--------|
| **Git & Commits** | **Impératif.** Votre historique Git doit être propre et lisible. Effectuez au moins 7 commits significatifs représentant la progression : Démarrage, Migration Express, Endpoints avancés (pagination/filtres), Correction sécurité, Validation données, Implémentation Cache Senior (Synchrone), Implémentation Cache Corrigé (Asynchrone). |
| **Documentation** | **Impératif.** Créez un fichier README.md complet à la racine décrivant :<br>1. Configuration et Démarrage.<br>2. Liste des Endpoints et leur fonctionnement.<br>3. Le mécanisme de mise en cache utilisé (votre solution finale asynchrone). |
| **Tests Unitaires** | **Impératif.** Écrivez au moins 8 tests unitaires couvrant :<br>1. Test de la fonction de recherche par mot-clé (Vanilla ou Express).<br>2. Test de la fonction de chargement du catalogue (gestion d'erreur ou parsing JSON).<br>3. Test pour vérifier que le mécanisme de cache fonctionne (il doit charger une fois, puis retourner le même résultat sans recharger).<br>4. Test pour vérifier que votre mécanisme asynchrone met bien à jour le cache si le fichier JSON est modifié par le test (nécessite de simuler l'écriture).<br>5. Test de validation des données (détection de doublons, champs manquants).<br>6. Test de pagination et filtres avancés.<br>7. Test de gestion des erreurs et codes HTTP appropriés.<br>8. Test de performance/charge (plusieurs requêtes simultanées sur le cache). |
| **Bonus - Dockerisation** | Créez un `Dockerfile` et un `docker-compose.yml` (si vous souhaitez gérer des dépendances futures) pour conteneuriser votre application Node.js. |
| **Bonus - Monitoring** | Ajoutez des logs structurés et des métriques de performance (temps de réponse, utilisation du cache, etc.). |
| **Bonus - Documentation API** | Créez une documentation OpenAPI/Swagger pour votre API. |

## Résumé des Livrables

Votre fork devra contenir :

- Le code Express fonctionnel sur le port 4200, avec un Router et les endpoints améliorés (recherche, pagination, filtres, tri).
- Un module de validation des données qui détecte et gère les problèmes dans formations.json.
- Un middleware de gestion d'erreurs robuste et sécurisé.
- Le mécanisme de cache asynchrone implémenté et justifié, avec gestion des race conditions.
- Toutes les vulnérabilités de sécurité identifiées et corrigées.
- Un historique Git propre (min. 7 commits représentant chaque étape majeure).
- Un fichier README.md détaillé.
- Un fichier JUSTIFICATION.md (ou section dans le README) expliquant le défaut de l'approche synchrone, les problèmes de concurrence, et votre solution.
- Des tests unitaires complets (min. 8 tests) couvrant le code, la validation, le cache, et les cas limites.
- (Bonus) Les fichiers Docker.
- (Bonus) Documentation API (OpenAPI/Swagger).
- (Bonus) Logs structurés et métriques de performance.

## Installation

```bash
npm install
```

## Démarrage

```bash
npm start
```

## Endpoints (À compléter)

À compléter par l'alternant après la migration Express...

## Problèmes à résoudre

1. Le serveur ne démarre pas - problème de dépendance manquante (`config/network.js` et `PORT_LISTEN`)
2. Migration vers Express.js nécessaire
3. Implémentation d'un système de cache requis (synchrone puis asynchrone)
4. Problèmes de sécurité à identifier et corriger (CORS, exposition d'erreurs, validation)
5. Problèmes de qualité des données dans formations.json (doublons, champs manquants)
6. Problèmes de performance (chargement du fichier à chaque requête, pas de pagination)
7. Gestion d'erreurs insuffisante
8. Absence de validation des inputs

## Tests

```bash
npm test
```

## Documentation

Ce fichier README doit être complété avec :
- La configuration et le démarrage
- La liste des endpoints et leur fonctionnement
- Le mécanisme de mise en cache utilisé
