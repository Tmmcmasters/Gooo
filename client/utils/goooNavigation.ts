// src/utils/navigation.ts
import { $fetch } from 'ofetch'
import { shallowRef } from 'vue'

// Global state
window.pageRegistry = window.pageRegistry || new Map()
const loadedScripts = new Set<string>()
const fetchStatus = shallowRef<'pending' | 'success' | 'error' | 'idle'>('idle')
const currentUrl = shallowRef(window.location.pathname)
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

// Reload scripts dynamically
const reloadScripts = (doc: Document) => {
    document.querySelectorAll('script[data-page-script]').forEach((script) => {
        script.remove()
    })

    const scripts = doc.querySelectorAll('script[data-page-script]')
    scripts.forEach((oldScript) => {
        const scriptElement = oldScript as HTMLScriptElement
        if (scriptElement.src) {
            const scriptPath = new URL(scriptElement.src, window.location.origin).pathname
            if (!loadedScripts.has(scriptPath)) {
                const newScript = document.createElement('script')
                newScript.setAttribute('data-page-script', 'true')
                newScript.type = scriptElement.type || 'text/javascript'
                newScript.src = scriptElement.src
                newScript.async = false
                loadedScripts.add(scriptPath)
                document.body.appendChild(newScript)
            }
        } else {
            const newScript = document.createElement('script')
            newScript.setAttribute('data-page-script', 'true')
            newScript.type = scriptElement.type || 'text/javascript'
            newScript.textContent = scriptElement.textContent
            document.body.appendChild(newScript)
        }
    })
}

// Execute scripts without refetching
const executeScripts = (container: Element) => {
    const scripts = container.querySelectorAll('script[data-page-script]')
    scripts.forEach((currentScript) => {
        const oldScript = currentScript as HTMLScriptElement
        if (oldScript.src) {
            const oldScriptSrc = new URL(oldScript.src, window.location.origin).pathname

            if (loadedScripts.has(oldScriptSrc) && window.pageRegistry?.has(oldScriptSrc)) {
                const pageConfig = window.pageRegistry.get(oldScriptSrc)
                if (pageConfig?.hydrate) {
                    pageConfig.hydrate()
                }
                oldScript.remove()
            } else {
                const newScript = document.createElement('script')
                newScript.setAttribute('data-page-script', 'true')
                newScript.type = oldScript.type || 'text/javascript'
                newScript.src = oldScript.src // Reuse cached script
                newScript.async = false
                loadedScripts.add(oldScriptSrc)
                oldScript.parentNode?.replaceChild(newScript, oldScript)
            }
        } else {
            const newScript = document.createElement('script')
            newScript.setAttribute('data-page-script', 'true')
            newScript.type = oldScript.type || 'text/javascript'
            newScript.textContent = oldScript.textContent
            oldScript.parentNode?.replaceChild(newScript, oldScript)
        }
    })
}

// Navigate to a new URL
export const navigate = async (href: string) => {
    try {
        const htmlResponse = await getDocument(href)
        const parser = new DOMParser()
        const doc = parser.parseFromString(htmlResponse, 'text/html')

        const responseLayout = doc.querySelector('[gooo-layout]')
        if (!responseLayout) {
            console.error(
                `No gooo-layout attribute found in response. Document: ${doc.documentElement.outerHTML}`
            )
            fetchStatus.value = 'error'
            window.location.href = href
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
        fetchStatus.value = 'success'
    } catch (error) {
        console.error('Navigation error:', error)
        fetchStatus.value = 'error'
        window.location.href = href
    }
}

// Handle popstate events
const handlePopState = async () => {
    const newUrl = window.location.pathname
    if (newUrl !== currentUrl.value) {
        fetchStatus.value = 'pending'
        try {
            const htmlResponse = await getDocument(newUrl)

            const parser = new DOMParser()
            const doc = parser.parseFromString(htmlResponse, 'text/html')

            const responseLayout = doc.querySelector('[gooo-layout]')

            if (!responseLayout) {
                console.error(
                    `No gooo-layout attribute found for ${newUrl}. Document HTML:`,
                    doc.documentElement.outerHTML
                )
                fetchStatus.value = 'error'
                window.location.href = newUrl
                return
            }

            const existingPage = document.querySelector('[gooo-layout]')
            if (existingPage) {
                existingPage.replaceWith(responseLayout)
                executeScripts(responseLayout)
            } else {
                console.error('No existing [gooo-layout] found in current document')
                fetchStatus.value = 'error'
                window.location.href = newUrl
                return
            }

            const newTitle = doc.querySelector('title')?.textContent || document.title
            window.history.replaceState({ url: newUrl }, newTitle, newUrl)
            currentUrl.value = newUrl
            fetchStatus.value = 'success'
        } catch (error) {
            console.error('Error handling popstate:', error)
            fetchStatus.value = 'error'
            window.location.href = newUrl
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
            const scriptPath = new URL(scriptElement.src, window.location.origin).pathname
            loadedScripts.add(scriptPath)
        }
    })

    window.addEventListener('popstate', handlePopState)

    window.addEventListener('unload', () => {
        window.removeEventListener('popstate', handlePopState)
    })
}

// Run initialization
initialize()

// Export for GoooLink
export { fetchStatus }