import type { AnchorHTMLAttributes } from "vue"

export interface GoooLinkProps extends Omit<AnchorHTMLAttributes, "href" | "target"> {
  href: string
  /**
   * Forces the link to be considered as external (true) or internal (false). This is helpful to handle edge-cases
   */
  external?: boolean

  /**
   * Where to display the linked URL, as the name for a browsing context.
   */
  target?: '_blank' | '_parent' | '_self' | '_top' | (string & {}) | null
}