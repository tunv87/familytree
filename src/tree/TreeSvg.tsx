import type { People } from '../data/people';
import { GENDER_ICON } from '../ui/Avatar';
import { cardContent, cardSubtitle, LINE_H } from './card';
import { CARD_H, type TreeLayout } from './layout';

/** Draws a laid-out tree. Colours come from CSS classes (see .tree-* in styles.css). */
export function TreeSvg({
  layout,
  people,
  focusId,
  onSelect,
  onToggle,
  thumbs = {},
  badges = {},
  meId = null,
}: {
  layout: TreeLayout;
  people: People;
  /** small photos by person id (cards with room for a photo show them) */
  thumbs?: Record<string, string>;
  /** danh xưng labels by person id, when the viewer has said who they are */
  badges?: Record<string, string>;
  /** the viewer's own card ("Bạn") */
  meId?: string | null;
  focusId?: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const CARD_W = layout.cardW;
  return (
    <svg
      className="tree-svg"
      width={layout.width}
      height={layout.height}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      data-testid="tree-svg"
    >
      <g className="tree-lines">
        {layout.lines.map((pts, i) => (
          <polyline key={i} points={pts.map((p) => p.join(',')).join(' ')} />
        ))}
      </g>
      <g className="tree-marriages">
        {layout.marriages.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      {layout.nodes.map((n) => {
        const p = people[n.id];
        const years = cardSubtitle(p, CARD_W);
        const c = cardContent(p.name, years, CARD_W);
        const isMe = meId === n.id;
        const badge = isMe ? 'Bạn' : badges[n.id];
        const thumb = thumbs[n.id];
        return (
          <g
            key={n.id}
            transform={`translate(${n.x},${n.y})`}
            className={`tree-card g-${p.gender}${p.deceased ? ' dead' : ''}${n.inLaw ? ' inlaw' : ''}${focusId === n.id ? ' focus' : ''}${isMe ? ' me' : ''}`}
            data-testid={`card-${n.id}`}
            onClick={() => onSelect(n.id)}
          >
            <rect width={CARD_W} height={CARD_H} rx={12} />
            {c.photo && (
              <g className="tree-photo">
                <circle cx={c.photo.cx} cy={c.photo.cy} r={c.photo.r} />
                {thumb ? (
                  <>
                    <clipPath id={`clip-${n.id}`}>
                      <circle cx={c.photo.cx} cy={c.photo.cy} r={c.photo.r} />
                    </clipPath>
                    <image
                      href={thumb}
                      x={c.photo.cx - c.photo.r}
                      y={c.photo.cy - c.photo.r}
                      width={c.photo.r * 2}
                      height={c.photo.r * 2}
                      clipPath={`url(#clip-${n.id})`}
                      preserveAspectRatio="xMidYMid slice"
                      data-testid={`tree-photo-${n.id}`}
                    />
                  </>
                ) : (
                  <text x={c.photo.cx} y={c.photo.cy + 9} className="tree-default" aria-hidden>
                    {GENDER_ICON[p.gender]}
                  </text>
                )}
              </g>
            )}
            {c.lines.map((l, i) => (
              <text
                key={i}
                x={c.textX}
                y={c.nameY + i * LINE_H}
                className="tree-name"
                textAnchor={c.anchor}
              >
                {l}
              </text>
            ))}
            {years && (
              <text x={c.textX} y={c.yearsY} className="tree-years" textAnchor={c.anchor}>
                {years}
              </text>
            )}
            {badge && (
              <g
                className={`tree-badge${isMe ? ' me' : ''}`}
                transform="translate(10,-20)"
                data-testid={`badge-${n.id}`}
              >
                <rect width={badgeWidth(badge)} height={22} rx={11} />
                <text x={badgeWidth(badge) / 2} y={16} textAnchor="middle">
                  {badge}
                </text>
              </g>
            )}
            {n.hasChildren && (
              <g
                className="tree-toggle"
                transform={`translate(${CARD_W / 2},${CARD_H})`}
                data-testid={`toggle-${n.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(n.id);
                }}
              >
                {/* invisible 44 px hit area around the 22 px button */}
                <circle r={22} className="hit" />
                <circle r={11} />
                <text y={5}>{n.collapsed ? '+' : '−'}</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Width of a danh xưng label (13 px bold; Vietnamese letters are about 7.6 px wide). */
export function badgeWidth(text: string): number {
  return Math.round([...text].length * 7.6 + 18);
}
