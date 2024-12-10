import {
  Component,
  createEffect,
  createSignal,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import toast, { Toaster } from "solid-toast";
import Collapsible from "~/components/Collapsible";

const Text: Component<{}> = (props) => {
  const options = { position: "top-right" };
  const notify = () =>
    toast.success("Successfully saved!", {
      position: "bottom-right",
      duration: 500000,
      className: "text-4 font-sfpro",
    });
  const notifyErr = () =>
    toast.error("Successfully saved!", { position: "bottom-right" });

  return (
    <div>
      <button onClick={notify}>Suc</button>
      <button onClick={notifyErr}>Err</button>

      <Collapsible title="Section 2">
        <p>This is the content for Section 2. You can add more details here.</p>
      </Collapsible>
      <Toaster />
    </div>
  );
};

export default Text;
