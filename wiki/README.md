# 📚 Fluffy Wiki

**Welcome to Fluffy!** Личный финансовый менеджер с поддержкой целей, offline-first архитектурой и дружелюбным интерфейсом.

> Документация обновлена: 19 февраля 2026

---

## 🚀 Быстрый старт

**Новичок?** Начни отсюда:

1. 📖 [Getting Started](./getting-started/README.md) - установка и первый проект
2. 💡 [Product Vision](./product/vision.md) - что мы создаём и почему
3. 🏗️ [Architecture](./development/architecture.md) - как всё устроено
4. 🤝 [Contributing](./guides/contributing.md) - как внести вклад

**Разработчик?**

- 🛠️ [Installation Guide](./getting-started/installation.md) - настройка окружения
- 📁 [Project Structure](./getting-started/project-structure.md) - структура проекта
- 🔧 [Development Docs](./development/README.md) - техническая документация

---

## 📑 Основные разделы

### 🎯 [Product](./product/README.md)

Продуктовая документация - vision, data model, user flows

- [Vision & Principles](./product/vision.md) - продуктовое видение и принципы
- [Data Model](./product/data-model.md) - структура данных
- [Backlog](./product/backlog.md) - функциональный бэклог

---

### 🎨 [Design](./design/README.md)

Дизайн-система, UI patterns, компоненты

- [Foundation](./design/foundation.md) - основы дизайн-системы
- [UI Patterns](./design/ui-patterns.md) - спецификация экранов
- [Components](./design/components.md) - справочник компонентов

---

### 💻 [Development](./development/README.md)

Техническая документация для разработчиков

- [Architecture](./development/architecture.md) - архитектура приложения
- [Offline-First Patterns](./development/offline-first.md) - паттерны offline-first

---

### 📖 [Guides](./guides/README.md)

Практические руководства

- [Cloud Sync](./guides/cloud-sync.md) - настройка синхронизации
- [Deployment](./guides/deployment.md) - деплой приложения
- [Contributing](./guides/contributing.md) - гайд для контрибьюторов

---

### 🗓️ [Planning](./planning/README.md)

Текущее состояние, roadmap, спринты

- [Current Status](./planning/current-status.md) - ⚡ где мы сейчас (Feb 2026)
- [Roadmap](./planning/roadmap.md) - планы развития (Phases 1-10)
- [Current Sprint](./planning/current-sprint.md) - текущие задачи

---

### 🧠 [Decisions (ADR)](./decisions/README.md)

Архитектурные решения

- [ADR-0001: Goals ↔ Contributions ↔ Transactions](./decisions/0001-goals-contributions-transactions.md)
- [ADR-0002: Categories Deletion Semantics](./decisions/0002-categories-deletion-semantics.md)

---

### 📦 [Archive](./archive/README.md)

Устаревшая документация (для истории)

---

## 🔍 Найти что-то конкретное?

| Задача | Документ |
|--------|----------|
| Настроить проект локально | [Installation Guide](./getting-started/installation.md) |
| Понять структуру кода | [Project Structure](./getting-started/project-structure.md) |
| Сделать первый PR | [First Contribution](./getting-started/first-contribution.md) |
| Понять архитектуру | [Architecture](./development/architecture.md) |
| Настроить Firebase sync | [Cloud Sync Guide](./guides/cloud-sync.md) |
| Задеплоить на Vercel | [Deployment Guide](./guides/deployment.md) |
| Узнать текущий статус | [Current Status](./planning/current-status.md) |

---

## 📊 Текущий статус проекта

**Фаза:** Phase 5 - Design System Implementation (In Progress)  
**Прогресс:** 40% (Phases 1-4 Complete)  
**Следующая фаза:** Phase 6 - Internationalization (RU/EN)

👉 [Подробнее о текущем статусе](./planning/current-status.md)

---

## 🏗️ Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript 5.x
- **DB:** IndexedDB (Dexie.js)
- **State:** React 19 + Context API
- **UI:** Tailwind CSS + shadcn/ui + Lucide Icons
- **Cloud Sync:** Firebase (planned)

---

## 🤝 Внести вклад

Fluffy - это open source проект! Мы приветствуем любой вклад:

1. 📖 Прочитай [Contributing Guide](./guides/contributing.md)
2. 🐛 Найди [issue на GitHub](https://github.com/Megalartem/fluffy/issues)
3. 🔧 Сделай fork и создай feature branch
4. ✅ Напиши тесты и документацию
5. 🚀 Создай Pull Request

**Нужна помощь?**
- Посмотри [First Contribution Guide](./getting-started/first-contribution.md)
- Спроси в [GitHub Discussions](https://github.com/Megalartem/fluffy/discussions)

---

*Документация поддерживается сообществом. Нашли ошибку? [Создайте PR!](./guides/contributing.md)*

**Дата последнего обновления структуры:** 16 февраля 2026
