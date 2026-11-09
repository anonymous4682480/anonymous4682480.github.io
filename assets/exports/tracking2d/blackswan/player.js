const B = {
  "<f4": Float32Array,
  "<f8": Float64Array,
  "|u1": Uint8Array,
  "|i1": Int8Array,
  "<u2": Uint16Array,
  "<i2": Int16Array,
  "<u4": Uint32Array,
  "<i4": Int32Array
};
function P(i) {
  return (16 - i % 16) % 16;
}
function D(i) {
  const r = new DataView(i);
  if (r.getUint32(0, !0) !== 1112683588) throw new Error("not a D4RB payload");
  const b = r.getUint32(4, !0);
  if (b !== 1) throw new Error(`unsupported D4RB version ${b}`);
  const t = r.getUint32(8, !0), a = G(new Uint8Array(i, 12, t));
  let c = 12 + t;
  c += P(c);
  const d = {};
  for (const l of a.arrays) {
    const o = B[l.dtype];
    if (!o) throw new Error(`unsupported dtype ${l.dtype}`);
    const n = l.nbytes / o.BYTES_PER_ELEMENT;
    d[l.name] = {
      data: new o(i, c + l.offset, n),
      shape: l.shape,
      dtype: l.dtype,
      quant: l.quant
    };
  }
  return { arrays: d, meta: a.meta };
}
function G(i) {
  const r = new DataView(i.buffer, i.byteOffset, i.byteLength), b = new TextDecoder();
  let t = 0;
  function a() {
    const o = r.getUint8(t++);
    if (o < 128) return o;
    if (o < 144) return l(o & 15);
    if (o < 160) return d(o & 15);
    if (o < 192) return c(o & 31);
    if (o >= 224) return o - 256;
    switch (o) {
      case 192:
        return null;
      case 194:
        return !1;
      case 195:
        return !0;
      case 202: {
        const n = r.getFloat32(t, !1);
        return t += 4, n;
      }
      case 203: {
        const n = r.getFloat64(t, !1);
        return t += 8, n;
      }
      case 204:
        return r.getUint8(t++);
      case 205: {
        const n = r.getUint16(t, !1);
        return t += 2, n;
      }
      case 206: {
        const n = r.getUint32(t, !1);
        return t += 4, n;
      }
      case 207: {
        const n = Number(r.getBigUint64(t, !1));
        return t += 8, n;
      }
      case 208:
        return r.getInt8(t++);
      case 209: {
        const n = r.getInt16(t, !1);
        return t += 2, n;
      }
      case 210: {
        const n = r.getInt32(t, !1);
        return t += 4, n;
      }
      case 211: {
        const n = Number(r.getBigInt64(t, !1));
        return t += 8, n;
      }
      case 217:
        return c(r.getUint8(t++));
      case 218: {
        const n = r.getUint16(t, !1);
        return t += 2, c(n);
      }
      case 220: {
        const n = r.getUint16(t, !1);
        return t += 2, d(n);
      }
      case 222: {
        const n = r.getUint16(t, !1);
        return t += 2, l(n);
      }
      case 221: {
        const n = r.getUint32(t, !1);
        return t += 4, d(n);
      }
      case 223: {
        const n = r.getUint32(t, !1);
        return t += 4, l(n);
      }
      default:
        throw new Error(`unsupported msgpack tag 0x${o.toString(16)}`);
    }
  }
  function c(o) {
    const n = b.decode(i.subarray(t, t + o));
    return t += o, n;
  }
  function d(o) {
    return Array.from({ length: o }, a);
  }
  function l(o) {
    const n = {};
    for (let m = 0; m < o; m++) n[String(a())] = a();
    return n;
  }
  return a();
}
function V(i, r, b, t, a) {
  var q;
  const c = Number(r.meta.width), d = Number(r.meta.height), l = Number(r.meta.num_frames), [o, n] = r.meta.grid_hw, m = a.outside ? a.margin : 0, h = Math.ceil(c * (1 + m * 2)) * 2, v = Math.ceil(d * (1 + m * 2)) * 2;
  (i.width !== h || i.height !== v) && (i.width = h, i.height = v);
  const e = i.getContext("2d");
  if (e.setTransform(1, 0, 0, 1, 0, 0), e.globalAlpha = 1, e.lineCap = "round", e.lineJoin = "round", e.fillStyle = "#18181b", e.fillRect(0, 0, i.width, i.height), e.setTransform(2, 0, 0, 2, c * m * 2, d * m * 2), e.drawImage(b, 0, 0, c, d), !a.overlay) return;
  e.fillStyle = "rgba(0,0,0,0.15)", e.fillRect(0, 0, c, d), m && (e.strokeStyle = "#71717a", e.lineWidth = 0.5, e.strokeRect(0, 0, c, d));
  const A = r.arrays.uv.data, F = r.meta.visibility_kind === "binary" || (q = r.arrays.visibility_score) == null ? void 0 : q.data, _ = r.arrays.visible.data, M = r.arrays.color.data, E = (s) => F ? Number.isFinite(F[s]) && F[s] > a.threshold : _[s] > 0, N = (s) => Number.isFinite(A[s * 2]) && Number.isFinite(A[s * 2 + 1]) && (a.occluded || E(s)), C = [];
  for (let s = 0; s < o; s += a.step)
    for (let g = 0; g < n; g += a.step) C.push(s * n + g);
  const y = (s) => `rgb(${M[s * 3]},${M[s * 3 + 1]},${M[s * 3 + 2]})`;
  e.lineWidth = Math.max(0.5, a.radius * 0.65), e.globalAlpha = 0.8;
  for (const s of C) {
    e.strokeStyle = y(s), e.beginPath();
    let g = !1;
    for (let w = Math.max(0, t - a.trail); w <= t; w++) {
      const U = s * l + w;
      if (!N(U)) {
        g = !1;
        continue;
      }
      const T = A[U * 2] * c, I = A[U * 2 + 1] * d;
      g ? e.lineTo(T, I) : e.moveTo(T, I), g = !0;
    }
    e.stroke();
  }
  e.globalAlpha = 1;
  for (const s of [!1, !0])
    for (const g of C) {
      const w = g * l + t;
      !N(w) || (!a.hollow || E(w)) !== s || (e.beginPath(), e.arc(A[w * 2] * c, A[w * 2 + 1] * d, a.radius, 0, Math.PI * 2), e.fillStyle = y(g), e.strokeStyle = s ? "rgba(0,0,0,0.65)" : y(g), e.lineWidth = s ? 0.5 : Math.max(0.75, a.radius * 0.5), s && e.fill(), e.stroke());
    }
}
async function W(i, r) {
  const b = new URL(r, document.baseURI), t = await fetch(b);
  if (!t.ok) throw new Error(`Could not load tracking asset (${t.status})`);
  const a = await t.json();
  if (a.format !== "tracking2d" || a.version !== 1) throw new Error("Unsupported tracking asset format");
  const c = i.attachShadow({ mode: "open" });
  c.innerHTML = `<style>
    :host{display:block;color:#e4e4e7;font:13px system-ui;background:#18181b}
    *{box-sizing:border-box} .stage{display:flex;align-items:center;justify-content:center;min-height:160px}
    canvas{display:block;max-width:100%;max-height:70vh;object-fit:contain}
    .controls{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px}
    label{display:flex;align-items:center;gap:5px} input[type=range]{width:100px;accent-color:#38bdf8}
    .timeline{display:flex;gap:10px;align-items:center;padding:12px} .timeline input{flex:1;min-width:30px}
    button{color:inherit;background:#3f3f46;border:0;border-radius:5px;padding:6px 12px;cursor:pointer}
  </style><div class="stage"><canvas aria-label="2D tracking overlay"></canvas></div>
  <div class="timeline"><button type="button">Play</button><input aria-label="Frame" type="range" min="0" step="1"><span></span></div>
  <div class="controls"></div>`;
  const d = c.querySelector("canvas"), l = c.querySelector(".timeline input"), o = c.querySelector("button"), n = c.querySelector(".timeline span"), m = c.querySelector(".controls");
  i.dataset.controls === "false" && (m.style.display = "none", c.querySelector(".timeline").style.display = "none");
  const h = { ...a.settings }, v = a.num_tracks, e = a.num_frames, A = async (f) => {
    var S;
    const p = await fetch(new URL(f, b));
    if (!p.ok) throw new Error(`Could not load tracking data (${p.status})`);
    const k = (S = p.headers.get("content-encoding")) != null && S.includes("gzip") ? await p.arrayBuffer() : await new Response(p.body.pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
    return D(k);
  }, F = await A(a.queries), _ = new Float32Array(v * e * 2), M = new Float32Array(v * e), E = new Uint8Array(v * e), N = { meta: { ...a }, arrays: {
    ...F.arrays,
    uv: { data: _, shape: [v, e, 2], dtype: "<f4", quant: null },
    visibility_score: { data: M, shape: [v, e], dtype: "<f4", quant: null },
    visible: { data: E, shape: [v, e], dtype: "|u1", quant: null }
  } };
  for (const f of a.chunks) {
    const p = await A(f.file);
    for (const [k, S, L] of [["uv", _, 2], ["visibility_score", M, 1], ["visible", E, 1]]) {
      const R = p.arrays[k].data;
      for (let u = 0; u < v; u++)
        S.set(R.subarray(u * f.frames * L, (u + 1) * f.frames * L), (u * e + f.start) * L);
    }
  }
  const C = await Promise.all(a.frames.map(async (f) => {
    const p = new Image();
    return p.src = new URL(f.file, b).href, await p.decode(), p;
  }));
  let y = 0, q = 0, s = !1, g = 0;
  const w = /* @__PURE__ */ new Map(), U = (f, p = {}) => {
    y = Math.max(0, Math.min(e - 1, Math.floor(f))), Object.assign(h, p), h.step = Math.max(1, Math.round(h.step)), V(d, N, C[y], y, h), l.value = String(y), n.textContent = `${y + 1} / ${e}`;
    for (const [k, S] of w)
      S.type === "checkbox" ? S.checked = !!h[k] : S.value = String(h[k]);
  }, T = (f) => {
    s && (f - g >= 1e3 / h.fps && (U((y + 1) % e), g = f), q = requestAnimationFrame(T));
  }, I = () => {
    s = !1, cancelAnimationFrame(q), o.textContent = "Play";
  }, $ = () => {
    s || (s = !0, g = performance.now(), o.textContent = "Pause", q = requestAnimationFrame(T));
  };
  o.onclick = () => s ? I() : $(), l.max = String(e - 1), l.oninput = () => {
    I(), U(Number(l.value));
  };
  const x = (f, p, k, S, L = 1) => {
    const R = document.createElement("label");
    R.textContent = p;
    const u = document.createElement("input");
    return u.setAttribute("aria-label", p), u.type = k === void 0 ? "checkbox" : "range", k !== void 0 && (u.min = String(k), u.max = String(S), u.step = String(L)), u.oninput = () => U(y, { [f]: u.type === "checkbox" ? u.checked : Number(u.value) }), R.append(u), m.append(R), w.set(f, u), u;
  };
  return x("step", "Grid step", 1, 64), x("trail", "Trail frames", 0, e - 1), x("radius", "Point radius", 0.5, 8, 0.5), x("fps", "FPS", 1, 60), x("threshold", "Visibility threshold", 0, 1, 0.01).disabled = a.visibility_kind === "binary", x("hollow", "Hollow occluded points"), x("occluded", "Show occluded tracks"), x("outside", "Show outside frame"), x("margin", "Outside margin", 0, 1, 0.05), x("overlay", "Show overlay"), U(0), { draw: U, play: $, pause: I, manifest: a, data: N, settings: h, destroy: () => {
    I(), c.replaceChildren();
  } };
}
for (const i of document.querySelectorAll("[data-tracking2d]"))
  W(i, i.dataset.tracking2d).catch((r) => {
    i.textContent = `Could not load tracking asset: ${r.message}`;
  });
export {
  W as mountTracking2D
};
