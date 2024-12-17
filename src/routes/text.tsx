import { FaSolidLocationDot } from "solid-icons/fa";
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
import {
  getLayoutImage,
  getOedSoundURL,
  getTextDataWebster,
} from "~/lib/server";

const Text: Component<{}> = (props) => {
  const [result, setResult] = createSignal<any>();
  const notify = async () => {
    const res = await getOedSoundURL("grizzle");
    console.log(res);
    setResult(res);
  };

  // const notify1 = async () => {
  //   const res = await getTextDataWebster1("gutter");
  //   console.log(res);
  //   setResult(res);
  // };

  return (
    <div class="flex flex-col items-start">
      <button onClick={notify}>click</button>
      {/* <button onClick={notify1}>click1</button> */}
      <textarea
        name="abc"
        class="border-1 w-1/2 border"
        value={JSON.stringify(result()?.definitions, null, " ")}
        rows={12}
      ></textarea>
    </div>
  );
};

export default Text;
