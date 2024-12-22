import { A } from "@solidjs/router";

export default function NotFound() {
  return (
    <main class="flex h-screen w-screen justify-center overflow-hidden bg-black">
      <div
        class="flex h-full    min-w-[360px] max-w-[360px] flex-col items-center justify-start pt-32"
        style={{
          "box-shadow": ".5px 0 #363636,-.5px 0 #363636",
        }}
      >
        <h1 class="max-6-xs my-14 text-6xl font-thin uppercase text-white">
          Not Found
        </h1>
        <A href="/vocab" class="text-[#de0000] hover:underline">
          Home
        </A>
      </div>
    </main>
  );
}
