import {
  pokemonHeading,
  cardAboutContainer,
  pokemonText,
  pokeHeight,
  pokeWeight,
  pokeCategory,
  pokeAbilities,
  pokemonEvolutionContainer,
  pokeDetailContainer,
  navigatorNext,
  navigatorPrev,
  pagePokemonContainer,
} from "./selectors.js";
import { fetchPokemonAbout, fetchPokeComplements, getPokemonNeighbors } from "../services/pokeApi.js";
import { createCardBasic, createCardEvolution, createEvolutionArrow } from "./dom-builder.js";
import { captalize, formatHeight, formatWeight, applyPokeTheme } from "../helpers/utils.js";
import { typeColorMap } from "../helpers/pokemon-type.js";
import { hideLoading, showLoading } from "../helpers/loading.js";

function renderHeading(pokemon) {
  pokemonHeading.textContent = `${captalize(pokemon.name)} #${String(pokemon.id).padStart(4, "0")}`;
}

function renderPokeText(pokemon) {
  pokemonText.textContent = `${pokemon.pokeText}`;
}

function renderPokeBasicInfo(pokemon) {
  pokeHeight.textContent = `${pokemon.height}`;
  pokeWeight.textContent = `${pokemon.weight}`;
  pokeWeight.title = `${pokemon.weight}`;
  pokeAbilities.textContent = `${captalize(pokemon.abilities)}`;
  pokeAbilities.title = `${captalize(pokemon.abilities)}`;
}

function renderPokeCategory(pokemon) {
  pokeCategory.textContent = `${pokemon.category}`;
}

function renderCardAbout(pokemon, container) {
  const card = createCardBasic(pokemon);
  container.replaceChildren(card);
}

function renderCardEvoChain(pokemon, container) {
  const elements = [];

  pokemon.evolutionChain.forEach((evoPokemon, index) => {
    elements.push(createCardEvolution(evoPokemon));

    if (index < pokemon.evolutionChain.length - 1) {
      elements.push(createEvolutionArrow());
    }
  });
  container.replaceChildren(...elements);
  container.classList.add("is-ready");
}

function renderNavigationArrows(neighbors) {
  if (neighbors.prev) {
    navigatorPrev.onclick = neighbors.prev ? () => (window.location.href = `./pokemon.html?name=${neighbors.prev.name}`) : null;
    navigatorPrev.disabled = false;
  } else {
    navigatorPrev.disabled = true;
  }

  if (neighbors.next) {
    navigatorNext.onclick = neighbors.next ? () => (window.location.href = `./pokemon.html?name=${neighbors.next.name}`) : null;
    navigatorNext.disabled = false;
  } else {
    navigatorNext.disabled = true;
  }
}

export async function rendererPokemonDetail() {
  showLoading(pagePokemonContainer);

  try {
    const params = new URLSearchParams(window.location.search);
    const pageUrl = params.get("name");
    const isUs = navigator.language.startsWith("en-US");

    const pokemonDetails = await fetchPokemonAbout(pageUrl);

    let pokemon = { ...pokemonDetails };
    const primaryPokeColor = pokemon.types[0].type.name;
    pokemon.height = `${formatHeight(pokemon.height, isUs)}`;
    pokemon.weight = `${formatWeight(pokemon.weight, isUs)}`;

    applyPokeTheme(primaryPokeColor, typeColorMap, pokeDetailContainer);
    renderHeading(pokemon);
    renderPokeBasicInfo(pokemon);
    renderCardAbout(pokemon, cardAboutContainer);

    hideLoading(pagePokemonContainer);

    const [pokemonComplementions, neighbors] = await Promise.all([
      fetchPokeComplements(pokemonDetails.species),
      getPokemonNeighbors(pageUrl),
    ]);

    pokemon = { ...pokemon, ...pokemonComplementions };
    renderPokeCategory(pokemon);
    renderPokeText(pokemon);
    renderCardEvoChain(pokemon, pokemonEvolutionContainer);
    renderNavigationArrows(neighbors);
  } catch (error) {
    console.error("Erro ao renderizar detalhes do pokémon", error);
  }
}
