import { Component, createEffect, createSignal, on, Show } from "solid-js";
import { rgbaToThumbHash, thumbHashToDataURL } from "thumbhash";
import sharp from "sharp";
import { Buffer } from "buffer"
import { updateHashVocabularyItem } from "~/lib/api";
import { VocabularyDefinitionType } from "~/types";

const ImageLoaderWord: Component<{
  id: string;
  src: string;
  hash: string;
  def: VocabularyDefinitionType[];
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
    const image = sharp(imageBuffer).resize(30, 30, { fit: 'inside' });
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const binaryThumbHash = rgbaToThumbHash(info.width, info.height, data);
    return Buffer.from(binaryThumbHash).toString('base64');
  }

  createEffect(
    on(
      () => props.src,
      async (curr, prev) => {
        if (curr !== prev) {
          setLoaded(false);
          setShowPlaceholder(false);
          if (!props.hash) {
            const thumbhash = await createThumbhash(props.src);
            const thumbHashFromBase64 = Buffer.from(thumbhash, 'base64')
            setPlaceholderData(thumbHashToDataURL(thumbHashFromBase64));
            let editDefinition = JSON.parse(JSON.stringify(props.def))
            editDefinition.forEach((entry: any) => {
              entry.definitions.forEach((def: any) => {
                if (def.image === props.src)
                  def.hash = thumbhash;
              });
            });
            updateHashVocabularyItem(props.id, editDefinition);
          }
          else {
            const thumbHashFromBase64 = Buffer.from(props.hash, 'base64')
            setPlaceholderData(thumbHashToDataURL(thumbHashFromBase64));
          }
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

export default ImageLoaderWord;
