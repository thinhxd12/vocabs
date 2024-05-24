import { action, cache, redirect } from "@solidjs/router";
import {
    getSession,
    login,
    logout as logoutSession,
    register,
    validatePassword,
    validateUsername
} from "./newserver";

export const getUser = cache(async () => {
    "use server";
    try {
        const session = await getSession();
        const userId = session.data.userId;
        // if (userId === undefined) throw new Error("User not found");
        // return { userId: userId };
        // if (userId === undefined) throw redirect("/");
        if (userId === undefined) throw redirect("/");
        

    } catch (err) {
        // await logoutSession();
        throw redirect("/");
        console.log("error", err);
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
        console.log(user);
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