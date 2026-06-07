'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { masteryColorClass, masteryTextClass, nodeAriaLabel } from './shared';

export interface GraphNode {
  id: string;
  name: string;
  mastery: number;
  isWeak?: boolean;
  subject?: string;
  group?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges?: GraphEdge[];
  className?: string;
  width?: number;
  height?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;
const MAX_NODES = 60;

interface PositionedNode extends GraphNode {
  x: number;
  y: number;
}

function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  for (const item of arr) {
    const k = keyFn(item);
    if (!map[k]) map[k] = [];
    map[k].push(item);
  }
  return map;
}

/** Precompute radial-ish positions without physics. Groups fan out from center. */
function computePositions(nodes: GraphNode[], width: number, height: number): PositionedNode[] {
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.38;

  const groups = groupBy(nodes, (n) => n.group || n.subject || 'General');
  const groupKeys = Object.keys(groups);

  const out: PositionedNode[] = [];

  if (groupKeys.length === 1) {
    // Single group: spiral layout
    const groupNodes = groups[groupKeys[0]];
    const count = groupNodes.length;
    groupNodes.forEach((node, i) => {
      const angle = i * 2.4; // golden angle-ish
      const r = Math.sqrt((i + 1) / count) * maxR;
      out.push({
        ...node,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      });
    });
  } else {
    // Multiple groups: each group gets a sector
    groupKeys.forEach((groupKey, gi) => {
      const groupNodes = groups[groupKey];
      const sectorAngle = (2 * Math.PI) / groupKeys.length;
      const sectorStart = gi * sectorAngle - Math.PI / 2;

      groupNodes.forEach((node, i) => {
        const frac = groupNodes.length > 1 ? i / (groupNodes.length - 1) : 0.5;
        const angle = sectorStart + frac * sectorAngle * 0.7 + sectorAngle * 0.15;
        const r = maxR * (0.3 + 0.7 * Math.sqrt((i + 1) / groupNodes.length));
        out.push({
          ...node,
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
        });
      });
    });
  }

  return out;
}

function deriveEdges(nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const byGroup = groupBy(nodes, (n) => n.group || n.subject || 'General');

  for (const group of Object.values(byGroup)) {
    // Connect adjacent nodes within same group
    for (let i = 0; i < group.length - 1; i++) {
      edges.push({ source: group[i].id, target: group[i + 1].id });
    }
    // Connect weak nodes to their group neighbor
    const weakNodes = group.filter((n) => n.isWeak);
    for (const weak of weakNodes) {
      const neighbor = group.find((n) => n.id !== weak.id);
      if (neighbor && !edges.some((e) => e.source === weak.id && e.target === neighbor.id)) {
        edges.push({ source: weak.id, target: neighbor.id });
      }
    }
  }

  return edges.slice(0, 120); // cap edges for perf
}

export function KnowledgeGraph({
  nodes,
  edges: propEdges,
  className,
  width = 640,
  height = 400,
}: KnowledgeGraphProps) {
  const reduce = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dims, setDims] = React.useState({ width, height });

  // Responsive sizing
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setDims({ width: cr.width, height: Math.max(320, Math.min(520, cr.width * 0.65)) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visibleNodes = React.useMemo(
    () => nodes.slice(0, MAX_NODES),
    [nodes]
  );

  const positioned = React.useMemo(
    () => computePositions(visibleNodes, dims.width, dims.height),
    [visibleNodes, dims.width, dims.height]
  );

  const edges = React.useMemo(() => {
    if (propEdges && propEdges.length > 0) return propEdges.slice(0, 120);
    return deriveEdges(visibleNodes).slice(0, 120);
  }, [propEdges, visibleNodes]);

  const nodeMap = React.useMemo(() => {
    const map = new Map<string, PositionedNode>();
    for (const n of positioned) map.set(n.id, n);
    return map;
  }, [positioned]);

  if (nodes.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 py-8 text-center',
          className
        )}
      >
        <svg className="mb-2 size-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <circle cx="5" cy="5" r="2" />
          <circle cx="19" cy="5" r="2" />
          <circle cx="5" cy="19" r="2" />
          <circle cx="19" cy="19" r="2" />
          <path d="M12 9V5M9 12H5M15 12h4M12 15v4" />
        </svg>
        <p className="text-sm font-medium">No knowledge nodes yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Practice topics to build your knowledge graph.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delay={150}>
      <div ref={containerRef} className={cn('w-full', className)}>
        <div
          className="relative w-full overflow-hidden rounded-2xl border border-border/60 bg-card/30"
          style={{ height: dims.height }}
          role="img"
          aria-label={`Knowledge graph with ${positioned.length} topics`}
        >
          <svg
            width={dims.width}
            height={dims.height}
            className="absolute inset-0"
            role="presentation"
          >
            <defs>
              <linearGradient id="kg-edge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--brand-from)" stopOpacity="0.35" />
                <stop offset="50%" stopColor="var(--brand-via)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--brand-to)" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {edges.map((edge, i) => {
              const a = nodeMap.get(edge.source);
              const b = nodeMap.get(edge.target);
              if (!a || !b) return null;
              return (
                <motion.line
                  key={`${edge.source}-${edge.target}-${i}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="url(#kg-edge-grad)"
                  strokeWidth={1.5}
                  initial={reduce ? { opacity: 0.3 } : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.35 }}
                  transition={{
                    duration: reduce ? 0 : 0.8,
                    delay: i * 0.015,
                    ease: EASE,
                  }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {positioned.map((node, i) => {
            const size = node.isWeak ? 28 : 22;
            return (
              <Tooltip key={node.id}>
                <TooltipTrigger>
                  <motion.div
                    className={cn(
                      'absolute flex items-center justify-center rounded-full border-2 cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      node.mastery >= 80
                        ? 'border-success bg-success/20'
                        : node.mastery >= 50
                          ? 'border-warning bg-warning/20'
                          : 'border-destructive bg-destructive/20'
                    )}
                    style={{
                      width: size,
                      height: size,
                      left: node.x - size / 2,
                      top: node.y - size / 2,
                    }}
                    initial={reduce ? { opacity: 1 } : { scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: reduce ? 0 : 0.4,
                      delay: 0.3 + i * 0.02,
                      ease: EASE,
                    }}
                    role="listitem"
                    aria-label={nodeAriaLabel(node.name, node.mastery)}
                    tabIndex={0}
                  >
                    {node.isWeak && (
                      <span className="absolute inset-0 rounded-full animate-pulse-glow" />
                    )}
                    <span
                      className={cn(
                        'block rounded-full',
                        masteryColorClass(node.mastery)
                      )}
                      style={{ width: size * 0.4, height: size * 0.4 }}
                    />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span className="font-medium">{node.name}</span>
                  <span className={cn('ml-1.5 tabular-nums', masteryTextClass(node.mastery))}>
                    {Math.round(node.mastery)}%
                  </span>
                  {node.isWeak && (
                    <span className="ml-1.5 text-destructive">(Weak)</span>
                  )}
                  {node.subject && (
                    <span className="ml-1.5 text-muted-foreground">• {node.subject}</span>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg border border-border/50 bg-card/70 px-2.5 py-1.5 text-[10px]">
            <div className="flex items-center gap-1">
              <span className="block size-2 rounded-full bg-success" />
              <span className="text-muted-foreground">80%+</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="block size-2 rounded-full bg-warning" />
              <span className="text-muted-foreground">50-79%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="block size-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">&lt;50%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="block size-2 rounded-full border border-destructive bg-destructive/20 animate-pulse-glow" />
              <span className="text-muted-foreground">Weak</span>
            </div>
          </div>

          {/* Count badge */}
          <div className="absolute top-3 right-3 rounded-full border border-border/50 bg-card/70 px-2 py-0.5 text-[10px] text-muted-foreground">
            {positioned.length} topic{positioned.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
