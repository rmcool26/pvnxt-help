/* pvNXT Help: layout, demo sign-in, search and page renderers. Content lives in js/data.js. */
(function () {
  var H = window.HELP, page = document.body.dataset.page || '', main = document.getElementById('main');

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function strip(s) { return String(s).replace(/<[^>]*>/g, '').replace(/&amp;/g, '&'); }
  function qs(k) { return new URLSearchParams(location.search).get(k); }
  function ic(n, c) { return '<i data-lucide="' + n + '"' + (c ? ' class="' + c + '"' : '') + ' aria-hidden="true"></i>'; }
  function P(id) { return H.portals.filter(function (p) { return p.id === id; })[0]; }
  function A(id) { return H.articles.filter(function (a) { return a.id === id; })[0]; }
  function V(id) { return H.videos.filter(function (v) { return v.id === id; })[0]; }
  function inPortal(pid) { return H.articles.filter(function (a) { return a.p === pid; }); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  function user() { return store.get('pvh_user', null); }
  function set(html) { main.innerHTML = html; icons(); }
  function icons() { if (window.lucide) window.lucide.createIcons(); }
  function title(t) { document.title = t ? t + ' | pvNXT Help' : 'pvNXT Help'; }
  function pill(t) { return '<span class="pill">' + esc(t) + '</span>'; }
  function arrow() { return ic('arrow-right'); }

  /* ---------- search ---------- */
  function search(q, pid) {
    q = (q || '').trim().toLowerCase(); if (!q) return { a: [], v: [] };
    var words = q.split(/\s+/);
    function score(text, w) { text = text.toLowerCase(); var s = 0; words.forEach(function (x) { if (text.indexOf(x) > -1) s += w; }); return s; }
    var a = H.articles.filter(function (x) { return !pid || pid === 'all' || x.p === pid; }).map(function (x) {
      var body = x.body.map(function (b) { return b[0] === 'img' ? (b[2] || '') : Array.isArray(b[1]) ? b[1].join(' ') : b[1]; }).join(' ');
      var s = score(x.title, 6) + score(x.sum, 3) + score(strip(body), 1) + score(P(x.p).name, 2);
      return { x: x, s: s };
    }).filter(function (r) { return r.s > 0; }).sort(function (m, n) { return n.s - m.s; }).map(function (r) { return r.x; });
    var v = H.videos.filter(function (x) { return (!pid || pid === 'all' || x.p === pid || x.p === 'all') && score(x.title + ' ' + (x.p === 'all' ? '' : P(x.p).name), 1) > 0; });
    return { a: a, v: v };
  }
  function searchBox(opts) {
    opts = opts || {};
    var sel = opts.select ? '<label class="sr" for="sb-p">Portal</label><select id="sb-p" name="p" class="sb-sel"><option value="all">All portals</option>' + H.portals.map(function (p) { return '<option value="' + p.id + '"' + (opts.p === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select>' : (opts.p ? '<input type="hidden" name="p" value="' + opts.p + '">' : '');
    var n = ++searchBox.n;
    return '<form class="sbox' + (opts.big ? ' big' : '') + '" action="search.html" role="search" data-suggest' + (opts.rotate ? ' data-rotate="' + esc(opts.rotate) + '"' : '') + '>'
      + ic('search', 'sb-i') + '<label class="sr" for="sb-q' + n + '">Search help</label><input id="sb-q' + n + '" name="q" type="search" autocomplete="off" placeholder="' + esc(opts.ph || 'Describe your issue, e.g. “BOQ not updating”') + '" value="' + esc(opts.q || '') + '">'
      + sel + '<button class="btn" type="submit">Search</button><div class="sugg" hidden></div></form>';
  }
  searchBox.n = 0;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Search suggestions: live match count, arrow-key navigation, and a route to support when nothing matches */
  function wireSuggest() {
    [].forEach.call(document.querySelectorAll('[data-suggest]'), function (f) {
      if (f.dataset.wired) return; f.dataset.wired = '1';
      var inp = f.querySelector('input[name=q]'), box = f.querySelector('.sugg'), sel = f.querySelector('[name=p]');
      var bid = 'sugg-' + Math.random().toString(36).slice(2, 8);
      box.id = bid; box.setAttribute('role', 'listbox'); box.setAttribute('aria-label', 'Matching guides');
      inp.setAttribute('role', 'combobox'); inp.setAttribute('aria-autocomplete', 'list'); inp.setAttribute('aria-controls', bid); inp.setAttribute('aria-expanded', 'false');
      function hide() { box.hidden = true; inp.setAttribute('aria-expanded', 'false'); }
      function draw() {
        var q = inp.value.trim(); if (!q) { hide(); return; }
        var all = search(q, sel && sel.value).a, r = all.slice(0, 6);
        box.innerHTML = '<span class="sugg-n" role="status">' + (all.length ? all.length + (all.length === 1 ? ' guide matches' : ' guides match') : 'No guide matches yet') + '</span>'
          + r.map(function (a) { return '<a role="option" href="article.html?a=' + a.id + '"><b>' + esc(a.title) + '</b><span>' + esc(P(a.p).name) + ' · ' + esc(a.sum) + '</span></a>'; }).join('')
          + (all.length ? '<a class="sugg-all" href="search.html?q=' + encodeURIComponent(q) + '">See all results ' + arrow() + '</a>'
            : '<a class="sugg-all" href="contact.html?topic=' + encodeURIComponent(q) + '">Ask support about “' + esc(q) + '” ' + arrow() + '</a>');
        box.hidden = false; inp.setAttribute('aria-expanded', 'true'); icons();
      }
      inp.addEventListener('input', draw);
      inp.addEventListener('focus', function () { if (inp.value.trim()) draw(); });
      if (sel) sel.addEventListener('change', draw);
      f.addEventListener('keydown', function (e) {
        var o = [].slice.call(box.querySelectorAll('a')), i = o.indexOf(document.activeElement);
        if (e.key === 'Escape') { inp.focus(); hide(); return; }
        if (box.hidden || !o.length) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); (o[i + 1] || o[0]).focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (i <= 0) inp.focus(); else o[i - 1].focus(); }
      });
      document.addEventListener('click', function (e) { if (!f.contains(e.target)) hide(); });
      /* rotating example searches show what the guides cover; they stop while the visitor types */
      if (f.dataset.rotate && !reduce) {
        var ex = f.dataset.rotate.split('|'), k = 0;
        setInterval(function () {
          if (document.activeElement === inp || inp.value || document.hidden) return;
          k = (k + 1) % ex.length; inp.classList.add('ph-out');
          setTimeout(function () { inp.placeholder = 'Try “' + ex[k] + '”'; inp.classList.remove('ph-out'); }, 220);
        }, 3200);
      }
    });
  }

  /* ---------- header & footer ---------- */
  function layout() {
    var u = user(), chev = ic('chevron-down');
    var on = function (k) { return page === k ? ' class="on"' : ''; };
    var portalItems = H.portals.map(function (p) { return '<a class="item" href="portal.html?p=' + p.id + '"><span class="dd-ic">' + ic(p.icon) + '</span><span><b>' + esc(p.name) + '</b><span>' + esc(p.line) + '</span></span></a>'; }).join('');
    var initials = u ? (u.name || u.email).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map(function (s) { return s[0].toUpperCase(); }).join('') : '';
    var acct = u
      ? '<div class="has-dd umenu"><button type="button" aria-haspopup="true" aria-expanded="false" class="ubtn"><span class="avatar">' + esc(initials) + '</span><span class="uname">' + esc((u.name || u.email).split(' ')[0]) + '</span>' + chev + '</button><div class="dd dd-user"><div class="dd-who"><b>' + esc(u.name || 'Signed in') + '</b><span>' + esc(u.email) + '</span></div><a class="item" href="my.html">' + ic('layout-dashboard') + 'My help</a><a class="item" href="my.html#requests">' + ic('inbox') + 'My requests</a><a class="item" href="my.html#saved">' + ic('bookmark') + 'Saved guides</a><a class="item" href="my.html#learning">' + ic('graduation-cap') + 'Learning paths</a><button type="button" class="item" data-signout>' + ic('log-out') + 'Sign out</button></div></div>'
      : '<a class="btn sm ghost" href="signin.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search) + '">' + ic('log-in') + 'Sign in</a>';
    var hs = page === 'home' || page === 'search' ? '' : '<form class="hsearch" action="search.html" role="search" data-suggest>' + ic('search') + '<label class="sr" for="hq">Search help</label><input id="hq" name="q" type="search" autocomplete="off" placeholder="Search help"><kbd class="kbd" aria-hidden="true">/</kbd><div class="sugg" hidden></div></form>';
    var h = '<header class="hdr" id="hdr"><div class="wrap hdr-in">'
      + '<a class="logo hlogo" href="index.html" aria-label="pvNXT Help home"><img src="assets/logos/terranxt.png" alt="Terranxt"><span class="hl-name">pvNXT <b>Help</b></span></a>'
      + '<ul class="nav">'
      + '<li class="has-dd"><button type="button" aria-haspopup="true" aria-expanded="false"' + (page === 'portal' || page === 'article' ? ' class="on"' : '') + '>Portals ' + chev + '</button><div class="dd dd-portals">' + portalItems + '<div class="dd-foot"><a href="index.html#portals">All portals</a> · <a href="article.html?a=which-portal">Which portal is mine?</a></div></div></li>'
      + '<li><a href="videos.html"' + on('videos') + '>Videos</a></li>'
      + '<li><a href="contact.html"' + on('contact') + '>Contact</a></li>'
      + '<li><a href="status.html"' + on('status') + '>Status</a></li></ul>'
      + hs + '<div class="hdr-cta">' + acct + '<a class="btn sm" href="contact.html">Get support</a></div>'
      + '<button class="burger" id="burger" aria-label="Menu" aria-expanded="false">' + ic('menu') + '</button></div>'
      + '<nav class="mnav" aria-label="Mobile">' + '<form class="hsearch m" action="search.html" role="search" data-suggest>' + ic('search') + '<label class="sr" for="mq">Search help</label><input id="mq" name="q" type="search" autocomplete="off" placeholder="Search help"><div class="sugg" hidden></div></form>'
      + '<a href="index.html">Help home</a><div class="sub">' + H.portals.map(function (p) { return '<a href="portal.html?p=' + p.id + '">' + esc(p.name) + '</a>'; }).join('') + '</div>'
      + '<a href="videos.html">Videos</a><a href="contact.html">Contact</a><a href="status.html">Status</a>'
      + (u ? '<a href="my.html">My help</a><button type="button" class="mlink" data-signout>Sign out</button>' : '<a href="signin.html">Sign in</a>')
      + '<a class="btn" href="contact.html">Get support</a></nav></header>';

    var used = {}; [].forEach.call(document.querySelectorAll('[data-credit]'), function () { });
    var f = '<footer class="ftr"><div class="wrap ftr-main"><div class="ftr-cols">'
      + '<div class="ftr-brand"><a class="logo" href="index.html"><img src="assets/logos/terranxt.png" alt="Terranxt"></a><p class="ftr-tag">Guides for Studio, Go, Connect, SCADA and Artha.</p><address>' + esc(H.support.hours) + '<br><a href="mailto:' + H.support.email + '">' + H.support.email + '</a><br>' + esc(H.support.reply) + '</address></div>'
      + '<div><h6>Portals</h6><ul>' + H.portals.slice(0, 6).map(function (p) { return '<li><a href="portal.html?p=' + p.id + '">' + esc(p.name) + '</a></li>'; }).join('') + '</ul></div>'
      + '<div><h6>Help</h6><ul><li><a href="portal.html?p=account">Account &amp; security</a></li><li><a href="portal.html?p=apps">Mobile apps</a></li><li><a href="videos.html">Videos</a></li><li><a href="status.html">Status</a></li><li><a href="contact.html">Contact support</a></li></ul></div>'
      + '<div><h6>You</h6><ul>' + (user() ? '<li><a href="my.html">My help</a></li><li><a href="my.html#requests">My requests</a></li><li><a href="my.html#saved">Saved guides</a></li>' : '<li><a href="signin.html">Sign in</a></li>') + '</ul></div>'
      + '<div><h6>Terranxt</h6><ul><li><a href="' + H.support.site + '" target="_blank" rel="noopener">terranxt.com</a></li><li><a href="' + H.support.site + '/how-it-works.html" target="_blank" rel="noopener">How it works</a></li><li><a href="' + H.support.demo + '" target="_blank" rel="noopener">Request a demo</a></li><li><a href="' + H.support.site + '/privacy.html" target="_blank" rel="noopener">Privacy</a></li><li><a href="' + H.support.site + '/terms.html" target="_blank" rel="noopener">Terms</a></li></ul></div>'
      + '</div><div class="ftr-base"><span>© ' + new Date().getFullYear() + ' Terranxt Pvt Ltd. A pvNXT company. IIT Delhi–FITT incubated. Backed by Astongreens.</span><span>Screenshots are from the live portals. Personal details are blurred.</span></div></div></footer>';

    document.getElementById('site-header').outerHTML = h;
    document.getElementById('site-footer').outerHTML = f;
    var hd = document.getElementById('hdr'), b = document.getElementById('burger');
    b.addEventListener('click', function () { var o = hd.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
    var dds = [].slice.call(document.querySelectorAll('.has-dd')), timers = new WeakMap();
    function setOpen(el, v) { el.classList.toggle('open', v); var bt = el.querySelector('button'); if (bt) bt.setAttribute('aria-expanded', v); }
    function closeAll(x) { dds.forEach(function (d) { if (d !== x) setOpen(d, false); }); }
    dds.forEach(function (d) {
      /* hover intent: a passing cursor doesn't flick the menu open */
      d.addEventListener('mouseenter', function () { if (!matchMedia('(hover:hover)').matches) return; clearTimeout(timers.get(d)); timers.set(d, setTimeout(function () { closeAll(d); setOpen(d, true); }, 140)); });
      d.addEventListener('mouseleave', function () { clearTimeout(timers.get(d)); timers.set(d, setTimeout(function () { setOpen(d, false); }, 220)); });
      d.querySelector('button').addEventListener('click', function (e) { e.stopPropagation(); clearTimeout(timers.get(d)); var o = !d.classList.contains('open'); closeAll(d); setOpen(d, o); if (o && e.detail === 0) { var f = d.querySelector('.dd a, .dd button'); if (f) f.focus(); } });
      d.addEventListener('focusout', function (e) { if (!d.contains(e.relatedTarget)) setOpen(d, false); });
      /* arrow keys move through the open menu */
      d.addEventListener('keydown', function (e) {
        if (!d.classList.contains('open') || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
        var it = [].slice.call(d.querySelectorAll('.dd a, .dd button')), i = it.indexOf(document.activeElement);
        e.preventDefault(); (e.key === 'ArrowDown' ? it[i + 1] || it[0] : it[i - 1] || it[it.length - 1]).focus();
      });
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.has-dd')) closeAll(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { var o = document.querySelector('.has-dd.open'); closeAll(); if (o) o.querySelector('button').focus(); if (hd.classList.contains('open')) { hd.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); b.focus(); } }
      /* "/" jumps to search, unless the visitor is typing */
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '') && !document.activeElement.isContentEditable) {
        var s = [].slice.call(document.querySelectorAll('input[name=q]')).filter(function (x) { return x.offsetParent; })[0];
        if (s) { e.preventDefault(); s.focus(); s.select(); }
      }
    });
    [].forEach.call(document.querySelectorAll('[data-signout]'), function (x) { x.addEventListener('click', function () { try { localStorage.removeItem('pvh_user'); } catch (e) { } location.href = 'index.html'; }); });
    /* skip link, WhatsApp, back to top (same as terranxt.com) */
    var sk = document.createElement('a'); sk.className = 'skip'; sk.href = '#main'; sk.textContent = 'Skip to content'; document.body.insertBefore(sk, document.body.firstChild);
    main.tabIndex = -1;
    var wa = document.createElement('a'); wa.className = 'wa-fab'; wa.href = H.support.whatsapp; wa.target = '_blank'; wa.rel = 'noopener noreferrer'; wa.setAttribute('aria-label', 'Chat with pvNXT support on WhatsApp');
    wa.innerHTML = ic('message-circle') + '<span>WhatsApp</span>'; document.body.appendChild(wa);
    var tt = document.createElement('button'); tt.type = 'button'; tt.className = 'to-top'; tt.setAttribute('aria-label', 'Back to top'); tt.innerHTML = ic('chevron-up'); document.body.appendChild(tt);
    tt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
    window.addEventListener('scroll', function () { tt.classList.toggle('show', window.scrollY > 700); }, { passive: true });
  }

  /* ---------- shared blocks ---------- */
  function names(list) { var n = list.map(function (p) { return p.name; }); return n.length > 1 ? n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1] : n.join(''); }
  function shot(src, cls, alt) { return src ? '<img class="' + (cls || '') + '" src="' + src + '" alt="' + esc(alt || '') + '" loading="lazy">' : ''; }
  function firstShot(a) { var f = a && a.body.filter(function (b) { return b[0] === 'img'; })[0]; return f ? 'assets/guides/' + f[1] : null; }
  function vThumb(v) { var s = firstShot(A(v.article)); if (s) return s; var p = P(v.p); return p ? p.shot : null; }
  function artRow(a, showPortal) {
    return '<a class="arow" href="article.html?a=' + a.id + '">' + ic('file-text', 'arow-i') + '<span><b>' + esc(a.title) + '</b><span>' + (showPortal ? esc(P(a.p).name) + ' · ' : '') + esc(a.sum) + '</span></span>' + ic('chevron-right', 'arow-c') + '</a>';
  }
  function vidCard(v) {
    var pn = v.p === 'all' ? 'All portals' : P(v.p).name, t = vThumb(v);
    var inner = '<span class="vthumb">' + (t ? shot(t) : '<span class="vblank">' + ic(v.p === 'all' ? 'layers' : P(v.p).icon) + '</span>') + '<span class="vplay">' + ic(v.yt ? 'play' : 'file-text') + '</span>' + (v.yt ? '' : '<span class="vsoon">Written guide for now</span>') + '</span><span class="tg">' + esc(pn) + '</span><b>' + esc(v.title) + '</b>';
    /* no recording yet: it is a link to the guide, so it is an <a>, not a button */
    return v.yt ? '<button type="button" class="vcard" data-video="' + v.id + '">' + inner + '</button>' : '<a class="vcard" href="article.html?a=' + v.article + '">' + inner + '</a>';
  }
  function wireVideos() {
    [].forEach.call(document.querySelectorAll('[data-video]'), function (b) {
      b.addEventListener('click', function () { openVideo(V(b.dataset.video)); });
    });
  }
  function openVideo(v) {
    var a = A(v.article);
    /* no recording yet: go straight to the written guide instead of a "coming soon" box */
    if (!v.yt) { location.href = a ? 'article.html?a=' + a.id : 'videos.html'; return; }
    var dlg = document.createElement('div');
    dlg.className = 'modal'; dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-label', v.title);
    dlg.innerHTML = '<div class="m-back" data-close></div><div class="m-box"><button type="button" class="m-x" data-close aria-label="Close">' + ic('x') + '</button><div class="m-vid"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(v.yt) + '?autoplay=1&rel=0" title="' + esc(v.title) + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div></div>';
    document.body.appendChild(dlg); document.body.style.overflow = 'hidden'; icons();
    var last = document.activeElement; dlg.querySelector('.m-x').focus();
    function close() { dlg.remove(); document.body.style.overflow = ''; if (last) last.focus(); document.removeEventListener('keydown', key); }
    function key(e) { if (e.key === 'Escape') close(); if (e.key === 'Tab') { var f = [].slice.call(dlg.querySelectorAll('button, iframe')); var i = f.indexOf(document.activeElement); e.preventDefault(); (f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length]).focus(); } }
    document.addEventListener('keydown', key);
    [].forEach.call(dlg.querySelectorAll('[data-close]'), function (x) { x.addEventListener('click', close); });
  }
  function helpBand() {
    return '<section class="hband"><div class="wrap hband-in"><div class="stack"><span class="eyebrow">Still stuck?</span><h2>A person will reply within one working day.</h2><p class="muted">' + H.support.email + ' · WhatsApp and phone, ' + esc(H.support.hours) + '</p></div><div class="cta-row"><a class="btn" href="contact.html">Contact support</a><a class="btn ghost" href="' + H.support.whatsapp + '" target="_blank" rel="noopener">' + ic('message-circle') + 'WhatsApp</a></div></div></section>';
  }
  function crumbs(list) {
    return '<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Help</a></li>' + list.map(function (c, i) { return '<li>' + (c[1] && i < list.length - 1 ? '<a href="' + c[1] + '">' + esc(c[0]) + '</a>' : '<span aria-current="page">' + esc(c[0]) + '</span>') + '</li>'; }).join('') + '</ol></nav>';
  }

  /* ---------- pages ---------- */
  var R = {};

  R.home = function () {
    title(''); var u = user();
    var chips = [['Register a new lead', 'studio-add-lead'], ['Verify an installer account', 'go-verify-account'], ['Draw your roof boundary', 'connect-measure-roof'], ['Assign an installer', 'studio-assign-installer'], ['Reset a password', 'reset-password']];
    var roles = [['studio', 'I run an EPC or sales team', 'Leads, bids, roof design, BOQ and proposals'], ['go', 'I install on site', 'Bids, the site checklist and handover'], ['connect', 'I’m going solar at home or work', 'Your roof, the estimate, agreement and payment'], ['scada', 'I look after a running plant', 'Alerts and work orders'], ['artha', 'I want to invest', 'How Artha works, and its risks']];
    var lead = A('studio-roof-analysis'), side = [A('go-site-updates'), A('connect-install-path')];
    function feat(a, big) {
      var p = P(a.p);
      return '<a class="feat' + (big ? ' big' : '') + '" href="article.html?a=' + a.id + '"><span class="feat-img">' + shot(firstShot(a), '', '') + '</span><span class="feat-t"><span class="tg">' + esc(p.name) + '</span><b>' + esc(a.title) + '</b><span>' + esc(a.sum) + '</span></span></a>';
    }
    set(
      '<section class="page-hero home-hero"><div class="wrap home-in">'
      + '<div class="hh-l"><span class="eyebrow"><span class="dot"></span>pvNXT Help</span>'
      + '<h1>Find the step you’re on.</h1><p class="lead">Step-by-step guides for Studio, Go and Connect, with screenshots from the live portals.</p>'
      + searchBox({ big: true, ph: 'Try “keepout zone”', rotate: 'keepout zone|Self Mode|Cost per Wp|register a new lead|draw roof boundary|assign an installer|reset password' })
      + '<div class="chips"><span class="chips-l">Start with</span>' + chips.map(function (c) { return '<a class="chip" href="article.html?a=' + c[1] + '">' + c[0] + '</a>'; }).join('') + '</div></div>'
      + '<nav class="picker" aria-label="Guides by role"><span class="picker-h">Which one are you?</span>'
      + roles.map(function (r) { var p = P(r[0]); return '<a href="portal.html?p=' + p.id + '"><span class="pk-i">' + ic(p.icon) + '</span><span class="pk-t"><b>' + esc(r[1]) + '</b><span>' + esc(r[2]) + '</span></span><span class="pk-p">' + esc(p.name) + ic('arrow-right') + '</span></a>'; }).join('')
      + '<span class="pk-foot">' + (u ? '<a href="my.html">Open my help</a>: your requests, saved guides and progress.' : '<a href="signin.html?next=my.html">Sign in</a> to track your requests and save guides. Every guide stays open without signing in.') + '</span></nav>'
      + '</div></section>'

      + '<section class="sec"><div class="wrap"><div class="sec-row"><div class="stack-s"><span class="eyebrow">Start here</span><h2>The main job in each portal</h2></div><p class="muted">Each guide follows the portal screen by screen.</p></div>'
      + '<div class="feats">' + feat(lead, true) + '<div class="feats-s">' + side.map(function (a) { return feat(a, false); }).join('') + '</div></div></div></section>'

      + '<section class="sec tint" id="portals"><div class="wrap"><div class="sec-row"><div class="stack-s"><span class="eyebrow">Guides by portal</span><h2>All portals share one project record</h2></div><p class="muted">A design from Studio becomes the task list in Go and the proposal in Connect, so the guides link across portals.</p></div>'
      + '<div class="prows">' + H.portals.map(function (p) { var n = inPortal(p.id).length; return '<a class="prow" href="portal.html?p=' + p.id + '"><span class="prow-n">' + ic(p.icon) + '<b>' + esc(p.name) + '</b></span><span class="prow-l">' + esc(p.line) + '</span><span class="prow-h">' + (p.host || esc(p.tag)) + '</span><span class="prow-c">' + n + ' guide' + (n === 1 ? '' : 's') + ic('arrow-right') + '</span></a>'; }).join('') + '</div></div></section>'
      + helpBand()
    );
    wireSuggest();
  };

  R.portal = function () {
    var p = P(qs('p')); if (!p) return R['404']();
    title(p.name + ' help');
    var arts = inPortal(p.id), vids = H.videos.filter(function (v) { return v.p === p.id && v.yt; });
    var others = H.portals.filter(function (x) { return x.id !== p.id; });
    var right = p.shot
      ? '<figure class="phero-img"><button type="button" class="zoom" data-zoom="' + p.shot + '" data-cap="' + esc(p.name) + ' as it looks today" aria-label="Enlarge ' + esc(p.name) + ' screenshot">' + shot(p.shot, '', p.name + ' screenshot') + '<span class="zoom-i">' + ic('maximize-2') + '</span></button><figcaption>' + esc(p.name) + ' as it looks today.</figcaption></figure>'
      : '<dl class="pfacts"><div><dt>For</dt><dd>' + esc(p.who) + '</dd></div>' + (p.host ? '<div><dt>Address</dt><dd>' + p.host + '</dd></div>' : '') + '<div><dt>Status</dt><dd>' + esc(p.tag) + '</dd></div><div><dt>Guides</dt><dd>' + arts.length + '</dd></div></dl>';
    set(
      '<section class="page-hero phero"><div class="wrap phero-in"><div class="stack">' + crumbs([[p.name + ' help']])
      + '<span class="eyebrow"><span class="dot"></span>' + esc(p.tag) + (p.host ? ' · ' + p.host : '') + '</span><h1>' + esc(p.name) + ' help</h1><p class="lead">' + esc(p.line) + ' For ' + esc(p.who.charAt(0).toLowerCase() + p.who.slice(1)) + '.</p>'
      + searchBox({ p: p.id, ph: 'Search ' + p.name + ' guides' })
      + (p.url ? '<div class="cta-row"><a class="btn ghost" href="' + p.url + '" target="_blank" rel="noopener">Open ' + esc(p.name) + ' ' + ic('external-link') + '</a></div>' : '') + '</div>'
      + right + '</div></section>'

      + '<section class="sec"><div class="wrap topics">' + p.topics.map(function (t) {
        var list = arts.filter(function (a) { return a.t === t.id; });
        return '<div class="topic"><h2 class="topic-h">' + esc(t.name) + '<span>' + list.length + '</span></h2><div class="alist">' + list.map(function (a) { return artRow(a, false); }).join('') + '</div></div>';
      }).join('') + '</div></section>'

      + (vids.length ? '<section class="sec tight tint"><div class="wrap"><div class="sec-row"><div class="stack-s"><span class="eyebrow">Videos</span><h2 class="h3x">' + esc(p.name) + ' demos</h2></div><a class="link" href="videos.html#' + p.id + '">All videos ' + arrow() + '</a></div><div class="vgrid">' + vids.map(vidCard).join('') + '</div></div></section>' : '')

      + '<section class="sec tight"><div class="wrap"><div class="sec-row"><h2 class="h3x">Other portals</h2></div><div class="olist">' + others.map(function (o) { return '<a class="ochip" href="portal.html?p=' + o.id + '">' + ic(o.icon) + esc(o.name) + '</a>'; }).join('') + '</div></div></section>'
      + helpBand()
    );
    wireSuggest(); wireVideos(); wireZoom();
  };

  function wireZoom() {
    [].forEach.call(main.querySelectorAll('[data-zoom]'), function (z) {
      z.addEventListener('click', function () {
        var dlg = document.createElement('div'); dlg.className = 'modal'; dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-label', z.dataset.cap || 'Screenshot');
        dlg.innerHTML = '<div class="m-back" data-close></div><div class="m-box m-shot"><button type="button" class="m-x" data-close aria-label="Close">' + ic('x') + '</button><img src="' + z.dataset.zoom + '" alt="' + esc(z.dataset.cap) + '">' + (z.dataset.cap ? '<p class="m-cap">' + esc(z.dataset.cap) + '</p>' : '') + '</div>';
        document.body.appendChild(dlg); document.body.style.overflow = 'hidden'; icons(); dlg.querySelector('.m-x').focus();
        function close() { dlg.remove(); document.body.style.overflow = ''; z.focus(); document.removeEventListener('keydown', key); }
        function key(e) { if (e.key === 'Escape') close(); if (e.key === 'Tab') { e.preventDefault(); dlg.querySelector('.m-x').focus(); } }
        document.addEventListener('keydown', key);
        [].forEach.call(dlg.querySelectorAll('[data-close]'), function (x) { x.addEventListener('click', close); });
      });
    });
  }
  function slug(s) { return 's-' + strip(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function block(b) {
    switch (b[0]) {
      case 'p': return '<p>' + b[1] + '</p>';
      case 'h': return '<h2 id="' + slug(b[1]) + '">' + b[1] + '</h2>';
      case 'img': var cap = b[2] || '', src = 'assets/guides/' + b[1];
        return '<figure class="gshot"><button type="button" class="zoom" data-zoom="' + src + '" data-cap="' + esc(strip(cap)) + '" aria-label="Enlarge screenshot' + (cap ? ': ' + esc(strip(cap)) : '') + '"><img src="' + src + '" alt="' + esc(strip(cap)) + '" loading="lazy"><span class="zoom-i">' + ic('maximize-2') + '</span></button>' + (cap ? '<figcaption>' + cap + '</figcaption>' : '') + '</figure>';
      case 'steps': return '<ol class="steps-l">' + b[1].map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>';
      case 'list': return '<ul class="list-l">' + b[1].map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul>';
      case 'tip': return '<div class="call tip">' + ic('lightbulb') + '<div><b>Tip</b> ' + b[1] + '</div></div>';
      case 'note': return '<div class="call note">' + ic('info') + '<div><b>Good to know</b> ' + b[1] + '</div></div>';
      case 'warn': return '<div class="call warn">' + ic('triangle-alert') + '<div><b>Important</b> ' + b[1] + '</div></div>';
    }
    return '';
  }

  R.article = function () {
    var a = A(qs('a')); if (!a) return R['404']();
    var p = P(a.p), u = user(), list = inPortal(p.id), i = list.indexOf(a);
    title(a.title);
    var read = store.get('pvh_read', []); if (read.indexOf(a.id) < 0) { read.push(a.id); store.set('pvh_read', read); }
    var recent = store.get('pvh_recent', []).filter(function (x) { return x !== a.id; }); recent.unshift(a.id); store.set('pvh_recent', recent.slice(0, 8));
    var saved = store.get('pvh_saved', []), isSaved = saved.indexOf(a.id) > -1;
    var vid = a.video ? V(a.video) : null, topic = p.topics.filter(function (t) { return t.id === a.t; })[0];
    var prev = list[i - 1], next = list[i + 1];
    set(
      '<div class="wrap art-wrap"><aside class="art-nav" aria-label="' + esc(p.name) + ' guides"><a class="art-nav-p" href="portal.html?p=' + p.id + '">' + ic(p.icon) + esc(p.name) + ' help</a>'
      + p.topics.map(function (t) { return '<h6>' + esc(t.name) + '</h6><ul>' + list.filter(function (x) { return x.t === t.id; }).map(function (x) { return '<li><a href="article.html?a=' + x.id + '"' + (x.id === a.id ? ' aria-current="page"' : '') + '>' + esc(x.title) + '</a></li>'; }).join('') + '</ul>'; }).join('')
      + '</aside>'
      + '<article class="art">' + crumbs([[p.name, 'portal.html?p=' + p.id], [topic ? topic.name : '', 'portal.html?p=' + p.id], [a.title]])
      + '<h1>' + esc(a.title) + '</h1><p class="lead">' + esc(a.sum) + '</p>'
      + '<div class="art-meta">' + pill(p.name) + (p.id !== 'artha' && p.id !== 'account' ? '<span>' + ic('monitor-smartphone') + 'Web and app</span>' : '') + '<button type="button" class="art-act" data-save aria-pressed="' + isSaved + '">' + ic(isSaved ? 'bookmark-check' : 'bookmark') + '<span>' + (isSaved ? 'Saved' : u ? 'Save' : 'Sign in to save') + '</span></button><button type="button" class="art-act" data-copy>' + ic('link') + '<span>Copy link</span></button></div>'
      + '<div class="art-body">' + a.body.map(block).join('') + '</div>'
      + (vid && vid.yt ? '<button type="button" class="art-vid" data-video="' + vid.id + '">' + shot(vThumb(vid)) + '<span class="vplay">' + ic('play') + '</span><span class="art-vid-t"><span class="tg">Video</span><b>' + esc(vid.title) + '</b></span></button>' : '')
      + '<div class="fb" data-fb><b>Was this helpful?</b><div class="fb-b"><button type="button" class="btn sm ghost" data-v="yes">' + ic('thumbs-up') + 'Yes</button><button type="button" class="btn sm ghost" data-v="no">' + ic('thumbs-down') + 'No</button></div><p class="fb-ok" hidden></p></div>'
      + '<nav class="pn" aria-label="Previous and next guide">' + (prev ? '<a class="pn-p" href="article.html?a=' + prev.id + '"><span class="pn-l">' + ic('chevron-left') + 'Previous</span><b>' + esc(prev.title) + '</b></a>' : '<span></span>') + (next ? '<a class="pn-n" href="article.html?a=' + next.id + '"><span class="pn-l">Next' + ic('chevron-right') + '</span><b>' + esc(next.title) + '</b></a>' : '') + '</nav>'
      + '</article>'
      + '<aside class="art-side">' + (function () { var hs = a.body.filter(function (b) { return b[0] === 'h'; }); return hs.length > 1 ? '<nav class="toc" aria-label="On this page"><b>On this page</b><ul>' + hs.map(function (b) { return '<li><a href="#' + slug(b[1]) + '">' + strip(b[1]) + '</a></li>'; }).join('') + '</ul></nav>' : ''; })() + '<div class="side-card"><b>Need a hand?</b><p>' + esc(H.support.reply) + '</p><a class="btn sm" href="contact.html?portal=' + p.id + '&topic=' + encodeURIComponent(a.title) + '">Contact support</a><a class="link sm" href="' + H.support.whatsapp + '" target="_blank" rel="noopener">' + ic('message-circle') + 'WhatsApp us</a></div>'
      + (p.url ? '<a class="side-open" href="' + p.url + '" target="_blank" rel="noopener">' + ic('external-link') + 'Open ' + esc(p.name) + '<span>' + p.host + '</span></a>' : '')
      + '</aside></div>'
    );
    var sb = main.querySelector('[data-save]');
    sb.addEventListener('click', function () {
      if (!user()) { location.href = 'signin.html?next=' + encodeURIComponent('article.html?a=' + a.id); return; }
      var s = store.get('pvh_saved', []), k = s.indexOf(a.id); if (k > -1) s.splice(k, 1); else s.unshift(a.id); store.set('pvh_saved', s);
      var on = k < 0; sb.setAttribute('aria-pressed', on); sb.innerHTML = ic(on ? 'bookmark-check' : 'bookmark') + '<span>' + (on ? 'Saved' : 'Save') + '</span>'; icons();
    });
    main.querySelector('[data-copy]').addEventListener('click', function (e) {
      var b = e.currentTarget, t = b.querySelector('span');
      function done() { t.textContent = 'Copied'; setTimeout(function () { t.textContent = 'Copy link'; }, 1600); }
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, done); else done();
    });
    wireZoom();
    /* highlight the section being read in "On this page" */
    var toc = main.querySelectorAll('.toc a');
    if (toc.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) [].forEach.call(toc, function (l) { if (l.getAttribute('href') === '#' + en.target.id) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); }); });
      }, { rootMargin: '-90px 0px -65% 0px' });
      [].forEach.call(main.querySelectorAll('.art-body h2[id]'), function (h) { io.observe(h); });
    }
    [].forEach.call(main.querySelectorAll('[data-fb] [data-v]'), function (b) {
      b.addEventListener('click', function () {
        var fb = store.get('pvh_feedback', {}); fb[a.id] = b.dataset.v; store.set('pvh_feedback', fb);
        var box = main.querySelector('[data-fb]'); box.querySelector('.fb-b').hidden = true; var ok = box.querySelector('.fb-ok'); ok.hidden = false;
        ok.innerHTML = b.dataset.v === 'yes' ? 'Thanks. Glad it helped.' : 'Thanks for telling us. <a href="contact.html?portal=' + p.id + '&topic=' + encodeURIComponent(a.title) + '">Tell us what was missing</a> and we’ll improve this guide.';
      });
    });
    wireVideos();
  };

  R.videos = function () {
    title('Videos & demos');
    var tabs = [{ id: 'all', name: 'All' }].concat(H.portals.filter(function (p) { return H.videos.some(function (v) { return v.p === p.id; }); }));
    var start = (location.hash || '').slice(1); if (!tabs.some(function (t) { return t.id === start; })) start = 'all';
    set(
      '<section class="page-hero"><div class="wrap">' + crumbs([['Videos']]) + '<span class="eyebrow"><span class="dot"></span>' + (H.videos.some(function (v) { return v.yt; }) ? 'Demos' : 'Recordings in progress') + '</span><h1>Demo videos</h1><p class="lead">We’re recording a short demo for each task below. Until a video is up, its card opens the written guide, which has the same steps with screenshots.</p><div class="cta-row"><a class="btn" href="' + H.support.demo + '" target="_blank" rel="noopener">Book a live walkthrough instead ' + arrow() + '</a></div></div></section>'
      + '<section class="sec"><div class="wrap"><div class="tabs-r" role="group" aria-label="Filter videos by portal">' + tabs.map(function (t) { return '<button type="button" data-tab="' + t.id + '" aria-pressed="' + (t.id === start) + '">' + esc(t.name) + '</button>'; }).join('') + '</div><div class="vgrid" id="vg"></div></div></section>'
      + '<section class="sec tint"><div class="wrap"><div class="stack-s mb"><span class="eyebrow">Learning paths</span><h2>Each portal, in the order you’ll use it</h2></div><div class="pathgrid">'
      + H.paths.map(function (pa) { var p = P(pa.p); return '<div class="path"><span class="tg">' + esc(p.name) + '</span><b>' + esc(pa.title) + '</b><ol>' + pa.steps.map(function (s, i) { var x = A(s); return '<li><a href="article.html?a=' + x.id + '"><i>' + String(i + 1).padStart(2, '0') + '</i>' + esc(x.title) + '</a></li>'; }).join('') + '</ol><a class="link" href="article.html?a=' + pa.steps[0] + '">Start path ' + arrow() + '</a></div>'; }).join('')
      + '</div></div></section>' + helpBand()
    );
    function draw(id) {
      document.getElementById('vg').innerHTML = H.videos.filter(function (v) { return id === 'all' || v.p === id; }).map(vidCard).join('');
      [].forEach.call(main.querySelectorAll('[data-tab]'), function (b) { b.setAttribute('aria-pressed', b.dataset.tab === id); });
      icons(); wireVideos();
    }
    [].forEach.call(main.querySelectorAll('[data-tab]'), function (b) { b.addEventListener('click', function () { history.replaceState(null, '', b.dataset.tab === 'all' ? 'videos.html' : '#' + b.dataset.tab); draw(b.dataset.tab); }); });
    draw(start);
  };

  R.search = function () {
    var q = qs('q') || '', pid = qs('p') || 'all', r = search(q, pid);
    title(q ? 'Results for “' + q + '”' : 'Search');
    var n = r.a.length + r.v.length;
    set(
      '<section class="page-hero tight-hero"><div class="wrap">' + crumbs([['Search']]) + '<h1>' + (q ? 'Results for “' + esc(q) + '”' : 'Search help') + '</h1>' + searchBox({ q: q, p: pid, select: true }) + '</div></section>'
      + '<section class="sec"><div class="wrap narrow-w">'
      + (q ? '<p class="muted mb">' + n + ' result' + (n === 1 ? '' : 's') + (pid !== 'all' ? ' in ' + esc(P(pid).name) + ' · <a href="search.html?q=' + encodeURIComponent(q) + '">search all portals</a>' : '') + '</p>' : '')
      + (r.a.length ? '<h2 class="h3x mb">Guides</h2><div class="alist">' + r.a.map(function (a) { return artRow(a, true); }).join('') + '</div>' : '')
      + (r.v.length ? '<h2 class="h3x mb mt2">Videos</h2><div class="vgrid">' + r.v.map(vidCard).join('') + '</div>' : '')
      + (q && !n ? '<div class="empty">' + ic('search-x') + '<h2>No guides match that yet.</h2><p>Try fewer words, or one of these. You can also ask us directly.</p><div class="chips">' + H.popular.slice(0, 4).map(function (id) { var x = A(id); return '<a class="chip" href="article.html?a=' + id + '">' + esc(x.title) + '</a>'; }).join('') + '</div><a class="btn" href="contact.html?topic=' + encodeURIComponent(q) + '">Ask support</a></div>' : '')
      + (!q ? '<h2 class="h3x mb">Start with these</h2><div class="alist">' + H.popular.map(function (id) { return artRow(A(id), true); }).join('') + '</div>' : '')
      + '</div></section>' + helpBand()
    );
    wireSuggest(); wireVideos();
  };

  R.contact = function () {
    title('Contact support'); var u = user(), pre = qs('portal') || '', topic = qs('topic') || '';
    set(
      '<section class="page-hero"><div class="wrap">' + crumbs([['Contact']]) + '<span class="eyebrow"><span class="dot"></span>' + esc(H.support.hours) + '</span><h1>Talk to the pvNXT team.</h1><p class="lead">Tell us what happened. ' + esc(H.support.reply) + '</p></div></section>'
      + '<section class="sec"><div class="wrap contact-g">'
      + '<div class="fcard"><form id="rq" novalidate><h2 class="h3x">Raise a request</h2>'
      + '<div class="two"><label>Name<input name="name" required autocomplete="name" value="' + esc(u ? u.name || '' : '') + '"></label><label>Work email<input name="email" type="email" required autocomplete="email" value="' + esc(u ? u.email : '') + '"></label></div>'
      + '<div class="two"><label>Portal<select name="portal" required><option value="">Choose a portal</option>' + H.portals.map(function (p) { return '<option value="' + p.id + '"' + (pre === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select></label><label>Topic<input name="topic" required placeholder="e.g. BOQ not updating" value="' + esc(topic) + '"></label></div>'
      + '<div class="hint-arts" id="ha" hidden></div>'
      + '<label>What happened?<textarea name="msg" rows="5" required placeholder="What you did, what you expected, what you saw. Include the project or plant name if you have one."></textarea></label>'
      + '<p class="ferr" id="ferr" role="alert" hidden></p><div class="cta-row"><button class="btn" type="submit">Send request ' + arrow() + '</button><span class="note">Sends through your email app to ' + H.support.email + '.</span></div></form>'
      + '<div class="ok" id="ok">' + ic('circle-check') + '<h3>Your request is ready to send.</h3><p class="muted">Your email app opened with the details filled in. Press send and we’ll reply within one working day.</p><p class="muted" id="ok-mail"></p><div class="cta-row"><a class="btn" href="' + (u ? 'my.html#requests' : 'index.html') + '">' + (u ? 'View my requests' : 'Back to help') + '</a><button type="button" class="link" id="again">Raise another</button></div></div></div>'
      + '<aside class="stack"><a class="ccard row" href="mailto:' + H.support.email + '">' + ic('mail') + '<span><b>Email</b><span>' + H.support.email + '</span></span></a>'
      + '<a class="ccard row" href="' + H.support.whatsapp + '" target="_blank" rel="noopener">' + ic('message-circle') + '<span><b>WhatsApp</b><span>' + esc(H.support.hours) + '</span></span></a>'
      + '<a class="ccard row" href="' + H.support.demo + '" target="_blank" rel="noopener">' + ic('calendar') + '<span><b>Book a live demo</b><span>A walkthrough for your team</span></span></a>'
      + '<a class="ccard row" href="status.html">' + ic('activity') + '<span><b>Portal status</b><span>Check before you write</span></span></a></aside>'
      + '</div></section>'
    );
    var f = document.getElementById('rq'), ha = document.getElementById('ha');
    function hints() {
      var pid = f.portal.value, t = f.topic.value;
      var r = t.trim() ? search(t, pid || 'all').a.slice(0, 3) : (pid ? inPortal(pid).slice(0, 3) : []);
      if (!r.length) { ha.hidden = true; return; }
      ha.innerHTML = '<b>These guides might answer it:</b>' + r.map(function (a) { return '<a href="article.html?a=' + a.id + '" target="_blank">' + ic('file-text') + esc(a.title) + '</a>'; }).join(''); ha.hidden = false; icons();
    }
    f.portal.addEventListener('change', hints); f.topic.addEventListener('input', hints); hints();
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var err = document.getElementById('ferr'), bad = [];
      ['name', 'email', 'portal', 'topic', 'msg'].forEach(function (k) { var el = f[k], v = el.value.trim(), ok = v && (k !== 'email' || /\S+@\S+\.\S+/.test(v)); el.setAttribute('aria-invalid', !ok); if (!ok) bad.push(el); });
      if (bad.length) { err.textContent = 'Please fill in the highlighted fields.'; err.hidden = false; bad[0].focus(); return; }
      err.hidden = true;
      var d = { id: 'R' + Date.now().toString(36).toUpperCase().slice(-6), portal: f.portal.value, topic: f.topic.value.trim(), msg: f.msg.value.trim(), name: f.name.value.trim(), email: f.email.value.trim(), at: new Date().toISOString(), status: 'Sent' };
      if (user()) { var rs = store.get('pvh_requests', []); rs.unshift(d); store.set('pvh_requests', rs); }
      var subj = '[pvNXT Help] ' + P(d.portal).name + ': ' + d.topic + ' (' + d.id + ')';
      var bodyT = d.msg + '\n\n---\nName: ' + d.name + '\nEmail: ' + d.email + '\nPortal: ' + P(d.portal).name + '\nRequest: ' + d.id;
      var mail = 'mailto:' + H.support.email + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(bodyT);
      document.getElementById('ok-mail').innerHTML = 'Didn’t open? <a href="' + mail + '">Open the email again</a>, or write to ' + H.support.email + ' and mention ' + d.id + '.';
      f.style.display = 'none'; document.getElementById('ok').classList.add('show'); window.location.href = mail;
    });
    document.getElementById('again').addEventListener('click', function () { f.reset(); f.style.display = ''; document.getElementById('ok').classList.remove('show'); hints(); });
  };

  R.status = function () {
    title('Portal status'); var s = H.status;
    var lab = { ok: ['No issues reported', 'ok'], issue: ['Investigating an issue', 'issue'], soon: ['Early access', 'soon'] };
    set(
      '<section class="page-hero"><div class="wrap">' + crumbs([['Status']]) + '<span class="eyebrow"><span class="dot"></span>Updated ' + esc(s.updated) + '</span><h1>Portal status</h1><p class="lead">Can’t reach a portal? Check here first. If yours shows no issues, tell us and we’ll look into it.</p></div></section>'
      + '<section class="sec"><div class="wrap narrow-w"><div class="slist">' + Object.keys(s.items).map(function (k) {
        var p = P(k), l = lab[s.items[k]] || lab.ok;
        return '<div class="srow"><span class="sname">' + ic(p.icon) + '<span><b>' + esc(p.name) + '</b><span class="host">' + (p.host || '') + '</span></span></span><span class="sdot ' + l[1] + '">' + esc(l[0]) + '</span><span class="sact">' + (p.url && k !== 'artha' ? '<a class="link sm" href="' + p.url + '" target="_blank" rel="noopener">Open</a>' : '') + '<a class="link sm" href="contact.html?portal=' + k + '&topic=' + encodeURIComponent('Can’t reach ' + p.name) + '">Report a problem</a></span></div>';
      }).join('') + '</div><p class="note mt">Atlas runs inside Studio and Connect, so it shares their status. This page is updated by the pvNXT support team.</p></div></section>' + helpBand()
    );
  };

  R.signin = function () {
    title('Sign in'); var next = qs('next') || 'my.html';
    if (!/^[a-z0-9-]+\.html(\?[^#]*)?(#.*)?$/i.test(next)) next = 'my.html';
    if (user()) { location.replace(next); return; }
    var choose = ['studio', 'go', 'connect', 'scada'];
    set(
      '<section class="sec signin"><div class="wrap signin-g"><div class="fcard"><span class="eyebrow">pvNXT Help</span><h1 class="h2x">Sign in to your help workspace</h1><p class="muted">Use the email you use for your pvNXT portal.</p>'
      + '<form id="si" novalidate><label>Work email<input name="email" type="email" required autocomplete="email"></label><label>Your name<input name="name" autocomplete="name"></label>'
      + '<fieldset class="pchk"><legend>Which portals do you use?</legend>' + choose.map(function (id) { var p = P(id); return '<label class="chk"><input type="checkbox" name="pt" value="' + id + '"><span>' + ic(p.icon) + esc(p.name) + '</span></label>'; }).join('') + '</fieldset>'
      + '<p class="ferr" id="serr" role="alert" hidden></p><button class="btn wide" type="submit">Continue ' + arrow() + '</button></form>'
      + '<div class="demo-note">' + ic('info') + '<span><b>Demo sign-in.</b> No password is checked yet. Single sign-on with your pvNXT account is coming next.</span></div></div>'
      + '<div class="signin-side"><div class="signin-q"><b>Signed in, you get:</b><ul><li>' + ic('inbox') + 'Your support requests in one place</li><li>' + ic('bookmark') + 'Saved guides</li><li>' + ic('graduation-cap') + 'Learning paths with progress</li><li>' + ic('layout-dashboard') + 'Help for the portals you use</li></ul><a class="link" href="index.html">Or keep browsing as a guest ' + arrow() + '</a></div></div></div></section>'
    );
    document.getElementById('si').addEventListener('submit', function (e) {
      e.preventDefault(); var f = e.target, em = f.email.value.trim(), err = document.getElementById('serr');
      if (!/\S+@\S+\.\S+/.test(em)) { err.textContent = 'Enter a valid email address.'; err.hidden = false; f.email.setAttribute('aria-invalid', 'true'); f.email.focus(); return; }
      var pts = [].slice.call(f.querySelectorAll('[name=pt]:checked')).map(function (x) { return x.value; });
      store.set('pvh_user', { email: em, name: f.name.value.trim(), portals: pts.length ? pts : ['studio'] });
      location.href = next;
    });
  };

  R.my = function () {
    var u = user(); if (!u) { location.replace('signin.html?next=my.html'); return; }
    title('My help');
    var views = ['overview', 'requests', 'saved', 'learning'];
    var mine = u.portals.map(P).filter(Boolean);
    set(
      '<div class="ws"><aside class="ws-side" aria-label="My help"><span class="sh">My help</span>'
      + '<a href="#overview" data-v="overview">' + ic('layout-dashboard') + 'Overview</a><a href="#requests" data-v="requests">' + ic('inbox') + 'My requests</a><a href="#saved" data-v="saved">' + ic('bookmark') + 'Saved guides</a><a href="#learning" data-v="learning">' + ic('graduation-cap') + 'Learning paths</a>'
      + '<span class="sh">Your portals</span>' + mine.map(function (p) { return '<a href="portal.html?p=' + p.id + '">' + ic(p.icon) + esc(p.name) + (p.host ? '<span class="sm-host">' + p.host.split('.')[0] + '</span>' : '') + '</a>'; }).join('')
      + '<a href="portal.html?p=account">' + ic('shield-check') + 'Account &amp; security</a>'
      + '<div class="ws-promo"><b>Book a live walkthrough</b><span>The pvNXT team shows your crew the portals you use.</span><a class="btn sm" href="' + H.support.demo + '" target="_blank" rel="noopener">Pick a slot</a></div></aside>'
      + '<div class="ws-main"><div class="ws-top"><div><b>Welcome back' + (u.name ? ', ' + esc(u.name.split(' ')[0]) : '') + '</b><span>Signed in as ' + esc(u.email) + ' · ' + mine.map(function (p) { return esc(p.name); }).join(', ') + '</span></div>'
      + mine.filter(function (p) { return p.url; }).slice(0, 2).map(function (p) { return '<a class="btn sm ghost" href="' + p.url + '" target="_blank" rel="noopener">Open ' + esc(p.name) + ' ' + ic('external-link') + '</a>'; }).join('') + '</div>'
      + '<div class="ws-body" id="wsb"></div></div></div>'
    );
    function view(v) {
      if (views.indexOf(v) < 0) v = 'overview';
      [].forEach.call(main.querySelectorAll('[data-v]'), function (a) { if (a.dataset.v === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      document.getElementById('wsb').innerHTML = W[v](); icons(); wireSuggest(); wireVideos();
      if (v === 'requests') wireReq();
    }
    function reqs() { return store.get('pvh_requests', []); }
    function reqCard(r) { var p = P(r.portal); return '<div class="rq"><div class="rq-h"><b>' + esc(r.topic) + '</b><span class="badge ' + (r.status === 'Resolved' ? 'done' : 'wait') + '">' + esc(r.status) + '</span></div><span class="rq-m">' + esc(p ? p.name : '') + ' · ' + r.id + ' · ' + new Date(r.at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + '</span><p>' + esc(r.msg.length > 160 ? r.msg.slice(0, 160) + '…' : r.msg) + '</p></div>'; }
    function progress(pa) { var read = store.get('pvh_read', []); var d = pa.steps.filter(function (s) { return read.indexOf(s) > -1; }).length; return { d: d, n: pa.steps.length, next: pa.steps.filter(function (s) { return read.indexOf(s) < 0; })[0] }; }
    function pathCard(pa, compact) {
      var g = progress(pa), pc = Math.round(g.d / g.n * 100), p = P(pa.p);
      return '<div class="pcard"><div class="pcard-h">' + (p.shot ? shot(p.shot, 'pthumb', '') : '<span class="pthumb picon">' + ic(p.icon) + '</span>') + '<div class="grow"><b>' + esc(pa.title) + '</b><span class="bar" role="progressbar" aria-valuenow="' + pc + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + esc(pa.title) + ' progress"><span style="width:' + pc + '%"></span></span><span class="mono">' + g.d + ' of ' + g.n + ' guides read</span></div></div>'
        + (compact ? '' : '<ol class="psteps">' + pa.steps.map(function (s) { var x = A(s), done = store.get('pvh_read', []).indexOf(s) > -1; return '<li class="' + (done ? 'done' : '') + '"><a href="article.html?a=' + s + '">' + ic(done ? 'circle-check' : 'circle') + esc(x.title) + '</a></li>'; }).join('') + '</ol>')
        + (g.next ? '<a class="link sm" href="article.html?a=' + g.next + '">' + (g.d ? 'Continue' : 'Start') + ' ' + arrow() + '</a>' : '<span class="mono ok-t">' + ic('circle-check') + 'Complete</span>') + '</div>';
    }
    var W = {
      overview: function () {
        var first = mine[0], rs = reqs(), rec = store.get('pvh_recent', []).map(A).filter(Boolean).slice(0, 4);
        var myPaths = H.paths.filter(function (pa) { return u.portals.indexOf(pa.p) > -1; });
        var faqs = H.articles.filter(function (a) { return u.portals.indexOf(a.p) > -1; }).slice(0, 5);
        return '<div class="ws-hero"><h1>Help for ' + esc(names(mine)) + '</h1><p>Guides for the portals you use, and where your support requests stand.</p>' + searchBox({ ph: 'Ask a question about ' + mine.map(function (p) { return p.name; }).join(', '), p: mine.length === 1 ? first.id : '' }) + '</div>'
          + '<div class="cards3"><a class="wcard" href="portal.html?p=' + first.id + '"><span class="wic">' + ic('graduation-cap') + '</span><b>Getting started in ' + esc(first.name) + '</b><span>' + esc(inPortal(first.id)[0].sum) + '</span><span class="link sm">See guides ' + arrow() + '</span></a>'
          + '<a class="wcard" href="contact.html"><span class="wic amber">' + ic('inbox') + '</span><b>Raise a request</b><span>' + esc(H.support.reply) + ' Track it here.</span><span class="link sm">New request ' + arrow() + '</span></a>'
          + '<a class="wcard" href="portal.html?p=account"><span class="wic">' + ic('shield-check') + '</span><b>Account &amp; security</b><span>Sign-up, passwords, access and data safety.</span><span class="link sm">See guides ' + arrow() + '</span></a></div>'
          + '<div class="cards2"><div class="panel-c"><div class="pc-h"><b>Continue learning</b><a class="link sm" href="#learning">All paths</a></div>' + (myPaths.length ? myPaths.map(function (pa) { return pathCard(pa, true); }).join('') : '<p class="muted">No paths for your portals yet.</p>') + '</div>'
          + '<div class="panel-c"><div class="pc-h"><b>My requests</b><a class="link sm" href="#requests">View all</a></div>' + (rs.length ? rs.slice(0, 2).map(reqCard).join('') : '<div class="empty sm">' + ic('inbox') + '<p>No requests yet. When you contact support while signed in, it shows up here.</p><a class="btn sm" href="contact.html">Raise a request</a></div>') + '</div></div>'
          + '<div class="panel-c faq-c"><div><b class="h3x">FAQs</b><p class="muted">Quick answers for ' + mine.map(function (p) { return esc(p.name); }).join(', ') + '. Can’t find yours? Write to <a href="mailto:' + H.support.email + '">' + H.support.email + '</a>.</p></div><div>' + faqs.map(function (a, i) { return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(a.title) + '</summary><p>' + esc(a.sum) + ' <a href="article.html?a=' + a.id + '">Read the guide</a></p></details>'; }).join('') + '</div></div>'
          + (rec.length ? '<div class="panel-c"><div class="pc-h"><b>Recently viewed</b></div><div class="alist">' + rec.map(function (a) { return artRow(a, true); }).join('') + '</div></div>' : '');
      },
      requests: function () {
        var rs = reqs();
        return '<div class="ws-h"><h1>My requests</h1><a class="btn sm" href="contact.html">' + ic('plus') + 'New request</a></div>'
          + (rs.length ? '<div class="rq-list">' + rs.map(reqCard).join('') + '</div><p class="note mt">Requests you send while signed in are listed here. Replies arrive by email. <button type="button" class="link sm" data-clear>Clear this list</button></p>'
            : '<div class="empty">' + ic('inbox') + '<h2>No requests yet</h2><p>When you contact support while signed in, your request shows up here.</p><a class="btn" href="contact.html">Raise a request</a></div>');
      },
      saved: function () {
        var s = store.get('pvh_saved', []).map(A).filter(Boolean);
        return '<div class="ws-h"><h1>Saved guides</h1></div>' + (s.length ? '<div class="alist">' + s.map(function (a) { return artRow(a, true); }).join('') + '</div>'
          : '<div class="empty">' + ic('bookmark') + '<h2>Nothing saved yet</h2><p>Use <b>Save</b> on any guide to keep it here.</p><a class="btn" href="portal.html?p=' + mine[0].id + '">Browse ' + esc(mine[0].name) + ' guides</a></div>');
      },
      learning: function () {
        var mp = H.paths.filter(function (pa) { return u.portals.indexOf(pa.p) > -1; }), other = H.paths.filter(function (pa) { return u.portals.indexOf(pa.p) < 0; });
        return '<div class="ws-h"><h1>Learning paths</h1><a class="link sm" href="videos.html">Videos ' + arrow() + '</a></div><div class="cards2">' + mp.map(function (pa) { return pathCard(pa, false); }).join('') + '</div>'
          + (other.length ? '<h2 class="h3x mt2 mb">Other portals</h2><div class="cards2">' + other.map(function (pa) { return pathCard(pa, false); }).join('') + '</div>' : '');
      }
    };
    function wireReq() { var c = main.querySelector('[data-clear]'); if (c) c.addEventListener('click', function () { store.set('pvh_requests', []); view('requests'); }); }
    window.addEventListener('hashchange', function () { view(location.hash.slice(1)); });
    view(location.hash.slice(1));
  };

  R['404'] = function () {
    title('Page not found');
    set('<section class="sec"><div class="wrap narrow-w"><div class="empty big">' + ic('map-pin-off') + '<span class="eyebrow">404</span><h1>We couldn’t find that page.</h1><p>It may have moved. Search, or start from your portal.</p>' + searchBox({}) + '<div class="chips">' + H.portals.slice(0, 6).map(function (p) { return '<a class="chip" href="portal.html?p=' + p.id + '">' + esc(p.name) + '</a>'; }).join('') + '</div></div></div></section>');
    wireSuggest();
  };

  layout();
  (R[page] || R['404'])();
  wireSuggest();
  icons(); window.addEventListener('load', icons);
  /* flashlight on page heroes, same as terranxt.com */
  [].forEach.call(document.querySelectorAll('.page-hero'), function (s) {
    s.addEventListener('mousemove', function (e) { var r = s.getBoundingClientRect(); s.style.setProperty('--mx', (e.clientX - r.left) + 'px'); s.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
})();
