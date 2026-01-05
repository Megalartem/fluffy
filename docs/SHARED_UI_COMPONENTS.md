# Shared UI Components — Atoms & Molecules

> **Версия:** 1.0  
> **Дата:** 5 января 2026  
> **Статус:** Production-ready

Этот документ содержит полную справку по всем shared UI компонентам системы Fluffy.  
Компоненты разделены на **Atoms** (атомарные элементы) и **Molecules** (композитные компоненты).

---

## Оглавление

- [Принципы проектирования](#принципы-проектирования)
- [Atoms (Атомы)](#atoms-атомы)
  - [Typography](#typography)
  - [Buttons & Actions](#buttons--actions)
  - [Inputs](#inputs)
  - [Icons & Visuals](#icons--visuals)
  - [Layout](#layout)
- [Molecules (Молекулы)](#molecules-молекулы)
  - [Cards & Containers](#cards--containers)
  - [Navigation](#navigation)
  - [Forms](#forms)
  - [Dialogs & Sheets](#dialogs--sheets)
  - [Lists & Data Display](#lists--data-display)
  - [Controls](#controls)
- [Design Tokens](#design-tokens)

---

## Принципы проектирования

### Что такое Atoms?
Атомы — минимальные визуальные единицы интерфейса:
- ❌ не знают про features
- ❌ не знают про domain data
- ❌ не принимают сложные пропсы
- ✅ визуально повторяемы
- ✅ используются в 3+ местах
- ✅ являются строительными блоками

### Что такое Molecules?
Молекулы — композитные компоненты из атомов:
- Решают конкретную UI-задачу
- Могут содержать внутреннюю логику взаимодействия
- Не зависят от бизнес-доменов
- Переиспользуемы между features

---

## Atoms (Атомы)

### Typography

#### Text

**Путь:** `@/shared/ui/atoms/Text`

Базовый текстовый компонент для отображения текста.

**Варианты:**
- `body` — основной текст (по умолчанию)
- `caption` — мелкий вторичный текст
- `label` — подписи к полям
- `muted` — приглушенный текст

```tsx
import { Text } from "@/shared/ui/atoms";

<Text variant="body">Regular text</Text>
<Text variant="caption">Small secondary text</Text>
<Text variant="label">Field label</Text>
<Text variant="muted">Disabled or helper text</Text>
```

**Props:**
```ts
interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'body' | 'caption' | 'label' | 'muted';
}
```

---

#### Heading

**Путь:** `@/shared/ui/atoms/Heading`

Заголовки разного уровня с семантическими HTML тегами.

**Варианты:**
- `page` — заголовок экрана (h1 по умолчанию)
- `section` — заголовок секции (h2 по умолчанию)
- `amount` — крупный заголовок для сумм (h3 по умолчанию)

```tsx
import { Heading } from "@/shared/ui/atoms";

<Heading variant="page">Dashboard</Heading>
<Heading variant="section" as="h3">Recent Transactions</Heading>
<Heading variant="amount">$1,234.56</Heading>
```

**Props:**
```ts
interface HeadingProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'page' | 'section' | 'amount';
  as?: 'h1' | 'h2' | 'h3' | 'div' | 'span';
}
```

---

#### Amount

**Путь:** `@/shared/ui/atoms/Amount`

Специализированный компонент для отображения денежных сумм с цветовой индикацией.

**Состояния:**
- `neutral` — нейтральное значение (по умолчанию)
- `positive` — положительное значение (зелёный)
- `negative` — отрицательное значение (красный)

```tsx
import { Amount } from "@/shared/ui/atoms";

<Amount state="positive">+$123.45</Amount>
<Amount state="negative">-$67.89</Amount>
<Amount state="neutral">$0.00</Amount>
```

**Props:**
```ts
interface AmountProps extends React.HTMLAttributes<HTMLSpanElement> {
  state?: 'positive' | 'negative' | 'neutral';
}
```

---

### Buttons & Actions

#### ButtonBase

**Путь:** `@/shared/ui/atoms/ButtonBase`

Базовая кнопка с основными визуальными вариациями.

**Размеры:**
- `s` — компактная
- `m` — средняя (по умолчанию)

**Варианты:**
- `default` — стандартная кнопка с фоном
- `muted` — приглушенная кнопка
- `ghost` — прозрачная кнопка

```tsx
import { ButtonBase } from "@/shared/ui/atoms";

<ButtonBase size="m" variant="default">Save</ButtonBase>
<ButtonBase size="s" variant="ghost" pressed>Active</ButtonBase>
```

**Props:**
```ts
interface ButtonBaseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 's' | 'm';
  variant?: 'default' | 'muted' | 'ghost';
  pressed?: boolean;
  ariaLabel?: string;
}
```

---

#### IconButton

**Путь:** `@/shared/ui/atoms/IconButton`

Кнопка с иконкой без текста.

```tsx
import { IconButton } from "@/shared/ui/atoms";
import { Settings } from "lucide-react";

<IconButton 
  icon={Settings} 
  variant="default" 
  size="m" 
  onClick={handleClick}
/>
```

**Props:**
```ts
interface IconButtonProps extends ButtonBaseProps {
  icon: LucideIcon;
  variant?: 'default' | 'muted' | 'ghost';
  size?: 's' | 'm';
  iconSize?: 's' | 'm' | 'l'; // опциональное переопределение размера иконки
}
```

---

#### FAB

**Путь:** `@/shared/ui/atoms/FAB`

Floating Action Button — акцентная круглая кнопка.

```tsx
import { FAB } from "@/shared/ui/atoms";
import { Plus } from "lucide-react";

<FAB icon={Plus} onClick={handleAdd} />
```

**Props:**
```ts
interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
}
```

**Использование:**
- Основное действие на экране (Add Transaction, Create Goal)
- Всегда одно на экран
- Фиолетовый accent цвет

---

### Inputs

#### InputBase

**Путь:** `@/shared/ui/atoms/InputBase`

Базовое поле ввода.

**Состояния:**
- `default` — обычное состояние
- `error` — с ошибкой валидации
- `disabled` — отключено

```tsx
import { InputBase } from "@/shared/ui/atoms";

<InputBase 
  placeholder="Enter amount" 
  value={value}
  onChange={handleChange}
  state="default"
/>
```

**Props:**
```ts
interface InputBaseProps extends React.InputHTMLAttributes<HTMLInputElement> {
  state?: 'default' | 'error' | 'disabled';
}
```

---

#### SearchInput

**Путь:** `@/shared/ui/atoms/SearchInput`

Поле поиска с иконкой лупы и кнопкой очистки.

```tsx
import { SearchInput } from "@/shared/ui/atoms";

<SearchInput 
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery('')}
/>
```

**Props:**
```ts
interface SearchInputProps extends InputBaseProps {
  onClear?: () => void;
}
```

---

#### SelectBase

**Путь:** `@/shared/ui/atoms/SelectBase`

Базовый нативный select (если есть).

---

#### Toggle

**Путь:** `@/shared/ui/atoms/Toggle`

Переключатель (iOS-style switch).

```tsx
import { Toggle } from "@/shared/ui/atoms";

<Toggle 
  enabled={isDarkMode}
  onChange={setDarkMode}
  disabled={false}
/>
```

**Props:**
```ts
interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}
```

---

### Icons & Visuals

#### Icon

**Путь:** `@/shared/ui/atoms/Icon`

Обёртка для Lucide иконок с консистентными размерами и цветами.

**Размеры:**
- `s` — маленькая (16px)
- `m` — средняя (20px, по умолчанию)
- `l` — большая (24px)

**Варианты:**
- `default` — основной цвет
- `on-default` — для использования на цветном фоне
- `muted` — приглушённый
- `accent` — акцентный (фиолетовый)
- `ghost` — почти прозрачный

```tsx
import { Icon } from "@/shared/ui/atoms";
import { Wallet } from "lucide-react";

<Icon icon={Wallet} size="m" variant="accent" />
```

**Props:**
```ts
interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: LucideIcon;
  size?: 's' | 'm' | 'l';
  variant?: 'default' | 'on-default' | 'muted' | 'accent' | 'ghost';
}
```

---

#### CategoryIcon

**Путь:** `@/shared/ui/atoms/CategoryIcon`

Иконка с цветным фоном для категорий.

**Размеры:**
- `xs` — очень маленькая
- `s` — маленькая
- `m` — средняя (по умолчанию)
- `l` — большая

**Цвета:** 
`violet`, `indigo`, `blue`, `cyan`, `teal`, `amber`, `orange`, `coral`, `red`, `green`, `lime`, `mint`, `pink`, `magenta`, `plum`, `slate`, `steel`, `graphite`, `sand`, `brown`, `default`

**Importance:**
- `primary` — насыщенный (для списков транзакций)
- `secondary` — приглушённый (для форм)

```tsx
import { CategoryIcon } from "@/shared/ui/atoms";
import { Coffee } from "lucide-react";

<CategoryIcon 
  icon={Coffee}
  color="amber"
  size="m"
  importance="primary"
/>
```

**Props:**
```ts
interface CategoryIconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  size?: 'xs' | 's' | 'm' | 'l';
  color?: CategoryColor;
  backgroundColor?: string; // fallback
  importance?: 'primary' | 'secondary';
}
```

---

#### Badge

**Путь:** `@/shared/ui/atoms/Badge`

Маленький цветной badge для статусов.

**Варианты:**
- `default` — нейтральный
- `success` — зелёный
- `warning` — жёлтый/оранжевый
- `error` — красный

```tsx
import { Badge } from "@/shared/ui/atoms";

<Badge variant="success">Active</Badge>
<Badge variant="error">Overdue</Badge>
```

**Props:**
```ts
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error';
}
```

---

#### Checkmark

**Путь:** `@/shared/ui/atoms/Checkmark`

Галочка для выбранных элементов (если существует как отдельный компонент).

---

#### Dot

**Путь:** `@/shared/ui/atoms/Dot`

Цветная точка-индикатор (если существует).

---

### Layout

#### Surface

**Путь:** `@/shared/ui/atoms/Surface`

Базовая фоновая поверхность с тенью или без.

**Варианты:**
- `default` — с тенью/рамкой
- `ghost` — прозрачная

**Background варианты:**
- `default` — стандартный фон
- `white` — белый фон

```tsx
import { Surface } from "@/shared/ui/atoms";

<Surface variant="default" bgVariant="default">
  Content here
</Surface>
```

**Props:**
```ts
interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'ghost';
  bgVariant?: 'default' | 'white';
}
```

---

#### Divider

**Путь:** `@/shared/ui/atoms/Divider`

Разделитель.

**Ориентация:**
- `horizontal` — горизонтальный (по умолчанию)
- `vertical` — вертикальный

```tsx
import { Divider } from "@/shared/ui/atoms";

<Divider orientation="horizontal" />
```

**Props:**
```ts
interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}
```

---

#### Overlay

**Путь:** `@/shared/ui/atoms/Overlay`

Полупрозрачный overlay для модалок и sheets.

```tsx
import { Overlay } from "@/shared/ui/atoms";

<Overlay visible={isOpen} onClick={handleClose} />
```

**Props:**
```ts
interface OverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  visible: boolean;
  onClick?: () => void;
}
```

---

## Molecules (Молекулы)

### Cards & Containers

#### Card

**Путь:** `@/shared/ui/molecules/Card`

Карточка-контейнер с опциональным padding и вариантами фона.

**Варианты:**
- `default` — с тенью/границей
- `ghost` — прозрачная

**Padding:**
- `md` — средний padding (по умолчанию)
- `lg` — большой padding

```tsx
import { Card } from "@/shared/ui/molecules";

<Card variant="default" padding="md">
  <p>Card content</p>
</Card>

<Card variant="ghost" padding="lg" onClick={handleClick}>
  Clickable card
</Card>
```

**Props:**
```ts
interface CardProps {
  variant?: 'default' | 'ghost';
  padding?: 'md' | 'lg';
  bgVariant?: 'default' | 'white';
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}
```

---

### Navigation

#### TopBar

**Путь:** `@/shared/ui/molecules/TopBar`

Верхняя панель навигации с заголовком и опциональными кнопками слева/справа.

```tsx
import { TopBar } from "@/shared/ui/molecules";
import { ArrowLeft, Settings } from "lucide-react";

<TopBar
  title="Dashboard"
  subtitle="December 2025"
  leftAction={{ icon: ArrowLeft, onClick: goBack }}
  rightAction={{ icon: Settings, onClick: openSettings }}
/>
```

**Props:**
```ts
interface TopBarProps {
  title: string;
  subtitle?: string;
  leftAction?: IconButtonProps;
  rightAction?: IconButtonProps;
  className?: string;
}
```

---

### Forms

#### FormFieldBase

**Путь:** `@/shared/ui/molecules/FormField`

Обёртка для полей формы с label, error и helper text.

```tsx
import { FormFieldBase } from "@/shared/ui/molecules/FormField";
import { InputBase } from "@/shared/ui/atoms";

<FormFieldBase
  label="Amount"
  helperText="Enter transaction amount"
  error={errors.amount}
  required
>
  <InputBase 
    value={amount} 
    onChange={handleChange}
    state={errors.amount ? 'error' : 'default'}
  />
</FormFieldBase>
```

**Props:**
```ts
interface FormFieldBaseProps {
  fieldType?: 'string' | 'number' | 'select';
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactElement;
}
```

**Специализированные компоненты:**
- `FormStringField` — для текстовых полей
- `FormNumberField` — для числовых полей
- `FormSelectField` — для select полей

---

#### SectionHeader

**Путь:** `@/shared/ui/molecules/SectionHeader`

Заголовок секции с опциональным subtitle и правой областью для действий.

```tsx
import { SectionHeader } from "@/shared/ui/molecules";

<SectionHeader
  title="Budget Overview"
  subtitle="January 2026"
  headerText="primary"
  rightSec={<button>Edit</button>}
/>
```

**Props:**
```ts
interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  rightSec?: React.ReactNode;
  headerText?: 'primary' | 'secondary';
  className?: string;
}
```

---

### Dialogs & Sheets

#### Modal

**Путь:** `@/shared/ui/molecules/Modal`

Центрированное модальное окно.

**Размеры:**
- `s` — маленькое
- `m` — среднее (по умолчанию)
- `l` — большое

```tsx
import { Modal } from "@/shared/ui/molecules";

<Modal
  open={isOpen}
  title="Edit Transaction"
  size="m"
  onClose={handleClose}
  dismissible={true}
>
  <p>Modal content</p>
</Modal>
```

**Props:**
```ts
interface ModalProps {
  open: boolean;
  title?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  dismissible?: boolean;
  size?: 's' | 'm' | 'l';
  className?: string;
  ariaLabel?: string;
}
```

**Особенности:**
- Блокирует scroll документа когда открыта
- Закрывается по Escape (если `dismissible=true`)
- Закрывается по клику на overlay (если `dismissible=true`)

---

#### BottomSheet

**Путь:** `@/shared/ui/molecules/BottomSheet`

Bottom sheet (выдвигающаяся снизу панель).

**Высота:**
- `auto` — по контенту (по умолчанию)
- `half` — половина экрана
- `full` — полный экран

```tsx
import { BottomSheet } from "@/shared/ui/molecules";

<BottomSheet
  open={isOpen}
  title="Select Category"
  height="auto"
  onClose={handleClose}
  dismissible={true}
>
  <CategoryList />
</BottomSheet>
```

**Props:**
```ts
interface BottomSheetProps {
  open: boolean;
  title?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  dismissible?: boolean;
  height?: 'auto' | 'half' | 'full';
  className?: string;
}
```

**Особенности:**
- Имеет handle для свайпа (визуальная полоска сверху)
- Блокирует scroll документа когда открыта
- Закрывается по Escape и клику на overlay (если `dismissible=true`)

---

#### ConfirmDialog

**Путь:** `@/shared/ui/molecules/ConfirmDialog`

Диалог подтверждения действия.

```tsx
import { ConfirmDialog } from "@/shared/ui/molecules";

<ConfirmDialog
  open={showConfirm}
  title="Delete Transaction?"
  description="This action cannot be undone."
  confirmLabel="Delete"
  cancelLabel="Cancel"
  closeOnOverlay={false}
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

**Props:**
```ts
interface ConfirmDialogProps {
  open: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  confirmDisabled?: boolean;
  closeOnOverlay?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  className?: string;
}
```

---

#### ModalHeader

**Путь:** `@/shared/ui/molecules/ModalHeader`

Заголовок модального окна (если существует как отдельный компонент).

---

#### ModalActions

**Путь:** `@/shared/ui/molecules/ModalActions`

Область с кнопками действий в модалке.

---

### Lists & Data Display

#### ListRowBase

**Путь:** `@/shared/ui/molecules/ListRowBase`

Базовая строка списка с leading/trailing элементами.

**Tone:**
- `default` — обычная
- `muted` — приглушённая
- `ghost` — прозрачная

**Size:**
- `m` — средняя (по умолчанию)
- `l` — большая

```tsx
import { ListRowBase } from "@/shared/ui/molecules";
import { CategoryIcon, Amount } from "@/shared/ui/atoms";

<ListRowBase
  leading={<CategoryIcon icon={Coffee} color="amber" size="s" />}
  title="Coffee"
  subtitle="Starbucks • 10:30 AM"
  trailing={<Amount state="negative">-$4.50</Amount>}
  onClick={handleClick}
  tone="default"
  size="m"
/>
```

**Props:**
```ts
interface ListRowBaseProps {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  tone?: 'default' | 'muted' | 'ghost';
  size?: 'm' | 'l';
  className?: string;
  role?: React.AriaRole;
  ariaLabel?: string;
  ariaSelected?: boolean;
  disabled?: boolean;
}
```

---

#### EmptyState

**Путь:** `@/shared/ui/molecules/EmptyState`

Пустое состояние с иконкой, текстом и действиями.

**Tone:**
- `default` — обычный
- `muted` — приглушённый

**Size:**
- `m` — средний (по умолчанию)
- `l` — большой

```tsx
import { EmptyState } from "@/shared/ui/molecules";
import { Inbox } from "lucide-react";

<EmptyState
  icon={<Inbox size={48} />}
  title="No transactions yet"
  description="Add your first transaction to get started"
  primaryAction={{ label: "Add Transaction", onClick: handleAdd }}
  secondaryAction={{ label: "Learn more", onClick: handleLearnMore }}
  tone="default"
  size="l"
/>
```

**Props:**
```ts
interface EmptyStateProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  tone?: 'default' | 'muted';
  size?: 'm' | 'l';
  className?: string;
}
```

---

#### Skeleton

**Путь:** `@/shared/ui/molecules/Skeleton`

Skeleton loader для индикации загрузки (если существует).

---

#### LoadMoreBar

**Путь:** `@/shared/ui/molecules/LoadMoreBar`

Кнопка/индикатор загрузки дополнительных данных (если существует).

---

### Controls

#### SegmentedControl

**Путь:** `@/shared/ui/molecules/SegmentedControl`

Переключатель между несколькими опциями (iOS-style segmented control).

**Размеры:**
- `s` — маленький
- `m` — средний (по умолчанию)

```tsx
import { SegmentedControl } from "@/shared/ui/molecules";

type ViewMode = 'list' | 'chart' | 'calendar';

const options = [
  { value: 'list', label: 'List' },
  { value: 'chart', label: 'Chart' },
  { value: 'calendar', label: 'Calendar' }
];

<SegmentedControl<ViewMode>
  value={viewMode}
  options={options}
  onChange={setViewMode}
  size="m"
/>
```

**Props:**
```ts
interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  size?: 's' | 'm';
  className?: string;
  disabled?: boolean;
}

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};
```

**Особенности:**
- Анимированный индикатор выбранного элемента
- Локальное состояние для мгновенной визуальной реакции

---

#### OptionControl

**Путь:** `@/shared/ui/molecules/OptionControl`

Контрол с чекбоксом или радио-кнопкой и текстом (если существует).

---

#### SortControl

**Путь:** `@/shared/ui/molecules/SortControl`

Контрол для выбора сортировки (если существует).

---

#### SearchBar

**Путь:** `@/shared/ui/molecules/SearchBar`

Расширенная панель поиска (если существует как отдельная молекула).

---

### Sheets & Dialogs (Extended)

#### FiltersSheet

**Путь:** `@/shared/ui/molecules/FiltersSheet`

Bottom sheet с фильтрами (если существует).

---

#### SortSheet

**Путь:** `@/shared/ui/molecules/SortSheet`

Bottom sheet для выбора сортировки (если существует).

---

#### InlineNotice

**Путь:** `@/shared/ui/molecules/InlineNotice`

Встроенное уведомление/предупреждение (если существует).

---

#### NoticeStack

**Путь:** `@/shared/ui/molecules/NoticeStack`

Стек toast-уведомлений (если существует).

---

## Design Tokens

**Путь:** `@/shared/design/tokens`

### tokens.css

CSS custom properties (CSS variables) для цветов, spacing, typography, shadows, etc.

```css
:root {
  /* Colors */
  --color-accent: #8B5CF6;
  --color-text-primary: #1A1A1A;
  --color-surface-default: #FFFFFF;
  
  /* Spacing */
  --space-xs: 4px;
  --space-s: 8px;
  --space-m: 16px;
  --space-l: 24px;
  
  /* Typography */
  --font-body: 15px;
  --font-caption: 13px;
  
  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0,0,0,0.08);
}
```

### tokens.ts

TypeScript константы для использования в JS/TS коде.

```ts
export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
} as const;

export const COLORS = {
  accent: '#8B5CF6',
  // ...
} as const;
```

---

## Примеры использования

### Пример 1: Форма с полями

```tsx
import { FormFieldBase } from "@/shared/ui/molecules/FormField";
import { InputBase } from "@/shared/ui/atoms";

function TransactionForm() {
  return (
    <form>
      <FormFieldBase
        label="Amount"
        required
        error={errors.amount}
      >
        <InputBase 
          type="number"
          value={amount}
          onChange={handleAmountChange}
          state={errors.amount ? 'error' : 'default'}
        />
      </FormFieldBase>

      <FormFieldBase
        label="Description"
        helperText="Optional note"
      >
        <InputBase 
          value={description}
          onChange={handleDescriptionChange}
        />
      </FormFieldBase>
    </form>
  );
}
```

### Пример 2: Список транзакций

```tsx
import { ListRowBase } from "@/shared/ui/molecules";
import { CategoryIcon, Amount, Text } from "@/shared/ui/atoms";

function TransactionList({ transactions }) {
  return (
    <div>
      {transactions.map(tx => (
        <ListRowBase
          key={tx.id}
          leading={
            <CategoryIcon 
              icon={tx.category.icon} 
              color={tx.category.color}
              size="m"
              importance="primary"
            />
          }
          title={<Text variant="body">{tx.category.name}</Text>}
          subtitle={<Text variant="caption">{tx.description}</Text>}
          trailing={
            <Amount state={tx.type === 'expense' ? 'negative' : 'positive'}>
              {tx.type === 'expense' ? '-' : '+'}{tx.amount}
            </Amount>
          }
          onClick={() => openTransaction(tx.id)}
        />
      ))}
    </div>
  );
}
```

### Пример 3: Modal с подтверждением

```tsx
import { Modal } from "@/shared/ui/molecules";
import { ButtonBase, Text } from "@/shared/ui/atoms";

function DeleteConfirmModal({ open, onConfirm, onCancel }) {
  return (
    <Modal open={open} title="Delete Transaction?" onClose={onCancel}>
      <Text variant="body">
        This action cannot be undone. Are you sure?
      </Text>
      
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <ButtonBase variant="default" onClick={onConfirm}>
          Delete
        </ButtonBase>
        <ButtonBase variant="ghost" onClick={onCancel}>
          Cancel
        </ButtonBase>
      </div>
    </Modal>
  );
}
```

---

## Рекомендации по использованию

### DO ✅

- Используйте atoms для построения feature-specific компонентов
- Комбинируйте molecules для создания сложных UI
- Придерживайтесь design tokens для цветов и spacing
- Используйте семантические HTML элементы через prop `as`
- Добавляйте aria-атрибуты для доступности
- Используйте TypeScript types для props

### DON'T ❌

- Не модифицируйте atoms/molecules напрямую в features
- Не смешивайте inline styles с design tokens
- Не дублируйте логику из shared компонентов
- Не добавляйте бизнес-логику в atoms/molecules
- Не игнорируйте accessibility

---

## Changelog

### v1.0 (5 января 2026)
- ✅ Полная документация atoms
- ✅ Полная документация molecules
- ✅ Примеры использования
- ✅ TypeScript interfaces
- ✅ Design tokens reference

---

## Ссылки

- [UI_ATOMS.md](../docs/UI_ATOMS.md) — исходная документация atoms (концептуальная)
- [Design System v1 — Foundation](../product_info/Design%20System%20v1%20—%20Foundation.md) — дизайн-система
- [Lucide Icons](https://lucide.dev/) — библиотека иконок
