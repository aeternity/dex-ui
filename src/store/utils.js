export const fetchJson = async (...args) => {
  const response = await fetch(...args);
  return response.json();
};

export const MAGNITUDE = 18;
