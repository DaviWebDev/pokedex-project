import { IMAGE_PROXY_BASE } from "../config.js";
import { manualSpriteOverrides } from "./manual-sprite-overrides.js";

export function captalize(text) {
  return text.at(0).toUpperCase() + text.slice(1);
}

export function categoryFormatted(name, removeWord) {
  const regexFormatter = new RegExp(`\\s*${removeWord}\\s*`, "gi");
  const regexClean = name.replace(regexFormatter, " ").trim();

  return regexClean;
}

export function getOptimizedImageUrl(spriteUrl) {
  if (!spriteUrl) return null;
  if (!spriteUrl.startsWith("http")) return spriteUrl;
  return `${IMAGE_PROXY_BASE}${encodeURIComponent(spriteUrl)}&output=webp`;
}

export function getBestSprite(sprites, name) {
  return (
    sprites.front_default ||
    sprites.other?.["official-artwork"]?.front_default ||
    sprites.other?.home?.front_default ||
    sprites.other?.dream_world?.front_default ||
    sprites.other?.showdown?.front_default ||
    manualSpriteOverrides[name] ||
    null
  );
}

export function extractIdFromUrl(url) {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

export function debounce(func, delay = 300) {
  let timeOutId;
  return function (...args) {
    clearTimeout(timeOutId);
    timeOutId = setTimeout(() => func(...args), delay);
  };
}

export function getEvolutionData(pokemon, keyPrimary, results = [], evolutions = new Set()) {
  if (pokemon && typeof pokemon === "object") {
    if (evolutions.has(pokemon)) return results;
    evolutions.add(pokemon);

    if (Array.isArray(pokemon)) {
      for (let item of pokemon) {
        getEvolutionData(item, keyPrimary, results, evolutions);
      }
    }

    if (keyPrimary in pokemon) {
      results.push(pokemon[keyPrimary]);
    }

    for (let keyAlter in pokemon) {
      getEvolutionData(pokemon[keyAlter], keyPrimary, results, evolutions);
    }
  }
  return results;
}

export function formatWeight(weightHg, useImperial = false) {
  const weightKg = weightHg / 10;

  if (useImperial) {
    const weightLB = weightKg * 2.20462;
    return `${weightLB.toFixed(1)} lbs`;
  }

  return `${weightKg.toFixed(1)} Kg`;
}

export function formatHeight(heightDm, useImperial = false) {
  const heightM = heightDm / 10;

  if (useImperial) {
    const totalFeet = heightM * 3.28084;
    const feet = Math.floor(totalFeet);
    const inches = Math.round((totalFeet - feet) * 12);
    return `${feet}' ${inches}`;
  }

  return `${heightM.toFixed(2)}M`;
}

export function applyPokeTheme(type, map, container) {
  return (container.style.backgroundColor = `var(${map[type]})`);
}
