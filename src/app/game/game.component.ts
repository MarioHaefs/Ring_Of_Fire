import { Component, inject, Renderer2, ElementRef } from '@angular/core';
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
  profileImages: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];


  constructor(public dialog: MatDialog, private route: ActivatedRoute, private renderer: Renderer2, private el: ElementRef) {
    this.newGame();


    /**
     * this code block reads the current game state from the firestore database and updates the local "this.game" instance whenever the state in the database changes
     */
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


    /**
     * this code block establishes a real-time connection to the 'games' collection in firestore and updates "this.games" every time the data in this collection changes
     */
    this.games$ = collectionData(collection(this.firestore, 'games'));
    this.games$.subscribe((newGame: any) => {
      this.games = newGame;
    });
  };


  /**
   * if theyre 2 players registered: pick a card from card stack -> play pickCardAnimaton -> select next currentPlayer -> save game in database
   */
  takeCard() {
    if (this.game.players.length < 2) {
      this.highlightCard();
    } else {

      if (!this.game.pickCardAnimation) {
        this.game.currentCard = this.game.stack.pop()!;
        this.game.pickCardAnimation = true;
        this.game.currentPlayer++;
        this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
        this.saveGame();
        this.updatePlayedCards();
      }
    }
  }


  /**
   * timeout for pickCard() animation -> push currentCard in playedCards stack -> save game in database
   */
  updatePlayedCards() {
    setTimeout(() => {
      this.game.playedCards.push(this.game.currentCard);
      this.game.pickCardAnimation = false;
      this.saveGame();
    }, 1000)
  }


  /**
   * create a new game instance
   */
  newGame() {
    this.game = new Game();
  }


  /**
   * open dialog-add-player -> save player name and assigns him a random profile picture -> save game in database
   */
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.length > 0) {
        const randomNumber = Math.floor(Math.random() * this.profileImages.length);
        this.currentProfileImageNumber = this.profileImages[randomNumber];
        this.profileImages.splice(randomNumber, 1);

        const profileImage = "/assets/img/profil" + this.currentProfileImageNumber + ".png";
        this.game.players.push({ name: result, profileImage: profileImage });
        this.saveGame();
      }
    });
  }


  /**
   * save game in database
   */
  async saveGame() {
    const saveGame = collection(this.firestore, 'games');
    const saveGameDoc = doc(saveGame, this.gameId);

    await updateDoc(saveGameDoc, this.game.toJson());
  }


  /**
   * highlight the game-info box if there are not at least 2 players registered
   */
  highlightCard() {
    const card = this.el.nativeElement.querySelector('#highlightable');
    this.renderer.addClass(card, 'highlight');


    setTimeout(() => {
      this.renderer.removeClass(card, 'highlight');
    }, 1500);
  }
}
