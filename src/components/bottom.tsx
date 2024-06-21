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
  getListContent,
  getTodayData,
  getTotalMemories,
  handleCheckWord,
  updateTodayData,
  updateTodaySchedule,
} from "~/lib/api";
import { Motion, Presence } from "solid-motionone";
import { logout } from "~/lib";
import { OcHourglass2 } from "solid-icons/oc";
import { clickOutside } from "~/utils";

let intervalCountdown: NodeJS.Timeout;
let intervalAutoplay: NodeJS.Timeout;
const [showMenu, setShowMenu] = createSignal<boolean>(false);
const [showTimer, setShowTimer] = createSignal<boolean>(false);
const [minute, setMinute] = createSignal<number>(6);

const Bottom: Component<{}> = () => {
  let audio: HTMLAudioElement | null;
  const todayDate = format(new Date(), "yyyy-MM-dd");

  onMount(async () => {
    const data = await Promise.all([
      getTotalMemories(),
      getTodayData(todayDate),
    ]);
    setMainStore("totalMemories", data[0]!);
    setListStore("listToday", data[1]!);
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
      audio?.pause();
      audio = null;
      handleAutoplay();
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
    handleGetListContent(listStore.listType);
    setMinute(6);
    setShowTimer(false);
    clearInterval(intervalCountdown);
    showDesktopNotification();
    audio = new Audio();
    audio.src = "/sounds/09_Autumn_Mvt_3_Allegro.mp3";
    audio.play();
  };

  const stopCountdown = () => {
    setShowTimer(false);
    clearInterval(intervalCountdown);
    setMinute(6);
  };

  // -------------------COUNTDOWN END-------------------- //
  // -------------------AUTOPLAY START-------------------- //
  const handleRenderWord = () => {
    handleCheckWord(listStore.listContent[listStore.listCount]);
    setListStore("listCount", listStore.listCount + 1);
  };

  const startAutoplay = async () => {
    clearInterval(intervalAutoplay);
    const newProgress =
      listStore.listType === 1
        ? listStore.listToday.time1 + 1
        : listStore.listToday.time2 + 1;
    if (listStore.listCount === 0) {
      await updateTodaySchedule(
        listStore.listType,
        newProgress,
        listStore.listToday.date
      );
      updateTodayData(todayDate);
    }

    handleRenderWord();
    intervalAutoplay = setInterval(() => {
      if (listStore.listCount < listStore.listContent.length) {
        handleRenderWord();
      } else {
        endAutoplay();
      }
    }, 7500);
  };

  const pauseAutoplay = () => {
    clearInterval(intervalAutoplay);
  };

  const endAutoplay = () => {
    clearInterval(intervalAutoplay);
    setListStore("listCount", 0);
    setListStore("listButton", true);
    const currentProgress =
      listStore.listType === 1
        ? listStore.listToday.time1
        : listStore.listToday.time2;
    if (currentProgress < 9) {
      startCountdown();
    }
  };

  const handleAutoplay = () => {
    if (listStore.listButton) {
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

  const close = () => {
    setShowMenu(false);
  };

  return (
    <div class={styles.bottom}>
      <div class={styles.bottomBar} use:clickOutside={close}>
        <div class={styles.bottomIndex}>
          <div class={styles.bottomIndexNums}>
            <Show
              when={listStore.listToday?.date}
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
          <small>Danger is sweet</small>
          <span>Dulce periculum</span>
        </A>
        <A
          href="/calendar"
          activeClass={styles.bottomBtnActive}
          class={styles.bottomBtn2}
        >
          <small>Money does not stink</small>
          <span>Pecunia non olet</span>
        </A>

        <div
          class={styles.bottomCenterBox}
          onClick={() => setShowMenu(!showMenu())}
        >
          <button class={styles.bottomCenter}>
            <span>{Math.floor(mainStore.totalMemories / 100)}</span>
            <small>
              {mainStore.totalMemories % 100 < 10
                ? "0" + (mainStore.totalMemories % 100)
                : mainStore.totalMemories % 100}
            </small>
          </button>
        </div>

        <A
          href="/weather"
          activeClass={styles.bottomBtnActive}
          class={styles.bottomBtn3}
        >
          <small>God from the machine</small>
          <span>Deus ex machina</span>
        </A>

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
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    transition={{ duration: 0.3, easing: "ease" }}
                    src="/images/main/sunset.webp"
                    class={styles.bottomImage}
                  />
                }
              >
                <Motion.img
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{ duration: 0.3, easing: "ease" }}
                  src="/images/main/sunrise.webp"
                  class={styles.bottomImage}
                />
              </Show>
            </Presence>
            <Show when={listStore.listCount}>
              <Motion.div
                class={styles.bottomImageProgress}
                animate={{
                  width: `${listStore.listCount * 2}%`,
                }}
              ></Motion.div>
            </Show>
          </div>
        </Show>
      </div>

      <div class={styles.bottomMenu}>
        <Presence>
          <Show when={showMenu()}>
            <Motion.div
              class={styles.bottomMenuBtns}
              initial={{
                opacity: 0,
                y: 150,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 150,
              }}
              transition={{ duration: 0.2, easing: "linear" }}
            >
              <button
                class={
                  listStore.listType === 1
                    ? buttons.buttonMenuActive
                    : buttons.buttonMenu
                }
                onClick={() => {
                  handleGetListContent(1);
                  setShowMenu(false);
                }}
              >
                <div class={buttons.buttonMenuOrnament}></div>
                <img
                  alt="hourglass"
                  src="/images/main/flower1.webp"
                  width={54}
                  height={25}
                />
                <span>{listStore.listToday.index1}</span>
              </button>
              <button
                class={
                  listStore.listType === 2
                    ? buttons.buttonMenuActive
                    : buttons.buttonMenu
                }
                onClick={() => {
                  handleGetListContent(2);
                  setShowMenu(false);
                }}
              >
                <div class={buttons.buttonMenuOrnament}></div>
                <img
                  alt="hourglass"
                  src="/images/main/flower2.webp"
                  width={54}
                  height={25}
                />
                <span>{listStore.listToday.index2}</span>
              </button>
              <button
                class={buttons.buttonMenu}
                onClick={() => {
                  setMainStore("showBookmark", true);
                  setShowMenu(false);
                }}
              >
                <div class={buttons.buttonMenuOrnament}></div>
                <img
                  alt="hourglass"
                  src="/images/main/bookmark.webp"
                  width={54}
                  height={25}
                />
              </button>
              <button
                class={buttons.buttonMenu}
                onClick={() => {
                  setMainStore("showTranslate", true);
                  setShowMenu(false);
                }}
              >
                <div class={buttons.buttonMenuOrnament}></div>
                <img
                  alt="hourglass"
                  src="/images/main/translate.webp"
                  width={54}
                  height={25}
                />
              </button>
              <button
                class={buttons.buttonMenu}
                onClick={() => {
                  startCountdown();
                  setShowMenu(false);
                }}
              >
                <div class={buttons.buttonMenuOrnament}></div>
                <img
                  alt="hourglass"
                  src="/images/main/hourglass.webp"
                  width={54}
                  height={25}
                />
              </button>
              <button class={buttons.buttonMenu} onClick={logoutAction}>
                <div class={buttons.buttonMenuOrnament}></div>
                <img
                  alt="hourglass"
                  src="/images/main/exit.webp"
                  width={54}
                  height={25}
                />
              </button>
            </Motion.div>
          </Show>
        </Presence>
        <Presence>
          <Show when={showTimer()}>
            <Motion.button
              class={buttons.buttonTimer}
              onClick={stopCountdown}
              initial={{
                opacity: 0,
                bottom: "-27px",
              }}
              animate={{
                opacity: 1,
                bottom: "1px",
              }}
              exit={{
                opacity: 0,
                bottom: "-27px",
              }}
              transition={{ duration: 0.3, easing: "ease-in-out" }}
            >
              <OcHourglass2 size={11} />
              <Motion.div
                class={styles.buttonTimerOverlay}
                animate={{ height: `${(1 - minute() / 6) * 100}%` }}
              ></Motion.div>
            </Motion.button>
          </Show>
        </Presence>
      </div>
    </div>
  );
};

export default Bottom;
