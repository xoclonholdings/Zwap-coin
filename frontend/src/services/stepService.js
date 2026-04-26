let listeners = [];
let currentSteps = 0;

export function setSteps(steps) {
  const safe = Math.max(0, Number(steps || 0));
  currentSteps = safe;

  listeners.forEach((cb) => cb(currentSteps));
}

export function subscribeToSteps(callback) {
  if (typeof callback !== "function") return () => {};

  listeners.push(callback);

  // send current immediately
  callback(currentSteps);

  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

export function getCurrentSteps() {
  return currentSteps;
}