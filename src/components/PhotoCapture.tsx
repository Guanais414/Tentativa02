import { useState, useRef, useCallback } from 'react';
import { Camera, X, Check, AlertCircle } from 'lucide-react';

interface Props {
  onCapture: (photoDataUrl: string) => void;
  label?: string;
  fullWidth?: boolean;
}

type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied';

export function PhotoCapture({ onCapture, label = 'Add Photo', fullWidth = false }: Props) {
  const [state, setState] = useState<PermissionState>('idle');
  const [showModal, setShowModal] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const requestPermission = useCallback(async () => {
    setState('requesting');
    setShowModal(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      setState('granted');
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch {
      setState('denied');
    }
  }, []);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCaptured(null);
    setShowModal(false);
    setState('idle');
  }, [stream]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    setCaptured(dataUrl);
  }, []);

  const confirmPhoto = useCallback(() => {
    if (captured) {
      onCapture(captured);
      stopStream();
    }
  }, [captured, onCapture, stopStream]);

  return (
    <>
      <button
        onClick={requestPermission}
        className={`flex items-center justify-center gap-2 font-bold active:scale-95 transition-transform ${fullWidth ? 'w-full text-sm text-white px-4 py-3.5 rounded-2xl bg-indigo-500 shadow-md' : 'text-xs text-indigo-500 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30'}`}
      >
        <Camera size={fullWidth ? 18 : 14} /> {label}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-[90] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 pt-6">
            <button onClick={stopStream} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <X size={20} className="text-white" />
            </button>
            <p className="text-white font-bold text-sm">
              {state === 'denied' ? 'Permission Needed' : captured ? 'Confirm Photo' : 'Take Photo'}
            </p>
            <div className="w-10" />
          </div>

          {/* Body + controls combined */}
          <div className="flex-1 flex items-center justify-center px-4">
            {state === 'requesting' && (
              <div className="text-center text-white">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-sm">Requesting camera access...</p>
              </div>
            )}

            {state === 'denied' && (
              <div className="text-center text-white max-w-xs">
                <AlertCircle size={48} className="mx-auto mb-4 text-amber-400" />
                <p className="font-bold mb-2">Camera access blocked</p>
                <p className="text-sm text-white/60 mb-6">
                  To add photos to your tasks, allow camera access in your browser settings and try again.
                </p>
                <button
                  onClick={requestPermission}
                  className="bg-white text-gray-900 font-bold px-6 py-3 rounded-2xl active:scale-95 transition-transform"
                >
                  Try Again
                </button>
              </div>
            )}

            {state === 'granted' && (
              <div className="flex items-center justify-center gap-4 sm:gap-6 w-full max-w-lg">
                {/* Left action: Confirm (only when captured) */}
                <div className="flex-shrink-0 w-16 flex justify-center">
                  {captured ? (
                    <button
                      onClick={confirmPhoto}
                      className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-green-500/50"
                      aria-label="Confirm photo"
                    >
                      <Check size={30} className="text-white" />
                    </button>
                  ) : (
                    <div className="w-16 h-16" />
                  )}
                </div>

                {/* Center: camera preview / captured photo */}
                <div className="relative w-full max-w-[240px] aspect-square rounded-3xl overflow-hidden bg-black">
                  {!captured ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 border-2 border-white/30 rounded-3xl pointer-events-none" />
                    </>
                  ) : (
                    <img src={captured} alt="Captured" className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Right action: Take photo / Retake */}
                <div className="flex-shrink-0 w-16 flex justify-center">
                  {!captured ? (
                    <button
                      onClick={takePhoto}
                      className="w-16 h-16 rounded-full bg-white border-4 border-white/30 active:scale-90 transition-transform"
                      aria-label="Take photo"
                    >
                      <div className="w-full h-full rounded-full border-2 border-gray-300" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setCaptured(null)}
                      className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
                      aria-label="Retake photo"
                    >
                      <X size={26} className="text-white" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Helper hint */}
          {state === 'granted' && (
            <div className="pb-6 pt-1 text-center">
              <p className="text-xs text-white/50 font-semibold">
                {captured ? 'Confirm on the left, retake on the right' : 'Tap the button on the right to capture'}
              </p>
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
