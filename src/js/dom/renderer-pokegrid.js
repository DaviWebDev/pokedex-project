import { fetchPokedex, filteredPokeList, fetchPokemonCount } from "../services/pokeApi.js";
import { pokeGallery, paginatorContainer, pokedexContainer } from "./selectors.js";
import { createCard, createLoadMoreButton, createScrollTopButton, createPaginator } from "./dom-builder.js";
import { hideLoading, showLoading } from "../helpers/loading.js";

const mediaQuery = window.matchMedia("(width >= 48rem)");
const LIMIT = 16;

let currentOffset = 0;
let currentPage = 1;
let totalPages = 0;

/*Load Button*/
const isScrolledPastThreshold = () => window.scrollY > 4000;

const loadMoreButton = createLoadMoreButton();

loadMoreButton.addEventListener("click", async () => {
  loadMoreButton.disabled = true;
  loadMoreButton.textContent = "Loading...";

  currentOffset += LIMIT;
  const newPokeData = await fetchPokedex(filteredPokeList, currentOffset, LIMIT);
  const newCards = newPokeData.map((pokemon, index) => createCard(pokemon, index));
  pokeGallery.append(...newCards);

  loadMoreButton.disabled = false;
  loadMoreButton.textContent = "Load More";
});

/*Scroll button*/
const scrollTopButton = createScrollTopButton();
document.body.appendChild(scrollTopButton);

scrollTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", () => {
  if (isScrolledPastThreshold()) {
    scrollTopButton.classList.add("scroll-top--visible");
  } else {
    scrollTopButton.classList.remove("scroll-top--visible");
  }
});

/*Paginator fuction*/
async function loadPage(pageNumber) {
  currentPage = pageNumber;
  const offset = (pageNumber - 1) * LIMIT;
  currentOffset = offset;

  const pokeData = await fetchPokedex(filteredPokeList, offset, LIMIT);
  const pokeCards = pokeData.map((pokemon, index) => createCard(pokemon, index));
  pokeGallery.replaceChildren(...pokeCards);

  renderPaginatorControl(mediaQuery.matches);
}

async function handlePageClick(pageNumber) {
  history.pushState({}, "", `?page=${pageNumber}`);
  await loadPage(pageNumber);
}

window.addEventListener("popstate", async () => {
  const params = new URLSearchParams(window.location.search);
  const pageFromUrl = Number(params.get("page") || 1);
  await loadPage(pageFromUrl);
});

function renderPaginatorControl(isDesktop) {
  if (!isDesktop) {
    paginatorContainer.replaceChildren(loadMoreButton);
  } else {
    const newPaginator = createPaginator(currentPage, totalPages, handlePageClick);
    paginatorContainer.replaceChildren(newPaginator);
  }
}

mediaQuery.addEventListener("change", (e) => {
  if (e.matches) {
    const equivalentPage = Math.floor(currentOffset / LIMIT) + 1;
    handlePageClick(equivalentPage);
  } else {
    renderPaginatorControl(false);
  }
});

/*render pokedex*/
export async function renderPokedex() {
  showLoading(pokedexContainer);
  try {
    const params = new URLSearchParams(window.location.search);
    const pageFromUrl = Number(params.get("page") || 1);

    totalPages = Math.ceil((await fetchPokemonCount()) / LIMIT);
    await loadPage(pageFromUrl);
  } finally {
    hideLoading(pokedexContainer);
  }
}
