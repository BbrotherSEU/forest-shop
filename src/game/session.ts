export type Avatar = "panda" | "raccoon" | "pink"

export interface Student {
  name: string
  room: string
}

const studentKey = "forest-shop-student"
const avatarKey = "forest-shop-avatar"

export function loadStudent(): Student | null {
  try {
    const raw = localStorage.getItem(studentKey)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return null
    const student = parsed as Student
    if (typeof student.name !== "string" || typeof student.room !== "string") return null
    if (!student.name.trim() || !student.room.trim()) return null
    return { name: student.name.trim(), room: student.room.trim() }
  } catch {
    return null
  }
}

export function saveStudent(student: Student) {
  localStorage.setItem(studentKey, JSON.stringify(student))
}

export function loadAvatar(): Avatar {
  const value = localStorage.getItem(avatarKey)
  if (value === "panda" || value === "raccoon" || value === "pink") return value
  return "pink"
}

export function saveAvatar(avatar: Avatar) {
  localStorage.setItem(avatarKey, avatar)
}
