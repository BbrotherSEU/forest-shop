import { create } from "zustand"
import { cabinetCopy, supplies, type CabinetId, type SupplyId } from "./catalog.ts"
import { control } from "./control.ts"

export type Place = "outside" | "inside"

interface ShopState {
  place: Place
  fading: boolean
  cabinet: CabinetId | null
  cart: SupplyId[]
  cartOpen: boolean
  receipt: boolean
  hint: string | null
  enter: () => void
  leave: () => void
  openCabinet: (id: CabinetId) => void
  closeCabinet: () => void
  toggleCart: () => void
  add: (id: SupplyId) => void
  removeAt: (index: number) => void
  checkout: () => void
  dismissReceipt: () => void
}

const MAX_CART = 8
const MAX_SAME = 2
let fadeTimer = 0

export const useShop = create<ShopState>((set, get) => ({
  place: "outside",
  fading: false,
  cabinet: null,
  cart: [],
  cartOpen: false,
  receipt: false,
  hint: null,

  enter: () => {
    window.clearTimeout(fadeTimer)
    control.x = 0
    control.z = 4.6
    control.yaw = Math.PI
    control.target = null
    set({ fading: true, cabinet: null, receipt: false })
    fadeTimer = window.setTimeout(() => set({ place: "inside", fading: false }), 280)
  },

  leave: () => {
    window.clearTimeout(fadeTimer)
    control.target = null
    set({ fading: true, cabinet: null })
    fadeTimer = window.setTimeout(() => set({ place: "outside", fading: false }), 280)
  },

  openCabinet: (id) => set({ cabinet: id, cartOpen: false, hint: null }),
  closeCabinet: () => set({ cabinet: null }),
  toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen, cabinet: null })),

  add: (id) => {
    const state = get()
    if (state.cart.length >= MAX_CART) {
      set({ hint: "购物车满了", cartOpen: true })
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
      cartOpen: true,
      receipt: false,
    })
  },

  removeAt: (index) =>
    set((state) => ({
      cart: state.cart.filter((_, itemIndex) => itemIndex !== index),
      hint: null,
    })),

  checkout: () => {
    const state = get()
    if (state.cart.length === 0) {
      set({ hint: "购物车还是空的" })
      return
    }
    set({ receipt: true, cartOpen: true, cabinet: null, hint: null })
  },

  dismissReceipt: () => set({ receipt: false, cart: [], cartOpen: false, hint: "买好了，再逛逛吧" }),
}))

export function cabinetTitle(id: CabinetId) {
  return cabinetCopy[id].title
}
