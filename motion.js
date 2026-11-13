/* UnityHaus motion graphics.
   Each [data-mx] block animates once, the first time it scrolls into view.
   Numbers are written in the HTML at their final values, so search engines,
   AI tools and visitors with "reduce motion" always see the real figures. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- count-up ---------- */
  function fmt(v, el) {
    var dec = +(el.dataset.dec || 0), n = v * +(el.dataset.mult || 1);
    var s = dec ? n.toFixed(dec) : Math.round(n).toString();
    if (el.hasAttribute('data-sep')) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return s;
  }
  function countUp(el) {
    var to = parseFloat(el.dataset.count), from = parseFloat(el.dataset.from || 0), delay = +(el.dataset.delay || 0);
    if (reduce || isNaN(to)) return;
    el.textContent = fmt(from, el);
    setTimeout(function () {
      var t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(from + (to - from) * e, el);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, delay);
  }

  /* ---------- wall: columns side by side, inside (left) to outside (right) ---------- */
  var LAYERS = [
    ['Drywall', '½″', 0.5, '#E4DED3'],
    ['INTELLO Plus membrane', 'film', 0, '#6A4E8A'],
    ['Double 2×4 studs + insulation', '8″', 8, '#E8D3A8'],
    ['OSB sheathing', '⅝″', 0.625, '#C9A97A'],
    ['SIGA Majvest weather barrier', 'film', 0, '#1E7A52'],
    ['ROCKWOOL Comfortboard 80', '6″', 6, '#A8D9C0'],
    ['Rainscreen strapping', '¾″', 0.75, '#D5CFC4'],
    ['HardiePlank siding', '5⁄16″', 0.3125, '#5A5650']
  ];
  function buildWall(wall) {
    var W = wall.clientWidth; if (!W) return;
    var narrow = W < 460, rowH = narrow ? 24 : 28, labW = narrow ? Math.min(205, W * 0.62) : Math.min(290, W * 0.45);
    var wallH = narrow ? 120 : 150, n = LAYERS.length, x0 = labW + 18, wallW = W - x0, minW = 3;
    var films = LAYERS.filter(function (l) { return !l[2]; }).length;
    var tot = LAYERS.reduce(function (a, l) { return a + l[2]; }, 0);
    var scale = (wallW - films * minW) / tot, x = x0, xs = [];
    LAYERS.forEach(function (l) { var w = l[2] ? l[2] * scale : minW; xs.push([x, w]); x += w; });
    var wallTop = n * rowH + 14;
    wall.style.height = (wallTop + wallH + 22) + 'px';
    wall.innerHTML = '';
    function add(cls, css, html) {
      var d = document.createElement('div'); d.className = cls;
      for (var k in css) d.style[k] = css[k];
      if (html) d.innerHTML = html;
      wall.appendChild(d); return d;
    }
    LAYERS.forEach(function (l, i) {
      var y = (n - 1 - i) * rowH + rowH / 2, cxm = xs[i][0] + xs[i][1] / 2, delay = (0.25 + i * 0.32) + 's';
      add('mx-wv-bar', { left: xs[i][0] + 'px', width: xs[i][1] + 'px', height: wallH + 'px', background: l[3], animationDelay: delay });
      var lab = add('mx-wv-lab', { top: (y - 8) + 'px', animationDelay: delay },
        '<span class="mx-wv-sw" style="background:' + l[3] + '"></span>' + l[0] + ' <em>' + l[1] + '</em>');
      var hx = lab.offsetWidth + 8;
      add('mx-wv-h', { top: y + 'px', left: hx + 'px', width: Math.max(0, cxm - hx) + 'px', animationDelay: delay });
      add('mx-wv-v', { top: y + 'px', left: cxm + 'px', height: (wallTop - y) + 'px', animationDelay: delay });
    });
    add('mx-wv-end', { left: x0 + 'px' }, 'Inside');
    add('mx-wv-end', { right: '0px' }, 'Outside');
  }

  /* ---------- ERV: box with diamond cross-flow core ---------- */
  function makeERV(cv) {
    var cx = cv.getContext('2d'), W = cv.width, H = cv.height;
    var BX0 = 250, BX1 = 750, BY0 = 60, BY1 = 510, CX = 500, CY = 285, R = 150;
    var TL = [CX - R / 2, CY - R / 2], TR = [CX + R / 2, CY - R / 2], BL = [CX - R / 2, CY + R / 2], BR = [CX + R / 2, CY + R / 2];
    var PLT = [BX0, 165], PLB = [BX0, 405], PRT = [BX1, 165], PRB = [BX1, 405];
    function quad(a, c, b, k) { var o = []; for (var i = 0; i <= k; i++) { var t = i / k, u = 1 - t; o.push([u*u*a[0] + 2*u*t*c[0] + t*t*b[0], u*u*a[1] + 2*u*t*c[1] + t*t*b[1]]); } return o; }
    function build(p) { var L = [0]; for (var i = 1; i < p.length; i++) L.push(L[i-1] + Math.hypot(p[i][0]-p[i-1][0], p[i][1]-p[i-1][1])); return { p: p, L: L, T: L[L.length-1] }; }
    function lenOf(p) { return build(p).T; }
    var fIn = quad(PLT, [360, 150], TL, 12), fOut = quad(BR, [640, 420], PRB, 12);
    var fresh = build(fIn.concat(fOut)); fresh.c0 = lenOf(fIn); fresh.c1 = fresh.c0 + Math.hypot(BR[0]-TL[0], BR[1]-TL[1]);
    var sIn = quad(PRT, [640, 150], TR, 12), sOut = quad(BL, [360, 420], PLB, 12);
    var stale = build(sIn.concat(sOut)); stale.c0 = lenOf(sIn); stale.c1 = stale.c0 + Math.hypot(BL[0]-TR[0], BL[1]-TR[1]);
    function at(p, d) {
      for (var i = 1; i < p.L.length; i++) if (p.L[i] >= d) {
        var t = (d - p.L[i-1]) / (p.L[i] - p.L[i-1] || 1), a = p.p[i-1], b = p.p[i];
        return [a[0] + (b[0]-a[0]) * t, a[1] + (b[1]-a[1]) * t];
      }
      return p.p[p.p.length - 1];
    }
    var WARM = [217, 90, 60], COLD = [60, 130, 215];
    function mix(a, b, t) { return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * t); }).join(',') + ')'; }
    function heat(p, d, warmFirst) { var t = Math.max(0, Math.min(1, (d - p.c0) / (p.c1 - p.c0))); return warmFirst ? mix(WARM, COLD, t) : mix(COLD, WARM, t); }
    function label(lines, x, y, align, color) {
      cx.textAlign = align;
      lines.forEach(function (ln, i) {
        var last = i === lines.length - 1;
        cx.font = last ? '600 30px "DM Sans", sans-serif' : '400 24px "DM Sans", sans-serif';
        cx.fillStyle = last ? color : '#1C1C1A'; cx.fillText(ln, x, y + i * 30);
      });
    }
    function port(x, y) { cx.fillStyle = '#FFFFFF'; cx.strokeStyle = '#5A5650'; cx.lineWidth = 3; cx.beginPath(); cx.ellipse(x, y, 16, 46, 0, 0, Math.PI * 2); cx.fill(); cx.stroke(); }
    function diamond() { cx.beginPath(); cx.moveTo(CX, CY - R); cx.lineTo(CX + R, CY); cx.lineTo(CX, CY + R); cx.lineTo(CX - R, CY); cx.closePath(); }
    var t0 = performance.now(), N = 16;
    return function draw(animate) {
      var sec = ((animate ? performance.now() : t0 + 2500) - t0) / 1000;
      cx.clearRect(0, 0, W, H);
      cx.fillStyle = '#EBF5EF'; cx.strokeStyle = '#1E7A52'; cx.lineWidth = 4;
      cx.beginPath(); if (cx.roundRect) cx.roundRect(BX0, BY0, BX1 - BX0, BY1 - BY0, 14); else cx.rect(BX0, BY0, BX1 - BX0, BY1 - BY0); cx.fill(); cx.stroke();
      cx.save(); diamond(); cx.fillStyle = '#FFFFFF'; cx.fill(); cx.clip();
      cx.strokeStyle = '#D5CFC4'; cx.lineWidth = 2;
      for (var k = -6; k <= 6; k++) { cx.beginPath(); cx.moveTo(CX - R + k * 22, CY - R); cx.lineTo(CX + R + k * 22, CY + R); cx.stroke(); }
      cx.restore();
      cx.strokeStyle = '#5A5650'; cx.lineWidth = 3; diamond(); cx.stroke();
      [fresh, stale].forEach(function (p) {
        cx.strokeStyle = 'rgba(90,86,80,.12)'; cx.lineWidth = 18; cx.lineCap = 'round'; cx.beginPath();
        p.p.forEach(function (q, i) { if (i) cx.lineTo(q[0], q[1]); else cx.moveTo(q[0], q[1]); }); cx.stroke();
      });
      port(PLT[0], PLT[1]); port(PLB[0], PLB[1]); port(PRT[0], PRT[1]); port(PRB[0], PRB[1]);
      [[fresh, false], [stale, true]].forEach(function (pair) {
        var p = pair[0];
        for (var i = 0; i < N; i++) {
          var d = ((i / N) * p.T + sec * 95) % p.T, q = at(p, d);
          cx.fillStyle = heat(p, d, pair[1]); cx.beginPath(); cx.arc(q[0], q[1], 9, 0, Math.PI * 2); cx.fill();
        }
      });
      cx.fillStyle = 'rgba(255,255,255,.92)'; cx.fillRect(CX - 120, CY - R - 46, 240, 36);
      cx.fillStyle = '#174F36'; cx.font = '600 24px "DM Sans", sans-serif'; cx.textAlign = 'center'; cx.fillText('Energy exchanging core', CX, CY - R - 20);
      label(['Fresh air', 'from outside', '−15°C'], BX0 - 30, 120, 'right', '#3C82D7');
      label(['Exhaust', 'to outside', '−9°C'], BX0 - 30, 360, 'right', '#3C82D7');
      label(['Stale air', 'from rooms', '21°C'], BX1 + 30, 120, 'left', '#D95A3C');
      label(['Fresh air', 'to rooms', '15°C'], BX1 + 30, 360, 'left', '#D95A3C');
      cx.textAlign = 'center'; cx.fillStyle = '#1E7A52'; cx.font = '400 36px "DM Serif Display", serif';
      cx.fillText('84% of the heat kept inside', CX, H - 14); cx.textAlign = 'left';
    };
  }

  /* ---------- blower door: leaks and gauge ---------- */
  function buildLeaks(g) {
    [[206, 98], [212, 160], [148, 220], [204, 276]].forEach(function (s, i) {
      var dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', s[0]); dot.setAttribute('cy', s[1]); dot.setAttribute('r', 4.5); dot.setAttribute('class', 'mx-leak-dot');
      g.appendChild(dot);
      for (var k = 0; k < 3; k++) {
        var c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', s[0] + 6); c.setAttribute('cy', s[1] - 4); c.setAttribute('r', 7); c.setAttribute('class', 'mx-puff');
        c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center'; c.style.animationDelay = (i * 0.35 + k * 0.8) + 's';
        g.appendChild(c);
      }
    });
  }
  function playGauge(root) {
    var nd = root.querySelector('.mx-needle'), arc = root.querySelector('.mx-gauge-arc'), num = root.querySelector('.mx-pa');
    if (!nd || reduce) return;
    nd.style.transition = 'none'; nd.style.transform = 'rotate(0deg)';
    arc.style.transition = 'none'; arc.setAttribute('stroke-dasharray', '0 60');
    void nd.getBoundingClientRect();
    requestAnimationFrame(function () {
      nd.style.transition = ''; nd.style.transform = 'rotate(150deg)';
      arc.style.transition = 'stroke-dasharray 2.2s cubic-bezier(.3,.9,.3,1)'; arc.setAttribute('stroke-dasharray', '50 60');
      countUp(num);
    });
  }

  /* ---------- FAQ: typed questions ---------- */
  var QA = [
    ['How much does a Passive House ADU cost?', '<b>About $350,000–$500,000</b> for 500–800 sq ft in Durham Region or the GTA.'],
    ['Can I build an ADU in my backyard in Oshawa?', '<b>In most cases, yes.</b> Ontario allows up to three units on most serviced urban lots.'],
    ['Does a Passive House need a furnace?', '<b>Usually not.</b> One small cold-climate heat pump heats and cools a small ADU.'],
    ['What ACH50 does a Passive House need?', '<b>0.6 ACH50 or less</b>, verified with a blower door test.']
  ];
  function startTyping(root) {
    var typed = root.querySelector('.mx-typed-text'), ans = root.querySelector('.mx-answer'), qi = 1, timer;
    if (!typed || reduce) return;
    function next() {
      var q = QA[qi % QA.length], n = 0;
      ans.style.opacity = 0;
      (function tick() {
        typed.textContent = q[0].slice(0, n);
        if (n < q[0].length) { n++; timer = setTimeout(tick, 38 + Math.random() * 40); }
        else { ans.innerHTML = q[1]; ans.style.opacity = 1; qi++; timer = setTimeout(next, 3400); }
      })();
    }
    timer = setTimeout(next, 3000);
  }

  /* ---------- cost: stacked bar ---------- */
  var SEGS = [['Design & permits', 7, '#6A4E8A'], ['Site & slab', 12, '#5A5650'], ['Framing', 15, '#C9A97A'], ['Envelope', 25, '#1E7A52'],
              ['Mechanical & electrical', 14, '#7EC9A8'], ['Interior finishes', 22, '#174F36'], ['Landscaping', 4, '#B8B0A2']];
  function buildStack(root) {
    var stack = root.querySelector('.mx-stack'), legend = root.querySelector('.mx-legend');
    SEGS.forEach(function (s, i) {
      var d = document.createElement('div'); d.className = 'mx-seg'; d.style.flex = s[1] + ' 1 0'; d.style.background = s[2];
      d.style.animationDelay = (0.2 + i * 0.3) + 's'; d.textContent = s[1] >= 12 ? s[1] + '%' : ''; d.title = s[0] + ': about ' + s[1] + '%';
      stack.appendChild(d);
      var l = document.createElement('span'); l.innerHTML = '<i style="background:' + s[2] + '"></i>' + s[0] + ' · about ' + s[1] + '%';
      legend.appendChild(l);
    });
  }

  /* ---------- timeline ---------- */
  function setupTimeline(ul) {
    ul.classList.add('mx-tl');
    var items = ul.querySelectorAll('li'), now = ul.querySelector('li.now'), i = 0;
    items.forEach(function (li) { if (li.classList.contains('done')) li.style.setProperty('--i', i++); });
    var line = document.createElement('div'); line.className = 'mx-tl-line';
    ul.appendChild(line);
    function size() { line.style.height = ((now ? now.offsetTop : ul.offsetHeight) + 10) + 'px'; }
    size(); window.addEventListener('resize', size);
  }

  /* ---------- wire everything up ---------- */
  var ervDraw = null, ervEl = null, ervOn = false;
  function ervLoop() { if (!ervOn) return; ervDraw(true); requestAnimationFrame(ervLoop); }

  document.querySelectorAll('.mx-wall').forEach(function (w) {
    buildWall(w);
    var lastW = w.clientWidth;
    window.addEventListener('resize', function () { if (w.clientWidth !== lastW) { lastW = w.clientWidth; buildWall(w); } });
  });
  var cv = document.querySelector('canvas.mx-erv');
  if (cv) { ervDraw = makeERV(cv); ervEl = cv; ervDraw(false); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!ervOn) ervDraw(false); }); }
  document.querySelectorAll('.mx-leaks').forEach(buildLeaks);
  document.querySelectorAll('[data-mx="stack"]').forEach(buildStack);
  document.querySelectorAll('.timeline[data-mx]').forEach(setupTimeline);

  function play(el) {
    if (!reduce) { el.classList.remove('play'); void el.offsetWidth; el.classList.add('play'); }
    el.querySelectorAll('[data-count]').forEach(function (n) { if (!n.classList.contains('mx-pa')) countUp(n); });
    var kind = el.dataset.mx;
    if (kind === 'gauge') playGauge(el);
    if (kind === 'ask') startTyping(el);
  }

  var blocks = Array.prototype.slice.call(document.querySelectorAll('[data-mx]'));
  function check() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    blocks.forEach(function (el) {
      if (el.dataset.mxDone) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.88 && r.bottom > vh * 0.12) { el.dataset.mxDone = '1'; play(el); }
    });
    if (ervEl && !reduce) {
      var r2 = ervEl.getBoundingClientRect(), vis = r2.top < vh && r2.bottom > 0;
      if (vis && !ervOn) { ervOn = true; ervLoop(); } else if (!vis) ervOn = false;
    }
  }
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  window.addEventListener('load', check);
  setInterval(check, 500);
  check();
})();
