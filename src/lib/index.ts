import { action, cache, redirect } from "@solidjs/router";
import { login, logout as logoutSession, validatePassword } from "./server";
import { supabase } from "./supbabase";

export const getUser = cache(async () => {
  "use server";
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user.email) throw new Error("User not found");
  } catch {
    throw redirect("/");
  }
  return 'abc'
}, "user");

export const loginAction = action(async (formData: FormData) => {
  "use server";
  const password = String(formData.get("password"));
  let error = validatePassword(password);
  if (error) return new Error(error);

  try {
    const user = await login(password);
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