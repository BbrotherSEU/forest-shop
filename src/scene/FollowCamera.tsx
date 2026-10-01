import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { PerspectiveCamera, Vector3 } from "three"
import { control } from "../game/control.ts"
import { useShop } from "../game/store.ts"

const focus = new Vector3()
const desired = new Vector3()

export function FollowCamera() {
  const place = useShop((state) => state.place)
  const previous = useRef(place)
  const { camera } = useThree()

  useFrame((_, delta) => {
    const switched = previous.current !== place
    previous.current = place
    const view = camera as PerspectiveCamera
    const fov = place === "outside" ? 32 : 38
    if (view.fov !== fov) {
      view.fov = fov
      view.updateProjectionMatrix()
    }
    if (place === "outside") {
      const blend = switched ? 1 : 1 - Math.exp(-4 * delta)
      desired.set(5.4, 3.55, 11.2)
      camera.position.lerp(desired, blend)
      camera.lookAt(-0.15, 1.65, 0.3)
      return
    }
    const blend = switched ? 1 : 1 - Math.exp(-7 * delta)
    focus.x += (control.x - focus.x) * blend
    focus.z += (control.z - focus.z) * blend
    if (switched) {
      focus.x = control.x
      focus.z = control.z
    }
    camera.position.set(focus.x, 8.4, focus.z + 9.8)
    camera.lookAt(focus.x, 0.15, focus.z - 2.4)
  })

  return null
}
