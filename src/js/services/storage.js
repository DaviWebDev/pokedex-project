export function setCacheData(key, data) {
  try {
    if (data === undefined || data === null) {
      console.warn(`Não é possivel salvar valores nulos ou indefinidos no localStoragem (${key})`);
      return false;
    }

    const convertedData = typeof data === "string" ? data : JSON.stringify(data);
    localStorage.setItem(key, convertedData);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar no localStorage (${key})`, error);
  }
}

export function getCacheData(key) {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  } catch (error) {
    console.error(`Erro ao ler dados do localStorage (${key})`, error);
    return null;
  }
}
