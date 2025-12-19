const addPersistData = (key, data) => {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(key, data);
  }
};

const deletePersistData = (key) => {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem(key);
  }
};

const clearPersistData = () => {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.clear();
  }
};

const getPersistData = (key) => {
  if (typeof window !== "undefined" && window.localStorage) {
    return JSON.parse(window.localStorage.getItem(key)) ?? null;
  }
  return null;
};

export { addPersistData, deletePersistData, clearPersistData, getPersistData };
