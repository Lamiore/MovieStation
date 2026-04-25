export interface VidkingPlayerProps {
  src: string;
  title: string;
}

export function VidkingPlayer({ src, title }: VidkingPlayerProps) {
  return (
    <div className="relative aspect-video w-full bg-black">
      <iframe
        src={src}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
