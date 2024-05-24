import { useSession } from "vinxi/http";
import { supabase } from "./supbabase";

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
      return data[0] as { email: string, password: string }
    }
    else throw new Error("Invalid login");
  }
}

export async function logout() {
  const session = await getSession();
  await session.update(d => (d.userId = undefined));
}

export async function register(username: string, password: string) { }

export function getSession() {
  return useSession({
    password: process.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace"
  });
}
