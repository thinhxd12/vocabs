import { action, query } from "@solidjs/router";
import {
  BookmarkType,
  CalendarType,
  CurrentlyWeatherType,
  DefinitionSenseType,
  DefinitionType,
  ExampleType,
  FixMinutelyTWeatherType,
  HistoryItemType,
  HourlyWeatherType,
  LayoutImageType,
  LoginImageType,
  MinutelyWeatherType,
  ScheduleProgressType,
  ScheduleType,
  TranslateType,
  VocabularyDefinitionType,
  VocabularyQuizType,
  VocabularySearchType,
  VocabularyTranslationType,
  VocabularyType,
  WeatherGeoType,
} from "~/types";
import {
  PRECIPITATION_PROBABILITY,
  REPETITION_PATTERN,
  mapTables,
} from "~/lib/utils";
import { supabase } from "./supabase";
import { navStore, setNavStore, setVocabStore } from "./store";
import {
  parseKindleEntries,
  readKindleClipping,
} from "@darylserrano/kindle-clippings";
import { URLSearchParams } from "url";
import { load } from "cheerio";
import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash";

export const searchText = async (text: string) => {
  "use server";
  try {
    const { data, error } = await supabase
      .from(mapTables.vocabulary)
      .select("word,created_at")
      .like("word", `${text}%`)
      .limit(6);

    return data as VocabularySearchType[];
  } catch (error) {
    console.error(error);
  }
};

export const getWordData = async (time: string) => {
  "use server";
  try {
    const { data, error } = await supabase
      .from(mapTables.vocabulary)
      .select()
      .eq("created_at", time);
    if (data) return data[0] as VocabularyType;
  } catch (error) {
    console.error(error);
  }
};

export const searchMemoriesText = async (text: string) => {
  "use server";
  try {
    const { data, error } = await supabase
      .from(mapTables.memories)
      .select()
      .textSearch("word", text);

    if (data) {
      if (data.length > 0)
        return { message: `Memorized "${data[0].word.toUpperCase()}"` };
    }
  } catch (error) {
    console.error(error);
  }
};

export const getLayoutImage = async (url: string) => {
  "use server";
  const response = await fetch(url);
  if (response.status !== 200) {
    return undefined;
  }
  const pageImgHtml = await response.text();
  const $ = load(pageImgHtml);

  let mainImage = $(".main-image img")
    .attr("srcset")
    ?.trim()
    .replace(/\n/g, " ");
  const shareDate = $(".main-description__share-date").text().trim();
  const title = $(".main-description__title").text().trim();
  const attr = $(".main-description__attr").text().trim();
  const authorImage = $(".main-description__author img")
    .attr("src")
    ?.trim()
    .replace(/\n/g, " ");
  const author = $(".main-description__author").text().trim();
  const authorYears = $(".main-description__author-years").text().trim();
  const content = $(".main-description__text-content")
    .html()
    ?.trim()
    .replace(/\n/g, " ");
  const alsoItems = [] as {
    url: string | undefined;
    img: string | undefined;
  }[];
  $(".also__item").each((index, element) => {
    const url = $(element).find("a").attr("href");
    const img = $(element)
      .find(".also__item-image img")
      .attr("srcset")
      ?.trim()
      .replace(/\n/g, " ");
    alsoItems.push({ url, img });
  });

  mainImage = mainImage?.split(" ")[0];
  const result = {
    mainImage,
    shareDate,
    title,
    attr,
    authorImage,
    author,
    authorYears,
    content,
    alsoItems,
  };
  return result as LayoutImageType;
};

//get translate data
export const getTranslateData = async (text: string) => {
  "use server";
  if (!text) return;
  const url = `https://vocabs3.vercel.app/trans?text=${text}&from=auto&to=vi`;
  const response = await fetch(url);
  const data = await response.json();
  if (data) return data as TranslateType;
};

async function fetchGetText(url: string) {
  try {
    let response = await fetch(url);
    let text = await response.text();
    return text;
  } catch (error) {
    return "";
  }
}

export const getTextDataWebster = query(async (text: string) => {
  "use server";
  if (!text) return;
  const url = `https://www.merriam-webster.com/dictionary/${text}`;

  const result: VocabularyType = {
    word: "",
    audio: "",
    phonetics: "",
    number: 240,
    translations: [],
    definitions: [],
    created_at: "",
  };

  interface ExampleExtendType {
    type: string;
    content: ExampleType;
  }

  try {
    const data = await Promise.all([fetchGetText(url), getOedSoundURL(text)]);
    const $ = load(data[0]);
    result.word = $("h1.hword").text();
    result.audio = data[1] || "";
    result.phonetics = $(".prons-entries-list-inline a").first().text().trim();

    //Definitions
    $('div[id^="dictionary-entry-"]').each((index, element) => {
      const partOfSpeech = $(element)
        .find(".parts-of-speech a")
        .first()
        .text()
        .split(" ")[0];
      let definitions: DefinitionType[] = [];
      let synonyms = "";
      let example: ExampleType[] = [];

      let firstDefinition: DefinitionType = {
        image: "",
        hash: "",
        definition: [],
      };

      let definitionItems = $(element).find(".vg-sseq-entry-item").first();
      definitionItems.each((index, element) => {
        let senseArray: DefinitionSenseType[] = [];
        $(element)
          .find(".sb-entry")
          .each((ind, item) => {
            $(item)
              .find(".sense")
              .each((m, n) => {
                let letter = $(n).find(".letter").text().trim();
                let num = $(n).find(".sub-num").text().trim();
                let sense = $(n)
                  .find(".dtText")
                  .text()
                  .trim()
                  .replace(/[\n\r]+|\s{2,}/g, " ");
                senseArray.push({ letter, num, sense });
              });
          });
        firstDefinition.definition = senseArray;
      });

      definitions.push(firstDefinition);
      result.definitions.push({ partOfSpeech, definitions, synonyms, example });
    });

    result.definitions = result.definitions.reduce((acc: any, d: any) => {
      const found = acc.find((a: any) => a.partOfSpeech === d.partOfSpeech);
      if (!found) {
        acc.push(d);
      } else {
        found.definitions.push(d.definitions[0]);
      }
      return acc;
    }, []);

    //Synonym
    let synonymArray: { type: string; content: string[] }[] = [];
    const synonymTitle = $("#synonyms").find(".function-label");
    if (!synonymTitle.text()) {
      let type = result.definitions[0].partOfSpeech;
      let content: any = [];
      $("#synonyms")
        .find("li")
        .slice(0, 3)
        .each((ind, item) => {
          content.push($(item).text());
        });
      synonymArray.push({ type, content });
    } else {
      synonymTitle.each((index, element) => {
        let type = $(element).text().toLowerCase().trim().split(" ")[0];
        let content: any = [];
        $(element)
          .next()
          .find("li")
          .slice(0, 3)
          .each((ind, item) => {
            content.push($(item).text());
          });
        synonymArray.push({ type, content });
      });
    }
    //Example
    let exampleArray: ExampleExtendType[] = [];
    const exampleTitle = $(".on-web").find(".function-label-header");
    if (!exampleTitle.text()) {
      let type = result.definitions[0].partOfSpeech;
      let sentence =
        $(".on-web").find(".t").first().html()?.replace(" </em>", "</em> ") ||
        "";
      let cred = $(".on-web")
        .find(".auth")
        .first()
        .text()
        .trim()
        .replace("—", "")
        .split(", ");
      let author = cred[cred.length - 3] ? cred[cred.length - 3] : "";
      let title = cred[cred.length - 2] ? cred[cred.length - 2] : "";
      let year = cred[cred.length - 1] ? cred[cred.length - 1] : "";
      let content = { sentence, author, title, year };
      exampleArray.push({ type, content });
    } else {
      exampleTitle.each((index, element) => {
        let type = $(element).text().toLowerCase().trim().split(" ")[0];
        let sentence =
          $(element).next().find(".t").html()?.replace(" </em>", "</em> ") ||
          "";
        let cred = $(element)
          .next()
          .find(".auth")
          .text()
          .trim()
          .replace("—", "")
          .split(", ");
        let author = cred[cred.length - 3] ? cred[cred.length - 3] : "";
        let title = cred[cred.length - 2] ? cred[cred.length - 2] : "";
        let year = cred[cred.length - 1] ? cred[cred.length - 1] : "";
        let content = { sentence, author, title, year };
        exampleArray.push({ type, content });
      });
    }

    result.definitions = result.definitions.map((item) => {
      const example = exampleArray.find(
        (el) => el.type === item.partOfSpeech,
      )?.content;
      return {
        ...item,
        synonyms:
          synonymArray
            .find((el) => el.type === item.partOfSpeech)
            ?.content.join(", ") || "",
        example: example ? [example] : [],
      };
    });
    return result;
  } catch (error) {
    console.error(error);
  }
}, "webster");

//find sound from oed
export const getOedSoundURL = async (text: string) => {
  "use server";
  if (!text) return;
  const oxfordUrl = `https://www.oxfordlearnersdictionaries.com/search/american_english/direct/?q=${text}`;
  const oedUrl = `https://www.oed.com/search/dictionary/?scope=Entries&q=${text}&tl=true`;

  const data = await Promise.all([
    fetchGetText(oxfordUrl),
    fetchGetText(oedUrl),
  ]);
  const docOxf = load(data[0]);
  const docOed = load(data[1]);

  const oxfordResultUrl = docOxf(".audio_play_button,.pron-us").attr(
    "data-src-mp3",
  );

  if (!oxfordResultUrl) {
    const urlParam = docOed(".viewEntry").attr("href");
    if (urlParam) {
      const newUrl = "https://www.oed.com" + urlParam;
      const link = newUrl.replace(/\?.+/g, "?tab=factsheet&tl=true#39853451");
      const nextPageHtml = await fetchGetText(link);
      const nextPageDoc = load(nextPageHtml);
      const sound = nextPageDoc(".regional-pronunciation")
        .last()
        .find(".pronunciation-play-button")
        .attr("data-src-mp3");
      return sound || "";
    }
  }
  return oxfordResultUrl;
};

//delete vocabulary
export const deleteVocabulary = async (time: string) => {
  "use server";
  const { error } = await supabase
    .from(mapTables.vocabulary)
    .delete()
    .eq("created_at", time);
  if (error) return { message: error.message };
  return { message: "success" };
};

//edit vocabulary
export const editVocabularyItem = action(async (formData: FormData) => {
  "use server";
  const wordT = String(formData.get("word"));
  const audioT = String(formData.get("audio"));
  const phoneticsT = String(formData.get("phonetics"));
  const definitionsT = JSON.parse(String(formData.get("definitions")));
  const numberT = Number(formData.get("number"));
  const createT = String(formData.get("created_at"));
  const meaningT = String(formData.get("meaning"));
  const translationsT = getTranslationArr(meaningT);

  if (definitionsT.length === 0 || translationsT.length === 0)
    return { message: "Incorrect data" };
  const { error } = await supabase
    .from(mapTables.vocabulary)
    .update({
      word: wordT,
      audio: audioT,
      phonetics: phoneticsT,
      number: numberT,
      translations: translationsT,
      definitions: definitionsT,
    })
    .eq("created_at", createT);
  if (error) return { message: error.message };
  return { message: "success" };
});

export const updateHashVocabularyItem = async (
  id: string,
  data: VocabularyDefinitionType[],
) => {
  "use server";
  const { error } = await supabase
    .from(mapTables.vocabulary)
    .update({
      definitions: data,
    })
    .eq("created_at", id);
};

export const getTranslationArr = (str: string) => {
  const breakpoint = /\s+-/g;
  let means = str.split(breakpoint).filter((item) => item);
  const matchesMean = means.map((m) => {
    if (m) {
      let newM = /(\w+)\-.+/.exec(m);
      return {
        partOfSpeech: newM ? newM[1] : "null",
        translations: newM
          ? m
              .replace(newM[1], "")
              .split(/\-|\s-/)
              .filter((item) => item)
          : [],
      };
    }
  }) as VocabularyTranslationType[];
  return matchesMean;
};

//insert new vocabulary
export const insertVocabularyItem = action(async (formData: FormData) => {
  "use server";
  const wordT = String(formData.get("word"));
  const audioT = String(formData.get("audio"));
  const phoneticsT = String(formData.get("phonetics"));
  const definitionsT = JSON.parse(String(formData.get("definitions")));
  const meaningT = String(formData.get("meaning"));
  const translationsT = getTranslationArr(meaningT);

  if (definitionsT.length === 0 || translationsT.length === 0)
    return { message: "Incorrect data" };
  const { error } = await supabase.from(mapTables.vocabulary).insert({
    word: wordT,
    audio: audioT,
    phonetics: phoneticsT,
    number: 240,
    translations: translationsT,
    definitions: definitionsT,
  });
  if (error) return { message: error.message };
  return { message: "success" };
});

//get image from unsplash
export const getImageFromUnsplashByKeyword = async (keyword: string) => {
  "use server";
  const apiKey = "EAEQdLT0Wze4Lhf_Xn2O-IAuow2Z-Rh2sHIEu7pTXms";
  const response = await fetch(
    `https://api.unsplash.com/photos/random?query=${keyword}&count=1&orientation=landscape&client_id=${apiKey}`,
  );
  if (response.status === 200) {
    const data = await response.json();
    return data[0].urls.small_s3;
  }
};

export const getUnsplashImage = async () => {
  const apiKey = "EAEQdLT0Wze4Lhf_Xn2O-IAuow2Z-Rh2sHIEu7pTXms";
  const response = await fetch(
    `https://api.unsplash.com/photos/random?&count=1&client_id=${apiKey}`,
  );
  const data = await response.json();
  return data;
};

//reset today schedule
export const submitTodayReset = action(async (formData: FormData) => {
  "use server";
  const todayIndex1 = Number(formData.get("todayIndex1"));
  const todayIndex2 = Number(formData.get("todayIndex2"));
  const createdAt = formData.get("createdAt");

  const { error } = await supabase
    .from(mapTables.schedule)
    .update({
      time1: todayIndex1,
      time2: todayIndex2,
    })
    .eq("created_at", createdAt);
  if (error) return { message: error.message };
  return { message: "success" };
}, "todayReset");

// -------------------------------NEW------------------------------------
export const submitNewSchedule = action(async (formData: FormData) => {
  "use server";
  const { data: dataHistory } = await supabase
    .from(mapTables.history)
    .select("index,created_at")
    .order("created_at", { ascending: false })
    .limit(1);
  if (!dataHistory) return { message: "Error get history" };

  const lastWeekIndex = dataHistory[0].index;

  const { count } = await supabase
    .from(mapTables.vocabulary)
    .select("created_at", { count: "exact" });
  if (!count) return { message: "Error get vocabulary count" };

  const { error } = await supabase
    .from(mapTables.schedule)
    .delete()
    .gte("time1", 0);
  if (error) return { message: error.message };

  const limitStartIndex = Math.floor(count / 200);

  const currentPatternArr = REPETITION_PATTERN.filter(
    (item) => item < limitStartIndex * 200,
  );

  function findNextElement(arr: Array<number>, currentElement: number) {
    const currentIndex = arr.indexOf(currentElement);
    const nextIndex = (currentIndex + 1) % arr.length;
    return arr[nextIndex];
  }

  let thisWeekIndex = 0;
  if (count >= 200)
    thisWeekIndex = findNextElement(currentPatternArr, lastWeekIndex);

  for (let i = 0; i < 6; i++) {
    let { error } = await supabase.from(mapTables.schedule).insert([
      {
        date: null,
        index1: i % 2 == 0 ? thisWeekIndex : thisWeekIndex + 50,
        index2: i % 2 == 0 ? thisWeekIndex + 100 : thisWeekIndex + 150,
        time1: 0,
        time2: 0,
      },
    ]);
  }

  return { message: "success" };
}, "submitNewSchedule");

// handlecheck
export const handleCheckAndRender = async (text: VocabularySearchType) => {
  const wordData = await getWordData(text.created_at);
  if (wordData) {
    setVocabStore("renderWord", wordData);

    if (wordData.number > 1) {
      checkVocabulary(text.created_at);
    } else {
      setNavStore("totalMemories", navStore.totalMemories + 1);
      await archiveVocabulary(text.word);
      await deleteVocabulary(text.created_at);
      updateLastRowWord(text.created_at);
    }
  }
};

export const handleCheckQuizWord = async (word: VocabularyQuizType) => {
  if (word.number > 1) {
    checkVocabulary(word.created_at);
  } else {
    setNavStore("totalMemories", navStore.totalMemories + 1);
    await archiveVocabulary(word.word);
    await deleteVocabulary(word.created_at);
    updateLastRowWord(word.created_at);
  }
};

export const updateLastRowWord = async (time: string) => {
  "use server";
  const { count } = await supabase
    .from(mapTables.vocabulary)
    .select("*", { count: "exact" });
  if (count! % 200 === 0) return;
  const endOfIndex = Math.floor(count! / 200) * 200;

  const { data, error } = await supabase
    .from(mapTables.vocabulary)
    .select("number,created_at")
    .neq("created_at", time)
    .order("created_at", { ascending: true })
    .range(endOfIndex + 1, 9999);

  if (data && data.length > 0) {
    const sortedArr = data.sort((a: any, b: any) => a.number - b.number);
    const { error: updateError } = await supabase
      .from(mapTables.vocabulary)
      .update({ created_at: time })
      .eq("created_at", sortedArr[0].created_at);
  }
};

const checkVocabulary = async (time: string) => {
  "use server";
  const { error } = await supabase.rpc("checkitem", { date: time });
};

export const archiveVocabulary = async (text: string) => {
  "use server";
  const { error } = await supabase.from(mapTables.memories).insert({
    word: text,
  });
  if (error) return error;
};

//get all history
export const getHistoryList = query(async (run: boolean) => {
  "use server";
  if (run) return;
  const { count } = await supabase
    .from(mapTables.history)
    .select("*", { count: "exact" });
  const startOfIndex = Math.floor(count! / 5 - 3);

  const { data, error } = await supabase
    .from(mapTables.history)
    .select()
    .order("created_at")
    .range(startOfIndex * 5, 9999);
  return data as HistoryItemType[];
}, "getHistoryList");

export const getAllHistoryList = async () => {
  "use server";
  const { data, error } = await supabase
    .from(mapTables.history)
    .select()
    .order("created_at");
  return data as HistoryItemType[];
};

export const getCalendarList = query(async (str: string) => {
  "use server";
  const date = new Date(str);
  const thisMonth = date.getMonth();
  const thisYear = date.getFullYear();
  const firstDayofMonth = new Date(thisYear, thisMonth, 1).getDay();
  const lastDateofMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
  const lastDayofMonth = new Date(
    thisYear,
    thisMonth,
    lastDateofMonth,
  ).getDay();
  const lastDateofLastMonth = new Date(thisYear, thisMonth, 0).getDate();
  let monthDateArr = [];
  for (let i = firstDayofMonth; i > 0; i--) {
    monthDateArr.push({
      date: lastDateofLastMonth - i + 1,
      month: thisMonth - 1,
    });
  }
  for (let i = 1; i <= lastDateofMonth; i++) {
    monthDateArr.push({
      date: i,
      month: thisMonth,
    });
  }
  for (let i = lastDayofMonth; i < 6; i++) {
    monthDateArr.push({
      date: i - lastDayofMonth + 1,
      month: thisMonth + 1,
    });
  }

  monthDateArr = monthDateArr.map((item) => ({
    ...item,
    time1: -1,
    time2: -1,
  }));

  const { data, error } = await supabase
    .from(mapTables.schedule)
    .select()
    .order("date");

  if (data) {
    const scheduleData = data.map((item: ScheduleType, index: number) => {
      const day = new Date(item.date);
      return {
        date: day.getDate(),
        month: day.getMonth(),
        time1: item.time1,
        time2: item.time2,
      };
    });

    const mergedArray = monthDateArr.map((item) => {
      return {
        ...item,
        ...scheduleData.find(
          (item2: any) =>
            item2.date === item.date && item2.month === item.month,
        ),
      };
    });
    return mergedArray as CalendarType[];
  }
}, "getCalendarList");

export const getThisWeekIndex = query(async (dayToday: string) => {
  "use server";
  const { data: thisWeekSchedule, error } = await supabase
    .from(mapTables.schedule)
    .select()
    .order("created_at", { ascending: true });
  if (error) return;

  const { data: history } = await supabase
    .from(mapTables.history)
    .select()
    .order("created_at", { ascending: false })
    .limit(1);

  const thisWeekIndex = thisWeekSchedule[0].index1;

  const allGreater = thisWeekSchedule.every(
    (item) => item.time1 >= 9 && item.time2 >= 9,
  );
  const allDone = thisWeekSchedule.every((item) => item.date !== null);

  if (allDone) {
    const date1 = new Date(thisWeekSchedule[0].date);
    const date2 = new Date(thisWeekSchedule[thisWeekSchedule.length - 1].date);
    const today = new Date(dayToday);
    if (today < date1 || today > date2) return -9;
    if (allGreater) {
      if (thisWeekSchedule[0].date !== history![0].from_date) {
        const insertData = {
          index: thisWeekIndex,
          from_date: thisWeekSchedule[0].date,
          to_date: thisWeekSchedule[thisWeekSchedule.length - 1].date,
        };
        let { error: errorMonth } = await supabase
          .from(mapTables.history)
          .insert(insertData);
      }
    }
  } else return (thisWeekIndex + 1) as number;
}, "getThisWeekIndex");

export const getProgressList = query(async () => {
  "use server";
  const { data } = await supabase
    .from(mapTables.progress)
    .select()
    .order("created_at");
  if (data) return data as ScheduleProgressType[];
}, "getProgressList");

export const getTodaySchedule = query(async (date: string) => {
  "use server";
  const { data: dataByDate } = await supabase
    .from(mapTables.schedule)
    .select()
    .eq("date", date);
  if (dataByDate && dataByDate.length > 0) return dataByDate[0] as ScheduleType;

  const { data } = await supabase
    .from(mapTables.schedule)
    .select()
    .order("created_at", { ascending: true })
    .is("date", null)
    .limit(1);
  if (data) return data[0] as ScheduleType;
}, "getTodaySchedule");

export const getTotalMemories = query(async () => {
  "use server";
  const { count } = await supabase
    .from(mapTables.memories)
    .select("*", { count: "exact" });
  return count as number;
}, "getTotalMemories");

export const getLocationList = query(async () => {
  "use server";
  const { data } = await supabase
    .from(mapTables.weather)
    .select()
    .order("default", { ascending: false });
  if (data) return data as WeatherGeoType[];
}, "getLocationList");

export const deleteBookmark = async (time: string) => {
  "use server";
  const { error } = await supabase
    .from(mapTables.bookmarks)
    .delete()
    .eq("created_at", time);
};

export const getRandomBookMarkData = async () => {
  "use server";
  const { data, error } = await supabase.rpc("get_random_bookmark");

  if (data) return data as BookmarkType;
};

export const getBookMarkData = async () => {
  "use server";
  const { data, error } = await supabase
    .from(mapTables.bookmarks)
    .select()
    .eq("selected", true);
  if (data) return data[0] as BookmarkType;
};

export const getNextBookMarkData = async (cur: string) => {
  "use server";
  const { data, error } = await supabase
    .from(mapTables.bookmarks)
    .select()
    .gt("created_at", cur)
    .order("created_at", { ascending: true })
    .limit(1);
  if (error) return undefined;
  if (data.length > 0) {
    await selectBookMarkData(cur, false);
    await selectBookMarkData(data[0].created_at, true);
    return data[0] as BookmarkType;
  }
};

export const getPrevBookMarkData = async (cur: string) => {
  "use server";
  const { data, error } = await supabase
    .from(mapTables.bookmarks)
    .select()
    .lt("created_at", cur)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) return undefined;
  if (data.length > 0) {
    await selectBookMarkData(cur, false);
    await selectBookMarkData(data[0].created_at, true);
    return data[0] as BookmarkType;
  }
};

export const checkBookMarkData = async (id: string, val: number) => {
  "use server";
  const { error } = await supabase
    .from(mapTables.bookmarks)
    .update({
      like: val,
    })
    .eq("created_at", id);
};

const selectBookMarkData = async (id: string, val: boolean) => {
  "use server";
  const { error } = await supabase
    .from(mapTables.bookmarks)
    .update({
      selected: val,
    })
    .eq("created_at", id);
};

export const insertBookmarkData = action(async (formData: FormData) => {
  "use server";
  const doc = String(formData.get("bookmarksInsert"));
  let entries = readKindleClipping(doc);
  let parsedEntries = parseKindleEntries(entries);

  for (let i = 0; i < parsedEntries.length; i++) {
    const row = {
      authors: parsedEntries[i].authors,
      bookTile: parsedEntries[i].bookTile,
      page: parsedEntries[i].page,
      location: parsedEntries[i].location,
      dateOfCreation: parsedEntries[i].dateOfCreation,
      content: parsedEntries[i].content,
      type: parsedEntries[i].type,
    };
    const { error } = await supabase.from(mapTables.bookmarks).insert([row]);
    if (error) console.log("Error:", error);
    else console.log(`Row ${i} inserted`);
  }
}, "insert bookmark");

export const updateBookmarkData = action(async (formData: FormData) => {
  "use server";
  const id = String(formData.get("id"));
  const doc = String(formData.get("bookmarks"));
  const { error } = await supabase
    .from(mapTables.bookmarks)
    .update({
      content: doc,
    })
    .eq("created_at", id);
}, "insert bookmark");

export const findBookMarkData = async (val: string) => {
  "use server";
  const { data, error } = await supabase
    .from(mapTables.bookmarks)
    .select()
    .textSearch("content", val);

  const res = data?.map((item) => {
    let newcontent = findSentence(item.content, val);
    return {
      ...item,
      content: newcontent,
    };
  });

  return res;
};

function findSentence(text: string, word: string) {
  var sentences = text.match(/[^\.!\?]+[\.!\?]+/g);
  if (sentences)
    for (var i = 0; i < sentences.length; i++) {
      if (sentences[i].includes(word)) {
        return sentences[i];
      }
    }
  return "";
}

export const getBookMarkDataItem = async (time: string) => {
  "use server";
  const { data, error } = await supabase
    .from(mapTables.bookmarks)
    .select()
    .eq("created_at", time);
  if (data) return data[0];
};

// https://github.com/ORelio/Spotlight-Downloader/blob/master/SpotlightAPI.md

export const getSpotlightImage_v3 = async () => {
  "use server";
  let batchQuery = {} as any;
  batchQuery["pid"] = "209567";
  batchQuery["fmt"] = "json";
  batchQuery["rafb"] = "0";
  batchQuery["ua"] = "WindowsShellClient/0";
  batchQuery["cdm"] = "1";
  batchQuery["disphorzres"] = "9999";
  batchQuery["dispvertres"] = "9999";
  batchQuery["lo"] = "80217";
  batchQuery["pl"] = "en-US";
  batchQuery["lc"] = "en-US";
  batchQuery["ctry"] = "hk";

  const baseUrl =
    "https://arc.msn.com/v3/Delivery/Placement?" +
    new URLSearchParams(batchQuery).toString();
  const data = await (await fetch(baseUrl)).json();

  if (data) {
    const itemStr = data["batchrsp"]["items"][0].item;
    const itemObj = JSON.parse(itemStr)["ad"];
    const title = itemObj["title_text"]?.tx;
    const hs1_title_text = itemObj["hs1_title_text"]?.tx;
    const hs2_title_text = itemObj["hs2_title_text"]?.tx;
    const jsImageL = itemObj["image_fullscreen_001_landscape"].u;
    const jsImageP = itemObj["image_fullscreen_001_portrait"].u;
    const thumbhash = await createThumbhash(jsImageP);
    return {
      title: title,
      hs1_title: hs1_title_text,
      hs2_title: hs2_title_text,
      image_L: jsImageL,
      image_P: jsImageP,
      hash: thumbhash,
    } as LoginImageType;
  }
};

export const getSpotlightImage_v4 = async () => {
  "use server";
  const baseUrl =
    "https://fd.api.iris.microsoft.com/v4/api/selection?&placement=88000820&bcnt=1&country=DK&locale=en-US&fmt=json";
  const data = await (await fetch(baseUrl)).json();

  if (data) {
    const response = data["batchrsp"]["items"][0]["item"];
    const result = JSON.parse(response)["ad"];
    const urlP = result.portraitImage.asset;
    const thumbhash = await createThumbhash(urlP);
    const hs1 = result.iconHoverText.split("\r\n©");

    return {
      title: result.title,
      hs1_title: hs1[0],
      hs2_title: result.description,
      image_L: result.landscapeImage.asset,
      image_P: urlP,
      hash: thumbhash,
    } as LoginImageType;
  }
};

export const updateTodaySchedule = async (date: string, type: number) => {
  "use server";
  const data = await getTodaySchedule(date);
  const updateObj =
    type === 1 ? { time1: data!.time1 + 1 } : { time2: data!.time2 + 1 };
  const { data: updatedData, error } = await supabase
    .from(mapTables.schedule)
    .update(updateObj)
    .eq("created_at", data!.created_at);

  if (data!.date === null) {
    if (
      (data!.time1 >= 9 && data!.time2 >= 9) ||
      (type === 2 && data!.time1 >= 9 && data!.time2 + 1 >= 9)
    ) {
      const { error } = await supabase
        .from(mapTables.schedule)
        .update({ date: date })
        .eq("created_at", data!.created_at);
    }
  }
  return updateObj;
};

export const updateTodayScheduleStore = (data: {
  time1?: number;
  time2?: number;
}) => {
  setNavStore("todaySchedule", {
    ...navStore.todaySchedule,
    ...data,
  });
};

//get 50 word
export const getListContentVocab = async (start: number, end: number) => {
  "use server";
  const { data, error } = await supabase
    .from(mapTables.vocabulary)
    .select("created_at,word")
    .order("created_at")
    .range(start, end);
  if (data) return data as VocabularySearchType[];
};

export const getListContentQuiz = async (start: number, end: number) => {
  "use server";
  const { data, error } = await supabase
    .from(mapTables.vocabulary)
    .select("created_at,word,translations,audio,number")
    .order("created_at")
    .range(start, end);
  if (data) return data as VocabularyQuizType[];
};

//get weather data

const fetchGetJSON = async (url: string) => {
  try {
    let response = await fetch(url);
    let res = await response.json();
    return res;
  } catch (error) {
    return "";
  }
};

export const getCurrentWeatherData = async ({
  lat: lat,
  lon: lon,
}: {
  lat: number;
  lon: number;
}) => {
  "use server";
  const params = {
    latitude: String(lat),
    longitude: String(lon),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "uv_index",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
    ],
    models: "best_match",
    timezone: "auto",
  };

  const url = "https://api.open-meteo.com/v1/forecast?";
  const paramsString = new URLSearchParams(params).toString();
  const responses = await fetch(url + paramsString);
  if (responses.status !== 200) return;
  const data = await responses.json();

  const result: CurrentlyWeatherType = {
    apparentTemperature: data.current.apparent_temperature,
    isDayTime: data.current.is_day,
    humidity: data.current.relative_humidity_2m,
    temperature: data.current.temperature_2m,
    uvIndex: data.current.uv_index,
    icon: data.current.weather_code,
    windDirection: data.current.wind_direction_10m,
    windSpeed: data.current.wind_speed_10m,
  };
  return result;
};

export const getHourlyWeatherData = async ({
  lat: lat,
  lon: lon,
}: {
  lat: number;
  lon: number;
}) => {
  "use server";
  const params = {
    latitude: String(lat),
    longitude: String(lon),
    hourly: [
      "temperature_2m",
      "precipitation_probability",
      "weather_code",
      "is_day",
    ],
    forecast_hours: String(24),
    models: "best_match",
    timezone: "auto",
  };

  const url = "https://api.open-meteo.com/v1/forecast?";
  const paramsString = new URLSearchParams(params).toString();
  const responses = await fetch(url + paramsString);
  if (responses.status !== 200) return;
  const data = await responses.json();

  const result = data.hourly.time.map((item: string, index: number) => ({
    time: item,
    temperature: data.hourly.temperature_2m[index],
    icon: data.hourly.weather_code[index],
    probability: data.hourly.precipitation_probability[index],
    isDayTime: data.hourly.is_day[index],
  }));
  return result as HourlyWeatherType[];
};

export const getMinutelyWeatherData = async ({
  lat: lat,
  lon: lon,
}: {
  lat: number;
  lon: number;
}) => {
  "use server";
  const WEATHER_KEY = import.meta.env.VITE_PIRATE_KEY;
  const URL = `https://api.pirateweather.net/forecast/${WEATHER_KEY}/${lat},${lon}?exclude=currently,daily,hourly&units=ca`;
  const data = await fetchGetJSON(URL);
  const zerotime = data.minutely.data[0].time;
  const result = data.minutely.data.map((item: MinutelyWeatherType) => {
    return {
      diffTime: (item.time - zerotime) / 60,
      intensity: parseFloat(item.precipIntensity.toFixed(3)),
      probability: item.precipProbability,
    };
  });
  return result as FixMinutelyTWeatherType[];
};

export const makePrediction = async (data?: FixMinutelyTWeatherType[]) => {
  "use server";
  if (!data) return "";
  let lightRainIndex = data.findIndex(
    (item) =>
      item.intensity >= 0.1 && item.probability >= PRECIPITATION_PROBABILITY,
  );
  let medRainIndex = data.findIndex(
    (item) =>
      item.intensity >= 0.5 && item.probability >= PRECIPITATION_PROBABILITY,
  );
  let heavyRainIndex = data.findIndex(
    (item) =>
      item.intensity >= 1 && item.probability >= PRECIPITATION_PROBABILITY,
  );
  let endRainIndex = data.findLastIndex(
    (item) =>
      item.intensity >= 0.09 &&
      item.intensity < 0.1 &&
      item.probability >= PRECIPITATION_PROBABILITY,
  );
  let mainItem = { type: "", start: 0, end: 0 };
  endRainIndex >= 0
    ? (mainItem.end = data[endRainIndex].diffTime)
    : (mainItem.end = -1);
  switch (true) {
    case lightRainIndex == -1:
      mainItem.type = "No rain";
      break;
    case lightRainIndex >= 0:
      mainItem.type = "Light rain";
      break;
    case medRainIndex >= 0:
      mainItem.type = "Rain";
      break;
    case heavyRainIndex >= 0:
      mainItem.type = "Heavy rain";
      break;
    default:
      break;
  }
  lightRainIndex >= 0
    ? (mainItem.start = data[lightRainIndex].diffTime)
    : (mainItem.start = -1);

  function makeText(start: number, end: number) {
    switch (true) {
      case start == 0 && end < 0:
        return `for the hour.`;
      case start > 0:
        return `starting in ${start} min.`;
      case end > 0:
        return `stopping in ${end} min.`;
      default:
        break;
    }
  }

  switch (mainItem.type) {
    case "No rain":
      return `Next hour: No rain anywhere in the area.`;
    case "Light rain":
      return `Light rain ${makeText(mainItem.start, mainItem.end)}`;
    case "Rain":
      return `Rain ${makeText(mainItem.start, mainItem.end)}`;
    case "Heavy rain":
      return `Heavy rain ${makeText(mainItem.start, mainItem.end)}`;
    default:
      return "";
  }
};

export const createThumbhash = async (imageUrl: string) => {
  "use server";
  const imageBuffer = await fetch(imageUrl).then((res) => res.arrayBuffer());
  const image = sharp(imageBuffer).resize(90, 90, { fit: "inside" });
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const binaryThumbHash = rgbaToThumbHash(info.width, info.height, data);
  const base64String = btoa(
    String.fromCharCode(...new Uint8Array(binaryThumbHash)),
  );
  return base64String;
};

export function base64ToUint8Array(base64String: string) {
  const binaryString = atob(base64String);
  const uint8Array = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    uint8Array[i] = binaryString.charCodeAt(i);
  }
  return uint8Array;
}

// =====Insert data============
// export const insertData = async (data: any) => {
//   "use server";
//   for (let i = 0; i < data.length; i++) {
//     const row = data[i];
//     const { error } = await supabase.from("history_duplicate").insert(row);

//     if (error) console.log("Error:", error);
//     else console.log(`Row ${i} inserted`);
//   }
// };
