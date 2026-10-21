/* 선우특수소재 sunwoosm.com 공통 기능 — 이 파일을 고치면 사이트 전체에 반영됩니다 */
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

  function init() {
    [].forEach.call(document.querySelectorAll('.sw-or'), initSpecSearch);
    addAdminLink();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  /* 아임웹은 위젯을 늦게 그리는 경우가 있어 한 번 더 */
  window.addEventListener('load', init);
})();
