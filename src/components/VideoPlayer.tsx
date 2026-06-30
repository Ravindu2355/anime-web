import React, { useState, useEffect, useRef } from "react";
import { Episode, Anime, VideoSource } from "../types";
import { useApp } from "../context/AppContext";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  FastForward, 
  Settings, 
  ChevronRight, 
  Check, 
  Flame, 
  Share2, 
  Sparkles, 
  Download, 
  FileVideo, 
  HelpCircle, 
  Compass, 
  Clock 
} from "lucide-react";

interface VideoPlayerProps {
  anime: Anime;
  episode: Episode;
  onNextEpisode?: () => void;
  watchPartyRoomId?: string | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  anime, 
  episode, 
  onNextEpisode,
  watchPartyRoomId 
}) => {
  const { user, updateEpisodeProgress, downloadEpisode, offlineEpisodes, t } = useApp();
  
  // Available video sources
  const sources = episode.sources && episode.sources.length > 0 
    ? episode.sources 
    : [{ quality: "Auto" as const, url: "https://www.youtube.com/embed/dQw4w9WgXcQ", isIframe: true }];

  const [activeSource, setActiveSource] = useState<VideoSource>(sources[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1440); // 24 minutes default (1440s)
  const [showControls, setShowControls] = useState(true);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [showIntroOverlay, setShowIntroOverlay] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const playerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state changes on episode changes
  useEffect(() => {
    setActiveSource(sources[0]);
    setCurrentTime(0);
    setIsPlaying(true);
    setShowIntroOverlay(false);
  }, [episode]);

  // Simulate progress playback ticks to trigger progress sync
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + speed;
        if (next >= duration) {
          clearInterval(interval);
          setIsPlaying(false);
          if (onNextEpisode) onNextEpisode();
          return duration;
        }

        // Show skip intro button between 1:00 (60s) and 2:30 (150s)
        if (next >= 60 && next <= 150) {
          setShowIntroOverlay(true);
        } else {
          setShowIntroOverlay(false);
        }

        // Periodically sync progress with Firebase (every 10 seconds)
        if (Math.round(next) % 10 === 0 && user) {
          updateEpisodeProgress(anime.id, episode, next, duration);
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, episode, speed, duration, user, anime.id]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    setMuted(!muted);
  };

  const handleSkipIntro = () => {
    setCurrentTime(151); // Jump immediately past typical intro
    setShowIntroOverlay(false);
    if (user) {
      updateEpisodeProgress(anime.id, episode, 151, duration);
    }
  };

  const handleSpeedSelect = (s: number) => {
    setSpeed(s);
    setSpeedOpen(false);
  };

  const handleQualitySelect = (src: VideoSource) => {
    setActiveSource(src);
    setQualityOpen(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (user) {
      updateEpisodeProgress(anime.id, episode, val, duration);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleShareEpisode = () => {
    const shareUrl = `${window.location.origin}?anime=${anime.id}&ep=${episode.episodeNumber}`;
    navigator.clipboard.writeText(shareUrl);
    setShareFeedback("Copied direct stream link to clipboard!");
    setTimeout(() => setShareFeedback(null), 3000);
  };

  const isDownloaded = offlineEpisodes.some((x) => x.episode.id === episode.id);

  return (
    <div id="video-player-root" className={`space-y-4 ${isCinematic ? "bg-black py-4 -mx-4 px-4 rounded-none md:-mx-8 md:px-8 z-40 relative" : ""}`}>
      
      {/* Cinematic Spotlight Backdrop Header (Optional) */}
      {isCinematic && (
        <div className="flex items-center justify-between text-white max-w-7xl mx-auto mb-2 text-xs">
          <p className="font-bold flex items-center text-pink-500">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse mr-2" />
            Cinematic Cinema Mode (Lights Off)
          </p>
          <button 
            onClick={() => setIsCinematic(false)} 
            className="text-gray-400 hover:text-white underline cursor-pointer"
          >
            Turn lights on
          </button>
        </div>
      )}

      {/* Main Video Screen container */}
      <div 
        ref={playerRef}
        id="video-screen-container"
        className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-gray-900 group shadow-2xl"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {activeSource.isIframe ? (
          /* IFRAME STREAM PLAYER HOOK */
          <iframe
            id="iframe-video-player"
            src={`${activeSource.url}?autoplay=1&mute=${muted ? 1 : 0}&start=${Math.round(currentTime)}`}
            title={episode.title}
            className="w-full h-full border-none pointer-events-auto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          /* NATIVE MP4 VIDEO PLAYER FOR OFFLINE OR DIRECT LINKS */
          <video
            id="native-video-player"
            src={activeSource.url}
            className="w-full h-full"
            autoPlay
            muted={muted}
            controls={false}
            onClick={handlePlayPause}
          />
        )}

        {/* CUSTOM INTERACTIVE STREAM CONTROLLERS (Overlay for complete look) */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-4 transition-opacity duration-300 pointer-events-none ${
          showControls ? "opacity-100" : "opacity-0"
        }`}>
          
          {/* Top Info Bar */}
          <div className="flex items-center justify-between text-white">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black tracking-wider uppercase text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                Playing Episode {episode.episodeNumber}
              </span>
              <h2 className="text-sm font-extrabold truncate max-w-md">{episode.title}</h2>
            </div>

            <div className="flex items-center space-x-2 pointer-events-auto">
              <button
                id="btn-cinematic-mode"
                onClick={() => setIsCinematic(!isCinematic)}
                className={`p-2 rounded-lg text-xs font-bold transition flex items-center ${
                  isCinematic ? "bg-amber-500 text-gray-950" : "bg-gray-900/80 hover:bg-gray-800 text-gray-300"
                }`}
                title="Cinematic Focus Lights"
              >
                <Compass className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Cinema Mode</span>
              </button>
            </div>
          </div>

          {/* Center Skip Intro Overlay Popup */}
          {showIntroOverlay && (
            <button
              id="btn-skip-intro"
              onClick={handleSkipIntro}
              className="absolute left-6 bottom-24 pointer-events-auto bg-pink-600 hover:bg-pink-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-1.5 shadow-xl transition-all scale-100 hover:scale-105 active:scale-95"
            >
              <FastForward className="w-4 h-4 fill-white" />
              <span>{t.skipIntro}</span>
            </button>
          )}

          {/* Bottom Custom Navigation Panel */}
          <div className="space-y-3 pointer-events-auto">
            {/* Custom Trackbar slider */}
            <div className="flex items-center space-x-3 text-xs text-white">
              <span className="font-mono font-bold">{formatTime(currentTime)}</span>
              <input
                id="video-timeline-slider"
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1.5 rounded-lg bg-gray-700 accent-pink-600 appearance-none hover:h-2 transition-all cursor-pointer"
              />
              <span className="font-mono font-bold">{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-between text-white">
              {/* Playback action triggers */}
              <div className="flex items-center space-x-3">
                <button
                  id="btn-play-pause-overlay"
                  onClick={handlePlayPause}
                  className="p-1.5 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                </button>

                <button
                  id="btn-mute-overlay"
                  onClick={handleMute}
                  className="p-1.5 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition cursor-pointer"
                >
                  {muted ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <button
                  id="btn-rewind-10"
                  onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                  className="p-1.5 rounded-full hover:bg-gray-800 text-gray-300 hover:text-white transition text-xs font-mono font-extrabold flex items-center cursor-pointer"
                  title="Rewind 10s"
                >
                  <RotateCcw className="w-4 h-4 mr-0.5" /> 10
                </button>
              </div>

              {/* Resolution, speed settings selectors */}
              <div className="flex items-center space-x-2.5 text-xs font-bold relative">
                
                {/* Playback speed trigger */}
                <div className="relative">
                  <button
                    id="btn-speed-overlay"
                    onClick={() => { setSpeedOpen(!speedOpen); setQualityOpen(false); }}
                    className="flex items-center space-x-1 p-2 rounded-lg bg-gray-900/80 border border-gray-800 hover:bg-gray-800 transition cursor-pointer text-gray-300 hover:text-white"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{speed}x</span>
                  </button>
                  {speedOpen && (
                    <div className="absolute bottom-10 right-0 w-24 bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-2xl py-1 z-30">
                      {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedSelect(s)}
                          className={`w-full text-left px-3 py-1.5 hover:bg-gray-900 transition-colors ${
                            speed === s ? "text-pink-500 font-black bg-pink-500/5" : "text-gray-300"
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quality stream select triggers */}
                <div className="relative">
                  <button
                    id="btn-quality-overlay"
                    onClick={() => { setQualityOpen(!qualityOpen); setSpeedOpen(false); }}
                    className="flex items-center space-x-1 p-2 rounded-lg bg-gray-900/80 border border-gray-800 hover:bg-gray-800 transition cursor-pointer text-gray-300 hover:text-white"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>{activeSource.quality}</span>
                  </button>
                  {qualityOpen && (
                    <div className="absolute bottom-10 right-0 w-28 bg-gray-950 border border-gray-800 rounded-xl overflow-hidden shadow-2xl py-1 z-30">
                      <p className="px-3 py-1 text-[9px] text-gray-500 uppercase tracking-widest font-black">Quality Selector</p>
                      {sources.map((src) => (
                        <button
                          key={src.quality}
                          onClick={() => handleQualitySelect(src)}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-gray-900 transition-colors ${
                            activeSource.quality === src.quality ? "text-pink-500 font-extrabold bg-pink-500/5" : "text-gray-300"
                          }`}
                        >
                          <span>{src.quality}</span>
                          {activeSource.quality === src.quality && <Check className="w-3 h-3 text-pink-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

        </div>
      </div>

      {/* LOWER PANEL: Multi-device download triggers & External links */}
      <div className="bg-[#0B0F19]/40 border border-gray-900 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-gray-200">Episode Options & Downloads</h3>
          <p className="text-xs text-gray-400">Add to offline collection or direct download using the buttons below.</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {/* Offline local catalog downloader */}
          <button
            id={`btn-download-offline-${episode.id}`}
            onClick={() => downloadEpisode(anime, episode)}
            disabled={isDownloaded}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs border cursor-pointer transition-all ${
              isDownloaded
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default"
                : "bg-pink-600 border-pink-500 hover:bg-pink-500 text-white hover:shadow-lg shadow-pink-600/10 hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{isDownloaded ? "Offline Playable" : "Download to Offline"}</span>
          </button>

          {/* Direct download custom button */}
          {episode.directDownloadLink && (
            <a
              href={episode.directDownloadLink}
              id={`link-direct-dl-${episode.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs transition hover:-translate-y-0.5 cursor-pointer"
            >
              <FileVideo className="w-4 h-4 text-pink-500" />
              <span>{t.directDownload}</span>
            </a>
          )}

          {/* Drive download custom button */}
          {episode.driveDownloadLink && (
            <a
              href={episode.driveDownloadLink}
              id={`link-drive-dl-${episode.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs transition hover:-translate-y-0.5 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-amber-500" />
              <span>{t.driveLink}</span>
            </a>
          )}

          {/* Social share episode direct hook */}
          <button
            id="btn-share-episode"
            onClick={handleShareEpisode}
            className="flex items-center space-x-2 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
            title="Copy Direct Link with Episode parameters"
          >
            <Share2 className="w-4 h-4 text-sky-500" />
            <span>Share Episode</span>
          </button>
        </div>
      </div>

      {shareFeedback && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-4 py-3 rounded-xl flex items-center">
          <Sparkles className="w-4 h-4 mr-2 animate-bounce" />
          {shareFeedback}
        </div>
      )}
    </div>
  );
};
