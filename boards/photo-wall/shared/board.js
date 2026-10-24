/* Photo wall design board: review toolbar (not part of any final design).
   Each concept sets <html data-concept="NN">. ?chrome=0 hides the toolbar (used by the board's iframes). */
(function () {
  var CONCEPTS = [
    { id: "01", slug: "01-endless-wall", name: "Endless Wall" },
    { id: "02", slug: "02-corkboard", name: "Corkboard" },
    { id: "03", slug: "03-where-we-walk", name: "Where We Walk" },
    { id: "04", slug: "04-masonry-counter", name: "Masonry + Counter" },
    { id: "05", slug: "05-drift", name: "Drift" },
    { id: "06", slug: "06-hero-wall", name: "Hero Wall" },
    { id: "07", slug: "07-still-wall", name: "Still Wall" }
  ];
  var id = document.documentElement.getAttribute("data-concept") || "00";
  var params = new URLSearchParams(location.search);
  if (params.get("chrome") === "0") { document.documentElement.classList.add("no-chrome"); return; }
  var i = CONCEPTS.findIndex(function (c) { return c.id === id; });
  var prev = CONCEPTS[(i - 1 + CONCEPTS.length) % CONCEPTS.length];
  var next = CONCEPTS[(i + 1) % CONCEPTS.length];
  var css = document.createElement("style");
  css.textContent =
    ".pwb{position:fixed;left:12px;bottom:12px;z-index:2147483000;display:flex;gap:4px;align-items:center;" +
    "font:500 12px/1 ui-sans-serif,system-ui,sans-serif;background:rgba(43,37,39,.84);color:#fff;padding:5px;border-radius:999px;" +
    "box-shadow:0 4px 18px rgba(0,0,0,.25);opacity:.6;transition:opacity .2s}" +
    ".pwb:hover,.pwb:focus-within{opacity:1}" +
    ".pwb a{all:unset;cursor:pointer;padding:7px 10px;border-radius:999px;color:#fff;white-space:nowrap}" +
    ".pwb a:hover,.pwb a:focus-visible{background:rgba(255,255,255,.16)}" +
    ".pwb .lbl{opacity:.7;padding:0 8px}" +
    "@media (max-width:760px){.pwb .hide-sm{display:none}}";
  document.head.appendChild(css);
  function build() {
    var bar = document.createElement("nav");
    bar.className = "pwb"; bar.setAttribute("aria-label", "Design board review toolbar");
    bar.innerHTML =
      '<a href="../../index.html" title="Back to board">&#9638; Board</a>' +
      '<a class="hide-sm" href="../' + prev.slug + '/index.html" title="Previous: ' + prev.name + '">&larr;</a>' +
      '<a class="hide-sm" href="../' + next.slug + '/index.html" title="Next: ' + next.name + '">&rarr;</a>' +
      '<span class="lbl">' + id + ' · ' + CONCEPTS[i].name + ' · ' + PW.count + ' placeholder photos</span>';
    document.body.appendChild(bar);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
