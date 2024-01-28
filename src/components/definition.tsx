import { Index, Setter, createEffect, createSignal } from "solid-js";
import { VocabularyType } from "~/types";
import { OcMute2, OcX2, OcUnmute2 } from "solid-icons/oc";
import { createAudio } from "@solid-primitives/audio";

type Props = {
  item: VocabularyType;
  onClose: Setter<boolean>;
};

const Definition = (props: Props) => {
  createEffect(() => {
    setAudioSource(props.item.sound);
  });
  const [audioSource, setAudioSource] = createSignal(props.item.sound);
  const [playing, setPlaying] = createSignal(false);
  const [volume, setVolume] = createSignal(1);
  const [audio, { seek }] = createAudio(audioSource, playing, volume);

  return (
    <div class="definition">
      <div class="definitionTop">
        <button class="definitionBtn" onclick={() => setPlaying(!playing())}>
          {playing() ? <OcMute2 size={12} /> : <OcUnmute2 size={12} />}
        </button>
        <button class="definitionBtn" onclick={props.onClose}>
          <OcX2 size={12} />
        </button>
      </div>
      <div class="definitionHeader">
        <span>Definitions of</span>
        <span>{props.item.text}</span>
        <span>{props.item.class}</span>
      </div>
      <div class="definitionBody">
        <Index each={props.item.definitions}>
          {(m, i) => <div class="sn-g" innerHTML={m()} />}
        </Index>
      </div>
    </div>
  );
};

export default Definition;
