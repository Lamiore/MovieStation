import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Serial tidak ditemukan</h1>
      <p className="text-sm text-muted-foreground">
        Mungkin sudah dihapus dari TMDB atau ID-nya tidak valid.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
