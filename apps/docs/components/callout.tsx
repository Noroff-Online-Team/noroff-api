import { InfoIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const GetEmoji = (variant: string): JSX.Element => {
  switch (variant) {
    case "info":
      return <InfoIcon className="h-4 w-4" />
    case "destructive":
      return <InfoIcon className="h-4 w-4" />
    default:
      return <InfoIcon className="h-4 w-4" />
  }
}

export function Callout({
  children,
  variant = "info"
}: {
  children: React.ReactNode
  variant?: "default" | "info" | "destructive"
}) {
  return (
    <Alert variant={variant}>
      {GetEmoji(variant)}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}
