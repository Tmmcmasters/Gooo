export type PageHydrationConfig = {
    mountPoint: string;
    hydrate: () => void;
};

declare global {
    interface Window {
        fileRegistry: Map<string, PageHydrationConfig>;
    }
}

window.fileRegistry = window.fileRegistry || new Map();

/**
 * Hydrates the component and registers it in the global fileRegistry.
 * @param {string} viteInputName - The Vite input name (e.g., "home").
 * @param {string} mountPoint - The selector for the mount element.
 * @param {function} hydrate - The hydration function.
 */
export default (viteInputName: string, mountPoint: string, hydrate: () => void) => {
    function innerHydrate() {
        hydrate();
    }

    // Find the script tag with data-vite-input matching viteInputName
    const script = document.querySelector(`script[data-page-script][data-vite-input="${viteInputName}"]`) as HTMLScriptElement | null;
    let fullPath = viteInputName; // Default to input name if script not found

    if (script && script.src) {
        fullPath = script.src; // Use the resolved src from the server
    } else {
        console.error(`Could not find script with data-vite-input="${viteInputName}"`);
    }

    // Register in global registry using the full path
    window.fileRegistry.set(fullPath, {
        mountPoint,
        hydrate: innerHydrate,
    });

    // Execute initial hydration
    innerHydrate();
};