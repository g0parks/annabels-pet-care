/* Shared lightbox for the photo wall concepts. PW.lightbox(list, index).
   Keyboard: Esc closes, arrows step. Touch: swipe left/right steps, swipe down closes. */
(function () {
  var css = document.createElement("style");
  css.textContent =
    ".pwlb{position:fixed;inset:0;z-index:2147482000;background:rgba(43,37,39,.86);display:none;align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:24px;touch-action:none}" +
    ".pwlb.on{display:flex;animation:pwlbIn .18s ease}" +
    "@keyframes pwlbIn{from{opacity:0}to{opacity:1}}" +
    ".pwlb img{max-width:min(92vw,1100px);max-height:78vh;border-radius:10px;box-shadow:0 20px 60px rgba(0,0,0,.4);background:#FAF7F5;user-select:none;-webkit-user-drag:none}" +
    ".pwlb .cap{color:#FAF7F5;font:500 14px/1.4 'Plus Jakarta Sans',system-ui,sans-serif;letter-spacing:.02em;text-align:center}" +
    ".pwlb .cap b{font-weight:600;letter-spacing:.12em;font-size:11px;background:rgba(255,255,255,.14);padding:3px 8px;border-radius:999px;margin-right:8px}" +
    ".pwlb button{all:unset;cursor:pointer;position:absolute;color:#FAF7F5;font:400 30px/1 'Cormorant Garamond',Georgia,serif;width:48px;height:48px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.08)}" +
    ".pwlb button:hover,.pwlb button:focus-visible{background:rgba(255,255,255,.2)}" +
    ".pwlb .x{top:16px;right:16px}.pwlb .pv{left:16px;top:50%;margin-top:-24px}.pwlb .nx{right:16px;top:50%;margin-top:-24px}" +
    "@media (max-width:700px){.pwlb .pv,.pwlb .nx{top:auto;bottom:18px;margin:0}.pwlb .pv{left:calc(50% - 60px)}.pwlb .nx{right:calc(50% - 60px)}}";
  document.head.appendChild(css);

  var el, img, cap, list = [], idx = 0, lastFocus;
  function build() {
    el = document.createElement("div");
    el.className = "pwlb"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Photo viewer");
    el.innerHTML = '<img alt=""><p class="cap"></p><button class="x" aria-label="Close">&times;</button>' +
      '<button class="pv" aria-label="Previous photo">&lsaquo;</button><button class="nx" aria-label="Next photo">&rsaquo;</button>';
    document.body.appendChild(el);
    img = el.querySelector("img"); cap = el.querySelector(".cap");
    el.querySelector(".x").onclick = close;
    el.querySelector(".pv").onclick = function (e) { e.stopPropagation(); step(-1); };
    el.querySelector(".nx").onclick = function (e) { e.stopPropagation(); step(1); };
    el.addEventListener("click", function (e) { if (e.target === el) close(); });
    var sx = 0, sy = 0;
    el.addEventListener("pointerdown", function (e) { sx = e.clientX; sy = e.clientY; });
    el.addEventListener("pointerup", function (e) {
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
      else if (dy > 80) close();
    });
    document.addEventListener("keydown", function (e) {
      if (!el.classList.contains("on")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    });
  }
  function show() {
    var p = list[idx];
    img.src = PW.full(p);
    // Real-photo builds set PW.badge = "" and PW.altPrefix; placeholder builds keep the PLACEHOLDER stamp.
    var badge = PW.badge === undefined ? "PLACEHOLDER" : PW.badge;
    img.alt = (PW.altPrefix || "Placeholder photo: ") + (p.kind === "dog" ? "a dog" : "a cat") + (PW.caption(p) ? ", " + PW.caption(p) : "");
    cap.innerHTML = (badge ? "<b>" + badge + "</b>" : "") + PW.caption(p);
  }
  function step(d) { idx = (idx + d + list.length) % list.length; show(); }
  function close() { el.classList.remove("on"); if (lastFocus) lastFocus.focus(); if (PW.onLightboxClose) PW.onLightboxClose(); }
  PW.lightbox = function (l, i) {
    if (!el) build();
    list = l; idx = i; lastFocus = document.activeElement;
    show(); el.classList.add("on"); el.querySelector(".x").focus();
  };
})();
