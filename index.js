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

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function handler() {
  clicks++;
  $(this).toggleClass("flip");
  if (!firstCard) firstCard = $(this).find(".front_face")[0];
  else {
    secondCard = $(this).find(".front_face")[0];
    console.log(firstCard, secondCard);
    if (firstCard.src == secondCard.src) {
      console.log("match");
      $(`#${firstCard.id}`).parent().off("click");
      $(`#${secondCard.id}`).parent().off("click");
      firstCard = undefined;
      secondCard = undefined;
      matches++;
    } else {
      console.log("no match");
      setTimeout(() => {
        $(`#${firstCard.id}`).parent().toggleClass("flip");
        $(`#${secondCard.id}`).parent().toggleClass("flip");
        firstCard = undefined;
        secondCard = undefined;
      }, 1000);
    }
  }
  await information(pairs, matches, clicks);
}

const level = (difficulty) => {
  $(`#difficulty`).empty();
  $(`#difficulty`).append(`
      <label class="btn btn-secondary ${difficulty == "easy" ? "active" : ""}">
        <input type="radio" value="easy" name="options" id="option1" autocomplete="off"> Easy
      </label>
      <label class="btn btn-secondary ${
        difficulty == "medium" ? "active" : ""
      }">
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
  if (total == 4) {
    timer = 100;
  } else if (total == 8) {
    timer = 200;
  } else {
    timer = 300;
  }
  $(`#total`).empty();
  $(`#matches`).empty();
  $(`#left`).empty();
  $(`#clicks`).empty();
  $(`#timer`).empty();
  $(`#total`).append(`${total}`);
  $(`#matches`).append(`${matches}`);
  $(`#left`).append(`${total - matches}`);
  $(`#clicks`).append(`${clicks}`);
  $(`#timer`).append(`${timer}`);
};

const content = $("#s").html();
const time = setInterval(function () {
  sec++;
  $(`#time`).empty();
  $(`#time`).append(`${sec}`);
  if (sec <= 1) {
    $(`#s`).empty();
  } else {
    $("#s").html(content);
  }
  if (sec >= timer) {
    clearInterval(time);
  }
}, 1000);

const paginate = async (pokemons, difficulty) => {
  if (difficulty == "easy") {
    pairs = 4;
  } else if (difficulty == "medium") {
    pairs = 8;
  } else {
    pairs = 16;
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
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url);
    $("#game_grid").append(`
      <div class="pokeCard">
        <img id="img${i}" class="front_face" src="${res.data.sprites.front_default}" alt="${res.data.name}">
        <img class="back_face" src="back.webp" alt="">
      </div>
  `);
    i++;
  });
};

const setup = async () => {
  var originalContent = $("#info").html();
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
    $("#game_grid").empty();
    $(`#game_grid`).removeClass(difficulty);
    difficulty = "easy";
    level(difficulty);
  });
  $("body").on("click", "#option2", function () {
    setting();
    $(`#info`).empty();
    $("#game_grid").empty();
    $(`#game_grid`).removeClass(difficulty);
    difficulty = "medium";
    level(difficulty);
  });
  $("body").on("click", "#option3", function () {
    setting();
    $(`#info`).empty();
    $("#game_grid").empty();
    $(`#game_grid`).removeClass(difficulty);
    difficulty = "hard";
    level(difficulty);
  });
  $("body").on("click", "#start", async function () {
    setting("restart");
    $(`#game_grid`).empty();
    $("#info").html(originalContent);
    time;
    sec = 0;
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
