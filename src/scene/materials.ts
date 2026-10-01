import { CanvasTexture, NearestFilter, RepeatWrapping, SRGBColorSpace } from "three"

let gradient: CanvasTexture | null = null

export function toonGradient() {
  if (gradient) return gradient
  const canvas = document.createElement("canvas")
  canvas.width = 4
  canvas.height = 1
  const context = canvas.getContext("2d")
  if (!context) throw new Error("无法绘制光照")
  context.fillStyle = "#6e6e6e"
  context.fillRect(0, 0, 1, 1)
  context.fillStyle = "#a3a3a3"
  context.fillRect(1, 0, 1, 1)
  context.fillStyle = "#e6e6e6"
  context.fillRect(2, 0, 1, 1)
  context.fillStyle = "#ffffff"
  context.fillRect(3, 0, 1, 1)
  gradient = new CanvasTexture(canvas)
  gradient.minFilter = NearestFilter
  gradient.magFilter = NearestFilter
  gradient.needsUpdate = true
  return gradient
}

export function paintTexture(draw: (context: CanvasRenderingContext2D, size: number) => void, repeatX = 1, repeatY = 1) {
  const canvas = document.createElement("canvas")
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext("2d")
  if (!context) throw new Error("无法绘制贴图")
  draw(context, 256)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.repeat.set(repeatX, repeatY)
  texture.needsUpdate = true
  return texture
}

export function signTexture(label: string, background: string, foreground = "#fffaf3") {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 256
  const context = canvas.getContext("2d")
  if (!context) throw new Error("无法绘制招牌")
  context.fillStyle = background
  context.fillRect(0, 0, 512, 256)
  context.fillStyle = foreground
  context.font = "700 108px 'Microsoft YaHei', sans-serif"
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.lineWidth = 10
  context.strokeStyle = "#7a3b32"
  context.strokeText(label, 256, 136)
  context.fillText(label, 256, 136)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}
