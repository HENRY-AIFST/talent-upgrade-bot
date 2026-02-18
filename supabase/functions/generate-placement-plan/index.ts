const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_URL = "https://api.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, targetRole, currentSkills, totalDays } = await req.json();

    if (!companyName || !targetRole) {
      return new Response(JSON.stringify({ error: "Company name and target role are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const days = totalDays || 30;

    const prompt = `You are an expert career coach. Create a detailed ${days}-day placement preparation plan for someone targeting "${targetRole}" at "${companyName}".

Current skills: ${currentSkills?.join(", ") || "Not specified"}

Generate a JSON response with this structure:
{
  "summary": "Brief overview of the plan",
  "phases": [
    {
      "name": "Phase name",
      "days": "Day X-Y",
      "focus": "Main focus area"
    }
  ],
  "dailyTasks": [
    {
      "day": 1,
      "title": "Task title",
      "description": "Detailed description of what to do",
      "category": "study|practice|mock|review",
      "estimatedHours": 2
    }
  ]
}

Include tasks covering:
- Company-specific interview patterns and culture
- Data structures & algorithms (if technical role)
- System design (if senior role)
- Behavioral questions specific to ${companyName}
- Domain-specific knowledge for ${targetRole}
- Mock interviews and practice sessions
- Resume and portfolio review

Make tasks specific to ${companyName}'s known interview process. Generate exactly ${days} daily tasks.
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
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const plan = JSON.parse(content);

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Plan generation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
