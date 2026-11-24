/**
 * Ảnh đại diện. Firebase Storage needs a paid plan, so photos are small JPEGs kept in the
 * Realtime Database, OUTSIDE the family node (which every relative downloads whole):
 *   thumbs/<fid>/<pid>  96 px (~4 KB)   — lists, tree, PDF; the whole family's thumbs load once
 *   photos/<fid>/<pid>  320 px (~25 KB) — loaded only when that person's page is open
 * The picture is cropped to a square and shrunk on the phone before it is sent.
 */
import { onValue, ref, update } from 'firebase/database';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { createLogger } from '../lib/logger';
import { load, save } from '../lib/storage';
import { getCurrentId } from './current';
import { settle } from './families';
import { ensureSignedIn, getDb } from './firebase';

const log = createLogger('photos');

export const THUMB_PX = 96;
export const PHOTO_PX = 320;
/** limits checked by the database rules too */
export const THUMB_MAX = 16_000;
export const PHOTO_MAX = 100_000;
export const MAX_FILE_BYTES = 15 * 1024 * 1024;
const JPEG = 'data:image/jpeg;base64,';
/** keep the thumbs for offline use only while they're small */
const OFFLINE_CACHE_MAX = 500_000;

export interface Avatar {
  thumb: string;
  photo: string;
}

export type PhotoError = 'notImage' | 'tooBig' | 'unreadable';

/** The centred square of a w×h picture: where to cut it. */
export function squareCrop(w: number, h: number): { sx: number; sy: number; side: number } {
  const side = Math.max(1, Math.min(w, h));
  return { sx: Math.max(0, (w - side) / 2), sy: Math.max(0, (h - side) / 2), side };
}

/** A data URL is acceptable when it is a JPEG and within the size limit. */
export function isValidJpeg(s: unknown, max: number): s is string {
  return typeof s === 'string' && s.startsWith(JPEG) && s.length <= max;
}

async function decode(file: Blob): Promise<CanvasImageSource & { width: number; height: number }> {
  try {
    // turns phone photos the right way up (EXIF orientation)
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // older Safari: an <img> also follows EXIF orientation nowadays
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function toJpeg(
  src: CanvasImageSource & { width: number; height: number },
  px: number,
  max: number,
) {
  const { sx, sy, side } = squareCrop(src.width, src.height);
  const canvas = document.createElement('canvas');
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, sx, sy, side, side, 0, 0, px, px);
  for (const q of [0.82, 0.7, 0.55, 0.4]) {
    const url = canvas.toDataURL('image/jpeg', q);
    if (url.length <= max) return url;
  }
  throw new Error('photo still too large');
}

/** Square-crops and shrinks a picture the user picked. */
export async function makeAvatar(file: File): Promise<Avatar | PhotoError> {
  if (!file.type.startsWith('image/')) return 'notImage';
  if (file.size > MAX_FILE_BYTES) return 'tooBig';
  try {
    const img = await decode(file);
    return { thumb: toJpeg(img, THUMB_PX, THUMB_MAX), photo: toJpeg(img, PHOTO_PX, PHOTO_MAX) };
  } catch (e) {
    log.warn('could not read picture', String(e));
    return 'unreadable';
  }
}

/** Saves (or with null removes) a person's photo. */
export async function savePhoto(familyId: string, personId: string, avatar: Avatar | null) {
  await ensureSignedIn();
  const result = await settle(
    update(ref(getDb()), {
      [`thumbs/${familyId}/${personId}`]: avatar?.thumb ?? null,
      [`photos/${familyId}/${personId}`]: avatar?.photo ?? null,
    }),
  );
  // show the change at once, before the server echoes it back
  setThumb(familyId, personId, avatar?.thumb ?? null);
  return result;
}

// ---------------------------------------------------------------------------------------
// Thumbs of the open family: watched live, kept in memory, cached for offline when small.

type Thumbs = Record<string, string>;
const EMPTY: Thumbs = {};
let thumbs: { fid: string | null; map: Thumbs } = { fid: null, map: EMPTY };
const listeners = new Set<() => void>();
let stop: (() => void) | null = null;

function cleanThumbs(raw: unknown): Thumbs {
  const out: Thumbs = {};
  if (raw && typeof raw === 'object')
    for (const [k, v] of Object.entries(raw)) if (isValidJpeg(v, THUMB_MAX)) out[k] = v;
  return out;
}

function emit(fid: string | null, map: Thumbs) {
  thumbs = { fid, map };
  listeners.forEach((l) => l());
}

function setThumb(fid: string, pid: string, thumb: string | null) {
  if (thumbs.fid !== fid) return;
  const map = { ...thumbs.map };
  if (thumb) map[pid] = thumb;
  else delete map[pid];
  emit(fid, map);
}

function watch(fid: string | null) {
  if (thumbs.fid === fid && stop) return;
  stop?.();
  stop = null;
  if (!fid) {
    emit(null, EMPTY);
    return;
  }
  emit(fid, cleanThumbs(load(`thumbs:${fid}`, {})));
  let cancelled = false;
  let unsub: (() => void) | null = null;
  stop = () => {
    cancelled = true;
    unsub?.();
  };
  ensureSignedIn()
    .then(() => {
      if (cancelled) return;
      unsub = onValue(
        ref(getDb(), `thumbs/${fid}`),
        (snap) => {
          const map = cleanThumbs(snap.val());
          emit(fid, map);
          const size = Object.values(map).reduce((n, v) => n + v.length, 0);
          save(`thumbs:${fid}`, size <= OFFLINE_CACHE_MAX ? map : {});
        },
        (e) => log.warn('thumbs watch failed', String(e)),
      );
    })
    .catch((e) => log.warn('thumbs sign-in failed', String(e)));
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Thumbs of the family open on this device (id → JPEG data URL). */
export function useThumbs(): Thumbs {
  const fid = getCurrentId();
  useEffect(() => watch(fid), [fid]);
  const s = useSyncExternalStore(subscribe, () => thumbs);
  return s.fid === fid ? s.map : EMPTY;
}

/** The big photo of one person (falls back to the thumb while it loads). */
export function usePhoto(personId: string): string | null {
  const fid = getCurrentId();
  const thumb = useThumbs()[personId] ?? null;
  const [photo, setPhoto] = useState<{ key: string; url: string | null } | null>(null);
  const key = `${fid}/${personId}`;
  useEffect(() => {
    if (!fid || !thumb) return;
    let unsub: (() => void) | null = null;
    let cancelled = false;
    ensureSignedIn()
      .then(() => {
        if (cancelled) return;
        unsub = onValue(
          ref(getDb(), `photos/${fid}/${personId}`),
          (snap) => {
            const v: unknown = snap.val();
            setPhoto({ key, url: isValidJpeg(v, PHOTO_MAX) ? v : null });
          },
          (e) => log.warn('photo watch failed', String(e)),
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [fid, personId, key, thumb]);
  if (!thumb) return null;
  return photo?.key === key && photo.url ? photo.url : thumb;
}
