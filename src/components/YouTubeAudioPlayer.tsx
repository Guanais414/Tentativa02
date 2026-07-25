import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, X, Loader2 } from 'lucide-react';

// YouTube IFrame API types
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoaded = false;
let apiLoading = false;
const apiReadyCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiLoaded && window.YT && window.YT.Player) {
      resolve();
      return;
    }
    apiReadyCallbacks.push(resolve);
    if (apiLoading) return;
    apiLoading = true;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      apiLoading = false;
      apiReadyCallbacks.forEach((cb) => cb());
      apiReadyCallbacks.length = 0;
    };
  });
}

export interface SoundTrack {
  id: string;
  name: string;
  emoji: string;
  videoId: string;
  description: string;
}

interface Props {
  track: SoundTrack | null;
  onClose: () => void;
}

export function YouTubeAudioPlayer({ track, onClose }: Props) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(60);
  const [ready, setReady] = useState(false);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const initPlayer = useCallback(async () => {
    if (!track) return;
    setLoading(true);
    setReady(false);
    await loadYouTubeAPI();

    if (playerRef.current) {
      // Already have a player, just load new video
      playerRef.current.loadVideoById(track.videoId);
      return;
    }

    if (!containerRef.current || !window.YT) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '0',
      width: '0',
      videoId: track.videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        loop: 1,
        playlist: track.videoId,
      },
      events: {
        onReady: (e: any) => {
          e.target.setVolume(volume);
          e.target.playVideo();
          setPlaying(true);
          setLoading(false);
          setReady(true);
        },
        onStateChange: (e: any) => {
          if (e.data === window.YT.PlayerState.PLAYING) {
            setPlaying(true);
            setLoading(false);
          } else if (e.data === window.YT.PlayerState.PAUSED) {
            setPlaying(false);
          } else if (e.data === window.YT.PlayerState.BUFFERING) {
            setLoading(true);
          }
        },
        onError: () => {
          setLoading(false);
          setPlaying(false);
        },
      },
    });
  }, [track, volume]);

  useEffect(() => {
    if (track) {
      initPlayer();
    }
  }, [track, initPlayer]);

  useEffect(() => {
    if (playerRef.current && ready) {
      playerRef.current.setVolume(muted ? 0 : volume);
    }
  }, [volume, muted, ready]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playing) {
      playerRef.current.pauseVideo();
      setPlaying(false);
    } else {
      playerRef.current.playVideo();
      setPlaying(true);
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
    };
  }, []);

  // Reset player when track changes to null
  useEffect(() => {
    if (!track && playerRef.current) {
      try {
        playerRef.current.pauseVideo();
      } catch {
        // ignore
      }
    }
  }, [track]);

  if (!track) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto animate-slide-up">
      <div className="bg-gray-900/95 dark:bg-gray-100/95 backdrop-blur-xl rounded-3xl p-4 shadow-2xl">
        {/* Hidden YouTube container */}
        <div className="hidden">
          <div ref={containerRef} />
        </div>

        <div className="flex items-center gap-3">
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : playing ? (
              <Pause size={20} />
            ) : (
              <Play size={20} className="ml-0.5" />
            )}
          </button>

          {/* Track info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{track.emoji}</span>
              <div className="min-w-0">
                <p className={`font-bold text-sm truncate ${playing ? 'text-white dark:text-gray-900' : 'text-gray-300 dark:text-gray-600'}`}>
                  {track.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{track.description}</p>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 dark:bg-gray-800/50 flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
          >
            <X size={16} className="text-gray-300 dark:text-gray-600" />
          </button>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-2 mt-3">
          <button onClick={toggleMute} className="flex-shrink-0">
            {muted ? (
              <VolumeX size={16} className="text-gray-400" />
            ) : (
              <Volume2 size={16} className="text-gray-400" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseInt(e.target.value));
              setMuted(false);
            }}
            className="flex-1 h-1.5 accent-green-500"
          />
          <span className="text-xs text-gray-400 w-8 text-right tabular-nums">{muted ? 0 : volume}%</span>
        </div>

        {/* Visual indicator */}
        {playing && (
          <div className="flex items-center justify-center gap-1 mt-2 h-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-green-400 rounded-full"
                style={{
                  height: '100%',
                  animation: `eq 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes eq {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
