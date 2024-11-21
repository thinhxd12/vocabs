import { Component, createEffect, createSignal, on } from "solid-js";
import { blurhashFromURL } from "blurhash-from-url";
import decode from "@simpleimg/decode-blurhash";

const ImageLoaderMainPage: Component<{
  src: string;
}> = (props) => {
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [placeholderData, setPlaceholderData] = createSignal<string>("");
  const [placeholderBlurData, setPlaceholderBlurData] = createSignal<string>("");

  const handleLoad = () => {
    setIsLoading(false);
  };

  const createBlurhash = async (imageUrl: string) => {
    "use server"
    const output = await blurhashFromURL(imageUrl);
    return output;
  }

  createEffect(
    on(
      () => props.src,
      async (curr, prev) => {
        if (curr !== prev) {
          setIsLoading(true);
          setPlaceholderData("");
          const hash = await createBlurhash(props.src);
          const dataUrl = decode(hash.encoded, hash.width, hash.height);
          setPlaceholderData(dataUrl);
          setPlaceholderBlurData(dataUrl);
        }
      }
    )
  );

  return (
    <div style={{
      width: "100%",
      height: "100%",
      display: "flex",
      "align-items": "center",
      "justify-content": "center",
      padding: "3vh 0 7vh",
    }}>

      <img
        src={placeholderBlurData()}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          "z-index": 0,
          width: "100%",
          height: "100%",
          filter: "brightness(0.9)",
          "object-fit": "cover",
          transition: "all 0.3s",
        }}
      />

      <img
        src={placeholderData()}
        style={{
          position: "absolute",
          "z-index": 1,
          "max-height": "90vh",
          "max-width": "calc(100vw - 750px)",
          opacity: isLoading() ? 1 : 0,
          transition: "opacity 0.3s",
          "box-shadow": "-9px 18px 12px 0px rgba(0, 0, 0, 0.81)",
        }}
      />

      <img
        src={props.src}
        style={{
          position: "relative",
          "z-index": 2,
          "max-height": "90vh",
          "max-width": "calc(100vw - 750px)",
          opacity: isLoading() ? 0 : 1,
          transition: "opacity 0.3s",
          "box-shadow": "-9px 18px 12px 0px rgba(0, 0, 0, 0.81)",
        }}
        onload={handleLoad}
      />
    </div>
  );
};

export default ImageLoaderMainPage;
