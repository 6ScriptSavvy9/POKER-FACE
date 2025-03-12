## 1. Cahier des charges

### Exercice 1.1 – Contexte du projet  
**Pourquoi ce projet est réalisé et dans quel but ?**  
Le projet nommée POKER-FACE est réalisé dans le cadre du cours de NSI afin de mettre en pratique les notions de gestion de projet et de développement web. Le but est de créer un jeu de Poker avec les règles du Poker Texas Hold'em, permettant à un joueur de découvrir la stratégie et les règles du Poker, tout en développant des compétences en HTML, CSS et JavaScript.  
  
### Exercice 1.2 – Objet  
**Définition brève du projet :**  
POKER-FACE est une application web (jeu) qui simule une partie de Poker. L’utilisateur peut jouer contre des bots ou, dans une version évoluée, contre d’autres joueurs. Les attendus incluent une interface intuitive, la gestion des différentes phases de jeu (préflop, flop, turn, river) et un système de mise et de détermination du gagnant.  

### Exercice 1.3 – Organisation  
**Choix du rôle :**  
Pour ce projet, c'est Léni qui assure le rôle de **Chef de projet**. (C'est dailleurs pour ça qu'on a pas fini),

Noam est le **Maitre du temps**,

Et Matias le **Contrôleur de qualité**

### Exercice 1.4 – Environnement  
**Besoins fonctionnels du projet :**  
- **Outils de programmation :**  
  - HTML, CSS, JavaScript  
- **Paradigme de programmation :**  
  - Programmation orientée objet (pour modéliser le jeu, les joueurs, le paquet de cartes) et éventuellement du style fonctionnel pour certaines opérations.  
- **Support de stockage :**  
  - Fichiers locaux avec gestion via un dépôt Git (GitHub)  
- **Bibliothèques / Extensions :**  
  - Possibilité d’utiliser des frameworks CSS (ex. : Bootstrap) ou des bibliothèques JavaScript pour animer l’interface.  
- **Environnement de développement :**  
  - Un éditeur de code (VSCode, Atom, etc.) et un navigateur web pour tester l’application.

### Exercice 1.5 – Objectifs  
**Description détaillée des fonctionnalités attendues :**  
- **Interface utilisateur interactive :**  
  - Accueil avec saisie du pseudonyme et éventuellement sélection d’un cadre ou d’une ville.  
  - Interface de jeu avec affichage de la table, des cartes du joueur et des cartes communes, ainsi que des boutons pour les actions (miser, check, se coucher).  
- **Mécanismes de jeu :**  
  - Distribution aléatoire des cartes, gestion des différentes phases (préflop, flop, turn, river) et calcul des mains pour déterminer le gagnant.  
- **Système de mises :**  
  - Suivi des mises, du pot et de la gestion des gains.  
- **Animations et effets sonores :**  
  - Pour améliorer l’expérience utilisateur lors des transitions et actions en jeu.  
- **Documentation et tests :**  
  - Code commenté, README explicatif et scripts de tests unitaires pour les fonctions clés.

### Exercice 1.6 – Livrables  
**Ensemble des livrables attendus :**  
- **Code source complet :**  
  - Fichiers HTML, CSS, JavaScript structurés dans une arborescence cohérente.  
- **Documentation technique :**  
  - Un fichier README détaillé expliquant l’installation, l’exécution et le fonctionnement du jeu.  
- **Rapport de projet / Retour réflexif :**  
  - Document comparant le cahier des charges initial et la version finale, avec mention des difficultés rencontrées et des solutions apportées.  
- **Fichiers de tests :**  
  - Scripts ou exemples de tests unitaires  

---

## 2. Conception et réalisation

### 2.1 Conception

#### Exercice 2.1 – Interface graphique  
**Description et croquis de chaque fenêtre :**  
- **Fenêtre d’accueil :**  
  - Présente le logo du jeu, une zone de saisie pour le pseudonyme et un bouton "Démarrer".  
- **Fenêtre de sélection (facultative) :**  
  - Permet éventuellement de choisir un cadre ou une ville pour personnaliser l’expérience.  
- **Fenêtre de jeu :**  
  - Affiche la table de Poker, les cartes du joueur, les cartes communes, le pot et les boutons d’actions.  
- **Fenêtre de résultats :**  
  - Présente le résultat de la main, la main gagnante et les détails des mises.  

#### Exercice 2.2 – Fonctions principales  
**Liste des fonctions, classes et méthodes avec leur signature et une courte description :**

- **IHM / Affichage :**  
  - `function afficherCartes(cartes: Array): void`  
    *Affiche les cartes sur l’interface du joueur.*  
  - `function afficherMises(pot: number): void`  
    *Met à jour l’affichage du pot et des mises en cours.*

- **Moteur de jeu :**  
  - `function distribuerCartes(): Array`  
    *Distribue de façon aléatoire 2 cartes au joueur et aux bots.*  
  - `function calculerMain(main: Array): String`  
    *Analyse la main du joueur et retourne une description (ex. "Quinte flush", "Full", etc.).*  
  - `function determinerGagnant(players: Array): Player`  
    *Compare les mains de chaque joueur pour déterminer le gagnant de la manche.*

- **Gestion des interactions :**  
  - `function gererAction(action: String, joueur: Player): void`  
    *Exécute l’action du joueur (check, fold, raise, call) et met à jour l’état du jeu.*

- **Classes :**  
  - `class Player`  
    *Modélise un joueur avec des attributs tels que `nom`, `main`, `mise` et `status`.*  
  - `class Deck`  
    *Représente le paquet de cartes avec des méthodes comme `melanger()` et `distribuer()`.*

#### Exercice 2.3 – Architecture  
**Prévisualisation de l’arborescence de fichiers et description :**

```
POKER-FACE/
├── index.html         // Page principale qui structure l’interface du jeu.
├── style.css          // Fichier de styles définissant l’apparence et la mise en page.
├── main.js            // Logique principale du jeu : gestion des cartes, des mises et des actions.
├── images/            // Dossier contenant les images (cartes, logo, arrière-plans, etc.).
├── tests/             // Scripts de tests unitaires pour vérifier le bon fonctionnement des fonctions.
└── README.txt         // Documentation du projet : description, règles du jeu, instructions d’exécution.
```

### 2.2 Répartition des tâches

#### Exercice 2.4 – Répartition  
**Diagramme de répartition et planning prévisionnel :**

Vous pouvez représenter la répartition avec un diagramme de Gantt ou un tableau. Par exemple :

- **Semaine 1 :**  
  - *Chef de projet :* Rédaction du cahier des charges et organisation générale.  
  - *Développeur 1 :* Conception de l’interface graphique (maquettes et croquis).  
  - *Développeur 2 :* Mise en place de l’architecture de base (création des fichiers HTML, CSS, JS).

- **Semaine 2 :**  
  - *Développeur 1 :* Développement des fonctions d’affichage (IHM).  
  - *Développeur 2 :* Implémentation du moteur de jeu (distribution des cartes, calcul des mains).

- **Semaine 3 :**  
  - *Chef de projet :* Coordination et intégration des modules.  
  - *Développeurs :* Réalisation et exécution des tests unitaires, corrections des bugs identifiés.  
  - *Réunion d’équipe :* Point d’avancement et intégration des différentes parties.

- **Semaine 4 :**  
  - Finalisation du projet : Rédaction du rapport de projet, création du README.txt et retour réflexif.  
  - Réunion de synthèse pour discuter des difficultés rencontrées et des améliorations possibles.

---

## 3. Réalisation et Validation

### 2.3 Réalisation

#### Exercice 2.5 – Implémentation  
POKER-FACE est développé en HTML, CSS et JavaScript avec une architecture modulaire.  
- Le code est organisé en plusieurs fichiers (index.html, style.css, main.js) pour séparer la structure, l’apparence et la logique du jeu.  
- Chaque fonction est commentée pour en expliquer le rôle et le fonctionnement, ce qui facilite la maintenance et l’évolution du projet.  
- Les choix d’implémentation (algorithmes de mélange, distribution des cartes, etc.) ont été optimisés pour assurer de bonnes performances.

### 3. Validation

#### Exercice 3.1 – Tests  
Voici cinq exemples de tests réalisés avec l’instruction `assert` pour vérifier les post-conditions de fonctions clés :

1. **Test de distribution des cartes**  
   ```javascript
   let deck = new Deck();
   deck.melanger();
   let cartes = deck.distribuer();
   assert(cartes.length === 2, 'Le joueur doit recevoir 2 cartes.');
   ```

2. **Test du calcul de la main**  
   ```javascript
   let main = ['AS', 'KS', 'QS', 'JS', '10S']; // Exemple d'une Quinte Flush Royale
   let resultat = calculerMain(main);
   assert(resultat === 'Quinte Flush Royale', 'La main doit être identifiée comme Quinte Flush Royale.');
   ```

3. **Test de la fonction d’affichage**  
   ```javascript
   afficherCartes(['AS', '10D']);
   let element = document.getElementById('cartes-joueur');
   assert(element.innerHTML.includes('AS'), 'L’affichage doit contenir "AS".');
   ```

4. **Test de gestion des mises**  
   ```javascript
   let potInitial = 100;
   let nouveauPot = gererMise(50, potInitial);
   assert(nouveauPot === 150, 'Le pot doit être correctement mis à jour.');
   ```

5. **Test de l’action du joueur**  
   ```javascript
   let joueur = new Player('Test');
   gererAction('fold', joueur);
   assert(joueur.status === 'folded', 'Le statut du joueur doit être mis à jour après avoir passé.');
   ```

#### Exercice 3.2 – README  
**Contenu proposé pour le fichier README.txt :**

```
Voir : https://github.com/6ScriptSavvy9/POKER-FACE/blob/main/README.md
```

---