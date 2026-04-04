import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller is admin
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await userClient.auth.getUser();
    if (!caller || caller.email !== "rahul140706@gmail.com") {
      throw new Error("Only admin can create mentors");
    }

    const { name, email, password, one_word_description } = await req.json();
    if (!name || !email || !password) throw new Error("Name, email, and password are required");

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Create user account
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: name },
    });
    if (createError) throw createError;

    const userId = newUser.user.id;

    // Assign mentor role
    const { error: roleError } = await adminClient
      .from("user_roles")
      .insert({ user_id: userId, role: "mentor" });
    if (roleError) throw roleError;

    // Update profile with one_word_description
    // The trigger should have created the profile, so update it
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({ one_word_description, display_name: name })
      .eq("user_id", userId);
    if (profileError) throw profileError;

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
