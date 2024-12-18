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

import { rgbaToThumbHash, thumbHashToDataURL } from "thumbhash";
import sharp from "sharp";
import { Buffer } from "buffer";

const Text: Component<{}> = (props) => {
  const [result, setResult] = createSignal<any>();
  const notify = async () => {
    const res = await getTextDataWebster("chalet");
    console.log(res);
    setResult(res);
  };
  const uint8ArrayToBase64 = (uint8Array: any) => {
    // Convert Uint8Array to a string (using String.fromCharCode)
    let binaryString = String.fromCharCode.apply(null, uint8Array);

    // Then use btoa to encode that string to base64
    return btoa(binaryString);
  };

  const createThumbhash = async (imageUrl: string) => {
    "use server";
    const imageBuffer = await fetch(imageUrl).then((res) => res.arrayBuffer());
    const image = sharp(imageBuffer).resize(90, 90, { fit: "inside" });
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const binaryThumbHash = rgbaToThumbHash(info.width, info.height, data);
    const base64String = btoa(
      String.fromCharCode(...new Uint8Array(binaryThumbHash)),
    );
    return base64String;
  };

  const notify1 = async () => {
    const url =
      "https://fastly.picsum.photos/id/237/536/354.jpg?hmac=i0yVXW1ORpyCZpQ-CknuyV-jbtU7_x9EBQVhvT5aRr0";
    const res = await createThumbhash(url);
    console.log(res);
  };

  return (
    <div class="flex flex-col items-start">
      <button onClick={notify}>click</button>
      <button onClick={notify1}>click1</button>
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
