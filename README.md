# ParentMind — Deploy Guide

## Что внутри
```
parentmind-site/
├── api/
│   └── chat.js        ← backend (защищает API ключ)
├── public/
│   └── index.html     ← весь сайт
├── vercel.json        ← конфиг хостинга
└── README.md          ← этот файл
```

---

## Шаг 1 — GitHub

1. Зайди на **github.com** → создай аккаунт если нет
2. Нажми **New repository**
3. Назови: `parentmind-site`
4. Выбери **Private** (чтобы код не был публичным)
5. Нажми **Create repository**
6. Загрузи все файлы:
   - Нажми **uploading an existing file**
   - Перетащи папки `api/`, `public/`, файлы `vercel.json` и `README.md`
   - Нажми **Commit changes**

---

## Шаг 2 — Anthropic API ключ

1. Зайди на **console.anthropic.com**
2. Войди или создай аккаунт
3. Слева → **API Keys** → **Create Key**
4. Назови ключ: `parentmind`
5. Скопируй ключ — он выглядит так: `sk-ant-api03-...`
6. Сохрани его в заметках — потом понадобится

---

## Шаг 3 — Vercel (хостинг)

1. Зайди на **vercel.com**
2. Нажми **Sign up** → выбери **Continue with GitHub**
3. Нажми **New Project**
4. Выбери свой репозиторий `parentmind-site`
5. Нажми **Deploy** — подождёт ~1 минуту

### Добавить API ключ в Vercel:
1. После деплоя зайди в **Settings** → **Environment Variables**
2. Нажми **Add**:
   - Name: `ANTHROPIC_API_KEY`
   - Value: вставь свой ключ `sk-ant-api03-...`
3. Нажми **Save**
4. Зайди в **Deployments** → нажми **Redeploy**

Готово! Сайт живёт по адресу типа `parentmind-site.vercel.app`

---

## Шаг 4 — Свой домен (опционально)

1. Купи домен на **namecheap.com** (ищи `parentmind.app` или `parentmind.ai`)
2. В Vercel: **Settings** → **Domains** → вставь домен
3. Vercel покажет DNS записи — скопируй их в Namecheap
4. Через 10-30 минут сайт живёт по твоему домену

---

## Если что-то не работает

- Чат не отвечает → проверь что `ANTHROPIC_API_KEY` добавлен в Vercel и сделан Redeploy
- Сайт не открывается → подожди 2-3 минуты после деплоя
- Домен не подключился → DNS обновляется до 48 часов (обычно 30 мин)

---

## Стоимость

| Что | Цена |
|-----|------|
| Vercel хостинг | Бесплатно |
| Домен | ~$10-15/год |
| Anthropic API | ~$0.003 за запрос (первые $5 бесплатно) |
