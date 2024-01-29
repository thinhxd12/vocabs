import { Index, Setter, createEffect, createSignal } from "solid-js";
import { VocabularyType } from "~/types";
import { OcMute2, OcX2, OcUnmute2 } from "solid-icons/oc";
import { createAudio } from "@solid-primitives/audio";
import "/public/styles/definition.scss";
import { Motion, Presence } from "solid-motionone";
import { start } from "repl";

type Props = {
  item: VocabularyType;
  onClose: Setter<boolean>;
};

const Definition = (props: Props) => {
  createEffect(() => {
    setAudioSource(props.item.sound);
    console.log(props.item);
  });
  const [audioSource, setAudioSource] = createSignal(props.item.sound);
  const [playing, setPlaying] = createSignal(false);
  const [volume, setVolume] = createSignal(1);
  const [audio, { seek }] = createAudio(audioSource, playing, volume);

  return (
    <Presence exitBeforeEnter>
      <Motion.div
        class="definition"
        initial={{
          opacity: 0,
          y: -30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 30,
        }}
        transition={{ duration: 0.3, easing: "ease-in-out" }}
      >
        <div class="definitionHeader">
          <div class="definitionHeaderLeft">
            <span>Definitions of</span>
            <span>{props.item.text}</span>
            <span>{props.item.class}</span>
          </div>
          <div class="definitionHeaderRight">
            <button
              class="definitionBtn"
              onclick={() => setPlaying(!playing())}
            >
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
              if (props.item.definitions.length > 1) {
                return (
                  <div class="sn-gs">
                    <span class="num">{i + 1}</span>
                    <div innerHTML={m()} class="sn-g"/>
                  </div>
                );
              }
              return <div class="sn-gs" innerHTML={m()} />;
            }}
          </Index>
        </div>
      </Motion.div>
    </Presence>
  );
};

export default Definition;
