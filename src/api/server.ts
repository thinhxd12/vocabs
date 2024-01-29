"use server";
import { redirect } from "@solidjs/router";
import { supabase } from "./supabase";
import { useSession } from "@solidjs/start/server";
import { getRequestEvent } from "solid-js/web";
import { createSignal } from "solid-js";

function validateUsername(username: unknown) {
  if (typeof username !== "string" || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

const [emailSig, setEmailSig] = createSignal<string>("");

async function login(username: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: username,
    password: password,
  })
  if (error?.message) throw new Error("Invalid login");
  setEmailSig(username);
  return { email: username }
}

async function register(username: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: username,
    password: password,
  })
  if (error?.message) throw new Error("User already exists");
  return { email: username }
}

export async function loginOrRegister(formData: FormData) {
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));
  const loginType = String(formData.get("loginType"));
  let error = validateUsername(username) || validatePassword(password);
  if (error) return new Error(error);

  try {
    const user = await (loginType !== "login"
      ? register(username, password)
      : login(username, password));
    //luu mot session value email khi khoi dong route se tim toi email de verify
    const session = await getSession();
    await session.update(d => (d.email = user!.email));
  } catch (err) {
    return err as Error;
  }
  throw redirect("/main/vocabulary");
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  const session = await getSession();
  await session.update((d) => (d.email = undefined));
  throw redirect("/");
}


function getSession() {
  return useSession(getRequestEvent()!, { password: process.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace" });
}

export async function getUser() {
  const session = await getSession();
  const userEmail = session.data.email;
  if (userEmail === undefined) throw redirect("/");
  if (userEmail === emailSig()) return { email: userEmail };
}




