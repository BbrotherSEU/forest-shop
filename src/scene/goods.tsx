import type { SupplyId } from "../game/catalog.ts"
import { ShopMat } from "./surface.tsx"

export function SupplyMesh({ id }: { id: SupplyId }) {
  switch (id) {
    case "pencil":
      return <Pencil />
    case "eraser":
      return <Eraser />
    case "ruler":
      return <Ruler />
    case "case":
      return <PencilCase />
    case "notebook":
      return <Notebook />
    case "folder":
      return <Folder />
    case "notes":
      return <Notes />
    case "marker":
      return <Marker />
    case "glue":
      return <Glue />
    case "pen":
      return <Pen />
    case "sharpener":
      return <Sharpener />
    case "sticker":
      return <Sticker />
    case "clip":
      return <Clip />
    case "crayon":
      return <Crayon />
    case "tape":
      return <TapeRoll />
    case "stamp":
      return <Stamp />
    case "bookmark":
      return <Bookmark />
    default:
      return null
  }
}

function Pencil() {
  return (
    <group rotation={[0, 0, Math.PI / 2]} position={[0, 0.05, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.028, 0.028, 0.46, 6]} />
        <ShopMat color="#f2c14e" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.07, 12]} />
        <ShopMat color="#f4a7c5" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.025, 12]} />
        <ShopMat color="#d5dde3" metalness={0.55} roughness={0.28} />
      </mesh>
      <mesh position={[0, -0.28, 0]}>
        <coneGeometry args={[0.028, 0.1, 6]} />
        <ShopMat color="#f6e7c1" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <coneGeometry args={[0.008, 0.05, 6]} />
        <ShopMat color="#2c241c" roughness={0.4} />
      </mesh>
    </group>
  )
}

function Eraser() {
  return (
    <group position={[0, 0.05, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.22, 0.08, 0.12]} />
        <ShopMat color="#f3a0c0" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.06, 0.086, 0.126]} />
        <ShopMat color="#fffaf3" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Ruler() {
  return (
    <group position={[0, 0.018, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.58, 0.018, 0.09]} />
        <ShopMat color="#8ec4ef" roughness={0.35} metalness={0.04} />
      </mesh>
      <mesh position={[0.22, 0.004, 0]}>
        <boxGeometry args={[0.05, 0.02, 0.04]} />
        <ShopMat color="#8ec4ef" roughness={0.35} />
      </mesh>
      {Array.from({ length: 10 }, (_, index) => (
        <mesh key={index} position={[-0.24 + index * 0.048, 0.011, -0.028]}>
          <boxGeometry args={[0.006, 0.006, index % 2 === 0 ? 0.028 : 0.016]} />
          <ShopMat color="#243044" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

function PencilCase() {
  return (
    <group position={[0, 0.07, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.36, 0.1, 0.16]} />
        <ShopMat color="#e07a5f" roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[0.37, 0.025, 0.17]} />
        <ShopMat color="#c45c4a" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.04, 0.008, 8, 16]} />
        <ShopMat color="#f2c14e" metalness={0.35} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Notebook() {
  return (
    <group position={[0, 0.05, 0]}>
      {Array.from({ length: 6 }, (_, index) => (
        <mesh key={index} position={[0.012, index * 0.01, 0]} castShadow>
          <boxGeometry args={[0.26, 0.008, 0.34]} />
          <ShopMat color={index === 5 ? "#4c8dff" : index % 2 === 0 ? "#fffaf3" : "#f4efe4"} roughness={0.92} />
        </mesh>
      ))}
      <mesh position={[-0.12, 0.028, 0]} castShadow>
        <boxGeometry args={[0.028, 0.07, 0.35]} />
        <ShopMat color="#2f5f9e" roughness={0.7} />
      </mesh>
      {[-0.1, -0.03, 0.04, 0.11].map((z) => (
        <mesh key={z} position={[-0.145, 0.03, z]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.016, 0.004, 6, 10]} />
          <ShopMat color="#c9ced3" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function Folder() {
  return (
    <group position={[0, 0.03, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.32, 0.012, 0.42]} />
        <ShopMat color="#f4d35e" roughness={0.8} />
      </mesh>
      <mesh position={[0.01, 0.012, 0.01]} castShadow>
        <boxGeometry args={[0.3, 0.01, 0.4]} />
        <ShopMat color="#e7c24e" roughness={0.8} />
      </mesh>
      <mesh position={[-0.06, 0.02, -0.18]}>
        <boxGeometry args={[0.1, 0.012, 0.06]} />
        <ShopMat color="#d7b03a" roughness={0.75} />
      </mesh>
    </group>
  )
}

function Notes() {
  const sheets = ["#f7e27a", "#fffaf3", "#f3b7c8"]
  return (
    <group position={[0, 0.02, 0]}>
      {sheets.map((color, index) => (
        <mesh key={color} position={[index * 0.012, index * 0.012, index * 0.01]} rotation={[0, index * 0.05, 0]} castShadow>
          <boxGeometry args={[0.18, 0.008, 0.18]} />
          <ShopMat color={color} roughness={0.92} />
        </mesh>
      ))}
    </group>
  )
}

function Marker() {
  return (
    <group rotation={[0, 0, Math.PI / 2]} position={[0, 0.05, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.032, 0.034, 0.32, 16]} />
        <ShopMat color="#ef6f6c" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.036, 0.034, 0.08, 16]} />
        <ShopMat color="#2c241c" roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.12, 0.034]}>
        <boxGeometry args={[0.01, 0.1, 0.008]} />
        <ShopMat color="#fffaf3" roughness={0.7} />
      </mesh>
    </group>
  )
}

function Glue() {
  return (
    <group position={[0, 0.02, 0]}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.07, 0.22, 20]} />
        <ShopMat color="#8dce7a" roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.12, 0.062]}>
        <boxGeometry args={[0.04, 0.1, 0.006]} />
        <ShopMat color="#fffaf3" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.028, 0.038, 0.05, 16]} />
        <ShopMat color="#f7f4ea" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.02, 0.06, 12]} />
        <ShopMat color="#e25b4a" roughness={0.45} />
      </mesh>
    </group>
  )
}

function Pen() {
  return (
    <group rotation={[0, 0, Math.PI / 2]} position={[0, 0.045, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.4, 12]} />
        <ShopMat color="#3d6fbf" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.09, 12]} />
        <ShopMat color="#2c241c" roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.21, 0]}>
        <coneGeometry args={[0.018, 0.05, 12]} />
        <ShopMat color="#d5dde3" metalness={0.45} roughness={0.28} />
      </mesh>
    </group>
  )
}

function Sharpener() {
  return (
    <group position={[0, 0.045, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.14, 0.07, 0.09]} />
        <ShopMat color="#dfe6ea" metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0.02, 0.02, 0]}>
        <boxGeometry args={[0.06, 0.03, 0.05]} />
        <ShopMat color="#e6b15a" metalness={0.45} roughness={0.32} />
      </mesh>
    </group>
  )
}

function Sticker() {
  return (
    <group position={[0, 0.012, 0]} rotation={[-0.15, 0.15, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.2, 0.008, 0.2]} />
        <ShopMat color="#fffaf3" roughness={0.85} />
      </mesh>
      <mesh position={[-0.03, 0.008, 0.02]}>
        <cylinderGeometry args={[0.04, 0.04, 0.01, 16]} />
        <ShopMat color="#f08a7a" roughness={0.6} />
      </mesh>
      <mesh position={[0.05, 0.008, -0.03]}>
        <cylinderGeometry args={[0.028, 0.028, 0.01, 16]} />
        <ShopMat color="#f2c14e" roughness={0.6} />
      </mesh>
    </group>
  )
}

function Clip() {
  return (
    <group position={[0, 0.06, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.14, 0.09, 0.025]} />
        <ShopMat color="#3d7ec4" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.055, 0.01]}>
        <boxGeometry args={[0.07, 0.045, 0.03]} />
        <ShopMat color="#d5dde3" metalness={0.55} roughness={0.25} />
      </mesh>
    </group>
  )
}

function Crayon() {
  return (
    <group rotation={[0.5, 0.2, 0.3]} position={[0, 0.05, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 12]} />
        <ShopMat color="#e07a5f" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.05, 12]} />
        <ShopMat color="#f6e7c1" roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <coneGeometry args={[0.03, 0.06, 12]} />
        <ShopMat color="#f6e7c1" roughness={0.7} />
      </mesh>
    </group>
  )
}

function Stamp() {
  return (
    <group position={[0, 0.02, 0]}>
      <mesh position={[0, 0.04, 0]} castShadow>
        <boxGeometry args={[0.12, 0.055, 0.12]} />
        <ShopMat color="#c45c4a" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.1, 10]} />
        <ShopMat color="#f3ddb8" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <sphereGeometry args={[0.034, 12, 12]} />
        <ShopMat color="#e6b15a" roughness={0.45} />
      </mesh>
    </group>
  )
}

function Bookmark() {
  return (
    <group position={[0, 0.1, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.08, 0.18, 0.008]} />
        <ShopMat color="#7a5ea8" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.042, 0.05, 3]} />
        <ShopMat color="#7a5ea8" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function PencilCup() {
  const colors = ["#f2c14e", "#ef6f6c", "#4c8dff", "#8dce7a", "#b48cc8"]
  return (
    <group>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.07, 0.14, 20]} />
        <ShopMat color="#fffaf3" roughness={0.55} />
      </mesh>
      {colors.map((color, index) => (
        <mesh key={color} position={[(index - 2) * 0.022, 0.2, (index % 2) * 0.02]} rotation={[0, 0, (index - 2) * 0.08]}>
          <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
          <ShopMat color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

export function TapeRoll() {
  return (
    <group position={[0, 0.07, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.06, 0.028, 12, 24]} />
        <ShopMat color="#f4d35e" roughness={0.55} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.034, 0.034, 0.03, 16]} />
        <ShopMat color="#fffaf3" roughness={0.6} />
      </mesh>
    </group>
  )
}
