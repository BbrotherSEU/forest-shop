export const teacherAccount = {
  username: "admin",
  password: "grove-r3m9-4bds",
}

const sessionKey = "forest-shop-teacher"

export function isTeacherPath() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/"
  return path === "/teacher"
}

export function teacherSignedIn() {
  return sessionStorage.getItem(sessionKey) === teacherAccount.username
}

export function signInTeacher(username: string, password: string) {
  const ok = username.trim() === teacherAccount.username && password === teacherAccount.password
  if (ok) sessionStorage.setItem(sessionKey, teacherAccount.username)
  return ok
}

export function signOutTeacher() {
  sessionStorage.removeItem(sessionKey)
}
