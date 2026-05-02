"use client";

import { useState } from "react";
import {
  buildEmbedUrl,
  type BuildEmbedUrlInput,
} from "@/lib/embed/buildEmbedUrl";
import { DEFAULT_PROVIDER_ID } from "@/lib/embed/providers";
import { EmbedPlayer } from "./EmbedPlayer";
import { ProviderToggle } from "./ProviderToggle";

export type WatchPlayerProps = BuildEmbedUrlInput & { title: string };

export function WatchPlayer({ title, ...input }: WatchPlayerProps) {
  const [providerId, setProviderId] = useState<string>(DEFAULT_PROVIDER_ID);
  const src = buildEmbedUrl(input, providerId);
  return (
    <div className="space-y-3">
      <ProviderToggle value={providerId} onChange={setProviderId} />
      <EmbedPlayer src={src} title={title} />
    </div>
  );
}
