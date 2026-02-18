const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, targetRole, skillGaps } = await req.json();

    if (!companyName || !targetRole) {
      return new Response(JSON.stringify({ error: "Company name and target role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const gapsList = skillGaps?.map((g: any) => `${g.skill} (current: ${g.currentLevel}/10, required: ${g.requiredLevel}/10)`).join(", ") || "Not specified";

    const prompt = `You are an expert technical interviewer at ${companyName}. Generate interview preparation questions for a "${targetRole}" candidate.

The candidate has these skill gaps: ${gapsList}

Generate a JSON response with this structure:
{
  "questions": [
    {
      "question": "The interview question",
      "category": "technical|behavioral|system-design|coding",
      "difficulty": "easy|medium|hard",
      "skill": "Related skill area",
      "hint": "Brief hint or approach to answer",
      "companySpecific": true/false
    }
  ]
}

Generate 10-15 questions that:
- Focus on the candidate's weak areas (skill gaps)
- Include ${companyName}-specific interview patterns and culture-fit questions
- Mix technical, behavioral, system design, and coding questions
- Range from easy to hard difficulty
- Include hints for preparation

Return ONLY valid JSON, no markdown.`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const response = await fetch(LOVABLE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const result = JSON.parse(content);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Interview prep error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
