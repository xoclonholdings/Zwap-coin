import moveMotivateArtwork from "../../../../assets/zwap_move_motivate.png";
import playActivateArtwork from "../../../../assets/zwap_play_power.png";
import focusArtwork from "../../../../assets/zwap_focus_fantasy.png";
import chillArtwork from "../../../../assets/zwap_chill_collection.png";

export const streamModes = [
  {
    id: "zwap-radio",
    label: "ZWAP! Radio",
    title: "ZWAP! Radio",
    type: "bandcamp",
    status: "READY",
    embedProvider: "bandcamp",
    embedUrl: "",
    externalUrl: "https://poetreesmusic.bandcamp.com/album/zwap-radio",
    accent: "from-cyan-500/20 via-sky-500/10 to-purple-500/20",
  },
  {
    id: "spotify",
    label: "Spotify",
    title: "Spotify",
    subtitle: "Playlist bridge",
    type: "spotify",
    status: "CONNECT",
    description:
      "Spotify playlists can soundtrack MOVE, PLAY, focus, and chill sessions from inside the Stream surface.",
    embedProvider: "spotify",
    embedUrl: "",
    externalUrl: "",
    accent: "from-green-500/20 via-emerald-500/10 to-lime-500/20",
  },
  {
    id: "apple-music",
    label: "Apple Music",
    title: "Apple Music",
    subtitle: "Playlist bridge",
    type: "apple-music",
    status: "CONNECT",
    description:
      "Apple Music support gives users another major listening path without changing the ZWAP! Stream structure.",
    embedProvider: "apple-music",
    embedUrl: "",
    externalUrl: "",
    accent: "from-pink-500/20 via-purple-500/10 to-cyan-500/20",
  },
];

export const playlistItems = [
  {
    id: "playlist-move-motivate",
    title: "ZWAP! Move Motivate",
    subtitle: "Movement energy",
    type: "playlist",
    category: "move",
    duration: "PLAYLIST",
    reward: null,
    description:
      "High-energy music for walking, training, and getting the body moving.",
    artwork: moveMotivateArtwork,
    spotifyUrl: "",
    appleMusicUrl: "",
    bandcampUrl: "",
    accent: "from-cyan-500/20 via-sky-500/10 to-blue-500/20",
  },
  {
    id: "playlist-play-activate",
    title: "ZWAP! Play Activate",
    subtitle: "Game mode energy",
    type: "playlist",
    category: "play",
    duration: "PLAYLIST",
    reward: null,
    description:
      "Upbeat music for PLAY sessions, arcade energy, and quick reward loops.",
    artwork: playActivateArtwork,
    spotifyUrl: "",
    appleMusicUrl: "",
    bandcampUrl: "",
    accent: "from-fuchsia-500/20 via-cyan-500/10 to-purple-500/20",
  },
  {
    id: "playlist-focus-fantasy",
    title: "ZWAP! Focus Fantasy",
    subtitle: "Lock in",
    type: "playlist",
    category: "focus",
    duration: "PLAYLIST",
    reward: null,
    description:
      "Focused audio for learning, building, reading, and steady execution.",
    artwork: focusArtwork,
    spotifyUrl: "",
    appleMusicUrl: "",
    bandcampUrl: "",
    accent: "from-violet-500/20 via-purple-500/10 to-cyan-500/20",
  },
  {
    id: "playlist-chill-collection",
    title: "ZWAP! Chill Collection",
    subtitle: "Cool down",
    type: "playlist",
    category: "chill",
    duration: "PLAYLIST",
    reward: null,
    description:
      "Lower-energy music for recovery, reflection, cooldowns, and calm sessions.",
    artwork: chillArtwork,
    spotifyUrl: "",
    appleMusicUrl: "",
    bandcampUrl: "",
    accent: "from-cyan-500/20 via-indigo-500/10 to-purple-500/20",
  },
];

export const watchItems = [];
export const listenItems = streamModes;
export const liveItems = [];
export const libraryItems = playlistItems;

export function getStreamModeById(id) {
  return streamModes.find((item) => item.id === id) || streamModes[0];
}

export function getPlaylistById(id) {
  return playlistItems.find((item) => item.id === id) || null;
}

export function getStreamLibraryItems() {
  return playlistItems;
}

export default {
  streamModes,
  playlistItems,
  watchItems,
  listenItems,
  liveItems,
  libraryItems,
};