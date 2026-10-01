import { useEffect, useMemo } from "react"
import { useShop } from "../game/store.ts"
import { paintTexture, signTexture, toonGradient } from "./materials.ts"
import { Toon } from "./Toon.tsx"

export function Exterior() {
  const enter = useShop((state) => state.enter)
  const sign = useMemo(() => signTexture("文具店", "#e36a55", "#fffaf3"), [])
  const grass = useMemo(
    () =>
      paintTexture((context, size) => {
        context.fillStyle = "#7dba63"
        context.fillRect(0, 0, size, size)
        context.fillStyle = "#6aaa55"
        for (let i = 0; i < 40; i += 1) {
          context.fillRect((i * 37) % size, (i * 53) % size, 8, 3)
        }
      }, 8, 8),
    [],
  )
  useEffect(
    () => () => {
      sign.dispose()
      grass.dispose()
    },
    [sign, grass],
  )

  return (
    <group>
      <color attach="background" args={["#8ec8ef"]} />
      <hemisphereLight args={["#fff4df", "#7dba63", 0.55]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[6, 10, 5]} intensity={1.35} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 4]}>
        <planeGeometry args={[40, 32]} />
        <meshToonMaterial color="#8fbf72" map={grass} gradientMap={toonGradient()} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 5.2]}>
        <planeGeometry args={[2.4, 8]} />
        <Toon color="#e7d3a8" />
      </mesh>
      <Building onEnter={enter} sign={sign} />
      <Bush position={[-5.2, 0, 3.4]} />
      <Bush position={[5.4, 0, 2.6]} />
      <Flower position={[-2.6, 0, 3.4]} color="#f08a7a" />
      <Flower position={[3.15, 0, 3.6]} color="#f2c14e" />
      <Kid />
    </group>
  )
}

function Building({ onEnter, sign }: { onEnter: () => void; sign: ReturnType<typeof signTexture> }) {
  return (
    <group>
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[7.4, 3.4, 4.2]} />
        <Toon color="#e7b56a" />
      </mesh>
      <mesh position={[0, 0.35, 2.12]}>
        <boxGeometry args={[7.5, 0.7, 0.28]} />
        <Toon color="#8a5a32" />
      </mesh>
      <mesh position={[0, 3.32, 0.15]}>
        <boxGeometry args={[8.2, 0.28, 4.6]} />
        <Toon color="#3d7ec4" />
      </mesh>
      <mesh position={[0, 3.58, -0.15]}>
        <boxGeometry args={[8.3, 0.22, 0.5]} />
        <Toon color="#2f6eaf" />
      </mesh>
      <mesh position={[-3.55, 1.7, 0]}>
        <boxGeometry args={[0.18, 3.5, 4.4]} />
        <Toon color="#c9844a" />
      </mesh>
      <mesh position={[3.55, 1.7, 0]}>
        <boxGeometry args={[0.18, 3.5, 4.4]} />
        <Toon color="#c9844a" />
      </mesh>
      <mesh position={[0, 2.85, 2.22]}>
        <planeGeometry args={[3.2, 0.9]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      <group position={[0, 1.25, 2.12]} onClick={(event) => { event.stopPropagation(); onEnter() }}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 2.3, 0.12]} />
          <Toon color="#f3ddb8" />
        </mesh>
        <mesh position={[0.42, 0.05, 0.08]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <Toon color="#f2c14e" />
        </mesh>
        <mesh position={[0, 0.35, 0.07]}>
          <planeGeometry args={[0.7, 0.9]} />
          <Toon color="#c5e4f5" />
        </mesh>
      </group>
      <mesh position={[-2.4, 2.15, 2.16]}>
        <boxGeometry args={[1.15, 1.05, 0.08]} />
        <Toon color="#d7eef8" />
      </mesh>
      <mesh position={[2.4, 2.15, 2.16]}>
        <boxGeometry args={[1.15, 1.05, 0.08]} />
        <Toon color="#d7eef8" />
      </mesh>
    </group>
  )
}

function Bush({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.4, 8]} />
        <Toon color="#8a5a32" />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <Toon color="#3f9a55" />
      </mesh>
    </group>
  )
}

function Flower({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.64, 6]} />
        <Toon color="#3f8f4e" />
      </mesh>
      <mesh position={[0, 0.66, 0]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <Toon color={color} />
      </mesh>
    </group>
  )
}

function Kid() {
  return (
    <group position={[1.15, 0, 4.5]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0.28, 0]}>
        <capsuleGeometry args={[0.16, 0.2, 4, 8]} />
        <Toon color="#3d4c66" />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <capsuleGeometry args={[0.22, 0.28, 4, 8]} />
        <Toon color="#7ec8ff" />
      </mesh>
      <mesh position={[0, 1.18, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <Toon color="#ffd7c2" />
      </mesh>
      <mesh position={[0, 1.28, -0.02]} scale={[1.02, 0.5, 1]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <Toon color="#3a2a22" />
      </mesh>
    </group>
  )
}
