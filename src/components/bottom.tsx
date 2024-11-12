import { A, useAction } from "@solidjs/router";
import { Component, Show, createSignal, onMount } from "solid-js";
import { format } from "date-fns";
import styles from "./bottom.module.scss";
import buttons from "../assets/styles/buttons.module.scss";
import {
  listStore,
  mainStore,
  setListStore,
  setMainStore,
} from "~/lib/mystore";
import {
  getCurrentWeatherData,
  getImageFromUnsplashByKeyword,
  getListContentQuiz,
  getListContentVocab,
  getTodayData,
  getTotalMemories,
  getWeatherLocations,
  handleCheckAndRender,
  updateTodayData,
  updateTodaySchedule,
} from "~/lib/api";
import { Motion, Presence } from "solid-motionone";
import { logout } from "~/lib";
import { shuffleQuiz, WMOCODE } from "~/utils";
import { CurrentlyWeatherType, WeatherGeoType } from "~/types";

let intervalCountdown: NodeJS.Timeout | undefined;
let intervalAutoplay: NodeJS.Timeout;
const [showTimer, setShowTimer] = createSignal<boolean>(false);
const [minute, setMinute] = createSignal<number>(6);

const Bottom: Component<{}> = () => {
  const todayDate = format(new Date(), "yyyy-MM-dd");

  const [bottomLocation, setBottomLocation] = createSignal<WeatherGeoType>({
    name: 'My Place',
    lat: 10.6023,
    lon: 106.4021,
    default: false
  });

  const getBottomWeatherData = async () => {
    const result = await getCurrentWeatherData({
      lat: bottomLocation().lat,
      lon: bottomLocation().lon,
    });
    result && setBottomWeather(result);
    const weatherBgUrl = await getImageFromUnsplashByKeyword(WMOCODE[String(bottomWeather().icon)].textdescription);
    if (weatherBgUrl) setBottomWeatherBgUrl(weatherBgUrl);
  };

  onMount(async () => {
    const data = await Promise.all([
      getTotalMemories(),
      getTodayData(todayDate),
      getWeatherLocations()
    ]);
    if (data[0]) setMainStore("totalMemories", data[0]);
    if (data[1]) setListStore("listToday", data[1]);
    if (data[2]) {
      const myLocation = data[2].find((item) => item.default) || data[2][0];
      setBottomLocation(myLocation);
      getBottomWeatherData();
      const weatherInterval = setInterval(async () => {
        getBottomWeatherData();
      }, 1000 * 15 * 60);
      clearInterval(intervalCountdown);
    }
  });

  // -------------------LOGOUT-------------------- //
  const logoutAction = useAction(logout);
  // -------------------LOGOUT-------------------- //

  // -------------------COUNTDOWN START-------------------- //
  const showDesktopNotification = () => {
    const img = "https://cdn-icons-png.flaticon.com/512/2617/2617511.png";
    const letter = listStore.listType === 1 ? "I" : "II";
    const newProgress =
      listStore.listType === 1
        ? listStore.listToday.time1 + 1
        : listStore.listToday.time2 + 1;
    const notification = new Notification("Start Focusing", {
      icon: img,
      requireInteraction: true,
      body: `${letter}-${newProgress}`,
    });
    notification.onclose = async () => {
      clearInterval(intervalCountdown);
      intervalCountdown = undefined;
      mainStore.audioRef && mainStore.audioRef.pause();
      if (listStore.quizTest) {
        handleGetListContentQuiz(listStore.listType);
      }
      else {
        await handleGetListContentVocab(listStore.listType);
        handleAutoplay();
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
    setMainStore("audioSrc", "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/3a/5e/e6/3a5ee615-b992-cba4-c351-419d2c6d1578/mzaf_13102140031776931351.plus.aac.ep.m4a");
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
    }, 7200);
  };

  const pauseAutoplay = () => {
    clearInterval(intervalAutoplay);
  };

  const endAutoplay = async () => {
    clearInterval(intervalAutoplay);
    setListStore("listCount", 0);
    await updateTodaySchedule(todayDate, listStore.listType);
    await updateTodayData(todayDate);
    const currentProgress =
      listStore.listType === 1
        ? listStore.listToday.time1
        : listStore.listToday.time2;
    if (currentProgress < 9) {
      startCountdown();
    }
  };

  const handleAutoplay = () => {
    if (listStore.listButton && listStore.listContent.length > 0) {
      setListStore("listButton", false);
      startAutoplay();
    } else {
      setListStore("listButton", true);
      pauseAutoplay();
    }
  };

  const handleGetListContentVocab = async (id: number) => {
    switch (id) {
      case 1:
        setListStore("listType", 1);
        const data1 = await getListContentVocab(
          listStore.listToday.index1,
          listStore.listToday.index1 + 49
        );
        if (data1) {
          setListStore("listContent", data1);
          setListStore("listButton", true);
        }
        break;
      case 2:
        setListStore("listType", 2);
        const data2 = await getListContentVocab(
          listStore.listToday.index2,
          listStore.listToday.index2 + 49
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
          listStore.listToday.index1,
          listStore.listToday.index1 + 49
        );
        if (data1) {
          setListStore("quizContent", shuffleQuiz(data1));
          setListStore("quizRender", data1[0]);
        }
        break;
      case 2:
        setListStore("listType", 2);
        const data2 = await getListContentQuiz(
          listStore.listToday.index2,
          listStore.listToday.index2 + 49
        );
        if (data2) {
          setListStore("quizContent", shuffleQuiz(data2));
          setListStore("quizRender", data2[0]);
        }
        break;
      default:
        break;
    }
  };

  // -------------------AUTOPLAY END-------------------- //

  const [bottomWeather, setBottomWeather] = createSignal<
    CurrentlyWeatherType
  >({
    apparentTemperature: 0,
    isDayTime: true,
    humidity: 0,
    temperature: 0,
    uvIndex: 0,
    icon: 96,
    windDirection: 0,
    windSpeed: 0,
  });

  const [bottomWeatherBgUrl, setBottomWeatherBgUrl] = createSignal<string>("");

  return (
    <div class={styles.bottom}>
      <div class={styles.bottomBar}>

        <div class={styles.bottomIndex}>
          <div class={styles.bottomIndexNums}>
            <Show
              when={listStore.listToday.created_at}
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
              <span>{listStore.listToday.time1}</span>
              <span>{listStore.listToday.time2}</span>
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
          <span>Memento mori. <br />Remember you will die.</span>
        </A>
        <div class={styles.bottomBtnSep}></div>
        <A
          href="/calendar"
          activeClass={styles.bottomBtnActive}
          class={styles.bottomBtn}
        >
          <span>Pecunia non olet. <br />Money does not stink.</span>
        </A>

        <div class={styles.bottomBtnSep}></div>

        <div class={styles.bottomBtnCenter}>
          <A
            href="/quiz"
            class={styles.bottomBtnCenterLink}
            activeClass={styles.bottomBtnCenterLinkActive}
          >
            <span>Dulce periculum. <br />Danger is sweet.</span>
          </A>
          <div class={styles.bottomBtnIndex}>
            <sup>{Math.floor(mainStore.totalMemories / 100)}</sup>
            <text>
              {mainStore.totalMemories % 100 < 10
                ? "0" + (mainStore.totalMemories % 100)
                : mainStore.totalMemories % 100}
            </text>
          </div>
        </div>

        <div class={styles.bottomBtnSep}></div>

        <A
          href="/weather"
          activeClass={styles.bottomBtnActive}
          class={styles.bottomBtnWeather}
        >
          <Show when={bottomWeatherBgUrl()}
            fallback={<img src="images/main/sky.webp" width={88} height={35} class={styles.bottomBtnImage} />}
          >
            <img src={bottomWeatherBgUrl()} width={88} height={35} class={styles.bottomBtnImage} />
          </Show>
          <div class={styles.bottomBtnWeatherInfo}>
            <img
              class={styles.bottomWeatherImg}
              src={
                bottomWeather().isDayTime
                  ? WMOCODE[bottomWeather().icon].day.image
                  : WMOCODE[bottomWeather().icon].night.image
              }
              height={21}
              width={21}
              alt="bottomWeatherIcon"
            />
            <label>{Math.round(bottomWeather().temperature)}°</label>
          </div>

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
                  width={90}
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
                width={90}
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

      <div class={styles.buttonMenuContent} style={{ transform: showTimer() ? "translateX(0px)" : "" }}>
        <button class={buttons.buttonMenu} onClick={startOrStopCountdown}>
          <div class={buttons.buttonMenuOrnament}></div>
          <Motion.img
            animate={{
              width: `${(1 - (minute() / 6)) * 90}px`,
              objectPosition: 'top left',
            }}
            height={42}
            transition={{ duration: 0.3, easing: [0.4, 0, 0.2, 1] }}
            src="images/main/hourglass.webp"
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
          <div class={buttons.buttonMenuOrnament}></div>
          <img
            alt="translate"
            src="images/main/translate.webp"
            width={90}
            height={42}
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
          <div class={buttons.buttonMenuOrnament}></div>
          <img
            alt="bookmark"
            src="images/main/bookmark.webp"
            width={90}
            height={42}
          />
        </button>
      </div>

      <div class={styles.buttonMenuContent}>
        <button
          class={
            listStore.listType === 2
              ? buttons.buttonMenuActive
              : buttons.buttonMenu
          }
          onClick={() => {
            listStore.quizTest ? handleGetListContentQuiz(2) : handleGetListContentVocab(2)
          }}
        >
          <div class={buttons.buttonMenuOrnament}></div>
          <img
            alt="flower2"
            src="images/main/flower2.webp"
            width={90}
            height={42}
          />
          <Show
            when={listStore.listToday.created_at}
            fallback={
              <span>hiems</span>
            }
          >
            <span>{listStore.listToday.index2 + 1}</span>
          </Show>
        </button>
      </div>

      <div class={styles.buttonMenuContent}>
        <button
          class={
            listStore.listType === 1
              ? buttons.buttonMenuActive
              : buttons.buttonMenu
          }
          onClick={() => {
            listStore.quizTest ? handleGetListContentQuiz(1) : handleGetListContentVocab(1)
          }}
        >
          <div class={buttons.buttonMenuOrnament}></div>
          <img
            alt="flower1"
            src="images/main/flower1.webp"
            width={90}
            height={42}
          />
          <Show
            when={listStore.listToday.created_at}
            fallback={
              <span>hiems</span>
            }
          >
            <span>{listStore.listToday.index1 + 1}</span>
          </Show>
        </button>
      </div>

      <div class={styles.buttonMenuContent}>
        <button
          class={buttons.buttonMenu
          }
          onClick={logoutAction}
        >
          <div class={buttons.buttonMenuOrnament}></div>
          <img
            alt="exit"
            src="images/main/exit.webp"
            width={90}
            height={42}
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
