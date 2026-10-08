const storageKey = "forest-shop-records"
const channelName = "forest-shop-records"

export interface CheckoutScore {
  sumAttempts: number
  sumWrong: number
  changeAttempts: number
  changeWrong: number
}

export interface PurchaseRecord {
  id: string
  at: number
  studentName: string
  room: string
  items: { name: string; priceJiao: number }[]
  totalJiao: number
  paidJiao: number
  changeJiao: number
  sumAttempts: number
  sumWrong: number
  changeAttempts: number
  changeWrong: number
  sumCorrect: boolean
  changeCorrect: boolean
}

export interface StudentReport {
  key: string
  name: string
  room: string
  purchases: PurchaseRecord[]
  sumCorrect: number
  changeCorrect: number
  sumWrong: number
  changeWrong: number
  firstTry: number
  avgSumAttempts: number
  avgChangeAttempts: number
  lastAt: number
}

export interface ClassDashboard {
  students: number
  purchases: number
  rooms: number
  firstTry: number
  firstTryRate: number
  sumWrong: number
  changeWrong: number
  avgSumAttempts: number
  avgChangeAttempts: number
  roomStats: { room: string; students: number; purchases: number; firstTry: number }[]
  recent: PurchaseRecord[]
  needsHelp: StudentReport[]
}

export function loadRecords(): PurchaseRecord[] {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isRecord)
  } catch {
    return []
  }
}

function cacheRecords(records: PurchaseRecord[]) {
  localStorage.setItem(storageKey, JSON.stringify(records))
  notifyRecordsChanged()
}

export async function fetchRecords(): Promise<PurchaseRecord[]> {
  try {
    const response = await fetch("/api/purchases", { cache: "no-store" })
    if (!response.ok) throw new Error(`status ${response.status}`)
    const parsed: unknown = await response.json()
    if (!Array.isArray(parsed)) throw new Error("bad payload")
    const records = parsed.filter(isRecord)
    cacheRecords(records)
    return records
  } catch {
    return loadRecords()
  }
}

export async function savePurchase(record: PurchaseRecord) {
  const local = [record, ...loadRecords().filter((item) => item.id !== record.id)]
  cacheRecords(local)

  try {
    const response = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    })
    if (!response.ok) {
      console.error("savePurchase server failed", response.status)
      return false
    }
    await fetchRecords()
    return true
  } catch (error) {
    console.error("savePurchase failed", error)
    return false
  }
}

export function subscribeRecords(onChange: () => void) {
  const sync = () => {
    void fetchRecords().then(onChange)
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) onChange()
  }
  window.addEventListener("storage", onStorage)
  window.addEventListener("focus", sync)
  window.addEventListener("forest-shop-records", onChange)

  let channel: BroadcastChannel | null = null
  try {
    channel = new BroadcastChannel(channelName)
    channel.onmessage = () => {
      void fetchRecords().then(onChange)
    }
  } catch {
    channel = null
  }

  const tick = window.setInterval(sync, 2000)
  sync()

  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener("focus", sync)
    window.removeEventListener("forest-shop-records", onChange)
    window.clearInterval(tick)
    channel?.close()
  }
}

function notifyRecordsChanged() {
  window.dispatchEvent(new Event("forest-shop-records"))
  try {
    const channel = new BroadcastChannel(channelName)
    channel.postMessage("changed")
    channel.close()
  } catch {
    // ignore
  }
}

export function studentReports(records: PurchaseRecord[]): StudentReport[] {
  const grouped = new Map<string, StudentReport>()
  for (const record of records) {
    const key = `${record.room}\u0000${record.studentName}`
    const report = grouped.get(key) ?? {
      key,
      name: record.studentName,
      room: record.room,
      purchases: [],
      sumCorrect: 0,
      changeCorrect: 0,
      sumWrong: 0,
      changeWrong: 0,
      firstTry: 0,
      avgSumAttempts: 0,
      avgChangeAttempts: 0,
      lastAt: 0,
    }
    report.purchases.push(record)
    if (record.sumCorrect) report.sumCorrect += 1
    if (record.changeCorrect) report.changeCorrect += 1
    report.sumWrong += record.sumWrong
    report.changeWrong += record.changeWrong
    if (record.sumWrong === 0 && record.changeWrong === 0) report.firstTry += 1
    report.lastAt = Math.max(report.lastAt, record.at)
    grouped.set(key, report)
  }

  return [...grouped.values()]
    .map((report) => {
      const count = report.purchases.length || 1
      const sumAttempts = report.purchases.reduce((sum, item) => sum + item.sumAttempts, 0)
      const changeAttempts = report.purchases.reduce((sum, item) => sum + item.changeAttempts, 0)
      return {
        ...report,
        purchases: [...report.purchases].sort((left, right) => right.at - left.at),
        avgSumAttempts: roundOne(sumAttempts / count),
        avgChangeAttempts: roundOne(changeAttempts / count),
      }
    })
    .sort((left, right) => left.room.localeCompare(right.room, "zh") || left.name.localeCompare(right.name, "zh"))
}

export function classDashboard(records: PurchaseRecord[], reports = studentReports(records)): ClassDashboard {
  const purchases = records.length
  const firstTry = reports.reduce((sum, report) => sum + report.firstTry, 0)
  const sumWrong = reports.reduce((sum, report) => sum + report.sumWrong, 0)
  const changeWrong = reports.reduce((sum, report) => sum + report.changeWrong, 0)
  const sumAttempts = records.reduce((sum, record) => sum + record.sumAttempts, 0)
  const changeAttempts = records.reduce((sum, record) => sum + record.changeAttempts, 0)
  const roomMap = new Map<string, { room: string; students: number; purchases: number; firstTry: number }>()

  for (const report of reports) {
    const current = roomMap.get(report.room) ?? { room: report.room, students: 0, purchases: 0, firstTry: 0 }
    current.students += 1
    current.purchases += report.purchases.length
    current.firstTry += report.firstTry
    roomMap.set(report.room, current)
  }

  return {
    students: reports.length,
    purchases,
    rooms: roomMap.size,
    firstTry,
    firstTryRate: purchases === 0 ? 0 : Math.round((firstTry / purchases) * 100),
    sumWrong,
    changeWrong,
    avgSumAttempts: purchases === 0 ? 0 : roundOne(sumAttempts / purchases),
    avgChangeAttempts: purchases === 0 ? 0 : roundOne(changeAttempts / purchases),
    roomStats: [...roomMap.values()].sort((left, right) => left.room.localeCompare(right.room, "zh")),
    recent: [...records].sort((left, right) => right.at - left.at).slice(0, 8),
    needsHelp: [...reports]
      .filter((report) => report.sumWrong + report.changeWrong > 0 || report.avgSumAttempts >= 2 || report.avgChangeAttempts >= 2)
      .sort((left, right) => right.sumWrong + right.changeWrong - (left.sumWrong + left.changeWrong))
      .slice(0, 6),
  }
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10
}

function isRecord(value: unknown): value is PurchaseRecord {
  if (!value || typeof value !== "object") return false
  const record = value as PurchaseRecord
  return typeof record.id === "string" && typeof record.studentName === "string" && Array.isArray(record.items)
}
