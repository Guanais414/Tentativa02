import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TOXIC_PATTERNS = [
  /\b(idiot|stupid|dumb|moron|imbecile|retard|loser|trash|garbage)\b/i,
  /\b(hate|kill|die|murder|attack|destroy)\s+(you|them|him|her|all)\b/i,
  /\b(nigger|nigga|faggot|fag|tranny|dyke|queer|coon|spic|chink|gook|kike)\b/i,
  /\b(rape|raped|raping|molest|pedophile|pedo)\b/i,
  /\b(bitch|whore|slut|cunt|bastard|asshole|dickhead|motherfucker|fuck\s+you)\b/i,
  /\b(racist|bigot|nazi|fascist)\s*(scum|pig|trash|loser)\b/i,
  /\b(go\s+kill\s+yourself|kys|self.?harm|cut\s+yourself)\b/i,
  /\b(spam|scam|fraud|phishing|malware|virus)\b/i,
];

const SPAM_PATTERNS = [
  /(.)\1{10,}/i,
  /(https?:\/\/\S+\s*){4,}/i,
  /\b(buy\s+now|click\s+here|free\s+money|crypto\s+giveaway|follow\s+me\s+on)\b/i,
];

interface ModerationResult {
  approved: boolean;
  reason?: string;
}

function moderateText(text: string): ModerationResult {
  const trimmed = text.trim();
  if (trimmed.length < 1) {
    return { approved: false, reason: "Message is empty." };
  }
  if (trimmed.length > 1000) {
    return { approved: false, reason: "Message is too long." };
  }

  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        approved: false,
        reason: "Your message contains language that violates our community guidelines. Please edit it to be respectful and try again.",
      };
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        approved: false,
        reason: "Your message appears to be spam. Please share genuine content only.",
      };
    }
  }

  return { approved: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    if (typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'text' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result = moderateText(text);
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
