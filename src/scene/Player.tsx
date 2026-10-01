import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { canStep, control, floorHeight } from "../game/control.ts"
import { useShop } from "../game/store.ts"
import { Toon } from "./Toon.tsx"

const keys = new Set<string>()

export function Player() {
  const root = useRef<Group>(null)
  const body = useRef<Group>(null)
  const place = useShop((state) => state.place)

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
    }
  }, [])

  useFrame((state, delta) => {
    if (place !== "inside") return
    const group = root.current
    const bob = body.current
    if (!group || !bob) return

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
    group.position.set(control.x, floorHeight(control.x, control.z), control.z)
    group.rotation.y = control.yaw
    const hop = moving ? Math.abs(Math.sin(state.clock.elapsedTime * 11)) * 0.08 : Math.sin(state.clock.elapsedTime * 2) * 0.02
    bob.position.y = hop
  })

  return (
    <group ref={root} position={[0, 0, 4.6]} rotation={[0, Math.PI, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[0.38, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.16} />
      </mesh>
      <group ref={body}>
        <mesh position={[-0.12, 0.28, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.18, 4, 8]} />
          <Toon color="#3d4c66" />
        </mesh>
        <mesh position={[0.12, 0.28, 0]} castShadow>
          <capsuleGeometry args={[0.08, 0.18, 4, 8]} />
          <Toon color="#3d4c66" />
        </mesh>
        <mesh position={[0, 0.78, 0]} castShadow>
          <capsuleGeometry args={[0.24, 0.34, 6, 10]} />
          <Toon color="#7ec8ff" />
        </mesh>
        <mesh position={[0, 0.86, -0.16]} castShadow>
          <boxGeometry args={[0.28, 0.3, 0.1]} />
          <Toon color="#f2c14e" />
        </mesh>
        <mesh position={[0, 1.28, 0]} castShadow>
          <sphereGeometry args={[0.22, 20, 20]} />
          <Toon color="#ffd7c2" />
        </mesh>
        <mesh position={[0, 1.4, -0.02]} scale={[1.05, 0.55, 1]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <Toon color="#3a2a22" />
        </mesh>
        <mesh position={[-0.07, 1.3, 0.18]}>
          <sphereGeometry args={[0.028, 10, 10]} />
          <Toon color="#24312c" />
        </mesh>
        <mesh position={[0.07, 1.3, 0.18]}>
          <sphereGeometry args={[0.028, 10, 10]} />
          <Toon color="#24312c" />
        </mesh>
      </group>
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
        <ringGeometry args={[0.18, 0.28, 20]} />
        <meshBasicMaterial color="#fff4ea" transparent opacity={0.9} />
      </mesh>
    </group>
  )
}
