import { A, createAsync, useAction, useLocation } from "@solidjs/router";
import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  Show,
} from "solid-js";
import { format } from "date-fns";
import {
  setVocabStore,
  setNavStore,
  navStore,
  layoutStore,
  setLayoutStore,
  setQuizStore,
  quizStore,
} from "~/lib/store";
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
} from "~/lib/server";
import { CurrentlyWeatherType } from "~/types";
import { WMOCODE } from "~/lib/utils";
import arrayShuffle from "array-shuffle";
import { logoutAction } from "~/lib/login";
import ImageLoader from "./ImageLoader";

const Nav: Component<{}> = (props) => {
  let audioRef: HTMLAudioElement | undefined;
  let intervalCountdown: NodeJS.Timeout | undefined;
  let intervalAutoplay: NodeJS.Timeout;
  let weatherInterval: NodeJS.Timeout | undefined;
  const todayDate = format(new Date(), "yyyy-MM-dd");
  const [showTimer, setShowTimer] = createSignal<boolean>(false);
  const [minute, setMinute] = createSignal<number>(6);
  const location = useLocation();
  const todaySchedule_data = createAsync(() => getTodaySchedule(todayDate));
  const locationList_data = createAsync(() => getLocationList());

  const logout = useAction(logoutAction);

  createEffect(() => {
    if (todaySchedule_data()) {
      setNavStore("todaySchedule", todaySchedule_data()!);
    }
  });

  createEffect(() => {
    if (locationList_data()) {
      setNavStore("locationList", locationList_data()!);
      setNavStore("defaultLocation", locationList_data()![0]);

      getBottomWeatherData();
      weatherInterval = setInterval(
        () => {
          getBottomWeatherData();
        },
        1000 * 15 * 60,
      );
    }
  });

  onCleanup(() => {
    clearInterval(weatherInterval);
  });

  const [navWeatherData, setNavWeatherData] =
    createSignal<CurrentlyWeatherType>({
      apparentTemperature: 0,
      isDayTime: false,
      humidity: 0,
      temperature: 0,
      uvIndex: 0,
      icon: 96,
      windDirection: 0,
      windSpeed: 0,
    });

  const [navWeatherBg, setNavWeatherBg] = createSignal<string>(
    "https://hoctuvung3.vercel.app/images/sky.webp",
  );

  const getBottomWeatherData = async () => {
    const result = await getCurrentWeatherData({
      lat: navStore.defaultLocation.lat,
      lon: navStore.defaultLocation.lon,
    });
    result && setNavWeatherData(result);
    const image = await getImageFromUnsplashByKeyword(
      WMOCODE[String(navWeatherData().icon)].textdescription,
    );
    if (image) setNavWeatherBg(image);
  };

  // -------------------COUNTDOWN START-------------------- //

  const showDesktopNotification = () => {
    const img = "https://cdn-icons-png.flaticon.com/512/2617/2617511.png";
    const letter = navStore.listType === 1 ? "I" : "II";
    const newProgress =
      navStore.listType === 1
        ? navStore.todaySchedule.time1 + 1
        : navStore.todaySchedule.time2 + 1;
    const notification = new Notification("Start Focusing", {
      icon: img,
      requireInteraction: true,
      body: `${letter}-${newProgress}`,
    });
    notification.onclose = async () => {
      clearInterval(intervalCountdown);
      intervalCountdown = undefined;
      audioRef?.pause();
      if (location.pathname === "/vocab") {
        await handleGetListContentVocab(navStore.listType);
        handleAutoplay();
      } else {
        handleGetListContentQuiz(navStore.listType);
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
        } else return prev - 1;
      });
    }, 60000);
  };

  const endCountdown = () => {
    setMinute(6);
    setShowTimer(false);
    clearInterval(intervalCountdown);
    if (audioRef) {
      audioRef.pause();
      audioRef.currentTime = 0;
      audioRef.play();
    }
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

  // // -------------------COUNTDOWN END-------------------- //
  // // -------------------AUTOPLAY START-------------------- //

  const handleRenderWord = () => {
    handleCheckAndRender(navStore.listContent[navStore.listCount]);
    setNavStore("listCount", navStore.listCount + 1);
  };

  const startAutoplay = async () => {
    clearInterval(intervalAutoplay);
    handleRenderWord();
    intervalAutoplay = setInterval(() => {
      if (navStore.listCount < navStore.listContent.length) {
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
    setNavStore("listCount", 0);
    const res = await updateTodaySchedule(todayDate, navStore.listType);
    updateTodayScheduleStore(res);
    const currentProgress =
      navStore.listType === 1
        ? navStore.todaySchedule.time1
        : navStore.todaySchedule.time2;
    if (currentProgress < 9) {
      startCountdown();
    }
  };

  const handleAutoplay = () => {
    if (location.pathname === "/vocab" && navStore.listContent.length > 0) {
      if (navStore.playButton) {
        setNavStore("playButton", false);
        startAutoplay();
      } else {
        setNavStore("playButton", true);
        pauseAutoplay();
      }
    }
  };

  const handleGetListContentVocab = async (id: number) => {
    switch (id) {
      case 1:
        setNavStore("listType", 1);
        const data1 = await getListContentVocab(
          navStore.todaySchedule.index1,
          navStore.todaySchedule.index1 + 49,
        );
        if (data1) {
          setNavStore("listContent", data1);
          setNavStore("playButton", true);
        }
        break;
      case 2:
        setNavStore("listType", 2);
        const data2 = await getListContentVocab(
          navStore.todaySchedule.index2,
          navStore.todaySchedule.index2 + 49,
        );
        if (data2) {
          setNavStore("listContent", data2);
          setNavStore("playButton", true);
        }
        break;
      default:
        break;
    }
  };

  const handleGetListContentQuiz = async (id: number) => {
    switch (id) {
      case 1:
        setNavStore("listType", 1);
        const data1 = await getListContentQuiz(
          navStore.todaySchedule.index1,
          navStore.todaySchedule.index1 + 49,
        );
        if (data1) {
          setQuizStore("quizContent", arrayShuffle(data1));
          setQuizStore("quizRender", quizStore.quizContent[0]);
        }
        break;
      case 2:
        setNavStore("listType", 2);
        const data2 = await getListContentQuiz(
          navStore.todaySchedule.index2,
          navStore.todaySchedule.index2 + 49,
        );
        if (data2) {
          setQuizStore("quizContent", arrayShuffle(data2));
          setQuizStore("quizRender", quizStore.quizContent[0]);
        }
        break;
      default:
        break;
    }
    setNavStore("listContent", []);
    setNavStore("listCount", 0);
    setNavStore("playButton", false);
  };

  const handleGetListContent = (type: number) => {
    if (location.pathname === "/vocab") {
      handleGetListContentVocab(type);
    } else if (location.pathname === "/quiz") {
      handleGetListContentQuiz(type);
    } else {
      setNavStore("listContent", []);
      setQuizStore("quizContent", []);
      setNavStore("listType", 0);
    }
  };

  // -------------------AUTOPLAY END-------------------- //

  return (
    <nav class="relative flex h-11 w-full border-t border-t-[#343434]">
      <audio
        ref={audioRef}
        hidden
        src={
          import.meta.env.VITE_SUPABASE_URL +
          "/storage/v1/object/public/weather/Ophelia.mp3"
        }
      />

      <div class="h-full w-3.5 bg-[#454545]">
        <div class="flex h-[22px] w-full flex-col items-center justify-center font-roslindale text-3 font-600 leading-[11px] text-black drop-shadow-md">
          <Show
            when={navStore.todaySchedule.created_at}
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
            <span>{navStore.todaySchedule.time1}</span>
            <span>{navStore.todaySchedule.time2}</span>
          </Show>
        </div>
        <div class="flex h-[13px] w-full items-center justify-center bg-black">
          <div class="-rotate-90 font-sfpro text-3 font-700 leading-3 text-[#454545]">
            {format(new Date(), "eeeeee")}
          </div>
        </div>
      </div>

      <A
        href="/vocab"
        activeClass=""
        class="btn-nav bg-[url('/images/stanczyk.webp')] bg-cover"
      >
        <span>
          Dulce periculum. <br />
          Danger is sweet.
        </span>
      </A>

      <A
        href="/schedule"
        activeClass=""
        class="btn-nav bg-[url('/images/sisifo.webp')] bg-cover"
      >
        <span>
          Pecunia non olet. <br />
          Money does not stink.
        </span>
      </A>

      <A
        href="/quiz"
        activeClass=""
        class="btn-nav bg-[url('/images/TheEndoftheDay.webp')] bg-cover"
      >
        <span>
          Memento mori. <br />
          Remember you will die.
        </span>
      </A>

      <A
        href="/weather"
        class="relative inline-block h-full min-w-[91px] max-w-[91px] overflow-hidden border-r border-r-[#343434]"
      >
        <ImageLoader
          src={navWeatherBg()}
          width={90}
          height={35}
          className="absolute bottom-0 h-full w-full object-cover object-center brightness-90"
        />

        <div class="absolute left-0 top-0 flex h-full w-6 flex-col items-center justify-center bg-black/45">
          <span class="pb-0.5 font-tupa text-7 font-600 leading-[17px] text-[#d1d1d1]">
            {String(navStore.totalMemories).slice(
              0,
              String(navStore.totalMemories).length - 2,
            )}
          </span>
          <span class="pb-0.5 font-tupa text-[19px] font-600 leading-[16px] text-[#d1d1d1]">
            {String(navStore.totalMemories).slice(2)}
          </span>
        </div>

        <img
          src={
            navWeatherData().isDayTime
              ? WMOCODE[navWeatherData().icon].day.image
              : WMOCODE[navWeatherData().icon].night.image
          }
          width={21}
          height={21}
          class="absolute right-3.5 top-0.5 brightness-90"
          style={{
            filter: "drop-shadow(0px 2px 2px #000000)",
          }}
        />
        <span
          style={{
            "text-shadow": "0px 0px 6px #000000",
          }}
          class="absolute right-0.1 top-0.5 font-sfpro text-2.5 font-600 leading-2.5 text-white"
        >
          {Math.round(navWeatherData().temperature)}°
        </span>

        <div class="absolute bottom-0 right-0 w-[72px] overflow-hidden">
          <div class="flex">
            <div class="animate-marquee flex">
              <div class="min-w-[72px] text-nowrap px-3 font-sfpro text-3 font-600 leading-3 text-white">
                {navWeatherData()?.isDayTime
                  ? WMOCODE[navWeatherData()?.icon].day.description
                  : WMOCODE[navWeatherData()?.icon].night.description}
              </div>
            </div>
            <div class="animate-marquee flex">
              <div class="min-w-[72px] text-nowrap px-3 font-sfpro text-3 font-600 leading-3 text-white">
                {navWeatherData()?.isDayTime
                  ? WMOCODE[navWeatherData()?.icon].day.description
                  : WMOCODE[navWeatherData()?.icon].night.description}
              </div>
            </div>
          </div>
        </div>
      </A>

      <div
        class={`relative h-full min-w-[85px] max-w-[85px] ${navStore.playButton ? "bg-[url('/images/sunrise.webp')]" : "bg-[url('/images/sunset.webp')]"} cursor-pointer bg-cover transition-all`}
        onClick={handleAutoplay}
      >
        <Show when={navStore.listCount}>
          <div
            class={`absolute left-0 top-0 h-full bg-[url('/images/sunrise.webp')] bg-cover transition-all duration-300`}
            style={{
              width: `${Math.floor(((navStore.listCount + 1) / navStore.listContent.length) * 85)}px`,
              "box-shadow": "2px 0px 6px rgba(0, 0, 0, 0.6)",
              "border-right": "0.5px solid #000000",
            }}
          ></div>
        </Show>
      </div>

      <div class="absolute bottom-11 right-0 z-[99] flex flex-col justify-center overflow-hidden">
        <div class="h-11 w-fit translate-x-[86px] cursor-pointer transition-all hover:translate-x-0">
          <button
            class="relative ml-11 h-full w-[86px] border border-[#343434]"
            onClick={logout}
          >
            <img
              src="/images/input-left-corner.webp"
              class="absolute left-0 top-0 z-20 h-full w-auto"
            />
            <img
              src="/images/input-right-corner.webp"
              class="absolute right-0 top-0 z-20 h-full w-auto"
            />
            <div class="absolute bottom-0 left-0 right-0 top-0 z-10 bg-[url('/images/exit.webp')] bg-cover"></div>
          </button>
        </div>

        <div
          class="h-11 w-fit translate-x-[86px] cursor-pointer transition-all hover:translate-x-0"
          onClick={() => handleGetListContent(1)}
        >
          <div class="relative ml-11 h-full w-[86px] border border-[#343434]">
            <img
              src="/images/input-left-corner.webp"
              class="absolute left-0 top-0 z-20 h-full w-auto"
            />
            <img
              src="/images/input-right-corner.webp"
              class="absolute right-0 top-0 z-20 h-full w-auto"
            />
            <div
              class={`absolute bottom-0 left-0 right-0 top-0 z-10 bg-[url('/images/flower1.webp')] bg-cover text-center font-roslindale text-5.5 font-700 leading-[34px] ${navStore.listType === 1 ? "text-[#38E07B]" : "text-white"} `}
              style={{ "text-shadow": "1px 1px 1px #000000" }}
            >
              <Show
                when={navStore.todaySchedule.created_at}
                fallback={"Nothing"}
              >
                {navStore.todaySchedule.index1 + 1}
              </Show>
            </div>
          </div>
        </div>

        <div
          class="h-11 w-fit translate-x-[86px] cursor-pointer transition-all hover:translate-x-0"
          onClick={() => handleGetListContent(2)}
        >
          <div class="relative ml-11 h-full w-[86px] border border-[#343434]">
            <img
              src="/images/input-left-corner.webp"
              class="absolute left-0 top-0 z-20 h-full w-auto"
            />
            <img
              src="/images/input-right-corner.webp"
              class="absolute right-0 top-0 z-20 h-full w-auto"
            />
            <div
              class={`absolute bottom-0 left-0 right-0 top-0 z-10 bg-[url('/images/flower2.webp')] bg-cover text-center font-roslindale text-5.5 font-700 leading-[34px] ${navStore.listType === 2 ? "text-[#38E07B]" : "text-white"} `}
              style={{ "text-shadow": "1px 1px 1px #000000" }}
            >
              <Show
                when={navStore.todaySchedule.created_at}
                fallback={"Nothing"}
              >
                {navStore.todaySchedule.index2 + 1}
              </Show>
            </div>
          </div>
        </div>

        <div
          class="hidden h-11 w-fit translate-x-[86px] cursor-pointer transition-all hover:translate-x-0 sm:block"
          onClick={() => setLayoutStore("showLayout", !layoutStore.showLayout)}
        >
          <div class="relative ml-11 h-full w-[86px] border border-[#343434]">
            <img
              src="/images/input-left-corner.webp"
              class="absolute left-0 top-0 z-20 h-full w-auto"
            />
            <img
              src="/images/input-right-corner.webp"
              class="absolute right-0 top-0 z-20 h-full w-auto"
            />
            <div class="absolute bottom-0 left-0 right-0 top-0 z-10 bg-[url('/images/bookmark.webp')] bg-cover"></div>
          </div>
        </div>

        <div
          class="h-11 w-fit translate-x-[86px] cursor-pointer transition-all hover:translate-x-0"
          onClick={() => setVocabStore("showTranslate", true)}
        >
          <div class="relative ml-11 h-full w-[86px] border border-[#343434]">
            <img
              src="/images/input-left-corner.webp"
              class="absolute left-0 top-0 z-20 h-full w-auto"
            />
            <img
              src="/images/input-right-corner.webp"
              class="absolute right-0 top-0 z-20 h-full w-auto"
            />
            <div class="absolute bottom-0 left-0 right-0 top-0 z-10 bg-[url('/images/translate.webp')] bg-cover"></div>
          </div>
        </div>

        <div
          class="h-11 w-fit translate-x-[86px] cursor-pointer transition-all hover:translate-x-0"
          onClick={startOrStopCountdown}
          style={{ transform: showTimer() ? "translateX(0)" : "" }}
        >
          <div class="relative ml-11 h-full w-[86px] border border-[#343434] bg-black">
            <img
              src="/images/input-left-corner.webp"
              class="absolute left-0 top-0 z-20 h-full w-auto"
            />
            <img
              src="/images/input-right-corner.webp"
              class="absolute right-0 top-0 z-20 h-full w-auto"
            />
            <div
              class="absolute bottom-0 left-0 z-10 h-full bg-[url('/images/hourglass.webp')] bg-cover bg-left-top"
              style={{
                width: `${Math.floor((1 - minute() / 6) * 84)}px`,
                "border-right": "0.5px solid #000000",
              }}
            ></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
