import { Box3, Mesh, Ray, Triangle, Vector3, type Object3D } from "three";
import { Octree } from "three/addons/math/Octree.js";

const down = new Vector3(0, -1, 0);
const spacing = .48;
const radius = .27;
const probeHeights = [.27, .95, 1.52];
const probeOffsets = [-.17, 0, .17];

export function isGalleryFloor(name: string) {
  return /^(floor|stairs)_/i.test(name);
}

export function createGalleryNavigation(building: Object3D) {
  const floors = new Octree();
  const blockers = new Octree();
  blockers.maxLevel = 7;
  floors.maxLevel = 6;
  building.updateWorldMatrix(true, true);
  building.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const floor = isGalleryFloor(object.name);
    if (!floor && !/^(walls_|ceiling_|Window_details_|Doors_details_|corner_details_|chairs_|stand_|Statue_|tree)/i.test(object.name)) return;
    const tree = floor ? floors : blockers;
    const positions = object.geometry.getAttribute("position");
    const indices = object.geometry.getIndex();
    const vertex = (index: number) => new Vector3().fromBufferAttribute(positions, indices?.getX(index) ?? index)
      .applyMatrix4(object.matrixWorld);
    for (let index = 0; index < (indices?.count ?? positions.count); index += 3) {
      tree.addTriangle(new Triangle(vertex(index), vertex(index + 1), vertex(index + 2)));
    }
  });
  floors.build();
  blockers.build();
  const bounds = floors.bounds;
  const ray = new Ray();
  const rayBounds = new Box3();
  const rayEnd = new Vector3();
  const hitPoint = new Vector3();
  const triangles: Triangle[] = [];
  const origin = new Vector3();
  const direction = new Vector3();
  const sample = new Vector3();
  const cursor = new Vector3();
  const candidate = new Vector3();
  const seamProbe = new Vector3();

  function hit(tree: Octree, from: Vector3, along: Vector3, distance: number) {
    ray.set(from, along);
    rayEnd.copy(from).addScaledVector(along, distance);
    rayBounds.makeEmpty().expandByPoint(from).expandByPoint(rayEnd).expandByScalar(.00001);
    triangles.length = 0;
    tree.getBoxTriangles(rayBounds, triangles);
    let nearest = Infinity;
    for (const { a, b, c } of triangles) {
      const point = ray.intersectTriangle(a, b, c, false, hitPoint);
      if (!point) continue;
      const delta = point.distanceToSquared(from);
      if (delta < nearest) nearest = delta;
    }
    return nearest <= distance * distance ? Math.sqrt(nearest) : undefined;
  }

  function floorAt(point: Vector3, above: number, range: number) {
    origin.set(point.x, point.y + above, point.z);
    const distance = hit(floors, origin, down, range);
    return distance === undefined ? undefined : origin.y - distance;
  }

  function step(from: Vector3, to: Vector3) {
    direction.set(to.x - from.x, 0, to.z - from.z);
    const distance = direction.length();
    const floor = floorAt(to, .32, .67);
    if (distance < .0001) return floor;
    direction.divideScalar(distance);
    // The gallery export leaves a narrow gap between the separate upper floor and stairs meshes.
    if (floor === undefined) {
      seamProbe.copy(to).addScaledVector(direction, .085);
      if (floorAt(seamProbe, .32, .67) === undefined) return undefined;
    }
    const nextY = floor ?? from.y;
    const blocked = probeHeights.some((height) => probeOffsets.some((offset) => {
      origin.set(from.x + direction.z * offset, Math.max(from.y, nextY) + height, from.z - direction.x * offset);
      return hit(blockers, origin, direction, distance + radius) !== undefined;
    }));
    return blocked ? undefined : nextY;
  }

  function canWalk(from: Vector3, to: Vector3) {
    const count = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.z - from.z) / .028));
    cursor.copy(from);
    for (let index = 1; index <= count; index++) {
      const ratio = index / count;
      sample.set(from.x + (to.x - from.x) * ratio, cursor.y, from.z + (to.z - from.z) * ratio);
      const floor = step(cursor, sample);
      if (floor === undefined) return false;
      cursor.set(sample.x, floor, sample.z);
    }
    return Math.abs(cursor.y - to.y) < .2;
  }

  const columns = Math.ceil((bounds.max.x - bounds.min.x) / spacing);
  const rows = Math.ceil((bounds.max.z - bounds.min.z) / spacing);
  const nodes = new Map<number, Vector3 | null>();
  const neighbors = new Map<number, number[]>();
  function nodeAt(index: number) {
    if (index < 0 || index >= columns * rows) return null;
    if (nodes.has(index)) return nodes.get(index) ?? null;
    candidate.set(bounds.min.x + (index % columns + .5) * spacing, bounds.max.y,
      bounds.min.z + (Math.floor(index / columns) + .5) * spacing);
    const floor = floorAt(candidate, .1, bounds.max.y - bounds.min.y + .2);
    const node = floor === undefined ? null : new Vector3(candidate.x, floor, candidate.z);
    nodes.set(index, node);
    return node;
  }

  function nearby(point: Vector3) {
    const column = Math.floor((point.x - bounds.min.x) / spacing);
    const row = Math.floor((point.z - bounds.min.z) / spacing);
    const nearbyNodes: { index: number; point: Vector3 }[] = [];
    for (let z = Math.max(0, row - 2); z <= Math.min(rows - 1, row + 2); z++) {
      for (let x = Math.max(0, column - 2); x <= Math.min(columns - 1, column + 2); x++) {
        const index = z * columns + x;
        const node = nodeAt(index);
        if (node && Math.abs(node.y - point.y) < .35) nearbyNodes.push({ index, point: node });
      }
    }
    return nearbyNodes.sort((a, b) => a.point.distanceToSquared(point) - b.point.distanceToSquared(point));
  }

  function links(index: number, from: Vector3) {
    const cached = neighbors.get(index);
    if (cached) return cached;
    const column = index % columns;
    const edges = [
      ...(column > 0 ? [index - 1] : []), ...(column < columns - 1 ? [index + 1] : []),
      index - columns, index + columns,
    ].filter((next) => {
      const node = nodeAt(next);
      return node && canWalk(from, node);
    });
    neighbors.set(index, edges);
    return edges;
  }

  function findPath(from: Vector3, target: Vector3): Vector3[] {
    if (canWalk(from, target)) return [target.clone()];
    const starts = nearby(from).filter((node) => canWalk(from, node.point));
    const ends = nearby(target).filter((node) => canWalk(node.point, target));
    const goals = new Set((ends.length ? ends : nearby(target).slice(0, 4)).map(({ index }) => index));
    if (!starts.length || !goals.size) return [];
    const parents = new Map<number, number>();
    const costs = new Map(starts.map(({ index, point }) => [index, point.distanceTo(from)]));
    const open = new Set(costs.keys());

    while (open.size) {
      let index = -1;
      let estimate = Infinity;
      for (const next of open) {
        const score = costs.get(next)! + nodeAt(next)!.distanceTo(target);
        if (score < estimate) {
          index = next;
          estimate = score;
        }
      }
      const node = nodeAt(index)!;
      if (goals.has(index)) {
        const path = ends.length ? [target.clone()] : [];
        for (let next: number | undefined = index; next !== undefined; next = parents.get(next)) {
          path.push(nodeAt(next)!);
        }
        path.reverse();
        const shortcuts: Vector3[] = [];
        for (let point = from, start = 0; start < path.length;) {
          let next = path.length - 1;
          while (next > start && !canWalk(point, path[next])) next--;
          point = path[next];
          shortcuts.push(point);
          start = next + 1;
        }
        return shortcuts;
      }

      open.delete(index);
      for (const next of links(index, node)) {
        const cost = costs.get(index)! + nodeAt(next)!.distanceTo(node);
        if (cost >= (costs.get(next) ?? Infinity)) continue;
        parents.set(next, index);
        costs.set(next, cost);
        open.add(next);
      }
    }
    return [];
  }

  return {
    floorAt, step, findPath,
    cameraDistance: (from: Vector3, along: Vector3, distance: number) => {
      const nearest = Math.min(hit(floors, from, along, distance) ?? Infinity, hit(blockers, from, along, distance) ?? Infinity);
      return Number.isFinite(nearest) ? nearest : undefined;
    },
  };
}
