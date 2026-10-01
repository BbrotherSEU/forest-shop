import { useEffect, useMemo } from "react"
import type { ThreeEvent } from "@react-three/fiber"
import { suppliesIn, type SupplyId } from "../game/catalog.ts"
import { control } from "../game/control.ts"
import { useShop } from "../game/store.ts"
import { paintTexture, signTexture, toonGradient } from "./materials.ts"
import { Player, WalkMarker } from "./Player.tsx"
import { Toon } from "./Toon.tsx"

export function Interior() {
  const checker = useMemo(
    () =>
      paintTexture((context, size) => {
        const cell = size / 2
        context.fillStyle = "#f4efe4"
        context.fillRect(0, 0, size, size)
        context.fillStyle = "#b7d4ea"
        context.fillRect(cell, 0, cell, cell)
        context.fillRect(0, cell, cell, cell)
      }, 6, 3),
    [],
  )
  const wood = useMemo(
    () =>
      paintTexture((context, size) => {
        context.fillStyle = "#e0a15a"
        context.fillRect(0, 0, size, size)
        context.fillStyle = "#c9844a"
        for (let row = 0; row < 8; row += 1) {
          context.fillRect(0, row * 32, size, 3)
        }
      }, 4, 3),
    [],
  )
  const blueSign = useMemo(() => signTexture("文具", "#5aa6d6", "#fffaf3"), [])
  const woodSign = useMemo(() => signTexture("本子", "#e7b56a", "#fffaf3"), [])
  useEffect(
    () => () => {
      checker.dispose()
      wood.dispose()
      blueSign.dispose()
      woodSign.dispose()
    },
    [checker, wood, blueSign, woodSign],
  )

  const openBlue = useShop((state) => state.openCabinet)
  const add = useShop((state) => state.add)
  const leave = useShop((state) => state.leave)

  function walk(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation()
    if (event.button !== 0) return
    control.target = { x: event.point.x, z: event.point.z }
    useShop.getState().closeCabinet()
  }

  return (
    <group>
      <color attach="background" args={["#c5e6f6"]} />
      <hemisphereLight args={["#fff8ee", "#f3d7b0", 0.45]} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[4, 9, 6]} intensity={1.45} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 3.55]} onClick={walk}>
        <planeGeometry args={[13.2, 6.6]} />
        <meshToonMaterial map={checker} gradientMap={toonGradient()} />
      </mesh>
      <mesh position={[0, 0.25, -2.55]} onClick={walk}>
        <boxGeometry args={[13.2, 0.5, 5.2]} />
        <meshToonMaterial map={wood} gradientMap={toonGradient()} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.51, -2.4]} onClick={walk}>
        <planeGeometry args={[6.2, 3.2]} />
        <Toon color="#6eadd4" />
      </mesh>
      <Steps onClick={walk} />

      <Walls />
      <Bunting />
      <Rug />
      <Fan />
      <DisplayTable onAdd={add} />
      <BlueCabinet sign={blueSign} onOpen={() => openBlue("blue")} />
      <WoodCabinet sign={woodSign} onOpen={() => openBlue("wood")} />
      <Bench />
      <Bin />
      <Shopkeeper />
      <DoorHome onLeave={leave} />
      <Poster />
      <Player />
      <WalkMarker />
    </group>
  )
}

function Steps({ onClick }: { onClick: (event: ThreeEvent<MouseEvent>) => void }) {
  return (
    <group>
      {[0, 1, 2].map((step) => (
        <mesh key={step} position={[0, 0.08 + step * 0.14, 1.15 - step * 0.38]} onClick={onClick}>
          <boxGeometry args={[4.2, 0.16, 0.42]} />
          <Toon color={step % 2 === 0 ? "#e7b56a" : "#d39a52"} />
        </mesh>
      ))}
    </group>
  )
}

function Walls() {
  return (
    <group>
      <mesh position={[0, 1.8, -5.15]}>
        <boxGeometry args={[13.4, 3.6, 0.2]} />
        <Toon color="#f6efe2" />
      </mesh>
      <mesh position={[-6.7, 1.8, 0.6]}>
        <boxGeometry args={[0.2, 3.6, 11.6]} />
        <Toon color="#f3e7d2" />
      </mesh>
      <mesh position={[6.7, 1.8, 0.6]}>
        <boxGeometry args={[0.2, 3.6, 11.6]} />
        <Toon color="#f3e7d2" />
      </mesh>
      <mesh position={[-6.55, 1.7, 1.2]}>
        <boxGeometry args={[0.08, 1.2, 1.5]} />
        <Toon color="#d7eef8" />
      </mesh>
      <mesh position={[0, 0.12, -5.02]}>
        <boxGeometry args={[13.2, 0.24, 0.08]} />
        <Toon color="#e7b56a" />
      </mesh>
    </group>
  )
}

function Bunting() {
  return (
    <group position={[0, 3.15, -5.02]}>
      {[-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2].map((x, index) => (
        <mesh key={x} position={[x, 0, 0.02]} rotation={[0, 0, index % 2 === 0 ? 0.15 : -0.15]}>
          <coneGeometry args={[0.16, 0.28, 3]} />
          <Toon color={index % 2 === 0 ? "#f08a7a" : "#f2c14e"} />
        </mesh>
      ))}
    </group>
  )
}

function Rug() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.55, 0.02, 4.15]}>
      <planeGeometry args={[2.5, 2.1]} />
      <Toon color="#5aa6d6" />
    </mesh>
  )
}

function Fan() {
  return (
    <group position={[-4.7, 0, 4.15]}>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.55, 0.08, 0.4]} />
        <Toon color="#f7f4ea" />
      </mesh>
      <mesh position={[0, 0.38, 0]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.08, 16]} />
        <Toon color="#f08a7a" />
      </mesh>
      <mesh position={[0, 0.38, 0.05]}>
        <boxGeometry args={[0.04, 0.36, 0.02]} />
        <Toon color="#fffaf3" />
      </mesh>
    </group>
  )
}

function DisplayTable({ onAdd }: { onAdd: (id: SupplyId) => void }) {
  return (
    <group position={[-4.3, 0, 2.15]}>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[1.3, 0.5, 0.7]} />
        <Toon color="#e7b56a" />
      </mesh>
      <ClickGoods id="marker" position={[-0.28, 0.62, 0]} onAdd={onAdd} />
      <ClickGoods id="glue" position={[0.28, 0.58, 0]} onAdd={onAdd} />
    </group>
  )
}

function ClickGoods({
  id,
  position,
  onAdd,
}: {
  id: SupplyId
  position: [number, number, number]
  onAdd: (id: SupplyId) => void
}) {
  return (
    <mesh
      position={position}
      onClick={(event) => {
        event.stopPropagation()
        onAdd(id)
      }}
    >
      {id === "marker" ? <boxGeometry args={[0.28, 0.5, 0.28]} /> : <cylinderGeometry args={[0.16, 0.18, 0.36, 12]} />}
      <Toon color={id === "marker" ? "#ef6f6c" : "#8dce7a"} />
    </mesh>
  )
}

function BlueCabinet({ sign, onOpen }: { sign: ReturnType<typeof signTexture>; onOpen: () => void }) {
  return (
    <group position={[4.65, 0, 2.35]} onClick={(event) => { event.stopPropagation(); onOpen() }}>
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[2.7, 0.96, 1.45]} />
        <Toon color="#5aa6d6" />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[2.85, 0.12, 1.58]} />
        <Toon color="#f4d7a8" />
      </mesh>
      <mesh position={[-0.55, 0.48, 0.74]}>
        <boxGeometry args={[1.05, 0.7, 0.04]} />
        <Toon color="#3d7ec4" />
      </mesh>
      <mesh position={[0.7, 0.48, 0.74]}>
        <boxGeometry args={[1.05, 0.7, 0.04]} />
        <Toon color="#3d7ec4" />
      </mesh>
      <mesh position={[0, 1.35, 0]}>
        <planeGeometry args={[1.1, 0.42]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {suppliesIn("blue").map((item, index) => (
        <mesh key={item.id} position={[-0.9 + index * 0.55, 1.16, 0.2]}>
          <boxGeometry args={[0.22, 0.16, 0.22]} />
          <Toon color={item.swatch} />
        </mesh>
      ))}
    </group>
  )
}

function WoodCabinet({ sign, onOpen }: { sign: ReturnType<typeof signTexture>; onOpen: () => void }) {
  return (
    <group position={[-3.5, 0.5, -4.15]} onClick={(event) => { event.stopPropagation(); onOpen() }}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[2.6, 1.4, 0.7]} />
        <Toon color="#e7b56a" />
      </mesh>
      <mesh position={[0, 0.7, 0.37]}>
        <boxGeometry args={[2.2, 1.05, 0.04]} />
        <Toon color="#f3ddb8" />
      </mesh>
      <mesh position={[0, 1.55, 0.05]}>
        <planeGeometry args={[1.1, 0.42]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Bench() {
  return (
    <group position={[3.15, 0.5, -1.7]}>
      <mesh position={[-0.9, 0.22, 0]}>
        <boxGeometry args={[0.1, 0.44, 0.1]} />
        <Toon color="#8a5a32" />
      </mesh>
      <mesh position={[0.9, 0.22, 0]}>
        <boxGeometry args={[0.1, 0.44, 0.1]} />
        <Toon color="#8a5a32" />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[2.3, 0.1, 0.55]} />
        <Toon color="#d39a52" />
      </mesh>
    </group>
  )
}

function Bin() {
  return (
    <mesh position={[-1.15, 0.85, -3.6]}>
      <cylinderGeometry args={[0.28, 0.24, 0.55, 12]} />
      <Toon color="#c5ccd1" />
    </mesh>
  )
}

function Shopkeeper() {
  return (
    <group position={[4.65, 0, 1.05]} rotation={[0, 0, 0]}>
      <mesh position={[0, 0.7, 0]}>
        <capsuleGeometry args={[0.2, 0.32, 4, 8]} />
        <Toon color="#fffaf3" />
      </mesh>
      <mesh position={[0, 0.62, 0.12]}>
        <boxGeometry args={[0.32, 0.28, 0.06]} />
        <Toon color="#f08a7a" />
      </mesh>
      <mesh position={[0, 1.18, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <Toon color="#ffd7c2" />
      </mesh>
      <mesh position={[0, 1.28, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <Toon color="#8a5a32" />
      </mesh>
    </group>
  )
}

function DoorHome({ onLeave }: { onLeave: () => void }) {
  return (
    <group position={[0, 0, 6.05]} onClick={(event) => { event.stopPropagation(); onLeave() }}>
      <mesh position={[-0.7, 1.05, 0]}>
        <boxGeometry args={[0.12, 2.1, 0.12]} />
        <Toon color="#8a5a32" />
      </mesh>
      <mesh position={[0.7, 1.05, 0]}>
        <boxGeometry args={[0.12, 2.1, 0.12]} />
        <Toon color="#8a5a32" />
      </mesh>
      <mesh position={[0, 2.05, 0]}>
        <boxGeometry args={[1.52, 0.12, 0.12]} />
        <Toon color="#8a5a32" />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[1.2, 1.9, 0.06]} />
        <Toon color="#f3ddb8" />
      </mesh>
    </group>
  )
}

function Poster() {
  const poster = useMemo(() => signTexture("文具", "#f08a7a", "#fffaf3"), [])
  useEffect(() => () => poster.dispose(), [poster])
  return (
    <mesh position={[-6.56, 2.15, -1.5]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[0.9, 1.15]} />
      <meshBasicMaterial map={poster} toneMapped={false} />
    </mesh>
  )
}
