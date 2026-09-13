import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Compass, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import Particles from "@/components/Particles";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import AuroraBackground from "@/components/AuroraBackground";
import { motion } from "motion/react";

const taglines = [
  "Bridging the gap to your next career",
  "Empowering transitions with precision",
  "Your future, architected by skills",
];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "We sent you a confirmation link." });
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: "Check your email", description: "Password reset link sent." });
      setShowReset(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AuroraBackground />
      <div className="absolute inset-0 z-[1]">
        <Particles
          particleColors={["#2dd4bf", "#14b8a6", "#0d9488"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>

      {/* Cinematic aurora orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
        <div className="absolute -top-[10%] -left-[10%] w-[80%] h-[80%] bg-indigo-600/20 blur-[140px] rounded-full animate-aurora-auth-1" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[80%] h-[80%] bg-emerald-600/20 blur-[140px] rounded-full animate-aurora-auth-2" />
      </div>

      {/* Floating glass decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
        <div className="absolute top-[15%] right-[20%] w-40 h-40 glass-decor rounded-3xl rotate-12 animate-float-shape opacity-40" style={{ animationDelay: "-2s" }} />
        <div className="absolute bottom-[10%] left-[15%] w-56 h-56 glass-decor rounded-[4rem] -rotate-12 animate-float-shape opacity-40" style={{ animationDelay: "-4s" }} />
      </div>

      {/* Particle system */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
        <div className="auth-particle w-1 h-1 top-[15%] left-[12%] animate-drift-particle" style={{ animationDuration: "14s", animationDelay: "0s" }} />
        <div className="auth-particle w-1.5 h-1.5 top-[30%] left-[70%] animate-drift-particle" style={{ animationDuration: "19s", animationDelay: "2s" }} />
        <div className="auth-particle w-1 h-1 top-[80%] left-[80%] animate-drift-particle" style={{ animationDuration: "22s", animationDelay: "5s" }} />
        <div className="auth-particle w-1 h-1 top-[45%] left-[85%] animate-drift-particle" style={{ animationDuration: "17s", animationDelay: "1s" }} />
        <div className="auth-particle w-1.5 h-1.5 top-[70%] left-[25%] animate-drift-particle" style={{ animationDuration: "20s", animationDelay: "3s" }} />
      </div>

      <AppLayout />

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-sm perspective-container">
          <motion.div
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="tilt-card p-px rounded-[2.5rem] bg-gradient-to-br from-white/30 via-white/5 to-white/20 shadow-2xl"
          >
            <div className="bg-card/85 backdrop-blur-[50px] rounded-[calc(2.5rem-1px)] p-8 md:p-10 flex flex-col items-center border border-border/50">
              <div className="tilt-content w-full flex flex-col items-center">
                {/* Logo */}
                <div className="flex flex-col items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl gradient-border-logo shadow-2xl shadow-indigo-500/40 transform transition-transform duration-500 hover:scale-110">
                    <div className="w-full h-full bg-card rounded-[calc(1rem-2.5px)] flex items-center justify-center">
                      <Compass className="h-8 w-8 text-foreground" />
                    </div>
                  </div>
                  <h1 className="font-display font-bold text-3xl text-foreground tracking-tight">SkillBridge</h1>
                </div>

                {/* Tagline scroller */}
                {!showReset && (
                  <div className="h-6 overflow-hidden mb-8 w-full text-center">
                    <div className="animate-tagline-rotate flex flex-col">
                      {taglines.map((tagline, i) => (
                        <span key={i} className="h-6 text-muted-foreground text-[10px] font-bold tracking-[0.25em] uppercase flex items-center justify-center">
                          {tagline}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {showReset ? (
                  <form onSubmit={handleResetPassword} className="w-full space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-secondary/50 border-border/50 rounded-2xl pl-11 pr-5 py-4 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-secondary focus:ring-4 focus:ring-primary/10 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-bold py-5 rounded-2xl shadow-xl hover:shadow-primary/20 active:scale-[0.98] transition-all">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
                    </Button>
                    <button type="button" onClick={() => setShowReset(false)} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Back to login
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleAuth} className="w-full space-y-5">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Display Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Jane Doe"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-secondary/50 border-border/50 rounded-2xl pl-11 pr-5 py-4 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-secondary focus:ring-4 focus:ring-primary/10 transition-all"
                            required={!isLogin}
                          />
                        </div>
                      </motion.div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-secondary/50 border-border/50 rounded-2xl pl-11 pr-5 py-4 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-secondary focus:ring-4 focus:ring-primary/10 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">Password</label>
                        {isLogin && (
                          <button type="button" onClick={() => setShowReset(true)} className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider transition-colors">
                            Forgot?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-secondary/50 border-border/50 rounded-2xl pl-11 pr-5 py-4 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-secondary focus:ring-4 focus:ring-primary/10 transition-all"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-foreground text-background font-bold py-5 rounded-2xl shadow-xl hover:shadow-foreground/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shimmer-button group"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            {isLogin ? "Sign In" : "Create Account"}
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </Button>

                    <div className="flex items-center justify-between text-sm">
                      <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
                        {isLogin ? "Create account" : "Already have an account?"}
                      </button>
                    </div>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/30" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[0.3em]">
                        <span className="bg-card px-4 text-muted-foreground/60">Or connect via</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading}
                      className="w-full py-5 bg-secondary/30 border-border/50 hover:bg-secondary/60 hover:border-border rounded-2xl text-foreground font-medium transition-all group"
                    >
                      {googleLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <svg className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                          </svg>
                          Google
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
