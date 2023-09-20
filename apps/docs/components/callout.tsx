import { InfoIcon, AlertCircle, AlertTriangle } from "lucide-react"
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
 */
export function Callout({
  children,
  variant = "info"
}: {
  children: React.ReactNode
  variant?: "default" | "info" | "warning" | "destructive"
}) {
  /**
   * Determine if the children should be wrapped in a <p> tag.
   * If the children is a string or an array (potentially of inline elements or text),
   * a <p> tag is added for proper HTML structure. For JSX or complex React nodes,
   * the children are rendered as-is without additional wrapping.
   */
  const shouldWrapInParagraph = typeof children === "string" || Array.isArray(children)

  return (
    <Alert variant={variant}>
      {getEmoji(variant)}
      <AlertDescription>{shouldWrapInParagraph ? <p>{children}</p> : children}</AlertDescription>
    </Alert>
  )
}
