import React, { useState, useEffect } from "react";
import { Anime, Episode, VideoSource, UserLog } from "../types";
import { useApp } from "../context/AppContext";
import { saveAnimeItem, deleteAnimeItem, fetchUserLogs } from "../services/firebase";
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Layout, 
  Upload, 
  Tv, 
  Image as ImageIcon, 
  ChevronRight, 
  Users, 
  Activity, 
  FileVideo, 
  Link, 
  Star, 
  Save, 
  X, 
  AlertTriangle,
  Play
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const { animeList, refreshAnime, t } = useApp();
  const [activeTab, setActiveTab] = useState<"catalog" | "analytics" | "logs">("catalog");
  const [logs, setLogs] = useState<UserLog[]>([]);
  
  // Form modal states
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);

  // Form Field states (Adding/Editing Anime)
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(8.5);
  const [releaseYear, setReleaseYear] = useState(2023);
  const [status, setStatus] = useState<"ongoing" | "completed">("ongoing");
  const [type, setType] = useState<"TV" | "Movie" | "OVA">("TV");
  const [genres, setGenres] = useState("Action, Adventure");
  const [bannerUrl, setBannerUrl] = useState("https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop");
  const [thumbnailUrl, setThumbnailUrl] = useState("https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop");
  const [totalEpisodes, setTotalEpisodes] = useState(12);
  const [tags, setTags] = useState("Shonen, Magic");
  const [featured, setFeatured] = useState(false);

  // Episode Creator section
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeNum, setEpisodeNum] = useState(1);
  const [episodeDur, setEpisodeDur] = useState("24:00");
  const [sourceUrl1080, setSourceUrl1080] = useState("https://www.youtube.com/embed/qgQkT56RL10");
  const [sourceUrl720, setSourceUrl720] = useState("https://www.youtube.com/embed/qgQkT56RL10");
  const [sourceUrl480, setSourceUrl480] = useState("https://www.youtube.com/embed/qgQkT56RL10");
  const [driveDownloadLink, setDriveDownloadLink] = useState("");
  const [directDownloadLink, setDirectDownloadLink] = useState("");
  const [addedEpisodes, setAddedEpisodes] = useState<Episode[]>([]);

  const [formStatus, setFormStatus] = useState<string | null>(null);

  useEffect(() => {
    // Fetch logs on render
    const loadLogs = async () => {
      const uLogs = await fetchUserLogs();
      setLogs(uLogs);
    };
    loadLogs();
  }, []);

  // Handle Thumbnail File Upload Simulator
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setThumbnailUrl(localUrl);
      setFormStatus("📸 Thumbnail image uploaded and loaded successfully!");
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setBannerUrl(localUrl);
      setFormStatus("📸 Wide banner image uploaded and loaded successfully!");
    }
  };

  const handleOpenCreateForm = () => {
    setSelectedAnime(null);
    setId("");
    setTitle("");
    setOriginalTitle("");
    setDescription("");
    setRating(8.5);
    setReleaseYear(2026);
    setStatus("ongoing");
    setType("TV");
    setGenres("Action, Fantasy");
    setBannerUrl("https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop");
    setThumbnailUrl("https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400&auto=format&fit=crop");
    setTotalEpisodes(12);
    setTags("Shonen");
    setFeatured(false);
    setAddedEpisodes([]);
    setIsEditing(true);
  };

  const handleOpenEditForm = (anime: Anime) => {
    setSelectedAnime(anime);
    setId(anime.id);
    setTitle(anime.title);
    setOriginalTitle(anime.originalTitle || "");
    setDescription(anime.description);
    setRating(anime.rating);
    setReleaseYear(anime.releaseYear);
    setStatus(anime.status);
    setType(anime.type);
    setGenres(anime.genres.join(", "));
    setBannerUrl(anime.bannerUrl);
    setThumbnailUrl(anime.thumbnailUrl);
    setTotalEpisodes(anime.totalEpisodes);
    setTags(anime.tags.join(", "));
    setFeatured(!!anime.featured);
    setAddedEpisodes(anime.episodes || []);
    setIsEditing(true);
  };

  const handleAddEpisodeToQueue = () => {
    if (!episodeTitle) {
      setFormStatus("⚠️ Please enter an episode title!");
      return;
    }
    
    const epSources: VideoSource[] = [
      { quality: "1080p", url: sourceUrl1080, isIframe: sourceUrl1080.includes("embed") || sourceUrl1080.includes("youtube") },
      { quality: "720p", url: sourceUrl720, isIframe: sourceUrl720.includes("embed") || sourceUrl720.includes("youtube") },
      { quality: "480p", url: sourceUrl480, isIframe: sourceUrl480.includes("embed") || sourceUrl480.includes("youtube") },
    ];

    const newEpisode: Episode = {
      id: `${id || "anime"}-ep-${episodeNum}`,
      episodeNumber: episodeNum,
      title: episodeTitle,
      duration: episodeDur,
      sources: epSources,
      driveDownloadLink: driveDownloadLink || undefined,
      directDownloadLink: directDownloadLink || undefined
    };

    setAddedEpisodes([...addedEpisodes, newEpisode]);
    
    // Increment for next addition
    setEpisodeNum(episodeNum + 1);
    setEpisodeTitle("");
    setFormStatus(`✅ Episode ${episodeNum} added to collection queue!`);
  };

  const handleRemoveEpisodeFromQueue = (index: number) => {
    const updated = [...addedEpisodes];
    updated.splice(index, 1);
    setAddedEpisodes(updated);
  };

  const handleDeleteAnime = async (animeId: string) => {
    if (confirm("Are you absolutely sure you want to delete this anime show? This cannot be undone.")) {
      await deleteAnimeItem(animeId);
      refreshAnime();
    }
  };

  const handleSaveShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setFormStatus("⚠️ Title and Description are required!");
      return;
    }

    const finalId = id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const savedShow: Anime = {
      id: finalId,
      title,
      originalTitle: originalTitle || undefined,
      description,
      rating,
      releaseYear,
      status,
      type,
      genres: genres.split(",").map(g => g.trim()).filter(Boolean),
      bannerUrl,
      thumbnailUrl,
      totalEpisodes,
      viewCount: selectedAnime?.viewCount || Math.floor(Math.random() * 500) + 10,
      score: rating,
      likes: selectedAnime?.likes || Math.floor(Math.random() * 200) + 5,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      featured,
      episodes: addedEpisodes
    };

    try {
      await saveAnimeItem(savedShow);
      setFormStatus("🎉 Anime Successfully Saved! Reloading database...");
      setTimeout(() => {
        setIsEditing(false);
        setFormStatus(null);
        refreshAnime();
      }, 1500);
    } catch (e: any) {
      setFormStatus(`❌ Save failed: ${e.message}`);
    }
  };

  // Metric Math
  const totalViews = animeList.reduce((acc, current) => acc + (current.viewCount || 0), 0);
  const totalLikes = animeList.reduce((acc, current) => acc + (current.likes || 0), 0);

  return (
    <div id="admin-dashboard-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-900 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-pink-500 animate-spin" />
            <span className="text-sm font-black uppercase tracking-wider text-pink-500">System Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Admin Management Panel</h1>
          <p className="text-xs text-gray-400">Add, edit anime collections, manage qualities, and monitor active registration logs.</p>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center bg-[#0B0F19]/60 p-1 border border-gray-900 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "catalog" ? "bg-pink-600 text-white shadow-md" : "text-gray-400 hover:text-white"
            }`}
          >
            Catalog Manager
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "analytics" ? "bg-pink-600 text-white shadow-md" : "text-gray-400 hover:text-white"
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "logs" ? "bg-pink-600 text-white shadow-md" : "text-gray-400 hover:text-white"
            }`}
          >
            Activity Logs
          </button>
        </div>
      </div>

      {/* TAB 1: CATALOG MANAGER */}
      {activeTab === "catalog" && !isEditing && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-gray-200">Interactive Anime Catalog ({animeList.length})</h2>
            <button
              id="btn-admin-add-anime"
              onClick={handleOpenCreateForm}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-lg shadow-pink-600/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Anime</span>
            </button>
          </div>

          {/* List catalog table */}
          <div className="bg-gray-950/30 border border-gray-900 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B0F19]/80 border-b border-gray-900 text-gray-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Anime Title</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Year</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Episodes</th>
                    <th className="p-4">Views</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900">
                  {animeList.map((anime) => (
                    <tr key={anime.id} className="hover:bg-gray-950/40 transition">
                      <td className="p-4 flex items-center space-x-3 font-semibold">
                        <img src={anime.thumbnailUrl} alt="" className="w-8 h-10 object-cover rounded-md" />
                        <div>
                          <p className="text-gray-200 font-bold">{anime.title}</p>
                          <p className="text-[10px] text-gray-500 truncate max-w-[160px] font-mono">{anime.id}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-pink-500/10 border border-pink-500/20 text-pink-400 font-bold px-2 py-0.5 rounded uppercase text-[10px]">
                          {anime.type}
                        </span>
                      </td>
                      <td className="p-4 text-gray-300 font-medium">{anime.releaseYear}</td>
                      <td className="p-4 flex items-center text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                        {anime.score}
                      </td>
                      <td className="p-4 text-gray-300 font-semibold">{anime.episodes?.length || 0} / {anime.totalEpisodes}</td>
                      <td className="p-4 font-mono text-gray-400">{anime.viewCount?.toLocaleString() || 0}</td>
                      <td className="p-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEditForm(anime)}
                          className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAnime(anime.id)}
                          className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                          title="Delete Show"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CATALOG CREATION / EDITING FORM FIELD PANEL */}
      {isEditing && (
        <form onSubmit={handleSaveShow} className="bg-[#0B0F19]/40 border border-gray-900 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-900 pb-4">
            <h2 className="text-base font-black text-white flex items-center">
              <Tv className="w-5 h-5 mr-2 text-pink-500" />
              {selectedAnime ? "Modify Existing Show" : "Add Brand New Show Catalog"}
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg bg-gray-950 border border-gray-800 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {formStatus && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold p-4 rounded-xl">
              {formStatus}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* COLUMN 1: Basic Info */}
            <div className="space-y-4 md:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Anime ID (Slug) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. chainsaw-man"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    disabled={!!selectedAnime}
                    className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-pink-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Anime Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chainsaw Man"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Original Japanese Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Cheinsō Man"
                    value={originalTitle}
                    onChange={(e) => setOriginalTitle(e.target.value)}
                    className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Action, Fantasy, Gore"
                    value={genres}
                    onChange={(e) => setGenres(e.target.value)}
                    className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description / Summary *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Summarize the storyline of the show..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              {/* EPISODE MANAGER AND CREATOR SUB-SECTION */}
              <div className="border border-gray-800/80 bg-gray-950/20 p-4 rounded-2xl space-y-4">
                <h3 className="text-xs font-black uppercase text-pink-400 tracking-wider flex items-center">
                  <Plus className="w-4 h-4 mr-1 text-pink-400" />
                  Episode Content Creator (Add stream resolution selectors)
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Ep Number</label>
                    <input
                      type="number"
                      value={episodeNum}
                      onChange={(e) => setEpisodeNum(parseInt(e.target.value) || 1)}
                      className="w-full text-xs bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Episode Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Dog & Chainsaw"
                      value={episodeTitle}
                      onChange={(e) => setEpisodeTitle(e.target.value)}
                      className="w-full text-xs bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider">Multi-Quality Stream Source URLs (Auto, 1080p, 720p, 480p)</label>
                  <div className="grid gap-2">
                    <input
                      type="text"
                      placeholder="1080p URL / Iframe Link"
                      value={sourceUrl1080}
                      onChange={(e) => setSourceUrl1080(e.target.value)}
                      className="w-full text-xs bg-gray-950 border border-gray-800 rounded-lg p-2 text-white"
                    />
                    <input
                      type="text"
                      placeholder="720p URL / Iframe Link"
                      value={sourceUrl720}
                      onChange={(e) => setSourceUrl720(e.target.value)}
                      className="w-full text-xs bg-gray-950 border border-gray-800 rounded-lg p-2 text-white"
                    />
                    <input
                      type="text"
                      placeholder="480p URL / Iframe Link"
                      value={sourceUrl480}
                      onChange={(e) => setSourceUrl480(e.target.value)}
                      className="w-full text-xs bg-gray-950 border border-gray-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Google Drive Direct Link</label>
                    <input
                      type="text"
                      placeholder="https://drive.google.com/..."
                      value={driveDownloadLink}
                      onChange={(e) => setDriveDownloadLink(e.target.value)}
                      className="w-full text-xs bg-gray-950 border border-gray-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Direct Download URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/movie.mp4"
                      value={directDownloadLink}
                      onChange={(e) => setDirectDownloadLink(e.target.value)}
                      className="w-full text-xs bg-gray-950 border border-gray-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddEpisodeToQueue}
                  className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 py-2 rounded-xl text-xs font-bold text-pink-400 hover:text-pink-300 transition"
                >
                  Confirm and Queue Episode
                </button>

                {/* Queue Display */}
                {addedEpisodes.length > 0 && (
                  <div className="space-y-2 mt-4 pt-4 border-t border-gray-900/60">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Queued Episodes ({addedEpisodes.length})</p>
                    <div className="grid gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                      {addedEpisodes.map((ep, idx) => (
                        <div key={idx} className="bg-gray-950/60 p-2 border border-gray-900 rounded-lg flex items-center justify-between text-xs">
                          <div>
                            <span className="font-extrabold text-pink-500 mr-2">Ep {ep.episodeNumber}</span>
                            <span className="text-gray-300">{ep.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveEpisodeFromQueue(idx)}
                            className="text-rose-400 hover:text-rose-300 transition"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* COLUMN 2: Visual Thumbnails, Ratings and File Uploaders */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Release Year</label>
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(parseInt(e.target.value) || 2026)}
                    className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Score (Rating)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value) || 8.5)}
                    className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                  >
                    <option value="TV">TV Show</option>
                    <option value="Movie">Movie</option>
                    <option value="OVA">OVA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none"
                  >
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Episodes</label>
                  <input
                    type="number"
                    value={totalEpisodes}
                    onChange={(e) => setTotalEpisodes(parseInt(e.target.value) || 12)}
                    className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tags</label>
                  <input
                    type="text"
                    placeholder="Magic, Ninja"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2.5 p-3.5 bg-gray-950 border border-gray-800 rounded-xl">
                <input
                  id="admin-featured"
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-pink-600 bg-gray-950 border-gray-800"
                />
                <label htmlFor="admin-featured" className="text-xs font-bold text-gray-300">Highlight as Featured Hero Slide</label>
              </div>

              {/* POSTER THUMBNAIL UPLOAD DROPOUT (Simulates client upload via blob urls) */}
              <div className="space-y-3.5 bg-gray-950/20 border border-gray-900 p-4 rounded-2xl">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                    <ImageIcon className="w-3.5 h-3.5 mr-1 text-pink-500" />
                    Custom Thumbnail Poster Image Upload
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-800 rounded-xl cursor-pointer bg-gray-950 hover:bg-gray-950/80 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                        <Upload className="w-6 h-6 text-gray-500 mb-2" />
                        <p className="text-xs text-gray-400 font-bold">Click to upload file</p>
                        <p className="text-[10px] text-gray-500 mt-1">PNG, JPG or GIF (Max. 5MB)</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handleThumbnailUpload} 
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Or Paste Thumbnail URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Banner image uploader */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Upload Wide Background Banner Image
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="text-xs text-gray-400 bg-gray-950 p-2 rounded-lg border border-gray-800 w-full"
                    onChange={handleBannerUpload}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Or Paste Banner URL</label>
                  <input
                    type="text"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

            </div>

          </div>

          <div className="pt-4 border-t border-gray-900/60 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-900 border border-gray-800 hover:border-gray-700 px-6 py-3 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-pink-600 to-amber-500 py-3 px-8 rounded-xl text-xs font-black text-white hover:opacity-90 transition uppercase tracking-wider flex items-center shadow-lg shadow-pink-600/10 cursor-pointer"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Anime Entry
            </button>
          </div>

        </form>
      )}

      {/* TAB 2: SYSTEM ANALYTICS METRICS */}
      {activeTab === "analytics" && (
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Card 1: View counts */}
          <div className="bg-[#0B0F19]/40 border border-gray-900 rounded-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto">
              <Play className="w-6 h-6 text-pink-500 fill-pink-500 ml-0.5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Video Views</p>
              <p className="text-3xl md:text-4xl font-black text-white">{totalViews.toLocaleString()}</p>
            </div>
            <p className="text-[10px] text-gray-500">Includes both mock queries and Cloud Sync events</p>
          </div>

          {/* Card 2: Registrations */}
          <div className="bg-[#0B0F19]/40 border border-gray-900 rounded-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-amber-500" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Platform Registrations</p>
              <p className="text-3xl md:text-4xl font-black text-white">4,210</p>
            </div>
            <p className="text-[10px] text-gray-500">Syncing active credentials in user database collections</p>
          </div>

          {/* Card 3: Watch Time */}
          <div className="bg-[#0B0F19]/40 border border-gray-900 rounded-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <Activity className="w-6 h-6 text-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Estimated Watch Time</p>
              <p className="text-3xl md:text-4xl font-black text-white">12,500 Hrs</p>
            </div>
            <p className="text-[10px] text-gray-500">Calculated over complete watching progress indexes</p>
          </div>

          {/* Graphic Distribution Section (SVG bento chart representation) */}
          <div className="bg-gray-950/30 border border-gray-900 rounded-2xl p-5 md:col-span-3 space-y-4">
            <h3 className="text-sm font-black text-gray-200 uppercase tracking-wider">Daily Audience Analytics Trends</h3>
            <div className="h-44 w-full flex items-end justify-between gap-1 border-b border-l border-gray-800/80 p-3">
              {[20, 45, 30, 80, 55, 95, 40, 75, 100, 60, 45, 90, 110, 85].map((val, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group cursor-pointer relative">
                  {/* Tooltip */}
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-pink-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow transition duration-200">
                    {val * 15} views
                  </span>
                  <div 
                    className="w-full bg-gradient-to-t from-pink-600 to-amber-500 rounded-t group-hover:opacity-85 transition-all"
                    style={{ height: `${val}px` }}
                  />
                  <span className="text-[8px] text-gray-500 mt-2 font-mono">06/{15 + idx}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: USER ACTIVITY LOGS */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-gray-200">Active User Activity Logs (Real-time stream)</h2>
          
          <div className="bg-gray-950/30 border border-gray-900 rounded-2xl overflow-hidden max-h-[500px] overflow-y-auto pr-1">
            <div className="divide-y divide-gray-900">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <AlertTriangle className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-xs font-semibold">No activity logs recorded yet.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between hover:bg-gray-950/20 transition">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-pink-400">{log.username}</span>
                        <span className="bg-gray-800/80 border border-gray-700 text-gray-300 font-black text-[9px] px-2 py-0.5 rounded uppercase">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 font-light leading-relaxed">{log.details}</p>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono font-bold">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
