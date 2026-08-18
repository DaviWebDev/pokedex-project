import { API_POKEDEX } from "../config.js";

export function filteredPokeList(list) {
  const pokeList = list.map(({ id, name, types }) => {
    return { id, name, types };
  });

  return pokeList;
}

export async function fetchPokedex(callbackFilter, offset = 0, limit = 12) {
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

    return callbackFilter(pokeData);
  } catch (error) {
    console.error("Erro na requisição da Api", error);
    throw error;
  }
}

export async function fetchPokemonCount() {
  try {
    const response = await fetch(`${API_POKEDEX}/pokemon/?limit=1`);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error("Erro ao buscar contagem de Pokémon", error);
    throw error;
  }
}

export async function fetchAllPokemonNames() {
  try {
    const response = await fetch(`${API_POKEDEX}/pokemon/?limit=2000`);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Erro ao buscar lista de Pokémon", error);
    throw error;
  }
}

export function searchPokemonByName(query, pokemonList) {
  return pokemonList.filter((pokemon) => pokemon.name.toLowerCase().includes(query.toLowerCase()));
}

export async function fetchPokemonDetails(pokemonList) {
  const fetchPromises = pokemonList.map((pokemon) => fetch(pokemon.url));
  const response = await Promise.all(fetchPromises);

  const jsonPromises = response.map((response) => response.json());
  return Promise.all(jsonPromises);
}
