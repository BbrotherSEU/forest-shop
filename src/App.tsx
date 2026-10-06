import { Hud } from "./ui/Hud.tsx"
import { Login } from "./ui/Login.tsx"
import { ShopWorld } from "./scene/ShopWorld.tsx"
import { useShop } from "./game/store.ts"

export default function App() {
  const student = useShop((state) => state.student)
  if (!student) return <Login />
  return (
    <div className="relative h-full">
      <ShopWorld />
      <Hud />
    </div>
  )
}
