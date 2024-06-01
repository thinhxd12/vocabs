import { A } from "@solidjs/router";
import styles from "./404.module.scss";

export default function NotFound() {
  return (
    <div class={styles.main}>
      <h1 class={styles.title}>404 - Page not found</h1>
      <p class={styles.content}>
        The page you are looking for might have been removed had its name
        changed or is temporarily unavailable.
      </p>
      <A href="/vocabulary" class={styles.button}>
        Back to home page
      </A>
    </div>
  );
}
