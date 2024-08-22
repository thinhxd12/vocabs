import { useSubmission, type RouteSectionProps } from "@solidjs/router";
import { Show, createResource, createSignal, onMount } from "solid-js";
import styles from "./index.module.scss";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { loginAction } from "~/lib";
import { getSpotlightImage } from "~/lib/api";

export default function Login(props: RouteSectionProps) {
  const loggingIn = useSubmission(loginAction);
  const [imageData, { refetch, mutate }] = createResource(getSpotlightImage);
  const [isMobile, setIsMobile] = createSignal<boolean>(false);

  onMount(async () => {
    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    );
  });

  return (
    <MetaProvider>
      <Title>login</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <main class={styles.login}>
        <Show when={imageData()}>
          <img
            src={isMobile() ? imageData()!.urlP : imageData()!.urlL}
            alt="loginimg"
            loading="lazy"
            class={styles.loginImage}
          />
          <p class={styles.backgroundText}>{imageData()!.text}</p>
          <p class={styles.backgroundTitle}>{imageData()!.title}</p>
        </Show>

        <div class={styles.loginContainer}>
          <form action={loginAction} method="post" class={styles.loginForm}>
            <input name="password" type="password" class={styles.loginInput} />
            <div class={styles.loginItem}>
              <button
                type="submit"
                class={
                  loggingIn.pending ? styles.loginBtnLoading : styles.loginBtn
                }
              >
                <img src="images/main/clover.webp" width={21} height={21} />
              </button>
            </div>
          </form>
          <Show when={loggingIn.result}>
            <p class={styles.loginAlert} role="alert" id="error-message">
              {loggingIn.result!.message}
            </p>
          </Show>
        </div>
      </main>
    </MetaProvider>
  );
}
