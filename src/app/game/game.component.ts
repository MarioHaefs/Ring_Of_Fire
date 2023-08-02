import { Component, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Firestore, collection, collectionData, addDoc, doc, getDoc, getDocs, query, where, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})

export class GameComponent {
  firestore: Firestore = inject(Firestore);
  games$: Observable<any[]>;
  games: Array<any>;
  pickCardAnimation = false;
  currentCard: string = '';
  game!: Game;


  constructor(public dialog: MatDialog, private route: ActivatedRoute) {
    this.newGame();
  
    this.route.params.subscribe((params) => {
      const gameId = params['id'];
      console.log(gameId);
  
      const gamesCollection = collection(this.firestore, 'games');
      const gameDoc = doc(gamesCollection, gameId);
  
      getDoc(gameDoc)
        .then((gameSnapshot) => {
          const currentGame = gameSnapshot.data() as Game;
  
          currentGame.currentPlayer = this.game.currentPlayer;
          currentGame.playedCards = this.game.playedCards;
          currentGame.players = this.game.players;
          currentGame.stack = this.game.stack;
  
          console.log('Dieses Spiel', currentGame);
          console.log('Spieler', currentGame.players);
        })
    });
  
    this.games$ = collectionData(collection(this.firestore, 'games'));
    this.games$.subscribe((newGame: any) => {
      this.games = newGame;
    });
  }
  


  ngOnInit(): void {
  }


  takeCard() {
    if (!this.pickCardAnimation) {
      this.currentCard = this.game.stack.pop()!;
      this.pickCardAnimation = true;
      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;

      setTimeout(() => {
        this.game.playedCards.push(this.currentCard);
        this.pickCardAnimation = false;
      }, 1000)
    }
  }


  newGame() {
    this.game = new Game();
    console.log('In der Funktion newGame', this.game)
    // let addNewGameToFirebase = collection(this.firestore, 'games');
    // addDoc(addNewGameToFirebase, this.game.toJson());
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.length > 0) {
        this.game.players.push(result);
      }
    });
  }

}
