import { dynamicIconImports, IconName } from "lucide-react/dynamic";
import { lazy } from "react";



const lazyIconCache = new Map<IconName, React.LazyExoticComponent<React.ComponentType<{ className?: string; size?: string | number }>>>();
export function getLazyLucideIcon(name: IconName) {
    const cached = lazyIconCache.get(name);
    if (cached) return cached;

    const importer = dynamicIconImports[name];
    if (!importer) {
        const Fallback = () => null;
        return Fallback;
    }

    const LazyIcon = lazy(importer);
    lazyIconCache.set(name, LazyIcon);
    return LazyIcon;
}