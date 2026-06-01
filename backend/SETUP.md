# JEANS·INK — Phase B Backend суулгах заавар

Бүрэн **үнэгүй**. Google Sheet = өгөгдлийн сан, Apps Script = backend.
Дунджаар 15 минут. Програм татах шаардлагагүй — бүгд browser дотор.

---

## 1. Google Sheet үүсгэх

1. [sheets.new](https://sheets.new) рүү ороод шинэ хүснэгт үүсгэ.
2. Нэрийг нь **JEANS·INK Orders** болго (дээд талд нэрийг дар).

## 2. Apps Script нээх

1. Sheet дотроос дээд цэс: **Extensions → Apps Script**.
2. Нээгдсэн `Code.gs` доторх бүх кодыг устгаад, манай repo дахь
   **`backend/Code.gs`** файлын агуулгыг бүхэлд нь хуулж тавь.
3. Дээд талд **Save** (💾) дар.

## 3. Нууц тохиргоо оруулах (Script Properties)

1. Зүүн талын **⚙ Project Settings** дар.
2. Доош гүйлгээд **Script Properties → Add script property**.
3. Дараах 3 мөрийг нэг нэгээр нэм:

| Property | Value |
|---|---|
| `TELEGRAM_TOKEN` | (4-р алхамд авна) |
| `TELEGRAM_CHAT_ID` | (4-р алхамд авна) |
| `NOTIFY_EMAIL` | таны Gmail хаяг (баталгаажилт бүртгэх) |

## 4. Telegram bot үүсгэх (token + chat id)

**Token авах:**
1. Telegram дээр **@BotFather**-ийг хайж ороод `/newbot` бич.
2. Ботын нэр (жнь `JeansInk`) + хэрэглэгчийн нэр (`jeansink_bot`) өг.
3. BotFather танд **token** өгнө (`123456:ABC-...` хэлбэртэй) — `TELEGRAM_TOKEN`-д тавь.

**Chat ID авах:**
1. Дөнгөж үүсгэсэн бот руугаа орж **/start** эсвэл ямар нэг мессеж бич.
2. Browser-т дараах хаягийг нээ (TOKEN-оо орлуул):
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Гарч ирэх текстээс `"chat":{"id":XXXXXXXX` гэснийг ол — тэр тоо нь
   `TELEGRAM_CHAT_ID`. (Хэрэв хоосон бол ботдоо нэг мессеж бичээд дахин ачаална.)

## 5. Анхны тохиргоо ажиллуулах (setup)

1. Apps Script дээд талын функц сонгох цэснээс **`setup`** сонго.
2. **Run** (▶) дар.
3. Эхний удаа зөвшөөрөл асууна → өөрийн Google аккаунтаар нэвтэрч
   **Allow** (Advanced → Go to project → Allow) дар.
4. Энэ нь Sheet-д толгой мөр, төлвийн dropdown, email trigger үүсгэнэ.

## 6. Web App болгож deploy хийх

1. Дээд баруун талын **Deploy → New deployment** дар.
2. ⚙ дээр дараад **Web app** сонго.
3. Тохиргоо:
   - **Execute as:** Me (өөрөө)
   - **Who has access:** **Anyone** ← заавал!
4. **Deploy** → зөвшөөрөл асуувал Allow.
5. Гарч ирэх **Web app URL** (`https://script.google.com/macros/s/AKfyc.../exec`)
   -г хуулж ав.

## 7. Сайтад холбох

1. Repo доторх **`js/config.js`** файлыг нээ.
2. `JI_API: ''` хэсэгт дээрх URL-аа тавь:
   ```js
   JI_API: 'https://script.google.com/macros/s/AKfyc.../exec',
   ```
3. Commit + push хий. (Эсвэл надад URL-аа явуулбал би тавьж өгье.)

---

## Ажиллах урсгал

1. Хэрэглэгч **Try On → Захиалах** → backend код үүсгэж Sheet-д бүртгэнэ
   → **Telegram-д шинэ захиалгын мэдэгдэл** шууд ирнэ.
2. Хэрэглэгч кодоо аваад **Track** хуудсанд оруулбал статусаа Sheet-ээс шалгана.
3. Харилцагч өмдөө авчрахад → Sheet дээр тухайн мөрийн **Төлөв** баганаас
   `Захиалга авсаан` сонгоно → **баталгаажилтын email** танд ирнэ.
4. Ажил явцыг `Хийж байноо BRO` → `Дуусаад chatlyaa OK` болгож сольвол
   хэрэглэгчийн Track хуудсанд автоматаар шинэчлэгдэнэ.

## Код шинэчилбэл (Code.gs өөрчилбөл)
**Deploy → Manage deployments → ✏ (edit) → Version: New version → Deploy.**
(Шинэ URL гарахгүй, хуучин URL хэвээр ажиллана.)

## Алдаа гарвал
- Track ажиллахгүй бол: deploy дээр **Who has access = Anyone** эсэхийг шалга.
- Telegram ирэхгүй бол: TOKEN/CHAT_ID зөв эсэх, ботдоо нэг удаа `/start` бичсэн эсэх.
- Email ирэхгүй бол: `setup()` ажиллуулж trigger үүсгэсэн эсэх, NOTIFY_EMAIL зөв эсэх.
