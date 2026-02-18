import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, result } = await req.json();
    if (!email || !result) throw new Error("Email and result are required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Generate a text summary of the report using AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "You are an email formatter. Format the analysis result into a clean, professional HTML email. Use inline styles. Keep it concise but comprehensive. Include readiness score, profile summary, skill gaps, learning roadmap phases, timeline, and certifications."
          },
          {
            role: "user",
            content: `Format this career analysis into a professional HTML email:\n${JSON.stringify(result)}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("Failed to format email");
    }

    const aiData = await response.json();
    const htmlBody = aiData.choices?.[0]?.message?.content || "";

    // Send email using Supabase's built-in email (via Resend)
    // Since we don't have a transactional email service, we'll return the formatted HTML
    // for the client to handle, or use a simple approach
    
    // For now, return success with the formatted email content
    // In production, you'd integrate with Resend, SendGrid, etc.
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Report formatted for ${email}`,
      html: htmlBody,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("share-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
