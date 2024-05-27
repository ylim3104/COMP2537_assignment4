let pokemons = [];
let difficulty;
let pokemonNum = 0;
let previousNum = 1;
let selected_pokemons = [];
let pairs;
let firstCard = undefined;
let secondCard = undefined;
let timer;
let clicks = 0;
let matches = 0;
let sec = 0;
let lockBoard = false; // For preventing cards from flipping during match check
let time; // Declare timer interval variable
let cardStates = [];

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const activatePowerUp = () => {
  lockBoard = true; // Lock the board during the power-up effect

  setTimeout(() => {
    cardStates = $(".pokeCard")
      .map((index, card) => $(card).hasClass("flip"))
      .get(); // Save the state of each card
    // Flip all cards to show front faces
    $(".pokeCard").addClass("flip");
    setTimeout(() => {
      // Restore each card to its previous state
      $(".pokeCard").each((index, card) => {
        if (!cardStates[index]) {
          $(card).removeClass("flip");
        }
      });
      lockBoard = false; // Unlock the board after the power-up effect
    }, 1000); // Show front faces for 1 second
  }, 2000); // Wait for 2 seconds before showing all front faces
};

async function handler() {
  if (lockBoard) return; // Prevent other cards from flipping during match check
  if ($(this).hasClass("flip")) return; // Prevent flipping if card is already flipped

  $(this).toggleClass("flip");
  if (!firstCard) {
    firstCard = $(this).find(".front_face")[0];
  } else {
    secondCard = $(this).find(".front_face")[0];
    lockBoard = true; // Lock the board while checking for a match
    console.log(firstCard, secondCard);
    if (firstCard.src == secondCard.src) {
      console.log("match");
      $(`#${firstCard.id}`).parent().off("click");
      $(`#${secondCard.id}`).parent().off("click");
      firstCard = undefined;
      secondCard = undefined;
      matches++;
      lockBoard = false; // Unlock the board
      if (matches == pairs) {
        setTimeout(() => {
          alert("You win");
        }, 1000);
        clearInterval(time); // Stop the timer if the player wins
      }
    } else {
      console.log("no match");
      setTimeout(() => {
        $(`#${firstCard.id}`).parent().toggleClass("flip");
        $(`#${secondCard.id}`).parent().toggleClass("flip");
        firstCard = undefined;
        secondCard = undefined;
        lockBoard = false; // Unlock the board after flipping back
      }, 1000);
    }
  }
  clicks++;
  if (clicks % 10 === 0) {
    activatePowerUp();
    alert("power up!");
  }
  await information(pairs, matches, clicks);
}

const level = (difficulty) => {
  $(`#difficulty`).empty();
  $(`#difficulty`).append(`
    <label class="btn btn-secondary ${difficulty == "easy" ? "active" : ""}">
      <input type="radio" value="easy" name="options" id="option1" autocomplete="off"> Easy
    </label>
    <label class="btn btn-secondary ${difficulty == "medium" ? "active" : ""}">
      <input type="radio" value="medium" name="options" id="option2" autocomplete="off"> Medium
    </label>
    <label class="btn btn-secondary ${difficulty == "hard" ? "active" : ""}">
      <input type="radio" value="hard" name="options" id="option3" autocomplete="off"> Hard
    </label>
  `);
};

const setting = (start) => {
  $(`#settingUp`).empty();
  $(`#settingUp`).append(`
    <a href='/'><button class="btn btn-secondary"> Reset</button></a>
    <button class="btn btn-secondary" id="start">${
      start == "restart" ? "Restart!" : "Start!"
    }</button>
  `);
};

const information = async (total, matches, clicks) => {
  $(`#total`).empty().append(`${total}`);
  $(`#matches`).empty().append(`${matches}`);
  $(`#left`)
    .empty()
    .append(`${total - matches}`);
  $(`#clicks`).empty().append(`${clicks}`);
  $(`#timer`).empty().append(`${timer}`);
};

const startTimer = () => {
  clearInterval(time); // Clear any existing timer
  sec = 0; // Reset seconds when starting/restarting
  $(`#time`).empty().append(`${sec}`);
  time = setInterval(function () {
    sec++;
    $(`#time`).empty().append(`${sec}`);
    if (sec > timer) {
      clearInterval(time);
      lose();
    }
  }, 1000);
};

const paginate = async (pokemons, difficulty) => {
  if (difficulty == "easy") {
    pairs = 4;
    timer = 100; // Set timer for easy difficulty
  } else if (difficulty == "medium") {
    pairs = 8;
    timer = 200; // Set timer for medium difficulty
  } else {
    pairs = 16;
    timer = 300; // Set timer for hard difficulty
  }

  let selectedIndices = new Set();
  while (selectedIndices.size < pairs) {
    selectedIndices.add(getRandomNumber(0, pokemons.length - 1));
  }

  selected_pokemons = Array.from(selectedIndices).map(
    (index) => pokemons[index]
  );
  selected_pokemons = [...selected_pokemons, ...selected_pokemons];
  selected_pokemons = selected_pokemons.sort(() => Math.random() - 0.5);
  $("#game_grid").empty();
  let i = 1;
  for (const pokemon of selected_pokemons) {
    const res = await axios.get(pokemon.url);
    $("#game_grid").append(`
      <div class="pokeCard">
        <img id="img${i}" class="front_face" src="${res.data.sprites.front_default}" alt="${res.data.name}">
        <img class="back_face" src="back.webp" alt="">
      </div>
    `);
    i++;
  }
};

const lose = async () => {
  clearInterval(time); // Clear interval when losing
  $(`#info`).empty();
  $("#game_grid").empty().append(`<h1>You lose!</h1>`);
};

const setup = async () => {
  const originalContent = $("#info").html();
  $(`#info`).empty();
  level();
  let response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=1302"
  );
  pokemons = response.data.results;
  $("body").on("click", ".pokeCard", handler);
  $("body").on("click", "#option1", function () {
    setting();
    $(`#info`).empty();
    $("#game_grid").empty().removeClass(difficulty);
    difficulty = "easy";
    level(difficulty);
  });
  $("body").on("click", "#option2", function () {
    setting();
    $(`#info`).empty();
    $("#game_grid").empty().removeClass(difficulty);
    difficulty = "medium";
    level(difficulty);
  });
  $("body").on("click", "#option3", function () {
    setting();
    $(`#info`).empty();
    $("#game_grid").empty().removeClass(difficulty);
    difficulty = "hard";
    level(difficulty);
  });
  $("body").on("click", "#start", async function () {
    clicks = 0;
    matches = 0; // Reset matches on game start/restart
    setting("restart");
    $(`#game_grid`).empty();
    $("#info").html(originalContent);
    startTimer(); // Start the timer on game start/restart
    paginate(pokemons, difficulty);
    $(`#game_grid`).addClass(difficulty);
    await information(pairs, matches, clicks);
  });
  $("body").on("click", "#dark", function () {
    $(`body`).addClass("dark");
  });
  $("body").on("click", "#light", function () {
    $(`body`).removeClass("dark");
  });
};

$(document).ready(setup);
