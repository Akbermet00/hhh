# Умный гардероб
Фото одежды → база данных → образы и тренды со ссылками на магазины.

## Запуск
    npm install
    npm start        # http://localhost:3000

## API
- GET /api/items — вся одежда
- POST /api/items {name, category, color, photo(dataURL)}
- DELETE /api/items/:id
- GET /api/trends?q=джинсы — поиск трендов + где купить

Без сервера `public/index.html` работает в демо-режиме (данные в браузере).
Деплой бэкенда: Render / Railway (build: `npm install`, start: `npm start`).
