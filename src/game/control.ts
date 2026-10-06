/** Player pose shared with the camera. The map never rotates; only this point moves. */
export const control = {
  x: 0,
  z: 4.55,
  yaw: Math.PI,
  moving: false,
  target: null as { x: number; z: number } | null,
}

export const counterSpot = { x: -3.15, z: 4.45 }

/** Top-left raised floor, about a quarter of the room. Steps run along its south and east edges. */
export const platform = {
  height: 0.42,
  minX: -6.22,
  maxX: 0.12,
  minZ: -4.72,
  maxZ: 0.72,
  tread: 0.38,
  treads: 3,
}

export function stepReach() {
  return {
    footX: platform.maxX + platform.tread * platform.treads,
    footZ: platform.maxZ + platform.tread * platform.treads,
  }
}

/** Where the player stands, frozen, while that cabinet is open. */
export const cabinetStand = {
  blue: { x: 3.95, z: -2.78, yaw: 1.0 },
  wood: { x: 1.55, z: -2.45, yaw: Math.PI },
}

export const cabinetCamera = {
  blue: { at: [1.7, 1.42, -1.35] as [number, number, number], look: [5.9, 1.12, -1.55] as [number, number, number] },
  wood: { at: [5.5, 2.15, -0.35] as [number, number, number], look: [2.9, 1.15, -3.3] as [number, number, number] },
}

export interface Block {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export const bounds = { minX: -6.35, maxX: 6.35, minZ: -4.85, maxZ: 6.15 }

export const obstacles: Block[] = [
  { minX: -4.5, maxX: -3.6, minZ: 3.55, maxZ: 5.35 },
  { minX: -5.15, maxX: -4.15, minZ: 4.0, maxZ: 4.95 },
  { minX: -4.7, maxX: -1.4, minZ: -2.7, maxZ: -1.3 },
  { minX: 1.85, maxX: 3.85, minZ: -0.7, maxZ: 1.4 },
  { minX: 1.6, maxX: 5.1, minZ: 2.3, maxZ: 3.45 },
  { minX: 2.05, maxX: 4.95, minZ: -4.78, maxZ: -3.9 },
  { minX: 5.4, maxX: 6.25, minZ: -2.8, maxZ: -0.2 },
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

export function onPlatform(x: number, z: number) {
  return x >= platform.minX && x <= platform.maxX && z >= platform.minZ && z <= platform.maxZ
}

export function onSteps(x: number, z: number) {
  const { footX, footZ } = stepReach()
  const south = x >= platform.minX - 0.04 && x <= footX && z > platform.maxZ && z < footZ
  const east = z >= platform.minZ - 0.04 && z <= platform.maxZ && x > platform.maxX && x < footX
  const corner = x > platform.maxX && x < footX && z > platform.maxZ && z < footZ
  return south || east || corner
}

/** 0 on the shop tiles, platform.height on the raised corner, a ramp across the steps. */
export function floorHeight(x: number, z: number) {
  if (z <= bounds.minZ || z >= bounds.maxZ || Math.abs(x) >= 6.5) return 0
  if (onPlatform(x, z)) return platform.height
  if (!onSteps(x, z)) return 0
  const { footX, footZ } = stepReach()
  const southT = z <= platform.maxZ ? 1 : Math.min(1, Math.max(0, (footZ - z) / (footZ - platform.maxZ)))
  const eastT = x <= platform.maxX ? 1 : Math.min(1, Math.max(0, (footX - x) / (footX - platform.maxX)))
  if (z > platform.maxZ && x > platform.maxX) return platform.height * Math.min(southT, eastT)
  if (z > platform.maxZ) return platform.height * southT
  return platform.height * eastT
}

export function nearestFree(x: number, z: number) {
  if (insideRoom(x, z) && !hitsObstacle(x, z)) return { x, z }
  for (let ring = 1; ring <= 14; ring += 1) {
    const distance = ring * 0.16
    for (let step = 0; step < 12; step += 1) {
      const angle = (step / 12) * Math.PI * 2
      const nx = x + Math.cos(angle) * distance
      const nz = z + Math.sin(angle) * distance
      if (insideRoom(nx, nz) && !hitsObstacle(nx, nz)) return { x: nx, z: nz }
    }
  }
  return { x: 0.4, z: 4.2 }
}

export function canStep(fromX: number, fromZ: number, toX: number, toZ: number) {
  if (!insideRoom(toX, toZ) || hitsObstacle(toX, toZ)) return false
  const rise = Math.abs(floorHeight(toX, toZ) - floorHeight(fromX, fromZ))
  if (rise > 0.18 && !onSteps(fromX, fromZ) && !onSteps(toX, toZ)) return false
  return true
}
