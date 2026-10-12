/**
 * Hero slats — the signature interaction.
 *
 * The room, cut into vertical slats that rotate on their Y axis like a louvre.
 * Face-on they form one continuous photograph. Turned, they resolve into a
 * rhythm of vertical strokes — the | | | mark. Turn further and the reverse
 * faces carry the same room in evening light: day becomes night by turning.
 *
 * Raw WebGL, no framework. Three quads' worth of work does not justify 140 kB
 * of library. The whole module is ~7 kB and is imported dynamically, so devices
 * that will not run it never download it.
 *
 * Contract with the rest of the page:
 *  · The static <picture> underneath is the LCP element and the permanent
 *    fallback. This module only ever fades a canvas in ON TOP of it, and only
 *    after a frame has actually rendered.
 *  · Any failure at any point calls destroy() and leaves the photograph.
 *  · Renders only while visible and while the document is not hidden.
 */

const VERT = `
attribute vec2 aPos;
attribute vec2 aUV;
attribute float aSlat;

uniform float uSlatCount;
uniform float uTurn;      // 0 = flat (day) … 1 = flat (night)
uniform float uAspect;    // canvas w/h
uniform float uImgAspect; // texture w/h
uniform float uDepth;     // perspective strength

varying vec2 vUV;
varying float vShade;
varying float vFace;

void main() {
  float slatW = 2.0 / uSlatCount;

  // Centre of this slat in clip space, and the local x within it.
  float centre = -1.0 + slatW * (aSlat + 0.5);
  float localX = aPos.x - centre;

  // Each slat lags its neighbour slightly, so the turn travels across the
  // image like a wave instead of flipping as one rigid board.
  float lag = (aSlat / max(uSlatCount - 1.0, 1.0)) * 0.22;
  float t = clamp((uTurn - lag) / (1.0 - 0.22), 0.0, 1.0);
  float angle = t * 3.14159265;

  float c = cos(angle);
  float s = sin(angle);

  // Rotate the slat about its own vertical axis.
  float x = localX * c;
  float z = localX * s;

  // Cheap perspective: push rotated edges away from the viewer.
  float persp = 1.0 / (1.0 + z * uDepth);

  vec2 pos = vec2((centre + x) * persp, aPos.y * persp);

  // Shade by how edge-on the slat is, so the turn reads as a solid object
  // catching light rather than a cross-fade.
  vShade = 0.45 + 0.55 * abs(c);
  vFace = step(0.0, c); // 1 = front (day), 0 = back (night)

  // Cover-fit the texture to the canvas.
  vec2 uv = aUV;
  float canvasA = uAspect;
  float imgA = uImgAspect;
  if (canvasA > imgA) {
    float scale = imgA / canvasA;
    uv.y = (uv.y - 0.5) * scale + 0.5;
  } else {
    float scale = canvasA / imgA;
    uv.x = (uv.x - 0.5) * scale + 0.5;
  }
  vUV = uv;

  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

const FRAG = `
precision mediump float;

uniform sampler2D uDay;
uniform sampler2D uNight;
uniform float uNightReady;

varying vec2 vUV;
varying float vShade;
varying float vFace;

void main() {
  // Back faces are mirrored, as a real slat's reverse would be.
  vec2 uvBack = vec2(1.0 - vUV.x, vUV.y);

  vec4 day = texture2D(uDay, vUV);
  vec4 night = uNightReady > 0.5 ? texture2D(uNight, uvBack) : day;

  vec4 col = mix(night, day, vFace);

  // Warm the shading rather than greying it — the room has no neutral black.
  vec3 shaded = col.rgb * vShade;
  shaded = mix(shaded, shaded * vec3(1.04, 0.97, 0.90), 1.0 - vShade);

  gl_FragColor = vec4(shaded, 1.0);
}
`;

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{dayImage: HTMLImageElement, nightSrc: string, slats?: number,
 *          onReady?: () => void, onFail?: (why: string) => void}} opts
 *   `dayImage` is the hero's own <img>, already fetched and decoded by the
 *   browser, so the day face costs nothing extra.
 */
export function createSlats(canvas, opts) {
  const { dayImage, nightSrc, slats = 9, onReady, onFail } = opts;

  let gl = null;
  let raf = 0;
  let destroyed = false;
  let visible = true;
  let paused = false;
  let ready = false;

  try {
    gl =
      canvas.getContext('webgl', {
        alpha: false,
        antialias: true,
        depth: false,
        powerPreference: 'low-power',
        failIfMajorPerformanceCaveat: true,
        // Required, not an optimisation knob. This canvas deliberately stops
        // rendering when the hero is offscreen or the tab is hidden; without
        // preservation the drawing buffer is cleared after each composite, so
        // the first paused frame would leave an empty canvas sitting on top of
        // the hero photograph. Keeping the last frame costs one buffer copy.
        preserveDrawingBuffer: true,
      }) ||
      canvas.getContext('experimental-webgl', {
        alpha: false,
        depth: false,
        preserveDrawingBuffer: true,
      });
  } catch (_) {
    gl = null;
  }

  if (!gl) {
    onFail?.('no-webgl');
    return null;
  }

  // ── Shader setup ─────────────────────────────────────────────────────────
  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(sh) || 'shader compile failed');
    }
    return sh;
  };

  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(prog) || 'link failed');
    }
  } catch (err) {
    onFail?.(String(err));
    return null;
  }

  gl.useProgram(prog);

  // ── Geometry: two triangles per slat ─────────────────────────────────────
  const pos = [];
  const uv = [];
  const idx = [];
  const slatW = 2 / slats;

  for (let i = 0; i < slats; i++) {
    const x0 = -1 + slatW * i;
    const x1 = x0 + slatW;
    const u0 = i / slats;
    const u1 = (i + 1) / slats;

    pos.push(x0, -1, x1, -1, x1, 1, x0, 1);
    uv.push(u0, 1, u1, 1, u1, 0, u0, 0);
    idx.push(i, i, i, i);
  }

  const elems = [];
  for (let i = 0; i < slats; i++) {
    const b = i * 4;
    elems.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }

  const bind = (name, data, size) => {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, name);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
  };

  bind('aPos', pos, 2);
  bind('aUV', uv, 2);
  bind('aSlat', idx, 1);

  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(elems), gl.STATIC_DRAW);

  const U = {
    slatCount: gl.getUniformLocation(prog, 'uSlatCount'),
    turn: gl.getUniformLocation(prog, 'uTurn'),
    aspect: gl.getUniformLocation(prog, 'uAspect'),
    imgAspect: gl.getUniformLocation(prog, 'uImgAspect'),
    depth: gl.getUniformLocation(prog, 'uDepth'),
    day: gl.getUniformLocation(prog, 'uDay'),
    night: gl.getUniformLocation(prog, 'uNight'),
    nightReady: gl.getUniformLocation(prog, 'uNightReady'),
  };

  gl.uniform1f(U.slatCount, slats);
  gl.uniform1f(U.depth, 0.32);
  gl.uniform1i(U.day, 0);
  gl.uniform1i(U.night, 1);
  gl.uniform1f(U.nightReady, 0);

  // ── Textures ─────────────────────────────────────────────────────────────
  const makeTex = (unit) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    // 1×1 warm placeholder so the first frame is never transparent.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([36, 27, 22, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  };

  const texDay = makeTex(0);
  const texNight = makeTex(1);
  let imgAspect = 1.5;

  /** Upload a decoded image into a texture unit. */
  const upload = (tex, unit, img) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    return img;
  };

  const loadInto = (tex, unit, src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        try {
          resolve(upload(tex, unit, img));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('image failed: ' + src));
      img.src = src;
    });

  // ── Animation state ──────────────────────────────────────────────────────
  let turn = 0;
  let target = 0;
  let drift = 0;
  const DPR_CAP = 2;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (w === 0 || h === 0) return;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform1f(U.aspect, w / h);
  }

  function frame(now) {
    raf = 0;
    if (destroyed) return;

    // A slow continuous drift, so the hero is alive without demanding anything.
    if (!paused) drift = (now || 0) * 0.00006;

    const wobble = Math.sin(drift) * 0.5 + 0.5; // 0…1
    const want = Math.min(1, target + wobble * 0.16);

    turn += (want - turn) * 0.065;

    gl.uniform1f(U.turn, turn);
    gl.uniform1f(U.imgAspect, imgAspect);
    gl.drawElements(gl.TRIANGLES, elems.length, gl.UNSIGNED_SHORT, 0);

    if (!ready) {
      ready = true;
      onReady?.();
    }

    schedule();
  }

  function schedule() {
    if (destroyed || !visible || document.hidden) return;
    if (raf) return;
    raf = requestAnimationFrame(frame);
  }

  // ── Public surface ───────────────────────────────────────────────────────
  const api = {
    /** 0…1 — driven by scroll progress through the hero. */
    setTarget(v) {
      target = Math.max(0, Math.min(1, v));
      schedule();
    },
    setVisible(v) {
      visible = v;
      if (v) schedule();
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    },
    setPaused(v) {
      paused = v;
      if (!v) schedule();
    },
    get paused() {
      return paused;
    },
    resize() {
      resize();
      schedule();
    },
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      try {
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      } catch (_) {}
    },
  };

  // Lose-context must not leave a blank canvas sitting over the photograph.
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    api.destroy();
    onFail?.('context-lost');
  });

  resize();

  // Day face: the hero's own <img>, already decoded. No extra request.
  try {
    if (!dayImage?.complete || !dayImage.naturalWidth) {
      throw new Error('day image not decoded');
    }
    upload(texDay, 0, dayImage);
    imgAspect = dayImage.naturalWidth / dayImage.naturalHeight;
    schedule();
  } catch (err) {
    api.destroy();
    onFail?.(String(err));
    return null;
  }

  // Night face is an enhancement loaded after; day-only is a valid state.
  loadInto(texNight, 1, nightSrc)
    .then(() => {
      if (destroyed) return;
      gl.useProgram(prog);
      gl.uniform1f(U.nightReady, 1);
      schedule();
    })
    .catch(() => {});

  return api;
}
