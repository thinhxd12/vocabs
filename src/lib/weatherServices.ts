
export function createCanvas(width: number, height: number): HTMLCanvasElement {
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

export function random(
    from: number | null = null,
    to: number | null = null,
    interpolation: ((n: number) => number) | null = null
): number {
    if (from === null) {
        from = 0;
        to = 1;
    } else if (from !== null && to === null) {
        to = from;
        from = 0;
    }
    const delta = Number(to) - from;

    if (interpolation === null) {
        interpolation = (n: number) => {
            return n;
        };
    }
    return from + interpolation(Math.random()) * delta;
}

export function chance(c: number) {
    return random() <= c;
}

export function times(n: number, f: (index: number) => void): void {
    for (let i = 0; i < n; i++) {
        f(i);
    }
}

export async function getShader(src: string) {
    return await (await fetch(src)).text();
}

export function loadImage(src: string) {
    return new Promise((resolve, reject) => {
        let img = new Image();
        img.onload = function () {
            resolve(img);
        };
        img.onerror = function () {
            reject(new Error("Failed to load image " + src));
        };
        img.src = src;
    });
}

export function getContextGL(canvas: any, options = {}) {
    let contexts = ["webgl", "experimental-webgl"];
    let context: any = null;

    contexts.some((name) => {
        try {
            context = canvas.getContext(name, options);
        } catch (e) { }
        return context != null;
    });

    if (context == null) {
        document.body.classList.add("no-webgl");
    }

    return context;
}

export function createProgramGL(gl: any, vertexScript: any, fragScript: any) {
    let vertexShader = createShader(gl, vertexScript, gl.VERTEX_SHADER);
    let fragShader = createShader(gl, fragScript, gl.FRAGMENT_SHADER);

    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragShader);

    gl.linkProgram(program);

    let linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        var lastError = gl.getProgramInfoLog(program);
        error("Error in program linking: " + lastError);
        gl.deleteProgram(program);
        return null;
    }

    var positionLocation = gl.getAttribLocation(program, "a_position");
    var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        ]),
        gl.STATIC_DRAW
    );
    // gl.enableVertexAttribArray(texCoordLocation);
    // gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);


    // Create a buffer for the position of the rectangle corners.
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    return program;
}

export function createShader(gl: any, script: any, type: any) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, script);
    gl.compileShader(shader);

    let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    if (!compiled) {
        let lastError = gl.getShaderInfoLog(shader);
        error("Error compiling shader '" + shader + "':" + lastError);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
export function createTextureGL(gl: any, source: any, i: any) {
    var texture = gl.createTexture();
    activeTextureGL(gl, i);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    if (source == null) {
        return texture;
    } else {
        updateTextureGL(gl, source);
    }

    return texture;
}

export function createUniformGL(
    gl: any,
    program: any,
    type: any,
    name: string,
    ...args: any
) {
    let location = gl.getUniformLocation(program, "u_" + name);
    gl["uniform" + type](location, ...args);
}
export function activeTextureGL(gl: any, i: any) {
    gl.activeTexture(gl["TEXTURE" + i]);
}
export function updateTextureGL(gl: any, source: any) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
}
export function setRectangleGL(
    gl: any,
    x: any,
    y: any,
    width: number,
    height: number
) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
        gl.STATIC_DRAW
    );
}

function error(msg: string) {
    console.error(msg);
}

////-----------------------GL-------------------------
export class GL {
    constructor(
        canvas: HTMLCanvasElement,
        options = {},
        vert: string,
        frag: string
    ) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.gl = getContextGL(canvas, options);
        this.program = this.createProgram(vert, frag);
        this.useProgram(this.program);
    }
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    gl: any;
    program: any;

    createProgram(vert: string, frag: string) {
        let program = createProgramGL(this.gl, vert, frag);
        return program;
    }

    useProgram(program: any) {
        this.program = program;
        this.gl.useProgram(program);
    }

    createTexture(source: any, i: number) {
        return createTextureGL(this.gl, source, i);
    }
    createUniform(type: any, name: string, ...v: any) {
        createUniformGL(this.gl, this.program, type, name, ...v);
    }
    activeTexture(i: number) {
        activeTextureGL(this.gl, i);
    }
    updateTexture(source: any) {
        updateTextureGL(this.gl, source);
    }
    draw() {
        setRectangleGL(this.gl, -1, -1, 2, 2);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}


////-----------------------Raindrops-------------------------
let dropSize = 64;

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

export class Raindrops {
    constructor(
        width: number,
        height: number,
        scale: number,
        dropAlpha: any,
        dropColor: any,
        options = {}
    ) {
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.dropAlpha = dropAlpha;
        this.dropColor = dropColor;
        this.options = options;
        this.canvas = null;
        this.ctx = null;
        this.dropletsPixelDensity = 1;
        this.droplets = null;
        this.dropletsCtx = null;
        this.dropletsCounter = 0;
        this.drops = [];
        this.dropsGfx = [];
        this.clearDropletsGfx = null;
        this.textureCleaningIterations = 0;
        this.lastRender = null;
        this.init();
    }

    width: number;
    height: number;
    scale: number;
    dropAlpha: any;
    dropColor: any;
    canvas: HTMLCanvasElement | null;
    ctx: CanvasRenderingContext2D | null;
    dropletsPixelDensity: number;
    droplets: HTMLCanvasElement | null;
    dropletsCtx: CanvasRenderingContext2D | null;
    dropletsCounter: number;
    drops: any[];
    dropsGfx: any[];
    clearDropletsGfx: HTMLCanvasElement | null;
    textureCleaningIterations: number;
    lastRender: number | null;
    options: any;

    init(): void {
        this.canvas = createCanvas(this.width, this.height);
        this.ctx = this.canvas.getContext("2d");

        this.droplets = createCanvas(
            this.width * this.dropletsPixelDensity,
            this.height * this.dropletsPixelDensity
        );
        this.dropletsCtx = this.droplets.getContext("2d");

        this.drops = [];
        this.dropsGfx = [];

        this.renderDropsGfx();

        this.update();
    }

    get deltaR(): number {
        return this.options.maxR - this.options.minR;
    }
    get area() {
        return (this.width * this.height) / this.scale;
    }
    get areaMultiplier() {
        return Math.sqrt(this.area / (1024 * 768));
    }

    drawDroplet(x: number, y: number, r: number) {
        this.drawDrop(this.dropletsCtx!, {
            ...Drop,
            x: x * this.dropletsPixelDensity,
            y: y * this.dropletsPixelDensity,
            r: r * this.dropletsPixelDensity,
        });
    }

    renderDropsGfx() {
        let dropBuffer = createCanvas(dropSize, dropSize);
        let dropBufferCtx = dropBuffer.getContext("2d")!;
        this.dropsGfx = Array.apply(null, Array(255)).map((cur, i) => {
            let drop = createCanvas(dropSize, dropSize);
            let dropCtx = drop.getContext("2d")!;

            dropBufferCtx.clearRect(0, 0, dropSize, dropSize);

            // color
            dropBufferCtx.globalCompositeOperation = "source-over";
            dropBufferCtx.drawImage(this.dropColor, 0, 0, dropSize, dropSize);

            // blue overlay, for depth
            dropBufferCtx.globalCompositeOperation = "screen";
            dropBufferCtx.fillStyle = "rgba(0,0," + i + ",1)";
            dropBufferCtx.fillRect(0, 0, dropSize, dropSize);

            // alpha
            dropCtx.globalCompositeOperation = "source-over";
            dropCtx.drawImage(this.dropAlpha, 0, 0, dropSize, dropSize);

            dropCtx.globalCompositeOperation = "source-in";
            dropCtx.drawImage(dropBuffer, 0, 0, dropSize, dropSize);
            return drop;
        });

        // create circle that will be used as a brush to remove droplets
        this.clearDropletsGfx = createCanvas(128, 128);
        let clearDropletsCtx = this.clearDropletsGfx.getContext("2d")!;
        clearDropletsCtx.fillStyle = "#000";
        clearDropletsCtx.beginPath();
        clearDropletsCtx.arc(64, 64, 64, 0, Math.PI * 2);
        clearDropletsCtx.fill();
    }

    drawDrop(ctx: CanvasRenderingContext2D, drop: any) {
        if (this.dropsGfx.length > 0) {
            let x = drop.x;
            let y = drop.y;
            let r = drop.r;
            let spreadX = drop.spreadX;
            let spreadY = drop.spreadY;

            let scaleX = 1;
            let scaleY = 1.5;

            let d = Math.max(
                0,
                Math.min(1, ((r - this.options.minR) / this.deltaR) * 0.9)
            );
            d *= 1 / ((drop.spreadX + drop.spreadY) * 0.5 + 1);

            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";

            d = Math.floor(d * (this.dropsGfx.length - 1));
            ctx.drawImage(
                this.dropsGfx[d],
                (x - r * scaleX * (spreadX + 1)) * this.scale,
                (y - r * scaleY * (spreadY + 1)) * this.scale,
                r * 2 * scaleX * (spreadX + 1) * this.scale,
                r * 2 * scaleY * (spreadY + 1) * this.scale
            );
        }
    }

    clearDroplets(x: number, y: number, r = 30) {
        let ctx = this.dropletsCtx!;
        ctx.globalCompositeOperation = "destination-out";
        ctx.drawImage(
            this.clearDropletsGfx!,
            (x - r) * this.dropletsPixelDensity * this.scale,
            (y - r) * this.dropletsPixelDensity * this.scale,
            r * 2 * this.dropletsPixelDensity * this.scale,
            r * 2 * this.dropletsPixelDensity * this.scale * 1.5
        );
    }

    clearCanvas(this: Raindrops) {
        this.ctx!.clearRect(0, 0, this.width, this.height);
    }

    createDrop(options: any) {
        if (this.drops.length >= this.options.maxDrops * this.areaMultiplier)
            return null;

        return { ...Drop, ...options };
    }

    addDrop(drop: any) {
        if (
            this.drops.length >= this.options.maxDrops * this.areaMultiplier ||
            drop == null
        )
            return false;

        this.drops.push(drop);
        return true;
    }

    updateRain(timeScale: number) {
        let rainDrops: any[] = [];
        if (this.options.raining) {
            let limit = this.options.rainLimit * timeScale * this.areaMultiplier;
            let count = 0;
            while (
                chance(this.options.rainChance * timeScale * this.areaMultiplier) &&
                count < limit
            ) {
                count++;
                let r = random(this.options.minR, this.options.maxR, (n) => {
                    return Math.pow(n, 3);
                });
                let rainDrop = this.createDrop({
                    x: random(this.width / this.scale),
                    y: random(
                        (this.height / this.scale) * this.options.spawnArea[0],
                        (this.height / this.scale) * this.options.spawnArea[1]
                    ),
                    r: r,
                    momentum: 1 + (r - this.options.minR) * 0.1 + random(2),
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

    clearDrops() {
        this.drops.forEach((drop) => {
            setTimeout(() => {
                drop.shrink = 0.1 + random(0.5);
            }, random(1200));
        });
        this.clearTexture();
    }

    clearTexture() {
        this.textureCleaningIterations = 50;
    }

    updateDroplets(this: Raindrops, timeScale: number) {
        if (this.textureCleaningIterations > 0) {
            this.textureCleaningIterations -= 1 * timeScale;
            this.dropletsCtx!.globalCompositeOperation = "destination-out";
            this.dropletsCtx!.fillStyle = "rgba(0,0,0," + 0.05 * timeScale + ")";
            this.dropletsCtx!.fillRect(
                0,
                0,
                this.width * this.dropletsPixelDensity,
                this.height * this.dropletsPixelDensity
            );
        }
        if (this.options.raining) {
            this.dropletsCounter +=
                this.options.dropletsRate * timeScale * this.areaMultiplier;
            times(this.dropletsCounter, (i) => {
                this.dropletsCounter--;
                this.drawDroplet(
                    random(this.width / this.scale),
                    random(this.height / this.scale),
                    random(
                        this.options.dropletsSize[0],
                        this.options.dropletsSize[1],
                        (n) => n * n
                    )
                );
            });
        }
        this.ctx!.drawImage(this.droplets!, 0, 0, this.width, this.height);
    }

    updateDrops(timeScale: number) {
        let newDrops: HTMLCanvasElement[] = [];

        this.updateDroplets(timeScale);
        let rainDrops = this.updateRain(timeScale);
        newDrops = newDrops.concat(rainDrops);

        this.drops.sort((a, b) => {
            let va = a.y * (this.width / this.scale) + a.x;
            let vb = b.y * (this.width / this.scale) + b.x;
            return va > vb ? 1 : va == vb ? 0 : -1;
        });

        this.drops.forEach(function (this: Raindrops, drop, i) {
            if (!drop.killed) {
                // update gravity
                // (chance of drops "creeping down")
                if (
                    chance(
                        (drop.r - this.options.minR * this.options.dropFallMultiplier) *
                        (0.1 / this.deltaR) *
                        timeScale
                    )
                ) {
                    drop.momentum += random((drop.r / this.options.maxR) * 4);
                }
                // clean small drops
                if (
                    this.options.autoShrink &&
                    drop.r <= this.options.minR &&
                    chance(0.05 * timeScale)
                ) {
                    drop.shrink += 0.01;
                }
                //update shrinkage
                drop.r -= drop.shrink * timeScale;
                if (drop.r <= 0) drop.killed = true;

                // update trails
                if (this.options.raining) {
                    drop.lastSpawn += drop.momentum * timeScale * this.options.trailRate;
                    if (drop.lastSpawn > drop.nextSpawn) {
                        let trailDrop = this.createDrop({
                            x: drop.x + random(-drop.r, drop.r) * 0.1,
                            y: drop.y - drop.r * 0.01,
                            r: drop.r * random(...this.options.trailScaleRange),
                            spreadY: drop.momentum * 0.1,
                            parent: drop,
                        });

                        if (trailDrop != null) {
                            newDrops.push(trailDrop);

                            drop.r *= Math.pow(0.97, timeScale);
                            drop.lastSpawn = 0;
                            drop.nextSpawn =
                                random(this.options.minR, this.options.maxR) -
                                drop.momentum * 2 * this.options.trailRate +
                                (this.options.maxR - drop.r);
                        }
                    }
                }

                //normalize spread
                drop.spreadX *= Math.pow(0.4, timeScale);
                drop.spreadY *= Math.pow(0.7, timeScale);

                //update position
                let moved = drop.momentum > 0;
                if (moved && !drop.killed) {
                    drop.y += drop.momentum * this.options.globalTimeScale;
                    drop.x += drop.momentumX * this.options.globalTimeScale;
                    if (drop.y > this.height / this.scale + drop.r) {
                        drop.killed = true;
                    }
                }

                // collision
                let checkCollision = (moved || drop.isNew) && !drop.killed;
                drop.isNew = false;

                if (checkCollision) {
                    this.drops.slice(i + 1, i + 70).forEach((drop2) => {
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
                                (this.options.collisionRadius +
                                    drop.momentum *
                                    this.options.collisionRadiusIncrease *
                                    timeScale)
                            ) {
                                let pi = Math.PI;
                                let r1 = drop.r;
                                let r2 = drop2.r;
                                let a1 = pi * (r1 * r1);
                                let a2 = pi * (r2 * r2);
                                let targetR = Math.sqrt((a1 + a2 * 0.8) / pi);
                                if (targetR > this.options.maxR) {
                                    targetR = this.options.maxR;
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
                                        targetR * this.options.collisionBoostMultiplier +
                                        this.options.collisionBoost
                                    )
                                );
                            }
                        }
                    });
                }

                //slowdown momentum
                drop.momentum -=
                    Math.max(1, this.options.minR * 0.5 - drop.momentum) *
                    0.1 *
                    timeScale;
                if (drop.momentum < 0) drop.momentum = 0;
                drop.momentumX *= Math.pow(0.7, timeScale);

                if (!drop.killed) {
                    newDrops.push(drop);
                    if (moved && this.options.dropletsRate > 0)
                        this.clearDroplets(
                            drop.x,
                            drop.y,
                            drop.r * this.options.dropletsCleaningRadiusMultiplier
                        );
                    this.drawDrop(this.ctx!, drop);
                }
            }
        }, this);

        this.drops = newDrops;
    }

    update() {
        this.clearCanvas();

        let now = Date.now();
        if (this.lastRender == null) this.lastRender = now;
        let deltaT = now - this.lastRender;
        let timeScale = deltaT / ((1 / 60) * 1000);
        if (timeScale > 1.1) timeScale = 1.1;
        timeScale *= this.options.globalTimeScale;
        this.lastRender = now;

        this.updateDrops(timeScale);

        requestAnimationFrame(() => this.update());
    }
}

////-----------------------RainRenderer-------------------------
const defaultOptionsRenderer = {
    renderShadow: false,
    minRefraction: 256,
    maxRefraction: 512,
    brightness: 1,
    alphaMultiply: 20,
    alphaSubtract: 5,
    parallaxBg: 5,
    parallaxFg: 20
}

export class RainRenderer {
    constructor(
        canvas: HTMLCanvasElement,
        canvasLiquid: HTMLCanvasElement,
        imageFg: CanvasImageSource,
        imageBg: CanvasImageSource,
        imageShine = null,
        options = {}
    ) {
        this.canvas = canvas;
        this.canvasLiquid = canvasLiquid;
        this.imageShine = imageShine;
        this.imageFg = imageFg;
        this.imageBg = imageBg;
        this.options = {
            ...defaultOptionsRenderer,
            ...options
        };
        this.parallaxX = 0;
        this.parallaxY = 0;
        this.textures = [];
        this.init();
    }

    canvas: HTMLCanvasElement;
    canvasLiquid: HTMLCanvasElement;
    imageFg: any;
    imageBg: any;
    imageShine = null;
    options: any;
    width = 0;
    height = 0;
    gl: any;
    programWater: any;
    textures: any[];
    parallaxX: number;
    parallaxY: number;

    async init() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        let vertShader = await getShader("images/openmeteo/shaders/simple.vert");
        let fragShader = await getShader("images/openmeteo/shaders/water.frag");

        this.gl = new GL(this.canvas, { alpha: false }, vertShader, fragShader);
        let gl = this.gl;
        this.programWater = gl.program;

        gl.createUniform("2f", "resolution", this.width, this.height);
        gl.createUniform(
            "1f",
            "textureRatio",
            this.imageBg.width / this.imageBg.height
        );
        gl.createUniform(
            "1i",
            "renderShine",
            this.imageShine == null ? false : true
        );
        gl.createUniform("1i", "renderShadow", this.options.renderShadow);
        gl.createUniform("1f", "minRefraction", this.options.minRefraction);
        gl.createUniform(
            "1f",
            "refractionDelta",
            this.options.maxRefraction - this.options.minRefraction
        );
        gl.createUniform("1f", "brightness", this.options.brightness);
        gl.createUniform("1f", "alphaMultiply", this.options.alphaMultiply);
        gl.createUniform("1f", "alphaSubtract", this.options.alphaSubtract);
        gl.createUniform("1f", "parallaxBg", this.options.parallaxBg);
        gl.createUniform("1f", "parallaxFg", this.options.parallaxFg);

        gl.createTexture(null, 0);

        this.textures = [
            {
                name: "textureShine",
                img: this.imageShine == null ? createCanvas(2, 2) : this.imageShine,
            },
            { name: "textureFg", img: this.imageFg },
            { name: "textureBg", img: this.imageBg },
        ];

        this.textures.forEach((texture: any, i: number) => {
            gl.createTexture(texture.img, i + 1);
            gl.createUniform("1i", texture.name, i + 1);
        });

        this.draw();
    }

    draw() {
        this.gl.useProgram(this.programWater);
        this.gl.createUniform("2f", "parallax", this.parallaxX, this.parallaxY);
        this.updateTexture();
        this.gl.draw();

        requestAnimationFrame(this.draw.bind(this));
    }

    updateTextures() {
        if (this.textures.length > 0) {
            this.textures.forEach((texture: any, i: number) => {
                this.gl.activeTexture(i + 1);
                this.gl.updateTexture(texture.img);
            });
        }
    }

    updateTexture() {
        this.gl.activeTexture(0);
        this.gl.updateTexture(this.canvasLiquid);
    }

    resize() { }
}
