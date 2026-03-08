import { motion } from "motion/react";
import { ReactNode, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface PageTransitionProps {
  children: ReactNode;
}

const PageSkeleton = () => (
  <div className="min-h-screen bg-background p-4 space-y-6">
    <div className="flex items-center justify-between max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
    <div className="max-w-5xl mx-auto space-y-4 pt-8">
      <div className="text-center space-y-3">
        <Skeleton className="h-10 w-80 mx-auto rounded-lg" />
        <Skeleton className="h-4 w-96 mx-auto" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  </div>
);

const PageTransition = ({ children }: PageTransitionProps) => {
  const [showContent, setShowContent] = useState(false);

  return (
    <>
      {!showContent && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          onAnimationComplete={() => setShowContent(true)}
          className="absolute inset-0 z-50"
        >
          <PageSkeleton />
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default PageTransition;
