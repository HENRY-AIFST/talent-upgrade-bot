import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield, UserPlus, Users, Loader2, Mail, Lock, User, Briefcase,
  Calendar, Video, CheckCircle2, XCircle, CircleDot, Save, UserX, Check, X
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Particles from "@/components/Particles";

const ADMIN_EMAIL = "rahul140706@gmail.com";
const TECH_MENTOR_TAGS = [
  "Ex-Google Engineer",
  "Ex-FAANG Mentor",
  "Startup Founder",
  "Tech Lead",
  "AI/ML Specialist",
  "Backend Architect",
  "Frontend Expert",
  "DevOps Specialist",
  "Cloud Engineer",
  "Product Engineering Mentor",
];

interface MentorProfile {
  user_id: string;
  display_name: string | null;
  one_word_description: string | null;
  domain: string | null;
  bio: string | null;
}

interface SessionItem {
  id: string;
  client_id: string;
  mentor_id: string;
  requested_date: string;
  requested_time: string;
  duration_minutes: number;
  status: string;
  topic: string | null;
  company_name: string | null;
  meet_link: string | null;
  denial_reason: string | null;
  created_at: string;
}

interface MentorChangeRequest {
  id: string;
  mentor_id: string;
  requested_display_name: string;
  requested_tag: string;
  requested_title: string | null;
  requested_company: string | null;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", description: "" });
  const [mentorEdits, setMentorEdits] = useState<Record<string, { display_name: string; one_word_description: string; domain: string }>>({});
  const [savingMentorId, setSavingMentorId] = useState<string | null>(null);
  const [dismissingMentorId, setDismissingMentorId] = useState<string | null>(null);
  const [requests, setRequests] = useState<MentorChangeRequest[]>([]);
  const [requestProfiles, setRequestProfiles] = useState<Record<string, MentorProfile>>({});
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);
  const [rejectionReasonByRequest, setRejectionReasonByRequest] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    if (user.email !== ADMIN_EMAIL) { navigate("/"); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    await Promise.all([fetchMentors(), fetchSessions(), fetchTagRequests()]);
    setLoading(false);
  };

  const fetchMentors = async () => {
    const { data: mentorRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "mentor");
    if (!mentorRoles?.length) { setMentors([]); return; }
    const ids = mentorRoles.map(r => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, one_word_description, domain, bio")
      .in("user_id", ids);
    const mentorProfiles = (profiles as MentorProfile[]) || [];
    setMentors(mentorProfiles);
    setMentorEdits(
      mentorProfiles.reduce((acc, mentor) => {
        acc[mentor.user_id] = {
          display_name: mentor.display_name || "",
          one_word_description: mentor.one_word_description || "",
          domain: mentor.domain || "",
        };
        return acc;
      }, {} as Record<string, { display_name: string; one_word_description: string; domain: string }>),
    );
  };

  const fetchTagRequests = async () => {
    const { data, error } = await supabase.functions.invoke("manage-mentor", {
      body: { action: "admin_list_profile_change_requests" },
    });

    if (error) {
      console.error("Failed to load mentor requests", error);
      return;
    }

    const requestRows = (data?.requests || []) as MentorChangeRequest[];
    const profiles = ((data?.profiles || []) as MentorProfile[]).reduce((acc, p) => {
      acc[p.user_id] = p;
      return acc;
    }, {} as Record<string, MentorProfile>);

    setRequests(requestRows);
    setRequestProfiles(profiles);
  };

  const handleSaveMentor = async (mentorId: string) => {
    const edit = mentorEdits[mentorId];
    if (!edit) return;
    setSavingMentorId(mentorId);
    try {
      const { data, error } = await supabase.functions.invoke("manage-mentor", {
        body: {
          action: "admin_update_mentor_profile",
          mentorId,
          displayName: edit.display_name,
          tag: edit.one_word_description,
          domain: edit.domain,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Mentor updated", description: "Profile, tag, and title/company were updated." });
      fetchMentors();
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setSavingMentorId(null);
    }
  };

  const handleDismissMentor = async (mentorId: string) => {
    setDismissingMentorId(mentorId);
    try {
      const { data, error } = await supabase.functions.invoke("manage-mentor", {
        body: { action: "admin_dismiss_mentor", mentorId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Mentor dismissed", description: "Mentor access has been removed." });
      fetchMentors();
      fetchTagRequests();
    } catch (e: any) {
      toast({ title: "Dismiss failed", description: e.message, variant: "destructive" });
    } finally {
      setDismissingMentorId(null);
    }
  };

  const handleReviewRequest = async (requestId: string, decision: "approved" | "rejected") => {
    setReviewingRequestId(requestId);
    try {
      const { data, error } = await supabase.functions.invoke("manage-mentor", {
        body: {
          action: "admin_review_profile_change_request",
          requestId,
          decision,
          rejectionReason: decision === "rejected" ? rejectionReasonByRequest[requestId] || "" : undefined,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: `Request ${decision}`, description: "Mentor has been notified." });
      fetchMentors();
      fetchTagRequests();
    } catch (e: any) {
      toast({ title: "Review failed", description: e.message, variant: "destructive" });
    } finally {
      setReviewingRequestId(null);
    }
  };

  const fetchSessions = async () => {
    const { data } = await supabase
      .from("booking_sessions")
      .select("*")
      .order("created_at", { ascending: false });
    setSessions((data as SessionItem[]) || []);
  };

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return;
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-mentor", {
        body: {
          name: form.name,
          email: form.email,
          password: form.password,
          one_word_description: form.description || null,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Mentor created!", description: `${form.name} can now log in.` });
      setForm({ name: "", email: "", password: "", description: "" });
      fetchMentors();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-primary/20 text-primary border-0"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "rejected": case "denied": return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Denied</Badge>;
      default: return <Badge variant="secondary"><CircleDot className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  const getMentorName = (mentorId: string) => mentors.find(m => m.user_id === mentorId)?.display_name || "Unknown";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Particles particleColors={["#f59e0b", "#d97706", "#b45309"]} particleCount={50} particleSpread={10} speed={0.02} particleBaseSize={60} moveParticlesOnHover alphaParticles disableRotation={false} pixelRatio={1} />
      </div>
      <AppLayout />

      <main className="container max-w-6xl mx-auto px-4 py-8 relative z-10 pt-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage mentors and oversee sessions</p>
          </div>
        </div>

        <Tabs defaultValue="add-mentor" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="add-mentor" className="gap-1"><UserPlus className="h-4 w-4" /> Add Mentor</TabsTrigger>
            <TabsTrigger value="mentors" className="gap-1"><Users className="h-4 w-4" /> Mentors</TabsTrigger>
            <TabsTrigger value="requests" className="gap-1"><CheckCircle2 className="h-4 w-4" /> Tag Requests</TabsTrigger>
            <TabsTrigger value="sessions" className="gap-1"><Calendar className="h-4 w-4" /> All Sessions</TabsTrigger>
          </TabsList>

          {/* Add Mentor Tab */}
          <TabsContent value="add-mentor">
            <Card className="max-w-lg border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" /> Add New Mentor</CardTitle>
                <CardDescription>Create a mentor account. They'll log in with the email & password you set.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateMentor} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="pl-10" required />
                  </div>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="1-Word Description (e.g. Engineering)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="pl-10" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="pl-10" required />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="Password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="pl-10" required minLength={6} />
                  </div>
                  <Button type="submit" disabled={creating} className="w-full">
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserPlus className="h-4 w-4 mr-2" /> Create Mentor Account</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mentors List Tab */}
          <TabsContent value="mentors" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mentors.map(m => (
                <Card key={m.user_id} className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">{getInitials(m.display_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{m.display_name}</h3>
                        {m.one_word_description && <Badge variant="secondary" className="mt-1">{m.one_word_description}</Badge>}
                        {m.domain && <p className="text-xs text-muted-foreground mt-1">{m.domain}</p>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Input
                        value={mentorEdits[m.user_id]?.display_name || ""}
                        onChange={(e) => setMentorEdits((prev) => ({
                          ...prev,
                          [m.user_id]: { ...prev[m.user_id], display_name: e.target.value },
                        }))}
                        placeholder="Mentor display name"
                      />
                      <Select
                        value={mentorEdits[m.user_id]?.one_word_description || ""}
                        onValueChange={(value) => setMentorEdits((prev) => ({
                          ...prev,
                          [m.user_id]: { ...prev[m.user_id], one_word_description: value },
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select mentor tag" />
                        </SelectTrigger>
                        <SelectContent>
                          {TECH_MENTOR_TAGS.map((tag) => (
                            <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={mentorEdits[m.user_id]?.domain || ""}
                        onChange={(e) => setMentorEdits((prev) => ({
                          ...prev,
                          [m.user_id]: { ...prev[m.user_id], domain: e.target.value },
                        }))}
                        placeholder="Title / company (e.g. Ex Google Engineer)"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSaveMentor(m.user_id)}
                          disabled={savingMentorId === m.user_id}
                        >
                          <Save className="h-4 w-4 mr-1" /> Save
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleDismissMentor(m.user_id)}
                          disabled={dismissingMentorId === m.user_id}
                        >
                          <UserX className="h-4 w-4 mr-1" /> Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {mentors.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">No mentors yet. Add one from the "Add Mentor" tab.</CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <div className="space-y-3">
              {requests.map((request) => {
                const mentorProfile = requestProfiles[request.mentor_id];
                return (
                  <Card key={request.id} className="border-border">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground text-sm">
                            {mentorProfile?.display_name || "Mentor"} requested rename/tag update
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested name: {request.requested_display_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested tag: {request.requested_tag}
                          </p>
                          {(request.requested_title || request.requested_company) && (
                            <p className="text-xs text-muted-foreground">
                              Requested title/company: {request.requested_title || ""}{request.requested_title && request.requested_company ? " @ " : ""}{request.requested_company || ""}
                            </p>
                          )}
                          {request.note && <p className="text-xs text-muted-foreground">Note: {request.note}</p>}
                          <div>
                            {request.status === "pending" ? (
                              <Badge variant="secondary">Pending</Badge>
                            ) : request.status === "approved" ? (
                              <Badge className="bg-primary/20 text-primary border-0">Approved</Badge>
                            ) : (
                              <Badge variant="destructive">Rejected</Badge>
                            )}
                            {request.rejection_reason && (
                              <p className="text-xs text-destructive mt-1">Reason: {request.rejection_reason}</p>
                            )}
                          </div>
                        </div>

                        {request.status === "pending" && (
                          <div className="w-full md:w-[320px] space-y-2">
                            <Input
                              value={rejectionReasonByRequest[request.id] || ""}
                              onChange={(e) => setRejectionReasonByRequest((prev) => ({ ...prev, [request.id]: e.target.value }))}
                              placeholder="Optional rejection reason"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1"
                                onClick={() => handleReviewRequest(request.id, "approved")}
                                disabled={reviewingRequestId === request.id}
                              >
                                <Check className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1"
                                onClick={() => handleReviewRequest(request.id, "rejected")}
                                disabled={reviewingRequestId === request.id}
                              >
                                <X className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {requests.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No profile/tag change requests yet.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* All Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="space-y-3">
              {sessions.map(s => (
                <Card key={s.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Video className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{s.topic || "Guidance Session"}</p>
                          <p className="text-xs text-muted-foreground">Mentor: {getMentorName(s.mentor_id)} · {s.requested_date} at {s.requested_time}</p>
                          {s.denial_reason && <p className="text-xs text-destructive mt-1">Reason: {s.denial_reason}</p>}
                        </div>
                      </div>
                      {getStatusBadge(s.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {sessions.length === 0 && (
                <Card><CardContent className="p-8 text-center text-muted-foreground">No sessions yet.</CardContent></Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
