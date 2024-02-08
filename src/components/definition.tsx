import { Index, Setter, Show, createEffect, createSignal, on } from "solid-js";
import { VocabularyType } from "~/types";
import { OcMute2, OcX2, OcUnmute2, OcCheck2 } from "solid-icons/oc";
import { createAudio } from "@solid-primitives/audio";
import "/public/styles/definition.scss";
import { Motion, Presence } from "solid-motionone";

type Props = {
  item: VocabularyType;
  onClose?: Setter<boolean>;
  onCheck?: Setter<boolean>;
  check?: boolean;
};

const Definition = (props: Props) => {
  const [audioSource, setAudioSource] = createSignal("");
  const [currentDefinitions, setCurrentDefinitions] = createSignal<string[]>(
    []
  );
  const [playing, setPlaying] = createSignal(false);
  const [volume, setVolume] = createSignal(1);
  const [audio, { seek }] = createAudio(audioSource, playing, volume);
  createEffect(
    on(
      () => props.item?.text,
      () => {
        setAudioSource(props.item?.sound);
        setCurrentDefinitions(props.item?.definitions);
      }
    )
  );

  return (
    <div class="definition">
      <div class="definitionHeader">
        <div class="definitionHeaderLeft">
          <p class="definitionHeaderText">
            Definitions of <b>{props.item?.text}</b> <i>{props.item?.class}</i>
          </p>
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
        <Show when={currentDefinitions().length > 0}>
          <Index each={currentDefinitions()}>
            {(m, i) => {
              if (currentDefinitions().length > 1) {
                return (
                  <div class="sn-gs">
                    <div class="num">{1 + i}</div>
                    <div innerHTML={m()} class="sn-g" />
                  </div>
                );
              }
              return (
                <div class="sn-gs">
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
