import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import PageTransition from "./PageTransition";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import SharedAnalysis from "@/pages/SharedAnalysis";
import NotFound from "@/pages/NotFound";
import MentorDashboard from "@/pages/MentorDashboard";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/shared/:shareId" element={<PageTransition><SharedAnalysis /></PageTransition>} />
        <Route path="/mentor" element={<PageTransition><MentorDashboard /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
