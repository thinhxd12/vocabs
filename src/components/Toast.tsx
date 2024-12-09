import { Toast, toaster } from "@kobalte/core/toast";
import { JSX } from "solid-js/jsx-runtime";
import { Switch, Match } from "solid-js/web";
import "../styles/toast.css";
import { OcX2 } from "solid-icons/oc";

function show(message: string) {
  return toaster.show((props) => (
    <Toast toastId={props.toastId} class="toast">
      {message}
    </Toast>
  ));
}
function success(message: string) {
  return toaster.show((props) => (
    <Toast toastId={props.toastId} class="toast toast--success">
      <div class="toast__content">
        <div class="mr-2 h-10 w-10 min-w-10 rounded-md bg-[#E3FEE6] p-[5px]">
          <div class="icon relative h-full w-full rounded-[50%] bg-[#2DD743]"></div>
        </div>
        <div>
          <Toast.Title class="toast__title">Status</Toast.Title>
          <Toast.Description class="toast__description">
            {message}
          </Toast.Description>
        </div>
        <Toast.CloseButton class="toast__close-button">
          <OcX2 size={15} />
        </Toast.CloseButton>
      </div>
      <Toast.ProgressTrack class="toast__progress-track">
        <Toast.ProgressFill class="toast__progress-fill" />
      </Toast.ProgressTrack>
    </Toast>
  ));
}
function error(message: string) {
  return toaster.show((props) => (
    <Toast toastId={props.toastId} class="toast toast--error">
      <div class="toast__content">
        <div class="mr-2 h-10 w-10 min-w-10 rounded-md bg-[#FFEAEC] p-[5px]">
          <div class="icon relative h-full w-full rounded-[50%] bg-[#E63435]"></div>
        </div>
        <div>
          <Toast.Title class="toast__title">Status</Toast.Title>
          <Toast.Description class="toast__description">
            {message}
          </Toast.Description>
        </div>
        <Toast.CloseButton class="toast__close-button">
          <OcX2 size={15} />
        </Toast.CloseButton>
      </div>
      <Toast.ProgressTrack class="toast__progress-track">
        <Toast.ProgressFill class="toast__progress-fill" />
      </Toast.ProgressTrack>
    </Toast>
  ));
}
function promise<T, U>(
  promise: Promise<T> | (() => Promise<T>),
  options: {
    loading?: JSX.Element;
    success?: (data: T) => JSX.Element;
    error?: (error: U) => JSX.Element;
  },
) {
  return toaster.promise(promise, (props) => (
    <Toast
      toastId={props.toastId}
      classList={{
        toast: true,
        "toast-loading": props.state === "pending",
        "toast-success": props.state === "fulfilled",
        "toast-error": props.state === "rejected",
      }}
    >
      <Switch>
        <Match when={props.state === "pending"}>{options.loading}</Match>
        <Match when={props.state === "fulfilled"}>
          {options.success?.(props.data!)}
        </Match>
        <Match when={props.state === "rejected"}>
          {options.error?.(props.error)}
        </Match>
      </Switch>
    </Toast>
  ));
}
function custom(jsx: () => JSX.Element) {
  return toaster.show((props) => (
    <Toast toastId={props.toastId}>{jsx()}</Toast>
  ));
}
function dismiss(id: number) {
  return toaster.dismiss(id);
}
export const toast = {
  show,
  success,
  error,
  promise,
  custom,
  dismiss,
};
