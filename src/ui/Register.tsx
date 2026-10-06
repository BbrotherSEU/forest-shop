import { useEffect, useState } from "react"
import { bills, describePurse, giveChange, purseTotal, yuanJiao, type Bill } from "../game/money.ts"
import { formatMoney, supplies } from "../game/catalog.ts"
import { useShop } from "../game/store.ts"

type Step = "sum" | "pay" | "change"

export function RegisterPanel() {
  const cart = useShop((state) => state.cart)
  const wallet = useShop((state) => state.wallet)
  const tender = useShop((state) => state.tender)
  const receipt = useShop((state) => state.receipt)
  const sale = useShop((state) => state.sale)
  const removeAt = useShop((state) => state.removeAt)
  const layBill = useShop((state) => state.layBill)
  const liftBill = useShop((state) => state.liftBill)
  const payCash = useShop((state) => state.payCash)
  const closeRegister = useShop((state) => state.closeRegister)

  const total = cart.reduce((sum, id) => sum + supplies[id].priceJiao, 0)
  const paid = purseTotal(tender)
  const [step, setStep] = useState<Step>("sum")
  const [yuan, setYuan] = useState("")
  const [jiao, setJiao] = useState("")
  const [changeYuan, setChangeYuan] = useState("")
  const [changeJiao, setChangeJiao] = useState("")
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => {
    setStep("sum")
    setYuan("")
    setJiao("")
    setChangeYuan("")
    setChangeJiao("")
    setNote(null)
  }, [total])

  const checkSum = () => {
    if (readPair(yuan, jiao) === total) {
      setNote(null)
      setStep("pay")
      return
    }
    setNote("再算一算。元和角要分开写，角只能是 0 到 9。")
  }

  const checkPay = () => {
    if (paid < total) {
      setNote("付的钱还不够，再放到柜台上。")
      return
    }
    setNote(null)
    setStep("change")
  }

  const checkChange = () => {
    const answer = readPair(changeYuan, changeJiao)
    if (answer === paid - total) {
      setNote(null)
      payCash()
      return
    }
    setNote("找零不对，再算一算。不用找的话就填 0 元 0 角。")
  }

  return (
    <section className="pointer-events-auto absolute bottom-4 left-1/2 max-h-[72vh] w-[min(96vw,52rem)] -translate-x-1/2 overflow-y-auto rounded-[28px] bg-white/96 p-4 shadow-2xl">
      {receipt && sale ? (
        <Receipt sale={sale} onClose={closeRegister} />
      ) : (
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">收银台</h2>
              <p className="text-sm font-bold text-[#8a6a4a]">{stepLabel(step)}</p>
            </div>
            <button type="button" className="rounded-full bg-[#f6efe2] px-4 py-2 font-black" onClick={closeRegister}>
              先不买
            </button>
          </div>
          <ul className="mt-3 space-y-1">
            {cart.map((id, index) => (
              <li key={`${id}-${index}`} className="flex items-center justify-between gap-2 text-base font-bold">
                <span>{supplies[id].name}</span>
                <span className="num text-[#c45c4a]">{formatMoney(supplies[id].priceJiao)}</span>
                <button type="button" className="text-sm text-[#8a6a4a]" onClick={() => removeAt(index)}>
                  拿出
                </button>
              </li>
            ))}
          </ul>

          {step === "sum" ? (
            <div className="mt-4">
              <p className="font-black">一共要付多少？自己算，填对了才能付钱。</p>
              <MoneyBlank yuan={yuan} jiao={jiao} onYuan={setYuan} onJiao={setJiao} />
              {note ? <p className="mt-2 font-bold text-[#c45c4a]">{note}</p> : null}
              <button type="button" className="mt-3 w-full rounded-2xl bg-[#3d7ec4] py-3 font-black text-white" onClick={checkSum}>
                下一步
              </button>
            </div>
          ) : null}

          {step === "pay" ? (
            <div className="mt-4">
              <p className="font-black">
                你算出一共 {yuan}元{jiao}角。把钱放到柜台上，里面有 1 角。
              </p>
              <p className="mt-2 text-sm font-black text-[#8a6a4a]">口袋里的钱，点一下放到柜台上</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {bills.map((bill) => (
                  <MoneyToken key={bill.id} bill={bill} count={wallet[bill.id]} onClick={() => layBill(bill.id)} />
                ))}
              </div>
              <p className="mt-3 text-sm font-black text-[#8a6a4a]">柜台上的钱，点一下拿回来</p>
              {paid === 0 ? (
                <p className="mt-2 text-sm font-bold text-[#8a6a4a]">还没放钱</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {bills.map((bill) =>
                    tender[bill.id] > 0 ? (
                      <MoneyToken key={bill.id} bill={bill} count={tender[bill.id]} onClick={() => liftBill(bill.id)} />
                    ) : null,
                  )}
                </div>
              )}
              {note ? <p className="mt-2 font-bold text-[#c45c4a]">{note}</p> : null}
              <button type="button" className="mt-3 w-full rounded-2xl bg-[#3d7ec4] py-3 font-black text-white" onClick={checkPay}>
                钱放好了，去算找零
              </button>
            </div>
          ) : null}

          {step === "change" ? (
            <div className="mt-4">
              <p className="font-black">找零是多少？填对了才算买完。</p>
              <p className="mt-1 text-sm font-bold text-[#8a6a4a]">柜台上现在是 {describePurse(tender)}</p>
              <MoneyBlank yuan={changeYuan} jiao={changeJiao} onYuan={setChangeYuan} onJiao={setChangeJiao} />
              {note ? <p className="mt-2 font-bold text-[#c45c4a]">{note}</p> : null}
              <button type="button" className="mt-3 w-full rounded-2xl bg-[#3d7ec4] py-3 font-black text-white" onClick={checkChange}>
                完成付款
              </button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

function stepLabel(step: Step) {
  if (step === "sum") return "第 1 步 · 算总价"
  if (step === "pay") return "第 2 步 · 付钱"
  return "第 3 步 · 算找零"
}

function readPair(yuan: string, jiao: string) {
  if (!/^\d+$/.test(yuan) || !/^\d+$/.test(jiao)) return null
  const rest = Number(jiao)
  if (rest > 9) return null
  return Number(yuan) * 10 + rest
}

function MoneyBlank({
  yuan,
  jiao,
  onYuan,
  onJiao,
}: {
  yuan: string
  jiao: string
  onYuan: (value: string) => void
  onJiao: (value: string) => void
}) {
  return (
    <div className="mt-3 flex items-center gap-2 text-2xl font-black">
      <input
        inputMode="numeric"
        value={yuan}
        aria-label="元"
        onChange={(event) => onYuan(event.target.value.replace(/\D/g, "").slice(0, 2))}
        className="num w-20 rounded-2xl border-2 border-[#eadcc6] bg-white px-3 py-2 text-center outline-none"
      />
      <span>元</span>
      <input
        inputMode="numeric"
        value={jiao}
        aria-label="角"
        onChange={(event) => onJiao(event.target.value.replace(/\D/g, "").slice(0, 1))}
        className="num w-20 rounded-2xl border-2 border-[#eadcc6] bg-white px-3 py-2 text-center outline-none"
      />
      <span>角</span>
    </div>
  )
}

function Receipt({
  sale,
  onClose,
}: {
  sale: { total: number; paid: number; change: ReturnType<typeof giveChange> }
  onClose: () => void
}) {
  const change = yuanJiao(purseTotal(sale.change))
  const amount = yuanJiao(sale.total)
  return (
    <div>
      <h2 className="text-2xl font-black">算对了，收好了</h2>
      <p className="mt-2 text-lg font-black">
        一共 {amount.yuan}元{amount.jiao}角
      </p>
      <p className="text-lg font-black">你付了 {formatMoney(sale.paid)}</p>
      <p className="mt-2 text-lg font-black text-[#3d7ec4]">
        找零 {change.yuan}元{change.jiao}角
      </p>
      {purseTotal(sale.change) > 0 ? <p className="text-sm font-bold text-[#8a6a4a]">{describePurse(sale.change)}</p> : null}
      <button type="button" className="mt-4 w-full rounded-2xl bg-[#f08a7a] py-3 font-black text-white" onClick={onClose}>
        收好零钱
      </button>
    </div>
  )
}

function MoneyToken({ bill, count, onClick }: { bill: Bill; count: number; onClick?: () => void }) {
  const coin = bill.kind === "coin"
  const interactive = onClick !== undefined
  return (
    <button
      type="button"
      disabled={interactive && count <= 0}
      onClick={onClick}
      className={`flex w-16 flex-col items-center gap-1 ${interactive ? "disabled:opacity-35" : "cursor-default"}`}
    >
      <span
        className={`grid place-items-center font-black shadow ${coin ? "h-14 w-14 rounded-full text-sm" : "h-12 w-16 rounded-lg text-sm"}`}
        style={{ background: bill.color, color: bill.ink, boxShadow: coin ? "inset 0 0 0 3px rgba(255,255,255,.7)" : undefined }}
      >
        {bill.name}
      </span>
      <span className="num text-xs font-black text-[#8a6a4a]">×{count}</span>
    </button>
  )
}
