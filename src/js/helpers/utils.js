import { IMAGE_PROXY_BASE } from "../config.js";

export function captalize(text) {
  return text.at(0).toUpperCase() + text.slice(1);
}

export function getOptimizedImageUrl(id) {
  const originalUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  return `${IMAGE_PROXY_BASE}${encodeURIComponent(originalUrl)}&output=webp`;
}
