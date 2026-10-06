import { useMemo } from "react"
import { CanvasTexture, SRGBColorSpace } from "three"
import { formatMoney } from "../game/catalog.ts"

const cache = new Map<string, CanvasTexture>()

function labelTexture(name: string, price: string) {
  const key = `${name}|${price}`
  const cached = cache.get(key)
  if (cached) return cached
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 180
  const context = canvas.getContext("2d")
  if (!context) throw new Error("无法绘制价签")
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = "rgba(255,250,243,0.96)"
  context.beginPath()
  context.roundRect(8, 8, 496, 164, 28)
  context.fill()
  context.strokeStyle = "#e7d3b0"
  context.lineWidth = 8
  context.stroke()
  context.textAlign = "center"
  context.fillStyle = "#3a2a22"
  context.font = "700 62px 'Microsoft YaHei', sans-serif"
  context.fillText(name, 256, price ? 78 : 108)
  if (price) {
    context.fillStyle = "#c45c4a"
    context.font = "700 50px 'Microsoft YaHei', sans-serif"
    context.fillText(price, 256, 142)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  cache.set(key, texture)
  return texture
}

function nameTexture(text: string) {
  const key = `name|${text}`
  const cached = cache.get(key)
  if (cached) return cached
  const fontSize = text.length > 6 ? 58 : 72
  const scratch = document.createElement("canvas").getContext("2d")
  if (!scratch) throw new Error("无法绘制名牌")
  scratch.font = `700 ${fontSize}px 'Microsoft YaHei', sans-serif`
  const width = Math.ceil(scratch.measureText(text).width + 80)
  const height = 140
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) throw new Error("无法绘制名牌")
  context.clearRect(0, 0, width, height)
  context.fillStyle = "rgba(255,250,243,0.96)"
  context.beginPath()
  context.roundRect(6, 18, width - 12, height - 36, 32)
  context.fill()
  context.strokeStyle = "#e7d3b0"
  context.lineWidth = 8
  context.stroke()
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillStyle = "#3a2a22"
  context.font = `700 ${fontSize}px 'Microsoft YaHei', sans-serif`
  context.fillText(text, width / 2, height / 2 + 2)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  cache.set(key, texture)
  return texture
}

export function NameTag({ text, position }: { text: string; position: [number, number, number] }) {
  const map = useMemo(() => nameTexture(text), [text])
  const aspect = map.image.width / map.image.height
  const height = 0.32
  return (
    <sprite position={position} scale={[height * aspect, height, 1]} renderOrder={4} raycast={() => null}>
      <spriteMaterial map={map} transparent depthWrite={false} />
    </sprite>
  )
}

export function PriceTag({
  name,
  priceJiao,
  position,
  scale = 1,
}: {
  name: string
  priceJiao?: number
  position: [number, number, number]
  scale?: number
}) {
  const price = priceJiao === undefined ? "" : formatMoney(priceJiao)
  const map = useMemo(() => labelTexture(name, price), [name, price])
  return (
    <sprite position={position} scale={[0.7 * scale, 0.34 * scale, 1]} renderOrder={3} raycast={() => null}>
      <spriteMaterial map={map} transparent depthWrite={false} />
    </sprite>
  )
}
