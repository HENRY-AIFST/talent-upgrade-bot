import PlacementPlanner from "@/components/PlacementPlanner";
import { useNavigate } from "react-router-dom";
import PillNav from "@/components/PillNav";
import logoImg from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

const PlacementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative z-10">
        <PillNav
          logo={logoImg}
          logoAlt="SkillBridge"
          items={[
            { label: 'Home', href: '/' },
            ...(user ? [
              { label: 'My Hub', href: '/client' },
              { label: 'Mentor', href: '/mentor' },
              { label: 'Placement', href: '/placement' },
              { label: 'Progress', href: '/progress' },
            ] : []),
            ...(!user ? [{ label: 'Sign In', href: '/auth' }] : []),
          ]}
          ease="power2.easeOut"
          baseColor="hsl(var(--card))"
          pillColor="hsl(var(--primary))"
          hoveredPillTextColor="hsl(var(--primary-foreground))"
          pillTextColor="hsl(var(--primary-foreground))"
          initialLoadAnimation={false}
        />
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      </div>
      <div className="flex-1">
        <PlacementPlanner onBack={() => navigate("/")} />
      </div>
    </div>
  );
};

export default PlacementPage;
