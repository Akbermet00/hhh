const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(process.env.DB_FILE || 'wardrobe.db');
db.exec(`CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT, category TEXT, color TEXT, photo TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP)`);

const TRENDS = [
  { name: 'Оверсайз пиджак', tags: ['пиджак', 'оверсайз', 'офис', 'верх'], q: 'оверсайз пиджак женский' },
  { name: 'Карго брюки', tags: ['карго', 'брюки', 'стритвир', 'низ'], q: 'карго брюки' },
  { name: 'Широкие джинсы', tags: ['джинсы', 'широкие', 'низ', 'деним'], q: 'широкие джинсы' },
  { name: 'Кожаная куртка', tags: ['кожа', 'куртка', 'верхняя'], q: 'кожаная куртка' },
  { name: 'Лоферы', tags: ['обувь', 'лоферы', 'классика'], q: 'лоферы' },
  { name: 'Массивные кроссовки', tags: ['обувь', 'кроссовки', 'стритвир'], q: 'массивные кроссовки' },
  { name: 'Трикотажный кардиган', tags: ['кардиган', 'вязаный', 'верх', 'осень'], q: 'трикотажный кардиган' },
  { name: 'Тренч', tags: ['тренч', 'верхняя', 'классика', 'осень'], q: 'тренч' },
  { name: 'Миди-юбка', tags: ['юбка', 'миди', 'низ'], q: 'миди юбка' },
  { name: 'Худи оверсайз', tags: ['худи', 'оверсайз', 'стритвир', 'верх'], q: 'худи оверсайз' }
];
const shops = q => [
  { shop: 'Lamoda', url: 'https://www.lamoda.ru/catalogsearch/result/?q=' + encodeURIComponent(q) },
  { shop: 'Wildberries', url: 'https://www.wildberries.ru/catalog/0/search.aspx?search=' + encodeURIComponent(q) },
  { shop: 'Ozon', url: 'https://www.ozon.ru/search/?text=' + encodeURIComponent(q) },
  { shop: 'Google Shopping', url: 'https://www.google.com/search?tbm=shop&q=' + encodeURIComponent(q) }
];

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.get('/api/items', (_, res) => res.json(db.prepare('SELECT * FROM items ORDER BY id DESC').all()));
app.post('/api/items', (req, res) => {
  const { name = '', category = 'top', color = '', photo = '' } = req.body;
  const r = db.prepare('INSERT INTO items(name,category,color,photo) VALUES(?,?,?,?)').run(name, category, color, photo);
  res.json({ id: r.lastInsertRowid, name, category, color, photo });
});
app.delete('/api/items/:id', (req, res) => {
  db.prepare('DELETE FROM items WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});
// Поисковик трендов: /api/trends?q=кроссовки  (без q — все тренды)
app.get('/api/trends', (req, res) => {
  const q = (req.query.q || '').toString().toLowerCase().trim();
  const list = TRENDS.filter(t => !q || t.name.toLowerCase().includes(q) || t.tags.some(g => g.includes(q) || q.includes(g)));
  const out = list.map(t => ({ name: t.name, tags: t.tags, buy: shops(t.q) }));
  if (q && !out.length) out.push({ name: q, tags: [], buy: shops(q) });
  res.json(out);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Гардероб: http://localhost:' + port));
