/**
 * GLSL for the Living Earth — a detailed procedural planet (no texture assets).
 * A single `uHealth` uniform in [0,1] drives every visual cue: vegetation,
 * ocean clarity, glaciers, atmosphere color, cloud color and city lights.
 *
 * Planet + clouds shade in OBJECT space (so continents rotate with the mesh)
 * using a light + camera direction that the CPU counter-rotates each frame, so
 * the sun stays fixed in the world. The atmosphere/halo shade in WORLD space.
 */

// Ashima / Stefan Gustavson simplex noise (public domain) + fbm.
const NOISE = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
float fbm(vec3 p){
  float t = 0.0; float amp = 0.5; float freq = 1.0;
  for(int i=0;i<6;i++){ t += amp * snoise(p*freq); freq *= 2.02; amp *= 0.5; }
  return t;
}
// A few big continents: a low-frequency continental shape, lightly warped,
// plus gentle high-frequency detail only for coastline ruggedness (not islands).
float terrain(vec3 p){
  vec3 w = vec3(
    fbm(p * 0.7 + vec3(0.0)),
    fbm(p * 0.7 + vec3(3.1, 1.3, 2.8)),
    fbm(p * 0.7 + vec3(6.7, 2.8, 4.6))
  );
  float base = fbm(p * 0.85 + 0.55 * w); // large, smooth landmasses
  float detail = fbm(p * 2.6) * 0.12;    // subtle coastline texture
  return base + detail;
}
`;

export const planetVertex = /* glsl */ `
varying vec3 vObjPos;
void main(){
  vObjPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const planetFragment = /* glsl */ `
uniform float uHealth;
uniform float uTime;
uniform vec3 uLightDir; // object space
uniform vec3 uCamPos;   // object space
varying vec3 vObjPos;
${NOISE}

void main(){
  vec3 P = vObjPos;
  vec3 sp = normalize(P);
  float scale = 1.0;

  float e = terrain(sp * scale);
  // Higher sea level => fewer, larger continents and far fewer tiny islands.
  float land = smoothstep(0.05, 0.11, e);
  float lat = abs(sp.y);
  float moist = fbm(sp * 2.1 + 13.0) * 0.5 + 0.5;

  // --- relief normal (object space) for mountain shading ---
  float epsd = 0.012;
  vec3 up = mix(vec3(0.0,1.0,0.0), vec3(1.0,0.0,0.0), step(0.99, abs(sp.y)));
  vec3 t1 = normalize(cross(up, sp));
  vec3 t2 = cross(sp, t1);
  float h0 = max(0.0, e);
  float h1 = max(0.0, terrain(normalize(sp + t1*epsd) * scale));
  float h2 = max(0.0, terrain(normalize(sp + t2*epsd) * scale));
  vec3 N = normalize(sp - (t1*(h1-h0) + t2*(h2-h0)) * 6.0 * land);

  // --- ocean ---
  float od = smoothstep(0.05, -0.3, e); // 0 at coast -> 1 deep
  vec3 shallow = mix(vec3(0.05,0.13,0.17), vec3(0.10,0.46,0.60), uHealth);
  vec3 deep    = mix(vec3(0.01,0.05,0.12), vec3(0.01,0.17,0.34), uHealth);
  vec3 ocean = mix(shallow, deep, od);

  // --- land biomes ---
  vec3 sand   = vec3(0.78,0.72,0.52);
  vec3 grass  = vec3(0.24,0.47,0.19);
  vec3 forest = vec3(0.05,0.27,0.11);
  vec3 desert = vec3(0.74,0.61,0.38);
  vec3 rock   = vec3(0.42,0.38,0.34);
  vec3 snow   = vec3(0.95,0.97,1.0);

  float veg = clamp(uHealth * 1.18 * moist, 0.0, 1.0);
  vec3 green = mix(grass, forest, moist);
  vec3 arid  = mix(desert, rock, smoothstep(0.25, 0.6, e));
  vec3 landc = mix(arid, green, smoothstep(0.2, 0.65, veg));

  // beaches (low coastal land)
  float beach = smoothstep(0.14, 0.07, e) * land;
  landc = mix(landc, sand, clamp(beach, 0.0, 1.0) * 0.55);
  // exposed mountain rock
  landc = mix(landc, rock, smoothstep(0.32, 0.55, e) * 0.5);
  // snow / glaciers (poles + peaks) — recover as the planet heals
  float snowLat = mix(0.92, 0.6, uHealth);
  float ice = clamp(smoothstep(snowLat, snowLat+0.06, lat) + smoothstep(0.5, 0.64, e), 0.0, 1.0)
              * mix(0.35, 1.0, uHealth);
  landc = mix(landc, snow, ice);

  vec3 base = mix(ocean, landc, land);

  // --- lighting ---
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(uCamPos - P);
  float ndl = dot(N, L);
  float wrap = clamp((ndl + 0.25) / 1.25, 0.0, 1.0); // soft terminator
  float ambient = 0.05;
  vec3 col = base * (ambient + wrap);

  // ocean sun-glint (Blinn-Phong on water only)
  vec3 Hh = normalize(L + V);
  float oceanMask = 1.0 - land;
  float spec = pow(max(dot(sp, Hh), 0.0), 90.0) * oceanMask * clamp(ndl,0.0,1.0);
  col += spec * vec3(1.0, 0.96, 0.85) * (0.6 + 0.6 * uHealth);

  // limb airglow on the lit side
  float rim = pow(1.0 - max(dot(sp, V), 0.0), 3.0);
  col += rim * clamp(ndl,0.0,1.0) * mix(vec3(0.18,0.22,0.28), vec3(0.35,0.6,1.0), uHealth) * 0.55;

  // night-side city lights
  float night = smoothstep(0.08, -0.22, ndl);
  float grid = smoothstep(0.63, 0.67, fbm(sp * 38.0));
  float city = grid * land * step(0.04, e);
  col += night * city * vec3(1.0, 0.82, 0.45) * (0.35 + 0.85 * uHealth);

  gl_FragColor = vec4(col, 1.0);
}
`;

export const cloudVertex = /* glsl */ `
varying vec3 vObjPos;
void main(){
  vObjPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const cloudFragment = /* glsl */ `
uniform float uHealth;
uniform float uTime;
uniform vec3 uLightDir; // object space
varying vec3 vObjPos;
${NOISE}
void main(){
  vec3 sp = normalize(vObjPos);
  float t = uTime * 0.01;
  float c1 = fbm(sp * 2.6 + vec3(t, 0.0, t * 0.5));
  float c2 = fbm(sp * 6.0 + vec3(-t * 1.2, t * 0.3, 0.0));
  float cloud = smoothstep(0.30, 0.85, c1 * 0.65 + c2 * 0.45);
  cloud *= smoothstep(-0.1, 0.35, c2); // wispy breakup

  float ndl = clamp(dot(sp, normalize(uLightDir)), 0.0, 1.0);
  float shade = 0.45 + 0.55 * clamp(ndl + 0.15, 0.0, 1.0);
  vec3 tint = mix(vec3(0.55,0.50,0.45), vec3(1.0), smoothstep(0.1, 0.7, uHealth));
  float alpha = cloud * shade * (0.55 + 0.4 * uHealth);
  gl_FragColor = vec4(tint * shade, alpha);
}
`;

export const shellVertex = /* glsl */ `
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main(){
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const atmosphereFragment = /* glsl */ `
uniform float uHealth;
uniform vec3 uLightDir; // world space
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main(){
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 N = normalize(vWorldNormal);
  vec3 L = normalize(uLightDir);
  float fres = pow(1.0 - clamp(dot(V, N), 0.0, 1.0), 3.0);
  float lit = clamp(dot(N, L), 0.0, 1.0);
  float scatter = pow(clamp(dot(V, L), 0.0, 1.0), 4.0); // glow toward the sun
  vec3 col = mix(vec3(0.32,0.20,0.14), vec3(0.35,0.62,1.0), smoothstep(0.1, 0.6, uHealth));
  float alpha = fres * (0.22 + 0.85 * lit) + scatter * 0.35 * lit;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;

export const glowFragment = /* glsl */ `
uniform float uHealth;
uniform vec3 uLightDir; // world space
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main(){
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 N = normalize(vWorldNormal);
  float fres = pow(1.0 - clamp(dot(V, N), 0.0, 1.0), 4.5);
  float lit = clamp(dot(N, normalize(uLightDir)), 0.0, 1.0);
  vec3 col = mix(vec3(0.10,0.22,0.5), vec3(0.22,0.5,1.0), uHealth);
  gl_FragColor = vec4(col, fres * lit * 0.45);
}
`;
