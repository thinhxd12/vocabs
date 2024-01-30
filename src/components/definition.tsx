import { Index, Setter, createEffect, createSignal } from "solid-js";
import { VocabularyType } from "~/types";
import { OcMute2, OcX2, OcUnmute2 } from "solid-icons/oc";
import { createAudio } from "@solid-primitives/audio";
import "/public/styles/definition.scss";
import { Motion, Presence } from "solid-motionone";

type Props = {
  item: VocabularyType;
  onClose: Setter<boolean>;
};

const Definition = (props: Props) => {
  const [audioSource, setAudioSource] = createSignal(props.item.sound);
  const [playing, setPlaying] = createSignal(false);
  const [volume, setVolume] = createSignal(1);
  const [audio, { seek }] = createAudio(audioSource, playing, volume);

  createEffect(() => {
    setAudioSource(props.item.sound);
  });

  return (
    <div class="definition">
      <div class="definitionHeader">
        <div class="definitionHeaderLeft">
          <p class="definitionHeaderText">
            Definitions of <b>{props.item.text}</b> <i>{props.item.class}</i>
          </p>
        </div>
        <div class="definitionHeaderRight">
          <button class="definitionBtn" onclick={() => setPlaying(!playing())}>
            {playing() ? <OcMute2 size={12} /> : <OcUnmute2 size={12} />}
          </button>
          <button class="definitionBtn" onclick={props.onClose}>
            <OcX2 size={12} />
          </button>
        </div>
      </div>
      <div class="definitionBody">
        <Index each={props.item.definitions}>
          {(m, i) => {
            return (
              <div class="sn-gs">
                <div class="num">{1 + i}</div>
                <div innerHTML={m()} class="sn-g" />
              </div>
            );
          }}
        </Index>
      </div>
    </div>
  );
};

export default Definition;
