import {
  DEFAULT_PROVIDER_ID,
  getProvider,
  type BuildEmbedUrlInput,
} from "./providers";

export type { BuildEmbedUrlInput };

export function buildEmbedUrl(
  input: BuildEmbedUrlInput,
  providerId: string = DEFAULT_PROVIDER_ID,
): string {
  if (
    input.type === "tv" &&
    (typeof input.season !== "number" || typeof input.episode !== "number")
  ) {
    throw new Error("buildEmbedUrl: tv requires both season and episode");
  }
  return getProvider(providerId).buildUrl(input);
}
