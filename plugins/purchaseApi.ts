import fs from "node:fs"
import path from "node:path"
import type { Connect, Plugin } from "vite"

const dataFile = path.resolve("data/purchases.json")

function readPurchases(): unknown[] {
  try {
    if (!fs.existsSync(dataFile)) return []
    const raw = fs.readFileSync(dataFile, "utf8").replace(/^\uFEFF/, "")
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writePurchases(records: unknown[]) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true })
  fs.writeFileSync(dataFile, `${JSON.stringify(records, null, 2)}\n`, { encoding: "utf8" })
}

function readBody(req: Connect.IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
    req.on("error", reject)
  })
}

function attach(middlewares: Connect.Server) {
  middlewares.use(async (req, res, next) => {
    const url = req.url?.split("?")[0]
    if (url !== "/api/purchases") {
      next()
      return
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8")

    if (req.method === "GET") {
      res.end(JSON.stringify(readPurchases()))
      return
    }

    if (req.method === "POST") {
      try {
        const body = await readBody(req)
        const record = JSON.parse(body) as { id?: string }
        if (!record || typeof record !== "object" || typeof record.id !== "string") {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false, error: "bad record" }))
          return
        }
        const current = readPurchases().filter((item) => {
          if (!item || typeof item !== "object") return true
          return (item as { id?: string }).id !== record.id
        })
        writePurchases([record, ...current])
        res.end(JSON.stringify({ ok: true }))
      } catch {
        res.statusCode = 400
        res.end(JSON.stringify({ ok: false, error: "bad request" }))
      }
      return
    }

    res.statusCode = 405
    res.end(JSON.stringify({ ok: false, error: "method not allowed" }))
  })
}

export function purchaseApi(): Plugin {
  return {
    name: "forest-shop-purchase-api",
    configureServer(server) {
      attach(server.middlewares)
    },
    configurePreviewServer(server) {
      attach(server.middlewares)
    },
  }
}
