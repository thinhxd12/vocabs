import { Component, createEffect, createSignal, Show, untrack } from "solid-js";

const ImageLoading: Component<{
  src: string;
  width: number;
  height: number;
  class: string;
}> = (props) => {
  const [isLoading, setIsLoading] = createSignal<boolean>(true);
  createEffect(() => {
    untrack(() => {
      setIsLoading(true);
    });
    const img = new Image();
    img.src = props.src;
    const handleLoad = () => setIsLoading(false);
    img.addEventListener("load", handleLoad);
  });
  return (
    <Show
      when={isLoading()}
      fallback={
        <img
          src={props.src}
          width={props.width}
          height={props.height}
          style={{ "object-fit": "cover" }}
          class={props.class}
        />
      }
    >
      <div
        style={{
          width: `${props.width}px`,
          height: `${props.height}px`,
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
          background: "#e7e7e7",
        }}
      >
        <img src="images/svg/loader-button.svg" width={27} height={27} />
      </div>
    </Show>
  );
};

export default ImageLoading;
