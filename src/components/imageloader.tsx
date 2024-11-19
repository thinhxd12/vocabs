import { Component, createEffect, createSignal, on, Show } from "solid-js";
import { rgbaToThumbHash, thumbHashToDataURL } from 'thumbhash'
import sharp from "sharp";

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

  const createThumbhash = async (imageUrl: string) => {
    "use server"
    const imageBuffer = await fetch(imageUrl).then(res => res.arrayBuffer());
    const image = sharp(imageBuffer).resize(100, 100, { fit: 'inside' });
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const binaryThumbHash = rgbaToThumbHash(info.width, info.height, data)
    return binaryThumbHash;
  }

  createEffect(
    on(
      () => props.src,
      (curr, prev) => {
        if (curr !== prev) {
          setIsLoading(true);
          setPlaceholderData("");
          setTimeout(async () => {
            if (isLoading()) {
              const hash = await createThumbhash(props.src);
              setPlaceholderData(thumbHashToDataURL(hash));
            }
          }, 300);
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
      }}>
      <Show when={placeholderData()}>
        <img
          src={placeholderData()}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            "object-fit": "cover",
            opacity: isLoading() ? 1 : 0,
            transition: "opacity 0.3s"
          }}
          loading="lazy"
        />
      </Show>
      <img
        src={props.src}
        alt={props.alt}
        style={{
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
