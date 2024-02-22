import {
  Component,
  Index,
  Setter,
  Show,
  createEffect,
  createSignal,
  on,
} from "solid-js";
import { VocabularyType } from "~/types";
import { OcMute2, OcX2, OcUnmute2, OcCheck2 } from "solid-icons/oc";
import { createAudio } from "@solid-primitives/audio";
import "/public/styles/definition.scss";

const Definition: Component<{
  item: VocabularyType;
  onClose?: Setter<boolean>;
  onCheck?: Setter<boolean>;
  check?: boolean;
  count?: number;
}> = (props) => {
  const [audioSource, setAudioSource] = createSignal("");
  const [currentDefinitions, setCurrentDefinitions] = createSignal<string[]>(
    []
  );
  const [playing, setPlaying] = createSignal(false);
  const [volume, setVolume] = createSignal(1);
  const [audio, { seek }] = createAudio(audioSource, playing, volume);

  createEffect(
    on(
      () => props.item,
      (cur: VocabularyType) => {
        if(cur){
          setAudioSource(cur.sound);
          setCurrentDefinitions(cur.definitions);
        }
      }
    )
  );

  return (
    <div class="definition">
      <div class="definitionHeader">
        <div class="definitionHeaderLeft">
          <Show
            when={props.count}
            fallback={
              <p class="definitionHeaderText">
                Definitions of <b>{props.item?.text}</b>{" "}
                <i>{props.item?.class}</i>
              </p>
            }
          >
            <p class="definitionHeaderText">
              <span>{props.count}.</span> <b>{props.item?.text}</b>{" "}
              <i>{props.item?.class}</i>
            </p>
          </Show>
        </div>
        <div class="definitionHeaderRight">
          <button class="definitionBtn" onclick={() => setPlaying(!playing())}>
            {playing() ? <OcMute2 size={12} /> : <OcUnmute2 size={12} />}
          </button>
          <Show when={!props.onCheck}>
            <button class="definitionBtn" onclick={props.onClose}>
              <OcX2 size={12} />
            </button>
          </Show>
          <Show when={props.onCheck}>
            <button class="definitionBtn" onclick={props.onCheck}>
              <OcCheck2 size={12} />
            </button>
          </Show>
        </div>
      </div>
      <div class="definitionBody">
        <Show
          when={currentDefinitions().length > 1}
          fallback={
            <Index each={currentDefinitions()}>
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
          <Index each={currentDefinitions()}>
            {(m, i) => {
              return (
                <div class="sn-gs">
                  <div class="num">{1 + i}:</div>
                  <div innerHTML={m()} class="sn-g" />
                </div>
              );
            }}
          </Index>
        </Show>
      </div>
    </div>
  );
};

export default Definition;
