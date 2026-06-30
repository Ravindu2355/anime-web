import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  limit,
  orderBy,
  Firestore
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  Auth
} from "firebase/auth";
import { Anime, UserProfile, Comment, UserLog, FirebaseConfigCustom } from "../types";

// Master seed data for pre-populating database when running locally or on initial setup
const SEED_ANIME_DATA: Anime[] = [
  {
    id: "frieren-beyond-journeys-end",
    title: "Frieren: Beyond Journey's End",
    originalTitle: "Sōsō no Frieren",
    description: "Mage Frieren and her courageous fellow adventurers have defeated the Demon King and brought peace to the land. But Frieren will long outlive the rest of her former party. How will she come to understand what life means to the people around her?",
    rating: 9.6,
    releaseYear: 2023,
    status: "completed",
    type: "TV",
    genres: ["Adventure", "Drama", "Fantasy"],
    bannerUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop",
    totalEpisodes: 28,
    viewCount: 14520,
    score: 9.62,
    likes: 4210,
    tags: ["Elves", "Magic", "Journey", "Masterpiece"],
    featured: true,
    episodes: [
      {
        id: "frieren-ep-1",
        episodeNumber: 1,
        title: "The Journey's End",
        duration: "24:10",
        description: "The party of adventurers returns victorious after a ten-year quest to defeat the Demon King, and prepares to go their separate ways.",
        thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop",
        sources: [
          { quality: "1080p", url: "https://www.youtube.com/embed/qgQkT56RL10", isIframe: true },
          { quality: "720p", url: "https://www.youtube.com/embed/qgQkT56RL10", isIframe: true },
          { quality: "480p", url: "https://www.youtube.com/embed/qgQkT56RL10", isIframe: true }
        ],
        driveDownloadLink: "https://drive.google.com/uc?export=download&id=DRIVE_EP1_SAMPLE",
        directDownloadLink: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
      },
      {
        id: "frieren-ep-2",
        episodeNumber: 2,
        title: "It Didn't Have to Be Magic",
        duration: "23:45",
        description: "Frieren visits her old friend Heiter, who has adopted an orphan named Fern, and asks Frieren to take her on as an apprentice.",
        thumbnailUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=400&auto=format&fit=crop",
        sources: [
          { quality: "1080p", url: "https://www.youtube.com/embed/K8vGvN_v2iA", isIframe: true },
          { quality: "720p", url: "https://www.youtube.com/embed/K8vGvN_v2iA", isIframe: true },
          { quality: "480p", url: "https://www.youtube.com/embed/K8vGvN_v2iA", isIframe: true }
        ],
        driveDownloadLink: "https://drive.google.com/uc?export=download&id=DRIVE_EP2_SAMPLE",
        directDownloadLink: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
      }
    ]
  },
  {
    id: "demon-slayer-kimetsu",
    title: "Demon Slayer: Kimetsu no Yaiba",
    originalTitle: "Kimetsu no Yaiba",
    description: "Tanjiro Kamado, a kindhearted boy who sells charcoal for a living, finds his family slaughtered by a demon. To make matters worse, his younger sister Nezuko, the sole survivor, has been transformed into a demon herself. Tanjiro resolves to become a 'demon slayer' so that he can turn his sister back into a human.",
    rating: 8.7,
    releaseYear: 2019,
    status: "ongoing",
    type: "TV",
    genres: ["Action", "Fantasy", "Historical"],
    bannerUrl: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=1200&auto=format&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=400&auto=format&fit=crop",
    totalEpisodes: 55,
    viewCount: 38920,
    score: 8.91,
    likes: 12450,
    tags: ["Demons", "Swords", "Shonen", "Ufotable"],
    featured: true,
    episodes: [
      {
        id: "demonslayer-ep-1",
        episodeNumber: 1,
        title: "Cruelty",
        duration: "23:30",
        description: "Tanjiro Kamado's life is ruined when he returns home to find his family slaughtered by a demon.",
        thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&auto=format&fit=crop",
        sources: [
          { quality: "1080p", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", isIframe: true },
          { quality: "720p", url: "https://www.youtube.com/embed/dQw4w9WgXcQ", isIframe: true }
        ],
        driveDownloadLink: "https://drive.google.com/uc?export=download&id=DS_EP1",
        directDownloadLink: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
      }
    ]
  },
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    originalTitle: "Shingeki no Kyojin",
    description: "Centuries ago, mankind was slaughtered to near extinction by monstrous humanoid creatures called Titans, forcing humans to hide in fear behind enormous concentric walls. What makes these giants truly terrifying is that their taste for human flesh is not born of hunger but what seems to be out of pleasure.",
    rating: 9.1,
    releaseYear: 2013,
    status: "completed",
    type: "TV",
    genres: ["Action", "Drama", "Suspense"],
    bannerUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?q=80&w=400&auto=format&fit=crop",
    totalEpisodes: 87,
    viewCount: 45620,
    score: 9.15,
    likes: 18900,
    tags: ["Titans", "Military", "Post-apocalyptic", "Masterpiece"],
    featured: false,
    episodes: [
      {
        id: "aot-ep-1",
        episodeNumber: 1,
        title: "To You, in 2000 Years: The Fall of Shiganshina, Part 1",
        duration: "24:00",
        description: "For over a century, humans have lived inside walled cities in fear of Titans. Suddenly, an immense Titan breaches the wall.",
        thumbnailUrl: "https://images.unsplash.com/photo-1516339901601-2e1d62dc0c45?q=80&w=400&auto=format&fit=crop",
        sources: [
          { quality: "1080p", url: "https://www.youtube.com/embed/MGRm4IZK1R8", isIframe: true },
          { quality: "720p", url: "https://www.youtube.com/embed/MGRm4IZK1R8", isIframe: true }
        ],
        driveDownloadLink: "https://drive.google.com/uc?export=download&id=AOT_EP1",
        directDownloadLink: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
      }
    ]
  },
  {
    id: "your-name",
    title: "Your Name.",
    originalTitle: "Kimi no Na wa.",
    description: "Mitsuha Miyamizu, a high school girl, yearns to live the life of a boy in the bustling city of Tokyo—a dream that stands in sharp contrast to her present life in the countryside. Meanwhile in the city, Taki Tachibana lives a busy life as a high school student while juggling his part-time job and hopes for a career in architecture. One day, Mitsuha awakens in a room that is not her own and suddenly finds herself living the dream life in Tokyo—but in Taki's body!",
    rating: 8.9,
    releaseYear: 2016,
    status: "completed",
    type: "Movie",
    genres: ["Drama", "Romance", "Supernatural"],
    bannerUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=1200&auto=format&fit=crop",
    thumbnailUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=400&auto=format&fit=crop",
    totalEpisodes: 1,
    viewCount: 29800,
    score: 8.96,
    likes: 11200,
    tags: ["Shinkai", "Body-swap", "Comet", "Romance"],
    featured: false,
    episodes: [
      {
        id: "yourname-movie",
        episodeNumber: 1,
        title: "Full Movie",
        duration: "1:46:00",
        description: "Two strangers find themselves linked in a bizarre way. When a connection is formed, will distance be the only thing to keep them apart?",
        thumbnailUrl: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?q=80&w=400&auto=format&fit=crop",
        sources: [
          { quality: "1080p", url: "https://www.youtube.com/embed/hRfHcp2GjVI", isIframe: true },
          { quality: "720p", url: "https://www.youtube.com/embed/hRfHcp2GjVI", isIframe: true }
        ],
        driveDownloadLink: "https://drive.google.com/uc?export=download&id=YOUR_NAME_MOVIE",
        directDownloadLink: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
      }
    ]
  }
];

// Helper to load customized Firebase credentials if any saved in localStorage
export function getSavedFirebaseConfig(): FirebaseConfigCustom | null {
  try {
    const data = localStorage.getItem("custom_firebase_config");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveFirebaseConfig(config: FirebaseConfigCustom) {
  localStorage.setItem("custom_firebase_config", JSON.stringify(config));
}

export function deleteFirebaseConfig() {
  localStorage.removeItem("custom_firebase_config");
}

// State variables for Firebase connection
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let isFirebaseActive = false;

// Initialize Firebase dynamically if config is available
function initFirebase() {
  const config = getSavedFirebaseConfig();
  if (config && config.apiKey) {
    try {
      if (getApps().length === 0) {
        app = initializeApp(config);
      } else {
        app = getApp();
      }
      db = getFirestore(app);
      auth = getAuth(app);
      isFirebaseActive = true;
      console.log("Firebase initialized successfully using customized config!");
    } catch (e) {
      console.error("Failed to initialize Firebase with custom config", e);
      isFirebaseActive = false;
    }
  } else {
    isFirebaseActive = false;
  }
}

// Run initial initialization
initFirebase();

// Local storage backup database helpers to guarantee 100% full-featured offline/AI-Studio preview operation
class LocalDBService {
  private getAnime(): Anime[] {
    try {
      const stored = localStorage.getItem("local_anime_list");
      if (!stored) {
        localStorage.setItem("local_anime_list", JSON.stringify(SEED_ANIME_DATA));
        return SEED_ANIME_DATA;
      }
      return JSON.parse(stored);
    } catch {
      return SEED_ANIME_DATA;
    }
  }

  private saveAnime(anime: Anime[]) {
    localStorage.setItem("local_anime_list", JSON.stringify(anime));
  }

  private getLogs(): UserLog[] {
    try {
      const logs = localStorage.getItem("local_user_logs");
      if (!logs) {
        const initialLogs: UserLog[] = [
          {
            id: "log-1",
            userId: "system",
            username: "System Bot",
            action: "Platform Initialized",
            details: "Pre-seeded anime catalogs successfully installed",
            timestamp: new Date().toISOString()
          },
          {
            id: "log-2",
            userId: "demo",
            username: "demo_otaku",
            action: "Watch Episode",
            details: "Watched Frieren: Beyond Journey's End - Episode 1",
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
          }
        ];
        localStorage.setItem("local_user_logs", JSON.stringify(initialLogs));
        return initialLogs;
      }
      return JSON.parse(logs);
    } catch {
      return [];
    }
  }

  private saveLogs(logs: UserLog[]) {
    localStorage.setItem("local_user_logs", JSON.stringify(logs));
  }

  public logAction(username: string, userId: string, action: string, details: string) {
    const logs = this.getLogs();
    const newLog: UserLog = {
      id: "log-" + Math.random().toString(36).substr(2, 9),
      userId,
      username,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep max 100 logs
    this.saveLogs(logs.slice(0, 100));
  }

  public getAnimeList(): Anime[] {
    return this.getAnime();
  }

  public addOrUpdateAnime(animeItem: Anime): Anime {
    const list = this.getAnime();
    const idx = list.findIndex(a => a.id === animeItem.id);
    if (idx > -1) {
      list[idx] = animeItem;
    } else {
      list.push(animeItem);
    }
    this.saveAnime(list);
    return animeItem;
  }

  public deleteAnime(id: string): boolean {
    const list = this.getAnime();
    const filtered = list.filter(a => a.id !== id);
    this.saveAnime(filtered);
    return filtered.length !== list.length;
  }

  public getUserLogs(): UserLog[] {
    return this.getLogs();
  }

  public getProfile(uid: string): UserProfile | null {
    try {
      const profiles = localStorage.getItem("local_profiles");
      if (!profiles) return null;
      const dict = JSON.parse(profiles);
      return dict[uid] || null;
    } catch {
      return null;
    }
  }

  public saveProfile(profile: UserProfile) {
    try {
      const profilesStr = localStorage.getItem("local_profiles") || "{}";
      const dict = JSON.parse(profilesStr);
      dict[profile.uid] = profile;
      localStorage.setItem("local_profiles", JSON.stringify(dict));
    } catch (e) {
      console.error(e);
    }
  }
}

const localDB = new LocalDBService();

// CORE WRAPPED EXPORTS FOR FIREBASE OR LOCAL OPERATIONS
export function isFirebaseConfigured(): boolean {
  return isFirebaseActive;
}

export function reinitializeFirebase() {
  initFirebase();
  return isFirebaseActive;
}

// 1. ANIME CONTENT OPERATIONS
export async function fetchAnimeList(): Promise<Anime[]> {
  if (isFirebaseActive && db) {
    try {
      const colRef = collection(db, "anime");
      const snap = await getDocs(colRef);
      if (snap.empty) {
        // Seed Firestore if empty
        for (const item of SEED_ANIME_DATA) {
          await setDoc(doc(db, "anime", item.id), item);
        }
        return SEED_ANIME_DATA;
      }
      const list: Anime[] = [];
      snap.forEach(d => {
        list.push(d.data() as Anime);
      });
      return list;
    } catch (e) {
      console.error("Firestore fetchAnimeList failed, falling back to local storage", e);
      return localDB.getAnimeList();
    }
  } else {
    return localDB.getAnimeList();
  }
}

export async function saveAnimeItem(anime: Anime): Promise<Anime> {
  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, "anime", anime.id), anime);
      return anime;
    } catch (e) {
      console.error("Firestore saveAnimeItem failed", e);
      return localDB.addOrUpdateAnime(anime);
    }
  } else {
    return localDB.addOrUpdateAnime(anime);
  }
}

export async function deleteAnimeItem(id: string): Promise<boolean> {
  if (isFirebaseActive && db) {
    try {
      await deleteDoc(doc(db, "anime", id));
      return true;
    } catch (e) {
      console.error("Firestore deleteAnimeItem failed", e);
      return localDB.deleteAnime(id);
    }
  } else {
    return localDB.deleteAnime(id);
  }
}

// 2. USER AUTHENTICATION & PROFILES
export function onAuthChanged(callback: (user: UserProfile | null) => void) {
  if (isFirebaseActive && auth) {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Fetch or create Firestore user profile
        try {
          const uDoc = await getDoc(doc(db!, "users", fbUser.uid));
          if (uDoc.exists()) {
            callback(uDoc.data() as UserProfile);
          } else {
            // Create brand new profile
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || "",
              username: fbUser.email ? fbUser.email.split("@")[0] : "OtakuUser",
              avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${fbUser.uid}`,
              role: fbUser.email === "ravindugimhang2@gmail.com" ? "admin" : "user", // Auto-make requester admin
              watchlist: [],
              progress: {},
              offlineDownloads: [],
              language: "en",
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db!, "users", fbUser.uid), newProfile);
            callback(newProfile);
          }
        } catch (e) {
          console.error("Error loading user profile from Firestore, using local copy", e);
          const localProf = localDB.getProfile(fbUser.uid);
          callback(localProf || {
            uid: fbUser.uid,
            email: fbUser.email || "",
            username: "Local Otter",
            avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${fbUser.uid}`,
            role: "admin", // Offline development default
            watchlist: [],
            progress: {},
            offlineDownloads: [],
            language: "en",
            createdAt: new Date().toISOString()
          });
        }
      } else {
        callback(null);
      }
    });
  } else {
    // Local session simulation
    let unsubscribed = false;
    const checkLocal = () => {
      if (unsubscribed) return;
      try {
        const activeUid = localStorage.getItem("local_active_uid");
        if (activeUid) {
          const profile = localDB.getProfile(activeUid);
          if (profile) {
            callback(profile);
            return;
          }
        }
        callback(null);
      } catch {
        callback(null);
      }
    };
    checkLocal();
    // Simulate auth state changes by checking storage
    const interval = setInterval(checkLocal, 1500);
    return () => {
      unsubscribed = true;
      clearInterval(interval);
    };
  }
}

export async function loginUser(email: string, pass: string): Promise<UserProfile> {
  if (isFirebaseActive && auth) {
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    const uDoc = await getDoc(doc(db!, "users", credential.user.uid));
    const profile = uDoc.data() as UserProfile;
    localDB.logAction(profile.username, profile.uid, "User Logged In", `Logged in from web client`);
    return profile;
  } else {
    // Simulate Local Login
    if (!email || !pass) throw new Error("Email and Password required!");
    const mockUid = "local-" + btoa(email).substr(0, 10);
    let profile = localDB.getProfile(mockUid);
    if (!profile) {
      profile = {
        uid: mockUid,
        email: email,
        username: email.split("@")[0],
        avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${mockUid}`,
        role: email.includes("admin") || email === "ravindugimhang2@gmail.com" ? "admin" : "user",
        watchlist: [],
        progress: {},
        offlineDownloads: [],
        language: "en",
        createdAt: new Date().toISOString()
      };
      localDB.saveProfile(profile);
    }
    localStorage.setItem("local_active_uid", mockUid);
    localDB.logAction(profile.username, profile.uid, "User Logged In", "Logged in via mock auth");
    return profile;
  }
}

export async function registerUser(email: string, pass: string, username: string): Promise<UserProfile> {
  if (isFirebaseActive && auth) {
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    const newProfile: UserProfile = {
      uid: credential.user.uid,
      email: email,
      username: username || email.split("@")[0],
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${credential.user.uid}`,
      role: email === "ravindugimhang2@gmail.com" ? "admin" : "user",
      watchlist: [],
      progress: {},
      offlineDownloads: [],
      language: "en",
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db!, "users", credential.user.uid), newProfile);
    localDB.logAction(username, credential.user.uid, "User Registered", "Created account and profile");
    return newProfile;
  } else {
    if (!email || !pass || !username) throw new Error("All fields are required!");
    const mockUid = "local-" + btoa(email).substr(0, 10);
    const newProfile: UserProfile = {
      uid: mockUid,
      email: email,
      username: username,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${mockUid}`,
      role: email.includes("admin") || email === "ravindugimhang2@gmail.com" ? "admin" : "user",
      watchlist: [],
      progress: {},
      offlineDownloads: [],
      language: "en",
      createdAt: new Date().toISOString()
    };
    localDB.saveProfile(newProfile);
    localStorage.setItem("local_active_uid", mockUid);
    localDB.logAction(username, mockUid, "User Registered", "Created local mock account");
    return newProfile;
  }
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseActive && auth) {
    const currentUid = auth.currentUser?.uid;
    if (currentUid) {
      const profile = localDB.getProfile(currentUid);
      localDB.logAction(profile?.username || "Otaku", currentUid, "User Logged Out", "Logged out from web client");
    }
    await signOut(auth);
  } else {
    const activeUid = localStorage.getItem("local_active_uid");
    if (activeUid) {
      const profile = localDB.getProfile(activeUid);
      localDB.logAction(profile?.username || "Otaku", activeUid, "User Logged Out", "Logged out from mock session");
    }
    localStorage.removeItem("local_active_uid");
  }
}

export async function updateUserProfile(profile: UserProfile): Promise<UserProfile> {
  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, "users", profile.uid), profile);
      return profile;
    } catch (e) {
      console.error("Firestore profile update failed, syncing locally", e);
      localDB.saveProfile(profile);
      return profile;
    }
  } else {
    localDB.saveProfile(profile);
    return profile;
  }
}

// 3. ADMIN ANALYTICS AND LOGGING
export async function fetchUserLogs(): Promise<UserLog[]> {
  if (isFirebaseActive && db) {
    try {
      const snap = await getDocs(query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(50)));
      const list: UserLog[] = [];
      snap.forEach(d => list.push(d.data() as UserLog));
      return list.length ? list : localDB.getUserLogs();
    } catch (e) {
      console.error("Firestore logs fetch failed", e);
      return localDB.getUserLogs();
    }
  } else {
    return localDB.getUserLogs();
  }
}

export async function logUserActivity(username: string, userId: string, action: string, details: string) {
  // Always log locally first
  localDB.logAction(username, userId, action, details);
  
  if (isFirebaseActive && db) {
    try {
      const newLogId = "log-" + Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, "logs", newLogId), {
        id: newLogId,
        userId,
        username,
        action,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error("Firestore logActivity failed", e);
    }
  }
}

// 4. REAL-TIME WATCH PARTY AND DISCUSSIONS
export function subscribeToComments(animeId: string, episodeId: string, callback: (comments: Comment[]) => void) {
  if (isFirebaseActive && db) {
    const docPath = `anime/${animeId}/episodes/${episodeId}/comments`;
    const colRef = collection(db, "anime", animeId, "episodes", episodeId, "comments");
    const q = query(colRef, orderBy("timestamp", "asc"));
    return onSnapshot(q, (snap) => {
      const list: Comment[] = [];
      snap.forEach(d => {
        list.push(d.data() as Comment);
      });
      callback(list);
    }, (err) => {
      console.error("Comments subscription failed, running mock stream", err);
      callback(getMockComments(animeId, episodeId));
    });
  } else {
    // Simulated live updates for mock comments
    const updateLocal = () => {
      callback(getMockComments(animeId, episodeId));
    };
    updateLocal();
    const interval = setInterval(updateLocal, 3000);
    return () => clearInterval(interval);
  }
}

export async function addCommentToEpisode(
  animeId: string, 
  episodeId: string, 
  user: UserProfile, 
  text: string
): Promise<Comment> {
  const newComment: Comment = {
    id: "comment-" + Math.random().toString(36).substr(2, 9),
    userId: user.uid,
    username: user.username,
    avatarUrl: user.avatarUrl,
    text,
    timestamp: new Date().toISOString()
  };

  if (isFirebaseActive && db) {
    try {
      await setDoc(doc(db, "anime", animeId, "episodes", episodeId, "comments", newComment.id), newComment);
      logUserActivity(user.username, user.uid, "Added Comment", `Commented on episode ${episodeId}`);
      return newComment;
    } catch (e) {
      console.error("Firestore comment add failed", e);
    }
  }

  // Backup Local Comments Saving
  const key = `comments_${animeId}_${episodeId}`;
  const existing = getMockComments(animeId, episodeId);
  existing.push(newComment);
  localStorage.setItem(key, JSON.stringify(existing));
  logUserActivity(user.username, user.uid, "Added Comment (Local)", `Commented on ${episodeId}`);
  return newComment;
}

function getMockComments(animeId: string, episodeId: string): Comment[] {
  const key = `comments_${animeId}_${episodeId}`;
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {}
  
  // Return preseeded conversations
  const seeded: Comment[] = [
    {
      id: "seeded-c1",
      userId: "otaku1",
      username: "GokuGamer",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=GokuGamer",
      text: "OMG! The animation in this scene is absolutely breathtaking! Ufotable/Mappa really did an incredible job!",
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: "seeded-c2",
      userId: "otaku2",
      username: "FrierenFan",
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=FrierenFan",
      text: "The storytelling is so emotional and beautiful. Highly recommend to everyone watching this! 10/10 masterwork.",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ];
  localStorage.setItem(key, JSON.stringify(seeded));
  return seeded;
}

// 5. SECURE REAL-TIME WATCH PARTY ROOM MANAGEMENT
export interface PartyRoom {
  id: string;
  hostUid: string;
  hostUsername: string;
  animeId: string;
  episodeNumber: number;
  playState: "playing" | "paused";
  currentTime: number;
  chat: { id: string; username: string; text: string; timestamp: string }[];
  activeUsersCount: number;
}

export function subscribeToPartyRoom(roomId: string, callback: (room: PartyRoom | null) => void) {
  if (isFirebaseActive && db) {
    return onSnapshot(doc(db, "watch_parties", roomId), (snap) => {
      if (snap.exists()) {
        callback(snap.data() as PartyRoom);
      } else {
        callback(null);
      }
    });
  } else {
    // Local storage simulation
    const checkRoom = () => {
      const data = localStorage.getItem(`party_room_${roomId}`);
      callback(data ? JSON.parse(data) : null);
    };
    checkRoom();
    const interval = setInterval(checkRoom, 1000);
    return () => clearInterval(interval);
  }
}

export async function createPartyRoom(user: UserProfile, animeId: string, epNum: number): Promise<string> {
  const roomId = "party-" + Math.random().toString(36).substr(2, 6).toUpperCase();
  const room: PartyRoom = {
    id: roomId,
    hostUid: user.uid,
    hostUsername: user.username,
    animeId,
    episodeNumber: epNum,
    playState: "paused",
    currentTime: 0,
    chat: [
      {
        id: "sys-1",
        username: "System",
        text: `Watch party created by ${user.username}! Send this room code to friends to watch together!`,
        timestamp: new Date().toISOString()
      }
    ],
    activeUsersCount: 1
  };

  if (isFirebaseActive && db) {
    await setDoc(doc(db, "watch_parties", roomId), room);
  } else {
    localStorage.setItem(`party_room_${roomId}`, JSON.stringify(room));
  }
  logUserActivity(user.username, user.uid, "Created Watch Party", `Room ${roomId} for ${animeId} Ep ${epNum}`);
  return roomId;
}

export async function updatePartyRoomState(roomId: string, updates: Partial<PartyRoom>): Promise<void> {
  if (isFirebaseActive && db) {
    await updateDoc(doc(db, "watch_parties", roomId), updates);
  } else {
    const data = localStorage.getItem(`party_room_${roomId}`);
    if (data) {
      const room = JSON.parse(data) as PartyRoom;
      const updated = { ...room, ...updates };
      localStorage.setItem(`party_room_${roomId}`, JSON.stringify(updated));
    }
  }
}

export async function sendPartyChatMessage(roomId: string, username: string, text: string): Promise<void> {
  const message = {
    id: "msg-" + Math.random().toString(36).substr(2, 9),
    username,
    text,
    timestamp: new Date().toISOString()
  };

  if (isFirebaseActive && db) {
    const snap = await getDoc(doc(db, "watch_parties", roomId));
    if (snap.exists()) {
      const room = snap.data() as PartyRoom;
      room.chat.push(message);
      await updateDoc(doc(db, "watch_parties", roomId), { chat: room.chat });
    }
  } else {
    const data = localStorage.getItem(`party_room_${roomId}`);
    if (data) {
      const room = JSON.parse(data) as PartyRoom;
      room.chat.push(message);
      localStorage.setItem(`party_room_${roomId}`, JSON.stringify(room));
    }
  }
}
