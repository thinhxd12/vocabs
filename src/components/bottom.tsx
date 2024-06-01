import { A, createAsync, useAction } from "@solidjs/router";
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
  updateTodaySchedule,
} from "~/lib/api";
import { BiSolidHourglassTop } from "solid-icons/bi";
import { BsTranslate } from "solid-icons/bs";
import { ImBooks } from "solid-icons/im";
import { Motion, Presence } from "solid-motionone";
import { logout } from "~/lib";
import { OcHourglass2 } from "solid-icons/oc";

let intervalCountdown: NodeJS.Timeout;
let intervalAutoplay: NodeJS.Timeout;
let audioRef: HTMLAudioElement;
const [showMenu, setShowMenu] = createSignal<boolean>(false);
const [showTimer, setShowTimer] = createSignal<boolean>(false);
const [minute, setMinute] = createSignal<number>(6);

const Bottom: Component<{}> = () => {
  const todayDate = format(new Date(), "yyyy-MM-dd");

  // onMount(async () => {
  //   const data = await getTotalMemories();
  //   if (data) {
  //     setMainStore("totalMemories", data);
  //   }
  // });

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
      setMainStore("audioSrc", "");
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
    setMainStore("audioSrc", "/sounds/09_Autumn_Mvt_3_Allegro.mp3");
    showDesktopNotification();
  };

  const stopCountdown = () => {
    setShowTimer(false);
    clearInterval(intervalCountdown);
    setMinute(6);
  };

  // -------------------COUNTDOWN END-------------------- //
  // -------------------AUTOPLAY START-------------------- //
  const updateTodayData = async () => {
    const data = await getTodayData(todayDate);
    if (data) {
      setListStore("listToday", data);
    }
  };

  const handleRenderWord = () => {
    setMainStore("audioSrc", "");
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
      updateTodayData();
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

  return (
    <div class={styles.bottom}>
      <audio
        hidden
        ref={audioRef}
        src={mainStore.audioSrc}
        onloadeddata={() => audioRef.play()}
        onended={() => setMainStore("audioSrc", "")}
      ></audio>
      <div class={styles.bottomBar}>
        <div class={styles.bottomIndex}>
          <div class={styles.bottomIndexNums}>
            <Show
              when={listStore.listToday.date}
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
            <small>{mainStore.totalMemories % 100}</small>
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
                    src="/images/main/sunset.jpg"
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
                  src="/images/main/sunrise.jpg"
                  class={styles.bottomImage}
                />
              </Show>
            </Presence>
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
                    ? `${buttons.buttonMenuWordlist} ${buttons.buttonMenuWordlistActive}`
                    : buttons.buttonMenuWordlist
                }
                onClick={() => {
                  handleGetListContent(1);
                  setShowMenu(false);
                }}
              >
                <span>I</span>
                <small>{listStore.listToday.time1}</small>
              </button>
              <button
                class={
                  listStore.listType === 2
                    ? `${buttons.buttonMenuWordlist} ${buttons.buttonMenuWordlistActive}`
                    : buttons.buttonMenuWordlist
                }
                onClick={() => {
                  handleGetListContent(2);
                  setShowMenu(false);
                }}
              >
                <span>II</span>
                <small>{listStore.listToday.time2}</small>
              </button>
              <button
                class={buttons.buttonMenu}
                onClick={() => {
                  setMainStore("showBookmark", true);
                  setShowMenu(false);
                }}
              >
                <ImBooks size={18} />
              </button>
              <button
                class={buttons.buttonMenu}
                onClick={() => {
                  setMainStore("showTranslate", true);
                  setShowMenu(false);
                }}
              >
                <BsTranslate size={15} />
              </button>
              <button
                class={buttons.buttonMenu}
                onClick={() => {
                  startCountdown();
                  setShowMenu(false);
                }}
              >
                <BiSolidHourglassTop size={16} />
              </button>
              <button class={buttons.buttonMenu} onClick={logoutAction}>
                E
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
