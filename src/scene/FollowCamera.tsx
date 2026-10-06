import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { PerspectiveCamera, Vector3 } from "three"
import { cabinetCamera, control, floorHeight } from "../game/control.ts"
import { useShop } from "../game/store.ts"

const focus = new Vector3()
const desired = new Vector3()
const look = new Vector3()

export function FollowCamera() {
  const place = useShop((state) => state.place)
  const cabinet = useShop((state) => state.cabinet)
  const previous = useRef(place)
  const { camera, size } = useThree()

  useFrame((_, delta) => {
    const switched = previous.current !== place
    previous.current = place
    const view = camera as PerspectiveCamera
    const fov = place === "outside" ? 32 : cabinet ? 50 : 58
    if (view.fov !== fov) {
      view.fov = fov
      view.updateProjectionMatrix()
    }
    const aspect = size.width / Math.max(size.height, 1)
    if (place === "inside" && cabinet === "blue") {
      view.setViewOffset(size.width * 1.28, size.height, 0, 0, size.width, size.height)
    } else if (view.view !== null || Math.abs(view.aspect - aspect) > 0.01) {
      view.view = null
      view.aspect = aspect
      view.updateProjectionMatrix()
    }
    if (place === "outside") {
      const blend = switched ? 1 : 1 - Math.exp(-4 * delta)
      desired.set(5.4, 3.55, 11.2)
      camera.position.lerp(desired, blend)
      camera.lookAt(-0.15, 1.65, 0.3)
      return
    }
    if (cabinet) {
      const shot = cabinetCamera[cabinet]
      const blend = 1 - Math.exp(-4 * delta)
      desired.set(shot.at[0], shot.at[1], shot.at[2])
      look.set(shot.look[0], shot.look[1], shot.look[2])
      camera.position.lerp(desired, blend)
      camera.lookAt(look)
      return
    }
    focus.set(control.x, 0, control.z)
    const raised = floorHeight(focus.x, focus.z)
    camera.position.set(focus.x, 4.35 + raised, focus.z + 4.45)
    camera.lookAt(focus.x, 1.15 + raised, focus.z - 2.15)
  })

  return null
}
