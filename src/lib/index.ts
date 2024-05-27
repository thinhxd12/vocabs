import { action, cache, redirect } from "@solidjs/router";
import { login, logout as logoutSession, validatePassword } from "./server";
import { supabase } from "./supbabase";

let userId = "";

export const getUser = cache(async (id?: string) => {
  "use server";
  try {
    if (!id) {
      // const { data: { session }, error } = await supabase.auth.getSession()
      // if (!session) throw new Error("User not found");
      // return { userId: session.user.id }
      // console.log(session);

      // const { data: { user } } = await supabase.auth.getUser();
      // if (!user) throw new Error("User not found");
      // return { userId: user.id }
      // console.log("user", user);
      if (userId) return { userId: userId }
      throw new Error("User not found");
    }
    if (id !== userId) throw new Error("User not found");
  } catch {
    throw redirect("/");
  }
}, "user");


export async function getUserLoginId() {
  "use server";
  if (userId) return { userId: userId }
}

export const loginAction = action(async (formData: FormData) => {
  "use server";
  const password = String(formData.get("password"));
  let error = validatePassword(password);
  if (error) return new Error(error);

  try {
    const data = await login(password);
    userId = data.user;
  } catch (err) {
    return err as Error;
  }
  return redirect("/main/vocabulary");
}, "login");

export const logout = action(async () => {
  "use server";
  await logoutSession();
  return redirect("/");
}, "logout");