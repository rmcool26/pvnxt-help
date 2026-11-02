/* pvNXT Help polish: portal photos, "Get the app", dark footer, Play/View cursor, 404 photo. */
(function () {
  var H = window.HELP, page = document.body.dataset.page;
  var LOCAL = window.HELP_LOCAL_PHOTOS || {}; /* self-hosted copies, if added later */
  var U = function (id, w) { return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=' + (w || 1600) + '&q=72'; };
  var PH = {
    installer: { id: 'photo-1624397640148-949b1732bb0a', alt: 'Installer fixing a solar panel on a roof', by: 'Bill Mead', u: 'wmmead' },
    hardhat: { id: 'photo-1719848576338-9516ba7ccd8b', alt: 'Engineer working on a rooftop array', by: 'Siwawut Phoophinyo', u: 'phoophinyo' },
    house: { id: 'photo-1655300256335-beef51a914fe', alt: 'Home with rooftop solar', by: 'Watt A Lot', u: 'wattalot' },
    rows: { id: 'photo-1694327671725-e2a81cda3436', alt: 'Rows of panels on a roof', by: 'Michael Pointner', u: 'pino_rumbero' },
    desert: { id: 'photo-1674606071893-2a9023075f70', alt: 'Solar farm in the desert', by: 'Manny Becerra', u: 'mannyb' },
    aerial: { id: 'photo-1641959166358-6d08825fb88f', alt: 'Aerial view of a solar plant', by: 'ダモ リ', u: 'darmau' },
    support: { id: 'photo-1626863905121-3b0c0ed7b94c', alt: 'Support team at work in New Delhi', by: 'Charanjeet Dhiman', u: 'charanjeet_dhiman' }
  };
  var PORTAL_PHOTO = { studio: 'rows', go: 'hardhat', connect: 'house', scada: 'desert', atlas: 'aerial', artha: 'aerial', apps: 'installer', account: 'support' };
  
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function P(id) { return H.portals.filter(function (p) { return p.id === id; })[0]; }
  function src(k) { return LOCAL[k] || U(PH[k].id); }
  /* credit: plain text inside links (no nested links), real links elsewhere */
  function photo(k, cls, inLink) {
    var p = PH[k], ref = '?utm_source=pvnxt_help&utm_medium=referral';
    var cap = inLink ? 'Photo: ' + esc(p.by) + ' / Unsplash'
      : 'Photo: <a href="https://unsplash.com/@' + p.u + ref + '" target="_blank" rel="noopener">' + esc(p.by) + '</a> / <a href="https://unsplash.com/' + ref + '" target="_blank" rel="noopener">Unsplash</a>';
    return '<figure class="sg-ph ' + (cls || '') + '"><span class="sg-fb">Unsplash photo: ' + esc(p.alt) + '</span><img src="' + src(k) + '" alt="' + esc(p.alt) + '" loading="lazy" onerror="this.remove()"><figcaption>' + cap + '</figcaption></figure>';
  }
  /* ---------- 1. home: unchanged (centered search + moving dot texture) ---------- */
  /* ---------- 2. portal pages: faint real photo behind the title + "Get the app" ---------- */
  var APPS = { studio: 1, go: 1, connect: 1, scada: 1, artha: 1 };
  function portal() {
    var head = document.querySelector('.ptl-head'); if (!head) return;
    var id = (location.search.match(/[?&]p=([a-z]+)/) || [])[1] || 'studio', p = P(id) || P('studio');
    var ptl = head.closest('.ptl'); ptl.classList.add('sg-pt');
    ptl.insertAdjacentElement('afterbegin', el(photo(PORTAL_PHOTO[p.id] || 'rows', 'sg-wide sg-x')));
    if (APPS[p.id]) head.querySelector('div').insertAdjacentElement('beforeend', el('<a class="sg-app sg-x" href="article.html?a=get-the-app">Get the ' + esc(p.name) + ' app · Android and iOS</a>'));
  }
  /* ---------- 4. 404 + empty states: one small real photo ---------- */
  function notFound() { var nf = document.querySelector('.nf'); if (nf) { nf.classList.add('sg-nf'); nf.insertAdjacentElement('afterbegin', el(photo('rows', 'sg-sq sg-x'))); } }
  /* ---------- 5. dark footer: slim brand column, professional "Contact us" column ---------- */
  function footer() {
    var mf = document.querySelector('.mf'); if (!mf) return;
    var s = H.support; if (!s.phone) s.phone = '+91 84474 44157';
    var col = function (h, links) { return '<div class="sg-fc"><h6>' + h + '</h6>' + links + '</div>'; };
    var ext = ' target="_blank" rel="noopener"';
    var ft = '<footer class="sg-ft sg-x"><div class="sg-fin">'
      + '<div class="sg-fbrand"><a class="sg-logo" href="index.html" translate="no"><img src="assets/logos/mark.png" alt="">pvNXT Help</a><p class="sg-tag">Help for every pvNXT portal.</p>'
      + '<ul class="sg-ct"><li><span>Hours</span>Mon–Fri, 9:00–17:00 IST<br>7:30–15:30 GST</li><li><span>Phone</span><a href="tel:' + s.phone.replace(/\s/g, '') + '">' + s.phone + '</a></li><li><span>Email</span><a href="mailto:' + s.email + '">' + s.email + '</a></li></ul></div>'
      + col('Portals', ['studio', 'go', 'connect', 'scada', 'atlas', 'artha'].map(function (id) { return '<a href="portal.html?p=' + id + '" translate="no">' + esc(P(id).name) + '</a>'; }).join(''))
      + col('Help', '<a href="guides.html">All guides</a><a href="videos.html">Videos</a><a href="portal.html?p=account">Account &amp; billing</a><a href="article.html?a=get-the-app">Get the app</a><a href="status.html">Service status</a>')
      + col('Contact us', '<a href="' + s.whatsapp + '"' + ext + '>Chat on WhatsApp</a><a href="contact.html">Raise a support request</a><a href="tel:' + s.phone.replace(/\s/g, '') + '">Call support</a>')
      + col('Company', '<a href="' + s.site + '"' + ext + '>About Terranxt</a><a href="' + s.demo + '"' + ext + '>Book a demo</a><a href="' + s.site + '/privacy.html"' + ext + '>Privacy policy</a><a href="' + s.site + '/terms.html"' + ext + '>Terms of use</a>')
      + '</div><div class="sg-base"><span>© ' + new Date().getFullYear() + ' Terranxt Pvt Ltd. All rights reserved.</span><span>Personal details in screenshots are blurred.</span></div></footer>';
    mf.style.display = 'none'; mf.insertAdjacentHTML('beforebegin', ft);
  }
  /* ---------- 6. cursor: dot + ring, says "Play" over videos and "View" over images ---------- */
  function cursor() {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cur = document.createElement('div'); cur.className = 'sg-cur sg-x'; cur.innerHTML = '<i class="d"></i><i class="r"><span></span></i>'; document.body.appendChild(cur);
    var d = cur.querySelector('.d'), r = cur.querySelector('.r'), lab = r.querySelector('span'), x = -100, y = -100, rx = x, ry = y;
    document.addEventListener('pointermove', function (e) {
      x = e.clientX; y = e.clientY; d.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      var t = e.target, field = t.closest && t.closest('input,textarea,select,[contenteditable],.cx');
      cur.classList.toggle('hide', !!field);
      var vid = t.closest && t.closest('.vp-play,.art-vid'), img = t.closest && t.closest('.gb-body img,.sg-ph'), hot = t.closest && t.closest('a,button,summary,label,[role=tab]');
      r.classList.remove('big', 'lab'); lab.textContent = '';
      if (vid) { r.classList.add('lab'); lab.textContent = 'Play'; }
      else if (img && !hot) { r.classList.add('lab'); lab.textContent = 'View'; }
      else if (hot) r.classList.add('big');
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cur.classList.add('hide'); });
    document.addEventListener('mouseenter', function () { cur.classList.remove('hide'); });
    (function loop() { rx += (x - rx) * .2; ry += (y - ry) * .2; r.style.transform = 'translate(' + rx + 'px,' + ry + 'px)'; requestAnimationFrame(loop); })();
  }


  /* back to top follows "Ask us": when the button steps away on phones, it drops into its place */
  function fabSync() {
    var fab = document.querySelector('.cx-fab'); if (!fab) { document.body.classList.add('sg-no-fab'); return; }
    var sync = function () { document.body.classList.toggle('sg-fab-away', fab.classList.contains('cx-away') || fab.hidden); };
    new MutationObserver(sync).observe(fab, { attributes: true, attributeFilter: ['class', 'hidden'] }); sync();
  }
  /* ---------- apply ---------- */
  document.body.classList.add('sg-final');
  if (page === 'portal') portal();
  if (page === '404') notFound();
  footer(); cursor(); fabSync();
})();
