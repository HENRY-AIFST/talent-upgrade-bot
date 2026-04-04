import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PillNav from "@/components/PillNav";
import ThemeToggle from "@/components/ThemeToggle";
import logoImg from "@/assets/logo.png";

interface AppLayoutProps {
  children?: ReactNode;
  initialLoadAnimation?: boolean;
  rightActions?: ReactNode;
}

const AppLayout = ({ children, initialLoadAnimation = false, rightActions }: AppLayoutProps) => {
  const { user } = useAuth();

  const isAdmin = user?.email === "rahul140706@gmail.com";

  const navItems = [
    { label: "Home", href: "/" },
    ...(user
      ? [
          { label: "My Hub", href: "/client" },
          { label: "Mentor", href: "/mentor" },
          { label: "Placement", href: "/placement" },
          { label: "Progress", href: "/progress" },
          ...(isAdmin ? [{ label: "Admin", href: "/admin" }] : []),
        ]
      : [{ label: "Sign In", href: "/auth" }]),
  ];

  return (
    <>
      <div className="relative z-10">
        <PillNav
          logo={logoImg}
          logoAlt="SkillBridge"
          items={navItems}
          ease="power2.easeOut"
          baseColor="hsl(var(--card))"
          pillColor="hsl(var(--primary))"
          hoveredPillTextColor="hsl(var(--foreground))"
          pillTextColor="hsl(var(--primary-foreground))"
          initialLoadAnimation={initialLoadAnimation}
        />
        <div className="absolute top-4 right-16 md:right-4 flex items-center gap-2 z-[100]">
          <ThemeToggle />
          {rightActions}
        </div>
      </div>
      {children}
    </>
  );
};

export default AppLayout;
