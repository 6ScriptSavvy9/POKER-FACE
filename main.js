// Variable pour indiquer si l'on doit révéler toutes les cartes à la fin du jeu
let revealAllCards = false;

// Variables de base pour le deck
const suits = ['♥', '♦', '♣', '♠'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Tableau des niveaux de ville
const cityLevels = [
  { name: "Deauville", buyIn: 1000 },
  { name: "Monte Carlo", buyIn: 5000 },
  { name: "Las Vegas", buyIn: 10000 }
];
let currentCityIndex = 0; // Niveau actuel choisi

// Variables de jeu
let players = [];            // Liste des joueurs
let currentPlayerIndex = 0;  // Index du joueur dont c'est le tour
let gameState = { deck: [], communityCards: [] };
let pot = 0;                 // Pot commun
let currentPhase = "preflop";  // "preflop", "flop", "turn", "river"
let bettingActionsCount = 0; // Compteur d'actions pendant le round de pari

// Fonctions pour naviguer entre les écrans
function goToCitySelection() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("city-selection").style.display = "block";
}

function goToLogin() {
  // Récupère la ville choisie
  const select = document.getElementById("city-select");
  currentCityIndex = parseInt(select.value);
  document.getElementById("city-selection").style.display = "none";
  document.getElementById("login").style.display = "block";
}

// Fonction pour créer le deck
function createDeck() {
  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit: suit, value: value });
    }
  }
  return deck;
}

// Fonction pour mélanger le deck (algorithme de Fisher-Yates)
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Mise à jour de l'affichage du pot
function updatePotDisplay() {
  document.getElementById("pot-display").textContent = "Pot : " + pot;
}

// Mise à jour du solde d'un joueur
function updatePlayerBalanceDisplay(player) {
  const playerDiv = document.getElementById(player.id);
  if (playerDiv) {
    playerDiv.querySelector(".balance span").textContent = player.balance;
  }
}

// Affichage des cartes d'un joueur
// - Si revealAllCards est true, on affiche les vraies cartes
// - Si un joueur est foldé, on affiche "XX"
// - Sinon, pour les bots, on affiche "??"
function displayPlayerCards(player) {
  const playerDiv = document.getElementById(player.id);
  const cardsContainer = playerDiv.querySelector(".cards");
  cardsContainer.innerHTML = "";
  player.cards.forEach(card => {
    const cardElem = document.createElement("div");
    cardElem.classList.add("card");
    if (player.folded) {
      cardElem.textContent = "XX";
    } else if (revealAllCards || player.type === "human") {
      cardElem.textContent = `${card.value} ${card.suit}`;
    } else {
      cardElem.textContent = "??";
      cardElem.title = "Carte cachée";
    }
    cardsContainer.appendChild(cardElem);
  });
}

// Affichage des cartes communes sur la table
function displayCommunityCards() {
  const communityDiv = document.getElementById("community-cards");
  communityDiv.innerHTML = "";
  gameState.communityCards.forEach(card => {
    const cardElem = document.createElement("div");
    cardElem.classList.add("card");
    cardElem.textContent = `${card.value} ${card.suit}`;
    communityDiv.appendChild(cardElem);
  });
}

// Mise à jour de l'information du tour et mise en évidence du joueur actif
function updateTurnInfo() {
  const info = document.getElementById("turn-info");
  // Retirer la classe "active" de tous
  players.forEach(p => {
    const pDiv = document.getElementById(p.id);
    if (pDiv) pDiv.classList.remove("active");
  });
  // Ajouter la classe "active" au joueur actuel
  const currentPlayer = players[currentPlayerIndex];
  const currentDiv = document.getElementById(currentPlayer.id);
  if (currentDiv) currentDiv.classList.add("active");
  
  if (currentPlayer.folded) {
    info.textContent = `${currentPlayer.pseudo} est couché.`;
  } else {
    info.textContent = `C'est au tour de ${currentPlayer.pseudo} (${currentPlayer.type})`;
  }
}

// Retourne le nombre de joueurs actifs (non foldés)
function activePlayersCount() {
  return players.filter(p => !p.folded).length;
}

// Initialisation du jeu après saisie du pseudonyme
function initGame() {
  const pseudoInput = document.getElementById("username");
  const userPseudo = pseudoInput.value.trim() || "Joueur";
  
  // Ordre de jeu souhaité : Matias, Noam, Maxence, Léni, Julian, Utilisateur
  // Nous réorganisons donc le tableau en conséquence.
  players = [
    { id: "bot1", pseudo: "Noam", type: "bot", balance: cityLevels[currentCityIndex].buyIn, cards: [], folded: false },
    { id: "bot4", pseudo: "Maxence", type: "bot", balance: cityLevels[currentCityIndex].buyIn, cards: [], folded: false },
    { id: "bot3", pseudo: "Matias", type: "bot", balance: cityLevels[currentCityIndex].buyIn, cards: [], folded: false },
    { id: "bot2", pseudo: "Léni", type: "bot", balance: cityLevels[currentCityIndex].buyIn, cards: [], folded: false },
    { id: "bot5", pseudo: "Julian", type: "bot", balance: cityLevels[currentCityIndex].buyIn, cards: [], folded: false },
    { id: "user", pseudo: userPseudo, type: "human", balance: cityLevels[currentCityIndex].buyIn, cards: [], folded: false }
  ];

  // Mettre à jour l'affichage de chaque joueur
  players.forEach(player => {
    const playerDiv = document.getElementById(player.id);
    if (playerDiv) {
      playerDiv.querySelector(".pseudonym").textContent = player.pseudo;
      playerDiv.querySelector(".balance span").textContent = player.balance;
      playerDiv.querySelector(".cards").innerHTML = "";
      player.folded = false;
      playerDiv.classList.remove("active", "winner");
    }
  });
  
  // Cacher les écrans précédents et afficher l'interface de jeu
  document.getElementById("login").style.display = "none";
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("city-selection").style.display = "none";
  document.getElementById("game-container").style.display = "block";

  // Met à jour le décor de la table avec le fond "decors_poker1.png"
  document.getElementById("table").style.backgroundImage = "url('images/decors_poker1.png')";

  // Démarrage de la musique de fond
  const bgMusic = document.getElementById("bg-music");
  bgMusic.volume = document.getElementById("volume-slider").value / 100;
  bgMusic.play();

  // Initialisation du deck et du pot
  gameState.deck = shuffleDeck(createDeck());
  gameState.communityCards = [];
  pot = 0;
  updatePotDisplay();
  
  // Distribution de 2 cartes à chaque joueur
  players.forEach(player => {
    player.cards = gameState.deck.splice(0, 2);
    displayPlayerCards(player);
  });

  // Début du round préflop
  currentPhase = "preflop";
  bettingActionsCount = 0;
  currentPlayerIndex = players.findIndex(p => !p.folded);
  updateTurnInfo();
  processTurn();

  // Mise à jour en temps réel du curseur de mise
  document.getElementById("bet-slider").addEventListener("input", function() {
    document.getElementById("bet-amount-display").textContent = this.value;
  });

  // Contrôle du volume
  document.getElementById("volume-slider").addEventListener("input", function() {
    bgMusic.volume = this.value / 100;
  });
}

// Gestion du tour de jeu pour le joueur actif
function processTurn() {
  if (players[currentPlayerIndex].folded) {
    nextTurn();
    return;
  }
  
  updateTurnInfo();
  const currentPlayer = players[currentPlayerIndex];
  
  if (currentPlayer.type === "bot") {
    setTimeout(() => {
      const actions = ['bet', 'check', 'fold'];
      const decision = actions[Math.floor(Math.random() * actions.length)];
      if (decision === "bet") {
        let possibleBets = [50, 100, 150];
        let bet = possibleBets[Math.floor(Math.random() * possibleBets.length)];
        if (currentPlayer.balance >= bet) {
          currentPlayer.balance -= bet;
          pot += bet;
          updatePlayerBalanceDisplay(currentPlayer);
          updatePotDisplay();
          console.log(`${currentPlayer.pseudo} mise ${bet}.`);
        } else {
          console.log(`${currentPlayer.pseudo} n'a pas assez pour miser et check.`);
        }
      } else if (decision === "fold") {
        currentPlayer.folded = true;
        console.log(`${currentPlayer.pseudo} se couche.`);
      } else {
        console.log(`${currentPlayer.pseudo} check.`);
      }
      nextTurn();
    }, 1000);
  } else {
    document.getElementById("action-controls").style.display = "block";
    console.log(`C'est à vous de jouer, ${currentPlayer.pseudo}.`);
  }
}

// Action effectuée par le joueur humain
function humanAction(action) {
  const currentPlayer = players[currentPlayerIndex];
  if (action === "bet") {
    const bet = parseInt(document.getElementById("bet-slider").value);
    if (currentPlayer.balance >= bet) {
      currentPlayer.balance -= bet;
      pot += bet;
      updatePlayerBalanceDisplay(currentPlayer);
      updatePotDisplay();
      console.log(`${currentPlayer.pseudo} mise ${bet}.`);
    } else {
      console.log("Balance insuffisante pour miser.");
    }
  } else if (action === "fold") {
    currentPlayer.folded = true;
    console.log(`${currentPlayer.pseudo} se couche.`);
  } else if (action === "check") {
    console.log(`${currentPlayer.pseudo} check.`);
  }
  document.getElementById("action-controls").style.display = "none";
  nextTurn();
}

// Passe au joueur suivant dans le round de pari
function nextTurn() {
  bettingActionsCount++;
  if (bettingActionsCount >= activePlayersCount()) {
    console.log("Round de pari terminé.");
    bettingActionsCount = 0;
    advancePhase();
    return;
  }
  do {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  } while (players[currentPlayerIndex].folded);
  updateTurnInfo();
  processTurn();
}

// Fonction pour simuler un type de main aléatoire
function getRandomHandType() {
  const handTypes = ["Quinte Flush Royale", "Quinte Flush", "Carré", "Full", "Couleur", "Suite", "Brelan", "Double Paire", "Paire", "Carte Haute"];
  return handTypes[Math.floor(Math.random() * handTypes.length)];
}

// Avance la phase du jeu automatiquement (flop, turn, river ou showdown)
function advancePhase() {
  if (currentPhase === "preflop") {
    let flop = gameState.deck.splice(0, 3);
    gameState.communityCards = flop;
    displayCommunityCards();
    currentPhase = "flop";
  } else if (currentPhase === "flop") {
    let turn = gameState.deck.splice(0, 1);
    gameState.communityCards.push(turn[0]);
    displayCommunityCards();
    currentPhase = "turn";
  } else if (currentPhase === "turn") {
    let river = gameState.deck.splice(0, 1);
    gameState.communityCards.push(river[0]);
    displayCommunityCards();
    currentPhase = "river";
  } else if (currentPhase === "river") {
    showdown();
    return;
  }
  currentPlayerIndex = players.findIndex(p => !p.folded);
  updateTurnInfo();
  processTurn();
}

// Showdown : révèle toutes les cartes, détermine le gagnant, affiche son type de main et met en évidence le gagnant
function showdown() {
  revealAllCards = true;
  players.forEach(player => {
    displayPlayerCards(player);
  });
  const activePlayers = players.filter(p => !p.folded);
  if (activePlayers.length === 0) {
    console.log("Tous les joueurs se sont couchés.");
    alert("Tous les joueurs se sont couchés.");
    return;
  }
  const winner = activePlayers[Math.floor(Math.random() * activePlayers.length)];
  const winnerHandType = getRandomHandType();
  winner.balance += pot;
  const winnerDiv = document.getElementById(winner.id);
  if (winnerDiv) {
    winnerDiv.classList.add("winner");
  }
  alert(`${winner.pseudo} remporte le pot de ${pot} avec un(e) ${winnerHandType} !`);
  updatePlayerBalanceDisplay(winner);
  pot = 0;
  updatePotDisplay();
  document.getElementById("turn-info").textContent = "Main terminée.";

  // Vérification d'un éventuel upgrade de ville pour le joueur humain
  const userPlayer = players.find(p => p.type === "human");
  if (currentCityIndex < cityLevels.length - 1 && userPlayer.balance >= cityLevels[currentCityIndex + 1].buyIn) {
    if (confirm(`Félicitations ! Vous pouvez passer à ${cityLevels[currentCityIndex + 1].name}. Voulez-vous le faire ?`)) {
      currentCityIndex++;
      alert(`Vous passez à ${cityLevels[currentCityIndex].name}.`);
    }
  }

  // Demande à l'utilisateur s'il souhaite continuer via une équation simple
  if (promptEquation()) {
    newHand();
  } else {
    document.getElementById("turn-info").textContent = "Merci d'avoir joué !";
  }
}

// Génère une équation simple et vérifie la réponse
function promptEquation() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const reponse = prompt(`Pour continuer, résolvez : ${a} + ${b} = ?`);
  return parseInt(reponse) === a + b;
}

// Démarre une nouvelle main tout en conservant les soldes actuels
function newHand() {
  revealAllCards = false;
  gameState.deck = shuffleDeck(createDeck());
  gameState.communityCards = [];
  updatePotDisplay();
  players.forEach(player => {
    player.folded = false;
    player.cards = gameState.deck.splice(0, 2);
    displayPlayerCards(player);
    const pDiv = document.getElementById(player.id);
    if (pDiv) pDiv.classList.remove("winner", "active");
  });
  displayCommunityCards();
  currentPhase = "preflop";
  bettingActionsCount = 0;
  currentPlayerIndex = players.findIndex(p => !p.folded);
  updateTurnInfo();
  processTurn();
}

// Fonction pour afficher/masquer l'encart des mains possibles
function toggleHandsInfo() {
  const handsInfo = document.getElementById("hands-info");
  if (handsInfo.style.display === "none" || handsInfo.style.display === "") {
    handsInfo.style.display = "block";
    document.getElementById("show-hands-btn").textContent = "Masquer les mains possibles";
  } else {
    handsInfo.style.display = "none";
    document.getElementById("show-hands-btn").textContent = "Afficher les mains possibles";
  }
}
