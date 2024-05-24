import { useSession } from "vinxi/http";
import { supabase } from "./supbabase";

export function validateUsername(username: unknown) {
    if (typeof username !== "string" || username.length < 3) {
        return `Usernames must be at least 3 characters long`;
    }
}

export function validatePassword(password: unknown) {
    if (typeof password !== "string" || password.length < 6) {
        return `Passwords must be at least 6 characters long`;
    }
}

export async function login(password: string) {
    // const user = await db.user.findUnique({ where: { username } });
    // if (!user || password !== user.password) throw new Error("Invalid login");
    // return user;
    const username = import.meta.env.VITE_LOGIN_EMAIL;
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'thinh@mail.com',
        password: password,
    })
    if (error?.message) throw new Error(error?.message);
    return data.user;
}

export async function logout() {
    const session = await getSession();
    await session.update(d => (d.userId = undefined));
}

export async function register(username: string, password: string) {
    // const existingUser = await db.user.findUnique({ where: { username } });
    // if (existingUser) throw new Error("User already exists");
    // return db.user.create({
    //     data: { username: username, password }
    // });
}

export function getSession() {
    return useSession({
        password: process.env.SESSION_SECRET ?? "areallylongsecretthatyoushouldreplace"
    });
}
