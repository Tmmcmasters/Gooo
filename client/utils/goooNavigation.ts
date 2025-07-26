import { $fetch } from 'ofetch'
import { shallowRef } from 'vue'

// Global state
window.pageRegistry ??= new Map()
const loadedScripts = new Set<string>()
const fetchStatus = shallowRef<'pending' | 'success' | 'error' | 'idle'>('idle')
const currentUrl = shallowRef(window.location.pathname)
let isInitialized = false

/**
 * Fetches a document from the given URL and updates the fetchStatus.
 * Used to load new pages.
 *
 * @param {string} url - The URL to fetch the document from.
 * @returns {Promise<string>} - The fetched document body.
 */
const getDocument = (url: string) =>
    $fetch<string>(url, {
        method: 'GET',
        headers: { Accept: 'text/html' },
        onRequest: () => { fetchStatus.value = 'pending'; },
        onResponse: ({ response }) => { fetchStatus.value = response.ok ? 'success' : 'error' },
        onResponseError: () => { fetchStatus.value = 'error' },
    })

/**
 * Creates a new script element based on the provided HTMLScriptElement.
 * The new script is marked with a 'data-page-script' attribute for identification
 * and is set to be synchronous. If the original element has a source, the new
 * script will use it; otherwise, it will copy the text content.
 *
 * @param {HTMLScriptElement} el - The script element to clone and modify.
 * @returns {HTMLScriptElement} - The newly created script element.
 */

const createScript = (el: HTMLScriptElement): HTMLScriptElement => {
    const scriptElement = document.createElement('script')
    scriptElement.setAttribute('data-page-script', 'true')
    scriptElement.type = el.type || 'text/javascript'
    scriptElement.async = false
    if (el.src) {
        scriptElement.src = el.src
    } else {
        scriptElement.textContent = el.textContent
    }
    return scriptElement
}

/**
 * Removes all current scripts in the document with the attribute
 * 'data-page-script' and then re-adds the scripts from the given
 * document, adding them to the set of loaded scripts if they were not
 * already loaded. This is used to update the scripts when a new page
 * is fetched.
 *
 * @param {Document} doc - The document to load the scripts from.
 */
const reloadScripts = (doc: Document) => {
    document.querySelectorAll('script[data-page-script]').forEach((s) => s.remove())
    doc.querySelectorAll('script[data-page-script]').forEach((el) => {
        const script = el as HTMLScriptElement
        const path = script.src && new URL(script.src, location.origin).pathname
        if (!script.src || !loadedScripts.has(path)) {
            if (path) loadedScripts.add(path)
            document.body.appendChild(createScript(script))
        }
    })
}

/**
 * Iterates over all scripts in the given container that have a 'data-page-script'
 * attribute and checks if they have been loaded before. If they have, and are
 * registered with a hydrate function, the hydrate function is executed and the
 * script is removed. If not, or if the script is not registered, the script is
 * re-added to the container.
 *
 * @param {Element} container - The container to execute the scripts in.
 */
const executeScripts = (container: Element) => {
    console.log(`Here is the container`);
    console.log(container);


    container.querySelectorAll('script[data-page-script]').forEach((el) => {
        console.log('Executing script', el);

        const script = el as HTMLScriptElement
        const path = script.src && new URL(script.src, location.origin).pathname
        const registered = window.pageRegistry?.get(path)

        if (script.src && loadedScripts.has(path) && registered?.hydrate) {
            registered.hydrate()
            script.remove()
        } else {
            if (path) loadedScripts.add(path)
            script.parentNode?.replaceChild(createScript(script), script)
        }
    })
}
/**
 * Parses the given HTML string into a Document.
 *
 * @param {string} html - The HTML string to parse.
 * @returns {Document} - The parsed Document.
 */
const parseHtml = (html: string) => new DOMParser().parseFromString(html, 'text/html')

/**
 * Replaces the current gooo layout with a new one from the given document.
 * If the new document does not contain a [gooo-layout] element, the navigation
 * is cancelled and the fetchStatus is set to 'error'. If push is true, the new
 * page is pushed to the browser's history stack.
 * @param {Document} doc - The document containing the new layout.
 * @param {boolean} push - Whether to push the new page to the browser's history stack.
 * @param {string} href - The URL associated with the new page.
 * @returns {Element | false} The new layout element, or false if no layout was found.
 */
const swapLayout = (doc: Document, push = true, href = '') => {
    const newLayout = doc.querySelector('[gooo-layout]')
    if (!newLayout) {
        console.error('Missing [gooo-layout]', doc.documentElement.outerHTML)
        fetchStatus.value = 'error'
        location.href = href
        return false
    }

    const current = document.querySelector('[gooo-layout]')
    current?.replaceWith(newLayout)
    if (push) history.pushState({ url: href }, doc.title ?? document.title, href)
    currentUrl.value = href
    return newLayout
}

const prefetched = new Map<string, Document>();

export const prefetch = async (href: string) => {
    if (prefetched.has(href)) return
    try {
        const html = await getDocument(href)
        const doc = parseHtml(html)
        prefetched.set(href, doc)
    } catch (err) {
        console.warn(`Prefetch failed for ${href}`, err);
    }
}

/**
 * Navigate to a new page.
 *
 * @param {string} href - The URL of the new page.
 *
 * @returns {Promise<void>} - Resolves when the page has been swapped.
 *
 * @throws {Error} - If there is a problem with the navigation.
 */
export const navigate = async (href: string) => {
    try {
        const prefetchedDoc = prefetched.get(href)
        const isPrefetched = prefetchedDoc !== undefined;
        const html = isPrefetched ? '' : await getDocument(href)
        const doc = isPrefetched ? prefetchedDoc : parseHtml(html)
        if (!swapLayout(doc, true, href)) return
        console.log('Navigating to', href);
        // reloadScripts(doc)
        console.log(`Calling execute scripts for ${href}`);

        executeScripts(document.documentElement)
        fetchStatus.value = 'success'
    } catch (err) {
        console.error('Navigation error:', err)
        fetchStatus.value = 'error'
        location.href = href
    }
}



/**
 * Handles a popstate event.
 *
 * When the user navigates back or forth using the browser's back and forward buttons,
 * this function is called to handle the popstate event. It will fetch the document
 * for the new URL and swap it with the current document.
 *
 * @returns {Promise<void>} - Resolves when the page has been swapped.
 *
 * @throws {Error} - If there is a problem with the navigation.
 */
const handlePopState = async () => {
    const url = location.pathname
    if (url === currentUrl.value) return

    fetchStatus.value = 'pending'
    try {
        const html = await getDocument(url)
        const doc = parseHtml(html)
        const layout = swapLayout(doc, false, url)
        if (!layout) return
        executeScripts(layout)
        history.replaceState({ url }, doc.title ?? document.title, url)
        fetchStatus.value = 'success'
    } catch (err) {
        console.error('Popstate error:', err)
        fetchStatus.value = 'error'
        location.href = url
    }
}

/**
 * Initializes the page navigation system.
 *
 * This function sets up event listeners for popstate and unload events to handle
 * browser navigation and cleans up appropriately. It also registers all existing
 * scripts with a 'data-page-script' attribute in the loaded scripts set to ensure
 * they are not reloaded unnecessarily.
 * 
 * Ensures initialization is performed only once.
 */

const initialize = () => {
    if (isInitialized) return
    isInitialized = true

    document.querySelectorAll('script[data-page-script]').forEach((s) => {
        const path = new URL((s as HTMLScriptElement).src, location.origin).pathname
        loadedScripts.add(path)
    })

    addEventListener('popstate', handlePopState)
    addEventListener('unload', () => removeEventListener('popstate', handlePopState))
}

initialize()
export { fetchStatus }
