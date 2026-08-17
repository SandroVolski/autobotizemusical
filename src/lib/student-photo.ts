import { supabase } from "@/integrations/supabase/client";

export const ALUNOS_FOTOS_BUCKET = "alunos-fotos";

/** Short-lived signed URL validity (10 minutes). */
export const PHOTO_SIGNED_URL_TTL = 60 * 10;

/**
 * Accepts either a storage path (new format) or a legacy long-lived signed URL
 * and returns the plain storage path inside the alunos-fotos bucket.
 */
export function getPhotoStoragePath(fotoUrl?: string | null): string | null {
  if (!fotoUrl) return null;
  if (!/^https?:\/\//i.test(fotoUrl)) return fotoUrl.replace(/^\/+/, "");
  try {
    const { pathname } = new URL(fotoUrl);
    const marker = `/${ALUNOS_FOTOS_BUCKET}/`;
    const idx = pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}

/** Creates a fresh short-lived signed URL for a student photo. */
export async function createPhotoSignedUrl(fotoUrl?: string | null): Promise<string | null> {
  const path = getPhotoStoragePath(fotoUrl);
  if (!path) return null;
  const { data } = await supabase.storage
    .from(ALUNOS_FOTOS_BUCKET)
    .createSignedUrl(path, PHOTO_SIGNED_URL_TTL);
  return data?.signedUrl ?? null;
}
