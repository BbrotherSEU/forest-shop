import { useEffect, useMemo } from "react"
import { BackSide } from "three"
import { useShop } from "../game/store.ts"
import { Kirby, Raccoon, RedPanda } from "./animals.tsx"
import { awningTexture, clapboardTexture, grassTexture, pathTexture, roadTexture, shingleTexture, signTexture, skyTexture } from "./materials.ts"
import { pick } from "./pick.ts"
import { ShopMat } from "./surface.tsx"

export function Exterior() {
  const enter = useShop((state) => state.enter)
  const sign = useMemo(() => signTexture("文具店", "#e36a55", "#fffaf3"), [])
  const grass = useMemo(() => grassTexture(), [])
  const path = useMemo(() => pathTexture(), [])
  const road = useMemo(() => roadTexture(), [])
  const sky = useMemo(() => skyTexture(), [])
  const boards = useMemo(() => clapboardTexture(), [])
  const shingles = useMemo(() => shingleTexture(), [])
  const awning = useMemo(() => awningTexture(), [])
  useEffect(
    () => () => {
      sign.dispose()
      grass.dispose()
      path.dispose()
      road.dispose()
      sky.dispose()
      boards.dispose()
      shingles.dispose()
      awning.dispose()
      document.body.style.cursor = "default"
    },
    [sign, grass, path, road, sky, boards, shingles, awning],
  )

  return (
    <group>
      <color attach="background" args={["#9fd0f2"]} />
      <mesh>
        <sphereGeometry args={[40, 28, 18]} />
        <meshBasicMaterial map={sky} side={BackSide} />
      </mesh>
      <hemisphereLight args={["#f4fbff", "#8d9a78", 0.55]} />
      <ambientLight intensity={0.22} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={1.55}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0008}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 2]} receiveShadow>
        <planeGeometry args={[48, 40]} />
        <ShopMat map={grass} roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 4.7]} receiveShadow>
        <planeGeometry args={[16, 2.2]} />
        <ShopMat map={path} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.04, 5.9]} receiveShadow>
        <boxGeometry args={[18, 0.1, 0.22]} />
        <ShopMat color="#c8c2b8" roughness={0.82} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 7.8]} receiveShadow>
        <planeGeometry args={[22, 3.8]} />
        <ShopMat map={road} roughness={0.94} />
      </mesh>
      <Building onEnter={enter} sign={sign} boards={boards} shingles={shingles} awning={awning} />
      <Tree position={[-7.2, 0, 1.2]} scale={1.25} />
      <Tree position={[7.4, 0, 0.6]} scale={1.05} />
      <Tree position={[-6.4, 0, 6.2]} scale={0.72} />
      <Tree position={[6.8, 0, 7.1]} scale={0.64} />
      <Bush position={[-4.8, 0, 3.15]} />
      <Bush position={[4.9, 0, 2.9]} />
      <FlowerBed position={[-2.7, 0, 3.15]} />
      <FlowerBed position={[3.15, 0, 3.35]} />
      <Bench position={[-3.35, 0, 4.85]} />
      <Lamp position={[4.15, 0, 4.7]} />
      <Cloud position={[-5.4, 6.2, -2]} />
      <Cloud position={[4.2, 6.6, -4]} />
      <Mascot />
    </group>
  )
}

function Building({
  onEnter,
  sign,
  boards,
  shingles,
  awning,
}: {
  onEnter: () => void
  sign: ReturnType<typeof signTexture>
  boards: ReturnType<typeof clapboardTexture>
  shingles: ReturnType<typeof shingleTexture>
  awning: ReturnType<typeof awningTexture>
}) {
  return (
    <group>
      <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.4, 3.4, 4.2]} />
        <ShopMat map={boards} />
      </mesh>
      <mesh position={[0, 0.28, 2.16]} castShadow>
        <boxGeometry args={[7.6, 0.56, 0.28]} />
        <ShopMat color="#8a5a32" />
      </mesh>
      <mesh position={[0, 3.4, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[8.2, 0.32, 4.8]} />
        <ShopMat map={shingles} />
      </mesh>
      <mesh position={[0, 3.62, -0.2]}>
        <boxGeometry args={[8.35, 0.16, 0.55]} />
        <ShopMat color="#245e99" />
      </mesh>
      <mesh position={[2.5, 3.95, -0.4]} castShadow>
        <boxGeometry args={[0.46, 0.7, 0.46]} />
        <ShopMat color="#c45c4a" />
      </mesh>
      <mesh position={[2.5, 4.32, -0.4]}>
        <boxGeometry args={[0.62, 0.1, 0.62]} />
        <ShopMat color="#8a5a32" />
      </mesh>
      <mesh position={[-3.62, 1.7, 0]}>
        <boxGeometry args={[0.16, 3.5, 4.5]} />
        <ShopMat color="#c9844a" />
      </mesh>
      <mesh position={[3.62, 1.7, 0]}>
        <boxGeometry args={[0.16, 3.5, 4.5]} />
        <ShopMat color="#c9844a" />
      </mesh>
      <mesh position={[0, 2.55, 2.7]} rotation={[0.4, 0, 0]} castShadow>
        <boxGeometry args={[2.7, 0.06, 1.2]} />
        <ShopMat map={awning} />
      </mesh>
      <mesh position={[0, 2.95, 2.22]}>
        <planeGeometry args={[3.4, 1.05]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      <group position={[0, 1.15, 2.16]} {...pick((event) => { event.stopPropagation(); onEnter() })}>
        <mesh castShadow>
          <boxGeometry args={[1.45, 2.15, 0.12]} />
          <ShopMat color="#f3ddb8" roughness={0.72} />
        </mesh>
        <mesh position={[0, 0.28, 0.07]}>
          <boxGeometry args={[0.72, 0.9, 0.04]} />
          <meshStandardMaterial color="#b9dff2" transparent opacity={0.45} roughness={0.08} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.28, 0.04]}>
          <boxGeometry args={[0.66, 0.82, 0.02]} />
          <ShopMat color="#243044" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.28, 0.09]}>
          <boxGeometry args={[0.04, 0.9, 0.02]} />
          <ShopMat color="#8a5a32" />
        </mesh>
        <mesh position={[0, 0.28, 0.09]}>
          <boxGeometry args={[0.72, 0.04, 0.02]} />
          <ShopMat color="#8a5a32" />
        </mesh>
        <mesh position={[0.48, -0.05, 0.08]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <ShopMat color="#d7a441" metalness={0.55} roughness={0.35} />
        </mesh>
      </group>
      <mesh position={[0, 0.08, 2.55]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.16, 0.42]} />
        <ShopMat color="#c8c2b8" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.02, 2.95]} castShadow receiveShadow>
        <boxGeometry args={[2.05, 0.08, 0.38]} />
        <ShopMat color="#b7b1a6" roughness={0.9} />
      </mesh>
      <ShopWindow position={[-2.35, 2.05, 2.16]} />
      <ShopWindow position={[2.35, 2.05, 2.16]} />
      <mesh position={[0, 0.05, 3.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.3, 0.7]} />
        <ShopMat color="#c45c4a" />
      </mesh>
    </group>
  )
}

function ShopWindow({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.25, 1.05, 0.08]} />
        <ShopMat color="#f7f4ea" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.88, 0.7, 0.02]} />
        <ShopMat color="#243044" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.95, 0.78, 0.03]} />
        <meshStandardMaterial color="#d5eef8" transparent opacity={0.42} roughness={0.06} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.04, 0.78, 0.03]} />
        <ShopMat color="#8a5a32" />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.95, 0.04, 0.03]} />
        <ShopMat color="#8a5a32" />
      </mesh>
      <mesh position={[0, -0.62, 0.16]}>
        <boxGeometry args={[1.15, 0.16, 0.28]} />
        <ShopMat color="#8a5a32" />
      </mesh>
      <Flower position={[-0.28, -0.4, 0.2]} color="#f08a7a" />
      <Flower position={[0.28, -0.4, 0.2]} color="#f2c14e" />
    </group>
  )
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 1.5, 8]} />
        <ShopMat color="#8a5a32" />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.72, 18, 18]} />
        <ShopMat color="#3f9a55" />
      </mesh>
      <mesh position={[0.38, 1.95, 0.12]} castShadow>
        <sphereGeometry args={[0.48, 16, 16]} />
        <ShopMat color="#57b36a" />
      </mesh>
      <mesh position={[-0.32, 1.85, -0.08]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <ShopMat color="#2f8a48" />
      </mesh>
    </group>
  )
}

function Bush({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 0.32, 8]} />
        <ShopMat color="#8a5a32" />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow>
        <sphereGeometry args={[0.36, 16, 16]} />
        <ShopMat color="#3f9a55" />
      </mesh>
      <mesh position={[0.22, 0.42, 0.08]}>
        <sphereGeometry args={[0.24, 14, 14]} />
        <ShopMat color="#57b36a" />
      </mesh>
    </group>
  )
}

function FlowerBed({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[1.5, 0.2, 0.48]} />
        <ShopMat color="#8a5a32" />
      </mesh>
      {[-0.48, -0.16, 0.16, 0.48].map((x, index) => (
        <Flower key={x} position={[x, 0.2, 0]} color={index % 2 === 0 ? "#f08a7a" : "#f2c14e"} />
      ))}
    </group>
  )
}

function Flower({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.03, 0.035, 0.44, 6]} />
        <ShopMat color="#3f8f4e" />
      </mesh>
      {[0, 1, 2, 3, 4].map((petal) => (
        <mesh key={petal} position={[Math.cos((petal / 5) * Math.PI * 2) * 0.08, 0.46, Math.sin((petal / 5) * Math.PI * 2) * 0.08]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <ShopMat color={color} />
        </mesh>
      ))}
      <mesh position={[0, 0.46, 0]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <ShopMat color="#f2c14e" />
      </mesh>
    </group>
  )
}

function Cloud({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.55, 16, 16]} />
        <ShopMat color="#fffaf3" />
      </mesh>
      <mesh position={[0.48, 0.08, 0]}>
        <sphereGeometry args={[0.38, 16, 16]} />
        <ShopMat color="#ffffff" />
      </mesh>
      <mesh position={[-0.42, 0.05, 0.05]}>
        <sphereGeometry args={[0.34, 16, 16]} />
        <ShopMat color="#ffffff" />
      </mesh>
    </group>
  )
}

function Bench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[-0.55, 0.28, 0]} castShadow>
        <boxGeometry args={[0.08, 0.56, 0.42]} />
        <ShopMat color="#6d4a32" roughness={0.8} />
      </mesh>
      <mesh position={[0.55, 0.28, 0]} castShadow>
        <boxGeometry args={[0.08, 0.56, 0.42]} />
        <ShopMat color="#6d4a32" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 0.08, 0.42]} />
        <ShopMat color="#c9844a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.78, -0.16]} castShadow>
        <boxGeometry args={[1.35, 0.36, 0.08]} />
        <ShopMat color="#b8743e" roughness={0.72} />
      </mesh>
    </group>
  )
}

function Lamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 2.3, 10]} />
        <ShopMat color="#4d555c" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.35, 0]}>
        <boxGeometry args={[0.28, 0.08, 0.28]} />
        <ShopMat color="#2c3136" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[0, 2.22, 0]}>
        <boxGeometry args={[0.18, 0.16, 0.18]} />
        <meshStandardMaterial color="#fff1c9" emissive="#f2c14e" emissiveIntensity={0.35} roughness={0.3} />
      </mesh>
    </group>
  )
}

function Mascot() {
  const avatar = useShop((state) => state.avatar)
  return (
    <group position={[1.35, 0, 4.15]} scale={1.05}>
      {avatar === "panda" ? <RedPanda satchel /> : avatar === "raccoon" ? <Raccoon apron /> : <Kirby />}
    </group>
  )
}
