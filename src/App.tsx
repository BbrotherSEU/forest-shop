import { Hud } from "./ui/Hud.tsx"
import { ShopWorld } from "./scene/ShopWorld.tsx"

export default function App() {
  return (
    <div className="relative h-full">
      <ShopWorld />
      <Hud />
    </div>
  )
}
