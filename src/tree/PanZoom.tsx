import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react';

export interface PanZoomHandle {
  fit: () => void;
  zoomBy: (factor: number) => void;
  centerOn: (x: number, y: number, scale?: number) => void;
}

interface View {
  s: number;
  x: number;
  y: number;
}

const MIN = 0.08;
const MAX = 3;
const clamp = (s: number) => Math.min(MAX, Math.max(MIN, s));

/**
 * Drag to pan, pinch (two fingers) or wheel to zoom. Taps still reach the content;
 * a click that ends a drag is swallowed so panning never opens a card by accident.
 */
export function PanZoom({
  width,
  height,
  children,
  handleRef,
  initial,
}: {
  width: number;
  height: number;
  children: ReactNode;
  handleRef?: Ref<PanZoomHandle>;
  initial?: { x: number; y: number } | null;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ s: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; moved: number } | null>(null);
  const suppressClick = useRef(false);

  const size = () => {
    const r = box.current?.getBoundingClientRect();
    return { w: r?.width ?? 1, h: r?.height ?? 1, left: r?.left ?? 0, top: r?.top ?? 0 };
  };

  const fit = useCallback(() => {
    const { w, h } = size();
    const s = clamp(Math.min(w / width, h / height, 1.2));
    setView({ s, x: (w - width * s) / 2, y: Math.max(0, (h - height * s) / 2) });
  }, [width, height]);

  const zoomAt = (factor: number, cx: number, cy: number) =>
    setView((v) => {
      const s = clamp(v.s * factor);
      const k = s / v.s;
      return { s, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k };
    });

  const centerOn = useCallback((x: number, y: number, scale?: number) => {
    const { w, h } = size();
    setView((v) => {
      const s = clamp(scale ?? Math.max(v.s, 0.9));
      return { s, x: w / 2 - x * s, y: h / 2 - y * s };
    });
  }, []);

  useImperativeHandle(handleRef, () => ({
    fit,
    zoomBy: (f: number) => {
      const { w, h } = size();
      zoomAt(f, w / 2, h / 2);
    },
    centerOn,
  }));

  // initial view: centre on a person if asked, otherwise show the whole tree
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (initial) centerOn(initial.x, initial.y, 1);
    else fit();
  }, [fit, centerOn, initial]);

  useEffect(() => {
    const el = box.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { left, top } = size();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - left, e.clientY - top);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) gesture.current = { dist: 0, moved: 0 };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), moved: 99 };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev || !gesture.current) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);
    if (pointers.current.size === 1) {
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      gesture.current.moved += Math.abs(dx) + Math.abs(dy);
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const { left, top } = size();
      if (gesture.current.dist > 0)
        zoomAt(dist / gesture.current.dist, (a.x + b.x) / 2 - left, (a.y + b.y) / 2 - top);
      gesture.current.dist = dist;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (gesture.current && gesture.current.moved > 8) suppressClick.current = true;
    if (pointers.current.size === 0) gesture.current = null;
  };

  return (
    <div
      ref={box}
      className="panzoom"
      data-testid="panzoom"
      data-scale={view.s.toFixed(3)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          e.stopPropagation();
          suppressClick.current = false;
        }
      }}
    >
      <div
        className="panzoom-content"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }}
      >
        {children}
      </div>
    </div>
  );
}
