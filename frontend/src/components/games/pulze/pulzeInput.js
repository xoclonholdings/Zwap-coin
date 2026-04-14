export function createPulzeInput(onPulse) {
  function handleKey(e) {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      onPulse();
    }
  }

  function attach() {
    window.addEventListener("keydown", handleKey);
  }

  function detach() {
    window.removeEventListener("keydown", handleKey);
  }

  return {
    attach,
    detach,
  };
}