const SPOTIFY_WEB_BASE = "https://open.spotify.com";

function safeOpenExternalUrl(url) {
  if (!url) return false;

  try {
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
  } catch {
    window.location.href = url;
    return true;
  }
}

export function normalizeSpotifyUrl(url = "") {
  const safeUrl = String(url || "").trim();

  if (!safeUrl) return "";

  if (safeUrl.startsWith("spotify:")) {
    const parts = safeUrl.split(":");
    const type = parts[1];
    const id = parts[2];

    if (type && id) {
      return `${SPOTIFY_WEB_BASE}/${type}/${id}`;
    }

    return "";
  }

  if (safeUrl.includes("open.spotify.com")) {
    return safeUrl;
  }

  return "";
}

export function connectSpotify(url = "") {
  const normalizedUrl = normalizeSpotifyUrl(url);

  if (normalizedUrl) {
    return safeOpenExternalUrl(normalizedUrl);
  }

  return safeOpenExternalUrl(SPOTIFY_WEB_BASE);
}

export function openSpotifyPlaylist(playlistUrl = "") {
  return connectSpotify(playlistUrl);
}

export function openSpotifySearch(query = "ZWAP") {
  const safeQuery = encodeURIComponent(String(query || "ZWAP").trim());
  return safeOpenExternalUrl(`${SPOTIFY_WEB_BASE}/search/${safeQuery}`);
}

export default connectSpotify;