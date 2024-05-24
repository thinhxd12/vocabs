import { action, cache, redirect } from "@solidjs/router";
import { getSession, login, logout as logoutSession, validatePassword } from "./server";

export const getUser = cache(async () => {
  "use server";
  try {
    const session = await getSession();
    const userId = session.data.userId;
    if (!userId) {
      throw new Error("User not found");
    }
  } catch {
    await logoutSession();
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
  return redirect("/");
});