import { action, cache, redirect } from "@solidjs/router";
import { getSession, login, logout as logoutSession, validatePassword } from "./server";

export const getUser = cache(async () => {

  try {
    const session = await getSession();
    const userId = session.data.userId;
    if (userId === undefined) throw new Error("User not found");
    return userId;
  } catch {
    // await logoutSession();
    throw redirect("/");
  }
}, "user");

export const loginAction = action(async (formData: FormData) => {
  const password = String(formData.get("password"));
  let error = validatePassword(password);
  if (error) return new Error(error);

  try {
    const user = await login(password);
    // if (user) {
    //   sessionStorage.setItem("x_user", JSON.stringify(user))
    // }
    const session = await getSession();
    await session.update(d => (d.userId = user!.email));
  } catch (err) {
    return err as Error;
  }
  return redirect("/main/vocabulary");
}, "loginAction");

export const logout = action(async () => {
  await logoutSession();
  return redirect("/");
}, "logout");