import { captalize, getOptimizedImageUrl } from "../helpers/utils.js";
import { typeColorMap } from "../helpers/pokemon-type.js";
import { getPaginator } from "../helpers/pagination.js";

function createElement({ tag, content, children, style, ...attributes } = {}) {
  // 1. Validação inicial de segurança
  if (typeof tag !== "string" || !tag) return null;
  const el = document.createElement(tag);

  // 2. Inserção de texto simples
  if (content !== undefined) el.textContent = content;

  // 3. Inserção de elementos filhos (caso existam)
  if (children) {
    [].concat(children).forEach((children) => {
      if (!children) return;
      if (children instanceof HTMLElement) el.appendChild(children);
      else el.appendChild(document.createTextNode(children));
    });
  }

  // 4. Aplicação de estilos modernos
  if (style) {
    if (typeof style === "object") Object.assign(el.style, style);
    else el.style.cssText = style;
  }

  // 5. Loop único para todos os outros atributos e eventos
  Object.entries(attributes).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    // Classes (junta class, className e classList)
    if (["class", "className", "classList"].includes(key)) {
      el.className = String(value);
    }
    // Eventos (onClick, onclick, etc)
    else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.toLowerCase().substring(2), value);
    }
    // Atributos Booleanos (disabled, checked, etc)
    else if (typeof value === "boolean") {
      if (value) el.setAttribute(key, "");
      if (key in el) el[key] = value;
    }
    // Propriedades nativas ou customizadas (id, data-*, aria-*, etc)
    else {
      if (key in el && !key.startsWith("data-") && !key.startsWith("aria-")) {
        el[key] = value;
      } else {
        el.setAttribute(key, value);
      }
    }
  });

  return el;
}

function createElementCard(data, index) {
  if (!data) {
    return null;
  }

  const fragment = document.createDocumentFragment();

  const { id, name, types } = data;
  const image = getOptimizedImageUrl(id);

  const pokeImageContainer = createElement({ tag: "div", class: "card__image-container" });
  const pokeImage = createElement({
    tag: "img",
    src: image,
    fetchpriority: index === 0 ? "high" : "auto",
    class: "card__image",
    alt: name,
    loading: index === 0 ? "eager" : "lazy",
    width: "200",
    height: "200",
  });
  pokeImageContainer.append(pokeImage);

  const pokeName = createElement({ tag: "h3", content: captalize(name), class: "card__name" });

  const pokeTypeContainer = createElement({ tag: "div", class: "card__type-container" });

  const pokeType = types.map((type) => {
    const typeName = type.type.name;
    const colorVar = typeColorMap[typeName];
    return createElement({
      tag: "span",
      content: captalize(typeName),
      class: `card__type`,
      style: { backgroundColor: `var(${colorVar})` },
    });
  });
  pokeTypeContainer.append(...pokeType);

  fragment.append(pokeImageContainer, pokeName, pokeTypeContainer);
  return fragment;
}

export function createCard(content, index) {
  const card = createElement({ tag: "article", class: "card" });
  const cardContent = createElementCard(content, index);

  card.append(cardContent);
  return card;
}

export function createLoadMoreButton() {
  return createElement({ tag: "button", content: "Load More", class: "pokedex__load-more" });
}

export function createScrollTopButton() {
  const button = createElement({ tag: "button", class: "scroll-top", "aria-label": "Back to Top" });
  button.innerHTML = `<svg class="scroll-top__icon" aria-hidden="true"><use href="./assets/sprites.svg#arrow-up-icon"></use></svg>`;
  return button;
}

export function createPaginator(currentPage, totalPages, onPageClick) {
  const range = getPaginator(currentPage, totalPages);

  const buttons = range.map((item) => {
    if (item === "...") {
      return createElement({ tag: "span", content: "...", class: "paginator__dots" });
    }
    return createElement({
      tag: "button",
      content: String(item),
      class: item === currentPage ? "paginator__button paginator__button--active" : "paginator__button",
      onClick: () => onPageClick(item),
    });
  });

  return createElement({ tag: "div", class: "pokedex__paginator", children: buttons });
}
