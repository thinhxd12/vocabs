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
  ToastResult,
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
import { navStore, setNavStore, setVocabStore, vocabStore } from "./store";
import {
  parseKindleEntries,
  readKindleClipping,
} from "@darylserrano/kindle-clippings";
import { URLSearchParams } from "url";
import { load } from "cheerio";
import sharp from "sharp";
import { rgbaToThumbHash } from "thumbhash";
import {
  insertBookmark,
  insertDiary,
  insertMemories,
  insertProgress,
  insertSchedule,
  insertVocab,
  insertWeather,
} from "~/db/queries/insert";
import {
  diaryTable,
  InsertBookmark,
  InsertDiary,
  InsertMemories,
  InsertProgress,
  InsertSchedule,
  InsertVocab,
  InsertWeather,
  memoriesTable,
  progressTable,
  scheduleTable,
  SelectBookmark,
  SelectMemories,
  SelectSchedule,
  SelectVocab,
  vocabTable,
} from "~/db/schema";
import { deleteBookmarkById, deleteVocabById } from "~/db/queries/delete";
import {
  getMemoriesByWord,
  getAllProgress,
  getScheduleByDate,
  getScheduleByProgress,
  getVocabById,
  getVocabByWord,
  getVocabList,
  getWeather,
  getLastPartProgress,
  getAllScheduleHaveDate,
  getDiary,
  getBookmarkById,
  getBookmarkBySelected,
  getNextBookmark,
  getPreviousBookmark,
  getRandomBookmark,
  findTextBookmark,
} from "~/db/queries/select";
import { DrizzleError, sql, count, asc, eq, desc } from "drizzle-orm";
import {
  decreaseBookmarkLikeById,
  decreaseNumberVocabById,
  increaseBookmarkLikeById,
  increaseScheduleById,
  updateBookmarkContentById,
  updateBookmarkSelectById,
  updateCountScheduleById,
  updateDateScheduleById,
  updateVocabById,
} from "~/db/queries/update";
import { db } from "~/db";

////// Layoutpage //////

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

async function fetchGetText(url: string) {
  try {
    let response = await fetch(url);
    let text = await response.text();
    return text;
  } catch (error) {
    return "";
  }
}

const fetchGetJSON = async (url: string) => {
  try {
    let response = await fetch(url);
    let res = await response.json();
    return res;
  } catch (error) {
    return "";
  }
};

export const deleteVocabulary = async (id: SelectVocab["id"]) => {
  "use server";
  const result = await deleteVocabById(id);
  return {
    status: result.status,
    data: result.data.message,
  };
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

export const getWordData = async (id: SelectVocab["id"]) => {
  "use server";
  const result = await getVocabById(id);
  if (result.status) return result.data;
};

export const searchText = async (text: SelectVocab["word"]) => {
  "use server";
  return await getVocabByWord(text);
};

// handlecheck
export const handleCheckAndRender = async (text: VocabularySearchType) => {
  const wordData = await getWordData(text.id);
  if (wordData) {
    setVocabStore("renderWord", wordData);

    if (wordData.number > 1) {
      checkVocabulary(text.id);
    } else {
      setNavStore("totalMemories", navStore.totalMemories + 1);
      await archiveVocabulary(text.word);
      await deleteVocabulary(text.id);
      updateLastRowWord(text.id);
    }
  }
};

const checkVocabulary = async (id: SelectVocab["id"]) => {
  "use server";
  await decreaseNumberVocabById(id);
};

export const archiveVocabulary = async (text: SelectVocab["word"]) => {
  "use server";
  await insertMemories({ word: text });
};

export const updateLastRowWord = async (replacedId: SelectVocab["id"]) => {
  "use server";
  const lengthVocabTable = await db.select({ count: count() }).from(vocabTable);
  if (lengthVocabTable[0].count % 200 === 0) return;
  const endOfIndex = Math.floor(lengthVocabTable[0].count / 200) * 200;

  const rangeResults = db
    .select()
    .from(vocabTable)
    .orderBy(asc(vocabTable.id))
    .offset(endOfIndex)
    .as("rangeResults");

  const smallestRow = await db
    .select()
    .from(vocabTable)
    .leftJoin(rangeResults, eq(vocabTable.id, rangeResults.id))
    .orderBy(asc(rangeResults.number))
    .limit(1);

  await db
    .update(vocabTable)
    .set({
      id: replacedId,
    })
    .where(eq(vocabTable.id, smallestRow[0].rangeResults!.id));
};

////// Vocabpage //////

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

export const editVocabularyItem = action(async (formData: FormData) => {
  "use server";
  const wordT = String(formData.get("word"));
  const audioT = String(formData.get("audio"));
  const phoneticsT = String(formData.get("phonetics"));
  const definitionsT = JSON.parse(String(formData.get("definitions")));
  const numberT = Number(formData.get("number"));
  const idT = String(formData.get("id"));
  const meaningT = String(formData.get("meaning"));
  const translationsT = getTranslationArr(meaningT);

  if (
    definitionsT.length === 0 ||
    translationsT.length === 0 ||
    wordT === "" ||
    audioT === "" ||
    phoneticsT === ""
  )
    return {
      status: false,
      data: {
        message: "Invalid data.",
      },
    };

  const editedWord: SelectVocab = {
    word: wordT,
    audio: audioT,
    phonetics: phoneticsT,
    number: numberT,
    translations: translationsT,
    definitions: definitionsT,
    id: idT,
  };

  const result = await updateVocabById(editedWord);
  return result;
});

export const getTextDataWebster = query(async (text: string) => {
  "use server";
  if (!text) return;
  const url = `https://www.merriam-webster.com/dictionary/${text}`;

  const result: InsertVocab = {
    word: "",
    audio: "",
    phonetics: "",
    translations: [],
    definitions: [],
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

export const getTotalMemories = query(async () => {
  "use server";
  const length = await db.select({ count: count() }).from(memoriesTable);
  return length[0].count;
}, "getTotalMemories");

export const getTranslateData = async (text: string) => {
  "use server";
  if (!text) return;
  const url = `https://vocabs3.vercel.app/trans?text=${text}&from=auto&to=vi`;
  const response = await fetch(url);
  const data = await response.json();
  if (data) return data as TranslateType;
};

export const insertVocabularyItem = action(async (formData: FormData) => {
  "use server";
  const wordT = String(formData.get("word"));
  const audioT = String(formData.get("audio"));
  const phoneticsT = String(formData.get("phonetics"));
  const definitionsT = JSON.parse(String(formData.get("definitions")));
  const meaningT = String(formData.get("meaning"));
  const translationsT = getTranslationArr(meaningT);

  if (
    definitionsT.length === 0 ||
    translationsT.length === 0 ||
    wordT === "" ||
    audioT === "" ||
    phoneticsT === ""
  )
    return {
      status: false,
      data: {
        message: "Invalid data.",
      },
    };

  const insertWord: InsertVocab = {
    word: wordT,
    audio: audioT,
    phonetics: phoneticsT,
    translations: translationsT,
    definitions: definitionsT,
  };

  const result = await insertVocab(insertWord);
  return result;
});

export const searchMemoriesText = async (text: SelectMemories["word"]) => {
  "use server";
  return await getMemoriesByWord(text);
};

////// Navbar //////

export const getCurrentWeatherData = async ({
  lat: lat,
  lon: lon,
}: {
  lat: string;
  lon: string;
}) => {
  "use server";
  const params = {
    latitude: lat,
    longitude: lon,
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

export const getListContent = async (start: number) => {
  "use server";
  const data = await getVocabList(start);
  if (data.length > 0) return data;
};

export const getLocationList = query(async () => {
  "use server";
  const data = await getWeather();
  if (data.length > 0) return data;
}, "location-list");

export const getTodaySchedule = query(async (date: string) => {
  "use server";
  const dataByDate = await getScheduleByDate(date);
  if (dataByDate.length === 2) return dataByDate;
  const dataByNull = await getScheduleByProgress();
  if (dataByDate.length === 1) {
    return [dataByDate[0], dataByNull[0]];
  }
  return dataByNull;
}, "getTodaySchedule");

export const updateTodaySchedule = async (
  id: SelectSchedule["id"],
  updatedDate: string,
) => {
  "use server";
  const result = await increaseScheduleById(id);
  if (result[0].count < 9) return result[0];
  if (!result[0].date) {
    const updated = await updateDateScheduleById(id, updatedDate);
    return updated[0];
  }
  return result[0];
};

export const updateTodayScheduleLocal = async (dateToday: string) => {
  if (navStore.currentSchedule) {
    const result = await updateTodaySchedule(
      navStore.currentSchedule.id,
      dateToday,
    );
    const updatedTodaySchedule = navStore.todaySchedule.map((item) => {
      return item.id === result.id ? result : item;
    });
    setNavStore("todaySchedule", updatedTodaySchedule);
    setNavStore("currentSchedule", result);
  }
};

////// Schedulepage //////

export const getLastPartProgressList = async (run: boolean) => {
  "use server";
  if (run) return;
  const data = await getLastPartProgress();
  return data;
};

export const getAllProgressList = async () => {
  "use server";
  const data = await getAllProgress();
  return data;
};

export const getDiaryList = async () => {
  "use server";
  const data = await getDiary();
  return data;
};

export const getThisWeekIndex = query(async (dayToday: string) => {
  "use server";
  const thisWeekSchedule = await db
    .select()
    .from(scheduleTable)
    .orderBy(asc(scheduleTable.id));

  const lastProgress = await db
    .select()
    .from(progressTable)
    .orderBy(desc(progressTable.id))
    .limit(1);

  const thisWeekIndex = thisWeekSchedule[0].index;
  const allGreater = thisWeekSchedule.every((item) => item.count >= 9);
  const allDone = thisWeekSchedule.every((item) => item.date !== null);

  if (allDone) {
    const startDaySchedule = new Date(thisWeekSchedule[0].date!);
    const endDaySchedule = new Date(
      thisWeekSchedule[thisWeekSchedule.length - 1].date!,
    );
    const today = new Date(dayToday);
    if (today < startDaySchedule || today > endDaySchedule) return -9;
    if (allGreater) {
      if (thisWeekSchedule[0].date !== lastProgress[0].start_date) {
        const insertData: InsertProgress = {
          index: thisWeekIndex,
          start_date: new Date(thisWeekSchedule[0].date!),
          end_date: new Date(
            thisWeekSchedule[thisWeekSchedule.length - 1].date!,
          ),
        };
        await insertProgress(insertData);
      }
    }
  }
  return thisWeekIndex + 1;
}, "getThisWeekIndex");

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
    count: -1,
  }));

  const data = (await getAllScheduleHaveDate()) as SelectSchedule[];

  if (data.length) {
    const transformed = data.reduce((acc: any, curr: SelectSchedule) => {
      const dateObj = new Date(curr.date!);
      const day = dateObj.getDate();
      const month = dateObj.getMonth();

      const existing = acc.find(
        (item: any) => item.date === day && item.month === month,
      );

      if (existing) {
        existing.count += curr.count;
      } else {
        acc.push({ date: day, month: month, count: curr.count });
      }

      return acc;
    }, []);

    const mergedArray = monthDateArr.map((item) => {
      return {
        ...item,
        ...transformed.find(
          (item2: any) =>
            item2.date === item.date && item2.month === item.month,
        ),
      };
    });
    return mergedArray as CalendarType[];
  }
  return monthDateArr as CalendarType[];
}, "getCalendarList");

export const submitNewSchedule = action(async () => {
  "use server";
  const lastProgress = await db
    .select()
    .from(progressTable)
    .orderBy(desc(progressTable.id))
    .limit(1);

  const lastWeekIndex = lastProgress[0].index;

  const lengthVocabTable = await db.select({ count: count() }).from(vocabTable);

  // //delete table
  await db.delete(scheduleTable);

  const limitStartIndex = Math.floor(lengthVocabTable[0].count / 200);

  const currentPatternArr = REPETITION_PATTERN.filter(
    (item) => item < limitStartIndex * 200,
  );

  function findNextElement(arr: Array<number>, currentElement: number) {
    const currentIndex = arr.indexOf(currentElement);
    const nextIndex = (currentIndex + 1) % arr.length;
    return arr[nextIndex];
  }

  let thisWeekIndex = 0;
  if (lengthVocabTable[0].count >= 200)
    thisWeekIndex = findNextElement(currentPatternArr, lastWeekIndex);

  const pattern = [0, 100, 50, 150];

  for (let i = 0; i < 12; i++) {
    const row: InsertSchedule = {
      index: thisWeekIndex + pattern[i % pattern.length],
    };
    try {
      await insertSchedule(row);
    } catch (error) {
      return {
        status: false,
        message: "Error insert schedule",
      };
    }
  }

  return { status: true, message: "Successfully create new schedule." };
}, "submitNewSchedule");

export const submitTodayReset = action(async (formData: FormData) => {
  "use server";
  const count0 = Number(formData.get("count0"));
  const count1 = Number(formData.get("count1"));
  const id0 = String(formData.get("id0"));
  const id1 = String(formData.get("id1"));
  try {
    await updateCountScheduleById(id0, count0);
    await updateCountScheduleById(id1, count1);
  } catch (error) {
    return { status: true, message: "Update error." };
  }
  return { status: true, message: "Schedule saved." };
}, "todayReset");

////// Quizpage //////

export const handleCheckQuizWord = async (text: SelectVocab) => {
  if (text.number > 1) {
    checkVocabulary(text.id);
  } else {
    setNavStore("totalMemories", navStore.totalMemories + 1);
    await archiveVocabulary(text.word);
    await deleteVocabulary(text.id);
    updateLastRowWord(text.id);
  }
};

////// Weatherpage //////

export const getHourlyWeatherData = async ({
  lat: lat,
  lon: lon,
}: {
  lat: string;
  lon: string;
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
  lat: string;
  lon: string;
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

////// Bookmarkpage //////
export const likeBookMarkById = async (id: SelectBookmark["id"]) => {
  "use server";
  await increaseBookmarkLikeById(id);
};

export const unlikeBookMarkById = async (id: SelectBookmark["id"]) => {
  "use server";
  await decreaseBookmarkLikeById(id);
};

export const deleteBookmark = async (id: SelectBookmark["id"]) => {
  "use server";
  await deleteBookmarkById(id);
};

export const getBookMarkDataItem = async (id: SelectBookmark["id"]) => {
  "use server";
  const data = await getBookmarkById(id);
  if (data) return data[0];
};

export const getBookMarkData = async () => {
  "use server";
  const data = await getBookmarkBySelected();
  if (data) return data[0];
};

export const getNextBookMarkData = async (id: SelectBookmark["id"]) => {
  "use server";
  const data = await getNextBookmark(id);
  if (data) {
    await updateBookmarkSelectById(id, false);
    await updateBookmarkSelectById(data[0].id, true);
    return data[0];
  }
  return undefined;
};

export const getPrevBookMarkData = async (id: SelectBookmark["id"]) => {
  "use server";
  const data = await getPreviousBookmark(id);
  if (data) {
    await updateBookmarkSelectById(id, false);
    await updateBookmarkSelectById(data[0].id, true);
    return data[0];
  }
  return undefined;
};

export const updateBookmarkData = action(async (formData: FormData) => {
  "use server";
  const id = String(formData.get("id"));
  const doc = String(formData.get("bookmarks"));
  await updateBookmarkContentById(id, doc);
}, "update-bookmark");

export const insertBookmarkData = action(async (formData: FormData) => {
  "use server";
  const doc = String(formData.get("bookmarksInsert"));
  let entries = readKindleClipping(doc);
  let parsedEntries = parseKindleEntries(entries);

  for (let i = 0; i < parsedEntries.length; i++) {
    const row: InsertBookmark = {
      authors: parsedEntries[i].authors,
      bookTile: parsedEntries[i].bookTile,
      page: parsedEntries[i].page,
      location: parsedEntries[i].location,
      dateOfCreation: parsedEntries[i].dateOfCreation,
      content: parsedEntries[i].content,
      type: parsedEntries[i].type,
    };
    const res = await insertBookmark(row);
    if (res) console.log("Error:", res);
    else console.log(`Row ${i} inserted`);
  }
}, "insert-bookmark");

export const getRandomBookMarkData = async () => {
  "use server";
  const data = await getRandomBookmark();
  if (data) return data[0];
};

export const findBookMarkData = async (val: string) => {
  "use server";
  const data = await findTextBookmark(val);
  if (data) return data;
};

////////////////////////////////////////////////////
//insert data//
////////////////////////////////////////////////////

// export const insertWeatherData = async () => {
//   "use server";
//   const weatherdata: InsertWeather[] = [
//     {
//       name: "Thủ Thừa",
//       lat: "10.588468",
//       lon: "106.40065",
//       default: true,
//     },
//     {
//       name: "Cần Thơ",
//       lat: "10.0364216",
//       lon: "105.7875219",
//       default: false,
//     },
//     {
//       name: "Tokyo",
//       lat: "35.652832",
//       lon: "139.839478",
//       default: false,
//     },
//   ];
//   for (let i = 0; i < weatherdata.length; i++) {
//     const res = await insertWeather(weatherdata[i]);
//     if (res) console.log("Error:", res);
//     else console.log(`Row ${i} inserted`);
//   }
// };

// export const insertProgressData = async () => {
//   "use server";

//   const { data, error } = await supabase
//     .from(mapTables.history)
//     .select()
//     .order("created_at");
//   for (let i = 0; i < data!.length; i++) {
//     const row: InsertProgress = {
//       index: data![i].index,
//       start_date: new Date(data![i].from_date),
//       end_date: new Date(data![i].to_date),
//     };
//     const res = await insertProgress(row);
//     if (res) console.log("Error:", res);
//     else console.log(`Row ${i} inserted`);
//   }
// };

// export const insertDiaryData = async () => {
//   "use server";
//   const { data, error } = await supabase
//     .from(mapTables.progress)
//     .select()
//     .order("created_at");
//   for (let i = 0; i < data!.length; i++) {
//     const row: InsertDiary = {
//       date: new Date(data![i].date),
//       count: data![i].count,
//     };
//     const res = await insertDiary(row);
//     if (res) console.log("Error:", res);
//     else console.log(`Row ${i} inserted`);
//   }
// };

// export const insertBookmarkData = async () => {
//   "use server";
//   const { data, error } = await supabase
//     .from(mapTables.bookmarks)
//     .select()
//     .order("created_at");

//   for (let i = 0; i < data!.length; i++) {
//     const row: InsertBookmark = {
//       authors: data![i].authors,
//       bookTile: data![i].bookTile,
//       page: data![i].page,
//       location: data![i].location,
//       dateOfCreation: data![i].dateOfCreation,
//       content: data![i].content,
//       type: data![i].type,
//       like: data![i].like,
//     };

//     const res = await insertBookmark(row);
//     if (res) console.log("Error:", res);
//     else console.log(`Row ${i} inserted`);
//   }
// };

// export const insertVocabData = async () => {
//   "use server";
//   const { data, error } = await supabase
//     .from(mapTables.vocabulary)
//     .select()
//     .order("created_at", { ascending: true });
//   for (let i = 0; i < data!.length; i++) {
//     const row: InsertVocab = {
//       word: data![i].word,
//       number: data![i].number,
//       audio: data![i].audio,
//       phonetics: data![i].phonetics,
//       definitions: data![i].definitions,
//       translations: data![i].translations,
//     };

//     const res = await insertVocab(row);
//     if (!res.status) console.log("Error:", res);
//     else console.log(`Row ${i} inserted`);
//   }
// };

// export const insertMemoriesData = async () => {
//   "use server";
//   const { data, error } = await supabase
//     .from(mapTables.memories)
//     .select()
//     .order("created_at", { ascending: true });
//   for (let i = 0; i < data!.length; i++) {
//     const row: InsertMemories = {
//       word: data![i].word,
//       createdAt: new Date(data![i].created_at),
//     };
//     const res = await insertMemories(row);
//     if (res) console.log("Error:", res);
//     else console.log(`Row ${i} inserted`);
//   }
// };
