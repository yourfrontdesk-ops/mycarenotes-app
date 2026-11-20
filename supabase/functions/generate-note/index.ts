import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BASE_INSTRUCTIONS = `You are an expert care note writer for UK residential and domiciliary care settings.
You write notes for care workers who support adults with physical disabilities, learning disabilities, dementia, and complex needs.

Core rules for every note you write:
- Written in third person, past tense ("John was assisted..." not "I assisted John...")
- STRICT FACTUAL ACCURACY: Only document what is explicitly stated in the rough notes. Never infer, assume, or add any information not present in the original input.
- Do NOT convert planned or intended actions into completed ones. If the care worker wrote "refer to GP" or "GP to review Monday", record it as a planned action (e.g. "a referral to the individual's GP is required" or "the individual's GP is to conduct a review on Monday") — never as "the GP was contacted" or "the GP has been informed" or "the GP is scheduled".
- Do NOT add clinical observations, interventions, care plans, or monitoring requirements that were not explicitly stated (e.g. do not add "hydration monitoring", "enhanced supervision", or "close monitoring" unless the care worker noted them).
- Do NOT expand brief notes with assumed context, background, or causes.
- Person-centred language — dignified, respectful tone at all times
- Full professional prose — no bullet points in the output
- No jargon, abbreviations, or clinical shorthand unless standard UK care practice
- Suitable for inclusion in an official care plan or care management system
- UK English spelling throughout
- Do not include preamble, explanations, or meta-commentary — just the note itself`;

const NOTE_TYPE_PROMPTS: Record<string, string> = {
  "Daily Log": `${BASE_INSTRUCTIONS}

You are writing a Daily Log / Daily Record entry.
Structure the note to cover only the areas for which information has been provided:
1. Morning routine and personal care
2. Meals, hydration, and appetite
3. Activities, social engagement, and wellbeing
4. Physical observations and health
5. Emotional and psychological state
6. Any concerns, changes, or incidents
7. End of shift / evening summary

Write continuous paragraphs. Structure and format what the care worker has noted into clear, professional prose. Do not add information, context, or detail that was not explicitly provided.`,

  "Incident Report": `${BASE_INSTRUCTIONS}

You are writing a formal Incident Report.
Use the SBAR framework as the backbone:
- Situation: What happened, when, and where
- Background: Relevant context about the individual (only as provided)
- Assessment: Observations, any injuries or risks identified, vital signs if given
- Response: Actions taken, who was notified (only if stated), follow-up plan (only as stated)

The note must be factual, precise, and objective. Do not speculate about cause. Record only what was observed and what actions were taken. Do not infer notifications or responses not explicitly described. This note may be used in a legal or regulatory context.`,

  "Handover Note": `${BASE_INSTRUCTIONS}

You are writing a Shift Handover Note.
The note should:
- Open with a brief overall summary of the shift
- Clearly highlight any incidents, health concerns, or significant events
- Cover medications administered and any refusals
- Note any appointments, communications with family or professionals (only if stated)
- List follow-up actions or tasks for the incoming team (only as explicitly noted)
- Flag anything urgent or requiring immediate attention

Be concise but complete. The incoming team must be able to act on this note immediately.`,

  "Medication Note": `${BASE_INSTRUCTIONS}

You are writing a Medication Administration Record (MAR) note.
The note must clearly document:
- Each medication administered: name, dose, route, and exact time given
- Any medications refused: name, reason given by the individual, actions taken
- PRN medications: what was given, the reason/trigger, time given, and the individual's response
- Any observed side effects or reactions
- Whether the individual took their medication willingly or required prompting

Comply with NMC and CQC medication management standards. Be precise with drug names, doses, and times. Only document what was explicitly provided.`,
};

const DEMO_EMAIL = "demo@mycarenotes.co.uk";
const MAX_INPUT_CHARS = 3000;
const DEMO_PER_VISITOR_PER_HOUR = 3;
const DEMO_PER_DAY = 50;

// Identify a demo visitor by a one-way hash of their IP address (the IP itself is never stored)
async function hashVisitor(req: Request): Promise<string> {
  const ip = req.headers.get("cf-connecting-ip")
    || (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim()
    || "unknown";
  const salt = Deno.env.get("SUPABASE_URL") ?? "mycarenotes";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(digest)).map((x) => x.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Service is not configured. Please contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorised." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user and check entitlement
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorised." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const json = (status: number, body: Record<string, unknown>) =>
      new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { noteType, bulletPoints, metadata } = await req.json();

    if (!noteType || !bulletPoints) {
      return json(400, { error: "Note type and observations are required." });
    }
    if (String(bulletPoints).length > MAX_INPUT_CHARS) {
      return json(400, { error: `Observations must be ${MAX_INPUT_CHARS.toLocaleString("en-GB")} characters or fewer.` });
    }

    // Service role: check and update allowances
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const isDemo = (user.email ?? "").toLowerCase() === DEMO_EMAIL;
    let chargeCredits: number | null = null; // credits before this note, when a credit should be used

    if (isDemo) {
      // Shared demo: limit per visitor per hour and in total per day (resets automatically)
      const visitor = await hashVisitor(req);
      const now = Date.now();
      const startOfDay = new Date(); startOfDay.setUTCHours(0, 0, 0, 0);

      await supabaseAdmin.from("demo_usage").delete().lt("created_at", new Date(now - 2 * 864e5).toISOString());

      const { count: todayCount } = await supabaseAdmin
        .from("demo_usage").select("id", { count: "exact", head: true })
        .gte("created_at", startOfDay.toISOString());
      if ((todayCount ?? 0) >= DEMO_PER_DAY) {
        return json(429, { error: "The demo has reached its daily limit. Please create a free account to continue." });
      }

      const { count: visitorCount } = await supabaseAdmin
        .from("demo_usage").select("id", { count: "exact", head: true })
        .eq("visitor", visitor)
        .gte("created_at", new Date(now - 3600e3).toISOString());
      if ((visitorCount ?? 0) >= DEMO_PER_VISITOR_PER_HOUR) {
        return json(429, { error: `The demo is limited to ${DEMO_PER_VISITOR_PER_HOUR} notes per hour. Please create a free account to continue.` });
      }

      await supabaseAdmin.from("demo_usage").insert({ visitor });
    } else {
      const { data: creditRow } = await supabaseAdmin
        .from("user_credits")
        .select("credits, is_unlimited")
        .eq("user_id", user.id)
        .maybeSingle();

      if (creditRow?.is_unlimited !== true) {
        const { data: sub } = await supabaseAdmin
          .from("user_subscriptions")
          .select("status, current_period_end")
          .eq("user_id", user.id)
          .maybeSingle();

        const hasActiveSub =
          sub?.status === "active" &&
          sub?.current_period_end &&
          new Date(sub.current_period_end) > new Date();

        if (!hasActiveSub) {
          const credits = creditRow?.credits ?? 0;
          if (credits <= 0) {
            return json(402, { error: "NO_CREDITS", message: "You have no notes remaining on your plan." });
          }
          chargeCredits = credits;
        }
      }
    }

    const systemPrompt = NOTE_TYPE_PROMPTS[noteType] || NOTE_TYPE_PROMPTS["Daily Log"];

    const dateFormatted = metadata?.date
      ? new Date(metadata.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : "";

    const userMessage = `Write a professional, CQC-compliant ${noteType} based on the rough notes below.

IMPORTANT: Structure and format only what is explicitly stated in the rough notes. Do not add, infer, or assume any information. Do not convert planned actions into completed ones.

Individual's details:
${metadata?.residentName ? `Name: ${metadata.residentName}` : ""}
${dateFormatted ? `Date: ${dateFormatted}` : ""}
${metadata?.time ? `Time: ${metadata.time}` : ""}
${metadata?.shiftTime ? `Shift: ${metadata.shiftTime}` : ""}
${metadata?.careWorkerName ? `Care Worker: ${metadata.careWorkerName}` : ""}

Rough notes from the care worker:
${bulletPoints}

Write the complete, professional note now. Begin with the header (name, date, shift/time, note type), then the body of the note in full professional prose, then a footer with the care worker name, date, and time signed. Do not include any commentary before or after the note.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({ error: errorData.error?.message || "Failed to generate note." }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const generatedNote = data.content[0]?.text || "";

    // Use a credit only once the note has been generated successfully
    if (chargeCredits !== null && generatedNote) {
      await supabaseAdmin
        .from("user_credits")
        .update({ credits: Math.max(0, chargeCredits - 1), updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
    }

    return new Response(
      JSON.stringify({ note: generatedNote }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
