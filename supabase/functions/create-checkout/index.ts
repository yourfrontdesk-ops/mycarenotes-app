import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PRICE_CREDITS_10 = "price_1TOylMCTiFzxRiiNeHuj8XCk";
const PRICE_CREDITS_50 = "price_1TP5z2CTiFzxRiiN29eLECCu";
const PRICE_MONTHLY = "price_1TOcnjCTiFzxRiiNo0J1Bfft";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Payments are not configured. Please contact support." }),
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

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorised." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { plan, successUrl, cancelUrl } = await req.json();

    if (!plan || !["credits_10", "credits_50", "monthly"].includes(plan)) {
      return new Response(
        JSON.stringify({ error: "Invalid plan." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const priceId = plan === "credits_10" ? PRICE_CREDITS_10 : plan === "credits_50" ? PRICE_CREDITS_50 : PRICE_MONTHLY;
    const mode = plan === "monthly" ? "subscription" : "payment";

    const params = new URLSearchParams({
      "payment_method_types[0]": "card",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      mode,
      success_url: successUrl || `${req.headers.get("origin")}/`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/`,
      "metadata[user_id]": user.id,
      "metadata[plan]": plan,
      customer_email: user.email || "",
    });

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      const stripeMessage = session?.error?.message || JSON.stringify(session);
      return new Response(
        JSON.stringify({ error: `Stripe error: ${stripeMessage}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? `${error.message} ${error.stack}` : String(error);
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
