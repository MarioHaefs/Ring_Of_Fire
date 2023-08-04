export class Game {
    public players: { name: string, profileImage: string }[] = [];
    public stack: string[] = [];
    public playedCards: string[] = [];
    public currentPlayer: number = 0;
    public pickCardAnimation = false;
    public currentCard: string = '';

    constructor() {

        /**
         * push the cards img into the card stack and afterwards shuffle it
         */
        for (let i = 1; i < 14; i++) {
            this.stack.push('ace_' + i);
            this.stack.push('clubs_' + i);
            this.stack.push('hearts_' + i);
            this.stack.push('diamonds_' + i);
        }

        shuffle(this.stack);
    }


    /**
     * transform data from database into JSON array
     * 
     * @returns Array
     */
    public toJson() {
        return {
            players: this.players.map(player => ({ name: player.name, profileImage: player.profileImage })),
            stack: this.stack,
            playedCards: this.playedCards,
            currentPlayer: this.currentPlayer,
            pickCardAnimation: this.pickCardAnimation,
            currentCard: this.currentCard
        }
    }
}


/**
 * shuffle array (in this case card stack)
 * @param array 
 */
function shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
