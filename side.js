import { generateBet } from "./helpers.js";

class Side {
  constructor(max_leaving_hands, invert) {
    // constant attributes
    this.max_leaving_hands = max_leaving_hands;

    // variable attributes
    this.leaving_hands = max_leaving_hands;
    this.shoe = [];
    this.bet_index = 0;
    this.prediction = null;
    this.bet = null;
    // this.global_reset = false;
    this.invert = invert;
  }

  predict() {
    // leaving
    this.prediction = null;
    this.bet = null;

    // predicting
    if (this.leaving_hands === 0) {
      this.prediction = this.invert
        ? this.shoe[this.shoe.length - 2]
        : this.shoe[this.shoe.length - 2] ^ 1;
      this.bet = generateBet(this.bet_index++);
    }
  }

  reset() {
    this.max_leaving_hands++;
    this.leaving_hands = this.max_leaving_hands;
    this.bet_index = 0;
    // this.global_reset = false;
  }

  validate(actual_hand) {
    // reset global reset flag
    // this.global_reset = false;

    // predicting
    if (this.leaving_hands === 0) {
      // winning
      if (this.prediction === actual_hand) {
        this.max_leaving_hands++;
        this.leaving_hands = this.max_leaving_hands;
        this.bet_index = 0;
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
    // returning string representation of side
    return `Shoe: ${this.shoe}\n  Prediction: ${this.prediction}\n  Bet: ${this.bet}\nLi: ${this.leaving_hands} | Bi: ${this.bet_index}`;
  }
}

export { Side };
