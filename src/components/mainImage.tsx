import { Component, createEffect, createSignal, on, Show } from "solid-js";
import { rgbaToThumbHash, thumbHashToDataURL, thumbHashToApproximateAspectRatio } from 'thumbhash'
import sharp from "sharp";

const MainImageLoader: Component<{
  src: string;
}> = (props) => {
  const [isLoading, setIsLoading] = createSignal<boolean>(true);
  const [placeholderData, setPlaceholderData] = createSignal<string>("");
  const [placeholderBlurData, setPlaceholderBlurData] = createSignal<string>("");
  const [placeholderRatio, setPlaceholderRatio] = createSignal<number>(1);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const createThumbhash = async (imageUrl: string) => {
    "use server"
    const imageBuffer = await fetch(imageUrl).then(res => res.arrayBuffer());
    const image = sharp(imageBuffer).resize(100, 100, { fit: 'inside' });
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const binaryThumbHash = rgbaToThumbHash(info.width, info.height, data)
    return [binaryThumbHash, info.width / info.height];
  }

  createEffect(
    on(
      () => props.src,
      async (curr, prev) => {
        if (curr !== prev) {
          setIsLoading(true);
          setPlaceholderData("");
          const hash = await createThumbhash(props.src);
          setPlaceholderRatio(hash[1] as number);
          const dataUrl = thumbHashToDataURL(hash[0] as ArrayLike<number>);
          setPlaceholderData(dataUrl);
          setPlaceholderBlurData(dataUrl);
        }
      }
    )
  );


  return (

    <div style={{
      position: "relative",
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
          "z-index": 3,
          width: "100%",
          height: "100%",
          filter: "blur(120px) brightness(0.9)",
          "object-fit": "cover"
        }}
      />

      <div style={{
        position: "relative",
        "z-index": 6,
        height: placeholderRatio() <= 1 ? "85vh" : `calc((100vw - 750px) / ${placeholderRatio()})`,
        width: placeholderRatio() <= 1 ? `${85 * placeholderRatio()}vh` : "calc(100vw - 750px)",
        "box-shadow": "-9px 18px 12px 0px rgba(0, 0, 0, 0.81)",
        transition: "all 0.45s"
      }}>

        <Show when={placeholderData()}>
          <img
            src={placeholderData()}
            style={{
              position: "absolute",
              "z-index": isLoading() ? 12 : 9,
              "width": "100%",
              "height": "100%",
              "object-fit": "cover",
              transition: "z-index 0.45s"
            }}
            loading="lazy"
          />
        </Show>

        <img
          src={props.src}
          style={{
            position: "absolute",
            "z-index": isLoading() ? 9 : 12,
            "width": "100%",
            "height": "100%",
            "object-fit": "cover",
            transition: "z-index 0.45s"
          }}
          onload={handleLoad}
          loading="lazy"
        />
      </div>

    </div>
  );
};

export default MainImageLoader;
