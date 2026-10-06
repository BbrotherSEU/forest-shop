import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useFrame, type ThreeEvent } from "@react-three/fiber"
import type { Group } from "three"
import { formatMoney, supplies, suppliesIn, supplyList, type CabinetId, type Spot, type SupplyId } from "../game/catalog.ts"
import { control, counterSpot, platform } from "../game/control.ts"
import { bills } from "../game/money.ts"
import { useShop } from "../game/store.ts"
import { Clerk } from "./Clerk.tsx"
import { PencilCup, SupplyMesh, TapeRoll } from "./goods.tsx"
import { PriceTag } from "./label.tsx"
import { paintTexture, shopTileTexture, shopWallTexture, woodFloorTexture } from "./materials.ts"
import { pick } from "./pick.ts"
import { Player, WalkMarker } from "./Player.tsx"
import { Shopper } from "./Shopper.tsx"
import { ShopMat } from "./surface.tsx"

export function Interior() {
  const board = useMemo(() => priceBoard(), [])
  const wood = useMemo(() => woodFloorTexture(), [])
  const tiles = useMemo(() => {
    const map = shopTileTexture()
    map.repeat.set(8, 7)
    return map
  }, [])
  const walls = useMemo(
    () => ({
      back: shopWallTexture(8),
      side: shopWallTexture(7),
      front: shopWallTexture(2),
    }),
    [],
  )
  useEffect(() => () => {
    board.dispose()
    wood.dispose()
    tiles.dispose()
    walls.back.dispose()
    walls.side.dispose()
    walls.front.dispose()
    document.body.style.cursor = "default"
  }, [board, wood, tiles, walls])

  const leave = useShop((state) => state.leave)

  function walk(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation()
    if (event.button != null && event.button !== 0) return
    const state = useShop.getState()
    if (state.cabinet) {
      control.target = null
      state.closeCabinet()
      return
    }
    control.target = { x: event.point.x, z: event.point.z }
  }

  return (
    <group>
      <color attach="background" args={["#f4eadc"]} />
      <hemisphereLight args={["#fff6ea", "#c4a07a", 0.7]} />
      <ambientLight intensity={0.32} />
      <directionalLight
        position={[3.5, 8, 4]}
        intensity={1.45}
        color="#fff3e2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={24}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0006}
      />
      <pointLight position={[-3.2, 2.6, -1.4]} intensity={6} distance={8} color="#fff1dc" />
      <pointLight position={[3.2, 2.6, 1.6]} intensity={5} distance={8} color="#fff1dc" />

      <ShopFloors wood={wood} tiles={tiles} onWalk={walk} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 5.15]} onClick={walk}>
        <planeGeometry args={[2.2, 1.5]} />
        <ShopMat color="#c4554a" roughness={0.92} />
      </mesh>
      <StreetOutside />
      <Walls maps={walls} />
      <mesh position={[-6.16, 2.2, 3.35]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[2.15, 1.9]} />
        <meshBasicMaterial map={board} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 5.85]} {...pick((event) => { event.stopPropagation(); leave() })}>
        <planeGeometry args={[2.4, 0.55]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <BlueCabinet />
      <WoodCabinet />
      <PlinthTable position={[-3.05, platform.height, -2]} wood={wood} spot="rack" />
      <RoundTable position={[2.85, 0, 0.35]} wood={wood} spot="table" />
      <TrestleTable position={[3.35, 0, 2.85]} wood={wood} spot="shelf" />
      <Counter />
      <PayRing />
      <Player />
      <Shopper />
      <Clerk />
      <WalkMarker />
    </group>
  )
}

function ShopFloors({
  wood,
  tiles,
  onWalk,
}: {
  wood: ReturnType<typeof woodFloorTexture>
  tiles: ReturnType<typeof shopTileTexture>
  onWalk: (event: ThreeEvent<MouseEvent>) => void
}) {
  const width = platform.maxX - platform.minX
  const depth = platform.maxZ - platform.minZ
  const centerX = (platform.minX + platform.maxX) / 2
  const centerZ = (platform.minZ + platform.maxZ) / 2
  const { tread, treads, height } = platform
  const southSpan = width + tread * treads
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0.6]} receiveShadow onClick={onWalk}>
        <planeGeometry args={[12.5, 10.85]} />
        <ShopMat map={tiles} roughness={0.62} />
      </mesh>
      <mesh position={[centerX, height / 2, centerZ]} receiveShadow onClick={onWalk}>
        <boxGeometry args={[width, height, depth]} />
        <ShopMat color="#8d6844" roughness={0.82} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, height + 0.006, centerZ]} receiveShadow onClick={onWalk}>
        <planeGeometry args={[width - 0.04, depth - 0.04]} />
        <ShopMat map={wood} roughness={0.78} />
      </mesh>
      {Array.from({ length: treads }, (_, index) => {
        const stepHeight = (height * (treads - index)) / (treads + 1)
        const z = platform.maxZ + tread * index + tread / 2
        const x = platform.maxX + tread * index + tread / 2
        return (
          <group key={index}>
            <mesh position={[platform.minX + southSpan / 2, stepHeight / 2, z]} receiveShadow onClick={onWalk}>
              <boxGeometry args={[southSpan, stepHeight, tread - 0.03]} />
              <ShopMat color={index % 2 === 0 ? "#c4a06e" : "#b48a5c"} roughness={0.74} />
            </mesh>
            <mesh position={[platform.minX + southSpan / 2, stepHeight + 0.012, z + tread / 2 - 0.04]}>
              <boxGeometry args={[southSpan, 0.025, 0.06]} />
              <ShopMat color="#ead7b4" roughness={0.62} />
            </mesh>
            <mesh position={[x, stepHeight / 2, platform.minZ + depth / 2]} receiveShadow onClick={onWalk}>
              <boxGeometry args={[tread - 0.03, stepHeight, depth]} />
              <ShopMat color={index % 2 === 0 ? "#c4a06e" : "#b48a5c"} roughness={0.74} />
            </mesh>
            <mesh position={[x + tread / 2 - 0.04, stepHeight + 0.012, platform.minZ + depth / 2]}>
              <boxGeometry args={[0.06, 0.025, depth]} />
              <ShopMat color="#ead7b4" roughness={0.62} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function Walls({ maps }: { maps: { back: ReturnType<typeof shopWallTexture>; side: ReturnType<typeof shopWallTexture>; front: ReturnType<typeof shopWallTexture> } }) {
  return (
    <group>
      <WallRun map={maps.back} axis="x" at={-4.9} span={12.6} windows={[-3.4, 2.8]} />
      <WallRun map={maps.side} axis="z" at={-6.3} span={11.2} origin={0.6} windows={[2.6]} />
      <WallRun map={maps.side} axis="z" at={6.3} span={11.2} origin={0.6} windows={[1.1, 4.2]} flip />
      <mesh position={[-4.9, 0.85, 6.05]} receiveShadow>
        <boxGeometry args={[2.8, 1.7, 0.16]} />
        <ShopMat map={maps.front} roughness={0.86} />
      </mesh>
      <mesh position={[4.9, 0.85, 6.05]} receiveShadow>
        <boxGeometry args={[2.8, 1.7, 0.16]} />
        <ShopMat map={maps.front} roughness={0.86} />
      </mesh>
    </group>
  )
}

function WallRun({
  map,
  axis,
  at,
  span,
  origin = 0,
  windows,
  flip = false,
}: {
  map: ReturnType<typeof shopWallTexture>
  axis: "x" | "z"
  at: number
  span: number
  origin?: number
  windows: number[]
  flip?: boolean
}) {
  const height = 3.4
  const thick = 0.16
  const hole = 1.7
  const sill = 1.05
  const head = 2.35
  const start = origin - span / 2
  const cuts = [...windows].sort((a, b) => a - b)
  const piers: Array<[number, number]> = []
  let cursor = start
  for (const center of cuts) {
    const left = center - hole / 2
    if (left > cursor + 0.05) piers.push([cursor, left])
    cursor = center + hole / 2
  }
  if (start + span > cursor + 0.05) piers.push([cursor, start + span])
  const box = (wide: number, tall: number): [number, number, number] =>
    axis === "x" ? [wide, tall, thick] : [thick, tall, wide]
  const place = (along: number, y: number): [number, number, number] =>
    axis === "x" ? [along, y, at] : [at, y, along]
  const yaw = axis === "x" ? 0 : flip ? -Math.PI / 2 : Math.PI / 2
  return (
    <group>
      <WallSlice map={map} position={place(origin, sill / 2)} args={box(span, sill)} v0={0} v1={sill / height} />
      <WallSlice map={map} position={place(origin, (head + height) / 2)} args={box(span, height - head)} v0={head / height} v1={1} />
      {piers.map(([from, to]) => (
        <WallSlice
          key={`${from}-${to}`}
          map={map}
          position={place((from + to) / 2, (sill + head) / 2)}
          args={box(to - from, head - sill)}
          v0={sill / height}
          v1={head / height}
        />
      ))}
      {cuts.map((center) => (
        <ShopWindow key={center} position={place(center, (sill + head) / 2)} rotation={[0, yaw, 0]} width={hole} height={head - sill} />
      ))}
    </group>
  )
}

function WallSlice({
  map,
  position,
  args,
  v0,
  v1,
}: {
  map: ReturnType<typeof shopWallTexture>
  position: [number, number, number]
  args: [number, number, number]
  v0: number
  v1: number
}) {
  const sliced = useMemo(() => {
    const next = map.clone()
    next.offset.set(map.offset.x, v0)
    next.repeat.set(map.repeat.x, Math.max(v1 - v0, 0.02))
    next.needsUpdate = true
    return next
  }, [map, v0, v1])
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={args} />
      <ShopMat map={sliced} roughness={0.86} />
    </mesh>
  )
}

function ShopWindow({
  position,
  rotation,
  width,
  height,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  width: number
  height: number
}) {
  const rail = 0.06
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[width - 0.04, height - 0.04, 0.02]} />
        <meshStandardMaterial color="#d7eef8" transparent opacity={0.18} roughness={0.05} metalness={0.05} />
      </mesh>
      <mesh position={[0, height / 2 - rail / 2, 0.02]}>
        <boxGeometry args={[width, rail, 0.05]} />
        <ShopMat color="#f7f4ee" roughness={0.5} />
      </mesh>
      <mesh position={[0, -height / 2 + rail / 2, 0.02]}>
        <boxGeometry args={[width, rail, 0.05]} />
        <ShopMat color="#f7f4ee" roughness={0.5} />
      </mesh>
      <mesh position={[-width / 2 + rail / 2, 0, 0.02]}>
        <boxGeometry args={[rail, height, 0.05]} />
        <ShopMat color="#f7f4ee" roughness={0.5} />
      </mesh>
      <mesh position={[width / 2 - rail / 2, 0, 0.02]}>
        <boxGeometry args={[rail, height, 0.05]} />
        <ShopMat color="#f7f4ee" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[rail * 0.7, height - rail, 0.03]} />
        <ShopMat color="#f4efe6" roughness={0.5} />
      </mesh>
    </group>
  )
}

function StreetOutside() {
  const bush = (position: [number, number, number], scale = 1) => (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.42, 14, 12]} />
        <ShopMat color="#6eae58" roughness={0.85} />
      </mesh>
      <mesh position={[0.28, 0.42, 0.1]}>
        <sphereGeometry args={[0.3, 12, 10]} />
        <ShopMat color="#8bc46e" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.24, 8]} />
        <ShopMat color="#6a4a2c" roughness={0.8} />
      </mesh>
    </group>
  )
  return (
    <group>
      <mesh position={[0, 2.4, -16]}>
        <planeGeometry args={[36, 10]} />
        <meshBasicMaterial color="#b9ddf2" />
      </mesh>
      <mesh position={[-14, 2.2, 0.4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[28, 9]} />
        <meshBasicMaterial color="#c5e4f5" />
      </mesh>
      <mesh position={[14, 2.2, 0.4]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[28, 9]} />
        <meshBasicMaterial color="#c5e4f5" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -6.3]}>
        <planeGeometry args={[20, 2]} />
        <ShopMat color="#7fbf62" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -9.8]}>
        <planeGeometry args={[20, 5]} />
        <ShopMat color="#9aa0a6" roughness={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, -13.4]}>
        <planeGeometry args={[20, 2.4]} />
        <ShopMat color="#7fbf62" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-9.4, -0.01, 0.6]}>
        <planeGeometry args={[4.4, 16]} />
        <ShopMat color="#9aa0a6" roughness={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12.6, -0.02, 0.6]}>
        <planeGeometry args={[2.4, 16]} />
        <ShopMat color="#7fbf62" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9.4, -0.01, 0.6]}>
        <planeGeometry args={[4.4, 16]} />
        <ShopMat color="#9aa0a6" roughness={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12.6, -0.02, 0.6]}>
        <planeGeometry args={[2.4, 16]} />
        <ShopMat color="#7fbf62" roughness={0.9} />
      </mesh>
      {bush([-7.3, 0, 4.4], 1.7)}
      {bush([-7.4, 0, 0.6], 1.5)}
      {bush([-7.2, 0, -2.4], 1.6)}
      {bush([7.35, 0, -0.4], 1.6)}
      {bush([7.4, 0, 2.7], 1.5)}
      {bush([7.3, 0, 5.6], 1.6)}
      {bush([-5.2, 0, -8.4], 1.8)}
      {bush([-1.2, 0, -8.2], 1.6)}
      {bush([4.8, 0, -8.3], 1.7)}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -9.8]}>
        <planeGeometry args={[0.16, 5]} />
        <ShopMat color="#f4f1ea" roughness={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-9.4, 0.015, 0.6]}>
        <planeGeometry args={[4.4, 0.14]} />
        <ShopMat color="#f4f1ea" roughness={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[9.4, 0.015, 0.6]}>
        <planeGeometry args={[4.4, 0.14]} />
        <ShopMat color="#f4f1ea" roughness={0.55} />
      </mesh>
      <mesh position={[-7.55, 0.48, 2.75]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <ShopMat color="#f08a7a" roughness={0.6} />
      </mesh>
      <mesh position={[7.6, 0.46, 1.25]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <ShopMat color="#f2c14e" roughness={0.6} />
      </mesh>
    </group>
  )
}

function BlueCabinet() {
  const open = useShop((state) => state.cabinet) === "blue"
  const items = suppliesIn("blue")
  const spots: Record<string, [number, number, number]> = {
    pencil: [-0.02, 1.08, -0.75],
    eraser: [-0.02, 1.08, -0.25],
    ruler: [-0.02, 1.08, 0.25],
    case: [-0.02, 1.08, 0.75],
  }
  return (
    <group position={[5.9, 0, -1.5]} rotation={[0, Math.PI, 0]}>
      <HollowCabinet width={2.4} depth={0.7} color="#d7e3ea" shelf="#5aa0c8" axis="x" />
      <Hinge position={[0.38, 0, 1.15]} open={open} swing={-2.35}>
        <group position={[0.02, 0.95, -1.12]}>
          <GlassDoor length={2.2} height={1.42} along="z" frame="#8ea4b4" onOpen={toggle("blue")} />
        </group>
        <mesh position={[0.06, 0.95, -2.15]} {...pick(toggle("blue"))}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <ShopMat color="#e6b15a" metalness={0.35} roughness={0.4} />
        </mesh>
      </Hinge>
      {items.map((item) => (
        <ShelfItem key={item.id} id={item.id} position={spots[item.id]} cabinet="blue" scale={1.65} tag={[0, 0.38, 0.16]} label={1.2} />
      ))}
    </group>
  )
}

function WoodCabinet() {
  const open = useShop((state) => state.cabinet) === "wood"
  const items = suppliesIn("wood")
  const spots: Record<string, [number, number, number]> = {
    notebook: [-0.7, 1.08, 0.02],
    folder: [0.05, 1.08, 0.02],
    notes: [0.75, 1.08, 0.02],
  }
  return (
    <group position={[3.5, 0, -4.28]}>
      <HollowCabinet width={2.6} depth={0.66} color="#c9844a" shelf="#e7c9a0" axis="z" />
      <Hinge position={[-1.25, 0, 0.34]} open={open} swing={-1.55}>
        <group position={[1.22, 0.95, 0.02]}>
          <GlassDoor length={2.4} height={1.42} along="x" frame="#a56b3c" onOpen={toggle("wood")} />
        </group>
        <mesh position={[2.25, 0.95, 0.07]} {...pick(toggle("wood"))}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <ShopMat color="#e6b15a" metalness={0.35} roughness={0.4} />
        </mesh>
      </Hinge>
      {items.map((item) => (
        <ShelfItem key={item.id} id={item.id} position={spots[item.id]} cabinet="wood" />
      ))}
    </group>
  )
}

function HollowCabinet({
  width,
  depth,
  color,
  shelf,
  axis,
}: {
  width: number
  depth: number
  color: string
  shelf: string
  axis: "x" | "z"
}) {
  const along = axis === "x" ? "z" : "x"
  const side = 0.06
  return (
    <group>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={axis === "x" ? [depth, 0.16, width] : [width, 0.16, depth]} />
        <ShopMat color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.68, 0]}>
        <boxGeometry args={axis === "x" ? [depth, 0.08, width] : [width, 0.08, depth]} />
        <ShopMat color={color} roughness={0.7} />
      </mesh>
      <mesh position={axis === "x" ? [-depth / 2 + side / 2, 0.88, 0] : [0, 0.88, -depth / 2 + side / 2]} castShadow>
        <boxGeometry args={axis === "x" ? [side, 1.6, width] : [width, 1.6, side]} />
        <ShopMat color={color} roughness={0.72} />
      </mesh>
      <mesh position={along === "z" ? [0, 0.88, -width / 2 + side] : [-width / 2 + side, 0.88, 0]}>
        <boxGeometry args={axis === "x" ? [depth - 0.04, 1.6, side] : [side, 1.6, depth - 0.04]} />
        <ShopMat color={color} roughness={0.7} />
      </mesh>
      <mesh position={along === "z" ? [0, 0.88, width / 2 - side] : [width / 2 - side, 0.88, 0]}>
        <boxGeometry args={axis === "x" ? [depth - 0.04, 1.6, side] : [side, 1.6, depth - 0.04]} />
        <ShopMat color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.02, 0]} receiveShadow>
        <boxGeometry args={axis === "x" ? [depth - 0.12, 0.05, width - 0.16] : [width - 0.16, 0.05, depth - 0.12]} />
        <ShopMat color={shelf} roughness={0.62} />
      </mesh>
    </group>
  )
}

function Hinge({
  position,
  open,
  swing,
  children,
}: {
  position: [number, number, number]
  open: boolean
  swing: number
  children: ReactNode
}) {
  const ref = useRef<Group>(null)
  useFrame((_, delta) => {
    const hinge = ref.current
    if (!hinge) return
    const target = open ? swing : 0
    hinge.rotation.y += (target - hinge.rotation.y) * Math.min(1, delta * 6)
  })
  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  )
}

function ShelfItem({
  id,
  position,
  cabinet,
  tag = [0, 0.46, 0.12],
  scale = 1.15,
  label = 1,
  seat = false,
}: {
  id: SupplyId
  position: [number, number, number]
  cabinet: Spot
  tag?: [number, number, number]
  scale?: number
  label?: number
  seat?: boolean
}) {
  const item = supplies[id]
  const open = useShop((state) => state.cabinet)
  const [hover, setHover] = useState(false)
  const showTag = hover && (open === null || open === cabinet)
  const choose = pick(take(id, cabinet))
  return (
    <group position={position}>
      <group
        position={[0, seat ? seatLift(id, scale) : 0, 0]}
        scale={scale}
        {...choose}
        onPointerOver={(event) => {
          choose.onPointerOver(event)
          setHover(true)
        }}
        onPointerOut={() => {
          choose.onPointerOut()
          setHover(false)
        }}
      >
        <SupplyMesh id={id} />
      </group>
      {showTag ? <PriceTag name={item.name} priceJiao={item.priceJiao} position={tag} scale={Math.min(label, 1.05)} /> : null}
    </group>
  )
}

const goodsBottom: Partial<Record<SupplyId, number>> = {
  crayon: -0.1,
  bookmark: -0.04,
  pencil: -0.32,
  marker: 0.01,
  pen: 0.02,
}

function seatLift(id: SupplyId, scale: number) {
  const bottom = goodsBottom[id] ?? 0.02
  return Math.max(0.02, -bottom * scale + 0.02)
}

function GlassDoor({
  length,
  height,
  along,
  frame,
  onOpen,
}: {
  length: number
  height: number
  along: "x" | "z"
  frame: string
  onOpen: (event: ThreeEvent<MouseEvent>) => void
}) {
  const rail = 0.055
  const depth = 0.04
  const box = (wide: number, tall: number, thin: number): [number, number, number] =>
    along === "z" ? [thin, tall, wide] : [wide, tall, thin]
  const at = (wide: number, y: number, thin = 0): [number, number, number] =>
    along === "z" ? [thin, y, wide] : [wide, y, thin]
  const glass = "#d5eaf2"
  return (
    <group>
      <mesh position={at(0, 0, 0)} {...pick(onOpen)}>
        <boxGeometry args={box(length - rail * 2, height - rail * 2, 0.012)} />
        <meshStandardMaterial color={glass} transparent opacity={0.22} roughness={0.05} metalness={0.12} depthWrite={false} />
      </mesh>
      <mesh position={at(0, height / 2 - rail / 2)} castShadow {...pick(onOpen)}>
        <boxGeometry args={box(length, rail, depth)} />
        <ShopMat color={frame} roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={at(0, -height / 2 + rail / 2)} castShadow {...pick(onOpen)}>
        <boxGeometry args={box(length, rail, depth)} />
        <ShopMat color={frame} roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={at(-length / 2 + rail / 2, 0)} castShadow {...pick(onOpen)}>
        <boxGeometry args={box(rail, height, depth)} />
        <ShopMat color={frame} roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={at(length / 2 - rail / 2, 0)} castShadow {...pick(onOpen)}>
        <boxGeometry args={box(rail, height, depth)} />
        <ShopMat color={frame} roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={at(0, 0)} {...pick(onOpen)}>
        <boxGeometry args={box(rail * 0.7, height - rail * 2, depth * 0.7)} />
        <ShopMat color={frame} roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  )
}

function TableGoods({ spot, y, gap }: { spot: Spot; y: number; gap: number }) {
  const items = suppliesIn(spot)
  return (
    <>
      {items.map((item, index) => {
        const x = (index - (items.length - 1) / 2) * gap
        return (
          <group key={item.id} position={[x, y, 0]}>
            <mesh position={[0, 0.015, 0]} receiveShadow>
              <boxGeometry args={[0.34, 0.03, 0.28]} />
              <ShopMat color="#f6f1e8" roughness={0.84} />
            </mesh>
            <ShelfItem id={item.id} position={[0, 0.03, 0]} cabinet={spot} scale={1.55} label={1.45} tag={[0, 0.5, 0.16]} seat />
          </group>
        )
      })}
    </>
  )
}

function PlinthTable({
  position,
  wood,
  spot,
}: {
  position: [number, number, number]
  wood: ReturnType<typeof woodFloorTexture>
  spot: Spot
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.9, 0.5, 1.05]} />
        <ShopMat color="#8d5a34" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0.55, -0.48]} castShadow>
        <boxGeometry args={[2.9, 0.22, 0.06]} />
        <ShopMat color="#6e4324" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.56, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.15, 0.06, 1.2]} />
        <ShopMat map={wood} color="#f3e2c8" roughness={0.55} />
      </mesh>
      <TableGoods spot={spot} y={0.6} gap={0.78} />
    </group>
  )
}

function RoundTable({
  position,
  wood,
  spot,
}: {
  position: [number, number, number]
  wood: ReturnType<typeof woodFloorTexture>
  spot: Spot
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[0.38, 0.42, 0.05, 24]} />
        <ShopMat color="#c5ccd1" metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.07, 0.6, 16]} />
        <ShopMat color="#d5dbe0" metalness={0.78} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.95, 0.95, 0.06, 32]} />
        <ShopMat map={wood} color="#e7c9a0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.74, 0]}>
        <torusGeometry args={[0.86, 0.035, 10, 36]} />
        <ShopMat color="#d7dbdf" metalness={0.7} roughness={0.28} />
      </mesh>
      <TableGoods spot={spot} y={0.74} gap={0.48} />
    </group>
  )
}

function TrestleTable({
  position,
  wood,
  spot,
}: {
  position: [number, number, number]
  wood: ReturnType<typeof woodFloorTexture>
  spot: Spot
}) {
  return (
    <group position={position}>
      {[-1.05, 1.05].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.36, -0.28]} rotation={[0, 0, 0.18]} castShadow>
            <boxGeometry args={[0.07, 0.7, 0.07]} />
            <ShopMat color="#3e2a1c" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.36, 0.28]} rotation={[0, 0, -0.18]} castShadow>
            <boxGeometry args={[0.07, 0.7, 0.07]} />
            <ShopMat color="#3e2a1c" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.08, 0.06, 0.62]} />
            <ShopMat color="#6e4a2e" roughness={0.65} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[2.15, 0.05, 0.08]} />
        <ShopMat color="#6e4a2e" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.25, 0.08, 0.95]} />
        <ShopMat map={wood} color="#6b4630" roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.86, -0.42]} castShadow>
        <boxGeometry args={[3.1, 0.16, 0.05]} />
        <ShopMat color="#3e2a1c" roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.7, 0.46]}>
        <boxGeometry args={[3.1, 0.06, 0.05]} />
        <ShopMat color="#e6d3b4" roughness={0.6} />
      </mesh>
      {[-0.78, 0, 0.78].map((x) => (
        <mesh key={x} position={[x, 0.84, 0]}>
          <boxGeometry args={[0.025, 0.1, 0.7]} />
          <ShopMat color="#e7d7c0" roughness={0.7} />
        </mesh>
      ))}
      <TableGoods spot={spot} y={0.8} gap={0.78} />
    </group>
  )
}

function Counter() {
  return (
    <group position={[-4.05, 0, 4.45]} rotation={[0, Math.PI / 2, 0]} {...pick(openCounter)}>
      <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.55, 0.92, 0.72]} />
        <ShopMat color="#a56b3c" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0.94, 0]} receiveShadow>
        <boxGeometry args={[1.66, 0.06, 0.82]} />
        <ShopMat color="#f0ddc0" roughness={0.48} />
      </mesh>
      <mesh position={[-0.15, 1.16, -0.05]} castShadow>
        <boxGeometry args={[0.36, 0.26, 0.28]} />
        <ShopMat color="#f7f4ea" roughness={0.5} />
      </mesh>
      <mesh position={[-0.15, 1.2, 0.1]}>
        <boxGeometry args={[0.24, 0.12, 0.02]} />
        <meshBasicMaterial color="#243044" />
      </mesh>
      <TenderPile />
      <group position={[0.42, 0.97, 0.12]}>
        <PencilCup />
      </group>
      <group position={[0.15, 0.97, -0.18]}>
        <TapeRoll />
      </group>
      <PriceTag name="收银台" position={[0, 1.55, 0.2]} />
    </group>
  )
}

function TenderPile() {
  const tender = useShop((state) => state.tender)
  const piles = bills.flatMap((bill) =>
    Array.from({ length: Math.min(tender[bill.id], 4) }, (_, index) => ({ bill, index })),
  )
  return (
    <group position={[-0.45, 0.98, 0.05]}>
      {piles.map((pile, index) => (
        <mesh key={`${pile.bill.id}-${pile.index}`} position={[(index % 3) * 0.12, pile.index * 0.015, Math.floor(index / 3) * 0.1]}>
          {pile.bill.kind === "coin" ? (
            <cylinderGeometry args={[0.045, 0.045, 0.015, 16]} />
          ) : (
            <boxGeometry args={[0.11, 0.01, 0.06]} />
          )}
          <ShopMat color={pile.bill.color} roughness={0.45} />
        </mesh>
      ))}
    </group>
  )
}

function PayRing() {
  const count = useShop((state) => state.cart.length)
  const open = useShop((state) => state.registerOpen)
  const ring = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!ring.current) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 4) * 0.08
    ring.current.scale.setScalar(pulse)
  })
  if (count === 0 || open) return null
  return (
    <group ref={ring} position={[counterSpot.x, 0.03, counterSpot.z]} {...pick(openCounter)}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.4, 28]} />
        <meshBasicMaterial color="#e07a5f" transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

function toggle(id: CabinetId) {
  return (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const state = useShop.getState()
    if (state.cabinet === id) state.closeCabinet()
    else state.openCabinet(id)
  }
}

function take(id: SupplyId, cabinet: Spot) {
  return (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    const state = useShop.getState()
    if ((cabinet === "blue" || cabinet === "wood") && state.cabinet !== cabinet) {
      state.openCabinet(cabinet)
      return
    }
    state.add(id)
  }
}

function openCounter(event: ThreeEvent<MouseEvent>) {
  event.stopPropagation()
  useShop.getState().summonClerk()
}

function priceBoard() {
  return paintTexture((context, size) => {
    context.fillStyle = "#2f4a3e"
    context.fillRect(0, 0, size, size)
    context.strokeStyle = "#e7b56a"
    context.lineWidth = 16
    context.strokeRect(14, 14, size - 28, size - 28)
    context.fillStyle = "#f6efe2"
    context.textAlign = "center"
    context.font = "700 58px 'Microsoft YaHei', sans-serif"
    context.fillText("价目表", size / 2, 88)
    context.font = "600 30px 'Microsoft YaHei', sans-serif"
    const columnSize = Math.ceil(supplyList.length / 2)
    supplyList.forEach((item, index) => {
      const column = index < columnSize ? 0 : 1
      const row = column === 0 ? index : index - columnSize
      const left = column === 0 ? 28 : size / 2 + 12
      const right = column === 0 ? size / 2 - 16 : size - 28
      const y = 128 + row * 40
      context.textAlign = "left"
      context.fillText(item.name, left, y)
      context.textAlign = "right"
      context.fillText(formatMoney(item.priceJiao), right, y)
    })
  }, 1, 1, 512)
}
