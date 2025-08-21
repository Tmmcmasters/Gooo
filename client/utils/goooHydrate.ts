import type { App } from "vue"

export type PageHydrationConfig = {
    mountPoint: string
    hydrate: () => void
    unMount: App<Element>['unmount']
}

declare global {
    interface Window {
        /**
         * Global registry of hydrated Vue apps.
         *
         * Key   → `viteInputName` (the identifier for the entry file, e.g. "ghostLink")
         * Value → Configuration object containing:
         *           - mountPoint: DOM selector/prefix
         *           - hydrate: function to re-hydrate the component
         *           - unMount: function to clean up the Vue app
         */
        fileRegistry: Map<string, PageHydrationConfig>
    }
}

// Ensure the registry exists (safe to run multiple times)
window.fileRegistry = window.fileRegistry || new Map()

/**
 * Registers and hydrates a Vue component for client-side navigation.
 *
 * Supports:
 *   - Single mount point via an element id (e.g. "#app")
 *   - Multiple mount points via id prefixing (e.g. "ghost-link-" matches ghost-link-1, ghost-link-2, etc.)
 *
 * This function will:
 *   1. Find the correct DOM element(s).
 *   2. Hydrate the Vue component(s) into those elements.
 *   3. Register the component + its lifecycle hooks in the global registry
 *      so it can be re-hydrated or unmounted later (e.g. during navigation).
 *
 * @param {string} viteInputName - Unique identifier (usually Vite input file name).
 * @param {string} mountPoint - DOM id or id-prefix where the component should mount.
 *                              Use "#id" for a single mount, or a prefix string for multiple.
 * @param {(element: Element) => App<Element>} hydrate - Function that creates and mounts the Vue app.
 */
export default (viteInputName: string, mountPoint: string, hydrate: (element: Element) => App<Element>) => {
    function innerHydrate() {
        const isSingleMountPoint = mountPoint[0] === "#"

        if (isSingleMountPoint) {
            // Handle single element by ID
            const returnElement = document.getElementById(mountPoint.slice(1))
            if (!returnElement) {
                throw new Error(
                    `No element found with id ${mountPoint} for ${viteInputName}. ` +
                    `Check for typos or missing server-rendered markup.`
                )
            }
            return hydrate(returnElement)
        } else {
            // Handle multiple elements with matching id prefix
            const returnElements = document.querySelectorAll(`[id^="${mountPoint}"]`)
            if (returnElements.length === 0) {
                throw new Error(
                    `No elements found with id prefix "${mountPoint}" for ${viteInputName}.`
                )
            }
            return Array.from(returnElements).map(el => hydrate(el))
        }
    }

    const appOrApps = innerHydrate()

    // Register the app(s) in the global registry so they can be
    // re-hydrated or cleanly unmounted during client-side navigation.
    window.fileRegistry.set(viteInputName, {
        mountPoint,
        hydrate: innerHydrate,
        unMount: () => {
            if (Array.isArray(appOrApps)) {
                appOrApps.forEach(app => app.unmount())
            } else {
                appOrApps.unmount()
            }
        }
    })
}
