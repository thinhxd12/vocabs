import {
  useSubmission,
  type RouteSectionProps,
  RouteDefinition,
} from "@solidjs/router";
import { Show } from "solid-js";
import { loginOrRegister, getUser } from "~/api";
import "/public/styles/login.scss";
import { OcArrowright2 } from "solid-icons/oc";
import { Meta, MetaProvider, Title } from "@solidjs/meta";

export const route = {
  load: () => getUser(),
} satisfies RouteDefinition;

export default function Login(props: RouteSectionProps) {
  const loggingIn = useSubmission(loginOrRegister);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  return (
    <MetaProvider>
      <Title>vocabs3</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <main class="login">
        <form action={loginOrRegister} method="post" class="loginForm">
          <input
            type="hidden"
            name="redirectTo"
            value={props.params.redirectTo ?? "/main/vocabulary"}
          />
          <div class="loginItem">
            <input name="password" type="password" class="loginInput" />
            <button type="submit" class="loginBtn">
              <OcArrowright2 size={12} />
            </button>
          </div>
          <p class="loginAlert">{supabaseUrl}</p>
          <Show when={loggingIn.result}>
            <p class="loginAlert" role="alert" id="error-message">
              {loggingIn.result!.message}
            </p>
          </Show>
        </form>
      </main>
    </MetaProvider>
  );
}
