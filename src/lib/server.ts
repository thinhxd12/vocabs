import { supabase } from "./supbabase";
import { useSession } from "@solidjs/start/server";
import { getRequestEvent } from "solid-js/web";


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
  return { id: user!.email }
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  const session = await getSession();
  await session.update(d => (d.userId = undefined));
}

export async function register(username: string, password: string) { }

export async function getSession() {
  return useSession(getRequestEvent()!, { password: process.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace" });
}