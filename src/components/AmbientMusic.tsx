import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// YouTube IFrame API
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
    if (apiLoaded && window.YT && window.YT.Player) { resolve(); return; }
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

// Calm instrumental ambient music — real YouTube audio, not synth
const LOBBY_TRACKS = [
  { videoId: 'jfQG8qBz9o4', name: 'Lo-Fi Chill' },        // lofi hip hop
  { videoId: '5qap5aO4i9A', name: 'Chillhop' },          // chillhop
  { videoId: 'DWcJFNfaw9c', name: 'Peaceful Piano' },     // peaceful piano
];

let sharedPlayer: any = null;
let sharedContainer: HTMLDivElement | null = null;

export function AmbientMusic() {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const trackIdxRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const start = useCallback(async () => {
    setLoading(true);
    await loadYouTubeAPI();
    if (!window.YT) return;

    const track = LOBBY_TRACKS[trackIdxRef.current % LOBBY_TRACKS.length];

    if (sharedPlayer) {
      sharedPlayer.loadVideoById(track.videoId);
      sharedPlayer.playVideo();
      setPlaying(true);
      setLoading(false);
      return;
    }

    if (!containerRef.current) return;
    sharedContainer = containerRef.current;

    sharedPlayer = new window.YT.Player(containerRef.current, {
      height: '0', width: '0',
      videoId: track.videoId,
      playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, playsinline: 1, loop: 1, playlist: track.videoId },
      events: {
        onReady: (e: any) => { e.target.setVolume(40); e.target.playVideo(); setPlaying(true); setLoading(false); },
        onStateChange: (e: any) => {
          if (e.data === window.YT.PlayerState.PLAYING) { setPlaying(true); setLoading(false); }
          if (e.data === window.YT.PlayerState.ENDED) {
            trackIdxRef.current++;
            const next = LOBBY_TRACKS[trackIdxRef.current % LOBBY_TRACKS.length];
            sharedPlayer.loadVideoById(next.videoId);
          }
        },
        onError: () => { setLoading(false); setPlaying(false); },
      },
    });
  }, []);

  const stop = useCallback(() => {
    if (sharedPlayer) {
      try { sharedPlayer.pauseVideo(); } catch {}
    }
    setPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      if (sharedPlayer) {
        try { sharedPlayer.destroy(); } catch {}
        sharedPlayer = null;
      }
    };
  }, []);

  return (
    <>
      <button
        onClick={playing ? stop : start}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg flex items-center justify-center active:scale-90 transition-transform"
        aria-label={playing ? 'Mute music' : 'Play music'}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
        ) : playing ? (
          <Volume2 size={18} className="text-green-600 animate-pulse" />
        ) : (
          <VolumeX size={18} className="text-gray-400" />
        )}
      </button>
      {/* Hidden YouTube player container */}
      <div className="hidden">
        <div ref={containerRef} />
      </div>
    </>
  );
}

/* Sound effects still use Web Audio API for short UI sounds */
let sharedCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return sharedCtx;
}

export function playSoundEffect(type: 'coin' | 'levelup' | 'success' | 'click' | 'discover') {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    if (type === 'coin') {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(988, now);
      osc.frequency.setValueAtTime(1319, now + 0.08);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'levelup') {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle'; osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.15, now + i * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.1); osc.stop(now + i * 0.1 + 0.3);
      });
    } else if (type === 'success') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, now);
      osc.frequency.linearRampToValueAtTime(784, now + 0.15);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; osc.frequency.value = 800;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'discover') {
      [659, 880, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine'; osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.1, now + i * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(now + i * 0.06); osc.stop(now + i * 0.06 + 0.2);
      });
    }
  } catch {}
}
