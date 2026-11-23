import type { People } from '../data/people';
import { lifespan } from '../data/people';
import { CARD_H, CARD_W, wrapName, type TreeLayout } from './layout';

/** Draws a laid-out tree. Colours come from CSS classes (see .tree-* in styles.css). */
export function TreeSvg({
  layout,
  people,
  focusId,
  onSelect,
  onToggle,
}: {
  layout: TreeLayout;
  people: People;
  focusId?: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}) {
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
        const lines = wrapName(p.name);
        const years = lifespan(p);
        const textTop = years ? (lines.length === 1 ? 26 : 19) : lines.length === 1 ? 37 : 28;
        return (
          <g
            key={n.id}
            transform={`translate(${n.x},${n.y})`}
            className={`tree-card g-${p.gender}${p.deceased ? ' dead' : ''}${n.inLaw ? ' inlaw' : ''}${focusId === n.id ? ' focus' : ''}`}
            data-testid={`card-${n.id}`}
            onClick={() => onSelect(n.id)}
          >
            <rect width={CARD_W} height={CARD_H} rx={12} />
            {lines.map((l, i) => (
              <text key={i} x={CARD_W / 2} y={textTop + i * 17} className="tree-name">
                {l}
              </text>
            ))}
            {years && (
              <text x={CARD_W / 2} y={textTop + lines.length * 17 + 1} className="tree-years">
                {years}
              </text>
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
