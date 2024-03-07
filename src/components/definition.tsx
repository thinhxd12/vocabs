import {
  Component,
  Index,
  Setter,
  Show,
  createMemo,
  createSignal,
} from "solid-js";
import { VocabularyType } from "~/types";
import "/public/styles/definition.scss";
import { OcUnmute2, OcCheck2 } from "solid-icons/oc";
import { FaSolidFeather } from "solid-icons/fa";

let audioRef: HTMLAudioElement;

const Definition: Component<{
  item: VocabularyType;
  onEdit?: Setter<boolean>;
  onCheck?: Setter<boolean>;
  count?: number;
}> = (props) => {
  const currenText = createMemo(() => props.item);
  const [audioSource, setAudioSource] = createSignal<string>("");
  const handlePlaySound = () => {
    setAudioSource(currenText().sound);
    audioRef.play();
  };

  return (
    <>
      <audio src={audioSource()} hidden ref={audioRef}></audio>
      <div class="definition">
        <div class="definitionHeader">
          <div class="definitionHeaderLeft">
            <Show
              when={props.count}
              fallback={
                <p class="definitionHeaderText">
                  Definitions of <b>{currenText()?.text}</b>{" "}
                  <i>{currenText()?.class}</i>
                </p>
              }
            >
              <p class="definitionHeaderText">
                <span>{props.count}.</span> <b>{currenText().text}</b>{" "}
                <i>{currenText()?.class}</i>
              </p>
            </Show>
          </div>
          <div class="definitionHeaderRight">
            <button class="button button--primary" onclick={handlePlaySound}>
              <OcUnmute2 size={12} />
            </button>
            <Show when={props.onEdit}>
              <button class="button button--primary" onclick={props.onEdit}>
                <FaSolidFeather size={12} />
              </button>
            </Show>
            <Show when={props.onCheck}>
              <button class="button button--success" onclick={props.onCheck}>
                <OcCheck2 size={13} />
              </button>
            </Show>
          </div>
        </div>
        <div class="definitionBody">
          <Show
            when={currenText()?.definitions.length > 1}
            fallback={
              <Index each={currenText()?.definitions}>
                {(m, i) => {
                  return (
                    <div class="sn-gs">
                      <div innerHTML={m()} class="sn-g" />
                    </div>
                  );
                }}
              </Index>
            }
          >
            <Index each={currenText()?.definitions}>
              {(m, i) => {
                return (
                  <div class="sn-gs">
                    <div class="sn-g">
                      <div class="num">{1 + i}:</div>
                      <div innerHTML={m()} />
                    </div>
                  </div>
                );
              }}
            </Index>
          </Show>
        </div>
      </div>
    </>
  );
};

export default Definition;
