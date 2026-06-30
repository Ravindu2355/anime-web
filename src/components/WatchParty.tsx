import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { 
  createPartyRoom, 
  subscribeToPartyRoom, 
  updatePartyRoomState, 
  sendPartyChatMessage,
  PartyRoom 
} from "../services/firebase";
import { 
  Users, 
  Tv, 
  Flame, 
  Send, 
  Play, 
  Pause, 
  Copy, 
  Sparkles, 
  MessageSquare, 
  Compass, 
  Clock, 
  Key 
} from "lucide-react";

export const WatchParty: React.FC = () => {
  const { user, animeList, t } = useApp();
  const [roomId, setRoomId] = useState("");
  const [activeRoom, setActiveRoom] = useState<PartyRoom | null>(null);
  const [chatText, setChatText] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Creation form state
  const [selectedAnimeId, setSelectedAnimeId] = useState("");
  const [episodeNum, setEpisodeNum] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Auto set initial anime in list
  useEffect(() => {
    if (animeList.length > 0) {
      setSelectedAnimeId(animeList[0].id);
    }
  }, [animeList]);

  // Subscribe to room live changes once room code is set
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = subscribeToPartyRoom(roomId, (roomData) => {
      setActiveRoom(roomData);
    });
    return () => unsubscribe();
  }, [roomId]);

  const handleCreateParty = async () => {
    if (!user) {
      setFeedback("⚠️ Please log in to create a watch party!");
      return;
    }
    setFeedback(null);
    try {
      const code = await createPartyRoom(user, selectedAnimeId, episodeNum);
      setRoomId(code);
    } catch (e) {
      console.error(e);
      setFeedback("❌ Failed to create party. Try again.");
    }
  };

  const handleJoinParty = () => {
    if (!user) {
      setFeedback("⚠️ Please log in to join a watch party!");
      return;
    }
    const code = roomId.trim().toUpperCase();
    if (!code) {
      setFeedback("⚠️ Please enter a room code!");
      return;
    }
    setFeedback(null);
    setRoomId(code);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim() || !activeRoom || !user) return;
    try {
      await sendPartyChatMessage(activeRoom.id, user.username, chatText.trim());
      setChatText("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeAnime = animeList.find((a) => a.id === activeRoom?.animeId);
  const activeEpisode = activeAnime?.episodes.find((e) => e.episodeNumber === activeRoom?.episodeNumber);

  return (
    <div id="watch-party-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white space-y-6">
      
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-pink-600/10 via-amber-500/5 to-transparent border border-gray-900 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-pink-600/20 text-pink-400 font-bold text-[10px] tracking-wider px-2.5 py-1 rounded-full uppercase border border-pink-500/20">
            Otaku Hub
          </span>
          <h1 className="text-2xl md:text-3xl font-black">Co-Watching synced Watch Party</h1>
          <p className="text-gray-400 text-sm max-w-xl font-light">
            Create a party room, share your private code with friends, and enjoy synchronized real-time playback across multiple devices seamlessly.
          </p>
        </div>
        <Users className="w-16 h-16 text-pink-500/40 hidden md:block shrink-0 animate-pulse" />
      </div>

      {feedback && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-4 py-3 rounded-xl">
          {feedback}
        </div>
      )}

      {/* Main Room Lobby or Active Screen */}
      {!activeRoom ? (
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Box 1: Create a Room */}
          <div className="bg-[#0B0F19]/40 border border-gray-900 rounded-2xl p-6 space-y-5">
            <div className="flex items-center space-x-3">
              <Tv className="w-6 h-6 text-pink-500" />
              <h2 className="text-lg font-black">Create Co-Watching Party</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Select Anime</label>
                <select
                  id="party-anime-select"
                  value={selectedAnimeId}
                  onChange={(e) => setSelectedAnimeId(e.target.value)}
                  className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                >
                  {animeList.map((a) => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Episode Number</label>
                <input
                  id="party-episode-input"
                  type="number"
                  min={1}
                  max={activeAnime?.totalEpisodes || 100}
                  value={episodeNum}
                  onChange={(e) => setEpisodeNum(parseInt(e.target.value) || 1)}
                  className="w-full text-xs bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <button
                id="btn-party-create"
                onClick={handleCreateParty}
                className="w-full bg-gradient-to-r from-pink-600 to-amber-500 py-3 rounded-xl text-xs font-black hover:opacity-90 transform hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wider cursor-pointer"
              >
                Launch Private Room
              </button>
            </div>
          </div>

          {/* Box 2: Join a Room */}
          <div className="bg-[#0B0F19]/40 border border-gray-900 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center space-x-3">
                <Key className="w-6 h-6 text-amber-500" />
                <h2 className="text-lg font-black">Enter Private Room Code</h2>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                Received a code from your friend? Enter it below to join their live synchronized stream and chat room instantly.
              </p>
              <div>
                <input
                  id="party-join-input"
                  type="text"
                  placeholder="E.g. PARTY-W3K2"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full text-center font-mono text-sm tracking-widest bg-gray-950 border border-gray-800 rounded-xl p-3 text-white uppercase focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
            </div>

            <button
              id="btn-party-join"
              onClick={handleJoinParty}
              className="w-full bg-gray-900 border border-gray-800 hover:border-gray-700 py-3 rounded-xl text-xs font-black text-gray-200 hover:text-white transition-all cursor-pointer"
            >
              Connect to Stream
            </button>
          </div>

        </div>
      ) : (
        /* ACTIVE WATCH PARTY LAYOUT */
        <div id="active-party-room" className="grid lg:grid-cols-3 gap-6">
          
          {/* Column 1: Video Player sync indicators */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-pink-500 animate-ping shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-gray-200">Room Code: <span className="font-mono text-pink-500 select-all">{activeRoom.id}</span></h3>
                  <p className="text-xs text-gray-500">Host: {activeRoom.hostUsername}</p>
                </div>
              </div>
              <button
                id="btn-party-copy"
                onClick={handleCopyCode}
                className="flex items-center space-x-1.5 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? "Copied!" : "Copy Room Link"}</span>
              </button>
            </div>

            {/* Simulated Live Player Frame */}
            {activeEpisode ? (
              <div className="bg-black aspect-video rounded-2xl overflow-hidden border border-gray-900 relative">
                <iframe
                  id="party-stream-iframe"
                  src={`${activeEpisode.sources[0]?.url || "https://www.youtube.com/embed/dQw4w9WgXcQ"}?autoplay=1&mute=1`}
                  className="w-full h-full border-none pointer-events-none"
                  title="Party Player"
                />
                
                {/* Synced Overlays */}
                <div className="absolute top-4 left-4 bg-gray-950/80 backdrop-blur border border-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 text-pink-400">
                  <Flame className="w-3.5 h-3.5 fill-pink-400 animate-bounce" />
                  <span>SYNCHRONIZED VIEWING ACTIVE</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-950/40 border border-gray-900 aspect-video rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-3">
                <Compass className="w-12 h-12 text-gray-700 animate-spin" />
                <p className="text-xs text-gray-400 font-medium">Preparing synced video feed...</p>
              </div>
            )}

            <div className="space-y-1">
              <h2 className="text-base font-black text-gray-100">{activeAnime?.title}</h2>
              <p className="text-xs text-pink-500 font-bold">Episode {activeRoom.episodeNumber}: {activeEpisode?.title || "Full Episode"}</p>
              <p className="text-xs text-gray-400 leading-relaxed font-light">{activeAnime?.description}</p>
            </div>

          </div>

          {/* Column 2: Watch Party Live Chat room */}
          <div className="bg-[#0B0F19]/40 border border-gray-900 rounded-2xl p-4 flex flex-col justify-between h-[500px]">
            <div className="border-b border-gray-900 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-black">Live Chatroom</span>
              </div>
              <button 
                onClick={() => setRoomId("")} 
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 underline cursor-pointer"
              >
                Leave Room
              </button>
            </div>

            {/* Message streams */}
            <div id="party-chat-stream" className="flex-1 overflow-y-auto my-3 space-y-3 pr-1 scrollbar-thin">
              {activeRoom.chat.map((msg) => {
                const isSystem = msg.username === "System";
                return (
                  <div 
                    key={msg.id} 
                    className={`text-xs space-y-0.5 p-2 rounded-lg border ${
                      isSystem 
                        ? "bg-pink-600/5 border-pink-500/20 text-pink-400 font-medium" 
                        : "bg-gray-950/40 border-gray-950 text-gray-300"
                    }`}
                  >
                    <p className="font-extrabold text-[10px] uppercase text-gray-400">{msg.username}</p>
                    <p className="leading-relaxed whitespace-pre-wrap font-light">{msg.text}</p>
                  </div>
                );
              })}
            </div>

            {/* Chat submit form */}
            <form onSubmit={handleSendChat} className="flex items-center space-x-2 pt-2 border-t border-gray-900/60">
              <input
                id="party-chat-input"
                type="text"
                placeholder="Say something to friends..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-xl text-xs px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
              <button
                type="submit"
                disabled={!chatText.trim()}
                className="bg-pink-600 hover:bg-pink-500 disabled:bg-gray-800 text-white p-2.5 rounded-xl transition cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

        </div>
      )}

    </div>
  );
};
