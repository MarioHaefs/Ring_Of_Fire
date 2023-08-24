import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Game } from 'src/models/game';


@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})


export class StartScreenComponent {
  firestore: Firestore = inject(Firestore);
  game!: Game;


  constructor(private router: Router) { }


  /**
   * create new game instance and lead to url
   */
  async newGame() {
    this.game = new Game();
    let addNewGameToFirebase = collection(this.firestore, 'games');
    await addDoc(addNewGameToFirebase, this.game.toJson()).then((gameInfo: any) => {
      this.router.navigateByUrl('/game/' + gameInfo.id);
    })
  }

}
