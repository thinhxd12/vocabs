import { Component, createEffect, createResource, createSignal, on, onCleanup, Show, untrack } from "solid-js";

const ImageLoading: Component<{
  src: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
}> = (props) => {
  const [isLoading, setIsLoading] = createSignal<boolean>(true);

  const handleLoad = () => {
    setIsLoading(false);
  };

  createEffect(() => {
    untrack(() => {
      setIsLoading(true);
    });

    const img = new Image();
    img.src = props.src;
    img.onload = handleLoad;

    onCleanup(() => {
      img.onload = null;
    });
  });

  return (
    <div class={props.className} style={{ width: `${props.width}px`, height: `${props.height}px` }}>
      <Show when={isLoading()}
        fallback={
          <img
            src={props.src}
            alt={props.alt || "..."}
            style={{
              width: "100%",
              height: "100%",
              "object-fit": "cover",
            }}
            loading="lazy"
          />
        }
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
            background: "#e7e7e7",
          }}
        >
          <img src="images/svg/loader-button.svg" width={props.width / 9} height={props.width / 9} />
        </div>
      </Show>
    </div>
  );
};

export default ImageLoading;
