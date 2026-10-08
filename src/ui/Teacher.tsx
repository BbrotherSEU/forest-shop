import { useEffect, useMemo, useState } from "react"
import { formatMoney } from "../game/catalog.ts"
import {
  classDashboard,
  fetchRecords,
  loadRecords,
  studentReports,
  subscribeRecords,
  type PurchaseRecord,
  type StudentReport,
} from "../game/records.ts"
import { signInTeacher, signOutTeacher, teacherSignedIn } from "../game/teacherAuth.ts"

type Tab = "dashboard" | "students"

export function Teacher() {
  const [signedIn, setSignedIn] = useState(teacherSignedIn)

  if (!signedIn) return <TeacherLogin onSuccess={() => setSignedIn(true)} />
  return <TeacherDesk onLeave={() => setSignedIn(false)} />
}

function TeacherLogin({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [wrong, setWrong] = useState(false)

  return (
    <main className="grid h-full place-items-center overflow-auto bg-[#d7ecfb] px-4">
      <form
        className="w-full max-w-md rounded-[28px] bg-[#fffaf3] p-6 shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault()
          const ok = signInTeacher(username, password)
          setWrong(!ok)
          if (ok) onSuccess()
        }}
      >
        <p className="text-sm font-black text-[#8a6a4a]">林间文具店</p>
        <h1 className="mt-1 text-3xl font-black">老师查看</h1>
        <p className="mt-2 text-sm font-bold text-[#8a6a4a]">这里有总览看板，也能按学生看购买和算错次数。</p>
        <label className="mt-5 block text-sm font-black text-[#8a6a4a]">
          用户名
          <input
            value={username}
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-[#eadcc6] bg-white px-4 py-3 text-lg font-black outline-none"
          />
        </label>
        <label className="mt-3 block text-sm font-black text-[#8a6a4a]">
          密码
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-[#eadcc6] bg-white px-4 py-3 text-lg font-black outline-none"
          />
        </label>
        {wrong ? <p className="mt-3 font-bold text-[#c45c4a]">用户名或密码不对。</p> : null}
        <button type="submit" className="mt-5 w-full rounded-2xl bg-[#3d7ec4] py-3 text-lg font-black text-white">
          进入
        </button>
      </form>
    </main>
  )
}

function TeacherDesk({ onLeave }: { onLeave: () => void }) {
  const [records, setRecords] = useState<PurchaseRecord[]>(() => loadRecords())
  const [tab, setTab] = useState<Tab>("dashboard")
  const [roomFilter, setRoomFilter] = useState("全部班级")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  useEffect(
    () =>
      subscribeRecords(() => {
        setRecords(loadRecords())
      }),
    [],
  )

  const reports = useMemo(() => studentReports(records), [records])
  const dashboard = useMemo(() => classDashboard(records, reports), [records, reports])
  const rooms = useMemo(() => ["全部班级", ...dashboard.roomStats.map((item) => item.room)], [dashboard.roomStats])
  const filtered = useMemo(
    () => (roomFilter === "全部班级" ? reports : reports.filter((report) => report.room === roomFilter)),
    [reports, roomFilter],
  )
  const selected = filtered.find((report) => report.key === selectedKey) ?? filtered[0] ?? null

  const refresh = () => {
    void fetchRecords().then(setRecords)
  }

  return (
    <main className="h-full overflow-auto bg-[#d7ecfb] px-4 py-6 text-[#3a2a1a] select-text">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[#8a6a4a]">林间文具店</p>
            <h1 className="text-3xl font-black">老师工作台</h1>
            <p className="mt-1 text-sm font-bold text-[#8a6a4a]">
              现在一共 {records.length} 条购买记录，{dashboard.students} 名学生。记录保存在服务器上，买完后会自动更新。
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded-full bg-white px-4 py-2 font-black shadow" onClick={refresh}>
              刷新
            </button>
            <button
              type="button"
              className="rounded-full bg-white px-4 py-2 font-black shadow"
              onClick={() => {
                signOutTeacher()
                onLeave()
              }}
            >
              退出
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <TabButton active={tab === "dashboard"} onClick={() => setTab("dashboard")}>
            总览看板
          </TabButton>
          <TabButton active={tab === "students"} onClick={() => setTab("students")}>
            学生统计
          </TabButton>
        </div>

        {tab === "dashboard" ? (
          <DashboardView
            dashboard={dashboard}
            onOpenStudent={(key) => {
              setSelectedKey(key)
              setTab("students")
            }}
          />
        ) : (
          <StudentsView
            rooms={rooms}
            roomFilter={roomFilter}
            onRoomFilter={setRoomFilter}
            reports={filtered}
            selected={selected}
            onSelect={setSelectedKey}
          />
        )}
      </div>
    </main>
  )
}

function DashboardView({
  dashboard,
  onOpenStudent,
}: {
  dashboard: ReturnType<typeof classDashboard>
  onOpenStudent: (key: string) => void
}) {
  if (dashboard.purchases === 0) {
    return <p className="mt-8 rounded-3xl bg-white/95 p-6 text-lg font-black shadow">还没有学生完成购买。</p>
  }

  return (
    <div className="mt-6 space-y-5">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashCard label="学生人数" value={`${dashboard.students}`} tip="有购买记录的学生" />
        <DashCard label="完成购买" value={`${dashboard.purchases}`} tip="一共结账几次" />
        <DashCard label="一次就算对" value={`${dashboard.firstTryRate}%`} tip={`${dashboard.firstTry} / ${dashboard.purchases} 次`} />
        <DashCard label="班级数" value={`${dashboard.rooms}`} tip="出现过的班级" />
        <DashCard label="总价平均尝试" value={`${dashboard.avgSumAttempts}`} tip="越小越好" />
        <DashCard label="找零平均尝试" value={`${dashboard.avgChangeAttempts}`} tip="越小越好" />
        <DashCard label="总价算错累计" value={`${dashboard.sumWrong}`} tip="所有人加起来" />
        <DashCard label="找零算错累计" value={`${dashboard.changeWrong}`} tip="所有人加起来" />
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-[28px] bg-white/95 p-5 shadow-xl">
          <h2 className="text-xl font-black">班级情况</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[24rem] text-left text-sm">
              <thead className="font-black text-[#8a6a4a]">
                <tr>
                  <th className="py-2 pr-3">班级</th>
                  <th className="py-2 pr-3">学生</th>
                  <th className="py-2 pr-3">购买</th>
                  <th className="py-2">一次就算对</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.roomStats.map((room) => (
                  <tr key={room.room} className="border-t border-[#eadcc6] font-bold">
                    <td className="py-2 pr-3">{room.room}</td>
                    <td className="num py-2 pr-3">{room.students}</td>
                    <td className="num py-2 pr-3">{room.purchases}</td>
                    <td className="num py-2">
                      {room.firstTry}
                      <span className="ml-1 text-xs text-[#8a6a4a]">
                        ({room.purchases === 0 ? 0 : Math.round((room.firstTry / room.purchases) * 100)}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[28px] bg-white/95 p-5 shadow-xl">
          <h2 className="text-xl font-black">需要多练一练</h2>
          {dashboard.needsHelp.length === 0 ? (
            <p className="mt-3 font-bold text-[#8a6a4a]">大家表现都不错，暂时没有特别需要关注的学生。</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {dashboard.needsHelp.map((report) => (
                <li key={report.key}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-2xl bg-[#fff6ea] px-4 py-3 text-left font-black"
                    onClick={() => onOpenStudent(report.key)}
                  >
                    <span>
                      {report.name}
                      <span className="ml-2 text-sm text-[#8a6a4a]">{report.room}</span>
                    </span>
                    <span className="text-sm text-[#c45c4a]">
                      总价错 {report.sumWrong} · 找零错 {report.changeWrong}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-[28px] bg-white/95 p-5 shadow-xl">
        <h2 className="text-xl font-black">最近购买</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="font-black text-[#8a6a4a]">
              <tr>
                <th className="py-2 pr-3">时间</th>
                <th className="py-2 pr-3">学生</th>
                <th className="py-2 pr-3">班级</th>
                <th className="py-2 pr-3">买了什么</th>
                <th className="py-2 pr-3">总价</th>
                <th className="py-2">计算</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.recent.map((purchase) => (
                <tr key={purchase.id} className="border-t border-[#eadcc6] font-bold">
                  <td className="py-2 pr-3 whitespace-nowrap">{formatWhen(purchase.at)}</td>
                  <td className="py-2 pr-3">{purchase.studentName}</td>
                  <td className="py-2 pr-3">{purchase.room}</td>
                  <td className="py-2 pr-3">{purchase.items.map((item) => item.name).join("、")}</td>
                  <td className="num py-2 pr-3">{formatMoney(purchase.totalJiao)}</td>
                  <td className="py-2">
                    总价第 {purchase.sumAttempts} 次 · 找零第 {purchase.changeAttempts} 次
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StudentsView({
  rooms,
  roomFilter,
  onRoomFilter,
  reports,
  selected,
  onSelect,
}: {
  rooms: string[]
  roomFilter: string
  onRoomFilter: (value: string) => void
  reports: StudentReport[]
  selected: StudentReport | null
  onSelect: (key: string) => void
}) {
  if (reports.length === 0) {
    return <p className="mt-8 rounded-3xl bg-white/95 p-6 text-lg font-black shadow">这个范围里还没有学生记录。</p>
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-wrap gap-2">
        {rooms.map((room) => (
          <button
            key={room}
            type="button"
            className={`rounded-full px-4 py-2 font-black shadow ${roomFilter === room ? "bg-[#3d7ec4] text-white" : "bg-white"}`}
            onClick={() => onRoomFilter(room)}
          >
            {room}
          </button>
        ))}
      </div>

      <section className="rounded-[28px] bg-white/95 p-5 shadow-xl">
        <h2 className="text-xl font-black">学生统计表</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="font-black text-[#8a6a4a]">
              <tr>
                <th className="py-2 pr-3">学生</th>
                <th className="py-2 pr-3">班级</th>
                <th className="py-2 pr-3">购买</th>
                <th className="py-2 pr-3">一次就算对</th>
                <th className="py-2 pr-3">总价平均尝试</th>
                <th className="py-2 pr-3">找零平均尝试</th>
                <th className="py-2 pr-3">总价错</th>
                <th className="py-2 pr-3">找零错</th>
                <th className="py-2">最近一次</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const active = selected?.key === report.key
                return (
                  <tr
                    key={report.key}
                    className={`cursor-pointer border-t border-[#eadcc6] font-bold ${active ? "bg-[#e7f3ff]" : "hover:bg-[#fff8ef]"}`}
                    onClick={() => onSelect(report.key)}
                  >
                    <td className="py-2 pr-3">{report.name}</td>
                    <td className="py-2 pr-3">{report.room}</td>
                    <td className="num py-2 pr-3">{report.purchases.length}</td>
                    <td className="num py-2 pr-3">
                      {report.firstTry}
                      <span className="ml-1 text-xs text-[#8a6a4a]">
                        ({Math.round((report.firstTry / report.purchases.length) * 100)}%)
                      </span>
                    </td>
                    <td className="num py-2 pr-3">{report.avgSumAttempts}</td>
                    <td className="num py-2 pr-3">{report.avgChangeAttempts}</td>
                    <td className="num py-2 pr-3 text-[#c45c4a]">{report.sumWrong}</td>
                    <td className="num py-2 pr-3 text-[#c45c4a]">{report.changeWrong}</td>
                    <td className="py-2 whitespace-nowrap">{formatWhen(report.lastAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {selected ? <StudentCard report={selected} /> : null}
    </div>
  )
}

function StudentCard({ report }: { report: StudentReport }) {
  return (
    <section className="rounded-[28px] bg-white/95 p-5 shadow-xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">
            {report.name}
            <span className="ml-2 text-base text-[#8a6a4a]">{report.room}</span>
          </h2>
          <p className="mt-1 font-black text-[#3d7ec4]">
            完成 {report.purchases.length} 次购买，其中 {report.firstTry} 次一次就算对
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-2 text-sm font-bold sm:grid-cols-3">
          <Stat label="完成购买" value={`${report.purchases.length} 次`} />
          <Stat label="总价算对" value={`${report.sumCorrect} 次`} />
          <Stat label="找零算对" value={`${report.changeCorrect} 次`} />
          <Stat label="总价平均尝试" value={`${report.avgSumAttempts}`} />
          <Stat label="找零平均尝试" value={`${report.avgChangeAttempts}`} />
          <Stat label="总价算错累计" value={`${report.sumWrong} 次`} />
          <Stat label="找零算错累计" value={`${report.changeWrong} 次`} />
          <Stat label="一次就算对" value={`${report.firstTry} 次`} />
          <Stat label="最近一次" value={formatWhen(report.lastAt)} />
        </ul>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="font-black text-[#8a6a4a]">
            <tr>
              <th className="py-2 pr-3">时间</th>
              <th className="py-2 pr-3">买了什么</th>
              <th className="py-2 pr-3">总价</th>
              <th className="py-2 pr-3">实付</th>
              <th className="py-2 pr-3">找零</th>
              <th className="py-2">计算</th>
            </tr>
          </thead>
          <tbody>
            {report.purchases.map((purchase) => (
              <tr key={purchase.id} className="border-t border-[#eadcc6] font-bold">
                <td className="py-2 pr-3 whitespace-nowrap">{formatWhen(purchase.at)}</td>
                <td className="py-2 pr-3">{purchase.items.map((item) => item.name).join("、")}</td>
                <td className="num py-2 pr-3">{formatMoney(purchase.totalJiao)}</td>
                <td className="num py-2 pr-3">{formatMoney(purchase.paidJiao)}</td>
                <td className="num py-2 pr-3">{formatMoney(purchase.changeJiao)}</td>
                <td className="py-2">
                  <p>{purchase.sumCorrect ? `总价对了，第 ${purchase.sumAttempts} 次算对` : "总价没算对"}</p>
                  <p>{purchase.changeCorrect ? `找零对了，第 ${purchase.changeAttempts} 次算对` : "找零没算对"}</p>
                  {(purchase.sumWrong > 0 || purchase.changeWrong > 0) && (
                    <p className="text-[#c45c4a]">
                      中间算错：总价 {purchase.sumWrong} 次，找零 {purchase.changeWrong} 次
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      className={`rounded-full px-5 py-2 text-lg font-black shadow ${active ? "bg-[#3d7ec4] text-white" : "bg-white"}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function DashCard({ label, value, tip }: { label: string; value: string; tip: string }) {
  return (
    <article className="rounded-[24px] bg-white/95 p-4 shadow-xl">
      <p className="text-sm font-black text-[#8a6a4a]">{label}</p>
      <p className="num mt-1 text-3xl font-black text-[#3d7ec4]">{value}</p>
      <p className="mt-1 text-xs font-bold text-[#8a6a4a]">{tip}</p>
    </article>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className="rounded-2xl bg-[#f6efe2] px-3 py-2">
      <span className="block text-xs text-[#8a6a4a]">{label}</span>
      <span className="num text-base font-black">{value}</span>
    </li>
  )
}

function formatWhen(at: number) {
  return new Date(at).toLocaleString("zh-CN", { hour12: false })
}
