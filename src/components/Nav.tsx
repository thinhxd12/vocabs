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
  vocabStore,
} from "~/lib/store";
import {
  getCurrentWeatherData,
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
import {
  RiDesignLayoutLeftFill,
  RiDesignLayoutRightFill,
  RiEditorTranslate,
  RiSystemHourglass2Line,
  RiSystemLogoutCircleRLine,
  RiSystemQuestionLine,
} from "solid-icons/ri";

const Nav: Component<{}> = (props) => {
  let audioRef: HTMLAudioElement | undefined;
  let intervalCountdown: NodeJS.Timeout | undefined;
  let intervalAutoplay: NodeJS.Timeout;
  let weatherInterval: NodeJS.Timeout | undefined;
  const todayDate = format(new Date(), "yyyy-MM-dd");
  const [showTimer, setShowTimer] = createSignal<boolean>(false);
  const [minute, setMinute] = createSignal<number>(6);
  const location = useLocation();
  const logout = useAction(logoutAction);
  const todaySchedule_data = createAsync(() => getTodaySchedule(todayDate));
  const locationList_data = createAsync(() => getLocationList());

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

  const getBottomWeatherData = async () => {
    const result = await getCurrentWeatherData({
      lat: navStore.defaultLocation.lat,
      lon: navStore.defaultLocation.lon,
    });
    result && setNavWeatherData(result);
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
    <nav class="relative h-[40px] w-full py-0.5">
      <audio
        ref={audioRef}
        hidden
        src={
          import.meta.env.VITE_SUPABASE_URL +
          "/storage/v1/object/public/weather/Ophelia.mp3"
        }
      />

      <div class="light-layout flex h-full w-full items-center justify-center rounded-1 p-0.5">
        <div class="flex h-full w-4 flex-col rounded-1 bg-black/15 shadow-[0_0_1px_0px_#00000078_inset]">
          <Show
            when={navStore.todaySchedule.created_at}
            fallback={
              <>
                <span class="w-full text-center text-3 leading-3 text-white">
                  N
                </span>
                <span class="mb-0.5 w-full text-center text-3 leading-3 text-white">
                  N
                </span>
              </>
            }
          >
            <span class="w-full text-center text-3 leading-3 text-white">
              {navStore.todaySchedule.time1}
            </span>
            <span class="mb-0.5 w-full text-center text-3 leading-3 text-white">
              {navStore.todaySchedule.time2}
            </span>
          </Show>
          <span class="h-3.5 w-4 -rotate-90 rounded-0.5 bg-white/20 text-center text-2.5 leading-3 text-white">
            {format(new Date(), "eeeeee")}
          </span>
        </div>

        <A href="/vocab" activeClass="btn-nav-active" class="btn-nav">
          <span>Danger is sweet. Dulce periculum.</span>
        </A>

        <A href="/schedule" activeClass="btn-nav-active" class="btn-nav">
          <span>Pecunia non olet. Money does not stink.</span>
        </A>

        <A href="/quiz" activeClass="btn-nav-active" class="btn-nav">
          <span>Memento mori. Remember you will die.</span>
        </A>

        <div class="ml-0.1 flex h-full flex-col items-center rounded-1 bg-black/45 px-0.5 text-white ring-0 ring-white/5">
          <span class="font-tupa text-5.5 font-600 leading-5">
            {String(navStore.totalMemories).slice(
              0,
              String(navStore.totalMemories).length - 2,
            )}
          </span>
          <span class="font-tupa text-5.5 font-600 leading-5">
            {String(navStore.totalMemories).slice(2)}
          </span>
        </div>

        <A
          href="/weather"
          class="relative mx-0.5 block h-full min-w-[81px] overflow-hidden rounded-1 shadow-xl"
        >
          <img
            class="absolute left-0 top-0 h-full w-full object-cover brightness-75"
            src={WMOCODE[navWeatherData().icon].textdescription}
          />

          <img
            src={
              navWeatherData().isDayTime
                ? WMOCODE[navWeatherData().icon].day.image
                : WMOCODE[navWeatherData().icon].night.image
            }
            width={21}
            height={21}
            class="absolute right-4 top-0.1 z-10 brightness-90"
            style={{
              filter: "drop-shadow(0px 2px 2px #000000)",
            }}
          />

          <span
            style={{
              "text-shadow": "0px 0px 6px #000000",
            }}
            class="absolute right-0.1 top-0.1 z-10 text-2.5 font-600 leading-2.5 text-white"
          >
            {Math.round(navWeatherData().temperature)}°
          </span>

          <div class="absolute bottom-0 right-0 z-10 w-[81px] overflow-hidden">
            <div class="flex">
              <div class="animate-marquee flex">
                <div class="min-w-[72px] text-nowrap px-3 text-2.5 font-600 leading-3 text-white">
                  {navWeatherData()?.isDayTime
                    ? WMOCODE[navWeatherData()?.icon].day.description
                    : WMOCODE[navWeatherData()?.icon].night.description}
                </div>
              </div>
              <div class="animate-marquee flex">
                <div class="min-w-[72px] text-nowrap px-3 text-2.5 font-600 leading-3 text-white">
                  {navWeatherData()?.isDayTime
                    ? WMOCODE[navWeatherData()?.icon].day.description
                    : WMOCODE[navWeatherData()?.icon].night.description}
                </div>
              </div>
            </div>
          </div>
        </A>

        <div
          class={`relative mr-0.1 h-full min-w-[81px] max-w-[81px] rounded-1 ${navStore.playButton ? "bg-[url('/images/sunrise.webp')]" : "bg-[url('/images/sunset.webp')]"} cursor-pointer bg-cover transition-all`}
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
      </div>

      <div class="absolute bottom-[45px] left-0 flex flex-col sm:-left-[40px]">
        <div class="dark-layout mx-auto flex flex-col items-center justify-center rounded-full p-1 text-white">
          <button class="btn-nav-menu" onClick={logout}>
            <RiSystemLogoutCircleRLine size={15} />
          </button>

          <button
            class={`btn-nav-menu-timer ${navStore.listType === 1 ? "bg-white/15" : ""}`}
            onClick={() => handleGetListContent(1)}
          >
            <Show when={navStore.listType === 1}>
              <span
                class="absolute bottom-0 z-10 w-full bg-green-400/60"
                style={{
                  height:
                    location.pathname === "/quiz"
                      ? `${(quizStore.quizCount / (quizStore.quizContent.length - 1)) * 100}%`
                      : "100%",
                }}
              ></span>
            </Show>
            <Show
              when={navStore.todaySchedule.created_at}
              fallback={
                <RiSystemQuestionLine size={15} class="relative z-30" />
              }
            >
              <span class="relative z-30 text-3">
                {navStore.todaySchedule.index1 + 1}
              </span>
            </Show>
          </button>

          <button
            class={`btn-nav-menu-timer ${navStore.listType === 2 ? "bg-white/15" : ""}`}
            onClick={() => handleGetListContent(2)}
          >
            <Show when={navStore.listType === 2}>
              <span
                class="absolute bottom-0 z-10 w-full bg-green-400/60"
                style={{
                  height:
                    location.pathname === "/quiz"
                      ? `${(quizStore.quizCount / (quizStore.quizContent.length - 1)) * 100}%`
                      : "100%",
                }}
              ></span>
            </Show>
            <Show
              when={navStore.todaySchedule.created_at}
              fallback={
                <RiSystemQuestionLine size={15} class="relative z-30" />
              }
            >
              <span class="relative z-30 text-3">
                {navStore.todaySchedule.index2 + 1}
              </span>
            </Show>
          </button>

          <button
            class="btn-nav-menu"
            onClick={() =>
              setLayoutStore("showLayout", !layoutStore.showLayout)
            }
          >
            <Show
              when={layoutStore.showLayout}
              fallback={<RiDesignLayoutLeftFill size={15} />}
            >
              <RiDesignLayoutRightFill size={15} />
            </Show>
          </button>
          <button
            class="btn-nav-menu"
            onClick={() =>
              setVocabStore("showTranslate", !vocabStore.showTranslate)
            }
          >
            <RiEditorTranslate size={15} />
          </button>
          <button
            class={`btn-nav-menu-timer ${showTimer() ? "bg-white/15" : ""}`}
            onClick={startOrStopCountdown}
          >
            <Show when={showTimer()}>
              <span
                class="absolute bottom-0 z-10 w-full bg-blue-600/60"
                style={{
                  height: `${(minute() / 6) * 100}%`,
                }}
              ></span>
            </Show>
            <RiSystemHourglass2Line size={15} class="relative z-20" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
