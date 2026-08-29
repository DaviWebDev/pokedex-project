import { searchInput, suggestionsContainer } from "./selectors.js";
import { fetchAllPokemonNames, fetchSuggestionsSprite, searchPokemonByName } from "../services/pokeApi.js";
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

  const handleSearchInput = debounce(async (query) => {
    if (query.length === 0) {
      suggestionsContainer.classList.remove("is-visible");

      setTimeout(() => {
        if (searchInput.value.length === 0) {
          suggestionsContainer.replaceChildren();
        }
      }, 300);
      return;
    }

    const filteredResults = searchPokemonByName(query, allPokemonNames).slice(0, 5);
    if (filteredResults.length === 0) {
      suggestionsContainer.classList.remove("is-visible");
      return;
    }

    const suggestionsData = await Promise.all(filteredResults.map((pokemon) => fetchSuggestionsSprite(pokemon)));
    const suggestionsElements = suggestionsData.map((pokemon) => createSuggestionItem(pokemon));

    suggestionsContainer.replaceChildren(...suggestionsElements);
    suggestionsContainer.classList.add("is-visible");
  }, 300);

  searchInput.addEventListener("input", (e) => {
    handleSearchInput(e.target.value);
  });

  document.addEventListener("click", (e) => {
    if (!suggestionsContainer.contains(e.target) && e.target !== searchInput) {
      suggestionsContainer.classList.remove("is-visible");
    }
  });

  searchInput.addEventListener("blur", () => {
    setTimeout(() => {
      if (suggestionsContainer.matches(":hover")) {
        suggestionsContainer.classList.remove("is-visible");
        searchInput.value = "";
      }
    }, 300);
  });
}
