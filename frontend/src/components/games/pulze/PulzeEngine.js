import { PULZE_CONFIG } from "./pulzeConfig";
import {
  clamp,
  getTarget,
  getPulseDuration,
  evaluateHit,
} from "./pulzeUtils";

export default class PulzeEngine {
  constructor({ level = 1, onUpdate, onEnd }) {
    this.level = level;
    this.onUpdate = onUpdate;
    this.onEnd = onEnd;

    this.reset();
  }

  reset() {
    this.beatsLeft = PULZE_CONFIG.TOTAL_BEATS;
    this.score = 0;
    this.combo = 0;
    this.bestHit = 0;

    this.progress = 0;
    this.direction = 1;
    this.target = getTarget();

    this.active = true;

    this.lastTime = 0;
    this.raf = null;
  }

  start() {
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  loop(timestamp) {
    if (!this.active) return;

    if (!this.lastTime) this.lastTime = timestamp;

    const delta = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    const duration = getPulseDuration(this.level);
    const unitsPerSec =
      (PULZE_CONFIG.TRACK.MAX - PULZE_CONFIG.TRACK.MIN) /
      (duration / 1000);

    this.progress += this.direction * unitsPerSec * delta;

    if (this.progress >= PULZE_CONFIG.TRACK.MAX) {
      this.progress = PULZE_CONFIG.TRACK.MAX;
      this.direction = -1;
    } else if (this.progress <= PULZE_CONFIG.TRACK.MIN) {
      this.progress = PULZE_CONFIG.TRACK.MIN;
      this.direction = 1;
    }

    this.emit();

    this.raf = requestAnimationFrame(this.loop);
  }

  pulse() {
    if (!this.active || this.beatsLeft <= 0) return;

    this.active = false;

    const result = evaluateHit(
      this.progress,
      this.target,
      this.level,
      this.combo
    );

    this.score += result.points;
    this.beatsLeft -= 1;

    if (result.hit) {
      this.combo += 1;
      this.bestHit = Math.max(this.bestHit, result.points);
    } else {
      this.combo = 0;
    }

    this.emit(result);

    if (this.beatsLeft <= 0) {
      setTimeout(() => {
        this.onEnd(this.score);
      }, 600);
      return;
    }

    setTimeout(() => {
      this.nextRound();
    }, 500);
  }

  nextRound() {
    this.target = getTarget();
    this.active = true;
    this.lastTime = 0;
  }

  emit(result = null) {
    this.onUpdate({
      progress: this.progress,
      target: this.target,
      score: this.score,
      combo: this.combo,
      beatsLeft: this.beatsLeft,
      bestHit: this.bestHit,
      result,
    });
  }
}