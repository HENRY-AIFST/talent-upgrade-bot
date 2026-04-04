import PlacementPlanner from "@/components/PlacementPlanner";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import AuroraBackground from "@/components/AuroraBackground";

const PlacementPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <AuroraBackground />
      <AppLayout>
        <div className="flex-1 relative z-10">
          <PlacementPlanner onBack={() => navigate("/")} />
        </div>
      </AppLayout>
    </div>
  );
};

export default PlacementPage;
