/**
 * Điều hướng: the ← button goes to a screen's PARENT (fixed, chosen with the family on the mock),
 * not "wherever the user was before" — which used to throw people out of the app after opening a
 * deep link from Zalo, or bounce them between Edit and Profile. 🏠 always goes to the home page.
 *
 * One exception (P2): a profile opened from the tree or the calendar goes back there, so the
 * person isn't lost from the spot they were looking at. That spot travels in the navigation state.
 */
import { useEffect } from 'react';
import { useLocation, useNavigate, type Location } from 'react-router-dom';

export interface NavState {
  /** where a profile was opened from (tree / calendar), for its ← button */
  from?: string;
}

/** The parent of a screen, or null for the home page. */
export function parentPath(
  pathname: string,
  search = '',
  state: NavState | null = null,
): string | null {
  const q = new URLSearchParams(search);
  const seg = pathname.split('/').filter(Boolean);
  const [first, id] = seg;
  switch (first) {
    case undefined:
      return null;
    case 'p':
      return state?.from ?? '/people';
    case 'edit':
    case 'relations':
      return id ? `/p/${id}` : '/people';
    case 'add': {
      if (q.get('first') === '1') return '/';
      const of = q.get('parent') ?? q.get('spouse') ?? q.get('child');
      return of ? `/p/${of}` : '/people';
    }
    case 'tree': {
      const root = q.get('root');
      return root ? `/p/${root}` : '/';
    }
    case 'kinship': {
      const who = q.get('b') ?? q.get('a');
      return who ? `/p/${who}` : '/';
    }
    case 'new-family':
      return '/families';
    case 'debug':
      return '/settings';
    default:
      // people, calendar, invite, settings, families, f/<id>, anything unknown
      return '/';
  }
}

// Which path sits at each position of the browser history, so ← can step back when the
// previous entry already is the parent (then the phone's own back button keeps working).
const byIndex = new Map<number, string>();
const historyIndex = () => (window.history.state as { idx?: number } | null)?.idx ?? 0;
const full = (l: Pick<Location, 'pathname' | 'search'>) => l.pathname + l.search;

/** Remembers the visited path at each history position (mounted once in App). */
export function useTrackHistory() {
  const location = useLocation();
  useEffect(() => {
    byIndex.set(historyIndex(), full(location));
  }, [location]);
}

/** Navigation helpers for the top bar and forms. */
export function useNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const parent = parentPath(location.pathname, location.search, location.state as NavState | null);
  /** go to `to` as "one level up": step back if that's where we came from, else replace */
  const goTo = (to: string) => {
    const idx = historyIndex();
    if (idx > 0 && byIndex.get(idx - 1) === to) navigate(-1);
    else navigate(to, { replace: true });
  };
  return {
    parent,
    up: () => goTo(parent ?? '/'),
    home: () => goTo('/'),
    goTo,
  };
}
