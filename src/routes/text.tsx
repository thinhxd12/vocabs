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
  const [result, setResult] = createSignal("");
  const notify = async () => {
    "use server";
    // const url =
    //   "https://visualelsewhere.wordpress.com/?infinity=scrolling?action=infinite_scroll&page=3&currentday=25.10.24&order=DESC";

    const url = "https://visualelsewhere.wordpress.com/wp-json/wp/v2/2023/07/";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const res = await response.json();
    console.log(res);
    // setResult(JSON.stringify(res));
    // setResult(res);
    // return res;
  };

  return (
    <div>
      <button
        onClick={notify}
        class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        Suc
      </button>

      <div>{result()}</div>
    </div>
  );
};

export default Text;
