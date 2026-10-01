import { toonGradient } from "./materials.ts"

export function Toon({ color }: { color: string }) {
  return <meshToonMaterial color={color} gradientMap={toonGradient()} />
}
