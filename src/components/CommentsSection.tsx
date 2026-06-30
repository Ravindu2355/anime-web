import React, { useState, useEffect, useRef } from "react";
import { Comment, Anime, Episode } from "../types";
import { useApp } from "../context/AppContext";
import { subscribeToComments, addCommentToEpisode } from "../services/firebase";
import { Send, MessageSquare, ShieldAlert, Sparkles } from "lucide-react";

interface CommentsSectionProps {
  anime: Anime;
  episode: Episode;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ anime, episode }) => {
  const { user, t, onOpenAuth } = useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to comments live using firebase stream subscription
    const unsubscribe = subscribeToComments(anime.id, episode.id, (list) => {
      setComments(list);
    });

    return () => unsubscribe();
  }, [anime.id, episode.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to join the conversation!");
      return;
    }
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      await addCommentToEpisode(anime.id, episode.id, user, commentText.trim());
      setCommentText("");
      // Scroll to bottom
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, { 
        month: "short", 
        day: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    } catch {
      return "Just now";
    }
  };

  return (
    <div id="comments-section-root" className="bg-[#0B0F19]/40 border border-gray-900 rounded-2xl p-4 md:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-900 pb-4">
        <div className="flex items-center space-x-2.5">
          <MessageSquare className="w-5 h-5 text-pink-500" />
          <h3 className="text-base font-black text-white">
            {t.comments} ({comments.length})
          </h3>
        </div>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
          Episode Discussion Thread
        </span>
      </div>

      {/* Comment Feed */}
      <div id="comment-feed-list" className="space-y-4 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-800">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 space-y-2">
            <Sparkles className="w-8 h-8 text-gray-700 mx-auto animate-pulse" />
            <p className="text-xs font-semibold">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.id}
              id={`comment-item-${comment.id}`}
              className="flex items-start space-x-3.5 bg-gray-950/20 hover:bg-gray-950/40 border border-gray-950 p-3.5 rounded-xl transition"
            >
              <img
                src={comment.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.userId}`}
                alt={comment.username}
                className="w-9 h-9 rounded-full bg-gray-800 shrink-0"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-gray-200 hover:text-pink-400 cursor-pointer">
                    {comment.username}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono font-bold">
                    {formatDate(comment.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed font-light whitespace-pre-wrap">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Comment Editor */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex items-end space-x-3 pt-2">
          <div className="flex-1 relative">
            <textarea
              id="comment-text-input"
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t.addComment}
              className="block w-full rounded-xl bg-gray-950 border border-gray-800 placeholder-gray-500 text-xs text-white p-3 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 resize-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !commentText.trim()}
            className="bg-pink-600 hover:bg-pink-500 disabled:bg-gray-800 text-white p-3.5 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </form>
      ) : (
        <div className="bg-gray-950/40 border border-dashed border-gray-800 rounded-xl p-5 text-center space-y-3">
          <p className="text-xs text-gray-400 font-medium">
            Join the otaku community! Please log in or register to write comments.
          </p>
          <button
            onClick={onOpenAuth}
            className="inline-block bg-pink-600/10 hover:bg-pink-600/20 text-pink-400 font-bold text-xs px-5 py-2.5 rounded-lg border border-pink-500/20 cursor-pointer transition"
          >
            Sign In to Comment
          </button>
        </div>
      )}

    </div>
  );
};
