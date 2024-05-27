let pokemons = [];
let difficulty;
let pokemonNum = 0;
let previousNum = 1;
let selected_pokemons = [];
let cards;
let firstCard = undefined;
let secondCard = undefined;
let gridLevel;

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
const setting = () => {
  $(`#settingUp`).empty();
  $(`#settingUp`).append(`
    <a href='/'><button class="btn btn-secondary"> Reset</button></a>
    <button class="btn btn-secondary" id="start"> Start!</button>
  `);
};
const paginate = async (pokemons, difficulty) => {
  if (difficulty == "easy") {
    cards = 8;
  } else if (difficulty == "medium") {
    cards = 16;
  } else {
    cards = 32;
  }
  let selectedIndices = new Set();
  while (selectedIndices.size < cards / 2) {
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
      <div class="card">
        <img id="img${i}" class="front_face" src="${res.data.sprites.front_default}" alt="${res.data.name}">
        <img class="back_face" src="back.webp" alt="">
      </div>
  `);
    i++;
  });
};
const setup = async () => {
  level();
  let response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=1302"
  );
  pokemons = response.data.results;
  $("body").on("click", "#option1", function () {
      setting();
    $("#game_grid").empty();
    $(`#game_grid`).removeClass(difficulty);
    difficulty = "easy";
    level(difficulty);
  });
  $("body").on("click", "#option2", function () {
      setting();
    $("#game_grid").empty();
    $(`#game_grid`).removeClass(difficulty);
    difficulty = "medium";
    level(difficulty);
  });
  $("body").on("click", "#option3", function () {
      setting();
    $("#game_grid").empty();
    $(`#game_grid`).removeClass(difficulty);
    difficulty = "hard";
    level(difficulty);
  });
  $("body").on("click", "#start", function () {
    $(`#game_grid`).empty();
    paginate(pokemons, difficulty);
    $(`#game_grid`).addClass(difficulty);
  });
};

$(document).ready(setup);
