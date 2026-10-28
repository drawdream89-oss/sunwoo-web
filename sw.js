/* 선우특수소재 sunwoosm.com 공통 기능 — 이 파일을 고치면 사이트 전체에 반영됩니다 */

/* ===== 0. 페이지 자동 최신화 =====
   아임웹 코드 위젯에 붙여둔 글(검색엔진용)을 GitHub의 최신본(pages/*.html)으로 방문자 화면에서 교체.
   위젯과 최신본의 data-v가 같으면 아무것도 하지 않음. 실패하면 위젯 내용 그대로 둠. */
(function () {
  'use strict';
  var BASE = 'https://drawdream89-oss.github.io/sunwoo-web/pages/';
  var MAP = { '/': 'main', '/34': 'press', '/75': 'extrusion', '/36': 'materials', '/68': 'oring', '/71': 'oring-as',
    '/72': 'oring-pgsv', '/24': 'company', '/25': 'history', '/as': 'as', '/23': 'consult' };
  var path = (location.pathname.replace(/\/+$/, '') || '/');
  var name = MAP[path];
  if (!name || /^\/admin/.test(path)) return;
  var KEY = 'swpg:' + name;
  function root() { return document.querySelector('.sw.sw-pg'); }
  function parse(html) {
    var box = document.createElement('div'); box.innerHTML = html;
    var r = box.querySelector('.sw.sw-pg[data-v]');
    return r && r.getAttribute('data-page') === name ? r : null;
  }
  function swap(html) {
    var cur = root(), nu = parse(html);
    if (!cur || !nu || cur.getAttribute('data-v') === nu.getAttribute('data-v')) return false;
    cur.parentNode.replaceChild(nu, cur);
    try { document.dispatchEvent(new CustomEvent('sw:swapped')); } catch (e) {}
    return true;
  }
  function run() {
    if (!root()) return;
    try { var c = localStorage.getItem(KEY); if (c) swap(c); } catch (e) {}
    fetch(BASE + name + '.html', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (html) {
      if (!html || !parse(html)) return;
      try { localStorage.setItem(KEY, html); } catch (e) {}
      swap(html);
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
(function () {
  'use strict';

  /* 1. 오링 규격표 검색 (.sw-or) */
  function initSpecSearch(root) {
    if (root.__swSearch) return;
    var inp = root.querySelector('.sw-find input');
    if (!inp) return;
    root.__swSearch = true;
    var cnt = root.querySelector('.sw-count');
    var empty = root.querySelector('.sw-empty');
    var rows = [].slice.call(root.querySelectorAll('.sw-st tbody tr:not(.sw-grp)'));
    function norm(s) { return String(s).toUpperCase().replace(/[\s-]/g, ''); }
    function run() {
      var q = norm(inp.value), n = 0;
      rows.forEach(function (r) {
        var k = (r.getAttribute('data-k') || '').split(' ');
        var ok = !q || k.some(function (t) { return norm(t).indexOf(q) === 0; }) || norm(k[0]).indexOf(q) > -1;
        r.hidden = !ok;
        if (ok) n++;
      });
      [].forEach.call(root.querySelectorAll('.sw-st tbody'), function (b) {
        var g = b.querySelector('.sw-grp');
        if (g) g.hidden = !!q && !b.querySelector('tr:not(.sw-grp):not([hidden])');
      });
      if (cnt) cnt.textContent = q ? n + '개 찾음' : rows.length + '개 규격';
      if (empty) empty.hidden = n > 0;
    }
    inp.addEventListener('input', run);
    run();
  }

  /* 2. 하단 정보에 '관리자' 로그인 링크 (선우 요청: 게시물 올리기 쉽게) */
  function addAdminLink() {
    var foot = document.getElementById('s202207152d584eee8d8ce');
    if (!foot || foot.querySelector('.sw-admin')) return;
    var els = foot.querySelectorAll('p, span, div');
    var target = null;
    for (var i = 0; i < els.length; i++) {
      if (/COPYRIGHT/i.test(els[i].textContent) && !els[i].querySelector('p, div')) { target = els[i]; }
    }
    if (!target) return;
    var a = document.createElement('a');
    a.className = 'sw-admin';
    a.href = '/login?back_url=' + btoa(location.pathname || '/');
    a.textContent = '관리자';
    target.appendChild(document.createTextNode('  ·  '));
    target.appendChild(a);
  }

  /* 2-1. 하단 정보 새 디자인 (아임웹 하단은 숨기고 같은 정보를 정리해서 표시) */
  function buildFooter() {
    var sec = document.getElementById('s202207152d584eee8d8ce');
    if (!sec || sec.querySelector('.sw-foot')) return;
    var img = sec.querySelector('img'); var logo = img ? img.getAttribute('src') : '';
    var U = 'https://www.sunwoosm.com';
    function col(t, items) { return '<div class="sw-foot__col"><b>' + t + '</b><ul>' + items.map(function (x) { return '<li><a href="' + U + x[1] + '">' + x[0] + '</a></li>'; }).join('') + '</ul></div>'; }
    var box = document.createElement('div');
    box.className = 'sw sw-foot';
    box.innerHTML = '<div class="sw-inner">' +
      '<div class="sw-foot__top">' +
        '<div class="sw-foot__brand">' + (logo ? '<img src="' + logo + '" alt="선우특수소재" width="150" height="40">' : '<strong>선우특수소재</strong>') +
          '<p>고무·실리콘 부품 개발과 제조<br>압축성형, 압출성형, 자재 공급, A/S</p></div>' +
        col('회사소개', [['회사개요', '/24'], ['회사연혁', '/25'], ['인증&amp;특허', '/26'], ['공지·소식', '/27'], ['A/S 안내', '/as']]) +
        col('제품', [['압축성형', '/34'], ['압출성형', '/75'], ['고무·플라스틱 자재', '/36'], ['오링 규격표', '/71'], ['제품 갤러리', '/65']]) +
        col('고객지원', [['상담 신청·오시는 길', '/23'], ['기술자료실', '/22'], ['자주 묻는 질문', '/40'], ['전자카탈로그', '/41'], ['제품구매', '/66']]) +
        '<div class="sw-foot__contact"><span>상담 문의</span><a class="tel" href="tel:0313141653">031-314-1653</a>' +
          '<p>평일 09:00–18:00, 주말·공휴일 휴무<br><a href="mailto:sunwoosm@naver.com">sunwoosm@naver.com</a><br>팩스 031-314-1174</p></div>' +
      '</div>' +
      '<div class="sw-foot__bottom"><p>선우특수소재 <i></i> 대표자 최주형, 구양서, 박재우 <i></i> 사업자등록번호 741-29-00704<br>경기도 시흥시 포도원로116번길 25 프라임캐슬지식산업센터 212호</p>' +
        '<p>© 2019 선우특수소재 <a class="sw-admin" href="/login?back_url=' + btoa(location.pathname || '/') + '">관리자</a></p></div>' +
    '</div>';
    sec.appendChild(box);
    sec.classList.add('sw-foot-on');
  }

  function init() {
    [].forEach.call(document.querySelectorAll('.sw-or'), initSpecSearch);
    try { buildFooter(); } catch (e) {}
    addAdminLink();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  /* 아임웹은 위젯을 늦게 그리는 경우가 있어 한 번 더 */
  window.addEventListener('load', init);
  document.addEventListener('sw:swapped', init);
})();

/* ===== 3. 상담 신청 (전용 페이지 폼 + PC 하단 상담바 + 모바일 상담 버튼) ===== */
(function () {
  'use strict';
  var CFG = {
    endpoint: 'https://script.google.com/macros/s/AKfycbySHLmf9h3sQspf4OSL3eDVVrCRLjP67HHHBkJ-hMYC5ze_8HJNGfz-LOb39WkwBXVu/exec',                 /* Apps Script 웹 앱 URL (.../exec) — 배포 후 입력 */
    tel: '031-314-1653',
    mail: 'sunwoosm@naver.com',
    page: '/23',                  /* 상담 신청 페이지 (Contact Us) */
    hideOn: ['/admin', '/login', '/site_join', '/shop_payment', '/shop_cart', '/shop_view', '/66', '/43', '/23']
  };
  var TYPES = ['부품 제작', '소재 상담', '압출성형', '압축(프레스)성형', '코팅·후가공', '에어패킹·A/S', '기타'];
  var loadedAt = Date.now();

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function radios(name, list) {
    return '<div class="sw-cs-radios" role="radiogroup">' + list.map(function (v, i) {
      return '<label><input type="radio" name="' + name + '" value="' + esc(v) + '"' + (i === list.length - 1 ? '' : '') + '><span>' + esc(v) + '</span></label>';
    }).join('') + '</div>';
  }
  function fullForm(id) {
    return '<form class="sw-cs-form" novalidate data-via="상담 페이지">' +
      '<div class="sw-cs-row"><label class="sw-cs-f sw-cs-f--full"><span>문의 유형 <i>*</i></span><select name="type" required><option value="">선택해 주세요</option>' +
      TYPES.map(function (t) { return '<option>' + esc(t) + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="sw-cs-row sw-cs-row--2"><div class="sw-cs-f"><span>도면 여부</span>' + radios('drawing', ['도면 있음', '샘플만 있음', '없음']) + '</div>' +
      '<div class="sw-cs-f"><span>금형 보유</span>' + radios('mold', ['보유', '미보유', '모름']) + '</div></div>' +
      '<div class="sw-cs-row sw-cs-row--2"><label class="sw-cs-f"><span>회사명</span><input name="company" autocomplete="organization" maxlength="60"></label>' +
      '<label class="sw-cs-f"><span>담당자 <i>*</i></span><input name="name" autocomplete="name" maxlength="30" required></label></div>' +
      '<div class="sw-cs-row sw-cs-row--2"><label class="sw-cs-f"><span>연락처 <i>*</i></span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="010-0000-0000" required></label>' +
      '<label class="sw-cs-f"><span>이메일</span><input name="email" type="email" inputmode="email" autocomplete="email" maxlength="80" placeholder="회신받을 메일 (선택)"></label></div>' +
      '<label class="sw-cs-f sw-cs-f--full"><span>문의 내용</span><textarea name="memo" rows="5" maxlength="2000" placeholder="제품 용도, 사용 환경(온도·유체), 예상 수량, 희망 납기를 적어 주시면 더 정확히 안내드립니다."></textarea></label>' +
      '<p class="sw-cs-hint">도면·사진은 <a href="mailto:' + CFG.mail + '">' + CFG.mail + '</a> 로 보내 주세요. 신청 시 남긴 회사명·담당자명을 함께 적어 주시면 바로 연결됩니다.</p>' +
      '<label class="sw-cs-agree"><input type="checkbox" name="agree"><span>상담 회신을 위한 개인정보(이름·연락처·이메일) 수집·이용에 동의합니다. 상담 완료 후 1년간 보관 후 파기합니다.</span></label>' +
      '<input class="sw-cs-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<div class="sw-cs-actions"><button type="submit" class="sw-btn sw-btn--solid sw-cs-submit">상담 신청하기</button>' +
      '<span class="sw-cs-or">또는 전화 <a href="tel:' + CFG.tel.replace(/\D/g, '') + '">' + CFG.tel + '</a></span></div>' +
      '<p class="sw-cs-msg" role="status" aria-live="polite"></p></form>';
  }

  function send(form, extra, done) {
    var g = function (n) { var el = form.elements.namedItem(n); if (!el) return ''; if (el.length && !el.tagName) { for (var i = 0; i < el.length; i++) if (el[i].checked) return el[i].value; return ''; } return el.value.trim(); };
    var msg = form.querySelector('.sw-cs-msg');
    var say = function (t, err) { if (msg) { msg.textContent = t; msg.classList.toggle('is-err', !!err); } };
    var name = g('name'), phone = g('phone'), email = g('email');
    if (form.elements.namedItem('type') && form.elements.namedItem('type').required && !g('type')) { say('문의 유형을 선택해 주세요.', 1); form.elements.namedItem('type').focus(); return; }
    if (!name) { say('담당자 이름을 입력해 주세요.', 1); form.elements.namedItem('name').focus(); return; }
    if (phone.replace(/\D/g, '').length < 9) { say('회신받으실 연락처를 정확히 입력해 주세요.', 1); form.elements.namedItem('phone').focus(); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { say('이메일 형식을 확인해 주세요. 비워두셔도 됩니다.', 1); form.elements.namedItem('email').focus(); return; }
    var agree = form.elements.namedItem('agree'); if (agree && !agree.checked) { say('개인정보 수집·이용에 동의해 주세요.', 1); return; }
    if (g('website') || Date.now() - loadedAt < 2500) return;
    if (!CFG.endpoint) { say('지금은 온라인 접수 준비 중입니다. ' + CFG.tel + ' 또는 ' + CFG.mail + ' 로 연락 주세요.', 1); return; }
    var btn = form.querySelector('[type=submit]'); var label = btn.textContent; btn.disabled = true; btn.textContent = '전송 중…'; say('');
    var body = new URLSearchParams({ via: form.getAttribute('data-via') || '', type: g('type') || '빠른 상담', company: g('company'), name: name, phone: phone, email: email,
      drawing: g('drawing'), mold: g('mold'), memo: g('memo'), page: location.href, website: g('website') });
    fetch(CFG.endpoint, { method: 'POST', body: body }).then(function (r) { return r.json(); }).then(function (res) {
      if (!res.ok) throw new Error(res.error || 'fail');
      form.reset(); say('상담 신청이 접수되었습니다. 확인 후 빠르게 연락드리겠습니다.'); if (done) done();
    }).catch(function () { say('전송에 실패했습니다. 잠시 후 다시 시도하시거나 ' + CFG.tel + ' 으로 연락 주세요.', 1); })
      .then(function () { btn.disabled = false; btn.textContent = label; });
  }
  function bind(form, done) { if (form.__sw) return; form.__sw = 1; form.addEventListener('submit', function (e) { e.preventDefault(); send(form, null, done); }); }

  function hidden() { var p = location.pathname; return CFG.hideOn.some(function (h) { return h === '/' ? p === '/' : (p === h || p.indexOf(h + '/') === 0 || (h.length > 3 && p.indexOf(h) === 0)); }); }

  function mountPage() {
    var box = document.getElementById('sw-consult'); if (!box || box.__sw) return; box.__sw = 1;
    box.innerHTML = fullForm(); bind(box.querySelector('form'));
  }

  function mountBar() {
    if (!CFG.endpoint || hidden() || document.getElementById('sw-cbar')) return; /* 접수 주소 연결 전에는 상담바를 띄우지 않음 */
    try { if (sessionStorage.getItem('sw-cbar-off')) return; } catch (e) {}
    var bar = document.createElement('div'); bar.id = 'sw-cbar'; bar.className = 'sw';
    bar.innerHTML = '<div class="sw-cbar__in">' +
      '<a class="sw-cbar__tel" href="tel:' + CFG.tel.replace(/\D/g, '') + '"><small>상담 문의</small><b>' + CFG.tel + '</b></a>' +
      '<form class="sw-cbar__form" novalidate data-via="하단 상담바"><strong class="sw-cbar__t">빠른 상담 신청</strong>' +
      '<select name="type" aria-label="문의 유형"><option value="">문의 유형</option>' + TYPES.map(function (t) { return '<option>' + esc(t) + '</option>'; }).join('') + '</select>' +
      '<input name="name" placeholder="담당자 / 회사명" aria-label="담당자 또는 회사명" maxlength="30" autocomplete="name">' +
      '<input name="phone" type="tel" inputmode="tel" placeholder="연락처" aria-label="연락처" maxlength="20" autocomplete="tel">' +
      '<label class="sw-cbar__agree"><input type="checkbox" name="agree"><span>개인정보 수집 동의</span></label>' +
      '<input class="sw-cs-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<button type="submit" class="sw-btn sw-btn--solid">상담 신청</button>' +
      '<a class="sw-cbar__more" href="' + CFG.page + '">자세히 문의하기</a>' +
      '<p class="sw-cs-msg" role="status" aria-live="polite"></p></form>' +
      '<button type="button" class="sw-cbar__x" aria-label="상담바 닫기">×</button></div>' +
      '<button type="button" class="sw-cfab" aria-haspopup="dialog">상담 신청</button>' +
      '<div class="sw-cmodal" role="dialog" aria-modal="true" aria-label="상담 신청" hidden><div class="sw-cmodal__box">' +
      '<div class="sw-cmodal__head"><b>상담 신청</b><button type="button" class="sw-cmodal__x" aria-label="닫기">×</button></div>' + fullForm() + '</div></div>';
    document.body.appendChild(bar); document.body.classList.add('sw-has-cbar');
    var f1 = bar.querySelector('.sw-cbar__form'); bind(f1);
    var modal = bar.querySelector('.sw-cmodal'); var mf = modal.querySelector('form'); mf.setAttribute('data-via', '모바일 상담 버튼'); bind(mf);
    bar.querySelector('.sw-cbar__x').addEventListener('click', function () { bar.classList.add('is-off'); document.body.classList.remove('sw-has-cbar'); try { sessionStorage.setItem('sw-cbar-off', '1'); } catch (e) {} });
    bar.querySelector('.sw-cfab').addEventListener('click', function () { modal.hidden = false; document.documentElement.classList.add('sw-noscroll'); });
    var close = function () { modal.hidden = true; document.documentElement.classList.remove('sw-noscroll'); };
    modal.querySelector('.sw-cmodal__x').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
  }

  function init() { mountPage(); mountBar(); }
  document.addEventListener('sw:swapped', mountPage);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('load', init);
})();

/* ===== 4. 움직임 (10/28) =====
   스크롤하면 아래에서 살짝 올라오며 나타남 · 첫 화면 등장 · 카드 호버(호버는 sw.css).
   '동작 줄이기' 설정 사용자는 전부 끔. 스크립트가 안 돌면 모든 내용이 그냥 보임. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var html = document.documentElement;
  html.classList.add('sw-anim');
  var SEL = [
    '.sw-h2', '.sw-band .sw-lead', '.sw-cat', '.sw-product', '.sw-ind', '.sw-eq li', '.sw-floor__grid li', '.sw-floor__head > *',
    '.sw-svc > li', '.sw-steps > li', '.sw-proofs > li', '.sw-ways > li', '.sw-mats > li', '.sw-flow-wrap > .sw-photo',
    '.sw-table', '.sw-fold', '.sw-close__in', '.sw-silicell', '.sw-cols > div', '.sw-note', '.sw-flec', '.sw-cards > *', '.sw-std__grid > li', '.sw-std__sub'
  ].join(',');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; el.classList.add('is-in'); io.unobserve(el);
      var d = parseInt(el.style.getPropertyValue('--rv-d'), 10) || 0;
      setTimeout(function () { el.removeAttribute('data-rv'); el.classList.remove('is-in'); el.style.removeProperty('--rv-d'); }, 800 + d);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  function prep() {
    var root = document.querySelector('.sw.sw-pg'); if (!root) return;
    var vh = window.innerHeight || 800;
    [].forEach.call(root.querySelectorAll(SEL), function (el) {
      if (el.hasAttribute('data-rv') || el.closest('.sw-hero, .sw-mhero, .sw-ct__hero')) return;
      if (el.getBoundingClientRect().top < vh * 0.92) return; // 첫 화면에 이미 보이는 것은 그대로
      var sib = el.parentNode ? [].filter.call(el.parentNode.children, function (c) { return c.matches(SEL); }) : [];
      var i = Math.max(0, sib.indexOf(el));
      el.setAttribute('data-rv', '');
      el.style.setProperty('--rv-d', Math.min(i, 5) * 70 + 'ms');
      io.observe(el);
    });
  }
  function intro() {
    var root = document.querySelector('.sw.sw-pg'); if (!root || root.__swIntro) return;
    root.__swIntro = 1; root.classList.add('sw-intro');
  }
  function init() { intro(); prep(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  document.addEventListener('sw:swapped', function () { setTimeout(prep, 30); });
  window.addEventListener('load', function () { setTimeout(prep, 200); });
})();
