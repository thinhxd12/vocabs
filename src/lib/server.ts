import { supabase } from "./supbabase";
import { useSession } from "vinxi/http";

export function validateUsername(username: unknown) {
  if (typeof username !== "string" || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

export function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

export async function login(password: string) {
  const email = import.meta.env.VITE_LOGIN_EMAIL;
  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  })
  if (error) throw new Error(error.message);
  return { id: email }
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  const session = await getSession();
  await session.update(d => (d.userId = undefined));
}

export async function register(username: string, password: string) { }

export function getSession() {
  return useSession({
    password: process.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace"
  });
}