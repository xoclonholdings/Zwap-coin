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
  let isPointerDown = false;
  let lastTapAt = 0;

  const getRelativeX = (clientX) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / Math.max(1, rect.width);

    return (clientX - rect.left) * scaleX;
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

  const handlePointerDown = (e) => {
    isPointerDown = true;
    movePaddle(e.clientX);

    try {
      canvas.setPointerCapture?.(e.pointerId);
    } catch {
      // Pointer capture is optional.
    }
  };

  const handlePointerMove = (e) => {
    if (!isPointerDown && e.pointerType !== "mouse") return;

    movePaddle(e.clientX);
  };

  const handlePointerUp = (e) => {
    isPointerDown = false;

    try {
      canvas.releasePointerCapture?.(e.pointerId);
    } catch {
      // Pointer capture is optional.
    }
  };

  const handleClick = () => {
    const currentTime = Date.now();
    const isDoubleTap = currentTime - lastTapAt < 260;

    lastTapAt = currentTime;

    if (isDoubleTap) {
      togglePause?.();
      onTap?.();
    }
  };

  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  canvas.addEventListener("touchend", handleTouchEnd);

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerUp);

  canvas.addEventListener("click", handleClick);

  return () => {
    canvas.removeEventListener("touchstart", handleTouchStart);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchend", handleTouchEnd);

    canvas.removeEventListener("pointerdown", handlePointerDown);
    canvas.removeEventListener("pointermove", handlePointerMove);
    canvas.removeEventListener("pointerup", handlePointerUp);
    canvas.removeEventListener("pointercancel", handlePointerUp);

    canvas.removeEventListener("click", handleClick);
  };
}