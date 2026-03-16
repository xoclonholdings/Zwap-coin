const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI

const SCOPES = [
  "user-read-email",
  "user-read-private",
  "playlist-read-private",
  "playlist-read-collaborative",
]

export function connectSpotify() {
  const authUrl = new URL("https://accounts.spotify.com/authorize")

  authUrl.searchParams.append("client_id", CLIENT_ID)
  authUrl.searchParams.append("response_type", "token")
  authUrl.searchParams.append("redirect_uri", REDIRECT_URI)
  authUrl.searchParams.append("scope", SCOPES.join(" "))
  authUrl.searchParams.append("show_dialog", "true")

  window.location.href = authUrl.toString()
}