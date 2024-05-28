import { action, cache, redirect } from "@solidjs/router";
import { getSession, login, logout as logoutSession, validatePassword } from "./server";
import { supabase } from "./supbabase";

// export const getUser = cache(async () => {
//   "use server";
//   // const { data: { session }, error } = await supabase.auth.getSession()
//   // if (!session) throw new Error("User not found");

//   const { data: { user } } = await supabase.auth.getUser();
//   console.log(user);

//   if (!user) return redirect("/");
//   return user.id;

//   // try {


//   // } catch (error) {
//   //   throw redirect("/");
//   // }
// }, "user");

export const getUser = cache(async () => {
  "use server";
  try {
    const session = await getSession();
    const userId = session.data.userId;
    if (userId === undefined) throw new Error("User not found");
  } catch {
    await logoutSession();
    throw redirect("/login");
  }
}, "user");

export const loginAction = action(async (formData: FormData) => {
  "use server";
  const password = String(formData.get("password"));
  let error = validatePassword(password);
  if (error) return new Error(error);

  try {
    const user = await login(password);
    const session = await getSession();
    await session.update(d => (d.userId = user!.id));
  } catch (err) {
    return err as Error;
  }
  return redirect("/main/vocabulary");
}, "login");

export const logout = action(async () => {
  "use server";
  await logoutSession();
  return redirect("/login");
}, "logout");