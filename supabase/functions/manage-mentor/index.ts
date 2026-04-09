import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "rahul140706@gmail.com";

type ActionBody = {
  action:
    | "mentor_submit_profile_change"
    | "mentor_list_profile_change_requests"
    | "admin_list_profile_change_requests"
    | "admin_review_profile_change_request"
    | "admin_update_mentor_profile"
    | "admin_dismiss_mentor";
  requestId?: string;
  decision?: "approved" | "rejected";
  rejectionReason?: string;
  mentorId?: string;
  displayName?: string;
  tag?: string;
  domain?: string;
  requestedDisplayName?: string;
  requestedTag?: string;
  requestedTitle?: string;
  requestedCompany?: string;
  note?: string;
};

function combineDomain(title?: string, company?: string): string | null {
  const trimmedTitle = (title || "").trim();
  const trimmedCompany = (company || "").trim();
  if (!trimmedTitle && !trimmedCompany) return null;
  if (trimmedTitle && trimmedCompany) return `${trimmedTitle} @ ${trimmedCompany}`;
  return trimmedTitle || trimmedCompany;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const {
      data: { user: caller },
      error: callerError,
    } = await userClient.auth.getUser();

    if (callerError || !caller) throw new Error("Unauthorized");

    const body = (await req.json()) as ActionBody;
    if (!body.action) throw new Error("Action is required");

    const isAdmin = caller.email === ADMIN_EMAIL;

    const ensureMentor = async () => {
      const { data } = await userClient
        .from("user_roles")
        .select("id")
        .eq("user_id", caller.id)
        .eq("role", "mentor")
        .maybeSingle();
      if (!data) throw new Error("Mentor access required");
    };

    const getAdminUserId = async () => {
      const { data, error } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;
      const adminUser = data.users.find((u) => u.email === ADMIN_EMAIL);
      if (!adminUser) throw new Error("Admin user not found");
      return adminUser.id;
    };

    if (body.action === "mentor_submit_profile_change") {
      await ensureMentor();

      const requestedDisplayName = (body.requestedDisplayName || "").trim();
      const requestedTag = (body.requestedTag || "").trim();
      const requestedTitle = (body.requestedTitle || "").trim();
      const requestedCompany = (body.requestedCompany || "").trim();
      const note = (body.note || "").trim();

      if (!requestedDisplayName || !requestedTag) {
        throw new Error("Display name and tag are required");
      }

      const { error: insertError } = await adminClient.from("mentor_profile_change_requests").insert({
        mentor_id: caller.id,
        requested_display_name: requestedDisplayName,
        requested_tag: requestedTag,
        requested_title: requestedTitle || null,
        requested_company: requestedCompany || null,
        note: note || null,
      });
      if (insertError) throw insertError;

      const adminUserId = await getAdminUserId();
      const messageParts = [
        `${requestedDisplayName} requested profile updates.`,
        `Tag: ${requestedTag}`,
        requestedTitle ? `Title: ${requestedTitle}` : null,
        requestedCompany ? `Company: ${requestedCompany}` : null,
        note ? `Note: ${note}` : null,
      ].filter(Boolean);

      await adminClient.from("notifications").insert({
        user_id: adminUserId,
        title: "Mentor profile change request",
        message: messageParts.join("\n"),
        type: "mentor_profile_request",
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "mentor_list_profile_change_requests") {
      await ensureMentor();
      const { data, error } = await adminClient
        .from("mentor_profile_change_requests")
        .select("*")
        .eq("mentor_id", caller.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return new Response(JSON.stringify({ requests: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isAdmin) {
      throw new Error("Admin access required");
    }

    if (body.action === "admin_list_profile_change_requests") {
      const { data, error } = await adminClient
        .from("mentor_profile_change_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;

      const mentorIds = [...new Set((data || []).map((r) => r.mentor_id))];
      const { data: profiles } = mentorIds.length
        ? await adminClient.from("profiles").select("user_id, display_name, one_word_description, domain").in("user_id", mentorIds)
        : { data: [] as any[] };

      return new Response(JSON.stringify({ requests: data || [], profiles: profiles || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "admin_update_mentor_profile") {
      if (!body.mentorId) throw new Error("mentorId is required");

      const updates: Record<string, string | null> = {};
      if (typeof body.displayName === "string") updates.display_name = body.displayName.trim() || null;
      if (typeof body.tag === "string") updates.one_word_description = body.tag.trim() || null;
      if (typeof body.domain === "string") updates.domain = body.domain.trim() || null;

      const { error } = await adminClient.from("profiles").update(updates).eq("user_id", body.mentorId);
      if (error) throw error;

      await adminClient.from("notifications").insert({
        user_id: body.mentorId,
        title: "Mentor profile updated by admin",
        message: "Your mentor profile details were updated by an administrator.",
        type: "mentor_profile_updated",
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "admin_dismiss_mentor") {
      if (!body.mentorId) throw new Error("mentorId is required");

      const { error } = await adminClient
        .from("user_roles")
        .delete()
        .eq("user_id", body.mentorId)
        .eq("role", "mentor");

      if (error) throw error;

      await adminClient.from("notifications").insert({
        user_id: body.mentorId,
        title: "Mentor access updated",
        message: "Your mentor role has been dismissed by an administrator.",
        type: "mentor_dismissed",
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "admin_review_profile_change_request") {
      if (!body.requestId || !body.decision) throw new Error("requestId and decision are required");

      const { data: requestRow, error: requestErr } = await adminClient
        .from("mentor_profile_change_requests")
        .select("*")
        .eq("id", body.requestId)
        .maybeSingle();

      if (requestErr) throw requestErr;
      if (!requestRow) throw new Error("Request not found");
      if (requestRow.status !== "pending") throw new Error("Request is already reviewed");

      const rejectionReason = (body.rejectionReason || "").trim() || null;

      const { error: reviewErr } = await adminClient
        .from("mentor_profile_change_requests")
        .update({
          status: body.decision,
          rejection_reason: body.decision === "rejected" ? rejectionReason : null,
          reviewed_by: caller.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", body.requestId);

      if (reviewErr) throw reviewErr;

      if (body.decision === "approved") {
        const domain = combineDomain(requestRow.requested_title, requestRow.requested_company);
        const { error: profileErr } = await adminClient
          .from("profiles")
          .update({
            display_name: requestRow.requested_display_name,
            one_word_description: requestRow.requested_tag,
            domain,
          })
          .eq("user_id", requestRow.mentor_id);

        if (profileErr) throw profileErr;
      }

      await adminClient.from("notifications").insert({
        user_id: requestRow.mentor_id,
        title: body.decision === "approved" ? "Profile request approved" : "Profile request rejected",
        message:
          body.decision === "approved"
            ? "Your profile rename/tag request has been approved by admin."
            : `Your profile rename/tag request was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`,
        type: "mentor_profile_request_result",
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Unsupported action");
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
