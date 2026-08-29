import { API_POKEDEX } from "../config.js";
import { getCacheData, setCacheData } from "./storage.js";
import { categoryFormatted, extractIdFromUrl, getEvolutionData, getBestSprite } from "../helpers/utils.js";

const pokemonSpritesCache = new Map();

/*Pokémon Grid*/
export function filteredPokeList(list) {
  const pokeList = list.map(({ id, name, types, sprites }) => {
    return { id, name, types, sprite: getBestSprite(sprites, name) };
  });

  return pokeList;
}

export async function fetchPokedex(callbackFilter, offset = 0, limit = 12) {
  const cacheKey = `pokemon:pokedex:offset=${offset}:limit${limit}`;
  const cached = getCacheData(cacheKey);
  if (cached !== null) return cached;

  try {
    const response = await fetch(`${API_POKEDEX}/pokemon/?limit=${limit}&offset=${offset}`);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const pokeList = await response.json();

    const pokePromises = pokeList.results.map((pokemon) => fetch(pokemon.url));
    const responses = await Promise.all(pokePromises);

    const pokeJson = responses.map((response) => response.json());
    const pokeData = await Promise.all(pokeJson);
    const pokeDataFiltered = callbackFilter(pokeData);

    setCacheData(cacheKey, pokeDataFiltered);
    return pokeDataFiltered;
  } catch (error) {
    console.error("Erro na requisição da Api", error);
    throw error;
  }
}

/*Paginator*/
export async function fetchPokemonCount() {
  const cacheKey = "pokemon:count";
  const cached = getCacheData(cacheKey);
  if (cached !== null) return cached;

  try {
    const response = await fetch(`${API_POKEDEX}/pokemon/?limit=1`);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    setCacheData(cacheKey, data.count);
    return data.count;
  } catch (error) {
    console.error("Erro ao buscar contagem de Pokémon", error);
    throw error;
  }
}

/*Search bar*/
export async function fetchAllPokemonNames() {
  const cacheKey = "pokemon:allNames";
  const cached = getCacheData(cacheKey);
  if (cached !== null) return cached;
  try {
    const response = await fetch(`${API_POKEDEX}/pokemon/?limit=2000`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    setCacheData(cacheKey, data.results);
    return data.results;
  } catch (error) {
    console.error("Erro ao buscar lista de Pokémon", error);
    throw error;
  }
}

export async function fetchSuggestionsSprite(pokemon) {
  if (pokemonSpritesCache.has(pokemon.name)) {
    return pokemonSpritesCache.get(pokemon.name);
  }

  try {
    const response = await fetch(pokemon.url);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    const sprite = getBestSprite(data.sprites, pokemon.name);

    const suggestions = { name: pokemon.name, url: pokemon.url, sprite };
    pokemonSpritesCache.set(pokemon.name, suggestions);

    return suggestions;
  } catch (error) {
    console.error(`Erro ao buscar sprite de ${pokemon.name}`, error);
    return { name: pokemon.name, url: pokemon.url, sprite: null };
  }
}

export function searchPokemonByName(query, pokemonList) {
  return pokemonList.filter((pokemon) => pokemon.name.toLowerCase().includes(query.toLowerCase()));
}

/*Pokémon Detail*/
function filteredPokemonDetail(pokemon) {
  return {
    id: pokemon.id,
    name: pokemon.name,
    types: pokemon.types,
    height: pokemon.height,
    weight: pokemon.weight,
    abilities: pokemon.abilities[0]?.ability?.name ?? "Unknow",
    species: pokemon.species.url,
    sprite: getBestSprite(pokemon.sprites, pokemon.name),
  };
}

export async function fetchPokemonAbout(pokeName) {
  const cacheKey = `pokemon:about:${pokeName}`;
  const cached = getCacheData(cacheKey);
  if (cached !== null) return cached;

  try {
    const response = await fetch(`${API_POKEDEX}pokemon/${pokeName}`);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    const dataFiltered = filteredPokemonDetail(data);
    setCacheData(cacheKey, dataFiltered);
    return dataFiltered;
  } catch (error) {
    console.error("Erro ao encontrar pokémon", error);
    throw error;
  }
}

async function fetchChainType(id) {
  try {
    const response = await fetch(`${API_POKEDEX}pokemon/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao encontrar pokémon", error);
    throw error;
  }
}

export async function fetchPokeComplements(url) {
  const pokeId = extractIdFromUrl(url);
  const cacheKey = `pokemon:complements:${pokeId}`;
  const cached = getCacheData(cacheKey);
  if (cached !== null) return cached;
  try {
    const response = await fetch(`${API_POKEDEX}pokemon-species/${pokeId}`);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const speciesData = await response.json();
    const categoryObj = speciesData.genera.find((c) => c.language.name === "en");
    const category = categoryObj ? categoryObj.genus : "Unknow";

    const pokeFlavor = speciesData.flavor_text_entries.find((entry) => entry.language.name === "en");
    const pokeFlavorCleaned = pokeFlavor ? pokeFlavor.flavor_text.replace(/[\n\f]/g, " ") : "Description not available.";

    const resEvolutionChainUrl = await fetch(`${speciesData.evolution_chain.url}`);
    const evolutionChainUrl = await resEvolutionChainUrl.json();
    const evolutionUrlRaw = getEvolutionData(evolutionChainUrl, "species").map((p) => p.url);

    const resPokeEvoChain = evolutionUrlRaw.map((u) => fetch(u));
    const pokeEvoChainPromises = await Promise.all(resPokeEvoChain);
    const pokeEvoChainJson = pokeEvoChainPromises.map((p) => p.json());
    const pokeEvoRaw = await Promise.all(pokeEvoChainJson);

    const pokeEvoChainId = pokeEvoRaw.map((p) => p.id);
    const resPokeChain = pokeEvoChainId.map((p) => fetchChainType(p));
    const pokeChainRaw = await Promise.all(resPokeChain);

    const evolution = pokeChainRaw.map((e) => {
      return { id: e.id, name: e.name, types: e.types, sprite: getBestSprite(e.sprites, e.name) };
    });

    const pokeComplemetion = {
      category: categoryFormatted(category, "Pokémon"),
      evolutionChain: evolution,
      pokeText: pokeFlavorCleaned,
    };
    setCacheData(cacheKey, pokeComplemetion);
    return pokeComplemetion;
  } catch (error) {
    console.error("Erro ao carregar dados complementares do pokémon", error);
    throw error;
  }
}

export async function getPokemonNeighbors(currentName) {
  const allPokemon = await fetchAllPokemonNames();
  const currentIndex = allPokemon.findIndex((pokemon) => pokemon.name === currentName);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? allPokemon[currentIndex - 1] : null;
  const next = currentIndex < allPokemon.length - 1 ? allPokemon[currentIndex + 1] : null;

  return { prev, next };
}
