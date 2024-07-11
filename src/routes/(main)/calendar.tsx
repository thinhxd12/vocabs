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
  updateTodayData,
} from "~/lib/api";
import { Motion, Presence } from "solid-motionone";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { format } from "date-fns";
import forms from "../../assets/styles/form.module.scss";
import buttons from "../../assets/styles/buttons.module.scss";
import styles from "./calendar.module.scss";
import { getUser } from "~/lib";
import { createAsync } from "@solidjs/router";
import { listStore, mainStore, setMainStore } from "~/lib/mystore";
import HistoryCard from "~/components/historycard";
import { CalendarType } from "~/types";
import { OcX2 } from "solid-icons/oc";

let refEl: HTMLDivElement;
const todayDate = format(new Date(), "yyyy-MM-dd");

const Calendar: Component<{}> = (props) => {
  // ***************check login**************
  const user = createAsync(() => getUser(), { deferStream: true });
  // ***************check login**************
  const [monthIndex, setMonthIndex] = createSignal<number>(-1);

  const getAllDataCalendar = async () => {
    if (mainStore.calendarList.length === 0) {
      const data = await Promise.all([
        getScheduleData(todayDate),
        getCalendarHistory(),
      ]);

      data[0] && setMainStore("calendarList", data[0]);
      if (data[1]) {
        setMainStore("historyList", data[1]);
        setMonthIndex(data[1]![0].data[0].index);
      }

      const index = await getThisWeekScheduleIndex(
        todayDate,
        mainStore.historyList[0]
      );
      if (index !== undefined) setMainStore("thisWeekIndex", index);
    }
  };

  onMount(() => {
    getAllDataCalendar();
  });

  const handleUpdateHistoryList = () => {
    setMainStore("calendarList", []);
    setMainStore("historyList", []);
    setMainStore("thisWeekIndex", -9);
    setShowSetNewSchedule(false);
    getAllDataCalendar();
  };

  const handleUpdateTodaySchedule = async () => {
    await updateTodayData(todayDate);
    setShowTodayReset(false);
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

  const IndexElement: Component<{
    date: CalendarType;
  }> = (props) => {
    return (
      <>
        <Show
          when={(props.date.time1 as number) >= 0}
          fallback={<div class={styles.dateTimeIndexDot}></div>}
        >
          <div>{props.date.time1}</div>
          <div>{props.date.time2}</div>
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
              src={`/images/main/${format(new Date(), "M")}.webp`}
              width={360}
              height={240}
            />
            <div class={styles.calendarImageContent}>
              <p class={styles.setNewMonth}>{format(new Date(), "MMMM")}</p>
              <p
                class={styles.setNewWeek}
                onClick={() => setShowSetNewSchedule(true)}
              >
                {format(new Date(), "yyyy")}
              </p>
              <p class={styles.setNewHistory}>
                <Show when={mainStore.thisWeekIndex >= 0} fallback={"NaN"}>
                  {Number(mainStore.thisWeekIndex + 1) +
                    " - " +
                    Number(mainStore.thisWeekIndex + 200)}
                </Show>
              </p>
            </div>
            <div class={styles.calendarImageSign}>
              <p>0 05-07-22</p>
              <p>229 05-07-23</p>
              <p>2271 05-07-24</p>
            </div>
          </div>
          <div class={styles.calendarDates}>
            <div class={styles.calendarWeek}>
              <div class={styles.calendarWeekTitle}>Sun</div>
              <div class={styles.calendarWeekTitle}>Mon</div>
              <div class={styles.calendarWeekTitle}>Tue</div>
              <div class={styles.calendarWeekTitle}>Wed</div>
              <div class={styles.calendarWeekTitle}>Thu</div>
              <div class={styles.calendarWeekTitle}>Fri</div>
              <div class={styles.calendarWeekTitle}>Sat</div>
            </div>

            <Show
              when={mainStore.calendarList.length > 0}
              fallback={<div class={styles.calendarWeekLoading}>...</div>}
            >
              <Index each={mainStore.calendarList}>
                {(data, i) => {
                  return (
                    <div class={styles.calendarWeek}>
                      <Index each={data()}>
                        {(item, n) => {
                          return (
                            <div class={styles.calendarDay}>
                              <Show when={"time1" in item()}>
                                <div class={styles.dateTimeIndexHidden}></div>
                              </Show>

                              <Show
                                when={item().month === new Date().getMonth()}
                                fallback={
                                  <div class={styles.dateText}>
                                    {item().date}
                                  </div>
                                }
                              >
                                <Show
                                  when={
                                    item().month === new Date().getMonth() &&
                                    item().date === new Date().getDate()
                                  }
                                  fallback={
                                    <div class={styles.dateTextThisMonth}>
                                      {item().date}
                                    </div>
                                  }
                                >
                                  <div
                                    class={`${styles.dateTextThisMonth} ${styles.todayDate}`}
                                    onClick={() =>
                                      setShowTodayReset(!showTodayReset())
                                    }
                                  >
                                    {item().date}
                                  </div>
                                </Show>
                              </Show>

                              <Show when={"time1" in item()}>
                                <Show
                                  when={item().date === new Date().getDate()}
                                  fallback={
                                    <div
                                      class={
                                        (item().time1 as number) > 0
                                          ? `${styles.dateTimeIndex} ${styles.dateTimeIndexDone}`
                                          : styles.dateTimeIndex
                                      }
                                    >
                                      <IndexElement date={item()} />
                                    </div>
                                  }
                                >
                                  <div
                                    class={`${styles.dateTimeIndex} ${styles.dateTimeIndexToday}`}
                                  >
                                    <IndexElement date={item()} />
                                  </div>
                                </Show>
                              </Show>
                            </div>
                          );
                        }}
                      </Index>
                    </div>
                  );
                }}
              </Index>
            </Show>
          </div>
        </div>

        <Suspense
          fallback={<div class={styles.calendarHistoryLoading}>...</div>}
        >
          <div class={styles.calendarHistory} ref={refEl}>
            <Index each={mainStore.historyList}>
              {(data, i) => {
                return <HistoryCard item={data().data} />;
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
                    Submit
                  </button>
                </form>
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
                  <p>Set new schedule!</p>
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
                  <div class={forms.calendarFormGroupContainer}>
                    <div class={forms.calendarFormInputGroup}>
                      <input
                        class={forms.calendarFormInput}
                        name="startDay"
                        autocomplete="off"
                        type="date"
                      />
                    </div>
                    <input hidden name="startMonthIndex" value={monthIndex()} />
                  </div>
                  <button
                    class={buttons.buttonSubmit}
                    type="submit"
                    onClick={handleUpdateHistoryList}
                  >
                    Submit
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
