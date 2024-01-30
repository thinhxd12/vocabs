import { Index, JSX, Match, Setter, Switch, createSignal } from "solid-js";
import "/public/styles/translate.scss";
import { OcRepopush2, OcX2 } from "solid-icons/oc";

type Props = {
  item: any;
  onClose: Setter<boolean>;
};

const Translation = (props: Props) => {
  const [transInput, setTransInput] = createSignal<string>("");
  const handleSetTransInput = (text: string) => {
    setTransInput(transInput() + text);
  };

  const onKeyDownInput: JSX.EventHandlerUnion<
    HTMLInputElement,
    KeyboardEvent
  > = (event) => {
    const keyDown = event.key;
    event.stopPropagation();
    if (keyDown === "Escape") {
      setTransInput("");
    }
  };

  return (
    <div class="translate">
      <div class="translateHeader">
        <div class="translateHeaderLeft">
          <p class="translateHeaderText">
            Translation of{" "}
            <b>
              {props.item?.word}
              <b>【{props.item?.wordTranscription}】</b>
            </b>
          </p>
        </div>
        <div class="translateHeaderRight">
          <button class="translateBtn" disabled>
            <OcRepopush2 size={12} />
          </button>
          <button class="translateBtn" onclick={props.onClose}>
            <OcX2 size={12} />
          </button>
        </div>
      </div>
      <div class="translateBody">
        <input
          type="text"
          class="translateInput"
          value={transInput()}
          onKeyDown={onKeyDownInput}
          onInput={(e) => setTransInput(e.currentTarget.value)}
        />
        <p
          class="translateTranslation"
          onClick={() =>
            handleSetTransInput("-" + props.item?.translation.toLowerCase())
          }
        >
          {props.item?.translation}
        </p>
        <div class="translateContent">
          {props.item !== undefined && (
            <Index each={Object.keys(props.item?.translations)}>
              {(item, index) => {
                let key = item() as keyof typeof props.item.translations;
                return (
                  <div class="translateContentItem">
                    <p
                      onClick={() =>
                        handleSetTransInput(" -" + item().toLowerCase())
                      }
                    >
                      {item()}
                    </p>
                    <div class="translateContentItemText">
                      <Index each={props.item?.translations[key]}>
                        {(m, n) => {
                          return (
                            <div class="translateContentItemRow">
                              <span
                                onClick={() =>
                                  handleSetTransInput(
                                    "-" + m().translation.toLowerCase()
                                  )
                                }
                              >
                                {m().translation}
                              </span>
                              <span>{m().synonyms.join(", ")}</span>
                              <Switch>
                                <Match when={m().frequency === 3}>
                                  <span class="frequencyContainer">
                                    <span class="frequencyDot"></span>
                                    <span class="frequencyDot"></span>
                                    <span class="frequencyDot"></span>
                                  </span>
                                </Match>
                                <Match when={m().frequency === 2}>
                                  <span class="frequencyContainer">
                                    <span class="frequencyDot"></span>
                                    <span class="frequencyDot"></span>
                                    <span class="frequencyClear"></span>
                                  </span>
                                </Match>
                                <Match when={m().frequency === 1}>
                                  <span class="frequencyContainer">
                                    <span class="frequencyDot"></span>
                                    <span class="frequencyClear"></span>
                                    <span class="frequencyClear"></span>
                                  </span>
                                </Match>
                              </Switch>
                            </div>
                          );
                        }}
                      </Index>
                    </div>
                  </div>
                );
              }}
            </Index>
          )}
        </div>
      </div>
    </div>
  );
};

export default Translation;
