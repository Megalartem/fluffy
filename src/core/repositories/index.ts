/**
 * Абстрактные интерфейсы для репозиториев
 * 
 * Определяют контракты для работы с данными.
 * Позволяют подменять реальные Dexie репо на In-Memory для тестирования.
 */

import type { Transaction } from "@/features/transactions/model/types";
import type { Category } from "@/features/categories/model/types";
import type { Goal } from "@/features/goals/model/types";
import type { AppSettings } from "@/features/settings/model/types";
import type { TransactionListQuery } from "@/features/transactions/api/repo";

/**
 * Репозиторий для работы с транзакциями
 */
export interface ITransactionsRepository {
  /**
   * Создает новую транзакцию
   */
  create(workspaceId: string, tx: Transaction): Promise<Transaction>;

  /**
   * Получает транзакцию по ID
   */
  getById(workspaceId: string, id: string): Promise<Transaction | null>;

  /**
   * Получает список транзакций с фильтрацией и сортировкой
   */
  list(workspaceId: string, query?: TransactionListQuery): Promise<Transaction[]>;

  /**
   * Получает недавние транзакции
   */
  listRecent(
    workspaceId: string,
    params?: { type?: "expense" | "income"; limit?: number }
  ): Promise<Transaction[]>;

  /**
   * Обновляет транзакцию (частичное обновление)
   */
  update(
    workspaceId: string,
    id: string,
    patch: Partial<Omit<Transaction, "id" | "workspaceId" | "createdAt">>
  ): Promise<Transaction>;

  /**
   * Мягко удаляет транзакцию (устанавливает deletedAt)
   */
  softDelete(workspaceId: string, id: string): Promise<void>;

  /**
   * Подсчитывает количество транзакций для категории
   */
  countByCategory(workspaceId: string, categoryId: string): Promise<number>;

  /**
   * Убирает категорию у всех транзакций (устанавливает categoryId = null)
   */
  unsetCategory(workspaceId: string, categoryId: string): Promise<void>;
}

/**
 * Репозиторий для работы с категориями
 */
export interface ICategoriesRepository {
  /**
   * Создает новую категорию
   */
  create(workspaceId: string, cat: Category): Promise<Category>;

  /**
   * Получает категорию по ID
   */
  getById(workspaceId: string, id: string): Promise<Category | null>;

  /**
   * Получает все категории workspace
   */
  list(workspaceId: string): Promise<Category[]>;

  /**
   * Обновляет категорию
   */
  update(
    workspaceId: string,
    id: string,
    patch: Partial<Omit<Category, "id" | "workspaceId" | "createdAt">>
  ): Promise<Category>;

  /**
   * Мягко удаляет категорию
   */
  softDelete(workspaceId: string, id: string): Promise<void>;
}

/**
 * Репозиторий для работы с финансовыми целями
 */
export interface IGoalsRepository {
  /**
   * Создает новую цель
   */
  create(workspaceId: string, goal: Goal): Promise<Goal>;

  /**
   * Получает цель по ID
   */
  getById(workspaceId: string, id: string): Promise<Goal | null>;

  /**
   * Получает все цели workspace
   */
  list(workspaceId: string): Promise<Goal[]>;

  /**
   * Обновляет цель
   */
  update(
    workspaceId: string,
    id: string,
    patch: Partial<Omit<Goal, "id" | "workspaceId" | "createdAt">>
  ): Promise<Goal>;

  /**
   * Мягко удаляет цель
   */
  softDelete(workspaceId: string, id: string): Promise<void>;
}

/**
 * Репозиторий для работы с настройками приложения
 */
export interface ISettingsRepository {
  /**
   * Получает или создает настройки для workspace
   */
  get(workspaceId: string): Promise<AppSettings>;

  /**
   * Обновляет настройки
   */
  update(workspaceId: string, patch: Partial<AppSettings>): Promise<AppSettings>;
}
