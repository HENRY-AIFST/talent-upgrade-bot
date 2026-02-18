import { YouTubePlaylist } from "@/types/analysis";
import { Youtube, ExternalLink } from "lucide-react";

interface YouTubePlaylistSectionProps {
  playlists: YouTubePlaylist[];
}

const YouTubePlaylistSection = ({ playlists }: YouTubePlaylistSectionProps) => {
  if (!playlists || playlists.length === 0) return null;

  return (
    <div className="gradient-card rounded-xl p-6 border border-border shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <Youtube className="h-5 w-5 text-destructive" />
        <h3 className="font-display font-semibold text-foreground">Recommended YouTube Playlists</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {playlists.map((pl, i) => (
          <a
            key={i}
            href={pl.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-4 p-4 rounded-lg border border-border bg-secondary/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 group-hover:bg-destructive/20 transition-colors">
              <Youtube className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-foreground text-sm truncate">{pl.title}</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 inline-block mb-1">
                {pl.skill}
              </span>
              <p className="text-xs text-muted-foreground line-clamp-2">{pl.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default YouTubePlaylistSection;
