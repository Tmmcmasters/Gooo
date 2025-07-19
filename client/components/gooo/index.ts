import type { AnchorHTMLAttributes } from "vue"

export interface GoooLinkProps extends /* @vue-ignore */ Omit<AnchorHTMLAttributes, "href" | "target"> {
  href: string
  /**
   * Forces the link to be considered as external (true) or internal (false). This is helpful to handle edge-cases
   */
  external?: boolean

  /**
   * Where to display the linked URL, as the name for a browsing context.
   */
  target?: '_blank' | '_parent' | '_self' | '_top' | (string & {}) | null

  /**
   * Will prefetch the linked URL if set to true. 
   */
  prefetch?: boolean

  /**
   * Allows controlling when to prefetch links. By default, prefetch is triggered only on visibility.
   */
  prefetchOn?: 'visibility' | 'interaction' | Partial<{
    visibility: boolean
    interaction: boolean
  }>

  /**
   * Escape hatch to disable `prefetch` attribute.
   */
  noPrefetch?: boolean

  /**
   * An option to either add or remove trailing slashes in the `href` for this specific link.
   * Overrides the global `trailingSlash` option if provided.
   */
  trailingSlash?: 'append' | 'remove'
}