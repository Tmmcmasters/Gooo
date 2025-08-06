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
        fileRegistry: Map<string, PageHydrationConfig>
    }
}

window.fileRegistry = window.fileRegistry || new Map()

/**
 * Necessary to hydrate the component and set js file registration. This provides a way to dynamically load the component whenever navigating between routes and be able to prefetch when wanted.
 * @param {string} genFilePath - The path of the generated file that will be used for hydration.
 * @param {string} mountPoint - The selector for the element which the vue app will be mounted to.
 * @param {function} hydrate - The function that will be called to hydrate the component.
 */
export default (genFilePath: string, mountPoint: string, hydrate: () => void) => {
    function innerHydrate() {

        hydrate()
    }

    // Register in global registry
    window.fileRegistry.set(genFilePath, {
        mountPoint,
        hydrate: innerHydrate
    });

    // Execute initial hydration
    innerHydrate()
}
