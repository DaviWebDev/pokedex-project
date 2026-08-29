export function showLoading(container) {
  container.classList.remove("is-loaded");
}

export function hideLoading(container) {
  container.classList.add("is-loaded");
}
