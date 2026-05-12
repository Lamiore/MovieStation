import type { ReactNode } from "react";

export interface MediaRowProps {
  title: string;
  children: ReactNode;
}

export function MediaRow({ title, children }: MediaRowProps) {
  return (
    <section className="space-y-3">
      <h2 className="px-4 font-display text-2xl uppercase tracking-[0.04em] text-text md:px-8 md:text-3xl">
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto px-4 pb-4 md:gap-6 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </section>
  );
}
