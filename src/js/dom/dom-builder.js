import { captalize, getOptimizedImageUrl } from "../helpers/utils.js";
import { typeColorMap } from "../helpers/pokemon-type.js";
import { getPaginator } from "../helpers/pagination.js";

export function createElement({ tag, content, children, style, ...attributes } = {}) {
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

function createGenericCard(data, options = {}) {
  const { clickable = false, showTypes = true, index = null, baseClass = "card", subClass = "" } = options;

  const card = createElement({ tag: "div", class: clickable ? `${baseClass} ${baseClass}--clickable` : `${baseClass} ${subClass}` });

  if (clickable) {
    card.addEventListener("click", () => {
      window.location.href = `./pokemon.html?name=${data.name}`;
    });
  }

  const { name, types, sprite } = data;
  const image = getOptimizedImageUrl(sprite);

  const imageContainer = createElement({ tag: "div", class: `${baseClass}__image-container` });
  const pokeImage = createElement({
    tag: "img",
    fetchpriority: index === 0 ? "high" : "auto",
    loading: index === 0 ? "eager" : "lazy",
    src: image,
    class: `${baseClass}__image`,
    alt: name,
    width: "200",
    height: "200",
  });
  imageContainer.append(pokeImage);

  const pokeName = createElement({ tag: "h3", content: captalize(name), class: `${baseClass}__name` });
  card.append(imageContainer, pokeName);

  if (showTypes) {
    const typeContainer = createElement({ tag: "div", class: `${baseClass}__type-container` });
    const pokeType = types.map((type) => {
      const typeName = type.type.name;
      const colorVar = typeColorMap[typeName];
      return createElement({
        tag: "span",
        content: captalize(typeName),
        class: `${baseClass}__type`,
        style: { backgroundColor: `var(${colorVar})` },
      });
    });
    typeContainer.append(...pokeType);
    card.append(typeContainer);
  }

  return card;
}

export function createCard(data, index) {
  return createGenericCard(data, { clickable: true, showTypes: true, index, baseClass: "card" });
}

export function createCardBasic(data) {
  return createGenericCard(data, { clickable: false, showTypes: true, baseClass: "card", subClass: "card--basic" });
}

export function createSuggestionItem(data) {
  return createGenericCard(data, { clickable: true, showTypes: false, baseClass: "suggestion" });
}

export function createCardEvolution(data) {
  return createGenericCard(data, { clickable: true, showTypes: true, baseClass: "card" });
}

export function createEvolutionArrow() {
  const arrow = createElement({ tag: "div", class: "evolution-arrow" });
  arrow.innerHTML = `<svg class="evolution-arrow__icon" aria-hidden="true"><use href="./assets/sprites.svg#arrow-right"></use></svg>`;
  return arrow;
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
