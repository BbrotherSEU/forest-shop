import { cabinetCopy, formatMoney, supplies, suppliesIn, type SupplyId } from "../game/catalog.ts"
import { useShop } from "../game/store.ts"

export function Hud() {
  const place = useShop((state) => state.place)
  const fading = useShop((state) => state.fading)
  const hint = useShop((state) => state.hint)
  const cabinet = useShop((state) => state.cabinet)
  const cart = useShop((state) => state.cart)
  const cartOpen = useShop((state) => state.cartOpen)
  const receipt = useShop((state) => state.receipt)

  const total = cart.reduce((sum, id) => sum + supplies[id].priceJiao, 0)

  return (
    <div className="pointer-events-none absolute inset-0">
      {place === "outside" ? (
        <p className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-lg font-black shadow">
          点一下木门，走进文具店
        </p>
      ) : (
        <p className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-bold shadow">
          方向键走路，或点地面走过去。点柜子看里面的文具。
          {hint ? <span className="mt-1 block text-[#c45c4a]">{hint}</span> : null}
        </p>
      )}

      {place === "inside" ? (
        <button
          type="button"
          className="pointer-events-auto absolute right-4 top-5 rounded-full bg-[#f08a7a] px-5 py-3 text-lg font-black text-white shadow"
          onClick={() => useShop.getState().toggleCart()}
        >
          购物车 {cart.length}
        </button>
      ) : null}

      {cartOpen && place === "inside" ? <CartPanel total={total} cart={cart} receipt={receipt} /> : null}
      {cabinet ? <CabinetPanel id={cabinet} /> : null}
      {fading ? <div className="absolute inset-0 bg-[#fff6ea]" /> : null}
    </div>
  )
}

function CartPanel({ total, cart, receipt }: { total: number; cart: SupplyId[]; receipt: boolean }) {
  const removeAt = useShop((state) => state.removeAt)
  const checkout = useShop((state) => state.checkout)
  const dismissReceipt = useShop((state) => state.dismissReceipt)

  return (
    <section className="pointer-events-auto absolute right-4 top-20 w-72 rounded-3xl bg-white/95 p-4 shadow-xl">
      <h2 className="text-xl font-black">购物车</h2>
      {cart.length === 0 ? (
        <p className="mt-2 text-sm font-bold text-[#8a6a4a]">还没有文具。点柜子或桌上的东西。</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {cart.map((id, index) => (
            <li key={`${id}-${index}`} className="flex items-center justify-between text-base font-bold">
              <span>{supplies[id].name}</span>
              <span className="num text-[#c45c4a]">{formatMoney(supplies[id].priceJiao)}</span>
              <button type="button" className="text-sm text-[#8a6a4a]" onClick={() => removeAt(index)}>
                拿出
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-lg font-black">一共 {formatMoney(total)}</p>
      {receipt ? (
        <button type="button" className="mt-3 w-full rounded-2xl bg-[#3d7ec4] py-3 font-black text-white" onClick={dismissReceipt}>
          买好了
        </button>
      ) : (
        <button type="button" className="mt-3 w-full rounded-2xl bg-[#f08a7a] py-3 font-black text-white" onClick={checkout}>
          结账
        </button>
      )}
    </section>
  )
}

function CabinetPanel({ id }: { id: "blue" | "wood" }) {
  const closeCabinet = useShop((state) => state.closeCabinet)
  const add = useShop((state) => state.add)
  const copy = cabinetCopy[id]
  const items = suppliesIn(id)

  return (
    <section className="pointer-events-auto absolute bottom-4 left-1/2 w-[min(92vw,40rem)] -translate-x-1/2 rounded-[28px] bg-white/96 p-5 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">{copy.title}</h2>
          <p className="text-sm font-bold text-[#8a6a4a]">{copy.hint}</p>
        </div>
        <button type="button" className="rounded-full bg-[#f6efe2] px-4 py-2 font-black" onClick={closeCabinet}>
          关上
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="rounded-2xl bg-[#fffaf3] p-3 text-left shadow"
            onClick={() => add(item.id)}
          >
            <span className="block h-8 w-8 rounded-full" style={{ background: item.swatch }} />
            <span className="mt-2 block text-lg font-black">{item.name}</span>
            <span className="num text-base font-extrabold text-[#c45c4a]">{formatMoney(item.priceJiao)}</span>
            <span className="mt-1 block text-sm font-bold text-[#3d7ec4]">放入购物车</span>
          </button>
        ))}
      </div>
    </section>
  )
}
