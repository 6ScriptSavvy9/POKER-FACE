// Variable pour indiquer si l'on doit révéler toutes les cartes à la fin du jeu
let revealAllCards = false;

// Variables de base pour le deck
const suits = ['♥', '♦', '♣', '♠'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const cardValueMap = {
  '2': 2, '3': 3, '4': 4, '5': 5,
  '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

// Tableau des niveaux de ville
const cityLevels = [
  { name: "Deauville", buyIn: 1000 },
  { name: "Monte Carlo", buyIn: 10000 },
  { name: "Las Vegas", buyIn: 100000 },
];
let currentCityIndex = 0; // Niveau actuel choisi

// Variables de jeu
let players = [];            // Liste des joueurs
let currentPlayerIndex = 0;  // Index du joueur dont c'est le tour
let gameState = { deck: [], communityCards: [] };
let pot = 0;                 // Pot commun
let currentPhase = "preflop";  // "preflop", "flop", "turn", "river"

// Pour le tour de pari : on mémorise le dernier joueur ayant misé
let roundStartIndex = 0;
let lastAggressiveIndex = 0;

// Fonction pour démarrer le jeu
function goToCitySelection() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("city-selection").style.display = "block";
}
// Fonction pour choisir une ville et démarrer le jeu
function goToLogin() {
  const select = document.getElementById("city-select");
  currentCityIndex = parseInt(select.value);
  document.getElementById("city-selection").style.display = "none";
  document.getElementById("login").style.display = "block";
}

// Bouton Retour pour changer de ville
function backToCitySelection() {
  document.getElementById("game-container").style.display = "none";
  document.getElementById("city-selection").style.display = "block";
}

// Fonction deck de cartes
function createDeck() {
  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit: suit, value: value });
    }
  }
  return deck;
}

// Fonction pour mélanger le deck
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Mise à jour de l'affichage du pot et des soldes des joueurs
function updatePotDisplay() {
  document.getElementById("pot-display").textContent = "Pot : " + pot;
}

// Permet de gérer l'affichage des cartes des joueurs
function updatePlayerBalanceDisplay(player) {
  const playerDiv = document.getElementById(player.id);
  if (playerDiv) {
    playerDiv.querySelector(".balance span").textContent = player.balance;
  }
}

// Permet de gérer l'affichage des actions des joueurs (mise, check, fold)
function updatePlayerDecision(player) {
  const playerDiv = document.getElementById(player.id);
  const decisionDiv = playerDiv.querySelector(".decision");
  if (decisionDiv) {
    decisionDiv.textContent = player.lastAction ? "Action : " + player.lastAction : "";
  }
}

// Fonction pour afficher les cartes des joueurs (ou les cacher)
function displayPlayerCards(player) {
  const playerDiv = document.getElementById(player.id);
  const cardsContainer = playerDiv.querySelector(".cards");
  cardsContainer.innerHTML = "";

  if (revealAllCards) {
    // Affichage complet pour tout le monde
    player.cards.forEach(card => {
      let cardElem = document.createElement("div");
      cardElem.classList.add("card");
      cardElem.textContent = `${card.value} ${card.suit}`;
      cardsContainer.appendChild(cardElem);
    });
    // On cache le bord pour les cartes révélées
    cardsContainer.style.border = "none";
  } else if (player.type === "bot") {
    // Pour les IA actives, masquer les cartes
    player.cards.forEach(card => {
      let cardElem = document.createElement("div");
      cardElem.classList.add("card");
      cardElem.textContent = "??";
      cardElem.title = "Carte cachée";
      cardsContainer.appendChild(cardElem);
    });
    cardsContainer.style.border = "none";
  } else {
    // Pour le joueur humain, afficher ses cartes
    player.cards.forEach(card => {
      let cardElem = document.createElement("div");
      cardElem.classList.add("card");
      cardElem.textContent = `${card.value} ${card.suit}`;
      cardsContainer.appendChild(cardElem);
    });
    cardsContainer.style.border = "none";
  }
}
// Fonction pour afficher les cartes communes
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

// Fonctions pour gérer les tours de jeu
function updateTurnInfo() {
  const info = document.getElementById("turn-info");
  players.forEach(p => {
    const pDiv = document.getElementById(p.id);
    if (pDiv) pDiv.classList.remove("active");
  });
  const currentPlayer = players[currentPlayerIndex];
  const currentDiv = document.getElementById(currentPlayer.id);
  if (currentDiv) currentDiv.classList.add("active");
  
  if (currentPlayer.folded) {
    info.textContent = `${currentPlayer.pseudo} est couché.`;
  } else {
    info.textContent = `C'est KIKI qui joue ${currentPlayer.pseudo} (${currentPlayer.type})`;
  }
}

// Fonction pour compter le nombre de joueurs actifs
function activePlayersCount() {
  return players.filter(p => !p.folded).length;
}

// Fonction pour déterminer l'index du prochain joueur actif
function getNextActivePlayerIndex(current) {
  let next = (current + 1) % players.length;
  while (players[next].folded) {
    next = (next + 1) % players.length;
    if (next === current) break;
  }
  return next;
}

// --------------------------
// Gestion des mises
// --------------------------

// Pour les IA, on calcule la mise en fonction de la force de leur main
function getAIBetAmount(player) {
  // Si le solde est inférieur à 50, on mise tout (all in)
  if (player.balance < 50) return player.balance;

  let handEval = getBestHand(player.cards, gameState.communityCards);
  // Si en préflop (ou autre cas où on ne peut pas évaluer), utiliser une évaluation par défaut (faible)
  if (!handEval) {
    handEval = { rank: 1 };
  }
  
  // Déterminer un pourcentage en fonction de la force de la main
  let percentage = 0.10; // Valeur par défaut (10%)
  if (handEval.rank >= 6) {
    percentage = 0.5; // Très forte main → 50%
  } else if (handEval.rank >= 3) {
    percentage = 0.3; // Bonne main → 30%
  } else if (handEval.rank >= 1) {
    percentage = 0.15; // Main correcte → 15%
  }
  // Calcul de la mise en fonction du pourcentage et du solde
  let bet = Math.floor(player.balance * percentage);
  bet = Math.max(100, Math.min(bet, 100000, player.balance));
  return bet;
}



// --------------------------
// Initialisation du jeu
// --------------------------
function initGame() {
  const pseudoInput = document.getElementById("username");
  const userPseudo = pseudoInput.value.trim() || "Joueur";
  
  // Définition des joueurs
  players = [
    { id: "bot1", pseudo: "Matias", type: "bot", balance: cityLevels[currentCityIndex].buyIn, cards: [], folded: false },
    { id: "bot2", pseudo: "Noam", type: "bot", balance: cityLevels[currentCityIndex].buyIn, cards: [], folded: false },
    { id: "bot3", pseudo: "Maxence", type: "bot", balance: cityLevels[currentCityIndex].buyIn, cards: [], folded: false },
    { id: "bot4", pseudo: "Léni", type: "bot", balance: cityLevels[currentCityIndex].buyIn, cards: [], folded: false },
    { id: "bot5", pseudo: "Julian", type: "bot", balance: cityLevels[currentCityIndex].buyIn, cards: [], folded: false },
    { id: "user", pseudo: userPseudo, type: "human", balance: cityLevels[currentCityIndex].buyIn, cards: [], folded: false }
  ];

  // Mise à jour de l'affichage des joueurs
  players.forEach(player => {
    const playerDiv = document.getElementById(player.id);
    if (playerDiv) {
      playerDiv.querySelector(".pseudonym").textContent = player.pseudo;
      playerDiv.querySelector(".balance span").textContent = player.balance;
      playerDiv.querySelector(".cards").innerHTML = "";
      player.folded = false;
      playerDiv.classList.remove("active", "winner");
      // Ajout de la zone pour afficher l'action
      if (!playerDiv.querySelector(".decision")) {
        let decisionDiv = document.createElement("div");
        decisionDiv.classList.add("decision");
        decisionDiv.style.fontSize = "12px";
        decisionDiv.style.marginTop = "5px";
        decisionDiv.style.color = "#fff";
        playerDiv.appendChild(decisionDiv);
      }
    }
  });
  
  // Affichage de l'interface de jeu
  document.getElementById("login").style.display = "none";
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("city-selection").style.display = "none";
  document.getElementById("game-container").style.display = "block";

  const bgMusic = document.getElementById("bg-music");
  bgMusic.volume = document.getElementById("volume-slider").value / 100;
  bgMusic.play();

  gameState.deck = shuffleDeck(createDeck());
  gameState.communityCards = [];
  pot = 0;
  updatePotDisplay();
  
  players.forEach(player => {
    player.cards = gameState.deck.splice(0, 2);
    displayPlayerCards(player);
  });

  // Pour le joueur humain, adapter le max
  const userPlayer = players.find(p => p.type === "human");
  const betSlider = document.getElementById("bet-slider");
  betSlider.max = Math.min(100000, userPlayer.balance);

  // Initialisation du premier tour
  currentPhase = "preflop";
  currentPlayerIndex = players.findIndex(p => !p.folded);
  roundStartIndex = currentPlayerIndex;
  lastAggressiveIndex = currentPlayerIndex;
  
  updateTurnInfo();
  processTurn();

  // Mise à jour du slider pour afficher également le pourcentage
  betSlider.addEventListener("input", function() {
    let percentage = Math.floor((this.value / userPlayer.balance) * 100);
    document.getElementById("bet-amount-display").textContent = this.value + " (" + percentage + "%)";
  });

  document.getElementById("volume-slider").addEventListener("input", function() {
    bgMusic.volume = this.value / 100;
  });
}

// Gestion des différents tours de jeu
function processTurn() {
  // Si un seul joueur est actif, on déclenche directement le showdown
  if (activePlayersCount() === 1) {
    console.log("Un seul joueur restant, showdown automatique.");
    showdown();
    return;
  }
  
  if (players[currentPlayerIndex].folded) {
    nextTurn();
    return;
  }
  
  updateTurnInfo();
  const currentPlayer = players[currentPlayerIndex];
  
  // Si c'est un bot, on déclenche son tour automatiquement
  if (currentPlayer.type === "bot") {
    setTimeout(() => {
      const actions = ['bet', 'check', 'fold'];
      const decision = actions[Math.floor(Math.random() * actions.length)];
      if (decision === "bet") {
        let bet = getAIBetAmount(currentPlayer);
        // Sauvegarde du solde avant mise pour le calcul du pourcentage
        const oldBalance = currentPlayer.balance;
        if (oldBalance >= bet) {
          currentPlayer.balance -= bet;
          pot += bet;
          lastAggressiveIndex = currentPlayerIndex;
          currentPlayer.lastAction = `Misé ${bet} (${Math.floor((bet/oldBalance)*100)}%)`;
          updatePlayerBalanceDisplay(currentPlayer);
          updatePotDisplay();
          console.log(`${currentPlayer.pseudo} mise ${bet}.`);
        } else {
          currentPlayer.lastAction = "Check (solde insuffisant)";
          console.log(`${currentPlayer.pseudo} n'a pas assez pour miser et check.`);
        }
      } else if (decision === "fold") {
        currentPlayer.folded = true;
        currentPlayer.lastAction = "Se couche";
        console.log(`${currentPlayer.pseudo} se couche.`);
      } else {
        currentPlayer.lastAction = "Check";
        console.log(`${currentPlayer.pseudo} check.`);
      }
      updatePlayerDecision(currentPlayer);
      nextTurn();
    }, 1000);
  } else {
    document.getElementById("action-controls").style.display = "block";
    console.log(`C'est à vous de jouer, ${currentPlayer.pseudo}.`);
  }
}

// Fonction pour gérer les actions du joueur humain
function humanAction(action) {
  const currentPlayer = players[currentPlayerIndex];
  const betSlider = document.getElementById("bet-slider");
  if (action === "bet") {
    let bet = parseInt(betSlider.value);
    const oldBalance = currentPlayer.balance;
    if (oldBalance >= bet) {
      currentPlayer.balance -= bet;
      pot += bet;
      currentPlayer.lastAction = `Misé ${bet} (${Math.floor((bet/oldBalance)*100)}%)`;
      lastAggressiveIndex = currentPlayerIndex;
      updatePlayerBalanceDisplay(currentPlayer);
      updatePotDisplay();
      console.log(`${currentPlayer.pseudo} mise ${bet}.`);
    } else {
      currentPlayer.lastAction = "Mise impossible (solde insuffisant)";
      console.log("Balance insuffisante pour miser.");
    }
  } else if (action === "fold") {
    currentPlayer.folded = true;
    currentPlayer.lastAction = "Se couche";
    console.log(`${currentPlayer.pseudo} se couche.`);
  } else if (action === "check") {
    currentPlayer.lastAction = "Check";
    console.log(`${currentPlayer.pseudo} check.`);
  }
  updatePlayerDecision(currentPlayer);
  document.getElementById("action-controls").style.display = "none";
  nextTurn();
}

function nextTurn() {
  // Si un seul joueur reste, déclencher showdown
  if (activePlayersCount() === 1) {
    console.log("Un seul joueur restant, showdown automatique.");
    showdown();
    return;
  }
  let nextIndex = getNextActivePlayerIndex(currentPlayerIndex);
  if (nextIndex === lastAggressiveIndex) {
    console.log("Round de pari terminé.");
    advancePhase();
    return;
  }
  currentPlayerIndex = nextIndex;
  updateTurnInfo();
  processTurn();
}

// Fonction pour avancer à la phase suivante (flop, turn, river)
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
  roundStartIndex = currentPlayerIndex;
  lastAggressiveIndex = currentPlayerIndex;
  updateTurnInfo();
  processTurn();
}

// Fonction pour déclencher le showdown et déterminer le gagnant
function showdown() {
  revealAllCards = true;
  players.forEach(player => {
    displayPlayerCards(player);
  });
  const activePlayers = players.filter(p => !p.folded);
  // Si tous se sont couchés, le dernier à ne pas avoir foldé gagne LA MANCHE eT NON PAS LA MER
  if (activePlayers.length === 0) {
    // On récupère le dernier joueur ayant joué (par exemple, celui juste avant le prochain indice)
    let lastPlayer = players[(currentPlayerIndex - 1 + players.length) % players.length];
    activePlayers.push(lastPlayer);
  }
  // On évalue les mains de chaque joueur
  let bestHand = null;
  let winner = null;
  activePlayers.forEach(player => {
    const bestEvaluation = getBestHand(player.cards, gameState.communityCards);
    player.bestHand = bestEvaluation;
    if (!bestHand || compareHands(bestEvaluation, bestHand) > 0) {
      bestHand = bestEvaluation;
      winner = player;
    }
  });
  // On détermine le gagnant et on lui attribue le pot
  winner.balance += pot;
  updatePlayerBalanceDisplay(winner);
  const winnerDiv = document.getElementById(winner.id);
  if (winnerDiv) {
    winnerDiv.classList.add("winner");
  }
  alert(`${winner.pseudo} remporte le pot de ${pot} avec ${winner.bestHand.name} !`);
  pot = 0;
  updatePotDisplay();
  // On affiche la main de l'utilisateur
  const userPlayer = players.find(p => p.type === "human");
  if (userPlayer && !userPlayer.folded) {
    const userHandEval = getBestHand(userPlayer.cards, gameState.communityCards);
    alert(`Votre main : ${userHandEval.name}`);
  }
  
  // On vérifie si le joueur veut continuer
  if (promptEquation()) {
    newHand();
  } else {
    document.getElementById("turn-info").textContent = "Merci d'avoir joué !";
  }
}

// On demande une équation pour continuer
function promptEquation() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const reponse = prompt(`Pour continuer, résolvez : ${a} + ${b} = ?`);
  return parseInt(reponse) === a + b;
}

// Attribution du pot au gagnant et démarrage d'une nouvelle main
function newHand() {
  revealAllCards = false;
  gameState.deck = shuffleDeck(createDeck());
  gameState.communityCards = [];
  updatePotDisplay();
  players.forEach(player => {
    player.folded = false;
    player.cards = gameState.deck.splice(0, 2);
    player.lastAction = "";
    displayPlayerCards(player);
    updatePlayerDecision(player);
    const pDiv = document.getElementById(player.id);
    if (pDiv) pDiv.classList.remove("winner", "active");
  });
  displayCommunityCards();
  currentPhase = "preflop";
  currentPlayerIndex = players.findIndex(p => !p.folded);
  roundStartIndex = currentPlayerIndex;
  lastAggressiveIndex = currentPlayerIndex;
  updateTurnInfo();
  processTurn();
}

// --------------------------
// Fonctions d'évaluation des mains
// --------------------------
function combinations(arr, k) {
  let i, sub, ret = [];
  if (k === 0) return [[]];
  for (i = 0; i < arr.length; i++) {
    sub = combinations(arr.slice(i + 1), k - 1);
    for (let j = 0; j < sub.length; j++) {
      ret.push([arr[i]].concat(sub[j]));
    }
  }
  return ret;
}

function evaluate5CardHand(hand) {
  let cardNums = hand.map(card => cardValueMap[card.value]).sort((a, b) => b - a);
  let suitsArr = hand.map(card => card.suit);
  const isFlush = suitsArr.every(s => s === suitsArr[0]);
  
  let uniqueNums = Array.from(new Set(cardNums)).sort((a, b) => b - a);
  let isStraight = false;
  let straightHigh = null;
  for (let i = 0; i <= uniqueNums.length - 5; i++) {
    let slice = uniqueNums.slice(i, i + 5);
    if (slice[0] - slice[4] === 4) {
      isStraight = true;
      straightHigh = slice[0];
      break;
    }
  }
  if (!isStraight && uniqueNums.includes(14) && uniqueNums.includes(2) && uniqueNums.includes(3) && uniqueNums.includes(4) && uniqueNums.includes(5)) {
    isStraight = true;
    straightHigh = 5;
  }
  
  let counts = {};
  cardNums.forEach(num => { counts[num] = (counts[num] || 0) + 1; });
  let countValues = Object.values(counts).sort((a, b) => b - a);
  
  if (isFlush && isStraight && straightHigh === 14) {
    return { rank: 10, name: "Quinte Flush Royale", tiebreakers: [straightHigh] };
  }
  if (isFlush && isStraight) {
    return { rank: 9, name: "Quinte Flush", tiebreakers: [straightHigh] };
  }
  if (countValues[0] === 4) {
    let fourValue = parseInt(Object.keys(counts).find(key => counts[key] === 4));
    let kicker = Math.max(...Object.keys(counts).filter(key => counts[key] !== 4).map(Number));
    return { rank: 8, name: "Carré", tiebreakers: [fourValue, kicker] };
  }
  if (countValues[0] === 3 && countValues[1] >= 2) {
    let threeValue = parseInt(Object.keys(counts).find(key => counts[key] === 3));
    let pairValue = Math.max(...Object.keys(counts).filter(key => counts[key] >= 2 && parseInt(key) !== threeValue).map(Number));
    return { rank: 7, name: "Full", tiebreakers: [threeValue, pairValue] };
  }
  if (isFlush) {
    return { rank: 6, name: "Couleur", tiebreakers: cardNums };
  }
  if (isStraight) {
    return { rank: 5, name: "Suite", tiebreakers: [straightHigh] };
  }
  if (countValues[0] === 3) {
    let threeValue = parseInt(Object.keys(counts).find(key => counts[key] === 3));
    let kickers = Object.keys(counts).filter(key => counts[key] < 3).map(Number).sort((a, b) => b - a);
    return { rank: 4, name: "Brelan", tiebreakers: [threeValue, ...kickers] };
  }
  if (countValues[0] === 2 && countValues[1] === 2) {
    let pairs = Object.keys(counts).filter(key => counts[key] === 2).map(Number).sort((a, b) => b - a);
    let kicker = Math.max(...Object.keys(counts).filter(key => counts[key] === 1).map(Number));
    return { rank: 3, name: "Double Paire", tiebreakers: [...pairs, kicker] };
  }
  if (countValues[0] === 2) {
    let pairValue = parseInt(Object.keys(counts).find(key => counts[key] === 2));
    let kickers = Object.keys(counts).filter(key => counts[key] === 1).map(Number).sort((a, b) => b - a);
    return { rank: 2, name: "Paire", tiebreakers: [pairValue, ...kickers] };
  }
  return { rank: 1, name: "Carte Haute", tiebreakers: cardNums };
}
// Fonction pour évaluer la meilleure main parmi 5 cartes
function getBestHand(handCards, communityCards) {
  let allCards = handCards.concat(communityCards);
  let comb = combinations(allCards, 5);
  let bestEval = null;
  comb.forEach(hand => {
    let evalHand = evaluate5CardHand(hand);
    if (!bestEval || compareHands(evalHand, bestEval) > 0) {
      bestEval = evalHand;
    }
  });
  return bestEval;
}
// Fonction pour comparer deux mains et déterminer laquelle est la plus forte
function compareHands(handA, handB) {
  if (handA.rank > handB.rank) return 1;
  if (handA.rank < handB.rank) return -1;
  for (let i = 0; i < Math.min(handA.tiebreakers.length, handB.tiebreakers.length); i++) {
    if (handA.tiebreakers[i] > handB.tiebreakers[i]) return 1;
    if (handA.tiebreakers[i] < handB.tiebreakers[i]) return -1;
  }
  return 0;
}