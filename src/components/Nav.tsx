import { A, createAsync, useAction, useLocation } from "@solidjs/router";
import { Component, createEffect, createSignal, Show } from "solid-js";
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
  getListContent,
  getLocationList,
  handleCheckAndRender,
  getTodaySchedule,
  updateTodayScheduleLocal,
  getWordData,
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
import { VsSymbolColor, VsTarget } from "solid-icons/vs";
import { FiBookOpen } from "solid-icons/fi";
import { FaSolidFeather } from "solid-icons/fa";
import { createTimer } from "@solid-primitives/timer";

const Nav: Component<{
  changeBackground: () => {};
}> = (props) => {
  let audioRef: HTMLAudioElement | undefined;
  let intervalCountdown: NodeJS.Timeout | undefined;
  let intervalAutoplay: NodeJS.Timeout | undefined;
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
      createTimer(getBottomWeatherData, 1000 * 15 * 60, setInterval);
    }
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
    if (navStore.currentSchedule) {
      const listType = navStore.todaySchedule.findIndex(
        (item) => item.id === navStore.currentSchedule!.id,
      );
      const letter = listType === 0 ? "I" : "II";
      const newProgress = navStore.currentSchedule.count + 1;
      const notification = new Notification("Start Focusing", {
        icon: img,
        requireInteraction: true,
        body: `${letter}-${newProgress}`,
      });

      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
        audioRef.play();
      }
      notification.onclose = async () => {
        clearInterval(intervalCountdown);
        intervalCountdown = undefined;
        if (audioRef) {
          audioRef.pause();
        }
        if (location.pathname === "/vocab") {
          await handleGetListContentVocab(listType);
          handleAutoplay();
        } else {
          handleGetListContentQuiz(listType);
        }
      };
    } else {
      const notification = new Notification("hoctuvung3", {
        icon: img,
        requireInteraction: true,
      });
      if (audioRef) {
        audioRef.pause();
        audioRef.currentTime = 0;
        audioRef.play();
      }
      notification.onclose = () => {
        if (audioRef) {
          audioRef.pause();
        }
      };
    }
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
    setVocabStore("renderWord", undefined);
    await updateTodayScheduleLocal(todayDate);
    if (navStore.currentSchedule && navStore.currentSchedule.count < 9) {
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

  const handleGetListContentVocab = async (type: number) => {
    setNavStore("currentSchedule", undefined);
    setNavStore("currentSchedule", navStore.todaySchedule[type]);
    const data = await getListContent(navStore.todaySchedule[type].index);
    if (data) {
      setNavStore("listContent", data);
      setNavStore("playButton", true);
    }
  };

  const handleGetListContentQuiz = async (type: number) => {
    setNavStore("currentSchedule", undefined);
    setQuizStore("quizRender", undefined);
    setNavStore("currentSchedule", navStore.todaySchedule[type]);
    const data = await getListContent(navStore.todaySchedule[type].index);
    if (data) {
      setNavStore("listContent", arrayShuffle(data));
      setQuizStore("quizRender", navStore.listContent[0]);
    }
  };

  const handleGetListContent = (type: number) => {
    if (location.pathname === "/vocab") {
      handleGetListContentVocab(type);
      return;
    } else if (location.pathname === "/quiz") {
      handleGetListContentQuiz(type);
      return;
    } else {
      setNavStore("listContent", []);
      setNavStore("currentSchedule", undefined);
    }
  };

  // -------------------AUTOPLAY END-------------------- //

  const handleShowEditCurrentWord = async () => {
    const id =
      navStore.listContent.length > 0 && quizStore.quizRender
        ? quizStore.quizRender?.id
        : vocabStore.renderWord?.id;
    if (!id) return;
    const data = await getWordData(id);
    if (!data) return;
    setVocabStore("editWord", data);
    setVocabStore("showEdit", true);
  };

  return (
    <>
      <audio
        ref={audioRef}
        hidden
        src={
          import.meta.env.VITE_SUPABASE_URL +
          "/storage/v1/object/public/weather/Ophelia.mp3"
        }
      />
      <nav class="w-main h-[42px]">
        <div class="w-content flex h-11 items-center">
          <div class="flex h-full w-4 flex-col items-center justify-between rounded-1 bg-black/60 shadow-md shadow-black/30 backdrop-blur-md">
            <Show
              when={navStore.todaySchedule.length}
              fallback={
                <div class="flex flex-col justify-center text-center">
                  <span class="text-3 leading-4 text-white">N</span>
                  <span class="text-3 leading-3 text-white">N</span>
                </div>
              }
            >
              <div class="flex flex-col justify-center text-center">
                <span class="text-3 leading-4 text-white">
                  {navStore.todaySchedule[0].count}
                </span>
                <span class="text-3 leading-3 text-white">
                  {navStore.todaySchedule[1].count}
                </span>
              </div>
            </Show>

            <span class="w-full -translate-y-0.5 -rotate-90 rounded-1 bg-white/15 text-center text-2.5 leading-3.5 text-white">
              {format(todayDate, "eeeeee")}
            </span>
          </div>

          <A href="/vocab" activeClass="btn-nav-active" class="btn-nav">
            Danger is sweet.Dulce periculum.
          </A>

          <A href="/schedule" activeClass="btn-nav-active" class="btn-nav">
            Pecunia non olet.Money does not stink.
          </A>

          <A href="/quiz" activeClass="btn-nav-active" class="btn-nav">
            Memento mori.Rem'ber you will die.
          </A>

          <div class="ml-0.5 flex h-full flex-col items-center justify-center rounded-1 bg-black/60 px-0.5 text-white shadow-sm shadow-black/30 backdrop-blur-md">
            <span class="font-tupa text-6 font-600 leading-5">
              {Math.floor(navStore.totalMemories / 100) < 10
                ? "0" + Math.floor(navStore.totalMemories / 100)
                : Math.floor(navStore.totalMemories / 100)}
            </span>
            <span class="font-tupa text-6 font-600 leading-6">
              {navStore.totalMemories % 100 < 10
                ? "0" + (navStore.totalMemories % 100)
                : navStore.totalMemories % 100}
            </span>
          </div>

          <A
            href="/weather"
            class="relative ml-0.5 block h-full min-w-[90px] overflow-hidden rounded-1 shadow-sm shadow-black/30"
          >
            <img
              class="absolute left-0 top-0 h-full w-full object-cover brightness-90"
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

            <div class="absolute bottom-0 right-0 z-10 w-[90px] overflow-hidden">
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
            class={`relative ml-1 h-full min-w-[90px] max-w-[90px] cursor-pointer overflow-hidden rounded-1 shadow shadow-black/60`}
            onClick={handleAutoplay}
          >
            <div
              class={`absolute left-0 top-0 z-10 h-full w-full ${navStore.playButton ? "bg-[url('/images/sunrise.webp')]" : "bg-[url('/images/sunset.webp')]"} bg-cover`}
              style="background-size: 90px 36px;"
            ></div>

            <Show when={navStore.listCount}>
              <div
                class={`absolute left-0 top-0 z-30 h-full bg-[url('/images/sunrise.webp')] bg-cover transition-all duration-300`}
                style={{
                  width: `${Math.floor(((navStore.listCount + 1) / navStore.listContent.length) * 90)}px`,
                  "box-shadow": "2px 0px 6px rgba(0, 0, 0, 0.6)",
                  "border-right": "0.5px solid #000000",
                  "background-size": "90px 36px",
                }}
              ></div>
            </Show>
          </div>
        </div>
      </nav>

      <div
        class={`fixed bottom-[60px] ${layoutStore.showLayout ? "right-0 !-translate-x-[402px]" : "left-1/2 translate-x-[158px]"} z-50 flex flex-col items-center justify-center text-white sm:translate-x-[201px]`}
      >
        <button class="btn-nav-menu" onClick={logout}>
          <RiSystemLogoutCircleRLine size={15} />
        </button>

        <button
          class="btn-nav-menu-timer"
          onClick={() => handleGetListContent(0)}
        >
          <Show
            when={
              navStore.currentSchedule &&
              navStore.todaySchedule[0].id === navStore.currentSchedule!.id &&
              location.pathname === "/quiz"
            }
          >
            <span class="absolute bottom-0 z-10 h-full w-full bg-white/15"></span>
            <span
              class="absolute bottom-0 z-20 w-full bg-green-400/90"
              style={{
                height: `${(quizStore.quizCount / (navStore.listContent.length - 1)) * 100}%`,
              }}
            ></span>
          </Show>
          <Show
            when={
              navStore.currentSchedule &&
              navStore.todaySchedule[0].id === navStore.currentSchedule!.id &&
              location.pathname === "/vocab"
            }
          >
            <span class="absolute bottom-0 z-10 h-full w-full bg-green-400/90"></span>
          </Show>
          <Show
            when={navStore.todaySchedule.length}
            fallback={<RiSystemQuestionLine size={15} class="relative z-30" />}
          >
            <span class="relative z-30 text-3">
              {navStore.todaySchedule[0].index + 1}
            </span>
          </Show>
        </button>

        <button
          class="btn-nav-menu-timer"
          onClick={() => handleGetListContent(1)}
        >
          <Show
            when={
              navStore.currentSchedule &&
              navStore.todaySchedule[1].id === navStore.currentSchedule!.id &&
              location.pathname === "/quiz"
            }
          >
            <span class="absolute bottom-0 z-10 h-full w-full bg-white/15"></span>
            <span
              class="absolute bottom-0 z-20 w-full bg-green-400/90"
              style={{
                height: `${(quizStore.quizCount / (navStore.listContent.length - 1)) * 100}%`,
              }}
            ></span>
          </Show>
          <Show
            when={
              navStore.currentSchedule &&
              navStore.todaySchedule[1].id === navStore.currentSchedule!.id &&
              location.pathname === "/vocab"
            }
          >
            <span class="absolute bottom-0 z-10 h-full w-full bg-green-400/90"></span>
          </Show>
          <Show
            when={navStore.todaySchedule.length}
            fallback={<RiSystemQuestionLine size={15} class="relative z-30" />}
          >
            <span class="relative z-30 text-3">
              {navStore.todaySchedule[1].index + 1}
            </span>
          </Show>
        </button>

        <Show when={layoutStore.showLayout}>
          <Show
            when={layoutStore.showBookmark}
            fallback={
              <button
                class="btn-nav-menu"
                onClick={() => setLayoutStore("showBookmark", true)}
              >
                <FiBookOpen size={15} />
              </button>
            }
          >
            <button
              class="btn-nav-menu"
              onClick={() => setLayoutStore("showBookmark", false)}
            >
              <VsSymbolColor size={15} />
            </button>
          </Show>
        </Show>

        <button
          class="btn-nav-menu hidden sm:flex"
          onClick={() => setLayoutStore("showLayout", !layoutStore.showLayout)}
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
        <button class="btn-nav-menu" onClick={props.changeBackground}>
          <VsTarget size={15} />
        </button>

        <button class="btn-nav-menu" onClick={handleShowEditCurrentWord}>
          <FaSolidFeather size={15} />
        </button>

        <button
          class={`btn-nav-menu-timer ${showTimer() ? "bg-white/15" : ""}`}
          onClick={startOrStopCountdown}
        >
          <Show when={showTimer()}>
            <span
              class="absolute bottom-0 z-10 w-full bg-blue-600/90"
              style={{
                height: `${(minute() / 6) * 100}%`,
              }}
            ></span>
          </Show>
          <RiSystemHourglass2Line size={15} class="relative z-20" />
        </button>
      </div>
    </>
  );
};

export default Nav;
