/**
 * AuroraBackground – animated gradient orbs that sit beneath page content.
 * Renders four blurred, slowly-drifting circles (teal · violet · blue · pink)
 * plus an optional dot-grid texture overlay.
 */
const AuroraBackground = ({ grid = true }: { grid?: boolean }) => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
    {/* Teal orb – top-left */}
    <div
      className="aurora-orb aurora-orb-teal animate-aurora-1"
      style={{ width: "55vw", height: "55vw", top: "-15%", left: "-10%" }}
    />
    {/* Violet orb – bottom-right */}
    <div
      className="aurora-orb aurora-orb-violet animate-aurora-2"
      style={{ width: "50vw", height: "50vw", bottom: "-15%", right: "-10%" }}
    />
    {/* Blue orb – centre */}
    <div
      className="aurora-orb aurora-orb-blue animate-aurora-3"
      style={{ width: "40vw", height: "40vw", top: "30%", left: "30%" }}
    />
    {/* Pink orb – top-right accent */}
    <div
      className="aurora-orb aurora-orb-pink animate-aurora-4"
      style={{ width: "30vw", height: "30vw", top: "5%", right: "5%" }}
    />
    {/* Optional dot-grid texture */}
    {grid && <div className="absolute inset-0 dot-grid opacity-40" />}
  </div>
);

export default AuroraBackground;
