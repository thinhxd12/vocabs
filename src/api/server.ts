"use server";
import { redirect } from "@solidjs/router";
import { supabase } from "./supabase";

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
  return { username: username }
}

async function register(username: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: username,
    password: password,
  })
  if (error?.message) throw new Error("User already exists");
  throw redirect("/");
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
  } catch (err) {
    return err as Error;
  }
  throw redirect("/");
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) return new Error(error.message);
  throw redirect("/login");
}


export async function getUser() {
  const { data: userData, error } = await supabase.auth.getUser();
  if (userData.user?.email === undefined) throw redirect("/login");
  return { email: userData.user.email }
}




