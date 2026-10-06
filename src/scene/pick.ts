import type { ThreeEvent } from "@react-three/fiber"

export function pick(onClick: (event: ThreeEvent<MouseEvent>) => void) {
  return {
    onClick,
    onPointerOver: (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation()
      document.body.style.cursor = "pointer"
    },
    onPointerOut: () => {
      document.body.style.cursor = "default"
    },
  }
}
