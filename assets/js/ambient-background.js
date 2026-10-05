(() => {
  const canvas = document.querySelector("[data-mesh-shader]");
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const gl = canvas.getContext("webgl", {
    antialias: false, alpha: false, depth: false, stencil: false,
    powerPreference: "low-power",
  });
  if (!gl) return;

  const vertexSource = `attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;
  const fragmentSource = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    uniform vec2 u_resolution;
    uniform vec3 u_colors[4];

    float hash21(vec2 p) {
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }
    vec2 hash22(vec2 p) {
      float n = sin(dot(p, vec2(41.0, 289.0)));
      return fract(vec2(15731.743, 7892.321) * n);
    }
    float grainHash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
        mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p);
        p = p * 2.03 + vec2(17.0, 9.2);
        amplitude *= 0.5;
      }
      return value;
    }
    vec3 shade(vec2 p) {
      vec3 color = u_colors[0] * 0.2;
      float weight = 0.2;
      for (int i = 0; i < 4; i++) {
        float fi = float(i);
        vec2 center = (hash22(vec2(fi, 1.0)) - 0.5) * 1.666;
        float influence = exp(-dot(p - center, p - center) * 4.86);
        color += u_colors[i] * influence;
        weight += influence;
      }
      return color / weight;
    }
    void main() {
      vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy)
        / min(u_resolution.x, u_resolution.y);
      p *= 1.7;
      float cr = cos(1.2915), sr = sin(1.2915);
      p = mat2(cr, -sr, sr, cr) * p;
      p += 0.3 * (vec2(fbm(p * 3.68 + 1.0),
        fbm(p * 3.68 + vec2(5.2, 1.3))) - 0.5);
      vec3 color = shade(p);
      color = (color - 0.5) * 1.005 + 0.5;
      color += (grainHash(gl_FragCoord.xy + vec2(17.0, 31.0)) - 0.5) * 0.063;
      gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    }`;

  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("[mesh shader]", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };
  const vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) return;
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, "u_resolution");
  gl.uniform3fv(gl.getUniformLocation(program, "u_colors"), new Float32Array([
    0.9725, 0.9725, 0.9725, 1.0, 1.0, 1.0,
    0.8627, 0.8627, 0.8627, 0.9294, 0.9294, 0.9294,
  ]));

  let scheduled = 0;
  const render = () => {
    scheduled = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rawWidth = Math.max(1, Math.round(window.innerWidth * dpr));
    const rawHeight = Math.max(1, Math.round(window.innerHeight * dpr));
    const scale = Math.min(1, Math.sqrt(1500000 / (rawWidth * rawHeight)));
    const width = Math.max(1, Math.round(rawWidth * scale));
    const height = Math.max(1, Math.round(rawHeight * scale));
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(resolution, width, height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const scheduleRender = () => {
    if (!scheduled) scheduled = requestAnimationFrame(render);
  };
  window.addEventListener("resize", scheduleRender, { passive: true });
  scheduleRender();
})();
