/* ============================================================
   JEANS·INK — Backend (Google Apps Script Web App)
   ------------------------------------------------------------
   Үнэгүй backend: Google Sheet = өгөгдлийн сан.
   • Шинэ захиалга → Sheet-д бүртгэнэ + TELEGRAM мэдэгдэл явуулна
   • Track → код-оор хайж статус буцаана
   • Sheet дээр төлвийг "Баталгаажсан" болгоход → EMAIL бүртгэл явна

   Тохиргоо (Script Properties — Project Settings → Script properties):
     TELEGRAM_TOKEN     = BotFather-аас авсан token
     TELEGRAM_CHAT_ID   = өөрийн chat id (бот танд бичих чатынх)
     NOTIFY_EMAIL       = баталгаажилт бүртгэх имэйл хаяг

   Анх удаа: setup() функцийг нэг удаа ажиллуул (header + trigger үүсгэнэ).
   Заавар: backend/SETUP.md
   ============================================================ */

var SHEET_NAME = 'Orders';
var HEADERS = ['Огноо', 'Код', 'Төрөл', 'Өнгө', 'Хэмжээ', 'Үнэ', 'Төлөв', 'Имэйл/Утас', 'Имэйл явсан'];

// Track хуудсанд харагдах 3 төлөв (дараалал чухал)
var STATUS_LIST = ['Захиалга авсаан', 'Хийж байноо BRO', 'Дуусаад chatlyaa OK'];
// Энэ төлөв рүү шилжихэд email бүртгэл явна
var CONFIRMED_STATUS = 'Захиалга авсаан';

// ── Анх нэг удаа ажиллуулна: header + дусал цэс + onEdit trigger ──
function setup() {
  var sh = sheet_();
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  // Төлөв баганад dropdown (G багана = 7)
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(STATUS_LIST, true).build();
  sh.getRange(2, 7, 1000, 1).setDataValidation(rule);
  // onEdit installable trigger (email явуулахын тулд)
  var exists = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'onEditInstallable'; });
  if (!exists) {
    ScriptApp.newTrigger('onEditInstallable')
      .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
      .onEdit().create();
  }
  return 'Setup OK';
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function prop_(k) {
  return PropertiesService.getScriptProperties().getProperty(k) || '';
}

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
      code,
      d.type || '', d.color || '', d.size || '', d.price || '',
      STATUS_LIST[0], '', ''
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
  do {
    code = String(Math.floor(10000 + Math.random() * 90000)); // 5 оронтой
    guard++;
  } while (existing[code] && guard < 200);
  return code;
}

function findOrder_(code) {
  var sh = sheet_();
  if (sh.getLastRow() < 2) return { found: false };
  var rows = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.length).getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][1]).trim() === code) {
      var status = String(rows[i][6]).trim();
      var idx = STATUS_LIST.indexOf(status);
      return {
        found: true, code: code,
        type: rows[i][2], color: rows[i][3], size: rows[i][4], price: rows[i][5],
        status: status, statusIndex: idx < 0 ? 0 : idx,
        date: String(rows[i][0])
      };
    }
  }
  return { found: false };
}

// ── Telegram мэдэгдэл (шинэ захиалга үүсмэгц) ──
function notifyTelegram_(code, d) {
  var token = prop_('TELEGRAM_TOKEN'), chat = prop_('TELEGRAM_CHAT_ID');
  if (!token || !chat) return;
  var text = '🆕 ШИНЭ ЗАХИАЛГА\n\n'
    + '🔖 Код: ' + code + '\n'
    + '👖 Төрөл: ' + (d.type || '-') + '\n'
    + '🎨 Өнгө: ' + (d.color || '-') + '\n'
    + '📐 Хэмжээ: ' + (d.size || '-') + '\n'
    + '💰 Үнэ: ' + (d.price || '-') + '₮\n\n'
    + 'Харилцагч өмдөө авчрахыг хүлээж байна.';
  try {
    UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'post',
      payload: { chat_id: chat, text: text },
      muteHttpExceptions: true
    });
  } catch (err) {}
}

// ── Sheet дээр Төлөв = "Захиалга авсаан" болоход email бүртгэл явна ──
function onEditInstallable(e) {
  try {
    var sh = e.range.getSheet();
    if (sh.getName() !== SHEET_NAME) return;
    if (e.range.getColumn() !== 7) return;            // зөвхөн Төлөв багана
    var row = e.range.getRow();
    if (row < 2) return;
    var newStatus = String(e.value || '').trim();
    if (newStatus !== CONFIRMED_STATUS) return;
    var sent = sh.getRange(row, 9).getValue();
    if (sent) return;                                 // дахин явуулахгүй
    var vals = sh.getRange(row, 1, 1, HEADERS.length).getValues()[0];
    var email = prop_('NOTIFY_EMAIL');
    if (email) {
      MailApp.sendEmail({
        to: email,
        subject: 'JEANS·INK — Захиалга баталгаажсан #' + vals[1],
        body: 'Захиалга баталгаажиж бүртгэгдлээ.\n\n'
          + 'Код: ' + vals[1] + '\nТөрөл: ' + vals[2] + '\nӨнгө: ' + vals[3]
          + '\nХэмжээ: ' + vals[4] + '\nҮнэ: ' + vals[5] + '₮\nОгноо: ' + vals[0]
      });
    }
    sh.getRange(row, 9).setValue('✓ ' + Utilities.formatDate(new Date(), 'Asia/Ulaanbaatar', 'yyyy-MM-dd HH:mm'));
  } catch (err) {}
}
