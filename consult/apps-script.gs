/**
 * 선우특수소재 상담 신청 수신용 Google Apps Script (drawdream89@gmail.com 계정)
 * 1) 구글 스프레드시트 새로 만들기 (이름 예: 선우특수소재 상담신청) → 확장 프로그램 > Apps Script
 * 2) 이 코드 전체 붙여넣기 → 저장 → 상단에서 testMail 선택 후 실행 (권한 허용) → 내 Gmail(drawdream89)로 테스트 메일 수신 확인
 * 3) 배포 > 새 배포 > 유형: 웹 앱 / 실행 계정: 나 / 액세스 권한: 모든 사용자 → 배포
 * 4) 발급된 웹 앱 URL(.../exec)을 그래피스타(Claude)에게 전달 → sw.js 의 endpoint 에 입력
 */
const TO_EMAIL = 'sunwoosm@naver.com';
const SENDER_NAME = '선우특수소재 홈페이지';
const SHEET_NAME = '상담신청';
const HEADER = ['접수일시', '경로', '문의유형', '회사명', '담당자', '연락처', '이메일', '도면', '금형', '문의내용', '접수페이지', '처리상태'];

function doPost(e) {
  try {
    const p = e.parameter || {};
    if (p.website) return json({ ok: true }); // 스팸(숨김 칸 입력) 무시
    const name = clean(p.name, 30);
    const phone = clean(p.phone, 20);
    if (!name || phone.replace(/\D/g, '').length < 9) return json({ ok: false, error: 'invalid' });

    // 같은 번호 1분 내 중복 차단
    const cache = CacheService.getScriptCache();
    const key = 'p_' + phone.replace(/\D/g, '');
    if (cache.get(key)) return json({ ok: true, dup: true });
    cache.put(key, '1', 60);

    const d = {
      now: Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
      via: clean(p.via, 20) || '상담 페이지',
      type: clean(p.type, 30) || '미선택',
      company: clean(p.company, 60),
      name: name,
      phone: phone,
      email: clean(p.email, 80),
      drawing: clean(p.drawing, 20),
      mold: clean(p.mold, 20),
      memo: clean(p.memo, 2000),
      page: clean(p.page, 300)
    };

    getSheet_().appendRow([d.now, d.via, d.type, d.company, d.name, d.phone, d.email, d.drawing, d.mold, d.memo, d.page, '미처리']);

    const html =
      '<div style="font-family:sans-serif;font-size:14px;line-height:1.7;color:#1b1d20">' +
      '<h2 style="color:#8a2c17;margin:0 0 12px">[선우특수소재] 새 상담 신청</h2>' +
      '<table cellpadding="8" style="border-collapse:collapse;border:1px solid #ddd">' +
      row('접수일시', d.now) + row('문의유형', d.type) + row('회사명', d.company || '-') +
      row('담당자', d.name) + row('연락처', d.phone) + row('이메일', d.email || '-') +
      row('도면', d.drawing || '-') + row('금형', d.mold || '-') +
      row('문의내용', (d.memo || '-').replace(/\n/g, '<br>')) +
      row('접수경로', d.via) + row('접수페이지', d.page) +
      '</table>' +
      '<p style="color:#868c95;font-size:12px;margin-top:12px">이 메일은 홈페이지 상담 신청 시 자동 발송됩니다. 전체 기록은 구글 시트 \'' + SHEET_NAME + '\'에 쌓입니다.</p></div>';

    const opt = { to: TO_EMAIL, subject: '[선우 상담신청] ' + d.type + ' - ' + (d.company ? d.company + ' ' : '') + d.name, htmlBody: html, name: SENDER_NAME };
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) opt.replyTo = d.email; // 메일에서 바로 '답장' 하면 신청자에게 감
    MailApp.sendEmail(opt);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) { sh = ss.insertSheet(SHEET_NAME); sh.appendRow(HEADER); sh.setFrozenRows(1); return sh; }
  if (sh.getLastRow() === 0) { sh.appendRow(HEADER); sh.setFrozenRows(1); }
  return sh;
}

function clean(v, max) { return String(v || '').replace(/[<>]/g, '').trim().slice(0, max); }
function row(k, v) { return '<tr><th style="background:#f3f4f5;border:1px solid #ddd;text-align:left;white-space:nowrap">' + k + '</th><td style="border:1px solid #ddd">' + v + '</td></tr>'; }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** 배포 전 테스트: 편집기 상단에서 testMail 선택 → 실행 */
function testMail() {
  getSheet_(); // 시트·제목줄 미리 생성
  MailApp.sendEmail({ to: Session.getActiveUser().getEmail() || TO_EMAIL, subject: '[선우 상담신청] 테스트 메일', htmlBody: '홈페이지 상담 신청 메일 연결 테스트입니다. 이 메일이 보이면 정상입니다.', name: SENDER_NAME });
  Logger.log('발송 완료. 남은 일일 발송량: ' + MailApp.getRemainingDailyQuota());
}
