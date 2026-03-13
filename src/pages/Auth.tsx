import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Compass, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import Particles from "@/components/Particles";
import RotatingText from "@/components/RotatingText";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

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

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0">
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

      <AppLayout />

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8 relative z-10">
          {/* Logo */}
          <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow mx-auto">
            <Compass className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">SkillBridge</h1>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
            {showReset ? "Reset your password" : isLogin ? "Welcome back" : "Create your account to"}
            {!showReset && (
              <RotatingText
                texts={['land your dream job', 'bridge skill gaps', 'ace interviews', 'grow your career']}
                mainClassName="px-1.5 bg-primary text-primary-foreground overflow-hidden py-0.5 rounded-md text-sm"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={3000}
              />
            )}
          </p>
        </div>

        {showReset ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary border-border"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-semibold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
            </Button>
            <button type="button" onClick={() => setShowReset(false)} className="w-full text-sm text-muted-foreground hover:text-foreground">
              Back to login
            </button>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                  required={!isLogin}
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary border-border"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-secondary border-border"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-semibold py-5">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Sign Up"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
                {isLogin ? "Create account" : "Already have an account?"}
              </button>
              {isLogin && (
                <button type="button" onClick={() => setShowReset(true)} className="text-muted-foreground hover:text-foreground">
                  Forgot password?
                </button>
              )}
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
