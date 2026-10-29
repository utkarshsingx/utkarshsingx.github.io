/* ============================================================
   FIELD REPORT — behaviour layer
   No framework. Everything degrades to a readable page without it.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js-on");

  /* ---------- DATA (read from the GitHub API on 2026-10-29) ---------- */
  // Weekly contribution counts, 53 weeks ending 2026-10-29.
  var WEEK_START = "2025-10-26";
  var WEEKS = [24,52,47,38,59,5,36,33,23,1,6,22,67,43,25,21,18,44,37,60,132,64,
               75,42,79,37,67,21,156,129,166,32,114,325,250,396,333,698,585,784,
               335,367,637,288,417,298,352,316,112,172,238,409,167];
  // Commits per public repository, trailing 12 months.
  var REPOS = [
    ["lms-platform-frontend", 2017], ["client-lms-zskillup", 760],
    ["super-admin-portal", 98],      ["ailinc-demo", 92],
    ["utkarshsingx_v1", 68],         ["job-scraping", 55],
    ["GMS-frontend", 45],            ["utkarshreads", 43],
    ["lms-prototype", 39],           ["starrytv", 33]
  ];

  var NS = "http://www.w3.org/2000/svg";
  function el(name, attrs, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs[k] !== null) n.setAttribute(k, attrs[k]);
    if (text !== undefined) n.textContent = text;
    return n;
  }
  // Bar anchored to a baseline with rounded data-end.
  function barPath(x, y, w, h, r) {
    r = Math.min(r, w / 2, h);
    if (h <= 0) return "";
    return "M" + x + " " + (y + h) + "V" + (y + r) +
           "a" + r + " " + r + " 0 0 1 " + r + " " + -r +
           "h" + (w - 2 * r) +
           "a" + r + " " + r + " 0 0 1 " + r + " " + r +
           "V" + (y + h) + "z";
  }
  function hBarPath(x, y, w, h, r) {
    r = Math.min(r, h / 2, w);
    if (w <= 0) return "";
    return "M" + x + " " + y + "h" + (w - r) +
           "a" + r + " " + r + " 0 0 1 " + r + " " + r +
           "v" + (h - 2 * r) +
           "a" + r + " " + r + " 0 0 1 " + -r + " " + r +
           "H" + x + "z";
  }
  var fmt = function (n) { return n.toLocaleString("en-US"); };

  /* ---------- 1. THEME ---------- */
  var themeBtn = document.getElementById("theme");
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#f3efe6" : "#000000");
    if (themeBtn) {
      themeBtn.innerHTML = (t === "light" ? "◑&nbsp;<span>DARK</span>" : "◐&nbsp;<span>LIGHT</span>");
      themeBtn.setAttribute("aria-pressed", t === "light" ? "true" : "false");
    }
  }
  var saved = null;
  try { saved = localStorage.getItem("fr-theme"); } catch (e) {}
  setTheme(saved === "light" || saved === "dark" ? saved : "dark");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      setTheme(next);
      try { localStorage.setItem("fr-theme", next); } catch (e) {}
    });
  }

  /* ---------- 2. CLOCK (IST) ---------- */
  var clock = document.getElementById("clock");
  if (clock) {
    var tick = function () {
      var s = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Asia/Kolkata", hour12: false,
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      });
      clock.textContent = s + " IST";
    };
    tick();
    setInterval(tick, 1000);
  }
  var yr = document.getElementById("year");
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ---------- 3. SECTION MARKS + COUNTER ---------- */
  var sections = [].slice.call(document.querySelectorAll("[data-sec]"));
  var marksBox = document.getElementById("marks");
  var counter = document.getElementById("counter");
  var routes = [].slice.call(document.querySelectorAll(".nav__routes a"));
  var markEls = [];

  sections.forEach(function (s) {
    if (!marksBox) return;
    var a = document.createElement("a");
    a.href = "#" + s.id;
    a.textContent = "§" + s.dataset.sec;
    a.title = s.dataset.label || "";
    marksBox.appendChild(a);
    markEls.push(a);
  });

  function setActive(sec) {
    var n = sec.dataset.sec;
    if (counter) counter.innerHTML = "§&nbsp;<b>" + n + "</b>&nbsp;/&nbsp;08";
    markEls.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + sec.id);
    });
    routes.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + sec.id);
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var visible = {};
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      var best = null, bestR = 0;
      sections.forEach(function (s) {
        var r = visible[s.id] || 0;
        if (r > bestR) { bestR = r; best = s; }
      });
      if (best) setActive(best);
    }, { threshold: [0, 0.12, 0.3, 0.55, 0.8], rootMargin: "-44px 0px -35% 0px" });
    sections.forEach(function (s) { secObs.observe(s); });
  }

  /* ---------- 4. REVEAL (fails visible) ---------- */
  var reveals = [].slice.call(document.querySelectorAll("[data-reveal]"));
  var showAll = function () { reveals.forEach(function (n) { n.classList.add("no-anim"); }); };
  if ("IntersectionObserver" in window) {
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); obs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.03 });
    reveals.forEach(function (n) { revObs.observe(n); });
    // Safety net: nothing stays hidden because an observer never fired.
    setTimeout(showAll, 2500);
  } else {
    showAll();
  }

  /* ---------- 5. DIAGRAM INSPECTOR ---------- */
  var inspect = document.getElementById("inspect");
  if (inspect) {
    var idle = '<b>IDLE</b>Move cursor over the diagram →';
    [].slice.call(document.querySelectorAll(".node")).forEach(function (n) {
      var show = function () {
        inspect.innerHTML = "<b>" + n.dataset.t + "</b>" + n.dataset.d;
      };
      n.addEventListener("mouseenter", show);
      n.addEventListener("focus", show);
      n.addEventListener("blur", function () { inspect.innerHTML = idle; });
    });
    var figSvg = document.querySelector(".diagram");
    if (figSvg) figSvg.addEventListener("mouseleave", function () { inspect.innerHTML = idle; });
  }

  /* ---------- 6. FIG 04A — CONTRIBUTIONS BY WEEK ---------- */
  var cw = document.getElementById("chart-weeks");
  if (cw) {
    var W = 640, H = 230, padL = 30, padR = 8, padT = 14, padB = 26;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var yMax = 800, gap = 1.6;
    var step = plotW / WEEKS.length, barW = step - gap;
    var peak = Math.max.apply(null, WEEKS), peakI = WEEKS.indexOf(peak);
    var start = new Date(WEEK_START + "T00:00:00Z");
    var MON = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

    cw.setAttribute("viewBox", "0 0 " + W + " " + H);

    [0, 200, 400, 600, 800].forEach(function (v) {
      var y = padT + plotH - (v / yMax) * plotH;
      cw.appendChild(el("line", { class: v === 0 ? "axis" : "gl", x1: padL, y1: y, x2: W - padR, y2: y }));
      cw.appendChild(el("text", { x: padL - 5, y: y + 2.6, "text-anchor": "end" }, String(v)));
    });

    WEEKS.forEach(function (v, i) {
      var h = (v / yMax) * plotH;
      var x = padL + i * step, y = padT + plotH - h;
      var d = new Date(start.getTime() + i * 7 * 864e5);
      var g = el("g", {});
      g.appendChild(el("title", {}, d.toISOString().slice(0, 10) + " · " + fmt(v) + " contributions"));
      g.appendChild(el("path", {
        class: "bar" + (i === peakI ? " bar--peak" : ""),
        d: barPath(x, y, barW, h, 2)
      }));
      cw.appendChild(g);
      if (i % 9 === 0) {
        cw.appendChild(el("text", {
          x: x + barW / 2, y: H - 9, "text-anchor": "middle"
        }, MON[d.getUTCMonth()] + " " + String(d.getUTCFullYear()).slice(2)));
      }
    });

    var px = padL + peakI * step + barW / 2;
    cw.appendChild(el("text", {
      class: "vlabel", x: Math.min(px, W - padR - 26), y: padT + plotH - (peak / yMax) * plotH - 5,
      "text-anchor": "middle", "font-size": "9"
    }, "PEAK " + fmt(peak)));
  }

  /* ---------- 7. FIG 04B — COMMITS BY REPOSITORY ---------- */
  var cr = document.getElementById("chart-repos");
  if (cr) {
    var W2 = 640, H2 = 300, labW = 152, gutter = 10, rightPad = 46, top = 22;
    var rowH = (H2 - top - 10) / REPOS.length, barH = Math.min(15, rowH - 10);
    var max = REPOS[0][1], barMax = W2 - labW - gutter - rightPad;

    cr.setAttribute("viewBox", "0 0 " + W2 + " " + H2);
    cr.appendChild(el("line", { class: "axis", x1: labW + gutter, y1: top - 6, x2: labW + gutter, y2: H2 - 8 }));

    REPOS.forEach(function (r, i) {
      var y = top + i * rowH, w = (r[1] / max) * barMax, bx = labW + gutter;
      var g = el("g", {});
      g.appendChild(el("title", {}, r[0] + " · " + fmt(r[1]) + " commits"));
      g.appendChild(el("text", {
        x: labW - 6, y: y + barH / 2 + 3, "text-anchor": "end", class: "vlabel", "font-size": "9"
      }, r[0]));
      g.appendChild(el("path", { class: "bar", d: hBarPath(bx, y, Math.max(w, 1.5), barH, 2) }));
      g.appendChild(el("text", {
        x: bx + Math.max(w, 1.5) + 6, y: y + barH / 2 + 3, class: "vlabel", "font-size": "9"
      }, fmt(r[1])));
      cr.appendChild(g);
    });
  }
})();
