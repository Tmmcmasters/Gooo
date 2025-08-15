import { $fetch } from 'ofetch';
import { shallowRef } from 'vue';

// Global state
window.fileRegistry ??= new Map();
const loadedScripts = new Set<string>();
const fetchStatus = shallowRef<'pending' | 'success' | 'error' | 'idle'>('idle');
const currentUrl = shallowRef(window.location.pathname);
let isInitialized = false;

const getDocument = (url: string) =>
    $fetch<string>(url, {
        method: 'GET',
        headers: { Accept: 'text/html' },
        onRequest: () => { fetchStatus.value = 'pending'; },
        onResponse: ({ response }) => { fetchStatus.value = response.ok ? 'success' : 'error'; },
        onResponseError: () => { fetchStatus.value = 'error'; },
    });

const createScript = (el: HTMLScriptElement): HTMLScriptElement => {
    const scriptElement = document.createElement('script');
    scriptElement.setAttribute('data-page-script', 'true');
    scriptElement.setAttribute('data-vite-input', el.getAttribute('data-vite-input') || ''); // Copy data-vite-input
    scriptElement.type = el.type || 'text/javascript';
    scriptElement.async = false;
    if (el.src) {
        scriptElement.src = el.src;
    } else {
        scriptElement.textContent = el.textContent;
    }
    return scriptElement;
};

const reloadScripts = (doc: Document) => {
    document.querySelectorAll('script[data-page-script]').forEach((s) => s.remove());
    doc.querySelectorAll('script[data-page-script]').forEach((el) => {
        const script = el as HTMLScriptElement;
        const path = script.src && new URL(script.src, location.origin).pathname;
        if (!script.src || !loadedScripts.has(path)) {
            if (path) loadedScripts.add(path);
            document.body.appendChild(createScript(script));
        }
    });
};

const executeScripts = async (container: Element) => {
    container.querySelectorAll('script[data-page-script]').forEach((el) => {
        const script = el as HTMLScriptElement;
        const viteInput = script.getAttribute('data-vite-input');
        const path = script.src && new URL(script.src, location.origin).pathname;
        const registered = window.fileRegistry.get(path);

        if (script.src && loadedScripts.has(path) && registered?.hydrate) {
            registered.hydrate();
            script.remove();
        } else {
            if (path) loadedScripts.add(path);
            script.parentNode?.replaceChild(createScript(script), script);
        }
    });
};

const parseHtml = (html: string) => new DOMParser().parseFromString(html, 'text/html');

const swapLayout = (doc: Document, push = true, href = '') => {
    const newLayout = doc.querySelector('[gooo-layout]');
    if (!newLayout) {
        console.error('Missing [gooo-layout]');
        console.error(doc.documentElement.outerHTML);
        fetchStatus.value = 'error';
        location.href = href;
        return false;
    }
    const current = document.querySelector('[gooo-layout]');
    current?.replaceWith(newLayout);
    if (push) history.pushState({ url: href }, doc.title ?? document.title, href);
    currentUrl.value = href;
    return newLayout;
};

const prefetched = new Map<string, string>();

export const prefetch = async (href: string) => {
    if (prefetched.has(href)) return;
    try {
        const html = await getDocument(href);
        prefetched.set(href, html);
    } catch (err) {
        console.warn(`Prefetch failed for ${href}`, err);
    }
};

export const navigate = async (href: string) => {
    try {
        const prefetchedDoc = prefetched.get(href);
        const isPrefetched = prefetchedDoc !== undefined;

        const htmlString = isPrefetched ? prefetchedDoc : await getDocument(href);
        const doc = parseHtml(htmlString);

        if (!swapLayout(doc, true, href)) return;
        executeScripts(document.documentElement);
        reloadScripts(doc);
        fetchStatus.value = 'success';
    } catch (err) {
        console.error('Navigation error:', err);
        fetchStatus.value = 'error';
        location.href = href;
    }
};

const handlePopState = async () => {
    const url = location.pathname;
    if (url === currentUrl.value) return;

    fetchStatus.value = 'pending';
    try {
        const html = await getDocument(url);
        const doc = parseHtml(html);

        const layout = swapLayout(doc, false, url);
        if (!layout) return;
        executeScripts(layout);
        history.replaceState({ url }, doc.title ?? document.title, url);
        fetchStatus.value = 'success';
    } catch (err) {
        console.error('Popstate error:', err);
        fetchStatus.value = 'error';
        location.href = url;
    }
};

const initialize = () => {
    if (isInitialized) return;
    isInitialized = true;

    document.querySelectorAll('script[data-page-script]').forEach((s) => {
        const script = s as HTMLScriptElement;
        const path = script.src && new URL(script.src, location.origin).pathname;
        if (path) loadedScripts.add(path);
    });

    addEventListener('popstate', handlePopState);
    addEventListener('unload', () => removeEventListener('popstate', handlePopState));
};

initialize();
export { fetchStatus };