import { CanvasTexture, NearestFilter, NoColorSpace, RepeatWrapping, SRGBColorSpace } from "three"

let gradient: CanvasTexture | null = null

export function toonGradient() {
  if (gradient) return gradient
  const canvas = document.createElement("canvas")
  const shades = ["#7a7a7a", "#969696", "#b0b0b0", "#c8c8c8", "#dcdcdc", "#ececec", "#f6f6f6", "#ffffff"]
  canvas.width = shades.length
  canvas.height = 1
  const context = canvas.getContext("2d")
  if (!context) throw new Error("无法绘制光照")
  shades.forEach((shade, index) => {
    context.fillStyle = shade
    context.fillRect(index, 0, 1, 1)
  })
  gradient = new CanvasTexture(canvas)
  gradient.minFilter = NearestFilter
  gradient.magFilter = NearestFilter
  gradient.needsUpdate = true
  return gradient
}

function shiftColor(hex: string, delta: number) {
  const value = Number.parseInt(hex.slice(1), 16)
  const channel = (part: number) => Math.max(0, Math.min(255, part + delta)).toString(16).padStart(2, "0")
  return `#${channel((value >> 16) & 255)}${channel((value >> 8) & 255)}${channel(value & 255)}`
}

const furCache = new Map<string, { map: CanvasTexture; bump: CanvasTexture }>()

export function furTexture(color: string) {
  const cached = furCache.get(color)
  if (cached) return cached
  const map = paintTexture((context, size) => {
    context.fillStyle = color
    context.fillRect(0, 0, size, size)
    for (let i = 0; i < 90; i += 1) {
      const x = (i * 37) % size
      const y = (i * 61) % size
      context.fillStyle = shiftColor(color, i % 2 === 0 ? 26 : -18)
      context.globalAlpha = 0.28
      context.beginPath()
      context.ellipse(x, y, 18, 12, (i % 5) * 0.5, 0, Math.PI * 2)
      context.fill()
    }
    context.lineCap = "round"
    context.lineWidth = 1.6
    for (let i = 0; i < 220; i += 1) {
      const x = (i * 17) % size
      const y = (i * 29) % size
      context.strokeStyle = shiftColor(color, i % 3 === 0 ? 55 : -20)
      context.globalAlpha = 0.38
      context.beginPath()
      context.moveTo(x, y)
      context.quadraticCurveTo(x + 2, y - 4, x + (i % 3) - 1, y - 8)
      context.stroke()
    }
    context.globalAlpha = 1
  }, 1, 1, 256)
  const bump = paintTexture((context, size) => {
    context.fillStyle = "#8a8a8a"
    context.fillRect(0, 0, size, size)
    for (let i = 0; i < 140; i += 1) {
      const x = (i * 23) % size
      const y = (i * 41) % size
      context.fillStyle = i % 2 === 0 ? "#bdbdbd" : "#6e6e6e"
      context.globalAlpha = 0.55
      context.beginPath()
      context.ellipse(x, y, 7, 4, (i % 6) * 0.4, 0, Math.PI * 2)
      context.fill()
    }
    context.globalAlpha = 1
  })
  bump.colorSpace = NoColorSpace
  const pair = { map, bump }
  furCache.set(color, pair)
  return pair
}

export function paintTexture(
  draw: (context: CanvasRenderingContext2D, size: number) => void,
  repeatX = 1,
  repeatY = 1,
  size = 256,
) {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext("2d")
  if (!context) throw new Error("无法绘制贴图")
  draw(context, size)
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
  context.fillStyle = "#6b3e24"
  context.fillRect(0, 0, 512, 256)
  context.fillStyle = "#e7b56a"
  context.fillRect(14, 14, 484, 228)
  context.fillStyle = background
  context.beginPath()
  context.roundRect(36, 36, 440, 184, 28)
  context.fill()
  context.strokeStyle = "rgba(255,250,243,.55)"
  context.lineWidth = 6
  context.stroke()
  const fontSize = label.length >= 4 ? 76 : label.length === 3 ? 92 : 108
  context.font = `700 ${fontSize}px "Microsoft YaHei", sans-serif`
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.fillStyle = "rgba(80, 40, 24, 0.28)"
  context.fillText(label, 258, 140)
  context.fillStyle = foreground
  context.fillText(label, 256, 132)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export function woodFloorTexture() {
  const texture = paintTexture((context, size) => {
    const plank = 72
    const tones = ["#c9a36e", "#b89262", "#d4b07a", "#a98458", "#c4a06c", "#b4885c", "#d8b484"]
    context.fillStyle = "#8d6844"
    context.fillRect(0, 0, size, size)
    let row = 0
    for (let y = 0; y < size; y += plank) {
      context.fillStyle = tones[row % tones.length]
      context.fillRect(0, y + 3, size, plank - 5)
      context.strokeStyle = "rgba(92, 58, 28, 0.18)"
      context.lineWidth = 1
      for (let grain = 0; grain < 4; grain += 1) {
        const gy = y + 14 + grain * 14
        context.beginPath()
        context.moveTo(0, gy)
        context.bezierCurveTo(size * 0.3, gy + 4, size * 0.62, gy - 3, size, gy + 1)
        context.stroke()
      }
      const joint = 28 + ((row * 170) % (size - 80))
      context.fillStyle = "rgba(72, 42, 22, 0.55)"
      context.fillRect(joint, y + 3, 4, plank - 5)
      if (row % 3 === 1) {
        context.fillStyle = "rgba(90, 52, 28, 0.25)"
        context.beginPath()
        context.ellipse(joint > size / 2 ? 70 : size - 90, y + plank / 2, 8, 5, 0.3, 0, Math.PI * 2)
        context.fill()
      }
      row += 1
    }
  }, 3, 5, 512)
  return texture
}

export function shopTileTexture() {
  return paintTexture((context, size) => {
    const cells = 4
    const cell = size / cells
    const grout = 14
    const tones = ["#e6d3bc", "#efe2d0", "#deccb4", "#f4e6d4", "#e4d0b8", "#d9c6ae", "#f7ecde", "#e9d8c2"]
    context.fillStyle = "#c3b29c"
    context.fillRect(0, 0, size, size)
    let index = 0
    for (let y = 0; y < cells; y += 1) {
      for (let x = 0; x < cells; x += 1) {
        const left = x * cell + grout / 2
        const top = y * cell + grout / 2
        context.fillStyle = tones[index % tones.length]
        context.fillRect(left, top, cell - grout, cell - grout)
        context.fillStyle = "rgba(255, 250, 243, 0.22)"
        context.fillRect(left + 8, top + 8, (cell - grout) * 0.35, 6)
        for (let speck = 0; speck < 10; speck += 1) {
          context.fillStyle = speck % 2 === 0 ? "rgba(255,255,255,0.2)" : "rgba(120, 90, 60, 0.12)"
          const sx = left + 12 + ((speck * 41 + index * 17) % (cell - grout - 24))
          const sy = top + 16 + ((speck * 23 + index * 13) % (cell - grout - 28))
          context.fillRect(sx, sy, 2, 2)
        }
        index += 1
      }
    }
  }, 6, 2, 512)
}

let wallBase: CanvasTexture | null = null

/** Supermarket wall: glazed tile dado below, washable ivory latex above. */
export function shopWallTexture(repeatX: number) {
  if (!wallBase) {
    wallBase = paintTexture((context, size) => {
      context.fillStyle = "#f4efe6"
      context.fillRect(0, 0, size, size)
      for (let i = 0; i < 180; i += 1) {
        const x = (i * 47) % size
        const y = (i * 29) % Math.floor(size * 0.58)
        context.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.18)" : "rgba(180, 160, 130, 0.08)"
        context.fillRect(x, y, 18, 10)
      }
      const tileTop = Math.floor(size * 0.6)
      context.fillStyle = "#b7aea2"
      context.fillRect(0, tileTop - 10, size, 10)
      context.fillStyle = "#d5dbe0"
      context.fillRect(0, tileTop - 7, size, 4)
      const cols = 4
      const rows = 3
      const cellW = size / cols
      const cellH = (size - tileTop) / rows
      const grout = 8
      const tones = ["#efe4d4", "#e7d9c6", "#f6ecde", "#e2d3bf", "#f3e7d8", "#ddd0bc"]
      context.fillStyle = "#cfc4b4"
      context.fillRect(0, tileTop, size, size - tileTop)
      let index = 0
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const left = col * cellW + grout / 2
          const top = tileTop + row * cellH + grout / 2
          const tile = row === rows - 1 ? "#c4b49a" : tones[index % tones.length]
          context.fillStyle = tile
          context.fillRect(left, top, cellW - grout, cellH - grout)
          context.fillStyle = "rgba(255,255,255,0.28)"
          context.fillRect(left + 4, top + 4, (cellW - grout) * 0.42, 3)
          index += 1
        }
      }
    }, 1, 1, 512)
  }
  const map = wallBase.clone()
  map.repeat.set(repeatX, 1)
  map.needsUpdate = true
  return map
}

export function plankTexture(repeatX = 1, repeatY = 1) {
  return paintTexture((context, size) => {
    context.fillStyle = "#c9844a"
    context.fillRect(0, 0, size, size)
    const rows = 4
    const rowHeight = size / rows
    for (let row = 0; row < rows; row += 1) {
      const y = row * rowHeight
      context.fillStyle = row % 2 === 0 ? "#e7b56a" : "#d3924c"
      context.fillRect(0, y, size, rowHeight - 6)
      context.fillStyle = "rgba(90, 42, 16, 0.28)"
      context.fillRect(0, y + rowHeight - 6, size, 6)
      context.strokeStyle = "rgba(120, 64, 24, 0.28)"
      context.lineWidth = 2
      context.beginPath()
      for (let line = 0; line < 3; line += 1) {
        const gy = y + 18 + line * 16
        context.moveTo(0, gy)
        context.bezierCurveTo(size * 0.3, gy + 5, size * 0.65, gy - 4, size, gy + 2)
      }
      context.stroke()
      context.fillStyle = "rgba(120, 64, 24, 0.22)"
      context.beginPath()
      context.ellipse(40 + row * 50, y + 28, 8, 5, 0, 0, Math.PI * 2)
      context.fill()
    }
  }, repeatX, repeatY)
}

export function tileTexture(repeatX = 1, repeatY = 1) {
  return paintTexture((context, size) => {
    const cells = 4
    const cell = size / cells
    for (let y = 0; y < cells; y += 1) {
      for (let x = 0; x < cells; x += 1) {
        const light = (x + y) % 2 === 0
        context.fillStyle = light ? "#f7f1e6" : "#b7d4ea"
        context.fillRect(x * cell, y * cell, cell, cell)
        context.fillStyle = light ? "rgba(255,255,255,.35)" : "rgba(255,255,255,.18)"
        context.fillRect(x * cell + 6, y * cell + 6, cell * 0.45, 8)
        context.strokeStyle = "#efe2cf"
        context.lineWidth = 6
        context.strokeRect(x * cell + 3, y * cell + 3, cell - 6, cell - 6)
      }
    }
  }, repeatX, repeatY)
}

export function wallpaperTexture(repeatX = 1, repeatY = 1) {
  return paintTexture((context, size) => {
    context.fillStyle = "#f6efe4"
    context.fillRect(0, 0, size, size)
    context.fillStyle = "#f3e4cf"
    for (let y = 0; y < size; y += 48) context.fillRect(0, y, size, 16)
    context.fillStyle = "#e7b7a8"
    for (let y = 28; y < size; y += 48) {
      for (let x = 18; x < size; x += 48) {
        context.beginPath()
        context.arc(x, y, 4, 0, Math.PI * 2)
        context.fill()
      }
    }
    context.fillStyle = "#7eb6a8"
    for (let y = 28; y < size; y += 48) {
      for (let x = 42; x < size; x += 48) {
        context.fillRect(x, y - 7, 2, 10)
      }
    }
  }, repeatX, repeatY)
}

export function rugTexture() {
  return paintTexture((context, size) => {
    context.fillStyle = "#3d7ec4"
    context.fillRect(0, 0, size, size)
    context.fillStyle = "#f4d7a8"
    context.fillRect(16, 16, size - 32, size - 32)
    context.fillStyle = "#f7f1e6"
    context.fillRect(34, 34, size - 68, size - 68)
    context.fillStyle = "#f08a7a"
    context.beginPath()
    context.moveTo(size / 2, 62)
    context.lineTo(size - 62, size / 2)
    context.lineTo(size / 2, size - 62)
    context.lineTo(62, size / 2)
    context.fill()
    context.fillStyle = "#f2c14e"
    context.beginPath()
    context.arc(size / 2, size / 2, 28, 0, Math.PI * 2)
    context.fill()
    context.strokeStyle = "#3d7ec4"
    context.lineWidth = 8
    context.strokeRect(26, 26, size - 52, size - 52)
  })
}

export function grassTexture() {
  return paintTexture((context, size) => {
    context.fillStyle = "#5f9a49"
    context.fillRect(0, 0, size, size)
    for (let i = 0; i < 220; i += 1) {
      const x = (i * 47) % size
      const y = (i * 91) % size
      context.fillStyle = i % 4 === 0 ? "#8fce78" : i % 4 === 1 ? "#4e863c" : i % 4 === 2 ? "#6eae58" : "#3f7334"
      context.fillRect(x, y, 2, 10 + (i % 5))
    }
    context.fillStyle = "rgba(90, 70, 30, 0.18)"
    for (let i = 0; i < 12; i += 1) {
      context.beginPath()
      context.ellipse((i * 61) % size, (i * 37) % size, 18, 8, i, 0, Math.PI * 2)
      context.fill()
    }
  }, 8, 8)
}

export function clapboardTexture() {
  return paintTexture((context, size) => {
    context.fillStyle = "#c9844a"
    context.fillRect(0, 0, size, size)
    const band = 22
    for (let y = 0; y < size; y += band) {
      context.fillStyle = (y / band) % 2 === 0 ? "#e7b56d" : "#d39652"
      context.fillRect(0, y, size, band - 2)
      context.fillStyle = "rgba(90, 48, 18, 0.35)"
      context.fillRect(0, y + band - 2, size, 2)
      context.strokeStyle = "rgba(255, 236, 210, 0.18)"
      context.beginPath()
      context.moveTo(0, y + 4)
      context.lineTo(size, y + 6)
      context.stroke()
    }
  }, 2, 3)
}

export function shingleTexture() {
  return paintTexture((context, size) => {
    context.fillStyle = "#2f6eaf"
    context.fillRect(0, 0, size, size)
    const rowHeight = 32
    for (let row = 0; row < size / rowHeight; row += 1) {
      const y = row * rowHeight
      const offset = row % 2 === 0 ? 0 : 16
      context.fillStyle = row % 2 === 0 ? "#3d7ec4" : "#356fab"
      context.fillRect(0, y, size, rowHeight - 3)
      context.strokeStyle = "#245e99"
      context.lineWidth = 2
      for (let x = -32; x < size; x += 32) {
        context.strokeRect(x + offset, y + 2, 32, rowHeight - 6)
      }
    }
  }, 3, 2)
}

export function pathTexture() {
  return paintTexture((context, size) => {
    context.fillStyle = "#d7d2c8"
    context.fillRect(0, 0, size, size)
    for (let i = 0; i < 80; i += 1) {
      context.fillStyle = i % 2 === 0 ? "rgba(255,255,255,0.18)" : "rgba(80,70,60,0.16)"
      context.fillRect((i * 29) % size, (i * 53) % size, 3, 2)
    }
    context.strokeStyle = "rgba(120, 110, 100, 0.45)"
    context.lineWidth = 3
    context.strokeRect(2, 2, size - 4, size - 4)
  }, 4, 4)
}

export function roadTexture() {
  return paintTexture((context, size) => {
    context.fillStyle = "#3c4148"
    context.fillRect(0, 0, size, size)
    for (let i = 0; i < 160; i += 1) {
      context.fillStyle = i % 3 === 0 ? "#4a515a" : "#2e3338"
      context.fillRect((i * 17) % size, (i * 41) % size, 2, 2)
    }
    context.fillStyle = "#e6d27a"
    context.fillRect(size * 0.46, 18, size * 0.08, 28)
    context.fillRect(size * 0.46, 78, size * 0.08, 28)
    context.fillRect(size * 0.46, 138, size * 0.08, 28)
    context.fillRect(size * 0.46, 198, size * 0.08, 28)
  }, 6, 2)
}

export function skyTexture() {
  const canvas = document.createElement("canvas")
  canvas.width = 8
  canvas.height = 256
  const context = canvas.getContext("2d")
  if (!context) throw new Error("无法绘制天空")
  const fade = context.createLinearGradient(0, 0, 0, canvas.height)
  fade.addColorStop(0, "#6eb6ef")
  fade.addColorStop(0.58, "#c5e4f8")
  fade.addColorStop(1, "#f4ddc0")
  context.fillStyle = fade
  context.fillRect(0, 0, canvas.width, canvas.height)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export function awningTexture() {
  return paintTexture((context, size) => {
    const stripe = size / 8
    for (let i = 0; i < 8; i += 1) {
      context.fillStyle = i % 2 === 0 ? "#e36a55" : "#fff6ea"
      context.fillRect(i * stripe, 0, stripe, size)
    }
  }, 1, 1)
}

export function coverTexture(kind: "notebook" | "ruler") {
  return paintTexture((context, size) => {
    if (kind === "ruler") {
      context.fillStyle = "#d7ecfb"
      context.fillRect(0, 0, size, size)
      context.fillStyle = "#3d7ec4"
      context.fillRect(0, 0, size, 28)
      context.fillStyle = "#24312c"
      for (let x = 16; x < size; x += 16) {
        const tall = x % 80 === 16
        context.fillRect(x, 36, tall ? 4 : 2, tall ? 70 : 40)
      }
      context.fillStyle = "#3d7ec4"
      context.font = "700 48px 'Microsoft YaHei', sans-serif"
      context.textAlign = "center"
      context.fillText("尺子", size / 2, size * 0.78)
      return
    }
    context.fillStyle = "#3d7ec4"
    context.fillRect(0, 0, size, size)
    context.fillStyle = "#f7f4ea"
    context.fillRect(28, 28, size - 56, size - 56)
    context.fillStyle = "#4c8dff"
    context.fillRect(28, 28, 36, size - 56)
    context.fillStyle = "#24312c"
    context.font = "700 64px 'Microsoft YaHei', sans-serif"
    context.textAlign = "center"
    context.fillText("练习", size / 2 + 10, size * 0.48)
    context.font = "600 36px 'Microsoft YaHei', sans-serif"
    context.fillStyle = "#3d7ec4"
    context.fillText("本", size / 2 + 10, size * 0.66)
  })
}
