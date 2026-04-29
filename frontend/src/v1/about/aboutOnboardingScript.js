const ABOUT_VOICE_LINES = {
  "voice-1": ["ZWAP! turns", "simple actions", "into progress."],
  "voice-2": ["Whether MOVE", "or PLAY...", "ZWAP! keeps the score."],
  "voice-3": ["Your activity", "becomes zPts."],
  "voice-4": ["You can spend", "your zPts", "in our SHOP..."],
  "voice-5": ["Or save your zPts", "and SWAP them later", "for ZWAP! tokens."],
};

export function getAboutVoiceLines(stepId) {
  return ABOUT_VOICE_LINES[stepId] || [];
}