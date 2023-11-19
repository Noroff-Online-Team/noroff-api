import { AlertCircle, AlertTriangle, InfoIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * Returns an emoji based on the variant.
 */
const getEmoji = (variant: string): JSX.Element => {
  switch (variant) {
    case "info":
      return <InfoIcon className="h-4 w-4" />
    case "warning":
      return <AlertTriangle className="h-4 w-4" />
    case "destructive":
      return <AlertCircle className="h-4 w-4" />
    default:
      return <InfoIcon className="h-4 w-4" />
  }
}

/**
 * A small, stylized box that can be used to highlight a piece of information.
 * @param {object} props - The props of the component.
 * @param {React.ReactNode} props.children - The content to be displayed inside the callout.
 * @param {string} props.variant - The variant of the callout. Defaults to "default".
 * @param {boolean} props.noIcon - Whether or not to display an icon in the callout. Defaults to false.
 */
export function Callout({
  children,
  variant = "default",
  noIcon = false
}: {
  children: React.ReactNode
  variant?: "default" | "info" | "warning" | "destructive"
  noIcon?: boolean
}) {
  /**
   * Determine if the children should be wrapped in a <p> tag.
   * If the children is a string or an array (potentially of inline elements or text),
   * a <p> tag is added for proper HTML structure. For JSX or complex React nodes,
   * the children are rendered as-is without additional wrapping.
   */
  const shouldWrapInParagraph = typeof children === "string" || Array.isArray(children)

  return (
    <Alert variant={variant} className="mb-1">
      {!noIcon && getEmoji(variant)}
      <AlertDescription className={noIcon ? "[&_p]:-my-1" : undefined}>
        {shouldWrapInParagraph ? <p>{children}</p> : children}
      </AlertDescription>
    </Alert>
  )
}
