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
        console.log('Removed existing page-specific script:', script.outerHTML)
    })

    const scripts = doc.querySelectorAll('script[data-page-script]')
    scripts.forEach((oldScript) => {
        const scriptElement = oldScript as HTMLScriptElement
        console.log('Processing ScriptElement:', scriptElement.src)
        if (scriptElement.src) {
            const scriptPath = new URL(scriptElement.src, window.location.origin).pathname
            if (!loadedScripts.has(scriptPath)) {
                const newScript = document.createElement('script')
                newScript.setAttribute('data-page-script', 'true')
                newScript.type = scriptElement.type || 'text/javascript'
                newScript.src = scriptElement.src
                newScript.async = false
                console.log(`Adding scriptPath ${scriptPath} to loadedScripts`)
                loadedScripts.add(scriptPath)
                console.log('LoadedScripts after add:', loadedScripts)
                console.log(`Loading script: ${scriptPath}`)
                document.body.appendChild(newScript)
            } else {
                console.log(`Script ${scriptPath} already in loadedScripts, skipping load`)
            }
        } else {
            const newScript = document.createElement('script')
            newScript.setAttribute('data-page-script', 'true')
            newScript.type = scriptElement.type || 'text/javascript'
            newScript.textContent = scriptElement.textContent
            console.log('Executing inline script:', newScript.textContent)
            document.body.appendChild(newScript)
        }
    })
}

// Execute scripts without refetching
const executeScripts = (container: Element) => {
    const scripts = container.querySelectorAll('script[data-page-script]')
    scripts.forEach((currentScript) => {
        const oldScript = currentScript as HTMLScriptElement
        console.log('Processing script:', oldScript.outerHTML)

        if (oldScript.src) {
            const oldScriptSrc = new URL(oldScript.src, window.location.origin).pathname
            console.log('Here is the oldScriptSrc:', oldScriptSrc)
            console.log('Here is the loadedScripts set:', loadedScripts)
            console.log('Here is the window.pageRegistry:', window.pageRegistry)
            console.log(
                `If Statement resolution: ${loadedScripts.has(oldScriptSrc)} && ${window.pageRegistry?.has(oldScriptSrc)}`
            )

            if (loadedScripts.has(oldScriptSrc) && window.pageRegistry?.has(oldScriptSrc)) {
                console.log(`Script ${oldScriptSrc} already loaded, re-executing hydration`)
                const pageConfig = window.pageRegistry.get(oldScriptSrc)
                if (pageConfig?.hydrate) {
                    pageConfig.hydrate()
                }
                oldScript.remove()
            } else {
                console.log('-Manually loading new script-')
                const newScript = document.createElement('script')
                newScript.setAttribute('data-page-script', 'true')
                newScript.type = oldScript.type || 'text/javascript'
                newScript.src = oldScript.src // Reuse cached script
                newScript.async = false
                console.log(`Adding ${oldScriptSrc} to loadedScripts`)
                loadedScripts.add(oldScriptSrc)
                console.log('LoadedScripts after add:', loadedScripts)
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

// Navigate to a new URL
export const navigate = async (href: string) => {
    console.log(`Navigating to ${href}`)
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
                responseLayout?.outerHTML || 'No response layout'
            )

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
                responseLayout.querySelectorAll('script[data-page-script]').forEach((script) => {
                    console.log('Script in DOM after replace:', script.outerHTML)
                })
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
            console.log(`Added initial script to loadedScripts: ${scriptPath}`)
        }
    })
    console.log('Initial scripts on mount:', document.querySelectorAll('script[data-page-script]'))
    console.log('Initial loadedScripts:', loadedScripts)

    window.addEventListener('popstate', handlePopState)

    window.addEventListener('unload', () => {
        window.removeEventListener('popstate', handlePopState)
    })
}

// Run initialization
initialize()

// Export for GoooLink
export { fetchStatus }