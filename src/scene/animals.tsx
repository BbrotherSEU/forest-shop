import { useMemo, useRef, type RefObject } from "react"
import { useFrame } from "@react-three/fiber"
import { BackSide, CanvasTexture, Shape, SRGBColorSpace, type Group } from "three"
import { control } from "../game/control.ts"
import { Toon } from "./Toon.tsx"

interface AnimalProps {
  animate?: boolean
  apron?: boolean
  satchel?: boolean
}

interface Palette {
  fur: string
  belly: string
  face: string
  ear: string
  earInner: string
  patch: string
  paw: string
  nose: string
  ink: string
  blush: string
  tail: [string, string, string, string, string, string]
  mask: boolean
}

const panda: Palette = {
  fur: "#f0863a",
  belly: "#f7e7cf",
  face: "#fff8ef",
  ear: "#f0863a",
  earInner: "#fff8ef",
  patch: "#c4623a",
  paw: "#a24e2c",
  nose: "#6d3b2c",
  ink: "#7a4030",
  blush: "#f3a0a0",
  tail: ["#e06a2e", "#fff6ea", "#c4512a", "#fff6ea", "#e06a2e", "#7a3a24"],
  mask: false,
}

function useGait(animate: boolean) {
  const leftLeg = useRef<Group>(null)
  const rightLeg = useRef<Group>(null)
  const leftArm = useRef<Group>(null)
  const rightArm = useRef<Group>(null)
  const tail = useRef<Group>(null)
  const ears = useRef<Group>(null)

  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    const walking = animate && control.moving
    const swing = walking ? Math.sin(time * 9) * 0.45 : 0
    if (leftLeg.current) leftLeg.current.rotation.x = swing
    if (rightLeg.current) rightLeg.current.rotation.x = -swing
    if (leftArm.current) leftArm.current.rotation.x = -swing * 0.65
    if (rightArm.current) rightArm.current.rotation.x = swing * 0.65
    if (tail.current) tail.current.rotation.z = Math.sin(time * (walking ? 8 : 2.2)) * (walking ? 0.08 : 0.04)
    if (ears.current) ears.current.rotation.z = Math.sin(time * 2.2) * 0.03
  })

  return { leftLeg, rightLeg, leftArm, rightArm, tail, ears }
}

export function RedPanda(props: AnimalProps) {
  return <Chibi {...props} colors={panda} />
}

const kirbyPink = "#ff9cbf"
const kirbyFoot = "#ff458e"

export function Kirby({ animate = false }: AnimalProps) {
  const rig = useRef<Group>(null)
  const face = useMemo(() => kirbyFaceTexture(), [])

  useFrame(({ clock }) => {
    if (!rig.current) return
    const walking = animate && control.moving
    const wave = walking ? Math.sin(clock.elapsedTime * 9) : 0
    const lift = Math.max(wave, 0)
    const squat = Math.min(wave, 0)
    rig.current.position.y = lift * 0.28
    const tall = 1 + lift * 0.1 + squat * 0.1
    const wide = 1 - lift * 0.05 - squat * 0.07
    rig.current.scale.set(wide, tall, wide)
  })

  return (
    <group ref={rig}>
      <mesh castShadow position={[0, 0.58, 0]} scale={[1.05, 0.98, 1]}>
        <sphereGeometry args={[0.52, 48, 36]} />
        <meshStandardMaterial map={face} roughness={0.36} metalness={0.02} />
      </mesh>
      <group position={[-0.4, 0.98, 0.26]}>
        <mesh castShadow>
          <sphereGeometry args={[0.14, 20, 16]} />
          <meshStandardMaterial color={kirbyPink} roughness={0.36} metalness={0.02} />
        </mesh>
        <KirbyWand />
      </group>
      <mesh castShadow position={[0.5, 0.46, 0.08]} scale={[0.85, 0.72, 0.72]}>
        <sphereGeometry args={[0.16, 20, 16]} />
        <meshStandardMaterial color={kirbyPink} roughness={0.36} metalness={0.02} />
      </mesh>
      <mesh castShadow position={[-0.18, 0.01, 0.22]} rotation={[1.05, 0.1, 0.35]} scale={[0.95, 1.55, 0.72]}>
        <sphereGeometry args={[0.18, 22, 16]} />
        <meshStandardMaterial color={kirbyFoot} roughness={0.42} />
      </mesh>
      <mesh castShadow position={[0.2, 0.02, 0.12]} rotation={[0.5, -0.5, -0.25]} scale={[0.88, 1.2, 0.7]}>
        <sphereGeometry args={[0.16, 22, 16]} />
        <meshStandardMaterial color={kirbyFoot} roughness={0.42} />
      </mesh>
    </group>
  )
}

function kirbyFaceTexture() {
  const size = 512
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext("2d")
  if (!context) return new CanvasTexture(canvas)
  const paint = context
  paint.fillStyle = kirbyPink
  paint.fillRect(0, 0, size, size)
  const shade = paint.createLinearGradient(0, 0, 0, size)
  shade.addColorStop(0, "rgba(255,255,255,0.28)")
  shade.addColorStop(0.42, "rgba(255,255,255,0)")
  shade.addColorStop(1, "rgba(190, 40, 90, 0.18)")
  paint.fillStyle = shade
  paint.fillRect(0, 0, size, size)

  const faceX = size * 0.25
  const eyeY = size * 0.36
  paintBlush(paint, faceX - 86, size * 0.5)
  paintBlush(paint, faceX + 86, size * 0.5)
  paintKirbyEye(paint, faceX - 32, eyeY)
  paintKirbyEye(paint, faceX + 32, eyeY)
  paintKirbyMouth(paint, faceX, size * 0.6)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function paintBlush(paint: CanvasRenderingContext2D, x: number, y: number) {
  paint.fillStyle = "rgba(255, 120, 160, 0.55)"
  paint.beginPath()
  paint.ellipse(x, y, 22, 16, 0, 0, Math.PI * 2)
  paint.fill()
}

function paintKirbyEye(paint: CanvasRenderingContext2D, x: number, y: number) {
  paint.fillStyle = "#071433"
  paint.beginPath()
  paint.ellipse(x, y, 20, 40, 0, 0, Math.PI * 2)
  paint.fill()
  paint.fillStyle = "#f4fbff"
  paint.beginPath()
  paint.ellipse(x, y - 2, 15, 33, 0, 0, Math.PI * 2)
  paint.fill()
  paint.fillStyle = "#1d4ed8"
  paint.beginPath()
  paint.ellipse(x, y + 4, 14, 28, 0, 0, Math.PI * 2)
  paint.fill()
  paint.fillStyle = "#0b1f5e"
  paint.beginPath()
  paint.ellipse(x, y + 12, 10, 18, 0, 0, Math.PI * 2)
  paint.fill()
  paint.fillStyle = "#ffffff"
  paint.beginPath()
  paint.ellipse(x - 5, y - 16, 5, 9, -0.4, 0, Math.PI * 2)
  paint.fill()
}

function paintKirbyMouth(paint: CanvasRenderingContext2D, x: number, y: number) {
  paint.fillStyle = "#8d1230"
  paint.beginPath()
  paint.ellipse(x, y, 46, 72, 0, 0, Math.PI * 2)
  paint.fill()
  const cavity = paint.createRadialGradient(x, y + 8, 8, x, y, 70)
  cavity.addColorStop(0, "#ff6d86")
  cavity.addColorStop(0.45, "#e2184e")
  cavity.addColorStop(1, "#9a1232")
  paint.fillStyle = cavity
  paint.beginPath()
  paint.ellipse(x, y + 2, 38, 62, 0, 0, Math.PI * 2)
  paint.fill()
  paint.fillStyle = "#c4143c"
  paint.beginPath()
  paint.ellipse(x, y + 28, 14, 16, 0, 0, Math.PI * 2)
  paint.fill()
}

function KirbyWand() {
  const star = useMemo(() => {
    const shape = new Shape()
    const points = 5
    for (let step = 0; step < points * 2; step += 1) {
      const radius = step % 2 === 0 ? 0.11 : 0.048
      const angle = (step / (points * 2)) * Math.PI * 2 - Math.PI / 2
      const x = Math.cos(angle) * radius
      const y = Math.sin(angle) * radius
      if (step === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    }
    shape.closePath()
    return shape
  }, [])
  return (
    <group position={[0.02, 0.16, 0.02]} rotation={[0.25, 0, -0.55]}>
      <mesh castShadow position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.28, 10]} />
        <meshStandardMaterial color="#e23b3b" roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.07, 10]} />
        <meshStandardMaterial color="#fffaf3" roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 0.3, 0]} rotation={[0, 0, 0.3]}>
        <extrudeGeometry args={[star, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 }]} />
        <meshStandardMaterial color="#f2c14e" metalness={0.45} roughness={0.28} />
      </mesh>
    </group>
  )
}

export const deeMotion = { moving: false }

const deeOrange = "#f0782c"
const deeFace = "#f3d2a4"
const deeFoot = "#ffc43a"

export function WaddleDee({ animate = false }: AnimalProps) {
  const rig = useRef<Group>(null)
  const face = useMemo(() => deeFaceTexture(), [])

  useFrame(({ clock }) => {
    if (!rig.current) return
    const walking = animate && deeMotion.moving
    const wave = walking ? Math.sin(clock.elapsedTime * 6.5) : 0
    const lift = Math.max(wave, 0)
    const squat = Math.min(wave, 0)
    rig.current.position.y = lift * 0.22
    const tall = 1 + lift * 0.12 + squat * 0.08
    const wide = 1 - lift * 0.06 - squat * 0.08
    rig.current.scale.set(wide, tall, wide)
  })

  return (
    <group ref={rig}>
      <mesh castShadow position={[0, 0.5, 0]} scale={[1.08, 0.96, 1]}>
        <sphereGeometry args={[0.46, 40, 32]} />
        <meshStandardMaterial map={face} roughness={0.42} metalness={0.02} />
      </mesh>
      <mesh castShadow position={[-0.46, 0.48, 0.06]}>
        <sphereGeometry args={[0.13, 18, 14]} />
        <meshStandardMaterial color={deeOrange} roughness={0.42} />
      </mesh>
      <mesh castShadow position={[0.46, 0.48, 0.06]}>
        <sphereGeometry args={[0.13, 18, 14]} />
        <meshStandardMaterial color={deeOrange} roughness={0.42} />
      </mesh>
      <mesh castShadow position={[-0.13, 0.08, 0.16]} rotation={[0.35, 0.12, 0.15]} scale={[0.9, 1.15, 0.72]}>
        <sphereGeometry args={[0.13, 18, 14]} />
        <meshStandardMaterial color={deeFoot} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0.13, 0.08, 0.16]} rotation={[0.35, -0.12, -0.15]} scale={[0.9, 1.15, 0.72]}>
        <sphereGeometry args={[0.13, 18, 14]} />
        <meshStandardMaterial color={deeFoot} roughness={0.4} />
      </mesh>
    </group>
  )
}

function deeFaceTexture() {
  const size = 512
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const paint = canvas.getContext("2d")
  if (!paint) return new CanvasTexture(canvas)
  paint.fillStyle = deeOrange
  paint.fillRect(0, 0, size, size)
  const faceX = size * 0.25
  const faceY = size * 0.46
  paint.fillStyle = deeFace
  paint.beginPath()
  paint.ellipse(faceX, faceY, 118, 132, 0, 0, Math.PI * 2)
  paint.fill()
  paintDeeEye(paint, faceX - 40, faceY - 18)
  paintDeeEye(paint, faceX + 40, faceY - 18)
  paint.fillStyle = "rgba(255, 140, 120, 0.7)"
  paint.beginPath()
  paint.ellipse(faceX - 78, faceY + 28, 22, 14, 0, 0, Math.PI * 2)
  paint.fill()
  paint.beginPath()
  paint.ellipse(faceX + 78, faceY + 28, 22, 14, 0, 0, Math.PI * 2)
  paint.fill()
  paint.strokeStyle = "#3a2a22"
  paint.lineWidth = 7
  paint.lineCap = "round"
  paint.beginPath()
  paint.arc(faceX, faceY + 18, 18, 0.15 * Math.PI, 0.85 * Math.PI)
  paint.stroke()
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function paintDeeEye(paint: CanvasRenderingContext2D, x: number, y: number) {
  paint.fillStyle = "#1a120e"
  paint.beginPath()
  paint.ellipse(x, y, 18, 32, 0, 0, Math.PI * 2)
  paint.fill()
  paint.fillStyle = "#ffffff"
  paint.beginPath()
  paint.ellipse(x - 5, y - 12, 6, 8, -0.4, 0, Math.PI * 2)
  paint.fill()
}

const pandaWhite = "#fbfbfb"
const pandaBlack = "#1a1a1a"
const pandaMouth = "#ff4d90"
const pandaBlush = "#ff6b9d"

export const pandaMotion = { moving: false }

export function ShopPanda() {
  const rig = useRef<Group>(null)
  const face = useMemo(() => pandaFaceTexture(), [])
  useFrame(({ clock }) => {
    const group = rig.current
    if (!group) return
    const wave = pandaMotion.moving ? Math.sin(clock.elapsedTime * 6.5) : 0
    const lift = Math.max(wave, 0)
    const squat = Math.min(wave, 0)
    group.position.y = lift * 0.1
    const tall = 1 + lift * 0.06 + squat * 0.04
    const wide = 1 - lift * 0.03 - squat * 0.03
    group.scale.set(wide, tall, wide)
  })
  return (
    <group ref={rig}>
      <mesh castShadow position={[0, 0.34, 0]} scale={[0.9, 1.12, 0.78]}>
        <sphereGeometry args={[0.26, 28, 22]} />
        <meshStandardMaterial color={pandaBlack} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.32, 0.12]} scale={[0.7, 1.2, 0.4]}>
        <sphereGeometry args={[0.15, 20, 16]} />
        <meshStandardMaterial color={pandaWhite} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-0.08, 0.07, 0.02]} scale={[0.9, 1.25, 0.82]}>
        <sphereGeometry args={[0.08, 14, 12]} />
        <meshStandardMaterial color={pandaBlack} roughness={0.72} />
      </mesh>
      <mesh castShadow position={[0.08, 0.07, 0.02]} scale={[0.9, 1.25, 0.82]}>
        <sphereGeometry args={[0.08, 14, 12]} />
        <meshStandardMaterial color={pandaBlack} roughness={0.72} />
      </mesh>
      <mesh castShadow position={[-0.27, 0.4, 0.02]} rotation={[0.04, 0, 0.22]} scale={[0.72, 1.75, 0.68]}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial color={pandaBlack} roughness={0.72} />
      </mesh>
      <mesh castShadow position={[0.27, 0.4, 0.02]} rotation={[0.04, 0, -0.22]} scale={[0.72, 1.75, 0.68]}>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial color={pandaBlack} roughness={0.72} />
      </mesh>
      <group position={[0, 0.88, 0.02]} rotation={[-0.12, 0, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.38, 64, 48]} />
          <meshStandardMaterial map={face} color={pandaWhite} roughness={0.78} />
        </mesh>
        <mesh castShadow position={[-0.26, 0.28, -0.02]}>
          <sphereGeometry args={[0.135, 18, 14]} />
          <meshStandardMaterial color={pandaBlack} roughness={0.68} />
        </mesh>
        <mesh castShadow position={[0.26, 0.28, -0.02]}>
          <sphereGeometry args={[0.135, 18, 14]} />
          <meshStandardMaterial color={pandaBlack} roughness={0.68} />
        </mesh>
      </group>
    </group>
  )
}

function pandaFaceTexture() {
  const size = 512
  const flat = document.createElement("canvas")
  flat.width = size
  flat.height = size
  const flatPaint = flat.getContext("2d")
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const paint = canvas.getContext("2d")
  if (!flatPaint || !paint) return new CanvasTexture(canvas)
  flatPaint.fillStyle = pandaWhite
  flatPaint.fillRect(0, 0, size, size)
  paint.fillStyle = pandaWhite
  paint.fillRect(0, 0, size, size)
  paintFlatPandaFace(flatPaint, size)
  const source = flatPaint.getImageData(0, 0, size, size).data
  const target = paint.getImageData(0, 0, size, size)
  const output = target.data
  for (let ty = 0; ty < size; ty += 1) {
    const theta = (ty / size) * Math.PI
    const sy = Math.cos(theta)
    for (let tx = 0; tx < size; tx += 1) {
      const alpha = (tx / size) * Math.PI * 2 - Math.PI / 2
      if (Math.cos(alpha) < 0.2) continue
      const sx = Math.sin(alpha) * Math.sin(theta)
      if (sx * sx + sy * sy > 0.96) continue
      const fx = Math.min(size - 1, Math.max(0, Math.round((sx * 0.5 + 0.5) * (size - 1))))
      const fy = Math.min(size - 1, Math.max(0, Math.round((0.5 - sy * 0.5) * (size - 1))))
      const from = (fy * size + fx) * 4
      const to = (ty * size + tx) * 4
      output[to] = source[from]
      output[to + 1] = source[from + 1]
      output[to + 2] = source[from + 2]
      output[to + 3] = 255
    }
  }
  paint.putImageData(target, 0, 0)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

function paintFlatPandaFace(paint: CanvasRenderingContext2D, size: number) {
  const center = size / 2
  const radius = size * 0.46
  const spot = (x: number, y: number, rx: number, ry: number, turn = 0) => {
    paint.beginPath()
    paint.ellipse(center + x * radius, center + y * radius, rx * radius, ry * radius, turn, 0, Math.PI * 2)
    paint.fill()
  }
  paint.fillStyle = pandaBlack
  spot(-0.34, 0.02, 0.3, 0.36, -0.12)
  spot(0.34, 0.02, 0.3, 0.36, 0.12)
  paint.fillStyle = "#ffffff"
  spot(-0.32, -0.06, 0.155, 0.175)
  spot(0.32, -0.06, 0.155, 0.175)
  paint.fillStyle = pandaBlack
  spot(-0.3, -0.03, 0.095, 0.11)
  spot(0.3, -0.03, 0.095, 0.11)
  paint.fillStyle = "#ffffff"
  spot(-0.34, -0.1, 0.042, 0.05, -0.4)
  spot(0.28, -0.1, 0.042, 0.05, 0.4)
  spot(-0.24, 0.01, 0.018, 0.02)
  spot(0.36, 0.01, 0.018, 0.02)
  paint.fillStyle = pandaBlack
  spot(0, 0.2, 0.045, 0.055)
  paint.fillStyle = pandaMouth
  paint.beginPath()
  paint.moveTo(center - radius * 0.18, center + radius * 0.34)
  paint.quadraticCurveTo(center, center + radius * 0.3, center + radius * 0.18, center + radius * 0.34)
  paint.quadraticCurveTo(center + radius * 0.14, center + radius * 0.52, center, center + radius * 0.54)
  paint.quadraticCurveTo(center - radius * 0.14, center + radius * 0.52, center - radius * 0.18, center + radius * 0.34)
  paint.fill()
  paint.fillStyle = "#ff9ec4"
  spot(0, 0.44, 0.07, 0.06)
  paint.fillStyle = pandaBlush
  spot(-0.62, 0.3, 0.09, 0.05)
  spot(0.62, 0.3, 0.09, 0.05)
}

const raccoonFur = "#b3aaa0"
const raccoonShade = "#8a8278"
const raccoonCream = "#f4eee4"
const raccoonMask = "#4a453f"
const raccoonPaw = "#3a342f"
const raccoonPink = "#f2b7c4"

export function Raccoon({ animate = false, apron = false, satchel = false }: AnimalProps) {
  const gait = useGait(animate)
  return (
    <group>
      <ShortLimb pivot={[-0.13, 0.28, 0.02]} rig={gait.leftLeg} color={raccoonFur} paw={raccoonPaw} />
      <ShortLimb pivot={[0.13, 0.28, 0.02]} rig={gait.rightLeg} color={raccoonFur} paw={raccoonPaw} flip />
      <Puff color={raccoonFur} position={[0, 0.5, 0]} radius={0.26} scale={[1.02, 1.18, 0.88]} />
      <Puff color="#ddd4c6" position={[0, 0.46, 0.16]} radius={0.16} scale={[0.95, 1.15, 0.42]} offset={1} />
      <ShortLimb pivot={[-0.28, 0.68, 0.04]} rig={gait.leftArm} color={raccoonShade} paw={raccoonPaw} arm />
      <ShortLimb pivot={[0.28, 0.68, 0.04]} rig={gait.rightArm} color={raccoonShade} paw={raccoonPaw} arm flip />
      <group position={[0, 1.12, 0.02]}>
        <Puff color="#d2c8bc" position={[0, 0.08, -0.04]} radius={0.5} />
        <Puff color={raccoonFur} position={[0, -0.08, 0.02]} radius={0.46} scale={[1.04, 0.92, 0.96]} />
        <Puff color={raccoonCream} position={[0, -0.12, 0.26]} radius={0.38} scale={[1.08, 0.95, 0.72]} offset={2} />
        <Puff color={raccoonMask} position={[0, 0.06, 0.38]} radius={0.24} scale={[1.85, 0.72, 0.36]} offset={3} />
        <group ref={gait.ears}>
          <RoundEar position={[-0.32, 0.46, 0.02]} lean={0.42} />
          <RoundEar position={[0.32, 0.46, 0.02]} lean={-0.42} />
        </group>
        <SoftEye position={[-0.16, 0.06, 0.52]} />
        <SoftEye position={[0.16, 0.06, 0.52]} />
        <Puff color={raccoonPaw} position={[0, -0.18, 0.52]} radius={0.05} scale={[1.2, 0.75, 0.65]} offset={6} />
        <mesh position={[0, -0.27, 0.48]} rotation={[0.15, 0, Math.PI]}>
          <torusGeometry args={[0.055, 0.008, 8, 16, Math.PI]} />
          <meshBasicMaterial color="#5c534c" />
        </mesh>
      </group>
      <RaccoonTail rig={gait.tail} />
      {satchel ? <Satchel /> : null}
      {apron ? <RaccoonApron /> : null}
    </group>
  )
}

function Chibi({ animate = false, apron = false, satchel = false, colors }: AnimalProps & { colors: Palette }) {
  const gait = useGait(animate)
  return (
    <group>
      <Limb pivot={[-0.16, 0.34, 0.02]} rig={gait.leftLeg} color={colors.fur} paw={colors.paw} ink={colors.ink} />
      <Limb pivot={[0.16, 0.34, 0.02]} rig={gait.rightLeg} color={colors.fur} paw={colors.paw} ink={colors.ink} flip />
      <Limb pivot={[-0.34, 0.78, 0.04]} rig={gait.leftArm} color={colors.fur} paw={colors.paw} ink={colors.ink} arm />
      <Limb pivot={[0.34, 0.78, 0.04]} rig={gait.rightArm} color={colors.fur} paw={colors.paw} ink={colors.ink} arm flip />
      <Ball color={colors.fur} ink={colors.ink} position={[0, 0.6, 0]} radius={0.32} scale={[1.12, 1.12, 0.96]} />
      <Ball color={colors.belly} position={[0, 0.56, 0.26]} radius={0.14} scale={[1.05, 1.4, 0.38]} />
      <group position={[0, 1.2, 0.04]}>
        <Ball color={colors.face} ink={colors.ink} radius={0.4} />
        <Ball color={colors.fur} ink={colors.ink} position={[0, 0.1, -0.14]} radius={0.4} />
        <group ref={gait.ears}>
          <Ear position={[-0.22, 0.24, -0.08]} lean={0.5} outer={colors.ear} inner={colors.earInner} ink={colors.ink} />
          <Ear position={[0.22, 0.24, -0.08]} lean={-0.5} outer={colors.ear} inner={colors.earInner} ink={colors.ink} />
        </group>
        {colors.mask ? (
          <>
            <Ball color={colors.patch} position={[-0.13, 0.04, 0.3]} radius={0.12} scale={[1.05, 0.95, 0.28]} />
            <Ball color={colors.patch} position={[0.13, 0.04, 0.3]} radius={0.12} scale={[1.05, 0.95, 0.28]} />
          </>
        ) : (
          <>
            <Ball color={colors.patch} position={[-0.13, 0.08, 0.3]} radius={0.09} scale={[0.9, 1.25, 0.28]} />
            <Ball color={colors.patch} position={[0.13, 0.08, 0.3]} radius={0.09} scale={[0.9, 1.25, 0.28]} />
          </>
        )}
        <Eye position={[-0.12, 0.03, 0.34]} />
        <Eye position={[0.12, 0.03, 0.34]} />
        <Ball color={colors.nose} position={[0, -0.12, 0.38]} radius={0.042} scale={[1.2, 0.75, 0.7]} />
        <mesh position={[0, -0.19, 0.38]} rotation={[0.15, 0, Math.PI]}>
          <torusGeometry args={[0.05, 0.011, 8, 14, Math.PI]} />
          <meshBasicMaterial color={colors.nose} />
        </mesh>
        <mesh position={[-0.2, -0.08, 0.32]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={colors.blush} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.2, -0.08, 0.32]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={colors.blush} transparent opacity={0.8} />
        </mesh>
      </group>
      <Tail rig={gait.tail} colors={colors.tail} ink={colors.ink} />
      {satchel ? <Satchel /> : null}
      {apron ? <Apron /> : null}
    </group>
  )
}

function Ball({
  color,
  position = [0, 0, 0],
  radius,
  scale = [1, 1, 1],
  ink,
}: {
  color: string
  position?: [number, number, number]
  radius: number
  scale?: [number, number, number]
  ink?: string
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[radius, 28, 20]} />
        <Toon color={color} />
      </mesh>
      {ink ? (
        <mesh scale={1.055}>
          <sphereGeometry args={[radius, 18, 14]} />
          <meshBasicMaterial color={ink} side={BackSide} />
        </mesh>
      ) : null}
    </group>
  )
}

function Puff({
  color,
  position = [0, 0, 0],
  radius,
  scale = [1, 1, 1],
  offset = 0,
}: {
  color: string
  position?: [number, number, number]
  radius: number
  scale?: [number, number, number]
  offset?: number
}) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <sphereGeometry args={[radius, 28, 20]} />
      <meshStandardMaterial
        color={color}
        roughness={0.9}
        metalness={0}
        polygonOffset={offset !== 0}
        polygonOffsetFactor={-offset}
        polygonOffsetUnits={-offset}
      />
    </mesh>
  )
}

function ShortLimb({
  pivot,
  rig,
  color,
  paw,
  arm = false,
  flip = false,
}: {
  pivot: [number, number, number]
  rig: RefObject<Group | null>
  color: string
  paw: string
  arm?: boolean
  flip?: boolean
}) {
  const side = flip ? 1 : -1
  return (
    <group ref={rig} position={pivot}>
      <Puff
        color={color}
        position={[side * 0.015, arm ? -0.1 : -0.1, arm ? 0.03 : 0]}
        radius={arm ? 0.075 : 0.082}
        scale={[1.05, 1.2, 1]}
      />
      <Puff
        color={paw}
        position={[side * 0.02, arm ? -0.2 : -0.22, arm ? 0.07 : 0.03]}
        radius={arm ? 0.068 : 0.078}
        scale={[1.3, 0.72, 1.15]}
      />
    </group>
  )
}

function SoftEye({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.11, 20, 18]} />
        <meshStandardMaterial color="#8d5a2b" roughness={0.35} metalness={0.02} />
      </mesh>
      <mesh position={[0, -0.008, 0.06]}>
        <sphereGeometry args={[0.055, 16, 14]} />
        <meshBasicMaterial color="#241c16" />
      </mesh>
      <mesh position={[-0.028, 0.032, 0.08]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#fffaf4" />
      </mesh>
      <mesh position={[0.03, -0.02, 0.084]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshBasicMaterial color="#fffaf4" />
      </mesh>
    </group>
  )
}

function RoundEar({ position, lean }: { position: [number, number, number]; lean: number }) {
  return (
    <group position={position} rotation={[-0.35, 0, lean]} scale={1.45}>
      <Puff color="#c9bfb2" radius={0.14} scale={[0.95, 1.2, 0.48]} />
      <Puff color={raccoonPink} position={[0, -0.01, 0.055]} radius={0.09} scale={[0.72, 0.9, 0.42]} offset={3} />
    </group>
  )
}

function RaccoonTail({ rig }: { rig: RefObject<Group | null> }) {
  const bands = [
    { at: [0.22, 0.32, -0.1] as [number, number, number], radius: 0.13, color: raccoonFur },
    { at: [0.4, 0.3, -0.06] as [number, number, number], radius: 0.15, color: raccoonPaw },
    { at: [0.58, 0.3, 0.02] as [number, number, number], radius: 0.145, color: "#cfc6ba" },
    { at: [0.74, 0.3, 0.1] as [number, number, number], radius: 0.12, color: "#4a453f" },
    { at: [0.86, 0.3, 0.16] as [number, number, number], radius: 0.09, color: raccoonFur },
  ]
  return (
    <group ref={rig}>
      {bands.map((band) => (
        <Puff key={band.at.join(",")} color={band.color} position={band.at} radius={band.radius} />
      ))}
    </group>
  )
}

function RaccoonApron() {
  return (
    <group position={[0, 0.48, 0.16]}>
      <mesh position={[-0.13, 0.32, 0]} rotation={[0.08, 0, 0.22]}>
        <boxGeometry args={[0.04, 0.26, 0.025]} />
        <meshStandardMaterial color="#f4efe6" roughness={0.92} />
      </mesh>
      <mesh position={[0.13, 0.32, 0]} rotation={[0.08, 0, -0.22]}>
        <boxGeometry args={[0.04, 0.26, 0.025]} />
        <meshStandardMaterial color="#f4efe6" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0, 0.04]} castShadow>
        <boxGeometry args={[0.4, 0.46, 0.035]} />
        <meshStandardMaterial color="#f3ecdf" roughness={0.94} />
      </mesh>
      <mesh position={[0, -0.05, 0.062]}>
        <boxGeometry args={[0.22, 0.14, 0.008]} />
        <meshStandardMaterial color="#e7dccb" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.025, 0.066]}>
        <boxGeometry args={[0.22, 0.008, 0.008]} />
        <meshStandardMaterial color="#c9bba6" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Eye({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.098, 18, 18]} />
        <meshBasicMaterial color="#2a211c" />
      </mesh>
      <mesh position={[-0.022, 0.026, 0.062]}>
        <sphereGeometry args={[0.032, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.028, -0.018, 0.07]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

function Ear({
  position,
  lean,
  outer,
  inner,
  ink,
}: {
  position: [number, number, number]
  lean: number
  outer: string
  inner: string
  ink: string
}) {
  return (
    <group position={position} rotation={[0.15, 0, lean]}>
      <Ball color={outer} ink={ink} position={[0, 0.16, 0]} radius={0.13} scale={[0.78, 1.28, 0.46]} />
      <Ball color={inner} position={[0, 0.14, 0.05]} radius={0.075} scale={[0.62, 1.02, 0.32]} />
    </group>
  )
}

const tailRings: Array<{ at: [number, number, number]; radius: number }> = [
  { at: [0.2, 0.46, -0.16], radius: 0.12 },
  { at: [0.36, 0.56, 0], radius: 0.14 },
  { at: [0.5, 0.72, 0.1], radius: 0.15 },
  { at: [0.56, 0.9, 0.16], radius: 0.14 },
  { at: [0.46, 1.06, 0.18], radius: 0.12 },
  { at: [0.32, 1.18, 0.16], radius: 0.09 },
]

function Tail({ colors, ink, rig }: { colors: Palette["tail"]; ink: string; rig: RefObject<Group | null> }) {
  return (
    <group ref={rig}>
      {tailRings.map((ring, index) => (
        <Ball key={index} color={colors[index]} ink={ink} position={ring.at} radius={ring.radius} />
      ))}
    </group>
  )
}

function Limb({
  pivot,
  rig,
  color,
  paw,
  ink,
  arm = false,
  flip = false,
}: {
  pivot: [number, number, number]
  rig: RefObject<Group | null>
  color: string
  paw: string
  ink?: string
  arm?: boolean
  flip?: boolean
}) {
  const side = flip ? 1 : -1
  return (
    <group ref={rig} position={pivot}>
      <Ball
        color={color}
        ink={ink}
        position={[side * 0.02, arm ? -0.14 : -0.16, 0]}
        radius={arm ? 0.075 : 0.085}
        scale={[1, 1.45, 1]}
      />
      <Ball
        color={paw}
        ink={ink}
        position={[side * 0.035, arm ? -0.28 : -0.32, 0.03]}
        radius={arm ? 0.065 : 0.078}
        scale={[1.2, 0.72, 1.15]}
      />
    </group>
  )
}

function Satchel() {
  return (
    <group position={[0.16, 0.72, -0.38]}>
      <mesh castShadow>
        <boxGeometry args={[0.26, 0.22, 0.08]} />
        <Toon color="#f2c14e" />
      </mesh>
      <mesh position={[0, 0.02, -0.04]}>
        <boxGeometry args={[0.16, 0.08, 0.03]} />
        <Toon color="#d3924c" />
      </mesh>
      <mesh position={[0, 0.16, 0.01]}>
        <boxGeometry args={[0.05, 0.14, 0.04]} />
        <Toon color="#c45c4a" />
      </mesh>
    </group>
  )
}

function Apron() {
  return (
    <group position={[0, 0.64, 0.4]}>
      <mesh>
        <boxGeometry args={[0.36, 0.34, 0.04]} />
        <Toon color="#fffaf3" />
      </mesh>
      <mesh position={[0, -0.02, 0.03]}>
        <boxGeometry args={[0.18, 0.12, 0.025]} />
        <Toon color="#f08a7a" />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.14, 0.06, 0.045]} />
        <Toon color="#f08a7a" />
      </mesh>
    </group>
  )
}
