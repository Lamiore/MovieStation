import Image from "next/image";
import Link from "next/link";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

export interface TopTenItem {
  id: number;
  type: "movie" | "tv";
  title: string;
  posterPath: string | null;
}

export interface TopTenRowProps {
  title: string;
  items: TopTenItem[];
}

export function TopTenRow({ title, items }: TopTenRowProps) {
  const top = items.slice(0, 10);
  if (top.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="px-4 font-display text-2xl uppercase tracking-[0.04em] text-text md:px-8 md:text-3xl">
        {title}
      </h2>
      <div className="flex gap-2 overflow-x-auto px-4 pb-4 md:gap-3 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {top.map((item, i) => {
          const rank = i + 1;
          const src = item.posterPath
            ? IMAGE_BASE + item.posterPath
            : "/placeholder-poster.svg";
          return (
            <Link
              key={item.id}
              href={`/${item.type}/${item.id}`}
              aria-label={`${rank}. ${item.title}`}
              className="group flex shrink-0 items-end"
            >
              <span aria-hidden className="top-ten-rank">
                {rank}
              </span>
              <div className="relative aspect-[2/3] w-[128px] overflow-hidden rounded-md bg-surface ring-1 ring-border transition duration-300 group-hover:scale-[1.04] group-hover:ring-text/40 group-hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.85)] md:w-[168px]">
                <Image
                  src={src}
                  alt={item.title}
                  fill
                  sizes="(min-width: 768px) 168px, 128px"
                  className="object-cover"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
