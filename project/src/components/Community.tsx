import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { UserProfile, GameState } from '../types';
import { Mascot } from './Mascot';
import { Heart, MessageCircle, Send, ImagePlus, Users, Sparkles, X, AlertTriangle, RefreshCw, UserPlus, UserCheck, Camera, Shield, ScrollText, ChevronRight, FolderOpen, Trash2 } from 'lucide-react';

interface Props {
  profile: UserProfile;
  game: GameState;
  userId: string | null;
  onGainXp: (amount: number, label?: string) => void;
}

interface Post {
  id: string;
  user_id: string;
  caption: string;
  image_url: string | null;
  mascot_type: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string | null;
  like_count?: number;
  liked_by_me?: boolean;
  comment_count?: number;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string | null;
}

interface UserProfileRow {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  mascot_type: string;
}

const MODERATION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/moderate-content`;

export function Community({ profile, userId, onGainXp }: Props) {
  const [view, setView] = useState<'feed' | 'create' | 'post' | 'terms'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  // Create post state
  const [caption, setCaption] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showInAppGallery, setShowInAppGallery] = useState(false);
  const [inAppPhotos, setInAppPhotos] = useState<{ id: string; image_data: string }[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('community_posts')
      .select('id, user_id, caption, image_url, mascot_type, created_at')
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      setError('Could not load feed. Please try again.');
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    // Fetch author profiles
    const userIds = [...new Set(data.map((p) => p.user_id))];
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, avatar_url, mascot_type')
      .in('user_id', userIds);

    const profileMap = new Map<string, UserProfileRow>();
    (profiles || []).forEach((p: UserProfileRow) => profileMap.set(p.user_id, p));

    // Fetch like counts
    const { data: likes } = await supabase
      .from('community_likes')
      .select('post_id, user_id')
      .in('post_id', data.map((p) => p.id));

    const likeMap = new Map<string, { count: number; userIds: Set<string> }>();
    (likes || []).forEach((l: { post_id: string; user_id: string }) => {
      if (!likeMap.has(l.post_id)) likeMap.set(l.post_id, { count: 0, userIds: new Set() });
      const entry = likeMap.get(l.post_id)!;
      entry.count++;
      entry.userIds.add(l.user_id);
    });

    // Fetch comment counts
    const { data: commentCounts } = await supabase
      .from('community_comments')
      .select('post_id')
      .eq('moderation_status', 'approved')
      .in('post_id', data.map((p) => p.id));

    const commentMap = new Map<string, number>();
    (commentCounts || []).forEach((c: { post_id: string }) => {
      commentMap.set(c.post_id, (commentMap.get(c.post_id) || 0) + 1);
    });

    const enriched: Post[] = data.map((p) => {
      const prof = profileMap.get(p.user_id);
      const likeInfo = likeMap.get(p.id);
      return {
        ...p,
        author_name: prof?.display_name || 'Anonymous',
        author_avatar: prof?.avatar_url || null,
        like_count: likeInfo?.count || 0,
        liked_by_me: likeInfo?.userIds.has(userId || '') || false,
        comment_count: commentMap.get(p.id) || 0,
      };
    });

    setPosts(enriched);
    setLoading(false);
  }, [userId]);

  const fetchComments = useCallback(async (postId: string) => {
    const { data, error } = await supabase
      .from('community_comments')
      .select('id, post_id, user_id, content, created_at')
      .eq('post_id', postId)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: true });

    if (error || !data) {
      setComments([]);
      return;
    }

    const userIds = [...new Set(data.map((c) => c.user_id))];
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', userIds);

    const profileMap = new Map<string, { display_name: string; avatar_url: string | null }>();
    (profiles || []).forEach((p) => profileMap.set(p.user_id, p));

    setComments(data.map((c) => ({
      ...c,
      author_name: profileMap.get(c.user_id)?.display_name || 'Anonymous',
      author_avatar: profileMap.get(c.user_id)?.avatar_url || null,
    })));
  }, []);

  const moderateContent = async (text: string): Promise<{ approved: boolean; reason?: string }> => {
    try {
      const res = await fetch(MODERATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return { approved: true };
      const data = await res.json();
      return data;
    } catch {
      return { approved: true };
    }
  };

  const handleCreatePost = async () => {
    if (!caption.trim() && !imageData) return;
    setPosting(true);
    setCreateError(null);

    const modResult = await moderateContent(caption.trim() || 'Photo post');
    if (!modResult.approved) {
      setCreateError(modResult.reason || 'Your post was blocked by moderation.');
      setPosting(false);
      return;
    }

    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        caption: caption.trim(),
        image_url: imageData,
        mascot_type: profile.mascot,
        moderation_status: 'approved',
      })
      .select('id')
      .single();

    if (error) {
      setCreateError('Could not publish your post. Please try again.');
      setPosting(false);
      return;
    }

    // Ensure user profile exists
    await supabase.from('user_profiles').upsert({
      user_id: userId,
      display_name: profile.personal.name || 'Anonymous',
      avatar_url: profile.avatarUrl || null,
      mascot_type: profile.mascot,
    }, { onConflict: 'user_id' });

    setCaption('');
    setImageData(null);
    setView('feed');
    setPosting(false);
    onGainXp(10, 'Shared a moment');
    fetchPosts();
  };

  const handleLike = async (postId: string, liked: boolean) => {
    if (!userId) return;
    if (liked) {
      await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
      await supabase.from('community_likes').insert({ post_id: postId });
    }
    setPosts((prev) => prev.map((p) => p.id === postId ? {
      ...p,
      liked_by_me: !liked,
      like_count: (p.like_count || 0) + (liked ? -1 : 1),
    } : p));
  };

  const handleComment = async () => {
    if (!selectedPost || !commentText.trim()) return;
    setCommentError(null);

    const modResult = await moderateContent(commentText.trim());
    if (!modResult.approved) {
      setCommentError(modResult.reason || 'Your comment was blocked by moderation.');
      return;
    }

    const { error } = await supabase
      .from('community_comments')
      .insert({
        post_id: selectedPost.id,
        content: commentText.trim(),
        moderation_status: 'approved',
      });

    if (error) {
      setCommentError('Could not post your comment. Please try again.');
      return;
    }

    setCommentText('');
    onGainXp(5, 'Joined the conversation');
    fetchComments(selectedPost.id);
    setPosts((prev) => prev.map((p) => p.id === selectedPost.id ? {
      ...p,
      comment_count: (p.comment_count || 0) + 1,
    } : p));
  };

  const openPost = (post: Post) => {
    setSelectedPost(post);
    setView('post');
    fetchComments(post.id);
  };

  const handleDeletePost = async (postId: string) => {
    const { error: likeErr } = await supabase.from('community_likes').delete().eq('post_id', postId);
    const { error: commentErr } = await supabase.from('community_comments').delete().eq('post_id', postId);
    const { error: postErr } = await supabase.from('community_posts').delete().eq('id', postId).eq('user_id', userId || '');
    if (postErr) {
      setConfirmDelete(null);
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setConfirmDelete(null);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleInAppPhoto = (imageData: string) => {
    setImageData(imageData);
    setShowInAppGallery(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setCameraActive(true);
      // wait for render before attaching
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch {
      alert('Camera not available. Please grant camera permission or upload a photo instead.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    const v = videoRef.current;
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    setImageData(canvas.toDataURL('image/jpeg', 0.85));
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => () => stopCamera(), []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Feed view
  if (view === 'feed') {
    return (
      <div className="px-4 pt-6 pb-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={24} className="text-indigo-500" />
            <h1 className="text-2xl font-extrabold">Community</h1>
          </div>
          <button onClick={() => setView('create')}
            className="flex items-center gap-1.5 bg-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-full active:scale-95 transition-transform">
            <Sparkles size={14} /> Share
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Share moments with your pet, discover other pet parents, and spread kindness.
        </p>

        <button onClick={() => setView('terms')} className="text-xs text-gray-400 font-semibold flex items-center gap-1 mb-4 hover:text-indigo-500 transition-colors">
          <ScrollText size={12} /> Community Guidelines & Terms
        </button>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-3 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-2" />
            <p className="text-sm text-gray-400">Loading feed...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-3 mb-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400 font-semibold mb-1">No posts yet</p>
            <p className="text-sm text-gray-400 mb-4">Be the first to share a moment!</p>
            <button onClick={() => setView('create')}
              className="bg-indigo-500 text-white font-bold px-6 py-3 rounded-2xl active:scale-95 transition-transform">
              Share a Moment
            </button>
          </div>
        )}

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-lg overflow-hidden">
              {/* Author header */}
              <div className="flex items-center gap-3 p-4">
                {post.author_avatar ? (
                  <img src={post.author_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <Mascot type={(post.mascot_type as any) || 'otter'} size={40} animated={false} />
                )}
                <p className="font-bold text-sm flex-1">{post.author_name}</p>
                <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
                {post.user_id === userId && (
                  <button onClick={() => setConfirmDelete(post.id)}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-90 transition-transform">
                    <Trash2 size={14} className="text-gray-400" />
                  </button>
                )}
              </div>
              {/* Image */}
              {post.image_url && (
                <img src={post.image_url} alt="" className="w-full max-h-80 object-cover" />
              )}
              {/* Caption */}
              {post.caption && (
                <p className="px-4 py-3 text-sm">{post.caption}</p>
              )}
              {/* Actions */}
              <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <button onClick={() => handleLike(post.id, post.liked_by_me || false)}
                  className={`flex items-center gap-1.5 text-sm font-bold transition-transform active:scale-90 ${post.liked_by_me ? 'text-rose-500' : 'text-gray-400'}`}>
                  <Heart size={18} fill={post.liked_by_me ? 'currentColor' : 'none'} />
                  {post.like_count || 0}
                </button>
                <button onClick={() => openPost(post)}
                  className="flex items-center gap-1.5 text-sm font-bold text-gray-400 transition-transform active:scale-90">
                  <MessageCircle size={18} />
                  {post.comment_count || 0}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Create post view
  if (view === 'create') {
    return (
      <div className="px-4 pt-6 pb-4 max-w-md mx-auto space-y-4">
        <button onClick={() => setView('feed')} className="flex items-center gap-1 text-gray-400 text-sm font-semibold">
          <X size={16} /> Cancel
        </button>
        <h1 className="text-2xl font-extrabold">Share a Moment</h1>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg space-y-4">
          {/* Photo */}
          {imageData ? (
            <div className="relative">
              <img src={imageData} alt="" className="w-full rounded-2xl max-h-64 object-cover" />
              <button onClick={() => setImageData(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
          ) : cameraActive ? (
            <div className="space-y-3">
              <div className="relative bg-black rounded-2xl overflow-hidden h-64">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
              </div>
              <button onClick={capturePhoto}
                className="w-full bg-indigo-500 text-white font-bold py-3.5 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2">
                <Camera size={18} /> Capture Photo
              </button>
              <button onClick={stopCamera} className="w-full text-gray-400 text-sm font-semibold">Cancel</button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button onClick={async () => {
                const { data } = await supabase.from('photo_history').select('id, image_data').eq('user_id', userId || '').order('created_at', { ascending: false }).limit(30);
                setInAppPhotos(data || []);
                setShowInAppGallery(true);
              }} className="flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 active:scale-95 transition-transform">
                <FolderOpen size={22} className="text-purple-500" />
                <p className="text-[10px] font-bold">In-App</p>
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 active:scale-95 transition-transform">
                <ImagePlus size={22} className="text-indigo-500" />
                <p className="text-[10px] font-bold">Gallery</p>
              </button>
              <button onClick={startCamera}
                className="flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 active:scale-95 transition-transform">
                <Camera size={22} className="text-cyan-500" />
                <p className="text-[10px] font-bold">Camera</p>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
            </div>
          )}

          {/* Caption */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={500}
            placeholder="Share something about your pet or your day..."
            autoFocus
            className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 outline-none focus:ring-2 ring-indigo-400 resize-none h-28 text-sm border-0"
          />
          <p className="text-xs text-gray-400 text-right">{caption.length}/500</p>

          {createError && (
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-3 flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-600 dark:text-amber-400">{createError}</p>
            </div>
          )}

          <button onClick={handleCreatePost} disabled={posting || (!caption.trim() && !imageData)}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-40 flex items-center justify-center gap-2">
            <Send size={18} /> {posting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    );
  }

  // Post detail view
  if (view === 'post' && selectedPost) {
    return (
      <div className="px-4 pt-6 pb-4 max-w-md mx-auto space-y-4">
        <button onClick={() => { setView('feed'); setSelectedPost(null); }} className="flex items-center gap-1 text-gray-400 text-sm font-semibold">
          <X size={16} /> Back to feed
        </button>

        {/* Post */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-lg overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            {selectedPost.author_avatar ? (
              <img src={selectedPost.author_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <Mascot type={(selectedPost.mascot_type as any) || 'otter'} size={40} animated={false} />
            )}
            <p className="font-bold text-sm flex-1">{selectedPost.author_name}</p>
            {selectedPost.user_id === userId && (
              <button onClick={() => setConfirmDelete(selectedPost.id)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-90 transition-transform">
                <Trash2 size={14} className="text-gray-400" />
              </button>
            )}
          </div>
          {selectedPost.image_url && (
            <img src={selectedPost.image_url} alt="" className="w-full max-h-80 object-cover" />
          )}
          {selectedPost.caption && <p className="px-4 py-3 text-sm">{selectedPost.caption}</p>}
          <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => handleLike(selectedPost.id, selectedPost.liked_by_me || false)}
              className={`flex items-center gap-1.5 text-sm font-bold ${selectedPost.liked_by_me ? 'text-rose-500' : 'text-gray-400'}`}>
              <Heart size={18} fill={selectedPost.liked_by_me ? 'currentColor' : 'none'} />
              {selectedPost.like_count || 0}
            </button>
            <span className="flex items-center gap-1.5 text-sm font-bold text-gray-400">
              <MessageCircle size={18} /> {selectedPost.comment_count || 0}
            </span>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-4 shadow-lg">
          <p className="font-bold text-sm mb-3">Comments</p>
          {comments.length === 0 && <p className="text-sm text-gray-400 mb-3">No comments yet. Be the first to say something kind!</p>}
          <div className="space-y-3 mb-4">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2">
                {c.author_avatar ? (
                  <img src={c.author_avatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-gray-400">{c.author_name?.[0] || '?'}</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-xs font-bold">{c.author_name}</p>
                  <p className="text-sm">{c.content}</p>
                </div>
              </div>
            ))}
          </div>

          {commentError && (
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-3 mb-3 flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-600 dark:text-amber-400">{commentError}</p>
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Write a kind comment..."
              maxLength={300}
              className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5 outline-none focus:ring-2 ring-indigo-400 text-sm border-0"
            />
            <button onClick={handleComment} disabled={!commentText.trim()}
              className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center active:scale-90 transition-transform disabled:opacity-40 flex-shrink-0">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Terms view
  if (view === 'terms') {
    return <CommunityTerms onBack={() => setView('feed')} />;
  }

  // In-app gallery modal
  if (showInAppGallery) {
    return (
      <div className="px-4 pt-6 pb-4 max-w-md mx-auto space-y-4">
        <button onClick={() => setShowInAppGallery(false)} className="flex items-center gap-1 text-gray-400 text-sm font-semibold">
          <X size={16} /> Back
        </button>
        <h2 className="text-xl font-extrabold">Your In-App Photos</h2>
        {inAppPhotos.length === 0 ? (
          <div className="text-center py-12">
            <Camera size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No photos taken in the app yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {inAppPhotos.map((p) => (
              <button key={p.id} onClick={() => handleInAppPhoto(p.image_data)}
                className="aspect-square rounded-2xl overflow-hidden active:scale-95 transition-transform">
                <img src={p.image_data} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (confirmDelete) {
    return (
      <DeleteConfirmModal
        onConfirm={() => handleDeletePost(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    );
  }

  return null;
}

function DeleteConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onCancel}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-xs w-full shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
            <Trash2 size={24} className="text-red-500" />
          </div>
        </div>
        <p className="font-bold text-center mb-1">Delete this post?</p>
        <p className="text-xs text-gray-400 text-center mb-5">This will permanently remove your post, its likes, and comments. This cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 bg-gray-100 dark:bg-gray-800 font-bold py-3 rounded-2xl text-sm active:scale-95 transition-transform">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-2xl text-sm active:scale-95 transition-transform">Delete</button>
        </div>
      </div>
    </div>
  );
}

function CommunityTerms({ onBack }: { onBack: () => void }) {
  const sections = [
    { icon: '🤝', title: 'Respect Everyone', text: 'Treat all members with kindness and respect. We are all here to grow together.' },
    { icon: '🚫', title: 'No Harassment', text: 'Bullying, harassment, hate speech, and discrimination are strictly prohibited.' },
    { icon: '🎭', title: 'Be Authentic', text: 'No impersonation of other users, public figures, or staff members.' },
    { icon: '📸', title: 'Appropriate Content', text: 'No offensive profile pictures, usernames, or inappropriate images.' },
    { icon: '⚠️', title: 'No Illegal Content', text: 'Sharing illegal, harmful, or dangerous content is forbidden.' },
    { icon: '🛡️', title: 'Spam & Scams', text: 'Spam, scams, fraudulent links, and unsolicited promotions are not allowed.' },
    { icon: '📋', title: 'Your Responsibility', text: 'You are responsible for the content you publish. Think before you post.' },
    { icon: '🔧', title: 'Moderation Rights', text: 'We may review, remove, or moderate content to keep the platform safe for everyone.' },
    { icon: '⛔', title: 'Consequences', text: 'Repeated violations may result in warnings, temporary restrictions, or permanent suspension.' },
  ];

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-gray-400 text-sm font-semibold">
        <X size={16} /> Back to Community
      </button>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg text-center">
        <Shield size={32} className="mx-auto mb-2" />
        <h1 className="text-xl font-extrabold">Community Guidelines</h1>
        <p className="text-xs text-white/80 mt-1">& Terms of Use</p>
      </div>

      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
          Our community exists to provide a respectful and welcoming environment for everyone. By using this community, you agree to follow these guidelines.
        </p>
        <div className="space-y-3">
          {sections.map((s, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">{s.icon}</div>
              <div>
                <p className="font-bold text-sm">{s.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-4 text-center">
          <Sparkles size={18} className="text-indigo-500 mx-auto mb-1" />
          <p className="text-sm font-bold">Respecting these rules</p>
          <p className="text-xs text-gray-400">helps maintain a friendly environment for everyone.</p>
        </div>
      </div>
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}
