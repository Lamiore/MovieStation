export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 px-4 py-8 text-xs text-muted-foreground md:px-8">
      <div className="mx-auto max-w-screen-2xl space-y-2">
        <p>
          Movie &amp; TV data{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline hover:text-text"
          >
            powered by TMDB
          </a>
          .
        </p>
        <p>
          Bauni is not affiliated with TMDB or any streaming provider.
          Content is displayed from third-party sources.
        </p>
      </div>
    </footer>
  );
}
