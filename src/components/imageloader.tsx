import { Component, createEffect, createSignal, on, Show } from "solid-js";
import { blurhashFromURL } from "blurhash-from-url";
import decode from "@simpleimg/decode-blurhash";

const ImageLoader: Component<{
  src: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
}> = (props) => {
  const [isLoading, setIsLoading] = createSignal<boolean>(true);
  const [placeholderData, setPlaceholderData] = createSignal<string>("");

  const handleLoad = () => {
    setIsLoading(false);
  };

  const createBlurhash = async (imageUrl: string) => {
    "use server"
    const startTime = performance.now();
    const output = await blurhashFromURL(imageUrl);
    const endTime = performance.now();
    const timeTaken = endTime - startTime;
    if (timeTaken > 300) {
      return output;
    }
  }

  createEffect(
    on(
      () => props.src,
      async (curr, prev) => {
        if (curr !== prev) {
          setIsLoading(true);
          setPlaceholderData("");
          const hash = await createBlurhash(props.src);
          if (isLoading()) {
            if (hash) setPlaceholderData(decode(hash.encoded, 30, 30));
          }
        }
      }
    )
  );


  return (
    <div class={props.className}
      style={{
        width: `${props.width}px`,
        height: `${props.height}px`,
        position: "relative",
        "background-color": "#000000",
        overflow: "hidden",
      }}>
      <Show when={placeholderData()}>
        <img
          src={placeholderData()}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            "object-fit": "cover",
            "z-index": 6,
            opacity: isLoading() ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        />
      </Show>
      <img
        src={props.src}
        alt={props.alt}
        style={{
          position: "inherit",
          "z-index": 3,
          width: "100%",
          height: "100%",
          "object-fit": "cover",
        }}
        onload={handleLoad}
        loading="lazy"
      />
    </div>
  );
};

export default ImageLoader;
