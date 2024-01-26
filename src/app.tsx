// @refresh reload
import { A, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start";
import { Suspense } from "solid-js";
import "./app.scss";

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <A href="/">Index</A>
          <A href="/about">About</A>
          <A href="/page">Page</A>
          <Suspense>{props.children}</Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
