import type { Texture } from "three"
import { toonGradient } from "./materials.ts"

export function Toon({
  color = "#ffffff",
  map,
  bumpMap,
}: {
  color?: string
  map?: Texture
  bumpMap?: Texture
}) {
  return (
    <meshToonMaterial
      color={color}
      map={map}
      bumpMap={bumpMap}
      bumpScale={bumpMap ? 0.035 : 0}
      gradientMap={toonGradient()}
    />
  )
}
