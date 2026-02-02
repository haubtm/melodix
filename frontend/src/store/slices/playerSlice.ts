import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Song } from "@/types";

export type RepeatMode = "off" | "all" | "one";

interface PlayerState {
  currentSong: Song | null;
  playlist: Song[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  isMuted: boolean;
}

const initialState: PlayerState = {
  currentSong: null,
  playlist: [],
  currentIndex: 0,
  isPlaying: false,
  volume: 80,
  progress: 0,
  duration: 0,
  shuffle: false,
  repeat: "off",
  isMuted: false,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    playSong: (
      state,
      action: PayloadAction<{ song: Song; playlist?: Song[] }>,
    ) => {
      state.currentSong = action.payload.song;
      state.isPlaying = true;
      state.progress = 0;

      if (action.payload.playlist) {
        state.playlist = action.payload.playlist;
        state.currentIndex = action.payload.playlist.findIndex(
          (s) => s.id === action.payload.song.id,
        );
      }
    },

    setPlaylist: (state, action: PayloadAction<Song[]>) => {
      state.playlist = action.payload;
    },

    togglePlay: (state) => {
      if (state.currentSong) {
        state.isPlaying = !state.isPlaying;
      }
    },

    play: (state) => {
      if (state.currentSong) {
        state.isPlaying = true;
      }
    },

    pause: (state) => {
      state.isPlaying = false;
    },

    nextTrack: (state) => {
      if (state.playlist.length === 0) return;

      let nextIndex: number;
      if (state.shuffle) {
        nextIndex = Math.floor(Math.random() * state.playlist.length);
      } else {
        nextIndex = (state.currentIndex + 1) % state.playlist.length;
      }

      state.currentIndex = nextIndex;
      state.currentSong = state.playlist[nextIndex];
      state.progress = 0;
      state.isPlaying = true;
    },

    previousTrack: (state) => {
      if (state.playlist.length === 0) return;

      // If we're more than 3 seconds into the song, restart it
      if (state.progress > 3) {
        state.progress = 0;
        return;
      }

      let prevIndex: number;
      if (state.shuffle) {
        prevIndex = Math.floor(Math.random() * state.playlist.length);
      } else {
        prevIndex = state.currentIndex - 1;
        if (prevIndex < 0) prevIndex = state.playlist.length - 1;
      }

      state.currentIndex = prevIndex;
      state.currentSong = state.playlist[prevIndex];
      state.progress = 0;
      state.isPlaying = true;
    },

    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },

    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },

    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
      state.isMuted = action.payload === 0;
    },

    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },

    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },

    toggleRepeat: (state) => {
      const modes: RepeatMode[] = ["off", "all", "one"];
      const currentIndex = modes.indexOf(state.repeat);
      state.repeat = modes[(currentIndex + 1) % modes.length];
    },

    setRepeat: (state, action: PayloadAction<RepeatMode>) => {
      state.repeat = action.payload;
    },

    addToQueue: (state, action: PayloadAction<Song>) => {
      const insertIndex = state.currentIndex + 1;
      state.playlist.splice(insertIndex, 0, action.payload);
    },

    clearQueue: (state) => {
      state.playlist = state.currentSong ? [state.currentSong] : [];
      state.currentIndex = 0;
    },
  },
});

export const {
  playSong,
  setPlaylist,
  togglePlay,
  play,
  pause,
  nextTrack,
  previousTrack,
  setProgress,
  setDuration,
  setVolume,
  toggleMute,
  toggleShuffle,
  toggleRepeat,
  setRepeat,
  addToQueue,
  clearQueue,
} = playerSlice.actions;

export default playerSlice.reducer;
