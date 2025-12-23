# Примеры кода для рефакторинга

Этот файл содержит примеры реализации для ключевых компонентов плана рефакторинга.

---

## 1. DI Контейнер (Фаза 1.1)

### `src/shared/di/container.ts`

```typescript
export interface DIContainer {
  register<T>(key: string, factory: () => T | Promise<T>, options?: { singleton?: boolean }): void;
  get<T>(key: string): T;
  has(key: string): boolean;
}

class SimpleDIContainer implements DIContainer {
  private factories = new Map<string, { factory: () => any; singleton: boolean }>();
  private singletons = new Map<string, any>();

  register<T>(
    key: string,
    factory: () => T | Promise<T>,
    options: { singleton?: boolean } = {}
  ): void {
    this.factories.set(key, {
      factory,
      singleton: options.singleton ?? true,
    });
  }

  get<T>(key: string): T {
    if (!this.has(key)) {
      throw new Error(`Service "${key}" not registered in DI container`);
    }

    const config = this.factories.get(key)!;

    if (config.singleton) {
      if (!this.singletons.has(key)) {
        this.singletons.set(key, config.factory());
      }
      return this.singletons.get(key) as T;
    }

    return config.factory() as T;
  }

  has(key: string): boolean {
    return this.factories.has(key);
  }
}

export const container = new SimpleDIContainer();

// Регистрация всех сервисов
export function setupDIContainer(): void {
  // Repos
  container.register('TransactionsRepo', () => new DexieTransactionsRepo());
  container.register('CategoriesRepo', () => new DexieCategoriesRepo());
  container.register('BudgetsRepo', () => new DexieBudgetsRepo());
  container.register('GoalsRepo', () => new DexieGoalsRepo());
  container.register('SettingsRepo', () => new DexieSettingsRepo());

  // Services
  container.register('TransactionService', () => 
    new TransactionService(
      container.get('TransactionsRepo'),
      container.get('SettingsRepo')
    )
  );
  container.register('BudgetService', () =>
    new BudgetService(
      container.get('BudgetsRepo'),
      container.get('TransactionsRepo'),
      container.get('SettingsRepo')
    )
  );
  // ... остальные сервисы
}
```

---

## 2. WorkspaceContext (Фаза 1.3)

### `src/shared/config/workspace-context.tsx`

```typescript
"use client";

import { createContext, useContext, ReactNode } from "react";

interface WorkspaceContextType {
  workspaceId: string;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  // TODO: В будущем могут быть разные workspaceId
  const workspaceId = "ws_local";

  return (
    <WorkspaceContext.Provider value={{ workspaceId }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}
```

### Использование в компонентах

```typescript
// ❌ Старый способ
const workspaceId = await new WorkspaceService().getCurrentWorkspaceId();

// ✅ Новый способ
const { workspaceId } = useWorkspace();
```

---

## 3. Константный слой (Фаза 1.2)

### `src/shared/constants/meta-keys.ts`

```typescript
/**
 * Типизированные ключи для meta.db
 * Каждый ключ имеет:
 * - name: человеческое имя
 * - description: что хранит
 * - example: пример значения
 */
export const META_KEYS = {
  /** Последние значения по умолчанию при создании транзакции */
  LAST_TRANSACTION_DEFAULTS: "last_transaction_defaults",

  /** Флаг, что категории уже были засеяны для workspace */
  SEED_CATEGORIES: (workspaceId: string) => `seed_categories_${workspaceId}`,

  /** Последний уровень уведомления о бюджете (warn80 или limit100) */
  BUDGET_NOTIFIED: (workspaceId: string, month: string) => `budget_notified_${workspaceId}_${month}`,

  /** Флаг, что пользователь видел уведомление о достижении цели */
  GOAL_NOTIFIED: (workspaceId: string, goalId: string) => `goal_notified_${workspaceId}_${goalId}`,

  /** Версия схемы БД */
  SCHEMA_VERSION: "schemaVersion",
} as const;
```

### `src/shared/constants/defaults.ts`

```typescript
export const DEFAULTS = {
  CURRENCY: "VND",
  LOCALE: "ru-RU",
  TRANSACTION_TYPE: "expense" as const,
  BUDGET_THRESHOLD_WARN: 80, // процент
  BUDGET_THRESHOLD_LIMIT: 100, // процент
  TRANSACTION_LIST_LIMIT: 50,
} as const;
```

---

## 4. Абстрактные интерфейсы для Repos (Фаза 1.4)

### `src/core/repositories/index.ts`

```typescript
import type { Transaction } from "@/features/transactions/model/types";
import type { Category } from "@/features/categories/model/types";

export interface ITransactionsRepository {
  create(workspaceId: string, tx: Transaction): Promise<Transaction>;
  getById(workspaceId: string, id: string): Promise<Transaction | null>;
  list(workspaceId: string, query?: TransactionListQuery): Promise<Transaction[]>;
  listRecent(workspaceId: string, params?: { type?: "expense" | "income"; limit?: number }): Promise<Transaction[]>;
  update(workspaceId: string, id: string, patch: Partial<Transaction>): Promise<Transaction>;
  softDelete(workspaceId: string, id: string): Promise<void>;
}

export interface ICategoriesRepository {
  create(workspaceId: string, cat: Category): Promise<Category>;
  list(workspaceId: string): Promise<Category[]>;
  getById(workspaceId: string, id: string): Promise<Category | null>;
  update(workspaceId: string, id: string, patch: Partial<Category>): Promise<Category>;
  softDelete(workspaceId: string, id: string): Promise<void>;
}

// ... остальные интерфейсы
```

### Использование в Services

```typescript
export class TransactionService {
  constructor(
    private readonly txRepo: ITransactionsRepository,
    private readonly settingsRepo: ISettingsRepository
  ) {}

  async addTransaction(workspaceId: string, input: CreateTransactionInput): Promise<Transaction> {
    // Логика сервиса используёт репо через интерфейс
    // Теперь легко подменить реализацию (например, на InMemory для тестов)
    return this.txRepo.create(workspaceId, tx);
  }
}
```

---

## 5. Валидаторы (Фаза 2.4)

### `src/core/domain/validators/transaction.validator.ts`

```typescript
import { AppError } from "@/shared/errors/app-error";
import type { CreateTransactionInput, UpdateTransactionPatch } from "@/features/transactions/model/types";
import { LIMITS } from "@/shared/constants";

export class TransactionValidator {
  static validateCreate(input: CreateTransactionInput): void {
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new AppError("VALIDATION_ERROR", "Amount must be greater than 0", {
        field: "amount",
      });
    }

    if (input.amount > LIMITS.MAX_TRANSACTION_AMOUNT) {
      throw new AppError("VALIDATION_ERROR", `Amount cannot exceed ${LIMITS.MAX_TRANSACTION_AMOUNT}`, {
        field: "amount",
      });
    }

    if (!["expense", "income"].includes(input.type)) {
      throw new AppError("VALIDATION_ERROR", "Invalid transaction type", {
        field: "type",
      });
    }
  }

  static validateUpdate(input: UpdateTransactionPatch): void {
    if (input.amount !== undefined) {
      if (!Number.isFinite(input.amount) || input.amount <= 0) {
        throw new AppError("VALIDATION_ERROR", "Amount must be greater than 0", {
          field: "amount",
        });
      }
    }

    if (input.type !== undefined && !["expense", "income"].includes(input.type)) {
      throw new AppError("VALIDATION_ERROR", "Invalid transaction type", {
        field: "type",
      });
    }
  }
}
```

---

## 6. Error Boundary (Фаза 2.3)

### `src/shared/ui/error-boundary.tsx`

```typescript
"use client";

import React, { ReactNode } from "react";
import { AppError } from "@/shared/errors/app-error";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught by boundary:", error, errorInfo);
    
    // Логирование в продакшене
    // logger.error('UI Error', { error, errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const error = this.state.error;
      const isAppError = error instanceof AppError;

      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
          <div className="max-w-md bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Что-то пошло не так</h1>
            {isAppError && (
              <p className="text-gray-600 mb-4">
                Код ошибки: {(error as AppError).code}
              </p>
            )}
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 7. App State Management (Фаза 2.2)

### `src/shared/hooks/use-app-state.ts`

```typescript
"use client";

import { useReducer, useCallback, ReactNode, createContext, useContext } from "react";
import type { Transaction } from "@/features/transactions/model/types";
import type { Category } from "@/features/categories/model/types";
import type { Goal } from "@/features/goals/model/types";

interface AppState {
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  loading: boolean;
  error: Error | null;
}

type AppAction =
  | { type: "SET_TRANSACTIONS"; payload: Transaction[] }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "SET_CATEGORIES"; payload: Category[] }
  | { type: "SET_GOALS"; payload: Goal[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: Error | null };

const initialState: AppState = {
  transactions: [],
  categories: [],
  goals: [],
  loading: false,
  error: null,
};

function appStateReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    case "SET_GOALS":
      return { ...state, goals: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  return {
    state,
    dispatch,
    setTransactions: (txs: Transaction[]) =>
      dispatch({ type: "SET_TRANSACTIONS", payload: txs }),
    addTransaction: (tx: Transaction) =>
      dispatch({ type: "ADD_TRANSACTION", payload: tx }),
    setCategories: (cats: Category[]) =>
      dispatch({ type: "SET_CATEGORIES", payload: cats }),
    setGoals: (goals: Goal[]) =>
      dispatch({ type: "SET_GOALS", payload: goals }),
  };
}
```

---

## 8. Логирование (Фаза 3.1)

### `src/infra/logger/logger.ts`

```typescript
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, error?: Error | unknown): void;
}

class ConsoleLogger implements Logger {
  private level: LogLevel = "info";

  constructor(level?: LogLevel) {
    this.level = level || (process.env.LOG_LEVEL as LogLevel) || "info";
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.level];
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog("debug")) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog("info")) {
      console.info(`[INFO] ${message}`, data);
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog("warn")) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  error(message: string, error?: Error | unknown): void {
    if (this.shouldLog("error")) {
      console.error(`[ERROR] ${message}`, error);
    }
  }
}

export const logger = new ConsoleLogger();
```

### Использование

```typescript
// В сервисах
logger.info("Creating transaction", { amount, type });
logger.error("Failed to save transaction", error);

// В компонентах
logger.debug("Rendering dashboard", { workspaceId });
```

---

## 9. Design System Components (Фаза 3.4)

### `src/ui/components/Button.tsx`

```typescript
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "font-semibold rounded-lg transition";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      } ${props.className || ""}`}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
```

### `src/ui/components/Card.tsx`

```typescript
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 md:p-6 ${className}`}>
      {children}
    </div>
  );
}
```

---

## 10. TransactionSheet Refactor (Фаза 3.2)

### Разбиение на компоненты

```typescript
// ❌ Старый способ: 353 строки в одном файле
export function TransactionSheet({ ... }) {
  // Вся логика здесь
}

// ✅ Новый способ: разбить на части
export function TransactionSheet({ ... }) {
  return (
    <Modal open={open} title="Новая транзакция" onClose={onClose}>
      <TransactionForm
        onSubmit={handleSubmit}
        defaultValues={defaults}
        categories={categories}
      />
      <TransactionPresets presets={presets} onSelect={handleSelectPreset} />
      {mode === "edit" && (
        <TransactionDeleteConfirm
          onDelete={handleDelete}
          open={confirmDeleteOpen}
        />
      )}
    </Modal>
  );
}
```

---

Все эти примеры готовы к использованию и могут быть адаптированы под конкретные нужды проекта.
