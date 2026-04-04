import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Users, Building2, Calendar, Plus, Trash2, Video,
  Clock, CheckCircle2, XCircle, CircleDot
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import Particles from "@/components/Particles";

interface Mentor {
  user_id: string;
  display_name: string | null;
  specializations: string[] | null;
  bio: string | null;
  domain: string | null;
  one_word_description: string | null;
}

interface BookingSession {
  id: string;
  mentor_id: string;
  requested_date: string;
  requested_time: string;
  duration_minutes: number;
  status: string;
  topic: string | null;
  company_name: string | null;
  meet_link: string | null;
  mentor_notes: string | null;
  denial_reason: string | null;
  created_at: string;
}

interface ClientCompany {
  id: string;
  company_name: string;
  target_role: string | null;
  priority: number;
}

const POPULAR_COMPANIES = [
  "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix",
  "Flipkart", "Infosys", "TCS", "Wipro", "HCL", "Cognizant",
  "Adobe", "Oracle", "Salesforce", "Uber", "Swiggy", "Zomato"
];

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [companies, setCompanies] = useState<ClientCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [companyDialog, setCompanyDialog] = useState(false);
  const [newBooking, setNewBooking] = useState({ mentor_id: "", date: "", time: "", topic: "", company_name: "" });
  const [newCompany, setNewCompany] = useState({ company_name: "", target_role: "" });

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    await Promise.all([fetchMentors(), fetchSessions(), fetchCompanies()]);
    setLoading(false);
  };

  const fetchMentors = async () => {
    // Get all users with mentor role
    const { data: mentorRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "mentor");

    if (!mentorRoles?.length) { setMentors([]); return; }

    const mentorIds = mentorRoles.map(r => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, specializations, bio, domain, one_word_description")
      .in("user_id", mentorIds);

    setMentors((profiles as Mentor[]) || []);
  };

  const fetchSessions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("booking_sessions")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });
    setSessions((data as BookingSession[]) || []);
  };

  const fetchCompanies = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("client_companies")
      .select("*")
      .eq("client_id", user.id)
      .order("priority", { ascending: true });
    setCompanies((data as ClientCompany[]) || []);
  };

  const handleBookSession = async () => {
    if (!user || !newBooking.mentor_id || !newBooking.date || !newBooking.time) return;
    const { error } = await supabase.from("booking_sessions").insert({
      client_id: user.id,
      mentor_id: newBooking.mentor_id,
      requested_date: newBooking.date,
      requested_time: newBooking.time,
      topic: newBooking.topic || null,
      company_name: newBooking.company_name || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Session requested!", description: "Waiting for mentor approval." });
      setNewBooking({ mentor_id: "", date: "", time: "", topic: "", company_name: "" });
      setBookingDialog(false);
      fetchSessions();
    }
  };

  const handleAddCompany = async () => {
    if (!user || !newCompany.company_name) return;
    const { error } = await supabase.from("client_companies").insert({
      client_id: user.id,
      company_name: newCompany.company_name,
      target_role: newCompany.target_role || null,
      priority: companies.length + 1,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Company added!" });
      setNewCompany({ company_name: "", target_role: "" });
      setCompanyDialog(false);
      fetchCompanies();
    }
  };

  const handleRemoveCompany = async (id: string) => {
    await supabase.from("client_companies").delete().eq("id", id);
    fetchCompanies();
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

  const getMentorName = (mentorId: string) => {
    return mentors.find(m => m.user_id === mentorId)?.display_name || "Unknown";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={["#2dd4bf", "#14b8a6", "#0d9488"]}
          particleCount={50}
          particleSpread={10}
          speed={0.02}
          particleBaseSize={60}
          moveParticlesOnHover
          alphaParticles
          disableRotation={false}
          pixelRatio={1}
        />
      </div>

      <AppLayout />

      <main className="container max-w-6xl mx-auto px-4 py-8 relative z-10 pt-12">
        <Tabs defaultValue="mentors" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="mentors" className="gap-1">
              <Users className="h-4 w-4" /> Mentors
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-1">
              <Calendar className="h-4 w-4" /> Sessions
            </TabsTrigger>
            <TabsTrigger value="companies" className="gap-1">
              <Building2 className="h-4 w-4" /> Companies
            </TabsTrigger>
          </TabsList>

          {/* Mentors Tab */}
          <TabsContent value="mentors" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mentors.map(m => (
                <Card key={m.user_id} className="hover:shadow-md transition-shadow border-border">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(m.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{m.display_name}</h3>
                        {m.domain && <p className="text-xs text-muted-foreground">{m.domain}</p>}
                        {m.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.bio}</p>}
                        {m.specializations?.length ? (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {m.specializations.map(s => (
                              <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">{s}</Badge>
                            ))}
                          </div>
                        ) : null}
                        <Button
                          size="sm"
                          className="mt-3 w-full"
                          onClick={() => {
                            setNewBooking(prev => ({ ...prev, mentor_id: m.user_id }));
                            setBookingDialog(true);
                          }}
                        >
                          <Video className="h-3 w-3 mr-1" /> Book Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {mentors.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No mentors available yet. Check back soon!
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={bookingDialog} onOpenChange={setBookingDialog}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Book Session</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Book a Mentor Session</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-2">
                    <Select value={newBooking.mentor_id} onValueChange={v => setNewBooking(p => ({ ...p, mentor_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select mentor" /></SelectTrigger>
                      <SelectContent>
                        {mentors.map(m => (
                          <SelectItem key={m.user_id} value={m.user_id}>{m.display_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-3">
                      <Input type="date" value={newBooking.date} onChange={e => setNewBooking(p => ({ ...p, date: e.target.value }))} />
                      <Input type="time" value={newBooking.time} onChange={e => setNewBooking(p => ({ ...p, time: e.target.value }))} />
                    </div>
                    <Input placeholder="Topic (e.g. DSA prep for Google)" value={newBooking.topic} onChange={e => setNewBooking(p => ({ ...p, topic: e.target.value }))} />
                    <Select value={newBooking.company_name} onValueChange={v => setNewBooking(p => ({ ...p, company_name: v }))}>
                      <SelectTrigger><SelectValue placeholder="Company (optional)" /></SelectTrigger>
                      <SelectContent>
                        {companies.map(c => (
                          <SelectItem key={c.id} value={c.company_name}>{c.company_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleBookSession} className="w-full" disabled={!newBooking.mentor_id || !newBooking.date || !newBooking.time}>
                      Request Session
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

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
                          <p className="font-medium text-sm text-foreground">
                            Session with {getMentorName(s.mentor_id)}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {s.requested_date} at {s.requested_time} · {s.duration_minutes}min
                            </span>
                          </div>
                          {s.topic && <p className="text-xs text-muted-foreground mt-1">{s.topic}</p>}
                          {s.company_name && (
                            <Badge variant="outline" className="text-[10px] mt-1">{s.company_name}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(s.status)}
                        {s.meet_link && (
                          <a href={s.meet_link} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="text-xs">
                              <Video className="h-3 w-3 mr-1" /> Join Meet
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                    {s.denial_reason && (
                      <p className="text-xs text-destructive mt-2 ml-[52px] border-l-2 border-destructive/30 pl-3">
                        Reason: {s.denial_reason}
                      </p>
                    )}
                    {s.mentor_notes && (
                      <p className="text-xs text-muted-foreground mt-2 ml-[52px] border-l-2 border-border pl-3">
                        Mentor: {s.mentor_notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
              {sessions.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No sessions booked yet. Browse mentors and book your first session!
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={companyDialog} onOpenChange={setCompanyDialog}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Company</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Target Company</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-2">
                    <Select value={newCompany.company_name} onValueChange={v => setNewCompany(p => ({ ...p, company_name: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                      <SelectContent>
                        {POPULAR_COMPANIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Or type custom company name" value={newCompany.company_name} onChange={e => setNewCompany(p => ({ ...p, company_name: e.target.value }))} />
                    <Input placeholder="Target role (e.g. SDE-1)" value={newCompany.target_role} onChange={e => setNewCompany(p => ({ ...p, target_role: e.target.value }))} />
                    <Button onClick={handleAddCompany} className="w-full" disabled={!newCompany.company_name}>
                      Add Company
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {companies.map((c, i) => (
                <Card key={c.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">{c.company_name}</p>
                        {c.target_role && <p className="text-xs text-muted-foreground">{c.target_role}</p>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCompany(c.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {companies.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No target companies added yet. Add companies you're preparing for!
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ClientDashboard;
