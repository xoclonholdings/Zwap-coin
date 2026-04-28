export function attachPulzeInput({ canvas, onTrigger, onTogglePause }) {
  if (!canvas) return () => {};

  const handlePointerDown = (event) => {
    event.preventDefault();
    onTrigger?.();
  };

  const handleKeyDown = (event) => {
    if (event.code === "Space" || event.code === "Enter") {
      event.preventDefault();
      onTrigger?.();
    }

    if (event.code === "Escape") {
      event.preventDefault();
      onTogglePause?.();
    }
  };

  canvas.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("keydown", handleKeyDown);

  return () => {
    canvas.removeEventListener("pointerdown", handlePointerDown);
    window.removeEventListener("keydown", handleKeyDown);
  };
}
