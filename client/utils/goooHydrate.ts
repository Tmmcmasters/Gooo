import type { App } from "vue"

export type PageHydrationConfig = {
    mountPoint: string
    hydrate: () => void
    unMount: App<Element>['unmount']
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

// This will also be able to hydrate multiple instances of the same component via id prefixing

/**
 * Necessary to hydrate the component and set js file registration. This provides a way to dynamically load the component whenever navigating between routes and be able to prefetch when wanted.
 * @param {string} genFilePath - The path of the generated file that will be used for hydration.
 * @param {string} mountPoint - The selector for the element which the vue app will be mounted to.
 * @param {function} hydrate - The function that will be called to hydrate the component.
 */
export default (viteInputName: string, mountPoint: string, hydrate: (element: Element) => App<Element>) => {
    function innerHydrate() {
        const isSingleMountPoint = mountPoint[0] === "#";
        if (isSingleMountPoint) {
            const returnElement = document.getElementById(mountPoint.slice(1))
            if (!returnElement) {
                throw new Error(`No element found with id ${mountPoint} on ${viteInputName}. You may have misspelled or id doesn't exist server side.`);
            }
            return hydrate(returnElement)
        } else {
            const returnElements = document.querySelectorAll(`[id^="${mountPoint}"]`);
            if (returnElements.length === 0) {
                throw new Error(`No elements found with prefix ${mountPoint} on ${viteInputName}.`);
            }
            return Array.from(returnElements).map(el => hydrate(el))
        }
    }



    const appOrApps = innerHydrate()

    //Register in global registry
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
    });
}
