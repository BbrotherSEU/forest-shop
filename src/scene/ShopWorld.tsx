import { useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { useShop } from "../game/store.ts"
import { Exterior } from "./Exterior.tsx"
import { FollowCamera } from "./FollowCamera.tsx"
import { Interior } from "./Interior.tsx"

export function ShopWorld() {
  const place = useShop((state) => state.place)

  useEffect(() => {
    const kick = window.setTimeout(() => window.dispatchEvent(new Event("resize")), 50)
    return () => window.clearTimeout(kick)
  }, [])

  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [5.4, 3.55, 11.2], fov: 38, near: 0.1, far: 80 }}
        gl={{ antialias: true }}
      >
        <FollowCamera />
        {place === "outside" ? <Exterior /> : <Interior />}
      </Canvas>
    </div>
  )
}
