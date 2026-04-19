import { clamp } from "./breakerzUtils";

export function attachBreakerzInput({
  canvas,
  getState,
  setPaddleX,
  togglePause,
  onTap,
}) {
  if (!canvas) return () => {};

  let isTouching = false;

  const getRelativeX = (clientX) => {
    const rect = canvas.getBoundingClientRect();
    return clientX - rect.left;
  };

  const movePaddle = (clientX) => {
    const state = getState?.();
    if (!state) return;

    const width = state.width || canvas.width;
    const paddleWidth = state.paddle?.width || 80;

    const x = getRelativeX(clientX);

    const next = clamp(x - paddleWidth / 2, 0, width - paddleWidth);
    setPaddleX?.(next);
  };

  const handleTouchStart = (e) => {
    if (!e.touches?.[0]) return;
    isTouching = true;
    movePaddle(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!e.touches?.[0]) return;
    e.preventDefault();
    movePaddle(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isTouching) return;
    isTouching = false;
  };

  const handleMouseMove = (e) => {
    movePaddle(e.clientX);
  };

  const handleClick = () => {
    // tap = toggle pause (arcade feel)
    togglePause?.();
    onTap?.();
  };

  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  canvas.addEventListener("touchend", handleTouchEnd);

  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("click", handleClick);

  return () => {
    canvas.removeEventListener("touchstart", handleTouchStart);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchend", handleTouchEnd);

    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("click", handleClick);
  };
}