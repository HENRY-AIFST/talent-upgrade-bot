const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active plans with incomplete tasks for today
    const { data: plans, error: plansError } = await supabase
      .from("placement_plans")
      .select("id, user_id, company_name, target_role, total_days, created_at");

    if (plansError) throw plansError;
    if (!plans || plans.length === 0) {
      return new Response(JSON.stringify({ message: "No active plans found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let notificationsSent = 0;

    for (const plan of plans) {
      // Calculate current day number
      const startDate = new Date(plan.created_at);
      const now = new Date();
      const dayNumber = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (dayNumber > plan.total_days) continue; // plan completed

      // Get incomplete tasks for today
      const { data: tasks } = await supabase
        .from("daily_tasks")
        .select("title, category")
        .eq("plan_id", plan.id)
        .eq("day_number", dayNumber)
        .eq("is_completed", false);

      if (!tasks || tasks.length === 0) continue;

      // Get user email
      const { data: userData } = await supabase.auth.admin.getUserById(plan.user_id);
      if (!userData?.user?.email) continue;

      const taskList = tasks.map((t) => `• [${t.category.toUpperCase()}] ${t.title}`).join("\n");

      // Send email via Supabase's built-in email (using auth.admin)
      // For now, save notification in-app
      const { error: insertErr } = await supabase.from("notifications").insert({
        user_id: plan.user_id,
        title: `Day ${dayNumber}: ${plan.company_name} Prep`,
        message: `You have ${tasks.length} task(s) for today:\n${taskList}`,
        type: "daily_reminder",
        plan_id: plan.id,
      });

      if (!insertErr) notificationsSent++;
    }

    return new Response(JSON.stringify({ message: `Sent ${notificationsSent} notifications` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
