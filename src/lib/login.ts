import { action, cache, redirect } from "@solidjs/router";
import { supabase } from "./supabase";
import { useSession } from "vinxi/http";

export const loginAction = action(async (formData: FormData) => {
  "use server";
  const password = String(formData.get("password"));
  let error = validatePassword(password);
  if (error) return new Error(error);

  try {
    const user = await login(password);
    const session = await getSession();
    await session.update((d) => {
      d.userId = user.user.id;
    });
  } catch (err) {
    return err as Error;
  }
  return redirect("/vocab");
});

export const logoutAction = action(async () => {
  "use server";
  await logoutSession();
  return redirect("/");
});

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

async function login(password: string) {
  const email = import.meta.env.VITE_LOGIN_EMAIL;
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  if (error) throw new Error("Invalid login");
  return data;
}

function getSession() {
  "use server";
  return useSession({
    password:
      process.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace",
  });
}

export const getUser = cache(async () => {
  "use server";
  try {
    const session = await getSession();
    const userId = session.data.userId;
    if (userId === undefined) throw new Error("User not found");
  } catch {
    await logoutSession();
    throw redirect("/");
  }
}, "user");

async function logoutSession() {
  "use server";
  const session = await getSession();
  await session.update((d) => {
    d.userId = undefined;
  });
}
