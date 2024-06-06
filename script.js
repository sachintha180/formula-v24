import { Cont } from "./cont.js";
import { Side } from "./side.js";

// intialize global variables
let shoe = [];
let sides = {
  A: { data: [new Side(2, false), new Cont(false)], limit: 10, table: null },
  B: { data: [new Side(2, true), new Cont(true)], limit: 5, table: null },
};
let prediction = null;
let bet = null;
let total = 0;

// initialize global DOM elements
let instruction_lbl;
let total_lbl;
let hand_count_lbl;
let leaving_div;
let prediction_div;
let banker_btn;
let player_btn;
let win_btn;
let lose_btn;
let shoe_tbl;
let final_tbl;

const init = () => {
  // label initializations
  instruction_lbl = document.querySelector("#instruction");
  total_lbl = document.querySelector("#total");
  hand_count_lbl = document.querySelector("#hand");

  // container initializations
  leaving_div = document.querySelector("#leaving");
  prediction_div = document.querySelector("#prediction");

  // button initializations
  banker_btn = document.querySelector("#banker");
  player_btn = document.querySelector("#player");
  win_btn = document.querySelector("#win");
  lose_btn = document.querySelector("#lose");

  // table initializations
  shoe_tbl = document.querySelector("#shoe tr");
  final_tbl = document.querySelector("#final");
  for (const key in sides) {
    sides[key].table = document.querySelector(`#calc${key}`);
  }

  // add leaving button event listeners
  banker_btn.addEventListener("click", () => {
    validate(0);
  });

  player_btn.addEventListener("click", () => {
    validate(1);
  });

  // add predicting button event listeners
  win_btn.addEventListener("click", () => {
    validate(prediction);
  });

  lose_btn.addEventListener("click", () => {
    validate(prediction ^ 1);
  });

  // call intial predict
  predict();
};

const combine = () => {
  // accumulate individual bets (number | null)
  let bet = 0;
  for (const key in sides) {
    for (let side of sides[key].data) {
      side.predict();
      if (side.prediction !== null) {
        bet = side.prediction === 0 ? bet + side.bet : bet - side.bet;
      }
    }
  }

  // calculate final prediction and bet
  let prediction = null;
  if (bet) {
    prediction = bet > 0 ? 0 : 1;
  }

  // return final prediction and bet
  return [prediction, bet ? Math.abs(bet) : null];
};

const predict = () => {
  // get combined prediction and bet
  [prediction, bet] = combine();

  if (prediction !== null) {
    // show prediction container
    leaving_div.classList.add("is-hidden");
    prediction_div.classList.remove("is-hidden");

    // update instruction label
    instruction_lbl.innerHTML = `Bet ${bet} for ${
      prediction == 0 ? "Banker" : "Player"
    }`;
  } else {
    // show leaving container
    leaving_div.classList.remove("is-hidden");
    prediction_div.classList.add("is-hidden");

    // update instruction label
    instruction_lbl.innerHTML = "Leave one hand";
  }
};

const validate = (actual_hand) => {
  // predicting
  if (prediction !== null) {
    // win
    if (actual_hand === prediction) {
      total += bet;
      // lose
    } else {
      total -= bet;
    }
  }

  // validate + tabulate individual sides
  console.clear();

  for (const key in sides) {
    const side_row = document.createElement("tr");
    // let reset_indices = [];
    // let thresh_index = -1;

    for (let [index, side] of sides[key].data.entries()) {
      // validate side and add reset indices
      side.validate(actual_hand);
      // if (index >= thresh_index && side.global_reset) {
      //   thresh_index = index + side.bet_index;
      //   console.log(side.bet_index);
      //   reset_indices.push({ index: index, range: side.bet_index });
      // }

      // create side element
      const side_element = document.createElement("td");
      if (side.prediction !== null) {
        side_element.innerHTML = `${
          actual_hand === side.prediction ? "+" : "-"
        }${side.bet}`;
      } else {
        side_element.innerHTML = "-";
      }

      // change color based on side / cont
      if (index === sides[key].data.length - 1) {
        side_element.classList.add("is-warning");
      } else {
        side_element.classList.add("is-light");
      }

      // add side element to row
      side_row.appendChild(side_element);
    }

    // add side row to table
    sides[key].table.appendChild(side_row);

    // check for global reset
    // for (let item of reset_indices) {
    //   const max_index = Math.min(
    //     sides[key].data.length - 1,
    //     item.index + item.range
    //   );
    //   for (let i = item.index; i < max_index; i++) {
    //     sides[key].data[i].reset();
    //   }
    // }

    if (sides[key].data.length < sides[key].limit + 1) {
      // prepare additional side
      const prev_side = sides[key].data[sides[key].data.length - 2];
      const side = new Side(prev_side.max_leaving_hands + 1, prev_side.invert);
      side.leaving_hands -= sides[key].data.length - 1;

      // add side to sides list
      sides[key].data.splice(sides[key].data.length - 1, 0, side);
    }
  }

  // tabulate final prediction
  const total_row = document.createElement("tr");
  const total_element = document.createElement("td");
  total_element.classList.add("is-success");
  if (prediction !== null) {
    total_element.innerHTML = `${actual_hand === prediction ? "+" : "-"}${bet}`;
  } else {
    total_element.innerHTML = "-";
  }
  total_row.appendChild(total_element);
  final_tbl.appendChild(total_row);

  // add hand to shoe
  shoe.push(actual_hand);

  // display total
  total_lbl.innerHTML = `Total: ${total}`;

  // display hand count
  hand_count_lbl.innerHTML = `Current Hand: ${shoe.length}`;

  // tabulate shoe
  shoe_tbl.innerHTML = "";
  shoe_tbl.appendChild(encode(shoe));

  // repeat predict
  predict();
};

const encode = (shoe) => {
  // intialize encoding variables
  let b = [[shoe[0], 0, 0]];
  let c = 0;
  let t = shoe[0];
  let maxR = 0;

  // iterate across shoe
  for (let i = 1; i < shoe.length; i++) {
    if (t != shoe[i]) {
      t = shoe[i];
      c += 1;
    }

    if (shoe[i - 1] == shoe[i]) {
      b.push([shoe[i], b[b.length - 1][1] + 1, c]);
    } else {
      b.push([shoe[i], 0, c]);
    }

    if (b[b.length - 1][1] > maxR) {
      maxR = b[b.length - 1][1];
    }
  }

  // create all table data elements
  let g = [];
  for (let i = 0; i < maxR + 1; i++) {
    let f = [];
    for (let j = 0; j < c + 1; j++) {
      f.push(document.createElement("td"));
    }
    g.push(f);
  }

  // configure all table data elements
  for (let i = 0; i < b.length; i++) {
    if (b[i][0] === 0) {
      g[b[i][1]][b[i][2]].innerHTML = "B";
      g[b[i][1]][b[i][2]].classList.add("is-danger");
    } else {
      g[b[i][1]][b[i][2]].innerHTML = "P";
      g[b[i][1]][b[i][2]].classList.add("is-info");
    }
  }

  // create table rows
  let frag = document.createDocumentFragment();
  g.forEach((gr) => {
    let tr = document.createElement("tr");
    gr.forEach((gt) => {
      tr.appendChild(gt);
    });
    frag.appendChild(tr);
  });

  return frag;
};

window.onload = init;
