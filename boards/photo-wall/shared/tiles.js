/* Photo wall design board: PLACEHOLDER photo source.
   Generates flat-illustration pet tiles on the fly so every concept can be tested at 300+ photos
   without stock licensing. Each tile is stamped PLACEHOLDER. No pet names anywhere.

   The data shape matches what the intake pipeline (INTAKE.md) will emit as photos.json:
     { id, kind: "dog"|"cat", service, area, month: "2026-01", w, h, thumb, full }
   Swap PW.photos for the real JSON and the concepts keep working.

   Usage: PW.photos (array), PW.thumb(p) -> data URL (cached), PW.full(p) -> data URL,
          PW.caption(p), PW.AREAS, PW.SERVICES, PW.count */
(function () {
  var N = parseInt(new URLSearchParams(location.search).get("n") || "320", 10);

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function wpick(r, arr) { // [{v, w}]
    var tot = 0, i; for (i = 0; i < arr.length; i++) tot += arr[i].w;
    var x = r() * tot; for (i = 0; i < arr.length; i++) { x -= arr[i].w; if (x <= 0) return arr[i].v; }
    return arr[arr.length - 1].v;
  }

  // Rough areas only. Never addresses, never neighborhoods finer than this.
  var AREAS = [
    { key: "slc", name: "Salt Lake City", w: 44 },
    { key: "pc", name: "Park City", w: 26 },
    { key: "sny", name: "Snyderville", w: 16 },
    { key: "heb", name: "Heber Valley", w: 14 }
  ];
  var SERVICES = ["Walk", "Trail hike", "Drop-in", "House sit"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var FUR = ["#C9A27A", "#2E2A2B", "#F3EEE8", "#8B5E3C", "#D9B48A", "#6E6A6B", "#B5713F", "#E8D6BC", "#4A3B33"];
  var SKY = [["#F4D9D6", "#FAF1EC"], ["#D7E2E8", "#F3F1EC"], ["#F2D2C4", "#F8EDE6"], ["#E3E7E1", "#FAF7F5"]];
  var WALL = ["#F7EFF1", "#F3ECE4", "#EDE6E8", "#EEF0EA"];
  var RIDGE = ["#8E9C93", "#A7AFA6", "#B9A3A8", "#7D8C83"];

  var photos = [];
  var r = rng(20261015);
  for (var i = 0; i < N; i++) {
    var area = wpick(r, AREAS.map(function (a) { return { v: a, w: a.w }; }));
    var kind = r() < 0.78 ? "dog" : "cat";
    var service = kind === "cat" ? (r() < 0.75 ? "Drop-in" : "House sit")
      : wpick(r, [{ v: "Walk", w: 45 }, { v: "Trail hike", w: 20 }, { v: "Drop-in", w: 10 }, { v: "House sit", w: 25 }]);
    var y = r() < 0.5 ? 2025 : (r() < 0.6 ? 2026 : 2024);
    var m = 1 + Math.floor(r() * 12);
    if (y === 2026 && m > 9) m -= 3;
    var shape = wpick(r, [{ v: [3, 4], w: 55 }, { v: [4, 3], w: 25 }, { v: [1, 1], w: 20 }]);
    photos.push({
      id: "p" + String(i + 1).padStart(3, "0"), n: i + 1, kind: kind, service: service,
      area: area.name, areaKey: area.key, year: y, mon: m, month: y + "-" + String(m).padStart(2, "0"),
      w: shape[0], h: shape[1], seed: Math.floor(r() * 1e9), _thumb: null
    });
  }
  // Newest first, like a camera roll.
  photos.sort(function (a, b) { return b.month < a.month ? -1 : b.month > a.month ? 1 : a.n - b.n; });

  function draw(p, longEdge) {
    var W, H;
    if (p.w >= p.h) { W = longEdge; H = Math.round(longEdge * p.h / p.w); }
    else { H = longEdge; W = Math.round(longEdge * p.w / p.h); }
    var c = document.createElement("canvas"); c.width = W; c.height = H;
    var x = c.getContext("2d");
    var R = rng(p.seed);
    var outdoor = p.service === "Walk" || p.service === "Trail hike";
    var winter = p.mon >= 11 || p.mon <= 3;
    var groundY = H * (0.66 + R() * 0.12);

    if (outdoor) {
      var sk = pick(R, SKY), g = x.createLinearGradient(0, 0, 0, groundY);
      g.addColorStop(0, sk[0]); g.addColorStop(1, sk[1]);
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      // two ridgelines
      for (var k = 0; k < 2; k++) {
        x.fillStyle = k === 0 ? pick(R, RIDGE) + "88" : pick(R, RIDGE);
        x.beginPath(); x.moveTo(0, groundY);
        var base = groundY - H * (0.18 + 0.12 * (1 - k)), steps = 6;
        for (var s = 0; s <= steps; s++) x.lineTo(W * s / steps, base - R() * H * 0.14);
        x.lineTo(W, groundY); x.closePath(); x.fill();
      }
      x.fillStyle = winter ? "#FBFBF9" : (p.service === "Trail hike" ? "#9DA88A" : "#B9B39E");
      x.fillRect(0, groundY, W, H - groundY);
      if (winter) { x.fillStyle = "#E9ECEE"; x.fillRect(0, groundY, W, H * 0.015); }
      // a few pines
      var pines = 2 + Math.floor(R() * 4);
      for (var t = 0; t < pines; t++) {
        var px = R() * W, ph = H * (0.12 + R() * 0.12), pw = ph * 0.45;
        x.fillStyle = "#5B7568"; x.beginPath(); x.moveTo(px, groundY - ph); x.lineTo(px + pw / 2, groundY); x.lineTo(px - pw / 2, groundY); x.fill();
        if (winter) { x.fillStyle = "rgba(255,255,255,.8)"; x.beginPath(); x.moveTo(px, groundY - ph); x.lineTo(px + pw / 6, groundY - ph * 0.7); x.lineTo(px - pw / 6, groundY - ph * 0.7); x.fill(); }
      }
    } else {
      x.fillStyle = pick(R, WALL); x.fillRect(0, 0, W, H);
      x.fillStyle = "#D8C3A5"; x.fillRect(0, groundY, W, H - groundY);
      x.strokeStyle = "rgba(120,90,60,.18)"; x.lineWidth = Math.max(1, W / 300);
      for (var f = 1; f < 5; f++) { x.beginPath(); x.moveTo(0, groundY + (H - groundY) * f / 5); x.lineTo(W, groundY + (H - groundY) * f / 5); x.stroke(); }
      // couch or window
      if (R() < 0.6) {
        x.fillStyle = R() < 0.5 ? "#B87383" : "#8E9C93";
        var cw = W * 0.7, cx = W * (0.15 + R() * 0.15), ch = H * 0.2;
        roundRect(x, cx, groundY - ch, cw, ch, ch * 0.18); x.fill();
        x.fillStyle = "rgba(0,0,0,.08)"; roundRect(x, cx, groundY - ch * 0.45, cw, ch * 0.45, ch * 0.12); x.fill();
      } else {
        x.fillStyle = "#DCE6EC"; var ww = W * 0.34, wh = H * 0.3, wx = W * (0.08 + R() * 0.5), wy = groundY - wh - H * 0.18;
        x.fillRect(wx, wy, ww, wh); x.strokeStyle = "#FFFFFF"; x.lineWidth = W / 90; x.strokeRect(wx, wy, ww, wh);
        x.beginPath(); x.moveTo(wx + ww / 2, wy); x.lineTo(wx + ww / 2, wy + wh); x.stroke();
      }
    }

    var fur = pick(R, FUR), dark = shade(fur, -0.35);
    var sz = Math.min(W, H) * (0.34 + R() * 0.1);
    var cx2 = W * (0.43 + R() * 0.14), flip = R() < 0.5 ? -1 : 1;
    x.save(); x.translate(cx2, groundY + H * 0.02); x.scale(flip, 1);
    // shadow
    x.fillStyle = "rgba(0,0,0,.10)"; x.beginPath(); x.ellipse(0, 0, sz * 0.6, sz * 0.06, 0, 0, 7); x.fill();
    if (p.kind === "dog") dog(x, sz, fur, dark, R); else cat(x, sz, fur, dark, R);
    x.restore();

    // PLACEHOLDER stamp: bottom-centre of the central square, so it survives square/center crops in any layout.
    var fs = Math.max(9, Math.round(Math.min(W, H) / 18));
    var sy = H / 2 + Math.min(W, H) / 2 - fs * 1.5;
    x.font = "600 " + fs + "px 'Plus Jakarta Sans', system-ui, sans-serif";
    var label = "PLACEHOLDER #" + String(p.n).padStart(3, "0"), tw = x.measureText(label).width, pad = fs * 0.55;
    x.fillStyle = "rgba(43,37,39,.62)"; roundRect(x, (W - tw) / 2 - pad, sy - fs * 0.8, tw + pad * 2, fs * 1.6, fs * 0.8); x.fill();
    x.fillStyle = "#FFFFFF"; x.textBaseline = "middle"; x.textAlign = "center"; x.fillText(label, W / 2, sy);
    return c.toDataURL("image/jpeg", 0.82);
  }

  function dog(x, s, fur, dark, R) {
    var floppy = R() < 0.6, tall = 0.9 + R() * 0.3;
    x.fillStyle = fur; x.strokeStyle = fur; x.lineCap = "round";
    // legs
    [-0.38, -0.24, 0.22, 0.36].forEach(function (lx, i) {
      x.fillStyle = i % 2 ? fur : shade(fur, -0.08); roundRect(x, lx * s - s * 0.05, -0.45 * s * tall, s * 0.1, 0.45 * s * tall, s * 0.04); x.fill();
    });
    x.fillStyle = fur;
    // tail
    x.lineWidth = s * 0.08; x.beginPath(); x.moveTo(-0.48 * s, -0.62 * s * tall);
    x.quadraticCurveTo(-0.75 * s, -0.7 * s * tall, -0.72 * s, -0.98 * s * tall); x.stroke();
    // body
    x.beginPath(); x.ellipse(0, -0.6 * s * tall, 0.55 * s, 0.24 * s, 0, 0, 7); x.fill();
    // neck + head
    x.beginPath(); x.ellipse(0.42 * s, -0.8 * s * tall, 0.14 * s, 0.24 * s, 0.5, 0, 7); x.fill();
    x.beginPath(); x.arc(0.52 * s, -1.0 * s * tall, 0.2 * s, 0, 7); x.fill();
    x.beginPath(); x.ellipse(0.72 * s, -0.94 * s * tall, 0.15 * s, 0.09 * s, 0.15, 0, 7); x.fill();
    // ear
    x.fillStyle = dark;
    if (floppy) { x.beginPath(); x.ellipse(0.44 * s, -0.98 * s * tall, 0.07 * s, 0.16 * s, 0.25, 0, 7); x.fill(); }
    else { x.beginPath(); x.moveTo(0.4 * s, -1.1 * s * tall); x.lineTo(0.47 * s, -1.34 * s * tall); x.lineTo(0.56 * s, -1.14 * s * tall); x.fill(); }
    // nose + eye
    x.fillStyle = "#231F20"; x.beginPath(); x.arc(0.86 * s, -0.96 * s * tall, 0.035 * s, 0, 7); x.fill();
    x.beginPath(); x.arc(0.6 * s, -1.06 * s * tall, 0.025 * s, 0, 7); x.fill();
    // collar
    x.strokeStyle = "#B87383"; x.lineWidth = s * 0.045; x.beginPath(); x.moveTo(0.36 * s, -0.86 * s * tall); x.lineTo(0.5 * s, -0.78 * s * tall); x.stroke();
  }
  function cat(x, s, fur, dark, R) {
    x.fillStyle = fur; x.strokeStyle = fur; x.lineCap = "round";
    x.lineWidth = s * 0.07; x.beginPath(); x.moveTo(0.25 * s, -0.08 * s);
    x.quadraticCurveTo(0.6 * s, -0.05 * s, 0.55 * s, -0.4 * s); x.stroke();
    x.beginPath(); x.ellipse(0, -0.38 * s, 0.32 * s, 0.38 * s, 0, 0, 7); x.fill();
    x.beginPath(); x.arc(0, -0.92 * s, 0.24 * s, 0, 7); x.fill();
    [-1, 1].forEach(function (d) {
      x.beginPath(); x.moveTo(d * 0.08 * s, -1.1 * s); x.lineTo(d * 0.22 * s, -1.3 * s); x.lineTo(d * 0.24 * s, -1.0 * s); x.fill();
    });
    x.fillStyle = dark; x.beginPath(); x.ellipse(0, -0.3 * s, 0.14 * s, 0.24 * s, 0, 0, 7); x.globalAlpha = 0.25; x.fill(); x.globalAlpha = 1;
    x.fillStyle = "#3C5A3E"; [-1, 1].forEach(function (d) { x.beginPath(); x.ellipse(d * 0.09 * s, -0.95 * s, 0.035 * s, 0.05 * s, 0, 0, 7); x.fill(); });
    x.fillStyle = "#B87383"; x.beginPath(); x.moveTo(-0.03 * s, -0.86 * s); x.lineTo(0.03 * s, -0.86 * s); x.lineTo(0, -0.82 * s); x.fill();
  }
  function roundRect(x, a, b, w, h, rr) {
    x.beginPath(); x.moveTo(a + rr, b); x.arcTo(a + w, b, a + w, b + h, rr); x.arcTo(a + w, b + h, a, b + h, rr);
    x.arcTo(a, b + h, a, b, rr); x.arcTo(a, b, a + w, b, rr); x.closePath();
  }
  function shade(hex, amt) {
    var n = parseInt(hex.slice(1), 16), rr = n >> 16, gg = (n >> 8) & 255, bb = n & 255;
    function f(v) { return Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt))); }
    return "#" + ((1 << 24) + (f(rr) << 16) + (f(gg) << 8) + f(bb)).toString(16).slice(1);
  }

  window.PW = {
    photos: photos,
    count: photos.length,
    AREAS: AREAS,
    SERVICES: SERVICES,
    thumb: function (p) { return p._thumb || (p._thumb = draw(p, 360)); },
    thumbL: function (p) { return p._thumbL || (p._thumbL = draw(p, 640)); },
    full: function (p) { return draw(p, 1100); },
    caption: function (p) { return p.service + " · " + p.area + " · " + MONTHS[p.mon - 1] + " " + p.year; },
    ratio: function (p) { return p.h / p.w; },
    // rAF that still runs in hidden/background tabs (screenshots, headless review).
    frame: function (fn) { return document.hidden ? setTimeout(fn, 16) : requestAnimationFrame(fn); }
  };
})();
