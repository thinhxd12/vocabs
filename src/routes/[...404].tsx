import { A } from "@solidjs/router";

export default function NotFound() {
  return (
    <main class="flex h-screen w-screen justify-center overflow-hidden bg-black">
      <div class="w-content flex h-full flex-col items-center justify-start pt-32">
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
