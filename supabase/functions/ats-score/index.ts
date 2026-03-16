import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resumeText, targetRole } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!resumeText) throw new Error("No resume text provided");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert ATS (Applicant Tracking System) resume analyzer. Analyze the resume against the target role and return a JSON object with:
{
  "atsScore": number (0-100),
  "summary": "One sentence overall assessment",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "keywordMatch": number (0-100, how well resume keywords match the role),
  "formatScore": number (0-100, how ATS-friendly the format is),
  "experienceRelevance": number (0-100, how relevant experience is),
  "missingKeywords": ["keyword1", "keyword2", "keyword3"],
  "sectionAnalysis": {
    "contact": { "score": number, "feedback": "string" },
    "experience": { "score": number, "feedback": "string" },
    "skills": { "score": number, "feedback": "string" },
    "education": { "score": number, "feedback": "string" }
  }
}
Return ONLY valid JSON, no markdown or code fences.`
          },
          {
            role: "user",
            content: `Analyze this resume for ATS compatibility${targetRole ? ` for the role: ${targetRole}` : ""}:\n\n${resumeText}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("Failed to analyze resume");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Clean potential markdown fences
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const result = JSON.parse(content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ats-score error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
