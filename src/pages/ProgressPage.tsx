import ProgressTracker from "@/components/ProgressTracker";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

const ProgressPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppLayout>
        <div className="flex-1">
          <ProgressTracker onBack={() => navigate("/")} />
        </div>
      </AppLayout>
    </div>
  );
};

export default ProgressPage;
