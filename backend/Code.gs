/* ============================================================
   JEANS·INK — Backend (Google Apps Script Web App)
   ------------------------------------------------------------
   • Шинэ захиалга → Sheet-д "Хүлээгдэж буй" төлөвтэй бүртгэнэ + TELEGRAM
   • 24 цагт баталгаажаагүй "Хүлээгдэж буй" → автоматаар "Цуцлагдсан"
   • Харилцагч өмдөө авчрахад → Sheet дээр "Захиалга авсаан" болгоно → EMAIL
   • Track → код-оор хайж төлөв/үе шат буцаана

   Script Properties (Project Settings → Script properties):
     TELEGRAM_TOKEN, TELEGRAM_CHAT_ID, NOTIFY_EMAIL

   Анх удаа: setup() -г нэг удаа ажиллуул (header + dropdown + trigger-ууд).
   Код шинэчилбэл: Deploy → Manage deployments → Edit → New version → Deploy.
   ============================================================ */

var SHEET_NAME = 'Orders';
var HEADERS = ['Огноо', 'Код', 'Төрөл', 'Өнгө', 'Хэмжээ', 'Үнэ', 'Төлөв', 'Имэйл/Утас', 'Имэйл явсан'];

// Захиалга үүсэхэд (онлайн, өмд аваагүй)
var PENDING = '🕐 Хүлээгдэж буй';
// 24ц-т баталгаажаагүй бол
var CANCELLED = '❌ Цуцлагдсан (24ц)';
// Track-ийн 3 үе шат (дараалал чухал)
var STATUS_LIST = ['Захиалга авсаан', 'Хийж байноо BRO', 'Дуусаад chatlyaa OK'];
// Энэ төлөв рүү шилжихэд email явна (= өмд авчирч баталгаажсан)
var CONFIRMED_STATUS = 'Захиалга авсаан';
// Sheet dropdown-д харагдах бүх төлөв
var ALL_STATUSES = [PENDING].concat(STATUS_LIST).concat([CANCELLED]);
// Хэдэн цагийн дараа цуцлах
var CANCEL_AFTER_HOURS = 24;

// ── Анх нэг удаа ажиллуулна ──
function setup() {
  var sh = sheet_();
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  // Төлөв баганад dropdown (G = 7)
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(ALL_STATUSES, true).build();
  sh.getRange(2, 7, 2000, 1).setDataValidation(rule);
  // onEdit trigger (email)
  ensureTrigger_('onEditInstallable', function () {
    ScriptApp.newTrigger('onEditInstallable')
      .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet()).onEdit().create();
  });
  // Цаг тутмын trigger (24ц цуцлалт)
  ensureTrigger_('autoCancelStale', function () {
    ScriptApp.newTrigger('autoCancelStale').timeBased().everyHours(1).create();
  });
  return 'Setup OK';
}

function ensureTrigger_(fn, make) {
  var exists = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === fn; });
  if (!exists) make();
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k) || ''; }

// ── Track: GET ?action=track&code=12345 ──
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'track' && p.code) return json_(findOrder_(String(p.code).trim()));
  if (p.action === 'ping') return json_({ ok: true });
  return json_({ ok: true, msg: 'JEANS·INK API' });
}

// ── Шинэ захиалга: POST {action:'create', type,color,size,price} ──
function doPost(e) {
  var data = {};
  try { data = JSON.parse(e.postData.contents); } catch (err) {}
  if (data.action === 'create') return json_(createOrder_(data));
  return json_({ ok: false, error: 'unknown action' });
}

function createOrder_(d) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (err) {}
  try {
    var sh = sheet_();
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
    var code = uniqueCode_(sh);
    var now = new Date();
    sh.appendRow([
      Utilities.formatDate(now, 'Asia/Ulaanbaatar', 'yyyy-MM-dd HH:mm'),
      code, d.type || '', d.color || '', d.size || '', d.price || '',
      PENDING, '', ''
    ]);
    notifyTelegram_(code, d);
    return { ok: true, code: code };
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

function uniqueCode_(sh) {
  var existing = {};
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 2, sh.getLastRow() - 1, 1).getValues().forEach(function (r) { existing[String(r[0])] = 1; });
  }
  var code, guard = 0;
  do { code = String(Math.floor(10000 + Math.random() * 90000)); guard++; }
  while (existing[code] && guard < 200);
  return code;
}

// "yyyy-MM-dd HH:mm" (Ulaanbaatar, +08:00) → Date
function parseUbDate_(s) {
  s = String(s).trim();
  if (!s) return null;
  var iso = s.replace(' ', 'T') + ':00+08:00';
  var d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

function findOrder_(code) {
  var sh = sheet_();
  if (sh.getLastRow() < 2) return { found: false };
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.length).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][1]).trim() === code) {
      var status = String(rows[i][6]).trim();
      var state = 'active', idx = STATUS_LIST.indexOf(status);
      if (status === PENDING) { state = 'pending'; idx = -1; }
      else if (status === CANCELLED) { state = 'cancelled'; idx = -1; }
      else if (idx < 0) { state = 'pending'; idx = -1; }
      return {
        found: true, code: code, state: state,
        type: rows[i][2], color: rows[i][3], size: rows[i][4], price: rows[i][5],
        status: status, statusIndex: idx, date: String(rows[i][0])
      };
    }
  }
  return { found: false };
}

// ── 24ц-т баталгаажаагүй "Хүлээгдэж буй" → "Цуцлагдсан" (цаг тутам) ──
function autoCancelStale() {
  var sh = sheet_();
  if (sh.getLastRow() < 2) return;
  var n = sh.getLastRow() - 1;
  var rng = sh.getRange(2, 1, n, HEADERS.length);
  var rows = rng.getValues();
  var now = new Date().getTime();
  var limit = CANCEL_AFTER_HOURS * 3600 * 1000;
  var changed = false;
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][6]).trim() !== PENDING) continue;
    var d = parseUbDate_(rows[i][0]);
    if (!d) continue;
    if (now - d.getTime() > limit) { rows[i][6] = CANCELLED; changed = true; }
  }
  if (changed) rng.setValues(rows);
}

// ── Telegram (шинэ захиалга) ──
function notifyTelegram_(code, d) {
  var token = prop_('TELEGRAM_TOKEN'), chat = prop_('TELEGRAM_CHAT_ID');
  if (!token || !chat) return;
  var text = '🆕 ШИНЭ ЗАХИАЛГА\n\n'
    + '🔖 Код: ' + code + '\n'
    + '👖 Төрөл: ' + (d.type || '-') + '\n'
    + '🎨 Өнгө: ' + (d.color || '-') + '\n'
    + '📐 Хэмжээ: ' + (d.size || '-') + '\n'
    + '💰 Үнэ: ' + (d.price || '-') + '₮\n\n'
    + '⏳ Төлөв: Хүлээгдэж буй\n'
    + 'Харилцагч 24 цагийн дотор өмдөө авчирч баталгаажуулна.';
  try {
    UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'post', payload: { chat_id: chat, text: text }, muteHttpExceptions: true
    });
  } catch (err) {}
}

// ── Төлөв = "Захиалга авсаан" болоход email (баталгаажсан) ──
function onEditInstallable(e) {
  try {
    var sh = e.range.getSheet();
    if (sh.getName() !== SHEET_NAME) return;
    if (e.range.getColumn() !== 7 || e.range.getRow() < 2) return;
    if (String(e.value || '').trim() !== CONFIRMED_STATUS) return;
    var row = e.range.getRow();
    if (sh.getRange(row, 9).getValue()) return; // дахин явуулахгүй
    var vals = sh.getRange(row, 1, 1, HEADERS.length).getValues()[0];
    var email = prop_('NOTIFY_EMAIL');
    if (email) {
      MailApp.sendEmail({
        to: email,
        subject: 'JEANS·INK — Захиалга баталгаажсан #' + vals[1],
        body: 'Захиалга баталгаажиж бүртгэгдлээ.\n\nКод: ' + vals[1] + '\nТөрөл: ' + vals[2]
          + '\nӨнгө: ' + vals[3] + '\nХэмжээ: ' + vals[4] + '\nҮнэ: ' + vals[5] + '₮\nОгноо: ' + vals[0]
      });
    }
    sh.getRange(row, 9).setValue('✓ ' + Utilities.formatDate(new Date(), 'Asia/Ulaanbaatar', 'yyyy-MM-dd HH:mm'));
  } catch (err) {}
}
