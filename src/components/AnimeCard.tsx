import React from "react";
import { Anime } from "../types";
import { useApp } from "../context/AppContext";
import { Play, Star, Plus, Check, Tv, Film } from "lucide-react";

interface AnimeCardProps {
  anime: Anime;
  onClick: (anime: Anime) => void;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, onClick }) => {
  const { user, watchlist, toggleWatchlist, t } = useApp();
  const isInWatchlist = user ? user.watchlist.includes(anime.id) : false;

  // Render a progress bar if the user has watched episodes of this anime
  const renderProgressBar = () => {
    if (!user || !user.progress[anime.id]) return null;
    const progress = user.progress[anime.id];
    const percentage = (progress.watchedDuration / progress.totalDuration) * 100;
    
    return (
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-950/80 z-20">
        <div 
          className="h-full bg-pink-500 rounded-r" 
          style={{ width: `${Math.min(percentage, 100)}%` }} 
          title={`Episode ${progress.episodeNumber}: ${Math.round(percentage)}% Watched`}
        />
      </div>
    );
  };

  return (
    <div 
      id={`anime-card-${anime.id}`}
      className="group relative flex flex-col bg-gray-950/30 border border-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:border-gray-800 transition-all duration-300 transform hover:-translate-y-1 select-none"
    >
      {/* Media Image */}
      <div 
        className="relative aspect-[3/4] overflow-hidden cursor-pointer"
        onClick={() => onClick(anime)}
      >
        <img
          src={anime.thumbnailUrl}
          alt={anime.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span className="bg-pink-600 text-white font-black text-[9px] tracking-widest uppercase px-2 py-0.5 rounded shadow">
            {anime.type}
          </span>
          <span className="bg-gray-950/85 text-gray-300 font-bold text-[9px] tracking-wider px-2 py-0.5 rounded flex items-center border border-gray-800">
            {anime.type === "Movie" ? <Film className="w-2.5 h-2.5 mr-1" /> : <Tv className="w-2.5 h-2.5 mr-1" />}
            {anime.totalEpisodes} {anime.totalEpisodes === 1 ? "File" : "EPs"}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2.5 right-2.5 z-10 bg-amber-500/90 backdrop-blur text-gray-950 font-black text-[10px] px-1.5 py-0.5 rounded flex items-center shadow">
          <Star className="w-2.5 h-2.5 fill-gray-950 mr-0.5 text-gray-950" />
          {anime.score}
        </div>

        {/* Progressive Gradient Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-pink-600/90 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg shadow-pink-600/30">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Progress Tracker Bar */}
        {renderProgressBar()}
      </div>

      {/* Media Metadata info text */}
      <div className="p-3.5 flex-1 flex flex-col justify-between bg-gray-950/50">
        <div>
          <h3 
            className="text-sm font-bold text-gray-100 group-hover:text-pink-400 cursor-pointer line-clamp-1 transition-colors"
            onClick={() => onClick(anime)}
            title={anime.title}
          >
            {anime.title}
          </h3>
          <p className="text-[11px] text-gray-500 font-medium font-mono truncate mt-0.5">{anime.originalTitle || anime.title}</p>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          {/* Release Year & First Genre */}
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {anime.releaseYear} • {anime.genres[0]}
          </span>

          {/* Quick watchlist button */}
          {user && (
            <button
              id={`btn-watchlist-card-${anime.id}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(anime.id);
              }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isInWatchlist 
                  ? "bg-pink-600/10 border-pink-500 text-pink-400 hover:bg-pink-600/25" 
                  : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
              }`}
              title={isInWatchlist ? t.addedToWatchlist : t.addToWatchlist}
            >
              {isInWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
