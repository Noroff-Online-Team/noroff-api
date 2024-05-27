import { type LucideIcon, Tally1Icon, Tally2Icon } from "lucide-react"

export type Version = {
  param: string
  name: string
  description: string
  version: string
  icon: LucideIcon
}

export const versions: Version[] = [
  {
    param: "v1",
    name: "Noroff API",
    description: "Documentation",
    version: "v1",
    icon: Tally1Icon
  },
  {
    param: "v2",
    name: "Noroff API",
    description: "Documentation",
    version: "v2",
    icon: Tally2Icon
  }
]
