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
  getListContent,
  getTodayData,
  getTotalMemories,
  getWeatherLocations,
  handleCheckAndRender,
  updateTodayData,
  updateTodaySchedule,
} from "~/lib/api";
import { Motion, Presence } from "solid-motionone";
import { logout } from "~/lib";
import { WMOCODE } from "~/utils";
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
    notification.onclose = () => {
      mainStore.audioRef && mainStore.audioRef.pause();
      if (!listStore.quizTest) {
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
        return prev - 1;
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
    setTimeout(() => {
      handleGetListContent(listStore.listType);
    }, 1500);
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

  const handleGetListContent = async (id: number) => {
    switch (id) {
      case 1:
        setListStore("listType", 1);
        const data1 = await getListContent(
          listStore.listToday.index1,
          listStore.listToday.index1 + 49
        );
        if (data1) setListStore("listContent", data1);
        break;
      case 2:
        setListStore("listType", 2);
        const data2 = await getListContent(
          listStore.listToday.index2,
          listStore.listToday.index2 + 49
        );
        if (data2) setListStore("listContent", data2);
        break;
      default:
        break;
    }
    setListStore("listButton", true);
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
    icon: 3,
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
          class={styles.bottomBtn1}
        >
          <img
            src="images/main/stanczyk.webp"
            class={styles.bottomBtnImage}
            width={79}
            height={45}
          />
          <small>Danger is sweet</small>
          <span>Dulce periculum</span>
        </A>

        <div class={styles.bottomDivide}></div>

        <A
          href="/calendar"
          activeClass={styles.bottomBtnActive}
          class={styles.bottomBtn2}
        >
          <img
            src="images/main/sisifo.webp"
            class={styles.bottomBtnImage}
            width={79}
            height={45}
          />
          <small>Money not stink</small>
          <span>Pecunia non olet</span>
        </A>

        <button class={styles.bottomCenter} onClick={startOrStopCountdown}>
          <div
            class={styles.bottomCenterContent}
            style={{
              background: showTimer()
                ? `linear-gradient(to top, white 0%, white ${(minute() / 6) * 100
                }%, black ${(minute() / 6) * 100}%, black 100%)`
                : "none",
            }}
          >
            <span>{Math.floor(mainStore.totalMemories / 100)}</span>
            <small>
              {mainStore.totalMemories % 100 < 10
                ? "0" + (mainStore.totalMemories % 100)
                : mainStore.totalMemories % 100}
            </small>
          </div>
        </button>

        <A
          href="/weather"
          activeClass={styles.bottomBtnActive}
          class={styles.bottomBtnWeather}
        >
          <Show when={bottomWeatherBgUrl()}
            fallback={<img src="images/main/sky.webp" width={80} height={35} class={styles.bottomBtnWeatherBg} />}
          >
            <img src={bottomWeatherBgUrl()} width={80} height={35} class={styles.bottomBtnWeatherBg} />
          </Show>
          <Show
            when={bottomWeather()}
            fallback={
              <div class={styles.bottomBtn3Content}>
                <small>God from the machine</small>
                <span>Deus ex machina</span>
              </div>
            }
          >
            <div class={styles.bottomWeatherImageContainer}>
              <img
                class={styles.bottomWeatherImg}
                src={
                  bottomWeather()!.isDayTime
                    ? WMOCODE[bottomWeather()!.icon].day.image
                    : WMOCODE[bottomWeather()!.icon].night.image
                }
                height={24}
                alt="bottomWeatherIcon"
              />
              <p>{Math.round(bottomWeather()!.temperature)}°</p>
            </div>
            <div class={styles.scrollingTextContainer}>
              <div class={styles.scrollingTextInner}>
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
            </div>
          </Show>
        </A>

        <div class={styles.bottomDivide}></div>

        <Show
          when={listStore.listContent.length > 0}
          fallback={
            <div class={styles.bottomBtn4}>
              <small>Remember you have to die</small>
              <span>Memento mori</span>
            </div>
          }
        >
          <div class={styles.bottomImageContent} onClick={handleAutoplay}>
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
                    class={styles.bottomImage}
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
                  class={styles.bottomImage}
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
                class={styles.bottomImageBackground}
              />
            </Show>
          </div>
        </Show>

      </div>

      <div class={styles.buttonMenuContent}>
        <A
          href="/quiz"
          class={buttons.buttonMenu}
        >
          <div class={buttons.buttonMenuOrnament}></div>
          <img
            alt="hourglass"
            src="images/main/hourglass.webp"
            width={90}
            height={42}
          />
        </A>
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
            alt="hourglass"
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
            alt="hourglass"
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
            handleGetListContent(2);
          }}
        >
          <div class={buttons.buttonMenuOrnament}></div>
          <img
            alt="hourglass"
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
            handleGetListContent(1);
          }}
        >
          <div class={buttons.buttonMenuOrnament}></div>
          <img
            alt="hourglass"
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
        <button class={buttons.buttonMenu} onClick={logoutAction}>
          <div class={buttons.buttonMenuOrnament}></div>
          <img
            alt="hourglass"
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
