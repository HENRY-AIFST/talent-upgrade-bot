import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PillNav from "@/components/PillNav";
import ThemeToggle from "@/components/ThemeToggle";
import logoImg from "@/assets/akashi-bridge-night.svg";

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
        <div className="absolute top-4 right-16 md:right-4 hidden sm:flex items-center gap-2 z-[100]">
          <ThemeToggle />
          {rightActions}
        </div>
        <div className="sm:hidden px-4 mt-3 flex justify-end z-[100]">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/80 backdrop-blur-md px-2 py-1.5">
            <ThemeToggle />
            {rightActions}
          </div>
        </div>
      </div>
      {children}
    </>
  );
};

export default AppLayout;
