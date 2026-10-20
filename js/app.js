/* ==========================================================================
   app.js — site behaviour (no libraries, no build step).
   Language toggle · header/footer · countdown (IST) · listen (text-to-speech)
   large text / high contrast · share · JSON lists · EVM/ballot practice demo
   ask form → WhatsApp · QR code generator · offline (service worker).
   All visible text comes from js/i18n.js or data/*.json.
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var I18N = window.I18N || { hi: {}, en: {} };
  var doc = document, html = doc.documentElement, body = doc.body;

  /* ---------- Storage (safe if blocked) ---------- */
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  var lang = store.get('lang') === 'en' ? 'en' : 'hi';
  var renderers = [];
  var dataCache = {};

  /* ---------- Text helpers ---------- */
  function t(key, vars) {
    var s = I18N[lang] && I18N[lang][key];
    if (s == null) {
      if (window.console) console.warn('[i18n] missing "' + key + '" for ' + lang);
      s = (I18N.hi && I18N.hi[key]);
      if (s == null) return '[' + key + ']';
    }
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /* Escape + highlight [EDIT ...] markers */
  function rich(s) { return esc(s).replace(/\[EDIT[^\]]*\]/g, '<mark class="edit">$&</mark>'); }
  function setText(el, str) {
    if (str.indexOf('[EDIT') === -1) { el.textContent = str; return; }
    el.innerHTML = rich(str);
  }
  function icon(name, extra) {
    return '<svg class="icon' + (extra ? ' ' + extra : '') + '" aria-hidden="true" focusable="false"><use href="#i-' + name + '"></use></svg>';
  }
  function siteUrl() {
    if (CFG.siteUrl) return CFG.siteUrl.replace(/\/?$/, '/');
    return location.href.replace(/[#?].*$/, '').replace(/[^\/]*$/, '');
  }
  function waLink(text, toCandidate) {
    return 'https://wa.me/' + (toCandidate ? CFG.phoneIntl : '') + '?text=' + encodeURIComponent(text);
  }
  function openExternal(url) {
    var w = window.open(url, '_blank');
    if (w) { try { w.opener = null; } catch (e) { /* ignore */ } } else { location.href = url; }
  }
  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }

  function getCleanPageName(href) {
    if (!href) return '';
    var clean = href.split('#')[0].split('?')[0].replace(/^.*\//, '');
    return clean || 'index.html';
  }

  /* ---------- Google Analytics 4 (gtag.js) ---------- */
  function getAnalyticsId() {
    var id = (CFG.analyticsId || (CFG.firebase && CFG.firebase.measurementId) || '').trim();
    if (id) return id;
    var stored = (store.get('ga_measurement_id') || '').trim();
    if (stored) return stored;
    try {
      var match = location.search.match(/[?&]ga=([A-Za-z0-9_-]+)/);
      if (match && match[1]) {
        var qId = match[1].trim();
        store.set('ga_measurement_id', qId);
        return qId;
      }
    } catch (e) { /* ignore */ }
    return '';
  }

  function initAnalytics() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function () { window.dataLayer.push(arguments); };
    }

    var id = getAnalyticsId();
    if (!id) return;

    window.gtag('js', new Date());
    window.gtag('config', id, {
      send_page_view: false,
      anonymize_ip: true
    });

    var existing = doc.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    if (!existing) {
      var s = doc.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
      doc.head.appendChild(s);
    }

    var initialPage = getCleanPageName(location.pathname);
    trackPageView(initialPage, doc.title);
  }

  function trackPageView(pagePath, pageTitle) {
    if (typeof window.gtag !== 'function') return;
    try {
      window.gtag('event', 'page_view', {
        page_title: pageTitle || doc.title,
        page_location: location.href,
        page_path: pagePath || location.pathname
      });
    } catch (e) { /* ignore */ }
  }

  function trackEvent(eventName, eventParams) {
    if (typeof window.gtag !== 'function') return;
    try {
      window.gtag('event', eventName, eventParams || {});
    } catch (e) { /* ignore */ }
  }

  /* ---------- Icon sprite (inline so it works from file:// too) ---------- */
  var ICONS = {
    cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/><path d="M22 10v6"/>',
    ball: '<circle cx="12" cy="12" r="10"/><path d="m12 7 4 3-1.5 4.5h-5L8 10z"/><path d="M12 7V2.5M16 10l4.5-1.5M14.5 14.5l2.5 4M9.5 14.5 7 18.5M8 10 3.5 8.5"/>',
    people: '<circle cx="9" cy="7" r="3.5"/><path d="M2 21v-1.5A5.5 5.5 0 0 1 7.5 14h3a5.5 5.5 0 0 1 5.5 5.5V21"/><circle cx="17.5" cy="8" r="2.5"/><path d="M18 14a4.5 4.5 0 0 1 4 4.5V21"/>',
    handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
    vote: '<path d="M3 14h18v7H3z"/><path d="M7 14V4h10v10"/><path d="m9.5 9 2 2 3.5-4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    pin: '<path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    wa: '<path d="M3.5 20.5 4.9 16.4A8.5 8.5 0 1 1 8 19.3z"/><path d="M9 8.3c0 3.6 3.1 6.7 6.7 6.7l1-1.6-2.1-1-1 .8a4.2 4.2 0 0 1-2.4-2.4l.8-1-1-2.1z"/>',
    speaker: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
    text: '<path d="M2 19 7.5 5h1L14 19M4.5 14h7"/><path d="M19 8v6M16 11h6"/>',
    contrast: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    list: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4" cy="6" r="1.2"/><circle cx="4" cy="12" r="1.2"/><circle cx="4" cy="18" r="1.2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    question: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-5M12 8h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    id: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 16a3 3 0 0 1 6 0M14 10h5M14 14h4"/>',
    finger: '<path d="M9 12V5a2 2 0 0 1 4 0v6"/><path d="M13 10a2 2 0 0 1 4 0v2"/><path d="M17 12a2 2 0 0 1 4 0v2a8 8 0 0 1-8 8h-1a8 8 0 0 1-6.3-3.1L3 15.5a2 2 0 0 1 3-2.6L9 15"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    print: '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    building: '<path d="M3 21h18M5 21V10l7-5 7 5v11"/><path d="M9 21v-6h6v6"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    audio: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/>',
    video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3z"/>',
    alert: '<path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18h.01"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>'
  };
  function injectSprite() {
    var s = '';
    for (var k in ICONS) s += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + ICONS[k] + '</symbol>';
    body.insertAdjacentHTML('afterbegin', '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">' + s + '</svg>');
  }

  /* ---------- Header, tools, footer, floating button ---------- */
  var NAV_VOTER = [
    ['index.html', 'nav.home', 'home'], ['how-to-vote.html', 'nav.howToVote', 'vote'],
    ['check-name.html', 'nav.checkName', 'search'], ['find-booth.html', 'nav.findBooth', 'pin'],
    ['sarpanch-role.html', 'nav.sarpanchRole', 'building'], ['faq.html', 'nav.faq', 'question']
  ];
  var NAV_CAND = [
    ['manifesto.html', 'nav.manifesto', 'list'], ['about.html', 'nav.about', 'user'],
    ['village-issues.html', 'nav.villageIssues', 'people'], ['ask.html', 'nav.ask', 'edit'],
    ['contact.html', 'nav.contact', 'phone'], ['flyer.html', 'nav.flyer', 'print']
  ];
  function navList(items, current) {
    return items.map(function (it) {
      return '<li><a href="' + it[0] + '"' + (it[0] === current ? ' aria-current="page"' : '') + '>' +
        icon(it[2]) + '<span data-i18n="' + it[1] + '">' + esc(t(it[1])) + '</span></a></li>';
    }).join('');
  }
  function buildChrome() {
    var current = body.getAttribute('data-page') || 'index.html';
    var head = $('[data-chrome="header"]');
    if (head) {
      head.outerHTML =
        '<aside class="top-announcement-bar" role="region" aria-label="Announcement">' +
          '<div class="wrap ann-content">' +
            '<span class="ann-badge">🔴 <span data-i18n="meeting.tag">' + esc(t('meeting.tag')) + '</span></span>' +
            '<a href="index.html#meeting-event" class="ann-link" data-i18n="meeting.alert">' +
              esc(t('meeting.alert')) +
            '</a>' +
          '</div>' +
        '</aside>' +
        '<header class="site-header">' +
          '<div class="wrap bar">' +
            '<a class="brand" href="index.html"><span class="brand-name" data-i18n="common.siteName">मनोज कुमार आचार्य</span>' +
            '<span class="brand-role" data-i18n="common.siteRole">सरपंच प्रत्याशी · ग्राम पंचायत अनूपशहर</span></a>' +
            '<nav class="desktop-nav-links" aria-label="Desktop Navigation">' +
              '<a href="index.html" class="desktop-nav-link"' + (current === 'index.html' ? ' aria-current="page"' : '') + '><span data-i18n="nav.home">मुख्य पेज</span></a>' +
              '<a href="how-to-vote.html" class="desktop-nav-link"' + (current === 'how-to-vote.html' ? ' aria-current="page"' : '') + '><span data-i18n="nav.howToVote">वोट कैसे दें</span></a>' +
              '<a href="check-name.html" class="desktop-nav-link"' + (current === 'check-name.html' ? ' aria-current="page"' : '') + '><span data-i18n="nav.checkName">नाम जाँचें</span></a>' +
              '<a href="find-booth.html" class="desktop-nav-link"' + (current === 'find-booth.html' ? ' aria-current="page"' : '') + '><span data-i18n="nav.findBooth">बूथ खोजें</span></a>' +
              '<a href="contact.html" class="desktop-nav-link"' + (current === 'contact.html' ? ' aria-current="page"' : '') + '><span data-i18n="nav.contact">संपर्क</span></a>' +
            '</nav>' +
            '<a href="manifesto.html" class="btn-manifesto-nav"' + (current === 'manifesto.html' ? ' aria-current="page"' : '') + ' data-i18n-attr="aria-label:nav.manifestoNav;title:nav.manifestoNav">' + icon('list') + '<span class="manifesto-nav-text" data-i18n="nav.manifestoNav">मेरे वादे</span></a>' +
            '<button type="button" class="btn-lang" id="langBtn" data-i18n-attr="aria-label:common.langBtnLabel;title:common.langBtnLabel">' + icon('globe') + '</button>' +
            '<button type="button" class="btn-menu" id="menuBtn" aria-expanded="false" aria-controls="siteNav">' +
              '<span class="label" data-i18n="common.menu">मेनू</span></button>' +
          '</div>' +
          '<nav id="siteNav" class="site-nav" data-i18n-attr="aria-label:common.navLabel"><div class="wrap">' +
            '<div class="nav-group"><p class="nav-head" data-i18n="common.navVoter">' + esc(t('common.navVoter')) + '</p><ul>' + navList(NAV_VOTER, current) + '</ul></div>' +
            '<div class="nav-group cand"><p class="nav-head" data-i18n="common.navCandidate">' + esc(t('common.navCandidate')) + '</p><ul>' + navList(NAV_CAND, current) + '</ul></div>' +
          '</div></nav>' +
        '</header>' +
        '<div class="toolbar-band"><div class="wrap toolbar" role="group" data-i18n-attr="aria-label:common.toolsLabel">' +
          '<button type="button" class="tool-btn icon-only" id="ttsBtn" aria-pressed="false" data-i18n-attr="aria-label:common.listen;title:common.listen">' + icon('speaker') + '</button>' +
          '<button type="button" class="tool-btn icon-only" id="textBtn" aria-pressed="false" data-i18n-attr="aria-label:common.largeText;title:common.largeText">' + icon('text') + '</button>' +
          '<button type="button" class="tool-btn icon-only" id="hcBtn" aria-pressed="false" data-i18n-attr="aria-label:common.contrast;title:common.contrast">' + icon('contrast') + '</button>' +
        '</div></div>';
    }
    var foot = $('[data-chrome="footer"]');
    if (foot) {
      foot.outerHTML =
        '<footer class="site-footer"><div class="tricolour"></div><div class="wrap">' +
          '<p class="footer-official" data-i18n="footer.official">' + esc(t('footer.official')) + '</p>' +
          '<p><a data-link="sec" target="_blank" rel="noopener">' + icon('external') + ' <span data-i18n="footer.secLink">' + esc(t('footer.secLink')) + '</span></a></p>' +
          '<p data-i18n="footer.published">' + esc(t('footer.published')) + '</p>' +
          '<p data-i18n="footer.place">' + esc(t('footer.place')) + '</p>' +
          '<p data-i18n="footer.date">' + esc(t('footer.date')) + '</p>' +
          '<p data-i18n="footer.privacy">' + esc(t('footer.privacy')) + '</p>' +
          '<p><button type="button" class="btn btn-outline" data-share-site>' + icon('share') + '<span data-i18n="common.share">' + esc(t('common.share')) + '</span></button></p>' +
        '</div></footer>' +
        '<a class="wa-float" data-link="wa" target="_blank" rel="noopener" data-i18n-attr="aria-label:common.waFloat">' + icon('wa') + '</a>' +
        '<nav class="bottom-nav" aria-label="Mobile Navigation">' +
          '<a href="index.html" class="bottom-tab"' + (current === 'index.html' ? ' aria-current="page"' : '') + '>' +
            '<span class="bottom-tab-icon">' + icon('home') + '</span>' +
            '<span class="bottom-tab-label" data-i18n="nav.home">मुख्य पेज</span>' +
          '</a>' +
          '<a href="how-to-vote.html" class="bottom-tab"' + (current === 'how-to-vote.html' ? ' aria-current="page"' : '') + '>' +
            '<span class="bottom-tab-icon">' + icon('vote') + '</span>' +
            '<span class="bottom-tab-label" data-i18n="nav.howToVote">वोट कैसे दें</span>' +
          '</a>' +
          '<a href="check-name.html" class="bottom-tab"' + (current === 'check-name.html' ? ' aria-current="page"' : '') + '>' +
            '<span class="bottom-tab-icon">' + icon('search') + '</span>' +
            '<span class="bottom-tab-label" data-i18n="nav.checkName">नाम जाँचें</span>' +
          '</a>' +
          '<a href="find-booth.html" class="bottom-tab"' + (current === 'find-booth.html' ? ' aria-current="page"' : '') + '>' +
            '<span class="bottom-tab-icon">' + icon('pin') + '</span>' +
            '<span class="bottom-tab-label" data-i18n="nav.findBooth">बूथ खोजें</span>' +
          '</a>' +
          '<a href="contact.html" class="bottom-tab"' + (current === 'contact.html' ? ' aria-current="page"' : '') + '>' +
            '<span class="bottom-tab-icon">' + icon('phone') + '</span>' +
            '<span class="bottom-tab-label" data-i18n="nav.contact">संपर्क</span>' +
          '</a>' +
        '</nav>';
    }
  }

  /* ---------- Links built from SITE_CONFIG ---------- */
  function applyLinks() {
    $$('[data-link]').forEach(function (a) {
      var k = a.getAttribute('data-link'), h = null;
      if (k === 'tel') h = 'tel:+91' + CFG.phone;
      else if (k === 'wa') h = 'https://wa.me/' + CFG.phoneIntl;
      else if (k === 'wa-prefill') h = waLink(t('contact.waPrefill'), true);
      else if (k === 'sec') h = CFG.secWebsite;
      else if (k === 'voterSearch') h = CFG.voterSearchUrl;
      if (h) a.setAttribute('href', h);
    });
    $$('[data-phone]').forEach(function (el) { el.textContent = CFG.phone; });
  }

  /* ---------- Apply language ---------- */
  function applyI18n(force) {
    html.setAttribute('lang', lang);
    if (lang !== 'hi' || force) {
      $$('[data-i18n]').forEach(function (el) { setText(el, t(el.getAttribute('data-i18n'))); });
    } else {
      $$('[data-i18n]').forEach(function (el) {
        if (!el.textContent.trim()) setText(el, t(el.getAttribute('data-i18n')));
      });
    }
    $$('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':');
        if (p.length === 2) el.setAttribute(p[0].trim(), t(p[1].trim()));
      });
    });
    var tk = body.getAttribute('data-title');
    if (tk) doc.title = t('title.' + tk);
    var lb = $('#langBtn');
    if (lb) {
      var lbSpan = lb.querySelector('span');
      if (lbSpan) lbSpan.setAttribute('lang', lang === 'hi' ? 'en' : 'hi');
      lb.setAttribute('aria-label', t('common.langBtnLabel'));
      lb.setAttribute('title', t('common.langBtnLabel'));
    }
    applyLinks();
    renderers.forEach(function (fn) { fn(); });
  }
  function setLang(l) {
    lang = l === 'en' ? 'en' : 'hi';
    store.set('lang', lang);
    stopSpeech();
    applyI18n(true);
    trackEvent('language_change', { language: lang });
  }

  /* ---------- Menu ---------- */
  function setupMenu() {
    var btn = $('#menuBtn'), nav = $('#siteNav');
    if (!btn || !nav) return;
    function set(open) {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      var lab = btn.querySelector('.label');
      if (lab) {
        lab.setAttribute('data-i18n', open ? 'common.menuClose' : 'common.menu');
        lab.textContent = t(open ? 'common.menuClose' : 'common.menu');
      }
      var iconUse = btn.querySelector('use');
      if (iconUse) iconUse.setAttribute('href', open ? '#i-close' : '#i-menu');
    }
    btn.addEventListener('click', function () { set(!nav.classList.contains('open')); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { set(false); btn.focus(); }
    });
  }

  /* ---------- Large text / high contrast ---------- */
  function setupToggle(id, cls, key) {
    if (store.get(key) === '1') html.classList.add(cls);
    var b = $('#' + id);
    if (!b) return;
    function sync() { b.setAttribute('aria-pressed', html.classList.contains(cls) ? 'true' : 'false'); }
    sync();
    b.addEventListener('click', function () {
      var on = !html.classList.contains(cls);
      html.classList.toggle(cls, on);
      store.set(key, on ? '1' : '0');
      sync();
      trackEvent('accessibility_toggle', { feature: key, active: on });
    });
  }

  /* ---------- Listen (Web Speech API) ---------- */
  var stopSpeech = function () {};
  function readableText(root) {
    var out = [];
    var BLOCK = /^(P|H1|H2|H3|H4|LI|DT|DD|DIV|SECTION|SUMMARY|FIGCAPTION|LABEL|ARTICLE|UL|OL|DL|TR|FIGURE)$/;
    var SKIP = /^(BUTTON|SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT|SELECT|svg|SVG|MARK|IMG)$/;
    (function walk(node) {
      if (node.nodeType === 3) { out.push(node.nodeValue); return; }
      if (node.nodeType !== 1) return;
      var el = node;
      if (SKIP.test(el.tagName) || el.hidden || el.getAttribute('aria-hidden') === 'true' ||
          el.classList.contains('no-tts') || el.classList.contains('visually-hidden')) return;
      var cs = window.getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      var block = BLOCK.test(el.tagName);
      if (block) out.push('\n');
      if (el.tagName === 'DETAILS' && !el.open) { var s = el.querySelector('summary'); if (s) walk(s); }
      else for (var c = el.firstChild; c; c = c.nextSibling) walk(c);
      if (block) out.push('\n');
    })(root);
    return out.join('');
  }
  function chunkText(text) {
    var parts = text.replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').replace(/([।!?.:])\s+/g, '$1\n').split('\n');
    var chunks = [], cur = '';
    parts.forEach(function (p) {
      p = p.trim();
      if (!p) return;
      if ((cur + ' ' + p).length > 200 && cur) { chunks.push(cur); cur = p; }
      else cur = cur ? cur + ' ' + p : p;
    });
    if (cur) chunks.push(cur);
    return chunks;
  }
  function setupSpeech() {
    var btn = $('#ttsBtn');
    if (!btn) return;
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined') {
      btn.hidden = true;
      return;
    }
    var synth = window.speechSynthesis, speaking = false, queue = [];
    function voiceFor(l) {
      var vs = synth.getVoices() || [], want = l === 'hi' ? ['hi-in', 'hi'] : ['en-in', 'en-gb', 'en-us', 'en'];
      for (var w = 0; w < want.length; w++) {
        for (var i = 0; i < vs.length; i++) {
          if ((vs[i].lang || '').toLowerCase().replace('_', '-').indexOf(want[w]) === 0) return vs[i];
        }
      }
      return null;
    }
    function label() {
      var span = btn.querySelector('span');
      if (span) {
        span.setAttribute('data-i18n', speaking ? 'common.stop' : 'common.listen');
        span.textContent = t(speaking ? 'common.stop' : 'common.listen');
      }
      btn.setAttribute('aria-label', t(speaking ? 'common.stop' : 'common.listen'));
      btn.setAttribute('title', t(speaking ? 'common.stop' : 'common.listen'));
      btn.setAttribute('aria-pressed', speaking ? 'true' : 'false');
      var useEl = btn.querySelector('use');
      if (useEl) useEl.setAttribute('href', speaking ? '#i-stop' : '#i-speaker');
    }
    function next() {
      if (!speaking) return;
      if (!queue.length) { stop(); return; }
      var u = new window.SpeechSynthesisUtterance(queue.shift());
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      var v = voiceFor(lang);
      if (v) u.voice = v;
      u.rate = 0.95;
      u.onend = next;
      u.onerror = function (e) { if (e && (e.error === 'interrupted' || e.error === 'canceled')) return; stop(); };
      synth.speak(u);
    }
    function start() {
      synth.cancel();
      queue = chunkText(readableText($('#main')));
      speaking = true;
      label();
      next();
      trackEvent('audio_listen', { action: 'start' });
    }
    function stop() {
      speaking = false;
      queue = [];
      synth.cancel();
      label();
      trackEvent('audio_listen', { action: 'stop' });
    }
    stopSpeech = function () { if (speaking) stop(); };
    btn.addEventListener('click', function () { if (speaking) stop(); else start(); });
    synth.getVoices();
    window.addEventListener('pagehide', function () { synth.cancel(); });
  }

  /* ---------- Share this site ---------- */
  function setupShare() {
    $$('[data-share-site]').forEach(function (b) {
      b.addEventListener('click', function () {
        var url = siteUrl(), text = t('common.shareText');
        if (navigator.share) {
          trackEvent('share', { method: 'native_share' });
          navigator.share({ title: doc.title, text: text, url: url }).catch(function () { /* cancelled */ });
        } else {
          trackEvent('share', { method: 'whatsapp' });
          openExternal(waLink(text + ' ' + url));
        }
      });
    });
  }

  /* ---------- Today's Meeting (20 Oct 2026) Share & Actions ---------- */
  function setupMeeting() {
    var btn = $('#btnMeetingShare');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var text = t('meeting.shareText');
      trackEvent('meeting_share_wa', { event: 'sarv_samaj_meeting_20oct' });
      if (navigator.share) {
        navigator.share({
          title: t('meeting.title') + ' — ' + t('common.siteName'),
          text: text,
          url: 'https://manoj-acharya-anoopshahar.web.app/'
        }).catch(function () {});
      } else {
        openExternal(waLink(text));
      }
    });
  }

  /* ---------- Countdown to polling day (IST) ---------- */
  function setupCountdown() {
    var box = $('#countdown');
    if (!box) return;
    var target = Date.parse(CFG.electionDate); /* ISO string with +05:30 offset → exact instant */
    var grid = $('.countdown', box), msg = $('.cd-msg', box), sr = $('.cd-sr', box);
    function tick() {
      var now = Date.now(), diff = target - now;
      if (isNaN(target)) return;
      if (diff <= 0) {
        grid.hidden = true; sr.textContent = '';
        msg.hidden = false;
        msg.textContent = t(now < target + 86400000 ? 'home.cdToday' : 'home.cdOver');
        return;
      }
      var mins = Math.floor(diff / 60000);
      var d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60;
      $('[data-cd="d"]', box).textContent = d;
      $('[data-cd="h"]', box).textContent = h;
      $('[data-cd="m"]', box).textContent = m;
      sr.textContent = t('home.cdLabel', { d: d, h: h, m: m });
      grid.hidden = false; msg.hidden = true;
    }
    tick();
    renderers.push(tick);
    setInterval(tick, 30000);
  }

  /* ---------- JSON data (with built-in file:// fallback) ---------- */
  var FALLBACK_DATA = {
    manifesto: {
      points: [
        { n: 1, hi: { title: "ग्राउंड नंबर 2 का विकास", text: "खेल मैदान नंबर 2 को स्थायी मान्यता दिलाने, उसकी चारदीवारी (बाउंड्री वॉल) करवाने तथा खिलाड़ियों के लिए आवश्यक खेल उपकरण उपलब्ध कराने का वादा।" }, en: { title: "Development of Ground No. 2", text: "A promise to get permanent recognition for Playground No. 2, build a boundary wall around it, and provide the sports equipment that players need." } },
        { n: 2, hi: { title: "एथलेटिक्स ग्राउंड की स्थापना", text: "सरकारी स्कूल में आधुनिक एथलेटिक्स ग्राउंड का निर्माण करवाया जाएगा एवं सभी खेल सामग्रियां प्रदान की जाएंगी।" }, en: { title: "An athletics ground", text: "A modern athletics ground will be built at the government school, and all sports equipment will be provided." } },
        { n: 3, hi: { title: "नियमित स्वच्छता अभियान", text: "गाँव की समस्त गलियों एवं नालियों की समय-समय पर समुचित सफाई व्यवस्था सुनिश्चित की जाएगी।" }, en: { title: "Regular cleanliness drive", text: "Proper cleaning of all the village's lanes and drains will be ensured at regular intervals." } },
        { n: 4, hi: { title: "मार्गों का पुनर्निर्माण", text: "आबादी क्षेत्र एवं पुरानी जर्जर गलियों तथा सड़कों का पुनः निर्माण करवाया जाएगा।" }, en: { title: "Rebuilding lanes and roads", text: "Lanes and roads in the residential area, and old broken-down lanes and roads, will be rebuilt." } },
        { n: 5, hi: { title: "पंचायत भवन का मुख्य द्वार", text: "समस्त ग्रामवासियों के सहयोग से पंचायत भवन के नए मुख्य द्वार (गेट) का भव्य निर्माण कराया जाएगा।" }, en: { title: "Main gate for the Panchayat Bhawan", text: "With the support of all villagers, a grand new main gate will be built for the Panchayat Bhawan." } },
        { n: 6, hi: { title: "निःशुल्क डिजिटल लाइब्रेरी", text: "विद्यार्थियों एवं युवाओं की शिक्षा हेतु सर्वसुविधायुक्त निःशुल्क लाइब्रेरी (पुस्तकालय) का निर्माण किया जाएगा।" }, en: { title: "Free digital library", text: "A free library with all facilities will be built for the education of students and young people." } },
        { n: 7, hi: { title: "स्ट्रीट लाइट व्यवस्था", text: "गाँव के सभी वार्डों व रास्तों में रात्रिकालीन प्रकाश हेतु आधुनिक स्ट्रीट लाइटें लगवाई जाएंगी।" }, en: { title: "Street lights", text: "Modern street lights will be installed in every ward and along the village roads, so they are lit at night." } },
        { n: 8, hi: { title: "ग्राम पार्क व व्यायामशाला", text: "गाँव में सुंदर पार्क का निर्माण कराया जाएगा, जिसमें बच्चों के लिए झूले तथा बड़ों के लिए ओपन जिम (व्यायाम उपकरण) स्थापित होंगे।" }, en: { title: "Village park and gym", text: "A beautiful park will be built in the village, with swings for children and an open gym (exercise equipment) for adults." } },
        { n: 9, hi: { title: "कल्याण भूमि का कायाकल्प", text: "श्मशान/कल्याण भूमि का कायाकल्प, सौंदर्यीकरण एवं पौधरोपण का कार्य प्राथमिकता से किया जाएगा।" }, en: { title: "Renewal of the Kalyan Bhoomi", text: "Renewing and beautifying the cremation ground (Kalyan Bhoomi) and planting trees there will be done as a priority." } },
        { n: 10, hi: { title: "पारदर्शी कृषि व जनकल्याणकारी योजनाएं", text: "पंचायत में आने वाली बीज, खाद एवं अन्य सरकारी योजनाओं व सुविधाओं का वितरण बिना भेदभाव के सभी वंचितों व ग्रामवासियों को समान रूप से किया जाएगा।" }, en: { title: "Fair farm and welfare schemes", text: "Seeds, fertiliser and other government schemes and facilities that come to the Panchayat will be shared equally with all villagers and the needy, without discrimination." } },
        { n: 11, hi: { title: "मनरेगा (MNREGA) का पूर्ण क्रियान्वयन", text: "मनरेगा योजना के तहत गाँव में शत-प्रतिशत पूरा काम लाया जाएगा और श्रमिकों को पूरा मेहनताना दिलाना सुनिश्चित किया जाएगा।" }, en: { title: "Full implementation of MGNREGA (MNREGA)", text: "The village will get its full 100% share of work under the MGNREGA scheme, and workers will be sure to receive their full wages." } },
        { n: 12, hi: { title: "हर घर जल योजना", text: "'हर घर जल' की व्यवस्था हेतु आवश्यकतानुसार नए ओवरहेड वॉटर टैंक (पानी की टंकी) का निर्माण करवाया जाएगा।" }, en: { title: "Har Ghar Jal (water for every home)", text: "New overhead water tanks will be built as needed so that every home gets water under 'Har Ghar Jal'." } }
      ]
    },
    booths: {
      wards: [
        {
          ward: "1–11",
          area: { hi: "समस्त वार्ड (वार्ड 1 से 11) — ग्राम पंचायत अनूपशहर", en: "All Wards (Wards 1 to 11) — Gram Panchayat Anoopshahar" },
          booths: [{
            number: "राजकीय उच्च माध्यमिक विद्यालय (रा.उ.मा.वि.), अनूपशहर",
            name: { hi: "राजकीय उच्च माध्यमिक विद्यालय (रा उ मा वि), अनूपशहर, भादरा", en: "Govt. Senior Secondary School (GSSS), Anoopshahar, Bhadra" },
            reach: { hi: "X636+7R8, रा उ मा वि अनूपशहर, मुख्य मार्ग, ग्राम पंचायत अनूपशहर, तहसील भादरा, ज़िला हनुमानगढ़, राजस्थान – 335501 (निर्देशांक: 28.95277° N, 75.21122° E)", en: "X636+7R8, GSSS Anupshahr, Main Road, Gram Panchayat Anoopshahar, Tehsil Bhadra, District Hanumangarh, Rajasthan – 335501 (Coordinates: 28.95277° N, 75.21122° E)" },
            map: "GSSS Anupshahr, Bhadra, X636+7R8, Anupshahar, Rajasthan 335501",
            lat: 28.9527705, lng: 75.2112232
          }]
        }
      ]
    },
    issues: {
      wards: [
        {
          ward: "1–3",
          issues: [
            { hi: "हर घर तक नियमित व स्वच्छ पेयजल सप्लाई तथा नए ओवरहेड वॉटर टैंक (पानी की टंकी) का निर्माण।", en: "Regular clean drinking-water supply to every household and construction of a new overhead water tank." },
            { hi: "पुरानी जर्जर गलियों का पक्का पुनर्निर्माण और पानी निकासी के लिए पक्की नालियों की व्यवस्था।", en: "Rebuilding old worn-out lanes and constructing proper drainage channels." },
            { hi: "रात्रिकालीन रोशनी के लिए सभी चौराहों व गलियों में आधुनिक LED स्ट्रीट लाइटें लगवाना।", en: "Installing modern LED street lights across all intersections and residential lanes." }
          ]
        },
        {
          ward: "4–6",
          issues: [
            { hi: "सरकारी स्कूल (GSSS अनूपशहर) में आधुनिक एथलेटिक्स ग्राउंड और विद्यार्थियों के लिए निःशुल्क डिजिटल लाइब्रेरी की स्थापना।", en: "Setting up a modern athletics ground at GSSS Anoopshahar and a free digital library for students and youth." },
            { hi: "पंचायत भवन के भव्य मुख्य द्वार का निर्माण तथा सुंदर ग्राम पार्क व ओपन जिम की व्यवस्था।", en: "Constructing a grand main gate for the Panchayat Bhawan and developing a village park with swings and an open gym." },
            { hi: "गलियों एवं नालियों की नियमित सफ़ाई के लिए समयबद्ध स्वच्छता अभियान।", en: "Scheduled cleanliness drives for regular cleaning of village streets and drains." }
          ]
        },
        {
          ward: "7–11",
          issues: [
            { hi: "खेल मैदान (ग्राउंड नंबर 2) को स्थायी मान्यता, चारदीवारी (बाउंड्री वॉल) और खिलाड़ियों के लिए खेल सामग्री उपलब्ध कराना।", en: "Permanent recognition, boundary wall, and sports equipment for Playground (Ground No. 2)." },
            { hi: "मनरेगा (MNREGA) के तहत गाँव में शत-प्रतिशत पूरा काम और श्रमिकों को समय पर पूरा मेहनताना दिलाना।", en: "100% implementation of MGNREGA works in the village with full and timely wages for workers." },
            { hi: "कल्याण भूमि (श्मशान भूमि) का कायाकल्प व पौधरोपण तथा किसानों को बीज-खाद व जनकल्याणकारी योजनाओं का पारदर्शी वितरण।", en: "Renewal and tree plantation at Kalyan Bhoomi, and fair, transparent distribution of seeds, fertiliser and welfare schemes." }
          ]
        }
      ]
    }
  };
  function loadData(name) {
    if (dataCache[name]) return Promise.resolve(dataCache[name]);
    var p = (location.protocol === 'file:' || !window.fetch)
      ? Promise.reject(new Error('no fetch'))
      : fetch('data/' + name + '.json', { cache: 'no-cache' }).then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.json();
        });
    return p.catch(function () {
      var d = FALLBACK_DATA[name];
      if (!d) throw new Error('no data');
      return d;
    }).then(function (d) { dataCache[name] = d; return d; });
  }
  function dataRenderer(el, name, render) {
    function run() {
      var initial = dataCache[name] || FALLBACK_DATA[name];
      if (initial) {
        render(initial);
      } else {
        el.innerHTML = '<p class="small">' + esc(t('common.loading')) + '</p>';
      }
      loadData(name).then(function (d) {
        if (!initial || JSON.stringify(d) !== JSON.stringify(initial)) render(d);
      }).catch(function () {
        if (!initial) el.innerHTML = '<p class="note" role="alert">' + esc(t('common.loadError')) + '</p>';
      });
    }
    renderers.push(run);
    run();
  }

  /* ---------- Manifesto (cards / teaser / flyer list) ---------- */
  function setupManifesto() {
    $$('[data-manifesto]').forEach(function (el) {
      var limit = parseInt(el.getAttribute('data-limit'), 10) || 0;
      var variant = el.getAttribute('data-manifesto');
      var tag = el.getAttribute('data-heading') || 'h2';
      dataRenderer(el, 'manifesto', function (d) {
        var pts = limit ? d.points.slice(0, limit) : d.points;
        if (variant === 'flyer') {
          el.innerHTML = pts.map(function (p) {
            return '<li><span class="mini-badge" aria-hidden="true">' + p.n + '</span><span>' + esc(p[lang].title) + '</span></li>';
          }).join('');
          return;
        }
        el.innerHTML = pts.map(function (p) {
          var L = p[lang];
          var msg = t('brand.slogan') + '\n\n' + p.n + '. ' + L.title + ': ' + L.text + '\n\n' +
            t('manifesto.shareSuffix') + '\n' + siteUrl() + 'manifesto.html#promise-' + p.n;
          return '<li class="promise" id="promise-' + p.n + '">' +
            '<span class="badge" aria-hidden="true">' + p.n + '</span>' +
            '<div class="promise-body">' +
              '<' + tag + '><span class="visually-hidden">' + esc(t('manifesto.promiseN', { n: p.n })) + ': </span>' +
              '<span class="p-title">' + esc(L.title) + ':</span></' + tag + '>' +
              '<p class="p-text">' + esc(L.text) + '</p>' +
              '<a class="btn-share no-tts" target="_blank" rel="noopener" href="' + esc(waLink(msg)) + '" aria-label="' +
                esc(t('manifesto.share') + ' — ' + t('manifesto.promiseN', { n: p.n })) + '">' + icon('wa') +
                '<span>' + esc(t('manifesto.share')) + '</span></a>' +
            '</div></li>';
        }).join('');
      });
    });
  }

  /* ---------- Booths (exact Google Maps turn-by-turn directions) ---------- */
  function mapUrl(b) {
    if (typeof b.lat === 'number' && typeof b.lng === 'number') {
      return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(b.lat + ',' + b.lng);
    }
    var q = b.map || 'GSSS Anupshahr, Bhadra, X636+7R8, Anupshahar, Rajasthan 335501';
    return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(q);
  }
  function setupBooths() {
    var el = $('#booth-list');
    if (!el) return;
    dataRenderer(el, 'booths', function (d) {
      var wards = d.wards || [];
      var out = '';
      if (wards.length > 1) {
        out += '<nav class="ward-jump" aria-label="' + esc(t('booth.jump').replace(/:$/, '')) + '"><span>' + esc(t('booth.jump')) + '</span>' +
          wards.map(function (w) {
            return '<a class="chip" href="#ward-' + esc(w.ward) + '">' + esc(t('common.ward', { n: w.ward })) + '</a>';
          }).join('') + '</nav>';
      }
      out += wards.map(function (w) {
        return '<section class="ward-block" id="ward-' + esc(w.ward) + '">' +
          '<h2>' + icon('pin') + '<span>' + rich(w.area ? w.area[lang] : t('common.ward', { n: w.ward })) + '</span></h2>' +
          (w.booths || []).map(function (b) {
            return '<article class="card"><h3>' + rich(b.name[lang]) + '</h3>' +
              '<p class="booth-meta"><strong>' + esc(t('booth.number')) + ':</strong> ' + rich(b.number) + '</p>' +
              '<p><strong>' + esc(t('booth.reach')) + '</strong> ' + rich(b.reach[lang]) + '</p>' +
              '<a class="btn btn-outline no-tts" target="_blank" rel="noopener" href="' + esc(mapUrl(b)) + '">' + icon('map') +
              '<span>' + esc(t('booth.map')) + '</span></a></article>';
          }).join('') + '</section>';
      }).join('');
      el.innerHTML = out;
    });
  }

  /* ---------- Village issues ---------- */
  function setupIssues() {
    var el = $('#issue-list');
    if (!el) return;
    dataRenderer(el, 'issues', function (d) {
      el.innerHTML = (d.wards || []).map(function (w) {
        return '<section class="card ward-block" id="ward-' + esc(w.ward) + '"><h2>' + icon('pin') + '<span>' + esc(t('common.ward', { n: w.ward })) + '</span></h2>' +
          '<ul class="bullets">' + (w.issues || []).map(function (i) {
            return '<li>' + icon('arrow') + '<span>' + rich(i[lang]) + '</span></li>';
          }).join('') + '</ul></section>';
      }).join('');
    });
  }

  /* ---------- EVM / ballot practice demo (all 5 Sarpanch candidates) ---------- */
  var SYMBOLS = [
    '<circle cx="20" cy="20" r="14"/><circle cx="20" cy="20" r="5"/>',
    '<rect x="7" y="7" width="26" height="26" rx="3"/>',
    '<path d="M20 5 35 33H5z"/>',
    '<path d="m20 4 4.7 10 10.8 1.2-8 7.4 2.3 10.7L20 27.8l-9.8 5.5 2.3-10.7-8-7.4 10.8-1.2z"/>',
    '<path d="M20 4 36 20 20 36 4 20Z"/>'
  ];
  function symbolSvg(i) {
    return '<svg class="evm-symbol" viewBox="0 0 40 40" role="img" aria-label="' + esc(t('how.demoSymbolLabel')) +
      '" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round">' + SYMBOLS[i % SYMBOLS.length] + '</svg>';
  }
  function candName(i) {
    return t('how.demoCand' + i);
  }
  var STAMP = '<svg viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3"><circle cx="20" cy="20" r="16"/><path d="M20 6v28M6 20h28M10 10l20 20M30 10 10 30"/></svg>';
  var audioCtx = null;
  function beep() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = audioCtx || new AC();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = 'square'; o.frequency.value = 1150; g.gain.value = 0.04;
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + 0.9);
    } catch (e) { /* no audio */ }
  }
  /* ---------- Hardware Device Fingerprint + Multi-Storage 1-Vote-Per-Device Lock ---------- */
  function hashStr(str) {
    var h1 = 0xdeadbeef ^ str.length, h2 = 0x41c6ce57 ^ str.length;
    for (var i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 'fp_' + (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  }
  function getDeviceFingerprint() {
    var parts = [
      screen.width + 'x' + screen.height + 'x' + (screen.colorDepth || 24),
      window.devicePixelRatio || 1,
      navigator.hardwareConcurrency || 0,
      navigator.deviceMemory || 0,
      navigator.maxTouchPoints || 0,
      navigator.platform || ''
    ];
    try {
      parts.push(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    } catch (e) { /* ignore */ }
    try {
      var c = doc.createElement('canvas');
      c.width = 160; c.height = 36;
      var ctx = c.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(10, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('Anoopshahar-EVM-2026', 2, 12);
        parts.push(c.toDataURL().slice(-64));
      }
    } catch (e) { /* ignore */ }
    try {
      var gl = doc.createElement('canvas').getContext('webgl');
      if (gl) {
        var dbg = gl.getExtension('WEBGL_debug_renderer_info');
        if (dbg) {
          parts.push(gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || '');
          parts.push(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '');
        }
      }
    } catch (e) { /* ignore */ }
    return hashStr(parts.join('|'));
  }
  function readCookie(name) {
    try {
      var m = doc.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) { return null; }
  }
  function writeCookie(name, val) {
    try {
      doc.cookie = name + '=' + encodeURIComponent(val) + '; max-age=31536000; path=/; SameSite=Lax';
    } catch (e) { /* ignore */ }
  }
  function getLockedChoice() {
    var key = 'mka_evm_lock';
    var sVal = '';
    try { sVal = sessionStorage.getItem(key) || ''; } catch (e) { /* ignore */ }
    var v = parseInt(store.get(key) || readCookie(key) || sVal || '0', 10);
    return (v >= 1 && v <= 5) ? v : 0;
  }
  function setLockedChoice(candNo) {
    var key = 'mka_evm_lock';
    store.set(key, String(candNo));
    writeCookie(key, String(candNo));
    try { sessionStorage.setItem(key, String(candNo)); } catch (e) { /* ignore */ }
  }

  function setupDemo() {
    var root = $('#vote-demo');
    if (!root) return;
    var N = 5;
    var state = { chosen: getLockedChoice(), proxyBlocked: false };
    var stage = $('.demo-stage', root), msg = $('.demo-msg', root), warn = $('.demo-warn', root);
    function render() {
      var rows = '', i, nm, photoHtml;
      var chosenName = state.chosen ? candName(state.chosen) : '';
      for (i = 1; i <= N; i++) {
        nm = candName(i);
        var candSrc = (i === 2) ? 'assets/cand-2-danaram.jpg?v=2' : ('assets/cand-' + i + '.jpg?v=2');
        photoHtml = '<img class="evm-photo" src="' + candSrc + '" width="42" height="42" loading="lazy" decoding="async" alt="' + esc(nm) + '">';
        rows += '<div class="evm-row"><span class="evm-no">' + i + '</span>' + photoHtml +
          '<span class="evm-name">' + esc(nm) + '</span>' +
          symbolSvg(i - 1) + '<span class="lamp' + (state.chosen === i ? ' on' : '') + '" aria-hidden="true"></span>' +
          '<button type="button" class="evm-btn" data-n="' + i + '" aria-label="' + esc(t('how.demoPress', { n: i, name: nm })) + '"' +
          (state.chosen ? ' disabled' : '') + '></button></div>';
      }
      stage.innerHTML = '<div class="evm">' + rows + '</div>';
      if (state.chosen) {
        msg.textContent = '';
        msg.hidden = true;
        warn.textContent = '';
        warn.hidden = true;
      } else {
        msg.textContent = t('how.demoEvmHelp');
        msg.hidden = false;
        warn.textContent = state.proxyBlocked ? t('how.demoProxyBlocked') : '';
        warn.hidden = !warn.textContent;
      }
    }
    function recordPracticeVote(candNo) {
      /* Strict 1-vote-per-device check for database recording */
      var alreadyRecorded = store.get('mka_db_recorded') || readCookie('mka_db_recorded');
      if (alreadyRecorded) return;
      var fp = getDeviceFingerprint();
      store.set('mka_db_recorded', fp + ':' + candNo);
      writeCookie('mka_db_recorded', fp + ':' + candNo);

      try {
        var stats = JSON.parse(store.get('practiceVotes') || '{}');
        stats[candNo] = (stats[candNo] || 0) + 1;
        store.set('practiceVotes', JSON.stringify(stats));
      } catch (e) { /* ignore */ }

      /* Skip remote webhook for automated headless browsers or if URL not set */
      if (!CFG.voteWebhookUrl || !window.fetch || navigator.webdriver) return;

      /* Verify IP & block Proxy/VPN/Tor (with 2.5s timeout for slow village networks) */
      var ipPromise = new Promise(function (resolve) {
        var timer = setTimeout(function () { resolve({}); }, 2500);
        fetch('https://ipwho.is/', { cache: 'no-store' })
          .then(function (r) { return r.json(); })
          .then(function (d) { clearTimeout(timer); resolve(d || {}); })
          .catch(function () { clearTimeout(timer); resolve({}); });
      });

      ipPromise.then(function (ipInfo) {
        var sec = (ipInfo && ipInfo.security) || {};
        var isProxy = !!(sec.proxy || sec.vpn || sec.tor);
        if (isProxy) {
          state.proxyBlocked = true;
          render();
          return;
        }
        var payload = {
          timestamp: new Date().toISOString(),
          candidateNumber: candNo,
          candidateName: candName(candNo),
          mode: 'evm',
          lang: lang,
          deviceFingerprint: fp,
          ip: (ipInfo && ipInfo.ip) || 'unknown',
          isp: (ipInfo && ipInfo.connection && ipInfo.connection.isp) || '',
          isProxy: false
        };
        fetch(CFG.voteWebhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          keepalive: true,
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        }).catch(function () {});
      });
    }
    stage.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-n]') : null;
      if (!b || b.disabled || state.chosen) return;
      state.chosen = parseInt(b.getAttribute('data-n'), 10);
      setLockedChoice(state.chosen);
      beep();
      recordPracticeVote(state.chosen);
      trackEvent('practice_vote', {
        candidate_number: state.chosen,
        candidate_name: candName(state.chosen)
      });
      render();
    });
    render();
    renderers.push(render);
  }

  /* ---------- Ask form → WhatsApp ---------- */
  function setupAsk() {
    var form = $('#ask-form');
    if (!form) return;
    var err = $('.form-error', form), status = $('.form-status', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = form.elements.q.value.trim(), name = form.elements.name.value.trim(), ward = form.elements.ward.value.trim();
      if (!q) {
        err.textContent = t('ask.required'); err.hidden = false;
        form.elements.q.setAttribute('aria-invalid', 'true');
        form.elements.q.focus();
        return;
      }
      err.hidden = true;
      form.elements.q.removeAttribute('aria-invalid');
      var lines = [t('ask.msgHeader'), q];
      if (name) lines.push(t('ask.msgName') + ': ' + name);
      if (ward) lines.push(t('ask.msgWard') + ': ' + ward);
      status.textContent = t('ask.sent');
      trackEvent('ask_submit', { has_name: !!name, has_ward: !!ward });
      openExternal(waLink(lines.join('\n'), true));
    });
  }

  /* ---------- QR code (byte mode, error level M, versions 1–10) ----------
     Compact implementation of the QR Code standard (ISO/IEC 18004),
     structured after Project Nayuki's public QR generator algorithm. */
  var QR = (function () {
    var ECC = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
    var BLK = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
    function rawModules(v) {
      var r = (16 * v + 128) * v + 64;
      if (v >= 2) { var na = Math.floor(v / 7) + 2; r -= (25 * na - 10) * na - 55; if (v >= 7) r -= 36; }
      return r;
    }
    function dataCodewords(v) { return Math.floor(rawModules(v) / 8) - ECC[v] * BLK[v]; }
    function mul(x, y) {
      var z = 0;
      for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
      return z;
    }
    function divisor(deg) {
      var r = [], i, j, root = 1;
      for (i = 0; i < deg - 1; i++) r.push(0);
      r.push(1);
      for (i = 0; i < deg; i++) {
        for (j = 0; j < r.length; j++) { r[j] = mul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; }
        root = mul(root, 2);
      }
      return r;
    }
    function remainder(data, div) {
      var r = div.map(function () { return 0; });
      data.forEach(function (b) {
        var f = b ^ r.shift();
        r.push(0);
        div.forEach(function (c, i) { r[i] ^= mul(c, f); });
      });
      return r;
    }
    function utf8(str) {
      var s = unescape(encodeURIComponent(str)), out = [];
      for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
      return out;
    }
    function encode(text) {
      var bytes = utf8(text), ver, i, j;
      for (ver = 1; ver <= 10; ver++) if (4 + (ver < 10 ? 8 : 16) + bytes.length * 8 <= dataCodewords(ver) * 8) break;
      if (ver > 10) throw new Error('QR text too long');
      var bits = [];
      function push(val, len) { for (var k = len - 1; k >= 0; k--) bits.push((val >>> k) & 1); }
      push(4, 4); push(bytes.length, ver < 10 ? 8 : 16);
      bytes.forEach(function (b) { push(b, 8); });
      var cap = dataCodewords(ver) * 8;
      push(0, Math.min(4, cap - bits.length));
      push(0, (8 - bits.length % 8) % 8);
      for (var pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) push(pad, 8);
      var data = [];
      for (i = 0; i < bits.length; i += 8) { var by = 0; for (j = 0; j < 8; j++) by = (by << 1) | bits[i + j]; data.push(by); }

      var nb = BLK[ver], eccLen = ECC[ver], raw = Math.floor(rawModules(ver) / 8);
      var nShort = nb - raw % nb, shortLen = Math.floor(raw / nb), div = divisor(eccLen), blocks = [], k = 0;
      for (i = 0; i < nb; i++) {
        var dat = data.slice(k, k + shortLen - eccLen + (i < nShort ? 0 : 1));
        k += dat.length;
        var ecc = remainder(dat, div);
        if (i < nShort) dat.push(0);
        blocks.push(dat.concat(ecc));
      }
      var all = [];
      for (i = 0; i < blocks[0].length; i++) {
        for (j = 0; j < blocks.length; j++) if (i !== shortLen - eccLen || j >= nShort) all.push(blocks[j][i]);
      }

      var size = ver * 4 + 17, mod = [], fn = [];
      for (i = 0; i < size; i++) { mod.push([]); fn.push([]); for (j = 0; j < size; j++) { mod[i].push(false); fn[i].push(false); } }
      function setF(x, y, dark) { mod[y][x] = dark; fn[y][x] = true; }
      for (i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
      function finder(cx, cy) {
        for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
          var d = Math.max(Math.abs(dx), Math.abs(dy)), x = cx + dx, y = cy + dy;
          if (x >= 0 && x < size && y >= 0 && y < size) setF(x, y, d !== 2 && d !== 4);
        }
      }
      finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
      if (ver > 1) {
        var na = Math.floor(ver / 7) + 2, step = Math.floor((ver * 8 + na * 3 + 5) / (na * 4 - 4)) * 2, al = [6];
        for (var pos = size - 7; al.length < na; pos -= step) al.splice(1, 0, pos);
        for (i = 0; i < na; i++) for (j = 0; j < na; j++) {
          if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue;
          for (var ay = -2; ay <= 2; ay++) for (var ax = -2; ax <= 2; ax++) setF(al[i] + ax, al[j] + ay, Math.max(Math.abs(ax), Math.abs(ay)) !== 1);
        }
      }
      function drawFormat(mask) {
        var d = mask, rem = d, q; /* level M = 00 */
        for (q = 0; q < 10; q++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
        var fb = ((d << 10) | rem) ^ 0x5412;
        function g(n) { return ((fb >>> n) & 1) !== 0; }
        for (q = 0; q <= 5; q++) setF(8, q, g(q));
        setF(8, 7, g(6)); setF(8, 8, g(7)); setF(7, 8, g(8));
        for (q = 9; q < 15; q++) setF(14 - q, 8, g(q));
        for (q = 0; q < 8; q++) setF(size - 1 - q, 8, g(q));
        for (q = 8; q < 15; q++) setF(8, size - 15 + q, g(q));
        setF(8, size - 8, true);
      }
      drawFormat(0);
      if (ver >= 7) {
        var vr = ver;
        for (i = 0; i < 12; i++) vr = (vr << 1) ^ ((vr >>> 11) * 0x1F25);
        var vb = (ver << 12) | vr;
        for (i = 0; i < 18; i++) {
          var bt = ((vb >>> i) & 1) !== 0, a = size - 11 + i % 3, b = Math.floor(i / 3);
          setF(a, b, bt); setF(b, a, bt);
        }
      }
      var bi = 0;
      for (var right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (var vert = 0; vert < size; vert++) {
          for (j = 0; j < 2; j++) {
            var x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
            if (!fn[y][x] && bi < all.length * 8) { mod[y][x] = ((all[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0; bi++; }
          }
        }
      }
      function applyMask(m) {
        for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++) {
          if (fn[yy][xx]) continue;
          var inv;
          switch (m) {
            case 0: inv = (xx + yy) % 2 === 0; break;
            case 1: inv = yy % 2 === 0; break;
            case 2: inv = xx % 3 === 0; break;
            case 3: inv = (xx + yy) % 3 === 0; break;
            case 4: inv = (Math.floor(xx / 3) + Math.floor(yy / 2)) % 2 === 0; break;
            case 5: inv = xx * yy % 2 + xx * yy % 3 === 0; break;
            case 6: inv = (xx * yy % 2 + xx * yy % 3) % 2 === 0; break;
            default: inv = ((xx + yy) % 2 + xx * yy % 3) % 2 === 0;
          }
          if (inv) mod[yy][xx] = !mod[yy][xx];
        }
      }
      function penalty() {
        var p = 0, yy, xx, run, dark = 0;
        function line(get) {
          var s = '0000';
          for (var n = 0; n < size; n++) s += get(n) ? '1' : '0';
          s += '0000';
          var idx = -1;
          while ((idx = s.indexOf('1011101', idx + 1)) !== -1) {
            if (s.substr(idx - 4, 4) === '0000' || s.substr(idx + 7, 4) === '0000') p += 40;
          }
        }
        for (yy = 0; yy < size; yy++) {
          run = 1;
          for (xx = 1; xx < size; xx++) {
            if (mod[yy][xx] === mod[yy][xx - 1]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1;
          }
          run = 1;
          for (xx = 1; xx < size; xx++) {
            if (mod[xx][yy] === mod[xx - 1][yy]) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1;
          }
          (function (r) { line(function (n) { return mod[r][n]; }); line(function (n) { return mod[n][r]; }); })(yy);
        }
        for (yy = 0; yy < size - 1; yy++) for (xx = 0; xx < size - 1; xx++) {
          var c = mod[yy][xx];
          if (c === mod[yy][xx + 1] && c === mod[yy + 1][xx] && c === mod[yy + 1][xx + 1]) p += 3;
        }
        for (yy = 0; yy < size; yy++) for (xx = 0; xx < size; xx++) if (mod[yy][xx]) dark++;
        var total = size * size;
        p += Math.max(0, Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
        return p;
      }
      var best = 0, bestP = Infinity;
      for (var m = 0; m < 8; m++) {
        applyMask(m); drawFormat(m);
        var pen = penalty();
        if (pen < bestP) { bestP = pen; best = m; }
        applyMask(m);
      }
      applyMask(best); drawFormat(best);
      return { size: size, modules: mod };
    }
    function toSvg(text, label) {
      var q = encode(text), b = 4, n = q.size + b * 2, d = '';
      for (var y = 0; y < q.size; y++) for (var x = 0; x < q.size; x++) {
        if (q.modules[y][x]) d += 'M' + (x + b) + ',' + (y + b) + 'h1v1h-1z';
      }
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + ' ' + n + '" role="img" aria-label="' + esc(label) +
        '" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#000"/></svg>';
    }
    return { toSvg: toSvg };
  })();

  function setupQr() {
    var el = $('#qr');
    if (!el) return;
    var urlEl = $('.qr-url'), note = $('.qr-note');
    function renderQr() {
      var url = siteUrl();
      try { el.innerHTML = QR.toSvg(url, t('flyer.qrAlt')); } catch (e) { el.innerHTML = ''; }
      if (urlEl) {
        urlEl.textContent = url;
        if (urlEl.tagName === 'A') {
          urlEl.setAttribute('href', /^file:/i.test(url) ? 'index.html' : url);
        }
      }
      if (note) note.hidden = !!CFG.siteUrl;
    }
    renderQr();
    renderers.push(renderQr);
  }

  /* ---------- Misc ---------- */
  function setupPrint() {
    $$('[data-print]').forEach(function (b) {
      b.addEventListener('click', function () {
        trackEvent('print_flyer');
        window.print();
      });
    });
  }
  function registerSW() {
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      window.addEventListener('load', function () {
        if (window.caches) {
          caches.keys().then(function (keys) {
            keys.forEach(function (k) {
              if (k !== 'mka-native-v11') caches.delete(k);
            });
          }).catch(function () {});
        }
        navigator.serviceWorker.register('sw.js').then(function (reg) {
          reg.update();
        }).catch(function () {});
      });
    }
  }

  /* ==========================================================================
     App-Shell SPA Router (0ms Perceived Latency & Zero Reload Flashes)
     ========================================================================== */
  var pageCache = new Map();
  var PRIMARY_PAGES = [
    'index.html',
    'how-to-vote.html',
    'check-name.html',
    'find-booth.html',
    'manifesto.html',
    'about.html',
    'contact.html',
    'sarpanch-role.html',
    'faq.html',
    'village-issues.html',
    'ask.html',
    'flyer.html'
  ];

  function isInternalLink(a) {
    if (!a || !a.getAttribute) return false;
    var href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('javascript:')) return false;
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (href.indexOf(location.origin) !== 0) return false;
    }
    if (a.hasAttribute('target') && a.getAttribute('target') !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    if (location.protocol === 'file:') return false;

    // Only route internal HTML pages or site root, bypass static files (images, PDFs, media)
    var cleanPath = href.split('#')[0].split('?')[0];
    if (/\.(jpg|jpeg|png|gif|svg|webp|ico|pdf|json|zip|txt)$/i.test(cleanPath)) return false;
    return true;
  }

  function prefetchPage(url) {
    var pageName = getCleanPageName(url);
    if (!pageName || pageCache.has(pageName) || location.protocol === 'file:') return;
    fetch(pageName, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function (htmlStr) {
        pageCache.set(pageName, htmlStr);
      })
      .catch(function () {});
  }

  function updateNavHighlight(pageName) {
    var navLinks = $$('.site-nav a, .bottom-tab, .desktop-nav-link, .btn-manifesto-nav');
    navLinks.forEach(function (link) {
      var linkPage = getCleanPageName(link.getAttribute('href'));
      if (linkPage === pageName) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function reinitPageModules() {
    stopSpeech();
    renderers = [];
    setupCountdown();
    setupManifesto();
    setupBooths();
    setupIssues();
    setupDemo();
    setupAsk();
    setupMeeting();
    setupQr();
    setupPrint();
    applyI18n(true);
    applyLinks();
  }

  function navigateTo(targetUrl, pushState) {
    var pageName = getCleanPageName(targetUrl);
    var hashIndex = targetUrl.indexOf('#');
    var targetHash = hashIndex !== -1 ? targetUrl.slice(hashIndex) : '';

    updateNavHighlight(pageName);

    var nav = $('#siteNav'), menuBtn = $('#menuBtn');
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      if (menuBtn) {
        menuBtn.setAttribute('aria-expanded', 'false');
        var lab = menuBtn.querySelector('.label');
        if (lab) lab.textContent = t('common.menu');
        var iconUse = menuBtn.querySelector('use');
        if (iconUse) iconUse.setAttribute('href', '#i-menu');
      }
    }

    function swapContent(htmlText) {
      var parser = new DOMParser();
      var newDoc = parser.parseFromString(htmlText, 'text/html');
      var newMain = newDoc.querySelector('main');
      var oldMain = $('main');

      if (!newMain || !oldMain) {
        location.href = targetUrl;
        return;
      }

      function doSwap() {
        oldMain.replaceWith(newMain);
        doc.title = newDoc.title;
        var newPage = newDoc.body.getAttribute('data-page') || pageName;
        var newTitle = newDoc.body.getAttribute('data-title') || '';
        body.setAttribute('data-page', newPage);
        body.setAttribute('data-title', newTitle);

        if (pushState) {
          history.pushState({ page: pageName, url: targetUrl }, '', targetUrl);
        }

        reinitPageModules();
        trackPageView(pageName, newDoc.title);

        if (targetHash) {
          var targetEl = doc.querySelector(targetHash);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
          else window.scrollTo(0, 0);
        } else {
          window.scrollTo(0, 0);
        }
      }

      if (doc.startViewTransition) {
        doc.startViewTransition(doSwap);
      } else {
        doSwap();
      }
    }

    var cached = pageCache.get(pageName);
    if (cached) {
      swapContent(cached);
    } else {
      fetch(pageName, { cache: 'no-cache' })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          return r.text();
        })
        .then(function (htmlStr) {
          pageCache.set(pageName, htmlStr);
          swapContent(htmlStr);
        })
        .catch(function () {
          location.href = targetUrl;
        });
    }
  }

  function setupRouter() {
    if (location.protocol === 'file:') return;

    var initialPage = getCleanPageName(location.pathname);
    fetch(initialPage, { cache: 'no-cache' })
      .then(function (r) { if (r.ok) return r.text(); })
      .then(function (htmlStr) { if (htmlStr) pageCache.set(initialPage, htmlStr); })
      .catch(function () {});

    var warmCache = function () {
      PRIMARY_PAGES.forEach(function (pg) {
        if (pg !== initialPage) prefetchPage(pg);
      });
    };
    if (window.requestIdleCallback) window.requestIdleCallback(warmCache);
    else setTimeout(warmCache, 600);

    function onTouchOrHover(e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a || !isInternalLink(a)) return;
      var href = a.getAttribute('href');
      prefetchPage(href);
    }
    doc.addEventListener('pointerdown', onTouchOrHover, { passive: true });
    doc.addEventListener('touchstart', onTouchOrHover, { passive: true });
    doc.addEventListener('mouseenter', onTouchOrHover, { passive: true, capture: true });

    doc.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a || !isInternalLink(a)) return;

      var href = a.getAttribute('href');
      var pageName = getCleanPageName(href);
      var currentPage = getCleanPageName(location.pathname);

      var hashIndex = href.indexOf('#');
      var hash = hashIndex !== -1 ? href.slice(hashIndex) : '';

      if (pageName === currentPage && hash) {
        var el = doc.querySelector(hash);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth' });
          history.pushState({ page: currentPage, url: href }, '', href);
        }
        return;
      }

      e.preventDefault();
      navigateTo(href, true);
    });

    /* Track civic outbound & helpline actions (delegated) */
    doc.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('a, button') : null;
      if (!el) return;
      var dl = el.getAttribute('data-link');
      if (dl === 'tel') {
        trackEvent('helpline_click', { channel: 'phone' });
      } else if (dl === 'wa' || dl === 'wa-prefill') {
        trackEvent('helpline_click', { channel: 'whatsapp' });
      } else if (dl === 'sec') {
        trackEvent('outbound_click', { destination: 'sec_website' });
      } else if (dl === 'voterSearch') {
        trackEvent('outbound_click', { destination: 'sec_voter_search' });
      } else {
        var href = el.getAttribute('href') || '';
        if (href.indexOf('google.com/maps') !== -1) {
          trackEvent('booth_directions_click', { destination: 'google_maps' });
        }
      }
    }, { capture: true, passive: true });

    window.addEventListener('popstate', function () {
      var page = getCleanPageName(location.pathname);
      navigateTo(page + location.hash, false);
    });
  }

  /* ---------- Start ---------- */
  injectSprite();
  buildChrome();
  var lb = $('#langBtn');
  if (lb) lb.addEventListener('click', function () { setLang(lang === 'hi' ? 'en' : 'hi'); });
  setupMenu();
  setupToggle('textBtn', 'large-text', 'largeText');
  setupToggle('hcBtn', 'hc', 'contrast');
  setupSpeech();
  setupShare();
  setupCountdown();
  setupManifesto();
  setupBooths();
  setupIssues();
  setupDemo();
  setupAsk();
  setupMeeting();
  setupQr();
  setupPrint();
  applyI18n();
  html.classList.remove('js-pending');
  registerSW();
  setupRouter();
  initAnalytics();

  /* Exposed only for automated checks / debugging */
  window.SiteApp = {
    t: t,
    setLang: setLang,
    qrSvg: QR.toSvg,
    siteUrl: siteUrl,
    initAnalytics: initAnalytics,
    trackPageView: trackPageView,
    trackEvent: trackEvent
  };
})();
