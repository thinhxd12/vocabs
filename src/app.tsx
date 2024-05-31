// @refresh reload
import { Router } from "@solidjs/router";
import { Suspense } from "solid-js";
import { FileRoutes } from "@solidjs/start/router";
import "./app.scss";
import Home from "~/components/home";

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <Home>
            <Suspense>{props.children}</Suspense>
          </Home>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
