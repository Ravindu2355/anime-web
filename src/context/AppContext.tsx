import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Anime, UserProfile, UserProgress, Episode } from "../types";
import { fetchAnimeList, onAuthChanged, updateUserProfile, logUserActivity } from "../services/firebase";
import { translations, LanguageCode, TranslationDictionary } from "../services/languages";

interface OfflineEpisode {
  animeId: string;
  animeTitle: string;
  episode: Episode;
  downloadedAt: string;
  fileSize: string;
  progress: number; // 0 to 100
  speed?: string; // e.g. "8.2 MB/s"
}

interface AppContextType {
  user: UserProfile | null;
  loading: boolean;
  theme: "dark" | "light";
  language: LanguageCode;
  t: TranslationDictionary;
  animeList: Anime[];
  watchlist: Anime[];
  recommendations: Anime[];
  offlineEpisodes: OfflineEpisode[];
  downloadEpisode: (anime: Anime, episode: Episode) => Promise<void>;
  deleteDownloadedEpisode: (episodeId: string) => void;
  toggleWatchlist: (animeId: string) => Promise<void>;
  updateEpisodeProgress: (animeId: string, episode: Episode, watchedSeconds: number, totalSeconds: number) => Promise<void>;
  setLanguage: (lang: LanguageCode) => void;
  toggleTheme: () => void;
  refreshAnime: () => Promise<void>;
  offlineMode: boolean;
  setOfflineMode: (offline: boolean) => void;
  activePartyRoomId: string | null;
  setActivePartyRoomId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [language, setLanguageState] = useState<LanguageCode>("en");
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [watchlist, setWatchlist] = useState<Anime[]>([]);
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [offlineEpisodes, setOfflineEpisodes] = useState<OfflineEpisode[]>([]);
  const [offlineMode, setOfflineMode] = useState<boolean>(false);
  const [activePartyRoomId, setActivePartyRoomId] = useState<string | null>(null);

  const t = translations[language];

  // Refresh and load entire Anime list
  const refreshAnime = async () => {
    try {
      const data = await fetchAnimeList();
      setAnimeList(data);
    } catch (e) {
      console.error("Error loading anime list", e);
    }
  };

  useEffect(() => {
    refreshAnime();
    
    // Check local storage for offline downloads
    try {
      const stored = localStorage.getItem("local_offline_episodes");
      if (stored) {
        setOfflineEpisodes(JSON.parse(stored));
      }
    } catch {}

    // Monitor authentications
    const unsubscribe = onAuthChanged((profile) => {
      setUser(profile);
      setLoading(false);
      if (profile) {
        if (profile.language && ["en", "ja", "es", "si", "fr"].includes(profile.language)) {
          setLanguageState(profile.language as LanguageCode);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Update watchlist and recommendations when user or anime list changes
  useEffect(() => {
    if (!animeList.length) return;

    if (user) {
      // 1. Sync Watchlist
      const filteredWatchlist = animeList.filter((a) => user.watchlist.includes(a.id));
      setWatchlist(filteredWatchlist);

      // 2. Personalized Recommendations Engine
      // Analyzes user watch history (genres they watched) + watchlist genres to score other anime
      const watchedAnimes = Object.keys(user.progress);
      const userFavGenres: { [genre: string]: number } = {};

      // Analyze user watchlist genres
      filteredWatchlist.forEach((a) => {
        a.genres.forEach((g) => {
          userFavGenres[g] = (userFavGenres[g] || 0) + 2; // Weight watchlist higher
        });
      });

      // Analyze watched anime progress and ratings
      watchedAnimes.forEach((animeId) => {
        const animeObj = animeList.find((a) => a.id === animeId);
        if (animeObj) {
          const prog = user.progress[animeId];
          const multiplier = prog.completed ? 3 : 1; // Completed anime reflects stronger taste
          animeObj.genres.forEach((g) => {
            userFavGenres[g] = (userFavGenres[g] || 0) + multiplier;
          });
        }
      });

      // Calculate recommendations by ranking anime NOT watched or in watchlist
      const scoredAnime = animeList.map((a) => {
        let score = a.score || 5; // Base score

        // Boost score based on genre overlap with user profile
        a.genres.forEach((g) => {
          if (userFavGenres[g]) {
            score += userFavGenres[g] * 0.5; // Add matching weight
          }
        });

        // Slight reduction for already fully completed anime to support discovery
        const watched = user.progress[a.id];
        if (watched && watched.completed) {
          score -= 2;
        }

        return { anime: a, score };
      });

      // Sort by score and take top 6
      const ranked = scoredAnime
        .sort((a, b) => b.score - a.score)
        .map((x) => x.anime);

      setRecommendations(ranked.slice(0, 6));
    } else {
      // Guest Mode: Recommend based on top ratings and featured tag
      setWatchlist([]);
      const featured = animeList.filter((a) => a.featured || a.score > 8.5);
      setRecommendations(featured.slice(0, 6));
    }
  }, [user, animeList]);

  // Set Language
  const setLanguage = async (lang: LanguageCode) => {
    setLanguageState(lang);
    if (user) {
      const updated = { ...user, language: lang };
      setUser(updated);
      await updateUserProfile(updated);
    }
  };

  // Toggle Dark/Light Theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Sync watchlist to profile
  const toggleWatchlist = async (animeId: string) => {
    if (!user) return;
    const isAdded = user.watchlist.includes(animeId);
    let newWatchlist = [...user.watchlist];
    if (isAdded) {
      newWatchlist = newWatchlist.filter((id) => id !== animeId);
    } else {
      newWatchlist.push(animeId);
    }

    const updated = { ...user, watchlist: newWatchlist };
    setUser(updated);
    await updateUserProfile(updated);
    await logUserActivity(
      user.username,
      user.uid,
      isAdded ? "Removed Watchlist" : "Added Watchlist",
      `Toggled watch status for ${animeId}`
    );
  };

  // Update real-time episode watching progress & device sync
  const updateEpisodeProgress = async (
    animeId: string,
    episode: Episode,
    watchedSeconds: number,
    totalSeconds: number
  ) => {
    if (!user) return;

    const completed = watchedSeconds >= totalSeconds * 0.9; // 90% watched counts as completed
    const existingProgress = user.progress[animeId];
    
    // Only update if progress is positive or higher than before
    if (existingProgress && existingProgress.episodeId === episode.id && existingProgress.watchedDuration > watchedSeconds && !completed) {
      return; // Skip writing stale updates to reduce operations
    }

    const updatedProgress: UserProgress = {
      animeId,
      episodeId: episode.id,
      episodeNumber: episode.episodeNumber,
      watchedDuration: Math.round(watchedSeconds),
      totalDuration: Math.round(totalSeconds),
      completed,
      lastWatchedAt: new Date().toISOString(),
    };

    const updated = {
      ...user,
      progress: {
        ...user.progress,
        [animeId]: updatedProgress,
      },
    };

    setUser(updated);
    await updateUserProfile(updated);

    if (completed && (!existingProgress || !existingProgress.completed)) {
      await logUserActivity(
        user.username,
        user.uid,
        "Finished Episode",
        `Completed episode ${episode.episodeNumber} of anime ID: ${animeId}`
      );
    }
  };

  // Multi-device Offline downloads manager with realistic progressive visual simulator
  const downloadEpisode = async (anime: Anime, episode: Episode) => {
    if (!user) return;

    // Check if already downloading or downloaded
    const exists = offlineEpisodes.find((x) => x.episode.id === episode.id);
    if (exists) return;

    const newDownload: OfflineEpisode = {
      animeId: anime.id,
      animeTitle: anime.title,
      episode,
      downloadedAt: new Date().toLocaleString(),
      fileSize: "148.5 MB",
      progress: 5,
      speed: "4.5 MB/s",
    };

    const updatedList = [...offlineEpisodes, newDownload];
    setOfflineEpisodes(updatedList);
    localStorage.setItem("local_offline_episodes", JSON.stringify(updatedList));

    // Simulate real-time progressive downloading ticks
    const interval = setInterval(() => {
      setOfflineEpisodes((current) => {
        const itemIdx = current.findIndex((x) => x.episode.id === episode.id);
        if (itemIdx === -1) {
          clearInterval(interval);
          return current;
        }

        const updated = [...current];
        const item = updated[itemIdx];
        if (item.progress >= 100) {
          clearInterval(interval);
          item.progress = 100;
          item.speed = undefined;
          
          // Sync download lists to Firebase Profile
          const newProfileDownloads = Array.from(new Set([...user.offlineDownloads, episode.id]));
          const updatedUser = { ...user, offlineDownloads: newProfileDownloads };
          setUser(updatedUser);
          updateUserProfile(updatedUser);
          
          logUserActivity(
            user.username,
            user.uid,
            "Downloaded Episode",
            `Successfully downloaded ${episode.title} for offline viewing`
          );
        } else {
          item.progress += Math.floor(Math.random() * 20) + 10;
          item.speed = (Math.random() * 5 + 6).toFixed(1) + " MB/s";
        }

        localStorage.setItem("local_offline_episodes", JSON.stringify(updated));
        return updated;
      });
    }, 800);
  };

  const deleteDownloadedEpisode = (episodeId: string) => {
    const updated = offlineEpisodes.filter((x) => x.episode.id !== episodeId);
    setOfflineEpisodes(updated);
    localStorage.setItem("local_offline_episodes", JSON.stringify(updated));

    if (user) {
      const remaining = user.offlineDownloads.filter((id) => id !== episodeId);
      const updatedUser = { ...user, offlineDownloads: remaining };
      setUser(updatedUser);
      updateUserProfile(updatedUser);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        theme,
        language,
        t,
        animeList,
        watchlist,
        recommendations,
        offlineEpisodes,
        downloadEpisode,
        deleteDownloadedEpisode,
        toggleWatchlist,
        updateEpisodeProgress,
        setLanguage,
        toggleTheme,
        refreshAnime,
        offlineMode,
        setOfflineMode,
        activePartyRoomId,
        setActivePartyRoomId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside an AppProvider");
  return context;
};
