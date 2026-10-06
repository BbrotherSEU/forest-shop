import { useEffect, useState } from "react"
import { cabinetCopy, formatMoney, supplies, suppliesIn, type SupplyId } from "../game/catalog.ts"
import { addPurse, purseTotal } from "../game/money.ts"
import { subscribeMusic, toggleMusic } from "../game/music.ts"
import { avatarLabel, useShop } from "../game/store.ts"
import { RegisterPanel } from "./Register.tsx"

export function Hud() {
  const place = useShop((state) => state.place)
  const fading = useShop((state) => state.fading)
  const hint = useShop((state) => state.hint)
  const cabinet = useShop((state) => state.cabinet)
  const cart = useShop((state) => state.cart)
  const cartOpen = useShop((state) => state.cartOpen)
  const registerOpen = useShop((state) => state.registerOpen)
  const clerkTalk = useShop((state) => state.clerkTalk)
  const clerkLine = useShop((state) => state.clerkLine)
  const avatar = useShop((state) => state.avatar)
  const student = useShop((state) => state.student)
  const wallet = useShop((state) => state.wallet)
  const tender = useShop((state) => state.tender)

  const pocket = purseTotal(addPurse(wallet, tender))

  return (
    <div className="pointer-events-none absolute inset-0">
      <button
        type="button"
        className="pointer-events-auto absolute left-4 top-5 rounded-3xl bg-white/95 px-4 py-2 text-left shadow"
        onClick={() => useShop.getState().toggleAvatar()}
      >
        <span className="block text-xs font-bold text-[#8a6a4a]">
          {student ? `${student.name} · ${student.room}` : "点击切换角色"}
        </span>
        <span className="block text-lg font-black">{avatarLabel(avatar)}</span>
      </button>

      {place === "outside" ? (
        <p className="absolute left-1/2 top-24 -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-lg font-black shadow">
          点一下木门，走进文具店
        </p>
      ) : cabinet ? null : (
        <p className="absolute left-1/2 top-24 max-w-[min(70vw,28rem)] -translate-x-1/2 rounded-full bg-white/95 px-5 py-2 text-center text-base font-bold shadow">
          点柜门看里面的文具，选好后到左边收银台付钱。
          {hint ? <span className="mt-1 block text-[#c45c4a]">{hint}</span> : null}
        </p>
      )}

      {place === "inside" && !registerOpen ? (
        <button
          type="button"
          className="pointer-events-auto absolute right-4 top-5 rounded-full bg-[#f08a7a] px-5 py-3 text-lg font-black text-white shadow"
          onClick={() => useShop.getState().toggleCart()}
        >
          购物车 {cart.length}
        </button>
      ) : null}

      {place === "inside" && !registerOpen && !cabinet && !cartOpen ? (
        <p className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-base font-black shadow">
          口袋 {formatMoney(pocket)}
        </p>
      ) : null}

      <MusicButton />
      {clerkTalk && place === "inside" ? <ClerkTalk line={clerkLine} /> : null}
      {cartOpen && place === "inside" ? <CartPanel cart={cart} /> : null}
      {registerOpen && place === "inside" ? <RegisterPanel /> : null}
      {cabinet ? <CabinetPanel id={cabinet} /> : null}
      {fading ? <div className="absolute inset-0 bg-[#fff6ea]" /> : null}
    </div>
  )
}

function ClerkTalk({ line }: { line: string }) {
  return (
    <section className="pointer-events-auto absolute left-4 top-44 w-72 rounded-3xl bg-white/95 p-4 shadow-xl">
      <p className="text-xs font-bold text-[#8a6a4a]">收银员</p>
      <p className="mt-1 text-base font-black leading-snug">{line}</p>
      <div className="mt-3 grid gap-2">
        <button
          type="button"
          className="rounded-2xl bg-[#f4efe6] px-3 py-2 text-left text-sm font-black"
          onClick={() => useShop.getState().clerkIntroduce()}
        >
          请给我介绍一下
        </button>
        <button
          type="button"
          className="rounded-2xl bg-[#f4efe6] px-3 py-2 text-left text-sm font-black"
          onClick={() => useShop.getState().clerkChitchat()}
        >
          只是想闲聊一下
        </button>
        <button
          type="button"
          className="rounded-2xl bg-[#f08a7a] px-3 py-2 text-left text-sm font-black text-white"
          onClick={() => useShop.getState().closeClerkTalk()}
        >
          再见
        </button>
      </div>
    </section>
  )
}

function MusicButton() {
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    return subscribeMusic(setPlaying)
  }, [])
  return (
    <button
      type="button"
      className="pointer-events-auto absolute left-4 top-28 rounded-full bg-white/95 px-4 py-2 text-base font-black shadow"
      onClick={() => toggleMusic()}
    >
      {playing ? "音乐开" : "音乐关"}
    </button>
  )
}

function CartPanel({ cart }: { cart: SupplyId[] }) {
  const removeAt = useShop((state) => state.removeAt)

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
      <button
        type="button"
        className="mt-3 w-full rounded-2xl bg-[#f08a7a] py-3 font-black text-white"
        onClick={() => useShop.getState().summonClerk()}
      >
        去收银台付钱
      </button>
    </section>
  )
}

function CabinetPanel({ id }: { id: "blue" | "wood" }) {
  const closeCabinet = useShop((state) => state.closeCabinet)
  const add = useShop((state) => state.add)
  const copy = cabinetCopy[id]
  const items = suppliesIn(id)

  return (
    <section className={`pointer-events-auto absolute bottom-6 w-52 rounded-3xl bg-white/95 p-3 shadow-xl ${id === "blue" ? "left-4" : "right-4"}`}>
      <h2 className="text-lg font-black">{copy.title}</h2>
      <p className="text-xs font-bold text-[#8a6a4a]">点柜子里的文具</p>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" className="flex w-full items-center justify-between text-left text-sm font-black" onClick={() => add(item.id)}>
              <span>{item.name}</span>
              <span className="num text-[#c45c4a]">{formatMoney(item.priceJiao)}</span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="mt-3 w-full rounded-full bg-[#f6efe2] py-2 font-black" onClick={closeCabinet}>
        关上柜门
      </button>
    </section>
  )
}
