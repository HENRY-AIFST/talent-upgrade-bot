import PlacementPlanner from "@/components/PlacementPlanner";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const PlacementPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppLayout>
        <div className="flex-1">
          <PlacementPlanner onBack={() => navigate("/")} />
        </div>
      </AppLayout>
    </div>
  );
};

export default PlacementPage;
