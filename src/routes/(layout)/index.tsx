import { useSubmission } from "@solidjs/router";
import { Component, Show } from "solid-js";
import { loginAction } from "~/lib/login";

const Login: Component<{}> = (props) => {
  const loggingIn = useSubmission(loginAction);

  return (
    <div class="flex h-screen w-full items-center justify-center">
      <form method="post" action={loginAction}>
        <input
          name="password"
          type="password"
          required
          class="w-[210px] rounded-2 border-0 bg-black/30 px-4 py-1 text-center text-white shadow-2xl outline-none backdrop-blur-md transition focus:bg-black/25 focus:ring-1 focus:ring-white/10"
        />
        <button
          type="submit"
          class={`mx-auto mt-4 flex h-7 w-7 items-center justify-center transition ${loggingIn.pending ? "opacity-100" : "opacity-0"}`}
        >
          <img src="/assets/svg/loader-button.svg" width={15} height={15} />
        </button>
        <Show when={loggingIn.result}>
          <p
            style={{ "text-shadow": "0 0 1px rgba(0, 0, 0, 0.9)" }}
            class="mx-auto mt-1 text-center text-4.5 font-600 leading-4 text-[#de0000]"
          >
            {loggingIn.result!.message}
          </p>
        </Show>
      </form>
    </div>
  );
};

export default Login;
