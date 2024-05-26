let pokemons = [];
let difficulty = "easy";
let pokemonNum = 0;
let previousNum = 1;
let selected_pokemons = [];
function getRandomNumber (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const paginate = async (pokemons, difficulty) => {
  let cards;
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
  selected_pokemons = Array.from(selectedIndices).map(index => pokemons[index]);
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
}
const setup = async () => {
  let response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=1302"
  );
  pokemons = response.data.results;
  paginate(pokemons, difficulty);
}

$(document).ready(setup)