import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { skills, targetRole, resumeText } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert career advisor and skill gap analyzer. Analyze the user's skills and compare them with industry requirements for their target role.

You MUST respond with valid JSON only, no markdown, no code fences. Use this exact structure:
{
  "profileSummary": "Brief summary of the user's current profile",
  "readinessScore": <number 0-100>,
  "currentSkills": [{"name": "skill", "level": <1-10>}],
  "targetSkills": [{"name": "skill", "level": <1-10>, "currentLevel": <0-10>}],
  "skillGaps": [{"skill": "name", "importance": "critical|high|medium", "reason": "why this skill matters", "currentLevel": 0, "requiredLevel": 8}],
  "learningRoadmap": [{"phase": "Phase 1 (Month 1-2)", "title": "Foundation", "skills": ["skill1"], "resources": [{"name": "resource", "type": "course|tool|certification", "url": ""}], "projects": ["project idea"]}],
  "certifications": [{"name": "cert name", "provider": "provider", "relevance": "high|medium"}],
  "timeline": {"threeMonths": "what you can achieve", "sixMonths": "what you can achieve", "oneYear": "what you can achieve"}
}`;

    const userMessage = resumeText
      ? `Resume/Profile:\n${resumeText}\n\nTarget Role: ${targetRole}\n\nAdditional Skills: ${skills.join(", ")}`
      : `Current Skills: ${skills.join(", ")}\n\nTarget Role: ${targetRole}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Parse the JSON from the AI response
    let analysis;
    try {
      // Try to extract JSON if wrapped in code fences
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[1].trim() : content.trim());
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse analysis");
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-skills error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
