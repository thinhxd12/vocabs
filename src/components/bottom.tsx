import { A, createAsync, useAction } from "@solidjs/router";
import { Component, Show, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { format } from "date-fns";
import styles from "./bottom.module.scss";
import buttons from "../assets/styles/buttons.module.scss";
import {
  calendarStore,
  listStore,
  mainStore,
  setCalendarStore,
  setListStore,
  setMainStore,
  setWeatherStore,
  weatherStore,
} from "~/lib/mystore";
import {
  getCurrentWeatherData,
  getImageFromUnsplashByKeyword,
  getListContentQuiz,
  getListContentVocab,
  getLocationList,
  getTodaySchedule,
  handleCheckAndRender,
  updateTodaySchedule,
  updateTodayScheduleStore,
} from "~/lib/api";
import { Motion, Presence } from "solid-motionone";
import { logout } from "~/lib";
import { shuffleQuiz, WMOCODE } from "~/utils";
import { CurrentlyWeatherType } from "~/types";
import ImageLoader from "./imageloader";

let intervalCountdown: NodeJS.Timeout | undefined;
let intervalAutoplay: NodeJS.Timeout;
let weatherInterval: NodeJS.Timeout | undefined;
const [showTimer, setShowTimer] = createSignal<boolean>(false);
const [minute, setMinute] = createSignal<number>(6);
const todayDate = format(new Date(), "yyyy-MM-dd");

const Bottom: Component<{}> = () => {
  const todaySchedule_data = createAsync(() => getTodaySchedule(todayDate));
  const locationList_data = createAsync(() => getLocationList());

  createEffect(() => {
    if (todaySchedule_data()) {
      setCalendarStore("todaySchedule", todaySchedule_data()!);
    }
  })

  createEffect(() => {
    if (locationList_data()) {
      setWeatherStore("locationList", locationList_data()!);
      setWeatherStore("defaultLocation", locationList_data()![0]);

      getBottomWeatherData();
      weatherInterval = setInterval(() => {
        getBottomWeatherData();
      }, 1000 * 15 * 60);
    }
  })

  onCleanup(() => {
    clearInterval(weatherInterval);
  })

  const getBottomWeatherData = async () => {
    const result = await getCurrentWeatherData({
      lat: weatherStore.defaultLocation.lat,
      lon: weatherStore.defaultLocation.lon,
    });
    result && setBottomWeather(result);
    const weatherBgUrl = await getImageFromUnsplashByKeyword(WMOCODE[String(bottomWeather().icon)].textdescription);
    if (weatherBgUrl) setBottomWeatherBgUrl(weatherBgUrl);
  };

  // -------------------LOGOUT-------------------- //
  const logoutAction = useAction(logout);
  // -------------------LOGOUT-------------------- //

  // -------------------COUNTDOWN START-------------------- //
  const showDesktopNotification = () => {
    const img = "https://cdn-icons-png.flaticon.com/512/2617/2617511.png";
    const letter = listStore.listType === 1 ? "I" : "II";
    const newProgress =
      listStore.listType === 1
        ? calendarStore.todaySchedule.time1 + 1
        : calendarStore.todaySchedule.time2 + 1;
    const notification = new Notification("Start Focusing", {
      icon: img,
      requireInteraction: true,
      body: `${letter}-${newProgress}`,
    });
    notification.onclose = async () => {
      clearInterval(intervalCountdown);
      intervalCountdown = undefined;
      mainStore.audioRef && mainStore.audioRef.pause();
      if (listStore.vocabPage) {
        await handleGetListContentVocab(listStore.listType);
        handleAutoplay();
      }
      else {
        handleGetListContentQuiz(listStore.listType);
      }
    };
  };

  const startCountdown = () => {
    clearInterval(intervalCountdown);
    setShowTimer(true);
    intervalCountdown = setInterval(() => {
      setMinute((prev: number) => {
        if (prev === 1) {
          endCountdown();
          return 6;
        }
        else return prev - 1;
      });
    }, 60000);
  };

  const endCountdown = () => {
    setMinute(6);
    setShowTimer(false);
    clearInterval(intervalCountdown);
    setMainStore("audioSrc", "");
    setMainStore("audioSrc", import.meta.env.VITE_SUPABASE_URL + "/storage/v1/object/public/weather/Ophelia.mp3");
    showDesktopNotification();
  };

  const stopCountdown = () => {
    setShowTimer(false);
    clearInterval(intervalCountdown);
    intervalCountdown = undefined;
    setMinute(6);
  };

  const startOrStopCountdown = () => {
    intervalCountdown ? stopCountdown() : startCountdown();
  };

  // -------------------COUNTDOWN END-------------------- //
  // -------------------AUTOPLAY START-------------------- //
  const handleRenderWord = () => {
    handleCheckAndRender(listStore.listContent[listStore.listCount]);
    setListStore("listCount", listStore.listCount + 1);
  };

  const startAutoplay = async () => {
    clearInterval(intervalAutoplay);
    handleRenderWord();
    intervalAutoplay = setInterval(() => {
      if (listStore.listCount < listStore.listContent.length) {
        handleRenderWord();
      } else {
        endAutoplay();
      }
    }, 7000);
  };

  const pauseAutoplay = () => {
    clearInterval(intervalAutoplay);
  };

  const endAutoplay = async () => {
    clearInterval(intervalAutoplay);
    setListStore("listCount", 0);
    const res = await updateTodaySchedule(todayDate, listStore.listType);
    updateTodayScheduleStore(res);
    const currentProgress =
      listStore.listType === 1
        ? calendarStore.todaySchedule.time1
        : calendarStore.todaySchedule.time2;
    if (currentProgress < 9) {
      startCountdown();
    }
  };

  const handleAutoplay = () => {
    if (listStore.vocabPage && listStore.listContent.length > 0) {
      if (listStore.listButton) {
        setListStore("listButton", false);
        startAutoplay();
      } else {
        setListStore("listButton", true);
        pauseAutoplay();
      }
    }
  };

  const handleGetListContentVocab = async (id: number) => {
    switch (id) {
      case 1:
        setListStore("listType", 1);
        const data1 = await getListContentVocab(
          calendarStore.todaySchedule.index1,
          calendarStore.todaySchedule.index1 + 49
        );
        if (data1) {
          setListStore("listContent", data1);
          setListStore("listButton", true);
        }
        break;
      case 2:
        setListStore("listType", 2);
        const data2 = await getListContentVocab(
          calendarStore.todaySchedule.index2,
          calendarStore.todaySchedule.index2 + 49
        );
        if (data2) {
          setListStore("listContent", data2);
          setListStore("listButton", true);
        }
        break;
      default:
        break;
    }
  };

  const handleGetListContentQuiz = async (id: number) => {
    switch (id) {
      case 1:
        setListStore("listType", 1);
        const data1 = await getListContentQuiz(
          calendarStore.todaySchedule.index1,
          calendarStore.todaySchedule.index1 + 49
        );
        if (data1) {
          setListStore("quizContent", shuffleQuiz(data1));
          setListStore("quizRender", data1[0]);
        }
        break;
      case 2:
        setListStore("listType", 2);
        const data2 = await getListContentQuiz(
          calendarStore.todaySchedule.index2,
          calendarStore.todaySchedule.index2 + 49
        );
        if (data2) {
          setListStore("quizContent", shuffleQuiz(data2));
          setListStore("quizRender", data2[0]);
        }
        break;
      default:
        break;
    }
    setListStore("listContent", []);
    setListStore("listCount", 0);
    setListStore("listButton", false);
  };

  // -------------------AUTOPLAY END-------------------- //

  const [bottomWeather, setBottomWeather] = createSignal<
    CurrentlyWeatherType
  >({
    apparentTemperature: 0,
    isDayTime: false,
    humidity: 0,
    temperature: 0,
    uvIndex: 0,
    icon: 96,
    windDirection: 0,
    windSpeed: 0,
  });

  const [bottomWeatherBgUrl, setBottomWeatherBgUrl] = createSignal<string>("https://hoctuvung3.vercel.app/images/main/sky.webp");

  return (
    <div class={styles.bottom}>
      <div class={styles.bottomBar}>

        <div class={styles.bottomIndex}>
          <div class={styles.bottomIndexNums}>
            <Show
              when={calendarStore.todaySchedule.created_at}
              fallback={
                <>
                  <span>
                    <small>N</small>
                  </span>
                  <span>
                    <small>N</small>
                  </span>
                </>
              }
            >
              <span>{calendarStore.todaySchedule.time1}</span>
              <span>{calendarStore.todaySchedule.time2}</span>
            </Show>
          </div>
          <div class={styles.bottomIndexDay}>
            <span>{format(new Date(), "eeeeee")}</span>
          </div>
        </div>

        <A
          href="/vocabulary"
          activeClass={styles.bottomBtnActive}
          class={styles.bottomBtn}
        >
          <img
            src="images/main/stanczyk.webp"
            alt="stanczyk"
            width={57}
            height={35}
            class={styles.bottomBtnBackground}
          />
          <span>Dulce periculum. <br />Danger is sweet.</span>
        </A>

        <div class={styles.bottomBtnSep}></div>

        <A
          href="/calendar"
          activeClass={styles.bottomBtnActive}
          class={styles.bottomBtn}
        >
          <img
            src="images/main/sisifo.webp"
            alt="sisifo"
            width={57}
            height={35}
            class={styles.bottomBtnBackground}
          />
          <span>Pecunia non olet. <br />Money does not stink.</span>
        </A>

        <div class={styles.bottomBtnSep}></div>

        <A
          href="/quiz"
          activeClass={styles.bottomBtnActive}
          class={styles.bottomBtn}
        >
          <img
            src="images/main/TheEndoftheDay.webp"
            alt="TheEndoftheDay"
            width={57}
            height={35}
            class={styles.bottomBtnBackground}
          />
          <span>Memento mori. <br />Remember you will die.</span>
        </A>

        <div class={styles.bottomBtnSep}></div>

        <A
          href="/weather"
          activeClass={styles.bottomBtnActive}
          class={styles.bottomBtnWeather}
        >
          <ImageLoader
            src={bottomWeatherBgUrl()}
            width={90}
            height={35}
            className={styles.bottomBtnImage}
          />
          <div class={styles.bottomBtnWeatherInfo}>
            <img
              src={
                bottomWeather().isDayTime
                  ? WMOCODE[bottomWeather().icon].day.image
                  : WMOCODE[bottomWeather().icon].night.image
              }
              width={21}
              height={21}
              class={styles.bottomWeatherImg}
            />
            <label>{Math.round(bottomWeather().temperature)}°</label>
          </div>

          <section class={styles.bottomBtnIndex}>
            <sup>{Math.floor(mainStore.totalMemories / 100)}</sup>
            <text>
              {mainStore.totalMemories % 100 < 10
                ? "0" + (mainStore.totalMemories % 100)
                : mainStore.totalMemories % 100}
            </text>
          </section>

          <section class={styles.scrollingTextContainer}>
            <div class={styles.scrollingTextContent}>
              <div class={styles.scrollingText}>
                <div class={styles.scrollingTextItem}>
                  {bottomWeather()!.isDayTime
                    ? WMOCODE[bottomWeather()!.icon].day.description
                    : WMOCODE[bottomWeather()!.icon].night.description}
                </div>
              </div>
              <div class={styles.scrollingText}>
                <div class={styles.scrollingTextItem}>
                  {bottomWeather()!.isDayTime
                    ? WMOCODE[bottomWeather()!.icon].day.description
                    : WMOCODE[bottomWeather()!.icon].night.description}
                </div>
              </div>
            </div>
          </section>
        </A>

        <div class={styles.bottomBtnSep}></div>

        <div class={styles.bottomBtnPlay} onClick={handleAutoplay}>
          <Presence>
            <Show
              when={listStore.listButton}
              fallback={
                <Motion.img
                  initial={{
                    y: "100%",
                    opacity: 0,
                  }}
                  animate={{
                    y: 0,
                    opacity: 1,
                  }}
                  exit={{
                    y: "100%",
                    opacity: 0,
                  }}
                  transition={{ duration: 0.3, easing: "ease" }}
                  src="images/main/sunset.webp"
                  width={85}
                  height={35}
                  class={styles.bottomBtnPlayImage}
                />
              }
            >
              <Motion.img
                initial={{
                  y: "100%",
                  opacity: 0,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                }}
                exit={{
                  y: "100%",
                  opacity: 0,
                }}
                transition={{ duration: 0.3, easing: "ease" }}
                src="images/main/sunrise.webp"
                width={85}
                height={35}
                class={styles.bottomBtnPlayImage}
              />
            </Show>
          </Presence>

          <Show when={listStore.listCount}>
            <Motion.img
              animate={{
                opacity: 1,
                width: `${(listStore.listCount + 1) * 2}%`,
              }}
              transition={{ duration: 0.3, easing: [0.4, 0, 0.2, 1] }}
              src="images/main/sunrise.webp"
              height={35}
              class={styles.bottomBtnPlayImageProgress}
            />
          </Show>
        </div>
      </div>

      <div class={styles.buttonMenuContent}
        style={{ transform: showTimer() ? "translateX(0)" : "" }}
      >
        <button
          class={buttons.buttonMenu}
          onClick={startOrStopCountdown}
        >
          <img
            src="images/main/input-left-corner.webp"
            alt="left"
            width="auto"
            height={34}
            class={buttons.leftOrnament}
            loading="lazy"
          />

          <img
            src="images/main/hourglass.webp"
            alt="hourglass"
            width={(1 - (minute() / 6)) * 85}
            height={34}
            class={buttons.buttonMenuImageTimer}
            loading="lazy"
          />

          <img
            src="images/main/input-right-corner.webp"
            alt="left"
            width="auto"
            height={34}
            class={buttons.rightOrnament}
            loading="lazy"
          />
        </button>
      </div>

      <div class={styles.buttonMenuContent}>
        <button
          class={buttons.buttonMenu}
          onClick={() => {
            setMainStore("showTranslate", true);
          }}
        >
          <img
            src="images/main/input-left-corner.webp"
            alt="left"
            width="auto"
            height={34}
            class={buttons.leftOrnament}
            loading="lazy"
          />

          <img
            src="images/main/translate.webp"
            alt="translate"
            width={85}
            height={34}
            class={buttons.buttonMenuImage}
            loading="lazy"
          />

          <img
            src="images/main/input-right-corner.webp"
            alt="left"
            width="auto"
            height={34}
            class={buttons.rightOrnament}
            loading="lazy"
          />
        </button>
      </div>

      <div class={styles.buttonMenuContent}>
        <button
          class={buttons.buttonMenu}
          onClick={() => {
            setMainStore("mainToggle", true);
          }}
        >
          <img
            src="images/main/input-left-corner.webp"
            alt="left"
            width="auto"
            height={34}
            class={buttons.leftOrnament}
            loading="lazy"
          />

          <img
            src="images/main/bookmark.webp"
            alt="bookmark"
            width={85}
            height={34}
            class={buttons.buttonMenuImage}
            loading="lazy"
          />

          <img
            src="images/main/input-right-corner.webp"
            alt="left"
            width="auto"
            height={34}
            class={buttons.rightOrnament}
            loading="lazy"
          />
        </button>
      </div>

      <div class={styles.buttonMenuContent}>
        <button
          class={buttons.buttonMenu}
          onClick={() => {
            listStore.vocabPage ? handleGetListContentVocab(2) : handleGetListContentQuiz(2)
          }}
        >
          <img
            src="images/main/input-left-corner.webp"
            alt="left"
            width="auto"
            height={34}
            class={buttons.leftOrnament}
            loading="lazy"
          />

          <img
            alt="flower2"
            src="images/main/flower2.webp"
            width={85}
            height={34}
            class={buttons.buttonMenuImage}
            loading="lazy"
          />

          <Show
            when={calendarStore.todaySchedule.created_at}
            fallback={
              <span>hiems</span>
            }
          >
            <span style={{ color: listStore.listType === 2 ? "#38E07B" : "#ffffff" }}>{calendarStore.todaySchedule.index2 + 1}</span>
          </Show>

          <img
            src="images/main/input-right-corner.webp"
            alt="left"
            width="auto"
            height={34}
            class={buttons.rightOrnament}
            loading="lazy"
          />
        </button>
      </div>

      <div class={styles.buttonMenuContent}>
        <button
          class={buttons.buttonMenu}
          onClick={() => {
            listStore.vocabPage ? handleGetListContentVocab(1) : handleGetListContentQuiz(1)
          }}
        >
          <img
            src="images/main/input-left-corner.webp"
            alt="left"
            width="auto"
            height={34}
            class={buttons.leftOrnament}
            loading="lazy"
          />

          <img
            alt="flower1"
            src="images/main/flower1.webp"
            width={85}
            height={34}
            class={buttons.buttonMenuImage}
            loading="lazy"
          />

          <Show
            when={calendarStore.todaySchedule.created_at}
            fallback={
              <span>hiems</span>
            }
          >
            <span style={{ color: listStore.listType === 1 ? "#38E07B" : "#ffffff" }}>{calendarStore.todaySchedule.index1 + 1}</span>
          </Show>

          <img
            src="images/main/input-right-corner.webp"
            alt="left"
            width="auto"
            height={34}
            class={buttons.rightOrnament}
            loading="lazy"
          />
        </button>
      </div>

      <div class={styles.buttonMenuContent}>
        <button
          class={buttons.buttonMenu}
          onClick={logoutAction}
        >
          <img
            src="images/main/input-left-corner.webp"
            alt="left"
            width="auto"
            height={34}
            class={buttons.leftOrnament}
            loading="lazy"
          />

          <img
            src="images/main/exit.webp"
            alt="exit"
            width={85}
            height={34}
            class={buttons.buttonMenuImage}
            loading="lazy"
          />

          <img
            src="images/main/input-right-corner.webp"
            alt="left"
            width="auto"
            height={34}
            class={buttons.rightOrnament}
            loading="lazy"
          />
        </button>
      </div>

      <audio
        ref={(el) => setMainStore('audioRef', el)}
        autoplay
        hidden
        src={mainStore.audioSrc}
      />
    </div>
  );
};

export default Bottom;
