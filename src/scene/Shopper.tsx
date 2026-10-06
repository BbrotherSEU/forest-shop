import { useMemo, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { CanvasTexture, SRGBColorSpace, type Group } from "three"
import { canStep, control, floorHeight } from "../game/control.ts"
import { useShop } from "../game/store.ts"
import { deeMotion, WaddleDee } from "./animals.tsx"
import { NameTag } from "./label.tsx"
import { pick } from "./pick.ts"

const speed = 0.7
const line = "你也是来买东西的吗"

const stops = [
  { x: 1.15, z: 3.5 },
  { x: 0.7, z: 2.15 },
  { x: 4.35, z: 1.55 },
  { x: 4.45, z: -0.15 },
  { x: 2.6, z: -1.6 },
  { x: 1.45, z: 0.15 },
  { x: -0.9, z: 2.55 },
  { x: 2.4, z: 4.15 },
]

export function Shopper() {
  const root = useRef<Group>(null)
  const place = useShop((state) => state.place)
  const pose = useRef({ x: 1.15, z: 3.5, yaw: Math.PI })
  const goal = useRef<(typeof stops)[number] | null>(null)
  const pause = useRef(1.4)
  const stopIndex = useRef(0)
  const [talking, setTalking] = useState(false)
  const talk = useRef(0)
  const bubble = useMemo(() => speechTexture(line), [])

  useFrame((_, delta) => {
    if (place !== "inside") return
    const group = root.current
    if (!group) return
    if (talk.current > 0) {
      talk.current -= delta
      if (talk.current <= 0) setTalking(false)
    }
    pause.current -= delta
    let moving = false
    if (talk.current <= 0 && pause.current <= 0) {
      if (!goal.current) {
        stopIndex.current = (stopIndex.current + 1) % stops.length
        goal.current = stops[stopIndex.current]
      }
      const next = goal.current
      const dx = next.x - pose.current.x
      const dz = next.z - pose.current.z
      const distance = Math.hypot(dx, dz)
      if (distance < 0.16) {
        goal.current = null
        pause.current = 1.8 + Math.random() * 1.6
      } else {
        const step = Math.min(distance, speed * delta)
        const nx = pose.current.x + (dx / distance) * step
        const nz = pose.current.z + (dz / distance) * step
        const clearOfPlayer = Math.hypot(nx - control.x, nz - control.z) > 0.75
        if (clearOfPlayer && canStep(pose.current.x, pose.current.z, nx, nz)) {
          pose.current.x = nx
          pose.current.z = nz
          pose.current.yaw = Math.atan2(dx, dz)
          moving = true
        } else if (!canStep(pose.current.x, pose.current.z, nx, nz)) {
          goal.current = null
          pause.current = 0.6
        }
      }
    }
    deeMotion.moving = moving
    group.position.set(pose.current.x, floorHeight(pose.current.x, pose.current.z), pose.current.z)
    group.rotation.y = pose.current.yaw
  })

  return (
    <group ref={root} position={[1.15, 0, 3.5]}>
      <group
        {...pick((event) => {
          event.stopPropagation()
          talk.current = 4.2
          setTalking(true)
        })}
      >
        <WaddleDee animate />
      </group>
      <NameTag text="鲁迪" position={[0, 1.28, 0]} />
      {talking ? (
        <sprite position={[0, 1.78, 0]} scale={[1.7, 0.42, 1]} renderOrder={5} raycast={() => null}>
          <spriteMaterial map={bubble} transparent depthWrite={false} />
        </sprite>
      ) : null}
    </group>
  )
}

function speechTexture(text: string) {
  const canvas = document.createElement("canvas")
  canvas.width = 720
  canvas.height = 180
  const paint = canvas.getContext("2d")
  if (!paint) return new CanvasTexture(canvas)
  paint.fillStyle = "rgba(255,250,243,0.96)"
  paint.beginPath()
  paint.roundRect(8, 8, 704, 164, 36)
  paint.fill()
  paint.strokeStyle = "#e7d3b0"
  paint.lineWidth = 8
  paint.stroke()
  paint.fillStyle = "#3a2a22"
  paint.font = "700 64px 'Microsoft YaHei', sans-serif"
  paint.textAlign = "center"
  paint.textBaseline = "middle"
  paint.fillText(text, 360, 90)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}
