import {
  useSubmission,
  type RouteSectionProps,
  RouteDefinition,
} from "@solidjs/router";
import { Show } from "solid-js";
import { loginOrRegister, getUser } from "~/api";
import "/public/styles/login.scss";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { Bs3Circle } from "solid-icons/bs";
export const route = {
  load: () => getUser(),
} satisfies RouteDefinition;

export default function Login(props: RouteSectionProps) {
  const loggingIn = useSubmission(loginOrRegister);

  return (
    <MetaProvider>
      <Title>hoctuvung3</Title>
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
          </div>
          <div class="loginItem">
            <button type="submit" class="loginBtn">
              <Bs3Circle size={18} color="#545454" />
            </button>
          </div>
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
