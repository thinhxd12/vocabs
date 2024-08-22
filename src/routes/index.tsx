import { useSubmission, type RouteSectionProps } from "@solidjs/router";
import { Show, createSignal, onMount } from "solid-js";
import styles from "./index.module.scss";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { loginAction } from "~/lib";
import { getSpotlightImage } from "~/lib/api";

export default function Login(props: RouteSectionProps) {
  const loggingIn = useSubmission(loginAction);

  const [image, setImage] = createSignal<{
    title: string;
    text: string;
    url: string;
  }>({
    title: "",
    text: "",
    url: "",
  });

  onMount(async () => {
    const flag =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    const data = await getSpotlightImage();
    if (data)
      setImage({
        title: data.title,
        text: data.text,
        url: flag ? data.urlP : data.urlL,
      });
  });

  return (
    <MetaProvider>
      <Title>login</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <main
        class={styles.login}
        style={{
          "background-image": `url("/${image()?.url}")`,
        }}
      >
        <Show when={image().text !== ""}>
          <p class={styles.backgroundText}>{image()!.text}</p>
        </Show>
        <Show when={image().title !== ""}>
          <p class={styles.backgroundTitle}>{image()!.title}</p>
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
