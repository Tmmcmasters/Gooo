import { useColorMode, watchImmediate } from "@vueuse/core";
import { useCookies } from "@vueuse/integrations/useCookies.mjs";
import { ref } from "vue";

export default () => {
    const color = useColorMode({})
    const cookies = useCookies()

    const isDark = ref<boolean>(color.value === 'dark')

    const changeColor = () => {
        color.value = color.value === 'dark' ? 'light' : 'dark'
        isDark.value = color.value === 'dark'
    }

    watchImmediate(color, (newValue, oldValue) => {
        cookies.set('color-scheme', newValue, {
            maxAge: 60 * 60 * 24 * 365
        })
        isDark.value = newValue === 'dark'
    })

    watchImmediate(isDark, (newValue, oldValue) => {
        cookies.set('color-scheme', newValue ? 'dark' : 'light')
        color.value = newValue ? 'dark' : 'light'
    })

    return {
        changeColor,
        isDark,
        color
    }
}