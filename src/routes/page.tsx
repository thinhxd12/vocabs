import {
  Component,
  Index,
  JSX,
  Show,
  createResource,
  createSignal,
} from "solid-js";
import { RouteDefinition, createAsync } from "@solidjs/router";
import { getUser } from "~/api";
import { supabase } from "~/api/supabaseClient";
import { getSearch, getVocabulary } from "~/api/api";
import { VocabularyType } from "~/types";
import { debounce } from "@solid-primitives/scheduled";

// export const route = {
//   load: () => getUser(),
// } satisfies RouteDefinition;

const page: Component<{}> = (props) => {
  const [searchResult, setSearchResult] = createSignal<VocabularyType[]>([]);
  const [searchTerm, setSearchTerm] = createSignal<string>("");
  const [currentText, setCurrentText] = createSignal<VocabularyType | null>();

  const user = createAsync(getUser, { deferStream: true });
  // const searchData = createAsync(() => getSearch(searchTerm()));

  const searchFnc = async (text: string) => {
    if (text !== "") {
      const { data, error } = await supabase
        .from("vocabulary")
        .select()
        .like("text", `${text}%`);

      if (data) return data;
    }
    return [];
  };

  const trigger = debounce(async (str: string) => {
    let res = await searchFnc(str);
    setSearchResult(res);
  }, 300);

  const onInputSearch: JSX.EventHandler<HTMLInputElement, InputEvent> = (
    event
  ) => {
    // console.log(event);

    // if(event.inputType ==="deleteContentBackward"){
    //   return;
    // }
    const inputKey = event.data;
    // if (!inputKey) event.preventDefault();
    if (inputKey?.match(/^[a-z]$/)) {
      setSearchTerm(searchTerm() + inputKey);
      if (searchTerm().length > 2) {
        trigger(searchTerm());
      }
    }
    if (inputKey?.match(/^[1-9]$/)) {
      setCurrentText(searchResult()[Number(inputKey) - 1]);
      setSearchTerm("");
      setSearchResult([]);
    }
    if (inputKey === " ") {
      event.preventDefault();
      setSearchTerm("");
      setSearchResult([]);
    }
    if (event.inputType === "deleteContentBackward") {
      setSearchTerm(searchTerm().slice(0, -1));
    }
  };

  return (
    <div>
      <input onInput={onInputSearch} value={searchTerm()} />
      <button onclick={() => setSearchTerm("over")}>click</button>

      <Index each={searchResult()}>
        {(data, i) => (
          <p onclick={() => setCurrentText(data())}>
            {i + 1} - {data().text}
          </p>
        )}
      </Index>
      {/* {searchData() && (
        <Index each={searchData()}>
          {(data, i) => (
            <p onclick={() => setCurrentText(data())}>
              {i + 1} - {data().text}
            </p>
          )}
        </Index>
      )} */}
      <br></br>
      <Show when={currentText()?.text}>
        <h4>{currentText()?.text}</h4>
        <p>{currentText()?.phonetic}</p>
        <p>{currentText()?.number}</p>
        <p>{currentText()?.meaning}</p>
        <br></br>
        <p>
          Definition of <b>{currentText()?.text}</b>
        </p>
        <Index each={currentText()?.definitions}>
          {(item, i) => <div innerHTML={item()} />}
        </Index>
      </Show>
    </div>
  );
};

export default page;
