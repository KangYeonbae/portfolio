import {
  Camera,
  DataTexture,
  LinearFilter,
  Mesh,
  PlaneGeometry,
  RGFormat,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  Vector4,
  WebGLRenderer,
} from "three";

// Must match scripts/compute-portrait-flow.py. Each pair of bytes is a UV offset.
const columns = 73;
const rows = 97;
const flowScale = 1152;
const bytesPerPose = columns * rows * 2;

const vertexShader = `
  uniform sampler2D flow0, flow1, flow2, flow3;
  uniform vec4 weights;
  varying vec2 uv0, uv1, uv2, uv3;
  varying vec2 portraitUv;

  vec2 matchingPoint(sampler2D flow, vec2 source) {
    vec2 grid = vec2(${columns}.0, ${rows}.0);
    vec2 cell = (source * (grid - 1.0) + 0.5) / grid;
    return clamp(source + (texture2D(flow, cell).rg * 255.0 - 128.0) / ${flowScale}.0, 0.0, 1.0);
  }

  void main() {
    vec2 source = vec2(uv.x, 1.0 - uv.y);
    portraitUv = source;
    uv0 = matchingPoint(flow0, source);
    uv1 = matchingPoint(flow1, source);
    uv2 = matchingPoint(flow2, source);
    uv3 = matchingPoint(flow3, source);
    vec2 point = uv0 * weights.x + uv1 * weights.y + uv2 * weights.z + uv3 * weights.w;
    gl_Position = vec4(point.x * 2.0 - 1.0, 1.0 - point.y * 2.0, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D photo0, photo1, photo2, photo3;
  uniform vec4 weights;
  varying vec2 uv0, uv1, uv2, uv3;
  varying vec2 portraitUv;

  void main() {
    vec4 detail = pow(weights, vec4(1.6));
    detail /= dot(detail, vec4(1.0));
    // Highlights in the eyes don't always match between photos. Use one aligned
    // texture for most of that detail while the shape itself keeps interpolating.
    vec4 nearest = vec4(1.0, 0.0, 0.0, 0.0);
    float strongest = weights.x;
    if (weights.y > strongest) { strongest = weights.y; nearest = vec4(0.0, 1.0, 0.0, 0.0); }
    if (weights.z > strongest) { strongest = weights.z; nearest = vec4(0.0, 0.0, 1.0, 0.0); }
    if (weights.w > strongest) { nearest = vec4(0.0, 0.0, 0.0, 1.0); }
    vec2 eyeBand = (portraitUv - vec2(0.51, 0.33)) / vec2(0.18, 0.045);
    detail = mix(detail, nearest, 0.82 * (1.0 - smoothstep(0.7, 1.4, length(eyeBand))));
    gl_FragColor = texture2D(photo0, uv0) * detail.x
                 + texture2D(photo1, uv1) * detail.y
                 + texture2D(photo2, uv2) * detail.z
                 + texture2D(photo3, uv3) * detail.w;
    #include <colorspace_fragment>
  }
`;

export function createPortraitMorph(canvas: HTMLCanvasElement, images: ImageBitmap[], motion: ArrayBuffer) {
  if (images.length !== 9 || motion.byteLength !== images.length * bytesPerPose) {
    throw new Error("Portrait motion data does not match the photo grid");
  }

  const context = canvas.getContext("webgl2", { antialias: true, preserveDrawingBuffer: true });
  if (!context) throw new Error("WebGL is unavailable");
  const renderer = new WebGLRenderer({ canvas, context });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xffffff);
  const photographs = images.map((image) => {
    const texture = new Texture(image);
    texture.flipY = false;
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  });
  const flows = images.map((_, index) => {
    const bytes = new Uint8Array(motion, index * bytesPerPose, bytesPerPose);
    const texture = new DataTexture(bytes, columns, rows, RGFormat);
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.needsUpdate = true;
    return texture;
  });
  const weights = new Vector4();
  const uniforms = {
    weights: { value: weights },
    photo0: { value: photographs[4] },
    photo1: { value: photographs[4] },
    photo2: { value: photographs[4] },
    photo3: { value: photographs[4] },
    flow0: { value: flows[4] },
    flow1: { value: flows[4] },
    flow2: { value: flows[4] },
    flow3: { value: flows[4] },
  };
  const geometry = new PlaneGeometry(2, 2, columns - 1, rows - 1);
  const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  const scene = new Scene();
  const camera = new Camera();
  scene.add(mesh);
  let horizontal = 0;
  let vertical = 0;

  function draw(x: number, y: number) {
    horizontal = x;
    vertical = y;
    const col = x < 0 ? 0 : 1;
    const row = y < 0 ? 0 : 1;
    const left = row * 3 + col;
    const right = left + 1;
    const u = x + 1 - col;
    const v = y + 1 - row;
    weights.set((1 - u) * (1 - v), u * (1 - v), (1 - u) * v, u * v);
    uniforms.photo0.value = photographs[left];
    uniforms.photo1.value = photographs[right];
    uniforms.photo2.value = photographs[left + 3];
    uniforms.photo3.value = photographs[right + 3];
    uniforms.flow0.value = flows[left];
    uniforms.flow1.value = flows[right];
    uniforms.flow2.value = flows[left + 3];
    uniforms.flow3.value = flows[right + 3];
    renderer.render(scene, camera);
  }

  const resize = new ResizeObserver(() => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    draw(horizontal, vertical);
  });
  resize.observe(canvas);
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  return {
    draw,
    dispose() {
      resize.disconnect();
      photographs.forEach((texture) => texture.dispose());
      flows.forEach((texture) => texture.dispose());
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
