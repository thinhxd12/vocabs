"use server";
import { redirect } from "@solidjs/router";
import { useSession } from "@solidjs/start/server";
import { getRequestEvent } from "solid-js/web";
import { db } from "./db";
import { supabase } from "./supabaseClient";

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

async function login(username: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: username,
    password: password,
  })
  if (error?.message) throw new Error("Invalid login");
  return { username: data.user?.email, refreshToken: data.session?.refresh_token, accessToken: data.session?.access_token }
}

async function register(username: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: username,
    password: password,
  })
  if (error?.message) throw new Error("User already exists");
  return { username: data.user?.email, refreshToken: data.session?.refresh_token, accessToken: data.session?.access_token }
}

function getSession() {
  return useSession(getRequestEvent()!, {
    password:
      // process.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace",
      import.meta.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace",
  });
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

    const session = await getSession();
    await session.update((d) => (d = { username: user!.username, refreshToken: user!.refreshToken, accessToken: user!.accessToken }));

  } catch (err) {
    return err as Error;
  }
  throw redirect("/");
}

export async function logout() {
  const session = await getSession();
  await session.update((d) => (d.username = undefined));
  throw redirect("/login");
}


export async function getUser() {
  const session = await getSession();
  const userName = session.data.username;
  if (userName === undefined) throw redirect("/login");
  return { userName: userName }
}

