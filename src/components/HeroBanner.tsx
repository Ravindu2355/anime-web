import React from "react";
import { Anime } from "../types";
import { useApp } from "../context/AppContext";
import { Play, Plus, Check, Star, Calendar, Bookmark } from "lucide-react";

interface HeroBannerProps {
  anime: Anime;
  onPlayClick: (anime: Anime) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ anime, onPlayClick }) => {
  const { user, watchlist, toggleWatchlist, t } = useApp();
  const isInWatchlist = user ? user.watchlist.includes(anime.id) : false;

  return (
    <div id={`hero-banner-${anime.id}`} className="relative h-[480px] md:h-[600px] w-full overflow-hidden bg-black text-white">
      {/* Background Banner Image with intense dark gradient overlays */}
      <div className="absolute inset-0">
        <img
          src={anime.bannerUrl}
          alt={anime.title}
          className="w-full h-full object-cover object-center opacity-45 scale-105 filter blur-[1px] md:blur-0 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090D1A] via-[#090D1A]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090D1A] via-[#090D1A]/60 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-20 z-10">
        <div className="max-w-2xl space-y-4">
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="bg-pink-600/25 border border-pink-500/30 text-pink-400 px-2.5 py-1 rounded-full font-black tracking-widest uppercase">
              {anime.type}
            </span>
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full font-bold flex items-center">
              <Star className="w-3.5 h-3.5 fill-amber-400 mr-1 text-amber-400" />
              {anime.score}
            </span>
            <span className="text-gray-300 font-semibold px-2 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
              {anime.releaseYear}
            </span>
            <span className="text-gray-300 font-bold uppercase tracking-wider bg-gray-800/60 px-2 py-0.5 rounded text-[10px]">
              {anime.status === "ongoing" ? t.statusOngoing : t.statusCompleted}
            </span>
          </div>

          {/* Titles */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow">
            {anime.title}
          </h1>
          {anime.originalTitle && (
            <p className="text-sm md:text-lg font-medium text-pink-400/80 tracking-wide font-mono italic">
              {anime.originalTitle}
            </p>
          )}

          {/* Description */}
          <p className="text-gray-300 text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-4 max-w-xl font-light">
            {anime.description}
          </p>

          {/* Genre Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {anime.genres.map((g) => (
              <span key={g} className="bg-gray-900/60 hover:bg-gray-800 text-gray-300 px-3 py-1 rounded-lg text-xs font-semibold border border-gray-800 transition">
                {g}
              </span>
            ))}
          </div>

          {/* Action Call To Actions */}
          <div className="flex items-center space-x-4 pt-4">
            <button
              id={`btn-play-hero-${anime.id}`}
              onClick={() => onPlayClick(anime)}
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-pink-600/30 transform hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{t.playNow}</span>
            </button>

            {user && (
              <button
                id={`btn-watchlist-hero-${anime.id}`}
                onClick={() => toggleWatchlist(anime.id)}
                className={`flex items-center space-x-2 px-6 py-3.5 rounded-xl font-bold text-sm border transition-all duration-300 cursor-pointer ${
                  isInWatchlist
                    ? "bg-pink-600/10 border-pink-500 text-pink-400 shadow-sm"
                    : "bg-gray-900/40 border-gray-800 hover:bg-gray-800 text-gray-300 hover:text-white"
                }`}
              >
                {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isInWatchlist ? t.addedToWatchlist : t.addToWatchlist}</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
