import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { UserProfile, GameState, MascotType } from '../types';
import { Mascot } from './Mascot';
import { Send, Leaf, Heart, X, ChevronLeft, Sparkles, AlertTriangle, Mail, RefreshCw, Info, Shield, ScrollText, CheckCircle2 } from 'lucide-react';

interface Props {
  profile: UserProfile;
  game: GameState;
  userId: string | null;
  onGainXp: (amount: number, label?: string) => void;
}

interface Letter {
  id: string;
  content: string;
  mood_tag: string | null;
  mascot_type: string;
  created_at: string;
}

const MOOD_TAGS = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'anxious', emoji: '😰', label: 'Anxious' },
  { id: 'excited', emoji: '🤩', label: 'Excited' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
  { id: 'grateful', emoji: '🙏', label: 'Grateful' },
  { id: 'other', emoji: '✨', label: 'Other' },
];

const INSPIRATIONAL_LETTERS = [
  'Every small step you take today becomes part of the person you\'ll be tomorrow.',
  'Be patient with yourself. Growth happens quietly before it becomes visible.',
  'The stars don\'t rush to shine. Neither should you.',
  'You have survived every difficult day so far. That\'s proof of your strength.',
  'Sometimes resting is the bravest thing you can do. Tomorrow is another chance.',
  'Believe in slow progress. Even the tallest bamboo once started beneath the soil.',
];

const DRAFT_KEY = 'bamboo_draft';

export function BambooForest({ profile, game, userId, onGainXp }: Props) {
  const [termsAccepted, setTermsAccepted] = useState(() => {
    try { return localStorage.getItem('bamboo_terms_accepted') === 'true'; } catch { return false; }
  });
  const [view, setView] = useState<'home' | 'write' | 'pick' | 'read' | 'replied' | 'letter'>('home');
  const [letterText, setLetterText] = useState('');
  const [moodTag, setMoodTag] = useState('other');
  const [letters, setLetters] = useState<Letter[]>([]);
  const [currentLetter, setCurrentLetter] = useState<Letter | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myLetterId, setMyLetterId] = useState<string | null>(null);
  const [myReply, setMyReply] = useState<string | null>(null);
  const [inspirational, setInspirational] = useState<string>(INSPIRATIONAL_LETTERS[0]);
  const [letterOpen, setLetterOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showTerms, setShowTerms] = useState(true);
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const acceptTermsAndEnter = () => {
    setTermsAccepted(true);
    try {
      localStorage.setItem('bamboo_terms_accepted', 'true');
    } catch { /* ignore */ }
    setShowTerms(false);
    pickRandomLetter();
  };

  const pickRandomLetter = () => {
    setLetterOpen(false);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * INSPIRATIONAL_LETTERS.length);
      setInspirational(INSPIRATIONAL_LETTERS[idx]);
      setLetterOpen(true);
    }, 100);
  };

  const fetchLetters = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('bamboo_letters')
      .select('id, content, mood_tag, mascot_type, created_at')
      .eq('replied', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      setError('Could not load letters. Please try again.');
    } else if (data) {
      setLetters(data as Letter[]);
    }
    setLoading(false);
  }, []);

  const sendLetter = async () => {
    if (letterText.trim().length < 5) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('bamboo_letters')
      .insert({
        content: letterText.trim(),
        mood_tag: moodTag,
        mascot_type: profile.mascot,
        author_id: userId,
      })
      .select('id')
      .single();

    if (error) {
      setError('Could not send your letter. Please try again.');
      setLoading(false);
      return;
    }
    if (data) {
      setMyLetterId(data.id);
      setLetterText('');
      localStorage.removeItem(DRAFT_KEY);
      setView('home');
      onGainXp(15, 'Shared your feelings');
    }
    setLoading(false);
  };

  const pickLetter = (letter: Letter) => {
    setCurrentLetter(letter);
    setView('read');
  };

  const sendReply = async () => {
    if (!currentLetter || replyText.trim().length < 3) return;
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('bamboo_letters')
      .update({
        reply: replyText.trim(),
        replied: true,
        replied_at: new Date().toISOString(),
      })
      .eq('id', currentLetter.id)
      .eq('replied', false);

    if (error) {
      setError('Could not send your reply. Someone else may have already replied.');
      setLoading(false);
      return;
    }
    setMyReply(replyText.trim());
    setReplyText('');
    setView('replied');
    onGainXp(25, 'Encouraged someone');
    setLoading(false);
  };

  const checkMyReply = async () => {
    if (!myLetterId) return;
    const { data } = await supabase
      .from('bamboo_letters')
      .select('reply, replied')
      .eq('id', myLetterId)
      .maybeSingle();
    if (data?.replied && data.reply) {
      setMyReply(data.reply);
    }
  };

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) setLetterText(draft);
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (letterText) localStorage.setItem(DRAFT_KEY, letterText);
  }, [letterText]);

  useEffect(() => {
    if (view === 'pick') fetchLetters();
    if (view === 'home' && myLetterId) checkMyReply();
  }, [view, myLetterId, fetchLetters]);

  return (
    <div className="px-4 pt-6 pb-4 max-w-md mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Leaf size={24} className="text-green-600" />
        <h1 className="text-2xl font-extrabold text-green-800 dark:text-green-300">Bamboo Forest</h1>
        <button
          onClick={() => setShowInfo(true)}
          className="ml-auto w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center active:scale-90 transition-transform"
          aria-label="About Bamboo Forest"
        >
          <Info size={18} className="text-green-600 dark:text-green-300" />
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        A quiet space to reflect, share your thoughts, and support others.
      </p>

      {view === 'home' && (
        <div className="space-y-4 animate-fade-in">
          {/* Night bamboo campfire scene with pet reading */}
          <BambooNightScene mascot={profile.mascot} mascotName={profile.mascotName} />

          {/* Random inspirational letter */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-amber-600" />
                <p className="font-bold text-sm">A Letter for You</p>
              </div>
              <button onClick={pickRandomLetter} className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center active:scale-90 transition-transform">
                <RefreshCw size={14} className="text-amber-600" />
              </button>
            </div>
            <div className={`transition-all duration-700 ${letterOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 italic">"{inspirational}"</p>
            </div>
          </div>

          {/* Action buttons */}
          <button onClick={() => setView('write')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-3xl shadow-lg shadow-green-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2">
            <Send size={18} /> Send a Letter
          </button>
          <button onClick={() => setView('pick')}
            className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl text-green-700 dark:text-green-300 font-bold py-4 rounded-3xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 border-2 border-green-200 dark:border-green-800">
            <Heart size={18} /> Reply to Someone
          </button>

          {/* My letter status */}
          {myLetterId && (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
              <p className="font-bold text-sm mb-2 flex items-center gap-2"><Sparkles size={16} className="text-green-500" /> Your Letter</p>
              {myReply ? (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Someone replied:</p>
                  <p className="text-sm bg-green-50 dark:bg-green-950/20 rounded-2xl p-3 italic">"{myReply}"</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Your letter is floating down the river... waiting for someone to pick it up.</p>
              )}
            </div>
          )}
        </div>
      )}

      {view === 'write' && (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => setView('home')} className="flex items-center gap-1 text-gray-400 text-sm font-semibold">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
            <p className="font-bold text-lg mb-1">Write freely</p>
            <p className="text-xs text-gray-400 mb-4">Your letter is anonymous. Someone will read it once and reply with kindness.</p>

            <p className="text-sm font-semibold mb-2">How are you feeling?</p>
            <div className="flex gap-2 flex-wrap mb-4">
              {MOOD_TAGS.map((m) => (
                <button key={m.id} onClick={() => setMoodTag(m.id)}
                  className={`px-3 py-2 rounded-2xl text-sm font-bold transition-all ${moodTag === m.id ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>

            <textarea
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              maxLength={1000}
              placeholder="Dear friend, today I..."
              autoFocus
              className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 outline-none focus:ring-2 ring-green-400 resize-none h-56 text-sm leading-relaxed border-0"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-gray-300">Draft saved automatically</p>
              <p className="text-xs text-gray-400">{letterText.length}/1000</p>
            </div>

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

            <button onClick={sendLetter} disabled={letterText.trim().length < 5 || loading}
              className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-40 flex items-center justify-center gap-2 text-base">
              <Send size={18} /> {loading ? 'Sending...' : 'Release to the River'}
            </button>
          </div>
        </div>
      )}

      {view === 'pick' && (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => setView('home')} className="flex items-center gap-1 text-gray-400 text-sm font-semibold">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
            <p className="font-bold mb-1 flex items-center gap-2"><Heart size={18} className="text-green-500" /> Letters waiting for a reply</p>
            <p className="text-xs text-gray-400 mb-4">Pick one, read it, and send encouragement. You'll only see it this once.</p>

            {loading && letters.length === 0 && (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-3 border-green-200 border-t-green-500 rounded-full animate-spin mb-2" />
                <p className="text-sm text-gray-400">Gathering letters...</p>
              </div>
            )}

            {!loading && letters.length === 0 && (
              <div className="text-center py-8">
                <Leaf size={36} className="mx-auto text-green-300 mb-3" />
                <p className="text-sm text-gray-400">No letters waiting right now. Check back soon, or send your own!</p>
              </div>
            )}

            <div className="space-y-2">
              {letters.map((l) => {
                const mood = MOOD_TAGS.find((m) => m.id === l.mood_tag);
                return (
                  <button key={l.id} onClick={() => pickLetter(l)}
                    className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-left active:scale-95 transition-transform">
                    <div className="flex items-center gap-2 mb-2">
                      <Mascot type={(l.mascot_type as MascotType) || 'goose'} size={32} animated={false} />
                      <span className="text-xs text-gray-400">{new Date(l.created_at).toLocaleDateString()}</span>
                      {mood && <span className="text-lg">{mood.emoji}</span>}
                    </div>
                    <p className="text-sm line-clamp-2">{l.content}</p>
                  </button>
                );
              })}
            </div>
            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
          </div>
        </div>
      )}

      {view === 'read' && currentLetter && (
        <div className="space-y-4 animate-fade-in">
          <button onClick={() => { setView('pick'); setCurrentLetter(null); }} className="flex items-center gap-1 text-gray-400 text-sm font-semibold">
            <ChevronLeft size={16} /> Back to letters
          </button>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Mascot type={(currentLetter.mascot_type as MascotType) || 'goose'} size={48} mood="neutral" />
              <div>
                <p className="text-xs text-gray-400">Anonymous letter</p>
                {MOOD_TAGS.find((m) => m.id === currentLetter.mood_tag) && (
                  <span className="text-lg">{MOOD_TAGS.find((m) => m.id === currentLetter.mood_tag)?.emoji} {MOOD_TAGS.find((m) => m.id === currentLetter.mood_tag)?.label}</span>
                )}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 rounded-2xl p-4 mb-4">
              <p className="text-sm leading-relaxed">{currentLetter.content}</p>
            </div>
            <p className="font-bold text-sm mb-2">Your encouraging reply:</p>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} maxLength={600}
              placeholder="Send some kindness their way..."
              autoFocus
              className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 outline-none focus:ring-2 ring-green-400 resize-none h-32 text-sm border-0" />
            <p className="text-xs text-gray-400 text-right mt-1">{replyText.length}/600</p>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            <button onClick={sendReply} disabled={replyText.trim().length < 3 || loading}
              className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg active:scale-95 transition-transform disabled:opacity-40 flex items-center justify-center gap-2">
              <Heart size={16} /> {loading ? 'Sending...' : 'Send Encouragement'}
            </button>
          </div>
        </div>
      )}

      {view === 'replied' && (
        <div className="space-y-4 animate-fade-in text-center pt-8">
          <div className="animate-celebrate inline-block">
            <Mascot type={profile.mascot} size={120} mood="excited" />
          </div>
          <h2 className="text-2xl font-extrabold text-green-700 dark:text-green-300">Thank you for caring!</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Your kind words have been sent. You'll never see that letter again, but your encouragement will stay with them.
          </p>
          <button onClick={() => setView('home')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg active:scale-95 transition-transform">
            Back to Forest
          </button>
        </div>
      )}

      {/* Info modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/60 z-[80] flex items-end sm:items-center justify-center p-4" onClick={() => setShowInfo(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <Info size={20} className="text-green-600" />
              <h2 className="font-extrabold text-lg text-gray-800 dark:text-gray-100">About Bamboo Forest</h2>
              <button onClick={() => setShowInfo(false)} className="ml-auto w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center active:scale-90 transition-transform">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="px-5 py-5 overflow-y-auto space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100 mb-1">What is Bamboo Forest?</p>
                <p>Bamboo Forest is a quiet, anonymous community space. You can write a letter about how you feel, send it down the river, and someone else will read it once and reply with kindness. You can also pick up a letter someone else sent and send them encouragement.</p>
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100 mb-1">Sending a letter</p>
                <p>Tap <span className="font-semibold text-green-600">Send a Letter</span>, write what's on your mind (up to 1000 characters), choose a mood tag, and send it. Your letter stays anonymous. Once sent, it floats down the river and waits for someone to pick it up and reply.</p>
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100 mb-1">Replying to a letter</p>
                <p>Tap <span className="font-semibold text-green-600">Pick a Letter</span> to see letters waiting for a reply. Choose one, read it, and write a short, kind response (up to 600 characters). After you send your encouragement, that letter disappears from your view forever — you'll never see it again.</p>
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100 mb-1">Checking your reply</p>
                <p>If someone replies to your letter, you'll see it on the home screen under <span className="font-semibold text-green-600">Your Letter</span>. You can only read the reply once; after that it's gone.</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-3 border border-amber-200 dark:border-amber-900/50">
                <p className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 mb-1"><AlertTriangle size={14} /> Be kind</p>
                <p className="text-xs text-amber-700 dark:text-amber-400/80">This is a supportive space. Harsh words, spam, or harmful content is not welcome. Treat every letter as if it were written by a friend.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms of use modal (first visit) */}
      {!termsAccepted && showTerms && (
        <div className="fixed inset-0 bg-black/70 z-[85] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <Shield size={20} className="text-green-600" />
              <h2 className="font-extrabold text-lg text-gray-800 dark:text-gray-100">Terms of Use</h2>
            </div>
            <div
              className="px-5 py-4 overflow-y-auto space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex-1"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) {
                  setTermsScrolled(true);
                }
              }}
            >
              <p className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-100"><ScrollText size={15} /> Bamboo Forest Community Guidelines</p>
              <p>Before you enter Bamboo Forest, please read and agree to these terms. This space works best when everyone treats it with care.</p>
              <div className="space-y-2.5">
                <p><span className="font-semibold text-gray-800 dark:text-gray-100">1. Age recommendation.</span> Bamboo Forest is recommended for users aged 16 and older, as it involves mature, supportive conversations. Younger users are welcome but should use this space with care.</p>
                <p><span className="font-semibold text-gray-800 dark:text-gray-100">2. Anonymity.</span> Letters are anonymous. No names or profiles are attached to a letter. Do not include personal information (full name, address, phone, email) in your letters.</p>
                <p><span className="font-semibold text-gray-800 dark:text-gray-100">3. Kindness first.</span> Write and reply with empathy. Harassment, threats, hate speech, bullying, or shaming are not allowed and may result in losing access to this space.</p>
                <p><span className="font-semibold text-gray-800 dark:text-gray-100">4. No harmful content.</span> Do not post content that encourages self-harm, violence, or illegal activity. If you or someone else is in crisis, please contact local emergency services or a crisis helpline — this space is not a substitute for professional help.</p>
                <p><span className="font-semibold text-gray-800 dark:text-gray-100">5. No spam or ads.</span> Do not use Bamboo Forest to promote products, services, or links to external sites.</p>
                <p><span className="font-semibold text-gray-800 dark:text-gray-100">6. One-time letters.</span> A letter you pick up can only be read and replied to once. A reply to your letter can only be read once. There is no history or saved conversations.</p>
                <p><span className="font-semibold text-gray-800 dark:text-gray-100">7. Moderation.</span> Content may be reviewed and removed if it violates these guidelines. Repeat violations may lead to restricted access.</p>
                <p><span className="font-semibold text-gray-800 dark:text-gray-100">8. Your responsibility.</span> You are responsible for what you write. Share only what you're comfortable having someone else read.</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl p-3 border border-green-200 dark:border-green-900/50">
                <p className="text-xs text-green-700 dark:text-green-400">By agreeing, you accept these terms and agree to help keep Bamboo Forest a safe, supportive space for everyone.</p>
              </div>
              <div className="h-2" />
            </div>
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
              {!termsScrolled && (
                <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1.5">
                  <ScrollText size={13} /> Scroll to the bottom to continue
                </p>
              )}
              {termsScrolled && (
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <button
                    onClick={() => setTermsAgreed(!termsAgreed)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${termsAgreed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                    aria-label="Agree to terms"
                  >
                    {termsAgreed && <CheckCircle2 size={18} className="text-white" />}
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-200">I have read and agree to the Terms of Use</span>
                </label>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowTerms(false); setTermsAgreed(false); setTermsScrolled(false); }}
                  className="flex-1 py-3 rounded-2xl font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 active:scale-95 transition-transform"
                >
                  Decline
                </button>
                <button
                  onClick={acceptTermsAndEnter}
                  disabled={!termsScrolled || !termsAgreed}
                  className="flex-1 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 active:scale-95 transition-transform disabled:opacity-30 disabled:active:scale-100 shadow-lg"
                >
                  Agree & Enter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Night Bamboo Campfire Scene ---- */
function BambooNightScene({ mascot, mascotName }: { mascot: MascotType; mascotName: string }) {
  const [embers, setEmbers] = useState<{ id: number; x: number; delay: number }[]>([]);
  const [fireflies, setFireflies] = useState<{ id: number; x: number; y: number; delay: number; duration: number }[]>([]);
  const [leaves, setLeaves] = useState<{ id: number; x: number; delay: number; rot: number }[]>([]);
  const emberIdRef = useRef(0);
  const fireflyIdRef = useRef(0);
  const leafIdRef = useRef(0);

  useEffect(() => {
    // Embers
    const emberInterval = setInterval(() => {
      const id = emberIdRef.current++;
      const x = 46 + Math.random() * 8;
      const delay = Math.random() * 1.5;
      setEmbers((e) => [...e, { id, x, delay }]);
      setTimeout(() => setEmbers((e) => e.filter((em) => em.id !== id)), 4000);
    }, 500);

    // Fireflies
    const fireflyInterval = setInterval(() => {
      const id = fireflyIdRef.current++;
      const x = 5 + Math.random() * 90;
      const y = 10 + Math.random() * 60;
      const delay = Math.random() * 3;
      const duration = 4 + Math.random() * 4;
      setFireflies((f) => [...f, { id, x, y, delay, duration }]);
      setTimeout(() => setFireflies((f) => f.filter((fl) => fl.id !== id)), duration * 1000 + 1000);
    }, 2000);

    // Falling leaves
    const leafInterval = setInterval(() => {
      const id = leafIdRef.current++;
      const x = 5 + Math.random() * 90;
      const delay = Math.random() * 2;
      const rot = Math.random() * 360;
      setLeaves((l) => [...l, { id, x, delay, rot }]);
      setTimeout(() => setLeaves((l) => l.filter((lf) => lf.id !== id)), 8000);
    }, 3000);

    // Initial fireflies
    for (let i = 0; i < 5; i++) {
      const id = fireflyIdRef.current++;
      setFireflies((f) => [...f, { id, x: 10 + Math.random() * 80, y: 15 + Math.random() * 50, delay: Math.random() * 3, duration: 5 + Math.random() * 3 }]);
    }

    return () => {
      clearInterval(emberInterval);
      clearInterval(fireflyInterval);
      clearInterval(leafInterval);
    };
  }, []);

  return (
    <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl mb-4" style={{ background: 'linear-gradient(180deg, #0a1f15 0%, #112e1f 25%, #163d2a 50%, #1a4a32 75%, #112e1f 100%)' }}>
      {/* Fog layers */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 70%, rgba(30,70,50,0.3) 0%, transparent 60%)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(20,45,32,0.5) 100%)' }} />

      {/* Stars */}
      {[{ x: 12, y: 8 }, { x: 28, y: 5 }, { x: 45, y: 10 }, { x: 62, y: 6 }, { x: 78, y: 12 }, { x: 88, y: 7 }, { x: 20, y: 15 }, { x: 55, y: 18 }, { x: 72, y: 16 }].map((s, i) => (
        <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${i * 0.4}s`, opacity: 0.4 }} />
      ))}

      {/* Moon */}
      <div className="absolute top-5 right-8 w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-500 shadow-[0_0_20px_8px_rgba(180,200,190,0.12)]" />

      {/* Tall bamboo stalks surrounding the area */}
      {/* Left bamboo cluster */}
      {[{ x: 2, h: 260, w: 6 }, { x: 7, h: 280, w: 5 }, { x: 12, h: 240, w: 4 }, { x: 0, h: 290, w: 7 }, { x: 16, h: 220, w: 4 }].map((b, i) => (
        <BambooStalk key={`l${i}`} x={b.x} h={b.h} w={b.w} delay={i * 0.5} />
      ))}
      {/* Right bamboo cluster */}
      {[{ x: 88, h: 270, w: 6 }, { x: 93, h: 285, w: 5 }, { x: 97, h: 250, w: 6 }, { x: 84, h: 230, w: 4 }, { x: 100, h: 290, w: 7 }].map((b, i) => (
        <BambooStalk key={`r${i}`} x={b.x} h={b.h} w={b.w} delay={i * 0.7} />
      ))}
      {/* Back bamboo */}
      {[{ x: 30, h: 200, w: 3 }, { x: 40, h: 180, w: 3 }, { x: 55, h: 190, w: 3 }, { x: 68, h: 170, w: 3 }].map((b, i) => (
        <BambooStalk key={`b${i}`} x={b.x} h={b.h} w={b.w} delay={i * 0.3} dark />
      ))}

      {/* Dense dark vegetation at bottom */}
      <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 300 60" preserveAspectRatio="none" style={{ height: '20%' }}>
        <path d="M0,60 Q20,30 40,40 Q60,25 80,38 Q100,20 120,35 Q140,28 160,38 Q180,22 200,35 Q220,30 240,38 Q260,25 280,35 Q300,28 300,40 L300,60 Z" fill="#0a1810" opacity="0.9" />
        <path d="M0,60 Q30,40 60,45 Q90,35 120,42 Q150,38 180,45 Q210,35 240,42 Q270,40 300,45 L300,60 Z" fill="#080f0a" opacity="0.95" />
      </svg>

      {/* Fire glow on ground - main light source */}
      <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-64 h-48 rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(255,130,40,0.25) 0%, rgba(200,80,20,0.1) 40%, transparent 70%)' }} />

      {/* Dynamic light on bamboo from fire */}
      <div className="absolute bottom-[18%] left-1/2 -translate-x-1/2 w-80 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(255,140,50,0.08) 0%, transparent 60%)' }} />

      {/* Campfire */}
      <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 z-20">
        {/* Logs */}
        <div className="relative w-24 h-8">
          <div className="absolute bottom-0 w-24 h-4 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-full transform rotate-2" />
          <div className="absolute bottom-1 w-20 h-3.5 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 rounded-full transform -rotate-3 left-2" />
          <div className="absolute bottom-2 w-16 h-3 bg-gradient-to-r from-amber-800 to-amber-900 rounded-full transform rotate-1 left-4" />
        </div>
        {/* Flames */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <svg width="48" height="60" viewBox="0 0 48 60">
            <path d="M24,60 Q6,42 10,24 Q14,10 24,0 Q34,10 38,24 Q42,42 24,60 Z" fill="url(#fireGrad2)" className="animate-pulse" />
            <path d="M24,55 Q14,38 16,22 Q18,10 24,4 Q30,10 32,22 Q34,38 24,55 Z" fill="#fde047" opacity="0.6" className="animate-pulse" />
            <path d="M24,50 Q18,36 20,24 Q22,14 24,8 Q26,14 28,24 Q30,36 24,50 Z" fill="#fef3c7" opacity="0.4" className="animate-pulse" />
            <defs>
              <linearGradient id="fireGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="35%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Rising embers */}
      {embers.map((em) => (
        <div
          key={em.id}
          className="absolute w-1 h-1 rounded-full bg-amber-400 pointer-events-none animate-float-up z-20"
          style={{
            left: `${em.x}%`,
            bottom: '25%',
            animationDelay: `${em.delay}s`,
            animationDuration: '4s',
            boxShadow: '0 0 6px rgba(255,160,40,0.9)',
          }}
        />
      ))}

      {/* Fireflies */}
      {fireflies.map((fl) => (
        <div
          key={fl.id}
          className="absolute pointer-events-none z-15"
          style={{ left: `${fl.x}%`, top: `${fl.y}%`, animation: `firefly ${fl.duration}s ease-in-out ${fl.delay}s` }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-200" style={{ boxShadow: '0 0 8px 3px rgba(254,240,138,0.6)' }} />
        </div>
      ))}

      {/* Falling leaves */}
      {leaves.map((lf) => (
        <div
          key={lf.id}
          className="absolute pointer-events-none z-15"
          style={{ left: `${lf.x}%`, top: '5%', animation: `leafFall 8s ease-in ${lf.delay}s` }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" style={{ transform: `rotate(${lf.rot}deg)` }}>
            <path d="M6,1 Q10,3 9,7 Q7,11 4,9 Q1,6 3,3 Q5,1 6,1 Z" fill="#1a3a20" opacity="0.6" />
          </svg>
        </div>
      ))}

      {/* Pet sitting on a wooden log by the fire */}
      <div className="absolute bottom-[20%] right-[22%] z-30">
        <div className="relative flex flex-col items-center">
          {/* Pet body sitting on log */}
          <div className="animate-pet-idle relative z-40">
            <Mascot type={mascot} size={64} mood="happy" animated={true} animation="idle" />
          </div>
          {/* Wooden log the pet sits on */}
          <div className="relative -mt-1 z-30">
            <svg width="92" height="26" viewBox="0 0 92 26" fill="none">
              {/* Log body */}
              <ellipse cx="46" cy="18" rx="44" ry="7" fill="#5c3a1e" />
              <rect x="2" y="11" width="88" height="8" rx="4" fill="#6b4423" />
              {/* Bark texture lines */}
              <line x1="10" y1="12" x2="10" y2="18" stroke="#4a2c14" strokeWidth="0.8" opacity="0.6" />
              <line x1="22" y1="12" x2="22" y2="18" stroke="#4a2c14" strokeWidth="0.8" opacity="0.5" />
              <line x1="36" y1="12" x2="36" y2="18" stroke="#4a2c14" strokeWidth="0.8" opacity="0.6" />
              <line x1="52" y1="12" x2="52" y2="18" stroke="#4a2c14" strokeWidth="0.8" opacity="0.5" />
              <line x1="66" y1="12" x2="66" y2="18" stroke="#4a2c14" strokeWidth="0.8" opacity="0.6" />
              <line x1="78" y1="12" x2="78" y2="18" stroke="#4a2c14" strokeWidth="0.8" opacity="0.5" />
              {/* Left end ring */}
              <ellipse cx="4" cy="15" rx="3.5" ry="5" fill="#7a4a28" />
              <ellipse cx="4" cy="15" rx="2" ry="3" fill="#8b5a30" opacity="0.7" />
              <ellipse cx="4" cy="15" rx="0.8" ry="1.2" fill="#5c3a1e" />
              {/* Right end ring */}
              <ellipse cx="88" cy="15" rx="3.5" ry="5" fill="#7a4a28" />
              <ellipse cx="88" cy="15" rx="2" ry="3" fill="#8b5a30" opacity="0.7" />
              <ellipse cx="88" cy="15" rx="0.8" ry="1.2" fill="#5c3a1e" />
              {/* Top highlight */}
              <rect x="4" y="11" width="84" height="2" rx="1" fill="#8b5a30" opacity="0.5" />
            </svg>
          </div>
          {/* Soft firelight glow on pet */}
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 40%, rgba(255,140,50,0.12) 0%, transparent 60%)' }} />
        </div>
      </div>

      {/* Name tag */}
      <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold text-green-200/80 z-40">
        {mascotName}'s forest
      </div>
    </div>
  );
}

function BambooStalk({ x, h, w, delay, dark }: { x: number; h: number; w: number; delay: number; dark?: boolean }) {
  const baseColor = dark ? '#1b4332' : '#2d6a4f';
  const segmentColor = dark ? '#143828' : '#22543d';
  const highlightColor = dark ? '#40916c' : '#52a878';
  return (
    <div
      className="absolute bottom-0 animate-sway"
      style={{ left: `${x}%`, height: `${h}px`, width: `${w}px`, animationDelay: `${delay}s`, animationDuration: '6s' }}
    >
      <div className="w-full h-full rounded-t-full relative overflow-hidden" style={{ background: `linear-gradient(90deg, ${segmentColor} 0%, ${baseColor} 30%, ${highlightColor} 50%, ${baseColor} 70%, ${segmentColor} 100%)` }} />
      {/* Bamboo segments - darker nodes */}
      {[0.15, 0.32, 0.49, 0.66, 0.83].map((p) => (
        <div key={p} className="absolute left-0 right-0" style={{ top: `${p * 100}%`, height: `${Math.max(2, w * 0.4)}px`, background: `linear-gradient(180deg, ${segmentColor}, #0a1f15)`, borderTop: `1px solid rgba(10,20,12,0.6)`, borderBottom: '1px solid rgba(80,140,100,0.15)' }} />
      ))}
      {/* Leaves at top */}
      <div className="absolute -top-2 -left-2 w-8 h-6">
        <svg width="32" height="24" viewBox="0 0 32 24">
          <path d="M16,24 Q8,18 4,8 Q10,4 16,12 Q22,4 28,8 Q24,18 16,24 Z" fill={dark ? '#1b4332' : '#2d6a4f'} opacity={dark ? 0.85 : 0.95} />
          <path d="M16,22 Q10,16 8,10" stroke={highlightColor} strokeWidth="0.8" fill="none" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}
