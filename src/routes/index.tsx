import {
  useSubmission,
  type RouteSectionProps,
  RouteDefinition,
} from "@solidjs/router";
import { Show } from "solid-js";
// import { loginOrRegister, getUser } from "~/lib";
import styles from "./index.module.scss";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { loginAction } from "~/lib/newindex";
// export const route = {
//   load: () => getUser(),
// } satisfies RouteDefinition;

// import { getUser } from "~/lib/newindex";

export default function Login(props: RouteSectionProps) {
  const loggingIn = useSubmission(loginAction);

  return (
    <MetaProvider>
      <Title>login</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <main class={styles.login}>
        <form action={loginAction} method="post" class={styles.loginForm}>
          <input
            type="hidden"
            name="redirectTo"
            value={props.params.redirectTo ?? "/main/vocabulary"}
          />
          <div class={styles.loginItem}>
            <input name="password" type="password" class={styles.loginInput} />
          </div>
          <div class={styles.loginItem}>
            <button type="submit" class={styles.loginBtn}>
              <img src="/images/main/laurel.png" width={18} />
            </button>
          </div>
          <Show when={loggingIn.result}>
            <p class={styles.loginAlert} role="alert" id="error-message">
              {loggingIn.result!.message}
            </p>
          </Show>
        </form>
      </main>
    </MetaProvider>
  );
}
