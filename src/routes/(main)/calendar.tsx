import {
  Component,
  Index,
  Show,
  Suspense,
  createSignal,
  onMount,
} from "solid-js";
import {
  getCalendarHistory,
  getScheduleData,
  getThisWeekScheduleIndex,
  submitNewSchedule,
  submitTodayReset,
} from "~/lib/api";
import { Motion, Presence } from "solid-motionone";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { format } from "date-fns";
import forms from "../../assets/styles/form.module.scss";
import buttons from "../../assets/styles/buttons.module.scss";
import styles from "./calendar.module.scss";
import { getUser } from "~/lib";
import { createAsync, useSubmission } from "@solidjs/router";
import { listStore, mainStore, setListStore, setMainStore } from "~/lib/mystore";
import HistoryCard from "~/components/historycard";
import { CalendarType } from "~/types";
import { OcX2 } from "solid-icons/oc";
import { BiSolidSave } from "solid-icons/bi";
import { chunk } from "~/utils";

let refEl: HTMLDivElement;
const todayDate = format(new Date(), "yyyy-MM-dd");

const Calendar: Component<{}> = (props) => {
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************

  const submitTodayResetAction = useSubmission(submitTodayReset);

  onMount(async () => {
    const index = await getThisWeekScheduleIndex(
      todayDate
    );
    if (index !== undefined) setMainStore("thisWeekIndex", index);

    if (mainStore.calendarList.length === 0) {
      const data = await getScheduleData(todayDate);
      data && setMainStore("calendarList", data);
    }
    if (mainStore.historyList.length === 0) {
      const data = await getCalendarHistory();
      data && setMainStore("historyList", data);
    }
  });

  const handleUpdateHistoryList = () => {
    setShowSetNewSchedule(false);
    setMainStore("calendarList", []);
    setTimeout(async () => {
      const data = await getScheduleData(todayDate);
      data && setMainStore("calendarList", data);
    }, 2000)
  };

  const handleUpdateTodaySchedule = () => {
    setShowTodayReset(false);
    setTimeout(async () => {
      setListStore("listToday", { ...listStore.listToday, ...submitTodayResetAction.result });
      const data = await getScheduleData(todayDate);
      data && setMainStore("calendarList", data);
    }, 2000)
  };

  // ---------------------POP UP---------------------------
  const [showTodayReset, setShowTodayReset] = createSignal<boolean>(false);
  const [showSetNewSchedule, setShowSetNewSchedule] =
    createSignal<boolean>(false);
  // ---------------------POP UP---------------------------

  onMount(() => {
    refEl.addEventListener("wheel", (event) => {
      event.preventDefault();
      refEl.scrollBy({
        left: event.deltaY < 0 ? -60 : 60,
      });
    });
  });

  const DateDiv: Component<{
    item: CalendarType;
  }> = (props) => {
    return (
      <>
        <Show
          when={(props.item.date as number) === new Date(todayDate).getDate() && (props.item.month as number) === new Date(todayDate).getMonth()}
          fallback={<Show when={(props.item.month as number) === new Date().getMonth()}
            fallback={<span class={styles.notThisMonth}>{props.item.date}</span>}
          >
            <span class={styles.thisMonth}>{props.item.date}</span>
          </Show>}
        >
          <span class={styles.toDayDate}
            onClick={() =>
              setShowTodayReset(!showTodayReset())
            }
          >{props.item.date}</span>
        </Show>
      </>
    );
  };

  return (
    <MetaProvider>
      <Title>📆</Title>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <div class={styles.calendar}>
        <div class={styles.calendarCard}>
          <div class={styles.calendarImage}>
            <img
              src={`images/main/${format(new Date(), "M")}.webp`}
              width={360}
              height={240}
            />
            <div
              class={styles.calendarImageContent}
              onClick={() => setShowSetNewSchedule(true)}
            >
              <p class={styles.setNewMonth}>{format(new Date(), "MMMM")}</p>
              <p class={styles.setNewWeek}>{format(new Date(), "yyyy")}</p>
              <p class={styles.setNewHistory}>
                <Show when={mainStore.thisWeekIndex >= 0} fallback={"Nothing"}>
                  {Number(mainStore.thisWeekIndex + 1) +
                    " - " +
                    Number(mainStore.thisWeekIndex + 200)}
                </Show>
              </p>
            </div>
            <div class={styles.calendarImageSign}>
              <p>050722-0</p>
              <p>050723-229</p>
              <p>050724-2071</p>
            </div>
          </div>
          <div class={styles.calendarDates}>
            <div class={styles.calendarDateTitle}>Sun</div>
            <div class={styles.calendarDateTitle}>Mon</div>
            <div class={styles.calendarDateTitle}>Tue</div>
            <div class={styles.calendarDateTitle}>Wed</div>
            <div class={styles.calendarDateTitle}>Thu</div>
            <div class={styles.calendarDateTitle}>Fri</div>
            <div class={styles.calendarDateTitle}>Sat</div>

            <Show
              when={mainStore.calendarList.length > 0}
              fallback={<div class={styles.calendarWeekLoading}>...</div>}
            >
              <Index each={mainStore.calendarList}>
                {(data, i) => {
                  if (data().time1 === -1) {
                    return <div class={styles.calendarDateWithoutTime}>
                      <DateDiv item={data()} />
                    </div>
                  }
                  else return <div class={styles.calendarDateWithTime}>
                    <span class={styles.calendarDateTimesHiden}>
                      <span>{data().time1}</span>
                      <span>{data().time2}</span>
                    </span>
                    <DateDiv item={data()} />
                    <span class={styles.calendarDateTimes}>
                      <span>{data().time1}</span>
                      <span>{data().time2}</span>
                    </span>
                  </div>
                }}
              </Index>
            </Show>
          </div>
        </div>

        <Suspense
          fallback={<div class={styles.calendarHistoryLoading}>...</div>}
        >
          <div class={styles.calendarHistory} ref={refEl}>
            <Index each={chunk(mainStore.historyList, 5).reverse()}>
              {(data, i) => {
                return <HistoryCard item={data()} />;
              }}
            </Index>
          </div>
        </Suspense>

        {/* showTodayReset */}
        <Presence>
          <Show when={showTodayReset()}>
            <Motion
              initial={{ height: "0px" }}
              animate={{ height: "81px" }}
              exit={{ height: "0px" }}
              transition={{ duration: 0.3, easing: "ease" }}
              class={styles.calendarDropdown}
            >
              <div class={styles.calendarDropdownHeader}>
                <div class={styles.calendarDropdownHeaderLeft}>
                  <p>Reset today schedule!</p>
                </div>
                <div class={styles.calendarDropdownHeaderRight}>
                  <button
                    class={buttons.buttonClose}
                    onclick={() => setShowTodayReset(false)}
                  >
                    <OcX2 size={15} />
                  </button>
                </div>
              </div>
              <div class={styles.calendarDropdownBody}>
                <Show when={listStore.listToday.created_at}
                  fallback={<div>No data available!</div>}
                >
                  <form
                    class={forms.formBody}
                    action={submitTodayReset}
                    method="post"
                  >
                    <div class={forms.calendarFormGroupContainer}>
                      <div class={forms.calendarFormInputGroup}>
                        <input
                          class={forms.calendarFormInput}
                          name="todayIndex1"
                          autocomplete="off"
                          type="number"
                          min={0}
                          value={listStore.listToday.time1}
                        />
                      </div>
                      <div class={forms.calendarFormInputGroup}>
                        <input
                          class={forms.calendarFormInput}
                          name="todayIndex2"
                          autocomplete="off"
                          type="number"
                          min={0}
                          value={listStore.listToday.time2}
                        />
                      </div>
                    </div>
                    <button
                      class={buttons.buttonSubmit}
                      type="submit"
                      onClick={handleUpdateTodaySchedule}
                    >
                      <BiSolidSave size={15} />
                      <span>Save</span>
                    </button>
                  </form>
                </Show>
              </div>
            </Motion>
          </Show>
        </Presence>

        {/* new schedule */}
        <Presence>
          <Show when={showSetNewSchedule()}>
            <Motion
              initial={{ height: "0px" }}
              animate={{ height: "81px" }}
              exit={{ height: "0px" }}
              transition={{ duration: 0.3, easing: "ease" }}
              class={styles.calendarDropdown}
            >
              <div class={styles.calendarDropdownHeader}>
                <div class={styles.calendarDropdownHeaderLeft}>
                  <p>Now create new schedule!</p>
                </div>
                <div class={styles.calendarDropdownHeaderRight}>
                  <button
                    class={buttons.buttonClose}
                    onclick={() => setShowSetNewSchedule(false)}
                  >
                    <OcX2 size={15} />
                  </button>
                </div>
              </div>
              <div class={styles.calendarDropdownBody}>
                <form
                  class={forms.formBody}
                  action={submitNewSchedule}
                  method="post"
                >
                  <button
                    class={buttons.buttonSubmit}
                    type="submit"
                    onClick={handleUpdateHistoryList}
                  >
                    <span>Create</span>
                    <span>🗓️</span>
                  </button>
                </form>
              </div>
            </Motion>
          </Show>
        </Presence>

        <div class={styles.calendarQuote}>
          The tree that is supposed to grow to a proud height can dispense with
          bad weather and storms. Whether misfortune and external resistance,
          some kinds of hatred, jealousy, stubbornness, mistrust, hardness,
          avarice, and violence do not belong among the favorable conditions
          without which any great growth. The poison of which weaker natures
          perish strengthens the strong — nor do they call it poison.
        </div>
      </div>
    </MetaProvider>
  );
};

export default Calendar;
