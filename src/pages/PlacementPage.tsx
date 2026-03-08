import PlacementPlanner from "@/components/PlacementPlanner";
import { useNavigate } from "react-router-dom";

const PlacementPage = () => {
  const navigate = useNavigate();
  return <PlacementPlanner onBack={() => navigate("/")} />;
};

export default PlacementPage;
