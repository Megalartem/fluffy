/**
 * Dependency Injection Module
 * 
 * Экспортирует контейнер и функции для работы с DI
 */

export { container, setupDIContainer, type DIContainer } from "./container";
export { DI_KEYS, type ServiceFactory, type ServiceRegistration } from "./types";
