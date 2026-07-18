import { getApiBaseUrl } from "../api/client";

const INTERNAL_STORAGE_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "minio"]);

/** Resolves backend-relative media paths for native clients. */
export function resolveMediaUrl(
  value?: string | null,
  apiBaseUrl: string = getApiBaseUrl(),
): string | null {
  if (!value?.trim()) return null;

  let publicOrigin: URL;
  try {
    publicOrigin = new URL(apiBaseUrl);
  } catch {
    return null;
  }

  const origin = publicOrigin.origin;
  const trimmed = value.trim();
  if (trimmed.startsWith("/")) {
    return new URL(trimmed, `${origin}/`).toString();
  }

  try {
    const mediaUrl = new URL(trimmed);
    if (mediaUrl.protocol !== "http:" && mediaUrl.protocol !== "https:") {
      return null;
    }
    if (INTERNAL_STORAGE_HOSTS.has(mediaUrl.hostname)) {
      const storagePath = mediaUrl.pathname.startsWith("/storage/")
        ? mediaUrl.pathname
        : `/storage${mediaUrl.pathname.startsWith("/") ? "" : "/"}${mediaUrl.pathname}`;
      return new URL(
        `${storagePath}${mediaUrl.search}${mediaUrl.hash}`,
        `${origin}/`,
      ).toString();
    }
    return mediaUrl.toString();
  } catch {
    return null;
  }
}
