import { supabase } from "./supbabase";
import { useSession } from "vinxi/http";

export function validateUsername(username: unknown) {
  "use server";
  if (typeof username !== "string" || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

export function validatePassword(password: unknown) {
  "use server";
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

export async function login(password: string) {
  "use server";
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
  "use server";
  const session = await getSession();
  await session.update(d => (d.userId = undefined));
}

export async function register(username: string, password: string) { }

export async function getSession() {
  return await useSession({
    password: process.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace"
  });
}

