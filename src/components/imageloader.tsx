import { Component, createEffect, createSignal, on, Show } from "solid-js";
import { rgbaToThumbHash, thumbHashToDataURL, } from "thumbhash";
import sharp from "sharp";

const ImageLoader: Component<{
  src: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
}> = (props) => {
  const [loaded, setLoaded] = createSignal<boolean>(false);
  const [showPlaceholder, setShowPlaceholder] = createSignal<boolean>(false);
  const [placeholderData, setPlaceholderData] = createSignal<string>("");

  const handleLoad = () => {
    setLoaded(true);
  };

  const createThumbhash = async (imageUrl: string) => {
    "use server"
    const imageBuffer = await fetch(imageUrl).then(res => res.arrayBuffer());
    const image = sharp(imageBuffer).resize(90, 90, { fit: 'inside' });
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const binaryThumbHash = rgbaToThumbHash(info.width, info.height, data);
    return binaryThumbHash;
  }

  createEffect(
    on(
      () => props.src,
      async (curr, prev) => {
        if (curr !== prev) {
          setLoaded(false);
          setShowPlaceholder(false);
          const thumbhash = await createThumbhash(props.src);
          setPlaceholderData(thumbHashToDataURL(thumbhash));
          setShowPlaceholder(true);
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
        overflow: "hidden",
      }}>
      <Show when={showPlaceholder()}>
        <img
          src={placeholderData()}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            "object-fit": "cover",
            "z-index": 6,
            opacity: loaded() ? 0 : 1,
            transition: "all 0.3s",
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
