import { Component, Index, Show, createSignal, onMount } from "solid-js";
import { DEFAULT_CORS_PROXY } from "~/utils";
// import { FeedEntry, extract } from "@extractus/feed-extractor";
import { differenceInDays, differenceInHours } from "date-fns";

const RSS: Component<{}> = (props) => {
  const rssSource = [
    {
      id: 0,
      img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAPFBMVEVHcEwYGBgTExMSEhITExMSEhISEhISEhISEhISEhIaGhoSEhISEhISEhIUFBQSEhIUFBQTExMSEhISEhKEQ9J+AAAAFHRSTlMADkynKmHI4tT/BvG6ITywGYyZe8Y/Bk0AAADpSURBVHgBxdLBbkURFIXhBbBwgPd/10au2xbttP0GJvtPZAf8EyGVxkkY67wya2BpsAuenGIyAYCje/a55ZdoI0m5BZmnIzCkK8lHfvJ1CyS9BoRulovBpvoOPK0FwBTrXMo46I4RFYBhIHLGTSR66EZ2oFbcLDmy5a9BJ30NK5ADJx3JAvEKcmTDoc3JCjLniV0i2VYwa6+xcyTVO8BIAMIV2BWsLeS5JGMO34JHnVuSZXbteQWpHI81NWUwVSHU8VrCc7J1fT/PqLHRXJIqliQHDoObiEuOXNZdF9351gV+JnsppRv8rQ8S0A3fpn5NfAAAAABJRU5ErkJggg==",
      link: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
      options: {
        getExtraEntryFields: (entryData: any) => {
          const mediaContent = entryData["media:content"];
          const mediaUrl = mediaContent ? mediaContent["@_url"] : null;
          return { mediaUrl };
        },
      },
    },
    {
      id: 1,
      img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACwklEQVR4AbzUAQaEQBgF4CjUiI4QaA7QASIEhACCiBBdJSBAutECukUBCFnePpld7Ca1pccHmfH+fox2IA6l1NKDRnoqo/rWUqrOXhZJHU2EnSZ1xztTbFFNM+FPM9Uk6FA86gkX6Y9sw6eBcLGBfNqMt1l+3rC1CXHl2jf0ZNFPasJN6rXVz4SbzCTpk27PxSAI0DTNwjCMk0OwU8XZ+8hUVYV3TNM8O8CkurWUoCx/FkURyrJEkiSwbXt1ANd1kWUZ8jyHlHK1RAiBOI5RFAXCMISu699nUnrxVQYYCEVBFBUEEQSqpIQIRIK0gVCUkghEQEBrSFFaQ5uoUgpAS4gIIKqqkFK/bu7w8p++f3go79+5Zmbmyf4GTyKRwHq9hpnj8YhCofBn4Ha7QfH5fDAYDLSs5HI57HY7mFmtVojH42YDjC2PCHw+nwSz4vV6IZ1OiwE7aIJaqVQKz+cTVuz3e3i9XmWAseUlQ6/XA3m/32g0GvB4PMhms7heryDz+VwzMJ1OEYlE5MxmM5UJlkP95rfUoJZoUpt0u11lgLHlOcVyuQSZTCZanTqdDsjj8RARRTgc/t0JhUJQ1Go13O93kHa7rWlVq1U0m02Uy2X1n/FnYDQaaR9RRFGv16EIBoPqDhtSM0CzpNVqaVqlUkmymM/nNQN/JWDXsvszmQwulwsUsVhM0kyGwyH8fr8EH4/HWgkWiwXI+XyWiXK5XKKpStDv97US/JrwcDjADo4oG82uCdXCMgwDVpxOJwQCAa0Jbcdwu91qBjhqDCSZsBlDppvBzGw2GySTSX0M7RYRl0c0GkWlUpHjcDjUPaaaS8h2EbndbhSLRWleltPpdFouot8q/o6eGGonH0plRGc8F7XlS//qWHWAGySYgJOOTTKuAW2UDmizfAh0TBCAi4pdM04GCoAqBZ1TNUKGD3j3HAAm9vfIGp6+kgAAAABJRU5ErkJggg==",
      link: "https://abcnews.go.com/abcnews/usheadlines",
      options: {
        getExtraEntryFields: (entryData: any) => {
          const mediaThumbnail = entryData["media:thumbnail"];
          const mediaUrl = mediaThumbnail
            ? mediaThumbnail[mediaThumbnail.length - 1]["@_url"]
            : null;
          return { mediaUrl };
        },
      },
    },
    {
      id: 2,
      img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAjUlEQVR4AWP4Q2NAZQtGLRi14O/fv/8pBkBDaGQBAhCy4PmK/6dY/5+VRUcnGCD6GXiDpXXi0RCDdMjEaSuJ88HTpUCzgHago2MwCxicGcSD0BGD94SpK6hlgRvQveiIwRvoA1pbMGrBqAWjFgz+ouIE3AJvBulwBhlUxOBPrA8oBzSvcIZYnTxqwagFAH35Im3PxoFeAAAAAElFTkSuQmCC",
      link: "https://www.scmp.com/rss/91/feed",
      options: {
        getExtraEntryFields: (entryData: any) => {
          const mediaThumbnail = entryData["media:thumbnail"];
          const mediaUrl = mediaThumbnail ? mediaThumbnail["@_url"] : null;
          return { mediaUrl };
        },
      },
    },
    {
      id: 3,
      img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAk1BMVEUAM2YAJl+Dl67////U2+MAIl1ddZUALGIAMWUAH12sucgAOWyls8QeRnNXc5RhgKDm6/D4+vxObI+Mobfy9PdBY4kAKmEANWm9yNQAFVfCztprgZ49W4IqTXgAL2RRb5EAJF4UP28AKWF0j6sAGlpthaEmS3fu8fWcq70AA1M4XYTb4uiXp7oADVaZDyzFABTCABeV82iNAAABw0lEQVR4AVRO2aKqIBQFFyoiGiSRI5GmcNPz/7937Tx19jzvRU6iCcBSmgHIcvJNPM8LASQlZ4AsyB+q6kutoK/XBjA3kvPvZl3Zu0bbpT0wjJfL5L7aOc+vwFCcRhTOlo/L9P2XJjB330M96VmebV1z60hufy+k7Xn1ZpYlyx5unh7T8zGM6XWYPt1ZIXu1RgAw5ceKFaYGtrPJKwQ6Qkmw2EiESUG00EjSc9HWEP8E1og+qRVUyqDfBrv/XPUHrhvYjwTQBijKgLcC8794+tBJjC+JdrkxqHnHLgEkn+5sZAlZpBJH5x/nPegGeoWuHHEbxhju3C79SjkdJRO3pV1+mn7NiR3CLLKU3x3lZVnefWEdnWc+PouapCIuR5A/gskQTNwl36NTK4NOalKw9x6BdxtaSJmx/QZ20wKrEOdPlsQDYK0SuklcNA1Usx/Y45aTMfZFRIRWAmGfBqjeqNYLg5CT9cheERODak1VusngErCuR9mjIkvifcRWn01oLV87NobpgMFOyVFyO4jKNnERQqxFIt0iS7uK4+nINSck95zP1HrvLZkpt5SQ2VNOiLv/H27AoIcHMOjjAQwGeABeSQC54j5920mVwwAAAABJRU5ErkJggg==",
      link: "https://moxie.foxnews.com/google-publisher/latest.xml",
      options: {
        getExtraEntryFields: (entryData: any) => {
          const mediaContent = entryData["media:content"];
          const mediaUrl = mediaContent ? mediaContent["@_url"] : null;
          return { mediaUrl };
        },
      },
    },
    {
      id: 4,
      img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAZlBMVEUYFxYQDg0GBAALCggVFBNTUlF0dHRqamlubm5mZmYdHBu+vr3////v7+/s7Ow1NTQSERAAAACUlJRBQD/MzMz19fRPT048OzsiISDV1NTq6uovLi2ioaHg4OAtLCsoJiVHRkWMjItuM4hgAAAAyUlEQVR4AcXQBRKDMBBA0YQYThZ3uf8lu6nvkPHKx3lo2FfjwXtCElPauEIMN1H8jiJKUleW55nbFpYolM4qAKHqtEEk2iLmHWcS+qHpKPIKnzde74CoqSjabkScLJNC9nMhKRYL4mrlpmN0RnFyuAnQdY9Ek9uA2FbRUsdn7BHTYchSRP+d3bYPFN/euXIw9J1vX1tY2d8GlsTdf+YVZ5Kf7DZCWSuYL6HwY5sIvAZzis0QeEwPSNhw2BPKYq+u7ZVkZ+X3LPtzF3mnDlewk4KhAAAAAElFTkSuQmCC",
      link: "https://www.forbes.com/real-time/feed2/",
      options: {
        getExtraEntryFields: (entryData: any) => {
          const mediaContent = entryData["media:content"]["media:thumbnail"];
          const mediaUrl = mediaContent ? mediaContent["@_url"] : null;
          return { mediaUrl };
        },
      },
    },
    {
      id: 5,
      img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAMFBMVEUAAAACJ2IDKGAEJ2EFKWIHJ18AJ18DJ2ErSnpGYYtjeZ3Ezdrp7PF+ka6jscX////L9Dq8AAAACHRSTlMBYJnh/yAggEFSUK0AAAEaSURBVHgBTJElVEVBEIYHj2jHqTj12Y879IP1g/aEQ8MLXnB3l4L39OprVHyYuXbut/6t75JBWHpBIC+OHBoKoGSRRTgsOsggWvuHlgEEmklpA8rPX8ZHQ0CRNaDs6qcX1Rwyh0QAQf4CoDZHRI/08T2AUV6GX2YAWyxVoFzzZtmz7I25F0JQRApFoob5G0qliBxKQhXzH5SyXsBHGZhj/oWNnwoQdIuAiHfmL5cArtwCjqhYFQA4U8qlOHWvoZsti7C3tYXfPpgtfNSol/12hFcfVC7niBSKAoJStUUdUYbO2bdEqf2En4YYN54wqkCe6KdXxAkCdSQ0AhVXj71zJ0AhCToEmFkGjAFKDCxSnM+GEsgkh/8hJQcA9drEYU3H20EAAAAASUVORK5CYII=",
      link: "https://www.theguardian.com/us-news/rss",
      options: {
        getExtraEntryFields: (entryData: any) => {
          const mediaContent = entryData["media:content"];
          const mediaUrl = mediaContent
            ? mediaContent[mediaContent.length - 1]["@_url"]
            : null;
          return { mediaUrl };
        },
      },
    },
    {
      id: 6,
      img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACB0lEQVR4Ae3TA4xkWRiA0bVtK1jbwdq2bW+wtm2Mbdu2bdu2Gv+cSaom3TepcVxfcsKHy922o3z58h3Na/zBMxxKthN5i994lAPZpR1HEwoJNlCZgzmLbhQTrOWvXT2ID4jEeh7kByKxhnvZZZUhSL3NFywiEm+yQ+3PU/zPH1zFtwSp17iRiUQJRTzDLfzDv9zNXmyxPfiCNUTGJD5iNulPHuUnIjGcj5lHZCzlObbY+cwkEi1oRpSwgqv5iEj8Ry8iMZTjydk9bCASy6jKKiJjKifzIAVExhwqsI5ILOZicnYeMwhSdelOZPTmQC5hMZFRi1YEqUEcR8724H1WEYlZNKSIoBa7czxjCFbxHwuJxEIeY4sdzBm8xEgiUYuxBF+zqf1oS9CZukSiN49wMvvnmvlTdGciLfiGOqwhMkbThvSeVyb4jwlExnLK8w0dmEhLbqBUtzGfKGEJVfiacQQFNGA+z5DtLyZQg2KCoXxGDVYQJYzmPEp9IEgV05PPaUgBfWnDjWR7l4r0YT3V+ZyBRA6vsLl/iS2Yyz98y1iqcDLZLqMCI/mK/1lIbMEbbO4xVhNbUEgHPuUp9iXbfjzHZ3SjiNiCxVxLqQ98yCwKcigkmMInHE62I/ic6QSFFOQwk7fYi1LtyXncz0Nb8Aj3cSzZjud+HmFL7z7AefiXlC9fvnwbAdT9MQ6KtWmjAAAAAElFTkSuQmCC",
      link: "https://feeds.nbcnews.com/nbcnews/public/world",
      options: {
        getExtraEntryFields: (entryData: any) => {
          const mediaContent = entryData["media:content"][0];
          const mediaUrl = mediaContent ? mediaContent["@_url"] : null;
          return { mediaUrl };
        },
      },
    },
    {
      id: 7,
      img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAAAAABWESUoAAABLUlEQVR4AWKQIwCorUAWiGRBNIBOsoXREIbBsPeKtCWZwnyZXoJHo7AkOCRuDoHHIvByBi+weENyHjc1g+ttXM58YxUze9L3J8VXgPAjhO4gJ1m/AVjoSWp31jmopaAIQGWOxtzMl5nWVUQbqDBs9MHP3ANEAPQ3r7IMK9h5hQgQhnnIUOp9W7uCIpOoTubZB4BeIVDcA1QXs/HWqFfhO94QgKuCJEBBgmdMAX5WDxySkgB0PqBrIAmQ/NNISzwam8AkAMMdTKSBp4m9SANP0Cnt4Sn7p8yyXmVAOVEs0birVd20Lbr5QCUpAka7zOfNfuw+zhFAn/2y/D9uwKgon/J21loXgC26STHsq27rqqoabaxrvk+OZFcSACD6R7Tjy8kR5r9D+BgpJOiQeQHD9fPxsEC9uAAAAABJRU5ErkJggg==",
      link: "https://www.latimes.com/local/rss2.0.xml",
      options: {
        getExtraEntryFields: (entryData: any) => {
          const mediaContent = entryData["media:content"];
          const mediaUrl = mediaContent ? mediaContent["@_url"] : null;
          return { mediaUrl };
        },
      },
    },
  ];

  onMount(() => {});

  // const [showRss, setShowRss] = createSignal<boolean>(false);
  // const [rssEntries, setRssEntries] = createSignal<FeedEntry[]>([]);

  // const handleFetchRss = async (id: number) => {
  //   const baseUrl = DEFAULT_CORS_PROXY + rssSource[id].link;
  //   const result = await extract(baseUrl, rssSource[id].options);
  //   if (result.entries) setRssEntries(result.entries);
  // };

  // const countTime = (time: string) => {
  //   const hours = differenceInHours(new Date(), new Date(time)) + 1;
  //   const days = differenceInDays(new Date(), new Date(time));
  //   return days > 0
  //     ? days + " days " + (hours % 24) + " hours ago"
  //     : hours + " hours ago";
  // };

  // const RssItem = ({ item }: { item: FeedEntry }) => (
  //   <div class="rssItem">
  //     {/* <Show when={item.mediaUrl}>
  //       <img alt="..." src={item.mediaUrl} class="rssItemImg" />
  //     </Show> */}
  //     <div class="rssItemContent">
  //       <p class="rssItemDate">{countTime(item.published!)}</p>
  //       <a href={item.link} target="_blank" rel="noreferrer">
  //         <p class="rssItemTitle">{item.title}</p>
  //       </a>
  //       <p class="rssItemDescription">{item.description}</p>
  //     </div>
  //   </div>
  // );

  return (
    <div class="rss">
      {/* <div class="rssTop">
        <Index each={rssSource}>
          {(data, index) => {
            return (
              <button
                class="rssBtn"
                onClick={() => {
                  handleFetchRss(index);
                }}
              >
                <img src={data().img} />
              </button>
            );
          }}
        </Index>
        <button class="rssBtnDelete" onClick={() => setRssEntries([])}>
          E
        </button>
      </div>
      <Show when={rssEntries().length > 0}>
        <div class="rssBody">
          {rssEntries().length > 0 && (
            <Index each={rssEntries()}>
              {(data, index) => {
                return <RssItem item={data()} />;
              }}
            </Index>
          )}
        </div>
      </Show> */}
    </div>
  );
};

export default RSS;
