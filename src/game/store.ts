import { create } from "zustand"
import { cabinetCopy, supplies, type CabinetId, type SupplyId } from "./catalog.ts"
import { control, counterSpot } from "./control.ts"
import { addPurse, emptyPurse, giveChange, purseTotal, startingWallet, type BillId, type Purse } from "./money.ts"
import { savePurchase, type CheckoutScore } from "./records.ts"
import { loadAvatar, loadStudent, saveAvatar, saveStudent, type Avatar, type Student } from "./session.ts"

export type Place = "outside" | "inside"
export type { Avatar, Student }
export type ClerkSpot = "roam" | "coming" | "counter"

const avatarOrder: Avatar[] = ["panda", "raccoon", "pink"]

export function avatarLabel(avatar: Avatar) {
  if (avatar === "panda") return "小熊猫"
  if (avatar === "raccoon") return "小浣熊"
  return "卡比"
}

export interface Sale {
  total: number
  paid: number
  change: Purse
  sumAttempts: number
  changeAttempts: number
}

interface ShopState {
  place: Place
  fading: boolean
  cabinet: CabinetId | null
  cart: SupplyId[]
  cartOpen: boolean
  receipt: boolean
  hint: string | null
  avatar: Avatar
  student: Student | null
  wallet: Purse
  tender: Purse
  registerOpen: boolean
  clerk: ClerkSpot
  clerkTalk: boolean
  clerkLine: string
  sale: Sale | null
  signIn: (name: string, room: string, avatar: Avatar) => void
  enter: () => void
  leave: () => void
  openCabinet: (id: CabinetId) => void
  closeCabinet: () => void
  toggleCart: () => void
  add: (id: SupplyId) => void
  removeAt: (index: number) => void
  openRegister: () => void
  summonClerk: () => void
  clerkArrived: () => void
  openClerkTalk: () => void
  clerkIntroduce: () => void
  clerkChitchat: () => void
  closeClerkTalk: () => void
  closeRegister: () => void
  layBill: (id: BillId) => void
  liftBill: (id: BillId) => void
  payCash: (score: CheckoutScore) => void
  toggleAvatar: () => void
}

const MAX_CART = 8
const MAX_SAME = 2
let fadeTimer = 0
let chitchatAt = 0

function returned(state: { wallet: Purse; tender: Purse }) {
  return {
    wallet: addPurse(state.wallet, state.tender),
    tender: emptyPurse(),
    registerOpen: false,
  }
}

function cartTotal(cart: SupplyId[]) {
  return cart.reduce((sum, id) => sum + supplies[id].priceJiao, 0)
}

export const useShop = create<ShopState>((set, get) => ({
  place: "outside",
  fading: false,
  cabinet: null,
  cart: [],
  cartOpen: false,
  receipt: false,
  hint: null,
  avatar: loadAvatar(),
  student: loadStudent(),
  wallet: startingWallet(),
  tender: emptyPurse(),
  registerOpen: false,
  clerk: "roam",
  clerkTalk: false,
  clerkLine: "你好呀，想聊点什么？",
  sale: null,

  signIn: (name, room, avatar) => {
    const student = { name, room }
    saveStudent(student)
    saveAvatar(avatar)
    set({ student, avatar })
  },

  enter: () => {
    window.clearTimeout(fadeTimer)
    control.x = 0
    control.z = 4.55
    control.yaw = Math.PI
    control.target = null
    set({ fading: true, cabinet: null, receipt: false, sale: null, clerk: "roam", clerkTalk: false })
    fadeTimer = window.setTimeout(() => set({ place: "inside", fading: false }), 280)
  },

  leave: () => {
    window.clearTimeout(fadeTimer)
    control.target = null
    set((state) => ({
      fading: true,
      cabinet: null,
      cartOpen: false,
      receipt: false,
      sale: null,
      clerk: "roam",
      clerkTalk: false,
      ...returned(state),
    }))
    fadeTimer = window.setTimeout(() => set({ place: "outside", fading: false }), 280)
  },

  openCabinet: (id) =>
    set((state) => ({
      ...returned(state),
      cabinet: id,
      cartOpen: false,
      receipt: false,
      sale: null,
      clerk: "roam",
      clerkTalk: false,
      hint: null,
    })),

  closeCabinet: () => set({ cabinet: null }),

  toggleCart: () =>
    set((state) => {
      if (state.receipt) {
        return { receipt: false, sale: null, registerOpen: false, cartOpen: false, clerk: "roam", hint: "买好了，再逛逛吧" }
      }
      if (state.registerOpen) return { ...returned(state), cartOpen: true, cabinet: null, clerk: "roam" }
      return { cartOpen: !state.cartOpen, cabinet: null }
    }),

  add: (id) => {
    const state = get()
    if (state.cart.length >= MAX_CART) {
      set({ hint: "购物车满了" })
      return
    }
    const same = state.cart.filter((item) => item === id).length
    if (same >= MAX_SAME) {
      set({ hint: "同样的先买两件吧" })
      return
    }
    set({
      cart: [...state.cart, id],
      hint: `${supplies[id].name}放进购物车了`,
      cartOpen: state.registerOpen ? false : true,
      receipt: false,
      sale: null,
    })
  },

  removeAt: (index) =>
    set((state) => {
      const cart = state.cart.filter((_, itemIndex) => itemIndex !== index)
      if (cart.length === 0 && (state.registerOpen || state.clerk !== "roam") && !state.receipt) {
        return { cart, clerk: "roam", ...returned(state), hint: "东西都拿出来了" }
      }
      return { cart, hint: null }
    }),

  summonClerk: () => {
    const state = get()
    if (state.receipt) return
    if (state.cart.length === 0) {
      set({ hint: "先挑几件文具，再到收银台付钱" })
      return
    }
    control.target = counterSpot
    if (state.clerk === "counter") {
      set({ registerOpen: true, cartOpen: false, cabinet: null, hint: null })
      return
    }
    set({
      clerk: "coming",
      registerOpen: false,
      cartOpen: false,
      cabinet: null,
      hint: "收银员正在往收银台走",
    })
  },

  clerkArrived: () => {
    const state = get()
    if (state.clerk !== "coming") return
    if (state.cart.length === 0) {
      set({ clerk: "roam", hint: null })
      return
    }
    set({ clerk: "counter", registerOpen: true, cartOpen: false, cabinet: null, hint: null })
  },

  openClerkTalk: () => {
    if (get().place !== "inside") return
    set({ clerkTalk: true, clerkLine: "你好呀，想聊点什么？" })
  },

  clerkIntroduce: () => {
    if (!get().clerkTalk) return
    set({
      clerkLine: "我是林间文具店的收银员。先把文具放进购物车，再来收银台。咱们一起算元和角。",
    })
  },

  clerkChitchat: () => {
    if (!get().clerkTalk) return
    const lines = [
      "今天店里很安静，你慢慢挑就好。",
      "瓦豆鲁迪也在货架旁边逛呢，你要是碰见他，可以跟他打个招呼。",
      "我最喜欢看你自己算出该付多少钱。",
    ]
    const line = lines[chitchatAt % lines.length]
    chitchatAt += 1
    set({ clerkLine: line })
  },

  closeClerkTalk: () => set({ clerkTalk: false, hint: "再见，慢慢逛。" }),

  openRegister: () => {
    get().summonClerk()
  },

  closeRegister: () =>
    set((state) => {
      if (state.receipt) return { receipt: false, sale: null, registerOpen: false, clerk: "roam", hint: "买好了，再逛逛吧" }
      return { ...returned(state), clerk: "roam", hint: null }
    }),

  layBill: (id) => {
    const state = get()
    if (state.receipt || state.wallet[id] <= 0) return
    set({
      wallet: { ...state.wallet, [id]: state.wallet[id] - 1 },
      tender: { ...state.tender, [id]: state.tender[id] + 1 },
      hint: null,
    })
  },

  liftBill: (id) => {
    const state = get()
    if (state.receipt || state.tender[id] <= 0) return
    set({
      wallet: { ...state.wallet, [id]: state.wallet[id] + 1 },
      tender: { ...state.tender, [id]: state.tender[id] - 1 },
      hint: null,
    })
  },

  payCash: (score) => {
    const state = get()
    const total = cartTotal(state.cart)
    const paid = purseTotal(state.tender)
    if (state.cart.length === 0) {
      set({ hint: "购物车还是空的" })
      return
    }
    if (paid < total) {
      set({ hint: "付的钱还不够" })
      return
    }
    const change = giveChange(paid - total)
    const student = state.student ?? loadStudent()
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: Date.now(),
      studentName: student?.name || "未填写名字",
      room: student?.room || "未填写班级",
      items: state.cart.map((id) => ({ name: supplies[id].name, priceJiao: supplies[id].priceJiao })),
      totalJiao: total,
      paidJiao: paid,
      changeJiao: paid - total,
      sumAttempts: score.sumAttempts,
      sumWrong: score.sumWrong,
      changeAttempts: score.changeAttempts,
      changeWrong: score.changeWrong,
      sumCorrect: true,
      changeCorrect: true,
    }
    set({
      wallet: addPurse(state.wallet, change),
      tender: emptyPurse(),
      cart: [],
      receipt: true,
      registerOpen: true,
      cartOpen: false,
      cabinet: null,
      sale: { total, paid, change, sumAttempts: score.sumAttempts, changeAttempts: score.changeAttempts },
      hint: "正在记给老师…",
    })
    void savePurchase(record).then((saved) => {
      set({ hint: saved ? "这次购买已经记给老师了" : "买好了，但服务器没记上，请刷新老师页或再试一次" })
    })
  },

  toggleAvatar: () =>
    set((state) => {
      const index = avatarOrder.indexOf(state.avatar)
      const avatar = avatarOrder[(index + 1) % avatarOrder.length]
      saveAvatar(avatar)
      return { avatar }
    }),
}))

export function cabinetTitle(id: CabinetId) {
  return cabinetCopy[id].title
}
