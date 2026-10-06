export type BillId = "yuan10" | "yuan5" | "yuan2" | "yuan1" | "jiao5" | "jiao1"

export interface Bill {
  id: BillId
  name: string
  jiao: number
  kind: "coin" | "bill"
  color: string
  ink: string
}

/** Largest first, so change uses fewer notes. 2角已停止流通，不放入。2元是硬币。 */
export const bills: Bill[] = [
  { id: "yuan10", name: "10元", jiao: 100, kind: "bill", color: "#3d6fbf", ink: "#fffaf3" },
  { id: "yuan5", name: "5元", jiao: 50, kind: "bill", color: "#7a5ea8", ink: "#fffaf3" },
  { id: "yuan2", name: "2元", jiao: 20, kind: "coin", color: "#d5dde3", ink: "#2c3a44" },
  { id: "yuan1", name: "1元", jiao: 10, kind: "coin", color: "#e6c36a", ink: "#5a3b12" },
  { id: "jiao5", name: "5角", jiao: 5, kind: "coin", color: "#c5cdd4", ink: "#2c3a44" },
  { id: "jiao1", name: "1角", jiao: 1, kind: "coin", color: "#d08a4a", ink: "#fff6ea" },
]

export type Purse = Record<BillId, number>

export function emptyPurse(): Purse {
  return { yuan10: 0, yuan5: 0, yuan2: 0, yuan1: 0, jiao5: 0, jiao1: 0 }
}

/** 口袋一共 10 元：5元、2元、1元两枚、5角一枚、1角五枚。 */
export function startingWallet(): Purse {
  return { yuan10: 0, yuan5: 1, yuan2: 1, yuan1: 2, jiao5: 1, jiao1: 5 }
}

export function yuanJiao(totalJiao: number) {
  return { yuan: Math.floor(totalJiao / 10), jiao: totalJiao % 10 }
}

export function purseTotal(purse: Purse) {
  return bills.reduce((sum, bill) => sum + purse[bill.id] * bill.jiao, 0)
}

export function addPurse(left: Purse, right: Purse): Purse {
  const next = emptyPurse()
  for (const bill of bills) next[bill.id] = left[bill.id] + right[bill.id]
  return next
}

export function giveChange(jiao: number): Purse {
  const change = emptyPurse()
  let left = Math.max(0, jiao)
  for (const bill of bills) {
    const count = Math.floor(left / bill.jiao)
    change[bill.id] = count
    left -= count * bill.jiao
  }
  return change
}

export function describePurse(purse: Purse) {
  const parts = bills.filter((bill) => purse[bill.id] > 0).map((bill) => `${bill.name}×${purse[bill.id]}`)
  return parts.join("、")
}
