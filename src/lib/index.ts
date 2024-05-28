import { action, cache, redirect } from "@solidjs/router";
import { login, logout as logoutSession, validatePassword } from "./server";
import { supabase } from "./supbabase";

export const getUser = cache(async (id?: string) => {
  "use server";
  try {
    // const { data: { session }, error } = await supabase.auth.getSession()
    // if (!session) throw new Error("User not found");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");
    
  } catch (error) {
    throw redirect("/");
  }
}, "user");

export const loginAction = action(async (formData: FormData) => {
  "use server";
  const password = String(formData.get("password"));
  let error = validatePassword(password);
  if (error) return new Error(error);

  try {
    const data = await login(password);
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