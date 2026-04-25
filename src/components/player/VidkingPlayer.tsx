export interface VidkingPlayerProps {
  src: string;
  title: string;
}

export function VidkingPlayer({ src, title }: VidkingPlayerProps) {
  return (
    <div className="relative isolate ml-[calc(50%-50vw)] mr-[calc(50%-50vw)] w-screen bg-black py-4 md:py-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_65%_at_50%_50%,rgba(229,9,20,0.10),transparent_70%)]"
      />
      <div className="relative mx-auto aspect-video w-full max-w-screen-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)]">
        <iframe
          src={src}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full border-0"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/70 via-black/40 to-transparent px-4 pt-3 pb-10 md:px-8 md:pt-5 md:pb-14">
          <h2 className="line-clamp-1 text-sm font-semibold tracking-tight text-white drop-shadow-lg md:text-base lg:text-lg">
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}
