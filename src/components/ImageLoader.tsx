import { Component, createEffect, createSignal, on, Show } from "solid-js";
import { thumbHashToDataURL } from "thumbhash";
import { VocabularyDefinitionType } from "~/types";
import { base64ToUint8Array, createThumbhash } from "~/lib/server";

const ImageLoader: Component<{
  id?: string;
  def?: VocabularyDefinitionType[];
  src: string;
  width: number;
  height: number;
  className?: string;
  hash?: string;
}> = (props) => {
  const [loaded, setLoaded] = createSignal<boolean>(false);
  const [placeholderData, setPlaceholderData] = createSignal<string>("");

  const handleLoad = () => {
    setLoaded(true);
  };

  createEffect(
    on(
      () => props.src,
      async (curr, prev) => {
        if (curr !== prev) {
          setLoaded(false);
          setPlaceholderData("");
          if (!props.hash) {
            const thumbhash = await createThumbhash(props.src);
            const thumbHashFromBase64 = base64ToUint8Array(thumbhash);
            setPlaceholderData(thumbHashToDataURL(thumbHashFromBase64));
            // if (props.id !== undefined) {
            //   let editDefinition = JSON.parse(JSON.stringify(props.def));
            //   editDefinition.forEach((entry: any) => {
            //     entry.definitions.forEach((def: any) => {
            //       if (def.image === props.src) def.hash = thumbhash;
            //     });
            //   });
            //   updateHashVocabularyItem(props.id!, editDefinition);
            // }
          } else {
            const thumbHashFromBase64 = base64ToUint8Array(props.hash);
            setPlaceholderData(thumbHashToDataURL(thumbHashFromBase64));
          }
        }
      },
    ),
  );

  return (
    <div
      class={props.className}
      style={{
        width: `${props.width}px`,
        height: `${props.height}px`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Show when={placeholderData()}>
        <img
          class="absolute left-0 top-0 z-20 h-full w-full object-cover"
          src={placeholderData()}
          alt="placeholder"
          style={{
            opacity: loaded() ? 0 : 1,
          }}
        />
      </Show>
      <img
        class="absolute left-0 top-0 z-10 h-full w-full object-cover"
        src={props.src}
        onLoad={handleLoad}
        loading="eager"
        style={{
          opacity: loaded() ? 1 : 0,
        }}
      />
    </div>
  );
};

export default ImageLoader;
