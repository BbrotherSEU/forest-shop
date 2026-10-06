import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { cabinetStand, canStep, control, floorHeight, hitsObstacle, nearestFree } from "../game/control.ts"
import { avatarLabel, useShop } from "../game/store.ts"
import { Kirby, Raccoon, RedPanda } from "./animals.tsx"
import { NameTag } from "./label.tsx"

const keys = new Set<string>()

export function Player() {
  const root = useRef<Group>(null)
  const body = useRef<Group>(null)
  const place = useShop((state) => state.place)
  const avatar = useShop((state) => state.avatar)
  const student = useShop((state) => state.student)
  const cabinet = useShop((state) => state.cabinet)
  const name = student?.name || avatarLabel(avatar)

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (isMoveKey(event.key)) {
        keys.add(event.key)
        control.target = null
        event.preventDefault()
      }
    }
    const up = (event: KeyboardEvent) => {
      keys.delete(event.key)
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      keys.clear()
      control.moving = false
    }
  }, [])

  useFrame((state, delta) => {
    if (place !== "inside") return
    const group = root.current
    const bob = body.current
    if (!group || !bob) return

    if (cabinet) {
      const spot = cabinetStand[cabinet]
      control.x = spot.x
      control.z = spot.z
      control.yaw = spot.yaw
      control.target = null
      control.moving = false
      group.position.set(spot.x, floorHeight(spot.x, spot.z), spot.z)
      group.rotation.y = spot.yaw
      bob.position.y = 0
      return
    }

    if (hitsObstacle(control.x, control.z)) {
      const free = nearestFree(control.x, control.z)
      control.x = free.x
      control.z = free.z
      control.target = null
    }

    let dx = 0
    let dz = 0
    if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) dz -= 1
    if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) dz += 1
    if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) dx -= 1
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx += 1

    const speed = 3.3
    if (dx !== 0 || dz !== 0) {
      const length = Math.hypot(dx, dz)
      dx = (dx / length) * speed * delta
      dz = (dz / length) * speed * delta
      control.target = null
    } else if (control.target) {
      const tx = control.target.x - control.x
      const tz = control.target.z - control.z
      const distance = Math.hypot(tx, tz)
      if (distance < 0.12) {
        control.target = null
      } else {
        const step = Math.min(distance, speed * delta)
        dx = (tx / distance) * step
        dz = (tz / distance) * step
      }
    }

    if (dx !== 0 || dz !== 0) {
      const nextX = control.x + dx
      const nextZ = control.z + dz
      if (canStep(control.x, control.z, nextX, nextZ)) {
        control.x = nextX
        control.z = nextZ
      } else if (canStep(control.x, control.z, nextX, control.z)) {
        control.x = nextX
      } else if (canStep(control.x, control.z, control.x, nextZ)) {
        control.z = nextZ
      }
      if (Math.hypot(dx, dz) > 0.001) control.yaw = Math.atan2(dx, dz)
    }

    const moving = dx !== 0 || dz !== 0
    control.moving = moving
    group.position.set(control.x, floorHeight(control.x, control.z), control.z)
    group.rotation.y = control.yaw
    bob.position.y = avatar === "pink" || !moving ? 0 : Math.abs(Math.sin(state.clock.elapsedTime * 11)) * 0.05
  })

  return (
    <group ref={root} position={[0, 0, 4.55]} rotation={[0, Math.PI, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.16} />
      </mesh>
      <group ref={body} scale={1.12}>
        {avatar === "panda" ? <RedPanda animate satchel /> : avatar === "raccoon" ? <Raccoon animate satchel /> : <Kirby animate />}
      </group>
      <NameTag text={name} position={[0, avatar === "pink" ? 2.05 : 2.28, 0]} />
    </group>
  )
}

function isMoveKey(key: string) {
  return key.startsWith("Arrow") || key === "w" || key === "a" || key === "s" || key === "d" || key === "W" || key === "A" || key === "S" || key === "D"
}

export function WalkMarker() {
  const ref = useRef<Group>(null)
  useFrame(() => {
    const group = ref.current
    if (!group) return
    const target = control.target
    group.visible = target !== null
    if (!target) return
    group.position.set(target.x, floorHeight(target.x, target.z) + 0.04, target.z)
  })
  return (
    <group ref={ref}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.28, 24]} />
        <meshBasicMaterial color="#fff4ea" />
      </mesh>
    </group>
  )
}
