//1. **Test de distribution des cartes**  
   let deck = new Deck();
   deck.melanger();
   let cartes = deck.distribuer();
   assert(cartes.length === 2, 'Le joueur doit recevoir 2 cartes.');

//2. **Test du calcul de la main**  
   let main = ['AS', 'KS', 'QS', 'JS', '10S']; // Exemple d'une Quinte Flush Royale
   let resultat = calculerMain(main);
   assert(resultat === 'Quinte Flush Royale', 'La main doit être identifiée comme Quinte Flush Royale.');

//3. **Test de la fonction d’affichage**  
   afficherCartes(['AS', '10D']);
   let element = document.getElementById('cartes-joueur');
   assert(element.innerHTML.includes('AS'), 'L’affichage doit contenir "AS".');

//4. **Test de gestion des mises**  
   let potInitial = 100;
   let nouveauPot = gererMise(50, potInitial);
   assert(nouveauPot === 150, 'Le pot doit être correctement mis à jour.');

//5. **Test de l’action du joueur**  
   let joueur = new Player('Test');
   gererAction('fold', joueur);
   assert(joueur.status === 'folded', 'Le statut du joueur doit être mis à jour après avoir passé.');