import { $fetch } from "ofetch"
import { shallowRef } from "vue"

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

window.pageRegistry = window.pageRegistry || new Map()
const loadedScripts = new Set<string>();
const fetchStatus = shallowRef<'pending' | 'success' | 'error' | 'idle'>('idle');
const currentUrl = shallowRef(window.location.pathname);
let isInitialized = false

// Fetch document from server
const getDocument = (url: string) => {
    return $fetch<string>(url, {
        method: 'GET',
        headers: {
            Accept: 'text/html',
        },
        onRequest: () => {
            fetchStatus.value = 'pending'
        },
        onResponse: ({ response }) => {
            fetchStatus.value = response.ok ? 'success' : 'error'
        },
        onResponseError: () => {
            fetchStatus.value = 'error'
        },
    })
}

// Function to reload scripts dynamically (for initial load)
const reloadScripts = (doc: Document) => {
    document.querySelectorAll('script[data-page-script]').forEach((script) => {
        script.remove()
        console.log('Removed existing page-specific script:', script.outerHTML)
    })

    const scripts = doc.querySelectorAll('script[data-page-script]')
    scripts.forEach((oldScript) => {
        const scriptElement = oldScript as HTMLScriptElement
        console.log('Processing ScriptElement: ', scriptElement.src)
        const scriptElSrc = new URL(scriptElement.src).pathname
        if (scriptElSrc) {
            if (!loadedScripts.has(scriptElSrc)) {
                const newScript = document.createElement('script')
                newScript.setAttribute('data-page-script', 'true')
                newScript.type = scriptElement.type || 'text/javascript'
                newScript.src = scriptElSrc
                newScript.async = false

                console.log(`Adding scriptElSrc ${scriptElSrc} to loadedScripts`)
                loadedScripts.add(scriptElSrc)
                console.log('Here is the loadScripts set')
                console.log(loadedScripts)

                document.body.appendChild(newScript)
            }
        } else {
            const newScript = document.createElement('script')
            newScript.setAttribute('data-page-script', 'true')
            newScript.type = scriptElement.type || 'text/javascript'
            newScript.textContent = oldScript.textContent
            console.log('Executing inline script:', newScript.textContent)
            document.body.appendChild(newScript)
        }
    })
}

// Function to execute scripts without refetching
function executeScripts(container: Element) {
    const scripts = container.querySelectorAll('script[data-page-script]')
    scripts.forEach((currentScript) => {
        const oldScript = currentScript as HTMLScriptElement
        console.log('Processing script:', oldScript.outerHTML)

        const oldScriptSrc = new URL(oldScript.src).pathname
        if (oldScriptSrc) {
            console.log(`Here is the oldScriptSrc`)
            console.log(oldScriptSrc)

            // console.log('Adding for testing')

            // loadedScripts.add(oldScriptSrc)
            console.log('Here is the loadScripts set')
            console.log(loadedScripts)
            console.log('Here is the window.pageRegistry')
            console.log(window.pageRegistry)

            console.log(
                `If Statement resolution: ${loadedScripts.has(oldScriptSrc)} && ${window.pageRegistry?.has(oldScriptSrc)}`,
            )

            if (loadedScripts.has(oldScriptSrc) && window.pageRegistry?.has(oldScriptSrc)) {
                console.log(`Script ${oldScriptSrc} already loaded, re-executing hydration`)
                const pageConfig = window.pageRegistry.get(oldScriptSrc)
                if (pageConfig?.hydrate) {
                    pageConfig.hydrate()
                }
                oldScript.remove()
            } else if (!loadedScripts.has(oldScriptSrc)) {
                console.log('-Manually loading new script-')
                const newScript = document.createElement('script')
                newScript.setAttribute('data-page-script', 'true')
                newScript.type = oldScript.type || 'text/javascript'
                newScript.src = `${oldScriptSrc}?t=${Date.now()}`
                newScript.async = false

                console.log(`Adding ${oldScriptSrc} to loadedScripts`)
                loadedScripts.add(oldScriptSrc)
                console.log(loadedScripts)

                console.log(`Loading script: ${oldScriptSrc}`)
                oldScript.parentNode?.replaceChild(newScript, oldScript)
            }
        } else {
            const newScript = document.createElement('script')
            newScript.setAttribute('data-page-script', 'true')
            newScript.type = oldScript.type || 'text/javascript'
            newScript.textContent = oldScript.textContent
            console.log('Executing inline script:', newScript.textContent)
            oldScript.parentNode?.replaceChild(newScript, oldScript)
        }
    })
}


const navigate = async (href: string) => {
    console.log(`Fetching ${href}`)

    try {
        const htmlResponse = await getDocument(href)
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlResponse, 'text/html')

        const responseLayout = doc.querySelector('[gooo-layout]')
        if (!responseLayout) {
            console.error(
                `No gooo-layout attribute found in response. Document: ${doc.documentElement.outerHTML}`,
            )
            fetchStatus.value = 'error'
            return
        }

        const existingPage = document.querySelector('[gooo-layout]')
        if (existingPage) {
            existingPage.replaceWith(responseLayout)
        }

        reloadScripts(doc)

        const newTitle = doc.querySelector('title')?.textContent || document.title
        window.history.pushState({ url: href }, newTitle, href)
        currentUrl.value = href
    } catch (error) {
        console.error('Fetch or parsing error:', error)
        fetchStatus.value = 'error'
    }
}

const handlePopState = async () => {
    console.log('---Calling the HandlePopState function----')
    const newUrl = window.location.pathname
    if (newUrl !== currentUrl.value) {
        fetchStatus.value = 'pending'
        try {
            console.log('Here is the new URL when popping: ', newUrl)
            const htmlResponse = await getDocument(newUrl)
            console.log('Here is the string response from the fetch: ', htmlResponse)

            const parser = new DOMParser()
            const doc = parser.parseFromString(htmlResponse, 'text/html')
            console.log('Parsed document HTML: ', doc.documentElement.outerHTML)

            const responseLayout = doc.querySelector('[gooo-layout]')
            console.log(
                'Here is the response layout: ',
                responseLayout?.outerHTML || 'No response layout',
            )

            if (!responseLayout) {
                console.error(
                    `No gooo-layout attribute found for ${newUrl}. Document HTML:`,
                    doc.documentElement.outerHTML,
                )
                fetchStatus.value = 'error'
                return
            }

            const existingPage = document.querySelector('[gooo-layout]')
            if (existingPage) {
                existingPage.replaceWith(responseLayout)
                responseLayout.querySelectorAll('script[data-page-script]').forEach((script) => {
                    console.log('Script in DOM after replace:', script.outerHTML)
                })
                executeScripts(responseLayout)
            } else {
                console.error('No existing [gooo-layout] found in current document')
                fetchStatus.value = 'error'
                return
            }

            const newTitle = doc.querySelector('title')?.textContent || document.title
            window.history.replaceState({ url: newUrl }, newTitle, newUrl)
            currentUrl.value = newUrl
            fetchStatus.value = 'success'
        } catch (error) {
            console.error('Error handling popstate:', error)
            fetchStatus.value = 'error'
        }
    }
}

// Initialize navigation logic
const initialize = () => {
    if (isInitialized) return
    isInitialized = true

    document.querySelectorAll('script[data-page-script]').forEach((script) => {
        const scriptElement = script as HTMLScriptElement
        if (scriptElement.src) {
            const scriptPath = new URL(scriptElement.src).pathname
            loadedScripts.add(scriptPath)
            console.log(`Added initial script to loadedScripts: ${scriptPath}`)
        }
    })

    console.log('Initial scripts on mount:', document.querySelectorAll('script[data-page-script]'))
    console.log('Initial loadedScripts:', loadedScripts)

    // Set up popstate listener
    window.addEventListener('popstate', handlePopState)

    // Clean up on unload
    window.addEventListener('unload', () => {
        window.removeEventListener('popstate', handlePopState)
    })
}

/**
 * Necessary to hydrate the component and set page registration. This provides a way to dynamically load the component whenever navigating between routes and be able to prefetch when wanted.
 * @param {string} genFilePath - The path of the generated file that will be used for hydration.
 * @param {string} mountPoint - The selector for the element which the vue app will be mounted to.
 * @param {function} hydrate - The function that will be called to hydrate the component.
 */
export default (genFilePath: string, mountPoint: string, hydrate: () => void) => {
    initialize()


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

// Export navigate for GoooLink
export { navigate, fetchStatus }
