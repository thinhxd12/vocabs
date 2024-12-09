import { useSubmission } from "@solidjs/router";
import { createSignal, onMount, Show } from "solid-js";
import { getSpotlightImage } from "~/lib/server";
import { LoginImageType } from "~/types";
import { loginAction } from "~/lib/login";
import ImageLoader from "~/components/ImageLoader";

export default function Home() {
  const [imageData, setImageData] = createSignal<LoginImageType | undefined>();
  const [isMobile, setIsMobile] = createSignal<boolean>(false);

  onMount(async () => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
    setIsMobile(isMobile);
    const data = await getSpotlightImage();
    setImageData(data);
  });

  const loggingIn = useSubmission(loginAction);

  return (
    <main class="relative h-screen w-screen overflow-hidden">
      <Show when={imageData()}>
        <ImageLoader
          src={isMobile() ? imageData()!.image_P : imageData()!.image_L}
          width={window.screen.width}
          height={window.screen.height}
          className="absolute z-0"
        />

        <div class="absolute left-0 top-0 w-full px-5 pt-3 font-basier text-4 font-500 leading-6 text-white sm:w-2/3 sm:pl-12 sm:pt-10">
          <p class="loginBackgroundText mb-1 w-full">
            {imageData()?.hs1_title}
          </p>
          <p class="loginBackgroundText mb-1 w-full">
            {imageData()?.hs2_title}
          </p>
        </div>
        <p class="loginBackgroundText absolute bottom-0 right-0 w-full pb-3 pr-5 text-right font-basier text-4 font-500 leading-6 text-white">
          {imageData()?.title}
        </p>
      </Show>
      <div class="m-autow-fit absolute inset-0 z-50 flex h-full flex-col items-center">
        <form method="post" action={loginAction}>
          <div class="mt-[60vh] flex h-fit items-center justify-center">
            <input
              name="password"
              type="password"
              required
              class="ml-10 mr-3 h-7 w-[180px] border-none bg-[#00000073] text-center text-4 leading-7 text-white shadow-md outline-none hover:shadow-sm"
            />
            <button
              type="submit"
              class={`flex h-7 w-7 items-center justify-center transition ${loggingIn.pending ? "opacity-100" : "opacity-0"}`}
            >
              <img src="/assets/svg/loader-button.svg" width={15} height={15} />
            </button>
          </div>
        </form>
        <Show when={loggingIn.result}>
          <p class="loginAlert mt-4 text-center font-basier text-4.5 font-600 leading-4 text-[#de0000]">
            {loggingIn.result!.message}
          </p>
        </Show>
      </div>
    </main>
  );
}
