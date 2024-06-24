import { generateBet } from "./helpers.js";

class Cont {
  constructor(invert, base_bet) {
    // variable attributes
    this.leaving_hands = 2;
    this.shoe = [];
    this.bet_index = 0;
    this.base_bet = base_bet;
    // this.continue refers to vertical (when invert = false)
    //               refers to horizontal (when invert = true)
    this.continue = false;
    this.prediction = null;
    this.bet = null;
    this.invert = invert;
  }

  predict() {
    // leaving
    this.prediction = null;
    this.bet = null;

    // predicting
    if (this.leaving_hands === 0) {
      // starting vertical / horizontal
      if (
        this.shoe.length == 2 &&
        (this.shoe[0] === this.shoe[1]) ^ this.invert
      ) {
        this.continue = true;
      }
      // generate bet and prediction
      this.prediction = this.continue
        ? this.shoe[this.shoe.length - 1]
        : this.shoe[this.shoe.length - 1] ^ 1;
      this.bet = generateBet(++this.bet_index) * this.base_bet;
    }
  }

  validate(actual_hand) {
    // predicting
    if (this.leaving_hands === 0) {
      // losing
      if (this.prediction !== actual_hand) {
        this.bet_index = 0;
      }

      // win && invert || lose && not(invert)
      if ((this.prediction === actual_hand) === this.invert) {
        this.continue = !this.continue;
      }
    }
    // leaving
    else {
      this.leaving_hands--;
    }

    // updating shoe array
    this.shoe.push(actual_hand);
  }

  str() {
    // returning string representation of cont
    return `Shoe: ${this.shoe}\n  Prediction: ${this.prediction}\n  Bet: ${this.bet}\nLi: ${this.leaving_hands} | Bi: ${this.bet_index}`;
  }
}

export { Cont };
