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
        // const user = await db.user.findUnique({ where: { id: userId } });
        // if (!user) throw new Error("User not found");
        // return { id: user.id, username: user.username };
        if (userId === undefined) throw redirect("/");
        return { userId: userId };
    } catch {
        await logoutSession();
        throw redirect("/");
    }
}, "user");

export const loginAction = action(async (formData: FormData) => {
    "use server";
    // const username = String(formData.get("username"));
    // const password = String(formData.get("password"));
    // const loginType = String(formData.get("loginType"));
    // let error = validateUsername(username) || validatePassword(password);
    // if (error) return new Error(error);
    // try {
    //     const user = await (loginType !== "login"
    //       ? register(username, password)
    //       : login(username, password));
    //     const session = await getSession();
    //     await session.update(d => (d.userId = user!.id));
    //   } catch (err) {
    //     return err as Error;
    //   }
    //   return redirect("/");
    const password = String(formData.get("password"));
    let error = validatePassword(password);
    if (error) return new Error(error);

    try {
        const user = await login(password);
        const session = await getSession();
        // await session.update(d => (d.userId = user!.email));
        // console.log(session.data);
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