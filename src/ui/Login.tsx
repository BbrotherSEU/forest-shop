import { useState } from "react"
import { avatarLabel, useShop, type Avatar } from "../game/store.ts"

const choices: Avatar[] = ["panda", "raccoon", "pink"]
const rooms = ["二年9班", "二年10班"]

export function Login() {
  const signIn = useShop((state) => state.signIn)
  const [name, setName] = useState("")
  const [room, setRoom] = useState("")
  const [avatar, setAvatar] = useState<Avatar | null>(null)
  const ready = name.trim() !== "" && room.trim() !== "" && avatar !== null

  return (
    <main className="grid h-full place-items-center bg-[#d7ecfb] px-4">
      <form
        className="w-full max-w-md rounded-[28px] bg-[#fffaf3] p-6 shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault()
          if (!ready || !avatar) return
          signIn(name.trim(), room.trim(), avatar)
        }}
      >
        <p className="text-sm font-black text-[#8a6a4a]">林间文具店</p>
        <h1 className="mt-1 text-3xl font-black">先填好，再进店</h1>
        <label className="mt-5 block text-sm font-black text-[#8a6a4a]">
          名字
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-[#eadcc6] bg-white px-4 py-3 text-lg font-black text-[#3a2a1a] outline-none"
            maxLength={12}
          />
        </label>
        <label className="mt-3 block text-sm font-black text-[#8a6a4a]">
          班级
          <select
            value={room}
            onChange={(event) => setRoom(event.target.value)}
            className="mt-1 w-full rounded-2xl border-2 border-[#eadcc6] bg-white px-4 py-3 text-lg font-black text-[#3a2a1a] outline-none"
          >
            <option value="">请选择</option>
            {rooms.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-4 text-sm font-black text-[#8a6a4a]">要扮演的角色</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {choices.map((choice) => (
            <button
              key={choice}
              type="button"
              className={`rounded-2xl border-2 py-3 font-black ${avatar === choice ? "border-[#3d7ec4] bg-[#e7f3ff]" : "border-[#eadcc6] bg-white"}`}
              onClick={() => setAvatar(choice)}
            >
              {avatarLabel(choice)}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={!ready}
          className="mt-5 w-full rounded-2xl bg-[#f08a7a] py-3 text-lg font-black text-white disabled:opacity-45"
        >
          进店
        </button>
      </form>
    </main>
  )
}
