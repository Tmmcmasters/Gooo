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
export default (viteInputName: string, mountPoint: string, hydrate: () => void) => {
    function innerHydrate() {

        hydrate()
    }

    console.log("GOOO HYDRATE WITH INPUT NAME", viteInputName)

    const element = document.querySelector(`[data-page-script='true'][data-vite-input="${viteInputName}"]`)
    console.log(element);

    console.log(`Here is the window.fileRegistry in the hydrate function: `);
    console.log(window.fileRegistry);





    //Register in global registry
    window.fileRegistry.set(viteInputName, {
        mountPoint,
        hydrate: innerHydrate
    });

    // Execute initial hydration
    innerHydrate()
}
