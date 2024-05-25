// import { supabase } from "./supbabase";
import { useSession } from "vinxi/http";
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  const { data, error } = await supabase
    .from('users')
    .select()
    .textSearch("password", password);
  if (error) throw new Error(error.message);
  else if (data) {
    if (data.length > 0) {
      return { email: data[0].email }
    }
    else throw new Error("Invalid login");
  }
}

export async function logout() {
  // sessionStorage.removeItem("x_user");
  const session = await getSession();
  await session.update(d => (d.userId = undefined));
}

export async function register(username: string, password: string) { }

export async function getSession() {
  // if (typeof window !== 'undefined') {
  //   return sessionStorage.getItem("x_user");
  // }
  return await useSession({
    password: process.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace"
  });
}

