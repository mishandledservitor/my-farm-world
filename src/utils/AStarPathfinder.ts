export interface TilePos {
  x: number;
  y: number;
}

export type WalkabilityFn = (x: number, y: number) => boolean;

interface AStarNode {
  x: number;
  y: number;
  g: number; // cost from start
  h: number; // heuristic to goal
  f: number; // g + h
  parent: AStarNode | null;
}

const MAX_PATH_LENGTH = 150;

// 4-directional neighbors (no diagonal — matches 4-direction sprite animations)
const NEIGHBORS = [
  { dx: 0, dy: -1 }, // north
  { dx: 1, dy:  0 }, // east
  { dx: 0, dy:  1 }, // south
  { dx: -1, dy: 0 }, // west
];

function heuristic(ax: number, ay: number, bx: number, by: number): number {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function nodeKey(x: number, y: number): number {
  // Pack two 16-bit ints into a 32-bit int for fast Map lookups
  return (x << 16) | (y & 0xFFFF);
}

export function findPath(
  isWalkable: WalkabilityFn,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): TilePos[] {
  // Already there
  if (fromX === toX && fromY === toY) return [];

  // Destination is not walkable — try to get as close as possible
  // (caller handles this gracefully)
  if (!isWalkable(toX, toY)) {
    // Find nearest walkable neighbor of destination
    let closest: TilePos | null = null;
    let closestDist = Infinity;
    for (const { dx, dy } of NEIGHBORS) {
      const nx = toX + dx;
      const ny = toY + dy;
      if (isWalkable(nx, ny)) {
        const d = heuristic(fromX, fromY, nx, ny);
        if (d < closestDist) {
          closestDist = d;
          closest = { x: nx, y: ny };
        }
      }
    }
    if (!closest) return [];
    toX = closest.x;
    toY = closest.y;
  }

  const openSet: AStarNode[] = [];
  const openMap = new Map<number, AStarNode>(); // key → node (for quick lookup)
  const closedSet = new Set<number>();

  const startNode: AStarNode = {
    x: fromX, y: fromY,
    g: 0,
    h: heuristic(fromX, fromY, toX, toY),
    f: heuristic(fromX, fromY, toX, toY),
    parent: null,
  };
  openSet.push(startNode);
  openMap.set(nodeKey(fromX, fromY), startNode);

  while (openSet.length > 0) {
    // Find node with lowest f (simple linear scan — fine for small farm grids)
    let lowestIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIdx].f) lowestIdx = i;
    }
    const current = openSet[lowestIdx];
    openSet.splice(lowestIdx, 1);
    openMap.delete(nodeKey(current.x, current.y));

    const currentKey = nodeKey(current.x, current.y);
    if (closedSet.has(currentKey)) continue;
    closedSet.add(currentKey);

    // Goal reached
    if (current.x === toX && current.y === toY) {
      return reconstructPath(current);
    }

    // Bail if path would be absurdly long
    if (current.g >= MAX_PATH_LENGTH) continue;

    for (const { dx, dy } of NEIGHBORS) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      const nKey = nodeKey(nx, ny);

      if (closedSet.has(nKey)) continue;
      if (!isWalkable(nx, ny)) continue;

      const g = current.g + 1;
      const h = heuristic(nx, ny, toX, toY);
      const f = g + h;

      const existing = openMap.get(nKey);
      if (existing && existing.g <= g) continue;

      const neighbor: AStarNode = { x: nx, y: ny, g, h, f, parent: current };
      openSet.push(neighbor);
      openMap.set(nKey, neighbor);
    }
  }

  return []; // No path found
}

function reconstructPath(node: AStarNode): TilePos[] {
  const path: TilePos[] = [];
  let current: AStarNode | null = node;
  while (current !== null && current.parent !== null) {
    path.unshift({ x: current.x, y: current.y });
    current = current.parent;
  }
  return path;
}
