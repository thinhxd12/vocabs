
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
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

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
