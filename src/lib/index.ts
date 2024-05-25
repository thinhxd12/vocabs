import { action, cache, redirect } from "@solidjs/router";
import { getSession, login, logout as logoutSession, validatePassword } from "./server";
import { createSignal } from "solid-js";


type UserType = { email: string; password: string; }

// const [userInfo, setUserInfo] = createSignal<UserType | undefined>(undefined);

export const getUser = cache(async () => {
  "use server";
  try {
    const session = await getSession();
    const userId = session.data.userId;
    if (!userId) {
      throw new Error("User not found");
    }
    // if (userInfo() === undefined) {
    //   throw new Error("User not found");
    // }
  } catch {
    await logoutSession();
    // setUserInfo(undefined);
    throw redirect("/");
  }
}, "user");

export const loginAction = action(async (formData: FormData) => {
  "use server";
  const password = String(formData.get("password"));
  let error = validatePassword(password);
  if (error) return new Error(error);

  try {
    const user = await login(password);
    // if (user) {
    //   setUserInfo(user);
    // }
    const session = await getSession();
    await session.update(d => (d.userId = user!.email));
  } catch (err) {
    return err as Error;
  }
  return redirect("/main/vocabulary");
});

export const logout = action(async () => {
  "use server";
  await logoutSession();
  // setUserInfo(undefined);
  return redirect("/");
});