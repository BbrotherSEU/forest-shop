import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { canStep, control, floorHeight } from "../game/control.ts"
import { useShop } from "../game/store.ts"
import { pandaMotion, ShopPanda } from "./animals.tsx"
import { NameTag } from "./label.tsx"
import { pick } from "./pick.ts"

const roamSpeed = 0.8
const returnSpeed = 1.85

/** 收银台里侧的座位。柜台组旋转 90° 后，这个点在柜台后面、面向顾客。 */
const post = { x: -4.67, y: 0.48, z: 4.4, yaw: Math.PI / 2 }

/** 从柜台南侧绕进去，离门口远一点。 */
const southGate = { x: -2.45, z: 2.7 }
const behind = { x: -5.25, z: 2.7 }

/** 比房间边界再缩一圈，避免贴到门口和墙外。 */
const room = { minX: -5.85, maxX: 5.85, minZ: -4.4, maxZ: 5.45 }

function clampRoom(x: number, z: number) {
  return {
    x: Math.min(room.maxX, Math.max(room.minX, x)),
    z: Math.min(room.maxZ, Math.max(room.minZ, z)),
  }
}

function approachPoint(x: number, z: number) {
  if (Math.hypot(post.x - x, post.z - z) < 0.4 && x < -4.2) return { point: post, allow: true }
  if (x > 1.15 && z > 1.85 && z < 3.95) {
    return { point: { x, z: z > 2.9 ? 4.2 : 1.55 }, allow: false }
  }
  if (x > 1.15) return { point: { x: 0.35, z: Math.min(Math.max(z, 1.6), 4.5) }, allow: false }
  if (x > -2.2 || z > 3.2) return { point: southGate, allow: false }
  if (x > behind.x + 0.2) return { point: behind, allow: false }
  return { point: post, allow: true }
}

const stops = [
  { x: -1.6, z: 1.8 },
  { x: -2.2, z: 3.4 },
  { x: -0.4, z: 4.7 },
  { x: 2.4, z: 4.5 },
  { x: 4.6, z: 4.35 },
  { x: 0.6, z: 4.2 },
  { x: 0.2, z: 2.0 },
]

function inNook(x: number, z: number) {
  return x < -3.85 && x > -5.55 && z > 3.65 && z < 5.4
}

function tryMove(fromX: number, fromZ: number, toX: number, toZ: number, allowBlocked: boolean) {
  const goal = clampRoom(toX, toZ)
  if (allowBlocked || canStep(fromX, fromZ, goal.x, goal.z)) return goal
  const slideX = clampRoom(toX, fromZ)
  if (canStep(fromX, fromZ, slideX.x, slideX.z)) return slideX
  const slideZ = clampRoom(fromX, toZ)
  if (canStep(fromX, fromZ, slideZ.x, slideZ.z)) return slideZ
  return null
}

export function Clerk() {
  const root = useRef<Group>(null)
  const place = useShop((state) => state.place)
  const pose = useRef({ x: stops[0].x, z: stops[0].z, yaw: 0, y: floorHeight(stops[0].x, stops[0].z) })
  const goal = useRef<(typeof stops)[number] | null>(null)
  const pause = useRef(0.8)
  const stopIndex = useRef(0)
  const settled = useRef(false)
  const committed = useRef(false)

  useFrame((_, delta) => {
    if (place !== "inside") return
    const group = root.current
    if (!group) return
    const mode = useShop.getState().clerk
    const talking = useShop.getState().clerkTalk
    let moving = false

    if (talking) {
      if (mode === "counter") {
        pose.current.x = post.x
        pose.current.z = post.z
        settled.current = true
      }
      const faceX = control.x - pose.current.x
      const faceZ = control.z - pose.current.z
      if (Math.hypot(faceX, faceZ) > 0.08) pose.current.yaw = Math.atan2(faceX, faceZ)
    } else if (mode === "counter") {
      pose.current.x = post.x
      pose.current.z = post.z
      pose.current.yaw = post.yaw
      settled.current = true
    } else if (mode === "coming") {
      const dx = post.x - pose.current.x
      const dz = post.z - pose.current.z
      const distance = Math.hypot(dx, dz)
      if (distance < 0.14) {
        pose.current.x = post.x
        pose.current.z = post.z
        pose.current.yaw = post.yaw
        if (!settled.current) {
          settled.current = true
          useShop.getState().clerkArrived()
        }
      } else {
        settled.current = false
        if (pose.current.x < -5.0 && pose.current.z < 3.4 && pose.current.z > 2.2) committed.current = true
        const heading = committed.current
          ? { point: post, allow: true }
          : approachPoint(pose.current.x, pose.current.z)
        const gx = heading.point.x - pose.current.x
        const gz = heading.point.z - pose.current.z
        const gateDistance = Math.hypot(gx, gz)
        if (gateDistance > 0.001) {
          const step = Math.min(gateDistance, returnSpeed * delta)
          const nx = pose.current.x + (gx / gateDistance) * step
          const nz = pose.current.z + (gz / gateDistance) * step
          const next = tryMove(pose.current.x, pose.current.z, nx, nz, heading.allow)
          if (next) {
            pose.current.x = next.x
            pose.current.z = next.z
            pose.current.yaw = Math.atan2(gx, gz)
            moving = true
          }
        }
      }
    } else {
      settled.current = false
      committed.current = false
      pause.current -= delta
      if (inNook(pose.current.x, pose.current.z)) {
        const dx = behind.x - pose.current.x
        const dz = behind.z - pose.current.z
        const distance = Math.hypot(dx, dz)
        if (distance > 0.08) {
          const step = Math.min(distance, returnSpeed * delta)
          const next = clampRoom(pose.current.x + (dx / distance) * step, pose.current.z + (dz / distance) * step)
          pose.current.x = next.x
          pose.current.z = next.z
          pose.current.yaw = Math.atan2(dx, dz)
          moving = true
        }
      } else if (pause.current <= 0) {
        if (!goal.current) {
          stopIndex.current = (stopIndex.current + 1) % stops.length
          goal.current = stops[stopIndex.current]
        }
        const nextStop = goal.current
        const dx = nextStop.x - pose.current.x
        const dz = nextStop.z - pose.current.z
        const distance = Math.hypot(dx, dz)
        if (distance < 0.16) {
          goal.current = null
          pause.current = 1.6 + Math.random() * 1.8
        } else {
          const step = Math.min(distance, roamSpeed * delta)
          const nx = pose.current.x + (dx / distance) * step
          const nz = pose.current.z + (dz / distance) * step
          const moved = tryMove(pose.current.x, pose.current.z, nx, nz, false)
          if (moved && (moved.x !== pose.current.x || moved.z !== pose.current.z)) {
            pose.current.yaw = Math.atan2(moved.x - pose.current.x, moved.z - pose.current.z)
            pose.current.x = moved.x
            pose.current.z = moved.z
            moving = true
          } else {
            goal.current = null
            pause.current = 0.45
          }
        }
      }
    }

    const kept = clampRoom(pose.current.x, pose.current.z)
    if (mode !== "counter") {
      pose.current.x = kept.x
      pose.current.z = kept.z
    }
    const onDuty = mode === "counter" || (mode === "coming" && Math.hypot(post.x - pose.current.x, post.z - pose.current.z) < 0.2)
    const targetY = onDuty ? post.y : floorHeight(pose.current.x, pose.current.z)
    pose.current.y += (targetY - pose.current.y) * Math.min(1, delta * 6)
    pandaMotion.moving = moving
    group.position.set(pose.current.x, pose.current.y, pose.current.z)
    group.rotation.y = pose.current.yaw
  })

  return (
    <group ref={root} position={[stops[0].x, 0, stops[0].z]}>
      <group
        {...pick((event) => {
          event.stopPropagation()
          useShop.getState().openClerkTalk()
        })}
      >
        <ShopPanda />
      </group>
      <NameTag text="收银员" position={[0, 1.68, 0]} />
    </group>
  )
}
