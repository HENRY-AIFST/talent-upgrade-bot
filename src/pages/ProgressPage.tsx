import ProgressTracker from "@/components/ProgressTracker";
import { useNavigate } from "react-router-dom";

const ProgressPage = () => {
  const navigate = useNavigate();
  return <ProgressTracker onBack={() => navigate("/")} />;
};

export default ProgressPage;
