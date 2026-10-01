/** Player pose shared with the camera. The map never rotates; only this point moves. */
export const control = {
  x: 0,
  z: 4.6,
  yaw: Math.PI,
  target: null as { x: number; z: number } | null,
}

export interface Block {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export const bounds = { minX: -6.35, maxX: 6.35, minZ: -4.85, maxZ: 6.15 }

export const obstacles: Block[] = [
  { minX: 3.3, maxX: 6.05, minZ: 1.55, maxZ: 3.15 },
  { minX: -4.9, maxX: -2.1, minZ: -4.65, maxZ: -3.65 },
  { minX: 1.8, maxX: 4.5, minZ: -2.15, maxZ: -1.3 },
  { minX: -5.25, maxX: -4.15, minZ: 3.05, maxZ: 4.05 },
  { minX: -5.05, maxX: -3.55, minZ: 1.75, maxZ: 2.55 },
]

const radius = 0.32

export function hitsObstacle(x: number, z: number) {
  return obstacles.some(
    (box) => x > box.minX - radius && x < box.maxX + radius && z > box.minZ - radius && z < box.maxZ + radius,
  )
}

export function insideRoom(x: number, z: number) {
  return x > bounds.minX && x < bounds.maxX && z > bounds.minZ && z < bounds.maxZ
}

export function onSteps(x: number, z: number) {
  return Math.abs(x) < 2.15 && z > -0.05 && z < 1.55
}

/** 0 on the checkered floor, 0.5 on the wooden stage, a ramp on the steps. */
export function floorHeight(x: number, z: number) {
  if (onSteps(x, z)) {
    const t = (1.45 - z) / 1.4
    return 0.5 * Math.min(1, Math.max(0, t))
  }
  if (z <= 0.05 && z > bounds.minZ && Math.abs(x) < 6.5) return 0.5
  return 0
}

export function canStep(fromX: number, fromZ: number, toX: number, toZ: number) {
  if (!insideRoom(toX, toZ) || hitsObstacle(toX, toZ)) return false
  const rise = Math.abs(floorHeight(toX, toZ) - floorHeight(fromX, fromZ))
  if (rise > 0.18 && !onSteps(fromX, fromZ) && !onSteps(toX, toZ)) return false
  return true
}
