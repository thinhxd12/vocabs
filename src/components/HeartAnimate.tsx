import { Component, createEffect, createSignal, onCleanup } from "solid-js";

const HeartAnimate: Component<{ id: number }> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  let ani: number;
  let canvasWidth: number;
  let canvasHeight: number;
  let img: HTMLImageElement;
  const hearSvg =
    '<svg stroke-width="0" color="#fd2c55" fill="#fd2c55" viewBox="0 0 16 16" size="15" class="text-white" height="15" width="15" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;"><path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"></path></svg>';

  const [isShow, setIsShow] = createSignal<boolean>(false);

  createEffect(() => {
    if (props.id > 0) {
      clearCanvas();
      runAnimate();
      setIsShow(true);
    }
  });

  const runAnimate = () => {
    generateRandomPositions();
    img = new Image();
    const svgBlob = new Blob([hearSvg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
    img.onload = () => {
      animate();
    };
  };

  const [positions, setPositions] = createSignal<
    { x: number; y: number; speed: number; targetX: number; size: number }[]
  >([]);
  const hearts = Array.from({ length: 99 }, (_, i) => i);

  const generateRandomPositions = () => {
    if (canvasRef) {
      canvasRef.width = window.innerWidth - 402;
      canvasRef.height = window.innerHeight;
      canvasWidth = canvasRef.width;
      canvasHeight = canvasRef.height;

      const initialPositions = [];
      for (let i = 0; i < hearts.length; i++) {
        const sizeRandom = Math.random() * 10 + 20;
        initialPositions.push({
          x: Math.random() * canvasWidth,
          y: canvasHeight + (Math.random() * canvasHeight) / 2,
          speed: 3 + Math.random() * 6,
          targetX: Math.random() * canvasWidth,
          size: sizeRandom,
        });
      }
      setPositions(initialPositions);
    }
  };

  const drawImages = () => {
    if (canvasRef) {
      const ctx = canvasRef.getContext("2d")!;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      positions().forEach((pos, index) => {
        ctx.drawImage(img, pos.x, pos.y, pos.size, pos.size);
      });
    }
  };

  const updatePositions = () => {
    setPositions((prevPositions) =>
      prevPositions.map((pos) => {
        let newY = pos.y - pos.speed;
        let newX = pos.x;

        if (pos.x < pos.targetX) {
          newX = pos.x + 1;
        } else if (pos.x > pos.targetX) {
          newX = pos.x - 1;
        }
        if (newY < -30) {
          newY = -31;
          pos.x = Math.random() * canvasRef!.width;
          pos.speed = 6 + Math.random() * 6;
        }
        return { ...pos, x: newX, y: newY };
      }),
    );
  };

  const allImagesGone = () => {
    return positions().every((pos) => pos.y < -30);
  };

  const animate = () => {
    updatePositions();
    drawImages();
    if (!allImagesGone()) {
      ani = requestAnimationFrame(animate);
    } else {
      clearCanvas();
    }
  };

  const clearCanvas = () => {
    setIsShow(false);
    cancelAnimationFrame(ani);
    if (canvasRef) {
      const ctx = canvasRef.getContext("2d")!;
      ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
    }
  };

  onCleanup(() => {
    clearCanvas();
  });

  return (
    <canvas
      ref={canvasRef}
      class={`fixed z-40 ${isShow() ? "pointer-events-auto" : "pointer-events-none"} left-0 top-0`}
    />
  );
};

export default HeartAnimate;
