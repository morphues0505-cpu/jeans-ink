# JEANS·INK — Premium Jeans Patch

Limited edition jeans patches. Hand-applied. 22 pieces only. Made in Ulaanbaatar.

Editorial / Swiss brutalist дизайнтай статик вэбсайт. API хэрэггүй, цэвэр HTML + CSS + JavaScript.

## Хуудаснууд

| Файл | Тайлбар | Өнгө |
|------|---------|------|
| `index.html` | Нүүр хуудас | Цайвар + улаан |
| `catalog.html` | 8 хээний каталог | Хар |
| `how-it-works.html` | Захиалгын 4 алхам | Улаан |
| `order.html` | Захиалга + төлбөр | Цайвар |
| `track.html` | Захиалга хянах | Хар |

## Хэрхэн засах вэ (How to edit)

**Browser дотроос (хамгийн хялбар):** GitHub repo хуудсан дээр `.` (цэг) товч дарвал онлайн засварлагч нээгдэнэ. Эсвэл URL дахь `github.com`-ийг `github.dev` болгож солино.

### Түгээмэл засварууд

- **Үнэ / хээний нэр / sold тоо** → `catalog.html` доторх `CATALOG` массив
- **Өнгө / фонт** → `css/style.css` дээд талын `:root` ба `body.theme-*`
- **Facebook / Instagram линк** → `js/main.js` доторх `SOCIAL` тохиргоо
- **Дансны мэдээлэл / QR** → `order.html` доторх payment section

## Локалд ажиллуулах

Энэ бол статик сайт — server шаардлагагүй. `index.html`-ийг browser-оор нээхэд л болно.

Эсвэл локал server:
```bash
python -m http.server 5599
```
