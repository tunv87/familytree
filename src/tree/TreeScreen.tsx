import { useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchPeople } from '../data/people';
import { useT } from '../i18n';
import { load, save } from '../lib/storage';
import { TopBar } from '../ui/components';
import { FamilyGate } from '../family/useFamilyGate';
import { useSettings } from '../app/settings';
import { kinship } from '../data/kinship';
import { useThumbs } from '../data/photos';
import { kinBadge } from './card';
import { CARD_H, layoutTree, PHOTO_CARD_W } from './layout';
import { PanZoom, type PanZoomHandle } from './PanZoom';
import { PdfDialog } from './PdfDialog';
import { TreeSvg } from './TreeSvg';
import type { CurrentFamily } from '../data/current';

export function TreeScreen() {
  const t = useT();
  return <FamilyGate title={t('tree')}>{(fam) => <TreeView fam={fam} />}</FamilyGate>;
}

function TreeView({ fam }: { fam: CurrentFamily & { isAdmin: boolean } }) {
  const t = useT();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const rootId = params.get('root');
  const focusParam = params.get('focus');
  const people = fam.people;
  const thumbs = useThumbs();
  const key = `collapsed:${fam.id}`;
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(load<{ ids: string[] }>(key, { ids: [] }).ids),
  );
  const [focusId, setFocusId] = useState<string | null>(focusParam);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [printing, setPrinting] = useState(false);
  const pz = useRef<PanZoomHandle>(null);

  const layout = useMemo(
    () => layoutTree(people, { collapsed, rootId: rootId ?? undefined, cardW: PHOTO_CARD_W }),
    [people, collapsed, rootId],
  );
  // danh xưng on every card once the viewer has said who they are ("Đây là tôi")
  const { me: meMap, region } = useSettings();
  const meId = fam.id && meMap?.[fam.id] && people[meMap[fam.id]] ? meMap[fam.id] : null;
  const badges = useMemo(() => {
    const out: Record<string, string> = {};
    if (!meId) return out;
    for (const n of layout.nodes) {
      if (n.id === meId) continue;
      const b = kinBadge(kinship(people, meId, n.id, region));
      if (b) out[n.id] = b;
    }
    return out;
  }, [layout, people, meId, region]);
  const nodeOf = (id: string | null) => (id ? layout.nodes.find((n) => n.id === id) : undefined);
  const initialNode = nodeOf(focusParam);

  const toggle = (id: string) => {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCollapsed(next);
    save(key, { ids: [...next] });
  };

  const focus = (id: string) => {
    // make sure the person is visible: expand every collapsed ancestor
    const next = new Set(collapsed);
    let changed = false;
    const expandUp = (x: string) => {
      const p = people[x];
      for (const par of [p?.fatherId, p?.motherId]) {
        if (par && people[par]) {
          if (next.delete(par)) changed = true;
          expandUp(par);
        }
      }
    };
    expandUp(id);
    if (changed) {
      setCollapsed(next);
      save(key, { ids: [...next] });
    }
    setFocusId(id);
    setSearching(false);
    setQuery('');
    // wait for the new layout before centring
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const n = layoutTree(people, {
          collapsed: next,
          rootId: rootId ?? undefined,
          cardW: PHOTO_CARD_W,
        }).nodes.find((x) => x.id === id);
        if (n) pz.current?.centerOn(n.x + PHOTO_CARD_W / 2, n.y + CARD_H / 2, 1);
      }),
    );
  };

  const results = query.trim() ? searchPeople(people, query, fam.generations).slice(0, 6) : [];
  const count = Object.keys(people).length;

  return (
    <main className="screen tree-screen">
      {printing && (
        <PdfDialog
          people={people}
          rootId={rootId ?? undefined}
          title={
            rootId && people[rootId]
              ? `${fam.family!.meta.name} — ${t('branchOf', { name: people[rootId].name })}`
              : fam.family!.meta.name
          }
          onClose={() => setPrinting(false)}
        />
      )}
      <TopBar
        title={rootId && people[rootId] ? t('branchOf', { name: people[rootId].name }) : t('tree')}
        right={
          <div className="topbar-actions">
            <button
              className="icon-btn"
              aria-label={t('printPdf')}
              data-testid="print"
              onClick={() => setPrinting(true)}
            >
              🖨️
            </button>
            <button
              className="icon-btn"
              aria-label={t('search')}
              data-testid="tree-search-toggle"
              onClick={() => setSearching((s) => !s)}
            >
              🔍
            </button>
          </div>
        }
      />
      {searching && (
        <div className="tree-search">
          <input
            className="text-input"
            type="search"
            autoFocus
            value={query}
            placeholder={t('search')}
            data-testid="tree-search"
            onChange={(e) => setQuery(e.target.value)}
          />
          {results.length > 0 && (
            <ul className="tree-results" aria-label={t('searchResults')} data-popup>
              {results.map((id) => (
                <li key={id}>
                  <button onClick={() => focus(id)} data-testid={`result-${id}`}>
                    {people[id].name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {count > 0 && layout.width > layout.height * 2 && window.innerHeight > window.innerWidth && (
        <div className="muted small center" data-testid="rotate-hint">
          📱↻ {t('rotateHint')}
        </div>
      )}
      {count === 0 ? (
        <div className="center grow muted">{t('emptyFamily')}</div>
      ) : (
        <div className="tree-wrap">
          <PanZoom
            width={layout.width}
            height={layout.height}
            handleRef={pz}
            initial={
              initialNode
                ? { x: initialNode.x + PHOTO_CARD_W / 2, y: initialNode.y + CARD_H / 2 }
                : null
            }
          >
            <TreeSvg
              layout={layout}
              people={people}
              focusId={focusId}
              onSelect={(id) => navigate(`/p/${id}`)}
              onToggle={toggle}
              thumbs={thumbs}
              badges={badges}
              meId={meId}
            />
          </PanZoom>
          <div className="tree-controls">
            <button
              className="icon-btn"
              aria-label={t('zoomIn')}
              onClick={() => pz.current?.zoomBy(1.4)}
            >
              ＋
            </button>
            <button
              className="icon-btn"
              aria-label={t('zoomOut')}
              onClick={() => pz.current?.zoomBy(1 / 1.4)}
            >
              －
            </button>
            <button
              className="icon-btn"
              aria-label={t('fullView')}
              data-testid="fit"
              onClick={() => pz.current?.fit()}
            >
              ⤢
            </button>
            {collapsed.size > 0 && (
              <button
                className="icon-btn"
                aria-label={t('expandAll')}
                data-testid="expand-all"
                onClick={() => {
                  setCollapsed(new Set());
                  save(key, { ids: [] });
                }}
              >
                ⇕
              </button>
            )}
          </div>
          {rootId && (
            <button className="btn secondary tree-whole" onClick={() => setParams({})}>
              🌳 {t('wholeTree')}
            </button>
          )}
        </div>
      )}
    </main>
  );
}
