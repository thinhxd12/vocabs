import { action, cache, redirect } from "@solidjs/router";
import { getSession, login, logout as logoutSession, validatePassword } from "./server";
import { useSession } from "vinxi/http";

export const getUser = cache(async () => {
  "use server";
  try {
    // const session = await getSession();
    const session = await useSession({
      password: process.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace"
    });
    const userId = session.data.userId;
    if (userId === undefined) throw new Error("User not found");
    return userId;

  } catch {
    // await logoutSession();
    throw redirect("/");
  }
}, "user");

export const loginAction = action(async (formData: FormData) => {
  "use server";
  const password = String(formData.get("password"));
  let error = validatePassword(password);
  if (error) return new Error(error);

  try {
    // if (user) {
    //   sessionStorage.setItem("x_user", JSON.stringify(user))
    // }
    const user = await login(password);
    const session = await getSession();
    await session.update(d => (d.userId = user!.email));
    console.log(session.data);
  } catch (err) {
    // console.log(err);
    // return err as Error;
    return redirect("/main/vocabulary");
  }
  return redirect("/main/vocabulary");
}, "loginAction");

export const logout = action(async () => {
  "use server";
  await logoutSession();
  return redirect("/");
}, "logout");