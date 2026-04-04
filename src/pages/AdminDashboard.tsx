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
import {
  Shield, UserPlus, Users, Loader2, Trash2, Mail, Lock, User, Briefcase,
  Calendar, Video, Check, X, Clock, CheckCircle2, XCircle, CircleDot
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Particles from "@/components/Particles";

const ADMIN_EMAIL = "rahul140706@gmail.com";

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

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", description: "" });

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    if (user.email !== ADMIN_EMAIL) { navigate("/"); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    await Promise.all([fetchMentors(), fetchSessions()]);
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
    setMentors((profiles as MentorProfile[]) || []);
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
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="add-mentor" className="gap-1"><UserPlus className="h-4 w-4" /> Add Mentor</TabsTrigger>
            <TabsTrigger value="mentors" className="gap-1"><Users className="h-4 w-4" /> Mentors</TabsTrigger>
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
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">{getInitials(m.display_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{m.display_name}</h3>
                        {m.one_word_description && <Badge variant="secondary" className="mt-1">{m.one_word_description}</Badge>}
                        {m.domain && <p className="text-xs text-muted-foreground mt-1">{m.domain}</p>}
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
