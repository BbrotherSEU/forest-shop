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
  | "pen"
  | "sharpener"
  | "sticker"
  | "clip"
  | "crayon"
  | "tape"
  | "stamp"
  | "bookmark"

export type CabinetId = "blue" | "wood"
export type Spot = CabinetId | "table" | "shelf" | "rack"

export interface Supply {
  id: SupplyId
  name: string
  priceJiao: number
  cabinet: Spot
  swatch: string
}

export const supplies: Record<SupplyId, Supply> = {
  pencil: { id: "pencil", name: "铅笔", priceJiao: 5, cabinet: "blue", swatch: "#f2c14e" },
  eraser: { id: "eraser", name: "橡皮", priceJiao: 8, cabinet: "blue", swatch: "#f3a0c0" },
  ruler: { id: "ruler", name: "尺子", priceJiao: 10, cabinet: "blue", swatch: "#7eb6f0" },
  case: { id: "case", name: "铅笔盒", priceJiao: 18, cabinet: "blue", swatch: "#e07a5f" },
  notebook: { id: "notebook", name: "练习本", priceJiao: 15, cabinet: "wood", swatch: "#4c8dff" },
  folder: { id: "folder", name: "文件夹", priceJiao: 12, cabinet: "wood", swatch: "#f4d35e" },
  notes: { id: "notes", name: "便签", priceJiao: 6, cabinet: "wood", swatch: "#f7f4ea" },
  marker: { id: "marker", name: "水彩笔", priceJiao: 20, cabinet: "table", swatch: "#ef6f6c" },
  glue: { id: "glue", name: "胶水", priceJiao: 10, cabinet: "table", swatch: "#8dce7a" },
  pen: { id: "pen", name: "圆珠笔", priceJiao: 12, cabinet: "shelf", swatch: "#3d6fbf" },
  sharpener: { id: "sharpener", name: "削笔刀", priceJiao: 8, cabinet: "shelf", swatch: "#d5dde3" },
  sticker: { id: "sticker", name: "贴纸", priceJiao: 6, cabinet: "shelf", swatch: "#f08a7a" },
  clip: { id: "clip", name: "长尾夹", priceJiao: 5, cabinet: "shelf", swatch: "#3d7ec4" },
  crayon: { id: "crayon", name: "蜡笔", priceJiao: 15, cabinet: "rack", swatch: "#e07a5f" },
  tape: { id: "tape", name: "胶带", priceJiao: 10, cabinet: "rack", swatch: "#f4d35e" },
  stamp: { id: "stamp", name: "印章", priceJiao: 18, cabinet: "rack", swatch: "#c45c4a" },
  bookmark: { id: "bookmark", name: "书签", priceJiao: 8, cabinet: "rack", swatch: "#7a5ea8" },
}

export const supplyList = Object.values(supplies)

export function suppliesIn(cabinet: Spot) {
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
  blue: { title: "笔和橡皮", hint: "柜门开着，点一件放进购物车，看完可以关上。" },
  wood: { title: "本子", hint: "练习本、文件夹和便签在这一格。" },
}
