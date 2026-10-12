var H=`
attribute vec2 aPos;
attribute vec2 aUV;
attribute float aSlat;

uniform float uSlatCount;
uniform float uTurn;      // 0 = flat (day) \u2026 1 = flat (night)
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
`,O=`
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

  // Warm the shading rather than greying it \u2014 the room has no neutral black.
  vec3 shaded = col.rgb * vShade;
  shaded = mix(shaded, shaded * vec3(1.04, 0.97, 0.90), 1.0 - vShade);

  gl_FragColor = vec4(shaded, 1.0);
}
`;function z(n,N){let{dayImage:h,nightSrc:B,slats:u=9,onReady:C,onFail:d}=N,e=null,i=0,m=!1,R=!0,E=!1,y=!1;try{e=n.getContext("webgl",{alpha:!1,antialias:!0,depth:!1,powerPreference:"low-power",failIfMajorPerformanceCaveat:!0,preserveDrawingBuffer:!0})||n.getContext("experimental-webgl",{alpha:!1,depth:!1,preserveDrawingBuffer:!0})}catch{e=null}if(!e)return d?.("no-webgl"),null;let x=(t,a)=>{let r=e.createShader(t);if(e.shaderSource(r,a),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(r)||"shader compile failed");return r},o;try{if(o=e.createProgram(),e.attachShader(o,x(e.VERTEX_SHADER,H)),e.attachShader(o,x(e.FRAGMENT_SHADER,O)),e.linkProgram(o),!e.getProgramParameter(o,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(o)||"link failed")}catch(t){return d?.(String(t)),null}e.useProgram(o);let _=[],U=[],S=[],w=2/u;for(let t=0;t<u;t++){let a=-1+w*t,r=a+w,f=t/u,s=(t+1)/u;_.push(a,-1,r,-1,r,1,a,1),U.push(f,1,s,1,s,0,f,0),S.push(t,t,t,t)}let p=[];for(let t=0;t<u;t++){let a=t*4;p.push(a,a+1,a+2,a,a+2,a+3)}let v=(t,a,r)=>{let f=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,f),e.bufferData(e.ARRAY_BUFFER,new Float32Array(a),e.STATIC_DRAW);let s=e.getAttribLocation(o,t);e.enableVertexAttribArray(s),e.vertexAttribPointer(s,r,e.FLOAT,!1,0,0)};v("aPos",_,2),v("aUV",U,2),v("aSlat",S,1);let X=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,X),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(p),e.STATIC_DRAW);let l={slatCount:e.getUniformLocation(o,"uSlatCount"),turn:e.getUniformLocation(o,"uTurn"),aspect:e.getUniformLocation(o,"uAspect"),imgAspect:e.getUniformLocation(o,"uImgAspect"),depth:e.getUniformLocation(o,"uDepth"),day:e.getUniformLocation(o,"uDay"),night:e.getUniformLocation(o,"uNight"),nightReady:e.getUniformLocation(o,"uNightReady")};e.uniform1f(l.slatCount,u),e.uniform1f(l.depth,.32),e.uniform1i(l.day,0),e.uniform1i(l.night,1),e.uniform1f(l.nightReady,0);let D=t=>{let a=e.createTexture();return e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,a),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array([36,27,22,255])),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),a},M=D(0),G=D(1),b=1.5,P=(t,a,r)=>(e.activeTexture(e.TEXTURE0+a),e.bindTexture(e.TEXTURE_2D,t),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,r),r),V=(t,a,r)=>new Promise((f,s)=>{let g=new Image;g.decoding="async",g.onload=()=>{try{f(P(t,a,g))}catch(Y){s(Y)}},g.onerror=()=>s(new Error("image failed: "+r)),g.src=r}),T=0,L=0,I=0,W=2;function F(){let t=Math.min(window.devicePixelRatio||1,W),a=Math.round(n.clientWidth*t),r=Math.round(n.clientHeight*t);a===0||r===0||((n.width!==a||n.height!==r)&&(n.width=a,n.height=r,e.viewport(0,0,a,r)),e.uniform1f(l.aspect,a/r))}function k(t){if(i=0,m)return;E||(I=(t||0)*6e-5);let a=Math.sin(I)*.5+.5,r=Math.min(1,L+a*.16);T+=(r-T)*.065,e.uniform1f(l.turn,T),e.uniform1f(l.imgAspect,b),e.drawElements(e.TRIANGLES,p.length,e.UNSIGNED_SHORT,0),y||(y=!0,C?.()),c()}function c(){m||!R||document.hidden||i||(i=requestAnimationFrame(k))}let A={setTarget(t){L=Math.max(0,Math.min(1,t)),c()},setVisible(t){R=t,t?c():i&&(cancelAnimationFrame(i),i=0)},setPaused(t){E=t,t||c()},get paused(){return E},resize(){F(),c()},destroy(){m=!0,i&&cancelAnimationFrame(i),i=0;try{e.getExtension("WEBGL_lose_context")?.loseContext()}catch{}}};n.addEventListener("webglcontextlost",t=>{t.preventDefault(),A.destroy(),d?.("context-lost")}),F();try{if(!h?.complete||!h.naturalWidth)throw new Error("day image not decoded");P(M,0,h),b=h.naturalWidth/h.naturalHeight,c()}catch(t){return A.destroy(),d?.(String(t)),null}return V(G,1,B).then(()=>{m||(e.useProgram(o),e.uniform1f(l.nightReady,1),c())}).catch(()=>{}),A}export{z as createSlats};
