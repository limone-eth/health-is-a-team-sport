/* HEALTH IS A TEAM SPORT — interactions */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* an editorial piece reads from the cover — always open at the top,
     which also keeps ScrollTrigger measurements honest on reload */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  /* ---------- progress bar + cover parallax ---------- */
  /* the cover sits at the document top, so its parallax can be computed
     directly from scrollY — immune to ScrollTrigger measurement drift */
  var bar = document.querySelector(".track-progress__bar");
  var coverEl = document.querySelector(".cover");
  var coverTitle = document.querySelector(".cover__title");
  var coverImg = document.querySelector(".cover__img");
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    if (coverEl && !reduceMotion) {
      var p = Math.min(Math.max(window.scrollY / coverEl.offsetHeight, 0), 1);
      coverTitle.style.transform = "translateY(" + p * 18 + "vh)";
      coverTitle.style.opacity = String(1 - p * 0.75);
      coverImg.style.transform = "scale(" + (1.08 - p * 0.08) + ")";
    }
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- cover entrance ---------- */
  if (hasGsap && !reduceMotion) {
    gsap.from(".cover__line > span", {
      yPercent: 110, duration: 1.1, stagger: 0.12, ease: "power4.out", delay: 0.2
    });
    gsap.from(".cover__deck, .cover__stats, .cover__sticker", {
      opacity: 0, y: 24, duration: 0.9, stagger: 0.15, ease: "power2.out", delay: 0.9
    });
  }

  /* ---------- reveals ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (hasGsap && !reduceMotion) {
    reveals.forEach(function (el) {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true }
      });
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-shown"); });
  }

  /* ---------- chapter titles ---------- */
  if (hasGsap && !reduceMotion) {
    document.querySelectorAll(".chapter__title").forEach(function (t) {
      gsap.from(t.querySelectorAll(".chapter__title-line"), {
        yPercent: 105, duration: 1, stagger: 0.1, ease: "power4.out",
        scrollTrigger: { trigger: t, start: "top 85%", once: true }
      });
    });
    document.querySelectorAll(".chapter__rule").forEach(function (r) {
      gsap.from(r, {
        scaleX: 0, transformOrigin: "left center", duration: 1.1, ease: "power3.inOut",
        scrollTrigger: { trigger: r, start: "top 90%", once: true }
      });
    });
    gsap.utils.toArray(".finale__line").forEach(function (l, i) {
      gsap.from(l, {
        yPercent: 110, duration: 1, delay: i * 0.08, ease: "power4.out",
        scrollTrigger: { trigger: ".finale", start: "top 70%", once: true }
      });
    });
  }

  /* ---------- parallax on bleed images ---------- */
  if (hasGsap && !reduceMotion) {
    document.querySelectorAll("[data-parallax] img").forEach(function (img) {
      gsap.to(img, {
        yPercent: 8, scale: 1.02, ease: "none",
        scrollTrigger: { trigger: img.closest("[data-parallax]"), start: "top bottom", end: "bottom top", scrub: true }
      });
    });
  }

  /* ---------- counters ---------- */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    function render(v) { el.textContent = v.toFixed(decimals) + suffix; }
    if (!hasGsap || reduceMotion) { render(target); return; }
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.8, ease: "power2.out",
      onUpdate: function () { render(obj.v); },
      scrollTrigger: { trigger: el, start: "top 85%", once: true }
    });
  });

  /* ---------- three-part mind ---------- */
  var mind = document.getElementById("mind");
  if (mind) {
    var cards = mind.querySelectorAll(".mindcard");
    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        var active = card.classList.contains("is-active");
        cards.forEach(function (c) { c.classList.remove("is-active"); });
        if (!active) card.classList.add("is-active");
      });
    });
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { mind.classList.add("in-view"); obs.disconnect(); }
      });
    }, { threshold: 0.3 }).observe(mind);
  }

  /* ---------- the hill ---------- */
  (function () {
    var svg = document.getElementById("hillSvg");
    if (!svg) return;
    var path = document.getElementById("hillPath");
    var friend = document.getElementById("hillFriend");
    var deg = document.getElementById("hillDeg");
    var note = document.getElementById("hillNote");
    var btnAlone = document.getElementById("hillAlone");
    var btnWith = document.getElementById("hillWith");
    /* perceived crest height: alone vs ~15% softer with a friend */
    var ALONE = { y: 60, deg: 31 };
    var WITH = { y: 122, deg: 26 };
    var cur = { y: ALONE.y, deg: ALONE.deg };
    function render() {
      path.setAttribute("d", "M 160 300 L 800 " + cur.y.toFixed(1) + " L 800 300 Z");
      deg.textContent = Math.round(cur.deg) + "°";
      var t = (cur.y - ALONE.y) / (WITH.y - ALONE.y);
      friend.setAttribute("opacity", Math.max(0, Math.min(1, t)).toFixed(2));
    }
    function go(target, withFriend) {
      btnAlone.classList.toggle("is-active", !withFriend);
      btnWith.classList.toggle("is-active", withFriend);
      if (note) note.textContent = withFriend
        ? "SAME HILL — IT NOW LOOKS 10–20% LESS STEEP. THE FRIEND DIDN'T EVEN SAY ANYTHING."
        : "AS IT LOOKS WITH NOBODY BESIDE YOU.";
      if (hasGsap && !reduceMotion) {
        gsap.to(cur, { y: target.y, deg: target.deg, duration: 1, ease: "power3.inOut", onUpdate: render });
      } else {
        cur.y = target.y; cur.deg = target.deg; render();
      }
    }
    btnAlone.addEventListener("click", function () { go(ALONE, false); });
    btnWith.addEventListener("click", function () { go(WITH, true); });
    render();
    /* auto-demo on first view */
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          setTimeout(function () { go(WITH, true); }, 1200);
          obs.disconnect();
        }
      });
    }, { threshold: 0.5 }).observe(svg);
  })();

  /* ---------- drafting simulator ---------- */
  (function () {
    var canvas = document.getElementById("draftCanvas");
    var range = document.getElementById("draftRange");
    if (!canvas || !range) return;
    var ctx = canvas.getContext("2d");
    var countOut = document.getElementById("draftCount");
    var effortOut = document.getElementById("draftEffort");
    var verdictOut = document.getElementById("draftVerdict");
    var noteOut = document.getElementById("draftNote");
    var riders = [];
    var n = 0;
    var t = 0;

    /* effort model, loosely fit to the drafting literature:
       1 companion ≈ -28%, a handful ≈ -38%, deep in a big pack → ~45% of solo */
    function effortFor(k) {
      if (k === 0) return 100;
      return Math.round(45 + 55 * Math.exp(-k / 7) - (k === 1 ? 10 : 0));
    }
    function verdictFor(k) {
      if (k === 0) return ["ALONE", "EVERY WATT IS YOURS"];
      if (k === 1) return ["A PAIR", "TAKING TURNS PULLING"];
      if (k < 6) return ["A GROUP", "DRAFTING CUTS THE COST 30–40%"];
      if (k < 18) return ["A PACK", "THE PACK CARRIES THE INDIVIDUAL"];
      return ["A PELOTON", "A SUPERORGANISM — A FRACTION OF THE WORK"];
    }

    function rebuild() {
      riders = [];
      var w = canvas.width, h = canvas.height;
      var cx = w * 0.42, cy = h / 2;
      /* you */
      riders.push({ x: cx, y: cy, you: true, phase: 0 });
      /* the pack forms a loose diamond behind/around you */
      var placed = 0, ring = 1;
      while (placed < n) {
        var per = ring * 5;
        for (var i = 0; i < per && placed < n; i++, placed++) {
          var a = (i / per) * Math.PI * 2 + ring * 0.6;
          riders.push({
            x: cx - ring * 26 + Math.cos(a) * ring * 22,
            y: cy + Math.sin(a) * Math.min(ring * 20, h * 0.38),
            you: false,
            phase: Math.random() * Math.PI * 2
          });
        }
        ring++;
      }
    }

    function size() {
      var r = canvas.parentElement.getBoundingClientRect();
      canvas.width = r.width * devicePixelRatio;
      canvas.height = r.height * devicePixelRatio;
      rebuild();
    }
    window.addEventListener("resize", size);

    function draw() {
      t += 0.02;
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      var u = devicePixelRatio;
      /* speed lines */
      ctx.strokeStyle = "rgba(242,236,223,0.12)";
      ctx.lineWidth = 1 * u;
      for (var i = 0; i < 14; i++) {
        var y = (h / 14) * i + ((t * 40 * u) % (h / 14));
        var off = ((t * 220 * u) + i * 137) % (w + 240 * u);
        ctx.beginPath();
        ctx.moveTo(w - off, y);
        ctx.lineTo(w - off + 110 * u, y);
        ctx.stroke();
      }
      riders.forEach(function (r) {
        var bob = Math.sin(t * 3 + r.phase) * 2.5 * u;
        var x = r.x, y = r.y + bob;
        if (r.you) {
          ctx.fillStyle = "#c9f73a";
          ctx.beginPath();
          ctx.arc(x, y, 11 * u, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#161309";
          ctx.lineWidth = 3 * u;
          ctx.stroke();
          ctx.fillStyle = "#c9f73a";
          ctx.font = 600 + " " + 10 * u + "px 'IBM Plex Mono', monospace";
          ctx.textAlign = "center";
          ctx.fillText("YOU", x, y - 18 * u);
        } else {
          ctx.fillStyle = "rgba(242,236,223,0.85)";
          ctx.beginPath();
          ctx.arc(x, y, 7 * u, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      requestAnimationFrame(draw);
    }

    function update() {
      n = parseInt(range.value, 10);
      countOut.textContent = n;
      effortOut.textContent = effortFor(n) + "%";
      var v = verdictFor(n);
      verdictOut.textContent = v[0];
      noteOut.textContent = v[1];
      rebuild();
    }
    range.addEventListener("input", update);
    size();
    update();
    draw();

    /* auto-demo: ease the slider up the first time it scrolls into view */
    if (hasGsap && !reduceMotion) {
      var demo = { v: 0 };
      gsap.to(demo, {
        v: 24, duration: 2.4, ease: "power2.inOut",
        scrollTrigger: { trigger: "#draft", start: "top 65%", once: true },
        onUpdate: function () { range.value = Math.round(demo.v); update(); }
      });
    }
  })();

  /* ---------- Köhler plank race ---------- */
  (function () {
    var root = document.getElementById("kohler");
    if (!root) return;
    var soloFill = root.querySelector("[data-kohler-solo]");
    var teamFill = root.querySelector("[data-kohler-team]");
    var soloTime = root.querySelector("[data-kohler-solo-time]");
    var teamTime = root.querySelector("[data-kohler-team-time]");
    var SOLO = 76, TEAM = 112; /* seconds, illustrative ~1.5x boost reported in plank trials */
    function fmt(s) { return Math.floor(s / 60) + ":" + ("0" + Math.floor(s % 60)).slice(-2); }
    function run() {
      var obj = { t: 0 };
      var dur = reduceMotion ? 0 : 4;
      if (!hasGsap || reduceMotion) {
        soloFill.style.width = (SOLO / TEAM) * 100 + "%";
        teamFill.style.width = "100%";
        soloTime.textContent = fmt(SOLO);
        teamTime.textContent = fmt(TEAM);
        return;
      }
      gsap.to(obj, {
        t: TEAM, duration: dur, ease: "none",
        onUpdate: function () {
          var s = Math.min(obj.t, SOLO), tm = obj.t;
          soloFill.style.width = (s / TEAM) * 100 + "%";
          teamFill.style.width = (tm / TEAM) * 100 + "%";
          soloTime.textContent = fmt(s);
          teamTime.textContent = fmt(tm);
        }
      });
    }
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(); obs.disconnect(); } });
    }, { threshold: 0.5 }).observe(root);
  })();

  /* ---------- contagion network ---------- */
  (function () {
    var canvas = document.getElementById("weatherCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var note = document.getElementById("weatherNote");
    var nodes = [], links = [];
    var N = 46;

    function build() {
      var r = canvas.getBoundingClientRect();
      canvas.width = r.width * devicePixelRatio;
      canvas.height = r.height * devicePixelRatio;
      nodes = []; links = [];
      var w = canvas.width, h = canvas.height, u = devicePixelRatio;
      for (var i = 0; i < N; i++) {
        nodes.push({
          x: 30 * u + Math.random() * (w - 60 * u),
          y: 30 * u + Math.random() * (h - 60 * u),
          vx: (Math.random() - 0.5) * 0.18 * u,
          vy: (Math.random() - 0.5) * 0.18 * u,
          lit: 0 /* 0..1 habit intensity */
        });
      }
      for (var a = 0; a < N; a++) {
        /* connect to 2-3 nearest neighbours */
        var d = nodes.map(function (nb, idx) {
          return { idx: idx, dist: Math.hypot(nb.x - nodes[a].x, nb.y - nodes[a].y) };
        }).sort(function (p, q) { return p.dist - q.dist; }).slice(1, 3 + (a % 2));
        d.forEach(function (p) {
          if (!links.some(function (l) { return (l.a === p.idx && l.b === a); })) links.push({ a: a, b: p.idx });
        });
      }
    }

    function ignite(idx) {
      var queue = [{ idx: idx, depth: 0 }];
      var seen = {};
      var spread = 0;
      while (queue.length) {
        var cur = queue.shift();
        if (seen[cur.idx] || cur.depth > 3) continue;
        seen[cur.idx] = true;
        var node = nodes[cur.idx];
        var strength = Math.max(0, 1 - cur.depth * 0.3);
        if (strength > node.lit) {
          (function (nd, st, dp) {
            setTimeout(function () { nd.lit = Math.max(nd.lit, st); }, dp * 320);
          })(node, strength, cur.depth);
          if (cur.depth > 0) spread++;
        }
        links.forEach(function (l) {
          if (l.a === cur.idx) queue.push({ idx: l.b, depth: cur.depth + 1 });
          if (l.b === cur.idx) queue.push({ idx: l.a, depth: cur.depth + 1 });
        });
      }
      if (note) note.textContent = "ONE PERSON CHANGED — THE HABIT REACHED " + spread + " OTHERS, FRIEND TO FRIEND TO FRIEND.";
    }

    canvas.addEventListener("click", function (e) {
      var r = canvas.getBoundingClientRect();
      var x = (e.clientX - r.left) * devicePixelRatio;
      var y = (e.clientY - r.top) * devicePixelRatio;
      var best = 0, bd = 1e9;
      nodes.forEach(function (nd, i) {
        var d = Math.hypot(nd.x - x, nd.y - y);
        if (d < bd) { bd = d; best = i; }
      });
      ignite(best);
    });

    function tick() {
      var w = canvas.width, h = canvas.height, u = devicePixelRatio;
      ctx.clearRect(0, 0, w, h);
      nodes.forEach(function (nd) {
        nd.x += nd.vx; nd.y += nd.vy;
        if (nd.x < 20 * u || nd.x > w - 20 * u) nd.vx *= -1;
        if (nd.y < 20 * u || nd.y > h - 20 * u) nd.vy *= -1;
        nd.lit *= 0.9985;
      });
      links.forEach(function (l) {
        var a = nodes[l.a], b = nodes[l.b];
        var lit = Math.min(a.lit, b.lit);
        ctx.strokeStyle = lit > 0.05 ? "rgba(180,69,31," + (0.25 + lit * 0.6) + ")" : "rgba(22,19,9,0.18)";
        ctx.lineWidth = (lit > 0.05 ? 2 : 1) * u;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });
      nodes.forEach(function (nd) {
        var rad = (5 + nd.lit * 5) * u;
        ctx.fillStyle = nd.lit > 0.05
          ? "rgba(180,69,31," + (0.45 + nd.lit * 0.55) + ")"
          : "rgba(22,19,9,0.75)";
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, rad, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }

    build();
    window.addEventListener("resize", build);
    tick();

    /* auto-demo on first view */
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { setTimeout(function () { ignite(Math.floor(N / 2)); }, 700); obs.disconnect(); }
      });
    }, { threshold: 0.4 }).observe(canvas);
  })();

  /* ---------- last call / start line slider ---------- */
  (function () {
    var stage = document.getElementById("swapStage");
    var morning = document.getElementById("swapMorning");
    var handle = document.getElementById("swapHandle");
    if (!stage) return;
    var pos = 50, dragging = false;
    function set(p) {
      pos = Math.max(2, Math.min(98, p));
      morning.style.clipPath = "inset(0 0 0 " + pos + "%)";
      handle.style.left = pos + "%";
    }
    function fromEvent(e) {
      var r = stage.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      set((x / r.width) * 100);
    }
    stage.addEventListener("pointerdown", function (e) { dragging = true; stage.setPointerCapture(e.pointerId); fromEvent(e); });
    stage.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    stage.addEventListener("pointerup", function () { dragging = false; });
    stage.addEventListener("pointercancel", function () { dragging = false; });
    set(50);
    /* gentle nudge on first view so users notice it's draggable */
    if (hasGsap && !reduceMotion) {
      var demo = { v: 50 };
      gsap.to(demo, {
        keyframes: [{ v: 66 }, { v: 38 }, { v: 50 }],
        duration: 2.2, ease: "power2.inOut",
        scrollTrigger: { trigger: stage, start: "top 70%", once: true },
        onUpdate: function () { if (!dragging) set(demo.v); }
      });
    }
  })();

  /* recalculate trigger positions once images/fonts have settled —
     guards against scroll restoration measuring offsets mid-load */
  if (hasGsap) {
    window.addEventListener("load", function () {
      requestAnimationFrame(function () { ScrollTrigger.refresh(); });
    });
  }

})();
