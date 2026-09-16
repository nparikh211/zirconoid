// <zirconoid-galaxy>: vanilla three.js port of the GPGPU Milky Way component.
// Attributes: core, accent, outer, bg (hex colors), particle-size, rotation-speed, mouse ("0" to disable),
//             camera "x,y,z", offset "x,y,z", dim (final canvas opacity, 0..1).
// Loaded as an ES module. three.js is vendored next to it; the CDN is only a fallback.
const THREE_LOCAL = new URL('../vendor/three.module.min.js', import.meta.url).href;
const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
let threePromise = null;
function loadThree() {
  if (!threePromise) threePromise = import(THREE_LOCAL).catch(() => import(THREE_CDN));
  return threePromise;
}

const CFG = { texSize: 400, maxRadius: 3.5, holeRadius: 1.2, holeEdgeBand: 1.5, arms: 1, spiralTightness: 10.75, armWidth: 0.38, diskHeight: 0.5, coreRadius: 0.22, coreHeight: 0.28, seed: 91, colorParticleRatio: 0.01, baseSize: 8, sparkleSize: 12.0, twinkleSpeed: 4.5, colorLevels: { core: 1.15, mid: 1.0, outer: 0.9, sparkle: 1.1 } };
const SMOKE_CFG = { texSize: 50, maxRadius: 3.5, holeRadius: 1.2, holeEdgeBand: 1.5, arms: 2, spiralTightness: 10.75, armWidth: 0.9, diskHeight: 0.18, orbSpeedBase: 0.2, noiseScale: 0.0, noiseStrength: 0.01, noiseSpeed: 0.0, tangentFlow: 0.3, armRestore: 1.7, radialRestore: 0.8, particleSize: 92.0, opacity: 0.05, colorLevels: { core: 1.25, cyan: 1.05, magenta: 1.1, violet: 0.95, outer: 0.75 }, seed: 7777 };
const f = (n, d = 2) => n.toFixed(d);

const SIM_FRAG = `precision highp float;uniform sampler2D uPosition;uniform sampler2D uData;uniform float uDelta;uniform float uTime;varying vec2 vUv;
void main(){vec4 pos=texture2D(uPosition,vUv);vec4 data=texture2D(uData,vUv);vec3 p=pos.xyz;float phase=pos.w;float seed=data.y;float orbSpeed=data.z;
float r=length(p.xy)+0.0001;float vTan=orbSpeed*(r/(r+0.28));float omega=vTan/r;float dAngle=omega*uDelta*.2;float cosA=cos(dAngle);float sinA=sin(dAngle);
float nx=p.x*cosA-p.y*sinA;float ny=p.x*sinA+p.y*cosA;p.x=nx;p.y=ny;p.z+=sin(uTime*0.2+seed*6.28318)*0.0001;phase=mod(phase+uDelta*(0.018+seed*0.008),1.0);gl_FragColor=vec4(p,phase);}`;

const PARTICLE_VERT = `precision highp float;uniform sampler2D uPosition;uniform float uPixelRatio;uniform float uParticleSize;attribute vec2 aRef;attribute float aRadiusFrac;attribute float aSeed;attribute float aColor;varying float vRadiusFrac;varying float vPhase;varying float vSeed;varying float vColor;
void main(){vec4 posData=texture2D(uPosition,aRef);vec3 pos=posData.xyz;vPhase=posData.w;vRadiusFrac=aRadiusFrac;vSeed=aSeed;vColor=aColor;vec4 mvPos=modelViewMatrix*vec4(pos,1.0);float depth=-mvPos.z;
float isSpecial=step(${f(1 - CFG.colorParticleRatio, 3)},aColor);float sizeFactor=pow(1.0-aRadiusFrac,1.3);float normalSz=mix(0.5,${f(CFG.baseSize, 1)},sizeFactor)*(0.7+aSeed*0.5);
float specialSz=mix(${f(CFG.sparkleSize, 1)}*0.6,${f(CFG.sparkleSize, 1)},aSeed);float sz=mix(normalSz,specialSz,isSpecial);sz*=uParticleSize;sz*=(420.0/max(depth,0.1))*uPixelRatio;
float maxSize=mix((${f(CFG.baseSize, 1)}*(2.0+aSeed*1.0)),(${f(CFG.sparkleSize, 1)}*(2.0+aSeed*1.0)),isSpecial)*uParticleSize;gl_PointSize=clamp(sz,0.4,maxSize);gl_Position=projectionMatrix*mvPos;}`;

const PARTICLE_FRAG = `precision highp float;varying float vRadiusFrac;varying float vPhase;varying float vSeed;varying float vColor;uniform vec3 uCoreColor;uniform vec3 uAccentColor;uniform vec3 uOuterColor;
void main(){vec2 uv=gl_PointCoord-0.5;float r=length(uv)*2.0;if(r>1.0)discard;float cp=exp(-r*r*14.0);float halo=exp(-r*r*3.0)*0.30;float disc=clamp(cp+halo,0.0,1.0);
float dispersion=pow(1.0-vRadiusFrac,1.05);float coreBulge=smoothstep(0.22,0.0,vRadiusFrac)*0.55;float intensity=clamp(dispersion+coreBulge,0.0,1.0);
float tRate=2.5+vSeed*${f(CFG.twinkleSpeed, 1)};float twinkle=0.78+0.22*sin(vPhase*6.28318*tRate+vSeed*17.3);intensity*=twinkle;
float isSpecial=step(${f(1 - CFG.colorParticleRatio, 3)},vColor);vec3 nCore=uCoreColor*${f(CFG.colorLevels.core)};vec3 nMid=mix(uCoreColor,uAccentColor,0.7)*${f(CFG.colorLevels.mid)};vec3 nOuter=uOuterColor*${f(CFG.colorLevels.outer)};
vec3 normalCol=mix(nCore,nMid,smoothstep(0.00,0.42,vRadiusFrac));normalCol=mix(normalCol,nOuter,smoothstep(0.42,1.00,vRadiusFrac));
float ss=fract((vColor-${f(1 - CFG.colorParticleRatio, 3)})/${f(CFG.colorParticleRatio, 3)}*5.0)*5.0;
vec3 s0=uAccentColor*${f(CFG.colorLevels.sparkle)};vec3 s1=mix(uAccentColor,uCoreColor,0.35)*${f(CFG.colorLevels.sparkle)};vec3 s2=mix(uOuterColor,uCoreColor,0.2)*${f(CFG.colorLevels.sparkle)};vec3 s3=uOuterColor*${f(CFG.colorLevels.sparkle)};vec3 s4=mix(uAccentColor,uOuterColor,0.5)*${f(CFG.colorLevels.sparkle)};
vec3 specialCol;if(ss<1.0)specialCol=mix(s0,s1,ss);else if(ss<2.0)specialCol=mix(s1,s2,ss-1.0);else if(ss<3.0)specialCol=mix(s2,s3,ss-2.0);else if(ss<4.0)specialCol=mix(s3,s4,ss-3.0);else specialCol=mix(s4,s0,ss-4.0);
intensity=mix(intensity,clamp(intensity*2.5,0.0,1.0),isSpecial);vec3 col=mix(normalCol,specialCol,isSpecial);float alpha=disc*intensity*0.90;gl_FragColor=vec4(col*alpha,alpha);}`;

const NOISE = `vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);
vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
vec3 curlNoise(vec3 p){float e=0.05;float n1,n2;vec3 curl;n1=snoise(p+vec3(0.0,e,0.0));n2=snoise(p-vec3(0.0,e,0.0));float a=(n1-n2)/(2.0*e);n1=snoise(p+vec3(0.0,0.0,e));n2=snoise(p-vec3(0.0,0.0,e));float b=(n1-n2)/(2.0*e);curl.x=a-b;
n1=snoise(p+vec3(0.0,0.0,e));n2=snoise(p-vec3(0.0,0.0,e));a=(n1-n2)/(2.0*e);n1=snoise(p+vec3(e,0.0,0.0));n2=snoise(p-vec3(e,0.0,0.0));b=(n1-n2)/(2.0*e);curl.y=a-b;
n1=snoise(p+vec3(e,0.0,0.0));n2=snoise(p-vec3(e,0.0,0.0));a=(n1-n2)/(2.0*e);n1=snoise(p+vec3(0.0,e,0.0));n2=snoise(p-vec3(0.0,e,0.0));b=(n1-n2)/(2.0*e);curl.z=a-b;return curl;}`;

const S = SMOKE_CFG;
const SMOKE_SIM_FRAG = `precision highp float;uniform sampler2D uPosition;uniform sampler2D uData;uniform float uDelta;uniform float uTime;varying vec2 vUv;${NOISE}
void main(){vec4 pos=texture2D(uPosition,vUv);vec4 data=texture2D(uData,vUv);vec3 p=pos.xyz;float phase=pos.w;float radiusFrac=data.x;float seed=data.y;float orbSpeed=data.z;float armIdxNorm=data.w;
float r=length(p.xy)+0.0001;float vTan=orbSpeed*(r/(r+0.35));float omega=vTan/r;float dAngle=omega*uDelta;float cosA=cos(dAngle);float sinA=sin(dAngle);float nx=p.x*cosA-p.y*sinA;float ny=p.x*sinA+p.y*cosA;p.x=nx;p.y=ny;
float armBase=armIdxNorm*6.28318;float targetTheta=armBase+r*${f(S.spiralTightness)};vec2 tangent=normalize(vec2(cos(targetTheta)-${f(S.spiralTightness)}*r*sin(targetTheta),sin(targetTheta)+${f(S.spiralTightness)}*r*cos(targetTheta)));
p.xy+=tangent*${f(S.tangentFlow)}*(0.85+radiusFrac*0.45)*uDelta;float currentTheta=atan(p.y,p.x);float angleDelta=atan(sin(targetTheta-currentTheta),cos(targetTheta-currentTheta));vec2 radialDir=normalize(p.xy);vec2 armNormal=vec2(-tangent.y,tangent.x);
p.xy+=armNormal*angleDelta*r*${f(S.armRestore)}*uDelta;p.xy+=radialDir*((radiusFrac*${f(S.maxRadius)})-r)*${f(S.radialRestore)}*uDelta;
vec3 noiseCoord=p*${f(S.noiseScale)}+vec3(uTime*${f(S.noiseSpeed)});vec3 curl=curlNoise(noiseCoord);p.xy+=curl.xy*${f(S.noiseStrength, 3)}*uDelta;p.z+=curl.z*${f(S.noiseStrength, 3)}*0.08*uDelta;p.z*=0.975;p.z+=sin(uTime*0.12+seed*6.28318)*0.00012;
phase=mod(phase+uDelta*(0.012+seed*0.006),1.0);gl_FragColor=vec4(p,phase);}`;

const SMOKE_VERT = `precision highp float;uniform sampler2D uPosition;uniform float uPixelRatio;uniform float uTime;uniform float uParticleSize;attribute vec2 aRef;attribute float aRadiusFrac;attribute float aSeed;varying float vRadiusFrac;varying float vPhase;varying float vSeed;
void main(){vec4 posData=texture2D(uPosition,aRef);vec3 pos=posData.xyz;vPhase=posData.w;vRadiusFrac=aRadiusFrac;vSeed=aSeed;vec4 mvPos=modelViewMatrix*vec4(pos,1.0);float depth=-mvPos.z;float sizeFactor=mix(0.6,1.0,1.0-aRadiusFrac);
float sz=${f(S.particleSize, 1)}*uParticleSize*sizeFactor*(0.7+aSeed*0.6);sz*=(420.0/max(depth,0.1))*uPixelRatio;gl_PointSize=clamp(sz,2.0,${f(S.particleSize, 1)}*uParticleSize*3.0);gl_Position=projectionMatrix*mvPos;}`;

const SMOKE_FRAG = `precision highp float;varying float vRadiusFrac;varying float vPhase;varying float vSeed;uniform vec3 uCoreColor;uniform vec3 uAccentColor;uniform vec3 uOuterColor;
void main(){vec2 uv=gl_PointCoord-0.5;uv.x*=2.1;uv.y*=0.72;float r=length(uv)*2.0;if(r>1.0)discard;float core=exp(-dot(uv,uv)*3.4);float halo=exp(-dot(uv,uv)*0.75)*0.9;float shape=clamp(core+halo,0.0,1.0);
float streak=0.72+0.28*smoothstep(0.42,0.0,abs(uv.y));float radialFade=pow(1.0-vRadiusFrac,0.72);float coreBright=smoothstep(0.32,0.0,vRadiusFrac)*0.22;float intensity=clamp(radialFade+coreBright,0.0,1.0);
float flow=0.88+0.12*sin(vPhase*6.28318*1.0+vSeed*8.0);intensity*=flow*streak;
vec3 cCore=uCoreColor*${f(S.colorLevels.core)};vec3 cCyan=uAccentColor*${f(S.colorLevels.cyan)};vec3 cMagenta=mix(uAccentColor,uOuterColor,0.35)*${f(S.colorLevels.magenta)};vec3 cViolet=mix(uCoreColor,uAccentColor,0.45)*${f(S.colorLevels.violet)};vec3 cOuter=uOuterColor*${f(S.colorLevels.outer)};
float colorNoise=fract(vSeed*13.371+vRadiusFrac*2.71);vec3 col=mix(cCore,cCyan,smoothstep(0.00,0.28,vRadiusFrac));col=mix(col,cMagenta,smoothstep(0.18,0.52,vRadiusFrac+(colorNoise-0.5)*0.18));col=mix(col,cViolet,smoothstep(0.42,0.78,vRadiusFrac+(colorNoise-0.5)*0.22));col=mix(col,cOuter,smoothstep(0.72,1.00,vRadiusFrac));
float cyanMix=smoothstep(0.15,0.85,sin(vSeed*19.0+vRadiusFrac*11.0)*0.5+0.5);float magentaMix=smoothstep(0.2,0.9,cos(vSeed*23.0-vRadiusFrac*8.0)*0.5+0.5);col=mix(col,cCyan,cyanMix*0.18);col=mix(col,cMagenta,magentaMix*0.22);
float alpha=shape*intensity*${f(S.opacity, 3)};gl_FragColor=vec4(col*alpha,alpha);}`;

function mulberry32(seed) { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }

class GPUCompute {
  constructor(THREE, w, h, renderer) {
    this.T = THREE; this.w = w; this.h = h; this.gl = renderer; this.vars = {};
    this.geo = new THREE.PlaneGeometry(2, 2); this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); this.scene = new THREE.Scene();
  }
  rt() { const T = this.T; return new T.WebGLRenderTarget(this.w, this.h, { wrapS: T.ClampToEdgeWrapping, wrapT: T.ClampToEdgeWrapping, minFilter: T.NearestFilter, magFilter: T.NearestFilter, format: T.RGBAFormat, type: T.FloatType, depthBuffer: false, stencilBuffer: false }); }
  addVar(name, frag, initTex) {
    const T = this.T;
    const simMat = new T.ShaderMaterial({ uniforms: { uPosition: { value: initTex }, uData: { value: null }, uDelta: { value: 0 }, uTime: { value: 0 } }, vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}', fragmentShader: frag });
    const rtA = this.rt(), rtB = this.rt();
    const blit = new T.Mesh(this.geo, new T.MeshBasicMaterial({ map: initTex }));
    this.scene.add(blit); this.gl.setRenderTarget(rtA); this.gl.render(this.scene, this.cam); this.scene.remove(blit); blit.material.dispose(); this.gl.setRenderTarget(null);
    this.vars[name] = { simMat, mesh: new T.Mesh(this.geo, simMat), rtA, rtB };
  }
  compute(name, time, delta, dataTex) {
    const v = this.vars[name]; v.simMat.uniforms.uTime.value = time; v.simMat.uniforms.uDelta.value = delta; v.simMat.uniforms.uData.value = dataTex;
    const tmp = v.rtA; v.rtA = v.rtB; v.rtB = tmp; v.simMat.uniforms.uPosition.value = v.rtB.texture;
    this.scene.add(v.mesh); this.gl.setRenderTarget(v.rtA); this.gl.render(this.scene, this.cam); this.scene.remove(v.mesh); this.gl.setRenderTarget(null);
    return v.rtA.texture;
  }
  dispose() { Object.values(this.vars).forEach(v => { v.rtA.dispose(); v.rtB.dispose(); v.simMat.dispose(); }); this.geo.dispose(); }
}

function mkTex(T, arr, S) { const t = new T.DataTexture(arr, S, S, T.RGBAFormat, T.FloatType); t.needsUpdate = true; t.minFilter = t.magFilter = T.NearestFilter; return t; }

function buildTextures(T, cfg) {
  const { texSize: S, maxRadius, holeRadius, holeEdgeBand, arms, spiralTightness, armWidth, diskHeight, coreRadius, coreHeight, seed } = cfg;
  const total = S * S, posArr = new Float32Array(total * 4), dataArr = new Float32Array(total * 4), rand = mulberry32(seed);
  for (let i = 0; i < total; i++) {
    const r0 = rand(); let r, inBulge = false;
    if (r0 < 0.18) { r = Math.abs(rand() + rand() + rand() - 1.5) * coreRadius * 1.1; inBulge = true; } else { r = -Math.log(1.0 - rand() * 0.9999) * (maxRadius * 0.35); r = Math.min(r, maxRadius); }
    let inHoleEdge = false; if (r < holeRadius) { r = holeRadius + rand() * holeEdgeBand; inBulge = false; inHoleEdge = true; }
    const radiusFrac = Math.min(r / maxRadius, 1.0); const armIdx = Math.floor(rand() * arms); const armBase = (armIdx / arms) * Math.PI * 2;
    let g = rand() + rand() + rand(); g = (g / 3 - 0.5) * 2.0; const scatter = armWidth * r * (inBulge ? 3.0 : 1.0);
    const theta = inHoleEdge ? (rand() * Math.PI * 2 + g * (armWidth * holeRadius * 3.0)) : (armBase + r * spiralTightness + g * scatter);
    let gz = rand() + rand() + rand(); gz = (gz / 3 - 0.5) * 2.0; const zScale = inBulge ? coreHeight : diskHeight * (0.5 + radiusFrac * 0.5);
    posArr[i * 4] = r * Math.cos(theta); posArr[i * 4 + 1] = r * Math.sin(theta); posArr[i * 4 + 2] = gz * zScale; posArr[i * 4 + 3] = rand();
    const orbSpeed = inBulge ? 0.55 + rand() * 0.15 : 0.30 + radiusFrac * 0.22 + rand() * 0.08;
    dataArr[i * 4] = radiusFrac; dataArr[i * 4 + 1] = rand(); dataArr[i * 4 + 2] = orbSpeed; dataArr[i * 4 + 3] = armIdx / arms;
  }
  return { posTex: mkTex(T, posArr, S), dataTex: mkTex(T, dataArr, S) };
}
function buildGeo(T, cfg) {
  const { texSize: S, maxRadius, holeRadius, coreRadius, seed } = cfg; const count = S * S;
  const refs = new Float32Array(count * 2), rfrac = new Float32Array(count), seeds = new Float32Array(count), colors = new Float32Array(count), rand = mulberry32(seed + 99);
  for (let i = 0; i < count; i++) {
    refs[i * 2] = ((i % S) + 0.5) / S; refs[i * 2 + 1] = (Math.floor(i / S) + 0.5) / S;
    const r0 = rand(); let r; if (r0 < 0.18) r = Math.abs(rand() + rand() + rand() - 1.5) * coreRadius * 1.1; else { r = -Math.log(1.0 - rand() * 0.9999) * (maxRadius * 0.35); r = Math.min(r, maxRadius); }
    if (r < holeRadius) r = holeRadius + rand() * 0.06;
    rfrac[i] = Math.min(r / maxRadius, 1.0); seeds[i] = rand(); colors[i] = rand();
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(new Float32Array(count * 3), 3)); geo.setAttribute('aRef', new T.BufferAttribute(refs, 2)); geo.setAttribute('aRadiusFrac', new T.BufferAttribute(rfrac, 1)); geo.setAttribute('aSeed', new T.BufferAttribute(seeds, 1)); geo.setAttribute('aColor', new T.BufferAttribute(colors, 1));
  return geo;
}
function buildSmokeTextures(T, cfg) {
  const S = cfg.texSize, total = S * S, posArr = new Float32Array(total * 4), dataArr = new Float32Array(total * 4), rand = mulberry32(cfg.seed);
  for (let i = 0; i < total; i++) {
    let r = -Math.log(1.0 - rand() * 0.9999) * (cfg.maxRadius * 0.34); r = Math.min(r, cfg.maxRadius); let inHoleEdge = false;
    if (r < cfg.holeRadius) { r = cfg.holeRadius + rand() * cfg.holeEdgeBand; inHoleEdge = true; }
    const radiusFrac = Math.min(r / cfg.maxRadius, 1.0); const armIdx = Math.floor(rand() * cfg.arms); const armBase = (armIdx / cfg.arms) * Math.PI * 2;
    let g = rand() + rand() + rand(); g = (g / 3 - 0.5) * 2.0; const scatter = cfg.armWidth * r;
    const theta = inHoleEdge ? (rand() * Math.PI * 2 + g * (cfg.armWidth * cfg.holeRadius * 2.0)) : (armBase + r * cfg.spiralTightness + g * scatter);
    let gz = rand() + rand() + rand(); gz = (gz / 3 - 0.5) * 2.0;
    posArr[i * 4] = r * Math.cos(theta); posArr[i * 4 + 1] = r * Math.sin(theta); posArr[i * 4 + 2] = gz * cfg.diskHeight * (0.6 + radiusFrac * 0.4); posArr[i * 4 + 3] = rand();
    dataArr[i * 4] = radiusFrac; dataArr[i * 4 + 1] = rand(); dataArr[i * 4 + 2] = cfg.orbSpeedBase + radiusFrac * 0.08 + rand() * 0.04; dataArr[i * 4 + 3] = armIdx / cfg.arms;
  }
  return { posTex: mkTex(T, posArr, S), dataTex: mkTex(T, dataArr, S) };
}
function buildSmokeGeo(T, cfg) {
  const S = cfg.texSize, count = S * S, refs = new Float32Array(count * 2), rfrac = new Float32Array(count), seeds = new Float32Array(count), rand = mulberry32(cfg.seed + 200);
  for (let i = 0; i < count; i++) {
    refs[i * 2] = ((i % S) + 0.5) / S; refs[i * 2 + 1] = (Math.floor(i / S) + 0.5) / S;
    let r = -Math.log(1.0 - rand() * 0.9999) * (cfg.maxRadius * 0.34); r = Math.min(r, cfg.maxRadius); if (r < cfg.holeRadius) r = cfg.holeRadius + rand() * cfg.holeEdgeBand;
    rfrac[i] = Math.min(r / cfg.maxRadius, 1.0); seeds[i] = rand();
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(new Float32Array(count * 3), 3)); geo.setAttribute('aRef', new T.BufferAttribute(refs, 2)); geo.setAttribute('aRadiusFrac', new T.BufferAttribute(rfrac, 1)); geo.setAttribute('aSeed', new T.BufferAttribute(seeds, 1));
  return geo;
}

class ZirconoidGalaxy extends HTMLElement {
  static get observedAttributes() { return ['core', 'accent', 'outer', 'bg', 'particle-size', 'rotation-speed', 'mouse']; }
  connectedCallback() {
    if (this._started) return; this._started = true;
    this.style.display = 'block'; this.style.position = this.style.position || 'relative'; this.style.overflow = 'hidden'; if (!this.style.height) this.style.height = '100%'; if (!this.style.width) this.style.width = '100%'; if (!this.clientHeight) this.style.minHeight = '400px';
    this._init().catch(e => console.warn('galaxy failed', e));
  }
  attributeChangedCallback() { this._applyAttrs && this._applyAttrs(); }
  disconnectedCallback() { this._alive = false; this._started = false; this._ro && this._ro.disconnect(); this._io && this._io.disconnect(); this._dispose && this._dispose(); this._dispose = null; this.replaceChildren(); }
  async _init() {
    const T = await loadThree(); if (!this.isConnected) return; this._alive = true;
    const deg = T.MathUtils.degToRad;
    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', opacity: '0', transition: 'opacity 1.6s ease' });
    this.appendChild(canvas);
    const renderer = new T.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', alpha: true });
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); renderer.setPixelRatio(dpr);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(45, 1, 0.01, 200);
    const cam = (this.getAttribute('camera') || '-1,-1.8,4').split(',').map(Number); camera.position.set(cam[0], cam[1], cam[2]); camera.lookAt(0, 0, 0);
    const off = (this.getAttribute('offset') || '-1.2,0.5,0').split(',').map(Number);
    const dim = this.getAttribute('dim') || '1';

    const mkMat = (vert, frag, posTex, extra) => new T.ShaderMaterial({ uniforms: Object.assign({ uPosition: { value: posTex }, uPixelRatio: { value: dpr }, uTime: { value: 0 }, uParticleSize: { value: 1 }, uCoreColor: { value: new T.Color('#ffffff') }, uAccentColor: { value: new T.Color('#ffffff') }, uOuterColor: { value: new T.Color('#ffffff') } }, extra || {}), vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false, blending: T.AdditiveBlending });

    const gal = buildTextures(T, CFG), galGeo = buildGeo(T, CFG), galMat = mkMat(PARTICLE_VERT, PARTICLE_FRAG, gal.posTex);
    const smk = buildSmokeTextures(T, SMOKE_CFG), smkGeo = buildSmokeGeo(T, SMOKE_CFG), smkMat = mkMat(SMOKE_VERT, SMOKE_FRAG, smk.posTex);
    const gpu = new GPUCompute(T, CFG.texSize, CFG.texSize, renderer); gpu.addVar('pos', SIM_FRAG, gal.posTex);
    const sgpu = new GPUCompute(T, SMOKE_CFG.texSize, SMOKE_CFG.texSize, renderer); sgpu.addVar('smokePos', SMOKE_SIM_FRAG, smk.posTex);

    // background stars
    const starCount = 4000, sp = new Float32Array(starCount * 3), rand = mulberry32(12345);
    for (let i = 0; i < starCount; i++) { const th = rand() * Math.PI * 2, ph = Math.acos(2 * rand() - 1), r = 40 + rand() * 20; sp[i * 3] = r * Math.sin(ph) * Math.cos(th); sp[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); sp[i * 3 + 2] = r * Math.cos(ph); }
    const starGeo = new T.BufferGeometry(); starGeo.setAttribute('position', new T.BufferAttribute(sp, 3));
    const starMat = new T.PointsMaterial({ color: '#ffffff', size: 0.055, sizeAttenuation: true, transparent: true, opacity: 0.7, depthWrite: false });
    scene.add(new T.Points(starGeo, starMat));

    const outer = new T.Group(); outer.rotation.set(deg(-10), 0, 0); outer.position.set(off[0], off[1], off[2]); scene.add(outer);
    const mouseGroup = new T.Group(); const BASE = [deg(110), deg(-10), 0]; mouseGroup.rotation.set(BASE[0], BASE[1], BASE[2]); outer.add(mouseGroup);
    const inner = new T.Group(); inner.scale.setScalar(1.65); inner.rotation.set(deg(40), 0, deg(-5)); mouseGroup.add(inner);
    inner.add(new T.Points(galGeo, galMat)); const smokePts = new T.Points(smkGeo, smkMat); smokePts.visible = false; inner.add(smokePts);

    let particleSize = 1, rotationSpeed = 0.2, mouseOn = true;
    this._applyAttrs = () => {
      const core = this.getAttribute('core') || '#f5f5ff', accent = this.getAttribute('accent') || '#ffe6ad', outerC = this.getAttribute('outer') || '#e05c12', bg = this.getAttribute('bg');
      for (const m of [galMat, smkMat]) { m.uniforms.uCoreColor.value.set(core); m.uniforms.uAccentColor.value.set(accent); m.uniforms.uOuterColor.value.set(outerC); }
      starMat.color.set(core);
      particleSize = T.MathUtils.clamp(parseFloat(this.getAttribute('particle-size')) || 1, 0.2, 3);
      rotationSpeed = T.MathUtils.clamp(parseFloat(this.getAttribute('rotation-speed') ?? '0.2'), 0, 2);
      mouseOn = this.getAttribute('mouse') !== '0';
      galMat.uniforms.uParticleSize.value = particleSize; smkMat.uniforms.uParticleSize.value = particleSize;
      if (bg) renderer.setClearColor(new T.Color(bg), 1); else renderer.setClearColor(0x000000, 0);
    };
    this._applyAttrs();

    const resize = () => { const w = this.clientWidth || 1, h = this.clientHeight || 1; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    resize(); this._ro = new ResizeObserver(resize); this._ro.observe(this);

    const mouse = { x: 0, y: 0 }, smooth = { x: 0, y: 0 }; let autoRot = 0;
    const onMove = e => { mouse.x = (e.clientX / (window.innerWidth || 1)) * 2 - 1; mouse.y = (e.clientY / (window.innerHeight || 1)) * 2 - 1; };
    window.addEventListener('mousemove', onMove, { passive: true });
    this._dispose = () => { window.removeEventListener('mousemove', onMove); gpu.dispose(); sgpu.dispose(); galGeo.dispose(); smkGeo.dispose(); starGeo.dispose(); galMat.dispose(); smkMat.dispose(); starMat.dispose(); renderer.dispose(); };
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let onscreen = true, frames = 0, last = performance.now(), clock = 0;
    this._io = new IntersectionObserver(es => { for (const e of es) onscreen = e.isIntersecting; }, { rootMargin: '256px' }); this._io.observe(this);
    const tick = (now) => {
      if (!this._alive) return; requestAnimationFrame(tick);
      if (!onscreen || document.hidden) { last = now; return; }
      const raw = Math.min((now - last) / 1000, 0.05); last = now; clock += raw;
      const dt = reduce ? 0 : raw * rotationSpeed;
      galMat.uniforms.uPosition.value = gpu.compute('pos', clock, dt, gal.dataTex);
      if (frames > 24) { smokePts.visible = true; smkMat.uniforms.uPosition.value = sgpu.compute('smokePos', clock, dt, smk.dataTex); smkMat.uniforms.uTime.value = clock; }
      if (!reduce) {
        const t = 1 - Math.exp(-1 * raw); smooth.x += (mouse.x - smooth.x) * t; smooth.y += (mouse.y - smooth.y) * t; autoRot += raw * rotationSpeed * 0.18;
        const m = mouseOn ? 1 : 0;
        mouseGroup.rotation.x = BASE[0] - smooth.y * 0.1 * m; mouseGroup.rotation.y = BASE[1] - smooth.x * 0.12 * m; mouseGroup.rotation.z = autoRot + smooth.x * smooth.y * 0.03 * m;
      }
      renderer.render(scene, camera);
      frames++; if (frames === 24) { canvas.style.opacity = dim; this.setAttribute('data-ready', ''); this.dispatchEvent(new CustomEvent('galaxy-ready')); }
    };
    requestAnimationFrame(tick);
  }
}
if (!customElements.get('zirconoid-galaxy')) customElements.define('zirconoid-galaxy', ZirconoidGalaxy);
