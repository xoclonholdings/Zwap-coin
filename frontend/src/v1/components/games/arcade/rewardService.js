export function getBaseZpts(result = {}) {
  return Number(result?.baseZpts || result?.zpts || 0);
}

export function getFinalZpts(result = {}, { doubled = false } = {}) {
  const baseZpts = getBaseZpts(result);

  if (doubled) {
    return baseZpts * 2;
  }

  return baseZpts;
}

export function buildArcadeRewardResult(result = {}, options = {}) {
  const doubled = Boolean(options.doubled);
  const finalZpts = getFinalZpts(result, { doubled });

  return {
    ...result,
    baseZpts: getBaseZpts(result),
    finalZpts,
    doubled,
  };
}

export function buildReviveResult(result = {}) {
  return {
    ...result,
    revived: true,
    extraLivesGranted: 1,
  };
}

export function normalizeArcadeFinalResult(gameId = "", result = {}) {
  return {
    gameId,
    game_type: gameId,
    score: Number(result?.score || 0),
    level: Number(result?.level || result?.round || 1),
    blocksDestroyed: Number(result?.blocksDestroyed || 0),
    sessionDurationSeconds: Number(result?.sessionDurationSeconds || 0),
    completed: true,
    baseZpts: getBaseZpts(result),
    finalZpts: Number(result?.finalZpts || getBaseZpts(result)),
    doubled: Boolean(result?.doubled),
    revived: Boolean(result?.revived),
    extraLivesGranted: Number(result?.extraLivesGranted || 0),
  };
}