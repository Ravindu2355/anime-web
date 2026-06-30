export interface VideoSource {
  quality: "1080p" | "720p" | "480p" | "Auto";
  url: string;
  isIframe: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  text: string;
  timestamp: string;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  duration: string;
  description?: string;
  thumbnailUrl?: string;
  sources: VideoSource[];
  driveDownloadLink?: string;
  directDownloadLink?: string;
}

export interface Anime {
  id: string;
  title: string;
  originalTitle?: string;
  description: string;
  rating: number;
  releaseYear: number;
  status: "ongoing" | "completed";
  type: "TV" | "Movie" | "OVA";
  genres: string[];
  bannerUrl: string;
  thumbnailUrl: string;
  totalEpisodes: number;
  episodes: Episode[];
  viewCount: number;
  score: number;
  likes: number;
  tags: string[];
  featured?: boolean;
}

export interface UserProgress {
  animeId: string;
  episodeId: string;
  episodeNumber: number;
  watchedDuration: number; // in seconds
  totalDuration: number; // in seconds
  completed: boolean;
  lastWatchedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  avatarUrl: string;
  role: "admin" | "user";
  watchlist: string[]; // animeIds
  progress: { [animeId: string]: UserProgress };
  offlineDownloads: string[]; // episodeIds
  language: string;
  createdAt: string;
}

export interface UserLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SystemAnalytics {
  viewsByDay: { date: string; views: number }[];
  registrationsByDay: { date: string; users: number }[];
  genreDistribution: { genre: string; count: number }[];
  mostPopularAnime: { title: string; views: number }[];
}

export interface FirebaseConfigCustom {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
