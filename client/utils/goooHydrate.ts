export type PageHydrationConfig = {
    mountPoint: string
    hydrate: () => void
}

declare global {
    interface Window {
        /**
         * Global registry for page hydration
         * String is the path of the generated file.
         * @type {Map<string, PageHydrationConfig>}
         * @memberof Window
         */
        pageRegistry: Map<string, PageHydrationConfig>
    }
}

/**
 * Necessary to hydrate the component and set page registration. This provides a way to dynamically load the component whenever navigating between routes and be able to prefetch when wanted.
 */
export default (genFilePath: string, mountPoint: string, hydrate: () => void) => {

    function innerHydrate() {
        console.log('Hydrating', genFilePath, 'for path:', window.location.pathname);

        hydrate()
    }

    // Register in global registry
    window.pageRegistry.set(genFilePath, {
        mountPoint,
        hydrate: innerHydrate
    });

    // Execute initial hydration
    innerHydrate()
}

window.pageRegistry = window.pageRegistry || new Map()

