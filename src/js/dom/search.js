import { searchInput, suggestionsContainer } from "./selectors.js";
import { fetchAllPokemonNames, searchPokemonByName } from "../services/pokeApi.js";
import { createSuggestionItem } from "./dom-builder.js";
import { debounce } from "../helpers/utils.js";

export function initiSearch() {
  let allPokemonNames = [];
  let hasLoadedNames = false;

  searchInput.addEventListener("focus", async () => {
    if (hasLoadedNames) return;

    allPokemonNames = await fetchAllPokemonNames();
    hasLoadedNames = true;
  });

  const handleSearchInput = debounce((query) => {
    if (query.length === 0) {
      suggestionsContainer.replaceChildren();
      return;
    }

    const filteredResults = searchPokemonByName(query, allPokemonNames).slice(0, 5);
    const suggestionsElements = filteredResults.map((pokemon) => createSuggestionItem(pokemon));
    suggestionsContainer.replaceChildren(...suggestionsElements);
  }, 300);

  searchInput.addEventListener("input", (e) => {
    handleSearchInput(e.target.value);
  });
}
