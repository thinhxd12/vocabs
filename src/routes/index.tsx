import { useSubmission, type RouteSectionProps } from "@solidjs/router";
import { Show, createResource, createSignal, onMount } from "solid-js";
import styles from "./index.module.scss";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { loginAction } from "~/lib";
import { getSpotlightImage } from "~/lib/api";

export default function Login(props: RouteSectionProps) {
  const loggingIn = useSubmission(loginAction);
  const [image, setImage] = createSignal<{ text: string; url: string }>({
    text: "",
    url: "",
  });
  
  onMount(async () => {
    const data = await getSpotlightImage();
    if (data) setImage(data);
  });

  return (
    <MetaProvider>
      <Title>login</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <main
        class={styles.login}
        style={{
          "background-image": `url("${image()?.url}")`,
        }}
      >
        <Show when={image().text}>
          <p class={styles.backgroundText}>{image()!.text}</p>
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
                <img src="/images/main/laurel.webp" width={18} height={18} />
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
