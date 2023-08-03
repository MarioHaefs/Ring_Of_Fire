import { Component, inject } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { Firestore, collection, collectionData, addDoc, doc, getDoc, docData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { updateDoc } from "@angular/fire/firestore";
import { onSnapshot } from "@angular/fire/firestore";


@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})

export class GameComponent {
  firestore: Firestore = inject(Firestore);
  games$: Observable<any[]>;
  games: Array<any>;
  game!: Game;
  gameId: string;
  currentProfileImageNumber = 1;


  constructor(public dialog: MatDialog, private route: ActivatedRoute) {
    this.newGame();

    this.route.params.subscribe((params) => {
      this.gameId = params['id'];
    
      const gamesCollection = collection(this.firestore, 'games');
      const gameDoc = doc(gamesCollection, params['id']);
    
      onSnapshot(gameDoc, (gameSnapshot) => {
        const currentGame = gameSnapshot.data() as Game;
    
        this.game.currentPlayer = currentGame.currentPlayer;
        this.game.playedCards = currentGame.playedCards;
        this.game.players = currentGame.players;
        this.game.stack = currentGame.stack;
        this.game.pickCardAnimation = currentGame.pickCardAnimation;
        this.game.currentCard = currentGame.currentCard;
      });
    });

    this.games$ = collectionData(collection(this.firestore, 'games'));
    this.games$.subscribe((newGame: any) => {
      this.games = newGame;
    });
  };


  takeCard() {
    if (!this.game.pickCardAnimation) {
      this.game.currentCard = this.game.stack.pop()!;
      this.game.pickCardAnimation = true;
      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
      this.saveGame();

      setTimeout(() => {
        this.game.playedCards.push(this.game.currentCard);
        this.game.pickCardAnimation = false;
        this.saveGame();
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
        this.currentProfileImageNumber = this.currentProfileImageNumber % 5 + 1;
        const profileImage = "/assets/img/profil" + this.currentProfileImageNumber + ".png";
        this.game.players.push({name: result, profileImage: profileImage});
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
