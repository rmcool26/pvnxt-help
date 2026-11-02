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

  /* ---------- language (Google Translate) ---------- */
  function curLang() { var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[a-z-]+\/([a-z-]+)/i); return m && /^(hi|ar)$/.test(m[1]) ? m[1] : 'en'; }
  function setLang(l) {
    var host = location.hostname, past = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
    var doms = ['', host, '.' + host.split('.').slice(-2).join('.')];
    doms.forEach(function (d) { document.cookie = 'googtrans=; ' + past + '; path=/' + (d ? '; domain=' + d : ''); });
    if (l !== 'en') document.cookie = 'googtrans=/en/' + l + '; path=/';
    try { localStorage.setItem('pvh_lang', l); } catch (e) { }
    location.reload();
  }
  function initLang() {
    var l = curLang();
    document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    if (l === 'en' || location.protocol === 'file:') return;
    window.gtInit = function () { try { new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'hi,ar', autoDisplay: false }, 'gt-el'); } catch (e) { } };
    var d = document.createElement('div'); d.id = 'gt-el'; d.hidden = true; document.body.appendChild(d);
    var sc = document.createElement('script'); sc.src = 'https://translate.google.com/translate_a/element.js?cb=gtInit'; sc.async = true; document.body.appendChild(sc);
  }

  /* ---------- "Ask us" assistant: answers from the guides, then a person ---------- */
  function chatWidget() {
    if (page === 'contact' || page === 'signin') return;
    var KEY = 'pvh_chat', log = [];
    try { log = JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { log = []; }
    function save() { try { sessionStorage.setItem(KEY, JSON.stringify(log.slice(-20))); } catch (e) { } }
    var fab = document.createElement('button');
    fab.type = 'button'; fab.className = 'cx-fab'; fab.setAttribute('aria-haspopup', 'dialog'); fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'cx');
    fab.innerHTML = ic('message-circle') + '<span>Ask us</span>';
    var box = document.createElement('section');
    box.className = 'cx'; box.id = 'cx'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-labelledby', 'cx-t');
    var sug = H.popular.slice(0, 3).map(A).filter(Boolean);
    box.innerHTML = '<div class="cx-h"><div><b id="cx-t">Ask pvNXT Help</b><span>Answers come from our guides</span></div><button type="button" class="cx-x" aria-label="Close">' + ic('x') + '</button></div>'
      + '<div class="cx-b" id="cx-b" aria-live="polite"></div>'
      + '<form class="cx-f" id="cx-f"><label class="sr" for="cx-q">Your question</label><textarea id="cx-q" rows="1" maxlength="500" placeholder="Ask about Studio, Go, Connect…"></textarea><button type="submit" class="cx-send" aria-label="Send">' + ic('arrow-up') + '</button></form>'
      + '<div class="cx-p"><span>Talk to a person</span><a href="' + H.support.whatsapp + '" target="_blank" rel="noopener">WhatsApp</a><a href="mailto:' + H.support.email + '">Email</a><a href="contact.html" id="cx-req">Raise a request</a></div>';
    document.body.appendChild(fab); document.body.appendChild(box);
    var body = box.querySelector('#cx-b'), q = box.querySelector('#cx-q'), req = box.querySelector('#cx-req'), busy = false;
    function fmt(t) {
      t = esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
      var lines = t.split(/\n+/), out = '', inList = false;
      lines.forEach(function (l) { var m = l.match(/^\s*(\d+)[.)]\s+(.*)/); if (m) { if (!inList) { out += '<ol>'; inList = true; } out += '<li>' + m[2] + '</li>'; } else { if (inList) { out += '</ol>'; inList = false; } if (l.trim()) out += '<p>' + l + '</p>'; } });
      return out + (inList ? '</ol>' : '');
    }
    function srcs(list) { return list && list.length ? '<div class="cx-src"><span>From the guides</span>' + list.map(function (a) { return '<a href="article.html?a=' + a.id + '">' + esc(a.title) + '</a>'; }).join('') + '</div>' : ''; }
    function render() {
      body.innerHTML = '<div class="cx-m bot"><p>Hi. Ask a question and I’ll answer from the pvNXT guides. If I can’t help, you can reach a person below.</p>'
        + (log.length ? '' : '<div class="cx-sug">' + sug.map(function (a) { return '<button type="button" data-q="' + esc(a.title) + '">' + esc(a.title) + '</button>'; }).join('') + '</div>') + '</div>'
        + log.map(function (m) { return m.r === 'u' ? '<div class="cx-m me"><p>' + esc(m.t) + '</p></div>' : '<div class="cx-m bot">' + fmt(m.t) + srcs(m.s) + '</div>'; }).join('');
      [].forEach.call(body.querySelectorAll('[data-q]'), function (b) { b.addEventListener('click', function () { ask(b.dataset.q); }); });
      body.scrollTop = body.scrollHeight; icons();
    }
    function local(text) {
      var r = search(text, 'all').a.slice(0, 3);
      if (!r.length) return { t: 'I couldn’t find a guide for that. Try other words, or ask a person below. We reply within one working day.', s: [] };
      var a = r[0], st = (a.body.filter(function (b) { return b[0] === 'steps'; })[0] || [])[1] || [];
      var t = '**' + a.title + '**\n' + a.sum + (st.length ? '\n' + st.slice(0, 5).map(function (x, i) { return (i + 1) + '. ' + strip(x); }).join('\n') : '') + (st.length > 5 ? '\nThe guide has the remaining steps.' : '');
      return { t: t, s: r.map(function (x) { return { id: x.id, title: x.title }; }) };
    }
    function ask(text) {
      text = (text || '').trim(); if (!text || busy) return;
      busy = true; log.push({ r: 'u', t: text }); save(); render();
      req.href = 'contact.html?topic=' + encodeURIComponent(text.slice(0, 80));
      var wait = document.createElement('div'); wait.className = 'cx-m bot cx-wait'; wait.innerHTML = '<p>Looking through the guides…</p>'; body.appendChild(wait); body.scrollTop = body.scrollHeight;
      function done(ans) { busy = false; log.push({ r: 'b', t: ans.t, s: ans.s }); save(); render(); }
      if (location.protocol === 'file:' || !window.fetch) { setTimeout(function () { done(local(text)); }, 300); return; }
      var hist = log.slice(-7, -1).map(function (m) { return { role: m.r === 'u' ? 'user' : 'assistant', content: m.t }; });
      var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, 20000);
      fetch('api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: text, history: hist, lang: curLang() }), signal: ctl ? ctl.signal : undefined })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) { clearTimeout(tm); if (!d || !d.answer) throw new Error('empty'); done({ t: d.answer, s: (d.sources || []).filter(function (x) { return A(x.id); }) }); })
        .catch(function () { clearTimeout(tm); done(local(text)); });
    }
    function open(v) {
      box.hidden = !v; fab.hidden = v; fab.setAttribute('aria-expanded', v); document.body.classList.toggle('cx-on', v);
      if (v) { render(); setTimeout(function () { q.focus(); }, 30); } else fab.focus();
    }
    fab.addEventListener('click', function () { open(true); });
    /* on phones, step out of the way while reading down; come back when scrolling up or at the end */
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      if (window.innerWidth > 600) { fab.classList.remove('cx-away'); return; }
      var y = window.scrollY, end = y + window.innerHeight >= document.documentElement.scrollHeight - 80;
      fab.classList.toggle('cx-away', y > lastY + 4 && y > 200 && !end);
      if (y < lastY - 4 || end) fab.classList.remove('cx-away');
      lastY = y;
    }, { passive: true });
    box.querySelector('.cx-x').addEventListener('click', function () { open(false); });
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); open(false); } });
    box.querySelector('#cx-f').addEventListener('submit', function (e) { e.preventDefault(); var v = q.value; q.value = ''; q.style.height = ''; ask(v); });
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); box.querySelector('#cx-f').dispatchEvent(new Event('submit', { cancelable: true })); } });
    q.addEventListener('input', function () { q.style.height = ''; q.style.height = Math.min(q.scrollHeight, 120) + 'px'; });
    icons();
  }

  /* ---------- header & footer ---------- */
  function layout() {
    initLang(); var u = user(), chev = ic('chevron-down');
    var on = function (k) { return page === k ? ' class="on"' : ''; };
    var portalItems = H.portals.map(function (p) { return '<a class="item" href="portal.html?p=' + p.id + '"><span class="dd-ic">' + ic(p.icon) + '</span><span><b>' + esc(p.name) + '</b><span>' + esc(p.line) + '</span></span></a>'; }).join('');
    var initials = u ? (u.name || u.email.split('@')[0]).split(/[\s._-]+/).filter(Boolean).slice(0, 2).map(function (s) { return s[0].toUpperCase(); }).join('') : '';
    var acct = u
      ? '<div class="has-dd umenu"><button type="button" aria-haspopup="true" aria-expanded="false" class="ubtn"><span class="avatar">' + esc(initials) + '</span><span class="uname">' + esc(u.name ? u.name.split(' ')[0] : u.email.split('@')[0]) + '</span>' + chev + '</button><div class="dd dd-user"><div class="dd-who"><b>' + esc(u.name || 'Signed in') + '</b><span>' + esc(u.email) + '</span></div><a class="item" href="my.html">' + ic('layout-dashboard') + 'My help</a><a class="item" href="my.html#requests">' + ic('inbox') + 'My requests</a><a class="item" href="my.html#saved">' + ic('bookmark') + 'Saved guides</a><a class="item" href="my.html#progress">' + ic('graduation-cap') + 'Reading progress</a><button type="button" class="item" data-signout>' + ic('log-out') + 'Sign out</button></div></div>'
      : '<a class="btn sm ghost" href="signin.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search) + '">' + ic('log-in') + 'Sign in</a>';
    var hs = page === 'home' || page === 'search' ? '' : '<form class="hsearch" action="search.html" role="search" data-suggest>' + ic('search') + '<label class="sr" for="hq">Search help</label><input id="hq" name="q" type="search" autocomplete="off" placeholder="Search help"><kbd class="kbd" aria-hidden="true">/</kbd><div class="sugg" hidden></div></form>';
    var LANGS = [['en', 'English', 'EN'], ['hi', 'हिन्दी', 'HI'], ['ar', 'العربية', 'AR']], cur = curLang();
    var langItems = LANGS.map(function (l) { return '<button type="button" class="item" data-lang="' + l[0] + '" lang="' + l[0] + '" translate="no"' + (l[0] === cur ? ' aria-current="true"' : '') + '>' + l[1] + '</button>'; }).join('');
    var navOn = function (k) { return (Array.isArray(k) ? k.indexOf(page) > -1 : page === k) ? ' aria-current="page"' : ''; };
    var h = '<header class="hdr hx" id="hdr"><div class="hx-in">'
      + '<a class="hx-logo" href="index.html" aria-label="pvNXT Help home" translate="no"><img src="assets/logos/mark.png" alt=""><span>pvNXT Help</span></a>'
      + '<nav class="hx-nav" aria-label="Main"><ul>'
      + '<li class="has-dd"><button type="button" aria-haspopup="true" aria-expanded="false"' + (page === 'portal' ? ' aria-current="page"' : '') + '>Portals ' + chev + '</button><div class="dd dd-portals">' + portalItems + '<div class="dd-foot"><a href="guides.html">All guides</a> · <a href="article.html?a=which-portal">Which portal is mine?</a></div></div></li>'
      + '<li><a href="guides.html"' + navOn(['guides', 'article']) + '>Guides</a></li>'
      + '<li><a href="videos.html"' + navOn('videos') + '>Videos</a></li>'
      + '<li><a href="status.html"' + navOn('status') + '>Status</a></li>'
      + '<li><a href="contact.html"' + navOn('contact') + '>Contact</a></li></ul></nav>'
      + '<div class="hx-r">' + hs
      + '<div class="has-dd hx-lang"><button type="button" aria-haspopup="true" aria-expanded="false" aria-label="Language: ' + LANGS.filter(function (l) { return l[0] === cur; })[0][1] + '">' + ic('globe') + '<span translate="no">' + LANGS.filter(function (l) { return l[0] === cur; })[0][2] + '</span></button><div class="dd dd-lang">' + langItems + '<p class="dd-note">Translated by Google. Steps and button names may differ from the portal.</p></div></div>'
      + '<div class="hx-acct">' + acct + '</div>'
      + '<button class="hx-burger" id="burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mnav">' + ic('menu') + '</button></div></div>'
      + '<nav class="hx-m" id="mnav" aria-label="Menu">'
      + '<a href="index.html"' + navOn('home') + '>Help home</a><a href="guides.html"' + navOn(['guides', 'article']) + '>Guides</a><a href="videos.html"' + navOn('videos') + '>Videos</a><a href="status.html"' + navOn('status') + '>Status</a><a href="contact.html"' + navOn('contact') + '>Contact</a>'
      + '<span class="hx-mh">Portals</span><div class="hx-mp" translate="no">' + H.portals.map(function (p) { return '<a href="portal.html?p=' + p.id + '">' + esc(p.name) + '</a>'; }).join('') + '</div>'
      + '<span class="hx-mh">Language</span><div class="hx-ml">' + langItems + '</div>'
      + '<div class="hx-mu">' + (u ? '<a href="my.html">My help</a><button type="button" class="link" data-signout>Sign out</button>' : '<a class="btn" href="signin.html">Sign in</a>') + '</div></nav></header>';

    var used = {}; [].forEach.call(document.querySelectorAll('[data-credit]'), function () { });
    var f = '<footer class="ftr"><div class="wrap ftr-main"><div class="ftr-cols">'
      + '<div class="ftr-brand"><a class="logo" href="index.html"><img src="assets/logos/terranxt.png" alt="Terranxt"></a><p class="ftr-tag">Guides for Studio, Go, Connect, SCADA and Artha.</p><address>' + esc(H.support.hours) + '<br><a href="mailto:' + H.support.email + '">' + H.support.email + '</a><br>' + esc(H.support.reply) + '</address></div>'
      + '<div><h6>Portals</h6><ul>' + H.portals.slice(0, 6).map(function (p) { return '<li><a href="portal.html?p=' + p.id + '">' + esc(p.name) + '</a></li>'; }).join('') + '</ul></div>'
      + '<div><h6>Help</h6><ul><li><a href="portal.html?p=account">Account &amp; security</a></li><li><a href="article.html?a=get-the-app">Get the app</a></li><li><a href="videos.html">Videos</a></li><li><a href="status.html">Status</a></li><li><a href="contact.html">Contact support</a></li></ul></div>'
      + '<div><h6>You</h6><ul>' + (user() ? '<li><a href="my.html">My help</a></li><li><a href="my.html#requests">My requests</a></li><li><a href="my.html#saved">Saved guides</a></li>' : '<li><a href="signin.html">Sign in</a></li>') + '</ul></div>'
      + '<div><h6>Terranxt</h6><ul><li><a href="' + H.support.site + '" target="_blank" rel="noopener">terranxt.com</a></li><li><a href="' + H.support.site + '/how-it-works.html" target="_blank" rel="noopener">How it works</a></li><li><a href="' + H.support.demo + '" target="_blank" rel="noopener">Request a demo</a></li><li><a href="' + H.support.site + '/privacy.html" target="_blank" rel="noopener">Privacy</a></li><li><a href="' + H.support.site + '/terms.html" target="_blank" rel="noopener">Terms</a></li></ul></div>'
      + '</div><div class="ftr-base"><span>© ' + new Date().getFullYear() + ' Terranxt Pvt Ltd. A pvNXT company. IIT Delhi–FITT incubated. Backed by Astongreens.</span><span>Screenshots are from the live portals. Personal details are blurred.</span></div></div></footer>';

    document.body.classList.add('min'); if (page === 'home') document.body.classList.add('is-home');
    {
      f = '<footer class="mf"><div class="mf-in"><span>© ' + new Date().getFullYear() + ' Terranxt Pvt Ltd</span>' + (page !== 'home' ? '<a href="contact.html">Contact</a><a href="status.html">Status</a><a href="videos.html">Videos</a>' : '') + '<a href="' + H.support.site + '/privacy.html" target="_blank" rel="noopener">Privacy</a><a href="' + H.support.site + '/terms.html" target="_blank" rel="noopener">Terms</a><a href="' + H.support.site + '" target="_blank" rel="noopener">terranxt.com</a></div></footer>';
    }
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
    [].forEach.call(document.querySelectorAll('[data-lang]'), function (x) { x.addEventListener('click', function () { if (x.dataset.lang !== curLang()) setLang(x.dataset.lang); else closeAll(); }); });
    /* skip link, WhatsApp, back to top (same as terranxt.com) */
    var sk = document.createElement('a'); sk.className = 'skip'; sk.href = '#main'; sk.textContent = 'Skip to content'; document.body.insertBefore(sk, document.body.firstChild);
    main.tabIndex = -1;
    if (false) {
    var wa = document.createElement('a'); wa.className = 'wa-fab'; wa.href = H.support.whatsapp; wa.target = '_blank'; wa.rel = 'noopener noreferrer'; wa.setAttribute('aria-label', 'Chat with pvNXT support on WhatsApp');
    wa.innerHTML = ic('message-circle') + '<span>WhatsApp</span>'; document.body.appendChild(wa);
    }
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
    title('');
    /* Questions people ask per portal: a one-line answer here, the full guide one click away */
    var faq = [
      { id: 'studio', items: ['studio-add-lead', 'studio-roof-analysis', 'studio-layout', 'studio-proposal', 'studio-assign-installer'] },
      { id: 'go', items: ['go-verify-account', 'go-bid-board', 'go-submit-bid', 'go-site-updates', 'go-close-project'] },
      { id: 'connect', items: ['connect-create-project', 'connect-measure-roof', 'connect-install-path', 'connect-agreement', 'connect-track'] },
      { id: 'scada', items: ['scada-add-plant', 'scada-inverters', 'scada-alerts', 'scada-work-orders'] },
      { id: 'artha', items: ['artha-what', 'artha-risk', 'artha-join'] },
      { id: 'account', items: ['sign-up', 'reset-password', 'which-portal', 'give-access', 'data-safety'] }
    ];
    var label = { account: 'Account' };
    var start = (location.hash || '').slice(1); if (!faq.some(function (f) { return f.id === start; })) start = 'studio';
    set(
      '<section class="mh"><span class="mh-grid" aria-hidden="true"></span><div class="mh-in">'
      + '<h1>What do you need help with?</h1>'
      + searchBox({ ph: 'Describe your issue', rotate: 'Describe your issue|keepout zone|Self Mode|Cost per Wp|reset password' })
      + '</div></section>'

      + '<nav class="mp" aria-label="Portals"><div class="mp-in">'
      + ['studio', 'go', 'connect', 'scada', 'atlas', 'artha', 'account'].map(P).filter(Boolean).map(function (p) { return '<a href="portal.html?p=' + p.id + '"><span class="mp-i">' + ic(p.icon) + '</span><span>' + esc(p.name) + '</span></a>'; }).join('')
      + '</div></nav>'

      + '<section class="mq" aria-labelledby="mq-h"><div class="mq-in">'
      + '<h2 id="mq-h">Common questions</h2>'
      + '<div class="mq-tabs" role="tablist" aria-label="Choose a portal">' + faq.map(function (f) { var p = P(f.id); return '<button type="button" role="tab" id="mqt-' + f.id + '" aria-controls="mqp" aria-selected="' + (f.id === start) + '" tabindex="' + (f.id === start ? 0 : -1) + '" data-f="' + f.id + '">' + esc(label[f.id] || p.name) + '</button>'; }).join('') + '</div>'
      + '<div class="mq-panel" id="mqp" role="tabpanel" tabindex="0"></div>'
      + '</div></section>'

      + '<section class="ml"><div class="ml-in">'
      + '<div><h3>Your account</h3><a href="article.html?a=reset-password">Reset your password</a><a href="article.html?a=which-portal">Which portal is mine?</a><a href="' + (user() ? 'my.html' : 'signin.html?next=my.html') + '">' + (user() ? 'My requests and saved guides' : 'Sign in to track requests') + '</a></div>'
      + '<div><h3>Learn</h3><a href="videos.html">Videos and learning paths</a><a href="article.html?a=get-the-app">Get the app</a><a href="status.html">Portal status</a></div>'
      + '<div><h3>Talk to a person</h3><p>We reply within one working day.</p><a href="contact.html">Contact support</a><a href="' + H.support.whatsapp + '" target="_blank" rel="noopener">WhatsApp, ' + esc(H.support.hours) + '</a></div>'
      + '</div></section>'
    );
    var panel = document.getElementById('mqp'), tabs = [].slice.call(main.querySelectorAll('.mq-tabs [role=tab]'));
    function draw(id) {
      var f = faq.filter(function (x) { return x.id === id; })[0], p = P(id);
      tabs.forEach(function (t) { var on = t.dataset.f === id; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
      panel.setAttribute('aria-labelledby', 'mqt-' + id);
      panel.innerHTML = f.items.map(A).filter(Boolean).map(function (a) {
        return '<details><summary><span>' + esc(a.title) + '</span>' + ic('chevron-down', 'mq-c') + '</summary><div class="mq-a"><p>' + esc(a.sum) + '</p><a href="article.html?a=' + a.id + '">Read the steps ' + ic('arrow-right') + '</a></div></details>';
      }).join('') + '<a class="mq-all" href="portal.html?p=' + id + '">All ' + inPortal(id).length + ' ' + esc(label[id] || p.name) + ' guides ' + ic('arrow-right') + '</a>';
      icons();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { draw(t.dataset.f); history.replaceState(null, '', '#' + t.dataset.f); });
      t.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!k) return;
        e.preventDefault(); var n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); n.click();
      });
    });
    draw(start);
    wireSuggest();
  };

  R.portal = function () {
    var p = P(qs('p')); if (!p) return R['404']();
    title(p.name + ' help');
    var arts = inPortal(p.id), want = (location.hash || '').slice(1);
    var openId = p.topics.some(function (t) { return t.id === want; }) ? want : p.topics[0].id;
    set(
      '<div class="ptl">'
      + '<nav class="ptl-crumb" aria-label="Breadcrumb"><a href="index.html">Help</a><span aria-hidden="true">›</span><span aria-current="page">' + esc(p.name) + '</span></nav>'
      + '<div class="ptl-head"><span class="ptl-ic">' + ic(p.icon) + '</span><div><h1>' + esc(p.name) + ' help</h1><p>' + esc(p.who) + '</p></div></div>'
      + searchBox({ p: p.id, ph: 'Search ' + p.name + ' help' })
      + '<section class="ptl-topics" aria-labelledby="ptl-th"><h2 id="ptl-th">Browse help topics</h2><div class="ptl-acc">'
      + p.topics.map(function (t) {
          var l = arts.filter(function (x) { return x.t === t.id; });
          return '<details id="' + t.id + '"' + (t.id === openId ? ' open' : '') + '><summary><span><b>' + esc(t.name) + '</b><em>' + l.length + ' guide' + (l.length === 1 ? '' : 's') + '</em></span>' + ic('chevron-down', 'ptl-c') + '</summary><ul>'
            + l.map(function (x) { return '<li><a href="article.html?a=' + x.id + '">' + esc(x.title) + '</a></li>'; }).join('') + '</ul></details>';
        }).join('')
      + '</div></section>'
      + '<p class="ptl-help">Can’t find it? <a href="contact.html?portal=' + p.id + '">Contact support</a>. We reply within one working day.</p>'
      + (p.url ? '<p class="ptl-open">Using ' + esc(p.name) + ' now? <a href="' + p.url + '" target="_blank" rel="noopener">Open ' + p.host + '</a></p>' : '')
      + '</div>'
    );
    /* remember the opened topic in the address, but only when the visitor opens it (not on load, which would scroll) */
    [].forEach.call(main.querySelectorAll('.ptl-acc summary'), function (sm) { sm.addEventListener('click', function () { var d = sm.parentNode; setTimeout(function () { if (d.open) history.replaceState(null, '', '#' + d.id); }, 0); }); });
    wireSuggest();
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
    var isSaved = store.get('pvh_saved', []).indexOf(a.id) > -1;
    var vid = a.video ? V(a.video) : H.videos.filter(function (v) { return v.article === a.id && v.url; })[0], topic = p.topics.filter(function (t) { return t.id === a.t; })[0];
    var prev = list[i - 1], next = list[i + 1], src = (H.sources || {})[p.id];
    var hs = a.body.filter(function (b) { return b[0] === 'h'; }), numbered = hs.length > 1;
    var navList = p.topics.map(function (t) { return '<p class="gn-h">' + esc(t.name) + '</p><ul>' + list.filter(function (x) { return x.t === t.id; }).map(function (x) { return '<li><a href="article.html?a=' + x.id + '"' + (x.id === a.id ? ' aria-current="page"' : '') + '>' + esc(x.title) + '</a></li>'; }).join('') + '</ul>'; }).join('');
    set(
      '<div class="gb">'
      + '<aside class="gn" aria-label="' + esc(p.name) + ' guides"><a class="gn-back" href="portal.html?p=' + p.id + '">' + ic('chevron-left') + esc(p.name) + ' help</a>' + navList + '</aside>'
      + '<article class="gb-a' + (numbered ? ' num' : '') + '">'
      + '<nav class="ptl-crumb" aria-label="Breadcrumb"><a href="index.html">Help</a><span aria-hidden="true">›</span><a href="portal.html?p=' + p.id + '">' + esc(p.name) + '</a><span aria-hidden="true">›</span><a href="portal.html?p=' + p.id + '#' + a.t + '">' + esc(topic ? topic.name : '') + '</a></nav>'
      + '<h1>' + esc(a.title) + '</h1>'
      + '<p class="gb-sub">' + esc(a.sum) + '</p>'
      + '<div class="gb-acts"><button type="button" class="ga-btn" data-copy>' + ic('link') + '<span>Copy link</span></button><button type="button" class="ga-btn" data-save aria-pressed="' + isSaved + '">' + ic(isSaved ? 'bookmark-check' : 'bookmark') + '<span>' + (isSaved ? 'Saved' : u ? 'Save' : 'Sign in to save') + '</span></button>' + (src ? '<span class="gb-upd">Updated ' + esc(src.updated) + '</span>' : '') + '</div>'
      /* sticky bar: guide list (mobile) + sections of this guide + reading progress */
      + '<div class="gb-bar">'
      + '<details class="gb-gd"><summary>' + ic('list') + '<span>' + esc(p.name) + ' guides</span>' + ic('chevron-down', 'gb-gdc') + '</summary><div class="gb-gdl" role="navigation" aria-label="' + esc(p.name) + ' guides"><p class="gb-gdt">' + (i + 1) + ' of ' + list.length + ' ' + esc(p.name) + ' guides</p>' + navList + '</div></details>'
      + (numbered ? '<nav class="gb-sec" aria-label="In this guide"><span class="gb-l">In this guide</span>' + hs.map(function (b, k) { return '<a href="#' + slug(b[1]) + '"><i>' + (k + 1) + '</i>' + strip(b[1]) + '</a>'; }).join('') + '</nav>' : '<span class="gb-l gb-one">' + esc(topic ? topic.name : '') + '</span>')
      + '<span class="gb-prog" aria-hidden="true"><i></i></span></div>'
      + '<div class="art-body gb-body">' + a.body.map(block).join('') + '</div>'
      + (vid && vid.url ? '<a class="art-vid" href="' + esc(vid.url) + '" target="_blank" rel="noopener">' + shot(vThumb(vid)) + '<span class="vplay">' + ic('play') + '</span><span class="art-vid-t"><span class="tg">Video · opens in a new tab</span><b>' + esc(vid.title) + '</b></span></a>' : '') + (vid && vid.yt ? '<button type="button" class="art-vid" data-video="' + vid.id + '">' + shot(vThumb(vid)) + '<span class="vplay">' + ic('play') + '</span><span class="art-vid-t"><span class="tg">Video</span><b>' + esc(vid.title) + '</b></span></button>' : '')
      + '<div class="ga-foot"><div class="ga-fb" data-fb><span>Was this helpful?</span><span class="fb-b"><button type="button" data-v="yes">' + ic('thumbs-up') + 'Yes</button><button type="button" data-v="no">' + ic('thumbs-down') + 'No</button></span><span class="fb-ok" hidden></span></div>'
      + '<span class="ga-upd">' + (src ? 'From the ' + esc(src.doc) + ' · ' : '') + '<a href="contact.html?portal=' + p.id + '&topic=' + encodeURIComponent(a.title) + '">Still stuck? Contact support</a></span></div>'
      + (next ? '<a class="gb-next" href="article.html?a=' + next.id + '"><span><em>Next guide · ' + (i + 2) + ' of ' + list.length + '</em><b>' + esc(next.title) + '</b></span>' + ic('arrow-right') + '</a>' : '<a class="gb-next" href="portal.html?p=' + p.id + '"><span><em>You’ve reached the last ' + esc(p.name) + ' guide</em><b>Back to ' + esc(p.name) + ' help</b></span>' + ic('arrow-right') + '</a>')
      + (prev ? '<a class="gb-prev" href="article.html?a=' + prev.id + '">' + ic('arrow-left') + 'Previous: ' + esc(prev.title) + '</a>' : '')
      + '</article></div>'
    );
    var sb = main.querySelector('[data-save]');
    sb.addEventListener('click', function () {
      if (!user()) { location.href = 'signin.html?next=' + encodeURIComponent('article.html?a=' + a.id); return; }
      var s = store.get('pvh_saved', []), k = s.indexOf(a.id); if (k > -1) s.splice(k, 1); else s.unshift(a.id); store.set('pvh_saved', s);
      var on = k < 0; sb.setAttribute('aria-pressed', on); sb.innerHTML = ic(on ? 'bookmark-check' : 'bookmark') + '<span>' + (on ? 'Saved' : 'Save') + '</span>'; icons();
    });
    main.querySelector('[data-copy]').addEventListener('click', function (e) {
      var t = e.currentTarget.querySelector('span');
      function done() { t.textContent = 'Copied'; setTimeout(function () { t.textContent = 'Copy link'; }, 1600); }
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, done); else done();
    });
    wireZoom();
    /* sticky bar: highlight the current section, keep its chip in view, show reading progress */
    var bar = main.querySelector('.gb-bar'), sec = main.querySelector('.gb-sec'), links = sec ? [].slice.call(sec.querySelectorAll('a')) : [], heads = [].slice.call(main.querySelectorAll('.gb-body h2[id]')), prog = main.querySelector('.gb-prog i'), art = main.querySelector('.gb-a');
    function onScroll() {
      var y = window.scrollY + 190, cur = 0;
      heads.forEach(function (h, k) { if (h.getBoundingClientRect().top + window.scrollY <= y) cur = k; });
      links.forEach(function (l, k) {
        var on = k === cur; if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
        if (on && sec.scrollWidth > sec.clientWidth) { var x = l.offsetLeft - sec.offsetLeft; if (x < sec.scrollLeft || x + l.offsetWidth > sec.scrollLeft + sec.clientWidth) sec.scrollLeft = Math.max(0, x - 8); }
      });
      var r = art.getBoundingClientRect(), total = r.height - window.innerHeight * .6, done = Math.min(1, Math.max(0, -r.top / Math.max(total, 1)));
      prog.style.width = (done * 100).toFixed(1) + '%';
      bar.classList.toggle('stuck', bar.getBoundingClientRect().top <= 66);
    }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    /* the guide list closes when a section is chosen or the visitor taps outside it */
    var gd = main.querySelector('.gb-gd');
    document.addEventListener('click', function (e) { if (gd.open && !gd.contains(e.target)) gd.open = false; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && gd.open) { gd.open = false; gd.querySelector('summary').focus(); } });
    [].forEach.call(main.querySelectorAll('[data-fb] [data-v]'), function (b) {
      b.addEventListener('click', function () {
        var fb = store.get('pvh_feedback', {}); fb[a.id] = b.dataset.v; store.set('pvh_feedback', fb);
        var box = main.querySelector('[data-fb]'); box.querySelector('.fb-b').hidden = true; var ok = box.querySelector('.fb-ok'); ok.hidden = false;
        ok.innerHTML = b.dataset.v === 'yes' ? 'Thanks, glad it helped.' : 'Thanks. <a href="contact.html?portal=' + p.id + '&topic=' + encodeURIComponent(a.title) + '">Tell us what was missing</a>.';
      });
    });
    wireVideos();
  };

  R.videos = function () {
    title('Videos');
    var all = H.videos, want = (location.hash || '').slice(1), filt = 'all';
    var cur = all.filter(function (v) { return v.id === want; })[0];
    if (!cur && P(want) && all.some(function (v) { return v.p === want; })) { filt = want; cur = all.filter(function (v) { return v.p === want; })[0]; }
    if (!cur) cur = all[0];
    var ps = H.portals.filter(function (p) { return all.some(function (v) { return v.p === p.id; }); });
    var mob = window.matchMedia && matchMedia('(max-width: 900px)').matches;
    function pn(v) { return v.p === 'all' ? 'All portals' : P(v.p).name; }
    function list() { return all.filter(function (v) { return filt === 'all' || v.p === filt; }); }
    set('<div class="vp-pg"><nav class="ptl-crumb" aria-label="Breadcrumb"><a href="index.html">Help</a><span aria-hidden="true">›</span><span aria-current="page">Videos</span></nav>'
      + '<h1 class="vp-h">Videos</h1>'
      + '<div class="sr-chips vp-chips" role="group" aria-label="Filter videos by portal"><button type="button" data-f="all">All <em>' + all.length + '</em></button>' + ps.map(function (p) { var n = all.filter(function (v) { return v.p === p.id; }).length; return '<button type="button" data-f="' + p.id + '">' + esc(p.name) + ' <em>' + n + '</em></button>'; }).join('') + '</div>'
      + '<div class="vp"><div class="vp-main" id="vp-main" tabindex="-1"></div>'
      + '<details class="vp-list" id="vp-list"' + (mob ? '' : ' open') + '><summary><span id="vp-sum"></span>' + ic('chevron-down', 'vp-c') + '</summary><ol id="vp-ol"></ol></details></div></div>');
    function drawMain(focus) {
      var v = cur, a = A(v.article), t = vThumb(v), L = list(), i = L.indexOf(v), nx = L[i + 1];
      var secs = a ? a.body.filter(function (x) { return x[0] === 'h'; }).map(function (x) { return x[1]; }) : [];
      var poster = '<div class="vp-play">' + (t ? '<img src="' + t + '" alt="">' : '<span class="vp-blank">' + ic(v.p === 'all' ? 'layers' : P(v.p).icon) + '</span>')
        + (v.url ? '<a class="vp-btn" href="' + esc(v.url) + '" target="_blank" rel="noopener" aria-label="Watch: ' + esc(v.title) + ' (opens in a new tab)">' + ic('play') + '</a><a class="vp-ext" href="' + esc(v.url) + '" target="_blank" rel="noopener">Watch video ' + ic('external-link') + '</a>' : v.yt ? '<button type="button" class="vp-btn" id="vp-go" aria-label="Play: ' + esc(v.title) + '">' + ic('play') + '</button>'
                : '<div class="vp-soon"><b>Video coming soon</b><span>The written guide has the same steps, with screenshots.</span>' + (a ? '<a class="btn" href="article.html?a=' + a.id + '">Read the guide ' + arrow() + '</a>' : '') + '</div>') + '</div>';
      document.getElementById('vp-main').innerHTML = poster
        + '<h2 class="vp-t">' + esc(v.title) + '</h2>' + (v.sum ? '<p class="vp-d">' + esc(v.sum) + '</p>' : '') + '<p class="vp-m">' + esc(pn(v)) + (i > -1 ? ' · ' + (i + 1) + ' of ' + L.length : '') + (a ? ' · <a href="article.html?a=' + a.id + '">Read the guide</a>' : '') + '</p>'
        + (secs.length ? '<div class="vp-in"><b>' + (v.yt || v.url ? 'Steps in the written guide' : 'What it will cover') + '</b><ol>' + secs.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ol></div>' : (a ? '<p class="vp-m">' + esc(a.sum) + '</p>' : ''))
        + '<div class="vp-nav">' + (nx ? '<button type="button" class="btn ghost" data-v="' + nx.id + '">Next video: ' + esc(nx.title) + ' ' + arrow() + '</button>' : '') + '</div>';
      var go = document.getElementById('vp-go');
      if (go) go.addEventListener('click', function () { var box = go.parentNode; box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + esc(v.yt) + '?autoplay=1&rel=0" title="' + esc(v.title) + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'; });
      wireV(document.getElementById('vp-main')); icons();
      if (focus) { var m = document.getElementById('vp-main'); m.focus({ preventScroll: true }); m.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' }); }
    }
    function drawList() {
      var L = list(), i = L.indexOf(cur);
      document.getElementById('vp-sum').textContent = 'All videos · ' + (i > -1 ? (i + 1) + ' of ' + L.length : L.length);
      document.getElementById('vp-ol').innerHTML = L.map(function (v, k) { return '<li><button type="button" data-v="' + v.id + '"' + (v === cur ? ' aria-current="true"' : '') + '><span class="vp-n">' + (k + 1) + '</span><span><b>' + esc(v.title) + '</b><span>' + esc(pn(v)) + (v.yt || v.url ? '' : ' · Coming soon') + '</span></span></button></li>'; }).join('');
      wireV(document.getElementById('vp-ol'));
      [].forEach.call(main.querySelectorAll('[data-f]'), function (b) { b.setAttribute('aria-pressed', b.dataset.f === filt); });
    }
    function pick(id) {
      cur = all.filter(function (v) { return v.id === id; })[0] || cur;
      history.replaceState(null, '', 'videos.html#' + cur.id);
      if (mob) document.getElementById('vp-list').open = false;
      drawList(); drawMain(true);
    }
    function wireV(el) { [].forEach.call(el.querySelectorAll('[data-v]'), function (b) { b.addEventListener('click', function () { pick(b.dataset.v); }); }); }
    [].forEach.call(main.querySelectorAll('[data-f]'), function (b) { b.addEventListener('click', function () {
      filt = b.dataset.f; var L = list(); if (L.indexOf(cur) < 0) cur = L[0];
      history.replaceState(null, '', 'videos.html#' + (filt === 'all' ? cur.id : filt));
      drawList(); drawMain(false);
    }); });
    var det = document.getElementById('vp-list');
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mob && det.open) { det.open = false; det.querySelector('summary').focus(); } });
    window.addEventListener('hashchange', function () { var h = location.hash.slice(1); if (h !== cur.id && all.some(function (v) { return v.id === h; })) { cur = all.filter(function (v) { return v.id === h; })[0]; if (list().indexOf(cur) < 0) filt = 'all'; drawList(); drawMain(false); } });
    drawList(); drawMain(false);
  };

  R.guides = function () {
    title('All guides');
    var order = ['studio', 'go', 'connect', 'scada', 'atlas', 'artha', 'account'];
    var ps = order.map(P).filter(function (p) { return p && inPortal(p.id).length; });
    function pick() { var h = (location.hash || '').slice(1); return ps.some(function (p) { return p.id === h; }) ? h : 'studio'; }
    var cur = pick();
    set('<div class="gx">'
      + '<nav class="ptl-crumb" aria-label="Breadcrumb"><a href="index.html">Help</a><span aria-hidden="true">›</span><span aria-current="page">Guides</span></nav>'
      + '<div><h1>All guides</h1><p class="ct-lead">' + H.articles.length + ' step-by-step guides. Pick a portal.</p></div>'
      + searchBox({ ph: 'Search all guides' })
      + '<div class="gx-chips" role="group" aria-label="Portals" translate="no">' + ps.map(function (p) { return '<a href="#' + p.id + '" data-p="' + p.id + '">' + esc(p.name) + ' <em>' + inPortal(p.id).length + '</em></a>'; }).join('') + '</div>'
      + '<div class="gx-g"><nav class="gx-rail" aria-label="Portals"><h2>Portals</h2>' + ps.map(function (p) { return '<a href="#' + p.id + '" data-p="' + p.id + '"><span translate="no">' + esc(p.name) + '</span><em>' + inPortal(p.id).length + '</em></a>'; }).join('') + '</nav>'
      + '<section class="gx-main" id="gx-main" tabindex="-1" aria-live="polite"></section></div></div>');
    function draw(focus) {
      var p = P(cur), arts = inPortal(p.id);
      [].forEach.call(main.querySelectorAll('[data-p]'), function (a) { if (a.dataset.p === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      var on = main.querySelector('.gx-chips [aria-current]'); if (on && on.scrollIntoView && window.innerWidth <= 800) on.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      var m = document.getElementById('gx-main');
      m.innerHTML = '<div class="gx-h"><span class="ptl-ic sm">' + ic(p.icon) + '</span><div><h2 translate="no">' + esc(p.name) + '</h2><p>' + esc(p.who) + '</p></div><a href="portal.html?p=' + p.id + '">Open ' + esc(p.name) + ' help ' + arrow() + '</a></div>'
        + p.topics.map(function (t) { var l = arts.filter(function (a) { return a.t === t.id; }); if (!l.length) return ''; return '<div class="gx-t"><h3>' + esc(t.name) + '</h3><ul>' + l.map(function (a) { return '<li><a href="article.html?a=' + a.id + '"><b>' + esc(a.title) + '</b><span>' + esc(a.sum) + '</span></a></li>'; }).join('') + '</ul></div>'; }).join('')
        + '<div class="sr-stuck"><div><b>Can’t find your guide?</b><span>' + esc(H.support.reply) + '</span></div><a class="btn" href="contact.html?portal=' + p.id + '">Contact support</a></div>';
      icons();
      if (focus) { m.focus({ preventScroll: true }); var top = m.getBoundingClientRect().top + window.scrollY - 90; if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' }); }
    }
    [].forEach.call(main.querySelectorAll('[data-p]'), function (a) { a.addEventListener('click', function (e) { e.preventDefault(); cur = a.dataset.p; history.replaceState(null, '', 'guides.html#' + cur); draw(true); }); });
    window.addEventListener('hashchange', function () { var n = pick(); if (n !== cur) { cur = n; draw(false); } });
    draw(false); wireSuggest();
  };

  R.search = function () {
    var q = (qs('q') || '').trim(), pid = qs('p') || 'all', all = search(q, 'all').a;
    title(q ? 'Results for “' + q + '”' : 'Search');
    var words = q.toLowerCase().split(/\s+/).filter(function (w) { return w.length > 1; });
    function hl(t) {
      t = esc(t); if (!words.length) return t;
      var re = new RegExp('\\b(' + words.map(function (w) { return esc(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'gi');
      return t.replace(re, '<mark>$1</mark>');
    }
    function row(a) {
      var p = P(a.p), t = (p.topics || []).filter(function (x) { return x.id === a.t; })[0];
      return '<li><a class="sr-r" href="article.html?a=' + a.id + '"><span class="sr-tag">' + esc(p.name) + (t ? '<i> · ' + esc(t.name) + '</i>' : '') + '</span><b>' + hl(a.title) + '</b><span class="sr-sum">' + hl(a.sum) + '</span></a></li>';
    }
    var counts = {}; all.forEach(function (a) { counts[a.p] = (counts[a.p] || 0) + 1; });
    var ps = H.portals.filter(function (p) { return counts[p.id]; }).sort(function (m, n) { return counts[n.id] - counts[m.id]; });
    if (pid !== 'all' && !counts[pid]) pid = 'all';
    var stuck = '<div class="sr-stuck"><div><b>' + (q ? 'Didn’t find it?' : 'Can’t find what you need?') + '</b><span>' + (q ? 'Tell us what you searched for. ' : '') + esc(H.support.reply) + '</span></div><a class="btn" href="contact.html' + (q ? '?topic=' + encodeURIComponent(q) : '') + '">' + (q ? 'Ask support about “' + esc(q) + '”' : 'Contact support') + '</a></div>';
    var body;
    if (!q) body = '<h1 class="sr-h">Search help</h1><h2 class="sr-sub">Popular guides</h2><ul class="sr-list">' + H.popular.map(function (id) { return row(A(id)); }).join('') + '</ul>';
    else if (!all.length) body = '<div class="sr-none" role="status"><h1 class="sr-h">No guides match “' + esc(q) + '”</h1><p>Try fewer or simpler words, like “BOQ” or “payment”. Or start with a popular guide.</p></div><ul class="sr-list">' + H.popular.slice(0, 4).map(function (id) { return row(A(id)); }).join('') + '</ul>';
    else body = '<h1 class="sr">Results for “' + esc(q) + '”</h1>'
      + (ps.length > 1 ? '<div class="sr-chips" role="group" aria-label="Filter by portal"><button type="button" data-f="all">All <em>' + all.length + '</em></button>' + ps.map(function (p) { return '<button type="button" data-f="' + p.id + '">' + esc(p.name) + ' <em>' + counts[p.id] + '</em></button>'; }).join('') + '</div>' : '')
      + '<p class="sr-n" id="sr-n" role="status"></p><ul class="sr-list" id="sr-l"></ul>';
    set('<div class="ptl sr-pg"><nav class="ptl-crumb" aria-label="Breadcrumb"><a href="index.html">Help</a><span aria-hidden="true">›</span><span aria-current="page">Search</span></nav>'
      + searchBox({ q: q, ph: 'Search all pvNXT help' }) + body + stuck + '</div>');
    function draw(f) {
      pid = f; var r = all.filter(function (a) { return f === 'all' || a.p === f; });
      var l = document.getElementById('sr-l'), more = r.length > 10;
      l.innerHTML = r.slice(0, 10).map(row).join('') + (more ? '<li class="sr-more-li"><button type="button" class="sr-more">Show ' + (r.length - 10) + ' more</button></li>' : '');
      if (more) l.querySelector('.sr-more').addEventListener('click', function () { var li = this.parentNode, i = 10; li.outerHTML = r.slice(10).map(row).join(''); var nx = l.children[i] && l.children[i].querySelector('a'); if (nx) nx.focus(); });
      document.getElementById('sr-n').textContent = r.length + (r.length === 1 ? ' guide' : ' guides') + ' for “' + q + '”' + (f === 'all' ? '' : ' in ' + P(f).name);
      [].forEach.call(main.querySelectorAll('[data-f]'), function (b) { b.setAttribute('aria-pressed', b.dataset.f === f); });
    }
    if (q && all.length) {
      [].forEach.call(main.querySelectorAll('[data-f]'), function (b) { b.addEventListener('click', function () { draw(b.dataset.f); history.replaceState(null, '', 'search.html?q=' + encodeURIComponent(q) + (b.dataset.f === 'all' ? '' : '&p=' + b.dataset.f)); }); });
      draw(pid);
    }
    wireSuggest();
  };

  R.contact = function () {
    title('Contact support'); var u = user(), pre = qs('portal') || '', topic = qs('topic') || '';
    function ch(href, icon, t, sub, ext, cls) { return '<a class="ct-ch' + (cls ? ' ' + cls : '') + '" href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '><span class="ct-i">' + ic(icon) + '</span><span><b>' + t + '</b><span>' + sub + '</span></span></a>'; }
    set(
      '<div class="ptl ct">'
      + '<nav class="ptl-crumb" aria-label="Breadcrumb"><a href="index.html">Help</a><span aria-hidden="true">›</span><span aria-current="page">Contact</span></nav>'
      + '<div><h1>Contact support</h1><p class="ct-lead">Tell us what happened. ' + esc(H.support.reply) + '</p></div>'
      + '<div class="ct-g"><div class="ct-f"><form id="rq" novalidate>'
      + '<div class="two"><label>Name<input name="name" required autocomplete="name" value="' + esc(u ? u.name || '' : '') + '"></label><label>Email<input name="email" type="email" required autocomplete="email" value="' + esc(u ? u.email : '') + '"></label></div>'
      + '<div class="two"><label>Portal<select name="portal" required><option value="">Choose a portal</option>' + H.portals.map(function (p) { return '<option value="' + p.id + '"' + (pre === p.id ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select></label><label>Topic<input name="topic" required placeholder="e.g. BOQ not updating" value="' + esc(topic) + '"></label></div>'
      + '<div class="hint-arts" id="ha" hidden aria-live="polite"></div>'
      + '<label>What happened?<textarea name="msg" rows="5" required placeholder="What you did, what you expected, what you saw. Include the project or plant name if you have one."></textarea></label>'
      + '<p class="ferr" id="ferr" role="alert" hidden></p><div class="ct-send"><button class="btn" type="submit">Send request ' + arrow() + '</button><span class="note">Opens your email app, addressed to ' + H.support.email + '.</span></div></form>'
      + '<div class="ok" id="ok" tabindex="-1">' + ic('circle-check') + '<h2>Your request is ready to send.</h2><p class="muted">Your email app opened with the details filled in. Press send and we’ll reply within one working day.</p><p class="muted" id="ok-mail"></p><div class="ct-send"><a class="btn" href="' + (u ? 'my.html#requests' : 'index.html') + '">' + (u ? 'View my requests' : 'Back to help') + '</a><button type="button" class="link" id="again">Raise another</button></div></div></div>'
      + '<aside class="ct-side" aria-labelledby="ct-or"><h2 id="ct-or">Or reach us directly</h2>'
      + ch(H.support.whatsapp, 'message-circle', 'WhatsApp', esc(H.support.hours), true)
      + ch('mailto:' + H.support.email, 'mail', 'Email', H.support.email)
      + ch('status.html', 'activity', 'Portal status', 'Check before you write', false, 'ct-x')
      + ch(H.support.demo, 'calendar', 'Book a live demo', 'A walkthrough for your team', true, 'ct-x')
      + '</aside></div></div>'
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
    title('Portal status'); var s = H.status, keys = Object.keys(s.items);
    var lab = { ok: ['No issues reported', 'ok'], issue: ['Investigating an issue', 'issue'], soon: ['Early access', 'soon'] };
    var bad = keys.filter(function (k) { return s.items[k] === 'issue'; });
    var ban = bad.length
      ? '<div class="st-ban issue" role="status"><span class="st-bi">' + ic('alert-triangle') + '</span><div><b>' + esc(names(bad.map(P))) + (bad.length === 1 ? ' has' : ' have') + ' an issue</b><span>We’re looking into it. Updated ' + esc(s.updated) + ' by the pvNXT support team.</span></div></div>'
      : '<div class="st-ban" role="status"><span class="st-bi">' + ic('check') + '</span><div><b>All portals are working</b><span>Updated ' + esc(s.updated) + ' by the pvNXT support team</span></div></div>';
    set('<div class="ptl st">'
      + '<nav class="ptl-crumb" aria-label="Breadcrumb"><a href="index.html">Help</a><span aria-hidden="true">›</span><span aria-current="page">Status</span></nav>'
      + '<div><h1>Portal status</h1><p class="ct-lead">Can’t reach a portal? Check here first.</p></div>' + ban
      + '<ul class="st-list">' + keys.map(function (k) {
          var p = P(k), l = lab[s.items[k]] || lab.ok;
          return '<li><div class="st-n"><b>' + esc(p.name) + '</b>' + (p.host ? '<span>' + esc(p.host) + '</span>' : '') + '</div><span class="st-s ' + l[1] + '">' + esc(l[0]) + '</span><div class="st-a">'
            + (p.url && s.items[k] !== 'soon' ? '<a href="' + p.url + '" target="_blank" rel="noopener">Open<span class="sr"> ' + esc(p.name) + ' (opens in a new tab)</span></a>' : '')
            + '<a href="contact.html?portal=' + k + '&topic=' + encodeURIComponent('Can’t reach ' + p.name) + '">Report a problem<span class="sr"> with ' + esc(p.name) + '</span></a></div></li>';
        }).join('') + '</ul>'
      + '<p class="st-foot">Atlas runs inside Studio and Connect, so it shares their status. Something isn’t working but shows no issue here? <a href="contact.html?topic=' + encodeURIComponent('Portal not working') + '">Tell us</a>.</p></div>');
  };


  R.signin = function () {
    title('Sign in'); var next = qs('next') || 'my.html';
    if (!/^[a-z0-9-]+\.html(\?[^#]*)?(#.*)?$/i.test(next)) next = 'my.html';
    if (user()) { location.replace(next); return; }
    var acct = ['studio', 'go', 'connect', 'scada'];
    /* Demo only: the real portal comes from the pvNXT account system. */
    var demo = { 'studio@demo.pvnxt.com': 'studio', 'go@demo.pvnxt.com': 'go', 'connect@demo.pvnxt.com': 'connect', 'scada@demo.pvnxt.com': 'scada' };
    var em = '', pid = '', mode = 'pw';
    var sso = ['Google', 'Microsoft', 'Apple'].map(function (n) { return '<button type="button" class="si-sso" data-sso="' + n + '">Continue with ' + n + '</button>'; }).join('');
    set('<div class="si-pg"><div class="si-card" id="si-card"></div><p class="si-demo">' + ic('info') + '<span><b>Demo sign-in.</b> Passwords and codes aren’t checked yet. Real sign-in will use your pvNXT portal account.</span></p></div>');
    var card = document.getElementById('si-card');
    function step1(msg) {
      card.innerHTML = '<h1>Sign in to pvNXT Help</h1><p class="si-sub">Use the account you already have on Studio, Go, Connect or SCADA.</p>'
        + '<div class="si-ssos">' + sso + '</div><p class="si-note" id="si-sn" role="status" hidden></p><div class="si-or"><span>or</span></div>'
        + '<form id="si1" novalidate><label>Email<input name="email" type="email" required autocomplete="email" inputmode="email" value="' + esc(em) + '"></label>'
        + '<p class="ferr" id="serr" role="alert"' + (msg ? '' : ' hidden') + '>' + (msg || '') + '</p><button class="btn si-full" type="submit">Continue ' + arrow() + '</button></form>'
        + '<p class="si-new">New to pvNXT? Accounts are created in your portal. <a href="article.html?a=which-portal">Which portal is mine?</a></p>';
      icons();
      [].forEach.call(card.querySelectorAll('[data-sso]'), function (b) { b.addEventListener('click', function () { var n = document.getElementById('si-sn'); n.textContent = b.dataset.sso + ' sign-in will work once help is connected to pvNXT accounts. For this demo, use your email.'; n.hidden = false; card.querySelector('[name=email]').focus(); }); });
      var f = document.getElementById('si1');
      f.addEventListener('submit', function (e) {
        e.preventDefault(); var v = f.email.value.trim().toLowerCase(), err = document.getElementById('serr');
        if (!/^\S+@\S+\.\S+$/.test(v)) { err.textContent = 'Enter the email you use for your pvNXT portal.'; err.hidden = false; f.email.setAttribute('aria-invalid', 'true'); f.email.focus(); return; }
        em = v; pid = demo[v] || ''; step2();
      });
      if (!msg) f.email.focus();
    }
    function step2() {
      var p = pid ? P(pid) : null;
      card.innerHTML = '<h1>Welcome back</h1>'
        + '<div class="si-who"><span><b>' + esc(em) + '</b><span>' + (p ? esc(p.name) + ' account' : 'pvNXT account') + '</span></span><button type="button" class="link" id="si-ch">Change</button></div>'
        + '<form id="si2" novalidate>'
        + (p ? '' : '<label>Demo only: which portal is this account on?<select name="pid" required><option value="">Choose your portal</option>' + acct.map(function (id) { return '<option value="' + id + '">' + esc(P(id).name) + '</option>'; }).join('') + '</select><span class="si-hint">On the live site we’ll find this from your email.</span></label>')
        + (mode === 'pw'
          ? '<label>Password<input name="pw" type="password" required autocomplete="current-password"></label>'
          : '<label>6-digit code<input name="pw" required inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="[0-9]{6}"><span class="si-hint">We sent a code to ' + esc(em) + '. (Demo: enter any 6 digits.)</span></label>')
        + '<p class="ferr" id="serr" role="alert" hidden></p><button class="btn si-full" type="submit">Sign in</button></form>'
        + '<div class="si-links"><button type="button" class="link" id="si-mode">' + (mode === 'pw' ? 'Email me a code instead' : 'Use my password instead') + '</button>'
        + (mode === 'pw' ? '<a href="' + (p && p.url ? p.url : 'contact.html?topic=' + encodeURIComponent('Forgot password')) + '"' + (p && p.url ? ' target="_blank" rel="noopener"' : '') + '>Forgot password?</a>' : '') + '</div>'
        + '<p class="si-new">Guides are open to everyone. <a href="index.html">Continue as a guest</a></p>';
      document.getElementById('si-ch').addEventListener('click', function () { step1(); });
      document.getElementById('si-mode').addEventListener('click', function () { mode = mode === 'pw' ? 'code' : 'pw'; step2(); });
      var f = document.getElementById('si2');
      f.addEventListener('submit', function (e) {
        e.preventDefault(); var err = document.getElementById('serr'), bad = null;
        if (f.pid && !f.pid.value) bad = [f.pid, 'Choose the portal for this account.'];
        else if (mode === 'pw' && !f.pw.value) bad = [f.pw, 'Enter your password.'];
        else if (mode === 'code' && !/^\d{6}$/.test(f.pw.value.trim())) bad = [f.pw, 'Enter the 6-digit code.'];
        if (bad) { err.textContent = bad[1]; err.hidden = false; bad[0].setAttribute('aria-invalid', 'true'); bad[0].focus(); return; }
        var portal = pid || f.pid.value;
        store.set('pvh_user', { email: em, name: '', portals: [portal] });
        location.href = next;
      });
      (f.pid || f.pw).focus();
    }
    step1();
  };

  R.my = function () {
    var u = user(); if (!u) { location.replace('signin.html?next=my.html'); return; }
    title('My help');
    var p = P((u.portals || [])[0]) || P('studio'), read = store.get('pvh_read', []);
    function reqs() { return store.get('pvh_requests', []); }
    function saved() { return store.get('pvh_saved', []).map(A).filter(Boolean); }
    var paths = H.paths.filter(function (pa) { return pa.p === p.id; });
    var tabs = [['requests', 'My requests', function () { return reqs().length; }], ['saved', 'Saved guides', function () { return saved().length; }], ['progress', 'Reading progress', null]];
    function date(iso) { try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } }
    function topic(a) { var t = (P(a.p).topics || []).filter(function (x) { return x.id === a.t; })[0]; return t ? t.name : P(a.p).name; }
    function empty(t, txt, href, cta) { return '<div class="my-empty"><b>' + t + '</b><p>' + txt + '</p><a class="btn" href="' + href + '">' + cta + '</a></div>'; }
    var V = {
      requests: function () {
        var r = reqs();
        return '<div class="my-h"><h2>Your requests</h2><a href="contact.html?portal=' + p.id + '">New request</a></div>'
          + (r.length ? '<ul class="my-box">' + r.map(function (x) { return '<li><div><b>' + esc(x.topic) + '</b><span>' + esc(x.id) + ' · Sent ' + date(x.at) + '</span></div><span class="my-st' + (x.status === 'Resolved' ? ' ok' : '') + '">' + esc(x.status) + '</span></li>'; }).join('') + '</ul><p class="my-note">Replies arrive by email from ' + H.support.email + '. <button type="button" class="link" id="my-clear">Clear this list</button></p>'
            : empty('No requests yet', 'When you contact support while signed in, your request shows up here with its ID.', 'contact.html?portal=' + p.id, 'Contact support'));
      },
      saved: function () {
        var s = saved();
        return '<div class="my-h"><h2>Guides you saved</h2></div>'
          + (s.length ? '<ul class="my-box">' + s.map(function (a) { return '<li><div><a href="article.html?a=' + a.id + '">' + esc(a.title) + '</a><span>' + esc(topic(a)) + '</span></div><button type="button" class="link" data-unsave="' + a.id + '">Remove<span class="sr"> ' + esc(a.title) + '</span></button></li>'; }).join('') + '</ul>'
            : empty('Nothing saved yet', 'Use <b>Save</b> at the top of any guide to keep it here.', 'portal.html?p=' + p.id, 'Browse ' + esc(p.name) + ' guides'));
      },
      progress: function () {
        if (!paths.length) return empty('No reading path yet', 'Guides for ' + esc(p.name) + ' are listed by topic.', 'portal.html?p=' + p.id, 'Browse ' + esc(p.name) + ' guides');
        return paths.map(function (pa) {
          var d = pa.steps.filter(function (x) { return read.indexOf(x) > -1; }).length, n = pa.steps.length, nx = pa.steps.filter(function (x) { return read.indexOf(x) < 0; })[0], pc = Math.round(d / n * 100);
          return '<div class="my-h"><h2>' + esc(pa.title) + '</h2></div><div class="my-box my-pr"><div class="my-bar" role="progressbar" aria-valuenow="' + pc + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + esc(pa.title) + '"><i style="width:' + pc + '%"></i></div>'
            + '<p>' + d + ' of ' + n + ' guides read' + (nx ? ' · Next: ' + esc(A(nx).title) : ' · All done') + '</p>' + (nx ? '<a class="btn" href="article.html?a=' + nx + '">' + (d ? 'Continue' : 'Start') + ' ' + arrow() + '</a>' : '')
            + '<ol class="my-steps">' + pa.steps.map(function (x) { var done = read.indexOf(x) > -1; return '<li' + (done ? ' class="done"' : '') + '><a href="article.html?a=' + x + '">' + esc(A(x).title) + '</a>' + (done ? '<span>Read</span>' : '') + '</li>'; }).join('') + '</ol></div>';
        }).join('');
      }
    };
    set('<div class="ptl my">'
      + '<nav class="ptl-crumb" aria-label="Breadcrumb"><a href="index.html">Help</a><span aria-hidden="true">›</span><span aria-current="page">My help</span></nav>'
      + '<div><h1>My help</h1><div class="my-who"><span>' + esc(u.email) + ' <span class="my-pill">' + esc(p.name) + ' account</span></span>' + (p.url ? '<a class="btn ghost" href="' + p.url + '" target="_blank" rel="noopener">Open ' + esc(p.name) + ' ' + ic('external-link') + '</a>' : '') + '</div></div>'
      + '<div class="my-tabs" role="tablist" aria-label="My help">' + tabs.map(function (t) { return '<button type="button" role="tab" id="tab-' + t[0] + '" aria-controls="my-panel" data-t="' + t[0] + '">' + t[1] + '<em id="n-' + t[0] + '"></em></button>'; }).join('') + '</div>'
      + '<div id="my-panel" role="tabpanel" tabindex="0"></div>'
      + '<p class="my-foot"><a href="portal.html?p=account">Account &amp; security help</a> · <button type="button" class="link" data-signout>Sign out</button></p></div>');
    var btns = [].slice.call(main.querySelectorAll('[role=tab]'));
    function counts() { tabs.forEach(function (t) { var el = document.getElementById('n-' + t[0]); el.textContent = t[2] ? ' ' + t[2]() : ''; }); }
    function show(v, focus) {
      if (v === 'learning') v = 'progress';
      if (!V[v]) v = reqs().length ? 'requests' : saved().length ? 'saved' : 'requests';
      btns.forEach(function (b) { var on = b.dataset.t === v; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); if (on && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });
      var pn = document.getElementById('my-panel'); pn.setAttribute('aria-labelledby', 'tab-' + v); pn.innerHTML = V[v](); icons(); counts();
      var c = document.getElementById('my-clear'); if (c) c.addEventListener('click', function () { store.set('pvh_requests', []); show('requests'); });
      [].forEach.call(pn.querySelectorAll('[data-unsave]'), function (x) { x.addEventListener('click', function () { store.set('pvh_saved', store.get('pvh_saved', []).filter(function (id) { return id !== x.dataset.unsave; })); show('saved'); }); });
      history.replaceState(null, '', 'my.html#' + v);
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { show(b.dataset.t); });
      b.addEventListener('keydown', function (e) { var k = e.key, j = k === 'ArrowRight' ? i + 1 : k === 'ArrowLeft' ? i - 1 : k === 'Home' ? 0 : k === 'End' ? btns.length - 1 : null; if (j === null) return; e.preventDefault(); show(btns[(j + btns.length) % btns.length].dataset.t, true); });
    });
    var so = main.querySelector('.my-foot [data-signout]'); if (so) so.addEventListener('click', function () { try { localStorage.removeItem('pvh_user'); } catch (e) { } location.href = 'index.html'; });
    window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });
    show(location.hash.slice(1));
  };

  R['404'] = function () {
    title('Page not found');
    var bad = location.pathname + location.search;
    function row(a) { var p = P(a.p), t = (p.topics || []).filter(function (x) { return x.id === a.t; })[0]; return '<li><a class="sr-r" href="article.html?a=' + a.id + '"><span class="sr-tag">' + esc(p.name) + (t ? '<i> · ' + esc(t.name) + '</i>' : '') + '</span><b>' + esc(a.title) + '</b></a></li>'; }
    set('<div class="ptl sr-pg nf">'
      + '<div><span class="nf-code">Error 404</span><h1 class="sr-h">We can’t find that page</h1><p class="ct-lead">The link may be old or mistyped. Search for what you need, or start with a popular guide.</p></div>'
      + searchBox({ ph: 'Search all pvNXT help' })
      + '<h2 class="sr-sub">Popular guides</h2><ul class="sr-list">' + H.popular.slice(0, 5).map(function (id) { return A(id); }).filter(Boolean).map(row).join('') + '</ul>'
      + '<div class="sr-stuck"><div><b>Followed a link from a pvNXT portal?</b><span>Tell us where it was so we can fix it.</span></div><a class="btn" href="contact.html?topic=' + encodeURIComponent('Broken link: ' + bad) + '">Report a broken link</a></div></div>');
    wireSuggest();
  };


  layout();
  chatWidget();
  /* option C: soft glow follows the cursor on portal tiles */
  if (window.matchMedia && matchMedia('(hover:hover) and (prefers-reduced-motion:no-preference)').matches) {
    document.addEventListener('pointermove', function (e) { var t = e.target.closest && e.target.closest('.mp a'); if (!t) return; var r = t.getBoundingClientRect(); t.style.setProperty('--gx', (e.clientX - r.left) + 'px'); t.style.setProperty('--gy', (e.clientY - r.top) + 'px'); }, { passive: true });
  }
  (R[page] || R['404'])();
  wireSuggest();
  icons(); window.addEventListener('load', icons);
  /* flashlight on page heroes, same as terranxt.com */
  [].forEach.call(document.querySelectorAll('.page-hero'), function (s) {
    s.addEventListener('mousemove', function (e) { var r = s.getBoundingClientRect(); s.style.setProperty('--mx', (e.clientX - r.left) + 'px'); s.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
})();
