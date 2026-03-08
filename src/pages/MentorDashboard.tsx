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
import { ArrowLeft, Users, ClipboardList, TrendingUp, Plus, CheckCircle2, Circle, Trash2, Video, Calendar, Check, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import Particles from "@/components/Particles";

interface Student {
  student_id: string;
  display_name: string | null;
  current_skills: string[] | null;
  domain: string | null;
  latest_score: number | null;
  analyses_count: number;
}

interface MentorTask {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  category: string;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

interface BookingSession {
  id: string;
  client_id: string;
  requested_date: string;
  requested_time: string;
  duration_minutes: number;
  status: string;
  topic: string | null;
  company_name: string | null;
  meet_link: string | null;
  mentor_notes: string | null;
  created_at: string;
}

const MentorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [tasks, setTasks] = useState<MentorTask[]>([]);
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [isMentor, setIsMentor] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "", category: "study", student_id: "", due_date: "" });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    checkMentorRole();
  }, [user]);

  const checkMentorRole = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "mentor")
      .maybeSingle();
    
    setIsMentor(!!data);
    if (data) {
      await Promise.all([fetchStudents(), fetchTasks(), fetchSessions()]);
    }
    setLoading(false);
  };

  const fetchSessions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("booking_sessions")
      .select("*")
      .eq("mentor_id", user.id)
      .order("created_at", { ascending: false });
    setSessions((data as BookingSession[]) || []);
  };

  const handleSessionAction = async (sessionId: string, action: "approved" | "rejected") => {
    const meetLink = action === "approved"
      ? `https://meet.google.com/${crypto.randomUUID().slice(0, 3)}-${crypto.randomUUID().slice(0, 4)}-${crypto.randomUUID().slice(0, 3)}`
      : null;
    
    const { error } = await supabase
      .from("booking_sessions")
      .update({ status: action, meet_link: meetLink })
      .eq("id", sessionId);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: action === "approved" ? "Session approved! Meet link generated." : "Session rejected." });
      fetchSessions();
    }
  };

  const fetchStudents = async () => {
    if (!user) return;
    const { data: links } = await supabase
      .from("mentor_students")
      .select("student_id")
      .eq("mentor_id", user.id);

    if (!links?.length) { setStudents([]); return; }

    const studentIds = links.map(l => l.student_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, current_skills, domain")
      .in("user_id", studentIds);

    const { data: analyses } = await supabase
      .from("saved_analyses")
      .select("user_id, readiness_score, created_at")
      .in("user_id", studentIds)
      .order("created_at", { ascending: false });

    const studentMap: Student[] = studentIds.map(sid => {
      const profile = profiles?.find(p => p.user_id === sid);
      const studentAnalyses = analyses?.filter(a => a.user_id === sid) || [];
      return {
        student_id: sid,
        display_name: profile?.display_name || "Unknown",
        current_skills: profile?.current_skills || null,
        domain: profile?.domain || null,
        latest_score: studentAnalyses[0]?.readiness_score ?? null,
        analyses_count: studentAnalyses.length,
      };
    });
    setStudents(studentMap);
  };

  const fetchTasks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("mentor_tasks")
      .select("*")
      .eq("mentor_id", user.id)
      .order("created_at", { ascending: false });
    setTasks((data as MentorTask[]) || []);
  };

  const handleCreateTask = async () => {
    if (!user || !newTask.title || !newTask.student_id) return;
    const { error } = await supabase.from("mentor_tasks").insert({
      mentor_id: user.id,
      student_id: newTask.student_id,
      title: newTask.title,
      description: newTask.description || null,
      category: newTask.category,
      due_date: newTask.due_date || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task created" });
      setNewTask({ title: "", description: "", category: "study", student_id: "", due_date: "" });
      setDialogOpen(false);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    await supabase.from("mentor_tasks").delete().eq("id", taskId);
    fetchTasks();
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const filteredTasks = selectedStudent
    ? tasks.filter(t => t.student_id === selectedStudent)
    : tasks;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isMentor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have mentor access. Contact your administrator to get mentor privileges.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </CardContent>
        </Card>
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

      <header className="border-b border-border relative z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Mentor Dashboard</h1>
              <p className="text-xs text-muted-foreground">{students.length} students</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8 relative z-10">
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="students" className="gap-1">
              <Users className="h-4 w-4" /> Students
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-1">
              <Calendar className="h-4 w-4" /> Sessions
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-1">
              <ClipboardList className="h-4 w-4" /> Tasks
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-1">
              <TrendingUp className="h-4 w-4" /> Progress
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {students.map(s => (
                <Card key={s.student_id} className="hover:shadow-md transition-shadow border-border">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 bg-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(s.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{s.display_name}</h3>
                        {s.domain && <p className="text-xs text-muted-foreground">{s.domain}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          {s.latest_score !== null ? (
                            <Badge variant={s.latest_score >= 70 ? "default" : "secondary"}>
                              Score: {s.latest_score}%
                            </Badge>
                          ) : (
                            <Badge variant="outline">No analysis yet</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{s.analyses_count} analyses</span>
                        </div>
                        {s.current_skills?.length ? (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {s.current_skills.slice(0, 4).map(skill => (
                              <Badge key={skill} variant="outline" className="text-[10px] px-1.5 py-0">
                                {skill}
                              </Badge>
                            ))}
                            {s.current_skills.length > 4 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                +{s.current_skills.length - 4}
                              </Badge>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {students.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No students linked yet. Students need to sign up first, then you can link them.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex items-center justify-between">
              <Select value={selectedStudent || "all"} onValueChange={v => setSelectedStudent(v === "all" ? null : v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  {students.map(s => (
                    <SelectItem key={s.student_id} value={s.student_id}>
                      {s.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Assign Task</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <Select value={newTask.student_id} onValueChange={v => setNewTask(p => ({ ...p, student_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                      <SelectContent>
                        {students.map(s => (
                          <SelectItem key={s.student_id} value={s.student_id}>
                            {s.display_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Task title" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} />
                    <Textarea placeholder="Description (optional)" value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))} />
                    <div className="flex gap-3">
                      <Select value={newTask.category} onValueChange={v => setNewTask(p => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="study">Study</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                          <SelectItem value="practice">Practice</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="date" value={newTask.due_date} onChange={e => setNewTask(p => ({ ...p, due_date: e.target.value }))} />
                    </div>
                    <Button onClick={handleCreateTask} className="w-full" disabled={!newTask.title || !newTask.student_id}>
                      Create Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {filteredTasks.map(task => {
                const student = students.find(s => s.student_id === task.student_id);
                return (
                  <Card key={task.id} className="border-border">
                    <CardContent className="p-4 flex items-center gap-3">
                      {task.is_completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${task.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{task.category}</Badge>
                          <span className="text-xs text-muted-foreground">{student?.display_name}</span>
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground">Due: {task.due_date}</span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              {filteredTasks.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No tasks assigned yet. Click "Assign Task" to get started.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {students.map(s => {
                const studentTasks = tasks.filter(t => t.student_id === s.student_id);
                const completedTasks = studentTasks.filter(t => t.is_completed).length;
                const totalTasks = studentTasks.length;
                const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <Card key={s.student_id} className="border-border">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {getInitials(s.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">{s.display_name}</h3>
                          <p className="text-xs text-muted-foreground">{s.domain || "No domain"}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Readiness Score</span>
                          <span className="font-semibold text-foreground">{s.latest_score ?? "N/A"}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tasks Completed</span>
                          <span className="font-semibold text-foreground">{completedTasks}/{totalTasks}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${completionRate}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">{completionRate}% completion</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {students.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No students to track progress for.
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Sessions Tab */}
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
                          <p className="font-medium text-sm text-foreground">
                            {s.topic || "Guidance Session"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.requested_date} at {s.requested_time} · {s.duration_minutes}min
                          </p>
                          {s.company_name && (
                            <Badge variant="outline" className="text-[10px] mt-1">{s.company_name}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.status === "pending" ? (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleSessionAction(s.id, "rejected")} className="text-destructive">
                              <X className="h-4 w-4" />
                            </Button>
                            <Button size="sm" onClick={() => handleSessionAction(s.id, "approved")}>
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          </>
                        ) : (
                          <Badge variant={s.status === "approved" ? "default" : "destructive"}>
                            {s.status}
                          </Badge>
                        )}
                        {s.meet_link && (
                          <a href={s.meet_link} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="text-xs">
                              <Video className="h-3 w-3 mr-1" /> Meet
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {sessions.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No session requests yet.
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

export default MentorDashboard;
