export interface AnimeSearchBarProps {
  defaultValue?: string;
}

export function AnimeSearchBar({ defaultValue = "" }: AnimeSearchBarProps) {
  return (
    <form
      action="/anime/search"
      method="GET"
      className="flex w-full max-w-lg items-center gap-2"
    >
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search anime…"
        aria-label="Search anime"
        className="flex-1 rounded-md bg-elevated px-3 py-2 text-sm text-text ring-1 ring-border placeholder:text-muted-foreground focus:outline-none focus:ring-primary"
      />
      <button
        type="submit"
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Search
      </button>
    </form>
  );
}
