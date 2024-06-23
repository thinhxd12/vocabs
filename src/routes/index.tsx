import { useSubmission, type RouteSectionProps } from "@solidjs/router";
import { Show, createResource } from "solid-js";
import styles from "./index.module.scss";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { loginAction } from "~/lib";

export default function Login(props: RouteSectionProps) {
  const loggingIn = useSubmission(loginAction);
  const getSpotlightImage = async () => {
    let batchQuery = {} as any;
    batchQuery["pid"] = "338387";
    batchQuery["fmt"] = "json";
    batchQuery["rafb"] = "0";
    batchQuery["ua"] = "WindowsShellClient/1";
    batchQuery["cdm"] = "1";
    batchQuery["disphorzres"] = "1920";
    batchQuery["dispvertres"] = "1080";
    batchQuery["lo"] = "80217";
    batchQuery["pl"] = "en-US";
    batchQuery["lc"] = "en-US";
    batchQuery["ctry"] = "kr";
    const baseUrl =
      "https://arc.msn.com/v3/Delivery/Placement?" +
      new URLSearchParams(batchQuery).toString();
    const data = await (await fetch(baseUrl)).json();
    if (data) {
      const itemStr = data["batchrsp"]["items"][0].item;
      const itemObj = JSON.parse(itemStr)["ad"];
      // const title = itemObj["title_text"]?.tx;
      // const text2 = itemObj["hs2_cta_text"]?.tx || '';
      // const jsImageP = itemObj["image_fullscreen_001_portrait"];
      const title = itemObj["hs2_title_text"]?.tx;
      const jsImageL = itemObj["image_fullscreen_001_landscape"];
      return { text: title, url: jsImageL.u };
    }
  };

  const [image] = createResource(getSpotlightImage);

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
        <Show when={!image.loading}>
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
