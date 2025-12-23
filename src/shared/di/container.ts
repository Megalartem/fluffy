/**
 * Simple Dependency Injection Container
 * 
 * Используется для создания и управления сервисами и репозиториями.
 * Поддерживает singleton и transient жизненные циклы.
 */

export interface DIContainer {
  /**
   * Регистрирует сервис или репозиторий в контейнере
   * @param key - уникальный ключ для сервиса
   * @param factory - функция для создания экземпляра
   * @param options - опции (singleton по умолчанию true)
   */
  register<T>(
    key: string,
    factory: () => T | Promise<T>,
    options?: { singleton?: boolean }
  ): void;

  /**
   * Получает или создает экземпляр сервиса
   * @param key - ключ сервиса
   * @returns экземпляр сервиса
   * @throws Error если сервис не зарегистрирован
   */
  get<T>(key: string): T;

  /**
   * Проверяет, зарегистрирован ли сервис
   */
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
    if (this.factories.has(key)) {
      console.warn(`[DI] Service "${key}" already registered, overwriting...`);
    }

    this.factories.set(key, {
      factory,
      singleton: options.singleton ?? true,
    });
  }

  get<T>(key: string): T {
    if (!this.has(key)) {
      throw new Error(
        `[DI] Service "${key}" not registered. Available services: ${Array.from(this.factories.keys()).join(", ")}`
      );
    }

    const config = this.factories.get(key)!;

    // Singleton: кешируем экземпляр
    if (config.singleton) {
      if (!this.singletons.has(key)) {
        const instance = config.factory();
        if (instance instanceof Promise) {
          throw new Error(
            `[DI] Async factory for singleton "${key}" not supported. Use transient mode.`
          );
        }
        this.singletons.set(key, instance);
      }
      return this.singletons.get(key) as T;
    }

    // Transient: создаем новый экземпляр каждый раз
    const instance = config.factory();
    if (instance instanceof Promise) {
      throw new Error(`[DI] Async factory not supported. Please use synchronous factories.`);
    }
    return instance as T;
  }

  has(key: string): boolean {
    return this.factories.has(key);
  }

  /**
   * Очищает все сингтоны (для тестирования)
   */
  clear(): void {
    this.singletons.clear();
  }

  /**
   * Возвращает список всех зарегистрированных сервисов
   */
  getRegisteredKeys(): string[] {
    return Array.from(this.factories.keys());
  }
}

// Глобальный экземпляр контейнера
export const container = new SimpleDIContainer();

/**
 * Инициализирует DI контейнер со всеми сервисами и репозиториями
 * Вызывается один раз при старте приложения
 */
export function setupDIContainer(): void {
  // Примечание: импорты будут добавлены после создания интерфейсов в фазе 1.4
  // На данный момент контейнер пуст, это будет заполнено позже

  console.log("[DI] Container initialized");
}
