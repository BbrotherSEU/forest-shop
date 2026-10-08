import { isTeacherPath } from "./game/teacherAuth.ts"
import { useShop } from "./game/store.ts"
import { ShopWorld } from "./scene/ShopWorld.tsx"
import { Hud } from "./ui/Hud.tsx"
import { Login } from "./ui/Login.tsx"
import { Teacher } from "./ui/Teacher.tsx"

export default function App() {
  const teacher = isTeacherPath()
  const student = useShop((state) => state.student)
  if (teacher) return <Teacher />
  if (!student) return <Login />
  return (
    <div className="relative h-full">
      <ShopWorld />
      <Hud />
    </div>
  )
}
