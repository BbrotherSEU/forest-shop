export type SupplyId =
  | "pencil"
  | "eraser"
  | "ruler"
  | "case"
  | "notebook"
  | "folder"
  | "notes"
  | "marker"
  | "glue"

export type CabinetId = "blue" | "wood"

export interface Supply {
  id: SupplyId
  name: string
  priceJiao: number
  cabinet: CabinetId | "table"
  swatch: string
}

export const supplies: Record<SupplyId, Supply> = {
  pencil: { id: "pencil", name: "铅笔", priceJiao: 5, cabinet: "blue", swatch: "#f2c14e" },
  eraser: { id: "eraser", name: "橡皮", priceJiao: 8, cabinet: "blue", swatch: "#f3a0c0" },
  ruler: { id: "ruler", name: "尺子", priceJiao: 10, cabinet: "blue", swatch: "#7eb6f0" },
  case: { id: "case", name: "铅笔盒", priceJiao: 25, cabinet: "blue", swatch: "#e07a5f" },
  notebook: { id: "notebook", name: "练习本", priceJiao: 15, cabinet: "wood", swatch: "#4c8dff" },
  folder: { id: "folder", name: "文件夹", priceJiao: 12, cabinet: "wood", swatch: "#f4d35e" },
  notes: { id: "notes", name: "便签", priceJiao: 6, cabinet: "wood", swatch: "#f7f4ea" },
  marker: { id: "marker", name: "水彩笔", priceJiao: 30, cabinet: "table", swatch: "#ef6f6c" },
  glue: { id: "glue", name: "胶水", priceJiao: 12, cabinet: "table", swatch: "#8dce7a" },
}

export const supplyList = Object.values(supplies)

export function suppliesIn(cabinet: CabinetId | "table") {
  return supplyList.filter((item) => item.cabinet === cabinet)
}

export function formatMoney(jiao: number) {
  const yuan = Math.floor(jiao / 10)
  const rest = jiao % 10
  if (yuan <= 0) return `${rest}角`
  if (rest === 0) return `${yuan}元`
  return `${yuan}元${rest}角`
}

export const cabinetCopy: Record<CabinetId, { title: string; hint: string }> = {
  blue: { title: "蓝色柜子", hint: "笔、橡皮和尺子都在这一层。" },
  wood: { title: "木柜子", hint: "本子和文件夹摆在这里。" },
}
