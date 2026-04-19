export function attachStackzInput({
  canvas,
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDropStart,
  onSoftDropStop,
  onHardDrop,
  onTogglePause,
}) {
  if (!canvas) return () => {};

  let touchStartX = 0;
  let touchStartY = 0;
  let lastMoveX = 0;
  let lastMoveY = 0;
  let touchMoved = false;
  let softDropActive = false;

  const SWIPE_X_THRESHOLD = 24;
  const SWIPE_Y_THRESHOLD = 26;
  const HARD_DROP_THRESHOLD = 72;

  function resetTouchState() {
    touchStartX = 0;
    touchStartY = 0;
    lastMoveX = 0;
    lastMoveY = 0;
    touchMoved = false;

    if (softDropActive) {
      softDropActive = false;
      onSoftDropStop?.();
    }
  }

  function handleTouchStart(e) {
    if (!e.touches?.[0]) return;

    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    lastMoveX = touch.clientX;
    lastMoveY = touch.clientY;
    touchMoved = false;
  }

  function handleTouchMove(e) {
    if (!e.touches?.[0]) return;

    e.preventDefault();

    const touch = e.touches[0];
    const dx = touch.clientX - lastMoveX;
    const dyFromStart = touch.clientY - touchStartY;
    const dyFromLast = touch.clientY - lastMoveY;

    if (Math.abs(dx) >= SWIPE_X_THRESHOLD) {
      if (dx > 0) {
        onMoveRight?.();
      } else {
        onMoveLeft?.();
      }

      lastMoveX = touch.clientX;
      touchMoved = true;
    }

    if (dyFromStart >= HARD_DROP_THRESHOLD) {
      if (softDropActive) {
        softDropActive = false;
        onSoftDropStop?.();
      }

      onHardDrop?.();
      touchMoved = true;
      touchStartY = touch.clientY;
      lastMoveY = touch.clientY;
      return;
    }

    if (dyFromLast >= SWIPE_Y_THRESHOLD) {
      if (!softDropActive) {
        softDropActive = true;
        onSoftDropStart?.();
      }

      lastMoveY = touch.clientY;
      touchMoved = true;
    }
  }

  function handleTouchEnd(e) {
    e.preventDefault();

    if (!touchMoved) {
      onRotate?.();
    }

    resetTouchState();
  }

  function handleTouchCancel() {
    resetTouchState();
  }

  function handleKeyDown(e) {
    if (e.repeat && (e.key === "ArrowUp" || e.key === " ")) {
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      onMoveLeft?.();
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      onMoveRight?.();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      onRotate?.();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      onSoftDropStart?.();
      return;
    }

    if (e.key === " ") {
      e.preventDefault();
      onHardDrop?.();
      return;
    }

    if (e.key.toLowerCase() === "p" || e.key === "Escape") {
      e.preventDefault();
      onTogglePause?.();
    }
  }

  function handleKeyUp(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      onSoftDropStop?.();
    }
  }

  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
  canvas.addEventListener("touchcancel", handleTouchCancel, { passive: false });

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  return () => {
    canvas.removeEventListener("touchstart", handleTouchStart);
    canvas.removeEventListener("touchmove", handleTouchMove);
    canvas.removeEventListener("touchend", handleTouchEnd);
    canvas.removeEventListener("touchcancel", handleTouchCancel);

    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
  };
}