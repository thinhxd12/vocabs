import { MetaProvider, Title as TitleName, Meta } from "@solidjs/meta";
import { Component, Index, Show, createSignal, onMount } from "solid-js";
import "/public/styles/weather.scss";
import { getWeatherData } from "~/api/api";
import { WeatherDataType } from "~/types";
import { Chart, Title, Tooltip, Legend, Colors, Filler } from "chart.js";
import { Line } from "solid-chartjs";
import RSS from "~/components/rss";
import { FaSolidArrowUpLong } from "solid-icons/fa";
import {
  activeTextureGL,
  chance,
  createCanvas,
  createProgramGL,
  createTextureGL,
  createUniformGL,
  getContextGL,
  getShader,
  loadImage,
  random,
  setRectangleGL,
  times,
  updateTextureGL,
} from "~/api/weatherServices";

type WeatherGeoType = {
  name: string;
  geo: string;
};

let canvas: HTMLCanvasElement;

const Weather: Component<{}> = (props) => {
  const WEATHER_GEOS: WeatherGeoType[] = [
    {
      name: "ThuThua",
      geo: "10.588468,106.400650",
    },
    {
      name: "Roma",
      geo: "41.8933203,12.4829321",
    },
    {
      name: "CanTho",
      geo: "10.0364216,105.7875219",
    },
    {
      name: "Tokyo",
      geo: "35.6821936,139.762221",
    },
    {
      name: "Heliskiing",
      geo: "59.4373017,-136.2290385",
    },
  ];

  const mockWeatherData: WeatherDataType = {
    currentData: {
      timeText: "",
      icon: "",
      summary: "",
      humidity: 0,
      temperature: 0,
      apparentTemperature: 0,
      uvIndex: 0,
      windSpeed: 0,
      windBearing: 0,
      isDayTime: true,
    },
    minuteData: [],
    prediction: "",
  };

  const [audioSrc, setAudioSrc] = createSignal<string>("");

  const [weatherData, setweatherData] =
    createSignal<WeatherDataType>(mockWeatherData);

  const handleGetWeatherData = async (geo: string) => {
    const data = await getWeatherData(geo);

    if (data) {
      setweatherData(data);
      setChartData({
        labels: data.minuteData.map((item) => item.diffTime),
        datasets: [
          {
            label: "",
            data: data.minuteData.map((item) => item.intensity),
            borderColor: "#009bff",
            backgroundColor: "#52a0c1bf",
            yAxisID: "y",
            fill: true,
            tension: 0.1,
            pointRadius: 0,
            borderWidth: 1,
          },
          {
            label: "",
            data: data.minuteData.map((item) => item.probability),
            borderColor: "#f90000",
            yAxisID: "y1",
            fill: false,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 1.5,
          },
        ],
      });

      switch (data.currentData.summary) {
        case "Light rain":
        case "Light Freezing Rain":
        case "Light Showers":
          setupWeather("drizzle", data.currentData.isDayTime);
          setAudioSrc("/sounds/weather/rain_light_2.m4a");
          break;
        case "Moderate rain":
        case "Freezing Rain":
        case "Showers":
          setupWeather("rain", data.currentData.isDayTime);
          setAudioSrc("/sounds/weather/rain_light.m4a");
          break;
        case "Heavy rain":
        case "Heavy Showers":
          setupWeather("storm", data.currentData.isDayTime);
          setAudioSrc("/sounds/weather/rain.m4a");
          break;
        case "Thunderstorm":
        case "Light Thunderstorms With Hail":
          setupWeather("storm", data.currentData.isDayTime);
          setAudioSrc("/sounds/weather/thunderstorm.m4a");
          break;
        case "Partly Cloudy":
        case "Mostly Cloudy":
          setAudioSrc("/sounds/weather/wind.m4a");
        case "Sunny":
          setAudioSrc("/sounds/weather/forest.m4a");
        case "Clear":
          setAudioSrc("/sounds/weather/night.m4a");
        case "Light Snow":
        case "Snow":
        case "Heavy Snow":
          setAudioSrc("/sounds/weather/snow.m4a");
        case "Light Freezing Rain":
        case "Freezing Rain":
          setAudioSrc("/sounds/weather/rain_freezing.m4a");
        default:
          setupWeather("sunny", data.currentData.isDayTime);
          setAudioSrc("/sounds/weather/forest.m4a");
          break;
      }
    }
  };

  onMount(async () => {
    let canvasWidth = 360;
    let canvasHeight = window.innerHeight - 58;
    dpi = window.devicePixelRatio;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    handleGetWeatherData(WEATHER_GEOS[0].geo);
    Chart.register(Title, Tooltip, Legend, Colors, Filler);
  });

  const [chartData, setChartData] = createSignal({
    labels: [0],
    datasets: [{}],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: false,
      },
      legend: { display: false },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: true,
          drawOnChartArea: false,
          drawTicks: true,
        },
        ticks: {
          stepSize: 0.2,
          callback: function (value: any, index: any) {
            return value == 0 ? "" : value % 10 === 0 ? value + "min" : null;
          },
          font: {
            size: 9,
          },
          color: "black",
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        min: 0,
        max: 1.5,
        border: { dash: [1, 1] },
        grid: {
          drawTicks: false,
          color: ["black", "#ae0000", "#ae0000"],
        },
        ticks: {
          stepSize: 0.5,
          callback: function (value: any, index: any) {
            switch (value) {
              case 0:
                return "LGT";
              case 0.5:
                return "MED";
              case 1:
                return "HVY";
              default:
                null;
            }
          },
          font: {
            size: 9,
          },
          color: "black",
        },
      },
      y1: {
        min: 0,
        max: 1,
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          display: true,
          drawOnChartArea: false,
          tickLength: 3,
          tickWidth: 1,
        },
        ticks: {
          stepSize: 0.2,
          callback: function (value: any, index: any) {
            return value == 0 ? "0" : value * 100 + "%";
          },
          font: {
            size: 9,
          },
          color: "black",
        },
      },
    },
  };

  // -------------------------------CANVAS------------------
  let textureBgSize = {
    width: 384,
    height: 256,
  };

  let textureFgSize = {
    width: 96,
    height: 64,
  };

  let dropSize = 64;

  let textureFg: CanvasImageSource;
  let textureFgCtx: CanvasRenderingContext2D;
  let textureBg: CanvasImageSource;
  let textureBgCtx: CanvasRenderingContext2D;

  let dpi: number;

  const init = (options: any) => {
    let dropAlpha = loadImage("/images/openmeteo/drop-alpha.png");
    let dropColor = loadImage("/images/openmeteo/drop-color.png");

    let textureDayFg = loadImage("/images/openmeteo/weather/day-fg.jpg");
    let textureDayBg = loadImage("/images/openmeteo/weather/day-bg.jpg");

    let textureNightFg = loadImage("/images/openmeteo/weather/night-fg.jpg");
    let textureNightBg = loadImage("/images/openmeteo/weather/night-bg.jpg");

    textureFg = createCanvas(textureFgSize.width, textureFgSize.height);
    textureFgCtx = textureFg.getContext("2d")!;
    textureBg = createCanvas(textureBgSize.width, textureBgSize.height);
    textureBgCtx = textureBg.getContext("2d")!;

    Promise.all([
      dropAlpha,
      dropColor,
      textureDayFg,
      textureDayBg,
      textureNightFg,
      textureNightBg,
    ])
      .then(function (images) {
        const imagesObj = {
          dropAlpha: images[0],
          dropColor: images[1],

          textureDayFg: images[2],
          textureDayBg: images[3],

          textureNightFg: images[4],
          textureNightBg: images[5],
        };

        let raindropsCanvas = Raindrops(
          canvas.width,
          canvas.height,
          dpi,
          imagesObj.dropAlpha,
          imagesObj.dropColor,
          options
        );

        generateTextures(
          imagesObj[options.fg as keyof typeof imagesObj] as ImageBitmap,
          imagesObj[options.bg as keyof typeof imagesObj] as ImageBitmap
        );

        RainRenderer(canvas, raindropsCanvas, textureFg, textureBg, null, {
          brightness: 1.04,
          alphaMultiply: 6,
          alphaSubtract: 3,
        });
      })
      .catch(function (error) {
        console.error("An error occurred while loading the images:", error);
      });
  };

  const generateTextures = (
    fg: CanvasImageSource,
    bg: CanvasImageSource,
    alpha = 1
  ) => {
    textureFgCtx.globalAlpha = alpha;
    textureFgCtx.drawImage(fg, 0, 0, textureFgSize.width, textureFgSize.height);

    textureBgCtx.globalAlpha = alpha;
    textureBgCtx.drawImage(bg, 0, 0, textureBgSize.width, textureBgSize.height);
  };

  const Raindrops = (
    width: number,
    height: number,
    scale: number,
    dropAlpha: any,
    dropColor: any,
    options: any = {}
  ) => {
    const defaultOptions = {
      minR: 10,
      maxR: 40,
      maxDrops: 900,
      rainChance: 0.3,
      rainLimit: 3,
      dropletsRate: 50,
      dropletsSize: [2, 3],
      dropletsCleaningRadiusMultiplier: 0.3,
      raining: true,
      globalTimeScale: 1,
      trailRate: 1,
      autoShrink: true,
      spawnArea: [-0.1, 0.95],
      trailScaleRange: [0.2, 0.5],
      collisionRadius: 0.65,
      collisionRadiusIncrease: 0.01,
      dropFallMultiplier: 1,
      collisionBoostMultiplier: 0.05,
      collisionBoost: 1,
    };

    const Drop = {
      x: 0,
      y: 0,
      r: 0,
      spreadX: 0,
      spreadY: 0,
      momentum: 0,
      momentumX: 0,
      lastSpawn: 0,
      nextSpawn: 0,
      parent: null,
      isNew: true,
      killed: false,
      shrink: 0,
    };

    options = { ...defaultOptions, ...options };
    let lastRender: number | null = null;
    let dropletsPixelDensity = 1;
    let clearDropletsGfx: HTMLCanvasElement;
    let textureCleaningIterations = 0;
    let dropletsCounter = 0;
    let canvas = createCanvas(width, height);
    let ctx = canvas.getContext("2d")!;
    let droplets = createCanvas(
      width * dropletsPixelDensity,
      height * dropletsPixelDensity
    );
    let dropletsCtx = droplets.getContext("2d")!;
    let drops: any[] = [];
    let dropsGfx: any[] = [];

    let deltaR = options.maxR - options.minR;
    let area = (width * height) / scale;
    let areaMultiplier = Math.sqrt(area / (1024 * 768));

    function drawDroplet(x: number, y: number, r: number) {
      drawDrop(dropletsCtx, {
        ...Drop,
        x: x * dropletsPixelDensity,
        y: y * dropletsPixelDensity,
        r: r * dropletsPixelDensity,
      });
    }

    function renderDropsGfx() {
      let dropBuffer = createCanvas(dropSize, dropSize);
      let dropBufferCtx = dropBuffer.getContext("2d")!;
      dropsGfx = Array.apply(null, Array(255)).map((cur, i) => {
        let drop = createCanvas(dropSize, dropSize);
        let dropCtx = drop.getContext("2d")!;

        dropBufferCtx.clearRect(0, 0, dropSize, dropSize);

        // color
        dropBufferCtx.globalCompositeOperation = "source-over";
        dropBufferCtx.drawImage(dropColor, 0, 0, dropSize, dropSize);

        // blue overlay, for depth
        dropBufferCtx.globalCompositeOperation = "screen";
        dropBufferCtx.fillStyle = "rgba(0,0," + i + ",1)";
        dropBufferCtx.fillRect(0, 0, dropSize, dropSize);

        // alpha
        dropCtx.globalCompositeOperation = "source-over";
        dropCtx.drawImage(dropAlpha, 0, 0, dropSize, dropSize);

        dropCtx.globalCompositeOperation = "source-in";
        dropCtx.drawImage(dropBuffer, 0, 0, dropSize, dropSize);
        return drop;
      });

      // create circle that will be used as a brush to remove droplets
      clearDropletsGfx = createCanvas(128, 128);
      let clearDropletsCtx = clearDropletsGfx.getContext("2d")!;
      clearDropletsCtx.fillStyle = "#000";
      clearDropletsCtx.beginPath();
      clearDropletsCtx.arc(64, 64, 64, 0, Math.PI * 2);
      clearDropletsCtx.fill();
    }

    function drawDrop(ctx: CanvasRenderingContext2D, drop: any) {
      if (dropsGfx.length > 0) {
        let x = drop.x;
        let y = drop.y;
        let r = drop.r;
        let spreadX = drop.spreadX;
        let spreadY = drop.spreadY;

        let scaleX = 1;
        let scaleY = 1.5;

        let d = Math.max(0, Math.min(1, ((r - options.minR) / deltaR) * 0.9));
        d = (d * 1) / ((drop.spreadX + drop.spreadY) * 0.5 + 1);

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";

        d = Math.floor(d * (dropsGfx.length - 1)) || 0;
        ctx.drawImage(
          dropsGfx[d],
          (x - r * scaleX * (spreadX + 1)) * scale,
          (y - r * scaleY * (spreadY + 1)) * scale,
          r * 2 * scaleX * (spreadX + 1) * scale,
          r * 2 * scaleY * (spreadY + 1) * scale
        );
      }
    }

    function clearDroplets(x: number, y: number, r = 30) {
      let context = dropletsCtx;
      context.globalCompositeOperation = "destination-out";
      context.drawImage(
        clearDropletsGfx,
        (x - r) * dropletsPixelDensity * scale,
        (y - r) * dropletsPixelDensity * scale,
        r * 2 * dropletsPixelDensity * scale,
        r * 2 * dropletsPixelDensity * scale * 1.5
      );
    }

    function clearCanvas() {
      ctx.clearRect(0, 0, width, height);
    }

    function createDrop(options: any) {
      if (drops.length >= options.maxDrops * areaMultiplier) return null;
      return { ...Drop, ...options };
    }

    function updateRain(timeScale: number) {
      let rainDrops = [];
      if (options.raining) {
        let limit = options.rainLimit * timeScale * areaMultiplier;
        let count = 0;
        while (
          chance(options.rainChance * timeScale * areaMultiplier) &&
          count < limit
        ) {
          count++;
          let r = random(options.minR, options.maxR, (n) => {
            return Math.pow(n, 3);
          });
          let rainDrop = createDrop({
            x: random(width / scale),
            y: random(
              (height / scale) * options.spawnArea[0],
              (height / scale) * options.spawnArea[1]
            ),
            r: r,
            momentum: 1 + (r - options.minR) * 0.1 + random(2),
            spreadX: 1.5,
            spreadY: 1.5,
          });
          if (rainDrop != null) {
            rainDrops.push(rainDrop);
          }
        }
      }
      return rainDrops;
    }

    function updateDroplets(timeScale: number) {
      if (textureCleaningIterations > 0) {
        textureCleaningIterations -= 1 * timeScale;
        dropletsCtx.globalCompositeOperation = "destination-out";
        dropletsCtx.fillStyle = "rgba(0,0,0," + 0.05 * timeScale + ")";
        dropletsCtx.fillRect(
          0,
          0,
          width * dropletsPixelDensity,
          height * dropletsPixelDensity
        );
      }
      if (options.raining) {
        dropletsCounter += options.dropletsRate * timeScale * areaMultiplier;
        times(dropletsCounter, (i) => {
          dropletsCounter--;
          drawDroplet(
            random(width / scale),
            random(height / scale),
            random(
              options.dropletsSize[0],
              options.dropletsSize[1],
              (n) => n * n
            )
          );
        });
      }
      ctx.drawImage(droplets, 0, 0, width, height);
    }

    function updateDrops(timeScale: number) {
      let newDrops: HTMLCanvasElement[] = [];

      updateDroplets(timeScale);
      let rainDrops = updateRain(timeScale);
      newDrops = newDrops.concat(rainDrops);

      drops.sort((a, b) => {
        let va = a.y * (width / scale) + a.x;
        let vb = b.y * (width / scale) + b.x;
        return va > vb ? 1 : va == vb ? 0 : -1;
      });

      drops.forEach(function (drop, i) {
        if (!drop.killed) {
          // update gravity
          // (chance of drops "creeping down")
          if (
            chance(
              (drop.r - options.minR * options.dropFallMultiplier) *
                (0.1 / deltaR) *
                timeScale
            )
          ) {
            drop.momentum += random((drop.r / options.maxR) * 4);
          }
          // clean small drops
          if (
            options.autoShrink &&
            drop.r <= options.minR &&
            chance(0.05 * timeScale)
          ) {
            drop.shrink += 0.01;
          }
          //update shrinkage
          drop.r -= drop.shrink * timeScale;
          if (drop.r <= 0) drop.killed = true;

          // update trails
          if (options.raining) {
            drop.lastSpawn += drop.momentum * timeScale * options.trailRate;
            if (drop.lastSpawn > drop.nextSpawn) {
              let trailDrop = createDrop({
                x: drop.x + random(-drop.r, drop.r) * 0.1,
                y: drop.y - drop.r * 0.01,
                r:
                  drop.r *
                  random(
                    options.trailScaleRange[0],
                    options.trailScaleRange[1]
                  ),
                spreadY: drop.momentum * 0.1,
                parent: drop,
              });

              if (trailDrop != null) {
                newDrops.push(trailDrop);

                drop.r = drop.r * Math.pow(0.97, timeScale);
                drop.lastSpawn = 0;
                drop.nextSpawn =
                  random(options.minR, options.maxR) -
                  drop.momentum * 2 * options.trailRate +
                  (options.maxR - drop.r);
              }
            }
          }

          //normalize spread
          drop.spreadX = drop.spreadX * Math.pow(0.4, timeScale);
          drop.spreadY = drop.spreadY * Math.pow(0.7, timeScale);

          //update position
          let moved = drop.momentum > 0;
          if (moved && !drop.killed) {
            drop.y += drop.momentum * options.globalTimeScale;
            drop.x += drop.momentumX * options.globalTimeScale;
            if (drop.y > height / scale + drop.r) {
              drop.killed = true;
            }
          }

          // collision
          let checkCollision = (moved || drop.isNew) && !drop.killed;
          drop.isNew = false;

          if (checkCollision) {
            drops.slice(i + 1, i + 70).forEach((drop2) => {
              //basic check
              if (
                drop != drop2 &&
                drop.r > drop2.r &&
                drop.parent != drop2 &&
                drop2.parent != drop &&
                !drop2.killed
              ) {
                let dx = drop2.x - drop.x;
                let dy = drop2.y - drop.y;
                var d = Math.sqrt(dx * dx + dy * dy);
                //if it's within acceptable distance
                if (
                  d <
                  (drop.r + drop2.r) *
                    (options.collisionRadius +
                      drop.momentum *
                        options.collisionRadiusIncrease *
                        timeScale)
                ) {
                  let pi = Math.PI;
                  let r1 = drop.r;
                  let r2 = drop2.r;
                  let a1 = pi * (r1 * r1);
                  let a2 = pi * (r2 * r2);
                  let targetR = Math.sqrt((a1 + a2 * 0.8) / pi);
                  if (targetR > options.maxR) {
                    targetR = options.maxR;
                  }
                  drop.r = targetR;
                  drop.momentumX += dx * 0.1;
                  drop.spreadX = 0;
                  drop.spreadY = 0;
                  drop2.killed = true;
                  drop.momentum = Math.max(
                    drop2.momentum,
                    Math.min(
                      40,
                      drop.momentum +
                        targetR * options.collisionBoostMultiplier +
                        options.collisionBoost
                    )
                  );
                }
              }
            });
          }

          //slowdown momentum
          drop.momentum -=
            Math.max(1, options.minR * 0.5 - drop.momentum) * 0.1 * timeScale;
          if (drop.momentum < 0) drop.momentum = 0;
          drop.momentumX = drop.momentumX * Math.pow(0.7, timeScale);

          if (!drop.killed) {
            newDrops.push(drop);
            if (moved && options.dropletsRate > 0)
              clearDroplets(
                drop.x,
                drop.y,
                drop.r * options.dropletsCleaningRadiusMultiplier
              );
            drawDrop(ctx, drop);
          }
        }
      });

      drops = newDrops;
    }

    function update() {
      clearCanvas();
      let now = Date.now();
      if (lastRender == null) lastRender = now;
      let deltaT = now - lastRender;
      let timeScale = deltaT / ((1 / 60) * 1000);
      if (timeScale > 1.1) timeScale = 1.1;
      timeScale = timeScale * options.globalTimeScale;
      lastRender = now;

      updateDrops(timeScale);

      requestAnimationFrame(update);
    }

    renderDropsGfx();
    update();
    return canvas;
  };

  const RainRenderer = async (
    canvas: HTMLCanvasElement,
    canvasLiquid: HTMLCanvasElement,
    imageFg: any,
    imageBg: any,
    imageShine: any = null,
    options: any = {}
  ) => {
    const defaultOptions = {
      renderShadow: false,
      minRefraction: 256,
      maxRefraction: 512,
      brightness: 1,
      alphaMultiply: 20,
      alphaSubtract: 5,
      parallaxBg: 5,
      parallaxFg: 20,
    };
    options = { ...defaultOptions, ...options };

    let width = canvas.width;
    let height = canvas.height;
    let textures: any;
    let parallaxX = 0;
    let parallaxY = 0;
    let vertShader = await getShader("/images/openmeteo/shaders/simple.vert");
    let fragShader = await getShader("/images/openmeteo/shaders/water.frag");
    let gl = getContextGL(canvas, options);
    let program = createProgramGL(gl, vertShader, fragShader);
    gl.useProgram(program);

    createUniformGL(gl, program, "2f", "resolution", width, height);
    createUniformGL(
      gl,
      program,
      "1f",
      "textureRatio",
      imageBg.width / imageBg.height
    );
    createUniformGL(
      gl,
      program,
      "1i",
      "renderShine",
      imageShine == null ? false : true
    );
    createUniformGL(gl, program, "1i", "renderShadow", options.renderShadow);
    createUniformGL(gl, program, "1f", "minRefraction", options.minRefraction);
    createUniformGL(
      gl,
      program,
      "1f",
      "refractionDelta",
      options.maxRefraction - options.minRefraction
    );
    createUniformGL(gl, program, "1f", "brightness", options.brightness);
    createUniformGL(gl, program, "1f", "alphaMultiply", options.alphaMultiply);
    createUniformGL(gl, program, "1f", "alphaSubtract", options.alphaSubtract);
    createUniformGL(gl, program, "1f", "parallaxBg", options.parallaxBg);
    createUniformGL(gl, program, "1f", "parallaxFg", options.parallaxFg);

    createTextureGL(gl, null, 0);

    textures = [
      {
        name: "textureShine",
        img: imageShine == null ? createCanvas(2, 2) : imageShine,
      },
      { name: "textureFg", img: imageFg },
      { name: "textureBg", img: imageBg },
    ];

    textures.forEach((texture: any, i: number) => {
      createTextureGL(gl, texture.img, i + 1);
      createUniformGL(gl, program, "1i", texture.name, i + 1);
    });

    draw();

    function draw() {
      gl.useProgram(program);
      createUniformGL(gl, program, "2f", "parallax", parallaxX, parallaxY);
      updateTexture();
      setRectangleGL(gl, -1, -1, 2, 2);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      requestAnimationFrame(draw);
    }

    function updateTexture() {
      activeTextureGL(gl, 0);
      updateTextureGL(gl, canvasLiquid);
    }
  };

  const [weatherOption, setWeatherOption] = createSignal<any>();

  const setupWeather = (type: string, isDayTime: boolean) => {
    const defaultWeatherTypes = {
      raining: true,
      minR: 20,
      maxR: 50,
      rainChance: 0.35,
      rainLimit: 6,
      dropletsRate: 50,
      dropletsSize: [3, 5.5],
      trailRate: 1,
      trailScaleRange: [0.25, 0.35],
      fg: "textureDayFg",
      bg: "textureDayBg",
      flashFg: null,
      flashBg: null,
      flashChance: 0,
      collisionRadiusIncrease: 0.0002,
    };

    const weatherTypes = {
      rain: {
        rainChance: 0.35,
        dropletsRate: 50,
        raining: true,
        fg: isDayTime ? "textureDayFg" : "textureNightFg",
        bg: isDayTime ? "textureDayBg" : "textureNightBg",
      },
      storm: {
        maxR: 55,
        rainChance: 0.4,
        dropletsRate: 80,
        dropletsSize: [3, 5.5],
        trailRate: 2.5,
        trailScaleRange: [0.25, 0.4],
        fg: isDayTime ? "textureDayFg" : "textureNightFg",
        bg: isDayTime ? "textureDayBg" : "textureNightBg",
        flashFg: "",
        flashBg: "",
        flashChance: 0.1,
      },
      fallout: {
        minR: 30,
        maxR: 60,
        rainChance: 0.35,
        dropletsRate: 20,
        trailRate: 4,
        fg: "textureFalloutFg",
        bg: "textureFalloutBg",
        collisionRadiusIncrease: 0,
      },
      drizzle: {
        minR: 10,
        maxR: 40,
        rainChance: 0.15,
        rainLimit: 2,
        dropletsRate: 10,
        dropletsSize: [3.5, 6],
        fg: isDayTime ? "textureDayFg" : "textureNightFg",
        bg: isDayTime ? "textureDayBg" : "textureNightBg",
      },
      sunny: {
        rainChance: 0,
        rainLimit: 0,
        droplets: 0,
        raining: false,
        fg: isDayTime ? "textureDayFg" : "textureNightFg",
        bg: isDayTime ? "textureDayBg" : "textureNightBg",
      },
    };

    setWeatherOption({
      ...defaultWeatherTypes,
      ...weatherTypes[type as keyof typeof weatherTypes],
    });

    init(weatherOption());
  };

  return (
    <MetaProvider>
      <TitleName>weather</TitleName>
      <Meta name="author" content="thinhxd12@gmail.com" />
      <Meta name="description" content="Thinh's Vocabulary Learning App" />
      <audio hidden src={audioSrc()} autoplay loop></audio>
      <div class="weather">
        <canvas ref={canvas} class="weatherBackground" />
        <div class="weatherMain">
          <div
            class={
              weatherData().currentData.isDayTime
                ? "weatherContentDay"
                : "weatherContentNight"
            }
          >
            <select
              class="weatherGeos"
              onchange={(e) => handleGetWeatherData(e.currentTarget.value)}
            >
              <Index each={WEATHER_GEOS}>
                {(item, index) => (
                  <option value={item().geo}> {item().name}</option>
                )}
              </Index>
            </select>
            <Show when={weatherData().minuteData.length > 0}>
              <div class="weatherContentMain">
                <img class="weatherImg" src={weatherData().currentData.icon} />
                <div class="weatherContentText">
                  <p class="weatherContentTemp">
                    {Math.round(weatherData().currentData.temperature)}°
                  </p>
                  <p class="weatherContentInfo">
                    Feels{" "}
                    {Math.round(weatherData().currentData.apparentTemperature)}
                    °C
                  </p>
                  <p class="weatherContentInfo">
                    Humidity {weatherData().currentData.humidity} %
                  </p>
                  <Show when={weatherData().currentData.uvIndex > 0}>
                    <p class="weatherContentInfo">
                      UV {weatherData().currentData.uvIndex}
                    </p>
                  </Show>
                  <div class="weatherContentWind">
                    <p>
                      Wind {Math.round(weatherData().currentData.windSpeed)}
                      km/h
                    </p>
                    <FaSolidArrowUpLong
                      size={12}
                      style={{
                        transform: `rotate(${
                          weatherData().currentData.windBearing
                        }deg)`,
                      }}
                    />
                  </div>
                  <p class="weatherContentInfo">
                    {weatherData().currentData.timeText}
                    {" - "}
                    {weatherData().currentData.summary}
                  </p>
                </div>
              </div>
            </Show>
            <div class="weatherChart">
              <div>
                <Line
                  data={chartData()}
                  options={chartOptions}
                  width={300}
                  height={150}
                />
              </div>
              <p class="weatherPredict">{weatherData().prediction}</p>
            </div>
            <RSS />
          </div>
        </div>
      </div>
    </MetaProvider>
  );
};

export default Weather;
