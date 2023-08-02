import { Component, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Firestore, collection, collectionData, addDoc, doc, getDoc, getDocs, query, where, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { updateDoc } from "@angular/fire/firestore";

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
  gameId: string;


  constructor(public dialog: MatDialog, private route: ActivatedRoute) {
    this.newGame();

    this.route.params.subscribe(async (params) => {
      this.gameId = params['id'];

      const gamesCollection = collection(this.firestore, 'games');
      const gameDoc = doc(gamesCollection, params['id']);
      const gameSnapshot = await getDoc(gameDoc);



      const currentGame = gameSnapshot.data() as Game;

      this.game.currentPlayer = currentGame.currentPlayer;
      this.game.playedCards = currentGame.playedCards;
      this.game.players = currentGame.players;
      this.game.stack = currentGame.stack;

      console.log('Current Game:', currentGame);
    });

    this.games$ = collectionData(collection(this.firestore, 'games'));
    this.games$.subscribe((newGame: any) => {
      this.games = newGame;
    });
  };


  takeCard() {
    if (!this.pickCardAnimation) {
      this.currentCard = this.game.stack.pop()!;
      this.pickCardAnimation = true;
      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
      this.saveGame();

      setTimeout(() => {
        this.game.playedCards.push(this.currentCard);
        this.saveGame();
        this.pickCardAnimation = false;
      }, 1000)
    }
  }


  newGame() {
    this.game = new Game();
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.length > 0) {
        this.game.players.push(result);
        this.saveGame();
      }
    });
  }


  async saveGame() {
    const saveGame = collection(this.firestore, 'games');
    const saveGameDoc = doc(saveGame, this.gameId);

    await updateDoc(saveGameDoc, this.game.toJson());
  }

}
