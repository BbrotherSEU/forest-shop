import type { Texture } from "three"

export function ShopMat({
  color = "#ffffff",
  map,
  roughness = 0.84,
  metalness = 0,
}: {
  color?: string
  map?: Texture
  roughness?: number
  metalness?: number
}) {
  return <meshStandardMaterial color={color} map={map} roughness={roughness} metalness={metalness} />
}
